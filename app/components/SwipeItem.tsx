'use client';
import { useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SwipeItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    isDone?: boolean;
}

export function SwipeItem({ children, onDelete, isDone }: SwipeItemProps) {
    const startX = useRef(0);
    const startY = useRef(0);
    // null = undecided, true = horizontal swipe, false = vertical scroll
    const gestureDirection = useRef<boolean | null>(null);
    const isDraggingRef = useRef(false);

    const [translateX, setTranslateX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [height, setHeight] = useState<number | 'auto'>('auto');

    const ref = useRef<HTMLDivElement>(null);

    const MAX = -140;
    const DELETE_THRESHOLD = -90;
    // Must move this many px before direction is locked
    const DIRECTION_LOCK_THRESHOLD = 8;

    const onPointerDown = (e: React.PointerEvent) => {
        startX.current = e.clientX;
        startY.current = e.clientY;
        gestureDirection.current = null;
        isDraggingRef.current = false;
        setDragging(true);
        // Do NOT setPointerCapture here — let the browser decide scroll vs swipe
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragging || removing) return;

        const deltaX = e.clientX - startX.current;
        const deltaY = e.clientY - startY.current;

        // Lock gesture direction once movement crosses the threshold
        if (gestureDirection.current === null) {
            const absX = Math.abs(deltaX);
            const absY = Math.abs(deltaY);
            if (absX < DIRECTION_LOCK_THRESHOLD && absY < DIRECTION_LOCK_THRESHOLD) {
                // Not enough movement to decide yet
                return;
            }
            gestureDirection.current = absX > absY;
            // Only capture the pointer once we know this is a horizontal swipe;
            // if vertical, we let native scroll take over.
            if (gestureDirection.current) {
                e.currentTarget.setPointerCapture(e.pointerId);
            }
        }

        // Bail out for vertical gestures — native scroll handles it
        if (!gestureDirection.current) return;

        let diff = deltaX;
        isDraggingRef.current = true;

        if (diff < 0) {
            if (diff < MAX) {
                diff = MAX + (diff - MAX) * 0.25;
            }
            setTranslateX(diff);
        } else {
            setTranslateX(0);
        }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        gestureDirection.current = null;

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
            isDraggingRef.current = false;
            setTranslateX(0);
        }
    };

    const progress = Math.min(Math.abs(translateX) / 100, 1);

    return (
        // touchAction: 'pan-y' must be on the outermost interactive element so the
        // browser knows vertical scroll is always allowed here.
        <div
            className="relative overflow-hidden rounded-2xl"
            style={{
                height,
                transition: removing ? 'height 0.25s ease' : undefined,
                touchAction: 'pan-y',
            }}
        >
            {/* Background delete */}
            <div
                className="absolute inset-0 flex items-center justify-end pr-5 bg-red-500"
                style={{
                    opacity: progress,
                    transition: dragging ? 'none' : 'opacity 0.2s',
                }}
            >
                <span className="text-white text-sm font-semibold">Delete</span>
            </div>

            {/* Content */}
            <div
                ref={ref}
                style={{ transform: `translateX(${translateX}px)` }}
                className={`
                  relative
                  ${dragging ? '' : 'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'}
                  ${removing ? 'opacity-0 scale-95' : ''}
                `}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClick={(e) => {
                    if (isDraggingRef.current) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                {children}

                {isDone && (
                    <div className="absolute top-0 right-1 pointer-events-none">
                        <CheckCircle size={18} className="text-green-500 drop-shadow" />
                    </div>
                )}
            </div>
        </div>
    );
}