import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

/**
 * Single-slot policy for fixed/floating overlays.
 * Only one surface renders at a time, ranked by urgency:
 *   offline_banner > demo_banner > pwa_install > reading_toolbar
 *
 * Each surface calls `claim(surfaceId)` when it wants to show and
 * `release(surfaceId)` when it hides. `canShow(surfaceId)` returns true
 * only if no higher-priority surface is active.
 */
export type ChromeSurfaceId =
  | 'offline_banner'
  | 'demo_banner'
  | 'pwa_install'
  | 'reading_toolbar';

const PRIORITY: Record<ChromeSurfaceId, number> = {
  offline_banner: 40,
  demo_banner: 30,
  pwa_install: 20,
  reading_toolbar: 10,
};

interface Ctx {
  claim: (id: ChromeSurfaceId) => void;
  release: (id: ChromeSurfaceId) => void;
  canShow: (id: ChromeSurfaceId) => boolean;
}

const FloatingChromeContext = createContext<Ctx | undefined>(undefined);

export function FloatingChromeProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Set<ChromeSurfaceId>>(new Set());

  const claim = useCallback((id: ChromeSurfaceId) => {
    setActive((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const release = useCallback((id: ChromeSurfaceId) => {
    setActive((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const canShow = useCallback(
    (id: ChromeSurfaceId) => {
      const mine = PRIORITY[id];
      for (const other of active) {
        if (other === id) continue;
        if (PRIORITY[other] > mine) return false;
      }
      return true;
    },
    [active]
  );

  const value = useMemo(() => ({ claim, release, canShow }), [claim, release, canShow]);

  return (
    <FloatingChromeContext.Provider value={value}>{children}</FloatingChromeContext.Provider>
  );
}

export function useFloatingChrome(id: ChromeSurfaceId) {
  const ctx = useContext(FloatingChromeContext);
  if (!ctx) {
    return { canShow: true, claim: () => {}, release: () => {} };
  }
  return {
    canShow: ctx.canShow(id),
    claim: () => ctx.claim(id),
    release: () => ctx.release(id),
  };
}
