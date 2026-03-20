import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, validatePassword } from '../utils/auth.utils';

const RegisterForm: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
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

    // 邮箱验证
    if (!formData.email.trim()) {
      errors.email = '邮箱不能为空';
    } else if (!isValidEmail(formData.email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 密码验证
    if (!formData.password) {
      errors.password = '密码不能为空';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message || '密码不符合要求';
      }
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    // 姓名验证（可选）
    if (formData.name && formData.name.length > 50) {
      errors.name = '姓名不能超过50个字符';
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
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
      });
      // 注册成功后的处理（如重定向）由上层组件处理
    } catch (error) {
      // 错误已在AuthContext中处理
      console.error('注册失败:', error);
    }
  };

  // 密码强度指示器
  const renderPasswordStrength = () => {
    if (!formData.password) return null;
    
    const validation = validatePassword(formData.password);
    if (validation.valid) {
      return (
        <div className="mt-1">
          <div className="flex items-center">
            <div className="h-1 w-full bg-green-500 rounded-full"></div>
          </div>
          <p className="text-xs text-green-600 mt-1">密码强度：强</p>
        </div>
      );
    } else {
      return (
        <div className="mt-1">
          <div className="flex items-center">
            <div className="h-1 w-full bg-red-500 rounded-full"></div>
          </div>
          <p className="text-xs text-red-600 mt-1">{validation.message}</p>
        </div>
      );
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">注册新账户</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            姓名（可选）
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请输入您的姓名"
            disabled={isLoading}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
          )}
        </div>

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
            placeholder="请输入密码（至少8位，包含大小写字母和数字）"
            disabled={isLoading}
          />
          {renderPasswordStrength()}
          {validationErrors.password && !formData.password && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            确认密码
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="请再次输入密码"
            disabled={isLoading}
          />
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <p className="mb-2">密码要求：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
              至少8个字符
            </li>
            <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
              至少一个大写字母
            </li>
            <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
              至少一个小写字母
            </li>
            <li className={/\d/.test(formData.password) ? 'text-green-600' : ''}>
              至少一个数字
            </li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              注册中...
            </span>
          ) : (
            '注册'
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          已有账户？{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-500 font-medium"
            onClick={() => {/* 切换到登录表单 */}}
          >
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;