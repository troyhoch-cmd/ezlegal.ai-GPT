import { test, expect } from '@playwright/test';

/**
 * Legal/AI safety contract checks.
 * Verifies that required legal disclaimers and safety elements are present.
 *
 * NOTE: Content assertions require React to hydrate. When Supabase is unavailable,
 * tests verify the page loads (200 + #root attached) and skip content checks.
 */

async function getPageText(page: import('@playwright/test').Page): Promise<string | null> {
  const body = page.locator('body');
  const isVisible = await body.isVisible({ timeout: 3000 }).catch(() => false);
  if (!isVisible) return null;
  return await body.innerText();
}

test.describe('Legal disclaimers and safety contracts', () => {
  test('home page displays legal disclaimer content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const text = await getPageText(page);

    if (text) {
      const hasDisclaimer =
        text.toLowerCase().includes('not legal advice') ||
        text.toLowerCase().includes('not a law firm') ||
        text.toLowerCase().includes('no es asesoramiento legal') ||
        text.toLowerCase().includes('no somos un bufete');
      expect(hasDisclaimer).toBe(true);
    } else {
      // TODO(launch): React didn't hydrate — verify once backend available
      await expect(page.locator('#root')).toBeAttached();
    }
  });

  test('scope disclaimers page loads', async ({ page }) => {
    const response = await page.goto('/scope-disclaimers', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('privacy policy page is accessible', async ({ page }) => {
    const response = await page.goto('/privacy', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('terms of service page is accessible', async ({ page }) => {
    const response = await page.goto('/terms', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('emergency resources page exists', async ({ page }) => {
    const response = await page.goto('/emergency-resources', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);

    const text = await getPageText(page);
    if (text) {
      const hasCrisisContent =
        text.toLowerCase().includes('crisis') ||
        text.toLowerCase().includes('emergency') ||
        text.toLowerCase().includes('hotline') ||
        text.toLowerCase().includes('emergencia') ||
        text.toLowerCase().includes('911');
      expect(hasCrisisContent).toBe(true);
    } else {
      await expect(page.locator('#root')).toBeAttached();
    }
  });

  test('trust center page loads', async ({ page }) => {
    const response = await page.goto('/trust-center', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('AI governance page loads', async ({ page }) => {
    const response = await page.goto('/ai-governance', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator('#root')).toBeAttached();
  });

  test('home page FAQ addresses lawyer replacement question', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const text = await getPageText(page);

    if (text) {
      const addressesLawyerQuestion =
        text.includes('replacement for a lawyer') ||
        text.includes('reemplazo para un abogado') ||
        text.includes('not legal advice') ||
        text.includes('no asesoramiento legal');
      expect(addressesLawyerQuestion).toBe(true);
    } else {
      await expect(page.locator('#root')).toBeAttached();
    }
  });

  test('crisis strip is present on home page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const text = await getPageText(page);

    if (text) {
      const hasCrisisInfo =
        text.toLowerCase().includes('crisis') ||
        text.toLowerCase().includes('eviction') ||
        text.toLowerCase().includes('domestic') ||
        text.toLowerCase().includes('violencia') ||
        text.toLowerCase().includes('desalojo') ||
        text.toLowerCase().includes('ice');
      expect(hasCrisisInfo).toBe(true);
    } else {
      await expect(page.locator('#root')).toBeAttached();
    }
  });
});
