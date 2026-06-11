import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'ezlegal.theme';

function readInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === 'light' || mode === 'dark') return mode;
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyToDom(mode: ThemeMode, resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.dataset.theme = mode;
  root.dataset.resolvedTheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  const color = resolved === 'dark' ? '#0b1220' : '#ffffff';
  if (meta) {
    meta.setAttribute('content', color);
  } else {
    const m = document.createElement('meta');
    m.name = 'theme-color';
    m.content = color;
    document.head.appendChild(m);
  }
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(readInitialMode);
  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolve(readInitialMode()));

  useEffect(() => {
    const r = resolve(mode);
    setResolved(r);
    applyToDom(mode, r);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode, ignore */
    }
  }, [mode]);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (mode === 'system') {
        const r = mq.matches ? 'dark' : 'light';
        setResolved(r);
        applyToDom('system', r);
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user || !active) return;
      const { data: pref } = await supabase
        .from('accessibility_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!active) return;
      const remote = pref?.theme as ThemeMode | undefined;
      const local = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (remote && remote !== local) {
        setMode(remote);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setTheme = useCallback(async (next: ThemeMode) => {
    setMode(next);
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;
    await supabase
      .from('accessibility_preferences')
      .upsert(
        { user_id: user.id, theme: next, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
  }, []);

  const toggle = useCallback(() => {
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [resolved, setTheme]);

  return { mode, resolved, setTheme, toggle };
}
