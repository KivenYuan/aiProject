/**
 * 仓库列表组件
 */

import React, { useState } from 'react';
import type { GitHubRepo } from '../types/github.types';
import { formatDate, getRepoPrimaryLanguage, calculateRepoActivityScore, getLanguageColor } from '../utils/github.utils';

interface RepoListProps {
  repos: GitHubRepo[];
}

const RepoList: React.FC<RepoListProps> = ({ repos }) => {
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks'>('updated');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  // 获取所有语言选项
  const languages = ['all', ...Array.from(new Set(repos.map(repo => repo.language || 'Unknown').filter(Boolean)))];

  // 排序和过滤
  const filteredRepos = repos
    .filter(repo => filterLanguage === 'all' || repo.language === filterLanguage)
    .sort((a, b) => {
      switch (sortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'updated':
        default:
          return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
      }
    })
    .slice(0, 10); // 只显示前10个

  // 获取活跃度标签
  const getActivityLabel = (score: number): string => {
    switch (score) {
      case 5: return '非常活跃';
      case 4: return '活跃';
      case 3: return '一般';
      case 2: return '不活跃';
      case 1: return '非常不活跃';
      default: return '未知';
    }
  };

  // 获取活跃度颜色
  const getActivityColor = (score: number): string => {
    switch (score) {
      case 5: return 'bg-green-100 text-green-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 1: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">仓库列表</h3>
          <p className="text-sm text-gray-600 mt-1">显示你的GitHub仓库，按活跃度排序</p>
        </div>
        
        <div className="flex space-x-2">
          {/* 排序选择 */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'stars' | 'forks')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="updated">最近更新</option>
            <option value="stars">最多星标</option>
            <option value="forks">最多复刻</option>
          </select>

          {/* 语言过滤 */}
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'all' ? '所有语言' : lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 仓库列表 */}
      <div className="space-y-4">
        {filteredRepos.map(repo => {
          const activityScore = calculateRepoActivityScore(repo);
          const activityLabel = getActivityLabel(activityScore);
          const activityColor = getActivityColor(activityScore);
          const language = getRepoPrimaryLanguage(repo);
          const languageColor = getLanguageColor(language);

          return (
            <div
              key={repo.id}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                    >
                      {repo.name}
                    </a>
                    {repo.private && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                        私有
                      </span>
                    )}
                  </div>

                  {repo.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{repo.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {/* 语言 */}
                    {repo.language && (
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-1"
                          style={{ backgroundColor: languageColor }}
                        />
                        <span>{repo.language}</span>
                      </div>
                    )}

                    {/* 星标 */}
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>{repo.stargazers_count}</span>
                    </div>

                    {/* 复刻 */}
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>{repo.forks_count}</span>
                    </div>

                    {/* 最后更新 */}
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>更新于 {formatDate(repo.pushed_at, 'relative')}</span>
                    </div>
                  </div>
                </div>

                {/* 活跃度标签 */}
                <div className={`px-3 py-1 text-xs font-medium rounded-full ${activityColor}`}>
                  {activityLabel}
                </div>
              </div>

              {/* 主题标签 */}
              {repo.topics && repo.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {repo.topics.slice(0, 5).map(topic => (
                    <span
                      key={topic}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg"
                    >
                      {topic}
                    </span>
                  ))}
                  {repo.topics.length > 5 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-lg">
                      +{repo.topics.length - 5}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 底部统计 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            显示 <span className="font-semibold text-gray-900">{filteredRepos.length}</span> 个仓库中的 
            <span className="font-semibold text-gray-900 ml-1">{repos.length}</span> 个
          </div>
          <a
            href={`https://github.com/${repos[0]?.owner?.login || 'user'}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
          >
            查看所有仓库
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default RepoList;