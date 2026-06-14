import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { chromium } from '@playwright/test';
import { resolveAuditConfig } from './resolve-config.mjs';

const config = resolveAuditConfig();
const ROOT = config.ROOT;
const inventory = JSON.parse(readFileSync(resolve(ROOT, config.outputDir, 'route-inventory.json'), 'utf-8'));

const screenshotDir = resolve(ROOT, config.screenshotDir, 'icp');
mkdirSync(screenshotDir, { recursive: true });

function extractEvidence(page) {
  return page.evaluate(() => {
    const getText = (el) => el?.textContent?.trim().slice(0, 300) || '';
    const bodyText = document.body.textContent || '';
    const bodyLower = bodyText.toLowerCase();

    const title = document.title || '';
    const h1 = getText(document.querySelector('h1'));
    const lang = document.documentElement.getAttribute('lang') || '';

    const navEls = document.querySelectorAll('nav a, nav button, header a, header button, [role="navigation"] a');
    const navLabels = [...new Set(Array.from(navEls).map(el => getText(el).slice(0, 60)).filter(t => t.length > 0 && t.length < 60))].slice(0, 20);

    const ctaPatterns = /sign.?up|get.?started|start|try|buy|subscribe|contact|demo|free|pricing|book|schedule|learn.?more|join|create|register|empezar|comenzar|obtener|comprar|suscribir|reservar|programar/i;
    const ctaLabels = [];
    document.querySelectorAll('a, button').forEach(el => {
      const text = getText(el).slice(0, 60);
      if (ctaPatterns.test(text) && text.length > 0 && text.length < 60) {
        ctaLabels.push({ text, href: el.getAttribute('href') || '' });
      }
    });

    const forms = Array.from(document.querySelectorAll('form')).map(form => {
      const inputs = form.querySelectorAll('input:not([type=hidden]), select, textarea');
      return {
        fieldCount: inputs.length,
        labels: Array.from(inputs).slice(0, 10).map(i => {
          const label = document.querySelector(`label[for="${i.id}"]`)?.textContent?.trim().slice(0, 50) ||
            i.getAttribute('aria-label')?.slice(0, 50) ||
            i.getAttribute('placeholder')?.slice(0, 50) ||
            i.name || i.type || '';
          return label;
        }),
      };
    });

    const trustPatterns = [
      { id: 'security-mention', pattern: /secure|encrypted|ssl|https|256.?bit/i },
      { id: 'guarantee', pattern: /guarantee|money.?back|risk.?free/i },
      { id: 'social-proof', pattern: /testimonial|review|\d+\s*star|rated|trusted by/i },
      { id: 'low-risk-offer', pattern: /free.?trial|no.?credit.?card|cancel.?anytime/i },
      { id: 'authority', pattern: /bar.?association|certified|licensed|attorney.?reviewed/i },
      { id: 'privacy', pattern: /privacy|data.?protection|gdpr|ccpa|confidential/i },
    ];
    const trustSignals = trustPatterns.filter(t => t.pattern.test(bodyLower)).map(t => t.id);

    const aiDisclosurePatterns = /not.?a.?lawyer|not.?legal.?advice|informational.?only|ai.?generated|this.?is.?not|no.?attorney.?client|does.?not.?constitute/i;
    const aiDisclosureMatch = bodyText.match(aiDisclosurePatterns);
    const aiDisclosure = aiDisclosureMatch ? bodyText.slice(Math.max(0, aiDisclosureMatch.index - 20), aiDisclosureMatch.index + 150).trim() : '';

    const legalBoundaryPatterns = /legal.?advice|attorney.?client.?relationship|professional.?legal|legal.?representation|substitute.?for.?legal/i;
    const legalBoundaryMatch = bodyText.match(legalBoundaryPatterns);
    const legalBoundary = legalBoundaryMatch ? bodyText.slice(Math.max(0, legalBoundaryMatch.index - 20), legalBoundaryMatch.index + 150).trim() : '';

    const jurisdictionPatterns = /jurisdiction|state.?specific|varies.?by.?state|laws.?vary|check.?your.?local|applicable.?law/i;
    const jurisdictionMatch = bodyText.match(jurisdictionPatterns);
    const jurisdictionWarning = jurisdictionMatch ? bodyText.slice(Math.max(0, jurisdictionMatch.index - 20), jurisdictionMatch.index + 150).trim() : '';

    const escalationPatterns = /consult.?a.?(lawyer|attorney)|seek.?legal.?counsel|speak.?with.?a|talk.?to.?a.?(lawyer|attorney)|find.?a.?(lawyer|attorney)|connect.?with.?a/i;
    const escalationMatch = bodyText.match(escalationPatterns);
    const humanEscalation = escalationMatch ? bodyText.slice(Math.max(0, escalationMatch.index - 20), escalationMatch.index + 150).trim() : '';

    const pricingPatterns = /\$\d+|\d+\/mo|per.?month|annual|pricing|plan|tier|subscription|free|starter|professional|enterprise/i;
    const pricingMatch = bodyText.match(pricingPatterns);
    const pricingText = pricingMatch ? bodyText.slice(Math.max(0, pricingMatch.index - 20), pricingMatch.index + 200).trim() : '';

    return {
      title,
      h1,
      lang,
      navLabels,
      ctaLabels: ctaLabels.slice(0, 15),
      forms,
      trustSignals,
      aiDisclosure,
      legalBoundary,
      jurisdictionWarning,
      humanEscalation,
      pricingText: pricingText.slice(0, 300),
    };
  });
}

