# Claude Code UI NPM 全局包

## 🚀 一键安装和使用

### 安装方法

```bash
# 方法1: 从tgz文件安装
npm install -g claude-code-ui-v1.5.0.tgz

# 方法2: 如果发布到npm registry
npm install -g claude-code-ui
```

### 使用方法

安装完成后，直接运行：

```bash
# 启动 Claude Code UI
ccui

# 或使用完整命令名
claude-code-ui
```

就这么简单！🎉

## 📋 命令选项

### 基本命令

```bash
ccui                    # 默认启动 (端口3000)
ccui --help             # 显示帮助信息
ccui --version          # 显示版本信息
ccui --config           # 显示配置信息
```

### 自定义选项

```bash
ccui --port 8080        # 指定端口
ccui --workspace ~/projects  # 指定工作目录
ccui --stop             # 停止服务 (显示停止方法)
```

### 完整的命令行选项

| 选项 | 别名 | 说明 | 示例 |
|------|------|------|------|
| `--help` | `-h` | 显示帮助信息 | `ccui --help` |
| `--version` | `-v` | 显示版本信息 | `ccui --version` |
| `--port` | `-p` | 指定端口 | `ccui --port 8080` |
| `--workspace` | `-w` | 指定工作目录 | `ccui -w ~/dev` |
| `--config` | - | 显示配置信息 | `ccui --config` |
| `--stop` | - | 停止服务 | `ccui --stop` |

## 🌍 环境变量

全局安装后，您仍然可以通过环境变量配置行为：

```bash
# 设置默认端口
export PORT=8080

# 设置默认工作目录
export CCUI_WORK_DIR=~/projects

# CC容器环境变量
export CCUI_DEFAULT_SHELL=true
export CCUI_SINGLE_PROJECT=true

# OpenAI API Key (语音转录功能)
export OPENAI_API_KEY=your_api_key_here

# 然后启动
ccui
```

## 📝 安装后体验

### 1. 安装过程

```bash
$ npm install -g claude-code-ui-v1.5.0.tgz

added 1 package in 3s

🎉 Claude Code UI 安装完成！

使用方法:
  ccui              # 启动服务
  ccui --help       # 查看帮助
  ccui --version     # 查看版本

🌐 访问地址: http://localhost:3000
```

### 2. 启动服务

```bash
$ ccui

🚀 启动 Claude Code UI...
ℹ 端口: 3000
ℹ 安装位置: /usr/local/lib/node_modules/claude-code-ui

✅ 正在启动服务器...
🌐 访问地址: http://localhost:3000
💡 按 Ctrl+C 停止服务

Claude Code UI server running on http://0.0.0.0:3000
```

### 3. 指定端口启动

```bash
$ ccui --port 8080

🚀 启动 Claude Code UI...
ℹ 端口: 8080
ℹ 安装位置: /usr/local/lib/node_modules/claude-code-ui

✅ 正在启动服务器...
🌐 访问地址: http://localhost:8080
💡 按 Ctrl+C 停止服务
```

## 🔧 故障排除

### 端口被占用

```bash
$ ccui
❌ 端口 3000 已被占用！
您可以:
  1. 使用不同端口: ccui --port 3001
  2. 停止现有服务: ccui --stop
  3. 手动终止进程: kill -9 $(lsof -ti:3000)
```

### 权限问题

```bash
# 如果安装时权限不足
sudo npm install -g claude-code-ui-v1.5.0.tgz

# 或使用其他包管理器目录
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install -g claude-code-ui-v1.5.0.tgz
```

### 查看安装信息

```bash
$ ccui --config

🔧 Claude Code UI 配置信息
══════════════════════════════════════════════════════════════

安装位置: /usr/local/lib/node_modules/claude-code-ui
Node.js版本: v18.17.0
操作系统: Darwin 22.5.0
架构: arm64

环境变量:
  PORT: 3000 (默认)
  CCUI_WORK_DIR: 未设置
  CCUI_DEFAULT_SHELL: false (默认)
  CCUI_SINGLE_PROJECT: false (默认)
  OPENAI_API_KEY: 未设置
```

## 🎯 优势对比

### 传统方式 ❌
```bash
# 需要多个步骤
1. 下载/复制安装包
2. 解压：tar -xzf package.tgz
3. 进入目录：cd claude-code-ui-v1.5.0
4. 启动：./start.sh
```

### NPM全局包方式 ✅
```bash
# 只需要两个步骤
1. 安装：npm install -g claude-code-ui-v1.5.0.tgz
2. 启动：ccui
```

## 🌟 特性

### ✅ 标准化
- 符合npm全局包标准
- 遵循CLI最佳实践
- 支持标准命令行选项

### ✅ 用户友好
- 彩色输出和图标
- 详细的帮助信息
- 清晰的错误提示

### ✅ 智能化
- 自动端口冲突检测
- 进程管理
- 环境变量支持

### ✅ 跨平台
- Windows, macOS, Linux
- Node.js 18+ 支持
- 统一的命令行体验

## 📦 卸载

```bash
npm uninstall -g claude-code-ui
```

## 🔄 升级

```bash
# 卸载旧版本
npm uninstall -g claude-code-ui

# 安装新版本
npm install -g claude-code-ui-v1.6.0.tgz
```

这就是真正的"一键安装，一键启动"体验！🚀