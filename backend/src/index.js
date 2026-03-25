/**
 * AI项目后端服务器入口
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入路由
const authRoutes = require('./routes/auth.routes');
const githubRoutes = require('./routes/github.routes');
const userRoutes = require('./routes/user.routes');

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/users', userRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API端点不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI后端服务器启动成功`);
  console.log(`📡 监听端口: ${PORT}`);
  console.log(`🌐 前端URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔧 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ 时间: ${new Date().toISOString()}`);
  
  // 显示API端点
  console.log('\n📋 可用API端点:');
  console.log('  GET  /health          - 健康检查');
  console.log('  POST /api/auth/login  - 用户登录');
  console.log('  POST /api/auth/register - 用户注册');
  console.log('  POST /api/auth/github - GitHub OAuth');
  console.log('  GET  /api/github/user - GitHub用户信息');
  console.log('  GET  /api/github/repos - GitHub仓库列表');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在关闭服务器...');
  process.exit(0);
});

module.exports = app;