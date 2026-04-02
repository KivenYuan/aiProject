/**
 * 认证工具函数
 */
import type { User } from '../types/auth.types';
import { AUTH_KEYS } from '../types/auth.types';
  
// 设置认证信息到本地存储
export const setAuth = (user: User, token: string): void => {
  try {
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(user));
    // 设置过期时间（默认24小时）
    const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem(AUTH_KEYS.EXPIRES_AT, expiresAt.toString());
  } catch (error) {
    console.error('保存认证信息到本地存储失败:', error);
  }
};

// 从本地存储获取token
export const getToken = (): string | null => {
  try {
    // 检查token是否过期
    const expiresAt = localStorage.getItem(AUTH_KEYS.EXPIRES_AT);
    if (expiresAt) {
      const now = new Date().getTime();
      if (now > parseInt(expiresAt, 10)) {
        clearAuth();
        return null;
      }
    }
    return localStorage.getItem(AUTH_KEYS.TOKEN);
  } catch (error) {
    console.error('从本地存储获取token失败:', error);
    return null;
  }
};

// 从本地存储获取用户信息
export const getUser = (): User | null => {
  try {
    const userStr = localStorage.getItem(AUTH_KEYS.USER);
    if (!userStr) return null;
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('从本地存储获取用户信息失败:', error);
    return null;
  }
};

// 清除认证信息
export const clearAuth = (): void => {
  try {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.EXPIRES_AT);
  } catch (error) {
    console.error('清除认证信息失败:', error);
  }
};

// 验证邮箱格式
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证密码强度
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: '密码至少需要8个字符' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个大写字母' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个小写字母' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含至少一个数字' };
  }
  return { valid: true };
};

// 生成本地模拟用户数据（离线或测试场景）
export const generateMockUser = (): User => {
  const timestamp = new Date().toISOString();
  return {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email: 'demo@example.com',
    name: '访客用户',
    role: 'user',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

// 检查用户是否拥有特定角色
export const hasRole = (user: User | null, role: User['role']): boolean => {
  return user?.role === role;
};

// 检查用户是否已认证
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};