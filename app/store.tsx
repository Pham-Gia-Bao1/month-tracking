'use client';

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Month, Category, Expense, CategoryColor } from './types';

// ── helpers ──────────────────────────────────────────────────────────────────

function monthId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(id: string) {
  const [y, m] = id.split('-').map(Number);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[m - 1]} ${y}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeDefaultMonth(id?: string): Month {
  const mid = id ?? monthId();
  return {
    id: mid,
    label: monthLabel(mid),
    budgetGoal: 2000,
    categories: [
      { id: `${mid}-food`, name: 'Food & Dining', emoji: '🍜', color: 'red', budget: 400, expenses: [] },
      { id: `${mid}-transport`, name: 'Transport', emoji: '', color: 'blue', budget: 200, expenses: [] },
      { id: `${mid}-shopping`, name: 'Shopping', emoji: '🛍️', color: 'purple', budget: 300, expenses: [] },
      { id: `${mid}-entertainment`, name: 'Entertainment', emoji: '', color: 'gold', budget: 150, expenses: [] },
    ],
  };
}

const DEFAULT_STATE: AppState = {
  months: [makeDefaultMonth()],
  activeMonthId: monthId(),
};

// ── actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_BUDGET_GOAL'; monthId: string; amount: number }
  | { type: 'ADD_CATEGORY'; monthId: string; name: string; emoji: string; color: CategoryColor; budget: number }
  | { type: 'DELETE_CATEGORY'; monthId: string; categoryId: string }
  | { type: 'ADD_EXPENSE'; monthId: string; categoryId: string; amount: number; note: string }
  | { type: 'DELETE_EXPENSE'; monthId: string; categoryId: string; expenseId: string }
  | { type: 'SET_ACTIVE_MONTH'; monthId: string }
  | { type: 'ADD_MONTH'; monthId: string }
  | { type: 'EDIT_CATEGORY'; monthId: string; categoryId: string; name: string; emoji: string; color: CategoryColor; budget: number }
  | { type: 'HYDRATE'; state: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'SET_ACTIVE_MONTH':
      return { ...state, activeMonthId: action.monthId };

    case 'ADD_MONTH': {
      if (state.months.find(m => m.id === action.monthId)) {
        return { ...state, activeMonthId: action.monthId };
      }
      return {
        ...state,
        months: [makeDefaultMonth(action.monthId), ...state.months],
        activeMonthId: action.monthId,
      };
    }

    case 'SET_BUDGET_GOAL':
      return {
        ...state,
        months: state.months.map(m =>
          m.id === action.monthId ? { ...m, budgetGoal: action.amount } : m
        ),
      };

    case 'ADD_CATEGORY':
      return {
        ...state,
        months: state.months.map(m =>
          m.id === action.monthId
            ? {
              ...m,
              categories: [
                ...m.categories,
                { id: uid(), name: action.name, emoji: action.emoji, color: action.color, budget: action.budget, expenses: [] },
              ],
            }
            : m
        ),
      };

    case 'EDIT_CATEGORY':
      return {
        ...state,
        months: state.months.map(m =>
          m.id === action.monthId
            ? {
              ...m,
              categories: m.categories.map(c =>
                c.id === action.categoryId
                  ? { ...c, name: action.name, emoji: action.emoji, color: action.color, budget: action.budget }
                  : c
              ),
            }
            : m
        ),
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        months: state.months.map(m =>
          m.id === action.monthId
            ? { ...m, categories: m.categories.filter(c => c.id !== action.categoryId) }
            : m
        ),
      };

    case 'ADD_EXPENSE': {
      const expense: Expense = {
        id: uid(),
        amount: action.amount,
        note: action.note,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: Date.now(),
      };
      return {
        ...state,
        months: state.months.map(m =>
          m.id === action.monthId
            ? {
              ...m,
              categories: m.categories.map(c =>
                c.id === action.categoryId
                  ? { ...c, expenses: [expense, ...c.expenses] }
                  : c
              ),
            }
            : m
        ),
      };
    }

    case 'DELETE_EXPENSE':
      return {
        ...state,
        months: state.months.map(m =>
          m.id === action.monthId
            ? {
              ...m,
              categories: m.categories.map(c =>
                c.id === action.categoryId
                  ? { ...c, expenses: c.expenses.filter(e => e.id !== action.expenseId) }
                  : c
              ),
            }
            : m
        ),
      };

    default:
      return state;
  }
}

// ── context ───────────────────────────────────────────────────────────────────

interface StoreCtx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  activeMonth: Month;
}

export const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spending-tracker-v1');
      if (saved) {
        dispatch({ type: 'HYDRATE', state: JSON.parse(saved) });
      }
    } catch { }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem('spending-tracker-v1', JSON.stringify(state));
    } catch { }
  }, [state]);

  const activeMonth = state.months.find(m => m.id === state.activeMonthId) ?? state.months[0];

  return <Ctx.Provider value={{ state, dispatch, activeMonth }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

export { monthId, monthLabel, uid };
