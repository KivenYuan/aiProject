/**
 * GitHub 数据上下文
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GitHubContextType, GitHubStats, GitHubUser } from '../types/github.types';
import { createGitHubServiceAuto } from '../services/githubService';
import { authService } from '../../auth/services/authService';
import { useAuth } from '../../auth/contexts/AuthContext';
import { setAuth } from '../../auth/utils/auth.utils';
import { 
  getTokenFromStorage, 
  getGitHubAccessToken,
  saveTokenToStorage, 
  clearTokenFromStorage,
  saveGitHubAccessToken,
  generateOAuthUrl,
  isGitHubOAuthConfigured,
  handleGitHubError,
  isTokenValid
} from '../utils/github.utils';

// 创建上下文
const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

// 自定义钩子
export function useGitHub() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHub必须在GitHubProvider内部使用');
  }
  return context;
}

// Provider组件属性
interface GitHubProviderProps {
  children: ReactNode;
}

// Provider组件
export function GitHubProvider({ children }: GitHubProviderProps) {
  const navigate = useNavigate();
  const auth = useAuth(); // 访问AuthContext
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化：从本地存储加载token
  useEffect(() => {
    const savedToken = getTokenFromStorage();
    if (savedToken && isTokenValid(savedToken)) {
      setToken(savedToken);
      loadUserData(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // 加载用户数据
  const loadUserData = async (userToken: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 真实JWT模式下必须有GitHub access token，避免静默失败
      const isDevToken = userToken.startsWith('github_dev_token_');
      const githubAccessToken = getGitHubAccessToken();
      if (!isDevToken && !githubAccessToken) {
        throw new Error('未找到GitHub访问令牌，请重新进行GitHub OAuth授权');
      }

      // 自动选择真实或模拟服务
      const service = createGitHubServiceAuto(userToken);
      const userData = await service.getUser();
      setUser(userData);
      
      // 加载统计信息（可以延迟加载）
      loadStats(userToken);
    } catch (err: any) {
      console.error('加载用户数据失败:', err);
      setError(handleGitHubError(err));
      
      // token无效，清除
      if (err.status === 401) {
        setToken(null);
        clearTokenFromStorage();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 加载统计信息
  const loadStats = async (userToken: string) => {
    try {
      const service = createGitHubServiceAuto(userToken);
      
      // 检查是否有getDashboardStats方法
      if ('getDashboardStats' in service && typeof service.getDashboardStats === 'function') {
        const statsData = await service.getDashboardStats();
        setStats(statsData);
      } else {
        console.warn('GitHub服务不支持getDashboardStats方法');
      }
    } catch (err: any) {
      console.error('加载统计信息失败:', err);
      // 不设置错误，因为主用户数据已加载
    }
  };

  // GitHub OAuth登录（通过后端代理）
  const login = async (code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('GitHub OAuth登录，code长度:', code.length);
      
      // 通过后端代理交换code获取JWT token
      const { user: authUser, token: jwtToken, githubToken } = await authService.exchangeGitHubCode(code);
      
      console.log('GitHub登录成功，获取JWT token:', jwtToken.substring(0, 20) + '...');
      
      // 更新AuthContext状态
      if (auth.isAuthenticated === false) {
        // 使用setAuth函数保存用户信息和token
        // 这样AuthContext就能检测到登录状态
        console.log('GitHub登录：保存用户认证信息');
        setAuth(authUser, jwtToken);
        
        // 触发AuthContext重新检查认证状态
        // AuthContext的useEffect会监听storage事件
        window.dispatchEvent(new Event('storage'));
      }
      
      // 保存token（GitHubContext使用）
      setToken(jwtToken);
      saveTokenToStorage(jwtToken);
      if (githubToken) {
        saveGitHubAccessToken(githubToken);
      }
      
      // 加载用户数据
      await loadUserData(jwtToken);

      // OAuth 回调路由是静态 loading，完成后必须离开，否则会一直转圈
      if (window.location.pathname.includes('/auth/github/callback')) {
        navigate('/dashboard', { replace: true });
      }
      
      console.log('🎉 GitHub登录完成，用户数据已加载');
      
    } catch (err: any) {
      console.error('GitHub登录失败:', err);
      setError(handleGitHubError(err));
      setIsLoading(false);
    }
  };

  // 开发模式登录（使用模拟数据）
  const loginDev = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 生成模拟token
      const mockToken = `github_dev_token_${Math.random().toString(36).substring(2)}_${Date.now().toString(36)}`;
      
      // 保存token
      setToken(mockToken);
      saveTokenToStorage(mockToken);
      
      // 加载模拟用户数据
      await loadUserData(mockToken);
      
      console.log('🎮 开发模式：使用模拟GitHub数据');
      console.log('💡 提示：生产环境需要配置GitHub OAuth和真实后端API');
    } catch (err: any) {
      console.error('开发模式登录失败:', err);
      setError('开发模式登录失败: ' + (err.message || '未知错误'));
      setIsLoading(false);
    }
  };

  // 退出登录
  const logout = () => {
    setToken(null);
    setUser(null);
    setStats(null);
    clearTokenFromStorage();
  };

  // 刷新数据
  const refresh = async () => {
    if (!token) return;
    await loadUserData(token);
  };

  // 开始GitHub OAuth流程（重定向到GitHub）
  const startOAuth = () => {
    if (!isGitHubOAuthConfigured()) {
      setError(
        '未配置 GitHub OAuth：请在 frontend/.env.local 中设置 VITE_GITHUB_CLIENT_ID（见 .env.example），保存后重启前端 dev。'
      );
      return;
    }
    window.location.href = generateOAuthUrl();
  };

  /**
   * OAuth code 只能用一次；刷新会重复请求导致失败。
   * 先去掉地址栏里的 code，并用 sessionStorage 防止 Strict Mode 重复执行。
   */
  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const oauthError = urlParams.get('error');

    if (oauthError) {
      setError(`GitHub授权错误: ${oauthError}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return false;
    }

    if (!code) return false;

    const dedupeKey = `gh_oauth_processed_${code}`;
    if (sessionStorage.getItem(dedupeKey) === '1') {
      window.history.replaceState({}, document.title, window.location.pathname);
      return false;
    }
    sessionStorage.setItem(dedupeKey, '1');
    window.history.replaceState({}, document.title, window.location.pathname);

    await login(code);
    return true;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      void handleOAuthCallback();
      return;
    }
    if (!params.get('code')) return;
    void handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅处理首次进入时的回调 URL
  }, []);

  // 上下文值
  const contextValue: GitHubContextType = {
    token,
    user,
    stats,
    isLoading,
    error,
    login,
    loginDev,
    logout,
    refresh,
    startOAuth,
    handleOAuthCallback
  };

  return (
    <GitHubContext.Provider value={contextValue}>
      {children}
    </GitHubContext.Provider>
  );
}

// OAuth相关辅助函数
export const GitHubOAuth = {
  start: generateOAuthUrl,
  handleCallback: () => {
    // 这里需要访问上下文，所以实际实现依赖于Provider
    console.warn('GitHubOAuth.handleCallback需要在GitHubProvider内部使用');
  }
};

export default GitHubContext;