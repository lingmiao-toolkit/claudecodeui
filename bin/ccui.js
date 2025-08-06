#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import os from 'os';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageRoot = dirname(__dirname);

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

// 日志函数
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`)
};

// 显示帮助信息
function showHelp() {
  console.log(`
${colors.cyan}╔══════════════════════════════════════════════════════════════╗
║                    Claude Code UI                              ║
╚══════════════════════════════════════════════════════════════╝${colors.reset}

${colors.white}使用方法:${colors.reset}
  ccui [选项]                    启动 Claude Code UI
  ccui --help, -h              显示此帮助信息
  ccui --version, -v           显示版本信息
  ccui --port <端口>           指定端口 (默认: 3000)
  ccui --workspace <路径>      指定工作目录
  ccui --config                显示配置信息
  ccui --stop                  停止运行中的服务

${colors.white}环境变量:${colors.reset}
  PORT                         服务端口 (默认: 3000)
  CCUI_WORK_DIR               默认工作目录
  CCUI_DEFAULT_SHELL          启动时默认切换到Shell (true/false)
  CCUI_SINGLE_PROJECT         禁用新建项目功能 (true/false)
  OPENAI_API_KEY              OpenAI API Key (语音转录功能)

${colors.white}示例:${colors.reset}
  ccui                         # 默认启动 (端口3000)
  ccui --port 8080             # 指定端口启动
  ccui --workspace ~/projects  # 指定工作目录
  
${colors.white}访问地址:${colors.reset}
  http://localhost:3000        (或指定的端口)

${colors.white}更多信息:${colors.reset}
  GitHub: https://github.com/claude-ai/claude-code-ui
  文档: 查看安装目录中的 README.md
`);
}

// 显示版本信息
async function showVersion() {
  try {
    const packageJsonPath = join(packageRoot, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    console.log(`Claude Code UI v${packageJson.version}`);
  } catch (error) {
    console.log('Claude Code UI v1.5.0');
  }
}

// 显示配置信息
function showConfig() {
  console.log(`
${colors.cyan}🔧 Claude Code UI 配置信息${colors.reset}
══════════════════════════════════════════════════════════════

${colors.white}安装位置:${colors.reset} ${packageRoot}
${colors.white}Node.js版本:${colors.reset} ${process.version}
${colors.white}操作系统:${colors.reset} ${os.type()} ${os.release()}
${colors.white}架构:${colors.reset} ${os.arch()}

${colors.white}环境变量:${colors.reset}
  PORT: ${process.env.PORT || '3000 (默认)'}
  CCUI_WORK_DIR: ${process.env.CCUI_WORK_DIR || '未设置'}
  CCUI_DEFAULT_SHELL: ${process.env.CCUI_DEFAULT_SHELL || 'false (默认)'}
  CCUI_SINGLE_PROJECT: ${process.env.CCUI_SINGLE_PROJECT || 'false (默认)'}
  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '已设置' : '未设置'}
`);
}

// 检查是否有其他实例在运行
async function checkRunningInstance(port) {
  return new Promise(async (resolve) => {
    const { createServer } = await import('net');
    const server = createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(false); // 端口空闲
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(true); // 端口被占用
    });
  });
}

// 停止运行中的服务
async function stopService() {
  const port = process.env.PORT || 3000;
  log.info(`尝试停止运行在端口 ${port} 的服务...`);
  
  // 这里可以实现更复杂的停止逻辑
  // 比如查找进程ID，发送信号等
  log.warn('请手动停止服务 (Ctrl+C)，或查找并终止相关进程');
  console.log(`  查找进程: lsof -ti:${port}`);
  console.log(`  终止进程: kill -9 $(lsof -ti:${port})`);
}

// 启动服务
async function startServer(options = {}) {
  const port = options.port || process.env.PORT || 3000;
  const workspace = options.workspace || process.env.CCUI_WORK_DIR;
  
  // 设置环境变量
  const env = { ...process.env };
  if (port) env.PORT = port;
  if (workspace) env.CCUI_WORK_DIR = workspace;
  
  // 检查是否已有服务在运行
  const isRunning = await checkRunningInstance(port);
  if (isRunning) {
    log.error(`端口 ${port} 已被占用！`);
    log.info('您可以:');
    console.log('  1. 使用不同端口: ccui --port 3001');
    console.log('  2. 停止现有服务: ccui --stop');
    console.log(`  3. 手动终止进程: kill -9 $(lsof -ti:${port})`);
    process.exit(1);
  }
  
  log.title('启动 Claude Code UI...');
  log.info(`端口: ${port}`);
  if (workspace) log.info(`工作目录: ${workspace}`);
  log.info(`安装位置: ${packageRoot}`);
  
  // 启动服务器
  const serverScript = join(packageRoot, 'server', 'index.js');
  
  try {
    await fs.access(serverScript);
  } catch (error) {
    log.error('找不到服务器文件！请确保 Claude Code UI 已正确安装。');
    log.info('尝试重新安装: npm install -g claude-code-ui');
    process.exit(1);
  }
  
  console.log(''); // 空行
  log.success('正在启动服务器...');
  console.log(`${colors.cyan}🌐 访问地址: http://localhost:${port}${colors.reset}`);
  console.log(`${colors.yellow}💡 按 Ctrl+C 停止服务${colors.reset}`);
  console.log(''); // 空行
  
  // 启动子进程
  const child = spawn('node', [serverScript], {
    cwd: packageRoot,
    env: env,
    stdio: 'inherit'
  });
  
  // 处理进程退出
  child.on('close', (code) => {
    if (code !== 0) {
      log.error(`服务器进程退出，代码: ${code}`);
      process.exit(code);
    }
  });
  
  // 处理错误
  child.on('error', (error) => {
    log.error(`启动失败: ${error.message}`);
    process.exit(1);
  });
  
  // 处理中断信号
  process.on('SIGINT', () => {
    log.info('正在停止服务器...');
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    log.info('正在停止服务器...');
    child.kill('SIGTERM');
  });
}

// 解析命令行参数
async function parseArgs(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
        
      case '--version':
      case '-v':
        await showVersion();
        process.exit(0);
        break;
        
      case '--config':
        showConfig();
        process.exit(0);
        break;
        
      case '--stop':
        await stopService();
        process.exit(0);
        break;
        
      case '--port':
      case '-p':
        if (i + 1 < args.length) {
          options.port = parseInt(args[++i]);
          if (isNaN(options.port) || options.port < 1 || options.port > 65535) {
            log.error('无效的端口号');
            process.exit(1);
          }
        } else {
          log.error('--port 选项需要指定端口号');
          process.exit(1);
        }
        break;
        
      case '--workspace':
      case '-w':
        if (i + 1 < args.length) {
          options.workspace = args[++i];
        } else {
          log.error('--workspace 选项需要指定目录路径');
          process.exit(1);
        }
        break;
        
      default:
        if (arg.startsWith('-')) {
          log.error(`未知选项: ${arg}`);
          log.info('使用 ccui --help 查看帮助信息');
          process.exit(1);
        }
        break;
    }
  }
  
  return options;
}

// 主函数
async function main() {
  try {
    const args = process.argv.slice(2);
    const options = await parseArgs(args);
    
    // 如果没有任何参数，直接启动服务
    if (args.length === 0) {
      await startServer(options);
    } else {
      await startServer(options);
    }
  } catch (error) {
    log.error(`启动失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('严重错误:', error);
  process.exit(1);
});