'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '../store';
import { COLOR_MAP } from '../constants/colors';
import { Category } from '../types';
import { Plus, ChevronRight, TrendingDown, Target, Pencil, LayoutGrid, Clock, BarChart2, Undo } from 'lucide-react';
import ExpenseSheet from './ExpenseSheet';
import AddCategoryModal from './AddCategoryModal';
import { MonthPicker } from './MonthPicker';
import CategoryDetail from './CategoryDetail';
import HistoryScreen from './HistoryScreen';
import InsightsScreen from './InsightsScreen';
import formatVND from '../helpers/formatVND';
import {SwipeItem} from './SwipeItem';

type Tab = 'overview' | 'history' | 'insights';

export const Dashboard= () => {
  const { activeMonth, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [expenseTarget, setExpenseTarget] = useState<Category | null>(null);
  const [detailTarget, setDetailTarget] = useState<Category | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [editBudget, setEditBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [sortBySpent, setSortBySpent] = useState<'none' | 'asc' | 'desc'>('none');
  const [lastDeleted, setLastDeleted] = useState<{
    category: Category;
    monthId: string;
  } | null>(null);

  const totalSpent = activeMonth.categories.reduce(
    (sum, c) => sum + c.expenses.reduce((s, e) => s + e.amount, 0), 0
  );
  const remaining = activeMonth.budgetGoal - totalSpent;
  const progress = Math.min((totalSpent / activeMonth.budgetGoal) * 100, 100);
  const overBudget = totalSpent > activeMonth.budgetGoal;
  const totalCategoryBudget = activeMonth.categories.reduce(
    (sum, c) => sum + c.budget,
    0
  );
  const remainingCategoryBudget = activeMonth.budgetGoal - totalCategoryBudget;
  const handleBudgetSave = useCallback(() => {
    const val = parseFloat(budgetInput);

    if (isNaN(val) || val <= 0) {
      setEditBudget(false);
      return;
    }

    if (val < totalCategoryBudget) {
      alert(`Budget phải >= ${totalCategoryBudget} (tổng category)`);
      return;
    }

    dispatch({
      type: 'SET_BUDGET_GOAL',
      monthId: activeMonth.id,
      amount: val,
    });

    setEditBudget(false);
  }, [budgetInput, activeMonth.id, dispatch, totalCategoryBudget]);
  const liveExpenseTarget = expenseTarget
    ? activeMonth.categories.find(c => c.id === expenseTarget.id) ?? null : null;
  const liveDetailTarget = detailTarget
    ? activeMonth.categories.find(c => c.id === detailTarget.id) ?? null : null;

  const handleUndo = () => {
    if (!lastDeleted) return;

    const cat = lastDeleted.category;

    dispatch({
      type: 'ADD_CATEGORY',
      monthId: lastDeleted.monthId,
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      budget: cat.budget,
    });

    setLastDeleted(null);
  };

  const handleBudgetChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // chỉ cho nhập số
    if (!/^\d*$/.test(value)) return;

    setBudgetInput(value);
  }, []);

  const sortedCategories = [...activeMonth.categories].sort((a, b) => {
    if (sortBySpent === 'none') return 0;

    const spentA = a.expenses.reduce((s, e) => s + e.amount, 0);
    const spentB = b.expenses.reduce((s, e) => s + e.amount, 0);

    return sortBySpent === 'desc'
      ? spentB - spentA // nhiều → ít
      : spentA - spentB; // ít → nhiều
  });
  useEffect(() => {
    if (!lastDeleted) return;

    const timer = setTimeout(() => {
      setLastDeleted(null);
    }, 4000);

    return () => clearTimeout(timer);
  }, [lastDeleted]);
  return (
    <div className="phone-frame flex flex-col overflow-none">
      {/* <StatusBar /> */}

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {tab === 'overview' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-2 pb-4 flex-shrink-0">
              <button onClick={() => setShowMonthPicker(true)} className="pressable flex items-center gap-1 mb-0.5">
                <span className="font-display text-2xl">{activeMonth.label}</span>
                <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Monthly spending overview</p>
            </div>

            {/* Budget card */}
            <div className="mx-5 mb-4  rounded-2xl p-5 animate-slide-up flex-shrink-0"
              style={{ background: 'var(--text-primary)', boxShadow: 'var(--shadow-lg)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>TOTAL SPENT</p>
                  <span className="text-4xl font-light font-display text-white">{formatVND(totalSpent)}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>BUDGET</p>
                  {editBudget ? (
                    <input autoFocus
                      className="text-xl font-display text-white bg-transparent border-b border-white/40 outline-none w-24 text-right"
                      value={budgetInput}
                      onChange={handleBudgetChange}
                      onBlur={handleBudgetSave}
                      onKeyDown={e => e.key === 'Enter' && handleBudgetSave()}
                      placeholder={String(activeMonth.budgetGoal)}
                    />
                  ) : (
                    <button onClick={() => { setEditBudget(true); setBudgetInput(String(activeMonth.budgetGoal)); }}
                      className="flex items-center gap-1">
                      <span className="text-xl font-display text-white">{formatVND(activeMonth.budgetGoal)}</span>
                      <Pencil size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
                    </button>
                  )}
                </div>
              </div>
              <div className="progress-track h-1.5 mb-3" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="progress-fill h-full" style={{
                  width: `${progress}%`,
                  background: overBudget ? '#F87171' : progress > 80 ? '#FBBf24' : '#86EFAC',
                }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {overBudget
                    ? <TrendingDown size={13} style={{ color: '#F87171' }} />
                    : <Target size={13} style={{ color: '#86EFAC' }} />}
                  <span className="text-xs" style={{ color: overBudget ? '#F87171' : '#86EFAC' }}>
                    {overBudget ? `${formatVND(Math.abs(remaining))} over budget` : `${formatVND(remaining)} remaining`}
                  </span>
                </div>
                <span className="text-xs text-white/50">{Math.round(progress)}%</span>
              </div>
            </div>
            {remainingCategoryBudget <= 0 && (
              <p className="text-xs text-red-500 text-center py-4">
                The budget has been fully allocated.
              </p>
            )}
            {/* Categories header */}
            <div className="flex items-center justify-between px-5 mb-3 flex-shrink-0">
              <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>CATEGORIES</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{activeMonth.categories.length} total</span>
            </div>

            {/* Categories list */}
            <div className="scroll-area flex-1 px-5 pb-10">
              <div className="flex justify-end  items-center mb-3 px-1">

                <button
                  onClick={() => {
                    setSortBySpent(prev =>
                      prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none'
                    );
                  }}
                  className="text-xs px-3 py-1 rounded-lg border border-black/10 dark:border-white/20"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Sort: {sortBySpent === 'none' && 'Default'}
                  {sortBySpent === 'desc' && 'High → Low'}
                  {sortBySpent === 'asc' && 'Low → High'}
                </button>
              </div>
              <div className="flex flex-col gap-3  max-h-[490px] scroll-area mb-12">
                {sortedCategories.map((cat) => {
                  const spent = cat.expenses.reduce((s, e) => s + e.amount, 0);
                  const isDone = spent >= cat.budget;
                  const catProgress = cat.budget > 0
                    ? Math.min((spent / cat.budget) * 100, 100)
                    : 0;
                  const over = spent > cat.budget;

                  // over giờ phải check theo month

                  const colors = COLOR_MAP[cat.color];

                  return (
                    <SwipeItem
                      key={cat.id}
                      isDone={isDone}
                      onDelete={() => {
                        setLastDeleted({
                          category: cat,
                          monthId: activeMonth.id,
                        });

                        dispatch({
                          type: 'DELETE_CATEGORY',
                          monthId: activeMonth.id,
                          categoryId: cat.id,
                        });
                      }}
                    >
                      <div
                        className="pressable animate-slide-up rounded-2xl p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-sm"
                        onClick={() => setExpenseTarget(cat)}
                        onContextMenu={e => {
                          e.preventDefault();
                          setDetailTarget(cat);
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                              style={{ background: colors.bg }}
                            >
                              {cat.emoji}
                            </div>

                            <div>
                              <p className="font-medium text-sm">{cat.name}</p>
                              <p className="text-xs text-neutral-500">
                                {cat.expenses.length} expense{cat.expenses.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className={`font-semibold text-sm ${over ? 'text-red-500' : ''}`}>
                              {formatVND(spent)}
                            </p>
                            <p className="text-xs text-neutral-500">
                              of {formatVND(cat.budget)} budget
                            </p>
                          </div>
                        </div>

                        <div className="h-1 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${catProgress}%`,
                              background: over ? colors.text : colors.progress,
                            }}
                          />
                        </div>

                        {over && (
                          <p className="text-xs mt-1.5 text-red-500">
                            {formatVND(spent - cat.budget)} over budget
                          </p>
                        )}
                      </div>
                    </SwipeItem>
                  );

                })}
                {lastDeleted && (
                  <div className="absolute bottom-28 right-0 -translate-x-1/2 z-50 animate-slide-up">
                    <div className="flex items-center gap-4 bg-neutral-700 text-white px-5 py-3 rounded-2xl shadow-xl">
                      <button
                        onClick={handleUndo}
                        className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 active:scale-95 transition"
                      >
                        <Undo size={16} style={{ verticalAlign: 'middle', transform: 'rotate(200deg)' }} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-xs mb-6 px-1">
                  <span style={{ color: 'var(--text-muted)' }}>
                    Allocated
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>

                    {formatVND(totalCategoryBudget)} / {formatVND(activeMonth.budgetGoal)}
                  </span>
                </div>
                {/* <button onClick={() => setShowAddCategory(true)}
                  disabled={remainingCategoryBudget <= 0}
                  className="pressable flex items-center justify-center gap-2 rounded-2xl py-4"
                  style={{ border: '1.5px dashed var(--border)', color: 'var(--text-muted)' }}>
                  <Plus size={16} />
                  <span className="text-sm font-medium">Add Category</span>
                </button> */}

              </div>
            </div>
          </div>
        )}

        {tab === 'history' && <HistoryScreen />}
        {tab === 'insights' && <div className="h-screen  ">
          <InsightsScreen />
        </div>}
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex-shrink-0 pb-8 pt-2 px-5"
        style={{ background: 'linear-gradient(to top, var(--bg) 60%, transparent)', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <div className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: 'var(--surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>

          <button onClick={() => setTab('overview')}
            className="pressable flex flex-col items-center gap-1 w-14">
            <LayoutGrid size={20} style={{ color: tab === 'overview' ? 'var(--accent)' : 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: tab === 'overview' ? 'var(--accent)' : 'var(--text-muted)' }}>
              Overview
            </span>
          </button>

          <button onClick={() => setTab('history')}
            className="pressable flex flex-col items-center gap-1 w-14">
            <Clock size={20} style={{ color: tab === 'history' ? 'var(--accent)' : 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: tab === 'history' ? 'var(--accent)' : 'var(--text-muted)' }}>
              History
            </span>
          </button>

          {/* FAB */}
          <button onClick={() => setShowAddCategory(true)}
            className="pressable w-12 h-12 rounded-2xl flex items-center justify-center -mt-4 shadow-lg"
            style={{ background: 'var(--text-primary)' }}>
            <Plus size={22} color="white" />
          </button>

          <button onClick={() => setTab('insights')}
            className="pressable flex flex-col items-center gap-1 w-14">
            <BarChart2 size={20} style={{ color: tab === 'insights' ? 'var(--accent)' : 'var(--text-muted)' }} />
            <span className="text-xs font-medium" style={{ color: tab === 'insights' ? 'var(--accent)' : 'var(--text-muted)' }}>
              Insights
            </span>
          </button>

          <button onClick={() => setShowMonthPicker(true)}
            className="pressable flex flex-col items-center gap-1 w-14">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="14" rx="3" stroke={showMonthPicker ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" />
              <path d="M2 8h16" stroke={showMonthPicker ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" />
              <circle cx="6.5" cy="12" r="1" fill={showMonthPicker ? 'var(--accent)' : 'var(--text-muted)'} />
              <circle cx="10" cy="12" r="1" fill={showMonthPicker ? 'var(--accent)' : 'var(--text-muted)'} />
              <circle cx="13.5" cy="12" r="1" fill={showMonthPicker ? 'var(--accent)' : 'var(--text-muted)'} />
              <path d="M6.5 3v2M13.5 3v2" stroke={showMonthPicker ? 'var(--accent)' : 'var(--text-muted)'} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Month</span>
          </button>
        </div>
      </div>

      {/* Overlays */}
      {liveExpenseTarget && (
        <ExpenseSheet
          category={liveExpenseTarget}
          monthId={activeMonth.id}
          onClose={() => setExpenseTarget(null)}
          onViewDetail={() => { setDetailTarget(liveExpenseTarget); setExpenseTarget(null); }}
        />
      )}
      {liveDetailTarget && (
        <CategoryDetail
          category={liveDetailTarget}
          monthId={activeMonth.id}
          onClose={() => setDetailTarget(null)}
        />
      )}
      {showAddCategory && (
        <AddCategoryModal monthId={activeMonth.id} onClose={() => setShowAddCategory(false)} />
      )}
      {showMonthPicker && (
        <MonthPicker onClose={() => setShowMonthPicker(false)} />
      )}

    </div>
  );
}
