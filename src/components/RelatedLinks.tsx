import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { ROUTE_META } from '../lib/route-meta';

interface RelatedLink {
  to_path: string;
  anchor_text: string;
}

interface Props {
  fromPath?: string;
  limit?: number;
  className?: string;
  heading?: string;
}

export default function RelatedLinks({ fromPath, limit = 3, className = '', heading }: Props) {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const [links, setLinks] = useState<RelatedLink[]>([]);
  const [loaded, setLoaded] = useState(false);
  const path = fromPath ?? pathname;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoaded(false);
      const { data } = await supabase
        .from('page_cross_links')
        .select('to_path, anchor_text, language, sort_order')
        .eq('from_path', path)
        .in('language', [language, 'en'])
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      const byPath = new Map<string, RelatedLink>();
      for (const row of data ?? []) {
        const existing = byPath.get(row.to_path);
        if (!existing || row.language === language) {
          byPath.set(row.to_path, { to_path: row.to_path, anchor_text: row.anchor_text });
        }
      }
      setLinks(Array.from(byPath.values()).slice(0, limit));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [path, language, limit]);

  if (!loaded || links.length === 0) return null;

  const headingText = heading ?? (language === 'es' ? 'Sigue explorando' : 'Keep exploring');

  return (
    <nav
      aria-label={headingText}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${className}`}
    >
      <div className="flex items-center gap-2 mb-5">
        <Compass className="w-5 h-5 text-teal-600" aria-hidden="true" />
        <h2 className="text-lg font-bold text-navy-900">{headingText}</h2>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
        {links.map((l) => {
          const meta = ROUTE_META[l.to_path];
          const parentLabel = meta?.parent ? ROUTE_META[meta.parent]?.label : null;
          const section = parentLabel ? (language === 'es' ? parentLabel.es : parentLabel.en) : null;
          return (
            <li key={l.to_path}>
              <Link
                to={l.to_path}
                className="group flex items-start justify-between gap-3 p-4 bg-white border border-navy-200 rounded-xl hover:border-teal-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all min-h-[44px]"
              >
                <span className="flex-1 min-w-0">
                  {section && (
                    <span className="block text-xs font-semibold uppercase tracking-wide text-navy-400 mb-1">
                      {section}
                    </span>
                  )}
                  <span className="block font-semibold text-navy-900 group-hover:text-teal-700 transition-colors">
                    {l.anchor_text}
                  </span>
                </span>
                <ArrowRight
                  className="w-4 h-4 text-navy-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
