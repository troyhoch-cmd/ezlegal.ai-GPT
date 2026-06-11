import { expect, test } from '@playwright/test';

const criticalRoutes = (process.env.CRITICAL_ROUTES || '/,/espanol,/chat,/privacy,/terms')
  .split(',')
  .map((route) => route.trim())
  .filter(Boolean);

test.describe('launch smoke tests', () => {
  for (const route of criticalRoutes) {
    test(`critical route loads: ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('pageerror', (error) => consoleErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });

      const response = await page.goto(route);

      expect(response, `No HTTP response for ${route}`).not.toBeNull();
      expect(response!.status(), `${route} returned non-launchable status`).toBeLessThan(400);
      await expect(page.locator('body')).toContainText(/\S/);
      await expect(page).not.toHaveTitle(/404|500|error/i);

      expect(consoleErrors, `Console/page errors on ${route}`).toEqual([]);
    });
  }

  test('home has one clear CTA, language control, and legal disclaimer', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('primary-cta')).toHaveCount(1);
    await expect(page.getByTestId('primary-cta')).toBeVisible();
    await expect(page.getByTestId('language-toggle')).toBeVisible();
    await expect(page.getByTestId('legal-disclaimer')).toBeVisible();
  });

  test('Spanish experience is actually Spanish-first', async ({ page }) => {
    const spanishRoute = process.env.SPANISH_ROUTE || '/espanol';

    const response = await page.goto(spanishRoute);
    expect(response!.status()).toBeLessThan(400);

    await expect(page.locator('html')).toHaveAttribute('lang', /es/i);
    await expect(page.getByTestId('primary-cta')).toBeVisible();

    await expect(page.getByTestId('legal-disclaimer')).toContainText(
      /no es asesoramiento legal|información legal|abogado|abogada/i
    );
  });

  test('intake blocks incomplete submissions before AI output', async ({ page }) => {
    await page.goto(process.env.INTAKE_ROUTE || '/chat');

    await expect(page.getByTestId('intake-form')).toBeVisible();

    await page.getByTestId('submit-intake').click();

    await expect(page.getByTestId('field-error')).toContainText(
      /jurisdiction|estado|ciudad|problema|issue|required|obligatorio/i
    );

    await expect(page.getByTestId('ai-answer')).toHaveCount(0);
  });
});
