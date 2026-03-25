/**
 * 用户认证相关类型定义
 */

// 用户基本信息
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// 登录请求参数
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 注册请求参数
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

// 认证响应
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    expiresIn: number;
  };
  errors?: Record<string, string[]>;
}

// 认证状态
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// 认证上下文类型
export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// 本地存储键名
export const AUTH_KEYS = {
  TOKEN: 'ai_frontend_auth_token',
  USER: 'ai_frontend_auth_user',
  EXPIRES_AT: 'ai_frontend_auth_expires_at',
} as const;