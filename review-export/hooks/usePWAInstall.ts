import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt: () => Promise<void>;
}

type EventType = 'prompt_shown' | 'accepted' | 'dismissed' | 'installed' | 'display_mode';

async function logEvent(event_type: EventType, extra: Record<string, unknown> = {}) {
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from('pwa_install_events').insert({
      user_id: data?.user?.id ?? null,
      event_type,
      platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      display_mode: getDisplayMode(),
      user_agent: navigator.userAgent.slice(0, 512),
      context: extra,
    });
  } catch {
    /* non-fatal */
  }
}

function getDisplayMode(): string {
  if (typeof window === 'undefined') return 'browser';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
  if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
  if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
  // iOS Safari
  if ((navigator as unknown as { standalone?: boolean }).standalone) return 'standalone';
  return 'browser';
}

export function usePWAInstall() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => getDisplayMode() === 'standalone');

  useEffect(() => {
    const onBefore = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      void logEvent('prompt_shown');
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
      void logEvent('installed');
    };
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    void logEvent('display_mode', { mode: getDisplayMode() });
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installEvent) return 'unavailable' as const;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    void logEvent(choice.outcome === 'accepted' ? 'accepted' : 'dismissed', { platform: choice.platform });
    setInstallEvent(null);
    return choice.outcome;
  }, [installEvent]);

  return {
    canInstall: !!installEvent && !installed,
    installed,
    promptInstall,
    displayMode: getDisplayMode(),
  };
}
