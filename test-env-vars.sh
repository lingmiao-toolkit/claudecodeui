#!/bin/bash

# 测试环境变量脚本
echo "🧪 测试 Claude Code UI 环境变量功能"
echo "========================================="

# 创建测试目录
TEST_DIR="/tmp/ccui-test-workspace"
echo "📁 创建测试目录: $TEST_DIR"
mkdir -p "$TEST_DIR"

# 创建测试 .env 文件
cat > .env << EOF
# 测试环境变量配置
CCUI_WORK_DIR=$TEST_DIR
CCUI_DEFAULT_SHELL=true
CCUI_SINGLE_PROJECT=true
PORT=3000
EOF

echo "✅ 已创建 .env 文件，内容："
echo "----------------------------------------"
cat .env
echo "----------------------------------------"

echo ""
echo "🚀 现在请重启服务器来应用这些环境变量："
echo "   npm run dev"
echo ""
echo "📋 启动后请检查以下内容："
echo "1. 服务器启动时的环境变量打印"
echo "2. 浏览器控制台中的调试信息"
echo "3. 是否自动选择了测试目录项目"
echo "4. 是否自动切换到了Shell标签页"
echo "5. 新建工程按钮是否被禁用"
echo ""
echo "🔍 调试信息将以 [DEBUG] 标记显示"