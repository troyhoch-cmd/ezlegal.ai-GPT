import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, FileText, Scale, Clock,
  Building2, Users, CheckCircle, Lock, AlertTriangle,
  DollarSign, Briefcase
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { ScopeNotice } from '../components/shared/AISafetyMicrocopy';
import { trackEvent } from '../services/analytics-service';
import TrustCTABlock from '../components/trust/TrustCTABlock';
import BusinessIssueCards from '../components/BusinessIssueCards';
import { useLanguage } from '../contexts/LanguageContext';

const PROBLEMS = [
  {
    icon: FileText,
    title: 'Contracts & agreements',
    desc: 'Review vendor contracts, NDAs, and service agreements before you sign.',
    prompt: 'I need help reviewing a business contract before signing.',
  },
  {
    icon: Users,
    title: 'Employee issues',
    desc: 'Hiring, firing, harassment complaints, or wage questions.',
    prompt: 'I have an employee issue and need to understand my obligations.',
  },
  {
    icon: Scale,
    title: 'Customer disputes',
    desc: 'Refund demands, chargebacks, or threatening letters.',
    prompt: 'A customer is threatening legal action against my business.',
  },
  {
    icon: Building2,
    title: 'Business formation',
    desc: 'LLC vs. Corp, registered agents, operating agreements.',
    prompt: 'I need help choosing the right business structure.',
  },
  {
    icon: AlertTriangle,
    title: 'Compliance & regulations',
    desc: 'Licenses, permits, privacy policies, ADA, industry rules.',
    prompt: 'I need to understand compliance requirements for my business.',
  },
  {
    icon: DollarSign,
    title: 'Debt & collections',
    desc: 'Someone owes you money, or a vendor is threatening collections.',
    prompt: 'I need help with a business debt or collections issue.',
  },
];

const WORKFLOWS = [
  { title: 'Contract review', desc: 'Upload a contract and get a plain-language summary of risks and obligations.' },
  { title: 'Cease & desist drafting', desc: 'Generate a professional cease & desist letter with your facts.' },
  { title: 'Employee handbook check', desc: 'Identify missing policies that could expose you to liability.' },
  { title: 'LLC operating agreement', desc: 'Build a customized operating agreement with guided questions.' },
  { title: 'Privacy policy builder', desc: 'Generate a compliant privacy policy for your website.' },
  { title: 'Demand letter', desc: 'Create a demand letter to collect unpaid invoices from clients.' },
];

