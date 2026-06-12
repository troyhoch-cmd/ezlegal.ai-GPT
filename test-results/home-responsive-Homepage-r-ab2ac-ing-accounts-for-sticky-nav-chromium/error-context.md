# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: home-responsive.spec.ts >> Homepage responsive: 320x874-en >> bottom padding accounts for sticky nav
- Location: tests/e2e/home-responsive.spec.ts:183:7

# Error details

```
Error: Main content should have bottom padding for sticky nav on mobile

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Test source

```ts
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
  189 |           const main = document.getElementById('main-content');
  190 |           if (!main) return false;
  191 |           const style = getComputedStyle(main);
  192 |           const pb = parseFloat(style.paddingBottom);
  193 |           return pb >= 60;
  194 |         });
  195 | 
> 196 |         expect(hasPadding, 'Main content should have bottom padding for sticky nav on mobile').toBe(true);
      |                                                                                                ^ Error: Main content should have bottom padding for sticky nav on mobile
  197 |       });
  198 | 
  199 |       test('capture screenshot', async ({ page }) => {
  200 |         await page.goto('/');
  201 |         await setLanguage(page, lang);
  202 |         await page.waitForTimeout(500);
  203 | 
  204 |         await page.screenshot({
  205 |           path: `tests/e2e/screenshots/home-${label}.png`,
  206 |           fullPage: true,
  207 |         });
  208 |       });
  209 |     });
  210 | 
  211 |     // Safeguards expanded tests
  212 |     test.describe(`Homepage safeguards expanded: ${label}`, () => {
  213 |       test.use({ viewport });
  214 | 
  215 |       test('safeguards section readable when expanded', async ({ page }) => {
  216 |         await page.goto('/');
  217 |         await setLanguage(page, lang);
  218 |         await page.waitForTimeout(500);
  219 | 
  220 |         const safeguardsBtn = page.locator('button[aria-controls="safeguards-panel"]');
  221 |         if (await safeguardsBtn.count()) {
  222 |           await safeguardsBtn.click();
  223 |           await page.waitForTimeout(300);
  224 | 
  225 |           const panel = page.locator('#safeguards-panel');
  226 |           await expect(panel).toBeVisible();
  227 | 
  228 |           // Verify no horizontal overflow after expansion
  229 |           const ok = await noHorizontalOverflow(page);
  230 |           expect(ok, 'Horizontal overflow after safeguards expansion').toBe(true);
  231 | 
  232 |           // Verify all text is visible (not clipped)
  233 |           const allText = panel.locator('p');
  234 |           const count = await allText.count();
  235 |           for (let i = 0; i < count; i++) {
  236 |             const el = allText.nth(i);
  237 |             await expect(el).toBeVisible();
  238 |             const box = await el.boundingBox();
  239 |             expect(box, `Safeguard text item ${i} has no bounding box`).not.toBeNull();
  240 |             if (box) {
  241 |               expect(box.width).toBeGreaterThan(0);
  242 |               expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
  243 |             }
  244 |           }
  245 | 
  246 |           await page.screenshot({
  247 |             path: `tests/e2e/screenshots/home-safeguards-expanded-${label}.png`,
  248 |             fullPage: true,
  249 |           });
  250 |         }
  251 |       });
  252 |     });
  253 |   }
  254 | }
  255 | 
```