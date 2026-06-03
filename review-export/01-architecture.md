# ezLegal.ai Code Review - Architecture & Configuration

> Project structure, routing, build config, and dependencies.

Generated: 2026-06-03T00:51:49.795Z
Files included: 14

---

## package.json

```json
{
  "name": "vite-react-typescript-starter",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.app.json",
    "test": "vitest run",
    "test:security": "vitest run tests/security.static.spec.ts",
    "test:e2e": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test",
    "test:a11y": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test accessibility.spec.ts",
    "check:claims": "node scripts/check-claims.js",
    "test:interaction-budget": "node scripts/interaction-budget-runner.cjs",
    "test:interaction-budget:desktop": "node scripts/assert-interaction-budget.cjs",
    "test:interaction-budget:mobile": "node scripts/assert-interaction-budget-mobile.cjs",
    "conformance:scaffold:dry": "node scripts/conformance/scaffold-policies.cjs",
    "conformance:scaffold": "node scripts/conformance/scaffold-policies.cjs --write",
    "conformance:check": "node scripts/conformance/validate-policies.cjs",
    "conformance:report": "node scripts/conformance/generate-dashboard.cjs",
    "conformance:ci": "npm run conformance:check && npm run conformance:report",
    "audit:headings": "node scripts/audit-headings.cjs",
    "audit:readability": "node scripts/audit-readability.cjs",
    "audit:images": "node scripts/audit-images.cjs",
    "qa": "npm run typecheck && npm run test:security && npm run test && npm run build && npm run test:e2e",
    "qa:e2e": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test",
    "qa:e2e:smoke": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test smoke.spec.ts",
    "qa:e2e:responsive": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test responsive.spec.ts",
    "qa:e2e:spanish": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test spanish-flow.spec.ts",
    "qa:e2e:safety": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test safety-contracts.spec.ts",
    "qa:e2e:a11y": "PLAYWRIGHT_BROWSERS_PATH=0 npx playwright test accessibility.spec.ts",
    "qa:security": "node tests/security/secrets-scan.cjs",
    "qa:severity-gate": "node scripts/severity-gate.cjs",
    "prelaunch": "npm run build && npm run qa:severity-gate"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@supabase/supabase-js": "^2.57.4",
    "@tailwindcss/typography": "^0.5.19",
    "@types/qrcode": "^1.5.6",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.1.0",
    "lucide-react": "^0.344.0",
    "pdfjs-dist": "^4.9.155",
    "qrcode": "^1.5.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.75.0",
    "react-markdown": "^10.1.0",
    "react-router-dom": "^7.11.0",
    "tesseract.js": "^5.1.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.11.3",
    "@eslint/js": "^9.9.1",
    "@playwright/test": "^1.60.0",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "fast-glob": "^3.3.2",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2",
    "vitest": "^4.1.7"
  }
}

```

---

## tsconfig.app.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "ES2021.Intl", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}

```

---

## vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/**/*.spec.ts', '!tests/e2e/**', '!tests/a11y.spec.ts', '!tests/launch.smoke.spec.ts', '!tests/ai-legal-safety.spec.ts'],
    exclude: ['tests/e2e/**'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-router')) return 'react-router';
          if (id.includes('react-dom') || /node_modules\/react\//.test(id)) return 'react-vendor';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('pdfjs-dist')) return 'pdfjs';
          if (id.includes('jspdf')) return 'jspdf';
          if (id.includes('html2canvas')) return 'html2canvas';
          if (id.includes('tesseract.js')) return 'ocr-tools';
          if (id.includes('qrcode')) return 'qr';
          return 'vendor';
        },
      },
    },
  },
  server: {
    open: false,
    fs: {
      strict: true,
    },
    watch: {
      ignored: ['**/.git/**', '**/node_modules/**', '**/dist/**'],
    },
  },
});

```

---

## tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '360px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      minHeight: {
        touch: '44px',
        screen: '100vh',
        dvh: '100dvh',
      },
      minWidth: {
        touch: '44px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
        },
        brand: {
          50: '#E7F6FF',
          100: '#D1EDFF',
          200: '#A8DBFF',
          300: '#7AC5FF',
          400: '#4AADFF',
          500: '#0067FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433',
        },
        accent: {
          50: '#FFFAF0',
          100: '#FEEBC8',
          200: '#FBD38D',
          300: '#F6AD55',
          400: '#ED8936',
          500: '#DD6B20',
          600: '#C05621',
          700: '#9C4221',
          800: '#7B341E',
          900: '#652B19',
        },
        gold: {
          50: '#FEFCF3',
          100: '#FDF6E3',
          200: '#F9E4B7',
          300: '#F2CE84',
          400: '#E8B44C',
          500: '#D4A574',
          600: '#C08A4E',
          700: '#A06E3C',
          800: '#7D552E',
          900: '#5C3D20',
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488',
          600: '#0A8A8A',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#829AB1',
          500: '#627D98',
          600: '#486581',
          700: '#334E68',
          800: '#243B53',
          900: '#102A43',
        },
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      animation: {
        'count-up': 'countUp 2s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.24s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.24s ease-out forwards',
        'slide-in-right': 'slideInRight 0.24s ease-out forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

```

---

## postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

```

---

## eslint.config.js

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
);

```

---

## index.html

```text
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <script>
      (function () {
        try {
          var lang = localStorage.getItem('ezlegal-language') || 'en';
          var rtl = lang === 'ar' || lang === 'he';
          var root = document.documentElement;
          root.lang = lang;
          root.dir = rtl ? 'rtl' : 'ltr';
          root.dataset.dir = root.dir;
        } catch (e) {
          document.documentElement.dir = 'ltr';
        }
      })();
    </script>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
    <link rel="mask-icon" href="/icons/icon-monochrome.svg" color="#0d9488" />
    <link rel="apple-touch-icon" href="/icons/icon.svg" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0d9488" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)" />
    <meta name="color-scheme" content="light dark" />
    <meta name="application-name" content="ezLegal" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="ezLegal" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="msapplication-TileColor" content="#0d9488" />
    <meta name="msapplication-tap-highlight" content="no" />
    <title>ezlegal.ai | AI Legal Intake, Triage, and Document Workflow Automation</title>
    <meta name="description" content="ezlegal.ai helps startups, law firms, and legal teams organize legal requests, collect facts, and prepare attorney-ready summaries." />
    <link rel="canonical" href="https://ezlegal.ai/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ezLegal.ai" />
    <meta property="og:url" content="https://ezlegal.ai/" />
    <meta property="og:title" content="ezlegal.ai | AI Legal Intake, Triage, and Document Workflow Automation" />
    <meta property="og:description" content="ezlegal.ai helps startups, law firms, and legal teams organize legal requests, collect facts, and prepare attorney-ready summaries." />
    <meta property="og:image" content="https://ezlegal.ai/icons/icon.svg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ezlegal.ai | AI Legal Intake, Triage, and Document Workflow Automation" />
    <meta name="twitter:description" content="ezlegal.ai helps startups, law firms, and legal teams organize legal requests, collect facts, and prepare attorney-ready summaries." />
    <meta name="twitter:image" content="https://ezlegal.ai/icons/icon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
    <meta name="geo.region" content="US-AZ" />
    <meta name="geo.placename" content="Tucson" />
    <meta name="geo.position" content="32.221743;-110.969749" />
    <meta name="ICBM" content="32.221743, -110.969749" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ezLegal.ai",
      "url": "https://ezlegal.ai",
      "inLanguage": ["en-US", "es-US"],
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://ezlegal.ai/ask?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "ezlegal.ai",
      "applicationCategory": "LegalTech",
      "operatingSystem": "Web",
      "description": "AI-powered legal intake, triage, and document workflow automation for startups, law firms, and in-house legal teams.",
      "url": "https://ezlegal.ai",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free legal readiness check"
      }
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