export default function ForBusiness() {
  useEffect(() => {
    trackEvent('page_view', { path: '/for-business' });
  }, []);

  const handleProblemClick = (prompt: string) => {
    try {
      window.sessionStorage.setItem('ez_chatbot_prefill', prompt);
    } catch { /* ignore */ }
    trackEvent('business_problem_selected', { prompt: prompt.slice(0, 40) });
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navigation />

      <main id="main-content">
        {/* Hero */}
        <section className="pt-24 sm:pt-32 pb-16 bg-gradient-to-b from-slate-50 to-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-full px-4 py-1.5 mb-6">
              <Briefcase className="w-4 h-4 text-sky-700" aria-hidden="true" />
              <span className="text-sm font-medium text-sky-800">For small & medium businesses</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
              Practical legal workflows for small businesses.
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-7 text-slate-600">
              Contracts, compliance, employee issues, demand letters, and predictable pricing. ezLegal is not a law firm and does not replace attorney advice — but helps you prepare and know when you need one.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/start?persona=business"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_start_intake' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-700/20 hover:bg-sky-800 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Start business intake
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/schedule-demo"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_demo' })}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                Schedule demo
              </Link>
              <Link
                to="/pricing"
                onClick={() => trackEvent('business_cta_clicked', { cta: 'hero_pricing' })}
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm text-sky-700 hover:text-sky-900 font-medium px-4 py-3.5 transition"
              >
                View pricing
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              No credit card required. Free tier available.
            </p>
          </div>
        </section>

        {/* Common problems */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="problems-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="problems-heading" className="text-2xl font-black text-center mb-3">
              Common business problems we help with
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              Select your situation to start a conversation with context already loaded.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROBLEMS.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to="/chat"
                    onClick={() => handleProblemClick(card.prompt)}
                    className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all group"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-50 text-sky-700 shrink-0 group-hover:bg-sky-100 transition">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{card.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Productized workflows */}
        <section className="py-14" aria-labelledby="workflows-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="workflows-heading" className="text-2xl font-black text-center mb-3">
              Tools that save you time and money
            </h2>
            <p className="text-center text-slate-600 mb-10 max-w-xl mx-auto">
              Guided workflows that turn hours of legal work into minutes.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {WORKFLOWS.map((w) => (
                <div key={w.title} className="flex items-start gap-3 p-5 rounded-xl border border-slate-200 bg-white">
                  <CheckCircle className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{w.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Procurement trust strip */}
        <section className="py-10 bg-slate-50 border-y border-slate-200" aria-labelledby="trust-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="trust-heading" className="sr-only">Security and compliance</h2>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6">
              {[
                { icon: Shield, text: 'Information, not legal advice — scope is clear' },
                { icon: Lock, text: 'Encrypted in transit and at rest' },
                { icon: Users, text: 'Connect to a lawyer when you need one' },
                { icon: Clock, text: 'Answers in under 60 seconds' },
              ].map(({ icon: I, text }) => (
                <div key={text} className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <I className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/trust-center" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                Trust Center
              </Link>
              <Link to="/enterprise-security" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                Enterprise Security
              </Link>
              <Link to="/sla" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                SLA & Uptime
              </Link>
              <Link to="/ai-governance" className="text-xs font-medium text-slate-600 hover:text-sky-700 px-3 py-1.5 bg-white rounded-full border border-slate-200 hover:border-sky-300 transition">
                AI Governance
              </Link>
            </div>
          </div>
        </section>

        {/* Business onboarding cards */}
        <section className="py-14" aria-labelledby="onboarding-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="onboarding-heading" className="text-2xl font-black text-center mb-3">
              Get started in 3 simple steps
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto">
              No jargon, no appointments, no surprise bills.
            </p>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { num: 1, title: 'Tell us your concern', desc: 'Pick a category above, or just describe your situation in plain language.' },
                { num: 2, title: 'Get organized guidance', desc: 'We summarize risks, obligations, and deadlines in clear language.' },
                { num: 3, title: 'Take action', desc: 'Use our document tools, or connect with an attorney if needed.' },
              ].map((card) => (
                <div key={card.num} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                  <div className="w-9 h-9 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-sky-700">{card.num}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="py-14" aria-labelledby="pricing-heading">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="pricing-heading" className="text-2xl font-black mb-3">
              Predictable pricing, not surprise invoices
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Most business owners pay $300-500 per hour for legal help. We start at a fraction of that.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { name: 'Free', price: '$0', desc: '3 questions/month, basic guidance' },
                { name: 'Business', price: '$99/mo', desc: 'Unlimited questions, document tools, team access' },
                { name: 'Enterprise', price: 'Custom', desc: 'Dedicated support, API, compliance features' },
              ].map((tier) => (
                <div key={tier.name} className="p-5 rounded-xl border border-slate-200 bg-white">
                  <p className="text-sm font-medium text-slate-500 mb-1">{tier.name}</p>
                  <p className="text-2xl font-black text-slate-900 mb-2">{tier.price}</p>
                  <p className="text-sm text-slate-600">{tier.desc}</p>
                </div>
              ))}
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 mt-6 text-sm font-medium text-sky-700 hover:text-sky-900 transition"
            >
              See full pricing details
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
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
            <p className="text-xs text-slate-500 text-center mt-3 max-w-lg mx-auto">
              ezLegal helps organize legal information and generate documents. It does not replace a lawyer.
            </p>
          </div>
        </section>

        {/* Not sure section */}
        <section className="py-8 bg-slate-50 border-t border-slate-200">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm text-slate-600 mb-3">Not sure which option is right for your business?</p>
            <Link
              to="/start"
              className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900 transition"
            >
              Take the guided questionnaire
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* SMB use-case breakdown */}
        <section className="py-14 bg-slate-50 border-y border-slate-200" aria-labelledby="smb-breakdown-heading">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 id="smb-breakdown-heading" className="text-2xl font-black text-center mb-3">
              What you can do — and when to get help
            </h2>
            <p className="text-center text-slate-600 mb-8 max-w-lg mx-auto">
              For each business situation, here is what is free, when human help matters, and what may cost extra.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Contract review',
                  free: 'AI summary of key terms, risks, and deadlines.',
                  human: 'When terms are unusual, high-value, or disputed.',
                  paid: 'Detailed clause-by-clause analysis. Attorney review when available.',
                },
                {
                  title: 'Hiring / employee issue',
                  free: 'General employment law information. Common next steps.',
                  human: 'When termination, discrimination, or wages are involved.',
                  paid: 'Document preparation for HR actions. Compliance checklists.',
                },
                {
                  title: 'Customer nonpayment',
                  free: 'Demand letter template. Explanation of small claims process.',
                  human: 'When amount exceeds small claims limit or debtor is unresponsive.',
                  paid: 'Custom demand letter preparation. Filing guidance.',
                },
                {
                  title: 'Lease / vendor dispute',
                  free: 'Plain-language lease summary. Identify key obligations.',
                  human: 'When breach is alleged or eviction is threatened.',
                  paid: 'Response letter preparation. Dispute documentation.',
                },
                {
                  title: 'Business formation / compliance',
                  free: 'Entity comparison (LLC vs Corp vs Sole Prop). State requirements.',
                  human: 'When tax implications or existing liabilities are involved.',
                  paid: 'Formation document preparation. Compliance calendar setup.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5">
                  <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 text-teal-700 text-[10px] font-bold shrink-0 mt-0.5">F</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Free:</span> {item.free}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold shrink-0 mt-0.5">H</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Human help:</span> {item.human}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold shrink-0 mt-0.5">$</span>
                      <p className="text-xs text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">May cost extra:</span> {item.paid}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business issue cards — bilingual, with cost transparency */}
        <section className="py-12 bg-white" aria-labelledby="issue-cards-heading">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 id="issue-cards-heading" className="text-xl font-bold text-slate-900 text-center mb-2">
              Choose your issue
            </h2>
            <p className="text-center text-sm text-slate-600 mb-6 max-w-lg mx-auto">
              Each card shows what you can do for free and when optional paid lawyer review is available. You always see cost before you pay.
            </p>
            <BusinessIssueCards />
            <p className="mt-6 text-center text-xs text-slate-500">
              Lawyer review is always optional. You will see the exact cost before any payment is processed.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-slate-950 py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-black text-white mb-3">
              Stop guessing. Start protecting your business.
            </h2>
            <p className="text-slate-400 text-sm mb-7">
              Prevent problems before they become expensive. Get information fast.
            </p>
            <Link
              to="/start?persona=business"
              onClick={() => trackEvent('business_cta_clicked', { cta: 'bottom' })}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 hover:bg-sky-50 transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              Start business intake
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
