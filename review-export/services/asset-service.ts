import { supabase } from '../lib/supabase';

export type ReadinessStatus = 'complete' | 'in_review' | 'draft' | 'not_applicable';

export interface AssetReadiness {
  id: string;
  asset_id: string;
  english_status: ReadinessStatus;
  spanish_status: ReadinessStatus;
  legal_review_status: ReadinessStatus;
  brand_approval_status: ReadinessStatus;
  legal_reviewer_id: string | null;
  legal_reviewed_at: string | null;
  brand_approver_id: string | null;
  brand_approved_at: string | null;
  spanish_reviewer_id: string | null;
  spanish_reviewed_at: string | null;
  version: number;
  blocked_reasons: string[];
}

export interface PartnerAsset {
  id: string;
  slug: string;
  name: string;
  asset_type: string;
  file_size: string;
  description: string;
  audience: string;
  content_sections: { heading: string; content: string[] }[];
  jurisdictions: string[];
  owner_team: string;
  pipeline_stages: string[];
  pinned: boolean;
  recommended: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  readiness: AssetReadiness | null;
  download_count: number;
}

export interface AssetFilters {
  language?: 'en' | 'es' | 'both' | 'all';
  jurisdiction?: string;
  pipeline_stage?: string;
  readiness?: 'ready' | 'partial' | 'blocked' | 'all';
  asset_type?: string;
  owner_team?: string;
  recommended_only?: boolean;
}

export interface SavedView {
  id: string;
  user_id: string;
  name: string;
  filters: AssetFilters;
  is_default: boolean;
}

export interface SpanishParityDetail {
  total: number;
  complete: number;
  inReview: number;
  draft: number;
  pct: number;
  missingAssets: { id: string; name: string; status: ReadinessStatus; downloads: number }[];
  byType: Record<string, { total: number; complete: number }>;
  byJurisdiction: Record<string, { total: number; complete: number }>;
}

export function getOverallReadiness(readiness: AssetReadiness): 'ready' | 'partial' | 'blocked' {
  const checks = [
    readiness.english_status,
    readiness.legal_review_status,
    readiness.brand_approval_status,
  ].filter(s => s !== 'not_applicable');
  if (checks.every(s => s === 'complete')) return 'ready';
  if (checks.some(s => s === 'draft')) return 'blocked';
  return 'partial';
}

export type ReadinessScope = 'bilingual' | 'en-only' | 'es-only' | 'not-applicable';

export function getReadinessScope(readiness: AssetReadiness): ReadinessScope {
  const enApplicable = readiness.english_status !== 'not_applicable';
  const esApplicable = readiness.spanish_status !== 'not_applicable';
  const esComplete = readiness.spanish_status === 'complete';

  if (!enApplicable && esApplicable) return 'es-only';
  if (!esApplicable) return 'not-applicable';
  if (esComplete) return 'bilingual';
  return 'en-only';
}

export function getReadinessLabel(readiness: AssetReadiness): string {
  const overall = getOverallReadiness(readiness);
  if (overall !== 'ready') {
    return overall === 'partial' ? 'Review Needed' : 'Blocked';
  }

  const scope = getReadinessScope(readiness);
  switch (scope) {
    case 'bilingual': return 'Ready to Send (EN+ES)';
    case 'en-only': return 'Ready to Send (EN Only)';
    case 'es-only': return 'Ready to Send (ES Only)';
    default: return 'Ready to Send';
  }
}

export function getBlockedReasons(readiness: AssetReadiness): string[] {
  const reasons: string[] = [];
  if (readiness.spanish_status === 'draft') reasons.push('Spanish translation in draft');
  if (readiness.spanish_status === 'in_review') reasons.push('Spanish translation in review');
  if (readiness.legal_review_status === 'draft') reasons.push('Legal review not started');
  if (readiness.legal_review_status === 'in_review') reasons.push('Legal review pending');
  if (readiness.brand_approval_status === 'draft') reasons.push('Brand approval not started');
  if (readiness.brand_approval_status === 'in_review') reasons.push('Brand approval pending');
  if (readiness.english_status === 'draft') reasons.push('English content in draft');
  if (readiness.english_status === 'in_review') reasons.push('English content in review');
  return reasons;
}

