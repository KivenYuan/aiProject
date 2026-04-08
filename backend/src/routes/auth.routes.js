/**
 * 用户认证路由
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { getAxiosProxyConfig, getProxyUrl } = require('../utils/proxy-agent');

const GITHUB_CONNECT_TIMEOUT_MS = Number(process.env.GITHUB_CONNECT_TIMEOUT_MS || 10000);
const GITHUB_RETRY_TIMES = Number(process.env.GITHUB_RETRY_TIMES || 2);
const GITHUB_RETRY_BASE_DELAY_MS = Number(process.env.GITHUB_RETRY_BASE_DELAY_MS || 300);

const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENOTFOUND',
  'EHOSTUNREACH',
  'ENETUNREACH'
]);

function isRetryableGitHubError(error) {
  if (!error) {
    return false;
  }
  if (RETRYABLE_NETWORK_ERROR_CODES.has(error.code)) {
    return true;
  }
  const status = error.response?.status;
  return status === 502 || status === 503 || status === 504;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withGitHubRetry(label, requestFn) {
  const maxAttempts = Math.max(1, GITHUB_RETRY_TIMES + 1);
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (!isRetryableGitHubError(error) || attempt === maxAttempts) {
        throw error;
      }
      const delayMs = GITHUB_RETRY_BASE_DELAY_MS * Math.pow(3, attempt - 1);
      console.warn(
        `[GitHub OAuth] ${label} 第 ${attempt}/${maxAttempts} 次失败，${delayMs}ms 后重试:`,
        error.code || error.response?.status || error.name,
        error.message
      );
      await sleep(delayMs);
    }
  }
  throw lastError;
}

// 临时内存存储（开发用，生产环境应使用数据库）
const users = new Map();

// 模拟数据库中的默认用户（开发用）
users.set('demo@example.com', {
  id: '1',
  email: 'demo@example.com',
  password: bcrypt.hashSync('Demo@123', 10), // 密码已加密
  name: '演示用户',
  avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=random',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空'
      });
    }

    // 查找用户（模拟数据库查询）
    const user = users.get(email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或密码错误'
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或密码错误'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 验证输入
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空'
      });
    }

    // 检查用户是否已存在
    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 密码强度检查（示例）
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '密码长度至少6位'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建新用户
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email.split('@')[0])}&background=random`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 保存用户（模拟数据库存储）
    users.set(email, newUser);
    console.log(`新用户注册: ${email} (ID: ${userId})`);

    // 生成JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 移除密码字段
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * GitHub OAuth token交换（后端代理）
 * POST /api/auth/github
 * 
 * 重要：后端代理保护client_secret，前端不应直接调用GitHub OAuth
 */
