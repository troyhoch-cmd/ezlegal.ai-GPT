import { useEffect, useRef, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme, type ThemeMode } from '../hooks/useTheme';
import { useLanguage } from '../contexts/LanguageContext';

interface ThemeToggleProps {
  variant?: 'button' | 'menu';
  className?: string;
}

const LABELS = {
  en: { theme: 'Theme', system: 'System', light: 'Light', dark: 'Dark', switchTo: 'Switch to' },
  es: { theme: 'Tema', system: 'Sistema', light: 'Claro', dark: 'Oscuro', switchTo: 'Cambiar a' },
};

export default function ThemeToggle({ variant = 'menu', className = '' }: ThemeToggleProps) {
  const { mode, resolved, setTheme, toggle } = useTheme();
  const { language } = useLanguage();
  const L = LABELS[language === 'es' ? 'es' : 'en'];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const nextLabel = resolved === 'dark' ? L.light : L.dark;

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={`${L.switchTo} ${nextLabel}`}
        title={`${L.switchTo} ${nextLabel}`}
        className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors ${className}`}
      >
        {resolved === 'dark' ? <Sun className="w-5 h-5" aria-hidden="true" /> : <Moon className="w-5 h-5" aria-hidden="true" />}
      </button>
    );
  }

  const options: Array<{ value: ThemeMode; icon: typeof Sun; label: string }> = [
    { value: 'system', icon: Monitor, label: L.system },
    { value: 'light', icon: Sun, label: L.light },
    { value: 'dark', icon: Moon, label: L.dark },
  ];

  const ActiveIcon = mode === 'system' ? Monitor : mode === 'dark' ? Moon : Sun;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${L.theme}: ${options.find((o) => o.value === mode)?.label}`}
        className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors"
      >
        <ActiveIcon className="w-5 h-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={L.theme}
          className="absolute right-0 mt-2 w-40 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-lg py-1 z-50"
        >
          {options.map(({ value, icon: Icon, label }) => {
            const selected = value === mode;
            return (
              <button
                key={value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors focus:outline-none focus:bg-[var(--surface-muted)] ${
                  selected
                    ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
