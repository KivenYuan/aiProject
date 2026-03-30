/**
 * 提交时间线组件
 */

import React, { useState } from 'react';
import type { GitHubCommit } from '../types/github.types';
import { formatDate, getCommitTitle } from '../utils/github.utils';

interface CommitTimelineProps {
  commits: GitHubCommit[];
}

const CommitTimeline: React.FC<CommitTimelineProps> = ({ commits }) => {
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // 按日期分组提交
  const commitsByDate = commits.reduce((acc, commit) => {
    const date = new Date(commit.commit.committer.date).toLocaleDateString('zh-CN');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(commit);
    return acc;
  }, {} as Record<string, GitHubCommit[]>);

  // 获取日期选项
  const dateOptions = ['all', ...Object.keys(commitsByDate).slice(0, 7)]; // 最近7天

  // 过滤提交
  const filteredCommits = selectedDate === 'all' 
    ? commits.slice(0, 10) // 最多显示10个
    : commitsByDate[selectedDate] || [];

  // 获取提交的简短哈希
  const getShortSha = (sha: string): string => sha.substring(0, 7);

  // 获取仓库名从提交URL
  const getRepoNameFromUrl = (url: string): string => {
    const match = url.match(/repos\/([^/]+\/[^/]+)\//);
    return match ? match[1] : 'unknown';
  };

  // 获取提交影响的文件数量
  const getChangedFilesCount = (commit: GitHubCommit): number => {
    return commit.files ? commit.files.length : 0;
  };

  // 获取提交的增减行数
  const getLineChanges = (commit: GitHubCommit): { additions: number; deletions: number } => {
    if (commit.stats) {
      return {
        additions: commit.stats.additions,
        deletions: commit.stats.deletions
      };
    }
    return { additions: 0, deletions: 0 };
  };

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">提交时间线</h3>
          <p className="text-sm text-gray-600 mt-1">最近的代码提交记录</p>
        </div>
        
        {/* 日期筛选 */}
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
        >
          <option value="all">所有日期</option>
          {dateOptions.filter(date => date !== 'all').map(date => (
            <option key={date} value={date}>
              {date}
            </option>
          ))}
        </select>
      </div>

      {/* 时间线 */}
      <div className="space-y-6">
        {filteredCommits.length > 0 ? (
          filteredCommits.map((commit, index) => {
            const lineChanges = getLineChanges(commit);
            const changedFiles = getChangedFilesCount(commit);
            const repoName = getRepoNameFromUrl(commit.url);
            const commitTitle = getCommitTitle(commit.commit.message);
            const commitTime = formatDate(commit.commit.committer.date, 'relative');
            
            return (
              <div key={commit.sha} className="relative pl-8 pb-6">
                {/* 时间线节点 */}
                <div className="absolute left-0 top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow"></div>
                
                {/* 连接线 */}
                {index < filteredCommits.length - 1 && (
                  <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-gray-200"></div>
                )}

                {/* 提交卡片 */}
                <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                  {/* 提交标题 */}
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h4 className="font-medium text-gray-900 pr-4">
                      <a 
                        href={commit.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors"
                      >
                        {commitTitle}
                      </a>
                    </h4>
                    <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      {getShortSha(commit.sha)}
                    </span>
                  </div>

                  {/* 提交信息 */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {commit.commit.message.length > 100 
                      ? commit.commit.message.substring(0, 100) + '...'
                      : commit.commit.message}
                  </p>

                  {/* 元信息 */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    {/* 作者 */}
                    {commit.author && (
                      <div className="flex items-center">
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.login}
                          className="w-5 h-5 rounded-full mr-1"
                        />
                        <span>{commit.author.login}</span>
                      </div>
                    )}

                    {/* 时间 */}
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{commitTime}</span>
                    </div>

                    {/* 仓库 */}
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="max-w-[100px] truncate">{repoName}</span>
                    </div>

                    {/* 文件变更 */}
                    {changedFiles > 0 && (
                      <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{changedFiles} 文件</span>
                      </div>
                    )}
                  </div>

                  {/* 代码变更统计 */}
                  {(lineChanges.additions > 0 || lineChanges.deletions > 0) && (
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-1 flex-wrap gap-2">
                        {/* 增加行数 */}
                        {lineChanges.additions > 0 && (
                          <div className="flex items-center text-xs">
                            <span className="text-green-600 font-medium mr-1">+{lineChanges.additions}</span>
                            <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(lineChanges.additions / (lineChanges.additions + lineChanges.deletions)) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* 删除行数 */}
                        {lineChanges.deletions > 0 && (
                          <div className="flex items-center text-xs">
                            <span className="text-red-600 font-medium mr-1">-{lineChanges.deletions}</span>
                            <div className="w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 rounded-full"
                                style={{ width: `${(lineChanges.deletions / (lineChanges.additions + lineChanges.deletions)) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 总变更行数 */}
                      <div className="text-xs text-gray-500 sm:whitespace-nowrap">
                        共 {lineChanges.additions + lineChanges.deletions} 行
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">没有找到提交记录</p>
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="mt-6 border-t border-gray-200 pt-6">
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
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
            >
              查看所有提交
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitTimeline;