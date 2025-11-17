#!/usr/bin/env node

const { program } = require('commander');
const { listKeys, genKey, useKey, renameKeyCommand, showPublicKey, randCommand } = require('../lib/commands');
const { showInteractiveUI } = require('../lib/ui');
const { setLanguage, getCurrentLanguage } = require('../lib/i18n');

// 支持全局语言选项
program
  .name('ssh-keys')
  .description('SSH Key Manager / SSH密钥管理工具')
  .version('1.0.0')
  .option('-l, --lang <language>', 'Set language (en-US, zh-CN)', (lang) => {
    setLanguage(lang);
  });

// list 命令
program
  .command('list')
  .alias('ls')
  .description('List all SSH key pairs / 列出所有可用的SSH密钥对')
  .action(() => {
    listKeys();
  });

// gen 命令
program
  .command('gen <name>')
  .description('Generate new SSH key pair / 生成新的SSH密钥对并自动切换')
  .option('-e, --email <email>', 'Specify email comment / 指定密钥的email注释')
  .option('--no-switch', 'Do not switch after generation / 生成后不自动切换')
  .action((name, options) => {
    genKey(name, options);
  });

// use 命令
program
  .command('use <name>')
  .description('Switch to specified SSH key pair / 切换到指定的SSH密钥对')
  .action((name) => {
    useKey(name);
  });

// rename 命令
program
  .command('rename <old-name> <new-name>')
  .description('Rename SSH key pair / 重命名SSH密钥对')
  .action((oldName, newName) => {
    renameKeyCommand(oldName, newName);
  });

// show 命令 - 显示当前公钥
program
  .command('show')
  .description('Show current public key / 显示当前公钥')
  .action(() => {
    showPublicKey();
  });

// rand 命令 - 随机身份模式
program
  .command('rand [action]')
  .description('Random identity mode for git commits (on/off) / Git提交随机身份模式')
  .action((action) => {
    randCommand(action);
  });

// gui 命令 - 显示交互式界面
program
  .command('gui')
  .description('Show interactive GUI / 显示交互式图形界面')
  .action(() => {
    showInteractiveUI();
  });

// lang 命令 - 显示或设置语言
program
  .command('lang [language]')
  .description('Show or set language (en-US, zh-CN) / 显示或设置语言')
  .action((language) => {
    if (language) {
      setLanguage(language);
      console.log(`Language set to: ${language}`);
      console.log(`语言已设置为: ${language}`);
    } else {
      console.log(`Current language: ${getCurrentLanguage()}`);
      console.log(`当前语言: ${getCurrentLanguage()}`);
      console.log('\nAvailable languages / 可用语言:');
      console.log('  - en-US (English)');
      console.log('  - zh-CN (简体中文)');
    }
  });

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
