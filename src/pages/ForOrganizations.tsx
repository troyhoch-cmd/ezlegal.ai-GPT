import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Users, FileText, BarChart3,
  Building2, Globe, CheckCircle, Lock, Scale, Heart
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ScopeNotice } from '../components/shared/AISafetyMicrocopy';
import { trackEvent } from '../services/analytics-service';
import TrustCTABlock from '../components/trust/TrustCTABlock';
import ReferralPacketPreview from '../components/ReferralPacketPreview';
import OrganizationIntakeQueue from '../components/OrganizationIntakeQueue';
import { useLanguage } from '../contexts/LanguageContext';

const CAPABILITIES = [
  'AI-assisted client intake and eligibility screening',
  'Multilingual support (English + Spanish built in)',
  'Case triage, priority routing, and escalation pathways',
  'Document generation from guided templates',
  'Reporting and analytics on intake volume and triage outcomes',
  'Integration-ready architecture (API, embed widgets, white-label)',
];

const USE_CASES = [
  {
    icon: Heart,
    title: 'Legal aid organizations',
    desc: 'Screen more clients, triage faster, and stretch limited attorney hours with AI-assisted intake.',
  },
  {
    icon: Building2,
    title: 'Law school clinics',
    desc: 'Give students guided intake tools and case-matching that surfaces relevant precedent.',
  },
  {
    icon: Users,
    title: 'Bar associations',
    desc: 'Offer a modern pro bono portal that matches volunteer attorneys to cases by expertise.',
  },
  {
    icon: Globe,
    title: 'Community organizations',
    desc: 'Embed a legal self-help widget on your site to serve clients in their language.',
  },
  {
    icon: Scale,
    title: 'Court self-help centers',
    desc: 'Reduce counter wait times with guided document preparation and next-step checklists.',
  },
];

const GOVERNANCE_LINKS = [
  { title: 'AI Governance Framework', to: '/ai-governance', desc: 'How we build, test, and monitor our AI systems.' },
  { title: 'Bias Monitoring Dashboard', to: '/bias-monitoring', desc: 'Live metrics on fairness across demographics.' },
  { title: 'Model Card', to: '/ai-model-card', desc: 'Technical details on model capabilities and limitations.' },
  { title: 'Algorithmic Impact Assessment', to: '/algorithmic-impact-assessment', desc: 'Risk assessment for our AI applications.' },
];

