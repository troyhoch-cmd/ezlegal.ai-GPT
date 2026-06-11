import { supabase } from '../lib/supabase';

export type MatterStatus = 'active' | 'watching' | 'resolved' | 'escalated';
export type MatterRisk = 'low' | 'medium' | 'high' | 'urgent';
export type MatterAudience = 'individual' | 'business' | 'legal_aid';
export type DeadlineKind = 'court_date' | 'response' | 'filing' | 'renewal' | 'compliance' | 'notice' | 'other';
export type VaultKind = 'notice' | 'lease' | 'contract' | 'court' | 'correspondence' | 'policy' | 'identity' | 'other';

export interface LegalMatter {
  id: string;
  user_id: string;
  title: string;
  issue_type: string;
  jurisdiction: string;
  status: MatterStatus;
  summary: string;
  next_step: string;
  next_step_due: string | null;
  risk_level: MatterRisk;
  audience: MatterAudience;
  pack_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SafetyDeadline {
  id: string;
  matter_id: string;
  user_id: string;
  title: string;
  description: string;
  due_at: string;
  kind: DeadlineKind;
  completed_at: string | null;
  reminder_days_before: number[];
  created_at: string;
}

export interface VaultItem {
  id: string;
  matter_id: string | null;
  user_id: string;
  title: string;
  kind: VaultKind;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  summary: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  matter_id: string;
  user_id: string;
  event_type: string;
  summary: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface HealthSignals {
  has_jurisdiction: boolean;
  has_active_matter: boolean;
  has_vault_document: boolean;
  deadlines_tracked: number;
  overdue_deadlines: number;
  resolved_matters: number;
  emergency_contact: boolean;
  plan_next_step_set: boolean;
}

export interface HealthRecommendation {
  id: string;
  en: string;
  es: string;
  weight: number;
  cta_route: string;
}

export interface HealthSnapshot {
  score: number;
  signals: HealthSignals;
  recommendations: HealthRecommendation[];
}

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export type PlanId = 'free' | 'plus' | 'protection' | 'business' | 'business_plus';
export type ReminderChannel = 'in_app' | 'email' | 'sms' | 'whatsapp';

export interface PlanEntitlements {
  user_id: string;
  plan: PlanId;
  vault_mb_limit: number;
  matter_limit: number;
  reminder_channels: ReminderChannel[];
  monthly_checkup_enabled: boolean;
  attorney_handoff_enabled: boolean;
  updated_at: string;
}

const PLAN_DEFAULTS: Record<PlanId, Omit<PlanEntitlements, 'user_id' | 'updated_at'>> = {
  free: {
    plan: 'free',
    vault_mb_limit: 10,
    matter_limit: 1,
    reminder_channels: ['in_app'],
    monthly_checkup_enabled: false,
    attorney_handoff_enabled: false,
  },
  plus: {
    plan: 'plus',
    vault_mb_limit: 500,
    matter_limit: 5,
    reminder_channels: ['in_app', 'email'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: false,
  },
  protection: {
    plan: 'protection',
    vault_mb_limit: 2000,
    matter_limit: 25,
    reminder_channels: ['in_app', 'email', 'sms', 'whatsapp'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: true,
  },
  business: {
    plan: 'business',
    vault_mb_limit: 5000,
    matter_limit: 50,
    reminder_channels: ['in_app', 'email', 'sms'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: true,
  },
  business_plus: {
    plan: 'business_plus',
    vault_mb_limit: 20000,
    matter_limit: 250,
    reminder_channels: ['in_app', 'email', 'sms', 'whatsapp'],
    monthly_checkup_enabled: true,
    attorney_handoff_enabled: true,
  },
};

export async function getEntitlements(): Promise<PlanEntitlements | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('safety_plan_entitlements')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (data) return data as PlanEntitlements;
  const defaults = { ...PLAN_DEFAULTS.free, user_id: uid };
  const { data: created } = await supabase
    .from('safety_plan_entitlements')
    .insert(defaults)
    .select('*')
    .maybeSingle();
  return (created as PlanEntitlements) ?? null;
}

export async function setPlan(plan: PlanId): Promise<PlanEntitlements | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const defaults = PLAN_DEFAULTS[plan];
  const { data } = await supabase
    .from('safety_plan_entitlements')
    .upsert({ user_id: uid, ...defaults, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select('*')
    .maybeSingle();
  return (data as PlanEntitlements) ?? null;
}

export async function scheduleReminders(
  deadlineId: string,
  dueAt: string,
  daysBefore: number[],
  channels: ReminderChannel[],
): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  const due = new Date(dueAt).getTime();
  const rows = daysBefore.flatMap((d) =>
    channels.map((c) => ({
      deadline_id: deadlineId,
      user_id: uid,
      channel: c,
      scheduled_for: new Date(due - d * 86400000).toISOString(),
      status: 'pending',
    })),
  );
  if (rows.length === 0) return;
  await supabase.from('safety_reminders').delete().eq('deadline_id', deadlineId).eq('user_id', uid);
  await supabase.from('safety_reminders').insert(rows);
}

export async function listReminders(deadlineId: string) {
  const { data } = await supabase
    .from('safety_reminders')
    .select('id, channel, scheduled_for, sent_at, status')
    .eq('deadline_id', deadlineId)
    .order('scheduled_for');
  return data || [];
}

export async function uploadVaultFile(
  file: File,
  kind: VaultKind,
  matterId: string | null,
  title: string,
): Promise<{ item: VaultItem | null; error: string | null }> {
  const uid = await currentUserId();
  if (!uid) return { item: null, error: 'Not signed in' };

  const ent = await getEntitlements();
  if (ent) {
    const { data: existing } = await supabase
      .from('safety_vault_items')
      .select('size_bytes')
      .eq('user_id', uid);
    const used = (existing || []).reduce((n, r: { size_bytes: number }) => n + (r.size_bytes || 0), 0);
    const limitBytes = ent.vault_mb_limit * 1024 * 1024;
    if (used + file.size > limitBytes) {
      return { item: null, error: 'vault_limit_reached' };
    }
  }

  const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const up = await supabase.storage.from('legal-vault').upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (up.error) return { item: null, error: up.error.message };

  const { data } = await supabase
    .from('safety_vault_items')
    .insert({
      user_id: uid,
      matter_id: matterId,
      title: title || file.name,
      kind,
      storage_path: path,
      mime_type: file.type || '',
      size_bytes: file.size,
      summary: '',
    })
    .select('*')
    .maybeSingle();
  return { item: (data as VaultItem) ?? null, error: null };
}

export async function deleteVaultFile(item: VaultItem): Promise<void> {
  if (item.storage_path) {
    await supabase.storage.from('legal-vault').remove([item.storage_path]);
  }
  await supabase.from('safety_vault_items').delete().eq('id', item.id);
}

export async function explainDocumentText(
  text: string,
  language: 'en' | 'es',
  kind: string,
): Promise<{
  summary: string;
  what_it_is: string;
  who_sent_it: string;
  what_they_want: string;
  deadlines: string[];
  risks: string[];
  suggested_next_steps: string[];
} | null> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/explain-document`;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, language, kind }),
  });
  if (!res.ok) return null;
  return await res.json();
}

export async function saveDocumentSummary(itemId: string, summary: string): Promise<void> {
  await supabase.from('safety_vault_items').update({ summary }).eq('id', itemId);
}

export interface CheckupAnswers {
  address_still_current: boolean;
  new_notice_received: boolean;
  new_documents_to_upload: boolean;
  deadline_changed: boolean;
  emergency_contact_current: boolean;
  attorney_needed: boolean;
  notes: string;
}

export interface CheckupRow {
  id: string;
  user_id: string;
  period_key: string;
  answers: CheckupAnswers;
  action_items: string[];
  completed_at: string;
}

function currentPeriodKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export async function getCurrentCheckup(): Promise<CheckupRow | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('safety_checkups')
    .select('*')
    .eq('user_id', uid)
    .eq('period_key', currentPeriodKey())
    .maybeSingle();
  return (data as CheckupRow) ?? null;
}

export async function saveCheckup(answers: CheckupAnswers): Promise<CheckupRow | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const actions: string[] = [];
  if (answers.new_notice_received || answers.new_documents_to_upload) actions.push('upload_documents');
  if (answers.deadline_changed) actions.push('review_deadlines');
  if (!answers.emergency_contact_current) actions.push('update_emergency_contact');
  if (!answers.address_still_current) actions.push('update_address');
  if (answers.attorney_needed) actions.push('request_attorney_handoff');

  const { data } = await supabase
    .from('safety_checkups')
    .upsert(
      {
        user_id: uid,
        period_key: currentPeriodKey(),
        answers,
        action_items: actions,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,period_key' },
    )
    .select('*')
    .maybeSingle();
  return (data as CheckupRow) ?? null;
}

export async function listMatters(): Promise<LegalMatter[]> {
  const { data } = await supabase
    .from('legal_matters')
    .select('*')
    .order('updated_at', { ascending: false });
  return (data as LegalMatter[]) || [];
}

export async function createMatter(input: Partial<LegalMatter> & { title: string }): Promise<LegalMatter | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('legal_matters')
    .insert({
      user_id: uid,
      title: input.title,
      issue_type: input.issue_type ?? 'general',
      jurisdiction: input.jurisdiction ?? '',
      status: input.status ?? 'active',
      summary: input.summary ?? '',
      next_step: input.next_step ?? '',
      next_step_due: input.next_step_due ?? null,
      risk_level: input.risk_level ?? 'low',
      audience: input.audience ?? 'individual',
      pack_id: input.pack_id ?? null,
    })
    .select('*')
    .maybeSingle();
  if (data) {
    await logTimeline(data.id, 'created', input.title);
  }
  return data as LegalMatter | null;
}

export async function updateMatter(id: string, patch: Partial<LegalMatter>): Promise<void> {
  await supabase
    .from('legal_matters')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
}

export async function listDeadlines(matterId?: string): Promise<SafetyDeadline[]> {
  let q = supabase.from('safety_deadlines').select('*').order('due_at', { ascending: true });
  if (matterId) q = q.eq('matter_id', matterId);
  const { data } = await q;
  return (data as SafetyDeadline[]) || [];
}

export async function listUpcomingDeadlines(withinDays = 30): Promise<SafetyDeadline[]> {
  const until = new Date(Date.now() + withinDays * 86400000).toISOString();
  const { data } = await supabase
    .from('safety_deadlines')
    .select('*')
    .is('completed_at', null)
    .lte('due_at', until)
    .order('due_at', { ascending: true });
  return (data as SafetyDeadline[]) || [];
}

export async function createDeadline(input: Omit<SafetyDeadline, 'id' | 'user_id' | 'created_at' | 'completed_at'>): Promise<SafetyDeadline | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await supabase
    .from('safety_deadlines')
    .insert({ ...input, user_id: uid })
    .select('*')
    .maybeSingle();
  if (data) {
    await logTimeline(input.matter_id, 'deadline_added', `${input.title} due ${input.due_at}`);
  }
  return data as SafetyDeadline | null;
}

export async function completeDeadline(id: string): Promise<void> {
  const { data } = await supabase
    .from('safety_deadlines')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', id)
    .select('matter_id, title')
    .maybeSingle();
  if (data) {
    await logTimeline(data.matter_id as string, 'deadline_completed', data.title as string);
  }
}

export async function listVaultItems(matterId?: string): Promise<VaultItem[]> {
  let q = supabase.from('safety_vault_items').select('*').order('created_at', { ascending: false });
  if (matterId) q = q.eq('matter_id', matterId);
  const { data } = await q;
  return (data as VaultItem[]) || [];
}

export async function logTimeline(matterId: string, eventType: string, summary: string, metadata: Record<string, unknown> = {}): Promise<void> {
  const uid = await currentUserId();
  if (!uid) return;
  await supabase.from('safety_timeline_events').insert({
    matter_id: matterId,
    user_id: uid,
    event_type: eventType,
    summary,
    metadata,
  });
}

export async function listTimeline(matterId: string): Promise<TimelineEvent[]> {
  const { data } = await supabase
    .from('safety_timeline_events')
    .select('*')
    .eq('matter_id', matterId)
    .order('occurred_at', { ascending: false });
  return (data as TimelineEvent[]) || [];
}

const RECOMMENDATIONS: HealthRecommendation[] = [
  { id: 'set_jurisdiction', en: 'Select your state so answers match your law', es: 'Selecciona tu estado para obtener respuestas de tu ley', weight: 15, cta_route: '/profile' },
  { id: 'create_matter', en: 'Save your first legal matter so we can track it over time', es: 'Guarda tu primer caso legal para darle seguimiento', weight: 20, cta_route: '/dashboard/matters/new' },
  { id: 'upload_document', en: 'Upload a notice, lease, or contract to your secure vault', es: 'Sube un aviso, contrato o carta a tu boveda segura', weight: 15, cta_route: '/dashboard/vault' },
  { id: 'add_deadline', en: 'Add a deadline so we can remind you before it matters', es: 'Agrega una fecha limite para recordarte antes de que importe', weight: 20, cta_route: '/dashboard/deadlines' },
  { id: 'set_next_step', en: 'Define your next best step on each active matter', es: 'Define tu siguiente mejor paso en cada caso activo', weight: 15, cta_route: '/dashboard' },
  { id: 'review_overdue', en: 'Review overdue deadlines and mark completed or reschedule', es: 'Revisa fechas vencidas y marcalas como completadas', weight: 15, cta_route: '/dashboard/deadlines' },
];

export async function computeHealthSnapshot(): Promise<HealthSnapshot> {
  const uid = await currentUserId();
  if (!uid) {
    return {
      score: 0,
      signals: {
        has_jurisdiction: false,
        has_active_matter: false,
        has_vault_document: false,
        deadlines_tracked: 0,
        overdue_deadlines: 0,
        resolved_matters: 0,
        emergency_contact: false,
        plan_next_step_set: false,
      },
      recommendations: RECOMMENDATIONS.slice(0, 3),
    };
  }

  const [profileRes, mattersRes, deadlinesRes, vaultRes] = await Promise.all([
    supabase.from('profiles').select('preferred_jurisdiction, phone').eq('id', uid).maybeSingle(),
    supabase.from('legal_matters').select('id, status, next_step').eq('user_id', uid),
    supabase.from('safety_deadlines').select('id, due_at, completed_at').eq('user_id', uid),
    supabase.from('safety_vault_items').select('id').eq('user_id', uid).limit(1),
  ]);

  const profile = profileRes.data || {};
  const matters = (mattersRes.data as Array<{ id: string; status: string; next_step: string }>) || [];
  const deadlines = (deadlinesRes.data as Array<{ due_at: string; completed_at: string | null }>) || [];
  const vault = (vaultRes.data as Array<{ id: string }>) || [];

  const now = Date.now();
  const overdue = deadlines.filter(d => !d.completed_at && new Date(d.due_at).getTime() < now).length;
  const activeMatter = matters.find(m => m.status === 'active' || m.status === 'escalated');
  const resolved = matters.filter(m => m.status === 'resolved').length;

  const signals: HealthSignals = {
    has_jurisdiction: !!profile.preferred_jurisdiction,
    has_active_matter: matters.length > 0,
    has_vault_document: vault.length > 0,
    deadlines_tracked: deadlines.length,
    overdue_deadlines: overdue,
    resolved_matters: resolved,
    emergency_contact: !!profile.phone,
    plan_next_step_set: !!activeMatter?.next_step,
  };

  let score = 0;
  if (signals.has_jurisdiction) score += 15;
  if (signals.has_active_matter) score += 20;
  if (signals.has_vault_document) score += 15;
  if (signals.deadlines_tracked > 0) score += 20;
  if (signals.plan_next_step_set) score += 15;
  if (signals.emergency_contact) score += 10;
  if (signals.resolved_matters > 0) score += 5;
  score -= Math.min(20, signals.overdue_deadlines * 5);
  score = Math.max(0, Math.min(100, score));

  const missing: HealthRecommendation[] = [];
  if (!signals.has_jurisdiction) missing.push(RECOMMENDATIONS[0]);
  if (!signals.has_active_matter) missing.push(RECOMMENDATIONS[1]);
  if (!signals.has_vault_document) missing.push(RECOMMENDATIONS[2]);
  if (signals.deadlines_tracked === 0) missing.push(RECOMMENDATIONS[3]);
  if (!signals.plan_next_step_set && signals.has_active_matter) missing.push(RECOMMENDATIONS[4]);
  if (signals.overdue_deadlines > 0) missing.unshift(RECOMMENDATIONS[5]);

  await supabase.from('legal_health_snapshots').insert({
    user_id: uid,
    score,
    signals,
    recommendations: missing.slice(0, 3),
  });

  return { score, signals, recommendations: missing.slice(0, 3) };
}
