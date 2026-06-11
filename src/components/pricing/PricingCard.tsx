import { useState } from 'react';
import { CheckCircle, ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PricingPlan } from '../../data/pricing';
import { trackEngagement } from '../../services/engagement-service';

interface Props {
  plan: PricingPlan;
  language: 'en' | 'es';
}

const MAX_VISIBLE_FEATURES = 4;

export default function PricingCard({ plan, language }: Props) {
  const l = language === 'es' ? 'es' : 'en';
  const [expanded, setExpanded] = useState(false);
  const features = plan.features[l];
  const hasMore = features.length > MAX_VISIBLE_FEATURES;
  const visibleFeatures = expanded ? features : features.slice(0, MAX_VISIBLE_FEATURES);

  const handleCTAClick = () => {
    trackEngagement({
      featureName: 'pricing_plan_cta_clicked',
      engagementType: 'click',
      metadata: { planId: plan.id, audience: plan.audience },
    });
  };

  const badgeText = plan.badge?.[l] || (plan.recommended ? (l === 'es' ? 'Recomendado' : 'Recommended') : null);

  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-5 sm:p-6 transition-shadow hover:shadow-lg ${
        plan.recommended
          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
          : plan.badge
          ? 'border-teal-300 shadow-sm'
          : 'border-slate-200 shadow-sm'
      } bg-white`}
    >
      {badgeText && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white bg-teal-600 rounded-full shadow-sm whitespace-nowrap">
          {badgeText}
        </span>
      )}

      <header className="mb-3">
        <h3 className="text-base font-bold text-navy-900">{plan.name[l]}</h3>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold text-navy-900">{plan.price[l]}</span>
          {plan.priceNote && (
            <span className="text-xs text-navy-500">{plan.priceNote[l]}</span>
          )}
          {!plan.isFinalPrice && (
            <span className="ml-1 text-[10px] text-amber-600 font-medium">
              {l === 'es' ? 'precio piloto' : 'pilot pricing'}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm text-navy-600 leading-snug">{plan.description[l]}</p>
      </header>

      <ul className="flex-1 space-y-2 mb-4" role="list">
        {visibleFeatures.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-navy-700">
            <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      {hasMore && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 font-medium mb-4 transition-colors"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          {l === 'es' ? 'Ver todas las funciones' : 'See all features'}
        </button>
      )}

      <footer className="mt-auto space-y-1.5">
        <Link
          to={plan.ctaHref}
          onClick={handleCTAClick}
          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            plan.recommended
              ? 'bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 shadow-sm'
              : plan.id === 'free'
              ? 'bg-navy-900 hover:bg-navy-800 text-white focus:ring-navy-500'
              : 'bg-white hover:bg-slate-50 text-navy-900 border border-navy-300 focus:ring-teal-500'
          }`}
        >
          {plan.ctaLabel[l]}
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
        {plan.ethicalNote && (
          <p className="text-center text-[11px] text-navy-400">{plan.ethicalNote[l]}</p>
        )}
      </footer>
    </article>
  );
}
