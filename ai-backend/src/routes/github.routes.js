/**
 * GitHub API代理路由
 * 
 * 安全地代理GitHub API请求，保护访问令牌不暴露给前端
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getAxiosProxyConfig } = require('../utils/proxy-agent');

// 中间件：验证JWT并提取用户信息
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
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
    
    console.error('认证错误:', error);
    res.status(500).json({
      success: false,
      message: '认证处理失败'
    });
  }
};

// GitHub API基础URL
const GITHUB_API_BASE = 'https://api.github.com';

/**
 * 代理GitHub API请求的通用函数
 */
async function proxyGitHubRequest(req, res, endpoint, params = {}) {
  try {
    // 获取用户的GitHub token（实际应从数据库获取）
    // 这里简化处理，假设用户通过GitHub OAuth登录后，token存储在req.user中
    const githubToken = req.headers['x-github-token'] || req.user?.githubToken;
    
    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: '未找到GitHub访问令牌'
      });
    }

    // 构建GitHub API URL
    let url = `${GITHUB_API_BASE}${endpoint}`;
    
    // 添加查询参数
    const queryParams = new URLSearchParams({
      ...req.query,
      ...params
    }).toString();
    
    if (queryParams) {
      url += `?${queryParams}`;
    }

    console.log(`代理GitHub请求: ${req.method} ${url}`);

    // 发送请求到GitHub API
    const response = await axios({
      method: req.method,
      url,
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'AI-Frontend-Backend',
        ...(req.body && Object.keys(req.body).length > 0 && {
          'Content-Type': 'application/json'
        })
      },
      data: req.body,
      params: req.query,
      timeout: 10000,
      ...getAxiosProxyConfig()
    });

    // 转发GitHub API响应
    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('GitHub API代理错误:', error.message);

    if (error.response) {
      // GitHub API返回错误
      console.error('GitHub API响应错误:', error.response.status, error.response.data);
      
      // 转发GitHub API的错误响应
      res.status(error.response.status).json({
        success: false,
        message: `GitHub API错误: ${error.response.status}`,
        githubError: error.response.data
      });
    } else if (error.request) {
      // 请求发送但没有响应
      res.status(504).json({
        success: false,
        message: 'GitHub API请求超时或无响应'
      });
    } else {
      // 其他错误
      res.status(500).json({
        success: false,
        message: 'GitHub API代理失败'
      });
    }
  }
}

// ==================== GitHub用户信息端点 ====================

/**
 * 获取GitHub用户信息
 * GET /api/github/user
 */
router.get('/user', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, '/user');
});

/**
 * 获取GitHub用户仓库列表
 * GET /api/github/repos
 * 参数：type, sort, direction, per_page, page
 */
router.get('/repos', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, '/user/repos', {
    type: 'owner', // 默认只获取用户拥有的仓库
    sort: 'updated',
    direction: 'desc',
    per_page: 30
  });
});

/**
 * 获取特定用户的GitHub信息
 * GET /api/github/users/:username
 */
router.get('/users/:username', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, `/users/${req.params.username}`);
});

// ==================== GitHub仓库端点 ====================

/**
 * 获取特定仓库信息
 * GET /api/github/repos/:owner/:repo
 */
router.get('/repos/:owner/:repo', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, `/repos/${req.params.owner}/${req.params.repo}`);
});

/**
 * 获取仓库提交记录
 * GET /api/github/repos/:owner/:repo/commits
 */
router.get('/repos/:owner/:repo/commits', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, `/repos/${req.params.owner}/${req.params.repo}/commits`, {
    per_page: req.query.per_page || 20
  });
});

/**
 * 获取仓库事件
 * GET /api/github/repos/:owner/:repo/events
 */
router.get('/repos/:owner/:repo/events', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, `/repos/${req.params.owner}/${req.params.repo}/events`, {
    per_page: req.query.per_page || 30
  });
});

// ==================== GitHub活动端点 ====================

/**
 * 获取用户活动事件
 * GET /api/github/users/:username/events
 */
router.get('/users/:username/events', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, `/users/${req.params.username}/events`, {
    per_page: req.query.per_page || 30
  });
});

/**
 * 获取用户收到的事件
 * GET /api/github/users/:username/received_events
 */
router.get('/users/:username/received_events', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, `/users/${req.params.username}/received_events`, {
    per_page: req.query.per_page || 30
  });
});

// ==================== GitHub Issue/PR端点 ====================

/**
 * 获取用户创建的Issue
 * GET /api/github/issues
 */
