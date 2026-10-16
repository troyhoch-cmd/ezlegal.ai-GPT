import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Isolate UI verification from credentials and live legal-data services.
// This fixture does not establish backend availability or account completion.
test.beforeEach(async ({ page, isMobile }) => {
  if (isMobile) await page.setViewportSize({ width: 320, height: 740 });
  await page.route('**/src/lib/supabase.ts', async route => {
    const response = await route.fetch();
    const source = (await response.text())
      .replace(/const supabaseUrl = [^;]+;/, 'const supabaseUrl = "https://frontend-fixture.invalid";')
      .replace(/const supabaseAnonKey = [^;]+;/, 'const supabaseAnonKey = "frontend-test-placeholder";');
    await route.fulfill({ response, body: source });
  });
  await page.route('https://frontend-fixture.invalid/**', route => route.fulfill({ json: [], headers: { 'access-control-allow-origin': '*' } }));
});

for (const lang of ['en', 'es'] as const) {
  test.describe(`Launch gates ${lang}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(language => {
        localStorage.setItem('ezlegal-language', language);
        localStorage.setItem('ezlegal-locale', language === 'es' ? 'es-US' : 'en-US');
      }, lang);
    });

    test('offer, scope, intake destination and privacy content', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('hero-primary-cta')).toBeVisible();
      await expect(page.getByText(lang === 'en' ? /Free plan: 10 questions and 3 documents/ : /Plan gratis: 10 preguntas y 3 documentos/)).toBeVisible();
      await expect(page.getByText(lang === 'en' ? /For Arizona legal questions/ : /Para preguntas sobre la ley de Arizona/)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByTestId('hero-primary-cta').click();
      await expect(page).toHaveURL(/\/start/);
      await page.goto('/privacy');
      await expect(page.locator('h1')).toContainText(lang === 'en' ? 'Privacy Policy' : 'Política de privacidad');
      await expect(page.locator('#sharing')).toContainText(lang === 'en' ? 'Legal Requirements' : 'orden judicial');
      await expect(page.locator('#retention')).toContainText('90');
    });

    test('five starting cards prefill editable questions and consent gates submission', async ({ page }) => {
      await page.goto('/chat');
      const startingPoints = page.getByRole('region', { name: lang === 'en' ? 'Starting points' : 'Puntos de partida' });
      await expect(startingPoints.getByRole('button')).toHaveCount(5);
      const question = page.getByRole('textbox', { name: lang === 'en' ? 'Your legal question' : 'Tu pregunta legal' });
      for (let index = 0; index < 5; index++) {
        await startingPoints.getByRole('button').nth(index).click();
        await expect(question).not.toHaveValue('');
      }
      const send = page.getByRole('button', { name: lang === 'en' ? 'Send message' : 'Enviar mensaje' });
      await expect(send).toBeDisabled();
      await page.getByRole('checkbox').check();
      await expect(send).toBeEnabled();
      await page.getByRole('checkbox').uncheck();
      await expect(send).toBeDisabled();
      await expect(page.getByRole('link', { name: lang === 'en' ? 'Privacy and data controls' : 'Privacidad y control de datos' })).toHaveAttribute('href', '/privacy');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    });

    test('topic draft survives navigation and urgent help is actionable', async ({ page }) => {
      await page.goto('/ask/housing');
      const question = page.getByRole('textbox');
      await question.fill(lang === 'en' ? 'What records should an Arizona tenant keep?' : '¿Qué registros debe guardar un inquilino de Arizona?');
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: lang === 'en' ? 'Continue to chat' : 'Continuar al chat' }).click();
      await expect(page).toHaveURL(/\/chat/);
      await expect(page.getByRole('textbox')).toHaveValue(/Arizona/);
      await expect(page.getByRole('checkbox')).not.toBeChecked();
      await page.goto('/urgent-help');
      await expect(page.getByRole('link', { name: lang === 'en' ? 'Call 911 Now' : 'Llamar 911 Ahora' })).toHaveAttribute('href', 'tel:911');
      await expect(page.getByRole('link', { name: lang === 'en' ? 'Privacy policy' : 'Política de privacidad', exact: true }).first()).toHaveAttribute('href', '/privacy');
    });

    test('outside Arizona is blocked and account copy is localized', async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('ezlegal-jurisdiction', 'CA'));
      await page.goto('/chat');
      await page.getByRole('textbox').fill('A synthetic question for a state outside coverage');
      await page.getByRole('checkbox').check();
      await expect(page.getByRole('button', { name: lang === 'en' ? 'Send message' : 'Enviar mensaje' })).toBeDisabled();
      await expect(page.getByText(lang === 'en' ? /This state is outside our current Arizona coverage/ : /Este estado está fuera de nuestra cobertura/)).toBeVisible();
      await page.goto('/login');
      await expect(page.locator('label[for="email"]')).toContainText(lang === 'en' ? 'Email' : 'Correo');
      await expect(page.locator('label[for="password"]')).toContainText(lang === 'en' ? 'Password' : 'Contraseña');
      await page.goto('/pricing?audience=business');
      await expect(page.getByRole('tab', { selected: true })).toHaveCount(1);
      await page.goto('/pricing?audience=legal-aid');
      await expect(page.getByRole('tab', { selected: true })).toHaveCount(1);
    });

    test('OCR requires acknowledgment before file selection', async ({ page }) => {
      await page.route(/\/src\/main\.tsx(?:\?.*)?$/, route => route.fulfill({ contentType: 'application/javascript', body: `
        import React from '/node_modules/.vite/deps/react.js';
        import ReactDOM from '/node_modules/.vite/deps/react-dom_client.js';
        const processorSource = await (await fetch('/src/components/DocumentOCRProcessor.tsx')).text();
        const disclosureSource = await (await fetch('/src/components/BeforeYouShare.tsx')).text();
        const contextPath = processorSource.match(/from "([^"]*LanguageContext[^"]*)"/)[1];
        const routerPath = disclosureSource.match(/from "([^"]*react-router-dom[^"]*)"/)[1];
        const { LanguageProvider } = await import(contextPath);
        const { BrowserRouter } = await import(routerPath);
        const { default: DocumentOCRProcessor } = await import('/src/components/DocumentOCRProcessor.tsx');
        import '/src/index.css';
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(BrowserRouter, null, React.createElement(LanguageProvider, null, React.createElement(DocumentOCRProcessor))));
      ` }));
      await page.goto('/');
      const file = page.getByLabel(lang === 'en' ? 'Choose a document' : 'Elegir un documento', { exact: true });
      await expect(file).toBeDisabled();
      await page.getByRole('checkbox').check();
      await expect(file).toBeEnabled();
      await file.setInputFiles({ name: 'synthetic-test.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 synthetic fixture') });
      await expect(page.getByText('synthetic-test.pdf')).toBeVisible();
      await expect(page.getByRole('button', { name: lang === 'en' ? 'Start OCR Processing' : 'Iniciar reconocimiento de texto' })).toBeVisible();
      await page.getByRole('checkbox').uncheck();
      await expect(page.getByRole('button', { name: lang === 'en' ? 'Start OCR Processing' : 'Iniciar reconocimiento de texto' })).toBeDisabled();
    });

    test('disclosure has no serious automated accessibility violations', async ({ page }) => {
      await page.goto('/chat');
      await expect(page.getByRole('checkbox')).toBeVisible();
      const result = await new AxeBuilder({ page }).include('section[aria-label="' + (lang === 'en' ? 'Before you share' : 'Antes de compartir') + '"]').analyze();
      expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
    });
  });
}
