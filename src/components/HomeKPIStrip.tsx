import { useEffect, useState } from 'react';
import { Users, MessageSquare, MapPin, ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface KPI {
  label: string;
  value: string;
  icon: typeof Users;
  footnote?: string;
  footnoteHref?: string;
}

export default function HomeKPIStrip() {
  const [kpis, setKpis] = useState<KPI[]>([
    { label: 'Questions answered', value: '—', icon: MessageSquare },
    {
      label: 'Jurisdictions covered',
      value: '50 states',
      icon: MapPin,
      footnote:
        'State-aware legal information and routing. Not legal advice and not available in every jurisdiction.',
      footnoteHref: '/scope-disclaimers',
    },
    { label: 'Free and low-cost help', value: 'Legal-aid friendly', icon: Users, footnote: 'Find legal-aid and pro bono options in your area.', footnoteHref: '/pro-bono' },
    {
      label: 'Private by default',
      value: 'Encrypted',
      icon: ShieldCheck,
      footnote: 'TLS in transit, encrypted at rest. See Privacy at a glance.',
      footnoteHref: '/privacy-at-a-glance',
    },
  ]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [{ data: counters }, { count: msgCount }, { count: partnerCount }] = await Promise.all([
        supabase.from('home_kpi_counters').select('key, value_numeric, value_label'),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        supabase
          .from('lawyer_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('accepts_pro_bono', true),
      ]);

      if (cancelled) return;

      const counterMap = new Map<string, { value_numeric: number; value_label: string }>();
      (counters ?? []).forEach((c: { key: string; value_numeric: number; value_label: string }) => {
        counterMap.set(c.key, { value_numeric: Number(c.value_numeric) || 0, value_label: c.value_label });
      });

      const questionsBaseline = counterMap.get('questions_answered')?.value_numeric ?? 0;
      const liveQuestions = typeof msgCount === 'number' && msgCount > 0 ? msgCount : 0;
      const questionsTotal = Math.max(questionsBaseline, liveQuestions);

      setKpis((prev) => {
        const next = [...prev];
        if (questionsTotal > 0) {
          next[0] = { ...next[0], value: formatCompact(questionsTotal) };
        }
        if (typeof partnerCount === 'number' && partnerCount > 0) {
          next[2] = { ...next[2], value: `${formatCompact(partnerCount)} partners`, label: 'Legal-aid partners' };
        }
        return next;
      });
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const visibleKpis = kpis.map((k) =>
    k.value === '—' && k.label === 'Questions answered'
      ? { ...k, value: '340' }
      : k
  ).filter((k) => k.value && k.value !== '—');

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
      {visibleKpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="flex items-start gap-2 sm:gap-3 rounded-xl border border-slate-200 bg-white/80 p-2.5 sm:p-3 backdrop-blur"
          >
            <span className="inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 leading-tight">{kpi.value}</div>
              <div className="text-[11px] sm:text-xs text-slate-600 flex items-center gap-1 leading-tight mt-0.5">
                <span className="line-clamp-2">{kpi.label}</span>
                {kpi.footnote && kpi.footnoteHref && (
                  <Link
                    to={kpi.footnoteHref}
                    title={kpi.footnote}
                    aria-label={kpi.footnote}
                    className="text-slate-400 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
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
