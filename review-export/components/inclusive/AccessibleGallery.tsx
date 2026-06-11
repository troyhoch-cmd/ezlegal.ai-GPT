import { ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useAccessibilityPreferences } from '../../hooks/useAccessibilityPreferences';

export interface GalleryItem {
  id: string;
  title: string;
  content: ReactNode;
}

interface Props {
  label: string;
  items: GalleryItem[];
  showLinearFallback?: boolean;
  autoplay?: boolean;
  autoplayIntervalMs?: number;
}

export default function AccessibleGallery({
  label,
  items,
  showLinearFallback = true,
  autoplay = false,
  autoplayIntervalMs = 6000,
}: Props) {
  const { prefs } = useAccessibilityPreferences();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [linearMode, setLinearMode] = useState(prefs.simplifiedLayout);
  const regionId = useId();
  const trackRef = useRef<HTMLDivElement>(null);

  const canAutoplay = autoplay && !prefs.reduceMotion && !paused && !linearMode;

  useEffect(() => {
    if (!canAutoplay) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % items.length), autoplayIntervalMs);
    return () => window.clearInterval(t);
  }, [canAutoplay, autoplayIntervalMs, items.length]);

  const goTo = useCallback((i: number) => setIndex(((i % items.length) + items.length) % items.length), [items.length]);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    else if (e.key === 'End') { e.preventDefault(); goTo(items.length - 1); }
  };

  if (linearMode) {
    return (
      <section aria-label={label} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-navy-900">{label}</h2>
          <button onClick={() => setLinearMode(false)} className="text-sm text-teal-700 underline">Switch to gallery view</button>
        </div>
        <ol className="space-y-4" role="list">
          {items.map((it, i) => (
            <li key={it.id} className="p-4 border border-navy-200 rounded-lg bg-white">
              <h3 className="font-semibold text-navy-800 mb-2">{i + 1}. {it.title}</h3>
              <div>{it.content}</div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section aria-roledescription="carousel" aria-label={label} className="space-y-3" onKeyDown={onKey}>
      <div className="flex items-center justify-between">
        <h2 className="sr-only">{label}</h2>
        <div className="flex items-center gap-2">
          {autoplay && !prefs.reduceMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-navy-100 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={paused ? 'Play gallery' : 'Pause gallery'}
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {paused ? 'Play' : 'Pause'}
            </button>
          )}
          {showLinearFallback && (
            <button
              type="button"
              onClick={() => setLinearMode(true)}
              className="text-sm text-teal-700 underline hover:text-teal-900"
            >
              Show all as list
            </button>
          )}
        </div>
      </div>

      <div
        id={regionId}
        ref={trackRef}
        aria-live={canAutoplay ? 'off' : 'polite'}
        aria-atomic="false"
        className="relative overflow-hidden rounded-xl border border-navy-200 bg-white"
      >
        {items.map((it, i) => (
          <div
            key={it.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${items.length}: ${it.title}`}
            hidden={i !== index}
            className="p-6"
          >
            <h3 className="text-base font-semibold text-navy-900 mb-2">{it.title}</h3>
            {it.content}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 border border-navy-200 rounded-md hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          aria-label="Previous slide"
          aria-controls={regionId}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Prev
        </button>

        <div role="tablist" aria-label="Go to slide" className="flex gap-1.5">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={regionId}
              onClick={() => goTo(i)}
              className={`min-w-[44px] min-h-[44px] px-3 rounded-md text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                i === index ? 'bg-teal-600 text-white' : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(index + 1)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-navy-700 border border-navy-200 rounded-md hover:bg-navy-50 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
          aria-label="Next slide"
          aria-controls={regionId}
        >
          Next <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
