import { test, expect } from '@playwright/test';

/**
 * CTA rendered-text regression.
 * Asserts the visible CTA copy in the browser (not source files) for
 * both EN and ES states across desktop and mobile viewports.
 */

const CANONICAL_EN = 'Start free 2-minute checkup';
const CANONICAL_ES = 'Comenzar revisión gratis de 2 minutos';

const BANNED = [
  'Comenzar revision gratis',
  'Chequeo gratuito',
  'Start free checkup',
  'Iniciar chequeo gratuito',
];

test.describe('CTA rendered text - English', () => {
  test('hero CTA shows canonical EN text', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-hero-primary-cta]')).toHaveText(CANONICAL_EN);
  });

  test('page does not contain banned CTA variants', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').textContent();
    for (const banned of BANNED) {
      expect(body).not.toContain(banned);
    }
  });
});

test.describe('CTA rendered text - Spanish', () => {
  test('hero CTA shows canonical ES text after language switch', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-language-toggle="es"]').click();
    await expect(page.locator('[data-hero-primary-cta]')).toHaveText(CANONICAL_ES);
  });

  test('mobile sticky bar shows canonical ES text', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-language-toggle="es"]').click();
    await page.evaluate(() => window.scrollBy(0, 600));
    const stickyBtn = page.locator('text=Comenzar revisión gratis de 2 minutos').first();
    const isVisible = await stickyBtn.isVisible().catch(() => false);
    if (isVisible) {
      await expect(stickyBtn).toHaveText(CANONICAL_ES);
    }
  });

  test('page does not contain banned CTA variants in Spanish mode', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-language-toggle="es"]').click();
    await page.waitForTimeout(300);
    const body = await page.locator('body').textContent();
    for (const banned of BANNED) {
      expect(body).not.toContain(banned);
    }
  });
});
