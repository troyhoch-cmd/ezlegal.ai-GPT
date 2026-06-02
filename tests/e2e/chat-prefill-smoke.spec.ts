import { test, expect } from '@playwright/test';

const RAW_PREFILL =
  '<b>I was fired in California after asking about unpaid overtime. What should I do?</b>';

const SANITIZED_PREFILL =
  'I was fired in California after asking about unpaid overtime. What should I do?';

test.describe('Chat prefill + fallback smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/functions/v1/openai-chat**', (route) => {
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'forced smoke-test failure' }),
      });
    });
  });

  test('consumes prefill once, sanitizes HTML, focuses input, does not auto-submit', async ({ page }) => {
    await page.addInitScript((prefill) => {
      window.sessionStorage.setItem('ez_chatbot_prefill', prefill);
    }, RAW_PREFILL);

    await page.goto('/chat');

    // Accept privacy gate if present
    const privacyBtn = page.getByTestId('privacy-accept');
    if (await privacyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await privacyBtn.click();
    }

    // Input should contain sanitized text (HTML stripped)
    const input = page.locator('textarea').first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await expect(input).toHaveValue(SANITIZED_PREFILL);

    // SessionStorage should be cleared
    const remaining = await page.evaluate(() =>
      window.sessionStorage.getItem('ez_chatbot_prefill')
    );
    expect(remaining).toBeNull();

    // No network call should have been made (no auto-submit)
    // We check by waiting briefly and verifying no request was intercepted
    await page.waitForTimeout(1500);
    // The route mock would have returned 503 if called, but we verify no assistant message appeared
    const assistantMessages = page.locator('[data-testid="assistant-message"]');
    await expect(assistantMessages).toHaveCount(0);
  });

  test('shows fallback response after manual send when API is down', async ({ page }) => {
    await page.goto('/chat');

    // Accept privacy gate if present
    const privacyBtn = page.getByTestId('privacy-accept');
    if (await privacyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await privacyBtn.click();
    }

    const input = page.locator('textarea').first();
    await expect(input).toBeVisible({ timeout: 5000 });

    await input.fill('Can my landlord raise rent mid-lease in Arizona?');

    // Find and click send button
    const sendBtn = page.locator('button[aria-label*="Send"], button:has(svg.lucide-arrow-up)').first();
    await sendBtn.click();

    // Should eventually show a response (either fallback or error message)
    const response = page.locator('[class*="assistant"], [data-testid="assistant-message"]').first();
    await expect(response).toBeVisible({ timeout: 15000 });
  });
});
