import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
  widthClass?: string;
  labelledById?: string;
}

export default function MobileDrawer({
  open,
  onClose,
  title,
  side = 'left',
  children,
  widthClass = 'w-[85vw] max-w-sm',
  labelledById,
}: MobileDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    const body = document.body;
    const prev = body.style.overflow;
    body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      previousFocus.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses =
    side === 'left'
      ? `left-0 top-0 bottom-0 ${widthClass} translate-x-0`
      : side === 'right'
      ? `right-0 top-0 bottom-0 ${widthClass} translate-x-0`
      : `left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl`;

  const enterAnim =
    side === 'bottom'
      ? 'animate-[slide-up_240ms_ease-out]'
      : side === 'right'
      ? 'animate-[slide-in-right_240ms_ease-out]'
      : 'animate-[slide-in-left_240ms_ease-out]';

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledById}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-[fade-in_180ms_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`absolute ${sideClasses} bg-white shadow-2xl flex flex-col outline-none ${enterAnim}`}
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
            <h2 id={labelledById} className="text-base font-semibold text-slate-900">
              {title ?? ''}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 -m-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
