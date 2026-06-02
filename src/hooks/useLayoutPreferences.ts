import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface LayoutPreferences {
  hide_sidebar: boolean;
  collapse_trust_strips: boolean;
  suppress_onboarding: boolean;
}

const STORAGE_KEY = 'ez_layout_prefs';
const DEFAULTS: LayoutPreferences = {
  hide_sidebar: false,
  collapse_trust_strips: false,
  suppress_onboarding: false,
};

function readLocal(): LayoutPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export function useLayoutPreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<LayoutPreferences>(() => readLocal());

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('layout_preferences')
        .eq('id', user.id)
        .maybeSingle();
      if (cancelled || !data?.layout_preferences) return;
      setPrefs((prev) => ({ ...prev, ...(data.layout_preferences as object) }));
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = useCallback(
    async (patch: Partial<LayoutPreferences>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        if (user) {
          void supabase
            .from('profiles')
            .update({ layout_preferences: next })
            .eq('id', user.id);
        }
        return next;
      });
    },
    [user]
  );

  return { prefs, update };
}
