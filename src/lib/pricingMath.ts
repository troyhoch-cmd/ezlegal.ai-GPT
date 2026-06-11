import type { PricingPlan } from '../data/pricing';

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatUSD(amount: number, locale: 'en' | 'es'): string {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function annualizedMonthlyCents(monthlyPrice: number): number {
  return toCents(monthlyPrice) * 12;
}

export function annualSavingsCents(monthlyPrice: number | null, annualPrice: number | null): number {
  if (!monthlyPrice || !annualPrice || monthlyPrice <= 0 || annualPrice <= 0) return 0;
  const fullYearlyCents = annualizedMonthlyCents(monthlyPrice);
  const annualCents = toCents(annualPrice);
  return Math.max(0, fullYearlyCents - annualCents);
}

export function annualSavingsDollars(monthlyPrice: number | null, annualPrice: number | null): number {
  return annualSavingsCents(monthlyPrice, annualPrice) / 100;
}

export function savingsLabel(plan: PricingPlan, locale: 'en' | 'es'): string | null {
  const savings = annualSavingsDollars(plan.monthlyPrice, plan.annualPrice);
  if (savings <= 0) return null;
  const formatted = formatUSD(savings, locale);
  return locale === 'es'
    ? `Ahorra vs mensual (${formatted} menos/año)`
    : `Save vs monthly (${formatted} off/year)`;
}

export function isTwoMonthsFree(monthlyPrice: number | null, annualPrice: number | null): boolean {
  if (!monthlyPrice || !annualPrice || monthlyPrice <= 0 || annualPrice <= 0) return false;
  const tenMonthsCents = toCents(monthlyPrice) * 10;
  const annualCents = toCents(annualPrice);
  return Math.abs(tenMonthsCents - annualCents) <= 1;
}
