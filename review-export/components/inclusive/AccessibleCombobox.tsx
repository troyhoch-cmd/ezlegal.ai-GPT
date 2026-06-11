import { ChangeEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface ComboOption {
  value: string;
  label: string;
  description?: string;
}

interface Props {
  label: string;
  options: ComboOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  emptyMessage?: string;
  helpText?: string;
  required?: boolean;
  forceNativeBelow?: number;
  name?: string;
}

export default function AccessibleCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Type or pick…',
  emptyMessage = 'No matches. Try a different word.',
  helpText,
  required = false,
  forceNativeBelow = 12,
  name,
}: Props) {
  const inputId = useId();
  const listId = useId();
  const helpId = useId();
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobile(m.matches);
    update();
    m.addEventListener('change', update);
    return () => m.removeEventListener('change', update);
  }, []);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value]
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));
  }, [options, query]);

  if (options.length <= forceNativeBelow || isMobile) {
    return (
      <div className="space-y-1.5">
        <label htmlFor={inputId} className="block text-sm font-semibold text-navy-800">
          {label}
          {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
        </label>
        <div className="relative">
          <select
            id={inputId}
            name={name}
            value={value ?? ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value || null)}
            aria-describedby={helpText ? helpId : undefined}
            aria-required={required}
            required={required}
            className="appearance-none w-full px-4 py-2.5 pr-10 border border-navy-300 rounded-lg bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 min-h-[44px]"
          >
            <option value="" disabled>{placeholder}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-500 pointer-events-none" aria-hidden="true" />
        </div>
        {helpText && <p id={helpId} className="text-xs text-navy-500">{helpText}</p>}
      </div>
    );
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (open && activeIndex >= 0 && filtered[activeIndex]) {
        e.preventDefault();
        onChange(filtered[activeIndex].value);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-semibold text-navy-800">
        {label}
        {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" aria-hidden="true" />
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          aria-required={required}
          aria-describedby={helpText ? helpId : undefined}
          value={open ? query : selectedLabel}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 border border-navy-300 rounded-lg bg-white text-navy-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-500 min-h-[44px]"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); onChange(null); inputRef.current?.focus(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-navy-400 hover:text-navy-700 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={`Clear ${label}`}
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          aria-label={label}
          className="absolute z-50 mt-1 max-h-72 w-full max-w-[var(--cb-w,28rem)] overflow-auto bg-white border border-navy-200 rounded-lg shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-navy-500" role="presentation">{emptyMessage}</li>
          ) : (
            filtered.map((o, i) => {
              const selected = o.value === value;
              const active = i === activeIndex;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setOpen(false); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-start gap-2 px-3 py-2 cursor-pointer ${active ? 'bg-teal-50' : ''} ${selected ? 'font-semibold' : ''}`}
                >
                  <span className="w-4 h-4 mt-0.5 flex-shrink-0">
                    {selected && <Check className="w-4 h-4 text-teal-600" aria-hidden="true" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-navy-900 truncate">{o.label}</span>
                    {o.description && <span className="block text-xs text-navy-500 truncate">{o.description}</span>}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}

      {helpText && <p id={helpId} className="text-xs text-navy-500">{helpText}</p>}
    </div>
  );
}
