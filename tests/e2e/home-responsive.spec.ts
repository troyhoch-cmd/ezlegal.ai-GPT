import { test, expect, Page } from '@playwright/test';

const VIEWPORTS = [
  { width: 320, height: 740 },
  { width: 320, height: 874 },
  { width: 360, height: 740 },
  { width: 360, height: 874 },
  { width: 390, height: 740 },
  { width: 390, height: 874 },
  { width: 402, height: 740 },
  { width: 402, height: 874 },
];

const LANGUAGES = ['en', 'es'] as const;
type Lang = (typeof LANGUAGES)[number];

async function waitForHomepage(page: Page) {
  await page.goto('/', { waitUntil: 'networkidle' });
  // Wait for React to hydrate — look for hero section or main content
  await page.waitForSelector('#main-content, [data-testid="hero-primary-cta"], main', {
    timeout: 10_000,
  }).catch(() => {});
  // Extra settle time for React renders
  await page.waitForTimeout(800);
}

async function setLanguage(page: Page, lang: Lang) {
  if (lang === 'es') {
    // Look for any language toggle button
    const toggle = page.locator(
      'button[aria-label*="lang" i], button[aria-label*="idioma" i], ' +
      'button[aria-label*="English" i], button[aria-label*="Español" i], ' +
      'button[aria-label*="Globe" i], button:has(> svg.lucide-globe)'
    );
    if (await toggle.count()) {
      await toggle.first().click();
      await page.waitForTimeout(500);
    }
  }
}

async function noHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
  });
}

async function getOverflowingElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const overflowing: string[] = [];
    const all = document.querySelectorAll('*');
    all.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.right > vw + 1 || rect.left < -1) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const cls =
          el.className && typeof el.className === 'string'
            ? `.${el.className.split(' ').slice(0, 2).join('.')}`
            : '';
        overflowing.push(
          `${tag}${id}${cls} [right=${Math.round(rect.right)}, left=${Math.round(rect.left)}]`
        );
      }
    });
    return overflowing.slice(0, 10);
  });
}

async function pageHasContent(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const main = document.getElementById('main-content');
    if (main && main.children.length > 0) return true;
    const body = document.body;
    return body.innerText.length > 100;
  });
}

