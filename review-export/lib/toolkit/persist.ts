import { supabase } from '../supabase';

async function currentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function savePdfJob(input: {
  title: string;
  template: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from('toolkit_pdf_jobs').insert({
    user_id: userId,
    title: input.title,
    template: input.template,
    status: 'completed',
    output_url: '',
    meta: input.meta ?? {},
  });
}

export async function saveQrCode(input: {
  label: string;
  payload: string;
  size: number;
  ecc: string;
  data_url: string;
}): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from('toolkit_qr_codes').insert({ user_id: userId, ...input });
}

export async function saveOcrJob(input: {
  file_name: string;
  language: string;
  text: string;
  confidence: number;
}): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from('toolkit_ocr_jobs').insert({
    user_id: userId,
    status: 'completed',
    ...input,
  });
}

export async function saveCsvImport(input: {
  file_name: string;
  row_count: number;
  error_count: number;
  sample: unknown[];
}): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;
  await supabase.from('toolkit_csv_imports').insert({
    user_id: userId,
    status: input.error_count > 0 ? 'partial' : 'completed',
    ...input,
  });
}

export interface ToolkitHistory {
  pdfs: Array<{ id: string; title: string; template: string; created_at: string }>;
  qrs: Array<{ id: string; label: string; payload: string; data_url: string; created_at: string }>;
  ocrs: Array<{ id: string; file_name: string; language: string; confidence: number; created_at: string }>;
  csvs: Array<{ id: string; file_name: string; row_count: number; error_count: number; created_at: string }>;
}

export async function loadHistory(): Promise<ToolkitHistory> {
  const userId = await currentUserId();
  if (!userId) return { pdfs: [], qrs: [], ocrs: [], csvs: [] };
  const [pdfs, qrs, ocrs, csvs] = await Promise.all([
    supabase.from('toolkit_pdf_jobs').select('id,title,template,created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('toolkit_qr_codes').select('id,label,payload,data_url,created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('toolkit_ocr_jobs').select('id,file_name,language,confidence,created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('toolkit_csv_imports').select('id,file_name,row_count,error_count,created_at').order('created_at', { ascending: false }).limit(20),
  ]);
  return {
    pdfs: pdfs.data ?? [],
    qrs: qrs.data ?? [],
    ocrs: ocrs.data ?? [],
    csvs: csvs.data ?? [],
  };
}