function extractSpanishEvidence(page) {
  return page.evaluate(() => {
    const bodyText = document.body.textContent || '';
    const bodyLower = bodyText.toLowerCase();
    const lang = document.documentElement.getAttribute('lang') || '';
    const pageLangEls = document.querySelectorAll('[lang="es"], [lang="es-US"], [lang="es-MX"]');

    const navEls = document.querySelectorAll('nav a, nav button, header a, header button');
    const navTexts = Array.from(navEls).map(el => el.textContent?.trim() || '').filter(Boolean);
    const spanishNavWords = ['inicio', 'servicios', 'precios', 'nosotros', 'contacto', 'ayuda', 'preguntas', 'acerca', 'recursos', 'herramientas'];
    const spanishNavCount = navTexts.filter(t => spanishNavWords.some(w => t.toLowerCase().includes(w))).length;

    const formEls = document.querySelectorAll('form input, form select, form textarea, form label, form button');
    const formTexts = Array.from(formEls).map(el => (el.textContent?.trim() || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '')).filter(Boolean);
    const spanishFormWords = ['nombre', 'correo', 'mensaje', 'enviar', 'teléfono', 'dirección', 'contraseña', 'buscar', 'seleccionar'];
    const spanishFormCount = formTexts.filter(t => spanishFormWords.some(w => t.toLowerCase().includes(w))).length;

    const ctaEls = document.querySelectorAll('a, button');
    const ctaTexts = Array.from(ctaEls).map(el => el.textContent?.trim() || '').filter(t => t.length > 0 && t.length < 60);
    const spanishCtaWords = ['empezar', 'comenzar', 'obtener', 'registrar', 'suscribir', 'contactar', 'probar', 'ver', 'aprender', 'gratis', 'descargar'];
    const spanishCtaCount = ctaTexts.filter(t => spanishCtaWords.some(w => t.toLowerCase().includes(w))).length;

    const disclaimerPatterns = /no.?es.?asesoramiento.?legal|información.?general|consulte.?con.?un.?abogado|no.?constituye|responsabilidad/i;
    const hasSpanishDisclaimer = disclaimerPatterns.test(bodyText);

    const footerEl = document.querySelector('footer');
    const footerText = footerEl?.textContent?.toLowerCase() || '';
    const spanishFooterWords = ['derechos', 'privacidad', 'términos', 'contacto', 'ayuda', 'nosotros', 'sobre'];
    const spanishFooterCount = spanishFooterWords.filter(w => footerText.includes(w)).length;

    const freeHelpPatterns = /gratis|sin.?costo|ayuda.?legal.?gratuita|recursos.?gratuitos|no.?cobrar/i;
    const hasFreeHelp = freeHelpPatterns.test(bodyLower);

    const humanEscalationPatterns = /hablar.?con.?un.?abogado|consulte.?un.?abogado|buscar.?un.?abogado|conectar.?con/i;
    const hasHumanEscalation = humanEscalationPatterns.test(bodyLower);

    return {
      htmlLang: lang,
      hasPageLevelLangEs: pageLangEls.length > 0,
      isLangEs: lang === 'es' || lang.startsWith('es-'),
      spanishNavCount,
      totalNav: navTexts.length,
      spanishFormCount,
      totalFormElements: formTexts.length,
      spanishCtaCount,
      totalCtas: ctaTexts.length,
      hasSpanishDisclaimer,
      spanishFooterCount,
      totalFooterWords: spanishFooterWords.length,
      hasFreeHelp,
      hasHumanEscalation,
    };
  });
}