export async function fetchAssets(): Promise<PartnerAsset[]> {
  const { data: assets, error } = await supabase
    .from('partner_assets')
    .select('*')
    .eq('is_active', true)
    .order('pinned', { ascending: false })
    .order('recommended', { ascending: false })
    .order('updated_at', { ascending: false });

  if (error || !assets) return [];

  const { data: readinessData } = await supabase
    .from('asset_readiness')
    .select('*')
    .in('asset_id', assets.map(a => a.id));

  const { data: downloadCounts } = await supabase
    .from('asset_downloads')
    .select('asset_id');

  const readinessMap = new Map<string, AssetReadiness>();
  (readinessData || []).forEach(r => readinessMap.set(r.asset_id, r as AssetReadiness));

  const countMap = new Map<string, number>();
  (downloadCounts || []).forEach(d => {
    countMap.set(d.asset_id, (countMap.get(d.asset_id) || 0) + 1);
  });

  return assets.map(a => ({
    id: a.id,
    slug: a.slug,
    name: a.name,
    asset_type: a.asset_type,
    file_size: a.file_size,
    description: a.description,
    audience: a.audience,
    content_sections: a.content_sections as { heading: string; content: string[] }[],
    jurisdictions: a.jurisdictions || [],
    owner_team: a.owner_team,
    pipeline_stages: a.pipeline_stages || [],
    pinned: a.pinned,
    recommended: a.recommended,
    is_active: a.is_active,
    created_at: a.created_at,
    updated_at: a.updated_at,
    readiness: readinessMap.get(a.id) || null,
    download_count: countMap.get(a.id) || 0,
  }));
}

export async function recordDownload(
  assetId: string,
  userId: string | null,
  partnerId: string | null = null,
  downloadType: string = 'full_download'
): Promise<void> {
  if (!userId) return;
  await supabase.from('asset_downloads').insert({
    asset_id: assetId,
    user_id: userId,
    partner_id: partnerId,
    download_type: downloadType,
  });
}

export async function saveKitGeneration(params: {
  partnerId?: string;
  generatedBy: string;
  languageFilter: string;
  jurisdictionFilter: string;
  stageFilter: string;
  selectedAssetIds: string[];
  spanishOnlyEnforced: boolean;
  printOptimized?: boolean;
  kitContent: string;
}): Promise<void> {
  await supabase.from('partner_kit_generations').insert({
    partner_id: params.partnerId || null,
    generated_by: params.generatedBy,
    language_filter: params.languageFilter,
    jurisdiction_filter: params.jurisdictionFilter,
    stage_filter: params.stageFilter,
    selected_asset_ids: params.selectedAssetIds,
    spanish_only_enforced: params.spanishOnlyEnforced,
    print_optimized: params.printOptimized || false,
    kit_content: params.kitContent,
  });
}

export async function fetchSavedViews(userId: string): Promise<SavedView[]> {
  const { data } = await supabase
    .from('user_saved_asset_views')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('name');
  return (data || []) as SavedView[];
}

export async function createSavedView(
  userId: string,
  name: string,
  filters: AssetFilters,
  isDefault: boolean = false
): Promise<SavedView | null> {
  const { data } = await supabase
    .from('user_saved_asset_views')
    .insert({ user_id: userId, name, filters, is_default: isDefault })
    .select()
    .maybeSingle();
  return data as SavedView | null;
}

export async function deleteSavedView(viewId: string): Promise<void> {
  await supabase.from('user_saved_asset_views').delete().eq('id', viewId);
}

export function computeSpanishParity(assets: PartnerAsset[]): SpanishParityDetail {
  const applicable = assets.filter(a => a.readiness && a.readiness.spanish_status !== 'not_applicable');
  const complete = applicable.filter(a => a.readiness!.spanish_status === 'complete');
  const inReview = applicable.filter(a => a.readiness!.spanish_status === 'in_review');
  const draft = applicable.filter(a => a.readiness!.spanish_status === 'draft');

  const missingAssets = applicable
    .filter(a => a.readiness!.spanish_status !== 'complete')
    .map(a => ({
      id: a.id,
      name: a.name,
      status: a.readiness!.spanish_status,
      downloads: a.download_count,
    }))
    .sort((a, b) => b.downloads - a.downloads);

  const byType: Record<string, { total: number; complete: number }> = {};
  applicable.forEach(a => {
    const t = a.asset_type;
    if (!byType[t]) byType[t] = { total: 0, complete: 0 };
    byType[t].total++;
    if (a.readiness!.spanish_status === 'complete') byType[t].complete++;
  });

  const byJurisdiction: Record<string, { total: number; complete: number }> = {};
  applicable.forEach(a => {
    const jrs = a.jurisdictions.length > 0 ? a.jurisdictions : ['General'];
    jrs.forEach(j => {
      if (!byJurisdiction[j]) byJurisdiction[j] = { total: 0, complete: 0 };
      byJurisdiction[j].total++;
      if (a.readiness!.spanish_status === 'complete') byJurisdiction[j].complete++;
    });
  });

  return {
    total: applicable.length,
    complete: complete.length,
    inReview: inReview.length,
    draft: draft.length,
    pct: applicable.length > 0 ? Math.round((complete.length / applicable.length) * 100) : 0,
    missingAssets,
    byType,
    byJurisdiction,
  };
}

