import { useRef, useState } from 'react';
import { Upload, FileText, Trash2, Sparkles, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { extractTextFromFile } from '../lib/document-extractor';
import {
  uploadVaultFile,
  deleteVaultFile,
  explainDocumentText,
  saveDocumentSummary,
  type PlanEntitlements,
  type VaultItem,
  type VaultKind,
} from '../services/safety-net-service';

interface Props {
  items: VaultItem[];
  entitlements: PlanEntitlements | null;
  onChange: () => void;
  onUpgrade?: () => void;
}

type Explanation = {
  summary: string;
  what_it_is: string;
  who_sent_it: string;
  what_they_want: string;
  deadlines: string[];
  risks: string[];
  suggested_next_steps: string[];
};

const KIND_OPTIONS: { id: VaultKind; en: string; es: string }[] = [
  { id: 'notice', en: 'Notice / letter', es: 'Aviso / carta' },
  { id: 'lease', en: 'Lease', es: 'Contrato de renta' },
  { id: 'contract', en: 'Contract', es: 'Contrato' },
  { id: 'court', en: 'Court filing', es: 'Documento judicial' },
  { id: 'correspondence', en: 'Correspondence', es: 'Correspondencia' },
  { id: 'policy', en: 'Policy', es: 'Poliza' },
  { id: 'identity', en: 'ID / identity', es: 'Identificacion' },
  { id: 'other', en: 'Other', es: 'Otro' },
];

export default function VaultUploader({ items, entitlements, onChange, onUpgrade }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<VaultKind>('notice');
  const [explaining, setExplaining] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<Record<string, Explanation>>({});

  const usedBytes = items.reduce((n, i) => n + (i.size_bytes || 0), 0);
  const limitBytes = (entitlements?.vault_mb_limit ?? 10) * 1024 * 1024;
  const usedPct = Math.min(100, Math.round((usedBytes / limitBytes) * 100));
  const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
  const limitMB = entitlements?.vault_mb_limit ?? 10;

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    const { item, error: err } = await uploadVaultFile(file, kind, null, file.name);
    setUploading(false);
    if (err === 'vault_limit_reached') {
      setError(en ? 'Vault is full. Upgrade for more space.' : 'Boveda llena. Mejora tu plan para mas espacio.');
      return;
    }
    if (err) {
      setError(err);
      return;
    }
    if (item) onChange();
  }

  async function handleExplain(item: VaultItem) {
    setExplaining(item.id);
    try {
      const { data: dl, error: dlErr } = await supabase.storage.from('legal-vault').download(item.storage_path);
      if (dlErr || !dl) {
        setError(en ? 'Could not download file.' : 'No se pudo descargar el archivo.');
        setExplaining(null);
        return;
      }
      const file = new File([dl], item.title, { type: item.mime_type || 'application/octet-stream' });
      const text = await extractTextFromFile(file);
      if (!text || text.trim().length < 20) {
        setError(en ? 'Could not extract enough text to analyze.' : 'No se pudo extraer suficiente texto.');
        setExplaining(null);
        return;
      }
      const result = await explainDocumentText(text, language === 'es' ? 'es' : 'en', item.kind);
      if (!result) {
        setError(en ? 'AI analysis unavailable. Try again.' : 'Analisis de IA no disponible.');
        setExplaining(null);
        return;
      }
      setExplanations((prev) => ({ ...prev, [item.id]: result }));
      await saveDocumentSummary(item.id, result.summary);
      onChange();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setExplaining(null);
    }
  }

  async function handleDelete(item: VaultItem) {
    if (!window.confirm(en ? 'Delete this document?' : 'Eliminar este documento?')) return;
    await deleteVaultFile(item);
    onChange();
  }

  const overLimit = usedPct >= 100;

  return (
    <div className="bg-white rounded-2xl p-5 border border-navy-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-navy-900">{en ? 'Document vault' : 'Boveda de documentos'}</h2>
        </div>
        <div className="text-xs text-navy-500">
          {usedMB} / {limitMB} MB
        </div>
      </div>

      <div className="w-full h-1.5 bg-navy-100 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full transition-all ${overLimit ? 'bg-rose-500' : usedPct > 80 ? 'bg-amber-500' : 'bg-teal-500'}`}
          style={{ width: `${usedPct}%` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as VaultKind)}
          className="px-3 py-2 border border-navy-200 rounded-lg text-sm"
        >
          {KIND_OPTIONS.map((k) => (
            <option key={k.id} value={k.id}>{en ? k.en : k.es}</option>
          ))}
        </select>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || overLimit}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-navy-200 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          <Upload className="w-4 h-4" />
          {uploading
            ? (en ? 'Uploading...' : 'Subiendo...')
            : overLimit
            ? (en ? 'Vault full' : 'Boveda llena')
            : (en ? 'Upload document' : 'Subir documento')}
        </button>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          {error.includes('full') && onUpgrade && (
            <button onClick={onUpgrade} className="font-bold text-teal-700 hover:underline">
              {en ? 'Upgrade' : 'Mejorar'}
            </button>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-6 text-navy-500 text-sm">
          <FileText className="w-8 h-8 text-navy-300 mx-auto mb-2" />
          {en
            ? 'Upload a notice, lease, or contract. We will explain it in plain language.'
            : 'Sube un aviso, contrato o carta. Lo explicamos en lenguaje sencillo.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => {
            const explanation = explanations[it.id];
            return (
              <li key={it.id} className="bg-navy-50 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-navy-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy-900 truncate">{it.title}</div>
                    <div className="text-[11px] text-navy-500 uppercase">{it.kind} &middot; {(it.size_bytes / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    onClick={() => handleExplain(it)}
                    disabled={explaining === it.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 px-2 py-1 rounded-md hover:bg-teal-50 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {explaining === it.id
                      ? (en ? 'Analyzing...' : 'Analizando...')
                      : explanation
                      ? (en ? 'Re-explain' : 'Re-explicar')
                      : (en ? 'Explain' : 'Explicar')}
                  </button>
                  <button
                    onClick={() => handleDelete(it)}
                    className="text-navy-400 hover:text-rose-600 p-1"
                    aria-label={en ? 'Delete' : 'Eliminar'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {it.summary && !explanation && (
                  <div className="mt-2 ml-8 text-xs text-navy-700 border-l-2 border-teal-300 pl-3">
                    {it.summary}
                  </div>
                )}
                {explanation && (
                  <div className="mt-3 ml-8 bg-white rounded-lg p-3 border border-navy-100 space-y-2 text-xs">
                    <ExplainRow label={en ? 'Summary' : 'Resumen'} value={explanation.summary} />
                    <ExplainRow label={en ? 'What it is' : 'Que es'} value={explanation.what_it_is} />
                    <ExplainRow label={en ? 'Who sent it' : 'Quien lo envio'} value={explanation.who_sent_it} />
                    <ExplainRow label={en ? 'What they want' : 'Que piden'} value={explanation.what_they_want} />
                    {explanation.deadlines?.length > 0 && (
                      <ExplainList label={en ? 'Deadlines' : 'Fechas limite'} items={explanation.deadlines} tone="amber" />
                    )}
                    {explanation.risks?.length > 0 && (
                      <ExplainList label={en ? 'Risks' : 'Riesgos'} items={explanation.risks} tone="rose" />
                    )}
                    {explanation.suggested_next_steps?.length > 0 && (
                      <ExplainList label={en ? 'Next steps' : 'Siguientes pasos'} items={explanation.suggested_next_steps} tone="teal" />
                    )}
                    <div className="flex items-start gap-1.5 pt-1 text-[10px] text-navy-500 border-t border-navy-100">
                      <CheckCircle2 className="w-3 h-3 text-teal-500 flex-shrink-0 mt-0.5" />
                      {en
                        ? 'AI-generated summary. Not legal advice. Verify details before acting.'
                        : 'Resumen generado por IA. No es asesoria legal. Verifica antes de actuar.'}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ExplainRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-navy-500 mb-0.5">{label}</div>
      <div className="text-navy-800">{value}</div>
    </div>
  );
}

function ExplainList({ label, items, tone }: { label: string; items: string[]; tone: 'amber' | 'rose' | 'teal' }) {
  const dot = { amber: 'bg-amber-500', rose: 'bg-rose-500', teal: 'bg-teal-500' }[tone];
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-navy-500 mb-1">{label}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-navy-800">
            <span className={`w-1.5 h-1.5 rounded-full ${dot} mt-1.5 flex-shrink-0`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
