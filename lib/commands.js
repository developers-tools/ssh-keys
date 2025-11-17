const { getAllKeys, getCurrentKey, generateKey, switchKey, renameKey, getPublicKey } = require('./utils');
const { t } = require('./i18n');
const { maybeShowAd } = require('./ad');

/**
 * 列出所有密钥对
 */
function listKeys() {
  const keys = getAllKeys();
  const currentKey = getCurrentKey();

  if (keys.length === 0) {
    console.log(t('commands.list.noKeys'));
    console.log(t('commands.list.hint'));
    return;
  }

  console.log(t('commands.list.title'));
  keys.forEach(key => {
    const marker = key === currentKey ? '* ' : '  ';
    console.log(`${marker}${key}${key === currentKey ? t('ui.currentSuffix') : ''}`);
  });

  if (currentKey === 'unknown') {
    console.log(t('commands.list.unknown'));
  }

  console.log(t('commands.list.total', { count: keys.length }));

  // 30% 概率显示广告
  maybeShowAd(0.3);
}

/**
 * 生成新密钥对
 */
function genKey(name, options = {}) {
  if (!name) {
    console.error(t('commands.gen.errorNoName'));
    console.log(t('commands.gen.usage'));
    process.exit(1);
  }

  try {
    generateKey(name, options.email);

    // 询问是否立即切换
    if (options.switch !== false) {
      console.log('');
      switchKey(name);
    }
  } catch (err) {
    console.error(t('commands.gen.error', { message: err.message }));
    process.exit(1);
  }
}

/**
 * 切换密钥对
 */
function useKey(name) {
  if (!name) {
    console.error(t('commands.use.errorNoName'));
    console.log(t('commands.use.usage'));
    process.exit(1);
  }

  try {
    switchKey(name);
  } catch (err) {
    console.error(t('commands.gen.error', { message: err.message }));
    process.exit(1);
  }
}

/**
 * 重命名密钥对
 */
function renameKeyCommand(oldName, newName) {
  if (!oldName || !newName) {
    console.error(t('commands.rename.errorNoName'));
    console.log(t('commands.rename.usage'));
    process.exit(1);
  }

  try {
    renameKey(oldName, newName);
  } catch (err) {
    console.error(t('commands.gen.error', { message: err.message }));
    process.exit(1);
  }
}

/**
 * 显示当前公钥
 */
function showPublicKey() {
  try {
    const currentKey = getCurrentKey();
    const publicKey = getPublicKey();

    console.log(t('commands.show.title'));
    if (currentKey && currentKey !== 'unknown') {
      console.log(t('commands.show.currentKey', { name: currentKey }));
    }
    console.log('');
    console.log(publicKey);
    console.log('');
    console.log(t('commands.show.hint'));

    // 50% 概率显示广告（show 命令使用频率较高）
    maybeShowAd(0.5);
  } catch (err) {
    console.error(t('commands.gen.error', { message: err.message }));
    process.exit(1);
  }
}

/**
 * 随机身份模式命令
 */
function randCommand(action) {
  const { setupGitAliases, removeGitAliases, checkRandStatus } = require('./rand');

  if (!action) {
    // 显示当前状态
    const isEnabled = checkRandStatus();
    const status = isEnabled ? t('commands.rand.statusOn') : t('commands.rand.statusOff');
    console.log(t('commands.rand.status', { status }));
    console.log('');
    console.log(t('commands.rand.usage'));
    console.log('  ssh-key rand on     # Enable random identity mode');
    console.log('  ssh-key rand off    # Disable random identity mode');
    return;
  }

  try {
    if (action === 'on') {
      setupGitAliases();
    } else if (action === 'off') {
      removeGitAliases();
    } else {
      console.error('Error: Invalid action. Use "on" or "off"');
      console.error('错误: 无效的操作。请使用 "on" 或 "off"');
      process.exit(1);
    }
  } catch (err) {
    console.error(t('commands.rand.error', { message: err.message }));
    process.exit(1);
  }
}

module.exports = {
  listKeys,
  genKey,
  useKey,
  renameKeyCommand,
  showPublicKey,
  randCommand
};