export type ReadinessDimension = 'english' | 'spanish' | 'legal' | 'brand';

export interface ReadinessAuditEntry {
  id: string;
  asset_id: string;
  dimension: string;
  old_status: string;
  new_status: string;
  changed_by: string;
  note: string;
  created_at: string;
}

const dimensionColumnMap: Record<ReadinessDimension, {
  status: string;
  reviewer?: string;
  reviewedAt?: string;
}> = {
  english: { status: 'english_status' },
  spanish: { status: 'spanish_status', reviewer: 'spanish_reviewer_id', reviewedAt: 'spanish_reviewed_at' },
  legal: { status: 'legal_review_status', reviewer: 'legal_reviewer_id', reviewedAt: 'legal_reviewed_at' },
  brand: { status: 'brand_approval_status', reviewer: 'brand_approver_id', reviewedAt: 'brand_approved_at' },
};

export async function updateAssetReadiness(
  assetId: string,
  dimension: ReadinessDimension,
  newStatus: ReadinessStatus,
  userId: string,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const { data: current, error: fetchErr } = await supabase
    .from('asset_readiness')
    .select('*')
    .eq('asset_id', assetId)
    .maybeSingle();

  if (fetchErr || !current) {
    return { success: false, error: fetchErr?.message || 'Readiness record not found' };
  }

  const cols = dimensionColumnMap[dimension];
  const oldStatus = current[cols.status] as string;

  if (oldStatus === newStatus) {
    return { success: true };
  }

  const updatePayload: Record<string, unknown> = {
    [cols.status]: newStatus,
    version: (current.version || 1) + 1,
    updated_at: new Date().toISOString(),
  };

  if (cols.reviewer) {
    if (newStatus === 'complete') {
      updatePayload[cols.reviewer] = userId;
      updatePayload[cols.reviewedAt!] = new Date().toISOString();
    } else if (newStatus === 'draft') {
      updatePayload[cols.reviewer] = null;
      updatePayload[cols.reviewedAt!] = null;
    }
  }

  const { error: updateErr } = await supabase
    .from('asset_readiness')
    .update(updatePayload)
    .eq('asset_id', assetId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  await supabase.from('asset_readiness_audit_log').insert({
    asset_id: assetId,
    dimension,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: userId,
    note: note || '',
  });

  return { success: true };
}

export async function fetchReadinessAuditLog(assetId: string): Promise<ReadinessAuditEntry[]> {
  const { data, error } = await supabase
    .from('asset_readiness_audit_log')
    .select('*')
    .eq('asset_id', assetId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as ReadinessAuditEntry[];
}

export function filterAssets(assets: PartnerAsset[], filters: AssetFilters): PartnerAsset[] {
  return assets.filter(a => {
    if (!a.readiness) return false;

    if (filters.language && filters.language !== 'all') {
      if (filters.language === 'en' && a.readiness.english_status === 'not_applicable') return false;
      if (filters.language === 'es' && a.readiness.spanish_status === 'not_applicable') return false;
      if (filters.language === 'es' && a.readiness.spanish_status === 'draft') return false;
    }

    if (filters.jurisdiction && filters.jurisdiction !== 'all') {
      if (a.jurisdictions.length > 0 && !a.jurisdictions.includes(filters.jurisdiction)) return false;
    }

    if (filters.pipeline_stage && filters.pipeline_stage !== 'all') {
      if (!a.pipeline_stages.includes(filters.pipeline_stage)) return false;
    }

    if (filters.readiness && filters.readiness !== 'all') {
      const overall = getOverallReadiness(a.readiness);
      if (overall !== filters.readiness) return false;
    }

    if (filters.asset_type && filters.asset_type !== 'all') {
      if (a.asset_type !== filters.asset_type) return false;
    }

    if (filters.owner_team && filters.owner_team !== 'all') {
      if (a.owner_team !== filters.owner_team) return false;
    }

    if (filters.recommended_only && !a.recommended) return false;

    return true;
  });
}
