// 导入 @testing-library/jest-dom 的扩展断言
import '@testing-library/jest-dom';

// 全局的测试配置
beforeEach(() => {
  // 可以在每个测试前重置某些全局状态
  // 例如：清除 localStorage、重置 mock 等
});

afterEach(() => {
  // 在每个测试后清理
  // 例如：清除所有模拟、恢复原始实现等
});

// 全局的测试辅助函数
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 兼容旧版本
    removeListener: jest.fn(), // 兼容旧版本
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// 添加 TextEncoder 和 TextDecoder 的 polyfill
if (typeof global.TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// 模拟 console 方法（可选）
// 可以在测试中监视 console 调用
global.console = {
  ...console,
  // 可以重定向某些 console 方法到 jest.fn()
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};