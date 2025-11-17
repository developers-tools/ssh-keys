# SSH Key Manager

English | [简体中文](README.zh-CN.md)

A simple and easy-to-use SSH key management CLI tool that helps you easily manage and switch between multiple SSH key pairs.

## Features

- 🖥️ Interactive GUI - Run `ssh-keys gui` to display a visual selection interface
- 🌍 Multi-language Support - Automatically detects system language, supports Chinese and English
- 📋 List all managed SSH key pairs
- 🔑 Quickly generate new SSH key pairs
- 🔄 Switch between different SSH keys with one command
- ✏️ Rename existing key pairs
- 💾 Automatically backup unmanaged keys
- 🎯 Clearly display the currently active key

## Installation

```bash
npm install -g ssh-keys
```

## Usage

### Interactive GUI (Recommended)

Run the GUI command to display an interactive interface:

```bash
ssh-keys gui
```

This will display an interactive interface listing all key pairs:
- Use `↑` `↓` arrow keys to select a key
- Press `Enter` to switch to the selected key
- Press `q` or `ESC` to exit
- The currently active key is marked with a green ●

### List All Key Pairs

```bash
ssh-keys list
# Or use the alias
ssh-keys ls
```

Example output:
```
Available SSH key pairs:

* work (current)
  personal
  github

Total 3 key pair(s)
```

### Generate New Key Pair

```bash
ssh-keys gen <name>
```

Examples:
```bash
# Generate a key pair named work
ssh-keys gen work

# Generate a key pair with a specific email
ssh-keys gen personal --email your@email.com

# Generate a key pair without auto-switching
ssh-keys gen github --no-switch
```

### Switch Key Pair

```bash
ssh-keys use <name>
```

Example:
```bash
# Switch to the personal key pair
ssh-keys use personal
```

### Rename Key Pair

```bash
ssh-keys rename <old-name> <new-name>
```

Example:
```bash
# Rename work to company
ssh-keys rename work company
```

If you rename the currently active key pair, the tool will automatically update the keys in the `~/.ssh/` directory.

### Show Public Key

Display the current public key for easy copying:

```bash
ssh-keys show
```

This will display your current SSH public key, which you can copy and add to GitHub, GitLab, or other platforms.

### Random Identity Mode

Enable random identity mode to hide your real user information in git commits:

```bash
# Check current status
ssh-keys rand

# Enable random identity mode
ssh-keys rand on

# Disable random identity mode
ssh-keys rand off
```

When enabled, you can use these git aliases:
```bash
git radd .              # Add files with random identity
git rcommit -m "msg"    # Commit with random identity
```

Each commit will use a different random username and email, protecting your privacy.

### Multi-language Support

The tool automatically detects your system language and supports both Chinese and English. You can also manually switch languages:

```bash
# Show current language
ssh-keys lang

# Switch to English
ssh-keys lang en-US

# Switch to Chinese
ssh-keys lang zh-CN

# Or use the global option
ssh-keys --lang zh-CN list
```

Supported languages:
- `en-US` - English
- `zh-CN` - Simplified Chinese (简体中文)

## How It Works

- All key pairs are stored in the `~/.ssh-keys/` directory, with each key pair in its own subdirectory
- When switching keys, the selected key pair is copied to the `~/.ssh/` directory
- If an unmanaged key is detected in `~/.ssh/`, it will be automatically backed up

## Directory Structure

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

## Important Notes

- Keys are generated using RSA 4096-bit encryption by default
- Switching keys will overwrite `~/.ssh/id_rsa` and `~/.ssh/id_rsa.pub`
- It's recommended to ensure your current key is saved before switching

## License

MIT
