'use client';

import { useState } from 'react';
import { useStore } from '../store';
import { Category } from '../types';
import { ArrowLeft, Trash2, Pencil } from 'lucide-react';
import AddCategoryModal from './AddCategoryModal';
import formatVND from '../helpers/formatVND';
import { COLOR_MAP } from '../constants/colors';

interface Props {
  category: Category;
  monthId: string;
  onClose: () => void;
}

export default function CategoryDetail({ category, monthId, onClose }: Props) {
  const { dispatch } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const colors = COLOR_MAP[category.color];
  const spent = category.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = category.budget - spent;
  const progress = Math.min((spent / category.budget) * 100, 100);
  const over = spent > category.budget;

  const handleDeleteCategory = () => {
    dispatch({ type: 'DELETE_CATEGORY', monthId, categoryId: category.id });
    onClose();
  };

  const handleDeleteExpense = (expenseId: string) => {
    dispatch({ type: 'DELETE_EXPENSE', monthId, categoryId: category.id, expenseId });
  };

  return (
    <div className="absolute inset-0 flex flex-col animate-fade-in"
      style={{ background: 'var(--bg)', zIndex: 40 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <button onClick={onClose} className="pressable p-2 rounded-xl" style={{ background: 'var(--surface)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="pressable p-2 rounded-xl" style={{ background: 'var(--surface)' }}>
            <Pencil size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="pressable p-2 rounded-xl"
            style={{ background: 'var(--surface)' }}
          >
            <Trash2 size={16} style={{ color: 'var(--accent)' }} />
          </button>
        </div>
      </div>

      {/* Category info */}
      <div className="px-5 mb-5 animate-slide-up">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: colors.bg }}>
            {category.emoji}
          </div>
          <div>
            <h2 className="font-display text-2xl">{category.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Budget: {formatVND(category.budget)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'SPENT', value: formatVND(spent), accent: over },
            { label: 'REMAINING', value: over ? '-' + formatVND(Math.abs(remaining)) : formatVND(remaining), accent: over },
            { label: 'EXPENSES', value: String(category.expenses.length), accent: false },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-3 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-1 tracking-widest" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <p className="font-display text-lg leading-none" style={{ color: s.accent ? colors.text : 'var(--text-primary)' }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>PROGRESS</span>
            <span className="text-xs font-medium" style={{ color: over ? colors.text : 'var(--text-secondary)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div className="progress-track h-2">
            <div className="progress-fill h-full" style={{ width: `${progress}%`, background: colors.progress }} />
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="flex items-center justify-between px-5 mb-3">
        <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>TRANSACTIONS</span>
      </div>

      <div className="scroll-area flex-1 px-5 pb-10">
        {category.expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="text-5xl">{category.emoji}</div>
            <p className="text-base font-display" style={{ color: 'var(--text-secondary)' }}>No expenses yet</p>
            <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              Tap a category card to log your first expense
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 stagger">
            {category.expenses.map((exp) => (
              <div
                key={exp.id}
                className="animate-slide-up flex items-center justify-between rounded-2xl px-4 py-3.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                    style={{ background: colors.bg }}>
                    {category.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {exp.note || 'Expense'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{exp.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm" style={{ color: colors.text }}>
                    -{formatVND(exp.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    className="pressable p-1.5 rounded-lg"
                    style={{ background: 'var(--surface-2)' }}
                  >
                    <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm delete category */}
      {confirmDelete && (
        <div className="absolute inset-0 flex items-end justify-center modal-backdrop animate-fade-in" style={{ zIndex: 60 }}>
          <div className="w-full animate-sheet rounded-t-3xl p-6"
            style={{ background: 'var(--surface)' }}>
            <h3 className="font-display text-xl mb-2">Delete {category.name}?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              This will remove all {category.expenses.length} expenses too. This cant be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="pressable flex-1 py-3.5 rounded-2xl font-semibold text-sm"
                style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="pressable flex-1 py-3.5 rounded-2xl font-semibold text-sm text-white"
                style={{ background: 'var(--accent)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <AddCategoryModal
          monthId={monthId}
          editCategory={category}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
