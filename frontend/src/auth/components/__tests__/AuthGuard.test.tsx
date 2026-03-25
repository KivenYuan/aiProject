/**
 * @feature F-002
 * @test-category 组件测试
 * @priority P1
 * 
 * 测试 AuthGuard 组件
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthGuard from '../AuthGuard';

// 模拟 useAuth hook
const mockUseAuth = jest.fn();
const mockNavigate = jest.fn();

// 模拟 react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, state, replace }: { to: string; state?: unknown; replace?: boolean }) => {
    mockNavigate({ to, state, replace });
    return <div data-testid="navigate-component">Navigating to {to}</div>;
  },
  useLocation: () => ({
    pathname: '/test',
    search: '',
    hash: '',
    state: null,
    key: 'test-key'
  })
}));

// 模拟 AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

describe('AuthGuard', () => {
  const TestChild = () => <div data-testid="test-child">Protected Content</div>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('加载状态', () => {
    test('应在加载中时显示加载指示器', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true
      });

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(screen.getByText('加载中...')).toBeInTheDocument();
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    });
  });

  describe('需要认证的页面 (requireAuth=true)', () => {
    test('应允许已认证用户访问', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    test('应将未认证用户重定向到登录页', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <AuthGuard>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        state: { from: expect.objectContaining({ pathname: '/test' }) },
        replace: true
      });
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    });

    test('应使用自定义重定向路径', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <AuthGuard redirectTo="/custom-login">
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/custom-login',
        state: { from: expect.objectContaining({ pathname: '/test' }) },
        replace: true
      });
    });
  });

  describe('需要未登录状态的页面 (requireAuth=false)', () => {
    test('应允许未认证用户访问', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <AuthGuard requireAuth={false}>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
    });

    test('应将已认证用户重定向到仪表板', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <AuthGuard requireAuth={false}>
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/dashboard',
        state: undefined,
        replace: true
      });
      expect(screen.queryByTestId('test-child')).not.toBeInTheDocument();
    });

    test('应使用自定义重定向路径', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false
      });

      render(
        <MemoryRouter>
          <AuthGuard requireAuth={false} redirectTo="/home">
            <TestChild />
          </AuthGuard>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/home',
        state: undefined,
        replace: true
      });
    });
  });

  describe('集成测试 - 路由保护', () => {
    test('应正确保护路由', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false
      });

      const ProtectedPage = () => <div>Protected Page</div>;
      const LoginPage = () => <div>Login Page</div>;

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/protected" element={
              <AuthGuard>
                <ProtectedPage />
              </AuthGuard>
            } />
          </Routes>
        </MemoryRouter>
      );

      // 因为用户未认证，应被重定向到登录页
      // 注意：在测试环境中 Navigate 组件不会实际改变路由
      // 但我们验证了 navigate 被调用
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});