import {
  authService,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyToken,
} from '../authService';
import type { LoginRequest, RegisterRequest } from '../../types/auth.types';

const mockFetch = jest.fn();

beforeEach(() => {
  (global as { fetch?: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;
  mockFetch.mockReset();
});

describe('authService', () => {
  test('login should return success when API succeeds', async () => {
    const credentials: LoginRequest = { email: 'demo@example.com', password: 'Demo@123' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: '登录成功',
        data: {
          user: { id: '1', email: credentials.email, name: 'Demo' },
          token: 'token-1',
        },
      }),
    });

    const result = await login(credentials);
    expect(result.success).toBe(true);
    expect(result.data?.token).toBe('token-1');
  });

  test('login should return error message when API fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: '用户不存在或密码错误' }),
    });

    const result = await login({ email: 'a@b.com', password: 'bad' });
    expect(result.success).toBe(false);
    expect(result.message).toBe('用户不存在或密码错误');
  });

  test('register should return success when API succeeds', async () => {
    const payload: RegisterRequest = {
      email: 'new@example.com',
      password: 'ValidPass1',
      name: 'New User',
    };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: '注册成功',
        data: {
          user: { id: '2', email: payload.email, name: payload.name },
          token: 'token-2',
        },
      }),
    });

    const result = await register(payload);
    expect(result.success).toBe(true);
    expect(result.data?.user.email).toBe(payload.email);
  });

  test('verifyToken should return parsed user data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { id: '1', email: 'demo@example.com', name: 'Demo' },
      }),
    });

    const result = await verifyToken('token-ok');
    expect(result.success).toBe(true);
    expect(result.data?.user.email).toBe('demo@example.com');
  });

  test('logout should not throw', async () => {
    await expect(logout()).resolves.toBeUndefined();
  });

  test('forgotPassword should return success message', async () => {
    const result = await forgotPassword('user@example.com');
    expect(result.success).toBe(true);
    expect(result.message).toBe('重置密码链接已发送到您的邮箱');
  });

  test('resetPassword should return success message', async () => {
    const result = await resetPassword('token', 'ValidPass1');
    expect(result.success).toBe(true);
    expect(result.message).toBe('密码重置成功');
  });

  test('authService should expose expected functions', () => {
    expect(authService.login).toBe(login);
    expect(authService.register).toBe(register);
    expect(authService.logout).toBe(logout);
    expect(authService.verifyToken).toBe(verifyToken);
    expect(authService.forgotPassword).toBe(forgotPassword);
    expect(authService.resetPassword).toBe(resetPassword);
  });
});