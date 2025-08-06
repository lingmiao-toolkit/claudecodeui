# 环境变量配置说明

本文档描述了Claude Code UI支持的环境变量配置选项，特别是针对CC容器环境的调整。

## 环境变量列表

### 1. CCUI_WORK_DIR
- **功能**: 设置默认工作目录
- **行为**: 
  - 系统启动时会自动选中这个项目
  - 如果目标目录不存在，系统会自动创建
  - 目录会被自动添加为项目（如果尚未存在）
- **示例**: `CCUI_WORK_DIR=/workspace/my-project`

### 2. CCUI_DEFAULT_SHELL
- **功能**: 自动切换到Shell标签页
- **行为**:
  - 设置为 `true` 时，系统会自动切换到Shell标签页
  - 同时连接当前选中项目
  - Claude的模式会设置为bypass permissions
- **示例**: `CCUI_DEFAULT_SHELL=true`

### 3. CCUI_SINGLE_PROJECT
- **功能**: 禁用新建工程按钮
- **行为**:
  - 设置为 `true` 时，新建工程按钮将被禁用
  - 适用于单项目容器环境
- **示例**: `CCUI_SINGLE_PROJECT=true`

## 使用方法

1. 在项目根目录创建 `.env` 文件
2. 添加所需的环境变量配置
3. 重启服务器

## 典型配置示例

### 单项目容器环境
```bash
# .env
CCUI_WORK_DIR=/workspace
CCUI_DEFAULT_SHELL=true
CCUI_SINGLE_PROJECT=true
```

这个配置适合Docker容器环境，其中：
- 自动选择 `/workspace` 作为工作项目
- 启动时直接进入Shell模式
- 禁用新建项目功能

### 开发环境
```bash
# .env
CCUI_WORK_DIR=/Users/username/projects/my-main-project
CCUI_DEFAULT_SHELL=false
CCUI_SINGLE_PROJECT=false
```

## 实现详情

### 服务器端
- `server/index.js`: 处理环境变量读取和工作目录创建
- `/api/config` 端点: 向前端提供配置信息

### 前端
- `src/App.jsx`: 处理工作目录自动选择和Shell标签页切换
- `src/components/Sidebar.jsx`: 处理新建工程按钮禁用
- `src/components/ChatInterface.jsx`: 处理bypass permissions模式设置

## 注意事项

1. 环境变量在服务器启动时读取，修改后需要重启服务器
2. `CCUI_WORK_DIR` 必须是绝对路径
3. 如果指定的工作目录无法创建，系统会记录错误但继续运行
4. bypass permissions模式只在Shell标签页激活时生效