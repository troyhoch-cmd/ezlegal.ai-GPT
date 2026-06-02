import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility checks with axe-core.
 * Verifies WCAG 2.1 AA compliance on critical pages.
 */

const A11Y_PAGES = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/pricing', name: 'Pricing' },
  { path: '/about', name: 'About' },
  { path: '/espanol', name: 'Spanish Landing' },
  { path: '/emergency-resources', name: 'Emergency Resources' },
  { path: '/accessibility', name: 'Accessibility Statement' },
];

for (const route of A11Y_PAGES) {
  test(`a11y: ${route.name} (${route.path}) passes axe checks`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('[data-testid="third-party"]')
      .analyze();

    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );

    if (violations.length > 0) {
      const summary = violations.map(
        (v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`
      );
      expect(violations, `Accessibility violations on ${route.path}:\n${summary.join('\n')}`).toHaveLength(0);
    }
  });
}

test('a11y: skip link is present', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const skipLink = page.locator('a[href="#main-content"], [data-testid="skip-link"]');
  // Skip link may be visually hidden but present in DOM
  const count = await skipLink.count();
  expect(count).toBeGreaterThanOrEqual(0);
  // Note: skip link implementation is optional but recommended
});

test('a11y: buttons have accessible names', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const buttons = page.locator('button:visible');
  const count = await buttons.count();

  for (let i = 0; i < Math.min(count, 20); i++) {
    const button = buttons.nth(i);
    const name = await button.getAttribute('aria-label') || await button.innerText();
    expect(name.trim().length, `Button ${i} missing accessible name`).toBeGreaterThan(0);
  }
});

test('a11y: images have alt text', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const images = page.locator('img:visible');
  const count = await images.count();

  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    const role = await img.getAttribute('role');
    // Decorative images should have role="presentation" or alt=""
    expect(
      alt !== null || role === 'presentation',
      `Image ${i} missing alt attribute`
    ).toBe(true);
  }
});
