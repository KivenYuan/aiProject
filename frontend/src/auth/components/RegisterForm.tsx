import React, { useState } from 'react';
import { Input, Button, Alert, Progress } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { isValidEmail, validatePassword } from '../utils/auth.utils';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
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
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.message || '密码不符合要求';
      }
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

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
    } catch (err) {
      console.error('注册失败:', err);
    }
  };

  const getPasswordStrength = (): { percent: number; status: 'exception' | 'success' | 'active' } => {
    if (!formData.password) return { percent: 0, status: 'active' };
    const validation = validatePassword(formData.password);
    return validation.valid
      ? { percent: 100, status: 'success' }
      : { percent: 33, status: 'exception' };
  };

  const pwStrength = getPasswordStrength();

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">注册新账户</h2>
        <p className="mt-1 text-sm text-slate-600">填写以下信息完成注册</p>
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
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
            姓名（可选）
          </label>
          <Input
            id="name"
            size="large"
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="请输入您的姓名"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            status={validationErrors.name ? 'error' : undefined}
            disabled={isLoading}
          />
          {validationErrors.name && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-email" className="mb-2 block text-sm font-medium text-gray-700">
            邮箱地址
          </label>
          <Input
            id="reg-email"
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
          <label htmlFor="reg-password" className="mb-2 block text-sm font-medium text-gray-700">
            密码
          </label>
          <Input.Password
            id="reg-password"
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="至少8位，含大小写字母和数字"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            status={validationErrors.password ? 'error' : undefined}
            disabled={isLoading}
          />
          {formData.password && (
            <div className="mt-2">
              <Progress
                percent={pwStrength.percent}
                status={pwStrength.status}
                size="small"
                showInfo={false}
              />
              <p className={`mt-1 text-xs ${pwStrength.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                密码强度：{pwStrength.status === 'success' ? '强' : '弱'}
              </p>
            </div>
          )}
          {validationErrors.password && !formData.password && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
            确认密码
          </label>
          <Input.Password
            id="confirmPassword"
            size="large"
            prefix={<SafetyOutlined className="text-gray-400" />}
            placeholder="请再次输入密码"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            status={validationErrors.confirmPassword ? 'error' : undefined}
            disabled={isLoading}
          />
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
          )}
        </div>

        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-green-50 p-4">
          <p className="mb-3 text-sm font-medium text-gray-700">密码要求：</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { check: formData.password.length >= 8, label: '至少8个字符' },
              { check: /[A-Z]/.test(formData.password), label: '大写字母' },
              { check: /[a-z]/.test(formData.password), label: '小写字母' },
              { check: /\d/.test(formData.password), label: '至少一个数字' },
            ].map(({ check, label }) => (
              <div key={label} className={`flex items-center text-xs ${check ? 'text-green-600' : 'text-gray-500'}`}>
                {check ? '✓' : '✗'}
                <span className="ml-1.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="primary"
          htmlType="submit"
          icon={<UserAddOutlined />}
          loading={isLoading}
          size="large"
          block
        >
          注册
        </Button>
      </form>

      <div className="mt-8 border-t border-gray-200 pt-8 text-center">
        <span className="text-sm text-gray-600">已有账户？</span>{' '}
        <Button type="link" onClick={onSwitchToLogin} className="px-0">
          立即登录
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;
