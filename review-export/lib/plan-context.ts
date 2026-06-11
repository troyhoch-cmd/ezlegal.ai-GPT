const STORAGE_KEY = 'ezlegal.pendingPlan';

export interface PendingPlan {
  planId: string;
  source?: string;
  timestamp: number;
}

export function setPendingPlan(planId: string, source?: string): void {
  if (typeof window === 'undefined' || !planId) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ planId, source: source ?? '', timestamp: Date.now() }),
    );
  } catch {
    // sessionStorage unavailable
  }
}

export function readPendingPlan(): PendingPlan | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingPlan;
    if (!parsed?.planId) return null;
    if (Date.now() - parsed.timestamp > 1000 * 60 * 60 * 2) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPlan(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
