/**
 * GitHub API 类型定义
 */

// 用户基本信息
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

// 仓库信息
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  /** GitHub API 字段名 */
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    type?: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    spdx_id: string;
    url: string | null;
    node_id: string;
  } | null;
  topics: string[];
  visibility: 'public' | 'private';
  default_branch: string;
}

/** 提交记录上的用户（API 常返回完整 GitHubUser 或字段子集） */
export type GitHubCommitUser = Pick<GitHubUser, 'login' | 'id' | 'avatar_url' | 'html_url'> &
  Partial<Omit<GitHubUser, 'login' | 'id' | 'avatar_url' | 'html_url'>>;

// 提交信息
export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      sha: string;
      url: string;
    };
    url: string;
    comment_count: number;
    verification?: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  url: string;
  html_url: string;
  comments_url: string;
  author: GitHubCommitUser | null;
  committer: GitHubCommitUser | null;
  parents: Array<{
    sha: string;
    url: string;
    html_url: string;
  }>;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: Array<{
    sha: string;
    filename: string;
    status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed';
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string;
  }>;
}

// 活动事件
export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login?: string;
    gravatar_id?: string;
    url?: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: any;
  public: boolean;
  created_at: string;
}

// Issue/PR 信息
export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  user: GitHubUser;
  state: 'open' | 'closed';
  locked: boolean;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  pull_request?: {
    url: string;
    html_url: string;
    diff_url: string;
    patch_url: string;
    merged_at: string | null;
  };
  html_url: string;
}

// 统计信息
export interface GitHubStats {
  user: GitHubUser;
  repos: GitHubRepo[];
  totalCommits: number;
  recentCommits: GitHubCommit[];
  recentActivity: GitHubEvent[];
  languages: Record<string, number>;
  repoCount: number;
  starCount: number;
  forkCount: number;
  issueCount: number;
  prCount: number;
}

// API 响应包装
export interface GitHubApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// 错误类型
export interface GitHubError {
  message: string;
  documentation_url?: string;
  status?: number;
  githubError?: unknown;
}

// OAuth Token
export interface GitHubToken {
  access_token: string;
  token_type: string;
  scope: string;
}

// 仪表盘状态
export interface DashboardState {
  isLoading: boolean;
  error: string | null;
  stats: GitHubStats | null;
  lastUpdated: string | null;
}

// 上下文类型
export interface GitHubContextType {
  token: string | null;
  user: GitHubUser | null;
  stats: GitHubStats | null;
  isLoading: boolean;
  error: string | null;
  login: (code: string) => Promise<void>;
  loginDev: () => Promise<void>; // 开发模式登录
  logout: () => void;
  refresh: () => Promise<void>;
  startOAuth: () => void;
  handleOAuthCallback: () => Promise<boolean>;
}