---

## netlify.toml

```text
[build]
command = "npx vite build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(self), geolocation=(), interest-cohort=()"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.stripe.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; frame-src https://js.stripe.com; worker-src 'self' blob:; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'"

```

---

## src/App.tsx

```tsx
import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { PersonalizationProvider } from './contexts/PersonalizationContext';
import { TenantProvider } from './contexts/TenantContext';
import { DemoProvider, useDemo } from './contexts/DemoContext';
import { ModalProvider } from './contexts/ModalContext';
import { PersonaProvider } from './contexts/PersonaContext';
import { FloatingChromeProvider } from './contexts/FloatingChromeContext';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import SkipLink from './components/SkipLink';
import ReadingPreferencesToolbar from './components/ReadingPreferencesToolbar';
import { useRouteFocus } from './hooks/useRouteFocus';
import AdminLayout from './components/AdminLayout';
import DemoModeBanner from './components/DemoModeBanner';
import { startLinkHealthMonitoring, validateAnchor } from './lib/link-health';
import { trackPageView, captureAttribution } from './services/analytics-service';
import { useAccessibilityPreferences } from './hooks/useAccessibilityPreferences';
import { useTheme } from './hooks/useTheme';
import ErrorBoundary from './components/ErrorBoundary';
import OfflineBanner from './components/OfflineBanner';
import ConsentBanner from './components/ConsentBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import DeprecatedRouteRedirect from './components/DeprecatedRouteRedirect';
import { installGlobalErrorHandlers } from './lib/error-handler';
import { useLanguage } from './contexts/LanguageContext';

if (typeof window !== 'undefined') {
  installGlobalErrorHandlers();
}

function PreferenceLoader() {
  useAccessibilityPreferences();
  useTheme();
  return null;
}

function SpanishChatRedirect() {
  const { setLanguage } = useLanguage();
  useEffect(() => { setLanguage('es'); }, [setLanguage]);
  return <Navigate to="/chat" replace />;
}

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
// /chatbot and /simple-chatbot redirect to /chat via DeprecatedRouteRedirect
const History = lazy(() => import('./pages/History'));
const Documents = lazy(() => import('./pages/Documents'));
const ICPTemplateLibrary = lazy(() => import('./pages/ICPTemplateLibrary'));
const Research = lazy(() => import('./pages/Research'));
const LawyerProfiles = lazy(() => import('./pages/LawyerProfiles'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Billing = lazy(() => import('./pages/Billing'));
const Contact = lazy(() => import('./pages/Contact'));
const Features = lazy(() => import('./pages/Features'));
const About = lazy(() => import('./pages/About'));
const EZReads = lazy(() => import('./pages/EZReads'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const AdminAuditLog = lazy(() => import('./pages/AdminAuditLog'));
const CollateralStudio = lazy(() => import('./pages/CollateralStudio'));
const CollateralEditor = lazy(() => import('./pages/CollateralEditor'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LegalSafetyNet = lazy(() => import('./pages/LegalSafetyNet'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const ProBonoIntake = lazy(() => import('./pages/ProBonoIntake'));
const Cases = lazy(() => import('./pages/Cases'));
const Matters = lazy(() => import('./pages/Matters'));
const Clients = lazy(() => import('./pages/Clients'));
const EmergencyResources = lazy(() => import('./pages/EmergencyResources'));
const ForOrganizations = lazy(() => import('./pages/ForOrganizations'));
const ForBusiness = lazy(() => import('./pages/ForBusiness'));
const LSODashboard = lazy(() => import('./pages/LSODashboard'));
const GrantReporting = lazy(() => import('./pages/GrantReporting'));
const AIGovernance = lazy(() => import('./pages/AIGovernance'));
const AISafety = lazy(() => import('./pages/AISafety'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const PrivacyAtAGlance = lazy(() => import('./pages/PrivacyAtAGlance'));
const PrivacyFAQ = lazy(() => import('./pages/PrivacyFAQ'));
const SecurityFAQ = lazy(() => import('./pages/SecurityFAQ'));
const TrustCenter = lazy(() => import('./pages/TrustCenter'));
const AccessibilityStatement = lazy(() => import('./pages/AccessibilityStatement'));
const WebsiteIntegration = lazy(() => import('./pages/WebsiteIntegration'));
const ForIndividuals = lazy(() => import('./pages/ForIndividuals'));
const ScopeDisclaimers = lazy(() => import('./pages/ScopeDisclaimers'));
const ScheduleDemo = lazy(() => import('./pages/ScheduleDemo'));
const EnterpriseSecurity = lazy(() => import('./pages/EnterpriseSecurity'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const ForPartners = lazy(() => import('./pages/ForPartners'));
const SharePerspective = lazy(() => import('./pages/SharePerspective'));
const HowReportsAreReviewed = lazy(() => import('./pages/HowReportsAreReviewed'));
const Ask = lazy(() => import('./pages/Ask'));
const EspanolLanding = lazy(() => import('./pages/EspanolLanding'));
const AccessGate = lazy(() => import('./pages/AccessGate'));
const Negotiate = lazy(() => import('./pages/Negotiate'));
const PartnerHub = lazy(() => import('./pages/PartnerHub'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const PartnerLanding = lazy(() => import('./pages/PartnerLanding'));
const ChannelLanding = lazy(() => import('./pages/ChannelLanding'));
const MediaKit = lazy(() => import('./pages/MediaKit'));
const SiteReview = lazy(() => import('./pages/SiteReview'));
const SLA = lazy(() => import('./pages/SLA'));
const IssuePacks = lazy(() => import('./pages/IssuePacks'));
const CasePredictor = lazy(() => import('./pages/CasePredictor'));
const CasePredictorStart = lazy(() => import('./pages/CasePredictorStart'));
const ChatV2 = lazy(() => import('./pages/ChatV2'));
const FeatureGuide = lazy(() => import('./pages/FeatureGuide'));
const PersonaIntake = lazy(() => import('./pages/PersonaIntake'));
const IcpPrototype = lazy(() => import('./pages/IcpPrototype'));
const ForStartups = lazy(() => import('./pages/ForStartups'));
const ForLawFirms = lazy(() => import('./pages/ForLawFirms'));
const ForInHouse = lazy(() => import('./pages/ForInHouse'));
const LegalReadinessChecklist = lazy(() => import('./pages/LegalReadinessChecklist'));
const NotFound = lazy(() => import('./pages/NotFound'));
const UrgentResources = lazy(() => import('./pages/UrgentResources'));
const RouteAudit = lazy(() => import('./pages/RouteAudit'));
const QADashboard = lazy(() => import('./pages/QADashboard'));
const Demo = lazy(() => import('./pages/Demo'));
const DemoLegalAid = lazy(() => import('./pages/DemoLegalAid'));
const Toolkit = lazy(() => import('./pages/Toolkit'));
const Report = lazy(() => import('./pages/Report'));
const AIModelCard = lazy(() => import('./pages/AIModelCard'));
const AlgorithmicImpactAssessment = lazy(() => import('./pages/AlgorithmicImpactAssessment'));
const BiasMonitoring = lazy(() => import('./pages/BiasMonitoring'));
const PartnerDashboardDemo = lazy(() => import('./pages/PartnerDashboardDemo'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        <p className="text-sm text-navy-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function PublicLawyerProfiles() {
  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-24">
        <Suspense fallback={<PageLoader />}>
          <LawyerProfiles />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => validateAnchor(), 300);
    trackPageView(pathname);
  }, [pathname]);

  return null;
}

function RouteFocusManager() {
  useRouteFocus();
  return null;
}

startLinkHealthMonitoring();
captureAttribution();

function isAuditMode(): boolean {
  try {
    if (sessionStorage.getItem('ezlegal_demo_mode') === 'true') return true;
  } catch {}
  const params = new URLSearchParams(window.location.search);
  return params.get('demo') === 'audit';
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  const location = useLocation();

  if (isDemoMode || isAuditMode()) {
    return <>{children}</>;
  }

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    const redirectPath = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirectPath}`} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RouteFocusManager />
      <TenantProvider>
        <LanguageProvider>
          <PersonaProvider>
          <AuthProvider>
            <DemoProvider>
            <ModalProvider>
            <PersonalizationProvider>
            <FloatingChromeProvider>
              <SkipLink />
              <PreferenceLoader />
              <ReadingPreferencesToolbar />
              <DemoModeBanner />
              <OfflineBanner />
              <ConsentBanner />
              <PWAInstallPrompt />
              <ErrorBoundary scope="routes">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/start" element={<PersonaIntake />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/dashboard/billing" element={<Billing />} />
                  <Route path="/billing" element={<DeprecatedRouteRedirect to="/dashboard/billing" oldPath="/billing" />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/ezreads" element={<EZReads />} />
                  <Route path="/ez-reads" element={<DeprecatedRouteRedirect to="/ezreads" oldPath="/ez-reads" />} />
                  <Route path="/pro-bono" element={<ProBonoIntake />} />
                  <Route path="/get-started" element={<PersonaIntake />} />
                  <Route path="/housing-help" element={<PersonaIntake />} />
                  <Route path="/immigration-help" element={<PersonaIntake />} />
                  <Route path="/family-safety-help" element={<PersonaIntake />} />
                  <Route path="/benefits-debt-help" element={<PersonaIntake />} />
                  <Route path="/urgent-help" element={<EmergencyResources />} />
                  <Route path="/urgent-resources" element={<UrgentResources />} />
                  <Route path="/emergency-resources" element={<EmergencyResources />} />
                  <Route path="/for-organizations" element={<ForOrganizations />} />
                  <Route path="/organizations" element={<ForOrganizations />} />
                  <Route path="/legal-aid" element={<ForOrganizations />} />
                  <Route path="/share-perspective" element={<SharePerspective />} />
                  <Route path="/for-business" element={<ForBusiness />} />
                  <Route path="/business" element={<ForBusiness />} />
                  <Route path="/small-business" element={<ForBusiness />} />
                  <Route path="/negocios" element={<ForBusiness />} />
                  <Route path="/for-startups" element={<ForStartups />} />
                  <Route path="/for-law-firms" element={<ForLawFirms />} />
                  <Route path="/for-in-house" element={<ForInHouse />} />
                  <Route path="/resources/legal-readiness-checklist" element={<LegalReadinessChecklist />} />
                  <Route path="/for-individuals" element={<ForIndividuals />} />
                  <Route path="/individuals" element={<ForIndividuals />} />
                  <Route path="/personas" element={<ForIndividuals />} />
                  <Route path="/scope-disclaimers" element={<ScopeDisclaimers />} />
                  <Route path="/schedule-demo" element={<ScheduleDemo />} />
                  <Route path="/lso-dashboard" element={<LSODashboard />} />
                  <Route path="/grant-reporting" element={<GrantReporting />} />
                  <Route path="/ai-governance" element={<AIGovernance />} />
                  <Route path="/ai-safety" element={<AISafety />} />
                  <Route path="/ai-model-card" element={<AIModelCard />} />
                  <Route path="/algorithmic-impact-assessment" element={<AlgorithmicImpactAssessment />} />
                  <Route path="/bias-monitoring" element={<BiasMonitoring />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/terms-of-service" element={<DeprecatedRouteRedirect to="/terms" oldPath="/terms-of-service" />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-at-a-glance" element={<PrivacyAtAGlance />} />
                  <Route path="/privacy-policy" element={<DeprecatedRouteRedirect to="/privacy" oldPath="/privacy-policy" />} />
                  <Route path="/privacy-faq" element={<PrivacyFAQ />} />
                  <Route path="/security-faq" element={<SecurityFAQ />} />
                  <Route path="/trust-center" element={<TrustCenter />} />
                  <Route path="/trust" element={<TrustCenter />} />
                  <Route path="/trust-safety" element={<DeprecatedRouteRedirect to="/trust-center" oldPath="/trust-safety" />} />
                  <Route path="/enterprise-security" element={<EnterpriseSecurity />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/for-partners" element={<ForPartners />} />
                  <Route path="/partners" element={<ForPartners />} />
                  <Route path="/partner-hub" element={<PartnerHub />} />
                  <Route path="/partner-dashboard" element={<PartnerDashboard />} />
                  <Route path="/partner-dashboard-demo" element={<PartnerDashboardDemo />} />
                  <Route path="/p/:slug" element={<PartnerLanding />} />
                  <Route path="/welcome" element={<ChannelLanding />} />
                  <Route path="/media-kit" element={<MediaKit />} />
                  <Route path="/how-reports-are-reviewed" element={<HowReportsAreReviewed />} />
                  <Route path="/espanol" element={<EspanolLanding />} />
                  <Route path="/es" element={<EspanolLanding />} />
                  <Route path="/es/chat" element={<SpanishChatRedirect />} />
                  <Route path="/accessibility" element={<AccessibilityStatement />} />
                  <Route path="/access" element={<AccessGate />} />
                  <Route path="/negotiate" element={<Negotiate />} />
                  <Route path="/site-review" element={<SiteReview />} />
                  <Route path="/route-audit" element={<RouteAudit />} />
                  <Route path="/qa" element={<QADashboard />} />
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/demo/legal-aid" element={<DemoLegalAid />} />
                  <Route path="/sla" element={<SLA />} />
                  <Route path="/icp-prototype" element={<IcpPrototype />} />
                  <Route path="/toolkit" element={<Toolkit />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/find-attorney" element={<PublicLawyerProfiles />} />
                  <Route
                    path="/admin"
                    element={
                      <PrivateRoute>
                        <AdminLayout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<AdminOverview />} />
                    <Route path="users" element={<Admin />} />
                    <Route path="content" element={<Admin />} />
                    <Route path="chat" element={<Admin />} />
                    <Route path="partners" element={<Admin />} />
                    <Route path="system" element={<Admin />} />
                    <Route path="audit-log" element={<AdminAuditLog />} />
                    <Route path="collateral" element={<CollateralStudio />} />
                    <Route path="collateral/:id" element={<CollateralEditor />} />
                    <Route path="*" element={<Admin />} />
                  </Route>
                  <Route path="/ask" element={<Ask />} />
                  <Route path="/ask/:topic" element={<Ask />} />
                  <Route path="/issue-packs" element={<IssuePacks />} />
                  <Route path="/case-predictor" element={<CasePredictor />} />
                  <Route path="/case-predictor/start" element={<CasePredictorStart />} />
                  <Route path="/chatbot-standalone" element={<DeprecatedRouteRedirect to="/chat" oldPath="/chatbot-standalone" />} />
                  <Route path="/chat" element={<ChatV2 />} />
                  <Route path="/chat-v2" element={<DeprecatedRouteRedirect to="/chat" oldPath="/chat-v2" />} />
                  <Route path="/app" element={<Navigate to="/chat" replace />} />
                  <Route path="/chatbot" element={<DeprecatedRouteRedirect to="/chat" oldPath="/chatbot" />} />
                  <Route path="/simple-chatbot" element={<DeprecatedRouteRedirect to="/chat" oldPath="/simple-chatbot" />} />
                  <Route path="/help/which-feature" element={<FeatureGuide />} />
                  <Route path="/safety-net" element={<LegalSafetyNet />} />
                  <Route path="/dashboard" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<Navigate to="/chat" replace />} />
                    <Route path="action-plan" element={<Dashboard />} />
                    <Route path="ai-assistant" element={<AIAssistant />} />
                    <Route path="cases" element={<Cases />} />
                    <Route path="matters" element={<Matters />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="history" element={<History />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="icp-templates" element={<ICPTemplateLibrary />} />
                    <Route path="research" element={<Research />} />
                    <Route path="lawyer-profiles" element={<LawyerProfiles />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="website-integration" element={<WebsiteIntegration />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              </ErrorBoundary>
            </FloatingChromeProvider>
            </PersonalizationProvider>
            </ModalProvider>
            </DemoProvider>
          </AuthProvider>
          </PersonaProvider>
        </LanguageProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}

export default App;

```

---

## src/main.tsx

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import LocalBusinessSchema from './components/LocalBusinessSchema.tsx';
import './index.css';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {
      /* SW registration is best-effort; app still works without it */
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocalBusinessSchema />
    <App />
  </StrictMode>
);

```

---

## src/config/routes.ts

```typescript
export type RouteAudience =
  | 'individual'
  | 'spanish-individual'
  | 'business'
  | 'legal-aid'
  | 'attorney-partner'
  | 'admin'
  | 'general';

export type RouteRiskLevel = 'low' | 'medium' | 'high';

export type NavGroup =
  | 'get-help'
  | 'business'
  | 'organizations'
  | 'learn'
  | 'trust'
  | 'account'
  | 'admin';

export interface AppRouteMeta {
  path: string;
  label: { en: string; es: string };
  plainLanguageLabel: { en: string; es: string };
  audience: RouteAudience[];
  requiresAuth: boolean;
  availableLanguages: ('en' | 'es')[];
  showEmergencyBanner?: boolean;
  showScopeDisclaimer?: boolean;
  showLegalAidEscalation?: boolean;
  riskLevel: RouteRiskLevel;
  navGroup?: NavGroup;
  hideFromFirstTimeUsers?: boolean;
}

export const APP_ROUTE_META: Record<string, AppRouteMeta> = {
  '/': {
    path: '/',
    label: { en: 'Home', es: 'Inicio' },
    plainLanguageLabel: { en: 'Home', es: 'Inicio' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
  },
  '/start': {
    path: '/start',
    label: { en: 'Get Started', es: 'Comenzar' },
    plainLanguageLabel: { en: 'Answer 3 questions, get your next steps', es: 'Responde 3 preguntas, obtén tus próximos pasos' },
    audience: ['individual', 'spanish-individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/chat': {
    path: '/chat',
    label: { en: 'Chat', es: 'Chat' },
    plainLanguageLabel: { en: 'Ask a legal question', es: 'Haz una pregunta legal' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/es/chat': {
    path: '/es/chat',
    label: { en: 'Chat (Spanish)', es: 'Chat en Español' },
    plainLanguageLabel: { en: 'Ask in Spanish', es: 'Pregunta en español' },
    audience: ['spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/espanol': {
    path: '/espanol',
    label: { en: 'En Español', es: 'En Español' },
    plainLanguageLabel: { en: 'Full experience in Spanish', es: 'Experiencia completa en español' },
    audience: ['spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/emergency-resources': {
    path: '/emergency-resources',
    label: { en: 'Emergency Resources', es: 'Recursos de Emergencia' },
    plainLanguageLabel: { en: 'Immediate help for danger or deadlines', es: 'Ayuda inmediata para peligro o plazos' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'high',
    navGroup: 'get-help',
  },
  '/lawyer-profiles': {
    path: '/lawyer-profiles',
    label: { en: 'Find Legal Help', es: 'Encontrar Ayuda Legal' },
    plainLanguageLabel: { en: 'Browse attorneys and legal aid organizations', es: 'Busca abogados y organizaciones de ayuda legal' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showLegalAidEscalation: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/issue-packs': {
    path: '/issue-packs',
    label: { en: 'Issue Packs', es: 'Paquetes de Temas' },
    plainLanguageLabel: { en: 'Self-help guides for common issues', es: 'Guías de autoayuda para problemas comunes' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/for-business': {
    path: '/for-business',
    label: { en: 'For Business', es: 'Para Negocios' },
    plainLanguageLabel: { en: 'Legal help for small and medium businesses', es: 'Ayuda legal para pequeñas y medianas empresas' },
    audience: ['business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'business',
  },
  '/for-organizations': {
    path: '/for-organizations',
    label: { en: 'For Organizations', es: 'Para Organizaciones' },
    plainLanguageLabel: { en: 'Intake, triage, and partner tools', es: 'Herramientas de intake, triaje y socios' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'organizations',
  },
  '/schedule-demo': {
    path: '/schedule-demo',
    label: { en: 'Schedule Demo', es: 'Agendar Demo' },
    plainLanguageLabel: { en: 'See a live demo of the platform', es: 'Vea una demostración en vivo' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'organizations',
  },
  '/pricing': {
    path: '/pricing',
    label: { en: 'Pricing', es: 'Precios' },
    plainLanguageLabel: { en: 'Plans and pricing', es: 'Planes y precios' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showLegalAidEscalation: true,
    riskLevel: 'low',
  },
  '/checkout': {
    path: '/checkout',
    label: { en: 'Checkout', es: 'Pago' },
    plainLanguageLabel: { en: 'Complete your purchase', es: 'Completa tu compra' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'medium',
  },
  '/case-predictor': {
    path: '/case-predictor',
    label: { en: 'Case Predictor', es: 'Predictor de Casos' },
    plainLanguageLabel: { en: 'Estimate possible outcomes for your situation', es: 'Estima resultados posibles para tu situación' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en'],
    showScopeDisclaimer: true,
    showEmergencyBanner: true,
    riskLevel: 'high',
    hideFromFirstTimeUsers: true,
  },
  '/negotiate': {
    path: '/negotiate',
    label: { en: 'Negotiation Planner', es: 'Planificador de Negociación' },
    plainLanguageLabel: { en: 'Build a strategy for disputes', es: 'Crea una estrategia para disputas' },
    audience: ['individual', 'business'],
    requiresAuth: false,
    availableLanguages: ['en'],
    showScopeDisclaimer: true,
    riskLevel: 'high',
    navGroup: 'business',
    hideFromFirstTimeUsers: true,
  },
  '/toolkit': {
    path: '/toolkit',
    label: { en: 'Toolkit', es: 'Herramientas' },
    plainLanguageLabel: { en: 'Templates, checklists, and business tools', es: 'Plantillas, listas y herramientas' },
    audience: ['business'],
    requiresAuth: false,
    availableLanguages: ['en'],
    showScopeDisclaimer: true,
    riskLevel: 'medium',
    navGroup: 'business',
    hideFromFirstTimeUsers: true,
  },
  '/safety-net': {
    path: '/safety-net',
    label: { en: 'Legal Safety Net', es: 'Red de Seguridad Legal' },
    plainLanguageLabel: { en: 'Monthly legal checkups and monitoring', es: 'Revisiones legales mensuales y monitoreo' },
    audience: ['individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/pro-bono': {
    path: '/pro-bono',
    label: { en: 'Pro Bono Intake', es: 'Admisión Pro Bono' },
    plainLanguageLabel: { en: 'Apply for free legal assistance', es: 'Solicitar asistencia legal gratuita' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/ezreads': {
    path: '/ezreads',
    label: { en: 'Legal Guides', es: 'Guías Legales' },
    plainLanguageLabel: { en: 'Plain-language articles about common legal issues', es: 'Artículos en lenguaje simple sobre problemas legales comunes' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/how-it-works': {
    path: '/how-it-works',
    label: { en: 'How It Works', es: 'Cómo Funciona' },
    plainLanguageLabel: { en: 'How ezLegal.ai helps you', es: 'Cómo ezLegal.ai te ayuda' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/about': {
    path: '/about',
    label: { en: 'About', es: 'Acerca de' },
    plainLanguageLabel: { en: 'Our mission and team', es: 'Nuestra misión y equipo' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/trust-center': {
    path: '/trust-center',
    label: { en: 'Trust Center', es: 'Centro de Confianza' },
    plainLanguageLabel: { en: 'Privacy, security, and AI governance', es: 'Privacidad, seguridad y gobernanza de IA' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/scope-disclaimers': {
    path: '/scope-disclaimers',
    label: { en: 'Scope & Disclaimers', es: 'Alcance y Avisos' },
    plainLanguageLabel: { en: 'What this tool does and does not do', es: 'Lo que esta herramienta hace y no hace' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/privacy-at-a-glance': {
    path: '/privacy-at-a-glance',
    label: { en: 'Privacy at a Glance', es: 'Privacidad en Resumen' },
    plainLanguageLabel: { en: 'How your data is used', es: 'Cómo se usan tus datos' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/ai-governance': {
    path: '/ai-governance',
    label: { en: 'AI Governance', es: 'Gobernanza de IA' },
    plainLanguageLabel: { en: 'How we build, test, and monitor AI', es: 'Cómo construimos, probamos y monitoreamos la IA' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en'],
    riskLevel: 'low',
    navGroup: 'trust',
  },
  '/report': {
    path: '/report',
    label: { en: 'Report', es: 'Informe' },
    plainLanguageLabel: { en: 'View your legal report', es: 'Ver tu informe legal' },
    audience: ['individual', 'business'],
    requiresAuth: true,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'medium',
  },
  '/ask': {
    path: '/ask',
    label: { en: 'Ask', es: 'Preguntar' },
    plainLanguageLabel: { en: 'Ask a legal question', es: 'Haz una pregunta legal' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    showEmergencyBanner: true,
    riskLevel: 'medium',
    navGroup: 'get-help',
  },
  '/dashboard': {
    path: '/dashboard',
    label: { en: 'Dashboard', es: 'Panel' },
    plainLanguageLabel: { en: 'Your workspace and action plan', es: 'Tu espacio de trabajo y plan de acción' },
    audience: ['general'],
    requiresAuth: true,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'account',
  },
  '/login': {
    path: '/login',
    label: { en: 'Log In', es: 'Iniciar Sesión' },
    plainLanguageLabel: { en: 'Sign in to your account', es: 'Inicia sesión en tu cuenta' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'account',
  },
  '/signup': {
    path: '/signup',
    label: { en: 'Sign Up', es: 'Registrarse' },
    plainLanguageLabel: { en: 'Create an account', es: 'Crea una cuenta' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'account',
  },
  '/contact': {
    path: '/contact',
    label: { en: 'Contact', es: 'Contacto' },
    plainLanguageLabel: { en: 'Get in touch', es: 'Contáctanos' },
    audience: ['general'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'learn',
  },
  '/urgent-resources': {
    path: '/urgent-resources',
    label: { en: 'Urgent Resources', es: 'Recursos Urgentes' },
    plainLanguageLabel: { en: 'Help for deadlines, danger, or emergencies', es: 'Ayuda para plazos, peligro o emergencias' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showEmergencyBanner: true,
    showScopeDisclaimer: true,
    showLegalAidEscalation: true,
    riskLevel: 'high',
    navGroup: 'get-help',
  },
  '/individuals': {
    path: '/individuals',
    label: { en: 'For Individuals', es: 'Para Personas' },
    plainLanguageLabel: { en: 'Legal help for yourself or your family', es: 'Ayuda legal para ti o tu familia' },
    audience: ['individual', 'spanish-individual'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showLegalAidEscalation: true,
    riskLevel: 'low',
    navGroup: 'get-help',
  },
  '/business': {
    path: '/business',
    label: { en: 'For Business', es: 'Para Negocios' },
    plainLanguageLabel: { en: 'Practical legal workflows for small businesses', es: 'Flujos legales prácticos para pequeñas empresas' },
    audience: ['business'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    showScopeDisclaimer: true,
    riskLevel: 'low',
    navGroup: 'business',
  },
  '/partners': {
    path: '/partners',
    label: { en: 'For Partners', es: 'Para Socios' },
    plainLanguageLabel: { en: 'Intake and triage tools for legal aid organizations', es: 'Herramientas de admisión y triaje para organizaciones' },
    audience: ['legal-aid', 'attorney-partner'],
    requiresAuth: false,
    availableLanguages: ['en', 'es'],
    riskLevel: 'low',
    navGroup: 'organizations',
  },
};

export function getRouteMeta(path: string): AppRouteMeta | undefined {
  return APP_ROUTE_META[path];
}

export function getRoutesByNavGroup(group: NavGroup): AppRouteMeta[] {
  return Object.values(APP_ROUTE_META).filter((r) => r.navGroup === group);
}

export function getRoutesByAudience(audience: RouteAudience): AppRouteMeta[] {
  return Object.values(APP_ROUTE_META).filter((r) => r.audience.includes(audience));
}

export function shouldShowDisclaimer(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.showScopeDisclaimer === true;
}

export function shouldShowEmergencyBanner(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.showEmergencyBanner === true;
}

export function shouldShowLegalAidEscalation(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.showLegalAidEscalation === true;
}

export function isHighRiskRoute(path: string): boolean {
  const meta = APP_ROUTE_META[path];
  return meta?.riskLevel === 'high';
}

export function routeSupportsLanguage(path: string, lang: 'en' | 'es'): boolean {
  const meta = APP_ROUTE_META[path];
  if (!meta) return true;
  return meta.availableLanguages.includes(lang);
}

```

---

## src/lib/routes.ts

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRICING: '/pricing',
  CHECKOUT: '/checkout',
  CONTACT: '/contact',
  FEATURES: '/features',
  ABOUT: '/about',
  EZREADS: '/ezreads',
  PRO_BONO: '/pro-bono',
  EMERGENCY_RESOURCES: '/emergency-resources',
  FOR_ORGANIZATIONS: '/for-organizations',
  FOR_BUSINESS: '/for-business',
  FOR_INDIVIDUALS: '/for-individuals',
  FOR_PARTNERS: '/for-partners',
  SHARE_PERSPECTIVE: '/share-perspective',
  SCOPE_DISCLAIMERS: '/scope-disclaimers',
  SCHEDULE_DEMO: '/schedule-demo',
  LSO_DASHBOARD: '/lso-dashboard',
  GRANT_REPORTING: '/grant-reporting',
  AI_GOVERNANCE: '/ai-governance',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  TRUST_CENTER: '/trust-center',
  ENTERPRISE_SECURITY: '/enterprise-security',
  HOW_IT_WORKS: '/how-it-works',
  PARTNER_HUB: '/partner-hub',
  MEDIA_KIT: '/media-kit',
  HOW_REPORTS_REVIEWED: '/how-reports-are-reviewed',
  ESPANOL: '/espanol',
  ACCESSIBILITY: '/accessibility',
  ACCESS_GATE: '/access',
  NEGOTIATE: '/negotiate',
  SITE_REVIEW: '/site-review',
  SLA: '/sla',
  FIND_ATTORNEY: '/find-attorney',
  ASK: '/ask',
  ISSUE_PACKS: '/issue-packs',
  CASE_PREDICTOR: '/case-predictor',
  CASE_PREDICTOR_START: '/case-predictor/start',
  CHATBOT: '/chatbot',
  CHATBOT_STANDALONE: '/chatbot-standalone',
  FOR_STARTUPS: '/for-startups',
  FOR_LAW_FIRMS: '/for-law-firms',
  FOR_IN_HOUSE: '/for-in-house',
  LEGAL_READINESS_CHECKLIST: '/resources/legal-readiness-checklist',
  DASHBOARD: '/dashboard',
  DASHBOARD_AI_ASSISTANT: '/dashboard/ai-assistant',
  DASHBOARD_CASES: '/dashboard/cases',
  DASHBOARD_MATTERS: '/dashboard/matters',
  DASHBOARD_CLIENTS: '/dashboard/clients',
  DASHBOARD_HISTORY: '/dashboard/history',
  DASHBOARD_DOCUMENTS: '/dashboard/documents',
  DASHBOARD_RESEARCH: '/dashboard/research',
  DASHBOARD_LAWYER_PROFILES: '/dashboard/lawyer-profiles',
  DASHBOARD_PROFILE: '/dashboard/profile',
  DASHBOARD_WEBSITE_INTEGRATION: '/dashboard/website-integration',
  ADMIN: '/admin',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

const REDIRECT_MAP: Record<string, string> = {
  '/ez-reads': ROUTES.EZREADS,
  '/terms-of-service': ROUTES.TERMS,
  '/privacy-policy': ROUTES.PRIVACY,
  '/trust-safety': ROUTES.TRUST_CENTER,
  '/app': '/chat',
  '/chatbot': '/chat',
  '/chat-v2': '/chat',
  '/chatbot-standalone': '/chat',
};

const DYNAMIC_PATTERNS = [
  /^\/ask\/[a-z-]+$/,
  /^\/p\/[a-z0-9-]+$/,
  /^\/admin\/.+$/,
  /^\/dashboard\/.+$/,
];

const ALL_STATIC_ROUTES = new Set([
  ...Object.values(ROUTES),
  ...Object.keys(REDIRECT_MAP),
  '/welcome',
]);

export function isValidRoute(path: string): boolean {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (ALL_STATIC_ROUTES.has(cleanPath)) return true;
  return DYNAMIC_PATTERNS.some((p) => p.test(cleanPath));
}

export function getRedirectTarget(path: string): string | null {
  return REDIRECT_MAP[path] || null;
}

export function askTopicRoute(topic: string): string {
  return `${ROUTES.ASK}/${topic}`;
}

export function issuePacksRoute(topic?: string): string {
  return topic ? `${ROUTES.ISSUE_PACKS}?topic=${topic}` : ROUTES.ISSUE_PACKS;
}

export function signupRoute(plan?: string, trial?: number): string {
  const params = new URLSearchParams();
  if (plan) params.set('plan', plan);
  if (trial) params.set('trial', String(trial));
  const qs = params.toString();
  return qs ? `${ROUTES.SIGNUP}?${qs}` : ROUTES.SIGNUP;
}

export function chatbotRoute(query?: string): string {
  if (!query) return '/chat';
  return `/chat?q=${encodeURIComponent(query)}`;
}

export function checkoutRoute(plan: string): string {
  return `${ROUTES.CHECKOUT}?plan=${plan}`;
}

```

---

## src/lib/navigation.ts

```typescript
import { supabase } from './supabase';

export interface NavGroup {
  id: string;
  slug: string;
  label_en: string;
  label_es: string;
  sort_order: number;
  audiences: string[];
  items: NavItem[];
}

export interface NavItem {
  id: string;
  group_id: string | null;
  slug: string;
  route: string;
  icon: string;
  label_en: string;
  label_es: string;
  description_en: string;
  description_es: string;
  breadcrumb_label_en: string;
  breadcrumb_label_es: string;
  sort_order: number;
  is_primary: boolean;
  is_bottom_nav: boolean;
  is_cta: boolean;
  highlight: boolean;
  audiences: string[];
}

const FALLBACK_GROUPS: NavGroup[] = [
  {
    id: 'fallback-individuals', slug: 'individuals', label_en: 'For Individuals', label_es: 'Para Personas', sort_order: 1, audiences: ['individual'],
    items: [
      { id: 'f-individuals', group_id: 'fallback-individuals', slug: 'individuals', route: '/for-individuals', icon: 'User', label_en: 'For Individuals', label_es: 'Para Personas', description_en: 'Understand your rights, prepare documents, find help', description_es: 'Entiende tus derechos, prepara documentos, encuentra ayuda', breadcrumb_label_en: 'Individuals', breadcrumb_label_es: 'Personas', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-start', group_id: 'fallback-individuals', slug: 'start', route: '/start', icon: 'Sparkles', label_en: 'Start with 3 Questions', label_es: 'Empieza con 3 Preguntas', description_en: 'Answer 3 questions, get your next steps', description_es: 'Responde 3 preguntas, obt\u00e9n tus pr\u00f3ximos pasos', breadcrumb_label_en: 'Start', breadcrumb_label_es: 'Empezar', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-emergency', group_id: 'fallback-individuals', slug: 'emergency', route: '/emergency-resources', icon: 'AlertTriangle', label_en: 'Urgent / Safety', label_es: 'Urgente / Seguridad', description_en: 'Immediate help for danger or deadlines', description_es: 'Ayuda inmediata para peligro o plazos', breadcrumb_label_en: 'Emergency', breadcrumb_label_es: 'Emergencia', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: true, audiences: [] },
    ],
  },
  {
    id: 'fallback-business', slug: 'business', label_en: 'For Business', label_es: 'Para Negocios', sort_order: 2, audiences: ['smb'],
    items: [
      { id: 'f-business', group_id: 'fallback-business', slug: 'business', route: '/for-business', icon: 'Building2', label_en: 'For Business', label_es: 'Para Negocios', description_en: 'Contracts, compliance, and everyday legal questions', description_es: 'Contratos, cumplimiento y preguntas legales cotidianas', breadcrumb_label_en: 'Business', breadcrumb_label_es: 'Negocios', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-toolkit', group_id: 'fallback-business', slug: 'toolkit', route: '/toolkit', icon: 'Wrench', label_en: 'Business Toolkit', label_es: 'Kit de Herramientas', description_en: 'Templates, checklists, and tools', description_es: 'Plantillas, listas y herramientas', breadcrumb_label_en: 'Toolkit', breadcrumb_label_es: 'Herramientas', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-negotiate', group_id: 'fallback-business', slug: 'negotiate', route: '/negotiate', icon: 'Scale', label_en: 'Negotiation Planner', label_es: 'Planificador de Negociaci\u00f3n', description_en: 'Build a strategy for disputes', description_es: 'Crea una estrategia para disputas', breadcrumb_label_en: 'Negotiate', breadcrumb_label_es: 'Negociar', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-orgs', slug: 'organizations', label_en: 'For Organizations', label_es: 'Para Organizaciones', sort_order: 3, audiences: ['org'],
    items: [
      { id: 'f-orgs', group_id: 'fallback-orgs', slug: 'organizations', route: '/for-organizations', icon: 'Users', label_en: 'For Organizations', label_es: 'Para Organizaciones', description_en: 'Intake, triage, and referral tools for your team', description_es: 'Herramientas de intake, triaje y referencia para su equipo', breadcrumb_label_en: 'Organizations', breadcrumb_label_es: 'Organizaciones', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-partner-hub', group_id: 'fallback-orgs', slug: 'partner-hub', route: '/partner-hub', icon: 'Heart', label_en: 'Partner Hub', label_es: 'Centro de Socios', description_en: 'Manage your partnership', description_es: 'Administra tu asociaci\u00f3n', breadcrumb_label_en: 'Partners', breadcrumb_label_es: 'Socios', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-ai-governance', group_id: 'fallback-orgs', slug: 'ai-governance', route: '/ai-governance', icon: 'Shield', label_en: 'AI Governance', label_es: 'Gobernanza de IA', description_en: 'Transparency, bias monitoring, impact assessments', description_es: 'Transparencia, monitoreo de sesgo, evaluaciones de impacto', breadcrumb_label_en: 'AI Governance', breadcrumb_label_es: 'Gobernanza IA', sort_order: 3, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-pricing', slug: 'pricing', label_en: 'Pricing', label_es: 'Precios', sort_order: 4, audiences: [],
    items: [
      { id: 'f-pricing', group_id: 'fallback-pricing', slug: 'pricing', route: '/pricing', icon: 'CreditCard', label_en: 'Pricing', label_es: 'Precios', description_en: 'Plans and pricing', description_es: 'Planes y precios', breadcrumb_label_en: 'Pricing', breadcrumb_label_es: 'Precios', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
  {
    id: 'fallback-trust', slug: 'trust', label_en: 'Trust Center', label_es: 'Centro de Confianza', sort_order: 5, audiences: [],
    items: [
      { id: 'f-trust', group_id: 'fallback-trust', slug: 'trust-center', route: '/trust-center', icon: 'Shield', label_en: 'Trust Center', label_es: 'Centro de Confianza', description_en: 'Privacy, security, and AI governance', description_es: 'Privacidad, seguridad y gobernanza de IA', breadcrumb_label_en: 'Trust', breadcrumb_label_es: 'Confianza', sort_order: 1, is_primary: true, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
      { id: 'f-scope', group_id: 'fallback-trust', slug: 'scope', route: '/scope-disclaimers', icon: 'Info', label_en: 'Scope & Disclaimers', label_es: 'Alcance y Avisos', description_en: 'What this tool does and does not do', description_es: 'Lo que esta herramienta hace y no hace', breadcrumb_label_en: 'Scope', breadcrumb_label_es: 'Alcance', sort_order: 2, is_primary: false, is_bottom_nav: false, is_cta: false, highlight: false, audiences: [] },
    ],
  },
];

const NAV_CACHE_KEY = 'ezlegal_nav_cache';

function getCachedNav(): NavGroup[] | null {
  try {
    const raw = sessionStorage.getItem(NAV_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > 5 * 60 * 1000) return null;
    return data;
  } catch {
    return null;
  }
}

function setCachedNav(groups: NavGroup[]): void {
  try {
    sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify({ data: groups, ts: Date.now() }));
  } catch {}
}

export async function fetchNavigation(): Promise<NavGroup[]> {
  const cached = getCachedNav();
  if (cached) return cached;

  const [groupsRes, itemsRes] = await Promise.all([
    supabase.from('navigation_groups').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('navigation_items').select('*').eq('is_active', true).order('sort_order'),
  ]);
  const groups = (groupsRes.data ?? []) as Omit<NavGroup, 'items'>[];
  const items = (itemsRes.data ?? []) as NavItem[];

  if (groups.length === 0) return FALLBACK_GROUPS;

  const result = groups.map((g) => ({ ...g, items: items.filter((i) => i.group_id === g.id) }));
  setCachedNav(result);
  return result;
}

export async function fetchBottomNavItems(): Promise<NavItem[]> {
  const { data } = await supabase
    .from('navigation_items')
    .select('*')
    .eq('is_active', true)
    .eq('is_bottom_nav', true)
    .order('sort_order');
  return (data ?? []) as NavItem[];
}

/**
 * Consolidates four legacy top-level groups (Get Help, Solutions, Resources, Trust)
 * into three action-first groups. Deterministic, pure function — safe to call in render.
 *
 *  - "get-help"    → Action-first entry points (keeps Get Help + urgent routes)
 *  - "why-ezlegal" → Merges Solutions + Resources + Trust behind one hub
 *  - "pricing"     → Pricing group preserved as-is
 *
 * Any group not matching these three slugs is passed through so DB-configured
 * extras continue to render while content teams migrate.
 */
export function consolidateNavGroups(groups: NavGroup[]): NavGroup[] {
  const bySlug = new Map(groups.map((g) => [g.slug, g]));
  const get = (slug: string) => bySlug.get(slug);

  const getHelp = get('get-help');
  const solutions = get('solutions');
  const resources = get('resources');
  const trust = get('trust');
  const pricing = get('pricing');

  const consolidated: NavGroup[] = [];

  if (getHelp) consolidated.push(getHelp);

  if (solutions || resources || trust) {
    const merged: NavGroup = {
      id: solutions?.id ?? resources?.id ?? trust?.id ?? 'why-ezlegal',
      slug: 'why-ezlegal',
      label_en: 'Why ezLegal',
      label_es: '¿Por qué ezLegal?',
      sort_order: solutions?.sort_order ?? 2,
      audiences: [],
      items: [
        ...(solutions?.items ?? []),
        ...(resources?.items ?? []),
        ...(trust?.items ?? []),
      ],
    };
    consolidated.push(merged);
  }

  if (pricing) consolidated.push(pricing);

  const known = new Set(['get-help', 'solutions', 'resources', 'trust', 'pricing']);
  for (const g of groups) {
    if (!known.has(g.slug)) consolidated.push(g);
  }

  return consolidated;
}

export async function fetchRouteLabels(): Promise<Map<string, { en: string; es: string }>> {
  const { data } = await supabase
    .from('navigation_items')
    .select('route, breadcrumb_label_en, breadcrumb_label_es')
    .eq('is_active', true);
  const map = new Map<string, { en: string; es: string }>();
  for (const r of data ?? []) {
    map.set(r.route, {
      en: r.breadcrumb_label_en || r.route,
      es: r.breadcrumb_label_es || r.breadcrumb_label_en || r.route,
    });
  }
  return map;
}

```

---

## src/lib/dynamic-imports.ts

```typescript
export async function loadJsPDF() {
  const { default: jsPDF } = await import('jspdf');
  return jsPDF;
}

export async function loadHtml2Canvas() {
  const { default: html2canvas } = await import('html2canvas');
  return html2canvas;
}

export async function loadTesseract() {
  const Tesseract = await import('tesseract.js');
  return Tesseract;
}

export async function loadQRCode() {
  const QRCode = await import('qrcode');
  return QRCode.default;
}

let jsPDFCache: any = null;
let html2CanvasCache: any = null;
let tesseractCache: any = null;
let qrCodeCache: any = null;

export async function getJsPDF() {
  if (!jsPDFCache) {
    jsPDFCache = await loadJsPDF();
  }
  return jsPDFCache;
}

export async function getHtml2Canvas() {
  if (!html2CanvasCache) {
    html2CanvasCache = await loadHtml2Canvas();
  }
  return html2CanvasCache;
}

export async function getTesseract() {
  if (!tesseractCache) {
    tesseractCache = await loadTesseract();
  }
  return tesseractCache;
}

export async function getQRCode() {
  if (!qrCodeCache) {
    qrCodeCache = await loadQRCode();
  }
  return qrCodeCache;
}

```

---

