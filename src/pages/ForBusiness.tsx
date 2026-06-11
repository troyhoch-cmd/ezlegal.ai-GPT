import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { AttorneyServiceDisclosure } from '../components/shared';
import Footer from '../components/Footer';
import { StandardDisclaimer } from '../components/templates/LegalDisclosureModule';
import { useLanguage } from '../contexts/LanguageContext';
import { getAffordabilityMessage } from '../lib/microcopy';
import {
  Building2, FileText, Shield, Clock, DollarSign, Users, CheckCircle2,
  ArrowRight, Briefcase, Scale, AlertTriangle,
  Lock, Calculator, ChevronDown, ChevronUp,
  Award, ExternalLink, X
} from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const businessPricing: PricingTier[] = [
  {
    name: 'Business Starter',
    price: '$99',
    period: '/month',
    description: 'For startups & small businesses',
    features: [
      'Up to 5 team members',
      'Unlimited AI legal assistant',
      'Business document templates',
      'Employment law guidance',
      'Contract review assistance',
      'Email & chat support',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'Business Pro',
    price: '$249',
    period: '/month',
    description: 'For growing businesses',
    features: [
      'Up to 15 team members',
      'Everything in Business Starter, plus:',
      'Attorney consultation (2 hrs/month)',
      'Compliance monitoring alerts',
      'Multi-state legal guidance',
      'Priority phone support',
      'Custom document templates',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For national brands & large organizations',
    features: [
      'Unlimited team members',
      'Custom domain (yourcompany.com)',
      'Full white-label branding',
      'API integration access',
      'Dedicated account manager',
      'Custom SLA & compliance',
      'SSO & advanced security',
    ],
    cta: 'Contact Sales',
  },
];

interface Citation {
  id: number;
  label: string;
  source: string;
  url: string;
  year: string;
  accessNote?: string;
}

const citations: Citation[] = [
  { id: 1, label: 'Clio Legal Trends Report', source: 'Clio', url: 'https://www.clio.com/resources/legal-trends/', year: '2023', accessNote: 'Free with registration' },
  { id: 2, label: 'Legal Industry Survey', source: 'Thomson Reuters', url: 'https://legal.thomsonreuters.com/en/insights', year: '2023', accessNote: 'May require subscription' },
  { id: 3, label: 'Cost of a Data Breach Report', source: 'IBM/Ponemon Institute', url: 'https://www.ibm.com/reports/data-breach', year: '2023', accessNote: 'Free with registration' },
  { id: 4, label: 'State of the Legal Market', source: 'Thomson Reuters', url: 'https://legal.thomsonreuters.com/en/insights', year: '2024', accessNote: 'May require subscription' },
];

const painPoints = [
  {
    icon: DollarSign,
    problem: 'Legal fees are unpredictable',
    stat: '$300-500/hr',
    statLabel: 'avg attorney rate',
    citationId: 1,
    solution: 'Flat monthly pricing with unlimited AI assistance',
  },
  {
    icon: Clock,
    problem: 'Contracts take weeks to review',
    stat: '5-10 days',
    statLabel: 'typical turnaround',
    citationId: 2,
    solution: 'AI-powered review in minutes, not days',
  },
  {
    icon: AlertTriangle,
    problem: 'Compliance risks are costly',
    stat: '$4.24M',
    statLabel: 'avg breach cost',
    citationId: 3,
    solution: 'Proactive compliance monitoring & alerts',
  },
  {
    icon: Users,
    problem: 'No in-house legal team',
    stat: '87%',
    statLabel: 'of SMBs lack counsel',
    citationId: 4,
    solution: 'AI legal assistant available 24/7',
  },
];

const useCases = [
  {
    icon: FileText,
    title: 'Contract Management',
    description: 'Generate, review, and manage NDAs, service agreements, employment contracts, and more.',
    benefits: ['Auto-generate from templates', 'AI clause analysis', 'Version tracking', 'E-signature ready'],
  },
  {
    icon: Shield,
    title: 'Compliance & Risk',
    description: 'Stay compliant with employment law, data privacy regulations, and industry standards.',
    benefits: ['GDPR/CCPA guidance', 'Employment law updates', 'Policy generators', 'Audit preparation'],
  },
  {
    icon: Scale,
    title: 'Employment Law',
    description: 'Navigate hiring, termination, workplace policies, and employee disputes with confidence.',
    benefits: ['Handbook templates', 'Termination guidance', 'Discrimination prevention', 'Wage & hour compliance'],
  },
  {
    icon: Briefcase,
    title: 'Business Formation',
    description: 'Structure your business correctly from day one with entity selection guidance.',
    benefits: ['LLC vs Corp analysis', 'Operating agreements', 'Bylaws & resolutions', 'State compliance'],
  },
];

const valueProps = [
  {
    title: 'Faster Contract Reviews',
    description: 'AI-powered contract analysis helps your team review agreements in hours instead of weeks, so deals close faster.',
    benefit: 'Designed to reduce review time by up to 90%',
    icon: 'speed',
  },
  {
    title: 'Affordable Legal Coverage',
    description: 'Get enterprise-level legal support without the enterprise price tag. Built specifically for teams of 5-200.',
    benefit: 'Predictable monthly pricing, no hourly surprises',
    icon: 'savings',
  },
  {
    title: 'Proactive Compliance',
    description: 'Stay ahead of regulatory requirements with built-in compliance monitoring for CCPA, employment law, and more.',
    benefit: 'Catch issues before they become costly problems',
    icon: 'shield',
  },
];

const faqs = [
  {
    question: "How is this different from just using ChatGPT for legal questions?",
    answer: "ezLegal.ai™ is purpose-built for legal work with jurisdiction-specific accuracy, attorney-reviewed templates, and compliance tracking. General AI tools lack legal training, can't generate enforceable documents, and don't understand state-specific requirements. Our AI is trained on actual legal precedents and reviewed by practicing attorneys.",
  },
  {
    question: "Can ezLegal.ai™ replace our attorney entirely?",
    answer: "No, and we don't try to. ezLegal.ai\u2122 handles routine legal information tasks so you can reserve attorney time for complex matters. Think of us as your first line of defense that escalates to human attorneys when needed. We even help you find and brief attorneys when you need them.",
  },
  {
    question: "Is our data secure and confidential?",
    answer: "Yes. We use TLS 1.3 encryption in transit and AES-256 at rest via our infrastructure provider (Supabase, which is SOC 2 Type II certified). We never use your data to train AI models. Your business information stays private and we're CCPA compliant.",
  },
  {
    question: "How quickly can we get started?",
    answer: "Most teams are up and running in under 30 minutes. No complex integrations required. For Enterprise plans with custom integrations, typical deployment is 2-4 weeks with dedicated support throughout.",
  },
  {
    question: "What if we need help with something outside the AI's capabilities?",
    answer: "Our platform includes warm handoff to our network of vetted attorneys. You can share your conversation history and documents directly, so the attorney has full context. Business plan users get priority attorney matching.",
  },
];

export default function ForBusiness() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeCitation, setActiveCitation] = useState<number | null>(null);
  const citationTriggerRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const citationPopoverRef = useRef<HTMLDivElement | null>(null);

  const closeCitation = useCallback(() => {
    const prev = activeCitation;
    setActiveCitation(null);
    if (prev !== null) {
      citationTriggerRefs.current[prev]?.focus();
    }
  }, [activeCitation]);

  useEffect(() => {
    if (activeCitation === null) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCitation();
    }
    function handleClickOutside(e: MouseEvent) {
      const popover = citationPopoverRef.current;
      const trigger = activeCitation !== null ? citationTriggerRefs.current[activeCitation] : null;
      if (popover && !popover.contains(e.target as Node) && trigger && !trigger.contains(e.target as Node)) {
        closeCitation();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeCitation, closeCitation]);

  const [calculatorInputs, setCalculatorInputs] = useState({
    contracts: 10,
    hourlyRate: 350,
    hoursPerContract: 3,
  });

  const annualSavings = calculatorInputs.contracts * 12 * calculatorInputs.hourlyRate * calculatorInputs.hoursPerContract;
  const ezLegalCost = 149 * 12;
  const netSavings = annualSavings - ezLegalCost;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content" className="pt-4">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-semibold text-teal-300">For Small & Medium Businesses</span>
                </div>

                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
                  Enterprise Legal Power.
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                    SMB Budget.
                  </span>
                </h1>

                <p className="text-xl text-navy-300 mb-8 leading-relaxed">
                  Stop overpaying for legal services. Our AI handles contracts, compliance, and everyday legal tasks so you can focus on growing your business.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/signup?plan=business"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Start 14-Day Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/contact?type=demo"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
                  >
                    Schedule Demo
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-navy-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Setup in 30 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Calculator className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-white text-lg">ROI Calculator</h2>
                      <p className="text-sm text-navy-400">See your potential savings</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-2">
                        Contracts reviewed per month
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={calculatorInputs.contracts}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, contracts: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-sm text-navy-400 mt-1">
                        <span>1</span>
                        <span className="text-teal-400 font-semibold">{calculatorInputs.contracts}</span>
                        <span>50</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-300 mb-2">
                        Attorney hourly rate
                      </label>
                      <input
                        type="range"
                        min="150"
                        max="600"
                        step="50"
                        value={calculatorInputs.hourlyRate}
                        onChange={(e) => setCalculatorInputs(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                      <div className="flex justify-between text-sm text-navy-400 mt-1">
                        <span>$150</span>
                        <span className="text-teal-400 font-semibold">${calculatorInputs.hourlyRate}</span>
                        <span>$600</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-navy-800/50 rounded-lg p-3">
                          <p className="text-xs text-navy-400 mb-1">Current Annual Spend</p>
                          <p className="text-xl font-bold text-red-400">${annualSavings.toLocaleString()}</p>
                        </div>
                        <div className="bg-navy-800/50 rounded-lg p-3">
                          <p className="text-xs text-navy-400 mb-1">With ezLegal.ai™</p>
                          <p className="text-xl font-bold text-green-400">${ezLegalCost.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                        <p className="text-sm text-green-300 mb-1">Estimated Annual Savings</p>
                        <p className="text-3xl font-bold text-green-400">${netSavings.toLocaleString()}</p>
                      </div>
                      <div className="mt-4 rounded-lg border border-white/10 bg-navy-800/40 p-3 text-left">
                        <p className="text-[11px] uppercase tracking-wide text-navy-400 font-semibold mb-1">Assumptions</p>
                        <p className="text-xs text-navy-300 leading-relaxed">
                          Estimate based on {calculatorInputs.contracts} contract{calculatorInputs.contracts === 1 ? '' : 's'}/month at {calculatorInputs.hourlyRate === 150 ? '$150' : `$${calculatorInputs.hourlyRate}`}/hr, assuming ~3 hours of attorney review per contract. Actual savings vary by matter complexity, industry, and counsel rates.
                        </p>
                        <p className="text-xs text-navy-400 mt-2 leading-relaxed">
                          ezLegal.ai provides legal information and workflow support; it does not replace legal advice or representation. Retain a licensed attorney for matters requiring counsel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
        </section>

        {/* Trust Bar */}
        <section className="py-8 bg-navy-50 border-b border-navy-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
              <div className="flex items-center gap-2 text-navy-600">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold">CCPA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-navy-600">
                <Lock className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">TLS 1.3 + AES-256 Encryption</span>
              </div>
              <a
                href="/scope-disclaimers#templates"
                className="flex items-center gap-2 text-navy-600 hover:text-teal-700 transition-colors"
                title="Templates reviewed by licensed U.S. attorneys; review scope, jurisdictions, and last-reviewed dates are listed in scope & disclaimers. Use of a template does not create an attorney-client relationship."
              >
                <Award className="w-5 h-5 text-amber-600" />
                <span className="font-semibold">Attorney-Reviewed Templates</span>
              </a>
              <div className="flex items-center gap-2 text-navy-600">
                <Users className="w-5 h-5 text-teal-600" />
                <span className="font-semibold">Trusted by Businesses</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
                Legal Pain Points We Solve
              </h2>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                Small businesses face big legal challenges. Here's how we help.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {painPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="bg-gradient-to-br from-navy-50 to-white border border-navy-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">The Problem</p>
                    <h3 className="font-bold text-navy-900 mb-3">{point.problem}</h3>
                    <div className="bg-navy-100 rounded-lg p-3 mb-4 relative">
                      <p className="text-2xl font-bold text-navy-900">{point.stat}</p>
                      <p className="text-xs text-navy-500">
                        {point.statLabel}
                        <button
                          ref={(el) => { citationTriggerRefs.current[point.citationId] = el; }}
                          onClick={(e) => { e.stopPropagation(); setActiveCitation(activeCitation === point.citationId ? null : point.citationId); }}
                          className="inline-flex items-center justify-center w-4 h-4 ml-1 text-[9px] font-bold text-teal-700 bg-teal-100 rounded-full hover:bg-teal-200 transition-colors align-super cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                          aria-label={`View source ${point.citationId}: ${citations.find(c => c.id === point.citationId)?.source || ''}`}
                          aria-expanded={activeCitation === point.citationId}
                          aria-controls={activeCitation === point.citationId ? `citation-popover-${point.citationId}` : undefined}
                        >
                          {point.citationId}
                        </button>
                      </p>
                      {activeCitation === point.citationId && (() => {
                        const cite = citations.find(c => c.id === point.citationId);
                        if (!cite) return null;
                        return (
                          <div
                            ref={citationPopoverRef}
                            id={`citation-popover-${point.citationId}`}
                            role="dialog"
                            aria-label={`Source: ${cite.source}`}
                            className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-navy-200 rounded-lg shadow-lg p-3 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-navy-900">{cite.source} ({cite.year})</p>
                                <p className="text-navy-600 mt-0.5">{cite.label}</p>
                                {cite.accessNote && (
                                  <p className="text-navy-400 mt-0.5 italic">{cite.accessNote}</p>
                                )}
                              </div>
                              <button
                                onClick={closeCitation}
                                className="text-navy-400 hover:text-navy-600 flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
                                aria-label="Close citation"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-teal-600 hover:text-teal-700 font-medium"
                            >
                              View source <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-navy-600">{point.solution}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-navy-200">
              <p className="text-xs font-semibold text-navy-500 mb-2 uppercase tracking-wide">Sources</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {citations.map((cite) => (
                  <div key={cite.id} className="inline-flex items-center gap-1">
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-teal-700 bg-teal-100 rounded-full flex-shrink-0">{cite.id}</span>
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-navy-500 hover:text-teal-600 transition-colors inline-flex items-center gap-1"
                    >
                      {cite.source} ({cite.year}) <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    {cite.accessNote && (
                      <span className="text-[10px] text-navy-400 italic">{cite.accessNote}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-gradient-to-br from-navy-900 to-navy-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Built for How Businesses Actually Work
              </h2>
              <p className="text-xl text-navy-300 max-w-3xl mx-auto">
                From contracts to compliance, we've got you covered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon;
                return (
                  <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{useCase.title}</h3>
                        <p className="text-navy-300">{useCase.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {useCase.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm text-navy-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/features"
                className="inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
              >
                See All Features
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
                Why Businesses Choose ezLegal.ai
              </h2>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                Purpose-built to help growing companies handle legal work smarter and more affordably.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {valueProps.map((prop, index) => (
                <div key={index} className="bg-gradient-to-br from-navy-50 to-white border border-navy-200 rounded-2xl p-8 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-5">
                    {prop.icon === 'speed' && <Clock className="w-6 h-6 text-white" />}
                    {prop.icon === 'savings' && <DollarSign className="w-6 h-6 text-white" />}
                    {prop.icon === 'shield' && <Shield className="w-6 h-6 text-white" />}
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-3">{prop.title}</h3>
                  <p className="text-navy-700 mb-6 leading-relaxed">
                    {prop.description}
                  </p>
                  <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-2">
                    <p className="text-sm font-semibold text-teal-700">{prop.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-navy-600 max-w-3xl mx-auto">
                No hidden fees. No per-document charges. Just predictable monthly pricing.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {businessPricing.map((tier, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-8 ${
                    tier.popular
                      ? 'border-2 border-teal-500 shadow-xl scale-105'
                      : 'border border-navy-200 shadow-lg'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-navy-900 mb-2">{tier.name}</h3>
                    <p className="text-navy-500 text-sm mb-4">{tier.description}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-navy-900">{tier.price}</span>
                      <span className="text-navy-500">{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-navy-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={tier.name === 'Enterprise' ? '/contact?type=enterprise' : '/signup?plan=' + tier.name.toLowerCase()}
                    className={`block w-full text-center py-3 rounded-xl font-bold transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-navy-100 hover:bg-navy-200 text-navy-900'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 max-w-2xl mx-auto">
              <AttorneyServiceDisclosure variant="expandable" context="general" />
              <p className="text-xs text-navy-500 mt-3 text-center">
                Business Pro "Attorney consultation (2 hrs/month)" is provided by independent, licensed attorneys in your jurisdiction through our referral network. Hours are advisory only and do not create an attorney-client relationship with ezLegal.ai. Unused hours do not roll over. Geographic availability varies.
              </p>
            </div>

            <div className="mt-12 text-center">
              <p className="text-navy-600 mb-4">
                All plans include a 14-day free trial. No credit card required.
              </p>
              <Link
                to="/pricing"
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Compare all features →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-navy-600">
                Get answers to common questions about ezLegal.ai™ for business.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-navy-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-navy-50 transition-colors"
                  >
                    <span className="font-semibold text-navy-900 pr-4">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-navy-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-navy-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6 pt-0">
                      <p className="text-navy-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Take Control of Your Legal Work?
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              Businesses of all sizes use ezLegal.ai™ to handle contracts, compliance, and everyday legal tasks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup?plan=business"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 hover:bg-teal-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact?type=demo"
                className="inline-flex items-center justify-center gap-2 bg-teal-500/30 hover:bg-teal-500/50 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
              >
                Talk to Sales
              </Link>
            </div>
            <p className="mt-6 text-teal-200 text-sm">
              14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
