import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Scale, Users, FileText, BarChart3, Shield, CheckCircle,
  ArrowRight, Mail, Building2, Heart, TrendingUp,
  Calendar, Briefcase, MessageSquare, Globe, Brain, Target,
  RefreshCw, Sparkles, X, Activity, ChevronDown, ChevronUp, Code
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import LSOGovernanceDisclosures from '../components/LSOGovernanceDisclosures';
import TechnicalArchitecture from '../components/TechnicalArchitecture';
import ConflictChecker from '../components/ConflictChecker';

const features = [
  {
    icon: <Brain className="w-8 h-8" />,
    title: 'AI-Powered Case Matching',
    description: 'Smart algorithms match cases to optimal attorneys based on expertise, availability, and success patterns.',
    highlight: true
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Client Intake Management',
    description: 'Streamlined eligibility screening with AI-powered poverty guideline checks, income verification, and case prioritization.'
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    title: 'Volunteer Attorney Portal',
    description: 'Manage pro bono attorney networks with AI-scored availability matching and automated case assignment workflows.'
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'AI Grant Reporting',
    description: 'Generate funder-ready impact reports with one click. AI summarizes outcomes, demographics, and program metrics.',
    highlight: true,
    link: '/grant-reporting'
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Client AI Triage',
    description: 'Our ezLegal.ai™ Chatbot pre-screens clients 24/7, gathers case details, checks eligibility, and prioritizes urgent matters automatically.'
  },
  {
    icon: <RefreshCw className="w-8 h-8" />,
    title: 'LegalServer Integration',
    description: 'Bi-directional sync with LegalServer and other case management systems. Real-time data synchronization and AI-enhanced analysis.'
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: 'Document Generation',
    description: 'Generate standard legal forms and documents with client data auto-populated. AI suggests relevant documents per case type.'
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Multilingual Support',
    description: 'Serve diverse communities with full Spanish language support throughout the platform, including ezLegal.ai™ Chatbot.'
  }
];

const comparisons = [
  { feature: 'AI Case Matching', ezlegal: true, competitor: false },
  { feature: 'AI Outcome Prediction', ezlegal: true, competitor: false },
  { feature: 'Client-Facing ezLegal.ai™ Chatbot', ezlegal: true, competitor: false },
  { feature: 'AI-Powered Grant Reports', ezlegal: true, competitor: false },
  { feature: 'LegalServer Integration', ezlegal: true, competitor: true },
  { feature: 'Volunteer Management', ezlegal: true, competitor: true },
  { feature: 'Real-Time Notifications', ezlegal: true, competitor: true },
  { feature: 'Free Tier Available', ezlegal: true, competitor: true },
  { feature: 'Document Generation', ezlegal: true, competitor: false },
  { feature: 'Multilingual Support', ezlegal: true, competitor: false },
  { feature: 'API Access', ezlegal: true, competitor: false },
  { feature: 'Client Self-Service Portal', ezlegal: true, competitor: false },
];

const tiers = [
  {
    name: 'LSO Starter',
    price: '$199',
    period: '/month',
    description: 'For small legal aid organizations',
    features: [
      'Up to 10 staff members',
      'Pro bono case tracking',
      'Client intake management',
      'Basic grant reporting',
      'Eligibility screening tools',
      'Email & chat support'
    ],
    cta: 'Start Free Trial',
    highlighted: false
  },
  {
    name: 'LSO Professional',
    price: '$499',
    period: '/month',
    description: 'For established legal aid orgs',
    features: [
      'Up to 50 staff members',
      'Everything in LSO Starter, plus:',
      'Advanced grant reporting',
      'Demographics & outcomes analytics',
      'Multi-jurisdiction support',
      'AI case matching & analysis',
      'LegalServer integration',
      'Priority phone support'
    ],
    cta: 'Start Free Trial',
    highlighted: true
  },
  {
    name: 'LSO Enterprise',
    price: 'Custom',
    description: 'For statewide & national programs',
    features: [
      'Unlimited staff members',
      'Custom domain (yourorg.org)',
      'Full white-label branding',
      'API integration access',
      'Dedicated success manager',
      'Custom compliance & audit tools',
      'Funder dashboard access',
      'Training & onboarding support'
    ],
    cta: 'Contact Sales',
    highlighted: false
  }
];

