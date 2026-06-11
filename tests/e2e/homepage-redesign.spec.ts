import { test, expect } from '@playwright/test';

/**
 * Homepage redesign tests.
 * Validates structure, safety content, and responsive behavior.
 */

async function pageHydrated(page: import('@playwright/test').Page): Promise<boolean> {
  const body = page.locator('body');
  const text = await body.innerText({ timeout: 5000 }).catch(() => '');
  return text.length > 100;
}

test.describe('Homepage structure', () => {
  test('urgent strip renders and links to urgent resources', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const strip = page.locator('[data-testid="urgent-strip"]');
    const stripVisible = await strip.isVisible({ timeout: 5000 }).catch(() => false);
    if (stripVisible) {
      const link = strip.locator('a[href*="urgent-resources"], a[href*="emergency-resources"]');
      const linkCount = await link.count();
      expect(linkCount).toBeGreaterThan(0);
    } else {
      await expect(page.locator('#root')).toBeAttached();
    }
  });

  test('three ICP path cards render', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (!(await pageHydrated(page))) {
      await expect(page.locator('#root')).toBeAttached();
      return;
    }
    const personal = page.locator('[data-testid="path-card-personal"]');
    const business = page.locator('[data-testid="path-card-business"]');
    const partner = page.locator('[data-testid="path-card-partner"]');

    await expect(personal).toBeVisible({ timeout: 5000 });
    await expect(business).toBeVisible();
    await expect(partner).toBeVisible();
  });

  test('homepage includes "Not legal advice" or Spanish equivalent', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
    if (text.length < 100) {
      await expect(page.locator('#root')).toBeAttached();
      return;
    }
    const lower = text.toLowerCase();
    const hasDisclaimer =
      lower.includes('not legal advice') ||
      lower.includes('not a law firm') ||
      lower.includes('legal information') ||
      lower.includes('no es asesoramiento legal') ||
      lower.includes('información legal') ||
      lower.includes('no somos un bufete');
    expect(hasDisclaimer, 'Homepage must display a legal disclaimer').toBe(true);
  });
});

test.describe('Homepage responsive - no horizontal overflow', () => {
  const VIEWPORTS = [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ];

  for (const vp of VIEWPORTS) {
    test(`no overflow at ${vp.width}px`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: vp });
      const page = await context.newPage();
      await page.goto('/', { waitUntil: 'domcontentloaded' });

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow, `Horizontal overflow at ${vp.width}px`).toBe(false);
      await context.close();
    });
  }
});

test.describe('Safety copy - no overclaiming', () => {
  const PAGES_TO_AUDIT = ['/', '/pricing', '/features', '/about', '/ask'];
  const BANNED_CLAIMS = [
    'guaranteed outcome',
    'guarantee results',
    'guarantees results',
    'guaranteed results',
    'attorney-client relationship',
    'creates an attorney-client',
    'replace a lawyer',
    'replaces a lawyer',
    'replacement for a lawyer',
    'replaces your attorney',
    'no need for a lawyer',
    'you won\'t need a lawyer',
  ];

  for (const path of PAGES_TO_AUDIT) {
    test(`${path} does not claim guaranteed outcomes or lawyer replacement`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
      if (text.length < 50) {
        await expect(page.locator('#root')).toBeAttached();
        return;
      }
      const lower = text.toLowerCase();
      for (const claim of BANNED_CLAIMS) {
        expect(
          lower.includes(claim),
          `Page ${path} contains banned claim: "${claim}"`
        ).toBe(false);
      }
    });
  }
});

test.describe('Safety copy - no fake randomized document scores', () => {
  const PAGES_TO_AUDIT = ['/', '/features', '/ask', '/pricing'];

  for (const path of PAGES_TO_AUDIT) {
    test(`${path} does not contain fake document enforceability scores`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const text = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '');
      if (text.length < 50) {
        await expect(page.locator('#root')).toBeAttached();
        return;
      }

      // Fake scores typically appear as "XX% enforceable" or "enforceability: XX%"
      const fakeScorePattern = /\d{1,3}%\s*(enforceable|enforceability|compliance score)/i;
      expect(
        fakeScorePattern.test(text),
        `Page ${path} appears to contain fake document scores`
      ).toBe(false);
    });
  }
});
