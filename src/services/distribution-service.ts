import { supabase } from '../lib/supabase';
import type { PartnerAsset } from './asset-service';

export interface DistributionRecipient {
  email: string;
  name?: string;
}

export interface DistributionRecord {
  id: string;
  asset_id: string;
  kit_generation_id: string | null;
  sent_by: string;
  recipients: DistributionRecipient[];
  channel: string;
  subject: string | null;
  notes: string;
  partner_id: string | null;
  status: string;
  created_at: string;
}

export async function sendAssetEmail(params: {
  asset: PartnerAsset;
  recipients: DistributionRecipient[];
  subject?: string;
  notes?: string;
  partnerId?: string;
  sentBy: string;
}): Promise<{ success: boolean; sent: number; total: number; error?: string }> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-asset-email`;

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipients: params.recipients,
      assetName: params.asset.name,
      assetType: params.asset.asset_type,
      contentSections: params.asset.content_sections,
      subject: params.subject,
      notes: params.notes,
      partnerId: params.partnerId,
      assetId: params.asset.id,
      sentBy: params.sentBy,
    }),
  });

  if (!response.ok) {
    return { success: false, sent: 0, total: params.recipients.length, error: 'Failed to send' };
  }

  return response.json();
}

export async function logDistribution(params: {
  assetId: string;
  sentBy: string;
  recipients: DistributionRecipient[];
  channel: string;
  subject?: string;
  notes?: string;
  partnerId?: string;
}): Promise<void> {
  await supabase.from('asset_distributions').insert({
    asset_id: params.assetId,
    sent_by: params.sentBy,
    recipients: params.recipients,
    channel: params.channel,
    subject: params.subject || null,
    notes: params.notes || '',
    partner_id: params.partnerId || null,
    status: 'sent',
  });
}

export async function fetchDistributionLog(
  assetId?: string,
  limit: number = 20
): Promise<DistributionRecord[]> {
  let query = supabase
    .from('asset_distributions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (assetId) {
    query = query.eq('asset_id', assetId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as DistributionRecord[];
}
