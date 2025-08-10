/*
 * MainContent.jsx - Main Content Area with Session Protection Props Passthrough
 * 
 * SESSION PROTECTION PASSTHROUGH:
 * ===============================
 * 
 * This component serves as a passthrough layer for Session Protection functions:
 * - Receives session management functions from App.jsx
 * - Passes them down to ChatInterface.jsx
 * 
 * No session protection logic is implemented here - it's purely a props bridge.
 */

import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import FileTree from './FileTree';
import CodeEditor from './CodeEditor';
import Shell from './Shell';
import GitPanel from './GitPanel';
import ErrorBoundary from './ErrorBoundary';

function MainContent({ 
  selectedProject, 
  selectedSession, 
  activeTab, 
  setActiveTab, 
  ws, 
  sendMessage, 
  messages,
  isMobile,
  onMenuClick,
  isLoading,
  onInputFocusChange,
  // Session Protection Props: Functions passed down from App.jsx to manage active session state
  // These functions control when project updates are paused during active conversations
  onSessionActive,        // Mark session as active when user sends message
  onSessionInactive,      // Mark session as inactive when conversation completes/aborts  
  onReplaceTemporarySession, // Replace temporary session ID with real session ID from WebSocket
  onNavigateToSession,    // Navigate to a specific session (for Claude CLI session duplication workaround)
  onShowSettings,         // Show tools settings panel
  autoExpandTools,        // Auto-expand tool accordions
  showRawParameters,      // Show raw parameters in tool accordions
  autoScrollToBottom,     // Auto-scroll to bottom when new messages arrive
  sendByCtrlEnter,        // Send by Ctrl+Enter mode for East Asian language input
  config                  // Configuration object with environment variable settings
}) {
  const [editingFile, setEditingFile] = useState(null);
  const [feedbackPort, setFeedbackPort] = useState(null);
  const [feedbackError, setFeedbackError] = useState(null);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);

  const handleFileOpen = (filePath, diffInfo = null) => {
    // Create a file object that CodeEditor expects
    const file = {
      name: filePath.split('/').pop(),
      path: filePath,
      projectName: selectedProject?.name,
      diffInfo: diffInfo // Pass along diff information if available
    };
    setEditingFile(file);
  };

  const handleCloseEditor = () => {
    setEditingFile(null);
  };

  // 读取反馈端口号
  useEffect(() => {
    const loadFeedbackPort = async () => {
      if (!selectedProject) {
        setFeedbackPort(null);
        setFeedbackError(null);
        return;
      }
      
      try {
        const token = localStorage.getItem('auth-token');
        // 构建绝对路径：项目路径 + 相对路径
        const absolutePath = `${selectedProject.path}/.claude/feedback.pid`;
        const apiUrl = `/api/projects/${selectedProject.name}/file?filePath=${encodeURIComponent(absolutePath)}`;
        console.log('📍 Full API URL:', apiUrl);
        console.log('📍 Absolute path:', absolutePath);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const port = data.content.trim().replace(/%$/, ''); // 移除末尾的%符号
          
          if (port && !isNaN(port)) {
            setFeedbackPort(port);
            setFeedbackError(null);
            // 重置iframe状态
            setIframeError(false);
            setIframeLoading(true);
          } else {
            setFeedbackPort(null);
            setFeedbackError('端口号格式无效');
          }
        } else {
          setFeedbackPort(null);
          setFeedbackError('未找到 .claude/feedback.pid 文件');
        }
      } catch (error) {
        setFeedbackPort(null);
        setFeedbackError('读取反馈配置文件失败');
      }
    };

    loadFeedbackPort();
  }, [selectedProject]);

  // 清理定时器的useEffect
  useEffect(() => {
    // 当feedbackPort变化时，清理之前的定时器
    return () => {
      const iframe = document.querySelector('#feedback-iframe');
      if (iframe && iframe.timeoutId) {
        clearTimeout(iframe.timeoutId);
        iframe.timeoutId = null;
      }
    };
  }, [feedbackPort]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      const iframe = document.querySelector('#feedback-iframe');
      if (iframe && iframe.timeoutId) {
        clearTimeout(iframe.timeoutId);
        iframe.timeoutId = null;
      }
    };
  }, []);
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with menu button for mobile */}
        {isMobile && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
            <button
              onClick={onMenuClick}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-4">
              <div 
                className="w-full h-full rounded-full border-4 border-gray-200 border-t-blue-500" 
                style={{ 
                  animation: 'spin 1s linear infinite',
                  WebkitAnimation: 'spin 1s linear infinite',
                  MozAnimation: 'spin 1s linear infinite'
                }} 
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">Loading Claude Code UI</h2>
            <p>Setting up your workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="h-full flex flex-col">
        {/* Header with menu button for mobile */}
        {isMobile && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
            <button
              onClick={onMenuClick}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto px-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-white">Choose Your Project</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Select a project from the sidebar to start coding with Claude. Each project contains your chat sessions and file history.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> {isMobile ? 'Tap the menu button above to access projects' : 'Create a new project by clicking the folder icon in the sidebar'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isMobile && (
              <button
                onClick={onMenuClick}
                onTouchStart={(e) => {
                  e.preventDefault();
                  onMenuClick();
                }}
                className="p-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              {activeTab === 'chat' && selectedSession ? (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {selectedSession.summary}
                  </h2>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedProject.displayName} <span className="hidden sm:inline">• {selectedSession.id}</span>
                  </div>
                </div>
              ) : activeTab === 'chat' && !selectedSession ? (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    New Session
                  </h2>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedProject.displayName}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {activeTab === 'files' ? '项目文件' : activeTab === 'git' ? 'GIT管理' : activeTab === 'feedback' ? '反馈' : '项目'}
                  </h2>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedProject.displayName}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Modern Tab Navigation - Right Side */}
          <div className="flex-shrink-0 hidden sm:block">
            <div className="relative flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden sm:inline">对话</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('shell')}
                className={`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'shell'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">终端</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('files')}
                className={`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'files'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">文件</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('git')}
                className={`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'git'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">GIT管理</span>
                </span>
              </button>
              {selectedProject && (
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'feedback'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="hidden sm:inline">反馈</span>
                  </span>
                </button>
              )}
               {/* <button
                onClick={() => setActiveTab('preview')}
                className={`relative px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              > 
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="hidden sm:inline">Preview</span>
                </span>
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className={`h-full ${activeTab === 'chat' ? 'block' : 'hidden'}`}>
          <ErrorBoundary showDetails={true}>
            <ChatInterface
              selectedProject={selectedProject}
              selectedSession={selectedSession}
              ws={ws}
              sendMessage={sendMessage}
              messages={messages}
              onFileOpen={handleFileOpen}
              onInputFocusChange={onInputFocusChange}
              onSessionActive={onSessionActive}
              onSessionInactive={onSessionInactive}
              onReplaceTemporarySession={onReplaceTemporarySession}
              onNavigateToSession={onNavigateToSession}
              onShowSettings={onShowSettings}
              autoExpandTools={autoExpandTools}
              showRawParameters={showRawParameters}
              autoScrollToBottom={autoScrollToBottom}
              sendByCtrlEnter={sendByCtrlEnter}
              config={config}
              activeTab={activeTab}
            />
          </ErrorBoundary>
        </div>
        <div className={`h-full overflow-hidden ${activeTab === 'files' ? 'block' : 'hidden'}`}>
          <FileTree selectedProject={selectedProject} />
        </div>
        <div className={`h-full overflow-hidden ${activeTab === 'shell' ? 'block' : 'hidden'}`}>
          <Shell 
            selectedProject={selectedProject} 
            selectedSession={selectedSession}
            isActive={activeTab === 'shell'}
            config={config}
          />
        </div>
        <div className={`h-full overflow-hidden ${activeTab === 'git' ? 'block' : 'hidden'}`}>
          <GitPanel selectedProject={selectedProject} isMobile={isMobile} />
        </div>
        {selectedProject && (
          <div className={`h-full overflow-hidden ${activeTab === 'feedback' ? 'block' : 'hidden'}`}>
            <div className="h-full flex flex-col">
              <div className="flex-1">
                {feedbackPort ? (
                  <div className="relative w-full h-full">
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-4">
                            <div 
                              className="w-full h-full rounded-full border-4 border-gray-200 border-t-blue-500" 
                              style={{ 
                                animation: 'spin 1s linear infinite',
                                WebkitAnimation: 'spin 1s linear infinite',
                                MozAnimation: 'spin 1s linear infinite'
                              }} 
                            />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">正在加载反馈系统...</p>
                        </div>
                      </div>
                    )}
                    
                    {iframeError ? (
                      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                        <div className="text-center max-w-md mx-auto px-6">
                          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">反馈系统连接失败</h2>
                          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                            无法连接到反馈系统服务 (端口: {feedbackPort})。请检查服务是否正在运行。
                          </p>
                          <div className="space-y-3">
                            <button
                              onClick={() => {
                                setIframeError(false);
                                setIframeLoading(true);
                                // 重新加载iframe
                                const iframe = document.querySelector('#feedback-iframe');
                                if (iframe) {
                                  iframe.src = iframe.src;
                                }
                              }}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              🔄 重新连接
                            </button>
                            <button
                              onClick={() => {
                                const url = `http://127.0.0.1:${feedbackPort}`;
                                window.open(url, '_blank');
                              }}
                              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                              🔗 在新窗口打开
                            </button>
                          </div>
                          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                            目标地址: <code>http://127.0.0.1:{feedbackPort}</code>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        id="feedback-iframe"
                        src={`http://127.0.0.1:${feedbackPort}`}
                        className="w-full h-full border-0"
                        title="反馈系统"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        onLoad={(e) => {
                          // 检查iframe是否真的加载成功（不是错误页面）
                          setTimeout(() => {
                            try {
                              const iframe = e.target;

                              // 清理超时定时器，因为iframe已经加载完成
                              if (iframe.timeoutId) {
                                clearTimeout(iframe.timeoutId);
                                iframe.timeoutId = null;
                              }

                              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                              // 如果能访问到文档且标题不是浏览器错误页面
                              if (iframeDoc && !iframeDoc.title.includes('无法访问') && !iframeDoc.title.includes('错误')) {
                                setIframeLoading(false);
                                setIframeError(false);
                              } else {
                                setIframeLoading(false);
                                setIframeError(true);
                              }
                            } catch (error) {
                              // 由于同源策略，可能无法访问iframe内容，这是正常的
                              // 如果无法访问，说明页面加载成功（不同源）
                              const iframe = e.target;

                              // 清理超时定时器
                              if (iframe.timeoutId) {
                                clearTimeout(iframe.timeoutId);
                                iframe.timeoutId = null;
                              }

                              setIframeLoading(false);
                              setIframeError(false);
                            }
                          }, 1000); // 增加延迟时间到1秒，提高检测可靠性
                        }}
                        onError={() => {
                          setIframeLoading(false);
                          setIframeError(true);
                        }}
                        ref={(iframe) => {
                          if (iframe && iframeLoading) {
                            // 清理之前的超时定时器
                            if (iframe.timeoutId) {
                              clearTimeout(iframe.timeoutId);
                            }

                            // 设置10秒超时
                            const timeoutId = setTimeout(() => {
                              if (iframeLoading) {
                                setIframeLoading(false);
                                setIframeError(true);
                              }
                            }, 10000);

                            // 存储新的定时器ID
                            iframe.timeoutId = timeoutId;
                          }
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="text-center max-w-md mx-auto px-6">
                      <div className="w-16 h-16 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">反馈系统未配置</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {feedbackError || '在项目根目录创建 .claude/feedback.pid 文件，并在其中写入反馈服务的端口号。'}
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          💡 <strong>配置方法：</strong><br/>
                          1. 在项目根目录创建 <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.claude/feedback.pid</code> 文件<br/>
                          2. 在文件中写入端口号，如：<code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">8080</code>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <div className={`h-full overflow-hidden ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
          {/* <LivePreviewPanel
            selectedProject={selectedProject}
            serverStatus={serverStatus}
            serverUrl={serverUrl}
            availableScripts={availableScripts}
            onStartServer={(script) => {
              sendMessage({
                type: 'server:start',
                projectPath: selectedProject?.fullPath,
                script: script
              });
            }}
            onStopServer={() => {
              sendMessage({
                type: 'server:stop',
                projectPath: selectedProject?.fullPath
              });
            }}
            onScriptSelect={setCurrentScript}
            currentScript={currentScript}
            isMobile={isMobile}
            serverLogs={serverLogs}
            onClearLogs={() => setServerLogs([])}
          /> */}
        </div>
      </div>

      {/* Code Editor Modal */}
      {editingFile && (
        <CodeEditor
          file={editingFile}
          onClose={handleCloseEditor}
          projectPath={selectedProject?.path}
        />
      )}
    </div>
  );
}

export default React.memo(MainContent);