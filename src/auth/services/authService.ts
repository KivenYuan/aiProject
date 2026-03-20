/**
 * 认证API服务
 * 注意：当前使用模拟数据，实际开发中应替换为真实的API调用
 */
/**
 * 认证API服务
 * 注意：当前使用模拟数据，实际开发中应替换为真实的API调用
 */
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';
import { generateMockUser } from '../utils/auth.utils';

// API基础URL（从环境变量获取）
const API_BASE = import.meta.env.VITE_AUTH_API_BASE || 'http://localhost:3000/api/auth';

// 模拟延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户数据库（仅用于演示）
const mockUsers = [
  {
    email: 'demo@example.com',
    password: 'Demo@123', // 仅用于演示，实际中应加密存储
    user: generateMockUser(),
  },
];

// 查找模拟用户
const findMockUser = (email: string) => {
  return mockUsers.find(user => user.email === email);
};

// 生成模拟token
const generateMockToken = (): string => {
  return 'mock_jwt_token_' + Math.random().toString(36).substr(2) + '_' + Date.now();
};

// 登录服务
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // 模拟API延迟
  await delay(800);

  const { email, password } = credentials;

  // 验证输入
  if (!email || !password) {
    return {
      success: false,
      message: '邮箱和密码不能为空',
    };
  }

  // 模拟用户查找和验证
  const mockUser = findMockUser(email);
  if (!mockUser) {
    return {
      success: false,
      message: '用户不存在',
    };
  }

  if (mockUser.password !== password) {
    return {
      success: false,
      message: '密码错误',
    };
  }

  // 模拟成功响应
  const token = generateMockToken();
  const user = mockUser.user;

  return {
    success: true,
    message: '登录成功',
    data: {
      user,
      token,
      expiresIn: 24 * 60 * 60, // 24小时
    },
  };
};

// 注册服务
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  // 模拟API延迟
  await delay(1000);

  const { email, password, name } = data;

  // 验证输入
  if (!email || !password) {
    return {
      success: false,
      message: '邮箱和密码不能为空',
    };
  }

  // 检查用户是否已存在
  if (findMockUser(email)) {
    return {
      success: false,
      message: '该邮箱已被注册',
    };
  }

  // 验证密码强度（在实际中应由后端验证）
  if (password.length < 8) {
    return {
      success: false,
      message: '密码至少需要8个字符',
    };
  }

  // 创建新用户
  const newUser: User = {
    id: 'user_' + Math.random().toString(36).substr(2, 9),
    email,
    name: name || email.split('@')[0],
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 添加到模拟数据库
  mockUsers.push({
    email,
    password, // 注意：实际中应加密存储
    user: newUser,
  });

  // 模拟成功响应
  const token = generateMockToken();

  return {
    success: true,
    message: '注册成功',
    data: {
      user: newUser,
      token,
      expiresIn: 24 * 60 * 60,
    },
  };
};

// 退出登录服务
export const logout = async (): Promise<void> => {
  // 模拟API延迟
  await delay(300);
  // 在实际应用中，这里可以调用后端API使token失效
  console.log('用户已退出登录');
};

// 验证token服务（可用于检查token是否有效）
export const verifyToken = async (token: string): Promise<AuthResponse> => {
  // 模拟API延迟
  await delay(500);

  if (!token || !token.startsWith('mock_jwt_token_')) {
    return {
      success: false,
      message: '无效的token',
    };
  }

  // 模拟成功验证
  const mockUser = mockUsers[0].user; // 使用第一个模拟用户

  return {
    success: true,
    message: 'token验证成功',
    data: {
      user: mockUser,
      token,
      expiresIn: 24 * 60 * 60,
    },
  };
};

// 忘记密码服务（预留）
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  await delay(800);
  return {
    success: true,
    message: '重置密码链接已发送到您的邮箱（模拟）',
  };
};

// 重置密码服务（预留）
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  await delay(800);
  return {
    success: true,
    message: '密码重置成功（模拟）',
  };
};

export const authService = {
  login,
  register,
  logout,
  verifyToken,
  forgotPassword,
  resetPassword,
};