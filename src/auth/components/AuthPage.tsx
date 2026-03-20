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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              欢迎回来，{user.name || user.email}！
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              您已成功登录系统。
            </p>
          </div>
          <div className="space-y-4">
            <button
              onClick={() => {/* 导航到仪表盘 */}}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              进入仪表盘
            </button>
            <button
              onClick={() => {/* 退出登录 */}}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI Frontend</h1>
          <p className="mt-2 text-gray-600">
            {mode === 'login' ? '登录您的账户' : '创建新账户'}
          </p>
        </div>

        {/* 模式切换 */}
        <div className="flex rounded-lg border border-gray-300 p-1">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        {/* 表单 */}
        {mode === 'login' ? <LoginForm /> : <RegisterForm />}

        {/* 额外信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            使用演示账户快速体验：
            <br />
            <strong>demo@example.com</strong> / <strong>Demo@123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;