function extractSMBEvidence(page) {
  return page.evaluate(() => {
    const bodyText = document.body.textContent || '';
    const bodyLower = bodyText.toLowerCase();

    const businessPatterns = /small.?business|smb|startup|company|enterprise|team|organization|business.?owner|employer|contractor/i;
    const hasBusinessUseCases = businessPatterns.test(bodyLower);

    const pricingPatterns = /\$\d+|pricing|plan|tier|per.?month|annual|subscription|free.?trial/i;
    const hasPricing = pricingPatterns.test(bodyLower);

    const roiPatterns = /save|roi|return.?on|reduce.?cost|affordable|cheaper|value|cost.?effective|hours.?saved|compared.?to/i;
    const hasROI = roiPatterns.test(bodyLower);

    const securityPatterns = /secure|encrypt|privacy|gdpr|ccpa|soc.?2|hipaa|complian|data.?protect/i;
    const hasSecurity = securityPatterns.test(bodyLower);

    const nextCtaEls = document.querySelectorAll('a, button');
    const ctaTexts = Array.from(nextCtaEls).map(el => ({
      text: el.textContent?.trim().slice(0, 60) || '',
      href: el.getAttribute('href') || '',
    })).filter(c => c.text.length > 0 && c.text.length < 60);

    const checkoutReachable = ctaTexts.some(c =>
      /checkout|buy|purchase|subscribe|sign.?up|get.?started|start.?trial/i.test(c.text) ||
      c.href.includes('/checkout') || c.href.includes('/signup') || c.href.includes('/pricing')
    );

    return {
      hasBusinessUseCases,
      hasPricing,
      hasROI,
      hasSecurity,
      checkoutReachable,
      ctaSample: ctaTexts.slice(0, 10),
    };
  });
}

function extractProBonoEvidence(page) {
  return page.evaluate(() => {
    const bodyText = document.body.textContent || '';
    const bodyLower = bodyText.toLowerCase();

    const impactPatterns = /impact|cases?.?served|clients?.?helped|hours?.?donated|communities|underserved|access.?to.?justice|\d+\s*(cases|clients|hours|communities)/i;
    const hasImpactMetrics = impactPatterns.test(bodyLower);

    const grantPatterns = /grant|reporting|compliance|funder|foundation|501\(?c\)?|non.?profit|tax.?deduct/i;
    const hasGrantReporting = grantPatterns.test(bodyLower);

    const volumePatterns = /volume|partner|bulk|organization|enterprise|custom|contact.?us.?for|quote|scale/i;
    const hasVolumePricing = volumePatterns.test(bodyLower);

    const securityPatterns = /privacy|secure|encrypt|data.?protect|confidential|complian|audit/i;
    const hasPrivacySecurity = securityPatterns.test(bodyLower);

    const demoPatterns = /demo|schedule|book.?a|request|contact|talk.?to|speak.?with|learn.?more/i;
    const demoCtas = Array.from(document.querySelectorAll('a, button'))
      .map(el => ({ text: el.textContent?.trim().slice(0, 60) || '', href: el.getAttribute('href') || '' }))
      .filter(c => demoPatterns.test(c.text) && c.text.length > 0 && c.text.length < 60);

    return {
      hasImpactMetrics,
      hasGrantReporting,
      hasVolumePricing,
      hasPrivacySecurity,
      hasDemoCta: demoCtas.length > 0,
      demoCtas: demoCtas.slice(0, 5),
    };
  });
}

