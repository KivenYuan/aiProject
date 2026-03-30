/**
 * GitHub统计卡片组件
 */

import React from 'react';
import type { GitHubStats } from '../types/github.types';
import { formatNumber, getLanguageColor } from '../utils/github.utils';

interface GitHubStatsCardProps {
  stats: GitHubStats;
}

const GitHubStatsCard: React.FC<GitHubStatsCardProps> = ({ stats }) => {
  const { user, repoCount, starCount, forkCount, issueCount, prCount, totalCommits, languages } = stats;

  // 提取前5种语言
  const topLanguages = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm md:p-8 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
        {/* 仓库数量 */}
        <div className="rounded-xl border border-blue-100/80 bg-gradient-to-br from-blue-50 to-indigo-50/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">仓库</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(repoCount)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">公开仓库数量</p>
        </div>

        {/* Star数量 */}
        <div className="rounded-xl border border-amber-100/80 bg-gradient-to-br from-amber-50 to-yellow-50/90 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-700 font-medium">Star</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(starCount)}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-yellow-600 mt-2">获得星标总数</p>
        </div>

        {/* 提交数量 */}
        <div className="rounded-xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 to-green-50/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">提交</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalCommits)}</p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-2">总提交次数</p>
        </div>

        {/* Fork数量 */}
        <div className="rounded-xl border border-violet-100/80 bg-gradient-to-br from-violet-50 to-purple-50/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Fork</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(forkCount)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-2">被复刻次数</p>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 语言分布 */}
        <div className="md:col-span-2">
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">主要语言分布</h3>
          <div className="space-y-3">
            {topLanguages.map(([lang, bytes]) => {
              const percentage = (bytes / Object.values(languages).reduce((a, b) => a + b, 0)) * 100;
              const color = getLanguageColor(lang);
              
              return (
                <div key={lang} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-gray-700">{lang}</span>
                    </div>
                    <span className="text-gray-600">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 其他统计 */}
        <div>
          <h3 className="mb-4 text-lg font-semibold tracking-tight text-slate-900">活动统计</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Issues</p>
                  <p className="text-xs text-gray-500">创建的问题</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{formatNumber(issueCount)}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">PRs</p>
                  <p className="text-xs text-gray-500">拉取请求</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{formatNumber(prCount)}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">活跃天数</p>
                  <p className="text-xs text-gray-500">最近30天</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">--</span>
            </div>
          </div>
        </div>
      </div>

      {/* 用户信息 */}
      <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="h-12 w-12 shrink-0 rounded-full border-2 border-white shadow-md dark:border-slate-700"
            />
            <div>
              <h4 className="font-bold text-gray-900">{user.name || user.login}</h4>
              <p className="text-sm text-gray-600">
                @{user.login}
                <span className="hidden sm:inline"> • {user.public_repos} 仓库 • {user.followers} 粉丝</span>
              </p>
              <p className="text-xs text-gray-500 sm:hidden">{user.public_repos} 仓库 • {user.followers} 粉丝</p>
              {user.bio && (
                <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
              )}
            </div>
          </div>
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-slate-800 sm:w-auto"
          >
            查看GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default GitHubStatsCard;