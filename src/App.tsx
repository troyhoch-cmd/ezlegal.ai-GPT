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
const QAEvidence = lazy(() => import('./pages/QAEvidence'));
const BenchmarkEvidence = lazy(() => import('./pages/BenchmarkEvidence'));

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
                  <Route path="/qa-evidence" element={<QAEvidence />} />
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
                    <Route path="benchmark-evidence" element={<BenchmarkEvidence />} />
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
