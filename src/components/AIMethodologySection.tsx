import { useEffect, useState } from 'react';
import { BookOpen, FileSearch, Quote, AlertTriangle, UserCheck, ShieldCheck, Gauge, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface Citation { label: string; url?: string; cite?: string; }
interface MethodologyRow {
  slug: string;
  category: string;
  title: string;
  body: string;
  citations: Citation[] | null;
  display_order: number;
}

const ICONS: Record<string, typeof FileSearch> = {
  retrieval: FileSearch,
  citation: Quote,
  hallucination: AlertTriangle,
  escalation: UserCheck,
  review: ShieldCheck,
  high_risk: AlertTriangle,
  confidence: Gauge,
  limitations: XCircle,
};

export default function AIMethodologySection() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [rows, setRows] = useState<MethodologyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const locale = language === 'es' ? 'es' : 'en';
      const { data } = await supabase
        .from('ai_methodology_entries')
        .select('slug, category, title, body, citations, display_order')
        .eq('locale', locale)
        .order('display_order');
      if (!cancelled) {
        setRows((data as MethodologyRow[]) || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [language]);

  if (loading) {
    return (
      <div className="py-12 text-center text-navy-500">
        {en ? 'Loading methodology...' : 'Cargando metodologia...'}
      </div>
    );
  }

  if (!rows.length) return null;

  return (
    <section id="methodology" className="py-16 bg-navy-50 border-t border-navy-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-teal-700" />
            <span className="text-sm font-semibold text-teal-900">
              {en ? 'How our AI works' : 'Como funciona nuestra IA'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            {en ? 'Methodology, grounded in real sources' : 'Metodologia, basada en fuentes reales'}
          </h2>
          <p className="text-navy-600">
            {en
              ? 'Every substantive answer is retrieved, cited, and scoped. When confidence is low or stakes are high, we escalate. Here is the full picture.'
              : 'Cada respuesta sustantiva se recupera, se cita y se delimita. Cuando la confianza es baja o los riesgos son altos, escalamos.'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {rows.map((row) => {
            const Icon = ICONS[row.category] || BookOpen;
            return (
              <div key={row.slug} className="bg-white rounded-2xl p-6 border border-navy-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-teal-700" />
                  </div>
                  <h3 className="font-bold text-navy-900">{row.title}</h3>
                </div>
                <p className="text-navy-700 text-sm leading-relaxed mb-3">{row.body}</p>
                {row.citations && row.citations.length > 0 && (
                  <div className="pt-3 border-t border-navy-100">
                    <div className="text-xs font-semibold text-navy-500 mb-1.5">
                      {en ? 'Sources' : 'Fuentes'}
                    </div>
                    <ul className="space-y-1">
                      {row.citations.map((c, i) => (
                        <li key={i} className="text-xs text-navy-700">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">
                              {c.label}
                            </a>
                          ) : (
                            <span className="font-medium text-navy-900">{c.label}</span>
                          )}
                          {c.cite && <span className="text-navy-500"> &mdash; {c.cite}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
