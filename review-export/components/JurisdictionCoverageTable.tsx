import { useEffect, useMemo, useState } from 'react';
import { MapPin, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface CoverageRow {
  state_code: string;
  state_name: string;
  coverage_level: 'full' | 'partial' | 'referral_only';
  templates_count: number;
  reviewed_on: string | null;
  reviewer_name: string;
  practice_areas: string[] | null;
  notes: string | null;
}

type FilterId = 'all' | 'full' | 'partial' | 'referral_only';

export default function JurisdictionCoverageTable() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [rows, setRows] = useState<CoverageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('jurisdiction_coverage')
        .select('state_code, state_name, coverage_level, templates_count, reviewed_on, reviewer_name, practice_areas, notes')
        .order('state_name');
      if (!cancelled) {
        setRows((data as CoverageRow[]) || []);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = useMemo(() => {
    const c = { full: 0, partial: 0, referral_only: 0 };
    rows.forEach(r => { c[r.coverage_level] += 1; });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter(r => r.coverage_level === filter);
  }, [rows, filter]);

  const filters: { id: FilterId; en: string; es: string; count: number }[] = [
    { id: 'all', en: 'All 50 states', es: 'Los 50 estados', count: rows.length },
    { id: 'full', en: 'Full coverage', es: 'Cobertura completa', count: counts.full },
    { id: 'partial', en: 'Partial', es: 'Parcial', count: counts.partial },
    { id: 'referral_only', en: 'Referral only', es: 'Solo referencia', count: counts.referral_only },
  ];

  const levelStyle = (lvl: CoverageRow['coverage_level']) => {
    if (lvl === 'full') return { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-800', pill: 'bg-teal-600 text-white', icon: CheckCircle };
    if (lvl === 'partial') return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', pill: 'bg-amber-600 text-white', icon: Circle };
    return { bg: 'bg-navy-50', border: 'border-navy-200', text: 'text-navy-700', pill: 'bg-navy-700 text-white', icon: ArrowRight };
  };

  const levelLabel = (lvl: CoverageRow['coverage_level']) => {
    if (en) return lvl === 'full' ? 'Full' : lvl === 'partial' ? 'Partial' : 'Referral';
    return lvl === 'full' ? 'Completa' : lvl === 'partial' ? 'Parcial' : 'Referencia';
  };

  return (
    <section id="coverage" className="py-16 bg-white border-t border-navy-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
            <MapPin className="w-4 h-4 text-teal-700" />
            <span className="text-sm font-semibold text-teal-900">
              {en ? 'Jurisdiction coverage' : 'Cobertura de jurisdicciones'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            {en ? 'What "50-state coverage" actually means' : 'Que significa realmente "cobertura de 50 estados"'}
          </h2>
          <p className="text-navy-600">
            {en
              ? 'Three tiers, plainly defined. Full states have attorney-reviewed templates. Partial states have state-specific references. Referral-only means we route you to verified aid.'
              : 'Tres niveles, claramente definidos. Los estados completos tienen plantillas revisadas por abogados. Los parciales tienen referencias especificas. Solo referencia significa que te dirigimos a ayuda verificada.'}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-navy-500">
            {en ? 'Loading coverage...' : 'Cargando cobertura...'}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    filter === f.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-navy-700 border-navy-200 hover:bg-navy-50'
                  }`}
                >
                  {en ? f.en : f.es} <span className="opacity-75">({f.count})</span>
                </button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((row) => {
                const s = levelStyle(row.coverage_level);
                const Icon = s.icon;
                return (
                  <div key={row.state_code} className={`${s.bg} ${s.border} border rounded-xl p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-navy-900 text-sm">{row.state_name}</div>
                        <div className="text-xs text-navy-500">{row.state_code}</div>
                      </div>
                      <span className={`${s.pill} inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                        <Icon className="w-3 h-3" />
                        {levelLabel(row.coverage_level)}
                      </span>
                    </div>
                    {row.coverage_level === 'full' && (
                      <div className={`text-xs ${s.text} space-y-0.5`}>
                        <div>{row.templates_count} {en ? 'templates' : 'plantillas'}</div>
                        {row.reviewer_name && (
                          <div className="truncate">{en ? 'Reviewed by' : 'Revisado por'} {row.reviewer_name}</div>
                        )}
                      </div>
                    )}
                    {row.coverage_level !== 'full' && row.notes && (
                      <p className={`text-xs ${s.text} leading-snug`}>{row.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
