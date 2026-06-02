import { useState, useCallback, useRef } from 'react';

type EngagementKey = 'nextBestStep' | 'sharePrompt' | 'emailCapture';

interface ThrottleConfig {
  nextBestStep: { minMessages: number; maxShows: number };
  sharePrompt: { minDwellSeconds: number; minFollowUps: number };
  emailCapture: { requireAction: boolean };
}

const DEFAULT_CONFIG: ThrottleConfig = {
  nextBestStep: { minMessages: 2, maxShows: 1 },
  sharePrompt: { minDwellSeconds: 30, minFollowUps: 3 },
  emailCapture: { requireAction: true },
};

function getSessionKey(key: EngagementKey): string {
  return `ez_engagement_${key}_shown`;
}

function getSessionCount(key: EngagementKey): number {
  const val = sessionStorage.getItem(getSessionKey(key));
  return val ? parseInt(val, 10) : 0;
}

function incrementSession(key: EngagementKey): void {
  const count = getSessionCount(key) + 1;
  sessionStorage.setItem(getSessionKey(key), count.toString());
}

export function useEngagementThrottle(config: Partial<ThrottleConfig> = {}) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const sessionStart = useRef(Date.now());
  const [dismissed, setDismissed] = useState<Record<EngagementKey, boolean>>({
    nextBestStep: false,
    sharePrompt: false,
    emailCapture: false,
  });

  const shouldShowNextBestStep = useCallback((messageCount: number): boolean => {
    if (dismissed.nextBestStep) return false;
    if (messageCount < mergedConfig.nextBestStep.minMessages) return false;
    if (getSessionCount('nextBestStep') >= mergedConfig.nextBestStep.maxShows) return false;
    return true;
  }, [dismissed.nextBestStep, mergedConfig.nextBestStep]);

  const shouldShowSharePrompt = useCallback((messageCount: number): boolean => {
    if (dismissed.sharePrompt) return false;
    if (getSessionCount('sharePrompt') > 0) return false;
    const dwellSeconds = (Date.now() - sessionStart.current) / 1000;
    if (dwellSeconds < mergedConfig.sharePrompt.minDwellSeconds) return false;
    if (messageCount < mergedConfig.sharePrompt.minFollowUps) return false;
    return true;
  }, [dismissed.sharePrompt, mergedConfig.sharePrompt]);

  const shouldShowEmailCapture = useCallback((hasTriggeredAction: boolean, isAuthenticated: boolean): boolean => {
    if (dismissed.emailCapture) return false;
    if (isAuthenticated) return false;
    if (getSessionCount('emailCapture') > 0) return false;
    if (mergedConfig.emailCapture.requireAction && !hasTriggeredAction) return false;
    return true;
  }, [dismissed.emailCapture, mergedConfig.emailCapture]);

  const markShown = useCallback((key: EngagementKey) => {
    incrementSession(key);
  }, []);

  const dismiss = useCallback((key: EngagementKey) => {
    setDismissed(prev => ({ ...prev, [key]: true }));
    incrementSession(key);
  }, []);

  return {
    shouldShowNextBestStep,
    shouldShowSharePrompt,
    shouldShowEmailCapture,
    markShown,
    dismiss,
  };
}
