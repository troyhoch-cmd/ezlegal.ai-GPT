import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../lib/i18n';

interface LocalePickerProps {
  className?: string;
  align?: 'left' | 'right';
}

export default function LocalePicker({ className = '', align = 'right' }: LocalePickerProps) {
  const { language, setLanguage, supportedLocales, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  const current = supportedLocales.find((l) => l.code === language) ?? supportedLocales[0];
  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={ref} className={`relative ${className}`} dir={dir}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}`}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-primary)] hover:bg-[var(--surface-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:ring-offset-2 transition-colors text-sm"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="font-medium whitespace-nowrap" dir={current.dir}>
          {current.nativeLabel}
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Choose language"
          className={`absolute ${alignClass} mt-2 w-52 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-lg py-1 z-50`}
        >
          {supportedLocales.map((loc) => {
            const selected = loc.code === language;
            return (
              <li key={loc.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLanguage(loc.code as Language);
                    setOpen(false);
                  }}
                  dir={loc.dir}
                  className={`flex items-center justify-between w-full gap-2 px-3 py-2 text-sm text-start transition-colors focus:outline-none focus:bg-[var(--surface-muted)] ${
                    selected
                      ? 'bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span className="flex flex-col items-start">
                    <span>{loc.nativeLabel}</span>
                    <span className="text-xs text-[var(--text-muted)]">{loc.label}</span>
                  </span>
                  {selected && <Check className="w-4 h-4 text-[var(--accent-teal)]" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
