import { supabase } from './supabase';
import { getAttribution, track } from './gtm-analytics';

export interface LeadData {
  icp: string;
  legalNeed: string;
  urgency: string;
  organizationName: string;
  teamSize: string;
  description: string;
  documentCount?: string;
  firstName: string;
  email: string;
  role: string;
  leadScore: number;
  recommendation: string;
}

export async function submitLead(data: LeadData): Promise<{ success: boolean; method: string }> {
  const attribution = getAttribution();
  const payload = {
    ...data,
    attribution,
    created_at: new Date().toISOString(),
  };

  track('lead_submit_attempt', { icp: data.icp, lead_score: data.leadScore });

  const endpoint = import.meta.env.VITE_LEAD_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      track('lead_submit_success', { method: 'endpoint', icp: data.icp });
      return { success: true, method: 'endpoint' };
    } catch (err) {
      track('lead_submit_error', { method: 'endpoint', error: String(err) });
    }
  }

  try {
    const { error } = await supabase.from('leads').insert({
      first_name: data.firstName,
      email: data.email,
      role_title: data.role,
      icp: data.icp,
      legal_need: data.legalNeed,
      urgency: data.urgency,
      organization: data.organizationName,
      company_size: data.teamSize,
      description: data.description,
      document_count: data.documentCount ? parseInt(data.documentCount, 10) || null : null,
      lead_score: data.leadScore,
      source_page: window.location.pathname,
      attribution,
      raw_payload: payload,
    });
    if (error) throw error;
    track('lead_submit_success', { method: 'supabase', icp: data.icp });
    return { success: true, method: 'supabase' };
  } catch {
    // Fallback to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('ezlegal_leads') || '[]');
      existing.push(payload);
      localStorage.setItem('ezlegal_leads', JSON.stringify(existing));
    } catch { /* ignore */ }
    track('lead_submit_success', { method: 'localStorage', icp: data.icp });
    return { success: true, method: 'localStorage' };
  }
}

export function calculateLeadScore(data: { urgency: string; legalNeed: string; teamSize: string; email: string }): number {
  let score = 0;
  if (data.urgency === 'today') score += 35;
  else if (data.urgency === 'this_week') score += 25;
  else if (data.urgency === 'this_month') score += 15;

  if (['contract_review', 'legal_intake'].includes(data.legalNeed)) score += 20;
  else if (data.legalNeed !== 'other') score += 10;

  const size = parseInt(data.teamSize, 10);
  if (!isNaN(size) && size > 10) score += 15;
  else if (!isNaN(size) && size > 3) score += 5;

  if (data.email && !data.email.includes('gmail') && !data.email.includes('yahoo') && !data.email.includes('hotmail')) {
    score += 10;
  }

  return score;
}
