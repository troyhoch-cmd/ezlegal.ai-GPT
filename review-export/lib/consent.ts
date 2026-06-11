import { supabase } from './supabase';

export const CONSENT_VERSION = '2026-05-03';

export type ConsentType = 'privacy_notice' | 'ai_processing' | 'marketing';

export async function recordConsent(params: {
  consentType: ConsentType;
  source: string;
  language: string;
  userId?: string | null;
  granted?: boolean;
}): Promise<void> {
  try {
    await supabase.from('consent_records').insert({
      user_id: params.userId ?? null,
      consent_type: params.consentType,
      consent_version: CONSENT_VERSION,
      granted: params.granted ?? true,
      source: params.source,
      language: params.language,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    // Consent logging must never break the user flow.
  }
}
