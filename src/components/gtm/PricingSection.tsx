import { CheckCircle } from 'lucide-react';
import { PRICING_TIERS } from '../../lib/gtm-content';
import CTAButton from './CTAButton';

export default function PricingSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PRICING_TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`rounded-2xl p-6 border-2 transition-all ${
            tier.highlighted
              ? 'border-teal-600 bg-white shadow-xl relative'
              : 'border-navy-200 bg-white'
          }`}
        >
          {tier.highlighted && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Most Popular
            </span>
          )}
          <h3 className="text-xl font-bold text-navy-900 mb-2">{tier.name}</h3>
          <p className="text-sm text-navy-600 mb-6">{tier.audience}</p>
          <ul className="space-y-3 mb-8">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-navy-700">
                <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <CTAButton
            text={tier.cta}
            to={tier.name === 'Pilot' ? '/resources/legal-readiness-checklist' : '/schedule-demo'}
            variant={tier.highlighted ? 'primary' : 'outline'}
            size="md"
            trackEvent="pricing_cta_click"
            className="w-full justify-center"
          />
        </div>
      ))}
    </div>
  );
}