router.post('/github', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少授权码(code)'
      });
    }

    const missingEnv = ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'GITHUB_REDIRECT_URI', 'JWT_SECRET'].filter(
      (k) => !process.env[k]
    );
    if (missingEnv.length > 0) {
      console.error('GitHub OAuth: 缺少环境变量', missingEnv.join(', '));
      return res.status(503).json({
        success: false,
        message: `服务器未配置 OAuth/JWT 环境变量: ${missingEnv.join(', ')}`
      });
    }

    console.log('处理GitHub OAuth回调，code长度:', code.length);

    // 配置GitHub OAuth参数
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI
    });

    // 调用GitHub OAuth接口获取access_token
    const tokenResponse = await withGitHubRetry('交换 access_token', () =>
      axios.post(
        'https://github.com/login/oauth/access_token',
        params.toString(),
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: GITHUB_CONNECT_TIMEOUT_MS,
          ...getAxiosProxyConfig()
        }
      )
    );

    const { access_token, error, error_description } = tokenResponse.data;

    if (error) {
      console.error('GitHub OAuth错误:', error, error_description);
      return res.status(400).json({
        success: false,
        message: `GitHub授权失败: ${error_description || error}`
      });
    }

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: '未收到 GitHub 访问令牌：授权码通常只能使用一次，请关闭旧页面后重新点击「使用 GitHub 登录」'
      });
    }

    console.log('成功获取GitHub访问令牌，长度:', access_token.length);

    // 使用access_token获取GitHub用户信息
    const userResponse = await withGitHubRetry('获取 GitHub 用户信息', () =>
      axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Frontend-Backend'
        },
        timeout: GITHUB_CONNECT_TIMEOUT_MS,
        ...getAxiosProxyConfig()
      })
    );

    const githubUser = userResponse.data;

    // 为GitHub用户创建或更新本地用户记录
    let user = users.get(githubUser.email || `${githubUser.login}@github.com`);
    
    if (!user) {
      // 创建新用户
      const userId = `github_${githubUser.id}`;
      user = {
        id: userId,
        email: githubUser.email || `${githubUser.login}@github.com`,
        name: githubUser.name || githubUser.login,
        avatar: githubUser.avatar_url,
        githubId: githubUser.id,
        githubLogin: githubUser.login,
        githubToken: access_token,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.set(user.email, user);
    } else {
      // 更新现有用户的GitHub信息
      user.githubToken = access_token;
      user.updatedAt = new Date().toISOString();
      users.set(user.email, user);
    }

    // 生成本地JWT token（用于前端认证）
    const localToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        githubId: githubUser.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 移除敏感字段
    const { githubToken, ...userWithoutToken } = user;

    res.json({
      success: true,
      message: 'GitHub登录成功',
      data: {
        user: userWithoutToken,
        token: localToken,
        githubToken: access_token // 返回给前端用于GitHub API调用
      }
    });

  } catch (error) {
    const errCode = error.code || '';
    const errName = error.name || '';
    const errMsg  = error.message || '';
    console.error('GitHub OAuth处理错误:', errCode || errName, errMsg);
    if (error.stack) {
      console.error('GitHub OAuth错误堆栈:', error.stack);
    }

    if (error.response) {
      const status = error.response.status;
      const data   = error.response.data;
      console.error('GitHub API响应错误:', status, JSON.stringify(data));

      if (status === 400) {
        return res.status(400).json({
          success: false,
          message: '无效的GitHub授权码，授权码可能已过期或已被使用，请重新点击「使用 GitHub 登录」'
        });
      }

      if (status === 401) {
        return res.status(401).json({
          success: false,
          message: 'GitHub 访问令牌无效或已过期，请重新进行 GitHub OAuth 登录'
        });
      }

      if (status === 403) {
        return res.status(403).json({
          success: false,
          message: 'GitHub API 请求被拒绝（可能触发了速率限制），请稍后再试'
        });
      }

      if (status === 422) {
        return res.status(400).json({
          success: false,
          message: `GitHub 返回参数错误 (422)：${typeof data === 'object' ? JSON.stringify(data) : data}`
        });
      }

      return res.status(502).json({
        success: false,
        message: `GitHub API 返回异常状态码 ${status}，请稍后再试`
      });
    }

    if (errCode === 'ENOTFOUND' || errCode === 'EAI_AGAIN') {
      return res.status(503).json({
        success: false,
        message:
          'DNS 无法解析 GitHub 域名（getaddrinfo ENOTFOUND）。本机网络/DNS 无法解析 api.github.com。' +
          ' 请将系统 DNS 改为 8.8.8.8 或 1.1.1.1，或开启 VPN/全局代理；' +
          ' 若在 .env 中配置了 HTTPS_PROXY，请确认代理软件已开启且端口正确。'
      });
    }

    if (errCode === 'ECONNRESET' || errCode === 'ETIMEDOUT' || errCode === 'ECONNREFUSED' ||
        errCode === 'ECONNABORTED' || errCode === 'EHOSTUNREACH' || errCode === 'ENETUNREACH' ||
        errCode === 'EPROTO' || errCode === 'ERR_SOCKET_CLOSED' ||
        errCode === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      const proxyHint = getProxyUrl()
        ? `（当前 HTTPS_PROXY = ${getProxyUrl().replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:***@')}，请确认代理软件已开启且端口正确）`
        : '（未配置 HTTPS_PROXY）';
      return res.status(503).json({
        success: false,
        message: `无法连接 GitHub (${errCode})，请检查服务器网络${proxyHint}`
      });
    }

    if (errName === 'JsonWebTokenError' || /secret|jwt/i.test(errMsg)) {
      return res.status(500).json({
        success: false,
        message: '签发登录令牌失败，请确认已配置有效的 JWT_SECRET'
      });
    }

    const safeDetail = `[${errCode || errName || 'UnknownError'}] ${errMsg}`;
    res.status(500).json({
      success: false,
      message: `GitHub授权处理失败: ${safeDetail}`
    });
  }
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 * 需要JWT认证
 */
router.get('/me', (req, res) => {
  try {
    // 从Authorization头获取token（简化版，实际应使用中间件）
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);
    
    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 查找用户
    const user = Array.from(users.values()).find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 移除敏感字段
    const { password, githubToken, ...userWithoutSensitive } = user;

    res.json({
      success: true,
      data: userWithoutSensitive
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期'
      });
    }
    
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

module.exports = router;