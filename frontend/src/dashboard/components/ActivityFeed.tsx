/**
 * 活动动态组件
 */

import React, { useState } from 'react';
import type { GitHubEvent } from '../types/github.types';
import { formatDate, getEventTypeChinese, getEventIcon } from '../utils/github.utils';

interface ActivityFeedProps {
  activities: GitHubEvent[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const [eventType, setEventType] = useState<string>('all');

  // 事件类型选项
  const eventTypes = ['all', ...Array.from(new Set(activities.map(event => event.type)))];

  // 过滤活动
  const filteredActivities = eventType === 'all'
    ? activities.slice(0, 8) // 最多显示8个
    : activities.filter(event => event.type === eventType).slice(0, 8);

  // 获取事件描述
  const getEventDescription = (event: GitHubEvent): string => {
    const { type, payload } = event;
    
    switch (type) {
      case 'PushEvent':
        return `推送了 ${payload.size || 0} 个提交到 ${event.repo.name}`;
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

  // 获取事件链接
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
      case 'WatchEvent':
      case 'ReleaseEvent':
      case 'PublicEvent':
        return `https://github.com/${event.repo.name}`;
      default:
        return `https://github.com/${event.repo.name}`;
    }
  };

  // 获取事件颜色
  const getEventColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      'PushEvent': 'bg-blue-100 text-blue-800',
      'CreateEvent': 'bg-green-100 text-green-800',
      'DeleteEvent': 'bg-red-100 text-red-800',
      'ForkEvent': 'bg-purple-100 text-purple-800',
      'IssuesEvent': 'bg-yellow-100 text-yellow-800',
      'IssueCommentEvent': 'bg-indigo-100 text-indigo-800',
      'PullRequestEvent': 'bg-teal-100 text-teal-800',
      'PullRequestReviewEvent': 'bg-pink-100 text-pink-800',
      'PullRequestReviewCommentEvent': 'bg-orange-100 text-orange-800',
      'WatchEvent': 'bg-amber-100 text-amber-800',
      'ReleaseEvent': 'bg-cyan-100 text-cyan-800',
      'PublicEvent': 'bg-gray-100 text-gray-800',
    };
    
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-card backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">活动动态</h3>
          <p className="text-sm text-gray-600 mt-1">最近的GitHub活动记录</p>
        </div>
        
        {/* 事件类型筛选 */}
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">所有活动</option>
          {eventTypes.filter(type => type !== 'all').map(type => (
            <option key={type} value={type}>
              {getEventTypeChinese(type)}
            </option>
          ))}
        </select>
      </div>

      {/* 活动列表 */}
      <div className="space-y-4">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => {
            const eventDescription = getEventDescription(activity);
            const eventTime = formatDate(activity.created_at, 'relative');
            const eventLink = getEventLink(activity);
            const eventColor = getEventColor(activity.type);
            const eventIcon = getEventIcon(activity.type);

            return (
              <div 
                key={activity.id} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* 事件图标 */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${eventColor}`}>
                  <span className="text-lg">{eventIcon}</span>
                </div>

                {/* 事件内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        <a
                          href={`https://github.com/${activity.actor.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {activity.actor.login}
                        </a>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {eventDescription}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {eventTime}
                    </span>
                  </div>

                  {/* 仓库信息和链接 */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="truncate max-w-[150px]">{activity.repo.name}</span>
                    </div>

                    <a
                      href={eventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-500 font-medium flex items-center"
                    >
                      查看详情
                      <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>

                  {/* 额外信息 */}
                  {activity.payload && (
                    <div className="mt-2">
                      {activity.type === 'PushEvent' && activity.payload.commits && (
                        <div className="bg-gray-50 rounded p-2 text-xs">
                          <div className="font-medium text-gray-700 mb-1">提交信息：</div>
                          {activity.payload.commits.slice(0, 2).map((commit: any, idx: number) => (
                            <div key={idx} className="truncate text-gray-600">
                              • {commit.message.split('\n')[0]}
                            </div>
                          ))}
                          {activity.payload.commits.length > 2 && (
                            <div className="text-gray-500 mt-1">
                              还有 {activity.payload.commits.length - 2} 个提交...
                            </div>
                          )}
                        </div>
                      )}

                      {activity.type === 'IssuesEvent' && activity.payload.issue && (
                        <div className="bg-gray-50 rounded p-2 text-xs">
                          <div className="font-medium text-gray-700 mb-1">
                            {activity.payload.issue.title}
                          </div>
                          {activity.payload.issue.body && (
                            <div className="text-gray-600 line-clamp-2">
                              {activity.payload.issue.body}
                            </div>
                          )}
                        </div>
                      )}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-gray-500">没有找到活动记录</p>
            {eventType !== 'all' && (
              <p className="text-sm text-gray-400 mt-1">尝试选择"所有活动"查看全部</p>
            )}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            显示 <span className="font-semibold text-gray-900">{filteredActivities.length}</span> 个活动
            {eventType !== 'all' && `（${getEventTypeChinese(eventType)}）`}
          </div>
          {activities.length > 0 && (
            <a
              href={`https://github.com/${activities[0]?.actor?.login || 'user'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 font-medium flex items-center"
            >
              查看所有活动
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

export default ActivityFeed;