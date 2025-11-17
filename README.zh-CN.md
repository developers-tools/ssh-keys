# SSH Key Manager

[English](README.md) | 简体中文

一个简单易用的SSH密钥管理命令行工具，帮助你轻松管理和切换多个SSH密钥对。

## 功能特性

- 🖥️ 交互式界面 - 运行 `ssh-key gui` 显示可视化选择界面
- 🌍 多语言支持 - 自动检测系统语言，支持中文和英文
- 📋 列出所有管理的SSH密钥对
- 🔑 快速生成新的SSH密钥对
- 🔄 一键切换不同的SSH密钥
- ✏️ 重命名已有的密钥对
- 💾 自动备份未管理的密钥
- 🎯 清晰显示当前使用的密钥

## 安装

```bash
npm install -g ssh-key
```

## 使用方法

### 交互式界面（推荐）

运行 GUI 命令显示交互式界面：

```bash
ssh-key gui
```

会显示一个交互式界面，列出所有密钥对：
- 使用 `↑` `↓` 方向键选择密钥
- 按 `Enter` 切换到选中的密钥
- 按 `q` 或 `ESC` 退出
- 当前使用的密钥会用绿色 ● 标记

### 列出所有密钥对

```bash
ssh-key list
# 或使用别名
ssh-key ls
```

输出示例：
```
可用的SSH密钥对:

* work (当前使用)
  personal
  github

总共 3 个密钥对
```

### 生成新的密钥对

```bash
ssh-key gen <name>
```

示例：
```bash
# 生成名为 work 的密钥对
ssh-key gen work

# 生成密钥对并指定email
ssh-key gen personal --email your@email.com

# 生成密钥对但不自动切换
ssh-key gen github --no-switch
```

### 切换密钥对

```bash
ssh-key use <name>
```

示例：
```bash
# 切换到 personal 密钥对
ssh-key use personal
```

### 重命名密钥对

```bash
ssh-key rename <old-name> <new-name>
```

示例：
```bash
# 将 work 重命名为 company
ssh-key rename work company
```

如果重命名的是当前正在使用的密钥对，工具会自动更新 `~/.ssh/` 目录中的密钥。

### 显示公钥

显示当前公钥，方便复制：

```bash
ssh-key show
```

这将显示你当前的 SSH 公钥，你可以复制它并添加到 GitHub、GitLab 或其他平台。

### 随机身份模式

启用随机身份模式，在 git 提交时隐藏你的真实用户信息：

```bash
# 查看当前状态
ssh-key rand

# 启用随机身份模式
ssh-key rand on

# 禁用随机身份模式
ssh-key rand off
```

启用后，你可以使用以下 git 别名：
```bash
git radd .              # 使用随机身份添加文件
git rcommit -m "msg"    # 使用随机身份提交
```

每次提交都会使用不同的随机用户名和邮箱，保护你的隐私。

### 多语言支持

工具会自动检测系统语言，支持中文和英文。你也可以手动切换语言：

```bash
# 查看当前语言
ssh-key lang

# 切换到英文
ssh-key lang en-US

# 切换到中文
ssh-key lang zh-CN

# 或使用全局选项
ssh-key --lang zh-CN list
```

支持的语言：
- `en-US` - English (英文)
- `zh-CN` - 简体中文

## 工作原理

- 所有密钥对存储在 `~/.ssh-keys/` 目录下，每个密钥对一个子目录
- 切换密钥时，会将选中的密钥对复制到 `~/.ssh/` 目录
- 如果检测到 `~/.ssh/` 中有未管理的密钥，会自动备份

## 目录结构

```
~/.ssh-keys/
├── work/
│   ├── id_rsa
│   └── id_rsa.pub
├── personal/
│   ├── id_rsa
│   └── id_rsa.pub
└── github/
    ├── id_rsa
    └── id_rsa.pub
```

## 注意事项

- 生成密钥时默认使用 RSA 4096 位加密
- 切换密钥会覆盖 `~/.ssh/id_rsa` 和 `~/.ssh/id_rsa.pub`
- 建议在切换前确认当前密钥已保存

## License

MIT
