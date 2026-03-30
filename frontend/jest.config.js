/** @type {import('jest').Config} */
const config = {
  // 使用 ts-jest 预设来处理 TypeScript
  preset: 'ts-jest',
  
  // 测试环境：jsdom（用于 React 组件测试）
  testEnvironment: 'jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}'
  ],
  
  // 测试忽略的目录
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  
  // 在每个测试文件执行之前运行的配置
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts'
  ],
  
  // 模块名映射（用于 CSS 模块和静态资源）
  moduleNameMapper: {
    // 处理 CSS/SCSS/SASS/Less 模块
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    
    // 处理图片等静态资源
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  
  // 转换配置
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.test.json',
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // 覆盖率配置
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.{ts,tsx}'
  ],
  
  // 覆盖率目录
  coverageDirectory: 'coverage',
  
  // 覆盖率阈值（可以根据项目要求调整）
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // 是否收集覆盖率信息
  collectCoverage: false,
  
  // 测试时显示详细信息
  verbose: true,
  
  // 测试超时时间
  testTimeout: 10000,
  
  // 转换忽略的 node_modules 中的某些包
  transformIgnorePatterns: [
    'node_modules/(?!(react-router-dom|@testing-library)/)'
  ],
  
  // 扩展名识别
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // 恢复模拟
  restoreMocks: true,
  clearMocks: true,
  resetMocks: true,
};

export default config;