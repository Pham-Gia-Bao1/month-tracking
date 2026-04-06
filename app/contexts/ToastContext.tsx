'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info'; // ✅ FIX

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).slice(2);

        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-[99999]">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className="px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up"
                        style={{
                            background:
                                t.type === 'success'
                                    ? '#16a34a'
                                    : t.type === 'error'
                                        ? '#dc2626'
                                        : '#333',
                            color: 'white',
                        }}
                    >
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}