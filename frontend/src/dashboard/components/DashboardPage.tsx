/**
 * GitHub 数据仪表盘主页面
 */

import React from 'react';
import { Button } from 'antd';
import { GithubOutlined, ExperimentOutlined, ExportOutlined, DisconnectOutlined } from '@ant-design/icons';
import { useGitHub } from '../contexts/GitHubContext';
import GitHubStatsCard from './GitHubStatsCard';
import RepoList from './RepoList';
import CommitTimeline from './CommitTimeline';
import CommitHeatmap from './CommitHeatmap';
import ActivityFeed from './ActivityFeed';
import DashboardSkeleton from './DashboardSkeleton';
import { generateOAuthUrl, isGitHubOAuthConfigured } from '../utils/github.utils';

const shell = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';
const card =
  'dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 shadow-card backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85';

const OAUTH_SETUP_HINT =
  '当前站点尚未配置 GitHub 登录：请在部署环境中设置 GitHub OAuth 应用的 Client ID（对应环境变量 VITE_GITHUB_CLIENT_ID），并确保回调地址与 GitHub 应用设置一致。';

const DashboardPage: React.FC = () => {
  const { token, user, stats, isLoading, isStatsLoading, error, logout, loginDev } = useGitHub();
  const oauthReady = isGitHubOAuthConfigured();

  if (!token) {
    return (
      <div className={`${shell} py-12 lg:py-16`}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">GitHub</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            数据仪表盘
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            授权后在此查看仓库、近期提交与动态，数据与 GitHub 账户同步。
          </p>
        </div>

        <div className={`${card} mx-auto mt-10 max-w-lg p-6 sm:p-8 md:p-10`}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-brand-700 text-white shadow-soft">
            <GithubOutlined style={{ fontSize: 32 }} />
          </div>
          <h2 className="mt-6 text-center text-lg font-semibold text-slate-900 sm:text-xl">连接 GitHub</h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            使用 OAuth 2.0 授权，令牌由服务端安全处理。
          </p>

          <Button
            type="primary"
            icon={<GithubOutlined />}
            size="large"
            block
            className="mt-8"
            href={oauthReady ? generateOAuthUrl() : undefined}
            onClick={(e) => {
              if (!oauthReady) {
                e.preventDefault();
                window.alert(OAUTH_SETUP_HINT);
              }
            }}
          >
            使用 GitHub 登录
          </Button>

          <Button
            icon={<ExperimentOutlined />}
            size="large"
            block
            className="mt-3"
            onClick={loginDev}
          >
            使用示例数据浏览
          </Button>
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
        <div className={`${card} mx-auto max-w-lg p-6 text-center sm:p-8`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
            <DisconnectOutlined style={{ fontSize: 28 }} />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">暂时无法加载</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Button type="primary" size="large" className="mt-8" onClick={logout}>
            清除会话并重试
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`${shell} py-12`}>
        <div className={`${card} mx-auto max-w-lg p-6 text-center sm:p-8`}>
          <h2 className="text-lg font-semibold text-slate-900">无法加载 GitHub 用户信息</h2>
          <p className="mt-2 text-sm text-slate-600">请重新完成 GitHub 授权。</p>
          <Button type="primary" size="large" className="mt-8" onClick={logout}>
            清除会话并重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <section className={`${card} px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 mt-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:gap-4">
            <img
              src={user.avatar_url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-2xl border border-white shadow-soft ring-2 ring-slate-100 dark:border-slate-700 dark:ring-slate-700/60 sm:h-14 sm:w-14"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">GitHub Profile</p>
              <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                {user.name || user.login}
              </h2>
              <p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">
                @{user.login}
                <span className="hidden sm:inline">{user.bio ? ` · ${user.bio}` : ''}</span>
              </p>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              icon={<ExportOutlined />}
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hidden sm:inline">在 GitHub 上查看</span>
              <span className="sm:hidden">GitHub</span>
            </Button>
            <Button
              type="text"
              icon={<DisconnectOutlined />}
              onClick={logout}
            >
              退出连接
            </Button>
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          {isStatsLoading
            ? '正在同步仪表盘数据（仓库、提交与活动）…'
            : `数据概览 · 最近更新 ${stats ? new Date().toLocaleDateString('zh-CN') : '—'}`}
        </p>
      </section>

      <div className="py-10 lg:py-12">
        {isStatsLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {stats && <GitHubStatsCard stats={stats} />}

            {stats && (
              <div className="mt-8 w-full min-w-0">
                <CommitHeatmap
                  commitHeatmap={stats.commitHeatmap}
                />
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div>
                <RepoList repos={stats?.repos || []} />
              </div>
              <div className="space-y-8">
                <CommitTimeline commits={stats?.recentCommits || []} />
                <ActivityFeed activities={stats?.recentActivity || []} />
              </div>
            </div>
          </>
        )}

        <p className="mt-12 border-t border-slate-200/80 pt-8 text-center text-xs text-slate-500">
          数据来自 GitHub，通过服务端代理拉取。
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
