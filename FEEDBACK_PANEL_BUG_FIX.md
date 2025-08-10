# 反馈面板端口检测逻辑Bug修复

## 问题描述

根据GitHub Issue #3的报告：
- 通过 feedback.pid 里的端口打开 127.0.0.1:{feedback端口}，自动刷新机制有问题
- 页面能正常刷出来，但过几秒就显示连接失败
- 点击重新连接又可以正常工作

## 问题分析

通过代码分析发现了以下问题：

### 1. 定时器清理逻辑错误（主要问题）
在 `src/components/MainContent.jsx` 的 ref 回调函数中：
- 原代码没有正确清理之前的超时定时器
- 每次 iframe 重新渲染时会创建新的定时器，但旧的定时器仍在运行
- 即使 iframe 加载成功，之前的定时器仍会在10秒后触发，强制设置错误状态

### 2. iframe加载状态检测不够可靠
- onLoad 事件中的500ms延迟可能不够
- 跨域iframe的状态检测逻辑需要改进

## 修复内容

### 1. 修复定时器清理逻辑
```javascript
// 修复前
iframe.timeoutId = timeoutId;

// 修复后
if (iframe.timeoutId) {
  clearTimeout(iframe.timeoutId);
}
const timeoutId = setTimeout(...);
iframe.timeoutId = timeoutId;
```

### 2. 改进iframe加载状态检测
- 将延迟时间从500ms增加到1000ms
- 在onLoad事件中也清理超时定时器
- 改进错误处理逻辑

### 3. 添加组件清理机制
- 添加useEffect清理函数，在组件卸载时清理定时器
- 在feedbackPort变化时清理之前的定时器

## 修复后的预期效果

1. iframe加载成功后不会再出现"过几秒显示连接失败"的问题
2. 定时器会被正确清理，避免内存泄漏
3. 提高了跨域iframe加载状态检测的可靠性
4. 重新连接功能继续正常工作

## 测试建议

1. 创建一个 `.claude/feedback.pid` 文件，写入一个有效的端口号
2. 启动对应端口的反馈服务
3. 在反馈面板中观察iframe是否能稳定加载，不再出现间歇性连接失败
4. 测试重新连接按钮是否仍然正常工作
5. 测试在没有反馈服务运行时的错误处理是否正确

## 相关文件

- `src/components/MainContent.jsx` - 主要修复文件
- 修复涉及第483-539行的iframe处理逻辑
- 添加了第119-140行的清理机制
