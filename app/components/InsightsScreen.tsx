'use client';

import { useMemo } from 'react';
import { useStore } from '../store';
import formatVND from '../helpers/formatVND';
import { DonutChart } from './charts/DonutChart';
import { COLOR_MAP } from '../constants/colors';

export default function InsightsScreen() {
  const { activeMonth } = useStore();

  const totalSpent = activeMonth.categories.reduce(
    (s, c) => s + c.expenses.reduce((ss, e) => ss + e.amount, 0), 0
  );
  const categoryStats = useMemo(() => {
    return activeMonth.categories
      .map(cat => {
        const spent = cat.expenses.reduce((s, e) => s + e.amount, 0);
        return { cat, spent, pct: totalSpent > 0 ? (spent / totalSpent) * 100 : 0 };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [activeMonth, totalSpent]);

  const segments = categoryStats
    .filter(s => s.spent > 0)
    .map(s => ({ pct: s.pct, color: COLOR_MAP[s.cat.color].progress }));

  // If nothing spent, show one grey ring
  const showEmpty = totalSpent === 0;

  const daysInMonth = new Date(
    parseInt(activeMonth.id.split('-')[0]),
    parseInt(activeMonth.id.split('-')[1]),
    0
  ).getDate();
  const dayOfMonth = (() => {
    const [y, m] = activeMonth.id.split('-').map(Number);
    const now = new Date();
    if (now.getFullYear() === y && now.getMonth() + 1 === m) return now.getDate();
    return daysInMonth;
  })();
  const dailyAvg = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
  const projectedTotal = dailyAvg * daysInMonth;

  return (
    <div className="flex flex-col h-full pb-35">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0">
        <h1 className="font-display text-2xl mb-0.5">Insights</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeMonth.label}</p>
      </div>

      <div className="scroll-area flex-1 px-5 pb-28">

        {/* Donut + centre */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative">
            {showEmpty ? (
              <svg width={180} height={180} viewBox="0 0 180 180">
                <circle cx={90} cy={90} r={70} fill="none" stroke="var(--border)" strokeWidth={20} />
              </svg>
            ) : (
              <DonutChart
                segments={segments}

              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>SPENT</p>
              <p className="font-display text-2xl leading-tight">{formatVND(totalSpent)}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>of {formatVND(activeMonth.budgetGoal)}</p>
            </div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'DAILY AVG', value: formatVND(dailyAvg) },
            { label: 'PROJECTED', value: formatVND(projectedTotal), warning: projectedTotal > activeMonth.budgetGoal },
            { label: 'SAVED', value: totalSpent < activeMonth.budgetGoal ? formatVND(activeMonth.budgetGoal - totalSpent) : '-' + formatVND(totalSpent - activeMonth.budgetGoal), green: totalSpent < activeMonth.budgetGoal },
          ].map(m => (
            <div key={m.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
              <p className="font-display text-base leading-none"
                style={{ color: m.warning ? '#C4533A' : m.green ? '#3A9C6E' : 'var(--text-primary)' }}>
                {m.value}
              </p>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          BREAKDOWN BY CATEGORY
        </p>

        {categoryStats.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-2">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add categories to see insights</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 ">
            {categoryStats.map(({ cat, spent, pct }) => {
              const colors = COLOR_MAP[cat.color];
              const catBudgetPct = Math.min((spent / cat.budget) * 100, 100);
              const over = spent > cat.budget;

              return (
                <div key={cat.id} className="rounded-2xl p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                        style={{ background: colors.bg }}>
                        {cat.emoji}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cat.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {cat.expenses.length} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: over ? colors.text : 'var(--text-primary)' }}>
                        {formatVND(spent)}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {Math.round(pct)}% of total
                      </p>
                    </div>
                  </div>

                  {/* Budget progress */}
                  <div className="progress-track h-1.5 mb-1">
                    <div className="progress-fill h-full"
                      style={{ width: `${catBudgetPct}%`, background: over ? colors.text : colors.progress + 'CC' }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {Math.round(catBudgetPct)}% of {formatVND(cat.budget)} budget
                    </span>
                    {over && (
                      <span className="text-xs font-medium" style={{ color: colors.text }}>
                        Over by {formatVND(spent - cat.budget)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Monthly budget bar */}
        <div className="mt-5 rounded-2xl p-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between mb-2">
            <p className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
              OVERALL BUDGET
            </p>
            <p className="text-xs font-medium"
              style={{ color: totalSpent > activeMonth.budgetGoal ? '#C4533A' : '#3A9C6E' }}>
              {totalSpent > activeMonth.budgetGoal
                ? `${Math.round((totalSpent / activeMonth.budgetGoal) * 100 - 100)}% over`
                : `${Math.round((1 - totalSpent / activeMonth.budgetGoal) * 100)}% left`}
            </p>
          </div>
          <div className="progress-track h-3 mb-2">
            <div className="progress-fill h-full"
              style={{
                width: `${Math.min((totalSpent / activeMonth.budgetGoal) * 100, 100)}%`,
                background: totalSpent > activeMonth.budgetGoal ? '#C4533A'
                  : totalSpent / activeMonth.budgetGoal > 0.8 ? '#C49A3A'
                    : '#3A9C6E',
              }} />
          </div>
          <div className="flex justify-between">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{formatVND(totalSpent)} spent</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatVND(activeMonth.budgetGoal)} goal</span>
          </div>
        </div>

      </div>
    </div>
  );
}
