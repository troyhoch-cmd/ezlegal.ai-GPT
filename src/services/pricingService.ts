import { supabase } from '../lib/supabase';
import { pricingAudiences, type PricingPlan, type PricingAudience } from '../data/pricing';

export interface PricingTier {
  id: string;
  name: string;
  audience: 'personal' | 'smb' | 'organization';
  headline: string;
  description: string;
  badge: string | null;
  launchBadge: string | null;
  priceMonthly: number;
  priceAnnual: number;
  oneTimePrice: number | null;
  ctaLabel: string;
  ctaRoute: string;
  isHighlighted: boolean;
  isActive: boolean;
  displayOrder: number;
  limits: Record<string, unknown>;
  features: Record<string, unknown>;
  included: string[];
}

export const CANONICAL_TIER_IDS = [
  'justice_free',
  'everyday_plus',
  'family_household',
  'single_document_boost',
  'business_free',
  'business_starter',
  'business_growth',
  'business_team',
  'legal_aid_free',
  'clinic_starter',
  'organization_pro',
  'coalition_statewide',
] as const;

export const DEPRECATED_PLAN_IDS = ['free', 'essentials', 'pro', 'smb', 'legal_aid'] as const;

const AUDIENCE_MAP: Record<string, PricingAudience['id']> = {
  personal: 'individuals',
  smb: 'business',
  organization: 'legal-aid',
};

function dbTierToFrontend(tier: PricingTier): PricingPlan {
  const priceLabel = tier.oneTimePrice
    ? `$${tier.oneTimePrice}`
    : tier.priceMonthly === 0
      ? '$0'
      : `$${tier.priceMonthly}/mo`;

  const annualLabel = tier.priceAnnual > 0 ? `$${tier.priceAnnual}/year` : undefined;
  const frontendAudience = AUDIENCE_MAP[tier.audience] || 'individuals';

  return {
    id: tier.id,
    name: { en: tier.name, es: tier.name },
    audience: frontendAudience,
    monthlyPrice: tier.oneTimePrice ? null : tier.priceMonthly,
    annualPrice: tier.priceAnnual > 0 ? tier.priceAnnual : null,
    priceDisplay: { en: priceLabel, es: priceLabel },
    annualPriceDisplay: annualLabel ? { en: annualLabel, es: annualLabel } : undefined,
    priceNote: tier.oneTimePrice
      ? { en: 'one-time', es: 'unico pago' }
      : tier.priceMonthly === 0
        ? { en: 'forever', es: 'siempre' }
        : undefined,
    description: { en: tier.description, es: tier.description },
    features: {
      en: Array.isArray(tier.included) ? tier.included : [],
      es: Array.isArray(tier.included) ? tier.included : [],
    },
    ctaLabel: { en: tier.ctaLabel, es: tier.ctaLabel },
    ctaHref: tier.ctaRoute,
    recommended: tier.isHighlighted,
    badge: tier.badge ? { en: tier.badge, es: tier.badge } : undefined,
    ethicalNote: tier.priceMonthly === 0
      ? { en: 'No credit card required', es: 'Sin tarjeta de credito' }
      : { en: 'Cancel anytime', es: 'Cancela cuando quieras' },
    isFinalPrice: tier.priceMonthly === 0 && !tier.oneTimePrice,
    isFoundingPrice: tier.priceMonthly > 0 && !tier.oneTimePrice,
    isAddOn: !!tier.oneTimePrice,
  };
}

function groupTiersIntoAudiences(tiers: PricingTier[]): PricingAudience[] {
  const groups: Record<string, PricingPlan[]> = {
    individuals: [],
    business: [],
    'legal-aid': [],
  };

  for (const tier of tiers) {
    const frontendAudience = AUDIENCE_MAP[tier.audience] || 'individuals';
    groups[frontendAudience].push(dbTierToFrontend(tier));
  }

  const audiences: PricingAudience[] = [];

  if (groups.individuals.length > 0) {
    audiences.push({
      id: 'individuals',
      label: { en: 'Individuals', es: 'Personas' },
      headline: { en: 'Legal clarity for you and your family', es: 'Claridad legal para ti y tu familia' },
      plans: groups.individuals,
    });
  }

  if (groups.business.length > 0) {
    audiences.push({
      id: 'business',
      label: { en: 'Business', es: 'Negocios' },
      headline: { en: 'Legal clarity for your business', es: 'Claridad legal para tu negocio' },
      subline: {
        en: 'Spend less time sorting legal questions before they become expensive.',
        es: 'Dedica menos tiempo a resolver preguntas legales antes de que se vuelvan costosas.',
      },
      plans: groups.business,
    });
  }

  if (groups['legal-aid'].length > 0) {
    audiences.push({
      id: 'legal-aid',
      label: { en: 'Legal Aid', es: 'Ayuda Legal' },
      headline: { en: 'Expand access to justice', es: 'Ampliar el acceso a la justicia' },
      subline: {
        en: 'People seeking legal-aid help are not monetized. Sponsored and coalition models help expand access.',
        es: 'Las personas que buscan ayuda legal no son monetizadas. Los modelos patrocinados y de coalicion ayudan a ampliar el acceso.',
      },
      plans: groups['legal-aid'],
    });
  }

  return audiences;
}

export interface PricingResult {
  audiences: PricingAudience[];
  source: 'database' | 'static_fallback';
}

export async function fetchPricingTiers(): Promise<PricingResult> {
  try {
    const { data, error } = await supabase
      .from('ezlegal_pricing_tiers')
      .select('id, name, audience, headline, description, badge, launch_badge, price_monthly, price_annual, one_time_price, cta_label, cta_route, is_highlighted, is_active, display_order, limits, features, included')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return { audiences: pricingAudiences, source: 'static_fallback' };
    }

    const tiers: PricingTier[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      audience: row.audience,
      headline: row.headline || '',
      description: row.description || '',
      badge: row.badge || null,
      launchBadge: row.launch_badge || null,
      priceMonthly: Number(row.price_monthly) || 0,
      priceAnnual: Number(row.price_annual) || 0,
      oneTimePrice: row.one_time_price ? Number(row.one_time_price) : null,
      ctaLabel: row.cta_label || 'Get Started',
      ctaRoute: row.cta_route || '/signup',
      isHighlighted: row.is_highlighted || false,
      isActive: row.is_active,
      displayOrder: row.display_order || 0,
      limits: row.limits || {},
      features: row.features || {},
      included: Array.isArray(row.included) ? row.included : [],
    }));

    const audiences = groupTiersIntoAudiences(tiers);
    return { audiences, source: 'database' };
  } catch {
    return { audiences: pricingAudiences, source: 'static_fallback' };
  }
}
