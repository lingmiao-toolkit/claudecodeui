#!/usr/bin/env node

// 安装完成后的欢迎消息

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

console.log(`
${colors.green}🎉 Claude Code UI 安装完成！${colors.reset}

${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                     快速开始                                   ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.white}启动服务:${colors.reset}
  ${colors.yellow}ccui${colors.reset}                    # 默认启动 (端口 3000)
  ${colors.yellow}ccui --port 8080${colors.reset}        # 指定端口启动

${colors.white}其他命令:${colors.reset}
  ${colors.yellow}ccui --help${colors.reset}             # 查看完整帮助
  ${colors.yellow}ccui --version${colors.reset}          # 查看版本信息
  ${colors.yellow}ccui --config${colors.reset}           # 查看配置信息

${colors.white}访问地址:${colors.reset}
  ${colors.cyan}🌐 http://localhost:3000${colors.reset}

${colors.white}环境变量配置 (可选):${colors.reset}
  ${colors.blue}export PORT=8080${colors.reset}                    # 自定义端口
  ${colors.blue}export CCUI_WORK_DIR=~/projects${colors.reset}     # 默认工作目录
  ${colors.blue}export CCUI_DEFAULT_SHELL=true${colors.reset}      # 启动时切换到Shell
  ${colors.blue}export CCUI_SINGLE_PROJECT=true${colors.reset}     # 禁用新建项目

${colors.green}准备好了吗？运行 ${colors.yellow}ccui${colors.green} 开始使用！${colors.reset}
`);