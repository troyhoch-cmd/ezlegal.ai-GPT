import { useEffect, useState } from 'react';
import { X, FileText, Clock, Shield, Download, CheckCircle, BookOpen, Scale, AlertTriangle, Lock, Info, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface PreviewSection { h: string; b: string; }
interface SampleTemplate { name: string; format: string; }
interface SourceBasis { label: string; cite: string; }
interface GlossaryTerm { term: string; plain: string; }

interface PreviewRow {
  title: string;
  sections: PreviewSection[];
  sample_templates: SampleTemplate[];
  estimated_time_minutes: number;
  jurisdiction_coverage: string[];
  reviewer_name: string;
  reviewer_role: string;
  last_reviewed_at: string | null;
  jurisdiction_scope_note: Record<string, string>;
  source_basis: SourceBasis[];
  personalization_note: string;
  privacy_note: string;
  not_for: string[];
  glossary: GlossaryTerm[];
  settlement_warning: string;
}

interface Props {
  packId: string;
  packName: string;
  onClose: () => void;
  onPurchase: () => void;
}

type TabId = 'overview' | 'templates' | 'scope' | 'glossary' | 'trust';

const SELECT_COLS = 'title, sections, sample_templates, estimated_time_minutes, jurisdiction_coverage, reviewer_name, reviewer_role, last_reviewed_at, jurisdiction_scope_note, source_basis, personalization_note, privacy_note, not_for, glossary, settlement_warning';

export default function IssuePackPreviewModal({ packId, packName, onClose, onPurchase }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [preview, setPreview] = useState<PreviewRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>('overview');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const locale = language === 'es' ? 'es' : 'en';
      const { data } = await supabase
        .from('issue_pack_previews')
        .select(SELECT_COLS)
        .eq('pack_id', packId)
        .eq('locale', locale)
        .maybeSingle();
      if (cancelled) return;
      if (!data && locale !== 'en') {
        const { data: fb } = await supabase
          .from('issue_pack_previews')
          .select(SELECT_COLS)
          .eq('pack_id', packId)
          .eq('locale', 'en')
          .maybeSingle();
        if (!cancelled) setPreview(fb as PreviewRow | null);
      } else {
        setPreview(data as PreviewRow | null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [packId, language]);

  const reviewedDate = preview?.last_reviewed_at
    ? new Date(preview.last_reviewed_at).toLocaleDateString(en ? 'en-US' : 'es-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  const scopeNote = preview?.jurisdiction_scope_note?.[en ? 'en' : 'es'] || preview?.jurisdiction_scope_note?.en || '';

  const tabs: { id: TabId; en: string; es: string; icon: typeof FileText }[] = [
    { id: 'overview', en: 'Overview', es: 'Resumen', icon: FileText },
    { id: 'templates', en: 'Templates', es: 'Plantillas', icon: Download },
    { id: 'scope', en: 'Scope & Fit', es: 'Alcance', icon: Scale },
    { id: 'glossary', en: 'Plain-language', es: 'Lenguaje claro', icon: BookOpen },
    { id: 'trust', en: 'Trust & Privacy', es: 'Confianza', icon: Shield },
  ];

  return (
    <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {en ? 'Sample Action Plan' : 'Plan de Accion de Muestra'}
              </h2>
              <p className="text-sm text-teal-100">{packName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={en ? 'Close preview' : 'Cerrar vista previa'}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {!loading && preview && (
          <div className="border-b border-navy-100 bg-navy-50 px-2 overflow-x-auto">
            <div className="flex gap-1 min-w-max" role="tablist">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
                      active ? 'bg-white text-teal-700 border-b-2 border-teal-600' : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {en ? t.en : t.es}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="py-12 text-center text-navy-500 text-sm">
              {en ? 'Loading sample...' : 'Cargando muestra...'}
            </div>
          )}

          {!loading && !preview && (
            <div className="py-12 text-center text-navy-500 text-sm">
              {en ? 'Preview not yet available for this pack.' : 'Vista previa aun no disponible.'}
            </div>
          )}

          {!loading && preview && tab === 'overview' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <div className="bg-navy-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-navy-500 mb-1">
                    <Clock className="w-3 h-3" />{en ? 'Typical time' : 'Tiempo tipico'}
                  </div>
                  <div className="font-bold text-navy-900 text-sm">
                    {preview.estimated_time_minutes} {en ? 'min' : 'min'}
                  </div>
                </div>
                <div className="bg-navy-50 rounded-lg p-3">
                  <div className="flex items-center gap-1 text-xs text-navy-500 mb-1">
                    <Shield className="w-3 h-3" />{en ? 'Jurisdictions' : 'Jurisdicciones'}
                  </div>
                  <div className="font-bold text-navy-900 text-sm truncate">
                    {(preview.jurisdiction_coverage || []).slice(0, 3).join(', ')}
                    {(preview.jurisdiction_coverage || []).length > 3 && '+'}
                  </div>
                </div>
                <div className="bg-navy-50 rounded-lg p-3 col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-1 text-xs text-navy-500 mb-1">
                    <CheckCircle className="w-3 h-3" />{en ? 'Reviewed' : 'Revisado'}
                  </div>
                  <div className="font-bold text-navy-900 text-xs truncate">
                    {preview.reviewer_name || (en ? 'Licensed attorney' : 'Abogado licenciado')}
                  </div>
                  {reviewedDate && <div className="text-[10px] text-navy-500">{reviewedDate}</div>}
                </div>
              </div>

              <h3 className="font-bold text-navy-900 mb-3">
                {en ? 'What the plan looks like' : 'Como se ve el plan'}
              </h3>
              <ol className="space-y-3 mb-4">
                {(preview.sections || []).map((section, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-navy-900 text-sm">{section.h}</div>
                      <div className="text-sm text-navy-600 mt-0.5">{section.b}</div>
                    </div>
                  </li>
                ))}
              </ol>

              {preview.settlement_warning && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{preview.settlement_warning}</p>
                </div>
              )}
            </>
          )}

          {!loading && preview && tab === 'templates' && (
            <>
              <h3 className="font-bold text-navy-900 mb-3">
                {en ? 'Included templates' : 'Plantillas incluidas'}
              </h3>
              <div className="grid sm:grid-cols-2 gap-2 mb-5">
                {(preview.sample_templates || []).map((tpl, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-navy-50 border border-navy-100 rounded-lg p-3">
                    <Download className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-navy-900 text-sm truncate">{tpl.name}</div>
                      <div className="text-xs text-navy-500">{tpl.format}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-teal-800">
                  {preview.personalization_note ||
                    (en
                      ? 'Your final plan is generated from your answers. Templates are fixed; scripts adapt to your inputs.'
                      : 'Tu plan se genera con tus respuestas. Las plantillas son fijas; los guiones se adaptan.')}
                </p>
              </div>
            </>
          )}

          {!loading && preview && tab === 'scope' && (
            <>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-4 h-4 text-teal-700" />
                  <h3 className="font-bold text-teal-900 text-sm">
                    {en ? 'What "state-specific" means' : 'Que significa "especifico por estado"'}
                  </h3>
                </div>
                <p className="text-sm text-teal-800">{scopeNote}</p>
              </div>

              {preview.not_for && preview.not_for.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <h3 className="font-bold text-navy-900 text-sm">
                      {en ? 'This pack is not for' : 'Este paquete no es para'}
                    </h3>
                  </div>
                  <ul className="space-y-1.5">
                    {preview.not_for.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                        <span className="text-red-500 flex-shrink-0 mt-0.5">&bull;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                {en
                  ? 'Legal information only. This pack does not create an attorney-client relationship and does not tell you what to accept or file.'
                  : 'Solo informacion legal. Este paquete no crea una relacion abogado-cliente ni te dice que aceptar o presentar.'}
              </div>
            </>
          )}

          {!loading && preview && tab === 'glossary' && (
            <>
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                {en ? 'Plain-language terms' : 'Terminos en lenguaje claro'}
              </h3>
              {preview.glossary && preview.glossary.length > 0 ? (
                <dl className="space-y-3">
                  {preview.glossary.map((g, i) => (
                    <div key={i} className="border border-navy-100 rounded-lg p-3">
                      <dt className="font-bold text-navy-900 text-sm">{g.term}</dt>
                      <dd className="text-sm text-navy-600 mt-1">{g.plain}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-navy-500">
                  {en ? 'No specialized terms in this pack.' : 'No hay terminos especializados en este paquete.'}
                </p>
              )}
            </>
          )}

          {!loading && preview && tab === 'trust' && (
            <>
              <div className="mb-4 border border-navy-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-navy-900 text-sm">
                    {en ? 'Reviewer' : 'Revisor'}
                  </h3>
                </div>
                <div className="text-sm text-navy-800">{preview.reviewer_name}</div>
                <div className="text-xs text-navy-500 mt-0.5">{preview.reviewer_role}</div>
                {reviewedDate && (
                  <div className="text-xs text-navy-500 mt-1">
                    {en ? 'Last reviewed' : 'Ultima revision'}: {reviewedDate}
                  </div>
                )}
              </div>

              {preview.source_basis && preview.source_basis.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold text-navy-900 text-sm mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    {en ? 'Source basis' : 'Base de fuentes'}
                  </h3>
                  <ul className="space-y-2">
                    {preview.source_basis.map((s, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-semibold text-navy-900">{s.label}</span>
                        <span className="text-navy-600"> &mdash; {s.cite}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-navy-50 border border-navy-200 rounded-lg p-3 flex items-start gap-2">
                <Lock className="w-4 h-4 text-navy-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-navy-700">
                  {preview.privacy_note ||
                    (en
                      ? 'Your answers are saved to your account only. We do not use them to train AI.'
                      : 'Tus respuestas se guardan solo en tu cuenta. No entrenamos IA con ellas.')}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-navy-100 bg-navy-50 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white hover:bg-navy-100 text-navy-700 border border-navy-200 rounded-xl font-semibold text-sm"
          >
            {en ? 'Close' : 'Cerrar'}
          </button>
          <button
            onClick={onPurchase}
            className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm"
          >
            {en ? 'Continue to this pack' : 'Continuar con este paquete'}
          </button>
        </div>
      </div>
    </div>
  );
}
