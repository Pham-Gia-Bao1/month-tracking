'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Search, Trash2 } from 'lucide-react';
import { Expense, Category } from '../types';
import formatVND from '../helpers/formatVND';
import { COLOR_MAP } from '../constants/colors';

interface FlatExpense extends Expense {
  category: Category;
}

export default function HistoryScreen() {
  const { activeMonth, dispatch } = useStore();
  const [query, setQuery] = useState('');
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const allExpenses: FlatExpense[] = useMemo(() => {
    const items: FlatExpense[] = [];
    for (const cat of activeMonth.categories) {
      for (const exp of cat.expenses) {
        items.push({ ...exp, category: cat });
      }
    }
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [activeMonth]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allExpenses;
    const q = query.toLowerCase();
    return allExpenses.filter(e =>
      e.note.toLowerCase().includes(q) ||
      e.category.name.toLowerCase().includes(q) ||
      String(e.amount).includes(q)
    );
  }, [allExpenses, query]);

  // Group by date label
  const grouped = useMemo(() => {
    const groups: Record<string, FlatExpense[]> = {};
    for (const e of filtered) {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    }
    return Object.entries(groups);
  }, [filtered]);

  const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);

  const handleDelete = (e: FlatExpense) => {
    dispatch({ type: 'DELETE_EXPENSE', monthId: activeMonth.id, categoryId: e.category.id, expenseId: e.id });
    setSwipedId(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-14 pb-4 flex-shrink-0">
        <h1 className="font-display text-2xl mb-0.5">Request History</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {allExpenses.length} transactions · {formatVND(totalSpent)} spent
        </p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search expenses..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="scroll-area flex-1 px-5 pb-28">
        {allExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="text-5xl">📋</div>
            <p className="font-display text-xl" style={{ color: 'var(--text-secondary)' }}>No transactions yet</p>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Tap a category on the Overview tab to log your first expense
            </p>
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <Search size={28} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results for `{query}`</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {grouped.map(([date, expenses]) => (
              <div key={date}>
                <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  {date.toUpperCase()}
                </p>
                <div className="flex flex-col gap-2">
                  {expenses.map((exp) => {
                    const colors = COLOR_MAP[exp.category.color];
                    const isSwiped = swipedId === exp.id;

                    return (
                      <div key={exp.id} className="relative overflow-hidden rounded-2xl">
                        {/* Delete bg */}
                        <div className="absolute inset-0 flex items-center justify-end pr-5 rounded-2xl"
                          style={{ background: 'var(--accent)' }}>
                          <Trash2 size={18} color="white" />
                        </div>

                        {/* Row */}
                        <div
                          className="relative flex items-center justify-between px-4 py-3.5 rounded-2xl"
                          style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            transform: isSwiped ? 'translateX(-72px)' : 'translateX(0)',
                            transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
                          }}
                          onTouchStart={(e) => {
                            const startX = e.touches[0].clientX;
                            const el = e.currentTarget;
                            const onMove = (me: TouchEvent) => {
                              const dx = me.touches[0].clientX - startX;
                              if (dx < -10) setSwipedId(exp.id);
                              else if (dx > 10) setSwipedId(null);
                            };
                            const onEnd = () => {
                              el.removeEventListener('touchmove', onMove);
                              el.removeEventListener('touchend', onEnd);
                            };
                            el.addEventListener('touchmove', onMove, { passive: true });
                            el.addEventListener('touchend', onEnd);
                          }}
                          onClick={() => isSwiped && handleDelete(exp)}
                        >
                          <div className="flex items-center gap-3">
                            {/* Category dot + icon */}
                            <div className="relative">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                style={{ background: colors.bg }}>
                                {exp.category.emoji}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-sm leading-tight">
                                {exp.note || exp.category.name}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: colors.text }}>
                                {exp.category.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                -{formatVND(exp.amount)}
                              </p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cash</p>
                            </div>
                            {/* Status badge like the mockup */}
                            <div className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: colors.bg, color: colors.text }}>
                              PAID
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