const perspectiveTopics = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'AI in Case Management',
    description: 'How is AI changing the way your organization handles intake, case assignment, and volunteer coordination?',
    cta: 'Share Your Experience',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Expanding Access to Justice',
    description: 'What role can technology play in helping legal aid organizations serve more clients without compromising quality?',
    cta: 'Share Your Perspective',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Ethics & AI Safeguards',
    description: 'What safeguards matter most when deploying AI in legal services for vulnerable populations?',
    cta: 'Share Your Insights',
  },
];

const stats = [
  { value: 'Growing', label: 'Partner Network' },
  { value: 'AI-Powered', label: 'Case Management' },
  { value: 'Smart', label: 'Attorney Matching' },
  { value: 'Streamlined', label: 'Grant Reporting' }
];

const aiCapabilities = [
  { icon: <Target className="w-6 h-6" />, title: 'Smart Matching', desc: 'AI-powered case-to-attorney matching' },
  { icon: <Activity className="w-6 h-6" />, title: 'Outcome Analysis', desc: 'Case success probability insights' },
  { icon: <Sparkles className="w-6 h-6" />, title: 'Auto Eligibility', desc: 'Instant poverty guideline checks' },
  { icon: <FileText className="w-6 h-6" />, title: 'Doc Generation', desc: 'AI-assisted form completion' },
];

