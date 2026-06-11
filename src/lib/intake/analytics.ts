/**
 * PRIVACY CONSTRAINT: Analytics events must NEVER include:
 * - Full legal narratives or case descriptions
 * - Names, emails, phone numbers, street addresses
 * - Immigration status or financial account details
 * - Case-specific facts or uploaded document contents
 * - Any data that could identify a specific legal matter
 *
 * Only non-sensitive categorical metadata is permitted.
 */

import type { ICP } from './types';

export interface SanitizedAnalyticsPayload {
  event: string;
  anonymousSessionId?: string;
  icp?: ICP;
  stepId?: string;
  stepIndex?: number;
  totalSteps?: number;
  language?: string;
  issueCategory?: string;
  timestamp: string;
  elapsedMs?: number;
  completionStatus?: 'completed' | 'abandoned' | 'escalated';
  uiMetadata?: {
    deviceType?: 'mobile' | 'desktop';
    entryPoint?: string;
    variant?: string;
  };
}

export type IntakeEvent =
  | { event: 'intake_started'; icp: ICP; language: string }
  | { event: 'intake_step_completed'; icp: ICP; stepId: string; stepIndex: number; totalSteps: number }
  | { event: 'intake_completed'; icp: ICP; language: string; durationMs: number }
  | { event: 'intake_abandoned'; icp: ICP; lastStepId: string; stepIndex: number; totalSteps: number; durationMs: number }
  | { event: 'intake_emergency_detected'; icp: ICP; riskLevel: string }
  | { event: 'intake_scope_boundary_shown'; icp: ICP; context: string }
  | { event: 'intake_legal_aid_matched'; jurisdiction: string; matchCount: number; hasVerified: boolean }
  | { event: 'intake_attorney_review_recommended'; businessSegment: string; documentType: string | null; triggerReasons: string[] }
  | { event: 'intake_attorney_review_cta_clicked'; businessSegment: string; tierId: string }
  | { event: 'intake_attorney_review_declined'; businessSegment: string }
  | { event: 'intake_consent_recorded'; consentType: string; granted: boolean }
  | { event: 'intake_partner_profile_created'; orgType: string }
  | { event: 'intake_referral_routed'; jurisdiction: string | null; issueArea: string | null }
  | { event: 'intake_resume_attempted'; icp: ICP; stepId: string };

function sanitizePayload(payload: IntakeEvent): SanitizedAnalyticsPayload {
  const base: SanitizedAnalyticsPayload = {
    event: payload.event,
    timestamp: new Date().toISOString(),
  };

  if ('icp' in payload) base.icp = payload.icp;
  if ('stepId' in payload) base.stepId = payload.stepId;
  if ('stepIndex' in payload) base.stepIndex = payload.stepIndex;
  if ('totalSteps' in payload) base.totalSteps = payload.totalSteps;
  if ('language' in payload) base.language = payload.language;
  if ('durationMs' in payload) base.elapsedMs = payload.durationMs;
  if ('issueArea' in payload && payload.issueArea) base.issueCategory = payload.issueArea;

  if (payload.event === 'intake_completed') base.completionStatus = 'completed';
  if (payload.event === 'intake_abandoned') base.completionStatus = 'abandoned';
  if (payload.event === 'intake_emergency_detected') base.completionStatus = 'escalated';

  return base;
}

export function trackIntakeEvent(payload: IntakeEvent): void {
  const sanitized = sanitizePayload(payload);
  if (typeof window !== 'undefined' && 'dataLayer' in window) {
    (window as unknown as { dataLayer: unknown[] }).dataLayer.push(sanitized);
  }
}

const INTAKE_START_KEY = 'ez_intake_start_ts';

export function markIntakeStart(): void {
  sessionStorage.setItem(INTAKE_START_KEY, Date.now().toString());
}

export function getIntakeDurationMs(): number {
  const start = sessionStorage.getItem(INTAKE_START_KEY);
  if (!start) return 0;
  return Date.now() - parseInt(start, 10);
}

export function clearIntakeStart(): void {
  sessionStorage.removeItem(INTAKE_START_KEY);
}
