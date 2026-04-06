



'use client';

import { useState, useCallback } from 'react';
import { useStore } from '../store';
import { Category } from '../types';
import { X, ChevronRight, Check, Delete } from 'lucide-react';
import formatVND from '../helpers/formatVND';
import { COLOR_MAP } from '../constants/colors';

interface Props {
  category: Category;
  monthId: string;
  onClose: () => void;
  onViewDetail: () => void;
}

const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];

const NOTE_SUGGESTIONS = ['Lunch', 'Groceries', 'Coffee', 'Uber', 'Netflix', 'Gym', 'Dinner', 'Snack', 'Bus', 'Taxi'];

export default function ExpenseSheet({ category, monthId, onClose, onViewDetail }: Props) {
  const { dispatch } = useStore();
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  const colors = COLOR_MAP[category.color];
  const spent = category.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = category.budget - spent;
  const numericAmount = parseFloat(amount) || 0;

  const handleKey = useCallback((key: string) => {
    if (success) return;
    setAmount(prev => {
      if (key === '⌫') {
        if (prev.length <= 1) return '0';
        const next = prev.slice(0, -1);
        return next === '' || next === '-' ? '0' : next;
      }
      if (key === '.' && prev.includes('.')) return prev;
      // max 2 decimal places
      if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev;
      if (prev === '0' && key !== '.') return key;
      const next = prev + key;
      // max value guard
      if (parseFloat(next) > 50_000_000) return prev;
      return next;
    });
  }, [success]);

  const handleSubmit = useCallback(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    dispatch({ type: 'ADD_EXPENSE', monthId, categoryId: category.id, amount: val, note: note.trim() });
    setSuccess(true);
    setTimeout(() => onClose(), 1000);
  }, [amount, note, monthId, category.id, dispatch, onClose]);

  return (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ zIndex: 50 }}>
      <div className="absolute inset-0 modal-backdrop animate-fade-in" onClick={onClose} />

      <div className="relative animate-sheet rounded-t-3xl"
        style={{ background: 'var(--surface)', boxShadow: '0 -8px 40px rgba(26,23,20,0.15)' }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--border)' }} />
        </div>

        {/* Category + close */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: colors.bg }}>{category.emoji}</div>
            <div>
              <p className="font-semibold text-sm">{category.name}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {formatVND(remaining)} remaining
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onViewDetail} className="pressable p-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
              <ChevronRight size={15} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <button onClick={onClose} className="pressable p-2.5 rounded-xl" style={{ background: 'var(--surface-2)' }}>
              <X size={15} style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Amount display */}
        <div className={`mx-5 mb-3 rounded-2xl px-5 py-3.5 flex items-baseline justify-center gap-1 ${shake ? 'animate-shake' : ''}`}
          style={{ background: colors.bg, border: `1.5px solid ${colors.border}` }}>
          <span className="font-display text-5xl leading-none"
            style={{ color: numericAmount > 0 ? colors.text : colors.text + '40' }}>
            {formatVND(numericAmount)}
          </span>
        </div>

        {/* Note suggestions */}
        <div className="flex gap-2 px-5 mb-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {NOTE_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => setNote(s)}
              className="pressable flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{
                background: note === s ? colors.text : 'var(--surface-2)',
                color: note === s ? 'white' : 'var(--text-secondary)',
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Note input */}
        <div className="px-5 mb-3">
          <input type="text" placeholder="Add a note…"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{ background: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          />
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-2 px-5 mb-4">
          {PAD_KEYS.map(key => (
            <button key={key} onClick={() => handleKey(key)}
              className="pressable h-12 rounded-2xl flex items-center justify-center font-semibold text-xl"
              style={{
                background: key === '⌫' ? 'var(--surface-2)' : 'var(--surface-2)',
                color: key === '⌫' ? 'var(--accent)' : 'var(--text-primary)',
                border: '1px solid var(--border)',
              }}>
              {key === '⌫' ? <Delete size={18} style={{ color: 'var(--accent)' }} /> : key}
            </button>
          ))}
        </div>

        {/* Submit */}
        <div className="px-5 pb-8">
          <button onClick={handleSubmit}
            className="pressable w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
            style={{
              background: success ? 'var(--green)' : numericAmount > 0 ? colors.text : 'var(--border)',
              color: numericAmount > 0 || success ? 'white' : 'var(--text-muted)',
              transition: 'background 0.25s ease',
            }}>
            {success ? (
              <><Check size={20} /><span>Added!</span></>
            ) : (
              <span>{numericAmount > 0 ? `Subtract ${formatVND(numericAmount)} from budget` : 'Enter an amount'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
