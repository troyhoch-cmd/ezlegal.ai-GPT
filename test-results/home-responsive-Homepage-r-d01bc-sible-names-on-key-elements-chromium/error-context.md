# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home-responsive.spec.ts >> Homepage responsive: 390x874-es >> accessible names on key elements
- Location: tests/e2e/home-responsive.spec.ts:81:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="hero-primary-cta"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="hero-primary-cta"]')

```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const VIEWPORTS = [
  4   |   { width: 320, height: 740 },
  5   |   { width: 320, height: 874 },
  6   |   { width: 360, height: 740 },
  7   |   { width: 360, height: 874 },
  8   |   { width: 390, height: 740 },
  9   |   { width: 390, height: 874 },
  10  |   { width: 402, height: 740 },
  11  |   { width: 402, height: 874 },
  12  | ];
  13  | 
  14  | const LANGUAGES = ['en', 'es'] as const;
  15  | type Lang = (typeof LANGUAGES)[number];
  16  | 
  17  | async function setLanguage(page: Page, lang: Lang) {
  18  |   if (lang === 'es') {
  19  |     const toggle = page.getByRole('button', { name: /espa|language|idioma|globe/i });
  20  |     if (await toggle.count()) {
  21  |       await toggle.first().click();
  22  |       await page.waitForTimeout(300);
  23  |     }
  24  |   }
  25  | }
  26  | 
  27  | async function noHorizontalOverflow(page: Page): Promise<boolean> {
  28  |   return page.evaluate(() => {
  29  |     return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1;
  30  |   });
  31  | }
  32  | 
  33  | async function getOverflowingElements(page: Page): Promise<string[]> {
  34  |   return page.evaluate(() => {
  35  |     const vw = document.documentElement.clientWidth;
  36  |     const overflowing: string[] = [];
  37  |     const all = document.querySelectorAll('*');
  38  |     all.forEach((el) => {
  39  |       const rect = el.getBoundingClientRect();
  40  |       if (rect.right > vw + 1 || rect.left < -1) {
  41  |         const tag = el.tagName.toLowerCase();
  42  |         const id = el.id ? `#${el.id}` : '';
  43  |         const cls = el.className && typeof el.className === 'string'
  44  |           ? `.${el.className.split(' ').slice(0, 2).join('.')}`
  45  |           : '';
  46  |         overflowing.push(`${tag}${id}${cls} [right=${Math.round(rect.right)}, left=${Math.round(rect.left)}]`);
  47  |       }
  48  |     });
  49  |     return overflowing.slice(0, 10);
  50  |   });
  51  | }
  52  | 
  53  | for (const viewport of VIEWPORTS) {
  54  |   for (const lang of LANGUAGES) {
  55  |     const label = `${viewport.width}x${viewport.height}-${lang}`;
  56  | 
  57  |     test.describe(`Homepage responsive: ${label}`, () => {
  58  |       test.use({ viewport });
  59  | 
  60  |       test('no horizontal overflow', async ({ page }) => {
  61  |         await page.goto('/');
  62  |         await setLanguage(page, lang);
  63  |         await page.waitForTimeout(500);
  64  | 
  65  |         const ok = await noHorizontalOverflow(page);
  66  |         if (!ok) {
  67  |           const offenders = await getOverflowingElements(page);
  68  |           expect(ok, `Overflow found. Offenders:\n${offenders.join('\n')}`).toBe(true);
  69  |         }
  70  |       });
  71  | 
  72  |       test('no elements extending beyond viewport', async ({ page }) => {
  73  |         await page.goto('/');
  74  |         await setLanguage(page, lang);
  75  |         await page.waitForTimeout(500);
  76  | 
  77  |         const offenders = await getOverflowingElements(page);
  78  |         expect(offenders, `Elements extending beyond viewport:\n${offenders.join('\n')}`).toHaveLength(0);
  79  |       });
  80  | 
  81  |       test('accessible names on key elements', async ({ page }) => {
  82  |         await page.goto('/');
  83  |         await setLanguage(page, lang);
  84  |         await page.waitForTimeout(500);
  85  | 
  86  |         // Primary CTA
  87  |         const primaryCta = page.locator('[data-testid="hero-primary-cta"]');
> 88  |         await expect(primaryCta).toBeVisible();
      |                                  ^ Error: expect(locator).toBeVisible() failed
  89  |         const ctaLabel = await primaryCta.getAttribute('aria-label');
  90  |         expect(ctaLabel?.length).toBeGreaterThan(0);
  91  | 
  92  |         // Urgent-help CTA (CrisisStrip)
  93  |         const urgentHelp = page.locator('a[href="/emergency-resources"]').first();
  94  |         if (await urgentHelp.isVisible()) {
  95  |           const urgentLabel = await urgentHelp.getAttribute('aria-label');
  96  |           expect(urgentLabel?.length).toBeGreaterThan(0);
  97  |         }
  98  | 
  99  |         // Language toggle — look for globe button or language-related button
  100 |         const langToggle = page.locator('button[aria-label*="lang" i], button[aria-label*="idioma" i], button[aria-label*="English" i], button[aria-label*="Español" i]');
  101 |         if (await langToggle.count()) {
  102 |           const ariaLabel = await langToggle.first().getAttribute('aria-label');
  103 |           expect(ariaLabel?.length).toBeGreaterThan(0);
  104 |         }
  105 | 
  106 |         // Hamburger / menu button in mobile bottom nav
  107 |         const menuBtn = page.locator('button[aria-haspopup="dialog"]');
  108 |         if (await menuBtn.count()) {
  109 |           await expect(menuBtn.first()).toBeVisible();
  110 |         }
  111 | 
  112 |         // Safeguards toggle
  113 |         const safeguardsBtn = page.locator('button[aria-controls="safeguards-panel"]');
  114 |         if (await safeguardsBtn.count()) {
  115 |           await expect(safeguardsBtn.first()).toHaveAttribute('aria-expanded');
  116 |         }
  117 | 
  118 |         // Bottom nav items
  119 |         const bottomNav = page.locator('nav[aria-label*="ottom" i], nav[aria-label*="avegacion" i]');
  120 |         if (await bottomNav.count()) {
  121 |           const navLinks = bottomNav.locator('a, button');
  122 |           const count = await navLinks.count();
  123 |           for (let i = 0; i < count; i++) {
  124 |             const el = navLinks.nth(i);
  125 |             const text = (await el.textContent())?.trim();
  126 |             const ariaLabel = await el.getAttribute('aria-label');
  127 |             expect(
  128 |               (text?.length ?? 0) > 0 || (ariaLabel?.length ?? 0) > 0,
  129 |               `Bottom nav item ${i} has no accessible name`
  130 |             ).toBe(true);
  131 |           }
  132 |         }
  133 |       });
  134 | 
  135 |       test('no whitespace-nowrap on mobile cards/buttons text', async ({ page }) => {
  136 |         await page.goto('/');
  137 |         await setLanguage(page, lang);
  138 |         await page.waitForTimeout(500);
  139 | 
  140 |         const violations = await page.evaluate(() => {
  141 |           const results: string[] = [];
  142 |           const cards = document.querySelectorAll('[class*="rounded-xl"]');
  143 |           cards.forEach((card) => {
  144 |             const texts = card.querySelectorAll('span, p, h3, h2, button');
  145 |             texts.forEach((el) => {
  146 |               const style = getComputedStyle(el);
  147 |               if (style.whiteSpace === 'nowrap') {
  148 |                 const tag = el.tagName.toLowerCase();
  149 |                 const text = el.textContent?.slice(0, 30) ?? '';
  150 |                 results.push(`${tag}: "${text}"`);
  151 |               }
  152 |             });
  153 |           });
  154 |           return results;
  155 |         });
  156 | 
  157 |         expect(violations, `Elements with whitespace-nowrap in cards:\n${violations.join('\n')}`).toHaveLength(0);
  158 |       });
  159 | 
  160 |       test('long text uses break-words/min-w-0', async ({ page }) => {
  161 |         await page.goto('/');
  162 |         await setLanguage(page, lang);
  163 |         await page.waitForTimeout(500);
  164 | 
  165 |         const issues = await page.evaluate(() => {
  166 |           const results: string[] = [];
  167 |           const textEls = document.querySelectorAll('h1, h2, h3, p, span');
  168 |           textEls.forEach((el) => {
  169 |             const rect = el.getBoundingClientRect();
  170 |             const vw = document.documentElement.clientWidth;
  171 |             if (rect.width > vw) {
  172 |               const tag = el.tagName.toLowerCase();
  173 |               const text = el.textContent?.slice(0, 40) ?? '';
  174 |               results.push(`${tag}: "${text}" (width: ${Math.round(rect.width)}px > viewport: ${vw}px)`);
  175 |             }
  176 |           });
  177 |           return results;
  178 |         });
  179 | 
  180 |         expect(issues, `Text elements wider than viewport:\n${issues.join('\n')}`).toHaveLength(0);
  181 |       });
  182 | 
  183 |       test('bottom padding accounts for sticky nav', async ({ page }) => {
  184 |         await page.goto('/');
  185 |         await setLanguage(page, lang);
  186 |         await page.waitForTimeout(500);
  187 | 
  188 |         const hasPadding = await page.evaluate(() => {
```