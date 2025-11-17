const os = require('os');
const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_DIR = path.join(os.homedir(), '.ssh-keys');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// 语言配置
const translations = {
  'zh-CN': {
    // UI 界面
    ui: {
      title: 'SSH 密钥管理工具',
      help: '使用 ↑↓ 选择，Enter 切换，q 退出',
      statusBar: '总共 {count} 个密钥对',
      currentMarker: '● ',
      currentSuffix: ' (当前使用)',
      noKeys: '没有找到任何密钥对',
      noKeysHint: '使用 "ssh-key gen <name>" 来生成新的密钥对',
      alreadyUsing: '已经在使用密钥: {name}',
      switching: '正在切换到密钥: {name}',
      switchSuccess: '\n切换成功！'
    },
    // 命令
    commands: {
      list: {
        title: '可用的SSH密钥对:\n',
        noKeys: '没有找到任何密钥对',
        hint: '使用 "ssh-key gen <name>" 来生成新的密钥对',
        total: '\n总共 {count} 个密钥对',
        unknown: '\n* unknown (当前使用的密钥不在管理列表中)'
      },
      gen: {
        errorNoName: '错误: 请提供密钥对名称',
        usage: '用法: ssh-key gen <name>',
        generating: '正在生成密钥对: {name}...',
        success: '密钥对 "{name}" 生成成功！',
        error: '生成密钥对失败: {message}'
      },
      use: {
        errorNoName: '错误: 请提供密钥对名称',
        usage: '用法: ssh-key use <name>',
        success: '已切换到密钥对: {name}'
      },
      rename: {
        errorNoName: '错误: 请提供旧名称和新名称',
        usage: '用法: ssh-key rename <old-name> <new-name>',
        success: '密钥对 "{oldName}" 已重命名为 "{newName}"',
        updating: '正在更新当前使用的密钥...'
      },
      show: {
        title: '当前SSH公钥:',
        currentKey: '密钥名称: {name}',
        hint: '提示: 复制上面的公钥内容添加到 GitHub/GitLab 等平台'
      },
      rand: {
        enabled: '✓ 随机身份模式已启用',
        disabled: '✓ 随机身份模式已禁用',
        usage: '使用方法:',
        addExample: '使用随机身份添加文件',
        commitExample: '使用随机身份提交',
        note: '注意: 每次提交都会使用不同的随机用户名和邮箱',
        scriptCreated: '脚本已创建: {path}',
        error: '操作失败: {message}',
        status: '随机身份模式状态: {status}',
        statusOn: '已启用',
        statusOff: '已禁用',
        backupCreated: '✓ 已备份当前 Git 配置',
        configRestored: '✓ 已恢复 Git 配置'
      }
    },
    // 错误信息
    errors: {
      keyExists: '密钥对 "{name}" 已存在',
      keyNotFound: '密钥对 "{name}" 不存在',
      keyIncomplete: '密钥对 "{name}" 文件不完整',
      backupCreated: '已备份原有密钥到: {path}',
      noPublicKey: '未找到公钥文件，请先生成或切换到一个密钥对'
    },
    // 广告
    ad: {
      sponsor: '💖 赞助商信息（支持作者）',
      tip: '提示'
    }
  },
  'en-US': {
    // UI interface
    ui: {
      title: 'SSH Key Manager',
      help: 'Use ↑↓ to select, Enter to switch, q to quit',
      statusBar: 'Total {count} key pair(s)',
      currentMarker: '● ',
      currentSuffix: ' (current)',
      noKeys: 'No SSH key pairs found',
      noKeysHint: 'Use "ssh-key gen <name>" to generate a new key pair',
      alreadyUsing: 'Already using key: {name}',
      switching: 'Switching to key: {name}',
      switchSuccess: '\nSwitch successful!'
    },
    // Commands
    commands: {
      list: {
        title: 'Available SSH key pairs:\n',
        noKeys: 'No SSH key pairs found',
        hint: 'Use "ssh-key gen <name>" to generate a new key pair',
        total: '\nTotal {count} key pair(s)',
        unknown: '\n* unknown (current key is not in the managed list)'
      },
      gen: {
        errorNoName: 'Error: Please provide a key pair name',
        usage: 'Usage: ssh-key gen <name>',
        generating: 'Generating key pair: {name}...',
        success: 'Key pair "{name}" generated successfully!',
        error: 'Failed to generate key pair: {message}'
      },
      use: {
        errorNoName: 'Error: Please provide a key pair name',
        usage: 'Usage: ssh-key use <name>',
        success: 'Switched to key pair: {name}'
      },
      rename: {
        errorNoName: 'Error: Please provide old name and new name',
        usage: 'Usage: ssh-key rename <old-name> <new-name>',
        success: 'Key pair "{oldName}" renamed to "{newName}"',
        updating: 'Updating current key...'
      },
      show: {
        title: 'Current SSH Public Key:',
        currentKey: 'Key name: {name}',
        hint: 'Tip: Copy the public key above and add it to GitHub/GitLab or other platforms'
      },
      rand: {
        enabled: '✓ Random identity mode enabled',
        disabled: '✓ Random identity mode disabled',
        usage: 'Usage:',
        addExample: 'Add files with random identity',
        commitExample: 'Commit with random identity',
        note: 'Note: Each commit will use a different random username and email',
        scriptCreated: 'Script created: {path}',
        error: 'Operation failed: {message}',
        status: 'Random identity mode status: {status}',
        statusOn: 'Enabled',
        statusOff: 'Disabled',
        backupCreated: '✓ Current Git config backed up',
        configRestored: '✓ Git config restored'
      }
    },
    // Error messages
    errors: {
      keyExists: 'Key pair "{name}" already exists',
      keyNotFound: 'Key pair "{name}" not found',
      keyIncomplete: 'Key pair "{name}" files are incomplete',
      backupCreated: 'Backed up existing key to: {path}',
      noPublicKey: 'Public key file not found, please generate or switch to a key pair first'
    },
    // Advertisement
    ad: {
      sponsor: '💖 Sponsor Info (Support the Author)',
      tip: 'Tip'
    }
  }
};