async function runICPEvidenceAudit() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  });

  const findings = [];
  const evidence = {};
  const publicRoutes = inventory.routes.filter(r => !r.requiresAuth && !r.isDynamic);

  for (const icpDef of config.icpDefinitions) {
    evidence[icpDef.id] = { routes: {} };
  }

  for (const route of publicRoutes) {
    const icpDef = config.icpDefinitions.find(icp =>
      icp.routes.some(r => route.path === r || route.path.startsWith(r + '/'))
    );
    if (!icpDef) continue;

    console.log(`  icp-evidence [${icpDef.id}]: ${route.path}`);

    for (const [vpName, vpSize] of Object.entries(config.viewports)) {
      const context = await browser.newContext({ viewport: vpSize });
      const page = await context.newPage();

      try {
        await page.goto(route.fullUrl, { waitUntil: 'networkidle', timeout: config.timeout });
        await page.waitForTimeout(300);

        const filename = `icp-${icpDef.id}-${route.path.replace(/\//g, '_').replace(/^_/, '') || 'home'}-${vpName}.png`;
        await page.screenshot({ path: resolve(screenshotDir, filename), fullPage: true });

        if (vpName === 'desktop') {
          const baseEvidence = await extractEvidence(page);
          const routeEvidence = { ...baseEvidence, screenshots: {} };

          if (icpDef.id === 'spanish-speaking') {
            routeEvidence.spanish = await extractSpanishEvidence(page);
          } else if (icpDef.id === 'smb') {
            routeEvidence.smb = await extractSMBEvidence(page);
          } else if (icpDef.id === 'pro-bono-lso') {
            routeEvidence.proBono = await extractProBonoEvidence(page);
          }

          evidence[icpDef.id].routes[route.path] = routeEvidence;
        }

        if (!evidence[icpDef.id].routes[route.path]) {
          evidence[icpDef.id].routes[route.path] = { screenshots: {} };
        }
        evidence[icpDef.id].routes[route.path].screenshots[vpName] = filename;
      } catch (err) {
        const isNavError = /ERR_CONNECTION_REFUSED|ECONNREFUSED|ERR_NAME_NOT_RESOLVED|DNS|net::ERR_|Navigation timeout|Timeout|blank page/i.test(err.message);
        findings.push({
          route: route.path,
          icp: icpDef.id,
          category: 'icp-evidence',
          severity: 'critical',
          issue: isNavError ? 'navigation-error' : 'audit-error',
          description: err.message.slice(0, 200),
        });

        if (!evidence[icpDef.id].routes[route.path]) {
          evidence[icpDef.id].routes[route.path] = {};
        }
        evidence[icpDef.id].routes[route.path][`${vpName}_error`] = err.message.slice(0, 200);
      }

      await context.close();
    }

    if (config.mode === 'live' && config.liveCrawl?.crawlDelay) {
      await new Promise(r => setTimeout(r, config.liveCrawl.crawlDelay));
    }
  }

  await browser.close();

  // Run ICP-specific assertions
  assertSpanishICP(evidence, findings, publicRoutes);
  assertSMBICP(evidence, findings, publicRoutes);
  assertProBonoICP(evidence, findings, publicRoutes);

  return { findings, evidence };
}

function assertSpanishICP(evidence, findings, publicRoutes) {
  const icpId = 'spanish-speaking';
  const requiredRoutes = ['/es', '/espanol'];
  const icpEvidence = evidence[icpId];

  for (const reqRoute of requiredRoutes) {
    const exists = publicRoutes.some(r => r.path === reqRoute);
    const loaded = icpEvidence.routes[reqRoute] && !icpEvidence.routes[reqRoute].desktop_error;

    if (!exists) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-route-missing',
        description: `Required Spanish ICP route ${reqRoute} not found in route inventory`,
      });
      continue;
    }

    if (!loaded) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-route-unloadable',
        description: `Required Spanish ICP route ${reqRoute} failed to load`,
      });
      continue;
    }

    const routeData = icpEvidence.routes[reqRoute];
    const spanish = routeData.spanish;

    if (!spanish) continue;

    if (!spanish.isLangEs && !spanish.hasPageLevelLangEs) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-lang-not-es',
        description: `html lang="${routeData.lang}" - must be "es" or have page-level lang="es"`,
        field: 'lang',
      });
    }

    if (spanish.totalNav > 0 && spanish.spanishNavCount === 0) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-nav-not-spanish',
        description: `Navigation has ${spanish.totalNav} items but none in Spanish`,
        field: 'navLabels',
      });
    }

    if (spanish.totalFormElements > 0 && spanish.spanishFormCount === 0) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-forms-not-spanish',
        description: `Form elements exist (${spanish.totalFormElements}) but none in Spanish`,
        field: 'forms',
      });
    }

    if (spanish.totalCtas > 0 && spanish.spanishCtaCount === 0) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-ctas-not-spanish',
        description: 'CTAs exist but none are in Spanish or bilingual',
        field: 'ctaLabels',
      });
    }

    if (!spanish.hasSpanishDisclaimer) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-disclaimer-not-spanish',
        description: 'No Spanish-language legal disclaimer found',
        field: 'disclaimers',
      });
    }

    if (spanish.spanishFooterCount === 0) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'medium',
        issue: 'icp-footer-not-spanish',
        description: 'Footer content not in Spanish',
        field: 'footer',
      });
    }

    if (!spanish.hasFreeHelp) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-free-help',
        description: 'Page must include free/low-cost help messaging in Spanish',
        field: 'freeHelp',
      });
    }

    if (!spanish.hasHumanEscalation) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-human-escalation',
        description: 'Page must include human escalation path in Spanish',
        field: 'humanEscalation',
      });
    }
  }
}