export default function ForOrganizations() {
  const [showTechnicalSection, setShowTechnicalSection] = useState(false);
  const [showConflictDemo, setShowConflictDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full mb-6">
                <Building2 className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-semibold">For Legal Services Organizations</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                An{' '}
                <span className="text-orange-400">AI-Powered</span> Platform Built for Legal Aid
              </h1>
              <p className="text-xl text-teal-50 mb-8 leading-relaxed">
                Go beyond basic volunteer management. ezLegal.ai&trade; uses AI to help match cases, surface likely outcome factors, streamline intake, and assemble grant-reporting data - so your team can serve more clients with the resources you already have.
              </p>
              <p className="text-xs text-teal-200/90 mb-8 leading-relaxed max-w-2xl">
                Outcome analysis summarizes historical case patterns to inform decisions; it is not a guarantee or prediction of any individual legal result. Implementation includes role-based access, audit logs, and client-consent controls documented in the{' '}
                <Link to="/trust-center" className="underline hover:text-white">Trust Center</Link>.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  to="/lso-dashboard"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <BarChart3 className="w-5 h-5" />
                  View AI Dashboard Demo
                </Link>
                <Link
                  to="/schedule-demo"
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-bold transition-all border border-white/30 flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule a Demo
                </Link>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-teal-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success-400" />
                  <span>Free tier available</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success-400" />
                  <span>LegalServer integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success-400" />
                  <span>AES-256 + TLS 1.3 encryption</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-error-400 rounded-full" />
                  <div className="w-3 h-3 bg-warning-400 rounded-full" />
                  <div className="w-3 h-3 bg-success-400 rounded-full" />
                </div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-teal-500/30 to-teal-500/30 rounded-lg p-4 border border-teal-400/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-teal-200" />
                      <span className="text-sm font-semibold">AI Operations Hub</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {aiCapabilities.map((cap, idx) => (
                        <div key={idx} className="bg-white/10 rounded p-2 flex items-center gap-2">
                          <div className="text-teal-200">{cap.icon}</div>
                          <span className="text-teal-100">{cap.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Dashboard Preview</span>
                      <TrendingUp className="w-4 h-4 text-success-400" />
                    </div>
                    <div className="text-3xl font-bold">--</div>
                    <div className="text-sm text-teal-200">Clients Served</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">AI</div>
                      <div className="text-xs text-teal-200">Case Matching</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-2xl font-bold">--</div>
                      <div className="text-xs text-teal-200">Volunteer Attorneys</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-teal-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-teal-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              Why Legal Aid Organizations Choose ezLegal.ai™
            </h2>
            <p className="text-lg text-navy-600">
              See how our AI capabilities compare to traditional volunteer management platforms
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-navy-200">
            <div className="grid grid-cols-3 bg-navy-100">
              <div className="p-4 font-bold text-navy-900">Feature</div>
              <div className="p-4 font-bold text-center bg-gradient-to-r from-teal-600 to-teal-600 text-white">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  ezLegal.ai™
                </div>
              </div>
              <div className="p-4 font-bold text-center text-navy-600">Traditional Platforms</div>
            </div>
            <div className="divide-y divide-navy-100">
              {comparisons.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 hover:bg-navy-50">
                  <div className="p-4 text-navy-700 font-medium">{item.feature}</div>
                  <div className="p-4 flex justify-center">
                    {item.ezlegal ? (
                      <CheckCircle className="w-6 h-6 text-success-600" />
                    ) : (
                      <X className="w-6 h-6 text-navy-300" />
                    )}
                  </div>
                  <div className="p-4 flex justify-center">
                    {item.competitor ? (
                      <CheckCircle className="w-6 h-6 text-navy-400" />
                    ) : (
                      <X className="w-6 h-6 text-navy-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4">
              <Brain className="w-5 h-5" />
              <span className="font-semibold">AI-Powered Platform</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Everything You Need to Scale Legal Aid
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Purpose-built tools with AI capabilities that no other platform offers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const CardContent = (
                <>
                  {feature.highlight && (
                    <div className="bg-gradient-to-r from-teal-600 to-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 mb-3">
                      <Sparkles className="w-3 h-3" />
                      AI-POWERED
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                    feature.highlight
                      ? 'bg-gradient-to-r from-teal-600 to-teal-600 text-white'
                      : 'bg-teal-100 text-teal-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-600 leading-relaxed">{feature.description}</p>
                  {feature.link && (
                    <div className="mt-4 flex items-center gap-1 text-teal-600 text-sm font-medium group-hover:gap-2 transition-all">
                      Try it now <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </>
              );

              return feature.link ? (
                <Link
                  key={index}
                  to={feature.link}
                  className={`bg-white border rounded-2xl p-6 hover:shadow-xl transition-all group block ${
                    feature.highlight
                      ? 'border-teal-300 shadow-lg ring-2 ring-teal-100'
                      : 'border-navy-200'
                  }`}
                >
                  {CardContent}
                </Link>
              ) : (
                <div
                  key={index}
                  className={`bg-white border rounded-2xl p-6 hover:shadow-xl transition-all group ${
                    feature.highlight
                      ? 'border-teal-300 shadow-lg ring-2 ring-teal-100'
                      : 'border-navy-200'
                  }`}
                >
                  {CardContent}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="technical-architecture" className="py-20 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-4">
              <Code className="w-5 h-5" />
              <span className="font-semibold">For Technical Decision Makers</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Enterprise-Grade AI Infrastructure
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Understand the technology powering ezLegal.ai™. Our RAG architecture ensures
              AI responses are grounded in authoritative legal sources, not hallucinations.
            </p>
          </div>

          <button
            onClick={() => setShowTechnicalSection(!showTechnicalSection)}
            className="w-full mb-8 p-6 bg-white border border-navy-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-navy-900">Technical Architecture Deep Dive</h3>
                <p className="text-sm text-navy-600">
                  RAG Pipeline, Security Infrastructure, Ethical Safeguards, and Integration APIs
                </p>
              </div>
            </div>
            {showTechnicalSection ? (
              <ChevronUp className="w-6 h-6 text-navy-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-navy-400" />
            )}
          </button>

          {showTechnicalSection && <TechnicalArchitecture />}
        </div>
      </section>

      <section id="conflict-checking" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full mb-4">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">White-Label Feature</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Conflict of Interest Checking
            </h2>
            <p className="text-xl text-navy-600 max-w-3xl mx-auto">
              Built for legal aid organizations. Our conflict checking system ensures matter-based data isolation
              and provides audit trails for bar compliance requirements.
            </p>
          </div>

          <button
            onClick={() => setShowConflictDemo(!showConflictDemo)}
            className="w-full mb-8 p-6 bg-gradient-to-r from-teal-50 to-teal-50 border border-teal-200 rounded-xl hover:shadow-md transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center">
                <Scale className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-navy-900">Try the Conflict Checker Demo</h3>
                <p className="text-sm text-navy-600">
                  Search for "Johnson" or "Smith" to see how potential conflicts are identified
                </p>
              </div>
            </div>
            {showConflictDemo ? (
              <ChevronUp className="w-6 h-6 text-navy-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-navy-400" />
            )}
          </button>

          {showConflictDemo && <ConflictChecker />}

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-navy-200 rounded-xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-bold text-navy-900 mb-2">Tenant Isolation</h3>
              <p className="text-sm text-navy-600">
                Each organization's data is completely isolated at the database level.
                Row-level security ensures no cross-tenant access is ever possible.
              </p>
            </div>

            <div className="bg-white border border-navy-200 rounded-xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-navy-900 mb-2">Audit Compliance</h3>
              <p className="text-sm text-navy-600">
                Every conflict search is logged with timestamp, user, query, and results.
                Meets bar association requirements for conflict documentation.
              </p>
            </div>

            <div className="bg-white border border-navy-200 rounded-xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold text-navy-900 mb-2">Waiver Management</h3>
              <p className="text-sm text-navy-600">
                When conflicts can be waived, track informed consent, supervising attorney
                approval, and consent dates for regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-amber-200">
              <Heart className="w-4 h-4" />
              Seeking Attorney Perspectives
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Attorney Insights on AI in Legal Aid
            </h2>
            <p className="text-xl text-navy-600 max-w-2xl mx-auto">
              We're building a collection of perspectives from legal professionals on the role of ethical AI in access to justice. Share your insights to be featured.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {perspectiveTopics.map((topic, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border border-navy-200"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600">
                  {topic.icon}
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-3">{topic.title}</h3>
                <p className="text-navy-600 mb-6 leading-relaxed">{topic.description}</p>
                <Link
                  to="/share-perspective"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm"
                >
                  {topic.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-navy-50 border-2 border-navy-200 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-navy-900 mb-3">
                Are You a Legal Professional Using AI for Pro Bono Work?
              </h3>
              <p className="text-navy-600 mb-6">
                We'd love to feature your insights on ethical AI in legal services. Share your experiences with AI-assisted case management, intake automation, or client services.
              </p>
              <Link
                to="/share-perspective"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Mail className="w-5 h-5" />
                Share Your Perspective
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-navy-600">
              Plans that scale with your organization's needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-2xl scale-105 border-2 border-teal-400'
                    : 'bg-white border-2 border-navy-200 shadow-lg'
                }`}
              >
                {tier.highlighted && (
                  <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-navy-900'}`}>
                  {tier.name}
                </h3>
                <div className={`text-4xl font-bold mb-1 ${tier.highlighted ? 'text-white' : 'text-teal-600'}`}>
                  {tier.price}
                  {tier.period && <span className="text-lg font-normal">{tier.period}</span>}
                </div>
                <p className={`text-sm mb-6 ${tier.highlighted ? 'text-teal-100' : 'text-navy-600'}`}>
                  {tier.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-teal-200' : 'text-teal-600'}`} />
                      <span className={tier.highlighted ? 'text-white' : 'text-navy-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.name === 'Enterprise' ? '/schedule-demo' : '/signup?org=true'}
                  className={`block w-full text-center py-3 rounded-lg font-bold transition-all ${
                    tier.highlighted
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LSOGovernanceDisclosures />

      <section className="py-20 bg-gradient-to-br from-navy-900 to-teal-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Brain className="w-16 h-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Legal Aid Program with AI?
          </h2>
          <p className="text-xl text-navy-300 mb-10">
            Join forward-thinking organizations using ezLegal.ai™'s AI platform designed to help you serve more clients, match cases efficiently, and generate grant reports in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/schedule-demo"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule a Live Demo
            </Link>
            <Link
              to="/lso-dashboard"
              className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all border border-white/30 flex items-center justify-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Explore Dashboard Preview
            </Link>
          </div>
        </div>
      </section>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
