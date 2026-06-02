/**
 * PRIVACY CONSTRAINT: Recovery state must NEVER store:
 * - Legal narratives or case descriptions
 * - Names, emails, phone numbers, addresses
 * - Document contents or uploaded file data
 * - Immigration status or financial details
 *
 * Only store the minimum needed to resume: ICP, step position,
 * language, and non-sensitive UI selections (e.g., category chosen).
 */

import type { ICP } from './types';

const RECOVERY_KEY = 'ez_intake_recovery';
const RECOVERY_TTL_HOURS = 72;

export interface RecoveryState {
  icp: ICP;
  stepId: string;
  stepIndex: number;
  language: string;
  savedAt: string;
  selections: {
    issueCategory?: string;
    jurisdiction?: string;
    businessSegment?: string;
    orgType?: string;
  };
}

export const RECOVERY_COPY = {
  en: {
    resumeBanner: 'You have saved progress. Would you like to continue where you left off?',
    resumeButton: 'Resume saved progress',
    clearButton: 'Start fresh',
    clearedMessage: 'Saved progress cleared.',
    expiryNote: 'Saved progress expires after 72 hours.',
  },
  es: {
    resumeBanner: 'Tiene progreso guardado. ¿Le gustaría continuar donde lo dejó?',
    resumeButton: 'Continuar progreso guardado',
    clearButton: 'Empezar de nuevo',
    clearedMessage: 'Progreso guardado eliminado.',
    expiryNote: 'El progreso guardado expira después de 72 horas.',
  },
} as const;

export function saveRecoveryState(state: RecoveryState): void {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function getRecoveryState(): RecoveryState | null {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw) as RecoveryState;
    if (isExpired(state.savedAt)) {
      clearRecoveryState();
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearRecoveryState(): void {
  localStorage.removeItem(RECOVERY_KEY);
}

export function hasRecoverableSession(): boolean {
  return getRecoveryState() !== null;
}

export function getRecoveryExpiration(): Date | null {
  const state = getRecoveryState();
  if (!state) return null;
  const savedAt = new Date(state.savedAt).getTime();
  return new Date(savedAt + RECOVERY_TTL_HOURS * 60 * 60 * 1000);
}

export function clearSavedProgress(): void {
  clearRecoveryState();
}

function isExpired(savedAt: string): boolean {
  const savedTime = new Date(savedAt).getTime();
  const hoursSince = (Date.now() - savedTime) / (1000 * 60 * 60);
  return hoursSince > RECOVERY_TTL_HOURS;
}
