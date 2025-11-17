const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { t } = require('./i18n');

const SSH_KEYS_DIR = path.join(os.homedir(), '.ssh-keys');
const SSH_DIR = path.join(os.homedir(), '.ssh');

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

/**
 * 获取所有密钥对
 */
function getAllKeys() {
  ensureDir(SSH_KEYS_DIR);

  const entries = fs.readdirSync(SSH_KEYS_DIR, { withFileTypes: true });
  const keys = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  return keys;
}

/**
 * 获取当前使用的密钥对
 */
function getCurrentKey() {
  const idRsaPath = path.join(SSH_DIR, 'id_rsa');
  const idRsaPubPath = path.join(SSH_DIR, 'id_rsa.pub');

  if (!fs.existsSync(idRsaPath) || !fs.existsSync(idRsaPubPath)) {
    return null;
  }

  // 检查是否是符号链接或者比对内容
  const keys = getAllKeys();
  for (const key of keys) {
    const keyPath = path.join(SSH_KEYS_DIR, key, 'id_rsa');
    const keyPubPath = path.join(SSH_KEYS_DIR, key, 'id_rsa.pub');

    if (fs.existsSync(keyPath) && fs.existsSync(keyPubPath)) {
      try {
        const currentContent = fs.readFileSync(idRsaPath, 'utf8');
        const keyContent = fs.readFileSync(keyPath, 'utf8');

        if (currentContent === keyContent) {
          return key;
        }
      } catch (err) {
        // 继续检查下一个
      }
    }
  }

  return 'unknown';
}

/**
 * 生成新的SSH密钥对
 */
function generateKey(name, email = '') {
  const keyDir = path.join(SSH_KEYS_DIR, name);

  if (fs.existsSync(keyDir)) {
    throw new Error(t('errors.keyExists', { name }));
  }

  ensureDir(keyDir);

  const keyPath = path.join(keyDir, 'id_rsa');
  const comment = email || `${name}@ssh-key`;

  console.log(t('commands.gen.generating', { name }));

  try {
    execSync(`ssh-keygen -t rsa -b 4096 -C "${comment}" -f "${keyPath}" -N ""`, {
      stdio: 'inherit'
    });

    console.log(t('commands.gen.success', { name }));
    return true;
  } catch (err) {
    // 清理失败的目录
    if (fs.existsSync(keyDir)) {
      fs.rmSync(keyDir, { recursive: true, force: true });
    }
    throw new Error(t('commands.gen.error', { message: err.message }));
  }
}

/**
 * 切换到指定的密钥对
 */
function switchKey(name) {
  const keyDir = path.join(SSH_KEYS_DIR, name);

  if (!fs.existsSync(keyDir)) {
    throw new Error(t('errors.keyNotFound', { name }));
  }

  const srcKeyPath = path.join(keyDir, 'id_rsa');
  const srcPubPath = path.join(keyDir, 'id_rsa.pub');

  if (!fs.existsSync(srcKeyPath) || !fs.existsSync(srcPubPath)) {
    throw new Error(t('errors.keyIncomplete', { name }));
  }

  ensureDir(SSH_DIR);

  const destKeyPath = path.join(SSH_DIR, 'id_rsa');
  const destPubPath = path.join(SSH_DIR, 'id_rsa.pub');

  // 备份现有密钥（如果存在且不在管理目录中）
  if (fs.existsSync(destKeyPath)) {
    const currentKey = getCurrentKey();
    if (currentKey === 'unknown') {
      const backupDir = path.join(SSH_KEYS_DIR, 'backup-' + Date.now());
      ensureDir(backupDir);
      fs.copyFileSync(destKeyPath, path.join(backupDir, 'id_rsa'));
      if (fs.existsSync(destPubPath)) {
        fs.copyFileSync(destPubPath, path.join(backupDir, 'id_rsa.pub'));
      }
      console.log(t('errors.backupCreated', { path: backupDir }));
    }
  }

  // 复制密钥文件
  fs.copyFileSync(srcKeyPath, destKeyPath);
  fs.copyFileSync(srcPubPath, destPubPath);

  // 设置正确的权限
  fs.chmodSync(destKeyPath, 0o600);
  fs.chmodSync(destPubPath, 0o644);

  console.log(t('commands.use.success', { name }));
  return true;
}

/**
 * 重命名密钥对
 */
function renameKey(oldName, newName) {
  const oldKeyDir = path.join(SSH_KEYS_DIR, oldName);
  const newKeyDir = path.join(SSH_KEYS_DIR, newName);

  if (!fs.existsSync(oldKeyDir)) {
    throw new Error(t('errors.keyNotFound', { name: oldName }));
  }

  if (fs.existsSync(newKeyDir)) {
    throw new Error(t('errors.keyExists', { name: newName }));
  }

  // 检查是否是当前使用的密钥
  const currentKey = getCurrentKey();
  const isCurrentKey = currentKey === oldName;

  // 重命名目录
  fs.renameSync(oldKeyDir, newKeyDir);

  console.log(t('commands.rename.success', { oldName, newName }));

  // 如果是当前使用的密钥，需要重新切换以更新
  if (isCurrentKey) {
    console.log(t('commands.rename.updating'));
    switchKey(newName);
  }

  return true;
}

/**
 * 获取当前公钥内容
 */
function getPublicKey() {
  const pubKeyPath = path.join(SSH_DIR, 'id_rsa.pub');

  if (!fs.existsSync(pubKeyPath)) {
    throw new Error(t('errors.noPublicKey'));
  }

  return fs.readFileSync(pubKeyPath, 'utf8').trim();
}

module.exports = {
  SSH_KEYS_DIR,
  SSH_DIR,
  getAllKeys,
  getCurrentKey,
  generateKey,
  switchKey,
  renameKey,
  getPublicKey
};
