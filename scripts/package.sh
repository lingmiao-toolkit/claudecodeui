#!/bin/bash

# Claude Code UI 打包脚本
# 用于创建部署就绪的 tgz 包

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取版本号
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME="claude-code-ui-v${VERSION}"
BUILD_DIR="build"
DIST_DIR="${BUILD_DIR}/${PACKAGE_NAME}"

echo -e "${BLUE}🚀 开始打包 Claude Code UI v${VERSION}${NC}"
echo "================================================="

# 清理旧的构建文件
echo -e "${YELLOW}🧹 清理旧的构建文件...${NC}"
rm -rf ${BUILD_DIR}
rm -rf dist
rm -f claude-code-ui-*.tgz

# 创建构建目录
mkdir -p ${DIST_DIR}

# 构建前端
echo -e "${YELLOW}🔨 构建前端应用...${NC}"
npm run build

# 复制必要文件到构建目录
echo -e "${YELLOW}📦 复制文件到构建目录...${NC}"

# 复制服务器文件
cp -r server ${DIST_DIR}/
cp -r dist ${DIST_DIR}/

# 复制全局命令
cp -r bin ${DIST_DIR}/

# 复制配置文件
cp package.json ${DIST_DIR}/
cp package-lock.json ${DIST_DIR}/

# 复制文档
cp README.md ${DIST_DIR}/
cp LICENSE ${DIST_DIR}/
cp ENVIRONMENT_VARIABLES.md ${DIST_DIR}/

# 复制示例文件
cp -r public ${DIST_DIR}/

# 创建生产环境的 package.json（移除开发依赖）
echo -e "${YELLOW}⚙️ 创建生产环境配置...${NC}"
node -e "
const pkg = require('./package.json');
delete pkg.devDependencies;
// 添加生产环境脚本
pkg.scripts = {
  'start': 'node server/index.js',
  'install-production': 'npm install --only=production'
};
pkg.engines = {
  'node': '>=18.0.0',
  'npm': '>=8.0.0'
};
require('fs').writeFileSync('${DIST_DIR}/package.json', JSON.stringify(pkg, null, 2));
"

# 创建启动脚本
echo -e "${YELLOW}📝 创建启动脚本...${NC}"

# Linux/macOS 启动脚本
cat > ${DIST_DIR}/start.sh << 'EOF'
#!/bin/bash

# Claude Code UI 启动脚本

echo "🚀 启动 Claude Code UI..."

# 检查 Node.js 版本
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装。请先安装 Node.js 18 或更高版本。"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本过低。需要 18 或更高版本，当前版本：$(node -v)"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装生产依赖..."
    npm run install-production
fi

# 创建 .env 文件模板（如果不存在）
if [ ! -f ".env" ]; then
    echo "📝 创建 .env 配置文件模板..."
    cat > .env << 'ENVEOF'
# Claude Code UI 配置
PORT=3000

# OpenAI API Key (可选，用于语音转录功能)
# OPENAI_API_KEY=your_openai_api_key_here

# CC容器环境变量（可选）
# CCUI_WORK_DIR=/path/to/your/project
# CCUI_DEFAULT_SHELL=true
# CCUI_SINGLE_PROJECT=true
ENVEOF
    echo "✅ 已创建 .env 文件模板，请根据需要修改配置"
fi

echo "🎉 启动 Claude Code UI..."
npm start
EOF

# Windows 启动脚本
cat > ${DIST_DIR}/start.bat << 'EOF'
@echo off
echo 🚀 启动 Claude Code UI...

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装。请先安装 Node.js 18 或更高版本。
    pause
    exit /b 1
)

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 安装生产依赖...
    npm run install-production
)

REM 创建 .env 文件模板（如果不存在）
if not exist ".env" (
    echo 📝 创建 .env 配置文件模板...
    (
        echo # Claude Code UI 配置
        echo PORT=3000
        echo.
        echo # OpenAI API Key ^(可选，用于语音转录功能^)
        echo # OPENAI_API_KEY=your_openai_api_key_here
        echo.
        echo # CC容器环境变量^(可选^)
        echo # CCUI_WORK_DIR=/path/to/your/project
        echo # CCUI_DEFAULT_SHELL=true
        echo # CCUI_SINGLE_PROJECT=true
    ) > .env
    echo ✅ 已创建 .env 文件模板，请根据需要修改配置
)

