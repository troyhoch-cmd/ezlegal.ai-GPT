import { test, expect } from '@playwright/test';

// Deliberately use the deployment's actual configuration: no backend module
// replacement, API fixtures, or authenticated session can hide startup errors.
for (const language of ['en', 'es']) {
  test(`public homepage starts without backend fixtures (${language})`, async ({ page, isMobile }) => {
    if (isMobile) await page.setViewportSize({ width: 320, height: 740 });
    const startupErrors: string[] = [];
    const placeholderRequests: string[] = [];
    page.on('pageerror', error => startupErrors.push(error.message));
    page.on('request', request => {
      if (new URL(request.url()).hostname === 'backend-unavailable.invalid') {
        placeholderRequests.push(request.url());
      }
    });
    await page.addInitScript(lang => localStorage.setItem('ezlegal-language', lang), language);
    await page.goto('/');
    await expect(page.locator('.clarity-hero')).toBeVisible();
    await expect(page.locator('h1')).toContainText(language === 'en' ? 'Life gets complicated.' : 'La vida se complica.');
    await expect(page.locator('.clarity-task')).toHaveCount(5);
    await expect(page.getByTestId('hero-primary-cta')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(startupErrors).toEqual([]);
    expect(placeholderRequests).toEqual([]);
  });
}
