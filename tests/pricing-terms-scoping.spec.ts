import { describe, it, expect } from 'vitest';
import { pricingAudiences } from '../src/data/pricing';
import type { PricingPlan } from '../src/data/pricing';

function allPlans(): PricingPlan[] {
  return pricingAudiences.flatMap((a) => a.plans);
}

function plansByModel(model: string): PricingPlan[] {
  return allPlans().filter((p) => p.commerceModel === model);
}

describe('Commerce model: terms microcopy scoping', () => {
  describe('partner_custom plans NEVER show cancel language', () => {
    const plans = plansByModel('partner_custom');

    it('has at least one partner_custom plan', () => {
      expect(plans.length).toBeGreaterThan(0);
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no cancel in termsMicrocopy', (_id, plan) => {
      expect(plan.termsMicrocopy?.cancel).toBeUndefined();
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no "Cancel anytime" in ethicalNote', (_id, plan) => {
      if (plan.ethicalNote) {
        expect(plan.ethicalNote.en).not.toContain('Cancel');
        expect(plan.ethicalNote.es).not.toContain('Cancela');
      }
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no "Cancel anytime" in features', (_id, plan) => {
      expect(plan.features.en.join(' ')).not.toContain('Cancel anytime');
      expect(plan.features.es.join(' ')).not.toContain('Cancela cuando quieras');
    });

    it.each(plans.map((p) => [p.id, p]))('%s has partnership-appropriate terms', (_id, plan) => {
      expect(plan.termsMicrocopy?.data).toBeDefined();
      expect(plan.termsMicrocopy!.data!.en).toMatch(/partnership agreement|Terms set by/i);
    });
  });

  describe('grant_or_free_access plans show no-credit-card terms', () => {
    const plans = plansByModel('grant_or_free_access');

    it('has at least one grant_or_free_access plan', () => {
      expect(plans.length).toBeGreaterThan(0);
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no cancel in termsMicrocopy', (_id, plan) => {
      expect(plan.termsMicrocopy?.cancel).toBeUndefined();
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no-credit-card data line', (_id, plan) => {
      expect(plan.termsMicrocopy?.data).toBeDefined();
      expect(plan.termsMicrocopy!.data!.en).toContain('No credit card');
    });
  });

  describe('free plans show no-credit-card terms', () => {
    const plans = plansByModel('free');

    it('has at least one free plan', () => {
      expect(plans.length).toBeGreaterThan(0);
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no cancel in termsMicrocopy', (_id, plan) => {
      expect(plan.termsMicrocopy?.cancel).toBeUndefined();
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no-credit-card data line', (_id, plan) => {
      expect(plan.termsMicrocopy?.data).toBeDefined();
      expect(plan.termsMicrocopy!.data!.en).toContain('No credit card');
    });
  });

  describe('self_serve_subscription plans may show cancel', () => {
    const plans = plansByModel('self_serve_subscription');

    it('has at least one self_serve_subscription plan', () => {
      expect(plans.length).toBeGreaterThan(0);
    });

    it.each(plans.map((p) => [p.id, p]))('%s has cancel in termsMicrocopy', (_id, plan) => {
      expect(plan.termsMicrocopy?.cancel).toBeDefined();
      expect(plan.termsMicrocopy!.cancel!.en).toContain('Cancel');
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no "Cancel" in ethicalNote', (_id, plan) => {
      if (plan.ethicalNote) {
        expect(plan.ethicalNote.en).not.toContain('Cancel');
      }
    });
  });

  describe('one_time_addon plans show data line only', () => {
    const plans = plansByModel('one_time_addon');

    it('has at least one one_time_addon plan', () => {
      expect(plans.length).toBeGreaterThan(0);
    });

    it.each(plans.map((p) => [p.id, p]))('%s has no cancel in termsMicrocopy', (_id, plan) => {
      expect(plan.termsMicrocopy?.cancel).toBeUndefined();
    });

    it.each(plans.map((p) => [p.id, p]))('%s has data line', (_id, plan) => {
      expect(plan.termsMicrocopy?.data).toBeDefined();
    });
  });

  describe('No plan anywhere has "Cancel anytime" in ethicalNote', () => {
    const plans = allPlans();

    it.each(plans.map((p) => [p.id, p]))('%s ethicalNote does not say Cancel', (_id, plan) => {
      if (plan.ethicalNote) {
        expect(plan.ethicalNote.en).not.toContain('Cancel anytime');
      }
    });
  });

  describe('Legal Aid tab specific checks', () => {
    const legalAid = pricingAudiences.find((a) => a.id === 'legal-aid')!;

    it('legal-aid audience exists', () => {
      expect(legalAid).toBeDefined();
    });

    it('no legal-aid plan shows "Cancel anytime" anywhere', () => {
      for (const plan of legalAid.plans) {
        const allText = [
          plan.ethicalNote?.en || '',
          plan.termsMicrocopy?.cancel?.en || '',
          ...plan.features.en,
        ].join(' ');
        expect(allText).not.toContain('Cancel anytime');
      }
    });

    it('coalition has partnership terms', () => {
      const coalition = legalAid.plans.find((p) => p.id === 'coalition')!;
      expect(coalition.termsMicrocopy?.data?.en).toContain('partnership agreement');
    });

    it('enterprise-gov has partnership terms', () => {
      const eg = legalAid.plans.find((p) => p.id === 'enterprise-gov')!;
      expect(eg.termsMicrocopy?.data?.en).toContain('partnership agreement');
    });

    it('verified-legal-aid shows no-credit-card and eligibility', () => {
      const vla = legalAid.plans.find((p) => p.id === 'verified-legal-aid')!;
      expect(vla.termsMicrocopy?.data?.en).toContain('No credit card');
      expect(vla.termsMicrocopy?.data?.en).toContain('eligibility');
    });
  });
});
