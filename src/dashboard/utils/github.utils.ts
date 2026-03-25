/**
 * GitHub 工具函数
 */

/**
 * GitHub 工具函数
 */
import type { GitHubRepo, GitHubCommit, GitHubEvent, GitHubStats } from '../types/github.types';

/**
 * 格式化日期
 */
export function formatDate(dateString: string, format: 'relative' | 'short' | 'long' = 'relative'): string {
  const date = new Date(dateString);
  const now = new Date();
  
  if (format === 'relative') {
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    if (diffHour < 24) return `${diffHour}小时前`;
    if (diffDay < 30) return `${diffDay}天前`;
    
    return date.toLocaleDateString('zh-CN');
  }
  
  if (format === 'short') {
    return date.toLocaleDateString('zh-CN');
  }
  
  // long format
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 提取提交消息的第一行（标题）
 */
export function getCommitTitle(message: string): string {
  return message.split('\n')[0].trim();
}

/**
 * 获取仓库的主要语言（基于字节数最多的语言）
 */
export function getRepoPrimaryLanguage(repo: GitHubRepo): string {
  return repo.language || 'Unknown';
}

/**
 * 计算仓库的活跃度分数（基于最后更新时间）
 */
export function calculateRepoActivityScore(repo: GitHubRepo): number {
  const pushedDate = new Date(repo.pushed_at);
  const now = new Date();
  const daysSincePush = Math.floor((now.getTime() - pushedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSincePush <= 7) return 5; // 非常活跃
  if (daysSincePush <= 30) return 4; // 活跃
  if (daysSincePush <= 90) return 3; // 一般
  if (daysSincePush <= 180) return 2; // 不活跃
  return 1; // 非常不活跃
}

/**
 * 按语言分组仓库
 */
export function groupReposByLanguage(repos: GitHubRepo[]): Record<string, GitHubRepo[]> {
  return repos.reduce((acc, repo) => {
    const lang = repo.language || 'Unknown';
    if (!acc[lang]) {
      acc[lang] = [];
    }
    acc[lang].push(repo);
    return acc;
  }, {} as Record<string, GitHubRepo[]>);
}

/**
 * 获取语言颜色（常用语言）
 */
export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Vue': '#41b883',
    'React': '#61dafb',
    'Unknown': '#cccccc'
  };
  
  return colors[language || 'Unknown'] || '#cccccc';
}

/**
 * 格式化数字（千位分隔）
 */
export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * 从事件类型获取中文描述
 */
export function getEventTypeChinese(type: string): string {
  const typeMap: Record<string, string> = {
    'PushEvent': '推送代码',
    'CreateEvent': '创建仓库/分支',
    'DeleteEvent': '删除分支',
    'ForkEvent': '复刻仓库',
    'IssuesEvent': 'Issue操作',
    'IssueCommentEvent': '评论Issue',
    'PullRequestEvent': 'Pull Request',
    'PullRequestReviewEvent': 'PR审核',
    'PullRequestReviewCommentEvent': '评论PR',
    'WatchEvent': '星标仓库',
    'ReleaseEvent': '发布版本',
    'PublicEvent': '公开仓库',
    'MemberEvent': '成员操作'
  };
  
  return typeMap[type] || type;
}

/**
 * 获取事件图标
 */
export function getEventIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'PushEvent': '💾',
    'CreateEvent': '🆕',
    'DeleteEvent': '🗑️',
    'ForkEvent': '🍴',
    'IssuesEvent': '🐛',
    'IssueCommentEvent': '💬',
    'PullRequestEvent': '🔀',
    'PullRequestReviewEvent': '👁️',
    'PullRequestReviewCommentEvent': '💬',
    'WatchEvent': '⭐',
    'ReleaseEvent': '🏷️',
    'PublicEvent': '🌐',
    'MemberEvent': '👥'
  };
  
  return iconMap[type] || '🔔';
}

/**
 * 处理GitHub API错误
 */
