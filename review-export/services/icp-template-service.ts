import { supabase } from '../lib/supabase';

export interface ICPCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface ICPTemplate {
  id: string;
  jurisdiction: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  source_url: string;
  source_agency: string;
  file_url: string;
  file_mime: string;
  template_body: string;
  fields: unknown[];
  qr_code_url: string;
  version: number;
  language: string;
  last_verified_at: string | null;
  updated_at: string;
}

export interface TemplateFilters {
  jurisdiction?: string;
  categoryId?: string;
  query?: string;
  language?: string;
  limit?: number;
}

export async function listCategories(): Promise<ICPCategory[]> {
  const { data, error } = await supabase
    .from('icp_document_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listTemplates(filters: TemplateFilters = {}): Promise<ICPTemplate[]> {
  let q = supabase
    .from('icp_document_templates')
    .select('*')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.jurisdiction) q = q.eq('jurisdiction', filters.jurisdiction);
  if (filters.categoryId) q = q.eq('category_id', filters.categoryId);
  if (filters.language) q = q.eq('language', filters.language);
  if (filters.query) q = q.ilike('title', `%${filters.query}%`);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ICPTemplate[];
}

export async function getTemplate(jurisdiction: string, slug: string): Promise<ICPTemplate | null> {
  const { data, error } = await supabase
    .from('icp_document_templates')
    .select('*')
    .eq('jurisdiction', jurisdiction)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as ICPTemplate | null) ?? null;
}
