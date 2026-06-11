import { supabase } from '../lib/supabase';

export interface Entitlement {
  id: string;
  user_id: string;
  product_type: 'issue_pack' | 'subscription' | 'case_prediction' | 'negotiation_pack';
  product_id: string;
  status: 'active' | 'pending' | 'expired' | 'refunded' | 'payment_failed';
  payment_provider: 'stripe' | 'manual' | 'trial' | 'free';
  payment_reference: string | null;
  granted_at: string;
  expires_at: string | null;
}

export async function getUserEntitlements(userId: string): Promise<Entitlement[]> {
  const { data, error } = await supabase
    .from('user_entitlements')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'pending', 'expired', 'payment_failed', 'refunded'])
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

export async function hasActiveEntitlement(
  userId: string,
  productType: string,
  productId?: string
): Promise<boolean> {
  let query = supabase
    .from('user_entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .eq('status', 'active');

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data } = await query.limit(1).maybeSingle();
  return !!data;
}

export function getEntitlementStatusLabel(status: Entitlement['status'], lang: 'en' | 'es' = 'en'): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'active':
      return { label: lang === 'en' ? 'Active' : 'Activo', color: 'text-green-700 bg-green-50 border-green-200' };
    case 'pending':
      return { label: lang === 'en' ? 'Processing' : 'Procesando', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'expired':
      return { label: lang === 'en' ? 'Expired' : 'Expirado', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    case 'refunded':
      return { label: lang === 'en' ? 'Refunded' : 'Reembolsado', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    case 'payment_failed':
      return { label: lang === 'en' ? 'Payment Failed' : 'Pago Fallido', color: 'text-red-700 bg-red-50 border-red-200' };
  }
}
