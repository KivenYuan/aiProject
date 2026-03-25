import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '../contexts/AuthContext';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const { isAuthenticated, user, logout } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-card backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-700 text-white shadow-soft">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
            欢迎回来，<span className="text-brand-700">{user.name || user.email}</span>
          </h2>
          <p className="mt-2 text-sm text-slate-600">账户已登录，可前往仪表盘或继续浏览作品展示。</p>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/90 p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-slate-900">{user.name || '用户'}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 sm:flex-none"
            >
              进入仪表盘
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('确定要退出登录吗？')) {
                  logout();
                }
              }}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex-none"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:py-16">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">登录与注册</h1>
        <p className="mt-2 text-sm text-slate-600">
          {mode === 'login' ? '使用邮箱演示账号体验 JWT 认证流程' : '创建账户以演示注册与鉴权'}
        </p>
      </div>

      <div className="mt-10 space-y-6 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-8">
        <div className="flex rounded-xl bg-slate-100/90 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        {mode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setMode('login')} />
        )}

        <div className="border-t border-slate-200 pt-6">
          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-center text-sm text-slate-700">
            <span className="font-medium text-brand-800">演示账号</span>
            <span className="mt-1 block font-mono text-xs text-slate-600">
              demo@example.com / Demo@123
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