function assertSMBICP(evidence, findings, publicRoutes) {
  const icpId = 'smb';
  const requiredRoutes = ['/for-business', '/pricing', '/features', '/checkout'];
  const icpEvidence = evidence[icpId];

  for (const reqRoute of requiredRoutes) {
    const exists = publicRoutes.some(r => r.path === reqRoute);
    const loaded = icpEvidence.routes[reqRoute] && !icpEvidence.routes[reqRoute].desktop_error;

    if (!exists) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-route-missing',
        description: `Required SMB ICP route ${reqRoute} not found in route inventory`,
      });
      continue;
    }

    if (!loaded) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-route-unloadable',
        description: `Required SMB ICP route ${reqRoute} failed to load`,
      });
      continue;
    }

    const routeData = icpEvidence.routes[reqRoute];
    const smb = routeData.smb;

    if (!smb) continue;

    if (!smb.hasBusinessUseCases) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-business-use-cases',
        description: 'Page does not show business-specific use cases',
        field: 'businessUseCases',
      });
    }

    if (reqRoute === '/pricing' && !smb.hasPricing) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-no-pricing',
        description: 'Pricing page does not contain pricing information',
        field: 'pricingText',
      });
    }

    if (!smb.hasROI && reqRoute === '/for-business') {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-roi',
        description: 'Business landing page missing ROI/value proposition',
        field: 'roi',
      });
    }

    if (!smb.hasSecurity && ['/for-business', '/checkout'].includes(reqRoute)) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-security',
        description: `${reqRoute} missing security/privacy messaging`,
        field: 'security',
      });
    }

    if (!smb.checkoutReachable && reqRoute !== '/checkout') {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-checkout-unreachable',
        description: 'No CTA or link leading to checkout/signup found on page',
        field: 'checkoutReachable',
      });
    }
  }
}