export default function ForOrganizations() {
  useEffect(() => {
    trackEvent('page_view', { path: '/for-organizations' });
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-6">
              <Building2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-800">For organizations &amp; partners</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              AI-assisted intake that multiplies your capacity.
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              Serve more people with the same team. Our platform handles intake, triage, and guided self-help so your attorneys can focus on what matters.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('demo_requested', { source: 'org_hero' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Schedule organization demo
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/partners"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Create partner intake page
              </Link>
              <Link
                to="/ai-governance"
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm text-emerald-700 hover:text-emerald-900 font-medium px-4 py-3.5 transition"
              >
                Review AI governance
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500 max-w-lg mx-auto">
              We do not claim to replace lawyers or legal aid staff. Our tools support and augment your team.
            </p>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="capabilities-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="capabilities-heading" className="text-2xl font-black text-center mb-8">
              Platform capabilities
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {CAPABILITIES.map((cap) => (
                <div key={cap} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <p className="text-sm text-slate-800 leading-relaxed">{cap}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-14" aria-labelledby="use-cases-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="use-cases-heading" className="text-2xl font-black text-center mb-3">
              Built for access-to-justice organizations
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Whether you serve hundreds or hundreds of thousands, our platform scales with your mission.
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASES.map((uc) => {
                const Icon = uc.icon;
                return (
                  <div key={uc.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1">{uc.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{uc.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Governance */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="governance-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="governance-heading" className="text-2xl font-black text-center mb-3">
              Governance &amp; transparency
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              We publish our AI governance documentation so partners can evaluate our approach.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GOVERNANCE_LINKS.map((link) => (
                <Link
                  key={link.title}
                  to={link.to}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 hover:shadow-sm transition group"
                >
                  <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5 group-hover:text-emerald-800 transition">{link.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{link.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Key workflow areas */}
        <section className="py-14" aria-labelledby="workflows-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflows-heading" className="text-2xl font-black text-center mb-3">
              How organizations use the platform
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Triage, intake support, education, referral routing, and document preparation support.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Users, title: 'Client-facing intake support', desc: 'Guided questionnaires that gather key facts before attorney review.' },
                { icon: Globe, title: 'Spanish-language access', desc: 'Full bilingual intake and self-help flows for Spanish-speaking clients.' },
                { icon: Scale, title: 'Referral and escalation', desc: 'Route high-risk cases to attorneys and surface emergency resources.' },
                { icon: BarChart3, title: 'Admin and audit visibility', desc: 'Track intake volume, triage outcomes, and response quality.' },
                { icon: Lock, title: 'Privacy and consent', desc: 'Configurable consent gates and data handling policies.' },
                { icon: FileText, title: 'Reporting', desc: 'Grant reporting templates and demographic analytics.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                      <Icon className="w-4.5 h-4.5" aria-hidden="true" />
                    </span>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Implementation notes */}
        <section className="py-10 bg-amber-50 border-y border-amber-200" aria-labelledby="implementation-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="implementation-heading" className="text-lg font-bold text-amber-900 mb-4 text-center">
              Implementation guidance
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { title: 'Human review recommended', desc: 'AI output should be reviewed by qualified staff before client action.' },
                { title: 'Use with local eligibility rules', desc: 'Configure screening criteria for your jurisdiction and funding source.' },
                { title: 'Configure emergency escalation', desc: 'Set up high-risk detection and crisis resource routing for your community.' },
              ].map((note) => (
                <div key={note.title} className="bg-white rounded-lg border border-amber-200 p-4">
                  <h3 className="text-sm font-bold text-amber-900 mb-1">{note.title}</h3>
                  <p className="text-xs text-amber-800 leading-relaxed">{note.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integration ready */}
        <section className="py-14" aria-labelledby="integration-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="integration-heading" className="text-2xl font-black mb-3">
              Integration-ready
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Designed to support future integrations with your existing case management and intake systems. Embed our intake widget, connect via API, or use our white-label solution.
            </p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {[
                { icon: Lock, text: 'Encrypted data at rest and in transit' },
                { icon: BarChart3, text: 'Real-time partner dashboard' },
                { icon: FileText, text: 'API & embeddable widgets' },
                { icon: Globe, text: 'Multi-language support' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust links */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <TrustCTABlock variant="standard" />
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-8">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <ScopeNotice className="max-w-xl mx-auto" />
          </div>
        </section>

        {/* Partner workflow features */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="partner-features-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="partner-features-heading" className="text-2xl font-black text-center mb-3">
              What partners can do
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Tools designed for legal-aid teams, pro bono coordinators, and community organizations.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Consent-based referral routing', desc: 'Clients explicitly opt in before any data is shared. Consent is timestamped and revocable.' },
                { title: 'Staff review workflow', desc: 'Every AI-generated summary is labeled "for staff review" — nothing goes to a client without human approval.' },
                { title: 'Multilingual intake', desc: 'Full bilingual intake in English and Spanish. Language preference is captured and preserved in referral packets.' },
                { title: 'Urgency flags and deadline detection', desc: 'Automatic detection of court dates, filing deadlines, and safety concerns with visual priority sorting.' },
                { title: 'Audit logs', desc: 'Immutable record of all consent events, referral routing, and status changes for compliance and oversight.' },
                { title: 'Grant reporting (anonymized)', desc: 'Aggregate intake volume, triage outcomes, and demographics for funders. Never includes client names, narratives, or contact info.' },
              ].map((item) => (
                <div key={item.title} className="p-5 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mock referral card */}
        <section className="py-14" aria-labelledby="sample-referral-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 id="sample-referral-heading" className="text-2xl font-black text-center mb-3">
              Sample referral summary
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-md mx-auto">
              This is what a triage summary looks like when shared with your team.
            </p>
            <div className="border-2 border-dashed border-amber-300 rounded-xl p-6 bg-amber-50/30 relative">
              <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                Example only
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-4">
                For staff review
              </span>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue category</p>
                  <p className="text-sm text-slate-800">Housing — Eviction notice received</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Urgency</p>
                  <p className="text-sm text-slate-800">High — Court date in 12 days</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jurisdiction</p>
                  <p className="text-sm text-slate-800">Arizona — Maricopa County</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</p>
                  <p className="text-sm text-slate-800">Spanish (intake completed in Spanish)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Consent source</p>
                  <p className="text-sm text-slate-800">Explicit opt-in at intake (timestamped)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Generated summary</p>
                  <p className="text-sm text-slate-800">Tenant received 5-day eviction notice. No prior violations. May qualify for emergency rental assistance. Deadline: response due before court date.</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested routing</p>
                  <p className="text-sm text-slate-800">Housing unit — urgent queue</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-amber-700 italic">
                This is a fictional example for demonstration purposes. No real client data is shown. Analytics never include client names, narratives, phone, email, or address.
              </p>
            </div>
          </div>
        </section>

        {/* Partner CTAs */}
        <section className="py-10 bg-white border-y border-slate-200" aria-labelledby="partner-ctas-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="partner-ctas-heading" className="text-lg font-bold text-slate-900 mb-4">
              Ready to explore?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('partner_cta_clicked', { cta: 'book_partner_demo' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Book a partner demo
              </Link>
              <a
                href="#sample-referral-heading"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                See sample referral
              </a>
              <Link
                to="/enterprise-security"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                Download security &amp; AI overview
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              We do not imply existing partnerships. All integration features require a signed agreement.
            </p>
          </div>
        </section>

        {/* Partner workflow demos */}
        <section className="py-12 bg-slate-50" aria-labelledby="workflow-demos-heading" id="workflow">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflow-demos-heading" className="text-xl font-bold text-slate-900 text-center mb-8">
              Partner workflow previews
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Referral packet format</h3>
                <ReferralPacketPreview isDemo={true} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Intake queue interface</h3>
                <OrganizationIntakeQueue />
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              Ready to expand your reach?
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              See how ezLegal.ai can serve your community. No commitment required.
            </p>
            <Link
              to="/schedule-demo"
              onClick={() => trackEvent('demo_requested', { source: 'org_bottom' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Schedule a partner demo
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
