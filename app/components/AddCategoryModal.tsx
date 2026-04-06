'use client';

import { useState } from 'react';
import { useStore } from '../store';
import { Category, CategoryColor } from '../types';
import { COLOR_MAP, COLOR_LABELS, COLOR_OPTIONS } from '../constants/colors';
import { X, Check } from 'lucide-react';
import formatVND from '../helpers/formatVND';
import { useToast } from '../contexts/ToastContext';

const EMOJI_OPTIONS = [
  '🍜', '🍕', '🍔', '☕', '🍺', '🛒', '🚌', '🚗', '✈️', '',
  '💊', '🏋️', '🎬', '🎮', '📚', '💄', '👗', '🐕', '⚽', '',
  '💡', '📱', '💻', '🎁', '💰', '🌿', '🏖️', '🎨', '🍷', '',
];

interface Props {
  monthId: string;
  editCategory?: Category;
  onClose: () => void;
}

export default function AddCategoryModal({ monthId, editCategory, onClose }: Props) {
  const { dispatch, state } = useStore();
  const [name, setName] = useState(editCategory?.name ?? '');
  const [emoji, setEmoji] = useState(editCategory?.emoji ?? '🍜');
  const [color, setColor] = useState<CategoryColor>(editCategory?.color ?? 'red');
  const [budget, setBudget] = useState<number>(editCategory?.budget ?? 0);
  const [budgetInput, setBudgetInput] = useState(
    editCategory ? String(editCategory.budget) : ''
  );
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const [errors, setErrors] = useState<{
    name?: string;
    budget?: string;
  }>({});
  const activeMonth = state.months.find(m => m.id === monthId);
  const usedBudget = activeMonth ? activeMonth.categories.reduce((sum, c) => {
    // nếu đang edit thì bỏ category hiện tại ra
    if (editCategory && c.id === editCategory.id) return sum;
    return sum + c.budget;
  }, 0) : 0;
  const remainingBudget = activeMonth ? activeMonth.budgetGoal - usedBudget : 0;
  const colors = COLOR_MAP[color];
  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!budget || isNaN(budget) || budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    } else if (activeMonth) {
      if (budget > activeMonth.budgetGoal) {
        newErrors.budget = `Please enter a value less than ${formatVND(activeMonth.budgetGoal)}`;
      } else if (budget > remainingBudget) {
        newErrors.budget = `Only ${formatVND(remainingBudget)} remaining`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!activeMonth) {
      showToast('No active month selected', 'error');
      return;
    }

    if (!validate()) return;

    if (editCategory) {
      dispatch({
        type: 'EDIT_CATEGORY',
        monthId,
        categoryId: editCategory.id,
        name: name.trim(),
        emoji,
        color,
        budget,
      });
    } else {
      dispatch({
        type: 'ADD_CATEGORY',
        monthId,
        name: name.trim(),
        emoji,
        color,
        budget,
      });
    }

    onClose();
  };
  return (
    <div className="absolute inset-0 flex items-end justify-center modal-backdrop animate-fade-in" style={{ zIndex: 60 }}>
      <div
        className="w-full animate-sheet rounded-t-3xl overflow-hidden"
        style={{ background: 'var(--surface)', maxHeight: '90%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <h2 className="font-display text-xl">{editCategory ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="pressable p-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="scroll-area flex-1 px-6 pb-6">
          {/* Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl mb-5"
            style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white/60">
              {emoji}
            </div>
            <div>
              <p className="font-semibold text-base" style={{ color: colors.text }}>
                {name || 'Category Name'}
              </p>
              <p className="text-sm" style={{ color: colors.text + '99' }}>
                {formatVND(budget)} budget
              </p>
            </div>
          </div>

          {/* Name */}
          <label className="block mb-4">
            <span className="text-xs font-semibold tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>NAME</span>
            <input
              className="w-full rounded-2xl px-5 py-3.5 text-sm outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              type="text"
              placeholder='Category Name ( food, transport, .. )'
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!e.target.value.trim()) {
                  setErrors(prev => ({ ...prev, name: 'Name is required' }));
                } else {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
            />

            {errors.name && (
              <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                {errors.name}
              </p>
            )}
          </label>

          {/* Budget */}
          <label className="block mb-5">
            <span className="text-xs font-semibold tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>MONTHLY BUDGET</span>

            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="w-full rounded-2xl px-5 py-3.5 text-sm outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              value={
                isEditingBudget
                  ? budgetInput // 👉 đang nhập → raw
                  : budget
                    ? formatVND(budget) // 👉 blur → format
                    : ''
              }
              onFocus={() => {
                setIsEditingBudget(true);
                setBudgetInput(budget ? String(budget) : '');
              }}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, '');

                setBudgetInput(raw);
                const val = Number(raw);
                setBudget(val);

                // validate realtime (optional)
                if (!activeMonth) {
                  setErrors(prev => ({ ...prev, budget: 'No active month selected' }));
                  return;
                }

                if (!val || val <= 0) {
                  setErrors(prev => ({ ...prev, budget: 'Budget must be greater than 0' }));
                } else if (val > activeMonth.budgetGoal) {
                  setErrors(prev => ({ ...prev, budget: `Max ${formatVND(activeMonth.budgetGoal)}` }));
                } else if (val > remainingBudget) {
                  setErrors(prev => ({ ...prev, budget: `Only ${formatVND(remainingBudget)} remaining` }));
                } else {
                  setErrors(prev => ({ ...prev, budget: undefined }));
                }
              }}
              onBlur={() => {
                setIsEditingBudget(false);

                // sync lại input theo format
                setBudgetInput(budget ? String(budget) : '');
              }}
            />

            {errors.budget && (
              <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>
                {errors.budget}
              </p>
            )}

          </label>

          {/* Emoji */}
          <div className="mb-5">
            <span className="text-xs font-semibold tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>EMOJI</span>
            <div className="grid grid-cols-10 gap-1.5">
              {EMOJI_OPTIONS.map((e, index) => (
                <button
                  key={index}
                  onClick={() => setEmoji(e)}
                  className="pressable w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{
                    background: emoji === e ? colors.bg : 'var(--surface-2)',
                    border: emoji === e ? `1.5px solid ${colors.border}` : '1.5px solid transparent',
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="mb-6">
            <span className="text-xs font-semibold tracking-widest mb-2 block" style={{ color: 'var(--text-muted)' }}>COLOR</span>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => {
                const cm = COLOR_MAP[c];
                return (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className="pressable flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                    style={{
                      background: color === c ? cm.bg : 'var(--surface-2)',
                      color: color === c ? cm.text : 'var(--text-secondary)',
                      border: color === c ? `1.5px solid ${cm.border}` : '1.5px solid transparent',
                    }}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ background: cm.progress }} />
                    {COLOR_LABELS[c]}
                    {color === c && <Check size={11} />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!!errors.name || !!errors.budget}
            className="pressable w-full py-4 rounded-2xl font-semibold text-base text-white"
            style={{ background: colors.text }}
          >
            {editCategory ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}
