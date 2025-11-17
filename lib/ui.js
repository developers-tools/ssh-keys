const blessed = require('blessed');
const { getAllKeys, getCurrentKey, switchKey } = require('./utils');
const { t } = require('./i18n');
const { maybeShowAd, getAdForGUI } = require('./ad');

/**
 * 显示交互式密钥选择界面
 */
function showInteractiveUI() {
  const keys = getAllKeys();
  const currentKey = getCurrentKey();

  if (keys.length === 0) {
    console.log(t('ui.noKeys'));
    console.log(t('ui.noKeysHint'));
    process.exit(0);
  }

  // 创建屏幕
  const screen = blessed.screen({
    smartCSR: true,
    title: t('ui.title'),
    fullUnicode: true  // 支持完整 Unicode，包括中文
  });

  // 随机决定是否显示广告（40% 概率）
  const shouldShowAd = Math.random() < 0.4;

  // 创建标题
  const title = blessed.box({
    top: 0,
    left: 'center',
    width: '100%',
    height: 3,
    content: '{center}{bold}' + t('ui.title') + '{/bold}{/center}\n{center}' + t('ui.help') + '{/center}',
    tags: true,
    style: {
      fg: 'white',
      bg: 'blue',
      bold: true
    }
  });

  // 计算列表高度（如果显示广告，需要留出空间）
  const listHeight = shouldShowAd ? '60%' : '80%';
  const statusBarBottom = shouldShowAd ? 6 : 0;

  // 创建列表
  const list = blessed.list({
    top: 3,
    left: 'center',
    width: '80%',
    height: listHeight,
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'cyan'
      },
      selected: {
        bg: 'green',
        fg: 'white',
        bold: true
      },
      item: {
        fg: 'white'
      }
    },
    keys: true,
    vi: true,
    mouse: true,
    tags: true
  });

  // 创建广告区域（如果需要显示）
  let adBox = null;
  if (shouldShowAd) {
    adBox = blessed.box({
      bottom: 1,
      left: 'center',
      width: '80%',
      height: 5,
      border: {
        type: 'line'
      },
      style: {
        border: {
          fg: 'yellow'
        },
        fg: 'white'
      },
      content: '{center}' + t('ad.sponsor') + '{/center}\n{center}Loading...{/center}',
      tags: true,
      scrollable: true
    });

    // 异步加载广告内容
    getAdForGUI((err, content) => {
      if (!err && content && adBox) {
        // 处理多行内容
        const lines = content.split('\n').slice(0, 3); // 最多显示3行
        const displayContent = '{center}' + t('ad.sponsor') + '{/center}\n' +
                              lines.map(line => {
                                // 限制每行长度
                                const maxLen = 60;
                                return line.length > maxLen ? line.substring(0, maxLen) + '...' : line;
                              }).join('\n');
        adBox.setContent(displayContent);
        screen.render();
      }
    });
  }

  // 创建状态栏
  const statusBar = blessed.box({
    bottom: statusBarBottom,
    left: 0,
    width: '100%',
    height: 1,
    content: ' ' + t('ui.statusBar', { count: keys.length }),
    style: {
      fg: 'white',
      bg: 'blue'
    }
  });

  // 填充列表项
  const items = keys.map(key => {
    const isCurrent = key === currentKey;
    const marker = isCurrent ? '{green-fg}' + t('ui.currentMarker') + '{/green-fg}' : '  ';
    const suffix = isCurrent ? ' {green-fg}' + t('ui.currentSuffix') + '{/green-fg}' : '';
    return marker + key + suffix;
  });

  list.setItems(items);

  // 如果有当前密钥，选中它
  if (currentKey && currentKey !== 'unknown') {
    const currentIndex = keys.indexOf(currentKey);
    if (currentIndex !== -1) {
      list.select(currentIndex);
    }
  }

  // 添加到屏幕
  screen.append(title);
  screen.append(list);
  screen.append(statusBar);
  if (adBox) {
    screen.append(adBox);
  }

  // 聚焦到列表
  list.focus();

  // 按 Enter 切换密钥
  list.on('select', (item, index) => {
    const selectedKey = keys[index];

    if (selectedKey === currentKey) {
      // 显示提示信息
      const msg = blessed.message({
        parent: screen,
        top: 'center',
        left: 'center',
        width: '50%',
        height: 'shrink',
        border: {
          type: 'line'
        },
        style: {
          border: {
            fg: 'yellow'
          }
        },
        tags: true
      });

      msg.display('{center}' + t('ui.alreadyUsing', { name: selectedKey }) + '{/center}', 2, () => {
        list.focus();
      });

      screen.render();
      return;
    }

    // 切换密钥
    try {
      screen.destroy();
      console.log(t('ui.switching', { name: selectedKey }));
      switchKey(selectedKey);
      console.log(t('ui.switchSuccess'));
      process.exit(0);
    } catch (err) {
      screen.destroy();
      console.error('错误:', err.message);
      process.exit(1);
    }
  });

  // 按 q 或 ESC 退出
  screen.key(['q', 'C-c', 'escape'], () => {
    screen.destroy();
    // 40% 概率在退出时显示广告
    maybeShowAd(0.4);
    process.exit(0);
  });

  // 渲染屏幕
  screen.render();
}

module.exports = {
  showInteractiveUI
};