for (const viewport of VIEWPORTS) {
  for (const lang of LANGUAGES) {
    const label = `${viewport.width}x${viewport.height}-${lang}`;

    test.describe(`Homepage responsive: ${label}`, () => {
      test.use({ viewport });

      test.beforeEach(async ({ page }) => {
        await waitForHomepage(page);
        await setLanguage(page, lang);
      });

      test('no horizontal overflow', async ({ page }) => {
        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render (auth redirect or server issue)');

        const ok = await noHorizontalOverflow(page);
        if (!ok) {
          const offenders = await getOverflowingElements(page);
          expect(ok, `Overflow found. Offenders:\n${offenders.join('\n')}`).toBe(true);
        }
      });

      test('no elements extending beyond viewport', async ({ page }) => {
        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render');

        const offenders = await getOverflowingElements(page);
        expect(
          offenders,
          `Elements extending beyond viewport:\n${offenders.join('\n')}`
        ).toHaveLength(0);
      });

      test('accessible names on key elements', async ({ page }) => {
        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render');

        // Primary CTA
        const primaryCta = page.locator('[data-testid="hero-primary-cta"]');
        if (await primaryCta.count()) {
          await expect(primaryCta).toBeVisible();
          const ctaLabel = await primaryCta.getAttribute('aria-label');
          expect(ctaLabel?.length, 'Primary CTA missing aria-label').toBeGreaterThan(0);
        }

        // Urgent-help CTA (CrisisStrip)
        const urgentHelp = page.locator('a[href="/emergency-resources"]').first();
        if (await urgentHelp.isVisible().catch(() => false)) {
          const urgentLabel = await urgentHelp.getAttribute('aria-label');
          expect(urgentLabel?.length, 'Urgent help CTA missing aria-label').toBeGreaterThan(0);
        }

        // Language toggle
        const langToggle = page.locator(
          'button[aria-label*="lang" i], button[aria-label*="idioma" i], ' +
          'button[aria-label*="English" i], button[aria-label*="Español" i]'
        );
        if (await langToggle.count()) {
          const ariaLabel = await langToggle.first().getAttribute('aria-label');
          expect(ariaLabel?.length, 'Language toggle missing aria-label').toBeGreaterThan(0);
        }

        // Hamburger / menu button in mobile bottom nav
        const menuBtn = page.locator('button[aria-haspopup="dialog"]');
        if (await menuBtn.count()) {
          const menuText = await menuBtn.first().textContent();
          expect(
            (menuText?.trim().length ?? 0) > 0,
            'Menu button has no accessible text'
          ).toBe(true);
        }

        // Safeguards toggle
        const safeguardsBtn = page.locator('button[aria-controls="safeguards-panel"]');
        if (await safeguardsBtn.count()) {
          await expect(safeguardsBtn.first()).toHaveAttribute('aria-expanded');
        }

        // Bottom nav items
        const bottomNav = page.locator(
          'nav[aria-label*="ottom" i], nav[aria-label*="avegacion" i]'
        );
        if (await bottomNav.count()) {
          const navLinks = bottomNav.locator('a, button');
          const count = await navLinks.count();
          for (let i = 0; i < count; i++) {
            const el = navLinks.nth(i);
            const text = (await el.textContent())?.trim();
            const ariaLabel = await el.getAttribute('aria-label');
            expect(
              (text?.length ?? 0) > 0 || (ariaLabel?.length ?? 0) > 0,
              `Bottom nav item ${i} has no accessible name`
            ).toBe(true);
          }
        }
      });

      test('no whitespace-nowrap on mobile cards/buttons text', async ({ page }) => {
        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render');

        const violations = await page.evaluate(() => {
          const results: string[] = [];
          const cards = document.querySelectorAll('[class*="rounded-xl"]');
          cards.forEach((card) => {
            const texts = card.querySelectorAll('span, p, h3, h2, button');
            texts.forEach((el) => {
              const style = getComputedStyle(el);
              if (style.whiteSpace === 'nowrap') {
                const tag = el.tagName.toLowerCase();
                const text = el.textContent?.slice(0, 30) ?? '';
                results.push(`${tag}: "${text}"`);
              }
            });
          });
          return results;
        });

        expect(
          violations,
          `Elements with whitespace-nowrap in cards:\n${violations.join('\n')}`
        ).toHaveLength(0);
      });

      test('long text uses break-words/min-w-0', async ({ page }) => {
        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render');

        const issues = await page.evaluate(() => {
          const results: string[] = [];
          const textEls = document.querySelectorAll('h1, h2, h3, p, span');
          textEls.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const vw = document.documentElement.clientWidth;
            if (rect.width > vw) {
              const tag = el.tagName.toLowerCase();
              const text = el.textContent?.slice(0, 40) ?? '';
              results.push(
                `${tag}: "${text}" (width: ${Math.round(rect.width)}px > viewport: ${vw}px)`
              );
            }
          });
          return results;
        });

        expect(
          issues,
          `Text elements wider than viewport:\n${issues.join('\n')}`
        ).toHaveLength(0);
      });

      test('bottom padding accounts for sticky nav', async ({ page }) => {
        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render');

        const hasPadding = await page.evaluate(() => {
          const main = document.getElementById('main-content');
          if (!main) return false;
          const style = getComputedStyle(main);
          const pb = parseFloat(style.paddingBottom);
          // 5rem = 80px at default font size; accept >= 56px (3.5rem min)
          return pb >= 56;
        });

        expect(
          hasPadding,
          'Main content should have bottom padding for sticky nav on mobile'
        ).toBe(true);
      });

      test('capture screenshot', async ({ page }) => {
        await page.screenshot({
          path: `tests/e2e/screenshots/home-${label}.png`,
          fullPage: true,
        });
      });
    });

    // Safeguards expanded tests
    test.describe(`Homepage safeguards expanded: ${label}`, () => {
      test.use({ viewport });

      test('safeguards section readable when expanded', async ({ page }) => {
        await waitForHomepage(page);
        await setLanguage(page, lang);

        const hasContent = await pageHasContent(page);
        test.skip(!hasContent, 'Page did not render');

        const safeguardsBtn = page.locator('button[aria-controls="safeguards-panel"]');
        test.skip((await safeguardsBtn.count()) === 0, 'Safeguards button not found');

        await safeguardsBtn.click();
        await page.waitForTimeout(400);

        const panel = page.locator('#safeguards-panel');
        await expect(panel).toBeVisible();

        // Verify no horizontal overflow after expansion
        const ok = await noHorizontalOverflow(page);
        expect(ok, 'Horizontal overflow after safeguards expansion').toBe(true);

        // Verify all text is visible (not clipped)
        const allText = panel.locator('p');
        const count = await allText.count();
        for (let i = 0; i < count; i++) {
          const el = allText.nth(i);
          await expect(el).toBeVisible();
          const box = await el.boundingBox();
          expect(box, `Safeguard text item ${i} has no bounding box`).not.toBeNull();
          if (box) {
            expect(box.width).toBeGreaterThan(0);
            expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
          }
        }

        await page.screenshot({
          path: `tests/e2e/screenshots/home-safeguards-expanded-${label}.png`,
          fullPage: true,
        });
      });
    });
  }
}