echo 🎉 启动 Claude Code UI...
npm start
pause
EOF

# 给启动脚本添加执行权限
chmod +x ${DIST_DIR}/start.sh

# 创建安装说明
cat > ${DIST_DIR}/INSTALL.md << 'EOF'
# Claude Code UI 安装说明

## 系统要求

- Node.js 18.0.0 或更高版本
- npm 8.0.0 或更高版本
- Claude CLI（需要预先安装）

## 快速启动

### Linux/macOS
```bash
./start.sh
```

### Windows
双击 `start.bat` 或在命令行中运行：
```cmd
start.bat
```

### 手动启动
```bash
# 安装依赖
npm run install-production

# 启动服务
npm start
```

## 配置

编辑 `.env` 文件来配置应用：

```bash
# 基本配置
PORT=3000

# OpenAI API Key（可选，用于语音转录功能）
OPENAI_API_KEY=your_openai_api_key_here

# CC容器环境变量（可选）
CCUI_WORK_DIR=/path/to/your/project
CCUI_DEFAULT_SHELL=true
CCUI_SINGLE_PROJECT=true
```

## 访问应用

启动后访问：http://localhost:3000

## 故障排除

1. **端口冲突**：修改 `.env` 文件中的 `PORT` 值
2. **权限问题**：确保 Claude CLI 已正确安装并可访问
3. **依赖问题**：删除 `node_modules` 文件夹后重新运行 `npm run install-production`

更多信息请参考 `README.md` 和 `ENVIRONMENT_VARIABLES.md`
EOF

# 创建 Docker 支持文件
echo -e "${YELLOW}🐳 创建 Docker 支持文件...${NC}"

cat > ${DIST_DIR}/Dockerfile << 'EOF'
FROM node:18-alpine

# 安装系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    bash

# 设置工作目录
WORKDIR /app

# 复制应用文件
COPY . .

# 安装生产依赖
RUN npm run install-production

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 更改文件所有者
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
EOF

cat > ${DIST_DIR}/docker-compose.yml << 'EOF'
version: '3.8'

services:
  claude-code-ui:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - CCUI_WORK_DIR=/workspace
      - CCUI_DEFAULT_SHELL=true
      - CCUI_SINGLE_PROJECT=true
    volumes:
      - ./workspace:/workspace
      - ~/.claude:/app/.claude
    restart: unless-stopped

volumes:
  workspace:
EOF

# 打包成 tgz
echo -e "${YELLOW}📦 创建 tgz 包...${NC}"
cd ${BUILD_DIR}
tar -czf ../${PACKAGE_NAME}.tgz ${PACKAGE_NAME}
cd ..

# 清理构建目录
rm -rf ${BUILD_DIR}

# 计算包大小
PACKAGE_SIZE=$(du -h ${PACKAGE_NAME}.tgz | cut -f1)

echo ""
echo -e "${GREEN}✅ 打包完成！${NC}"
echo "================================================="
echo -e "${BLUE}📦 包名称：${NC} ${PACKAGE_NAME}.tgz"
echo -e "${BLUE}📏 包大小：${NC} ${PACKAGE_SIZE}"
echo -e "${BLUE}📍 位置：${NC} $(pwd)/${PACKAGE_NAME}.tgz"
echo ""
echo -e "${YELLOW}🚀 推荐使用方法 (NPM全局安装)：${NC}"
echo "1. 全局安装：npm install -g ${PACKAGE_NAME}.tgz"
echo "2. 启动应用：ccui"
echo "3. 查看帮助：ccui --help"
echo ""
echo -e "${YELLOW}📋 传统使用方法：${NC}"
echo "1. 解压包：tar -xzf ${PACKAGE_NAME}.tgz"
echo "2. 进入目录：cd ${PACKAGE_NAME}"
echo "3. 启动应用：./start.sh (Linux/macOS) 或 start.bat (Windows)"
echo ""
echo -e "${GREEN}🎉 打包完成！${NC}"