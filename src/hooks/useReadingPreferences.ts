import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface ReadingPreferences {
  dyslexia_friendly: boolean;
  high_contrast: boolean;
  underline_links: boolean;
  font_scale: number;
}

const STORAGE_KEY = 'ezlegal_reading_prefs';

const DEFAULTS: ReadingPreferences = {
  dyslexia_friendly: false,
  high_contrast: false,
  underline_links: false,
  font_scale: 1,
};

function clampScale(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(0.875, Math.min(1.5, n));
}

function readLocal(): ReadingPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      dyslexia_friendly: !!parsed.dyslexia_friendly,
      high_contrast: !!parsed.high_contrast,
      underline_links: !!parsed.underline_links,
      font_scale: clampScale(parsed.font_scale ?? 1),
    };
  } catch {
    return DEFAULTS;
  }
}

function applyToDocument(prefs: ReadingPreferences) {
  const root = document.documentElement;
  root.setAttribute('data-reading-dyslexia', String(prefs.dyslexia_friendly));
  root.setAttribute('data-reading-high-contrast', String(prefs.high_contrast));
  root.setAttribute('data-reading-underline-links', String(prefs.underline_links));
  root.style.setProperty('--reading-font-scale', String(prefs.font_scale));
}

export function useReadingPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<ReadingPreferences>(() => readLocal());

  useEffect(() => {
    applyToDocument(prefs);
  }, [prefs]);

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('reading_preferences')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled || !data?.reading_preferences) return;
      const remote = data.reading_preferences as Partial<ReadingPreferences>;
      setPrefs((prev) => ({
        dyslexia_friendly: remote.dyslexia_friendly ?? prev.dyslexia_friendly,
        high_contrast: remote.high_contrast ?? prev.high_contrast,
        underline_links: remote.underline_links ?? prev.underline_links,
        font_scale: clampScale(remote.font_scale ?? prev.font_scale),
      }));
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = useCallback(
    async (patch: Partial<ReadingPreferences>) => {
      setPrefs((prev) => {
        const next: ReadingPreferences = {
          ...prev,
          ...patch,
          font_scale: clampScale(patch.font_scale ?? prev.font_scale),
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        if (user) {
          void supabase
            .from('profiles')
            .update({ reading_preferences: next })
            .eq('id', user.id);
        }
        return next;
      });
    },
    [user]
  );

  return { prefs, update };
}
