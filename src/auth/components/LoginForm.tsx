import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../utils/auth.utils';

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // 清除字段验证错误
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // 清除全局错误
    if (error) clearError();
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = '邮箱不能为空';
    } else if (!isValidEmail(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    if (!formData.password) {
      errors.password = '密码不能为空';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      // 登录成功后的处理（如重定向）由上层组件处理
    } catch (error) {
      // 错误已在AuthContext中处理
      console.error('登录失败:', error);
    }
  };

  // 演示账户快速填充
  const fillDemoAccount = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'Demo@123',
      rememberMe: false,
    });
    setValidationErrors({});
    if (error) clearError();
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">登录</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱地址
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入您的邮箱"
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入您的密码"
            disabled={isLoading}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
              记住我
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-500"
            onClick={() => {/* 忘记密码功能待实现 */}}
          >
            忘记密码？
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              登录中...
            </span>
          ) : (
            '登录'
          )}
        </button>

        <div className="mt-4">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            使用演示账户登录
          </button>
          <p className="mt-1 text-xs text-gray-500 text-center">
            演示账户：demo@example.com / Demo@123
          </p>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          还没有账户？{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-500 font-medium"
            onClick={() => {/* 切换到注册表单 */}}
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;