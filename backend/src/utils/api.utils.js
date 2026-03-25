/**
 * API工具函数
 */

/**
 * 标准化API响应
 * @param {boolean} success - 是否成功
 * @param {string} message - 响应消息
 * @param {any} data - 响应数据
 * @param {number} statusCode - HTTP状态码
 * @returns {object} 标准化响应对象
 */
function createApiResponse(success = true, message = '', data = null, statusCode = 200) {
  return {
    success,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString()
  };
}

/**
 * 成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 * @returns {object} 成功响应对象
 */
function successResponse(data = null, message = '操作成功') {
  return createApiResponse(true, message, data, 200);
}

/**
 * 错误响应
 * @param {string} message - 错误消息
 * @param {number} statusCode - HTTP状态码
 * @param {any} data - 额外错误数据
 * @returns {object} 错误响应对象
 */
function errorResponse(message = '操作失败', statusCode = 500, data = null) {
  return createApiResponse(false, message, data, statusCode);
}

/**
 * 验证请求参数
 * @param {object} params - 请求参数对象
 * @param {string[]} requiredFields - 必需字段数组
 * @returns {string|null} 错误消息，如果验证通过则返回null
 */
function validateRequiredParams(params, requiredFields) {
  for (const field of requiredFields) {
    if (params[field] === undefined || params[field] === null || params[field] === '') {
      return `缺少必需参数: ${field}`;
    }
  }
  return null;
}

/**
 * 验证电子邮件格式
 * @param {string} email - 电子邮件地址
 * @returns {boolean} 是否有效
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @param {object} options - 验证选项
 * @returns {object} 验证结果 {valid: boolean, errors: string[]}
 */
function validatePassword(password, options = {}) {
  const errors = [];
  const {
    minLength = 6,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = false
  } = options;

  if (password.length < minLength) {
    errors.push(`密码长度至少需要${minLength}位`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码必须包含至少一个大写字母');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码必须包含至少一个小写字母');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('密码必须包含至少一个数字');
  }

  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含至少一个特殊字符');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 安全地获取环境变量
 * @param {string} key - 环境变量键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 环境变量值
 */
function getEnv(key, defaultValue = null) {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue === null) {
      throw new Error(`必需的环境变量 ${key} 未设置`);
    }
    return defaultValue;
  }
  
  return value;
}

/**
 * 异步重试函数
 * @param {Function} fn - 需要重试的函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delayMs - 重试延迟(毫秒)
 * @param {Function} shouldRetry - 判断是否应该重试的函数
 * @returns {Promise<any>} 函数执行结果
 */
async function retry(fn, maxRetries = 3, delayMs = 1000, shouldRetry = null) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (shouldRetry && !shouldRetry(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.log(`重试 ${attempt}/${maxRetries}，延迟 ${delayMs}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5; // 指数退避
      }
    }
  }
  
  throw lastError;
}

/**
 * 计算分页信息
 * @param {number} totalItems - 总项目数
 * @param {number} currentPage - 当前页码
 * @param {number} pageSize - 每页大小
 * @returns {object} 分页信息
 */
function calculatePagination(totalItems, currentPage = 1, pageSize = 20) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const page = Math.max(1, Math.min(currentPage, totalPages || 1));
  const offset = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    offset,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

module.exports = {
  createApiResponse,
  successResponse,
  errorResponse,
  validateRequiredParams,
  isValidEmail,
  validatePassword,
  generateRandomString,
  getEnv,
  retry,
  calculatePagination
};