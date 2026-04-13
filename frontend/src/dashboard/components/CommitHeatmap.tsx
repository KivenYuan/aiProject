/**
 * 代码提交热力图：GitHub 风格（固定近一年）
 */

import React, { useMemo } from 'react';
import { Tooltip } from 'antd';

const WEEKS = 53;
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Cell = { date: string; count: number; future: boolean };
type MonthLabel = { weekIndex: number; label: string };

function startOfUTCDay(ts: number): Date {
  const d = new Date(ts);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function buildRollingYearData(counts: Record<string, number>): { columns: Cell[][]; monthLabels: MonthLabel[] } {
  const today = startOfUTCDay(Date.now());
  const endMs = today.getTime();
  const dow = today.getUTCDay();
  const currentWeekSunday = new Date(today);
  currentWeekSunday.setUTCDate(today.getUTCDate() - dow);

  const firstWeekSunday = new Date(currentWeekSunday);
  firstWeekSunday.setUTCDate(currentWeekSunday.getUTCDate() - (WEEKS - 1) * 7);

  const columns: Cell[][] = [];
  const monthLabels: MonthLabel[] = [];
  const seenMonths = new Set<string>();

  for (let w = 0; w < WEEKS; w++) {
    const col: Cell[] = [];
    const weekStart = new Date(firstWeekSunday);
    weekStart.setUTCDate(firstWeekSunday.getUTCDate() + w * 7);

    for (let r = 0; r < 7; r++) {
      const cell = new Date(weekStart);
      cell.setUTCDate(weekStart.getUTCDate() + r);
      const day = startOfUTCDay(cell.getTime());
      const dateStr = utcDayKey(day);
      const future = day.getTime() > endMs;

      if (day.getUTCDate() === 1) {
        const mk = `${day.getUTCFullYear()}-${day.getUTCMonth()}`;
        if (!seenMonths.has(mk)) {
          seenMonths.add(mk);
          monthLabels.push({ weekIndex: w, label: MONTH_NAMES[day.getUTCMonth()] });
        }
      }

      col.push({ date: dateStr, count: future ? 0 : counts[dateStr] || 0, future });
    }

    columns.push(col);
  }

  if (monthLabels.length === 0) {
    monthLabels.push({ weekIndex: 0, label: MONTH_NAMES[firstWeekSunday.getUTCMonth()] });
  }

  return { columns, monthLabels };
}

function levelForCount(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0;
  const ratio = count / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const levelClass: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-slate-200/85 dark:bg-slate-800/90',
  1: 'bg-emerald-200/90 dark:bg-emerald-900/55',
  2: 'bg-emerald-300 dark:bg-emerald-700/55',
  3: 'bg-emerald-500/90 dark:bg-emerald-600/65',
  4: 'bg-emerald-600 dark:bg-emerald-500/75',
};

const futureClass = 'bg-slate-100 dark:bg-slate-800/40 opacity-60';
const cellHoverClass =
  'cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-emerald-500/55 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-emerald-400/45 dark:hover:ring-offset-slate-900';

function tooltipContent(date: string, count: number, future: boolean): React.ReactNode {
  if (future) return <span>{date}（未到）</span>;
  if (count <= 0) return <span>{date} · 无提交</span>;
  return <span>{date} · {count} 次提交</span>;
}

export interface CommitHeatmapProps {
  commitHeatmap: Record<string, number>;
}

const CommitHeatmap: React.FC<CommitHeatmapProps> = ({ commitHeatmap }) => {
  const { columns, monthLabels } = useMemo(() => buildRollingYearData(commitHeatmap), [commitHeatmap]);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const week of columns) {
      for (const cell of week) {
        if (!cell.future && cell.count > max) max = cell.count;
      }
    }
    return max;
  }, [columns]);

  const total = useMemo(() => {
    let sum = 0;
    for (const week of columns) {
      for (const cell of week) {
        if (!cell.future) sum += cell.count;
      }
    }
    return sum;
  }, [columns]);

  return (
    <div className="dashboard-panel w-full rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-card backdrop-blur-sm sm:p-6 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 sm:text-xl">提交热力图</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">近一年共 {total} 次提交</p>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white/70 px-3 py-3 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 sm:px-4 sm:py-4">
        <div className="relative mb-2 ml-10 h-5 sm:ml-12">
          {monthLabels.map((m) => (
            <span
              key={`${m.label}-${m.weekIndex}`}
              className="absolute top-0 text-[11px] text-slate-500 dark:text-slate-300 sm:text-xs"
              style={{ left: `calc(${(m.weekIndex / columns.length) * 100}% - 2px)` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex min-w-0 gap-2">
          <div className="mt-[1px] flex w-8 shrink-0 flex-col justify-between text-[11px] text-slate-500 dark:text-slate-300 sm:w-10 sm:text-xs">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          <div className="flex min-w-0 flex-1 gap-[3px]">
            {columns.map((week, wi) => (
              <div key={wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {week.map((cell) => {
                  const level = cell.future ? 0 : levelForCount(cell.count, maxCount);
                  return (
                    <Tooltip
                      key={cell.date}
                      title={tooltipContent(cell.date, cell.count, cell.future)}
                      mouseEnterDelay={0.1}
                      placement="top"
                      overlayInnerStyle={{ maxWidth: 340 }}
                    >
                      <div
                        className={`h-[9px] min-w-0 flex-1 rounded-[2px] sm:h-[11px] ${
                          cell.future ? futureClass : levelClass[level]
                        } ${cell.future ? 'cursor-default' : cellHoverClass}`}
                      />
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-slate-500 dark:text-slate-300">
          <span className="mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((lv) => (
            <span key={lv} className={`h-[10px] w-[10px] rounded-[2px] ${levelClass[lv as 0 | 1 | 2 | 3 | 4]}`} />
          ))}
          <span className="ml-1">More</span>
        </div>
      </div>
    </div>
  );
};

export default CommitHeatmap;
