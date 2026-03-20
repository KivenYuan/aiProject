import React, { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { AuthState, AuthContextType, User, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authService } from '../services/authService';
import { clearAuth, getToken, getUser, setAuth } from '../utils/auth.utils';

// 初始状态
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // 初始加载检查本地存储
  error: null,
};

// Action类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

// Reducer函数
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// 创建Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider组件
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 初始化时检查本地存储中的认证信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          // 验证token是否有效（这里可以添加token过期检查）
          const user = getUser();
          if (user) {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          } else {
            // 如果有token但没有用户信息，尝试获取用户信息
            // 这里可以调用API获取用户信息
            clearAuth();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } else {
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, []);

  // 登录函数
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.login(credentials);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuth(user, token);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '登录过程中发生未知错误';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  // 注册函数
  const register = async (data: RegisterRequest) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await authService.register(data);
      if (response.success && response.data) {
        const { user, token } = response.data;
        setAuth(user, token);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || '注册失败');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '注册过程中发生未知错误';
      dispatch({ type: 'AUTH_FAILURE', payload: message });
      throw error;
    }
  };

  // 退出登录函数
  const logout = () => {
    authService.logout();
    clearAuth();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // 清除错误函数
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// 自定义hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内使用');
  }
  return context;
};