import { useEffect, useState } from 'react';
import { Users, Clock, Globe, ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface KPI {
  label: { en: string; es: string };
  value: { en: string; es: string };
  icon: typeof Users;
  footnote?: string;
  footnoteHref?: string;
}

const DEFAULT_KPIS: KPI[] = [
  {
    label: { en: 'Available', es: 'Disponible' },
    value: { en: '24/7', es: '24/7' },
    icon: Clock,
  },
  {
    label: { en: 'Languages', es: 'Idiomas' },
    value: { en: 'English & Spanish', es: 'Inglés y español' },
    icon: Globe,
  },
  {
    label: { en: 'Find free help', es: 'Encuentra ayuda' },
    value: { en: 'Legal-aid links', es: 'Enlaces a ayuda legal' },
    icon: Users,
    footnote: 'Find legal-aid and pro bono options in your area.',
    footnoteHref: '/pro-bono',
  },
  {
    label: { en: 'Privacy controls', es: 'Controles de privacidad' },
    value: { en: 'Private by default', es: 'Privado por defecto' },
    icon: ShieldCheck,
    footnote: 'TLS in transit, encrypted at rest. See Privacy at a glance.',
    footnoteHref: '/privacy-at-a-glance',
  },
];

export default function HomeKPIStrip() {
  const { language } = useLanguage();
  const [kpis, setKpis] = useState<KPI[]>(DEFAULT_KPIS);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { count: partnerCount } = await supabase
        .from('lawyer_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('accepts_pro_bono', true);

      if (cancelled) return;

      if (typeof partnerCount === 'number' && partnerCount > 0) {
        setKpis((prev) => {
          const next = [...prev];
          next[2] = {
            ...next[2],
            value: { en: `${formatCompact(partnerCount)} partners`, es: `${formatCompact(partnerCount)} socios` },
            label: { en: 'Legal-aid partners', es: 'Socios de ayuda legal' },
          };
          return next;
        });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const lang = language === 'es' ? 'es' : 'en';

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 xs:grid-cols-2 gap-3 px-0 sm:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label.en}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3 backdrop-blur min-w-0"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 leading-tight">{kpi.value[lang]}</div>
              <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <span className="leading-tight">{kpi.label[lang]}</span>
                {kpi.footnote && kpi.footnoteHref && (
                  <Link
                    to={kpi.footnoteHref}
                    title={kpi.footnote}
                    aria-label={kpi.footnote}
                    className="text-slate-400 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded flex-shrink-0"
                  >
                    <Info className="h-3 w-3" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k+`;
  return `${n}`;
}
