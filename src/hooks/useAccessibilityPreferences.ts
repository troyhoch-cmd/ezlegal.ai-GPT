import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface AccessibilityPreferences {
  reduceMotion: boolean;
  highContrast: boolean;
  textSize: 'normal' | 'large' | 'x-large';
  keyboardFirst: boolean;
  screenReaderHints: boolean;
  simplifiedLayout: boolean;
  linkUnderlines: boolean;
  captionsDefault: boolean;
}

const DEFAULT: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  textSize: 'normal',
  keyboardFirst: false,
  screenReaderHints: false,
  simplifiedLayout: false,
  linkUnderlines: false,
  captionsDefault: false,
};

function readMediaDefaults(): AccessibilityPreferences {
  if (typeof window === 'undefined' || !window.matchMedia) return DEFAULT;
  return {
    ...DEFAULT,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    highContrast: window.matchMedia('(prefers-contrast: more)').matches,
  };
}

export function useAccessibilityPreferences() {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>(readMediaDefaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const mm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mh = window.matchMedia('(prefers-contrast: more)');
    const update = () =>
      setPrefs((p) => ({
        ...p,
        reduceMotion: p.reduceMotion || mm.matches,
        highContrast: p.highContrast || mh.matches,
      }));
    mm.addEventListener('change', update);
    mh.addEventListener('change', update);

    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      if (!user) {
        setLoaded(true);
        return;
      }
      const { data } = await supabase
        .from('accessibility_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!mounted) return;
      if (data) {
        setPrefs({
          reduceMotion: data.reduce_motion || mm.matches,
          highContrast: data.high_contrast || mh.matches,
          textSize: data.text_size,
          keyboardFirst: data.keyboard_first,
          screenReaderHints: data.screen_reader_hints,
          simplifiedLayout: data.simplified_layout,
          linkUnderlines: data.link_underlines,
          captionsDefault: data.captions_default,
        });
      }
      setLoaded(true);
    })();

    return () => {
      mounted = false;
      mm.removeEventListener('change', update);
      mh.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reduceMotion = prefs.reduceMotion ? 'true' : 'false';
    root.dataset.highContrast = prefs.highContrast ? 'true' : 'false';
    root.dataset.textSize = prefs.textSize;
    root.dataset.simplifiedLayout = prefs.simplifiedLayout ? 'true' : 'false';
  }, [prefs]);

  const updatePref = useCallback(async <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
    const { data: authData } = await supabase.auth.getUser();
    const user = authData?.user;
    if (!user) return;
    const dbKey = {
      reduceMotion: 'reduce_motion',
      highContrast: 'high_contrast',
      textSize: 'text_size',
      keyboardFirst: 'keyboard_first',
      screenReaderHints: 'screen_reader_hints',
      simplifiedLayout: 'simplified_layout',
      linkUnderlines: 'link_underlines',
      captionsDefault: 'captions_default',
    }[key];
    await supabase.from('accessibility_preferences').upsert(
      { user_id: user.id, [dbKey]: value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    );
  }, []);

  return { prefs, updatePref, loaded };
}
