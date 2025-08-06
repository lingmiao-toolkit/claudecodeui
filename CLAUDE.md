# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Claude Code UI is a comprehensive web-based interface for the Claude Code CLI. It consists of a React frontend with Vite, an Express.js backend with WebSocket support, and integrates with Claude CLI for AI-powered development workflows.

## Architecture

### System Components
- **Frontend**: React 18 + Vite development server (port 3001 by default)
- **Backend**: Express.js server with WebSocket support (port 3000 by default)
- **CLI Integration**: Direct spawning of Claude CLI processes with real-time communication
- **Database**: SQLite with better-sqlite3 for authentication and session management

### Key Integration Points
- **WebSocket Communication**: Real-time chat interface via `/ws` endpoint for Claude CLI interaction
- **Shell Interface**: Terminal emulation via `/shell` endpoint using node-pty
- **File Operations**: Direct file system access for project files with security validation
- **Authentication**: JWT-based auth with bcrypt password hashing

## Development Commands

### Setup and Installation
```bash
# Install dependencies
npm install

# Development mode (runs both frontend and backend)
npm run dev

# Production build
npm run build

# Production start
npm start
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

Required environment variables:
- `PORT`: Backend server port (default: 3000)  
- `VITE_PORT`: Frontend development port (default: 3001)
- `OPENAI_API_KEY`: For audio transcription features (optional)

### Development Workflow
- Frontend development server runs on `http://localhost:3001` 
- Backend API server runs on `http://localhost:3000`
- Vite proxy configuration handles API routing during development
- Hot reloading enabled for React components

## Core Architecture Patterns

### Session Protection System (App.jsx)
The application implements a sophisticated session protection mechanism to prevent WebSocket project updates from interfering with active Claude conversations:

- **Active Session Tracking**: Uses `activeSessions` Set to track conversations in progress
- **Additive Updates**: Allows new projects/sessions to appear while protecting active chats
- **Temporary Session Handling**: Manages transition from temporary to real session IDs
- **State Preservation**: Maintains chat messages and UI state during background updates

### Claude CLI Integration (claude-cli.js)
Direct process spawning with comprehensive configuration:

- **Tool Settings**: Dynamic allowed/disallowed tools configuration
- **Permission Modes**: Support for different security levels
- **MCP Server Detection**: Automatic detection and configuration of MCP servers
- **Image Processing**: Temporary file handling for image uploads
- **Stream Processing**: Real-time JSON response parsing and WebSocket forwarding

### File System Security
All file operations include security validation:

- **Path Validation**: Absolute path requirements and traversal attack prevention
- **Permission Checks**: File system permission validation before operations
- **Backup Creation**: Automatic file backups before modifications
- **Access Control**: User-based directory access restrictions

### Authentication Architecture (server/middleware/auth.js)
JWT-based authentication with multiple layers:

- **Token Validation**: API key and JWT token verification
- **WebSocket Auth**: Token validation for WebSocket connections  
- **Database Integration**: SQLite user management with bcrypt hashing
- **Session Management**: Cross-session persistence and security

## Component Architecture

### Primary Components Structure
```
src/components/
├── ChatInterface.jsx     # Claude CLI chat interaction
├── FileTree.jsx         # Project file browser
├── GitPanel.jsx         # Git operations interface  
├── Shell.jsx            # Terminal emulation
├── Sidebar.jsx          # Project and session navigation
├── ToolsSettings.jsx    # Claude CLI tool configuration
└── ui/                  # Reusable UI components
```

### Context Management
- **AuthContext**: User authentication and session state
- **ThemeContext**: Dark/light mode with persistence
- **WebSocket Hook**: Real-time communication management

### Mobile Responsiveness
- **Adaptive Layout**: Desktop sidebar vs mobile overlay navigation
- **Touch Optimization**: Swipe gestures and responsive breakpoints
- **PWA Support**: Service worker and manifest for mobile app experience

## Database Schema

### Authentication Tables (server/database/init.sql)
- **users**: User accounts with bcrypt password hashing
- **api_keys**: Optional API key authentication
- Automatic database initialization on server start

## Important Development Considerations

### Claude CLI Process Management
- Each chat session spawns a separate Claude CLI process
- Processes are tracked by session ID for abort functionality
- Automatic cleanup of temporary files and processes on completion
- Support for both new sessions and session resumption

### WebSocket Message Handling
Multiple WebSocket endpoints serve different purposes:
- `/ws`: Claude CLI communication and project updates
- `/shell`: Terminal emulation with PTY support
- Real-time project file system watching with chokidar

### MCP Server Integration  
- Automatic detection of MCP servers in `~/.claude.json`
- Support for both global and project-specific MCP configurations
- Dynamic MCP config passing to Claude CLI processes

### Security Implementation
- Input sanitization for all file paths and user input
- CORS configuration for cross-origin requests
- Rate limiting and authentication middleware
- Secure temporary file handling with automatic cleanup

### Error Handling Patterns
- Graceful degradation for failed Claude CLI processes
- WebSocket connection recovery mechanisms  
- File operation error handling with user feedback
- Process cleanup on errors and interruptions

## Testing and Quality Assurance

The codebase includes comprehensive error handling and logging throughout:
- Console logging for debugging Claude CLI integration
- Error boundary components for React error recovery
- WebSocket connection state management
- File system operation validation and recovery

## Performance Considerations

### Optimization Techniques
- React.memo usage for preventing unnecessary re-renders
- Object reference preservation in state updates
- Debounced file system watching to prevent excessive updates
- Efficient WebSocket message batching

### Resource Management
- Automatic cleanup of Claude CLI processes and temporary files
- Memory-efficient file streaming for large files  
- Connection pooling for database operations
- Optimized image processing with immediate cleanup