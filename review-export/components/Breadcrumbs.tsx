import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { resolveBreadcrumbs } from '../lib/route-meta';

interface BreadcrumbsProps {
  className?: string;
  pathname?: string;
}

export default function Breadcrumbs({ className = '', pathname }: BreadcrumbsProps) {
  const location = useLocation();
  const { language } = useLanguage();
  const path = pathname ?? location.pathname;

  if (path === '/') return null;

  const crumbs = resolveBreadcrumbs(path).filter((c) => c.path !== '/');
  if (crumbs.length === 0) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const homeLabel = language === 'es' ? 'Inicio' : 'Home';

  const itemListElement = [
    { '@type': 'ListItem', position: 1, name: homeLabel, item: `${origin}/` },
    ...crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: language === 'es' ? c.label.es : c.label.en,
      item: `${origin}${c.path}`,
    })),
  ];
  const jsonLd = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement };

  return (
    <nav
      aria-label={language === 'es' ? 'Migas de pan' : 'Breadcrumb'}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 ${className}`}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex items-center flex-wrap gap-1 text-sm text-navy-500" role="list">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-teal-600 transition-colors">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{homeLabel}</span>
          </Link>
        </li>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          const text = language === 'es' ? c.label.es : c.label.en;
          return (
            <li key={c.path} className="inline-flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-navy-300" aria-hidden="true" />
              {isLast ? (
                <span aria-current="page" className="font-semibold text-navy-800">
                  {text}
                </span>
              ) : (
                <Link to={c.path} className="hover:text-teal-600 transition-colors">
                  {text}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
