/**
 * 活动动态组件
 */

import React, { useState } from 'react';
import { Select } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import type { GitHubEvent } from '../types/github.types';
import { formatDate, getEventTypeChinese, getEventIcon } from '../utils/github.utils';

interface ActivityFeedProps {
  activities: GitHubEvent[];
}

interface PushCommitSummary {
  message: string;
}

/** PushEvent：GitHub 自 2025-10 起可能在 Events API 中省略 size/commits，需降级文案 */
function getPushDescription(repoName: string, payload: Record<string, unknown>): string {
  const commits = Array.isArray(payload.commits) ? payload.commits : [];
  const n =
    (typeof payload.size === 'number' && payload.size > 0 ? payload.size : 0) ||
    (typeof payload.distinct_size === 'number' && payload.distinct_size > 0 ? payload.distinct_size : 0) ||
    commits.length;
  if (n > 0) {
    return `推送了 ${n} 个提交到 ${repoName}`;
  }
  return `推送了代码到 ${repoName}`;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [eventType, setEventType] = useState<string>('all');

  const eventTypes = ['all', ...Array.from(new Set(activities.map(event => event.type)))];

  const filteredActivities = eventType === 'all'
    ? activities.slice(0, 8)
    : activities.filter(event => event.type === eventType).slice(0, 8);

  const getEventDescription = (event: GitHubEvent): string => {
    const { type, payload } = event;
    switch (type) {
      case 'PushEvent':
        return getPushDescription(event.repo.name, payload as Record<string, unknown>);
      case 'CreateEvent':
        return `创建了 ${payload.ref_type} "${payload.ref || '资源'}" 在 ${event.repo.name}`;
      case 'DeleteEvent':
        return `删除了 ${payload.ref_type} "${payload.ref}" 从 ${event.repo.name}`;
      case 'ForkEvent':
        return `复刻了 ${payload.forkee?.full_name || '仓库'} 从 ${event.repo.name}`;
      case 'IssuesEvent':
        return `${payload.action} 了 issue #${payload.issue?.number || ''} 在 ${event.repo.name}`;
      case 'IssueCommentEvent':
        return `评论了 issue #${payload.issue?.number || ''} 在 ${event.repo.name}`;
      case 'PullRequestEvent':
        return `${payload.action} 了 PR #${payload.pull_request?.number || ''} 在 ${event.repo.name}`;
      case 'PullRequestReviewEvent':
        return `审核了 PR #${payload.pull_request?.number || ''} 在 ${event.repo.name}`;
      case 'PullRequestReviewCommentEvent':
        return `评论了 PR #${payload.pull_request?.number || ''} 在 ${event.repo.name}`;
      case 'WatchEvent':
        return `星标了 ${event.repo.name}`;
      case 'ReleaseEvent':
        return `发布了 ${payload.release?.tag_name || '版本'} 在 ${event.repo.name}`;
      case 'PublicEvent':
        return `公开了仓库 ${event.repo.name}`;
      default:
        return `在 ${event.repo.name} 进行了操作`;
    }
  };

  const getEventLink = (event: GitHubEvent): string => {
    const { type, payload } = event;
    switch (type) {
      case 'PushEvent':
        return `https://github.com/${event.repo.name}/commits/${payload.ref || 'main'}`;
      case 'CreateEvent':
      case 'DeleteEvent':
        return `https://github.com/${event.repo.name}`;
      case 'ForkEvent':
        return payload.forkee?.html_url || `https://github.com/${event.repo.name}`;
      case 'IssuesEvent':
      case 'IssueCommentEvent':
        return payload.issue?.html_url || `https://github.com/${event.repo.name}`;
      case 'PullRequestEvent':
      case 'PullRequestReviewEvent':
      case 'PullRequestReviewCommentEvent':
        return payload.pull_request?.html_url || `https://github.com/${event.repo.name}`;
      default:
        return `https://github.com/${event.repo.name}`;
    }
  };

  const getEventColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'PushEvent': 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-200',
      'CreateEvent': 'bg-green-100 text-green-800 dark:bg-emerald-950/70 dark:text-emerald-200',
      'DeleteEvent': 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-200',
      'ForkEvent': 'bg-purple-100 text-purple-800 dark:bg-violet-950/70 dark:text-violet-200',
      'IssuesEvent': 'bg-yellow-100 text-yellow-800 dark:bg-amber-950/60 dark:text-amber-200',
      'IssueCommentEvent': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-200',
      'PullRequestEvent': 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-200',
      'PullRequestReviewEvent': 'bg-pink-100 text-pink-800 dark:bg-rose-950/70 dark:text-rose-200',
      'PullRequestReviewCommentEvent': 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-200',
      'WatchEvent': 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
      'ReleaseEvent': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-200',
      'PublicEvent': 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200';
  };

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 sm:text-xl">活动动态</h3>
          <p className="mt-1 text-xs text-gray-600 dark:text-slate-400 sm:text-sm">最近的GitHub活动记录</p>
        </div>

        <Select
          value={eventType}
          onChange={setEventType}
          size="small"
          className="activity-feed-type-select min-w-[7rem] sm:min-w-[8rem]"
          popupMatchSelectWidth={false}
          styles={{
            popup: {
              root: {
                border: '1px solid rgba(148, 163, 184, 0.45)',
                borderRadius: 8,
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
              },
            },
          }}
          options={eventTypes.map(type => ({
            value: type,
            label: type === 'all' ? '所有活动' : getEventTypeChinese(type),
          }))}
        />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => {
            const eventDescription = getEventDescription(activity);
            const eventTime = formatDate(activity.created_at, 'relative');
            const eventLink = getEventLink(activity);
            const eventColor = getEventColor(activity.type);
            const eventIcon = getEventIcon(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/70 sm:p-3"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${eventColor}`}>
                  <span className="text-base sm:text-lg">{eventIcon}</span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900 dark:text-slate-100">
                        <a
                          href={`https://github.com/${activity.actor.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {activity.actor.login}
                        </a>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-600 dark:text-slate-300 sm:mt-1 sm:text-sm">
                        {eventDescription}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-500 dark:text-slate-400">
                      {eventTime}
                    </span>
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 sm:mt-2">
                    <div className="flex items-center text-xs text-gray-500 dark:text-slate-400">
                      <span className="max-w-[120px] truncate sm:max-w-[180px]">{activity.repo.name}</span>
                    </div>
                    <a
                      href={eventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      查看详情
                      <svg className="ml-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {activity.payload &&
                    activity.type === 'PushEvent' &&
                    Array.isArray(activity.payload.commits) &&
                    activity.payload.commits.length > 0 && (
                    <div className="mt-2 rounded bg-gray-50 p-2 text-xs dark:bg-slate-800/80">
                      <div className="mb-1 font-medium text-gray-700 dark:text-slate-200">提交信息：</div>
                      {(activity.payload.commits as PushCommitSummary[]).slice(0, 2).map((commit, idx: number) => (
                        <div key={idx} className="truncate text-gray-600 dark:text-slate-300">• {commit.message.split('\n')[0]}</div>
                      ))}
                      {activity.payload.commits.length > 2 && (
                        <div className="mt-1 text-gray-500 dark:text-slate-400">还有 {activity.payload.commits.length - 2} 个提交...</div>
                      )}
                    </div>
                  )}

                  {activity.payload && activity.type === 'IssuesEvent' && activity.payload.issue && (
                    <div className="mt-2 rounded bg-gray-50 p-2 text-xs dark:bg-slate-800/80">
                      <div className="mb-1 font-medium text-gray-700 dark:text-slate-200">{activity.payload.issue.title}</div>
                      {activity.payload.issue.body && (
                        <div className="line-clamp-2 text-gray-600 dark:text-slate-300">{activity.payload.issue.body}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-slate-400">没有找到活动记录</p>
            {eventType !== 'all' && (
              <p className="mt-1 text-sm text-gray-400 dark:text-slate-500">尝试选择"所有活动"查看全部</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-slate-600/60 sm:mt-6 sm:pt-6">
        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            显示 <span className="font-semibold text-gray-900 dark:text-slate-100">{filteredActivities.length}</span> 个活动
            {eventType !== 'all' && `（${getEventTypeChinese(eventType)}）`}
          </div>
          {activities.length > 0 && (
            <a
              href={`https://github.com/${activities[0]?.actor?.login || 'user'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              查看所有活动 <ArrowRightOutlined className="ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
