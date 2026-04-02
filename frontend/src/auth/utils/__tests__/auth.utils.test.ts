/**
 * @feature F-002
 * @test-category 单元测试
 * @priority P1
 * 
 * 测试 auth.utils.ts 中的工具函数
 */
import { 
  setAuth, 
  getToken, 
  getUser, 
  clearAuth, 
  isValidEmail, 
  validatePassword, 
  generateMockUser, 
  hasRole, 
  isAuthenticated 
} from '../auth.utils';
import type { User } from '../../types/auth.types';
import { AUTH_KEYS } from '../../types/auth.types';

// 模拟 localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

describe('auth.utils - 认证工具函数', () => {
  beforeEach(() => {
    // 在每个测试前清空模拟的 localStorage
    mockLocalStorage.clear();
    
    // 模拟全局 localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('setAuth', () => {
    test('应将用户信息和token保存到localStorage', () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      const mockToken = 'mock-jwt-token';

      setAuth(mockUser, mockToken);

      expect(localStorage.getItem(AUTH_KEYS.TOKEN)).toBe(mockToken);
      expect(localStorage.getItem(AUTH_KEYS.USER)).toBe(JSON.stringify(mockUser));
      expect(localStorage.getItem(AUTH_KEYS.EXPIRES_AT)).toBeDefined();
    });

    test('应处理localStorage错误', () => {
      // 模拟 localStorage.setItem 抛出错误
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      const mockToken = 'mock-jwt-token';

      // 不应抛出错误
      expect(() => setAuth(mockUser, mockToken)).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('getToken', () => {
    test('应从localStorage获取有效的token', () => {
      const mockToken = 'mock-jwt-token';
      const futureTime = new Date().getTime() + 1000000;
      
      localStorage.setItem(AUTH_KEYS.TOKEN, mockToken);
      localStorage.setItem(AUTH_KEYS.EXPIRES_AT, futureTime.toString());

      const token = getToken();
      expect(token).toBe(mockToken);
    });

    test('应在token过期时返回null并清除认证', () => {
      const mockToken = 'mock-jwt-token';
      const pastTime = new Date().getTime() - 1000;
      
      localStorage.setItem(AUTH_KEYS.TOKEN, mockToken);
      localStorage.setItem(AUTH_KEYS.EXPIRES_AT, pastTime.toString());

      const token = getToken();
      expect(token).toBeNull();
      expect(localStorage.getItem(AUTH_KEYS.TOKEN)).toBeNull();
    });

    test('应处理localStorage错误', () => {
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
        .mockImplementation(() => {
          throw new Error('Storage error');
        });

      const token = getToken();
      expect(token).toBeNull();

      getItemSpy.mockRestore();
    });
  });

  describe('getUser', () => {
    test('应从localStorage获取用户信息', () => {
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      };
      
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(mockUser));

      const user = getUser();
      expect(user).toEqual(mockUser);
    });

    test('应在用户信息不存在时返回null', () => {
      const user = getUser();
      expect(user).toBeNull();
    });

    test('应处理无效的JSON数据', () => {
      localStorage.setItem(AUTH_KEYS.USER, 'invalid-json');

      const user = getUser();
      expect(user).toBeNull();
    });
  });

  describe('clearAuth', () => {
    test('应清除所有认证信息', () => {
      // 先设置一些数据
      localStorage.setItem(AUTH_KEYS.TOKEN, 'token');
      localStorage.setItem(AUTH_KEYS.USER, 'user');
      localStorage.setItem(AUTH_KEYS.EXPIRES_AT, 'expires');

      clearAuth();

      expect(localStorage.getItem(AUTH_KEYS.TOKEN)).toBeNull();
      expect(localStorage.getItem(AUTH_KEYS.USER)).toBeNull();
      expect(localStorage.getItem(AUTH_KEYS.EXPIRES_AT)).toBeNull();
    });
  });

  describe('isValidEmail', () => {
    test('应验证有效的邮箱地址', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    test('应拒绝无效的邮箱格式', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    test('应接受符合要求的密码', () => {
      const validPasswords = [
        'Password123',
        'SecurePass456',
        'Admin@2024',
        'Aa123456'
      ];

      validPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
        expect(result.message).toBeUndefined();
      });
    });

    test('应拒绝不符合要求的密码', () => {
      const testCases = [
        { password: 'short', expected: '密码至少需要8个字符' },
        { password: 'nouppercase123', expected: '密码必须包含至少一个大写字母' },
        { password: 'NOLOWERCASE123', expected: '密码必须包含至少一个小写字母' },
        { password: 'NoNumbers', expected: '密码必须包含至少一个数字' }
      ];

      testCases.forEach(({ password, expected }) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(false);
        expect(result.message).toBe(expected);
      });
    });
  });

  describe('generateMockUser', () => {
    test('应生成有效的模拟用户数据', () => {
      const mockUser = generateMockUser();

      expect(mockUser).toHaveProperty('id');
      expect(mockUser.id).toMatch(/^user_/);
      expect(mockUser).toHaveProperty('email', 'demo@example.com');
      expect(mockUser).toHaveProperty('name', '访客用户');
      expect(mockUser).toHaveProperty('role', 'user');
      expect(mockUser).toHaveProperty('createdAt');
      expect(mockUser).toHaveProperty('updatedAt');
      expect(new Date(mockUser.createdAt).toString()).not.toBe('Invalid Date');
      expect(new Date(mockUser.updatedAt).toString()).not.toBe('Invalid Date');
    });
  });

  describe('hasRole', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    };

    test('应正确检查用户角色', () => {
      expect(hasRole(mockUser, 'admin')).toBe(true);
      expect(hasRole(mockUser, 'user')).toBe(false);
    });

    test('应在用户为null时返回false', () => {
      expect(hasRole(null, 'admin')).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    test('应在有有效token时返回true', () => {
      const futureTime = new Date().getTime() + 1000000;
      localStorage.setItem(AUTH_KEYS.TOKEN, 'valid-token');
      localStorage.setItem(AUTH_KEYS.EXPIRES_AT, futureTime.toString());

      expect(isAuthenticated()).toBe(true);
    });

    test('应在token过期时返回false', () => {
      const pastTime = new Date().getTime() - 1000;
      localStorage.setItem(AUTH_KEYS.TOKEN, 'expired-token');
      localStorage.setItem(AUTH_KEYS.EXPIRES_AT, pastTime.toString());

      expect(isAuthenticated()).toBe(false);
    });

    test('应在无token时返回false', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });
});