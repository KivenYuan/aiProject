/**
 * @feature F-002
 * @test-category 单元测试
 * @priority P1
 * 
 * 测试 authService.ts 中的认证服务函数
 */
import { 
  login, 
  register, 
  logout, 
  verifyToken, 
  forgotPassword, 
  resetPassword,
  authService 
} from '../authService';
import type { LoginRequest, RegisterRequest } from '../../types/auth.types';

// 模拟 import.meta.env
const mockImportMeta = {
  env: {
    VITE_AUTH_API_BASE: 'http://localhost:3000/api/auth'
  }
};

// 模拟定时器
jest.useFakeTimers();

beforeEach(() => {
  // 重置模拟的 import.meta
  (global as Record<string, unknown>).import = { meta: mockImportMeta };
});

afterEach(() => {
  jest.clearAllTimers();
  delete (global as Record<string, unknown>).import;
});

describe('authService - 认证服务', () => {
  describe('login', () => {
    test('应使用有效凭证成功登录', async () => {
      const credentials: LoginRequest = {
        email: 'demo@example.com',
        password: 'Demo@123'
      };

      const promise = login(credentials);
      
      // 快速推进定时器以跳过延迟
      jest.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('登录成功');
      expect(result.data).toBeDefined();
      expect(result.data?.user.email).toBe('demo@example.com');
      expect(result.data?.token).toMatch(/^mock_jwt_token_/);
    });

    test('应拒绝空邮箱或密码', async () => {
      const testCases = [
        { email: '', password: 'Demo@123', expected: '邮箱和密码不能为空' },
        { email: 'demo@example.com', password: '', expected: '邮箱和密码不能为空' },
        { email: '', password: '', expected: '邮箱和密码不能为空' }
      ];

      for (const { email, password, expected } of testCases) {
        const credentials: LoginRequest = { email, password };
        const promise = login(credentials);
        jest.advanceTimersByTime(1000);
        const result = await promise;
        
        expect(result.success).toBe(false);
        expect(result.message).toBe(expected);
      }
    });

    test('应拒绝不存在的用户', async () => {
      const credentials: LoginRequest = {
        email: 'nonexistent@example.com',
        password: 'Demo@123'
      };

      const promise = login(credentials);
      jest.advanceTimersByTime(1000);
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('用户不存在');
    });

    test('应拒绝错误密码', async () => {
      const credentials: LoginRequest = {
        email: 'demo@example.com',
        password: 'WrongPassword'
      };

      const promise = login(credentials);
      jest.advanceTimersByTime(1000);
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('密码错误');
    });
  });

  describe('register', () => {
    test('应成功注册新用户', async () => {
      const registerData: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'NewPassword123',
        name: 'New User'
      };

      const promise = register(registerData);
      jest.advanceTimersByTime(1500);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('注册成功');
      expect(result.data).toBeDefined();
      expect(result.data?.user.email).toBe('newuser@example.com');
      expect(result.data?.user.name).toBe('New User');
      expect(result.data?.token).toMatch(/^mock_jwt_token_/);
    });

    test('应拒绝已存在的邮箱', async () => {
      // 先确保演示用户存在
      const registerData: RegisterRequest = {
        email: 'demo@example.com',
        password: 'Demo@123',
        name: 'Duplicate User'
      };

      const promise = register(registerData);
      jest.advanceTimersByTime(1500);
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('该邮箱已被注册');
    });

    test('应拒绝弱密码', async () => {
      const registerData: RegisterRequest = {
        email: 'weakpass@example.com',
        password: 'short', // 少于8个字符
        name: 'Weak User'
      };

      const promise = register(registerData);
      jest.advanceTimersByTime(1500);
      const result = await promise;
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('密码至少需要8个字符');
    });

    test('应在未提供name时使用邮箱前缀作为用户名', async () => {
      const registerData: RegisterRequest = {
        email: 'noname@example.com',
        password: 'Password123'
        // 未提供 name
      };

      const promise = register(registerData);
      jest.advanceTimersByTime(1500);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.data?.user.name).toBe('noname'); // email前缀
    });
  });

  describe('logout', () => {
    test('应成功执行退出登录', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const promise = logout();
      jest.advanceTimersByTime(500);
      await promise;
      
      expect(consoleSpy).toHaveBeenCalledWith('用户已退出登录');
      consoleSpy.mockRestore();
    });
  });

  describe('verifyToken', () => {
    test('应验证有效的token', async () => {
      const validToken = 'mock_jwt_token_abc123_1234567890';
      
      const promise = verifyToken(validToken);
      jest.advanceTimersByTime(600);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('token验证成功');
      expect(result.data).toBeDefined();
      expect(result.data?.user.email).toBe('demo@example.com');
    });

    test('应拒绝无效的token', async () => {
      const invalidTokens = ['', 'invalid_token', 'other_token_123'];
      
      for (const token of invalidTokens) {
        const promise = verifyToken(token);
        jest.advanceTimersByTime(600);
        const result = await promise;
        
        expect(result.success).toBe(false);
        expect(result.message).toBe('无效的token');
      }
    });
  });

  describe('forgotPassword', () => {
    test('应发送重置密码邮件', async () => {
      const email = 'user@example.com';
      
      const promise = forgotPassword(email);
      jest.advanceTimersByTime(900);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('重置密码链接已发送到您的邮箱（模拟）');
    });
  });

  describe('resetPassword', () => {
    test('应重置密码', async () => {
      const token = 'reset_token_123';
      const newPassword = 'NewPassword123';
      
      const promise = resetPassword(token, newPassword);
      jest.advanceTimersByTime(900);
      const result = await promise;
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('密码重置成功（模拟）');
    });
  });

  describe('authService 对象导出', () => {
    test('应导出所有服务函数', () => {
      expect(authService).toHaveProperty('login');
      expect(authService).toHaveProperty('register');
      expect(authService).toHaveProperty('logout');
      expect(authService).toHaveProperty('verifyToken');
      expect(authService).toHaveProperty('forgotPassword');
      expect(authService).toHaveProperty('resetPassword');
      
      // 验证导出的函数是相同的引用
      expect(authService.login).toBe(login);
      expect(authService.register).toBe(register);
    });
  });
});