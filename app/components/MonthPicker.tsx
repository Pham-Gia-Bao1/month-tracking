'use client';

import { useStore, monthId, monthLabel } from '../store';
import { X, Check, Plus } from 'lucide-react';

interface Props {
  onClose: () => void;
}

function generateMonthOptions() {
  const months = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  for (let m = 0; m < 12; m++) {
    const id = `${currentYear}-${String(m + 1).padStart(2, '0')}`;

    months.push({
      id,
      label: monthLabel(id),
      isCurrentMonth: m === currentMonth,
      isPast: m < currentMonth,
    });
  }

  return months;
}

export function MonthPicker({ onClose }: Props) {
  const { state, dispatch, activeMonth } = useStore();
  const options = generateMonthOptions();

  const handleSelect = (id: string) => {
    dispatch({ type: 'ADD_MONTH', monthId: id });
    onClose();
  };

  return (
    <div className="absolute inset-0 flex items-end modal-backdrop animate-fade-in" style={{ zIndex: 60 }}>
      <div className="w-full animate-sheet rounded-t-3xl p-6 max-h-[500px]  "
        style={{ background: 'var(--surface)' }}>
        {/* Handle */}
        <div className="flex justify-center -mt-3 mb-4">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl">Switch Month</h2>
          <button onClick={onClose} className="pressable p-2 rounded-xl" style={{ background: 'var(--surface-2)' }}>
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        <div className="flex flex-col gap-2 stagger grid grid-cols-1 sm:grid-cols-2 scroll-area max-h-[350px]">
          {options.map(opt => {
            const exists = state.months.find(m => m.id === opt.id);
            const isActive = opt.id === activeMonth.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  background: isActive
                  ? 'var(--text-primary)'
                  : opt.isPast
                  ? 'var(--surface)' 
                      : 'var(--surface-2)', 
                  border: opt.isCurrentMonth && !isActive
                  ? '1.5px solid var(--border)'
                  : '1.5px solid transparent',
                  opacity: opt.isPast ? 0.7 : 1, 
                }}
                className="pressable flex items-center justify-between rounded-2xl px-5 py-4 w-full border"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-sm text-left" style={{ color: isActive ? 'white' : 'var(--text-primary)' }}>
                      {opt.label}
                    </p>
                    {opt.isCurrentMonth && (
                      <p className="text-xs" style={{ color: isActive ? 'var(--green)' : 'var(--accent-2)' }}>
                        Current month
                      </p>
                    )}
                    {exists && (
                      <p className="text-xs" style={{ color: isActive ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>
                        {exists.categories.length} categories
                      </p>
                    )}
                  </div>
                </div>
                {isActive ? (
                  <Check size={16} color="white" />
                ) : !exists ? (
                  <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Plus size={13} />
                    <span className="text-xs">New</span>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
          New months start with default categories
        </p>
      </div>
    </div>
  );
}
