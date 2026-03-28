/**
 * GitHub API 服务 - 后端代理版本
 * 通过后端代理调用GitHub API，保护访问令牌
 */

import type {
  GitHubUser,
  GitHubRepo,
  GitHubCommit,
  GitHubEvent,
  GitHubIssue,
  GitHubStats,
  GitHubError,
} from '../types/github.types';
import { getGitHubAccessToken } from '../utils/github.utils';

// API基础URL（从环境变量获取）
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

/**
 * 通用的API请求函数
 */
async function apiRequest<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const githubAccessToken = getGitHubAccessToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(githubAccessToken ? { 'x-github-token': githubAccessToken } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    credentials: 'include'
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || `HTTP ${response.status}`;
    const error: GitHubError = {
      message: errorMessage,
      documentation_url: data.documentation_url,
      status: response.status,
      githubError: data.githubError
    };
    throw error;
  }

  // 如果是后端代理的聚合响应，提取data字段
  if (data.success !== undefined && data.data !== undefined) {
    return data.data;
  }

  return data;
}

/**
 * GitHub API 服务类（通过后端代理）
 */
export class GitHubService {
  private token: string; // 本地JWT token
  
  constructor(token: string) {
    this.token = token;
  }
  
  /**
   * 获取当前GitHub用户信息
   */
  async getUser(): Promise<GitHubUser> {
    return apiRequest<GitHubUser>('/github/user', this.token);
  }
  
  /**
   * 获取用户仓库列表
   */
  async getRepos(sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated', direction: 'asc' | 'desc' = 'desc'): Promise<GitHubRepo[]> {
    return apiRequest<GitHubRepo[]>(`/github/repos?sort=${sort}&direction=${direction}`, this.token);
  }
  
  /**
   * 获取仓库的提交历史
   */
  async getRepoCommits(owner: string, repo: string, perPage: number = 30): Promise<GitHubCommit[]> {
    return apiRequest<GitHubCommit[]>(`/github/repos/${owner}/${repo}/commits?per_page=${perPage}`, this.token);
  }
  
  /**
   * 获取用户事件
   */
  async getUserEvents(username: string, perPage: number = 30): Promise<GitHubEvent[]> {
    return apiRequest<GitHubEvent[]>(`/github/users/${username}/events?per_page=${perPage}`, this.token);
  }
  
  /**
   * 获取用户Issue
   */
  async getUserIssues(filter: 'assigned' | 'created' | 'mentioned' | 'subscribed' | 'all' = 'created', state: 'open' | 'closed' | 'all' = 'all'): Promise<GitHubIssue[]> {
    return apiRequest<GitHubIssue[]>(`/github/issues?filter=${filter}&state=${state}`, this.token);
  }
  
  /**
   * 获取仓库事件
   */
  async getRepoEvents(owner: string, repo: string, perPage: number = 30): Promise<GitHubEvent[]> {
    return apiRequest<GitHubEvent[]>(`/github/repos/${owner}/${repo}/events?per_page=${perPage}`, this.token);
  }
  
