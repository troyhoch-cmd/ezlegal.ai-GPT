import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Shield, HelpCircle, Globe, ArrowRight, Zap } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import PricingCard from '../components/pricing/PricingCard';
import PricingTrustStrip from '../components/pricing/PricingTrustStrip';
import HelpMeChoose from '../components/pricing/HelpMeChoose';
import PricingFAQ from '../components/pricing/PricingFAQ';
import MarketplaceSection from '../components/pricing/MarketplaceSection';
import ComparisonTable from '../components/pricing/ComparisonTable';
import AccessToJusticeCard from '../components/trust/AccessToJusticeCard';
import { pricingAudiences } from '../data/pricing';
import { fetchPricingTiers, type PricingResult } from '../services/pricingService';
import { isTwoMonthsFree } from '../lib/pricingMath';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEngagement } from '../services/engagement-service';
import { trackEvent } from '../services/analytics-service';

type AudienceId = 'individuals' | 'business' | 'legal-aid';
type BillingCycle = 'monthly' | 'annual';

const TAB_IDS: AudienceId[] = ['individuals', 'business', 'legal-aid'];

export default function Pricing() {
  const { language } = useLanguage();
  const l = language === 'es' ? 'es' : 'en';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('audience') as AudienceId) || 'individuals';
  const [activeTab, setActiveTab] = useState<AudienceId>(TAB_IDS.includes(initialTab) ? initialTab : 'individuals');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [showWizard, setShowWizard] = useState(false);
  const [pricingData, setPricingData] = useState<PricingResult>({ audiences: pricingAudiences, source: 'static_fallback' });

  useEffect(() => {
    fetchPricingTiers().then(setPricingData);
  }, []);

  useEffect(() => {
    const param = searchParams.get('audience') as AudienceId;
    if (param && TAB_IDS.includes(param) && param !== activeTab) {
      setActiveTab(param);
    }
  }, [searchParams]);

  const handleTabChange = (id: AudienceId) => {
    setActiveTab(id);
    setSearchParams({ audience: id });
    trackEvent('pricing_tab_selected', { tab: id });
    trackEngagement({
      featureName: 'pricing_tab_selected',
      engagementType: 'click',
      metadata: { tab: id },
    });
  };

  const handleBillingToggle = (cycle: BillingCycle) => {
    setBillingCycle(cycle);
    trackEvent('pricing_billing_toggle', { cycle });
  };

  const currentAudience = pricingData.audiences.find((a) => a.id === activeTab) ?? pricingData.audiences[0];
  const mainPlans = currentAudience.plans.filter((p) => !p.isAddOn);
  const addOnPlans = currentAudience.plans.filter((p) => p.isAddOn);
  const hasAnnualPlans = mainPlans.some((p) => p.annualPriceDisplay);
  const showTwoMonthsFree = hasAnnualPlans && mainPlans.some((p) => isTwoMonthsFree(p.monthlyPrice, p.annualPrice));

  const gridCols = mainPlans.length >= 4
    ? 'sm:grid-cols-2 lg:grid-cols-4'
    : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content" className="pt-16">
        {/* Hero */}
        <section className="pt-6 pb-4 sm:pt-8 sm:pb-5 bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2 leading-tight">
              {l === 'es'
                ? 'Comienza gratis. Mejora solo cuando necesites más ayuda.'
                : 'Start free. Upgrade only when you need more help.'
              }
            </h1>
            <p className="text-sm sm:text-base text-navy-600 max-w-xl mx-auto mb-2">
              {l === 'es'
                ? 'Haz preguntas legales, entiende documentos y prepara próximos pasos en inglés o español.'
                : 'Ask legal questions, understand documents, and prepare next steps in English or Spanish.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <p className="inline-flex items-center gap-1.5 text-xs text-navy-500">
                <Shield className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                {l === 'es'
                  ? 'Enlaces de ayuda urgente gratis. Respuestas claras. No es asesoría legal.'
                  : 'Free urgent-help links. Plain-language answers. Not legal advice.'
                }
              </p>
              <p className="inline-flex items-center gap-1.5 text-xs text-navy-500">
                <Globe className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" aria-hidden="true" />
                {l === 'es'
                  ? 'Disponible en inglés y español'
                  : 'Available in English and Spanish / Disponible en inglés y español'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Trust strip below hero */}
        <PricingTrustStrip language={l} />

        {/* Tabs + Cards */}
        <section className="py-6 sm:py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {import.meta.env.DEV && pricingData.source === 'static_fallback' && (
              <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-xs text-amber-700 font-medium">Using static pricing fallback.</p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex flex-col items-center gap-2 mb-5">
              <div
                className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200"
                role="tablist"
                aria-label={l === 'es' ? 'Tipo de audiencia' : 'Audience type'}
                onKeyDown={(e) => {
                  const idx = TAB_IDS.indexOf(activeTab);
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const next = e.key === 'ArrowRight'
                      ? TAB_IDS[(idx + 1) % TAB_IDS.length]
                      : TAB_IDS[(idx - 1 + TAB_IDS.length) % TAB_IDS.length];
                    handleTabChange(next);
                    (e.currentTarget.querySelector(`[aria-controls="tabpanel-${next}"]`) as HTMLElement)?.focus();
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    handleTabChange(TAB_IDS[0]);
                    (e.currentTarget.querySelector(`[aria-controls="tabpanel-${TAB_IDS[0]}"]`) as HTMLElement)?.focus();
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    handleTabChange(TAB_IDS[TAB_IDS.length - 1]);
                    (e.currentTarget.querySelector(`[aria-controls="tabpanel-${TAB_IDS[TAB_IDS.length - 1]}"]`) as HTMLElement)?.focus();
                  }
                }}
              >
                {pricingData.audiences.map((aud) => (
                  <button
                    key={aud.id}
                    role="tab"
                    id={`tab-${aud.id}`}
                    aria-selected={activeTab === aud.id}
                    aria-controls={`tabpanel-${aud.id}`}
                    tabIndex={activeTab === aud.id ? 0 : -1}
                    onClick={() => handleTabChange(aud.id)}
                    className={`px-4 sm:px-5 py-2 text-sm font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 ${
                      activeTab === aud.id
                        ? 'bg-white text-navy-900 shadow-sm'
                        : 'text-navy-500 hover:text-navy-700'
                    }`}
                  >
                    {aud.label[l]}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowWizard(true);
                  document.getElementById('help-me-choose')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-navy-400 hover:text-teal-600 transition-colors"
              >
                {l === 'es' ? '¿No estás seguro? Ayúdame a elegir.' : 'Not sure? Help me choose.'}
              </button>
            </div>

            {/* Billing cycle toggle */}
            {hasAnnualPlans && (
              <div
                className="flex items-center justify-center gap-3 mb-6"
                role="radiogroup"
                aria-label={l === 'es' ? 'Ciclo de facturación' : 'Billing cycle'}
              >
                <button
                  role="radio"
                  aria-checked={billingCycle === 'monthly'}
                  onClick={() => handleBillingToggle('monthly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    billingCycle === 'monthly'
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-navy-500 hover:text-navy-700'
                  }`}
                >
                  {l === 'es' ? 'Mensual' : 'Monthly'}
                </button>
                <button
                  role="radio"
                  aria-checked={billingCycle === 'annual'}
                  onClick={() => handleBillingToggle('annual')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    billingCycle === 'annual'
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-navy-500 hover:text-navy-700'
                  }`}
                >
                  {l === 'es' ? 'Anual' : 'Annual'}
                </button>
                {billingCycle === 'annual' && showTwoMonthsFree && (
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded-full">
                    {l === 'es' ? '2 meses gratis' : '2 months free'}
                  </span>
                )}
              </div>
            )}

            {/* Audience headline + subline */}
            <div className="text-center mb-6">
              <p className="text-sm font-medium text-navy-700">{currentAudience.headline[l]}</p>
              {currentAudience.subline && (
                <p className="text-xs text-navy-500 mt-1 max-w-lg mx-auto">{currentAudience.subline[l]}</p>
              )}
            </div>

            {/* Main plan cards */}
            <div
              className={`grid gap-4 ${gridCols}`}
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {mainPlans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} language={l} billingCycle={billingCycle} />
              ))}
            </div>

            {/* Paid plan disclaimer */}
            {mainPlans.some((p) => p.commerceModel === 'self_serve_subscription') && (
              <div className="mt-4 max-w-2xl mx-auto text-center">
                <p className="text-[11px] text-navy-500 leading-relaxed">
                  {l === 'es'
                    ? 'Información legal, no asesoría legal. Revisión de abogado opcional a menos que se contrate por separado. Garantía de reembolso de 7 días en suscripciones nuevas.'
                    : 'Legal information, not legal advice. Attorney review optional unless separately engaged. 7-day refund guarantee on new subscriptions.'}
                </p>
              </div>
            )}

            {/* Access to justice card for individuals */}
            {activeTab === 'individuals' && (
              <div className="mt-6 max-w-lg mx-auto">
                <AccessToJusticeCard variant="compact" />
              </div>
            )}

            {/* Organization quick-access paths */}
            {activeTab === 'legal-aid' && (
              <div className="mt-6 max-w-2xl mx-auto">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Link
                    to="/schedule-demo"
                    className="flex items-center gap-2 px-4 py-3 bg-teal-50 border border-teal-200 rounded-xl text-sm font-medium text-teal-800 hover:bg-teal-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {l === 'es' ? 'Solicitar demo' : 'Schedule a demo'}
                  </Link>
                  <Link
                    to="/for-organizations"
                    className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {l === 'es' ? 'Portal de socios' : 'Partner hub'}
                  </Link>
                  <Link
                    to="/ai-governance"
                    className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    {l === 'es' ? 'Gobernanza y seguridad' : 'Governance & security'}
                  </Link>
                  <Link
                    to="/grant-reporting"
                    className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {l === 'es' ? 'Reportes de subvenciones' : 'Grant reporting'}
                  </Link>
                </div>
              </div>
            )}

            {/* Add-on cards (Boost) */}
            {addOnPlans.length > 0 && (
              <div className="mt-6 max-w-lg mx-auto">
                {addOnPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                        <Zap className="w-4 h-4 text-amber-700" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-navy-900">
                          {plan.name[l]} — {plan.priceDisplay[l]} {plan.priceNote && <span className="font-normal text-navy-500">{plan.priceNote[l]}</span>}
                        </p>
                        <p className="text-xs text-navy-600 mt-0.5">{plan.description[l]}</p>
                      </div>
                    </div>
                    <Link
                      to={plan.ctaHref}
                      onClick={() => {
                        trackEngagement({
                          featureName: 'pricing_plan_cta_clicked',
                          engagementType: 'click',
                          metadata: { planId: plan.id, audience: plan.audience },
                        });
                      }}
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-navy-900 bg-white border border-navy-300 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {plan.ctaLabel[l]}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            {/* Help Me Choose trigger */}
            <div id="help-me-choose" className="mt-8 text-center">
              <button
                onClick={() => {
                  setShowWizard(true);
                  trackEngagement({
                    featureName: 'pricing_help_me_choose_started',
                    engagementType: 'click',
                    metadata: {},
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                {l === 'es' ? 'Ayúdame a elegir' : 'Help me choose'}
              </button>
            </div>

            {/* Wizard */}
            {showWizard && (
              <div className="mt-6">
                <HelpMeChoose language={l} onClose={() => setShowWizard(false)} />
              </div>
            )}
          </div>
        </section>

        {/* Trust strip below cards */}
        <PricingTrustStrip language={l} />

        {/* Comparison table (individuals only) */}
        {activeTab === 'individuals' && <ComparisonTable language={l} />}

        {/* Marketplace */}
        <MarketplaceSection language={l} />

        {/* FAQ */}
        <PricingFAQ language={l} />

        {/* Ethical pricing line */}
        <section className="py-6 bg-slate-50 border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs text-navy-500 leading-relaxed">
              {l === 'es'
                ? 'ezLegal.ai proporciona información legal, no asesoramiento legal. Los recursos gratuitos y de ayuda urgente no se clasifican por quien nos paga.'
                : 'ezLegal.ai provides legal information, not legal advice. Free and urgent-help resources are not ranked by who pays us.'
              }
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
