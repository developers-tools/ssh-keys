const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.ssh-keys');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const RAND_SCRIPT_DIR = path.join(CONFIG_DIR, 'scripts');
const RAND_HOOK_SCRIPT = path.join(RAND_SCRIPT_DIR, 'prepare-commit-msg');

/**
 * 生成随机用户名
 */
function generateRandomName() {
  const adjectives = ['Happy', 'Lucky', 'Brave', 'Swift', 'Clever', 'Bright', 'Noble', 'Wise', 'Bold', 'Kind'];
  const nouns = ['Panda', 'Tiger', 'Eagle', 'Dragon', 'Phoenix', 'Wolf', 'Lion', 'Bear', 'Fox', 'Hawk'];
  const numbers = Math.floor(Math.random() * 1000);

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adj}${noun}${numbers}`;
}

/**
 * 生成随机邮箱
 */
function generateRandomEmail() {
  const domains = ['example.com', 'mail.com', 'email.com', 'inbox.com', 'private.com'];
  const name = generateRandomName().toLowerCase();
  const domain = domains[Math.floor(Math.random() * domains.length)];

  return `${name}@${domain}`;
}

/**
 * 读取配置
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (err) {
    // 忽略错误
  }
  return {};
}

/**
 * 保存配置
 */
function saveConfig(config) {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    throw new Error(`Failed to save config: ${err.message}`);
  }
}

/**
 * 获取当前 Git 全局配置
 */
function getGitGlobalConfig() {
  try {
    const userName = execSync('git config --global user.name', { encoding: 'utf8', stdio: 'pipe' }).trim();
    const userEmail = execSync('git config --global user.email', { encoding: 'utf8', stdio: 'pipe' }).trim();
    return { userName, userEmail };
  } catch (err) {
    // 如果配置不存在，返回空值
    return { userName: '', userEmail: '' };
  }
}

/**
 * 备份当前 Git 配置
 */
function backupGitConfig() {
  const config = loadConfig();
  const gitConfig = getGitGlobalConfig();

  config.gitConfigBackup = {
    userName: gitConfig.userName,
    userEmail: gitConfig.userEmail,
    timestamp: new Date().toISOString()
  };

  saveConfig(config);
  return gitConfig;
}

/**
 * 恢复 Git 配置
 */
function restoreGitConfig() {
  const config = loadConfig();

  if (config.gitConfigBackup) {
    const { userName, userEmail } = config.gitConfigBackup;

    try {
      if (userName) {
        execSync(`git config --global user.name "${userName}"`, { stdio: 'pipe' });
      } else {
        // 如果原来没有配置，则删除配置
        try {
          execSync('git config --global --unset user.name', { stdio: 'pipe' });
        } catch (err) {
          // 忽略错误
        }
      }

      if (userEmail) {
        execSync(`git config --global user.email "${userEmail}"`, { stdio: 'pipe' });
      } else {
        // 如果原来没有配置，则删除配置
        try {
          execSync('git config --global --unset user.email', { stdio: 'pipe' });
        } catch (err) {
          // 忽略错误
        }
      }

      // 清除备份
      delete config.gitConfigBackup;
      saveConfig(config);

      return { userName, userEmail };
    } catch (err) {
      throw new Error(`Failed to restore git config: ${err.message}`);
    }
  }

  return null;
}

/**
 * 创建 Git 别名脚本
 */
function createGitAliasScript() {
  const { t } = require('./i18n');

  if (!fs.existsSync(RAND_SCRIPT_DIR)) {
    fs.mkdirSync(RAND_SCRIPT_DIR, { recursive: true, mode: 0o700 });
  }

  // 创建 prepare-commit-msg hook 脚本
  const hookScript = `#!/bin/sh
# SSH-Key Random Identity Hook
# This hook sets random git user name and email for each commit