  /**
   * 获取综合仪表盘数据
   */
  async getDashboardStats(): Promise<GitHubStats> {
    try {
      // 尝试使用聚合端点
      const dashboardData = await apiRequest<{
        user: GitHubUser;
        repos: GitHubRepo[];
        recentCommits: GitHubCommit[];
        recentActivity: GitHubEvent[];
        languages: Array<{ name: string; count: number }>;
        stats: {
          repoCount: number;
          starCount: number;
          forkCount: number;
          issueCount: number;
          prCount: number;
          followers: number;
          following: number;
        };
      }>('/github/dashboard', this.token);

      return {
        user: dashboardData.user,
        repos: dashboardData.repos,
        totalCommits: dashboardData.recentCommits.length,
        recentCommits: dashboardData.recentCommits,
        recentActivity: dashboardData.recentActivity,
        languages: dashboardData.languages.reduce((acc, lang) => {
          acc[lang.name] = lang.count;
          return acc;
        }, {} as Record<string, number>),
        repoCount: dashboardData.stats.repoCount,
        starCount: dashboardData.stats.starCount,
        forkCount: dashboardData.stats.forkCount,
        issueCount: dashboardData.stats.issueCount,
        prCount: dashboardData.stats.prCount
      };
    } catch (error) {
      console.warn('仪表盘聚合端点不可用，回退到独立调用:', error);
      
      // 回退到独立调用
      const [user, repos] = await Promise.all([
        this.getUser(),
        this.getRepos()
      ]);
      
      // 获取最近提交
      const recentCommits: GitHubCommit[] = [];
      for (const repo of repos.slice(0, 3)) {
        try {
          const commits = await this.getRepoCommits(repo.owner.login, repo.name, 5);
          recentCommits.push(...commits);
        } catch (error) {
          console.warn(`获取仓库 ${repo.full_name} 提交失败:`, error);
        }
      }
      
      // 获取最近活动
      let recentActivity: GitHubEvent[] = [];
      try {
        recentActivity = await this.getUserEvents(user.login, 20);
      } catch (error) {
        console.warn('获取用户活动失败:', error);
      }
      
      // 计算语言统计
      const languages: Record<string, number> = {};
      for (const repo of repos) {
        if (repo.language) {
          languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
      }
      
      // 计算统计
      const starCount = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const forkCount = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
      
      // 获取Issue/PR统计（简化）
      let issueCount = 0;
      let prCount = 0;
      try {
        const issues = await this.getUserIssues('created', 'all');
        issueCount = issues.filter(issue => !issue.pull_request).length;
        prCount = issues.filter(issue => issue.pull_request).length;
      } catch (error) {
        console.warn('获取Issue/PR统计失败:', error);
      }
      
      return {
        user,
        repos,
        recentCommits: recentCommits.sort((a, b) => 
          new Date(b.commit.committer.date).getTime() - new Date(a.commit.committer.date).getTime()
        ).slice(0, 20),
        totalCommits: recentCommits.length,
        recentActivity: recentActivity.slice(0, 20),
        languages,
        repoCount: repos.length,
        starCount,
        forkCount,
        issueCount,
        prCount
      };
    }
  }
  
  /**
   * 获取所有仓库的语言统计
   */
  async getAllReposLanguages(repos: GitHubRepo[]): Promise<Record<string, number>> {
    const languages: Record<string, number> = {};
    
    for (const repo of repos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }
    
    return languages;
  }
  
  /**
   * 获取用户提交统计
   */
  async getUserCommitStats(_username: string): Promise<{ total: number }> {
    // 这个API可能需要后端特定实现
    // 暂时返回估算值
    try {
      const repos = await this.getRepos();
      return { total: repos.length * 10 }; // 估算
    } catch (error) {
      console.warn('获取提交统计失败:', error);
      return { total: 0 };
    }
  }
  
  /**
   * 验证token有效性
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getUser();
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * GitHub OAuth token交换
 * ⚠️ 注意：现在由后端处理GitHub OAuth，前端不再直接调用GitHub API
 */
export async function exchangeCodeForToken(_code: string): Promise<string> {
  console.warn('⚠️ 前端不再直接处理GitHub OAuth token交换');
  console.warn('💡 应该调用 authService.exchangeGitHubCode(code)');
  console.warn('📝 流程：前端将code发送到后端，后端返回JWT token');
  
  throw new Error('GitHub OAuth应该通过后端API处理。请使用authService.exchangeGitHubCode()');
}

/**
 * 创建GitHub服务实例
 */
export function createGitHubService(token: string): GitHubService {
  return new GitHubService(token);
}

/**
 * 模拟GitHub数据服务（用于开发和演示）
 */
export class MockGitHubService {
  private isMockMode: boolean;
  
  constructor(token: string) {
    // 检查是否是模拟token
    this.isMockMode = token.startsWith('github_dev_token_') || token.startsWith('github_pat_');
  }
  
  async getUser(): Promise<GitHubUser> {
    if (!this.isMockMode) {
      throw new Error('Mock service requires mock token');
    }
    
    // 返回模拟用户数据
    return {
      login: 'demo-user',
      id: 12345678,
      avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
      html_url: 'https://github.com/demo-user',
      name: 'Demo User',
      company: 'AI Frontend Inc.',
      blog: 'https://demo-user.dev',
      location: 'Shanghai, China',
      email: 'demo@example.com',
      bio: 'Full-stack developer | React enthusiast | Open source contributor',
      twitter_username: 'demo_user',
      public_repos: 24,
      public_gists: 12,
      followers: 128,
      following: 64,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    };
  }
  
  async getRepos(_sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated', _direction: 'asc' | 'desc' = 'desc'): Promise<GitHubRepo[]> {
    if (!this.isMockMode) {
      throw new Error('Mock service requires mock token');
    }
    
    const languages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust'];
    const topics = ['react', 'typescript', 'tailwindcss', 'vite', 'nodejs', 'github-api'];
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: 1000000 + i,
      name: `demo-repo-${i + 1}`,
      full_name: `demo-user/demo-repo-${i + 1}`,
      private: false,
      html_url: `https://github.com/demo-user/demo-repo-${i + 1}`,
      description: `A sample repository for demonstration purposes #${i + 1}`,
      fork: i % 4 === 0,
      url: `https://api.github.com/repos/demo-user/demo-repo-${i + 1}`,
      created_at: `202${i % 3}-0${(i % 9) + 1}-${(i % 28) + 1}T00:00:00Z`,
      updated_at: new Date(Date.now() - i * 86400000).toISOString(), // 递减日期
      pushed_at: new Date(Date.now() - i * 43200000).toISOString(),
      git_url: `git://github.com/demo-user/demo-repo-${i + 1}.git`,
      ssh_url: `git@github.com:demo-user/demo-repo-${i + 1}.git`,
      clone_url: `https://github.com/demo-user/demo-repo-${i + 1}.git`,
      svn_url: `https://github.com/demo-user/demo-repo-${i + 1}`,
      homepage: i % 3 === 0 ? `https://demo-repo-${i + 1}.dev` : null,
      size: 1024 * (i + 1),
      stargazers_count: Math.floor(Math.random() * 100),
      watchers_count: Math.floor(Math.random() * 20),
      language: languages[i % languages.length],
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: i % 5 === 0,
      has_discussions: i % 3 === 0,
      forks_count: Math.floor(Math.random() * 30),
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: Math.floor(Math.random() * 10),
      license: i % 4 === 0 ? {
        key: 'mit',
        name: 'MIT License',
        spdx_id: 'MIT',
        url: 'https://api.github.com/licenses/mit',
        node_id: 'MDc6TGljZW5zZTEz'
      } : null,
      allow_forking: true,
      is_template: i % 6 === 0,
      topics: topics.slice(0, (i % 3) + 1),
      visibility: 'public',
      forks: Math.floor(Math.random() * 30),
      open_issues: Math.floor(Math.random() * 10),
      watchers: Math.floor(Math.random() * 20),
      default_branch: 'main',
      score: 0,
      owner: {
        login: 'demo-user',
        id: 12345678,
        avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
        html_url: 'https://github.com/demo-user',
        type: 'User'
      }
    }));
  }
  
  async getRepoCommits(owner: string, repo: string, perPage: number = 30): Promise<GitHubCommit[]> {
    if (!this.isMockMode) {
      throw new Error('Mock service requires mock token');
    }
    
    return Array.from({ length: Math.min(perPage, 10) }, (_, i) => ({
      sha: `abc123${i}def456${i}789`,
      node_id: `C_kwDOABC123${i}`,
      commit: {
        author: {
          name: 'Demo User',
          email: 'demo@example.com',
          date: new Date(Date.now() - i * 86400000).toISOString()
        },
        committer: {
          name: 'Demo User',
          email: 'demo@example.com',
          date: new Date(Date.now() - i * 86400000).toISOString()
        },
        message: `feat: Add feature #${i + 1}\n\nThis is a sample commit message for demonstration.`,
        tree: {
          sha: `tree${i}sha`,
          url: `https://api.github.com/repos/${owner}/${repo}/git/trees/tree${i}sha`
        },
        url: `https://api.github.com/repos/${owner}/${repo}/git/commits/abc123${i}def456${i}789`,
        comment_count: i % 3,
        verification: {
          verified: true,
          reason: 'valid',
          signature: null,
          payload: null,
          verified_at: new Date(Date.now() - i * 86400000).toISOString()
        }
      },
      url: `https://api.github.com/repos/${owner}/${repo}/commits/abc123${i}def456${i}789`,
      html_url: `https://github.com/${owner}/${repo}/commit/abc123${i}def456${i}789`,
      comments_url: `https://api.github.com/repos/${owner}/${repo}/commits/abc123${i}def456${i}789/comments`,
      author: {
        login: 'demo-user',
        id: 12345678,
        avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
        html_url: 'https://github.com/demo-user',
        type: 'User'
      },
      committer: {
        login: 'demo-user',
        id: 12345678,
        avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
        html_url: 'https://github.com/demo-user',
        type: 'User'
      },
      parents: i > 0 ? [{
        sha: `abc123${i - 1}def456${i - 1}789`,
        url: `https://api.github.com/repos/${owner}/${repo}/commits/abc123${i - 1}def456${i - 1}789`,
        html_url: `https://github.com/${owner}/${repo}/commit/abc123${i - 1}def456${i - 1}789`
      }] : []
    }));
  }
  
  async getDashboardStats(): Promise<GitHubStats> {
    if (!this.isMockMode) {
      throw new Error('Mock service requires mock token');
    }
    
    const user = await this.getUser();
    const repos = await this.getRepos();
    const recentCommits = await this.getRepoCommits('demo-user', 'demo-repo-1', 5);
    const recentActivity: GitHubEvent[] = Array.from({ length: 10 }, (_, i) => ({
      id: `event${i}`,
      type: i % 3 === 0 ? 'PushEvent' : i % 3 === 1 ? 'CreateEvent' : 'WatchEvent',
      actor: {
        id: 12345678,
        login: 'demo-user',
        display_login: 'demo-user',
        gravatar_id: '',
        url: 'https://api.github.com/users/demo-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4'
      },
      repo: {
        id: 1000000 + (i % 8),
        name: `demo-user/demo-repo-${(i % 8) + 1}`,
        url: `https://api.github.com/repos/demo-user/demo-repo-${(i % 8) + 1}`
      },
      payload: {},
      public: true,
      created_at: new Date(Date.now() - i * 3600000).toISOString()
    }));
    
    const languages = {
      'TypeScript': 3,
      'JavaScript': 2,
      'Python': 1,
      'Java': 1,
      'HTML': 1
    };
    
    return {
      user,
      repos,
      totalCommits: 487,
      recentCommits,
      recentActivity,
      languages,
      repoCount: repos.length,
      starCount: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      forkCount: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
      issueCount: 23,
      prCount: 17
    };
  }
}

/**
 * 创建GitHub服务（自动选择真实或模拟服务）
 */
export function createGitHubServiceAuto(token: string): GitHubService | MockGitHubService {
  // 仅开发模式token走mock，真实JWT必须走后端代理
  if (token.startsWith('github_dev_token_')) {
    console.log('📱 使用模拟GitHub数据服务（开发模式）');
    return new MockGitHubService(token);
  }
  
  return new GitHubService(token);
}

/**
 * 默认导出
 */
export default GitHubService;