function assertProBonoICP(evidence, findings, publicRoutes) {
  const icpId = 'pro-bono-lso';
  const requiredRoutes = ['/pro-bono', '/for-organizations', '/lso-dashboard', '/grant-reporting'];
  const icpEvidence = evidence[icpId];

  for (const reqRoute of requiredRoutes) {
    const exists = publicRoutes.some(r => r.path === reqRoute);
    const routeObj = publicRoutes.find(r => r.path === reqRoute);
    const isAuthRequired = routeObj?.requiresAuth;

    if (!exists) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-route-missing',
        description: `Required Pro Bono/LSO ICP route ${reqRoute} not found in route inventory`,
      });
      continue;
    }

    if (isAuthRequired) continue;

    const loaded = icpEvidence.routes[reqRoute] && !icpEvidence.routes[reqRoute].desktop_error;
    if (!loaded) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-route-unloadable',
        description: `Required Pro Bono/LSO ICP route ${reqRoute} failed to load`,
      });
      continue;
    }

    const routeData = icpEvidence.routes[reqRoute];
    const proBono = routeData.proBono;

    if (!proBono) continue;

    if (!proBono.hasImpactMetrics && ['/pro-bono', '/for-organizations'].includes(reqRoute)) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-impact-metrics',
        description: 'Page missing impact metrics (cases served, hours donated, communities)',
        field: 'impactMetrics',
      });
    }

    if (!proBono.hasGrantReporting && reqRoute === '/grant-reporting') {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'critical',
        issue: 'icp-no-grant-reporting',
        description: 'Grant reporting page missing grant/compliance/reporting content',
        field: 'grantReporting',
      });
    }

    if (!proBono.hasVolumePricing && reqRoute === '/for-organizations') {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-volume-pricing',
        description: 'Organizations page missing volume/partner pricing information',
        field: 'volumePricing',
      });
    }

    if (!proBono.hasPrivacySecurity && ['/for-organizations', '/lso-dashboard'].includes(reqRoute)) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-privacy-security',
        description: `${reqRoute} missing privacy/security messaging`,
        field: 'privacySecurity',
      });
    }

    if (!proBono.hasDemoCta && ['/pro-bono', '/for-organizations'].includes(reqRoute)) {
      findings.push({
        route: reqRoute,
        icp: icpId,
        category: 'icp-evidence',
        severity: 'high',
        issue: 'icp-no-demo-cta',
        description: 'Page missing demo/contact CTA for organizations',
        field: 'demoCta',
      });
    }
  }
}

// Mark blocked fields in evidence
function markBlockedFields(evidence) {
  for (const [icpId, icpData] of Object.entries(evidence)) {
    for (const [routePath, routeData] of Object.entries(icpData.routes)) {
      if (routeData.desktop_error) {
        routeData.title = '[blocked]';
        routeData.h1 = '[blocked]';
        routeData.lang = '[blocked]';
        routeData.navLabels = '[blocked]';
        routeData.ctaLabels = '[blocked]';
        routeData.forms = '[blocked]';
        routeData.trustSignals = '[blocked]';
        routeData.aiDisclosure = '[blocked]';
        routeData.legalBoundary = '[blocked]';
        routeData.jurisdictionWarning = '[blocked]';
        routeData.humanEscalation = '[blocked]';
        routeData.pricingText = '[blocked]';
      } else {
        const fields = ['title', 'h1', 'lang', 'navLabels', 'ctaLabels', 'forms', 'trustSignals', 'aiDisclosure', 'legalBoundary', 'jurisdictionWarning', 'humanEscalation', 'pricingText'];
        for (const field of fields) {
          if (routeData[field] === undefined || routeData[field] === null) {
            routeData[field] = '[blocked]';
          }
        }
      }
    }
  }
}

console.log('Running ICP Evidence Audit...');
const { findings, evidence } = await runICPEvidenceAudit();
markBlockedFields(evidence);

const output = {
  auditedAt: new Date().toISOString(),
  category: 'icp-evidence',
  totalFindings: findings.length,
  bySeverity: {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  },
  byICP: Object.fromEntries(
    config.icpDefinitions.map(icp => [
      icp.id,
      {
        findings: findings.filter(f => f.icp === icp.id).length,
        routesAudited: Object.keys(evidence[icp.id]?.routes || {}).length,
        blockedFields: Object.values(evidence[icp.id]?.routes || {}).reduce((count, r) =>
          count + Object.values(r).filter(v => v === '[blocked]').length, 0),
      },
    ])
  ),
  evidence,
  findings,
};

const outputDir = resolve(ROOT, config.outputDir);
mkdirSync(outputDir, { recursive: true });
const outputPath = resolve(outputDir, 'icp-evidence-audit.json');
writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`ICP Evidence Audit Complete: ${findings.length} findings`);
console.log(`  Critical: ${output.bySeverity.critical} | High: ${output.bySeverity.high} | Medium: ${output.bySeverity.medium} | Low: ${output.bySeverity.low}`);
for (const icp of config.icpDefinitions) {
  const stats = output.byICP[icp.id];
  console.log(`  ${icp.label}: ${stats.routesAudited} routes, ${stats.findings} findings, ${stats.blockedFields} blocked fields`);
}

const navErrors = findings.filter(f => f.issue === 'navigation-error' || f.issue === 'audit-error');
if (navErrors.length > 0) {
  console.error(`\n[FATAL] ${navErrors.length} navigation/audit errors detected. Dev server may be unavailable.`);
  process.exit(1);
}
