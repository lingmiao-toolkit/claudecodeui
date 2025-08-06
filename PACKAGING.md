# Claude Code UI 打包指南

## 快速打包

使用npm script打包：
```bash
npm run package
```

或直接运行脚本：
```bash
./scripts/package.sh
```

## 打包内容

打包脚本会创建一个包含以下内容的tgz文件：

### 核心文件
- `server/` - 服务器端代码
- `dist/` - 构建后的前端文件
- `package.json` - 生产环境配置
- `package-lock.json` - 依赖锁定文件

### 文档
- `README.md` - 项目说明
- `LICENSE` - 许可证文件
- `ENVIRONMENT_VARIABLES.md` - 环境变量说明
- `INSTALL.md` - 安装说明

### 启动脚本
- `start.sh` - Linux/macOS启动脚本
- `start.bat` - Windows启动脚本

### Docker支持
- `Dockerfile` - Docker构建文件
- `docker-compose.yml` - Docker Compose配置

### 配置文件
- `.env` 模板会在首次启动时自动创建

## 打包输出

打包完成后会生成：
```
claude-code-ui-v{version}.tgz
```

例如：`claude-code-ui-v1.5.0.tgz`

## 部署使用

### 1. 解压包
```bash
tar -xzf claude-code-ui-v1.5.0.tgz
cd claude-code-ui-v1.5.0
```

### 2. 启动应用
Linux/macOS:
```bash
./start.sh
```

Windows:
```cmd
start.bat
```

### 3. 访问应用
打开浏览器访问：http://localhost:3000

## Docker部署

### 使用Docker Compose
```bash
# 解压后进入目录
cd claude-code-ui-v1.5.0

# 启动服务
docker-compose up -d
```

### 使用Docker Build
```bash
# 构建镜像
docker build -t claude-code-ui .

# 运行容器
docker run -p 3000:3000 \
  -v ~/.claude:/app/.claude \
  -v $(pwd)/workspace:/workspace \
  -e CCUI_WORK_DIR=/workspace \
  -e CCUI_DEFAULT_SHELL=true \
  -e CCUI_SINGLE_PROJECT=true \
  claude-code-ui
```

## 环境变量配置

编辑`.env`文件或设置环境变量：

```bash
# 基本配置
PORT=3000

# OpenAI API Key（可选）
OPENAI_API_KEY=your_openai_api_key_here

# CC容器环境变量
CCUI_WORK_DIR=/path/to/your/project
CCUI_DEFAULT_SHELL=true
CCUI_SINGLE_PROJECT=true
```

## 注意事项

1. **Node.js版本**：需要18.0.0或更高版本
2. **Claude CLI**：需要预先安装并配置
3. **权限**：确保有权限访问指定的工作目录
4. **端口**：默认使用3000端口，可通过环境变量修改

## 故障排除

### 常见问题

1. **Node.js版本过低**
   ```bash
   # 检查版本
   node --version
   # 升级Node.js到18+
   ```

2. **端口被占用**
   ```bash
   # 修改.env文件中的PORT值
   PORT=3001
   ```

3. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   rm -rf node_modules
   npm run install-production
   ```

4. **权限问题**
   ```bash
   # 检查文件权限
   ls -la start.sh
   # 添加执行权限
   chmod +x start.sh
   ```

更多详细信息请参考项目文档。