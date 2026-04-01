/**
 * 仓库列表组件
 */

import React, { useState } from 'react';
import { Select, Tag } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { GitHubRepo } from '../types/github.types';
import { formatDate, getRepoPrimaryLanguage, calculateRepoActivityScore, getLanguageColor } from '../utils/github.utils';

interface RepoListProps {
  repos: GitHubRepo[];
}

const RepoList: React.FC<RepoListProps> = ({ repos }) => {
  const [sortBy, setSortBy] = useState<'updated' | 'stars' | 'forks'>('updated');
  const [filterLanguage, setFilterLanguage] = useState<string>('all');

  const languages = ['all', ...Array.from(new Set(repos.map(repo => repo.language || 'Unknown').filter(Boolean)))];

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
    .slice(0, 10);

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

  const getActivityColor = (score: number): string => {
    switch (score) {
      case 5: return 'green';
      case 4: return 'blue';
      case 3: return 'gold';
      case 2: return 'orange';
      case 1: return 'red';
      default: return 'default';
    }
  };

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">仓库列表</h3>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">显示你的GitHub仓库，按活跃度排序</p>
        </div>

        <div className="flex gap-2">
          <Select
            value={sortBy}
            onChange={setSortBy}
            size="small"
            className="w-24 sm:w-28"
            options={[
              { value: 'updated', label: '最近更新' },
              { value: 'stars', label: '最多星标' },
              { value: 'forks', label: '最多复刻' },
            ]}
          />
          <Select
            value={filterLanguage}
            onChange={setFilterLanguage}
            size="small"
            className="w-24 sm:w-28"
            options={languages.map(lang => ({
              value: lang,
              label: lang === 'all' ? '所有语言' : lang,
            }))}
          />
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {filteredRepos.map(repo => {
          const activityScore = calculateRepoActivityScore(repo);
          const activityLabel = getActivityLabel(activityScore);
          const activityTagColor = getActivityColor(activityScore);
          const language = getRepoPrimaryLanguage(repo);
          const languageColor = getLanguageColor(language);

          return (
            <div
              key={repo.id}
              className="rounded-xl border border-gray-200 p-3 transition-all duration-300 hover:border-blue-300 hover:shadow-sm sm:p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 sm:mb-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-base font-semibold text-gray-900 transition-colors hover:text-blue-600 sm:text-lg"
                    >
                      {repo.name}
                    </a>
                    {repo.private && <Tag>私有</Tag>}
                  </div>

                  {repo.description && (
                    <p className="mb-2 line-clamp-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">{repo.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3 sm:text-sm">
                    {repo.language && (
                      <div className="flex items-center">
                        <div className="mr-1 h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3" style={{ backgroundColor: languageColor }} />
                        <span>{repo.language}</span>
                      </div>
                    )}
                    <span>★ {repo.stargazers_count}</span>
                    <span>⑂ {repo.forks_count}</span>
                    <span className="hidden sm:inline">更新于 {formatDate(repo.pushed_at, 'relative')}</span>
                  </div>
                </div>

                <Tag color={activityTagColor} className="shrink-0 self-start">
                  {activityLabel}
                </Tag>
              </div>

              {repo.topics && repo.topics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                  {repo.topics.slice(0, 5).map(topic => (
                    <Tag key={topic} color="blue" className="text-xs">
                      {topic}
                    </Tag>
                  ))}
                  {repo.topics.length > 5 && (
                    <Tag className="text-xs">+{repo.topics.length - 5}</Tag>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4 sm:mt-6 sm:pt-6">
        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            显示 <span className="font-semibold text-gray-900">{filteredRepos.length}</span> / <span className="font-semibold text-gray-900">{repos.length}</span> 个仓库
          </div>
          <a
            href={`https://github.com/${repos[0]?.owner?.login || 'user'}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center font-medium text-blue-600 hover:text-blue-500"
          >
            查看所有仓库 <ArrowRightOutlined className="ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RepoList;
