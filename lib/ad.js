const https = require('https');

// 广告 URL
const AD_URL = 'https://raw.githubusercontent.com/biancheng-net/ad/refs/heads/main/ssh-key';

// 缓存配置
const CACHE_FILE = require('path').join(require('os').homedir(), '.ssh-keys', '.ad-cache');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

/**
 * 获取广告内容
 */
function fetchAd(callback) {
  https.get(AD_URL, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 && data.trim()) {
        callback(null, data.trim());
      } else {
        callback(new Error('Failed to fetch ad'));
      }
    });
  }).on('error', (err) => {
    callback(err);
  });
}

/**
 * 读取缓存的广告
 */
function getCachedAd() {
  try {
    const fs = require('fs');
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      const now = Date.now();

      // 检查缓存是否过期
      if (cache.timestamp && (now - cache.timestamp) < CACHE_DURATION) {
        return cache.content;
      }
    }
  } catch (err) {
    // 忽略错误
  }
  return null;
}

/**
 * 保存广告到缓存
 */
function saveAdCache(content) {
  try {
    const fs = require('fs');
    const cache = {
      content: content,
      timestamp: Date.now()
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache), 'utf8');
  } catch (err) {
    // 忽略错误
  }
}

/**
 * 显示广告（异步，不阻塞主流程）
 */
function showAd(position = 'bottom') {
  // 先尝试从缓存读取
  const cachedAd = getCachedAd();

  if (cachedAd) {
    displayAd(cachedAd, position);

    // 后台更新缓存
    fetchAd((err, content) => {
      if (!err && content) {
        saveAdCache(content);
      }
    });
  } else {
    // 没有缓存，异步获取
    fetchAd((err, content) => {
      if (!err && content) {
        displayAd(content, position);
        saveAdCache(content);
      }
    });
  }
}

/**
 * 去除 emoji 字符
 */
function removeEmoji(text) {
  // 移除 emoji 和其他特殊 Unicode 字符
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
}

/**
 * 自动换行处理
 */
function wrapText(text, maxWidth = 60) {
  const lines = [];
  const paragraphs = text.split('\n');

  paragraphs.forEach(paragraph => {
    if (paragraph.length <= maxWidth) {
      lines.push(paragraph);
    } else {
      const words = paragraph.split(' ');
      let currentLine = '';

      words.forEach(word => {
        if ((currentLine + word).length <= maxWidth) {
          currentLine += (currentLine ? ' ' : '') + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) lines.push(currentLine);
    }
  });

  return lines;
}

/**
 * 显示广告内容
 */
function displayAd(content, position) {
  const { t } = require('./i18n');

  // 去除 emoji 并处理换行
  const cleanContent = removeEmoji(content);
  const lines = wrapText(cleanContent, 60);

  if (position === 'bottom') {
    console.log('');
    console.log('─'.repeat(60));
    console.log(t('ad.sponsor'));
    console.log('');
    lines.forEach(line => console.log(line));
    console.log('');
    console.log('─'.repeat(60));
  } else if (position === 'inline') {
    console.log('');
    lines.forEach(line => console.log(`> ${line}`));
  }
}

/**
 * 在命令执行后显示广告（随机概率）
 */
function maybeShowAd(probability = 0.3) {
  // 随机显示，避免每次都显示
  if (Math.random() < probability) {
    showAd('bottom');
  }
}

/**
 * 获取广告内容用于 GUI 显示
 */
function getAdForGUI(callback) {
  const cachedAd = getCachedAd();

  if (cachedAd) {
    const cleanContent = removeEmoji(cachedAd);
    callback(null, cleanContent);

    // 后台更新缓存
    fetchAd((err, content) => {
      if (!err && content) {
        saveAdCache(content);
      }
    });
  } else {
    fetchAd((err, content) => {
      if (!err && content) {
        const cleanContent = removeEmoji(content);
        saveAdCache(content);
        callback(null, cleanContent);
      } else {
        callback(err);
      }
    });
  }
}

module.exports = {
  showAd,
  maybeShowAd,
  getAdForGUI,
  removeEmoji,
  wrapText
};
