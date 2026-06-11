import { useState } from 'react';

interface PlainLanguageTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export function PlainLanguageTooltip({
  term,
  definition,
  children,
}: PlainLanguageTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="underline decoration-dotted decoration-slate-400 underline-offset-2 cursor-help focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
        aria-describedby={`tooltip-${term}`}
      >
        {children}
      </button>
      {open && (
        <span
          id={`tooltip-${term}`}
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-slate-900 px-3 py-2 text-[11px] text-white text-center shadow-lg z-50"
        >
          {definition}
        </span>
      )}
    </span>
  );
}