router.get('/issues', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, '/issues', {
    filter: 'created',
    state: 'all',
    per_page: req.query.per_page || 20
  });
});

/**
 * 获取用户关联的Issue
 * GET /api/github/user/issues
 */
router.get('/user/issues', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, '/user/issues', {
    filter: 'all',
    state: 'all',
    per_page: req.query.per_page || 20
  });
});

// ==================== GitHub统计端点 ====================

/**
 * 获取综合仪表盘数据
 * GET /api/github/dashboard
 * 
 * 这个端点聚合多个GitHub API调用，提供前端仪表盘所需的所有数据
 */
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const githubToken = req.headers['x-github-token'] || req.user?.githubToken;
    
    if (!githubToken) {
      return res.status(401).json({
        success: false,
        message: '未找到GitHub访问令牌'
      });
    }

    console.log('获取GitHub仪表盘数据');

    // 并行获取多个数据源
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/user`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Frontend-Backend'
        },
        ...getAxiosProxyConfig()
      }),
      axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-Frontend-Backend'
        },
        params: {
          type: 'owner',
          sort: 'updated',
          direction: 'desc',
          per_page: 50
        },
        ...getAxiosProxyConfig()
      })
    ]);

    const user = userResponse.data;
    const repos = reposResponse.data;

    // 获取最近提交（从前3个仓库）
    const recentCommits = [];
    const reposToCheck = repos.slice(0, 3);
    
    for (const repo of reposToCheck) {
      try {
        const commitsResponse = await axios.get(
          `${GITHUB_API_BASE}/repos/${repo.owner.login}/${repo.name}/commits`,
          {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'AI-Frontend-Backend'
            },
            params: {
              author: user.login,
              per_page: 5
            },
            ...getAxiosProxyConfig()
          }
        );
        
        recentCommits.push(...commitsResponse.data.map(commit => ({
          ...commit,
          repo: repo.name,
          repoOwner: repo.owner.login
        })));
      } catch (error) {
        console.warn(`获取仓库 ${repo.full_name} 提交失败:`, error.message);
      }
    }

    // 获取用户最近活动
    let recentActivity = [];
    try {
      const activityResponse = await axios.get(
        `${GITHUB_API_BASE}/users/${user.login}/events`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Frontend-Backend'
          },
          params: { per_page: 20 },
          ...getAxiosProxyConfig()
        }
      );
      recentActivity = activityResponse.data;
    } catch (error) {
      console.warn('获取用户活动失败:', error.message);
    }

    // 计算统计信息
    const starCount = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const forkCount = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    // 语言统计
    const languages = {};
    for (const repo of repos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }

    // 获取Issue/PR统计
    let issueCount = 0;
    let prCount = 0;
    try {
      const issuesResponse = await axios.get(
        `${GITHUB_API_BASE}/issues`,
        {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Frontend-Backend'
          },
          params: {
            filter: 'created',
            state: 'all',
            per_page: 50
          },
          ...getAxiosProxyConfig()
        }
      );
      
      const issues = issuesResponse.data;
      issueCount = issues.filter(issue => !issue.pull_request).length;
      prCount = issues.filter(issue => issue.pull_request).length;
    } catch (error) {
      console.warn('获取Issue/PR统计失败:', error.message);
    }

    // 返回聚合数据
    res.json({
      success: true,
      data: {
        user,
        repos: repos.slice(0, 10), // 只返回前10个仓库
        recentCommits: recentCommits
          .sort((a, b) => new Date(b.commit.committer.date).getTime() - new Date(a.commit.committer.date).getTime())
          .slice(0, 15),
        recentActivity: recentActivity.slice(0, 15),
        languages: Object.entries(languages)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        stats: {
          repoCount: repos.length,
          starCount,
          forkCount,
          issueCount,
          prCount,
          followers: user.followers,
          following: user.following
        }
      }
    });

  } catch (error) {
    console.error('获取GitHub仪表盘数据错误:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        message: `GitHub API错误: ${error.response.status}`,
        githubError: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        message: '获取仪表盘数据失败'
      });
    }
  }
});

// ==================== GitHub搜索端点 ====================

/**
 * 搜索GitHub仓库
 * GET /api/github/search/repositories
 * 参数：q, sort, order, per_page, page
 */
router.get('/search/repositories', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, '/search/repositories');
});

/**
 * 搜索GitHub用户
 * GET /api/github/search/users
 */
router.get('/search/users', authenticate, async (req, res) => {
  await proxyGitHubRequest(req, res, '/search/users');
});

module.exports = router;