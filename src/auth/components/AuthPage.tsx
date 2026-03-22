import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { isAuthenticated, user } = useAuth();

  // 如果用户已登录，显示欢迎信息
  if (isAuthenticated && user) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-8">
            {/* 欢迎图标 */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* 欢迎文本 */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-gray-900">
                欢迎回来，<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.name || user.email}</span>！
              </h2>
              <p className="text-gray-600">
                您已成功登录系统，准备开始您的AI之旅。
              </p>
            </div>
            
            {/* 用户信息卡片 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name || '用户'}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  console.log('导航到仪表盘');
                  // 暂时用alert代替，实际开发中应使用路由导航
                  alert('仪表盘功能开发中，敬请期待！');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                进入仪表盘
              </button>
              <button
                onClick={() => {
                  // 退出登录逻辑
                  if (window.confirm('确定要退出登录吗？')) {
                    console.log('用户退出登录');
                    // 这里应该调用auth context的logout方法
                    // 暂时用页面刷新模拟退出
                    window.location.reload();
                  }
                }}
                className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                退出登录
              </button>
            </div>
            
            {/* 提示信息 */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                上次登录时间：刚刚
              </p>
            </div>
          </div>
          
          {/* 页脚信息 */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>© 2026 AI Frontend. 保护您的数据安全是我们的首要任务。</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* 头部区域 */}
        <div className="text-center">
          <div className="inline-block p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg mb-4">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Frontend
          </h1>
          <p className="mt-2 text-gray-600">
            {mode === 'login' ? '欢迎回来，请登录您的账户' : '加入我们，创建新账户'}
          </p>
        </div>

        {/* 模式切换卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {/* 模式切换 */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              onClick={() => setMode('login')}
            >
              登录
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
              onClick={() => setMode('register')}
            >
              注册
            </button>
          </div>

          {/* 表单 */}
          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}

          {/* 额外信息 */}
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 text-center">
                <strong className="text-blue-600">演示账户快速体验</strong>
                <br />
                <span className="text-gray-600">邮箱: </span><span className="font-mono">demo@example.com</span>
                <br />
                <span className="text-gray-600">密码: </span><span className="font-mono">Demo@123</span>
              </p>
            </div>
          </div>
        </div>

        {/* 页脚信息 */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2026 AI Frontend. 保护您的数据安全是我们的首要任务。</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;