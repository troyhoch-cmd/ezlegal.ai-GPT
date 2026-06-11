import { supabase } from '../lib/supabase';

export type FloatingSurfaceId =
  | 'pwa_install'
  | 'reading_toolbar'
  | 'demo_banner'
  | 'resume_banner';

const LOCAL_PREFIX = 'ezlegal_dismiss_';

function localKey(surface: FloatingSurfaceId) {
  return `${LOCAL_PREFIX}${surface}`;
}

export async function isDismissed(
  surface: FloatingSurfaceId,
  userId: string | null
): Promise<boolean> {
  try {
    if (localStorage.getItem(localKey(surface))) return true;
  } catch {}

  if (!userId) return false;

  const { data } = await supabase
    .from('ui_dismissals')
    .select('surface_id')
    .eq('user_id', userId)
    .eq('surface_id', surface)
    .maybeSingle();

  return Boolean(data);
}

export async function dismiss(
  surface: FloatingSurfaceId,
  userId: string | null
): Promise<void> {
  try {
    localStorage.setItem(localKey(surface), new Date().toISOString());
  } catch {}

  if (!userId) return;

  await supabase
    .from('ui_dismissals')
    .upsert(
      { user_id: userId, surface_id: surface, dismissed_at: new Date().toISOString() },
      { onConflict: 'user_id,surface_id' }
    );
}

export async function markHeroVariantSeen(userId: string | null) {
  if (!userId) return;
  await supabase
    .from('profiles')
    .update({ hero_variant_seen: true })
    .eq('id', userId);
}

export async function getDefaultLandingRoute(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('default_landing_route, user_type')
    .eq('id', userId)
    .maybeSingle();

  if (!data) return null;
  if (data.default_landing_route) return data.default_landing_route;

  const inferred = inferLandingFromUserType(data.user_type);
  if (inferred) {
    await supabase
      .from('profiles')
      .update({ default_landing_route: inferred })
      .eq('id', userId);
  }
  return inferred;
}

function inferLandingFromUserType(userType: string | null): string | null {
  switch (userType) {
    case 'business':
      return '/dashboard';
    case 'organization':
      return '/lso-dashboard';
    case 'individual':
      return '/chat';
    default:
      return null;
  }
}

export async function logDeprecationHit(oldPath: string): Promise<void> {
  try {
    await supabase.rpc('increment_route_deprecation_hit', { p_old_path: oldPath });
  } catch {
    /* best-effort */
  }
}
