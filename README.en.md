# SSH Key Manager

English | [简体中文](README.md)

A simple and easy-to-use SSH key management CLI tool that helps you easily manage and switch between multiple SSH key pairs.

## Features

- 🖥️ Interactive GUI - Run `ssh-key gui` to display a visual selection interface
- 🌍 Multi-language Support - Automatically detects system language, supports Chinese and English
- 📋 List all managed SSH key pairs
- 🔑 Quickly generate new SSH key pairs
- 🔄 Switch between different SSH keys with one command
- ✏️ Rename existing key pairs
- 💾 Automatically backup unmanaged keys
- 🎯 Clearly display the currently active key

## Installation

```bash
npm install -g ssh-key
```

Or for local development:

```bash
npm install
npm link
```

## Usage

### Interactive GUI (Recommended)

Run the GUI command to display an interactive interface:

```bash
ssh-key gui
```

This will display an interactive interface listing all key pairs:
- Use `↑` `↓` arrow keys to select a key
- Press `Enter` to switch to the selected key
- Press `q` or `ESC` to exit
- The currently active key is marked with a green ●

### List All Key Pairs

```bash
ssh-key list
# Or use the alias
ssh-key ls
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
ssh-key gen <name>
```

Examples:
```bash
# Generate a key pair named work
ssh-key gen work

# Generate a key pair with a specific email
ssh-key gen personal --email your@email.com

# Generate a key pair without auto-switching
ssh-key gen github --no-switch
```

### Switch Key Pair

```bash
ssh-key use <name>
```

Example:
```bash
# Switch to the personal key pair
ssh-key use personal
```

### Rename Key Pair

```bash
ssh-key rename <old-name> <new-name>
```

Example:
```bash
# Rename work to company
ssh-key rename work company
```

If you rename the currently active key pair, the tool will automatically update the keys in the `~/.ssh/` directory.

### Multi-language Support

The tool automatically detects your system language and supports both Chinese and English. You can also manually switch languages:

```bash
# Show current language
ssh-key lang

# Switch to English
ssh-key lang en-US

# Switch to Chinese
ssh-key lang zh-CN

# Or use the global option
ssh-key --lang zh-CN list
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
