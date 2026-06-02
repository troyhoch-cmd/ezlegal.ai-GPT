import { useState, useEffect } from 'react';
import { Type, Eye, Link as LinkIcon, ALargeSmall, Settings2, X } from 'lucide-react';
import { useReadingPreferences } from '../hooks/useReadingPreferences';
import { useFloatingChrome } from '../contexts/FloatingChromeContext';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { trackEvent } from '../services/analytics-service';

export default function ReadingPreferencesToolbar() {
  const { prefs, update } = useReadingPreferences();
  const [open, setOpen] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const chrome = useFloatingChrome('reading_toolbar');
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!isMobile) { setPastHero(true); return; }
    const hero = document.querySelector('[data-hero-primary-cta]');
    if (!hero) { setPastHero(true); return; }

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isMobile]);

  const scalePct = Math.round(prefs.font_scale * 100);

  if (!chrome.canShow && !open) return null;
  if (isMobile && !pastHero && !open) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => { const next = !open; setOpen(next); if (next) trackEvent('reading_preferences_open', {}); }}
        aria-expanded={open}
        aria-controls="reading-prefs-panel"
        aria-label="Reading preferences"
        className={`fixed z-40 inline-flex items-center justify-center gap-2 rounded-full bg-navy-900 text-white shadow-lg hover:bg-navy-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 ${
          isMobile
            ? 'right-4 w-11 h-11 p-0'
            : 'bottom-4 right-4 px-4 py-2'
        }`}
        style={{ bottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 4.5rem)' : undefined }}
      >
        <Settings2 className="w-4 h-4" aria-hidden="true" />
        {!isMobile && <span className="text-sm font-medium">Reading</span>}
      </button>

      {open && (
        <div
          id="reading-prefs-panel"
          role="dialog"
          aria-labelledby="reading-prefs-title"
          className={`fixed right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-xl bg-white border border-slate-200 shadow-xl p-4 ${
            isMobile ? '' : 'bottom-20'
          }`}
          style={{ bottom: isMobile ? 'calc(env(safe-area-inset-bottom, 0px) + 8rem)' : undefined }}
        >
          <div className="flex items-start justify-between mb-3">
            <h2 id="reading-prefs-title" className="text-base font-semibold text-navy-900">
              Reading preferences
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close reading preferences"
              className="text-slate-500 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="sr-only">Text size</legend>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm text-navy-900">
                  <ALargeSmall className="w-4 h-4" aria-hidden="true" />
                  Text size ({scalePct}%)
                </span>
                <div className="inline-flex rounded-md border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => update({ font_scale: Math.max(0.875, prefs.font_scale - 0.0625) })}
                    className="px-3 py-1 text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    aria-label="Decrease text size"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ font_scale: 1 })}
                    className="px-3 py-1 text-sm border-x border-slate-200 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    aria-label="Reset text size"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    onClick={() => update({ font_scale: Math.min(1.5, prefs.font_scale + 0.0625) })}
                    className="px-3 py-1 text-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                    aria-label="Increase text size"
                  >
                    A+
                  </button>
                </div>
              </div>
            </fieldset>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="inline-flex items-center gap-2 text-sm text-navy-900">
                <Type className="w-4 h-4" aria-hidden="true" />
                Dyslexia-friendly spacing
              </span>
              <input
                type="checkbox"
                checked={prefs.dyslexia_friendly}
                onChange={(e) => update({ dyslexia_friendly: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="inline-flex items-center gap-2 text-sm text-navy-900">
                <Eye className="w-4 h-4" aria-hidden="true" />
                High contrast
              </span>
              <input
                type="checkbox"
                checked={prefs.high_contrast}
                onChange={(e) => update({ high_contrast: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="inline-flex items-center gap-2 text-sm text-navy-900">
                <LinkIcon className="w-4 h-4" aria-hidden="true" />
                Always underline links
              </span>
              <input
                type="checkbox"
                checked={prefs.underline_links}
                onChange={(e) => update({ underline_links: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Signed-in users: settings sync across devices.
          </p>
        </div>
      )}
    </>
  );
}