# Generate random name and email
RANDOM_NAME="$(node -e "
const adjectives = ['Happy', 'Lucky', 'Brave', 'Swift', 'Clever', 'Bright', 'Noble', 'Wise', 'Bold', 'Kind'];
const nouns = ['Panda', 'Tiger', 'Eagle', 'Dragon', 'Phoenix', 'Wolf', 'Lion', 'Bear', 'Fox', 'Hawk'];
const numbers = Math.floor(Math.random() * 1000);
const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
const noun = nouns[Math.floor(Math.random() * nouns.length)];
console.log(adj + noun + numbers);
")"

RANDOM_EMAIL="$(node -e "
const domains = ['example.com', 'mail.com', 'email.com', 'inbox.com', 'private.com'];
const name = process.argv[1].toLowerCase();
const domain = domains[Math.floor(Math.random() * domains.length)];
console.log(name + '@' + domain);
" "$RANDOM_NAME")"

# Set git config for this commit
export GIT_AUTHOR_NAME="$RANDOM_NAME"
export GIT_AUTHOR_EMAIL="$RANDOM_EMAIL"
export GIT_COMMITTER_NAME="$RANDOM_NAME"
export GIT_COMMITTER_EMAIL="$RANDOM_EMAIL"
`;

  fs.writeFileSync(RAND_HOOK_SCRIPT, hookScript, { mode: 0o755 });

  console.log(t('commands.rand.scriptCreated', { path: RAND_SCRIPT_DIR }));
}

/**
 * 检测当前平台是否为 Windows
 */
function isWindows() {
  return os.platform() === 'win32';
}

/**
 * 设置 Git 全局别名
 */
function setupGitAliases() {
  const { t } = require('./i18n');

  try {
    // 备份当前 Git 配置
    const gitConfig = backupGitConfig();
    if (gitConfig.userName || gitConfig.userEmail) {
      console.log(t('commands.rand.backupCreated'));
      if (gitConfig.userName) {
        console.log(`  user.name: ${gitConfig.userName}`);
      }
      if (gitConfig.userEmail) {
        console.log(`  user.email: ${gitConfig.userEmail}`);
      }
      console.log('');
    }

    // 创建脚本
    createGitAliasScript();

    // 根据平台使用不同的别名实现
    let addAlias, commitAlias;

    if (isWindows()) {
      // Windows 平台：使用 Node.js 脚本路径方式
      const scriptPath = path.join(RAND_SCRIPT_DIR, 'git-rand-helper.js');

      // 创建 Node.js 辅助脚本
      const helperScript = `const { execSync } = require('child_process');
