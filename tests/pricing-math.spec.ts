import { describe, it, expect } from 'vitest';
import {
  toCents,
  formatUSD,
  annualizedMonthlyCents,
  annualSavingsCents,
  annualSavingsDollars,
  savingsLabel,
  isTwoMonthsFree,
} from '../src/lib/pricingMath';
import { pricingAudiences } from '../src/data/pricing';

describe('pricingMath', () => {
  describe('toCents', () => {
    it('converts whole dollars', () => {
      expect(toCents(9)).toBe(900);
      expect(toCents(19)).toBe(1900);
      expect(toCents(0)).toBe(0);
    });

    it('rounds correctly for floating-point inputs', () => {
      expect(toCents(9.99)).toBe(999);
      expect(toCents(19.995)).toBe(2000);
      expect(toCents(0.1 + 0.2)).toBe(30);
    });
  });

  describe('formatUSD', () => {
    it('formats whole numbers without decimals', () => {
      expect(formatUSD(19, 'en')).toBe('$19');
      expect(formatUSD(39, 'en')).toBe('$39');
      expect(formatUSD(100, 'en')).toBe('$100');
    });

    it('formats for Spanish locale', () => {
      const result = formatUSD(19, 'es');
      expect(result).toContain('19');
      expect(result).toContain('$');
    });

    it('never outputs more than 0 decimal places', () => {
      const result = formatUSD(19.88, 'en');
      expect(result).not.toContain('.');
    });
  });

  describe('annualizedMonthlyCents', () => {
    it('multiplies monthly price by 12 in cents', () => {
      expect(annualizedMonthlyCents(9)).toBe(10800);
      expect(annualizedMonthlyCents(19)).toBe(22800);
      expect(annualizedMonthlyCents(29)).toBe(34800);
      expect(annualizedMonthlyCents(79)).toBe(94800);
    });
  });

  describe('annualSavingsCents', () => {
    it('calculates savings for Everyday Plus ($9/mo, $89/yr)', () => {
      expect(annualSavingsCents(9, 89)).toBe(1900);
    });

    it('calculates savings for Family ($19/mo, $189/yr)', () => {
      expect(annualSavingsCents(19, 189)).toBe(3900);
    });

    it('calculates savings for Business Starter ($29/mo, $290/yr)', () => {
      expect(annualSavingsCents(29, 290)).toBe(5800);
    });

    it('calculates savings for Business Plus ($79/mo, $790/yr)', () => {
      expect(annualSavingsCents(79, 790)).toBe(15800);
    });

    it('returns 0 for null or zero prices', () => {
      expect(annualSavingsCents(null, 89)).toBe(0);
      expect(annualSavingsCents(9, null)).toBe(0);
      expect(annualSavingsCents(0, 89)).toBe(0);
      expect(annualSavingsCents(9, 0)).toBe(0);
    });

    it('returns 0 when annual is more expensive', () => {
      expect(annualSavingsCents(5, 100)).toBe(0);
    });
  });

  describe('annualSavingsDollars', () => {
    it('returns dollar amount with no floating-point artifacts', () => {
      expect(annualSavingsDollars(9, 89)).toBe(19);
      expect(annualSavingsDollars(19, 189)).toBe(39);
      expect(annualSavingsDollars(29, 290)).toBe(58);
      expect(annualSavingsDollars(79, 790)).toBe(158);
    });

    it('never has more than 2 decimal places', () => {
      const allPlans = pricingAudiences.flatMap((a) => a.plans);
      for (const plan of allPlans) {
        const savings = annualSavingsDollars(plan.monthlyPrice, plan.annualPrice);
        const decimals = savings.toString().split('.')[1];
        expect(decimals?.length ?? 0).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('savingsLabel', () => {
    const makePlan = (monthly: number | null, annual: number | null) =>
      ({ monthlyPrice: monthly, annualPrice: annual } as any);

    it('returns null for free plans', () => {
      expect(savingsLabel(makePlan(0, 0), 'en')).toBeNull();
    });

    it('returns null for null prices', () => {
      expect(savingsLabel(makePlan(null, null), 'en')).toBeNull();
    });

    it('returns English label with correct savings', () => {
      const label = savingsLabel(makePlan(9, 89), 'en');
      expect(label).toBe('Save vs monthly ($19 off/year)');
    });

    it('returns Spanish label with correct savings', () => {
      const label = savingsLabel(makePlan(9, 89), 'es');
      expect(label).toContain('Ahorra vs mensual');
      expect(label).toContain('19');
    });

    it('labels are truthful for all real plans', () => {
      const allPlans = pricingAudiences.flatMap((a) => a.plans);
      for (const plan of allPlans) {
        const label = savingsLabel(plan, 'en');
        if (label) {
          const dollarMatch = label.match(/\$(\d+)/);
          expect(dollarMatch).not.toBeNull();
          const claimedSavings = Number(dollarMatch![1]);
          const actualSavings = annualSavingsDollars(plan.monthlyPrice, plan.annualPrice);
          expect(claimedSavings).toBe(actualSavings);
        }
      }
    });
  });

  describe('isTwoMonthsFree', () => {
    it('returns true when annualPrice equals 10 months of monthly', () => {
      expect(isTwoMonthsFree(10, 100)).toBe(true);
      expect(isTwoMonthsFree(25, 250)).toBe(true);
    });

    it('returns false for Everyday Plus ($9/mo, $89/yr) — not exactly 2 months free', () => {
      expect(isTwoMonthsFree(9, 89)).toBe(false);
    });

    it('returns false for Family ($19/mo, $189/yr)', () => {
      expect(isTwoMonthsFree(19, 189)).toBe(false);
    });

    it('handles 1-cent tolerance', () => {
      // toCents(9.99)*10 = 9990, toCents(99.89) = 9989 -> diff=1 -> within tolerance
      expect(isTwoMonthsFree(9.99, 99.89)).toBe(true);
      expect(isTwoMonthsFree(9.99, 99.90)).toBe(true);
      // toCents(9.99)*10 = 9990, toCents(99.87) = 9987 -> diff=3 -> outside tolerance
      expect(isTwoMonthsFree(9.99, 99.87)).toBe(false);
    });

    it('returns false for null/zero prices', () => {
      expect(isTwoMonthsFree(null, 100)).toBe(false);
      expect(isTwoMonthsFree(10, null)).toBe(false);
      expect(isTwoMonthsFree(0, 0)).toBe(false);
    });

    it('badge claim is truthful for all real plans', () => {
      const allPlans = pricingAudiences.flatMap((a) => a.plans);
      for (const plan of allPlans) {
        if (isTwoMonthsFree(plan.monthlyPrice, plan.annualPrice)) {
          const tenMonths = toCents(plan.monthlyPrice!) * 10;
          const annual = toCents(plan.annualPrice!);
          expect(Math.abs(tenMonths - annual)).toBeLessThanOrEqual(1);
        }
      }
    });
  });
});
