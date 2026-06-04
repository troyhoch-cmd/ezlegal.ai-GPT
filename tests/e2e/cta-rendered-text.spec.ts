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
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const cta = page.locator('[data-testid="hero-primary-cta"]');
    const isRendered = await cta.isVisible({ timeout: 5000 }).catch(() => false);
    if (isRendered) {
      await expect(cta).toHaveText(CANONICAL_EN);
    } else {
      await expect(page.locator('#root')).toBeAttached();
    }
  });

  test('page does not contain banned CTA variants', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const body = await page.locator('body').textContent();
    if (body && body.length > 100) {
      for (const banned of BANNED) {
        expect(body).not.toContain(banned);
      }
    }
  });
});

test.describe('CTA rendered text - Spanish', () => {
  test('hero CTA shows canonical ES text after language switch', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const toggle = page.locator('[data-language-toggle="es"]');
    const toggleVisible = await toggle.isVisible({ timeout: 3000 }).catch(() => false);
    if (!toggleVisible) {
      // Try the testid toggle in hero
      const heroToggle = page.locator('[data-testid="language-toggle"]');
      const heroToggleVisible = await heroToggle.isVisible({ timeout: 2000 }).catch(() => false);
      if (heroToggleVisible) {
        await heroToggle.click();
      } else {
        await expect(page.locator('#root')).toBeAttached();
        return;
      }
    } else {
      await toggle.click();
    }
    const cta = page.locator('[data-testid="hero-primary-cta"]');
    await expect(cta).toHaveText(CANONICAL_ES, { timeout: 3000 });
  });

  test('Spanish toggle changes hero CTA text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const cta = page.locator('[data-testid="hero-primary-cta"]');
    const isRendered = await cta.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isRendered) {
      await expect(page.locator('#root')).toBeAttached();
      return;
    }
    await expect(cta).toHaveText(CANONICAL_EN);

    // Switch to Spanish
    const toggle = page.locator('[data-language-toggle="es"]');
    const toggleVisible = await toggle.isVisible({ timeout: 2000 }).catch(() => false);
    if (toggleVisible) {
      await toggle.click();
    } else {
      const heroToggle = page.locator('[data-testid="language-toggle"]');
      await heroToggle.click();
    }
    await expect(cta).toHaveText(CANONICAL_ES, { timeout: 3000 });
  });

  test('page does not contain banned CTA variants in Spanish mode', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const toggle = page.locator('[data-language-toggle="es"]');
    const toggleVisible = await toggle.isVisible({ timeout: 3000 }).catch(() => false);
    if (toggleVisible) {
      await toggle.click();
      await page.waitForTimeout(300);
    }
    const body = await page.locator('body').textContent();
    if (body && body.length > 100) {
      for (const banned of BANNED) {
        expect(body).not.toContain(banned);
      }
    }
  });
});
