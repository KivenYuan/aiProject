/**
 * 认证API服务 - 真实后端API版本
 * 调用真实的后端API进行用户认证
 */

import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

type AppEnv = {
  __APP_ENV__?: {
    VITE_API_BASE?: string;
  };
};

// API基础URL（优先从运行时注入变量读取，避免在 Jest CJS 下直接解析 import.meta）
const API_BASE = ((globalThis as AppEnv).__APP_ENV__?.VITE_API_BASE || 'http://localhost:3000/api');

/**
 * 通用的API请求函数
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    credentials: 'include' // 支持跨域cookie
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || `HTTP ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * 带认证的API请求函数
 */
async function apiRequestWithAuth<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  return apiRequest<T>(endpoint, {
    ...options,
    headers
  });
}

/**
 * GitHub OAuth token交换（通过后端代理）
 */
export async function exchangeGitHubCode(code: string): Promise<{ user: User; token: string; githubToken?: string }> {
  try {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
        githubToken?: string;
      }
    }>('/auth/github', {
      method: 'POST',
      body: JSON.stringify({ code })
    });

    if (!response.success) {
      throw new Error(response.message || 'GitHub登录失败');
    }

    return response.data;
  } catch (error) {
    console.error('GitHub OAuth交换失败:', error);
    throw error;
  }
}

/**
 * 用户登录服务
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
      }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    return {
      success: response.success,
      message: response.message,
      data: response.data ? {
        user: response.data.user,
        token: response.data.token,
        expiresIn: 24 * 60 * 60 // 假设24小时
      } : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '登录失败，请检查网络连接'
    };
  }
};

/**
 * 用户注册服务
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: {
        user: User;
        token: string;
      }
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    return {
      success: response.success,
      message: response.message,
      data: response.data ? {
        user: response.data.user,
        token: response.data.token,
        expiresIn: 24 * 60 * 60 // 假设24小时
      } : undefined
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '注册失败，请检查网络连接'
    };
  }
};

/**
 * 退出登录服务
 */
export const logout = async (): Promise<void> => {
  try {
    // 在实际应用中，这里可以调用后端API使token失效
    // 当前后端没有专门的logout端点，所以只在前端清除token
    console.log('用户已退出登录');
  } catch (error) {
    console.error('退出登录失败:', error);
  }
};

/**
 * 验证token有效性
 */
export const verifyToken = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await apiRequestWithAuth<{
      success: boolean;
      data: User;
    }>('/auth/me', token, {
      method: 'GET'
    });

    return {
      success: response.success,
      message: 'token验证成功',
      data: {
        user: response.data,
        token,
        expiresIn: 24 * 60 * 60
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'token验证失败'
    };
  }
};

/**
 * 忘记密码服务（预留）
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: 实现忘记密码API调用
    console.log('忘记密码请求:', email);
    return {
      success: true,
      message: '重置密码链接已发送到您的邮箱'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '请求失败，请稍后重试'
    };
  }
};

/**
 * 重置密码服务（预留）
 */
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: 实现重置密码API调用
    console.log('重置密码请求:', token.substring(0, 20) + '...', '新密码长度:', newPassword.length);
    return {
      success: true,
      message: '密码重置成功'
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : '重置失败，请稍后重试'
    };
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = async (token: string): Promise<User | null> => {
  try {
    const response = await apiRequestWithAuth<{
      success: boolean;
      data: User;
    }>('/auth/me', token, {
      method: 'GET'
    });

    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

export const authService = {
  login,
  register,
  logout,
  verifyToken,
  forgotPassword,
  resetPassword,
  exchangeGitHubCode,
  getCurrentUser
};