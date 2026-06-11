import { useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

interface IssueCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  prompt_seed: string;
  audience: string;
}

interface Props {
  audience?: 'all' | 'individual' | 'business' | 'legal_aid';
  onSelect: (card: IssueCard) => void;
}

export default function GuidedIssueLauncher({ audience = 'all', onSelect }: Props) {
  const [cards, setCards] = useState<IssueCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from('issue_launcher_cards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (!cancelled) {
        setCards((data ?? []) as IssueCard[]);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(
    () =>
      audience === 'all'
        ? cards
        : cards.filter((c) => c.audience === 'all' || c.audience === audience),
    [cards, audience],
  );

  async function handleClick(card: IssueCard) {
    onSelect(card);
    await supabase.from('engagement_analytics').insert({
      event_name: 'issue_card_clicked',
      event_data: { slug: card.slug, title: card.title },
    }).then(() => {}, () => {});
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">What kind of legal issue are you facing?</h2>
        <p className="mt-1 text-sm text-slate-600">Choose a common issue, or ask in your own words below.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visible.map((c) => {
          const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[c.icon] ?? Icons.HelpCircle;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleClick(c)}
              className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-semibold text-slate-900">{c.title}</span>
              <span className="text-xs text-slate-600">{c.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