const adjectives = ['Happy', 'Lucky', 'Brave', 'Swift', 'Clever', 'Bright', 'Noble', 'Wise', 'Bold', 'Kind'];
const nouns = ['Panda', 'Tiger', 'Eagle', 'Dragon', 'Phoenix', 'Wolf', 'Lion', 'Bear', 'Fox', 'Hawk'];
const numbers = Math.floor(Math.random() * 1000);
const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
const noun = nouns[Math.floor(Math.random() * nouns.length)];
const name = adj + noun + numbers;
const domains = ['example.com', 'mail.com', 'email.com', 'inbox.com', 'private.com'];
const email = name.toLowerCase() + '@' + domains[Math.floor(Math.random() * domains.length)];
const args = process.argv.slice(2);
const gitCmd = args[0];
const gitArgs = args.slice(1);
const cmd = 'git ' + gitCmd + ' ' + gitArgs.map(a => a.includes(' ') ? '"' + a + '"' : a).join(' ');
try {
  execSync(cmd, {
    stdio: 'inherit',
    env: { ...process.env, GIT_AUTHOR_NAME: name, GIT_AUTHOR_EMAIL: email, GIT_COMMITTER_NAME: name, GIT_COMMITTER_EMAIL: email }
  });
} catch (err) {
  process.exit(err.status || 1);
}`;

      fs.writeFileSync(scriptPath, helperScript, 'utf8');

      // Windows 使用 Node.js 执行脚本，使用正斜杠路径（Git 在 Windows 上也支持）
      const scriptPathForGit = scriptPath.replace(/\\/g, '/');
      addAlias = `!node "${scriptPathForGit}" add`;
      commitAlias = `!node "${scriptPathForGit}" commit`;
    } else {
      // Unix/Linux/Mac 平台：使用 shell 脚本
      addAlias = `!sh -c 'NAME=$(node -pe "const a=['Happy','Lucky','Brave','Swift','Clever'];const n=['Panda','Tiger','Eagle','Dragon','Phoenix'];a[Math.floor(Math.random()*a.length)]+n[Math.floor(Math.random()*n.length)]+Math.floor(Math.random()*1000)") && EMAIL="$NAME@$(node -pe "['example.com','mail.com','email.com'][Math.floor(Math.random()*3)]")" && git -c user.name="$NAME" -c user.email="$EMAIL" add "$@"' -`;
      commitAlias = `!sh -c 'NAME=$(node -pe "const a=['Happy','Lucky','Brave','Swift','Clever'];const n=['Panda','Tiger','Eagle','Dragon','Phoenix'];a[Math.floor(Math.random()*a.length)]+n[Math.floor(Math.random()*n.length)]+Math.floor(Math.random()*1000)") && EMAIL="$NAME@$(node -pe "['example.com','mail.com','email.com'][Math.floor(Math.random()*3)]")" && git -c user.name="$NAME" -c user.email="$EMAIL" commit "$@"' -`;
    }

    execSync(`git config --global alias.radd "${addAlias}"`, { stdio: 'pipe' });
    execSync(`git config --global alias.rcommit "${commitAlias}"`, { stdio: 'pipe' });

    console.log('');
    console.log(t('commands.rand.enabled'));
    console.log('');
    console.log(t('commands.rand.usage'));
    console.log('  git radd .              # ' + t('commands.rand.addExample'));
    console.log('  git rcommit -m "msg"    # ' + t('commands.rand.commitExample'));
    console.log('');
    console.log(t('commands.rand.note'));

    // 保存状态到配置
    const config = loadConfig();
    config.randMode = true;
    saveConfig(config);

  } catch (err) {
    throw new Error(t('commands.rand.error', { message: err.message }));
  }
}

/**
 * 移除 Git 别名
 */
function removeGitAliases() {
  const { t } = require('./i18n');

  try {
    // 移除 git 别名
    execSync('git config --global --unset alias.radd', { stdio: 'pipe' });
    execSync('git config --global --unset alias.rcommit', { stdio: 'pipe' });

    console.log(t('commands.rand.disabled'));

    // 恢复 Git 配置
    const restored = restoreGitConfig();
    if (restored) {
      console.log('');
      console.log(t('commands.rand.configRestored'));
      if (restored.userName) {
        console.log(`  user.name: ${restored.userName}`);
      }
      if (restored.userEmail) {
        console.log(`  user.email: ${restored.userEmail}`);
      }
    }

    // 更新配置
    const config = loadConfig();
    config.randMode = false;
    saveConfig(config);

  } catch (err) {
    // 忽略错误（别名可能不存在）
    console.log(t('commands.rand.disabled'));

    // 尝试恢复配置
    try {
      const restored = restoreGitConfig();
      if (restored) {
        console.log('');
        console.log(t('commands.rand.configRestored'));
        if (restored.userName) {
          console.log(`  user.name: ${restored.userName}`);
        }
        if (restored.userEmail) {
          console.log(`  user.email: ${restored.userEmail}`);
        }
      }
    } catch (restoreErr) {
      // 忽略恢复错误
    }
  }
}

/**
 * 检查随机模式状态
 */
function checkRandStatus() {
  const config = loadConfig();
  return config.randMode === true;
}

module.exports = {
  setupGitAliases,
  removeGitAliases,
  checkRandStatus,
  generateRandomName,
  generateRandomEmail
};