export function handleGitHubError(error: any): string {
  if (error?.message && typeof error.message === 'string') {
    const msg = error.message.toLowerCase();
    if (msg.includes('未找到github访问令牌') || msg.includes('github token') || msg.includes('github access token')) {
      return '缺少 GitHub 授权信息，请重新进行 GitHub OAuth 登录';
    }
  }
  if (error.status === 401) {
    return 'GitHub认证失败，请重新进行 GitHub OAuth 登录';
  }
  if (error.status === 403) {
    return 'API速率限制，请稍后再试';
  }
  if (error.status === 404) {
    return '资源未找到';
  }
  if (error.message) {
    return error.message;
  }
  return '未知错误，请稍后再试';
}

/**
 * 检查token是否有效（支持GitHub token和JWT token）
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  // JWT token格式：xxx.yyy.zzz
  if (token.includes('.')) {
    const parts = token.split('.');
    return parts.length === 3 && token.length > 20;
  }
  
  // GitHub token格式（旧格式）
  return token.length > 10 && /^[A-Za-z0-9_]+$/.test(token);
}

/**
 * 保存token到本地存储（现在使用JWT token）
 */
export function saveTokenToStorage(token: string): void {
  try {
    // 现在保存的是JWT token，与auth系统使用相同的存储
    // 但为了向后兼容，我们仍然保存在github_token键下
    // 实际GitHubContext现在使用JWT token，不是GitHub token
    localStorage.setItem('github_token', token);
    localStorage.setItem('github_token_time', Date.now().toString());
  } catch (error) {
    console.error('保存token失败:', error);
  }
}

/**
 * 从本地存储获取token（现在获取JWT token）
 */
export function getTokenFromStorage(): string | null {
  try {
    // 首先尝试从github_token获取（向后兼容）
    let token = localStorage.getItem('github_token');
    const savedTime = localStorage.getItem('github_token_time');
    
    // 如果没有github_token，尝试从auth_token获取（JWT token）
    if (!token) {
      token = localStorage.getItem('auth_token');
      if (token) {
        // 如果有auth_token，也保存一份到github_token以便向后兼容
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_token_time', Date.now().toString());
      }
    }
    
    if (!token) return null;
    
    // 检查token是否过期（24小时）
    const tokenAge = savedTime ? Date.now() - parseInt(savedTime, 10) : 0;
    const maxAge = 24 * 60 * 60 * 1000; // 24小时
    
    if (savedTime && tokenAge > maxAge) {
      localStorage.removeItem('github_token');
      localStorage.removeItem('github_token_time');
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('获取token失败:', error);
    return null;
  }
}

/**
 * 清除本地存储的token
 */
export function clearTokenFromStorage(): void {
  try {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_token_time');
    localStorage.removeItem('github_access_token');
  } catch (error) {
    console.error('清除token失败:', error);
  }
}

/**
 * 保存后端返回的GitHub access token
 */
export function saveGitHubAccessToken(token: string): void {
  try {
    localStorage.setItem('github_access_token', token);
  } catch (error) {
    console.error('保存GitHub access token失败:', error);
  }
}

/**
 * 获取后端返回的GitHub access token
 */
export function getGitHubAccessToken(): string | null {
  try {
    return localStorage.getItem('github_access_token');
  } catch (error) {
    console.error('获取GitHub access token失败:', error);
    return null;
  }
}

/**
 * 生成GitHub OAuth授权URL
 */
export function generateOAuthUrl(): string {
  const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/github/callback`;
  const scope = 'user,repo,read:org';
  
  // 调试日志
  console.log('🔍 GitHub OAuth配置检查:');
  console.log('   - VITE_GITHUB_CLIENT_ID:', clientId ? '已设置' : '未设置');
  console.log('   - VITE_GITHUB_REDIRECT_URI:', redirectUri);
  console.log('   - 当前origin:', window.location.origin);
  
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
  console.log('🔗 生成的GitHub OAuth URL:', url.substring(0, 100) + '...');
  
  return url;
}