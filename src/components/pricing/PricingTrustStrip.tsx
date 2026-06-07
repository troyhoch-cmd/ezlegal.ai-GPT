import { Link } from 'react-router-dom';
import { trustSafeguards } from '../../data/trustSafeguards';

interface Props {
  language: 'en' | 'es';
}

export default function PricingTrustStrip({ language }: Props) {
  const l = language === 'es' ? 'es' : 'en';

  return (
    <div className="w-full py-4 bg-slate-50 border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {trustSafeguards.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.proofHref}
                className="inline-flex items-center gap-1.5 text-xs text-navy-600 hover:text-teal-700 whitespace-nowrap transition-colors group"
                title={item.shortEvidence[l]}
              >
                <Icon className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                <span className="group-hover:underline">{item.claim[l]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
