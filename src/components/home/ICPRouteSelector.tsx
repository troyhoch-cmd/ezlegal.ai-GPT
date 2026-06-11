import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Building2, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { icpRoutes } from '../../data/icpRoutes';
import { track } from '../../lib/gtm-analytics';
import { trackEvent } from '../../services/analytics-service';

const iconMap = { Heart, Building2, Users } as Record<string, typeof Heart>;

export function ICPRouteSelector() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-10 sm:py-12" aria-labelledby="paths-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 id="paths-heading" className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-6">
          {en ? 'Choose the path that fits.' : 'Elige el camino que te corresponde.'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          {icpRoutes.map((route) => {
            const Icon = iconMap[route.iconName] || Heart;
            return (
              <Link
                key={route.id}
                to={route.href}
                onClick={() => { track('home_cta_clicked', { cta: route.id }); trackEvent('home_cta_clicked', { cta: route.id }); }}
                className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-${route.accentColor}-300 transition-all focus:outline-none focus:ring-2 focus:ring-${route.accentColor}-500 focus:ring-offset-2`}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-${route.accentColor}-50 text-${route.accentColor}-700 group-hover:bg-${route.accentColor}-100 transition`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">
                    {en ? route.heading.en : route.heading.es}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {en ? route.description.en : route.description.es}
                </p>
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold text-${route.accentColor}-700 group-hover:text-${route.accentColor}-800`}>
                  {en ? route.cta.en : route.cta.es}
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
