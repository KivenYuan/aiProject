import React, { useState } from 'react';
import { Input, Button, Checkbox, Alert } from 'antd';
import { MailOutlined, LockOutlined, LoginOutlined, CopyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail } from '../utils/auth.utils';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

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
    } catch (err) {
      console.error('登录失败:', err);
    }
  };

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
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">登录</h2>
        <p className="mt-1 text-sm text-slate-600">请使用邮箱与密码登录</p>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          className="mb-6"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
            邮箱地址
          </label>
          <Input
            id="email"
            size="large"
            prefix={<MailOutlined className="text-gray-400" />}
            placeholder="请输入您的邮箱"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            status={validationErrors.email ? 'error' : undefined}
            disabled={isLoading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
            密码
          </label>
          <Input.Password
            id="password"
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="请输入您的密码"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            status={validationErrors.password ? 'error' : undefined}
            disabled={isLoading}
          />
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            checked={formData.rememberMe}
            onChange={(e) => handleChange('rememberMe', e.target.checked)}
            disabled={isLoading}
          >
            记住我
          </Checkbox>
          <Button
            type="link"
            size="small"
            onClick={() => {
              alert('忘记密码功能开发中，请联系管理员重置密码。');
            }}
          >
            忘记密码？
          </Button>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          icon={<LoginOutlined />}
          loading={isLoading}
          size="large"
          block
        >
          登录
        </Button>

        <div className="border-t border-gray-200 pt-5">
          <Button
            icon={<CopyOutlined />}
            onClick={fillDemoAccount}
            size="large"
            block
          >
            使用演示账户登录
          </Button>
          <p className="mt-3 text-center text-xs text-gray-500">
            <span className="font-medium">演示账户：</span>demo@example.com / Demo@123
          </p>
        </div>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-8 text-center">
        <span className="text-sm text-gray-600">还没有账户？</span>{' '}
        <Button type="link" onClick={onSwitchToRegister} className="px-0">
          立即注册
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
