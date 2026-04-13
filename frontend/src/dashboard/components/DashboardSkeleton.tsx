/**
 * 仪表盘数据加载中的骨架屏（对齐 GitHubStatsCard + 仓库 / 提交 / 动态布局）
 */

import React from 'react';

const panel =
  'dashboard-panel rounded-2xl border border-slate-200/80 bg-white/90 shadow-card backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/85';

const bone = 'animate-pulse rounded-lg bg-slate-200/90 dark:bg-slate-700/55';

function StatBoxSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-600/80">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className={`h-3.5 w-16 ${bone}`} />
          <div className={`h-8 w-20 ${bone}`} />
        </div>
        <div className={`h-10 w-10 shrink-0 rounded-lg ${bone}`} />
      </div>
      <div className={`mt-3 h-3 w-24 ${bone}`} />
    </div>
  );
}

const DashboardSkeleton: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-8"
    >
      <span className="sr-only">正在加载仪表盘数据，请稍候</span>

      {/* 统计卡片区域（对齐 GitHubStatsCard 上部 + 中部） */}
      <div className={`${panel} p-6 md:p-8`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
          <StatBoxSkeleton />
          <StatBoxSkeleton />
          <StatBoxSkeleton />
          <StatBoxSkeleton />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className={`h-6 w-40 ${bone}`} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between gap-4">
                  <div className={`h-4 w-28 ${bone}`} />
                  <div className={`h-4 w-10 ${bone}`} />
                </div>
                <div className={`h-2 w-full rounded-full ${bone}`} />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className={`h-6 w-24 ${bone}`} />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100/80 p-3 dark:border-slate-700/80"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className={`h-8 w-8 shrink-0 rounded-lg ${bone}`} />
                  <div className="min-w-0 space-y-1.5">
                    <div className={`h-3.5 w-20 ${bone}`} />
                    <div className={`h-3 w-28 ${bone}`} />
                  </div>
                </div>
                <div className={`h-6 w-10 shrink-0 ${bone}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 shrink-0 rounded-full ${bone}`} />
              <div className="min-w-0 space-y-2">
                <div className={`h-5 w-36 ${bone}`} />
                <div className={`h-3.5 w-48 max-w-full ${bone}`} />
              </div>
            </div>
            <div className={`h-10 w-full rounded-xl sm:w-36 ${bone}`} />
          </div>
        </div>
      </div>

      <div className={`${panel} p-4 sm:p-6`}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className={`h-6 w-32 ${bone}`} />
            <div className={`h-3.5 w-full max-w-md ${bone}`} />
          </div>
          <div className={`h-4 w-36 ${bone}`} />
        </div>
        <div className="flex gap-px overflow-hidden pt-1">
          {Array.from({ length: 53 }).map((_, wi) => (
            <div key={wi} className="flex flex-col gap-px">
              {[0, 1, 2, 3, 4, 5, 6].map((di) => (
                <div key={di} className={`h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3 ${bone}`} />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-px">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-2.5 w-2.5 rounded-sm sm:h-3 sm:w-3 ${bone}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* 仓库列表骨架 */}
        <div className={`${panel} p-4 sm:p-6`}>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className={`h-6 w-28 ${bone}`} />
              <div className={`h-3.5 w-48 ${bone}`} />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <div className={`h-10 w-full rounded-lg sm:w-36 ${bone}`} />
              <div className={`h-10 w-full rounded-lg sm:w-36 ${bone}`} />
            </div>
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-slate-200/80 p-4 dark:border-slate-700/80">
                <div className={`mb-3 h-5 w-2/3 max-w-[240px] ${bone}`} />
                <div className={`mb-3 h-3.5 w-full ${bone}`} />
                <div className={`h-3.5 w-4/5 ${bone}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* 提交时间线骨架 */}
          <div className={`${panel} p-4 sm:p-6`}>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className={`h-6 w-28 ${bone}`} />
                <div className={`h-3.5 w-40 ${bone}`} />
              </div>
              <div className={`h-10 w-full rounded-lg sm:w-40 ${bone}`} />
            </div>
            <div className="space-y-6 pl-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute left-0 top-1 h-3 w-3 rounded-full ${bone}`} />
                  <div className="rounded-xl bg-slate-50/90 p-4 dark:bg-slate-800/50">
                    <div className="mb-2 flex gap-2">
                      <div className={`h-4 flex-1 ${bone}`} />
                      <div className={`h-4 w-16 shrink-0 ${bone}`} />
                    </div>
                    <div className={`mb-2 h-3.5 w-full ${bone}`} />
                    <div className={`h-3 w-2/3 ${bone}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 活动动态骨架 */}
          <div className={`${panel} p-4 sm:p-6`}>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className={`h-6 w-24 ${bone}`} />
                <div className={`h-3.5 w-44 ${bone}`} />
              </div>
              <div className={`h-10 w-full rounded-lg sm:w-40 ${bone}`} />
            </div>
            <div className="space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-slate-200/60 p-3 dark:border-slate-700/60">
                  <div className={`h-10 w-10 shrink-0 rounded-xl ${bone}`} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className={`h-3.5 w-3/4 ${bone}`} />
                    <div className={`h-3 w-full ${bone}`} />
                    <div className={`h-3 w-1/3 ${bone}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