// 当前语言
let currentLang = 'en-US';

/**
 * 检测系统语言
 */
function detectLanguage() {
  const locale = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || '';

  if (locale.includes('zh') || locale.includes('CN')) {
    return 'zh-CN';
  }

  // Windows 系统检测
  if (process.platform === 'win32') {
    try {
      const { execSync } = require('child_process');
      const result = execSync('chcp', { encoding: 'utf8' });
      // 936 是简体中文代码页
      if (result.includes('936')) {
        return 'zh-CN';
      }
    } catch (err) {
      // 忽略错误
    }
  }

  return 'en-US';
}

/**
 * 读取配置文件
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return config;
    }
  } catch (err) {
    // 忽略错误，返回默认配置
  }
  return {};
}

/**
 * 保存配置文件
 */
function saveConfig(config) {
  try {
    // 确保目录存在
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (err) {
    // 忽略错误
  }
}

/**
 * 设置语言
 */
function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    // 保存到配置文件
    const config = loadConfig();
    config.language = lang;
    saveConfig(config);
  }
}

/**
 * 获取翻译文本
 */
function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations[currentLang];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // 替换参数
  return value.replace(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== undefined ? params[param] : match;
  });
}

/**
 * 获取当前语言
 */
function getCurrentLanguage() {
  return currentLang;
}

/**
 * 初始化语言设置
 */
function initLanguage() {
  // 首先尝试从配置文件读取
  const config = loadConfig();
  if (config.language && translations[config.language]) {
    return config.language;
  }

  // 如果没有配置，则自动检测系统语言
  return detectLanguage();
}

// 初始化语言
currentLang = initLanguage();

module.exports = {
  t,
  setLanguage,
  getCurrentLanguage,
  detectLanguage
};
