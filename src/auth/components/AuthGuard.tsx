import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean; // 是否需要认证（true: 需要登录，false: 需要未登录）
  redirectTo?: string;   // 重定向路径
}

/**
 * 认证守卫组件
 * 
 * 用法：
 * 1. 保护需要登录的页面：
 *    <AuthGuard>
 *      <ProtectedPage />
 *    </AuthGuard>
 * 
 * 2. 保护登录/注册页面（已登录用户不允许访问）：
 *    <AuthGuard requireAuth={false} redirectTo="/dashboard">
 *      <LoginPage />
 *    </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  redirectTo,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果页面需要认证但用户未登录
  if (requireAuth && !isAuthenticated) {
    const to = redirectTo || '/login';
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  // 如果页面需要未登录状态但用户已登录
  if (!requireAuth && isAuthenticated) {
    const to = redirectTo || '/dashboard';
    return <Navigate to={to} replace />;
  }

  // 权限检查通过，渲染子组件
  return <>{children}</>;
};

export default AuthGuard;