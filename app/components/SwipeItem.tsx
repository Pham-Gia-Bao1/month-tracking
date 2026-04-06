'use client';
import { useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SwipeItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    isDone?: boolean; // 🔥 thêm prop
}

export default function SwipeItem({ children, onDelete, isDone }: SwipeItemProps) {
    const startX = useRef(0);
    const currentX = useRef(0);
    const isDraggingRef = useRef(false);

    const [translateX, setTranslateX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [height, setHeight] = useState<number | 'auto'>('auto');

    const ref = useRef<HTMLDivElement>(null);

    const MAX = -140;
    const DELETE_THRESHOLD = -90;

    const onPointerDown = (e: React.PointerEvent) => {
        startX.current = e.clientX;
        isDraggingRef.current = false;
        setDragging(true);

        e.currentTarget.setPointerCapture(e.pointerId); // 🔥 fix drag
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging || removing) return;

        currentX.current = e.clientX;
        let diff = currentX.current - startX.current;

        if (Math.abs(diff) > 5) {
            isDraggingRef.current = true;
        }

        if (isDraggingRef.current && diff < 0) {
            if (diff < MAX) {
                diff = MAX + (diff - MAX) * 0.25;
            }
            setTranslateX(diff);
        }
    };

    const onPointerUp = () => {
        if (removing) return;

        setDragging(false);

        if (translateX < DELETE_THRESHOLD) {
            setRemoving(true);

            if (ref.current) {
                setHeight(ref.current.offsetHeight);
                requestAnimationFrame(() => {
                    setHeight(0);
                });
            }

            setTranslateX(-500);

            setTimeout(() => {
                onDelete();
            }, 300);
        } else {
            setTranslateX(0);
        }
    };

    const progress = Math.min(Math.abs(translateX) / 100, 1);

    return (
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                height,
                transition: removing ? 'height 0.25s ease' : undefined,
            }}
        >
            {/* 🔴 Background delete */}
            <div
                className="absolute inset-0 bg-red-500 flex items-center justify-end pr-5"
                style={{
                    opacity: progress,
                    transition: dragging ? 'none' : 'opacity 0.2s',
                }}
            >
                <span className="text-white text-sm font-semibold">
                    Delete
                </span>
            </div>

            {/* 📦 Content */}
            <div
                ref={ref}
                style={{
                    transform: `translateX(${translateX}px)`,
                    touchAction: 'pan-y',
                }}
                className={`
          relative
          ${dragging ? '' : 'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}
          ${removing ? 'opacity-0 scale-95' : ''}
        `}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onClick={(e) => {
                    if (isDraggingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                {/* 👉 children */}
                {children}

                {/* ✅ DONE ICON */}
                {isDone && (
                    <div className="absolute top-0 right-1 pointer-events-none">
                        <CheckCircle
                            size={18}
                            className="text-green-500 drop-shadow"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
