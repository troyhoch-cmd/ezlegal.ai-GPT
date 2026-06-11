import { useId, useState } from 'react';
import { useGlossary } from '../hooks/useGlossary';

interface JargonTermProps {
  slug: string;
  children: React.ReactNode;
}

export default function JargonTerm({ slug, children }: JargonTermProps) {
  const { lookup } = useGlossary();
  const term = lookup(slug);
  const [open, setOpen] = useState(false);
  const tipId = useId();

  if (!term) {
    return <>{children}</>;
  }

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        className="underline decoration-dotted decoration-teal-600 underline-offset-2 cursor-help bg-transparent p-0 text-inherit font-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
      >
        {children}
      </button>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-64 rounded-md bg-navy-900 text-white text-xs font-normal leading-snug p-3 shadow-lg"
        >
          <strong className="block mb-1">{term.term}</strong>
          {term.plain_language}
        </span>
      )}
    </span>
  );
}
