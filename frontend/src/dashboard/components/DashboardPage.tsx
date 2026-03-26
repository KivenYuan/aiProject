/**
 * 开发者仪表盘主页面
 */

import React from 'react';
import { useGitHub } from '../contexts/GitHubContext';
import GitHubStatsCard from './GitHubStatsCard';
import RepoList from './RepoList';
import CommitTimeline from './CommitTimeline';
import ActivityFeed from './ActivityFeed';
import { generateOAuthUrl, isGitHubOAuthConfigured } from '../utils/github.utils';

const shell = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
const card =
  'dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 shadow-card backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85';

const OAUTH_SETUP_HINT =
  '请复制 frontend/.env.example 为 frontend/.env.local，将 VITE_GITHUB_CLIENT_ID 设为你在 GitHub → Settings → Developer settings → OAuth Apps 中创建的 Client ID，保存后重启 npm run dev。';

const DashboardPage: React.FC = () => {
  const { token, user, stats, isLoading, error, logout, loginDev } = useGitHub();
  const oauthReady = isGitHubOAuthConfigured();

  if (!token) {
    return (
      <div className={`${shell} py-12 lg:py-16`}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Showcase</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            开发者数据仪表盘
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600">
            连接 GitHub，展示仓库、提交与动态——适合作为面试作品中的「可交互 Demo」。
          </p>
        </div>

        <div className={`${card} mx-auto mt-10 max-w-lg p-8 md:p-10`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-brand-700 text-white shadow-soft">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-xl font-semibold text-slate-900">连接 GitHub</h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            通过后端代理交换 OAuth 令牌，前端不暴露 client secret。
          </p>

          <a
            href={oauthReady ? generateOAuthUrl() : '#'}
            onClick={(e) => {
              if (!oauthReady) {
                e.preventDefault();
                window.alert(OAUTH_SETUP_HINT);
              }
            }}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            使用 GitHub 登录
          </a>

          <button
            type="button"
            onClick={loginDev}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            开发模式（模拟数据）
          </button>

          <div className="mt-8 border-t border-slate-200 pt-6 text-left text-xs leading-relaxed text-slate-500">
            <p className="font-medium text-slate-700">说明</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>真实数据需配置后端 <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]">/api</code> 与 GitHub OAuth</li>
              <li>演示时可使用开发模式快速浏览 UI</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${shell} flex min-h-[50vh] flex-col items-center justify-center py-16`}>
        <div className={`${card} w-full max-w-sm p-10 text-center`}>
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
          <p className="mt-5 text-sm font-medium text-slate-800">正在同步 GitHub 数据</p>
          <p className="mt-1 text-xs text-slate-500">拉取用户信息与仪表盘聚合接口</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${shell} py-12`}>
        <div className={`${card} mx-auto max-w-lg p-8 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">暂时无法加载</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-8 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-slate-800"
          >
            清除会话并重试
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${shell} py-12`}>
        <div className={`${card} mx-auto max-w-lg p-8 text-center`}>
          <h2 className="text-lg font-semibold text-slate-900">无法加载 GitHub 用户信息</h2>
          <p className="mt-2 text-sm text-slate-600">请重新完成 GitHub 授权。</p>
          <button
            type="button"
            onClick={logout}
            className="mt-8 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft hover:bg-slate-800"
          >
            清除会话并重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <section className={`${card} px-4 py-8 sm:px-6 lg:px-8 lg:py-10`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar_url}
              alt=""
              className="h-14 w-14 shrink-0 rounded-2xl border border-white shadow-soft ring-2 ring-slate-100 dark:border-slate-700 dark:ring-slate-700/60"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">GitHub Profile</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {user.name || user.login}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                @{user.login}
                {user.bio ? ` · ${user.bio}` : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              在 GitHub 上查看
            </a>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              退出连接
            </button>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          数据概览 · 最近更新 {stats ? new Date().toLocaleDateString('zh-CN') : '—'}
        </p>
      </section>

      <div className="py-10 lg:py-12">
        {stats && <GitHubStatsCard stats={stats} />}

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <RepoList repos={stats?.repos || []} />
          </div>
          <div className="space-y-8">
            <CommitTimeline commits={stats?.recentCommits || []} />
            <ActivityFeed activities={stats?.recentActivity || []} />
          </div>
        </div>

        <p className="mt-12 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500">
          数据来自 GitHub API，经后端代理；仅用于作品展示与能力说明。
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
