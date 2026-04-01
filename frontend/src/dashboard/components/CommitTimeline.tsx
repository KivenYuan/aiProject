/**
 * 提交时间线组件
 */

import React, { useState } from 'react';
import { Select, Tag } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { GitHubCommit } from '../types/github.types';
import { formatDate, getCommitTitle } from '../utils/github.utils';

interface CommitTimelineProps {
  commits: GitHubCommit[];
}

const CommitTimeline: React.FC<CommitTimelineProps> = ({ commits }) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const commitsByDate = commits.reduce((acc, commit) => {
    const date = new Date(commit.commit.committer.date).toLocaleDateString('zh-CN');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
  }, {} as Record<string, GitHubCommit[]>);

  const dateOptions = ['all', ...Object.keys(commitsByDate).slice(0, 7)];

  const filteredCommits = selectedDate === 'all'
    ? commits.slice(0, 10)
    : commitsByDate[selectedDate] || [];

  const getShortSha = (sha: string): string => sha.substring(0, 7);

  const getRepoNameFromUrl = (url: string): string => {
    const match = url.match(/repos\/([^/]+\/[^/]+)\//);
    return match ? match[1] : 'unknown';
  };

  const getChangedFilesCount = (commit: GitHubCommit): number => {
    return commit.files ? commit.files.length : 0;
  };

  const getLineChanges = (commit: GitHubCommit): { additions: number; deletions: number } => {
    if (commit.stats) {
      return { additions: commit.stats.additions, deletions: commit.stats.deletions };
    }
    return { additions: 0, deletions: 0 };
  };

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">提交时间线</h3>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">最近的代码提交记录</p>
        </div>

        <Select
          value={selectedDate}
          onChange={setSelectedDate}
          size="small"
          className="w-28 sm:w-32"
          options={dateOptions.map(date => ({
            value: date,
            label: date === 'all' ? '所有日期' : date,
          }))}
        />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {filteredCommits.length > 0 ? (
          filteredCommits.map((commit, index) => {
            const lineChanges = getLineChanges(commit);
            const changedFiles = getChangedFilesCount(commit);
            const repoName = getRepoNameFromUrl(commit.url);
            const commitTitle = getCommitTitle(commit.commit.message);
            const commitTime = formatDate(commit.commit.committer.date, 'relative');

            return (
              <div key={commit.sha} className="relative pb-4 pl-6 sm:pl-8 sm:pb-6">
                <div className="absolute left-0 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-500 shadow sm:h-3 sm:w-3" />

                {index < filteredCommits.length - 1 && (
                  <div className="absolute bottom-0 left-[4px] top-4 w-0.5 bg-gray-200 sm:left-[5px]" />
                )}

                <div className="rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100 sm:p-4">
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <h4 className="min-w-0 text-sm font-medium text-gray-900 sm:pr-4">
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-blue-600"
                      >
                        {commitTitle}
                      </a>
                    </h4>
                    <Tag className="w-fit shrink-0 font-mono text-xs">{getShortSha(commit.sha)}</Tag>
                  </div>

                  <p className="mb-2 line-clamp-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">
                    {commit.commit.message.length > 100
                      ? commit.commit.message.substring(0, 100) + '...'
                      : commit.commit.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3">
                    {commit.author && (
                      <div className="flex items-center">
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.login}
                          className="mr-1 h-4 w-4 rounded-full sm:h-5 sm:w-5"
                        />
                        <span>{commit.author.login}</span>
                      </div>
                    )}
                    <span>{commitTime}</span>
                    <span className="max-w-[80px] truncate sm:max-w-[120px]">{repoName}</span>
                    {changedFiles > 0 && <span>{changedFiles} 文件</span>}
                  </div>

                  {(lineChanges.additions > 0 || lineChanges.deletions > 0) && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                      {lineChanges.additions > 0 && (
                        <span className="text-xs font-medium text-green-600">+{lineChanges.additions}</span>
                      )}
                      {lineChanges.deletions > 0 && (
                        <span className="text-xs font-medium text-red-600">-{lineChanges.deletions}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        共 {lineChanges.additions + lineChanges.deletions} 行
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">没有找到提交记录</p>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4 sm:mt-6 sm:pt-6">
        <div className="flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <div>
            显示 <span className="font-semibold text-gray-900">{filteredCommits.length}</span> 个提交
            {selectedDate !== 'all' && `（${selectedDate}）`}
          </div>
          {commits.length > 0 && (
            <a
              href={`https://github.com/${commits[0].author?.login || 'user'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center font-medium text-blue-600 hover:text-blue-500"
            >
              查看所有提交 <ArrowRightOutlined className="ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitTimeline;
