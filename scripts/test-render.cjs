const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Mock all external API calls that might fail in sandbox
  await page.route('**/*.supabase.co/**', route => {
    const url = route.request().url();
    if (url.includes('/auth/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ user: null, session: null }) });
    }
    if (url.includes('/rest/')) {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });

  // Also mock any external analytics/tracking
  await page.route('**/*.google-analytics.com/**', route => route.abort());
  await page.route('**/*.googletagmanager.com/**', route => route.abort());

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:9998/', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);

  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Errors:', errors.length);
  errors.forEach(e => console.log('  ERR:', e.substring(0, 150)));
  console.log('Body text length:', bodyText.length);
  console.log('Body text:', bodyText.substring(0, 300));

  await page.screenshot({ path: 'audit-output/test-screenshot.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})();
