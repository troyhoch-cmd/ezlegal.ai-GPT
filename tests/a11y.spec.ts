import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = (process.env.A11Y_ROUTES || '/,/espanol,/chat,/privacy,/terms')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

test.describe('accessibility launch gate', () => {
  for (const route of routes) {
    test(`no serious or critical WCAG violations: ${route}`, async ({ page }) => {
      await page.goto(route);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      const seriousOrCritical = results.violations.filter((violation) =>
        ['serious', 'critical'].includes(violation.impact || '')
      );

      expect(
        seriousOrCritical,
        seriousOrCritical
          .map((v) => `${v.id}: ${v.help} — ${v.nodes.length} node(s)`)
          .join('\n')
      ).toEqual([]);
    });
  }
});
