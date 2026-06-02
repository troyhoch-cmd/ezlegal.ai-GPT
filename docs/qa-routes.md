# QA Route Map

All routes tested in the QA harness, mapped to their source components.

## Critical Public Routes (Smoke Tested)

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Home.tsx | Landing page, Spanish-first |
| `/login` | Login.tsx | Authentication |
| `/signup` | Signup.tsx | Registration |
| `/pricing` | Pricing.tsx | Plan comparison |
| `/about` | About.tsx | Company info |
| `/features` | Features.tsx | Product features |
| `/how-it-works` | HowItWorks.tsx | Product explanation |
| `/contact` | Contact.tsx | Contact form |
| `/trust-center` | TrustCenter.tsx | Security/privacy info |
| `/privacy` | PrivacyPolicy.tsx | Privacy policy |
| `/terms` | TermsOfService.tsx | Terms of service |
| `/emergency-resources` | EmergencyResources.tsx | Crisis hotlines |
| `/espanol` | EspanolLanding.tsx | Spanish landing page |
| `/ask` | Ask.tsx | Legal Q&A entry point |
| `/ezreads` | EZReads.tsx | Legal education articles |
| `/negotiate` | Negotiate.tsx | Negotiation tools |
| `/for-individuals` | ForIndividuals.tsx | Individual users |
| `/for-business` | ForBusiness.tsx | Business users |
| `/accessibility` | AccessibilityStatement.tsx | A11y statement |
| `/scope-disclaimers` | ScopeDisclaimers.tsx | Legal scope limits |

## Authenticated Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/chat` | ChatV2.tsx | Main chat interface |
| `/start` | PersonaIntake.tsx | Onboarding persona selection |
| `/dashboard` | Dashboard.tsx | User dashboard |
| `/dashboard/profile` | Profile.tsx | User settings |
| `/dashboard/documents` | Documents.tsx | Document vault |
| `/dashboard/history` | History.tsx | Chat history |
| `/dashboard/billing` | Billing.tsx | Subscription management |
| `/safety-net` | LegalSafetyNet.tsx | Safety net features |

## Admin Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | Admin.tsx | Admin panel |

## Deprecated Redirects

| Old Route | Redirects To |
|-----------|-------------|
| `/ez-reads` | `/ezreads` |
| `/terms-of-service` | `/terms` |
| `/privacy-policy` | `/privacy` |
| `/trust-safety` | `/trust-center` |
| `/chatbot` | `/chat` |
| `/chat-v2` | `/chat` |
| `/app` | `/chat` |
| `/billing` | `/dashboard/billing` |

## Data Test IDs

| Selector | Location | Purpose |
|----------|----------|---------|
| `[data-testid="primary-cta"]` | Home.tsx | Main CTA button |
| `[data-testid="language-toggle"]` | LocalePicker.tsx | Language selector |
| `[data-testid="legal-disclaimer"]` | Footer.tsx | Legal disclaimer text |
| `[data-testid="intake-form"]` | TriageIntake.tsx | Intake form container |
| `[data-testid="jurisdiction-input"]` | ChatV2.tsx | Jurisdiction picker |
| `[data-testid="issue-description"]` | ChatV2.tsx | Chat textarea |
| `[data-testid="submit-intake"]` | ChatV2.tsx | Send/submit button |
| `[data-testid="field-error"]` | ValidatedFormField.tsx | Form validation error |
| `[data-testid="ai-answer"]` | ChatV2.tsx | AI response container |
| `[data-testid="sources-panel"]` | TabbedResponse.tsx | Sources tab panel |
| `[data-testid="human-help-link"]` | ChatV2.tsx | Link to lawyer profiles |

## Viewport Breakpoints Tested

- 360px (Galaxy S21)
- 375px (iPhone SE)
- 390px (iPhone 14)
- 402px (iPhone 17)
- 768px (iPad)
- 1024px (Desktop SM)
- 1280px (Desktop MD)
- 1440px (Desktop LG)

## Running Tests

```bash
# Full QA suite (build + security + e2e)
npm run qa

# Individual suites
npm run qa:security         # Secret scanning
npm run qa:e2e:smoke        # Route smoke tests
npm run qa:e2e:responsive   # Overflow/viewport tests
npm run qa:e2e:spanish      # Spanish-first flow
npm run qa:e2e:safety       # Legal/safety contracts
npm run qa:e2e:a11y         # Accessibility (axe-core)
```
