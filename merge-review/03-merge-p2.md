# Merge Review — P2 — Missing or substantially reduced pages

Generated: 2026-06-07T01:56:38.620Z
Baseline commit: 739dfcf178546bfb1600b870bbe71196cbe83b89

---

## src/pages/ForPartners.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 39.9 KB | 3.7 KB |
| Lines | 836 | 104 |
| Delta | — | 12% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { Building2, Shield, Lock, Key, Globe, Code, CheckCircle, ArrowRight, FileText, Users, Zap, Fingerprint, Eye, MessageSquare, BookOpen, Puzzle, Palette, BarChart3, Headphones as HeadphonesIcon, Clock, Award, Handshake, Database, AlertTriangle, Server, Heart, Briefcase } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function ForPartners() {
  const integrationTiers = [
    {
      tier: 'Embed',
      title: 'Embed Widget',
      subtitle: 'Add AI to Your Website',
      description: 'Drop a chat widget on your existing website. No development work required.',
      icon: Puzzle,
      price: '$79',
      pricePeriod: '/month',
      billingUnit: '1 conversation = 1 unique chat session (unlimited messages within session)',
      included: '500 conversations/mo included',
      overage: '$0.15 per additional conversation',
      typicalCost: '$79 - $150/mo for most organizations',
      recommendedWhen: 'You want the fastest path to live -- no developers needed',
      idealFor: 'Legal aid orgs, nonprofits, community organizations',
      details: [
        'Copy-paste installation (5 minutes)',
        'Customize colors and branding',
        'Lead capture and email collection',
        'Real-time analytics dashboard',
        'Conversation history and export',
        'Bilingual (English + Spanish)',
      ],
      notIncluded: [
        'Custom domain',
        'Remove ezLegal branding',
        'API access',
      ],
      standards: {
        support: 'Email (24hr response)',
        uptime: '99.9% target uptime',
        onboarding: 'Self-serve + guide',
        environments: 'Production only',
        sites: '1 domain',
      },
      primaryLink: '/dashboard/website-integration',
      primaryText: 'Get Embed Code',
      primaryStyle: 'primary',
      secondaryLink: '/schedule-demo',
      secondaryText: 'View Live Demo',
      trial: '14-day free trial included',
    },
    {
      tier: 'API',
      title: 'API Access',
      subtitle: 'Build Custom Integrations',
      description: 'RESTful APIs for developers building legal AI into their own applications.',
      icon: Code,
      price: '$0.02',
      pricePeriod: '/query',
      billingUnit: '1 query = 1 POST to /v1/chat/completions (includes all follow-up reasoning)',
      included: 'Free sandbox: 100 queries/day for 14 days',
      overage: 'Pay-as-you-go after sandbox; volume discounts at 10K+ queries/mo',
      typicalCost: '$40 - $200/mo for 2K-10K queries',
      recommendedWhen: 'You have developers and want full control over the UX',
      idealFor: 'Legal tech startups, custom app builders, in-house dev teams',
      details: [
        'Full API documentation + Postman collection',
        'Sandbox environment (no credit card)',
        'Webhook notifications',
        'Rate limiting: 60 req/min (sandbox), 300 req/min (production)',
        'Technical support via email',
        'Bearer token + API key authentication',
      ],
      notIncluded: [
        'White-label rights',
        'Dedicated support manager',
        'Custom model training',
      ],
      standards: {
        support: 'Email (24hr response)',
        uptime: '99.9% target uptime',
        onboarding: 'API docs + sandbox',
        environments: 'Sandbox + Production',
        sites: 'Unlimited',
      },
      primaryLink: '/schedule-demo',
      primaryText: 'Request Sandbox Access',
      primaryStyle: 'primary',
      secondaryLink: '/schedule-demo',
      secondaryText: 'Read API Docs',
      trial: 'Free sandbox -- no credit card required',
    },
    {
      tier: 'Enterprise',
      title: 'White Label',
      subtitle: 'Deploy as Your Own Product',
      description: 'Full white-label solution with your branding, domain, and complete customization.',
      icon: Palette,
      price: 'Custom',
      pricePeriod: '',
      billingUnit: 'Annual platform license + usage-based tiers',
      included: 'Dedicated infrastructure + custom SLA',
      overage: 'Usage tiers negotiated in contract',
      typicalCost: 'Typically $1,500 - $5,000/mo depending on volume',
      recommendedWhen: 'You need your own brand, domain, SSO, and full control',
      idealFor: 'Large organizations, legal tech companies, franchises',
      details: [
        'Custom domain (yourorg.ai)',
        'Complete brand customization',
        'Remove all ezLegal branding',
        'SSO/SAML integration',
        'Dedicated account manager',
        'Custom AI training on your content',
        '99.95%+ target uptime (contractual SLA available)',
      ],
      notIncluded: [],
      standards: {
        support: 'Dedicated manager (4hr response)',
        uptime: '99.95% target uptime',
        onboarding: '2-4 weeks guided setup',
        environments: 'Staging + Production',
        sites: 'Unlimited domains',
      },
      primaryLink: '/schedule-demo',
      primaryText: 'Request Architecture Review',
      primaryStyle: 'primary',
      secondaryLink: '/schedule-demo',
      secondaryText: 'Download Security Packet',
      trial: 'Scoping call required',
    },
  ];

  const comparisonFeatures = [
    { feature: 'Setup Time', widget: '5 minutes', api: '1-2 weeks', whiteLabel: '2-4 weeks' },
    { feature: 'Technical Skills', widget: 'None', api: 'Developer', whiteLabel: 'None (we handle it)' },
    { feature: 'Branding', widget: 'Colors only', api: 'Via your app', whiteLabel: 'Fully custom' },
    { feature: 'Your Domain', widget: 'No', api: 'Via your app', whiteLabel: 'Yes' },
    { feature: 'Lead Capture', widget: 'Built-in', api: 'Build your own', whiteLabel: 'Built-in' },
    { feature: 'Analytics', widget: 'Basic dashboard', api: 'Via /analytics API', whiteLabel: 'Advanced dashboard' },
    { feature: 'Support SLA', widget: 'Email (24hr)', api: 'Email (24hr)', whiteLabel: 'Dedicated (4hr)' },
    { feature: 'Target Uptime', widget: '99.9%', api: '99.9%', whiteLabel: '99.95%+' },
    { feature: 'Onboarding', widget: 'Self-serve', api: 'Sandbox + docs', whiteLabel: 'Guided (2-4 wks)' },
    { feature: 'Environments', widget: 'Production', api: 'Sandbox + Prod', whiteLabel: 'Staging + Prod' },
    { feature: 'Languages', widget: 'EN + ES', api: 'EN + ES', whiteLabel: 'EN + ES + custom' },
    { feature: 'SSO/SAML', widget: 'No', api: 'No', whiteLabel: 'Yes' },
    { feature: 'Billing Model', widget: 'Fixed monthly', api: 'Per-query', whiteLabel: 'Annual license' },
  ];

  const securityFeatures = [
    {
      title: 'SOC 2 Type II Infrastructure',
      description: 'Built on Supabase, which maintains SOC 2 Type II certification for security, availability, and confidentiality.',
      icon: Award,
    },
    {
      title: 'AES-256 & TLS 1.3 Encryption',
      description: 'All data encrypted at rest and in transit via our cloud infrastructure provider.',
      icon: Shield,
    },
    {
      title: 'US-Based Hosting',
      description: 'Data hosted in the United States via Supabase managed cloud infrastructure.',
      icon: Globe,
    },
    {
      title: 'Row Level Security',
      description: 'Database-enforced access controls ensure users only access their authorized data.',
      icon: Key,
    },
    {
      title: 'Authenticated Access',
      description: 'Supabase Auth with MFA support. Every API request authenticated and authorized.',
      icon: Lock,
    },
    {
      title: 'Audit Logging',
      description: 'Activity audit trails of user actions and data access stored in database tables.',
      icon: Eye,
    },
  ];

  const apiEndpoints = [
    {
      method: 'POST',
      endpoint: '/v1/chat/completions',
      description: 'Send a legal question and receive an AI-generated response with citations.',
    },
    {
      method: 'GET',
      endpoint: '/v1/documents/{id}',
      description: 'Retrieve generated documents, templates, or user-uploaded files.',
    },
    {
      method: 'POST',
      endpoint: '/v1/documents/generate',
      description: 'Generate legal documents based on provided parameters and jurisdiction.',
    },
    {
      method: 'GET',
      endpoint: '/v1/jurisdictions',
      description: 'List supported jurisdictions and their available practice areas.',
    },
    {
      method: 'POST',
      endpoint: '/v1/webhooks',
      description: 'Register webhooks for real-time event notifications.',
    },
    {
      method: 'GET',
      endpoint: '/v1/analytics/usage',
      description: 'Retrieve usage statistics and analytics for your organization.',
    },
  ];

  const legalTechEssentials = [
    {
      icon: Database,
      title: 'Data Retention & Isolation',
      items: [
        'Conversation data retained for 90 days by default (configurable)',
        'Per-tenant data isolation via Row Level Security',
        'Data export available on request (JSON/CSV)',
        'Data deletion within 30 days of account termination',
      ],
    },
    {
      icon: Eye,
      title: 'Zero Training on Client Data',
      items: [
        'Your users\' conversations are never used to train our models',
        'No data sharing with third-party AI providers for training',
        'OpenAI API used with zero-retention data processing agreement',
        'Audit-ready documentation available on request',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'UPL Boundaries & Disclaimers',
      items: [
        'All AI responses carry "legal information, not legal advice" disclaimers',
        'Configurable disclaimer text for white-label deployments',
        'Crisis escalation detection routes to human resources',
        'Attorney referral system for cases requiring licensed counsel',
      ],
    },
    {
      icon: FileText,
      title: 'Audit & Compliance',
      items: [
        'Full audit logs of all user actions and data access',
        'LSO compliance features for legal aid organizations',
        'Grant reporting dashboards with demographic tracking',
        'CCPA-compliant data handling with user consent management',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content">
        <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-12 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
                <Building2 className="w-4 h-4 text-gold-300" />
                <span className="text-sm font-semibold">Organization & Community Programs</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Enterprise-Grade Legal AI for Your Organization
              </h1>
              <p className="text-xl text-navy-300 mb-4">
                Whether you're deploying for your own team or offering access to the communities you serve,
                ezLegal.ai has a program built for you.
              </p>
              <p className="text-sm text-navy-400">
                <span className="font-semibold text-navy-300">Community programs</span> are for organizations that distribute or sponsor access for others.{' '}
                <span className="font-semibold text-navy-300">Organization plans</span> are for internal staff and team use.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">
              <Link
                to="/partner-hub"
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-teal-400/50 hover:bg-white/15 transition-all"
              >
                <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-teal-300" />
                </div>
                <h2 className="text-xl font-bold mb-2">Offer to My Community</h2>
                <p className="text-navy-300 text-sm mb-4">
                  Sponsor, refer, or white-label legal AI for the people and organizations you serve.
                  Referral revenue share, community access, and white-label models available.
                </p>
                <span className="inline-flex items-center gap-2 text-teal-300 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Community Models <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <a
                href="#integration"
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-gold-400/50 hover:bg-white/15 transition-all"
              >
                <div className="w-14 h-14 bg-gold-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-gold-300" />
                </div>
                <h2 className="text-xl font-bold mb-2">Buy for My Organization</h2>
                <p className="text-navy-300 text-sm mb-4">
                  Embed, integrate via API, or white-label for your internal team. Widget, API, and
                  enterprise deployment options with clear pricing.
                </p>
                <span className="inline-flex items-center gap-2 text-gold-300 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Organization Pricing <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Schedule a Demo
              </Link>
              <Link
                to="/partner-hub"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors text-sm"
              >
                Existing partner? Access Partner Portal
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b border-navy-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8 text-navy-400">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">SOC 2 Type II Infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">CCPA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">AES-256 Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">TLS 1.3 In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                <span className="text-sm font-medium">Zero Training on Client Data</span>
              </div>
            </div>
          </div>
        </section>

        <section id="integration" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Briefcase className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-navy-900">Organization Integration Pricing</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">Choose Your Integration Level</h2>
              <p className="text-navy-600 max-w-3xl mx-auto mb-4">
                Deploy legal AI for your internal team. From simple widget embedding to full white-label deployment -- pick the option that matches your technical resources.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link to="/pricing" className="text-teal-600 hover:text-navy-700 font-medium inline-flex items-center gap-1">
                  View individual/business pricing
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link to="/partner-hub" className="text-navy-500 hover:text-navy-700 font-medium inline-flex items-center gap-1">
                  Looking to distribute to a community instead?
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-16">
              {integrationTiers.map((tier, index) => (
                <div
                  key={index}
                  className={`rounded-2xl p-6 flex flex-col relative ${
                    index === 0
                      ? 'bg-gradient-to-b from-navy-50 to-white border-2 border-teal-500 shadow-xl'
                      : 'bg-navy-50 border border-navy-200'
                  }`}
                >
                  <div className="absolute -top-3 left-4 right-4">
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                      index === 0 ? 'bg-teal-500 text-white' :
                      index === 1 ? 'bg-navy-700 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      Recommended when: {tier.recommendedWhen}
                    </div>
                  </div>

                  <div className="mt-4 mb-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      tier.tier === 'Embed' ? 'bg-teal-100 text-navy-700' :
                      tier.tier === 'API' ? 'bg-teal-100 text-teal-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {tier.tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      index === 0 ? 'bg-teal-100' : 'bg-navy-200'
                    }`}>
                      <tier.icon className={`w-5 h-5 ${index === 0 ? 'text-teal-600' : 'text-navy-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-navy-900">{tier.title}</h3>
                      <p className="text-xs text-navy-500">{tier.subtitle}</p>
                    </div>
                  </div>

                  <div className="my-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-navy-900">{tier.price}</span>
                      <span className="text-navy-500 text-sm">{tier.pricePeriod}</span>
                    </div>
                    <p className="text-xs text-navy-500 mt-1">{tier.included}</p>
                  </div>

                  <div className="bg-navy-100 rounded-lg px-3 py-2 mb-4 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-navy-500 whitespace-nowrap">Billing unit:</span>
                      <span className="text-xs text-navy-700">{tier.billingUnit}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-navy-500 whitespace-nowrap">Overages:</span>
                      <span className="text-xs text-navy-700">{tier.overage}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-xs text-navy-500 whitespace-nowrap">Typical cost:</span>
                      <span className="text-xs font-semibold text-navy-800">{tier.typicalCost}</span>
                    </div>
                  </div>

                  <p className="text-sm text-navy-600 mb-3">{tier.description}</p>

                  <div className="bg-teal-50 rounded-lg px-3 py-2 mb-4">
                    <p className="text-xs text-navy-500">Ideal for:</p>
                    <p className="text-sm font-medium text-navy-700">{tier.idealFor}</p>
                  </div>

                  <ul className="space-y-2 flex-1 mb-4">
                    {tier.details.map((detail, dIndex) => (
                      <li key={dIndex} className="flex items-start gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {tier.notIncluded.length > 0 && (
                    <div className="mb-4 pt-3 border-t border-navy-200">
                      <p className="text-xs text-navy-400 mb-2">Not included:</p>
                      <ul className="space-y-1">
                        {tier.notIncluded.map((item, nIndex) => (
                          <li key={nIndex} className="flex items-center gap-2 text-xs text-navy-400">
                            <span className="w-3 h-3 rounded-full border border-navy-300 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mb-4 pt-3 border-t border-navy-200">
                    <p className="text-xs font-semibold text-navy-600 mb-2">Service Standards</p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      {Object.entries(tier.standards).map(([key, value]) => (
                        <div key={key} className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider text-navy-400">
                            {key === 'uptime' ? 'Target Uptime' : key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="text-xs font-medium text-navy-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <Link
                      to={tier.primaryLink}
                      className="w-full py-3 rounded-lg font-semibold text-center transition-colors block bg-teal-500 hover:bg-teal-600 text-white"
                    >
                      {tier.primaryText}
                    </Link>
                    <Link
                      to={tier.secondaryLink}
                      className="w-full py-2.5 rounded-lg font-medium text-center transition-colors block bg-navy-100 hover:bg-navy-200 text-navy-700 text-sm"
                    >
                      {tier.secondaryText}
                    </Link>
                    <p className="text-xs text-center text-navy-500 pt-1">{tier.trial}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-navy-50 rounded-2xl border border-navy-200 overflow-hidden">
              <div className="px-6 py-4 bg-navy-100 border-b border-navy-200">
                <h3 className="font-bold text-navy-900">Full Comparison</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navy-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-navy-700">Feature</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-teal-600">Widget</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-teal-600">API</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-amber-600">White Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-200">
                    {comparisonFeatures.map((row, index) => (
                      <tr key={index} className="hover:bg-navy-50">
                        <td className="px-6 py-3 text-sm font-medium text-navy-700">{row.feature}</td>
                        <td className="px-6 py-3 text-sm text-center text-navy-600">{row.widget}</td>
                        <td className="px-6 py-3 text-sm text-center text-navy-600">{row.api}</td>
                        <td className="px-6 py-3 text-sm text-center text-navy-600">{row.whiteLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                <Code className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-teal-900">API Reference</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">RESTful API Endpoints</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Comprehensive API for integrating legal AI capabilities into your applications.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
              <div className="bg-navy-900 px-6 py-4">
                <div className="flex items-center gap-2 text-navy-400 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-4 font-mono">api.ezlegal.ai</span>
                </div>
              </div>
              <div className="divide-y divide-navy-200">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="px-6 py-4 flex items-start gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {endpoint.method}
                    </span>
                    <div className="flex-1">
                      <code className="text-sm font-mono text-navy-900">{endpoint.endpoint}</code>
                      <p className="text-sm text-navy-600 mt-1">{endpoint.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-navy-50 px-6 py-4 border-t border-navy-200 flex flex-wrap items-center gap-6">
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold text-sm"
                >
                  <FileText className="w-4 h-4" />
                  Request Full API Documentation
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center gap-2 text-navy-500 hover:text-navy-700 font-medium text-sm"
                >
                  <Code className="w-4 h-4" />
                  Download Postman Collection
                </Link>
              </div>
            </div>

            <div className="mt-8 bg-teal-50 rounded-2xl p-6 border border-teal-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Quick Start Code Example</h3>
                  <div className="bg-navy-900 rounded-lg p-4 font-mono text-sm text-green-400 overflow-x-auto">
                    <pre>{`curl -X POST https://api.ezlegal.ai/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "What are the requirements for a valid will in California?",
    "jurisdiction": "CA",
    "include_citations": true
  }'`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Enterprise Security</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">Built for Enterprise Trust</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Security and compliance are foundational to our platform, not afterthoughts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityFeatures.map((feature, index) => (
                <div key={index} className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/trust-center#data-sovereignty"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
              >
                <Fingerprint className="w-4 h-4" />
                Read our Data Sovereignty Commitment
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full mb-4">
                <Server className="w-4 h-4 text-amber-700" />
                <span className="text-sm font-semibold text-amber-900">LegalTech Integration Essentials</span>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What Legal Organizations Need to Know</h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                Answers to the questions your security, compliance, and legal teams will ask before approving an integration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {legalTechEssentials.map((section, index) => (
                <div key={index} className="bg-white rounded-xl p-6 border border-navy-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-amber-700" />
                    </div>
                    <h3 className="font-bold text-navy-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, iIndex) => (
                      <li key={iIndex} className="flex items-start gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
              >
                <FileText className="w-4 h-4" />
                Request full security and compliance documentation
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-t border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-teal-100 px-3 py-1 rounded-full text-sm font-semibold text-teal-700 mb-4">
                  <Heart className="w-4 h-4" />
                  Community Programs
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-3">
                  Want to Offer Legal AI to Your Community Instead?
                </h2>
                <p className="text-navy-600 mb-4">
                  Refer, sponsor, or white-label ezLegal.ai for the people and organizations you serve. Full economics, commitments, and application form.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    Referral Partner -- Earn 20% revenue share
                  </li>
                  <li className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    Community Access -- Sponsor access from $2/member/mo
                  </li>
                  <li className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    White-Label -- Deploy under your own brand
                  </li>
                </ul>
                <Link
                  to="/partner-hub"
                  className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-teal-600/20"
                >
                  View Community Models
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="hidden md:flex flex-col items-center gap-3 flex-shrink-0">
                <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center">
                  <Handshake className="w-10 h-10 text-teal-600" />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-navy-900">Growing</div>
                  <div className="text-xs text-navy-500">Partner Network</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white border-t border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What Every Organization Gets</h2>
              <p className="text-navy-600">Comprehensive support and resources for successful deployment, regardless of integration level.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Technical Support</h3>
                <p className="text-sm text-navy-600">Email support (24hr) for Widget/API; dedicated manager for Enterprise</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Target Uptime</h3>
                <p className="text-sm text-navy-600">99.9% target standard; 99.95%+ for Enterprise (<Link to="/sla" className="text-teal-600 hover:text-teal-700 underline">view SLA details</Link>)</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Documentation</h3>
                <p className="text-sm text-navy-600">API docs, Postman collection, implementation guides, and code examples</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-rose-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">Analytics</h3>
                <p className="text-sm text-navy-600">Usage tracking, conversation analytics, and billing dashboards</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Integrate?</h2>
            <p className="text-teal-100 mb-8 max-w-2xl mx-auto">
              Schedule a technical deep-dive with our partnerships team. We'll discuss your use case,
              integration requirements, and demonstrate our platform capabilities.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-semibold hover:bg-navy-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Schedule Technical Demo
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/20 transition-colors"
              >
                <Users className="w-5 h-5" />
                Contact Partnerships
              </Link>
            </div>
            <p className="mt-8 text-navy-200 text-sm">
              Or email us directly at{' '}
              <a href="mailto:partners@ezlegal.ai" className="text-white underline">
                partners@ezlegal.ai
              </a>
            </p>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { Link } from 'react-router-dom';
import { Zap, Code, Share2, TrendingUp, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Benefit {
  icon: typeof Zap;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: Zap,
    title: 'White-Label Solution',
    description: 'Customize ezLegal.ai to match your brand and platform.',
  },
  {
    icon: Code,
    title: 'API Integration',
    description: 'Seamlessly integrate our legal AI into your systems.',
  },
  {
    icon: Share2,
    title: 'Revenue Share',
    description: 'Earn recurring revenue from each client you bring.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Support',
    description: 'Marketing materials and dedicated partner success team.',
  },
];

export default function ForPartners() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'Partner Program' : 'Programa de Asociados'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'Integrate legal AI into your platform and grow your business.'
                : 'Integra IA legal en tu plataforma y crece tu negocio.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white border border-slate-200 rounded-xl p-8"
                >
                  <Icon className="w-12 h-12 text-teal-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {en ? "Let's Work Together" : 'Trabajemos Juntos'}
            </h2>
            <p className="text-slate-700 mb-8">
              {en
                ? 'Interested in becoming a partner? Schedule a call with our partnerships team.'
                : 'Interesado en convertirse en socio? Programa una llamada con nuestro equipo de asociaciones.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/schedule-demo"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {en ? 'Schedule Demo' : 'Programar Demostración'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 border border-teal-600 text-teal-600 px-8 py-3 rounded-lg hover:bg-teal-50 transition-colors font-medium"
              >
                {en ? 'Contact Us' : 'Contáctanos'}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/PartnerHub.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 51.9 KB | 3.6 KB |
| Lines | 930 | 105 |
| Delta | — | 11% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Building2, Users, Globe, Shield, ArrowRight, CheckCircle,
  Zap, BookOpen, HeadphonesIcon,
  TrendingUp, ChevronRight, ExternalLink,
  Handshake, DollarSign, Lock, FileText, Heart,
  Megaphone, QrCode, LineChart, UserCheck,
  Code, ChevronDown, Star
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const PARTNER_MODELS = [
  {
    id: 'referral',
    icon: Megaphone,
    color: 'teal',
    startingAt: { en: 'Free to join', es: 'Gratis para unirse' },
    en: {
      name: 'Referral Partner',
      tagline: 'Share. Refer. Earn.',
      description: 'Share ezLegal with your community using your custom link, QR codes, and branded materials. You earn revenue share on every referred user who becomes a paid subscriber.',
      idealFor: 'Nonprofits, churches, community organizations, legal clinics, ESL programs',
      economics: [
        '20% revenue share on referred paid conversions',
        'No minimum volume requirements',
        'Monthly payouts via direct deposit',
        'Real-time referral tracking dashboard',
      ],
      commitments: [
        'Share resources with your community',
        'Display QR codes and flyers in your space',
        'Report quarterly on community reach',
      ],
    },
    es: {
      name: 'Aliado de Referencia',
      tagline: 'Comparte. Refiere. Gana.',
      description: 'Comparte ezLegal con tu comunidad usando tu enlace personalizado, codigos QR y materiales de marca. Ganas comision por cada usuario referido que se convierte en suscriptor.',
      idealFor: 'ONGs, iglesias, organizaciones comunitarias, clinicas legales, programas de ESL',
      economics: [
        '20% de comision sobre conversiones de pago referidas',
        'Sin requisitos minimos de volumen',
        'Pagos mensuales por deposito directo',
        'Panel de seguimiento de referidos en tiempo real',
      ],
      commitments: [
        'Compartir recursos con tu comunidad',
        'Colocar codigos QR y volantes en tu espacio',
        'Reportar trimestralmente sobre alcance comunitario',
      ],
    },
  },
  {
    id: 'sponsored',
    icon: Heart,
    color: 'green',
    highlight: true,
    startingAt: { en: 'From $2/member/mo', es: 'Desde $2/miembro/mes' },
    en: {
      name: 'Community Access Partner',
      tagline: 'Sponsor access for your members.',
      description: 'Pay a per-member or flat monthly fee so your community, clients, or constituents can access ezLegal for free on a branded portal with your logo and reporting.',
      idealFor: 'Government agencies, counties, large nonprofits with grant funding, bar associations, United Way chapters',
      economics: [
        'Per-member pricing starting at $2/member/month',
        'Flat-fee options for organizations under 500 members',
        'Volume discounts for 1,000+ members',
        'Grant-compatible invoicing and reporting',
      ],
      commitments: [
        'Define and verify your community/member base',
        'Co-brand deployment with your logo and colors',
        'Participate in quarterly impact review',
        'Minimum 6-month engagement',
      ],
    },
    es: {
      name: 'Aliado de Acceso Comunitario',
      tagline: 'Patrocina acceso para tus miembros.',
      description: 'Paga por miembro o tarifa mensual fija para que tu comunidad, clientes o constituyentes accedan a ezLegal gratis en un portal con tu marca y reportes.',
      idealFor: 'Agencias gubernamentales, condados, grandes ONGs con financiamiento, colegios de abogados, capitulos de United Way',
      economics: [
        'Precio por miembro desde $2/miembro/mes',
        'Opciones de tarifa fija para organizaciones con menos de 500 miembros',
        'Descuentos por volumen para 1,000+ miembros',
        'Facturacion y reportes compatibles con subvenciones',
      ],
      commitments: [
        'Definir y verificar tu base comunitaria/miembros',
        'Co-brandar el despliegue con tu logo y colores',
        'Participar en revision de impacto trimestral',
        'Compromiso minimo de 6 meses',
      ],
    },
  },
  {
    id: 'whitelabel',
    icon: Building2,
    color: 'navy',
    startingAt: { en: 'Custom pricing', es: 'Precio personalizado' },
    en: {
      name: 'White-Label Partner',
      tagline: 'Your brand. Our AI. Their trust.',
      description: 'Deploy the full ezLegal platform under your own brand with a custom domain, dedicated infrastructure, and tailored AI configuration. No ezLegal branding visible to your end users.',
      idealFor: 'Legal aid networks, state bar associations, large law firms, enterprise legal departments, technology integrators',
      economics: [
        'Platform licensing fee (annual contract)',
        'Usage-based tiers with predictable billing',
        'Custom SLA with uptime guarantees',
        'Pricing structured for enterprise procurement',
      ],
      commitments: [
        'Dedicated integration and brand alignment',
        'Minimum 12-month contract',
        'Designated partner success contact',
        'Quarterly business reviews',
      ],
    },
    es: {
      name: 'Aliado de Marca Blanca',
      tagline: 'Tu marca. Nuestra IA. Su confianza.',
      description: 'Despliega la plataforma completa de ezLegal bajo tu propia marca con dominio personalizado, infraestructura dedicada y configuracion de IA adaptada.',
      idealFor: 'Redes de ayuda legal, colegios de abogados estatales, grandes firmas de abogados, departamentos legales empresariales, integradores de tecnologia',
      economics: [
        'Licencia de plataforma (contrato anual)',
        'Niveles basados en uso con facturacion predecible',
        'SLA personalizado con garantias de disponibilidad',
        'Precios estructurados para adquisiciones empresariales',
      ],
      commitments: [
        'Integracion dedicada y alineacion de marca',
        'Contrato minimo de 12 meses',
        'Contacto designado para exito del aliado',
        'Revisiones de negocio trimestrales',
      ],
    },
  },
];

const PARTNER_BENEFITS = [
  {
    icon: LineChart,
    en: { title: 'Partner Dashboard', desc: 'Real-time analytics on referrals, usage, conversions, and community impact -- all in one place.' },
    es: { title: 'Panel de Aliado', desc: 'Analitica en tiempo real sobre referidos, uso, conversiones e impacto comunitario -- todo en un solo lugar.' },
  },
  {
    icon: Globe,
    en: { title: 'Bilingual by Default', desc: 'All partner materials, flyers, social posts, and the platform itself are available in English and Spanish.' },
    es: { title: 'Bilingue por Defecto', desc: 'Todos los materiales, volantes, posts sociales y la plataforma estan disponibles en ingles y espanol.' },
  },
  {
    icon: QrCode,
    en: { title: 'Branded Materials', desc: 'Custom QR codes, printable flyers, social media templates, and co-branded collateral -- ready to distribute.' },
    es: { title: 'Materiales de Marca', desc: 'Codigos QR personalizados, volantes impresos, plantillas para redes sociales y material co-branded -- listos para distribuir.' },
  },
  {
    icon: UserCheck,
    en: { title: 'Dedicated Partner Success', desc: 'Every partner gets a named success manager for onboarding, troubleshooting, and quarterly reviews.' },
    es: { title: 'Exito de Aliado Dedicado', desc: 'Cada aliado tiene un gerente de exito asignado para incorporacion, resolucion de problemas y revisiones trimestrales.' },
  },
  {
    icon: FileText,
    en: { title: 'Impact Reporting', desc: 'Monthly reports on users served, questions answered, topics covered, and community demographics.' },
    es: { title: 'Reportes de Impacto', desc: 'Reportes mensuales sobre usuarios atendidos, preguntas respondidas, temas cubiertos y demografia comunitaria.' },
  },
  {
    icon: Shield,
    en: { title: 'Compliance & Security', desc: 'SOC 2-aligned security, clear UPL disclaimers, data privacy controls, and audit-ready documentation.' },
    es: { title: 'Cumplimiento y Seguridad', desc: 'Seguridad alineada con SOC 2, avisos claros de UPL, controles de privacidad de datos y documentacion lista para auditoria.' },
  },
];

const PIPELINE_STEPS = [
  { en: 'Apply', es: 'Solicitar', icon: BookOpen },
  { en: 'Discovery Call', es: 'Llamada Inicial', icon: HeadphonesIcon },
  { en: 'Pilot (30 days)', es: 'Piloto (30 dias)', icon: Zap },
  { en: 'Onboarding', es: 'Incorporacion', icon: Star },
  { en: 'Go Live', es: 'En Vivo', icon: TrendingUp },
];

function getModelColors(color: string) {
  const map: Record<string, { bg: string; border: string; accent: string; icon: string }> = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', accent: 'text-teal-700', icon: 'text-teal-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', accent: 'text-green-700', icon: 'text-green-600' },
    navy: { bg: 'bg-navy-50', border: 'border-navy-200', accent: 'text-navy-700', icon: 'text-navy-600' },
  };
  return map[color] || map.teal;
}

export default function PartnerHub() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const es = language === 'es';
  const [searchParams] = useSearchParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    organization_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    partner_model: '',
    partner_type: 'nonprofit',
    community_size: '',
    language_preference: language,
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData(prev => ({ ...prev, notes: `Referral: ${ref}` }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await supabase.from('partners').insert({
        organization_name: formData.organization_name,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || null,
        website: formData.website || null,
        partner_type: formData.partner_type,
        language_preference: formData.language_preference,
        notes: [
          formData.partner_model ? `Model: ${formData.partner_model}` : '',
          formData.community_size ? `Community Size: ${formData.community_size}` : '',
          formData.notes,
        ].filter(Boolean).join(' | '),
        pipeline_stage: 'lead',
        source: searchParams.get('utm_source') || 'partner_hub',
        metadata: {
          utm_campaign: searchParams.get('utm_campaign'),
          utm_medium: searchParams.get('utm_medium'),
          referral_code: searchParams.get('ref'),
          selected_model: formData.partner_model,
          community_size: formData.community_size,
        },
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">

        <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-green-500 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
                <Handshake className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-300">
                  {es ? 'Programa de Alianzas' : 'Partner Program'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {es
                  ? 'Lleva Acceso Legal a Tu Comunidad'
                  : 'Bring Legal Access to Your Community'}
              </h1>
              <p className="text-lg text-navy-200 mb-4 leading-relaxed">
                {es
                  ? 'Ya seas una ONG compartiendo recursos, un gobierno patrocinando acceso, o una empresa desplegando nuestra IA bajo tu marca -- hay un modelo de alianza para ti.'
                  : "Whether you're a nonprofit sharing resources, a government sponsoring access, or an enterprise deploying our AI under your brand -- there's a partnership model for you."}
              </p>
              <p className="text-sm text-navy-400 mb-8">
                {es
                  ? 'Buscas comprar ezLegal directamente para tu organizacion?'
                  : 'Looking to buy ezLegal directly for your organization?'}
                {' '}
                <Link to="/pricing" className="text-teal-400 hover:text-teal-300 underline">
                  {es ? 'Ver Planes y Precios' : 'See Plans & Pricing'}
                </Link>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                    >
                      {es ? 'Acceder al Portal de Aliados' : 'Access Partner Portal'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="#apply"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-500 text-white rounded-xl font-semibold hover:bg-navy-700 transition-all"
                    >
                      {es ? 'Solicitar Nuevo Modelo' : 'Apply for a New Model'}
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="#apply"
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                    >
                      {es ? 'Solicitar Alianza' : 'Apply to Partner'}
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <Link
                      to="/schedule-demo"
                      className="inline-flex items-center gap-2 px-8 py-3.5 border border-navy-500 text-white rounded-xl font-semibold hover:bg-navy-700 transition-all"
                    >
                      {es ? 'Agendar Llamada' : 'Schedule a Discovery Call'}
                    </Link>
                  </>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 border-t border-navy-700/50 pt-8">
                {[
                  { value: '50', en: 'U.S. States', es: 'Estados' },
                  { value: '24/7', en: 'AI Availability', es: 'Disponibilidad IA' },
                  { value: '99.9%', en: 'Target Uptime', es: 'Meta de Disponibilidad' },
                  { value: '2', en: 'Languages', es: 'Idiomas' },
                ].map(stat => (
                  <div key={stat.en} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-navy-400 mt-1">{es ? stat.es : stat.en}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">
                    {es ? 'Quieres ofrecer ezLegal a tu comunidad?' : 'Want to offer ezLegal to your community?'}
                  </h3>
                  <p className="text-xs text-navy-600 mb-2">
                    {es
                      ? 'Estas en el lugar correcto. Explora nuestros modelos de alianza abajo.'
                      : "You're in the right place. Explore our partnership models below."}
                  </p>
                  <a href="#models" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                    {es ? 'Ver modelos' : 'See models'} <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-navy-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">
                    {es ? 'Comprando para uso interno de tu organizacion?' : "Buying for your organization's internal use?"}
                  </h3>
                  <p className="text-xs text-navy-600 mb-2">
                    {es
                      ? 'Consulta nuestros planes directos de suscripcion para organizaciones en la pagina de precios.'
                      : 'Check our direct subscription plans for organizations on the pricing page.'}
                  </p>
                  <Link to="/pricing?tab=organizations" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1">
                    {es ? 'Ver precios' : 'View pricing'} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="models" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Como Quieres Trabajar con Nosotros?' : 'How Do You Want to Work With Us?'}
              </h2>
              <p className="text-navy-600 max-w-2xl mx-auto">
                {es
                  ? 'Elige el modelo que se ajuste a tu organizacion. Cada uno tiene su propia estructura economica, compromisos y herramientas.'
                  : 'Choose the model that fits your organization. Each has its own economics, commitments, and enablement tools.'}
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {PARTNER_MODELS.map(model => {
                const m = es ? model.es : model.en;
                const colors = getModelColors(model.color);
                const Icon = model.icon;
                return (
                  <div
                    key={model.id}
                    className={`relative rounded-2xl border-2 ${
                      model.highlight ? 'border-green-400 shadow-xl shadow-green-100' : colors.border
                    } bg-white overflow-hidden flex flex-col`}
                  >
                    {model.highlight && (
                      <div className="bg-green-600 text-white text-center py-1.5 text-xs font-bold uppercase tracking-wider">
                        {es ? 'Mas Solicitado' : 'Most Requested'}
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-navy-900">{m.name}</h3>
                          <p className={`text-sm ${colors.accent} font-medium`}>{m.tagline}</p>
                        </div>
                      </div>
                      <div className={`${colors.bg} rounded-lg px-3 py-2 mb-4`}>
                        <span className={`text-lg font-bold ${colors.accent}`}>
                          {es ? model.startingAt.es : model.startingAt.en}
                        </span>
                      </div>

                      <p className="text-sm text-navy-600 mb-4 leading-relaxed">{m.description}</p>

                      <div className="mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                          {es ? 'Ideal para' : 'Ideal for'}
                        </span>
                        <p className="text-xs text-navy-500 mt-1">{m.idealFor}</p>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 mb-2">
                          <DollarSign className={`w-3.5 h-3.5 ${colors.icon}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                            {es ? 'Economia' : 'Economics'}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.economics.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle className={`w-3.5 h-3.5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                              <span className="text-xs text-navy-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Handshake className={`w-3.5 h-3.5 ${colors.icon}`} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.accent}`}>
                            {es ? 'Tu Compromiso' : 'Your Commitment'}
                          </span>
                        </div>
                        <ul className="space-y-1.5">
                          {m.commitments.map(item => (
                            <li key={item} className="flex items-start gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-navy-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href="#apply"
                        className={`mt-auto block text-center py-3 rounded-xl font-semibold transition-all text-sm ${
                          model.highlight
                            ? 'bg-green-600 text-white hover:bg-green-500'
                            : 'bg-navy-900 text-white hover:bg-navy-800'
                        }`}
                      >
                        {es ? `Solicitar: ${m.name}` : `Apply: ${m.name}`}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-navy-500">
                {es
                  ? 'No sabes cual modelo es el adecuado?'
                  : "Not sure which model is right?"}
                {' '}
                <Link to="/schedule-demo" className="text-teal-600 hover:text-teal-700 font-semibold underline">
                  {es ? 'Habla con nuestro equipo' : 'Talk to our team'}
                </Link>
                {' '}
                {es ? '-- te ayudamos a elegir.' : "-- we'll help you decide."}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Lo Que Recibe Cada Aliado' : 'What Every Partner Gets'}
              </h2>
              <p className="text-navy-600 max-w-xl mx-auto">
                {es
                  ? 'Sin importar el modelo que elijas, todos los aliados reciben estas herramientas y soporte.'
                  : 'Regardless of which model you choose, every partner receives these tools and support.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PARTNER_BENEFITS.map(benefit => {
                const b = es ? benefit.es : benefit.en;
                const Icon = benefit.icon;
                return (
                  <div key={b.title} className="bg-white rounded-xl p-6 border border-navy-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-1">{b.title}</h3>
                    <p className="text-sm text-navy-600 leading-relaxed">{b.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Pruebas y Seguridad' : 'Proof & Risk Controls'}
              </h2>
              <p className="text-navy-600 max-w-xl mx-auto">
                {es
                  ? 'Sabemos que las alianzas en tecnologia legal requieren confianza. Esto es lo que puedes compartir con tu equipo legal y de adquisiciones.'
                  : 'We know LegalTech partnerships require trust. Here is what you can share with your legal and procurement teams.'}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-900">{es ? 'Seguridad de Datos' : 'Data Security'}</h3>
                </div>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Cifrado AES-256 en reposo y en transito' : 'AES-256 encryption at rest and in transit'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Controles de acceso alineados con SOC 2' : 'SOC 2-aligned access controls'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Politicas de retencion de datos configurables' : 'Configurable data retention policies'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'DPA disponible para aliados empresariales' : 'DPA available for enterprise partners'}</li>
                </ul>
              </div>
              <div className="bg-navy-50 rounded-xl p-6 border border-navy-100">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-navy-700" />
                  <h3 className="font-bold text-navy-900">{es ? 'Limites de la IA y UPL' : 'AI Boundaries & UPL'}</h3>
                </div>
                <ul className="space-y-2 text-sm text-navy-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Avisos claros: informacion legal, no asesoria legal' : 'Clear disclaimers: legal information, not legal advice'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Nunca se implica relacion abogado-cliente' : 'No attorney-client relationship implied'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Escalamiento a abogados reales integrado' : 'Escalation to real attorneys built in'}</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />{es ? 'Registros de auditoria para cumplimiento y gobernanza' : 'Audit logs for compliance and governance'}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
              {es ? 'Como Funciona' : 'How It Works'}
            </h2>
            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
              {PIPELINE_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.en} className="flex-1 flex flex-col items-center text-center relative">
                    <div className="w-14 h-14 bg-teal-50 border-2 border-teal-200 rounded-full flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
                      {es ? `Paso ${index + 1}` : `Step ${index + 1}`}
                    </div>
                    <p className="font-semibold text-navy-900 text-sm">{es ? step.es : step.en}</p>
                    {index < PIPELINE_STEPS.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[60%] w-[80%] border-t-2 border-dashed border-navy-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Preguntas Frecuentes de Aliados' : 'Partner Program FAQ'}
              </h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  en: { q: 'How do partners make money?', a: 'Referral Partners earn 20% revenue share on every paid subscriber they refer. Community Access Partners negotiate per-member or flat-fee pricing funded by grants or organizational budgets. White-Label Partners license the platform at an annual contract rate with usage-based tiers.' },
                  es: { q: 'Como ganan dinero los aliados?', a: 'Los Aliados de Referencia ganan 20% de comision por cada suscriptor pagado que refieren. Los Aliados de Acceso Comunitario negocian precios por miembro o tarifa fija financiados por subvenciones o presupuestos organizacionales. Los Aliados de Marca Blanca licencian la plataforma con contrato anual y niveles basados en uso.' },
                },
                {
                  en: { q: 'What are the eligibility requirements?', a: 'We partner with nonprofits, legal aid organizations, government agencies, bar associations, community organizations, churches, and enterprises. You need a defined community or member base and a willingness to participate in quarterly impact reviews. There are no minimum size requirements for Referral Partners.' },
                  es: { q: 'Cuales son los requisitos de elegibilidad?', a: 'Nos asociamos con ONGs, organizaciones de ayuda legal, agencias gubernamentales, colegios de abogados, organizaciones comunitarias, iglesias y empresas. Necesitas una base comunitaria o de miembros definida y disposicion a participar en revisiones de impacto trimestrales. No hay requisitos minimos de tamano para Aliados de Referencia.' },
                },
                {
                  en: { q: 'How long does the onboarding process take?', a: 'Referral Partners can be active within 48 hours after approval. Community Access Partners typically launch within 2-4 weeks depending on co-branding requirements. White-Label deployments take 4-8 weeks for full brand alignment and infrastructure setup.' },
                  es: { q: 'Cuanto tiempo toma el proceso de incorporacion?', a: 'Los Aliados de Referencia pueden estar activos dentro de 48 horas despues de la aprobacion. Los Aliados de Acceso Comunitario generalmente lanzan en 2-4 semanas dependiendo de los requisitos de co-branding. Las implementaciones de Marca Blanca toman 4-8 semanas para la alineacion completa de marca e infraestructura.' },
                },
                {
                  en: { q: 'Is there a cost to become a partner?', a: 'Referral Partners pay nothing -- you earn from referrals. Community Access Partners pay per-member pricing (starting at $2/member/month) or negotiate flat-fee options. White-Label Partners pay annual platform licensing. All models include partner success support at no extra cost.' },
                  es: { q: 'Hay algun costo para convertirse en aliado?', a: 'Los Aliados de Referencia no pagan nada -- ganan por referidos. Los Aliados de Acceso Comunitario pagan precio por miembro (desde $2/miembro/mes) o negocian opciones de tarifa fija. Los Aliados de Marca Blanca pagan licencia anual de plataforma. Todos los modelos incluyen soporte de exito de aliado sin costo adicional.' },
                },
                {
                  en: { q: 'Can I use grant funding to pay for a partnership?', a: 'Yes. Our Community Access and White-Label models are structured for grant-compatible invoicing. We provide impact reporting, demographic tracking, and funder-ready documentation to support your grant requirements.' },
                  es: { q: 'Puedo usar fondos de subvenciones para pagar una alianza?', a: 'Si. Nuestros modelos de Acceso Comunitario y Marca Blanca estan estructurados para facturacion compatible con subvenciones. Proporcionamos informes de impacto, seguimiento demografico y documentacion lista para financiadores para apoyar tus requisitos de subvencion.' },
                },
                {
                  en: { q: 'What if I need technical integration (API, widgets)?', a: 'Visit our Technical Integration page for details on embed widgets, API access, and white-label deployment options with full pricing and comparison tables.' },
                  es: { q: 'Que pasa si necesito integracion tecnica (API, widgets)?', a: 'Visita nuestra pagina de Integracion Tecnica para detalles sobre widgets embebidos, acceso a API y opciones de implementacion de marca blanca con precios y tablas comparativas completas.' },
                },
              ].map((faq, idx) => {
                const f = es ? faq.es : faq.en;
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-navy-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-navy-50 transition-colors"
                    >
                      <span className="font-semibold text-navy-900 pr-4">{f.q}</span>
                      <ChevronDown className={`w-5 h-5 text-navy-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-sm text-navy-600 leading-relaxed">{f.a}</p>
                        {idx === 5 && (
                          <Link to="/for-partners" className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-semibold mt-2">
                            {es ? 'Ver Integracion Tecnica' : 'View Technical Integration'} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-navy-200 p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Code className="w-8 h-8 text-teal-600" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-bold text-navy-900 mb-2">
                  {es ? 'Necesitas Integracion Tecnica?' : 'Need Technical Integration?'}
                </h3>
                <p className="text-sm text-navy-600 mb-1">
                  {es
                    ? 'Para equipos de desarrollo que quieren integrar via API, incrustar widgets, o desplegar una solucion de marca blanca completa.'
                    : 'For development teams looking to integrate via API, embed widgets, or deploy a full white-label solution.'}
                </p>
                <p className="text-xs text-navy-500">
                  {es
                    ? 'Widget desde $79/mes -- API a $0.02/consulta -- Marca Blanca a precio personalizado'
                    : 'Widget from $79/mo -- API at $0.02/query -- White-Label custom pricing'}
                </p>
              </div>
              <Link
                to="/for-partners"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-800 transition-all flex-shrink-0"
              >
                {es ? 'Ver Opciones Tecnicas' : 'View Technical Options'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="apply" className="py-16 bg-navy-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-3">
                {es ? 'Solicitar Alianza' : 'Apply to Partner'}
              </h2>
              <p className="text-navy-600">
                {es
                  ? 'Completa el formulario y nuestro equipo se pondra en contacto dentro de 2 dias habiles.'
                  : "Fill out the form below and our team will be in touch within 2 business days."}
              </p>
            </div>

            {submitted ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-navy-200 shadow-sm">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-navy-900 mb-2">
                  {es ? 'Solicitud Recibida' : 'Application Received'}
                </h3>
                <p className="text-navy-600 mb-6">
                  {es
                    ? 'Gracias por su interes. Nuestro equipo de alianzas revisara su solicitud y se pondra en contacto dentro de 2 dias habiles.'
                    : "Thank you for your interest. Our partnerships team will review your application and reach out within 2 business days."}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/media-kit" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                    {es ? 'Ver Kit de Medios' : 'View Media Kit'} <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link to="/schedule-demo" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold">
                    {es ? 'Agendar Llamada' : 'Schedule a Call'} <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-navy-200 shadow-sm space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Nombre de la Organizacion' : 'Organization Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organization_name}
                      onChange={e => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Nombre de Contacto' : 'Contact Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={e => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Correo Electronico' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={e => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Telefono' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={e => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Tipo de Organizacion' : 'Organization Type'} *
                    </label>
                    <select
                      required
                      value={formData.partner_type}
                      onChange={e => setFormData(prev => ({ ...prev, partner_type: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="nonprofit">{es ? 'ONG / Sin Fines de Lucro' : 'Nonprofit / NGO'}</option>
                      <option value="legal_aid">{es ? 'Organizacion de Ayuda Legal' : 'Legal Aid Organization'}</option>
                      <option value="government">{es ? 'Agencia Gubernamental / Condado' : 'Government Agency / County'}</option>
                      <option value="bar_association">{es ? 'Colegio de Abogados' : 'Bar Association'}</option>
                      <option value="enterprise">{es ? 'Empresa / Firma Legal' : 'Enterprise / Law Firm'}</option>
                      <option value="community_org">{es ? 'Organizacion Comunitaria / Iglesia' : 'Community Organization / Church'}</option>
                      <option value="other">{es ? 'Otro' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Modelo de Interes' : 'Partnership Model of Interest'}
                    </label>
                    <select
                      value={formData.partner_model}
                      onChange={e => setFormData(prev => ({ ...prev, partner_model: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">{es ? 'No estoy seguro / Ayudame a decidir' : "Not sure / Help me decide"}</option>
                      <option value="referral">{es ? 'Aliado de Referencia (ganar por referidos)' : 'Referral Partner (earn on referrals)'}</option>
                      <option value="sponsored">{es ? 'Acceso Comunitario (patrocinar acceso)' : 'Community Access (sponsor access)'}</option>
                      <option value="whitelabel">{es ? 'Marca Blanca (desplegar bajo tu marca)' : 'White-Label (deploy under your brand)'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Tamano de Comunidad' : 'Community / Member Size'}
                    </label>
                    <select
                      value={formData.community_size}
                      onChange={e => setFormData(prev => ({ ...prev, community_size: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    >
                      <option value="">{es ? 'Seleccionar' : 'Select'}</option>
                      <option value="under-100">{es ? 'Menos de 100' : 'Under 100'}</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-5000">1,000 - 5,000</option>
                      <option value="5000+">5,000+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-navy-800 mb-1">
                      {es ? 'Sitio Web' : 'Website'}
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                      placeholder="https://"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-navy-800 mb-1">
                    {es ? 'Notas Adicionales' : 'Additional Notes'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                    placeholder={es
                      ? 'Cuentanos sobre tu comunidad y como planeas usar ezLegal...'
                      : 'Tell us about your community and how you plan to use ezLegal...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      {es ? 'Enviar Solicitud' : 'Submit Application'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-navy-400 text-center">
                  {es
                    ? 'Al enviar, acepta nuestros terminos de servicio. ezLegal.ai proporciona informacion legal, no asesoria legal.'
                    : 'By submitting, you agree to our terms of service. ezLegal.ai provides legal information, not legal advice.'}
                </p>
              </form>
            )}
          </div>
        </section>

        <section className="bg-navy-900 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              {es ? 'Preguntas? Habla con Nuestro Equipo' : 'Questions? Talk to Our Team'}
            </h2>
            <p className="text-navy-300 mb-2">
              {es ? 'Escribenos a' : 'Email us at'}{' '}
              <a href="mailto:partners@ezlegal.ai" className="text-teal-400 hover:text-teal-300 font-semibold">
                partners@ezlegal.ai
              </a>
            </p>
            <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
              <Link to="/schedule-demo" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Agendar Demo' : 'Schedule a Demo'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/media-kit" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Kit de Medios' : 'Media Kit'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/for-partners" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Integracion Tecnica' : 'Technical Integration'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <Link to="/contact" className="text-sm text-navy-300 hover:text-white transition-colors flex items-center gap-1.5">
                {es ? 'Contactar Ventas' : 'Contact Sales'} <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

```

### CURRENT VERSION

```tsx
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Code, Zap, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Resource {
  icon: typeof BookOpen;
  title: string;
  description: string;
  url: string;
}

const RESOURCES: Resource[] = [
  {
    icon: BookOpen,
    title: 'Integration Guide',
    description: 'Complete API documentation and implementation examples.',
    url: '/partner-hub/api-docs',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Real-time metrics on user engagement and conversions.',
    url: '/partner-hub/analytics',
  },
  {
    icon: Code,
    title: 'Code Samples',
    description: 'Ready-to-use code examples for common integrations.',
    url: '/partner-hub/samples',
  },
  {
    icon: Zap,
    title: 'Quick Start',
    description: 'Get up and running in 30 minutes.',
    url: '/partner-hub/quickstart',
  },
];

export default function PartnerHub() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Partner Hub' : 'Centro de Asociados'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Resources, APIs, and analytics for our partner ecosystem.'
                : 'Recursos, APIs y análisis para nuestro ecosistema de asociados.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;
              return (
                <Link
                  key={resource.title}
                  to={resource.url}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Icon className="w-8 h-8 text-teal-600" />
                    <ArrowRight className="w-5 h-5 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-slate-600">{resource.description}</p>
                </Link>
              );
            })}
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {en ? 'Need Help?' : 'Necesitas Ayuda?'}
            </h2>
            <p className="text-slate-700 mb-6">
              {en
                ? 'Our partner success team is here to support your integration.'
                : 'Nuestro equipo de éxito de asociados está aquí para apoyar tu integración.'}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Contact Support' : 'Contactar Soporte'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/CasePredictor.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 32.0 KB | 36.4 KB |
| Lines | 524 | 609 |
| Delta | — | 116% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Sparkles, CheckCircle, ArrowRight, Shield, AlertTriangle,
  BarChart3, FileText, Scale, Brain, Clock, Lock, Users, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import CoverageConfidenceIndicator from '../components/CoverageConfidenceIndicator';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import { AttorneyServiceDisclosure } from '../components/shared';

export default function CasePredictor() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sampleExpanded, setSampleExpanded] = useState(false);

  const startPrediction = () => {
    navigate('/case-predictor/start');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <VerifiableTrustStrip className="mt-[73px]" />
      <Breadcrumbs />

      <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-teal-800 to-teal-900 py-10 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-teal-100 mb-6">
                  <Sparkles className="w-4 h-4 text-gold-300" />
                  {language === 'en' ? 'AI CASE PREDICTOR' : 'PREDICTOR DE CASOS IA'}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  {language === 'en'
                    ? 'Should You Fight Your Case?'
                    : 'Debes Pelear Tu Caso?'
                  }
                </h1>
                <p className="text-base sm:text-xl text-teal-100 mb-6 sm:mb-8 leading-relaxed">
                  {language === 'en'
                    ? 'See how likely you are to win in 2\u20133 minutes. Built for renters, workers, and small businesses \u2014 not lawyers.'
                    : 'Ve que tan probable es que ganes en 2\u20133 minutos. Hecho para inquilinos, trabajadores y pequeños negocios.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    onClick={startPrediction}
                    className="bg-white text-teal-800 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {language === 'en' ? 'Start Free \u2014 2 min' : 'Comenzar Gratis \u2014 2 min'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-teal-100">
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-300" /> {language === 'en' ? '2\u20133 min' : '2\u20133 min'}</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold-300" /> {language === 'en' ? '1st prediction free' : '1ra gratis'}</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-gold-300" /> {language === 'en' ? 'Private & secure' : 'Privado'}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20 relative">
                <div className="absolute top-3 right-3 bg-amber-400/90 text-navy-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {language === 'en' ? 'Example' : 'Ejemplo'}
                </div>
                <div className="mb-4 sm:mb-6 pr-20 sm:pr-0 sm:text-center">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{language === 'en' ? 'Sample Report' : 'Informe de Ejemplo'}</h3>
                  <p className="text-teal-200 text-xs sm:text-sm">{language === 'en' ? 'Eviction Defense \u2014 Arizona' : 'Defensa de Desalojo \u2014 Arizona'}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-teal-200 text-xs sm:text-sm font-medium">{language === 'en' ? 'Likely outcome' : 'Resultado probable'}</span>
                      <span className="text-2xl font-bold text-green-400 font-serif">65-78%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '72%' }} />
                    </div>
                    <p className="text-teal-100 text-xs mt-2">{language === 'en' ? 'Chance of winning an eviction defense' : 'Probabilidad de ganar una defensa'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSampleExpanded(!sampleExpanded)}
                    className="sm:hidden w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
                    aria-expanded={sampleExpanded}
                  >
                    {sampleExpanded
                      ? (language === 'en' ? 'Hide details' : 'Ocultar detalles')
                      : (language === 'en' ? 'See what\u2019s inside a report' : 'Ver que incluye un informe')}
                    {sampleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className={`${sampleExpanded ? 'block' : 'hidden'} sm:block space-y-4`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white font-serif">{language === 'en' ? 'Hundreds' : 'Cientos'}</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Similar cases compared' : 'Casos similares comparados'}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white font-serif">5</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Key factors identified' : 'Factores clave'}</div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-teal-200 text-xs font-medium mb-2">{language === 'en' ? 'TOP FACTORS IN YOUR FAVOR:' : 'FACTORES A TU FAVOR:'}</p>
                      <ul className="space-y-1.5">
                        {[
                          language === 'en' ? 'Written lease violation by landlord' : 'Violacion escrita del arrendador',
                          language === 'en' ? 'Notice period not met (ARS 33-1368)' : 'Periodo de aviso no cumplido',
                          language === 'en' ? 'Habitability complaints documented' : 'Quejas de habitabilidad documentadas',
                        ].map((text, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-teal-100">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-teal-300/70 text-[10px] text-center italic mt-3 border-t border-white/10 pt-2">
                      {language === 'en'
                        ? 'Fictional example. Actual reports are based on your specific case details.'
                        : 'Ejemplo ficticio. Los informes reales se basan en los detalles de tu caso.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                {language === 'en' ? 'How the Case Predictor Works' : 'Como Funciona el Predictor'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Takes about 2\u20133 minutes. You can review your results before subscribing.'
                  : 'Toma unos 2\u20133 minutos. Puedes ver tus resultados antes de suscribirte.'}
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: language === 'en' ? 'Share Details' : 'Comparte Detalles',
                  desc: language === 'en'
                    ? 'Tell us your case type, state, and key facts.'
                    : 'Dinos el tipo de caso, estado y hechos clave.',
                },
                {
                  icon: Brain,
                  title: language === 'en' ? 'AI Analysis' : 'Analisis IA',
                  desc: language === 'en'
                    ? 'Our model compares your case to similar outcomes in your state.'
                    : 'Nuestro modelo compara tu caso con resultados similares.',
                },
                {
                  icon: BarChart3,
                  title: language === 'en' ? 'Get Your Estimate' : 'Obtén Tu Estimacion',
                  desc: language === 'en'
                    ? 'See an estimated likelihood range and confidence level.'
                    : 'Ve un rango de probabilidad estimado y nivel de confianza.',
                },
                {
                  icon: ArrowRight,
                  title: language === 'en' ? 'Get Next Steps' : 'Proximos Pasos',
                  desc: language === 'en'
                    ? 'Key factors and practical actions, including when to consult an attorney.'
                    : 'Factores clave y acciones practicas, incluyendo cuando consultar un abogado.',
                },
              ].map((item, i) => (
                <div key={item.title} className="text-center group">
                  <div className="w-14 h-14 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <item.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">{i + 1}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'en' ? 'Start Free Case Prediction' : 'Iniciar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-navy-400 mt-3">
                {language === 'en'
                  ? 'Not legal advice. Statistical estimate only. No attorney-client relationship created.'
                  : 'No es asesoramiento legal. Solo estimacion estadistica.'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'What You Get' : 'Que Obtienes'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Every prediction includes four deliverables in one report.'
                  : 'Cada prediccion incluye cuatro entregables en un informe.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Estimated Likelihood Range' : 'Rango de Probabilidad Estimado'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'A percentage range\u2014with a confidence level\u2014based on comparable cases in your jurisdiction. Not a guarantee.'
                    : 'Un rango de porcentaje con nivel de confianza basado en casos comparables en tu jurisdiccion.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Key Factor Analysis' : 'Analisis de Factores Clave'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'The factors most likely to increase or decrease your estimated likelihood\u2014ranked by impact.'
                    : 'Los factores que mas aumentan o reducen tu probabilidad estimada, clasificados por impacto.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Similar Case Comparisons' : 'Comparaciones de Casos Similares'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Examples of comparable cases in your state and how they were resolved, so you can see the pattern.'
                    : 'Ejemplos de casos comparables en tu estado y como se resolvieron para que puedas ver el patron.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Recommended Next Steps' : 'Proximos Pasos Recomendados'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Practical next actions based on your estimate, including when it makes sense to consult an attorney.'
                    : 'Acciones practicas basadas en tu estimacion, incluyendo cuando tiene sentido consultar un abogado.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-3">{language === 'en' ? 'Pricing' : 'Precios'}</h2>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold font-serif text-navy-900 mb-2">$4.99</div>
                <p className="text-navy-500">{language === 'en' ? 'per prediction' : 'por prediccion'}</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'First prediction is FREE' : 'Primera prediccion es GRATIS'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                {[
                  language === 'en' ? 'Full prediction report' : 'Informe completo',
                  language === 'en' ? 'Factor analysis' : 'Analisis de factores',
                  language === 'en' ? 'Similar case data' : 'Datos de casos similares',
                  language === 'en' ? 'Next step recommendations' : 'Recomendaciones',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                {language === 'en' ? 'Try Free Prediction' : 'Probar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 text-center">
              {language === 'en' ? 'Assumptions & Data Coverage' : 'Supuestos y Cobertura de Datos'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What Affects Accuracy' : 'Que Afecta la Precision'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Completeness of details you provide (more detail = narrower range)',
                    'Availability of comparable cases in your specific jurisdiction',
                    'Recency of case data (newer cases weighted more heavily)',
                    'Unique factors in your case that may not match historical patterns',
                  ] : [
                    'Completitud de los detalles que proporcionas (mas detalle = rango mas estrecho)',
                    'Disponibilidad de casos comparables en tu jurisdiccion',
                    'Actualidad de los datos (casos recientes tienen mas peso)',
                    'Factores unicos en tu caso que pueden no coincidir con patrones historicos',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'Data Coverage & Limitations' : 'Cobertura y Limitaciones de Datos'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Based on publicly available case outcome data from state and federal courts',
                    'Settlement outcomes (which are private) are not fully represented',
                    'Coverage varies by state and case type -- some areas have richer data',
                    'Data is updated periodically, not in real-time',
                  ] : [
                    'Basado en datos publicos de resultados de tribunales estatales y federales',
                    'Los acuerdos privados no estan completamente representados',
                    'La cobertura varia por estado y tipo de caso',
                    'Los datos se actualizan periodicamente, no en tiempo real',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 max-w-xl mx-auto">
              <CoverageConfidenceIndicator
                level="medium"
                caseType={language === 'en' ? 'Housing / Eviction' : 'Vivienda / Desalojo'}
                jurisdiction="Arizona"
              />
            </div>

            <div className="mt-8 max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                {language === 'en' ? 'How We Calculate Coverage & Confidence' : 'Como Calculamos Cobertura y Confianza'}
              </h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Source Coverage (25-95%)' : 'Cobertura de Fuentes (25-95%)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Measures how many relevant statutes, case outcomes, and legal references our system found for your specific case type and jurisdiction. Higher coverage means more data points inform the estimate. It does not measure prediction accuracy.'
                      : 'Mide cuantos estatutos, resultados de casos y referencias legales relevantes encontro nuestro sistema para tu tipo de caso y jurisdiccion. Mayor cobertura significa mas datos informando la estimacion. No mide la precision de la prediccion.'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Coverage Confidence (High / Medium / Low)' : 'Confianza de Cobertura (Alta / Media / Baja)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Reflects the density and recency of publicly available case data for your state and case type. "High" means many recent comparable cases exist; "Low" means limited public data is available. Settlements and sealed cases are excluded from all calculations.'
                      : 'Refleja la densidad y actualidad de datos publicos de casos para tu estado y tipo de caso. "Alta" significa muchos casos recientes comparables; "Baja" significa datos publicos limitados. Los acuerdos y casos sellados se excluyen de todos los calculos.'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
                  {language === 'en'
                    ? 'These indicators help you understand the breadth of data behind your estimate -- not its correctness. Every legal situation is unique. Always consult a licensed attorney before making decisions.'
                    : 'Estos indicadores te ayudan a entender la amplitud de datos detras de tu estimacion, no su exactitud. Cada situacion legal es unica. Siempre consulta un abogado antes de tomar decisiones.'}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-md mx-auto">
              <InlineEmailCapture
                source="case_predictor"
                context="case_predictor"
                label={{
                  en: 'Email me a sample prediction report',
                  es: 'Enviar un informe de prediccion de muestra',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AttorneyServiceDisclosure variant="expandable" context="case-predictor" />
          </div>
        </section>

        <section className="py-12 bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">
                  {language === 'en' ? 'Important: What Case Predictor Is and Is Not' : 'Importante: Que Es y No Es el Predictor'}
                </h3>
                <div className="text-sm text-amber-800 space-y-2">
                  <p>{language === 'en' ? 'Case Predictor provides a statistical estimate based on publicly available case outcome data. It is NOT:' : 'El Predictor proporciona una estimacion estadistica. NO es:'}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{language === 'en' ? 'Legal advice or a guarantee of outcome' : 'Asesoramiento legal o garantia de resultado'}</li>
                    <li>{language === 'en' ? 'A substitute for consulting with a licensed attorney' : 'Un sustituto para consultar un abogado'}</li>
                    <li>{language === 'en' ? 'A determination of legal merit or viability of your case' : 'Una determinacion del merito legal de tu caso'}</li>
                  </ul>
                  <p>{language === 'en' ? 'Every case has unique circumstances. We strongly recommend consulting with an attorney before making legal decisions based on any prediction.' : 'Cada caso tiene circunstancias unicas. Recomendamos consultar un abogado antes de tomar decisiones legales.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                {language === 'en' ? 'When NOT to Rely on This Tool' : 'Cuando NO Confiar en Esta Herramienta'}
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-left">
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Imminent deadlines' : 'Fechas limite inminentes'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you have a court date or statute of limitations expiring soon, contact an attorney immediately.' : 'Si tienes una fecha de corte proximo, contacta un abogado.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Criminal charges' : 'Cargos criminales'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Criminal matters require attorney representation. Predictions cannot account for prosecutor discretion.' : 'Los asuntos penales requieren representacion legal.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Custody disputes' : 'Disputas de custodia'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Family court decisions depend on judicial discretion that predictions cannot capture.' : 'Las decisiones de custodia dependen de la discrecion judicial.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Safety concerns' : 'Preocupaciones de seguridad'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you are in danger, call 911 or a crisis hotline immediately.' : 'Si estas en peligro, llama al 911 inmediatamente.'}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
                <Link to="/find-attorney" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Find an attorney now' : 'Encontrar abogado ahora'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/pro-bono" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? "Can't afford an attorney? Pro bono options" : 'Opciones pro bono'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/emergency-resources" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Have Questions First?' : 'Tienes Preguntas Primero?'}</h2>
            <p className="text-navy-100 mb-8 text-lg">
              {language === 'en' ? 'Start with a free question to understand your situation, then use Case Predictor when ready.' : 'Comienza con una pregunta gratis, luego usa el Predictor cuando estes listo.'}
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Sparkles, CheckCircle, ArrowRight, Shield, AlertTriangle,
  BarChart3, FileText, Scale, Brain, Clock, Lock, Users, Zap, ChevronDown, ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import VerifiableTrustStrip from '../components/VerifiableTrustStrip';
import InlineEmailCapture from '../components/InlineEmailCapture';
import CoverageConfidenceIndicator from '../components/CoverageConfidenceIndicator';
import AttorneyReferralDisclosure from '../components/AttorneyReferralDisclosure';
import { AttorneyServiceDisclosure } from '../components/shared';

export default function CasePredictor() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [sampleExpanded, setSampleExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const startPrediction = () => {
    navigate('/case-predictor/start');
  };

  return (
    <div className="min-h-screen bg-white">
      {!acknowledged && (
        <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">
              {language === 'en'
                ? 'Important: This is a statistical estimate, not a legal prediction'
                : 'Importante: Esto es un estimado estadístico, no una predicción legal'}
            </h2>
            <p className="text-navy-600 text-sm mb-6 leading-relaxed">
              {language === 'en'
                ? 'This tool uses public data to estimate scenario likelihood ranges. It does NOT predict what will happen in YOUR case. Results are not legal advice.'
                : 'Esta herramienta utiliza datos públicos para estimar rangos de probabilidad de escenarios. NO predice lo que sucederá en TU caso. Los resultados no son asesoramiento legal.'}
            </p>
            <label className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-navy-300 text-teal-600 cursor-pointer"
              />
              <span className="text-sm text-navy-700">
                {language === 'en'
                  ? 'I understand this is a statistical estimate, not a prediction of my case outcome'
                  : 'Entiendo que esto es un estimado estadístico, no una predicción de mi resultado del caso'}
              </span>
            </label>
            <button
              onClick={() => setAcknowledged(true)}
              disabled={!acknowledged}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {language === 'en' ? 'Continue' : 'Continuar'}
            </button>
          </div>
        </div>
      )}

      {acknowledged && (
        <>
          <Navigation />
          <VerifiableTrustStrip className="mt-[73px]" />
          <Breadcrumbs />

          <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-teal-800 to-teal-900 py-10 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-teal-100 mb-6">
                  <Sparkles className="w-4 h-4 text-gold-300" />
                  {language === 'en' ? 'AI CASE PREDICTOR' : 'PREDICTOR DE CASOS IA'}
                </div>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  {language === 'en'
                    ? 'Understand Your Legal Scenario'
                    : 'Entiende Tu Escenario Legal'
                  }
                </h1>
                <p className="text-base sm:text-xl text-teal-100 mb-6 sm:mb-8 leading-relaxed">
                  {language === 'en'
                    ? 'Get a statistical scenario estimate in 2\u20133 minutes. Built for renters, workers, and small businesses \u2014 not lawyers.'
                    : 'Obtén un estimado estadístico en 2\u20133 minutos. Hecho para inquilinos, trabajadores y pequeños negocios.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    onClick={startPrediction}
                    className="bg-white text-teal-800 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    {language === 'en' ? 'Start Free \u2014 2 min' : 'Comenzar Gratis \u2014 2 min'}
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-teal-100">
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold-300" /> {language === 'en' ? '2\u20133 min' : '2\u20133 min'}</div>
                  <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-gold-300" /> {language === 'en' ? '1st prediction free' : '1ra gratis'}</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-gold-300" /> {language === 'en' ? 'Private & secure' : 'Privado'}</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/20 relative">
                <div className="absolute top-3 right-3 bg-amber-400/90 text-navy-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {language === 'en' ? 'Example' : 'Ejemplo'}
                </div>
                <div className="mb-4 sm:mb-6 pr-20 sm:pr-0 sm:text-center">
                  <h3 className="text-white font-bold text-base sm:text-lg mb-1">{language === 'en' ? 'Sample Report' : 'Informe de Ejemplo'}</h3>
                  <p className="text-teal-200 text-xs sm:text-sm">{language === 'en' ? 'Eviction Defense \u2014 Arizona' : 'Defensa de Desalojo \u2014 Arizona'}</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-teal-200 text-xs sm:text-sm font-medium">{language === 'en' ? 'Scenario estimate' : 'Estimado del escenario'}</span>
                      <span className="text-2xl font-bold text-green-400 font-serif">65-78%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
                      <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: '72%' }} />
                    </div>
                    <p className="text-teal-100 text-xs mt-2">{language === 'en' ? 'Estimated favorable outcome range' : 'Rango estimado de resultado favorable'}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSampleExpanded(!sampleExpanded)}
                    className="sm:hidden w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg py-2.5 transition-colors"
                    aria-expanded={sampleExpanded}
                  >
                    {sampleExpanded
                      ? (language === 'en' ? 'Hide details' : 'Ocultar detalles')
                      : (language === 'en' ? 'See what\u2019s inside a report' : 'Ver que incluye un informe')}
                    {sampleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className={`${sampleExpanded ? 'block' : 'hidden'} sm:block space-y-4`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white font-serif">{language === 'en' ? 'Hundreds' : 'Cientos'}</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Similar cases compared' : 'Casos similares comparados'}</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-white font-serif">5</div>
                        <div className="text-teal-300 text-xs">{language === 'en' ? 'Key factors identified' : 'Factores clave'}</div>
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-teal-200 text-xs font-medium mb-2">{language === 'en' ? 'TOP FACTORS IN YOUR FAVOR:' : 'FACTORES A TU FAVOR:'}</p>
                      <ul className="space-y-1.5">
                        {[
                          language === 'en' ? 'Written lease violation by landlord' : 'Violacion escrita del arrendador',
                          language === 'en' ? 'Notice period not met (ARS 33-1368)' : 'Periodo de aviso no cumplido',
                          language === 'en' ? 'Habitability complaints documented' : 'Quejas de habitabilidad documentadas',
                        ].map((text, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-teal-100">
                            <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                            {text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-teal-300/70 text-[10px] text-center italic mt-3 border-t border-white/10 pt-2">
                      {language === 'en'
                        ? 'Fictional example. Actual reports are based on your specific case details.'
                        : 'Ejemplo ficticio. Los informes reales se basan en los detalles de tu caso.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 bg-gradient-to-br from-amber-50 to-white border-y border-amber-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              {language === 'en' ? 'Validation Status' : 'Estado de Validación'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  <Lock className="w-3 h-3" />
                  {language === 'en' ? 'BLOCKED' : 'BLOQUEADO'}
                </span>
                <span className="text-sm text-navy-700">
                  {language === 'en'
                    ? 'Prospective accuracy study'
                    : 'Estudio de precisión prospectiva'}
                </span>
                <span className="text-xs text-navy-500 ml-auto">
                  {language === 'en'
                    ? 'Awaiting 500+ case outcomes'
                    : 'Esperando 500+ resultados de casos'}
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  <Lock className="w-3 h-3" />
                  {language === 'en' ? 'BLOCKED' : 'BLOQUEADO'}
                </span>
                <span className="text-sm text-navy-700">
                  {language === 'en'
                    ? 'Judicial outcome correlation'
                    : 'Correlación de resultado judicial'}
                </span>
                <span className="text-xs text-navy-500 ml-auto">
                  {language === 'en'
                    ? 'IRB approval pending'
                    : 'Aprobación de IRB pendiente'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-navy-900 mb-3">
                {language === 'en' ? 'How the Case Predictor Works' : 'Como Funciona el Predictor'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Takes about 2\u20133 minutes. You can review your results before subscribing.'
                  : 'Toma unos 2\u20133 minutos. Puedes ver tus resultados antes de suscribirte.'}
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: language === 'en' ? 'Share Details' : 'Comparte Detalles',
                  desc: language === 'en'
                    ? 'Tell us your case type, state, and key facts.'
                    : 'Dinos el tipo de caso, estado y hechos clave.',
                },
                {
                  icon: Brain,
                  title: language === 'en' ? 'AI Analysis' : 'Analisis IA',
                  desc: language === 'en'
                    ? 'Our model compares your case to similar outcomes in your state.'
                    : 'Nuestro modelo compara tu caso con resultados similares.',
                },
                {
                  icon: BarChart3,
                  title: language === 'en' ? 'Get Your Estimate' : 'Obtén Tu Estimacion',
                  desc: language === 'en'
                    ? 'See an estimated likelihood range and confidence level.'
                    : 'Ve un rango de probabilidad estimado y nivel de confianza.',
                },
                {
                  icon: ArrowRight,
                  title: language === 'en' ? 'Get Next Steps' : 'Próximos Pasos',
                  desc: language === 'en'
                    ? 'Key factors and practical actions, including when to consult an attorney.'
                    : 'Factores clave y acciones practicas, incluyendo cuando consultar un abogado.',
                },
              ].map((item, i) => (
                <div key={item.title} className="text-center group">
                  <div className="w-14 h-14 bg-teal-50 group-hover:bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <item.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">{i + 1}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-navy-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'en' ? 'Start Free Case Prediction' : 'Iniciar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-xs text-navy-400 mt-3">
                {language === 'en'
                  ? 'Not legal advice. Statistical estimate only. No attorney-client relationship created.'
                  : 'No es asesoramiento legal. Solo estimacion estadistica.'}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-2">
                {language === 'en' ? 'What You Get' : 'Que Obtienes'}
              </h2>
              <p className="text-navy-500 text-sm">
                {language === 'en'
                  ? 'Every prediction includes four deliverables in one report.'
                  : 'Cada prediccion incluye cuatro entregables en un informe.'}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Estimated Likelihood Range' : 'Rango de Probabilidad Estimado'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'A percentage range\u2014with a confidence level\u2014based on comparable cases in your jurisdiction. Not a guarantee.'
                    : 'Un rango de porcentaje con nivel de confianza basado en casos comparables en tu jurisdicción.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Key Factor Analysis' : 'Analisis de Factores Clave'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'The factors most likely to increase or decrease your estimated likelihood\u2014ranked by impact.'
                    : 'Los factores que mas aumentan o reducen tu probabilidad estimada, clasificados por impacto.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Similar Case Comparisons' : 'Comparaciones de Casos Similares'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Examples of comparable cases in your state and how they were resolved, so you can see the pattern.'
                    : 'Ejemplos de casos comparables en tu estado y como se resolvieron para que puedas ver el patron.'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-100 hover:border-teal-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900">
                    {language === 'en' ? 'Recommended Next Steps' : 'Próximos Pasos Recomendados'}
                  </h3>
                </div>
                <p className="text-navy-500 text-sm leading-relaxed">
                  {language === 'en'
                    ? 'Practical next actions based on your estimate, including when it makes sense to consult an attorney.'
                    : 'Acciones practicas basadas en tu estimacion, incluyendo cuando tiene sentido consultar un abogado.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-navy-900 mb-3">{language === 'en' ? 'Pricing' : 'Precios'}</h2>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 p-8 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold font-serif text-navy-900 mb-2">$4.99</div>
                <p className="text-navy-500">{language === 'en' ? 'per prediction' : 'por prediccion'}</p>
              </div>
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-bold text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                {language === 'en' ? 'First prediction is FREE' : 'Primera prediccion es GRATIS'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                {[
                  language === 'en' ? 'Full prediction report' : 'Informe completo',
                  language === 'en' ? 'Factor analysis' : 'Analisis de factores',
                  language === 'en' ? 'Similar case data' : 'Datos de casos similares',
                  language === 'en' ? 'Next step recommendations' : 'Recomendaciones',
                ].map((text) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-navy-700">
                    <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
              <button
                onClick={startPrediction}
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
              >
                {language === 'en' ? 'Try Free Prediction' : 'Probar Prediccion Gratis'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-y border-navy-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 text-center">
              {language === 'en' ? 'Assumptions & Data Coverage' : 'Supuestos y Cobertura de Datos'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'What Affects Accuracy' : 'Que Afecta la Precision'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Completeness of details you provide (more detail = narrower range)',
                    'Availability of comparable cases in your specific jurisdiction',
                    'Recency of case data (newer cases weighted more heavily)',
                    'Unique factors in your case that may not match historical patterns',
                  ] : [
                    'Completitud de los detalles que proporcionas (mas detalle = rango mas estrecho)',
                    'Disponibilidad de casos comparables en tu jurisdicción',
                    'Actualidad de los datos (casos recientes tienen mas peso)',
                    'Factores unicos en tu caso que pueden no coincidir con patrones historicos',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-navy-200 p-5">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  {language === 'en' ? 'Data Coverage & Limitations' : 'Cobertura y Limitaciones de Datos'}
                </h3>
                <ul className="space-y-2 text-sm text-navy-600">
                  {(language === 'en' ? [
                    'Based on publicly available case outcome data from state and federal courts',
                    'Settlement outcomes (which are private) are not fully represented',
                    'Coverage varies by state and case type -- some areas have richer data',
                    'Data is updated periodically, not in real-time',
                  ] : [
                    'Basado en datos publicos de resultados de tribunales estatales y federales',
                    'Los acuerdos privados no estan completamente representados',
                    'La cobertura varia por estado y tipo de caso',
                    'Los datos se actualizan periodicamente, no en tiempo real',
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <FileText className="w-3.5 h-3.5 text-navy-400 flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 max-w-xl mx-auto">
              <CoverageConfidenceIndicator
                level="medium"
                caseType={language === 'en' ? 'Housing / Eviction' : 'Vivienda / Desalojo'}
                jurisdiction="Arizona"
              />
            </div>

            <div className="mt-8 max-w-xl mx-auto bg-white rounded-xl border border-slate-200 p-6">
              <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                {language === 'en' ? 'How We Calculate Coverage & Confidence' : 'Como Calculamos Cobertura y Confianza'}
              </h4>
              <div className="space-y-4 text-sm text-slate-700">
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Source Coverage (25-95%)' : 'Cobertura de Fuentes (25-95%)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Measures how many relevant statutes, case outcomes, and legal references our system found for your specific case type and jurisdiction. Higher coverage means more data points inform the estimate. It does not measure prediction accuracy.'
                      : 'Mide cuantos estatutos, resultados de casos y referencias legales relevantes encontro nuestro sistema para tu tipo de caso y jurisdicción. Mayor cobertura significa mas datos informando la estimacion. No mide la precision de la prediccion.'}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-800 mb-1">
                    {language === 'en' ? 'Coverage Confidence (High / Medium / Low)' : 'Confianza de Cobertura (Alta / Media / Baja)'}
                  </p>
                  <p>
                    {language === 'en'
                      ? 'Reflects the density and recency of publicly available case data for your state and case type. "High" means many recent comparable cases exist; "Low" means limited public data is available. Settlements and sealed cases are excluded from all calculations.'
                      : 'Refleja la densidad y actualidad de datos publicos de casos para tu estado y tipo de caso. "Alta" significa muchos casos recientes comparables; "Baja" significa datos publicos limitados. Los acuerdos y casos sellados se excluyen de todos los calculos.'}
                  </p>
                </div>
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-3">
                  {language === 'en'
                    ? 'These indicators help you understand the breadth of data behind your estimate -- not its correctness. Every legal situation is unique. Always consult a licensed attorney before making decisions.'
                    : 'Estos indicadores te ayudan a entender la amplitud de datos detras de tu estimacion, no su exactitud. Cada situación legal es unica. Siempre consulta un abogado antes de tomar decisiones.'}
                </p>
              </div>
            </div>

            <div className="mt-6 max-w-md mx-auto">
              <InlineEmailCapture
                source="case_predictor"
                context="case_predictor"
                label={{
                  en: 'Email me a sample prediction report',
                  es: 'Enviar un informe de prediccion de muestra',
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <AttorneyServiceDisclosure variant="expandable" context="case-predictor" />
          </div>
        </section>

        <section className="py-12 bg-amber-50 border-y border-amber-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">
                  {language === 'en' ? 'Important: What Case Predictor Is and Is Not' : 'Importante: Que Es y No Es el Predictor'}
                </h3>
                <div className="text-sm text-amber-800 space-y-2">
                  <p>{language === 'en' ? 'Case Predictor provides a statistical estimate based on publicly available case outcome data. It is NOT:' : 'El Predictor proporciona una estimacion estadistica. NO es:'}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{language === 'en' ? 'Legal advice or a guarantee of outcome' : 'Asesoramiento legal o garantia de resultado'}</li>
                    <li>{language === 'en' ? 'A substitute for consulting with a licensed attorney' : 'Un sustituto para consultar un abogado'}</li>
                    <li>{language === 'en' ? 'A determination of legal merit or viability of your case' : 'Una determinacion del merito legal de tu caso'}</li>
                  </ul>
                  <p>{language === 'en' ? 'Every case has unique circumstances. We strongly recommend consulting with an attorney before making legal decisions based on any prediction.' : 'Cada caso tiene circunstancias unicas. Recomendamos consultar un abogado antes de tomar decisiones legales.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-600" />
                {language === 'en' ? 'When NOT to Rely on This Tool' : 'Cuando NO Confiar en Esta Herramienta'}
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-left">
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Imminent deadlines' : 'Fechas limite inminentes'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you have a court date or statute of limitations expiring soon, contact an attorney immediately.' : 'Si tienes una fecha de corte próximo, contacta un abogado.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Criminal charges' : 'Cargos criminales'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Criminal matters require attorney representation. Predictions cannot account for prosecutor discretion.' : 'Los asuntos penales requieren representacion legal.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Custody disputes' : 'Disputas de custodia'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'Family court decisions depend on judicial discretion that predictions cannot capture.' : 'Las decisiones de custodia dependen de la discrecion judicial.'}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 mb-1">{language === 'en' ? 'Safety concerns' : 'Preocupaciones de seguridad'}</p>
                  <p className="text-red-700 text-xs">{language === 'en' ? 'If you are in danger, call 911 or a crisis hotline immediately.' : 'Si estas en peligro, llama al 911 inmediatamente.'}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
                <Link to="/find-attorney" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Find an attorney now' : 'Encontrar abogado ahora'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/pro-bono" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? "Can't afford an attorney? Pro bono options" : 'Opciones pro bono'}</Link>
                <span className="text-red-300">|</span>
                <Link to="/emergency-resources" className="text-red-700 underline font-bold hover:text-red-900">{language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}</Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-navy-900 to-navy-800 text-white text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">{language === 'en' ? 'Have Questions First?' : 'Tienes Preguntas Primero?'}</h2>
            <p className="text-navy-100 mb-8 text-lg">
              {language === 'en' ? 'Start with a free question to understand your situation, then use Case Predictor when ready.' : 'Comienza con una pregunta gratis, luego usa el Predictor cuando estes listo.'}
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
            >
              {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
        </>
      )}
    </div>
  );
}

```

---

## src/pages/GrantReporting.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 44.9 KB | 44.9 KB |
| Lines | 888 | 888 |
| Delta | — | 100% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, FileText, Calendar, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Download, Sparkles, RefreshCw, Target, Users,
  PieChart, ArrowRight, Eye, Send, Filter, Search,
  FileCheck, Zap, Brain, ArrowLeft
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Grant {
  id: string;
  grant_name: string;
  grant_number: string;
  description: string;
  amount_awarded: number;
  amount_spent: number;
  start_date: string;
  end_date: string;
  status: string;
  funder: {
    name: string;
    type: string;
    report_frequency: string;
  } | null;
}

interface GrantReport {
  id: string;
  grant_id: string;
  report_type: string;
  reporting_period_start: string;
  reporting_period_end: string;
  status: string;
  compliance_score: number | null;
  created_at: string;
}

interface GrantMetric {
  id: string;
  metric_name: string;
  target_value: number;
  current_value: number;
  metric_type: string;
}

const mockGrants: Grant[] = [
  {
    id: '1',
    grant_name: 'Legal Services Corporation Grant 2024',
    grant_number: 'LSC-2024-AZ-001',
    description: 'Federal funding for civil legal assistance to low-income individuals',
    amount_awarded: 450000,
    amount_spent: 287500,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    funder: { name: 'Legal Services Corporation (LSC)', type: 'federal', report_frequency: 'semi_annual' }
  },
  {
    id: '2',
    grant_name: 'State Bar Foundation Pro Bono Initiative',
    grant_number: 'SBF-2024-Q1',
    description: 'Supporting volunteer attorney programs and clinic operations',
    amount_awarded: 125000,
    amount_spent: 78000,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    funder: { name: 'State Bar Foundation', type: 'state', report_frequency: 'quarterly' }
  },
  {
    id: '3',
    grant_name: 'Access to Justice Technology Grant',
    grant_number: 'ATJ-TECH-2024',
    description: 'Funding for AI-powered legal assistance tools and client intake systems',
    amount_awarded: 75000,
    amount_spent: 45000,
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    status: 'active',
    funder: { name: 'Access to Justice Foundation', type: 'private_foundation', report_frequency: 'annual' }
  }
];

const mockMetrics: GrantMetric[] = [
  { id: '1', metric_name: 'Clients Served', target_value: 2500, current_value: 1847, metric_type: 'count' },
  { id: '2', metric_name: 'Cases Closed', target_value: 1200, current_value: 923, metric_type: 'count' },
  { id: '3', metric_name: 'Pro Bono Hours', target_value: 5000, current_value: 3642, metric_type: 'hours' },
  { id: '4', metric_name: 'Favorable Outcomes', target_value: 85, current_value: 89, metric_type: 'percentage' }
];

const reportTypes = [
  { value: 'progress', label: 'Progress Report', icon: TrendingUp },
  { value: 'financial', label: 'Financial Report', icon: DollarSign },
  { value: 'compliance', label: 'Compliance Report', icon: FileCheck },
  { value: 'narrative', label: 'Narrative Report', icon: FileText },
  { value: 'combined', label: 'Combined Report', icon: BarChart3 }
];

export default function GrantReporting() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>(mockGrants);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [metrics, _setMetrics] = useState<GrantMetric[]>(mockMetrics);
  const [reports, setReports] = useState<GrantReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'history'>('overview');
  const [selectedReportType, setSelectedReportType] = useState('combined');
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadGrants();
      loadReports();
    }
  }, [user]);

  const loadGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select(`
          *,
          funder:grant_funders(name, type, report_frequency)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setGrants(data);
      }
    } catch (err) {
      console.error('Error loading grants:', err);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('grant_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setReports(data);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const generateAIReport = async () => {
    if (!selectedGrant) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressSteps = [
      { progress: 15, message: 'Analyzing grant objectives...' },
      { progress: 30, message: 'Aggregating client demographics...' },
      { progress: 45, message: 'Calculating outcome metrics...' },
      { progress: 60, message: 'Processing financial data...' },
      { progress: 75, message: 'Running compliance checks...' },
      { progress: 90, message: 'Generating narrative summary...' },
      { progress: 100, message: 'Report complete!' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setGenerationProgress(step.progress);
    }

    const report = {
      grant: selectedGrant,
      reportType: selectedReportType,
      generatedAt: new Date().toISOString(),
      executiveSummary: `During the reporting period, ${selectedGrant.grant_name} achieved significant progress toward its stated objectives. The program served 1,847 clients, representing 74% of the annual target of 2,500 clients. Case closure rates remained strong at 923 cases (77% of target), with an exceptional 89% favorable outcome rate exceeding the 85% goal.`,
      metrics: {
        clientsServed: { target: 2500, actual: 1847, percentComplete: 74 },
        casesClosed: { target: 1200, actual: 923, percentComplete: 77 },
        proBonoHours: { target: 5000, actual: 3642, percentComplete: 73 },
        favorableOutcomes: { target: 85, actual: 89, percentComplete: 105 }
      },
      demographics: {
        incomeLevel: { 'Below 125% FPL': 68, '125-200% FPL': 27, 'Above 200% FPL': 5 },
        caseTypes: { 'Family Law': 34, 'Housing': 28, 'Consumer': 18, 'Employment': 12, 'Other': 8 },
        geography: { 'Urban': 62, 'Suburban': 24, 'Rural': 14 }
      },
      financialSummary: {
        awarded: selectedGrant.amount_awarded,
        spent: selectedGrant.amount_spent,
        remaining: selectedGrant.amount_awarded - selectedGrant.amount_spent,
        burnRate: (selectedGrant.amount_spent / selectedGrant.amount_awarded * 100).toFixed(1)
      },
      complianceScore: 94,
      complianceFlags: [
        { severity: 'low', message: 'Minor documentation gaps in 3 case files' },
        { severity: 'info', message: 'All required reports submitted on time' }
      ],
      aiConfidence: 0.92,
      recommendations: [
        'Increase outreach in rural communities to improve geographic coverage',
        'Schedule additional housing law clinics to address high demand',
        'Consider expanding Spanish-language services based on demographic trends'
      ]
    };

    setGeneratedReport(report);
    setShowReportPreview(true);
    setIsGenerating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-teal-100 text-teal-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-navy-100 text-navy-700';
      default: return 'bg-navy-100 text-navy-700';
    }
  };

  const getFunderTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'bg-teal-600';
      case 'state': return 'bg-teal-600';
      case 'private_foundation': return 'bg-amber-600';
      case 'corporate': return 'bg-navy-600';
      default: return 'bg-navy-500';
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-800 text-white pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/for-organizations"
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to For Organizations
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-1 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span className="text-xs font-semibold">AI-POWERED</span>
              </div>
              <h1 className="text-3xl font-bold">Grant Reporting</h1>
            </div>
          </div>
          <p className="text-teal-100 text-lg max-w-2xl">
            Generate funder-ready impact reports with one click. AI analyzes your data to create comprehensive reports with demographics, outcomes, and compliance assessments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-lg border border-navy-200 overflow-hidden">
          <div className="border-b border-navy-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Grant Overview', icon: PieChart },
                { id: 'generate', label: 'Generate Report', icon: Sparkles },
                { id: 'history', label: 'Report History', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(grants.reduce((sum, g) => sum + g.amount_awarded, 0))}
                    </div>
                    <div className="text-teal-100 text-sm">Total Funding</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Spent</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(grants.reduce((sum, g) => sum + g.amount_spent, 0))}
                    </div>
                    <div className="text-teal-100 text-sm">Total Spent</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">YTD</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">1,847</div>
                    <div className="text-amber-100 text-sm">Clients Served</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Rate</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">89%</div>
                    <div className="text-green-100 text-sm">Favorable Outcomes</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-navy-900 mb-4">Active Grants</h2>
                    <div className="space-y-4">
                      {grants.map((grant) => (
                        <div
                          key={grant.id}
                          className={`border rounded-xl p-5 transition-all cursor-pointer ${
                            selectedGrant?.id === grant.id
                              ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                              : 'border-navy-200 hover:border-teal-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedGrant(grant)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {grant.funder && (
                                  <span className={`w-2 h-2 rounded-full ${getFunderTypeColor(grant.funder.type)}`} />
                                )}
                                <h4 className="font-bold text-navy-900">{grant.grant_name}</h4>
                              </div>
                              <p className="text-sm text-navy-500">{grant.grant_number}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                              {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mb-4">{grant.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-navy-500">
                                {grant.funder?.name || 'Unknown Funder'}
                              </span>
                              <span className="text-navy-400">|</span>
                              <span className="text-navy-500">
                                {formatDate(grant.start_date)} - {formatDate(grant.end_date)}
                              </span>
                            </div>
                            <span className="font-bold text-teal-600">{formatCurrency(grant.amount_awarded)}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-navy-500">Budget Utilization</span>
                              <span className="font-medium text-navy-700">
                                {((grant.amount_spent / grant.amount_awarded) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-500 rounded-full transition-all"
                                style={{ width: `${(grant.amount_spent / grant.amount_awarded) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      {metrics.map((metric) => (
                        <div key={metric.id} className="bg-navy-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-navy-700">{metric.metric_name}</span>
                            <span className={`text-sm font-bold ${
                              (metric.current_value / metric.target_value) >= 1
                                ? 'text-green-600'
                                : (metric.current_value / metric.target_value) >= 0.7
                                ? 'text-teal-600'
                                : 'text-amber-600'
                            }`}>
                              {metric.metric_type === 'percentage'
                                ? `${metric.current_value}%`
                                : metric.current_value.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 bg-navy-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                (metric.current_value / metric.target_value) >= 1
                                  ? 'bg-green-500'
                                  : (metric.current_value / metric.target_value) >= 0.7
                                  ? 'bg-teal-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-navy-500">
                            <span>Target: {metric.metric_type === 'percentage' ? `${metric.target_value}%` : metric.target_value.toLocaleString()}</span>
                            <span>{((metric.current_value / metric.target_value) * 100).toFixed(0)}% complete</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl p-4 border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <span className="font-bold text-navy-900">Upcoming Deadlines</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">LSC Semi-Annual Report</span>
                          <span className="text-amber-600 font-medium">Jan 31</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">State Bar Q1 Report</span>
                          <span className="text-navy-500">Apr 15</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">ATJ Annual Report</span>
                          <span className="text-navy-500">Mar 28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="max-w-4xl mx-auto">
                {!showReportPreview ? (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-navy-900 mb-2">AI Report Generator</h2>
                      <p className="text-navy-600">
                        Select a grant and report type to generate a comprehensive, funder-ready report in seconds.
                      </p>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-6">
                      <label className="block text-sm font-bold text-navy-700 mb-3">Select Grant</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {grants.map((grant) => (
                          <button
                            key={grant.id}
                            onClick={() => setSelectedGrant(grant)}
                            className={`text-left p-4 rounded-lg border-2 transition-all ${
                              selectedGrant?.id === grant.id
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-navy-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            <div className="font-medium text-navy-900 mb-1">{grant.grant_name}</div>
                            <div className="text-sm text-navy-500">{grant.funder?.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-6">
                      <label className="block text-sm font-bold text-navy-700 mb-3">Report Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {reportTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setSelectedReportType(type.value)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              selectedReportType === type.value
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-navy-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                              selectedReportType === type.value ? 'text-teal-600' : 'text-navy-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                              selectedReportType === type.value ? 'text-teal-700' : 'text-navy-600'
                            }`}>
                              {type.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedGrant && (
                      <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl p-6 border border-teal-200">
                        <h3 className="font-bold text-navy-900 mb-4">Report Preview Configuration</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-navy-500">Grant:</span>
                            <span className="ml-2 font-medium text-navy-900">{selectedGrant.grant_name}</span>
                          </div>
                          <div>
                            <span className="text-navy-500">Funder:</span>
                            <span className="ml-2 font-medium text-navy-900">{selectedGrant.funder?.name}</span>
                          </div>
                          <div>
                            <span className="text-navy-500">Report Type:</span>
                            <span className="ml-2 font-medium text-navy-900">
                              {reportTypes.find(t => t.value === selectedReportType)?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">Period:</span>
                            <span className="ml-2 font-medium text-navy-900">
                              {formatDate(selectedGrant.start_date)} - Present
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={generateAIReport}
                      disabled={!selectedGrant || isGenerating}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          Generating Report... {generationProgress}%
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate AI Report
                        </>
                      )}
                    </button>

                    {isGenerating && (
                      <div className="bg-navy-50 rounded-xl p-6">
                        <div className="h-2 bg-navy-200 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                        <div className="text-center text-sm text-navy-600">
                          {generationProgress < 20 && 'Analyzing grant objectives...'}
                          {generationProgress >= 20 && generationProgress < 40 && 'Aggregating client demographics...'}
                          {generationProgress >= 40 && generationProgress < 60 && 'Calculating outcome metrics...'}
                          {generationProgress >= 60 && generationProgress < 80 && 'Processing financial data...'}
                          {generationProgress >= 80 && generationProgress < 95 && 'Running compliance checks...'}
                          {generationProgress >= 95 && 'Finalizing report...'}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowReportPreview(false)}
                        className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Generator
                      </button>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export Excel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                          <Send className="w-4 h-4" />
                          Submit to Funder
                        </button>
                      </div>
                    </div>

                    {generatedReport && (
                      <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-600 text-white p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-teal-200" />
                                <span className="text-sm text-teal-100">AI-Generated Report</span>
                              </div>
                              <h2 className="text-2xl font-bold">{generatedReport.grant.grant_name}</h2>
                              <p className="text-teal-100 mt-1">
                                {reportTypes.find(t => t.value === generatedReport.reportType)?.label} |
                                Generated {new Date(generatedReport.generatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-teal-100 mb-1">AI Confidence</div>
                              <div className="text-3xl font-bold">{(generatedReport.aiConfidence * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-teal-600" />
                              Executive Summary
                            </h3>
                            <p className="text-navy-600 leading-relaxed bg-navy-50 p-4 rounded-lg">
                              {generatedReport.executiveSummary}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-teal-600" />
                              Performance Metrics
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {Object.entries(generatedReport.metrics).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-navy-50 rounded-lg p-4">
                                  <div className="text-sm text-navy-500 mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </div>
                                  <div className="flex items-end justify-between">
                                    <span className="text-2xl font-bold text-navy-900">{value.actual.toLocaleString()}</span>
                                    <span className={`text-sm font-medium ${
                                      value.percentComplete >= 100 ? 'text-green-600' :
                                      value.percentComplete >= 70 ? 'text-teal-600' : 'text-amber-600'
                                    }`}>
                                      {value.percentComplete}%
                                    </span>
                                  </div>
                                  <div className="text-xs text-navy-400 mt-1">Target: {value.target.toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-teal-600" />
                                Demographics
                              </h3>
                              <div className="space-y-4">
                                {Object.entries(generatedReport.demographics).map(([category, data]: [string, any]) => (
                                  <div key={category} className="bg-navy-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-navy-700 mb-2">
                                      {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </div>
                                    <div className="space-y-2">
                                      {Object.entries(data).map(([label, percent]: [string, any]) => (
                                        <div key={label} className="flex items-center justify-between text-sm">
                                          <span className="text-navy-600">{label}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-navy-200 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{ width: `${percent}%` }}
                                              />
                                            </div>
                                            <span className="text-navy-700 font-medium w-10 text-right">{percent}%</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-teal-600" />
                                Financial Summary
                              </h3>
                              <div className="bg-navy-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Total Awarded</span>
                                  <span className="font-bold text-navy-900">{formatCurrency(generatedReport.financialSummary.awarded)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Amount Spent</span>
                                  <span className="font-bold text-navy-900">{formatCurrency(generatedReport.financialSummary.spent)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Remaining</span>
                                  <span className="font-bold text-green-600">{formatCurrency(generatedReport.financialSummary.remaining)}</span>
                                </div>
                                <div className="border-t border-navy-200 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-navy-600">Burn Rate</span>
                                    <span className="font-bold text-teal-600">{generatedReport.financialSummary.burnRate}%</span>
                                  </div>
                                </div>
                              </div>

                              <h3 className="text-lg font-bold text-navy-900 mt-6 mb-3 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-teal-600" />
                                Compliance Assessment
                              </h3>
                              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium text-navy-700">Compliance Score</span>
                                  <span className="text-2xl font-bold text-green-600">{generatedReport.complianceScore}%</span>
                                </div>
                                <div className="space-y-2">
                                  {generatedReport.complianceFlags.map((flag: any, idx: number) => (
                                    <div key={idx} className={`flex items-start gap-2 text-sm ${
                                      flag.severity === 'low' ? 'text-amber-700' : 'text-green-700'
                                    }`}>
                                      {flag.severity === 'low' ? (
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      )}
                                      {flag.message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-teal-600" />
                              AI Recommendations
                            </h3>
                            <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-lg p-4 border border-teal-200">
                              <ul className="space-y-2">
                                {generatedReport.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-navy-700">
                                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-navy-900">Report History</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10 pr-4 py-2 border border-navy-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-navy-50 rounded-xl">
                    <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-navy-700 mb-2">No Reports Generated Yet</h4>
                    <p className="text-navy-500 mb-4">Generate your first AI-powered report to see it here.</p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-navy-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-navy-900">
                              {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                            </div>
                            <div className="text-sm text-navy-500">
                              {formatDate(report.reporting_period_start)} - {formatDate(report.reporting_period_end)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {report.compliance_score && (
                            <div className="text-right">
                              <div className="text-sm text-navy-500">Compliance</div>
                              <div className="font-bold text-green-600">{report.compliance_score}%</div>
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'submitted' ? 'bg-green-100 text-green-700' :
                            report.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-navy-100 text-navy-700'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                          <button className="p-2 text-navy-400 hover:text-teal-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-navy-400 hover:text-teal-600 transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-16">
        <Footer />
      </div>
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3, FileText, Calendar, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Download, Sparkles, RefreshCw, Target, Users,
  PieChart, ArrowRight, Eye, Send, Filter, Search,
  FileCheck, Zap, Brain, ArrowLeft
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Grant {
  id: string;
  grant_name: string;
  grant_number: string;
  description: string;
  amount_awarded: number;
  amount_spent: number;
  start_date: string;
  end_date: string;
  status: string;
  funder: {
    name: string;
    type: string;
    report_frequency: string;
  } | null;
}

interface GrantReport {
  id: string;
  grant_id: string;
  report_type: string;
  reporting_period_start: string;
  reporting_period_end: string;
  status: string;
  compliance_score: number | null;
  created_at: string;
}

interface GrantMetric {
  id: string;
  metric_name: string;
  target_value: number;
  current_value: number;
  metric_type: string;
}

const mockGrants: Grant[] = [
  {
    id: '1',
    grant_name: 'Legal Services Corporation Grant 2024',
    grant_number: 'LSC-2024-AZ-001',
    description: 'Federal funding for civil legal assistance to low-income individuals',
    amount_awarded: 450000,
    amount_spent: 287500,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    funder: { name: 'Legal Services Corporation (LSC)', type: 'federal', report_frequency: 'semi_annual' }
  },
  {
    id: '2',
    grant_name: 'State Bar Foundation Pro Bono Initiative',
    grant_number: 'SBF-2024-Q1',
    description: 'Supporting volunteer attorney programs and clinic operations',
    amount_awarded: 125000,
    amount_spent: 78000,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    funder: { name: 'State Bar Foundation', type: 'state', report_frequency: 'quarterly' }
  },
  {
    id: '3',
    grant_name: 'Access to Justice Technology Grant',
    grant_number: 'ATJ-TECH-2024',
    description: 'Funding for AI-powered legal assistance tools and client intake systems',
    amount_awarded: 75000,
    amount_spent: 45000,
    start_date: '2024-03-01',
    end_date: '2025-02-28',
    status: 'active',
    funder: { name: 'Access to Justice Foundation', type: 'private_foundation', report_frequency: 'annual' }
  }
];

const mockMetrics: GrantMetric[] = [
  { id: '1', metric_name: 'Clients Served', target_value: 2500, current_value: 1847, metric_type: 'count' },
  { id: '2', metric_name: 'Cases Closed', target_value: 1200, current_value: 923, metric_type: 'count' },
  { id: '3', metric_name: 'Pro Bono Hours', target_value: 5000, current_value: 3642, metric_type: 'hours' },
  { id: '4', metric_name: 'Favorable Outcomes', target_value: 85, current_value: 89, metric_type: 'percentage' }
];

const reportTypes = [
  { value: 'progress', label: 'Progress Report', icon: TrendingUp },
  { value: 'financial', label: 'Financial Report', icon: DollarSign },
  { value: 'compliance', label: 'Compliance Report', icon: FileCheck },
  { value: 'narrative', label: 'Narrative Report', icon: FileText },
  { value: 'combined', label: 'Combined Report', icon: BarChart3 }
];

export default function GrantReporting() {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>(mockGrants);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [metrics, _setMetrics] = useState<GrantMetric[]>(mockMetrics);
  const [reports, setReports] = useState<GrantReport[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'history'>('overview');
  const [selectedReportType, setSelectedReportType] = useState('combined');
  const [showReportPreview, setShowReportPreview] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadGrants();
      loadReports();
    }
  }, [user]);

  const loadGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select(`
          *,
          funder:grant_funders(name, type, report_frequency)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setGrants(data);
      }
    } catch (err) {
      console.error('Error loading grants:', err);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('grant_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setReports(data);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    }
  };

  const generateAIReport = async () => {
    if (!selectedGrant) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const progressSteps = [
      { progress: 15, message: 'Analyzing grant objectives...' },
      { progress: 30, message: 'Aggregating client demographics...' },
      { progress: 45, message: 'Calculating outcome metrics...' },
      { progress: 60, message: 'Processing financial data...' },
      { progress: 75, message: 'Running compliance checks...' },
      { progress: 90, message: 'Generating narrative summary...' },
      { progress: 100, message: 'Report complete!' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setGenerationProgress(step.progress);
    }

    const report = {
      grant: selectedGrant,
      reportType: selectedReportType,
      generatedAt: new Date().toISOString(),
      executiveSummary: `During the reporting period, ${selectedGrant.grant_name} achieved significant progress toward its stated objectives. The program served 1,847 clients, representing 74% of the annual target of 2,500 clients. Case closure rates remained strong at 923 cases (77% of target), with an exceptional 89% favorable outcome rate exceeding the 85% goal.`,
      metrics: {
        clientsServed: { target: 2500, actual: 1847, percentComplete: 74 },
        casesClosed: { target: 1200, actual: 923, percentComplete: 77 },
        proBonoHours: { target: 5000, actual: 3642, percentComplete: 73 },
        favorableOutcomes: { target: 85, actual: 89, percentComplete: 105 }
      },
      demographics: {
        incomeLevel: { 'Below 125% FPL': 68, '125-200% FPL': 27, 'Above 200% FPL': 5 },
        caseTypes: { 'Family Law': 34, 'Housing': 28, 'Consumer': 18, 'Employment': 12, 'Other': 8 },
        geography: { 'Urban': 62, 'Suburban': 24, 'Rural': 14 }
      },
      financialSummary: {
        awarded: selectedGrant.amount_awarded,
        spent: selectedGrant.amount_spent,
        remaining: selectedGrant.amount_awarded - selectedGrant.amount_spent,
        burnRate: (selectedGrant.amount_spent / selectedGrant.amount_awarded * 100).toFixed(1)
      },
      complianceScore: 94,
      complianceFlags: [
        { severity: 'low', message: 'Minor documentation gaps in 3 case files' },
        { severity: 'info', message: 'All required reports submitted on time' }
      ],
      aiConfidence: 0.92,
      recommendations: [
        'Increase outreach in rural communities to improve geographic coverage',
        'Schedule additional housing law clinics to address high demand',
        'Consider expanding Spanish-language services based on demographic trends'
      ]
    };

    setGeneratedReport(report);
    setShowReportPreview(true);
    setIsGenerating(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-teal-100 text-teal-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'expired': return 'bg-navy-100 text-navy-700';
      default: return 'bg-navy-100 text-navy-700';
    }
  };

  const getFunderTypeColor = (type: string) => {
    switch (type) {
      case 'federal': return 'bg-teal-600';
      case 'state': return 'bg-teal-600';
      case 'private_foundation': return 'bg-amber-600';
      case 'corporate': return 'bg-navy-600';
      default: return 'bg-navy-500';
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-800 text-white pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/for-organizations"
            className="inline-flex items-center gap-2 text-teal-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to For Organizations
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-1 rounded-full mb-1">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span className="text-xs font-semibold">AI-POWERED</span>
              </div>
              <h1 className="text-3xl font-bold">Grant Reporting</h1>
            </div>
          </div>
          <p className="text-teal-100 text-lg max-w-2xl">
            Generate funder-ready impact reports with one click. AI analyzes your data to create comprehensive reports with demographics, outcomes, and compliance assessments.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-lg border border-navy-200 overflow-hidden">
          <div className="border-b border-navy-200">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Grant Overview', icon: PieChart },
                { id: 'generate', label: 'Generate Report', icon: Sparkles },
                { id: 'history', label: 'Report History', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-teal-600 text-teal-600 bg-teal-50/50'
                      : 'border-transparent text-navy-600 hover:text-navy-900 hover:bg-navy-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <DollarSign className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(grants.reduce((sum, g) => sum + g.amount_awarded, 0))}
                    </div>
                    <div className="text-teal-100 text-sm">Total Funding</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Spent</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {formatCurrency(grants.reduce((sum, g) => sum + g.amount_spent, 0))}
                    </div>
                    <div className="text-teal-100 text-sm">Total Spent</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">YTD</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">1,847</div>
                    <div className="text-amber-100 text-sm">Clients Served</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="w-8 h-8 opacity-80" />
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Rate</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">89%</div>
                    <div className="text-green-100 text-sm">Favorable Outcomes</div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-navy-900 mb-4">Active Grants</h2>
                    <div className="space-y-4">
                      {grants.map((grant) => (
                        <div
                          key={grant.id}
                          className={`border rounded-xl p-5 transition-all cursor-pointer ${
                            selectedGrant?.id === grant.id
                              ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
                              : 'border-navy-200 hover:border-teal-300 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedGrant(grant)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {grant.funder && (
                                  <span className={`w-2 h-2 rounded-full ${getFunderTypeColor(grant.funder.type)}`} />
                                )}
                                <h4 className="font-bold text-navy-900">{grant.grant_name}</h4>
                              </div>
                              <p className="text-sm text-navy-500">{grant.grant_number}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(grant.status)}`}>
                              {grant.status.charAt(0).toUpperCase() + grant.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mb-4">{grant.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-navy-500">
                                {grant.funder?.name || 'Unknown Funder'}
                              </span>
                              <span className="text-navy-400">|</span>
                              <span className="text-navy-500">
                                {formatDate(grant.start_date)} - {formatDate(grant.end_date)}
                              </span>
                            </div>
                            <span className="font-bold text-teal-600">{formatCurrency(grant.amount_awarded)}</span>
                          </div>
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-navy-500">Budget Utilization</span>
                              <span className="font-medium text-navy-700">
                                {((grant.amount_spent / grant.amount_awarded) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-teal-500 rounded-full transition-all"
                                style={{ width: `${(grant.amount_spent / grant.amount_awarded) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-900 mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                      {metrics.map((metric) => (
                        <div key={metric.id} className="bg-navy-50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-navy-700">{metric.metric_name}</span>
                            <span className={`text-sm font-bold ${
                              (metric.current_value / metric.target_value) >= 1
                                ? 'text-green-600'
                                : (metric.current_value / metric.target_value) >= 0.7
                                ? 'text-teal-600'
                                : 'text-amber-600'
                            }`}>
                              {metric.metric_type === 'percentage'
                                ? `${metric.current_value}%`
                                : metric.current_value.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-2 bg-navy-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                (metric.current_value / metric.target_value) >= 1
                                  ? 'bg-green-500'
                                  : (metric.current_value / metric.target_value) >= 0.7
                                  ? 'bg-teal-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min((metric.current_value / metric.target_value) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1 text-xs text-navy-500">
                            <span>Target: {metric.metric_type === 'percentage' ? `${metric.target_value}%` : metric.target_value.toLocaleString()}</span>
                            <span>{((metric.current_value / metric.target_value) * 100).toFixed(0)}% complete</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl p-4 border border-teal-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <span className="font-bold text-navy-900">Upcoming Deadlines</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">LSC Semi-Annual Report</span>
                          <span className="text-amber-600 font-medium">Jan 31</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">State Bar Q1 Report</span>
                          <span className="text-navy-500">Apr 15</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-navy-600">ATJ Annual Report</span>
                          <span className="text-navy-500">Mar 28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <div className="max-w-4xl mx-auto">
                {!showReportPreview ? (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-navy-900 mb-2">AI Report Generator</h2>
                      <p className="text-navy-600">
                        Select a grant and report type to generate a comprehensive, funder-ready report in seconds.
                      </p>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-6">
                      <label className="block text-sm font-bold text-navy-700 mb-3">Select Grant</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {grants.map((grant) => (
                          <button
                            key={grant.id}
                            onClick={() => setSelectedGrant(grant)}
                            className={`text-left p-4 rounded-lg border-2 transition-all ${
                              selectedGrant?.id === grant.id
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-navy-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            <div className="font-medium text-navy-900 mb-1">{grant.grant_name}</div>
                            <div className="text-sm text-navy-500">{grant.funder?.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-navy-50 rounded-xl p-6">
                      <label className="block text-sm font-bold text-navy-700 mb-3">Report Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {reportTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => setSelectedReportType(type.value)}
                            className={`p-4 rounded-lg border-2 transition-all text-center ${
                              selectedReportType === type.value
                                ? 'border-teal-500 bg-teal-50'
                                : 'border-navy-200 hover:border-teal-300 bg-white'
                            }`}
                          >
                            <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                              selectedReportType === type.value ? 'text-teal-600' : 'text-navy-400'
                            }`} />
                            <div className={`text-sm font-medium ${
                              selectedReportType === type.value ? 'text-teal-700' : 'text-navy-600'
                            }`}>
                              {type.label}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedGrant && (
                      <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-xl p-6 border border-teal-200">
                        <h3 className="font-bold text-navy-900 mb-4">Report Preview Configuration</h3>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-navy-500">Grant:</span>
                            <span className="ml-2 font-medium text-navy-900">{selectedGrant.grant_name}</span>
                          </div>
                          <div>
                            <span className="text-navy-500">Funder:</span>
                            <span className="ml-2 font-medium text-navy-900">{selectedGrant.funder?.name}</span>
                          </div>
                          <div>
                            <span className="text-navy-500">Report Type:</span>
                            <span className="ml-2 font-medium text-navy-900">
                              {reportTypes.find(t => t.value === selectedReportType)?.label}
                            </span>
                          </div>
                          <div>
                            <span className="text-navy-500">Period:</span>
                            <span className="ml-2 font-medium text-navy-900">
                              {formatDate(selectedGrant.start_date)} - Present
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={generateAIReport}
                      disabled={!selectedGrant || isGenerating}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-700 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-6 h-6 animate-spin" />
                          Generating Report... {generationProgress}%
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-6 h-6" />
                          Generate AI Report
                        </>
                      )}
                    </button>

                    {isGenerating && (
                      <div className="bg-navy-50 rounded-xl p-6">
                        <div className="h-2 bg-navy-200 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-500 rounded-full transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          />
                        </div>
                        <div className="text-center text-sm text-navy-600">
                          {generationProgress < 20 && 'Analyzing grant objectives...'}
                          {generationProgress >= 20 && generationProgress < 40 && 'Aggregating client demographics...'}
                          {generationProgress >= 40 && generationProgress < 60 && 'Calculating outcome metrics...'}
                          {generationProgress >= 60 && generationProgress < 80 && 'Processing financial data...'}
                          {generationProgress >= 80 && generationProgress < 95 && 'Running compliance checks...'}
                          {generationProgress >= 95 && 'Finalizing report...'}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setShowReportPreview(false)}
                        className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Generator
                      </button>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                          <Download className="w-4 h-4" />
                          Export Excel
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                          <Send className="w-4 h-4" />
                          Submit to Funder
                        </button>
                      </div>
                    </div>

                    {generatedReport && (
                      <div className="bg-white border border-navy-200 rounded-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-teal-600 to-teal-600 text-white p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-teal-200" />
                                <span className="text-sm text-teal-100">AI-Generated Report</span>
                              </div>
                              <h2 className="text-2xl font-bold">{generatedReport.grant.grant_name}</h2>
                              <p className="text-teal-100 mt-1">
                                {reportTypes.find(t => t.value === generatedReport.reportType)?.label} |
                                Generated {new Date(generatedReport.generatedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-teal-100 mb-1">AI Confidence</div>
                              <div className="text-3xl font-bold">{(generatedReport.aiConfidence * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 space-y-6">
                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-teal-600" />
                              Executive Summary
                            </h3>
                            <p className="text-navy-600 leading-relaxed bg-navy-50 p-4 rounded-lg">
                              {generatedReport.executiveSummary}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <Target className="w-5 h-5 text-teal-600" />
                              Performance Metrics
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                              {Object.entries(generatedReport.metrics).map(([key, value]: [string, any]) => (
                                <div key={key} className="bg-navy-50 rounded-lg p-4">
                                  <div className="text-sm text-navy-500 mb-1">
                                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </div>
                                  <div className="flex items-end justify-between">
                                    <span className="text-2xl font-bold text-navy-900">{value.actual.toLocaleString()}</span>
                                    <span className={`text-sm font-medium ${
                                      value.percentComplete >= 100 ? 'text-green-600' :
                                      value.percentComplete >= 70 ? 'text-teal-600' : 'text-amber-600'
                                    }`}>
                                      {value.percentComplete}%
                                    </span>
                                  </div>
                                  <div className="text-xs text-navy-400 mt-1">Target: {value.target.toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-teal-600" />
                                Demographics
                              </h3>
                              <div className="space-y-4">
                                {Object.entries(generatedReport.demographics).map(([category, data]: [string, any]) => (
                                  <div key={category} className="bg-navy-50 rounded-lg p-4">
                                    <div className="text-sm font-medium text-navy-700 mb-2">
                                      {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </div>
                                    <div className="space-y-2">
                                      {Object.entries(data).map(([label, percent]: [string, any]) => (
                                        <div key={label} className="flex items-center justify-between text-sm">
                                          <span className="text-navy-600">{label}</span>
                                          <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-navy-200 rounded-full overflow-hidden">
                                              <div
                                                className="h-full bg-teal-500 rounded-full"
                                                style={{ width: `${percent}%` }}
                                              />
                                            </div>
                                            <span className="text-navy-700 font-medium w-10 text-right">{percent}%</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-teal-600" />
                                Financial Summary
                              </h3>
                              <div className="bg-navy-50 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Total Awarded</span>
                                  <span className="font-bold text-navy-900">{formatCurrency(generatedReport.financialSummary.awarded)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Amount Spent</span>
                                  <span className="font-bold text-navy-900">{formatCurrency(generatedReport.financialSummary.spent)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-navy-600">Remaining</span>
                                  <span className="font-bold text-green-600">{formatCurrency(generatedReport.financialSummary.remaining)}</span>
                                </div>
                                <div className="border-t border-navy-200 pt-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-navy-600">Burn Rate</span>
                                    <span className="font-bold text-teal-600">{generatedReport.financialSummary.burnRate}%</span>
                                  </div>
                                </div>
                              </div>

                              <h3 className="text-lg font-bold text-navy-900 mt-6 mb-3 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-teal-600" />
                                Compliance Assessment
                              </h3>
                              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="font-medium text-navy-700">Compliance Score</span>
                                  <span className="text-2xl font-bold text-green-600">{generatedReport.complianceScore}%</span>
                                </div>
                                <div className="space-y-2">
                                  {generatedReport.complianceFlags.map((flag: any, idx: number) => (
                                    <div key={idx} className={`flex items-start gap-2 text-sm ${
                                      flag.severity === 'low' ? 'text-amber-700' : 'text-green-700'
                                    }`}>
                                      {flag.severity === 'low' ? (
                                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      )}
                                      {flag.message}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-teal-600" />
                              AI Recommendations
                            </h3>
                            <div className="bg-gradient-to-br from-teal-50 to-teal-50 rounded-lg p-4 border border-teal-200">
                              <ul className="space-y-2">
                                {generatedReport.recommendations.map((rec: string, idx: number) => (
                                  <li key={idx} className="flex items-start gap-2 text-navy-700">
                                    <ArrowRight className="w-4 h-4 mt-1 text-teal-600 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-navy-900">Report History</h3>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="pl-10 pr-4 py-2 border border-navy-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-navy-300 rounded-lg text-navy-700 hover:bg-navy-50 transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>

                {reports.length === 0 ? (
                  <div className="text-center py-12 bg-navy-50 rounded-xl">
                    <FileText className="w-12 h-12 text-navy-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-navy-700 mb-2">No Reports Generated Yet</h4>
                    <p className="text-navy-500 mb-4">Generate your first AI-powered report to see it here.</p>
                    <button
                      onClick={() => setActiveTab('generate')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-4 border border-navy-200 rounded-lg hover:border-teal-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-teal-600" />
                          </div>
                          <div>
                            <div className="font-medium text-navy-900">
                              {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)} Report
                            </div>
                            <div className="text-sm text-navy-500">
                              {formatDate(report.reporting_period_start)} - {formatDate(report.reporting_period_end)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {report.compliance_score && (
                            <div className="text-right">
                              <div className="text-sm text-navy-500">Compliance</div>
                              <div className="font-bold text-green-600">{report.compliance_score}%</div>
                            </div>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'submitted' ? 'bg-green-100 text-green-700' :
                            report.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-navy-100 text-navy-700'
                          }`}>
                            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                          </span>
                          <button className="p-2 text-navy-400 hover:text-teal-600 transition-colors">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-navy-400 hover:text-teal-600 transition-colors">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-16">
        <Footer />
      </div>
    </div>
  );
}

```

---

## src/pages/WebsiteIntegration.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 50.7 KB | 50.7 KB |
| Lines | 1231 | 1231 |
| Delta | — | 100% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus, Settings, Trash2, Copy, CheckCircle2, Globe,
  MessageSquare, Eye, MousePointer, BarChart3, AlertCircle,
  X, ChevronDown, ChevronUp, Play, Sparkles, Zap, Users,
  FileText, Mail, Search, ArrowRight, Shield, Brain,
  Handshake
} from 'lucide-react';
import WidgetDemoModal from '../components/WidgetDemoModal';

interface Integration {
  id: string;
  name: string;
  widget_type: string;
  api_key: string;
  config: IntegrationConfig;
  allowed_domains: string[];
  is_active: boolean;
  created_at: string;
}

interface IntegrationConfig {
  appearance: {
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left';
    headerTitle: string;
    showBranding: boolean;
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    greetingMessage: string;
  };
  features: {
    lawyerSearch: boolean;
    emailCapture: boolean;
    documentUpload: boolean;
    outcomePrediction: boolean;
  };
}

interface IntegrationAnalytics {
  impressions: number;
  opens: number;
  messages: number;
  emailsCollected: number;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  appearance: {
    primaryColor: '#0067FF',
    position: 'bottom-right',
    headerTitle: 'Legal Assistant',
    showBranding: true,
  },
  behavior: {
    autoOpen: false,
    autoOpenDelay: 5000,
    greetingMessage: 'Hello! How can I help you with your legal questions today?',
  },
  features: {
    lawyerSearch: true,
    emailCapture: true,
    documentUpload: false,
    outcomePrediction: false,
  },
};

const WIDGET_TYPES = [
  { id: 'chat', name: 'AI Chat Widget', icon: MessageSquare, description: 'Embed 24/7 legal Q&A', color: '#0067FF' },
  { id: 'document_analyzer', name: 'Document Analyzer', icon: FileText, description: 'AI contract review & risk scoring', color: '#059669' },
  { id: 'outcome_predictor', name: 'Outcome Predictor', icon: BarChart3, description: 'AI case success probability', color: '#D97706' },
  { id: 'lawyer_search', name: 'Attorney Directory', icon: Search, description: 'Lawyer matching & referral', color: '#0D9488' },
  { id: 'negotiation_planner', name: 'Negotiation Planner', icon: Handshake, description: 'AI settlement strategies', color: '#0891B2' },
];

const getWidgetTypeInfo = (type: string) => {
  return WIDGET_TYPES.find(w => w.id === type) || WIDGET_TYPES[0];
};

const FEATURES = [
  {
    id: 'lawyerSearch',
    name: 'Lawyer Matching',
    description: 'Users can request to be matched with an attorney',
    icon: Users,
  },
  {
    id: 'emailCapture',
    name: 'Lead Capture',
    description: 'Collect email addresses for follow-up',
    icon: Mail,
  },
  {
    id: 'documentUpload',
    name: 'Document Analysis',
    description: 'Allow users to upload documents for review',
    icon: FileText,
  },
  {
    id: 'outcomePrediction',
    name: 'Outcome Prediction',
    description: 'AI-powered case outcome analysis by jurisdiction',
    icon: Brain,
  },
];

export default function WebsiteIntegration() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, IntegrationAnalytics>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCodeForIntegration, setShowCodeForIntegration] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('embed_widgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);

      if (data && data.length > 0) {
        await loadAnalytics(data.map(w => w.id));
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (integrationIds: string[]) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('widget_analytics')
        .select('widget_id, event_type')
        .in('widget_id', integrationIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const analyticsMap: Record<string, IntegrationAnalytics> = {};
      integrationIds.forEach(id => {
        analyticsMap[id] = { impressions: 0, opens: 0, messages: 0, emailsCollected: 0 };
      });

      data?.forEach(event => {
        if (!analyticsMap[event.widget_id]) return;
        switch (event.event_type) {
          case 'impression':
            analyticsMap[event.widget_id].impressions++;
            break;
          case 'open':
            analyticsMap[event.widget_id].opens++;
            break;
          case 'message':
            analyticsMap[event.widget_id].messages++;
            break;
          case 'email_collected':
            analyticsMap[event.widget_id].emailsCollected++;
            break;
        }
      });

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const createIntegration = async (name: string, config: IntegrationConfig, domains: string[], widgetType: string = 'chat') => {
    try {
      const { data, error } = await supabase
        .from('embed_widgets')
        .insert({
          user_id: user?.id,
          name,
          widget_type: widgetType,
          config,
          allowed_domains: domains,
        })
        .select()
        .single();

      if (error) throw error;
      setIntegrations([data, ...integrations]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const updateIntegration = async (integration: Integration) => {
    try {
      const { error } = await supabase
        .from('embed_widgets')
        .update({
          name: integration.name,
          config: integration.config,
          allowed_domains: integration.allowed_domains,
          is_active: integration.is_active,
        })
        .eq('id', integration.id);

      if (error) throw error;
      setIntegrations(integrations.map(w => w.id === integration.id ? integration : w));
      setEditingIntegration(null);
    } catch (error) {
      console.error('Error updating integration:', error);
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('embed_widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIntegrations(integrations.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const copyEmbedCode = (integration: Integration) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const embedCode = `<script>
(function() {
  var s = document.createElement('script');
  s.src = '${supabaseUrl}/functions/v1/embed-widget/loader.js?key=${integration.api_key}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`;

    navigator.clipboard.writeText(embedCode);
    setCopiedId(integration.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">
                <strong>See it in action!</strong> Watch how ezLegal.ai transforms websites like Step Up to Justice
              </span>
            </div>
            <button
              onClick={() => setShowDemoModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Website Widget Integration</h1>
              </div>
              <p className="text-teal-100 max-w-lg">
                Embed AI-powered legal widgets on your website with a single line of code. Choose from chat assistants, intake forms, and more to engage visitors and capture leads.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg font-semibold transition-all border border-white/30"
              >
                <Play className="w-5 h-5" />
                Live Demo
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-white text-teal-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Widget
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Total Views</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Conversations</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.opens, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Messages</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.messages, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Leads Captured</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.emailsCollected, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {integrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-navy-200 shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-3">
                  Add an AI Legal Widget to Your Website
                </h2>
                <p className="text-navy-600 mb-6 leading-relaxed">
                  Embed a chat widget, intake form, or legal guide directly on your website. Visitors get instant
                  legal guidance while you capture leads and connect users with attorneys.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">24/7 Legal Guidance</p>
                      <p className="text-sm text-navy-600">AI answers questions instantly, any time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Lead Capture Built-In</p>
                      <p className="text-sm text-navy-600">Automatically collect contact information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Attorney Matching</p>
                      <p className="text-sm text-navy-600">Connect qualified users with your network</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Your Integration
                </button>
              </div>

              <div className="bg-gradient-to-br from-navy-100 to-navy-50 p-8 lg:p-12 flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-navy-200 overflow-hidden">
                    <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Legal Assistant</p>
                        <p className="text-xs text-teal-100">Online now</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-navy-100 rounded-xl p-3 max-w-[85%]">
                        <p className="text-sm text-navy-700">Hello! How can I help you with your legal questions today?</p>
                      </div>
                      <div className="bg-teal-600 text-white rounded-xl p-3 max-w-[85%] ml-auto">
                        <p className="text-sm">I have a question about my lease agreement...</p>
                      </div>
                      <div className="bg-navy-100 rounded-xl p-3 max-w-[85%]">
                        <p className="text-sm text-navy-700">I'd be happy to help with lease questions. What specific concern do you have?</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-200 bg-white">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type your question..."
                          className="flex-1 px-3 py-2 bg-navy-100 rounded-lg text-sm"
                          disabled
                        />
                        <button className="p-2 bg-teal-600 text-white rounded-lg">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-teal-600 rounded-full shadow-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {integrations.map(integration => {
              const integrationAnalytics = analytics[integration.id] || { impressions: 0, opens: 0, messages: 0, emailsCollected: 0 };
              const isExpanded = expandedIntegration === integration.id;

              return (
                <div
                  key={integration.id}
                  className="bg-white rounded-xl border border-navy-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {(() => {
                          const typeInfo = getWidgetTypeInfo(integration.widget_type);
                          const TypeIcon = typeInfo.icon;
                          return (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${typeInfo.color}20` }}
                            >
                              <TypeIcon
                                className="w-6 h-6"
                                style={{ color: typeInfo.color }}
                              />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-navy-900">{integration.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              integration.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-navy-100 text-navy-600'
                            }`}>
                              {integration.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mt-1">
                            {getWidgetTypeInfo(integration.widget_type).name}
                          </p>
                          {integration.allowed_domains.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-navy-500">
                              <Globe className="w-3.5 h-3.5" />
                              <span>{integration.allowed_domains.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyEmbedCode(integration)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            copiedId === integration.id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                          }`}
                        >
                          {copiedId === integration.id ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingIntegration(integration)}
                          className="p-2 text-navy-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteIntegration(integration.id)}
                          className="p-2 text-navy-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setExpandedIntegration(isExpanded ? null : integration.id);
                            if (isExpanded) setShowCodeForIntegration(null);
                          }}
                          className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">Views</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.impressions.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <MousePointer className="w-4 h-4" />
                          <span className="text-xs">Conversations</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.opens.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">Messages</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.messages.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">Leads</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.emailsCollected.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-navy-200">
                      <button
                        onClick={() => setShowCodeForIntegration(
                          showCodeForIntegration === integration.id ? null : integration.id
                        )}
                        className="w-full px-6 py-3 bg-navy-50 hover:bg-navy-100 transition-colors flex items-center justify-between text-left"
                      >
                        <span className="font-semibold text-navy-900">
                          {showCodeForIntegration === integration.id ? 'Hide' : 'Show'} Installation Code
                        </span>
                        {showCodeForIntegration === integration.id ? (
                          <ChevronUp className="w-5 h-5 text-navy-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-navy-400" />
                        )}
                      </button>
                      {showCodeForIntegration === integration.id && (
                        <div className="p-6 bg-navy-50">
                          <div className="bg-navy-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
{`<script>
(function() {
  var s = document.createElement('script');
  s.src = '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-widget/loader.js?key=${integration.api_key}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`}
                            </pre>
                          </div>
                          <p className="text-sm text-navy-600 mt-3">
                            Add this code just before the closing <code className="bg-navy-200 px-1.5 py-0.5 rounded text-navy-800">&lt;/body&gt;</code> tag on your website.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">5-Minute Setup</h3>
            <p className="text-sm text-navy-600">
              Copy one line of code to your website. No technical skills required - works with any website builder.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">Secure & Compliant</h3>
            <p className="text-sm text-navy-600">
              Domain whitelisting prevents unauthorized use. All conversations are encrypted and protected.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-navy-600">
              Track conversations, leads captured, and engagement metrics from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateIntegrationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createIntegration}
        />
      )}

      {editingIntegration && (
        <EditIntegrationModal
          integration={editingIntegration}
          onClose={() => setEditingIntegration(null)}
          onSave={updateIntegration}
        />
      )}

      {showDemoModal && (
        <WidgetDemoModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}

function CreateIntegrationModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, config: IntegrationConfig, domains: string[], widgetType: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [widgetType, setWidgetType] = useState('chat');
  const [config, setConfig] = useState<IntegrationConfig>(DEFAULT_CONFIG);
  const [domainsInput, setDomainsInput] = useState('');

  const handleCreate = () => {
    const domains = domainsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    onCreate(name, config, domains, widgetType);
  };

  const updateFeature = (featureId: string, value: boolean) => {
    setConfig({
      ...config,
      features: {
        ...config.features,
        [featureId]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Create New Widget</h2>
            <p className="text-sm text-navy-600">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  Widget Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {WIDGET_TYPES.map((wt) => {
                    const WtIcon = wt.icon;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => setWidgetType(wt.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          widgetType === wt.id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-navy-200 hover:border-navy-300'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${wt.color}15` }}
                        >
                          <WtIcon className="w-4.5 h-4.5" style={{ color: wt.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm ${widgetType === wt.id ? 'text-teal-700' : 'text-navy-900'}`}>
                            {wt.name}
                          </p>
                          <p className="text-xs text-navy-500 truncate">{wt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Website, Landing Page"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
                <p className="text-sm text-navy-500 mt-2">
                  Use a name that helps you identify where this is installed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  Features
                </label>
                <div className="space-y-3">
                  {FEATURES.map(feature => (
                    <div
                      key={feature.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        config.features[feature.id as keyof typeof config.features]
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                      onClick={() => updateFeature(
                        feature.id,
                        !config.features[feature.id as keyof typeof config.features]
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <feature.icon className={`w-5 h-5 ${
                          config.features[feature.id as keyof typeof config.features]
                            ? 'text-teal-600'
                            : 'text-navy-400'
                        }`} />
                        <div>
                          <p className="font-medium text-navy-900">{feature.name}</p>
                          <p className="text-sm text-navy-500">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        config.features[feature.id as keyof typeof config.features]
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-navy-300'
                      }`}>
                        {config.features[feature.id as keyof typeof config.features] && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Appearance
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.appearance.primaryColor}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, primaryColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded-lg border border-navy-300 cursor-pointer"
                    />
                    <span className="text-sm text-navy-600">Brand Color</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={config.appearance.headerTitle}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, headerTitle: e.target.value }
                      })}
                      placeholder="Header Title"
                      className="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Allowed Domains
                </label>
                <textarea
                  value={domainsInput}
                  onChange={(e) => setDomainsInput(e.target.value)}
                  rows={3}
                  placeholder="example.com, www.example.com"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-sm text-navy-600 mt-2">
                  Enter comma-separated domains where this can be installed. Leave empty to allow all domains.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Security Recommendation</p>
                    <p className="text-sm text-amber-800 mt-1">
                      We strongly recommend restricting to specific domains to prevent unauthorized usage.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={config.behavior.greetingMessage}
                  onChange={(e) => setConfig({
                    ...config,
                    behavior: { ...config.behavior, greetingMessage: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-navy-50 rounded-xl p-6">
                <h4 className="font-semibold text-navy-900 mb-4">Preview</h4>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: config.appearance.primaryColor }}
                  >
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{name || 'Your Integration'}</p>
                    <p className="text-sm text-navy-600">
                      {config.appearance.headerTitle} - {config.appearance.position}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-navy-50 border-t border-navy-200 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create Integration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditIntegrationModal({
  integration,
  onClose,
  onSave,
}: {
  integration: Integration;
  onClose: () => void;
  onSave: (integration: Integration) => void;
}) {
  const [editedIntegration, setEditedIntegration] = useState<Integration>({ ...integration });
  const [domainsInput, setDomainsInput] = useState(integration.allowed_domains.join(', '));

  const config = editedIntegration.config as IntegrationConfig;

  const handleSave = () => {
    const domains = domainsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    onSave({
      ...editedIntegration,
      allowed_domains: domains,
    });
  };

  const updateFeature = (featureId: string, value: boolean) => {
    setEditedIntegration({
      ...editedIntegration,
      config: {
        ...config,
        features: {
          ...(config.features || { lawyerSearch: true, emailCapture: true, documentUpload: false }),
          [featureId]: value,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-900">Edit Integration</h2>
          <button
            onClick={onClose}
            className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Integration Name
            </label>
            <input
              type="text"
              value={editedIntegration.name}
              onChange={(e) => setEditedIntegration({ ...editedIntegration, name: e.target.value })}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
            <div>
              <p className="font-medium text-navy-900">Active</p>
              <p className="text-sm text-navy-600">Enable or disable this integration</p>
            </div>
            <button
              onClick={() => setEditedIntegration({ ...editedIntegration, is_active: !editedIntegration.is_active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                editedIntegration.is_active ? 'bg-green-500' : 'bg-navy-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                editedIntegration.is_active ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">
              Features
            </label>
            <div className="space-y-3">
              {FEATURES.map(feature => {
                const features = config.features || { lawyerSearch: true, emailCapture: true, documentUpload: false };
                const isEnabled = features[feature.id as keyof typeof features];
                return (
                  <div
                    key={feature.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isEnabled
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-navy-200 hover:border-navy-300'
                    }`}
                    onClick={() => updateFeature(feature.id, !isEnabled)}
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-navy-400'}`} />
                      <div>
                        <p className="font-medium text-navy-900">{feature.name}</p>
                        <p className="text-sm text-navy-500">{feature.description}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isEnabled ? 'border-teal-600 bg-teal-600' : 'border-navy-300'
                    }`}>
                      {isEnabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.appearance?.primaryColor || '#0067FF'}
                onChange={(e) => setEditedIntegration({
                  ...editedIntegration,
                  config: {
                    ...config,
                    appearance: { ...config.appearance, primaryColor: e.target.value }
                  }
                })}
                className="w-12 h-12 rounded-lg border border-navy-300 cursor-pointer"
              />
              <input
                type="text"
                value={config.appearance?.primaryColor || '#0067FF'}
                onChange={(e) => setEditedIntegration({
                  ...editedIntegration,
                  config: {
                    ...config,
                    appearance: { ...config.appearance, primaryColor: e.target.value }
                  }
                })}
                className="flex-1 px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Header Title
            </label>
            <input
              type="text"
              value={config.appearance?.headerTitle || 'Legal Assistant'}
              onChange={(e) => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  appearance: { ...config.appearance, headerTitle: e.target.value }
                }
              })}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Greeting Message
            </label>
            <textarea
              value={config.behavior?.greetingMessage || 'Hello! How can I help you with your legal questions today?'}
              onChange={(e) => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  behavior: { ...config.behavior, greetingMessage: e.target.value }
                }
              })}
              rows={3}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Allowed Domains
            </label>
            <textarea
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              rows={2}
              placeholder="example.com, www.example.com"
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
            <div>
              <p className="font-medium text-navy-900">Show Branding</p>
              <p className="text-sm text-navy-600">Display "Powered by ezLegal.ai"</p>
            </div>
            <button
              onClick={() => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  appearance: { ...config.appearance, showBranding: !config.appearance?.showBranding }
                }
              })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                config.appearance?.showBranding ? 'bg-teal-600' : 'bg-navy-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                config.appearance?.showBranding ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-navy-50 border-t border-navy-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Plus, Settings, Trash2, Copy, CheckCircle2, Globe,
  MessageSquare, Eye, MousePointer, BarChart3, AlertCircle,
  X, ChevronDown, ChevronUp, Play, Sparkles, Zap, Users,
  FileText, Mail, Search, ArrowRight, Shield, Brain,
  Handshake
} from 'lucide-react';
import WidgetDemoModal from '../components/WidgetDemoModal';

interface Integration {
  id: string;
  name: string;
  widget_type: string;
  api_key: string;
  config: IntegrationConfig;
  allowed_domains: string[];
  is_active: boolean;
  created_at: string;
}

interface IntegrationConfig {
  appearance: {
    primaryColor: string;
    position: 'bottom-right' | 'bottom-left';
    headerTitle: string;
    showBranding: boolean;
  };
  behavior: {
    autoOpen: boolean;
    autoOpenDelay: number;
    greetingMessage: string;
  };
  features: {
    lawyerSearch: boolean;
    emailCapture: boolean;
    documentUpload: boolean;
    outcomePrediction: boolean;
  };
}

interface IntegrationAnalytics {
  impressions: number;
  opens: number;
  messages: number;
  emailsCollected: number;
}

const DEFAULT_CONFIG: IntegrationConfig = {
  appearance: {
    primaryColor: '#0067FF',
    position: 'bottom-right',
    headerTitle: 'Legal Assistant',
    showBranding: true,
  },
  behavior: {
    autoOpen: false,
    autoOpenDelay: 5000,
    greetingMessage: 'Hello! How can I help you with your legal questions today?',
  },
  features: {
    lawyerSearch: true,
    emailCapture: true,
    documentUpload: false,
    outcomePrediction: false,
  },
};

const WIDGET_TYPES = [
  { id: 'chat', name: 'AI Chat Widget', icon: MessageSquare, description: 'Embed 24/7 legal Q&A', color: '#0067FF' },
  { id: 'document_analyzer', name: 'Document Analyzer', icon: FileText, description: 'AI contract review & risk scoring', color: '#059669' },
  { id: 'outcome_predictor', name: 'Outcome Predictor', icon: BarChart3, description: 'AI case success probability', color: '#D97706' },
  { id: 'lawyer_search', name: 'Attorney Directory', icon: Search, description: 'Lawyer matching & referral', color: '#0D9488' },
  { id: 'negotiation_planner', name: 'Negotiation Planner', icon: Handshake, description: 'AI settlement strategies', color: '#0891B2' },
];

const getWidgetTypeInfo = (type: string) => {
  return WIDGET_TYPES.find(w => w.id === type) || WIDGET_TYPES[0];
};

const FEATURES = [
  {
    id: 'lawyerSearch',
    name: 'Lawyer Matching',
    description: 'Users can request to be matched with an attorney',
    icon: Users,
  },
  {
    id: 'emailCapture',
    name: 'Lead Capture',
    description: 'Collect email addresses for follow-up',
    icon: Mail,
  },
  {
    id: 'documentUpload',
    name: 'Document Analysis',
    description: 'Allow users to upload documents for review',
    icon: FileText,
  },
  {
    id: 'outcomePrediction',
    name: 'Outcome Prediction',
    description: 'AI-powered case outcome analysis by jurisdiction',
    icon: Brain,
  },
];

export default function WebsiteIntegration() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, IntegrationAnalytics>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIntegration, setExpandedIntegration] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showCodeForIntegration, setShowCodeForIntegration] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('embed_widgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);

      if (data && data.length > 0) {
        await loadAnalytics(data.map(w => w.id));
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (integrationIds: string[]) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('widget_analytics')
        .select('widget_id, event_type')
        .in('widget_id', integrationIds)
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const analyticsMap: Record<string, IntegrationAnalytics> = {};
      integrationIds.forEach(id => {
        analyticsMap[id] = { impressions: 0, opens: 0, messages: 0, emailsCollected: 0 };
      });

      data?.forEach(event => {
        if (!analyticsMap[event.widget_id]) return;
        switch (event.event_type) {
          case 'impression':
            analyticsMap[event.widget_id].impressions++;
            break;
          case 'open':
            analyticsMap[event.widget_id].opens++;
            break;
          case 'message':
            analyticsMap[event.widget_id].messages++;
            break;
          case 'email_collected':
            analyticsMap[event.widget_id].emailsCollected++;
            break;
        }
      });

      setAnalytics(analyticsMap);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const createIntegration = async (name: string, config: IntegrationConfig, domains: string[], widgetType: string = 'chat') => {
    try {
      const { data, error } = await supabase
        .from('embed_widgets')
        .insert({
          user_id: user?.id,
          name,
          widget_type: widgetType,
          config,
          allowed_domains: domains,
        })
        .select()
        .single();

      if (error) throw error;
      setIntegrations([data, ...integrations]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating integration:', error);
    }
  };

  const updateIntegration = async (integration: Integration) => {
    try {
      const { error } = await supabase
        .from('embed_widgets')
        .update({
          name: integration.name,
          config: integration.config,
          allowed_domains: integration.allowed_domains,
          is_active: integration.is_active,
        })
        .eq('id', integration.id);

      if (error) throw error;
      setIntegrations(integrations.map(w => w.id === integration.id ? integration : w));
      setEditingIntegration(null);
    } catch (error) {
      console.error('Error updating integration:', error);
    }
  };

  const deleteIntegration = async (id: string) => {
    if (!confirm('Are you sure you want to delete this integration? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('embed_widgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIntegrations(integrations.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting integration:', error);
    }
  };

  const copyEmbedCode = (integration: Integration) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const embedCode = `<script>
(function() {
  var s = document.createElement('script');
  s.src = '${supabaseUrl}/functions/v1/embed-widget/loader.js?key=${integration.api_key}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`;

    navigator.clipboard.writeText(embedCode);
    setCopiedId(integration.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">
                <strong>See it in action!</strong> Watch how ezLegal.ai transforms websites like Step Up to Justice
              </span>
            </div>
            <button
              onClick={() => setShowDemoModal(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Website Widget Integration</h1>
              </div>
              <p className="text-teal-100 max-w-lg">
                Embed AI-powered legal widgets on your website with a single line of code. Choose from chat assistants, intake forms, and more to engage visitors and capture leads.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDemoModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg font-semibold transition-all border border-white/30"
              >
                <Play className="w-5 h-5" />
                Live Demo
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-white text-teal-600 px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-50 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create New Widget
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Total Views</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.impressions, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Conversations</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.opens, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Messages</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.messages, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-teal-200" />
                <span className="text-sm text-teal-200">Leads Captured</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(analytics).reduce((sum, a) => sum + a.emailsCollected, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {integrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-navy-200 shadow-sm overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-7 h-7 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 mb-3">
                  Add an AI Legal Widget to Your Website
                </h2>
                <p className="text-navy-600 mb-6 leading-relaxed">
                  Embed a chat widget, intake form, or legal guide directly on your website. Visitors get instant
                  legal information while you capture leads and connect users with attorney directories.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">24/7 Legal Guidance</p>
                      <p className="text-sm text-navy-600">AI answers questions instantly, any time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Lead Capture Built-In</p>
                      <p className="text-sm text-navy-600">Automatically collect contact information</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Attorney Matching</p>
                      <p className="text-sm text-navy-600">Connect qualified users with your network</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Create Your Integration
                </button>
              </div>

              <div className="bg-gradient-to-br from-navy-100 to-navy-50 p-8 lg:p-12 flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-96 bg-white rounded-2xl shadow-2xl border border-navy-200 overflow-hidden">
                    <div className="bg-teal-600 text-white px-4 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Legal Assistant</p>
                        <p className="text-xs text-teal-100">Online now</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-navy-100 rounded-xl p-3 max-w-[85%]">
                        <p className="text-sm text-navy-700">Hello! How can I help you with your legal questions today?</p>
                      </div>
                      <div className="bg-teal-600 text-white rounded-xl p-3 max-w-[85%] ml-auto">
                        <p className="text-sm">I have a question about my lease agreement...</p>
                      </div>
                      <div className="bg-navy-100 rounded-xl p-3 max-w-[85%]">
                        <p className="text-sm text-navy-700">I'd be happy to help with lease questions. What specific concern do you have?</p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-200 bg-white">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Type your question..."
                          className="flex-1 px-3 py-2 bg-navy-100 rounded-lg text-sm"
                          disabled
                        />
                        <button className="p-2 bg-teal-600 text-white rounded-lg">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-teal-600 rounded-full shadow-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {integrations.map(integration => {
              const integrationAnalytics = analytics[integration.id] || { impressions: 0, opens: 0, messages: 0, emailsCollected: 0 };
              const isExpanded = expandedIntegration === integration.id;

              return (
                <div
                  key={integration.id}
                  className="bg-white rounded-xl border border-navy-200 shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {(() => {
                          const typeInfo = getWidgetTypeInfo(integration.widget_type);
                          const TypeIcon = typeInfo.icon;
                          return (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${typeInfo.color}20` }}
                            >
                              <TypeIcon
                                className="w-6 h-6"
                                style={{ color: typeInfo.color }}
                              />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-navy-900">{integration.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              integration.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-navy-100 text-navy-600'
                            }`}>
                              {integration.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-sm text-navy-600 mt-1">
                            {getWidgetTypeInfo(integration.widget_type).name}
                          </p>
                          {integration.allowed_domains.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-navy-500">
                              <Globe className="w-3.5 h-3.5" />
                              <span>{integration.allowed_domains.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyEmbedCode(integration)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                            copiedId === integration.id
                              ? 'bg-green-100 text-green-700'
                              : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
                          }`}
                        >
                          {copiedId === integration.id ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy Code
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingIntegration(integration)}
                          className="p-2 text-navy-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteIntegration(integration.id)}
                          className="p-2 text-navy-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setExpandedIntegration(isExpanded ? null : integration.id);
                            if (isExpanded) setShowCodeForIntegration(null);
                          }}
                          className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6">
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs">Views</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.impressions.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <MousePointer className="w-4 h-4" />
                          <span className="text-xs">Conversations</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.opens.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-xs">Messages</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.messages.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-navy-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-navy-600 mb-1">
                          <Mail className="w-4 h-4" />
                          <span className="text-xs">Leads</span>
                        </div>
                        <p className="text-lg font-bold text-navy-900">
                          {integrationAnalytics.emailsCollected.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-navy-200">
                      <button
                        onClick={() => setShowCodeForIntegration(
                          showCodeForIntegration === integration.id ? null : integration.id
                        )}
                        className="w-full px-6 py-3 bg-navy-50 hover:bg-navy-100 transition-colors flex items-center justify-between text-left"
                      >
                        <span className="font-semibold text-navy-900">
                          {showCodeForIntegration === integration.id ? 'Hide' : 'Show'} Installation Code
                        </span>
                        {showCodeForIntegration === integration.id ? (
                          <ChevronUp className="w-5 h-5 text-navy-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-navy-400" />
                        )}
                      </button>
                      {showCodeForIntegration === integration.id && (
                        <div className="p-6 bg-navy-50">
                          <div className="bg-navy-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
{`<script>
(function() {
  var s = document.createElement('script');
  s.src = '${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-widget/loader.js?key=${integration.api_key}';
  s.async = true;
  document.head.appendChild(s);
})();
</script>`}
                            </pre>
                          </div>
                          <p className="text-sm text-navy-600 mt-3">
                            Add this code just before the closing <code className="bg-navy-200 px-1.5 py-0.5 rounded text-navy-800">&lt;/body&gt;</code> tag on your website.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">5-Minute Setup</h3>
            <p className="text-sm text-navy-600">
              Copy one line of code to your website. No technical skills required - works with any website builder.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">Secure & Compliant</h3>
            <p className="text-sm text-navy-600">
              Domain whitelisting prevents unauthorized use. All conversations are encrypted and protected.
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="font-bold text-navy-900 mb-2">Real-Time Analytics</h3>
            <p className="text-sm text-navy-600">
              Track conversations, leads captured, and engagement metrics from your dashboard.
            </p>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateIntegrationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createIntegration}
        />
      )}

      {editingIntegration && (
        <EditIntegrationModal
          integration={editingIntegration}
          onClose={() => setEditingIntegration(null)}
          onSave={updateIntegration}
        />
      )}

      {showDemoModal && (
        <WidgetDemoModal onClose={() => setShowDemoModal(false)} />
      )}
    </div>
  );
}

function CreateIntegrationModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, config: IntegrationConfig, domains: string[], widgetType: string) => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [widgetType, setWidgetType] = useState('chat');
  const [config, setConfig] = useState<IntegrationConfig>(DEFAULT_CONFIG);
  const [domainsInput, setDomainsInput] = useState('');

  const handleCreate = () => {
    const domains = domainsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    onCreate(name, config, domains, widgetType);
  };

  const updateFeature = (featureId: string, value: boolean) => {
    setConfig({
      ...config,
      features: {
        ...config.features,
        [featureId]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Create New Widget</h2>
            <p className="text-sm text-navy-600">Step {step} of 2</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  Widget Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {WIDGET_TYPES.map((wt) => {
                    const WtIcon = wt.icon;
                    return (
                      <button
                        key={wt.id}
                        type="button"
                        onClick={() => setWidgetType(wt.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          widgetType === wt.id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-navy-200 hover:border-navy-300'
                        }`}
                      >
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${wt.color}15` }}
                        >
                          <WtIcon className="w-4.5 h-4.5" style={{ color: wt.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm ${widgetType === wt.id ? 'text-teal-700' : 'text-navy-900'}`}>
                            {wt.name}
                          </p>
                          <p className="text-xs text-navy-500 truncate">{wt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Integration Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Main Website, Landing Page"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                />
                <p className="text-sm text-navy-500 mt-2">
                  Use a name that helps you identify where this is installed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-3">
                  Features
                </label>
                <div className="space-y-3">
                  {FEATURES.map(feature => (
                    <div
                      key={feature.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        config.features[feature.id as keyof typeof config.features]
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-navy-200 hover:border-navy-300'
                      }`}
                      onClick={() => updateFeature(
                        feature.id,
                        !config.features[feature.id as keyof typeof config.features]
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <feature.icon className={`w-5 h-5 ${
                          config.features[feature.id as keyof typeof config.features]
                            ? 'text-teal-600'
                            : 'text-navy-400'
                        }`} />
                        <div>
                          <p className="font-medium text-navy-900">{feature.name}</p>
                          <p className="text-sm text-navy-500">{feature.description}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        config.features[feature.id as keyof typeof config.features]
                          ? 'border-teal-600 bg-teal-600'
                          : 'border-navy-300'
                      }`}>
                        {config.features[feature.id as keyof typeof config.features] && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Appearance
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.appearance.primaryColor}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, primaryColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded-lg border border-navy-300 cursor-pointer"
                    />
                    <span className="text-sm text-navy-600">Brand Color</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={config.appearance.headerTitle}
                      onChange={(e) => setConfig({
                        ...config,
                        appearance: { ...config.appearance, headerTitle: e.target.value }
                      })}
                      placeholder="Header Title"
                      className="w-full px-3 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Allowed Domains
                </label>
                <textarea
                  value={domainsInput}
                  onChange={(e) => setDomainsInput(e.target.value)}
                  rows={3}
                  placeholder="example.com, www.example.com"
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none font-mono text-sm"
                />
                <p className="text-sm text-navy-600 mt-2">
                  Enter comma-separated domains where this can be installed. Leave empty to allow all domains.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Security Recommendation</p>
                    <p className="text-sm text-amber-800 mt-1">
                      We strongly recommend restricting to specific domains to prevent unauthorized usage.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={config.behavior.greetingMessage}
                  onChange={(e) => setConfig({
                    ...config,
                    behavior: { ...config.behavior, greetingMessage: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-navy-50 rounded-xl p-6">
                <h4 className="font-semibold text-navy-900 mb-4">Preview</h4>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: config.appearance.primaryColor }}
                  >
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">{name || 'Your Integration'}</p>
                    <p className="text-sm text-navy-600">
                      {config.appearance.headerTitle} - {config.appearance.position}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-navy-50 border-t border-navy-200 px-6 py-4 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Create Integration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EditIntegrationModal({
  integration,
  onClose,
  onSave,
}: {
  integration: Integration;
  onClose: () => void;
  onSave: (integration: Integration) => void;
}) {
  const [editedIntegration, setEditedIntegration] = useState<Integration>({ ...integration });
  const [domainsInput, setDomainsInput] = useState(integration.allowed_domains.join(', '));

  const config = editedIntegration.config as IntegrationConfig;

  const handleSave = () => {
    const domains = domainsInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    onSave({
      ...editedIntegration,
      allowed_domains: domains,
    });
  };

  const updateFeature = (featureId: string, value: boolean) => {
    setEditedIntegration({
      ...editedIntegration,
      config: {
        ...config,
        features: {
          ...(config.features || { lawyerSearch: true, emailCapture: true, documentUpload: false }),
          [featureId]: value,
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-navy-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-navy-900">Edit Integration</h2>
          <button
            onClick={onClose}
            className="p-2 text-navy-500 hover:text-navy-700 hover:bg-navy-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Integration Name
            </label>
            <input
              type="text"
              value={editedIntegration.name}
              onChange={(e) => setEditedIntegration({ ...editedIntegration, name: e.target.value })}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
            <div>
              <p className="font-medium text-navy-900">Active</p>
              <p className="text-sm text-navy-600">Enable or disable this integration</p>
            </div>
            <button
              onClick={() => setEditedIntegration({ ...editedIntegration, is_active: !editedIntegration.is_active })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                editedIntegration.is_active ? 'bg-green-500' : 'bg-navy-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                editedIntegration.is_active ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-3">
              Features
            </label>
            <div className="space-y-3">
              {FEATURES.map(feature => {
                const features = config.features || { lawyerSearch: true, emailCapture: true, documentUpload: false };
                const isEnabled = features[feature.id as keyof typeof features];
                return (
                  <div
                    key={feature.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isEnabled
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-navy-200 hover:border-navy-300'
                    }`}
                    onClick={() => updateFeature(feature.id, !isEnabled)}
                  >
                    <div className="flex items-center gap-3">
                      <feature.icon className={`w-5 h-5 ${isEnabled ? 'text-teal-600' : 'text-navy-400'}`} />
                      <div>
                        <p className="font-medium text-navy-900">{feature.name}</p>
                        <p className="text-sm text-navy-500">{feature.description}</p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isEnabled ? 'border-teal-600 bg-teal-600' : 'border-navy-300'
                    }`}>
                      {isEnabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.appearance?.primaryColor || '#0067FF'}
                onChange={(e) => setEditedIntegration({
                  ...editedIntegration,
                  config: {
                    ...config,
                    appearance: { ...config.appearance, primaryColor: e.target.value }
                  }
                })}
                className="w-12 h-12 rounded-lg border border-navy-300 cursor-pointer"
              />
              <input
                type="text"
                value={config.appearance?.primaryColor || '#0067FF'}
                onChange={(e) => setEditedIntegration({
                  ...editedIntegration,
                  config: {
                    ...config,
                    appearance: { ...config.appearance, primaryColor: e.target.value }
                  }
                })}
                className="flex-1 px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Header Title
            </label>
            <input
              type="text"
              value={config.appearance?.headerTitle || 'Legal Assistant'}
              onChange={(e) => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  appearance: { ...config.appearance, headerTitle: e.target.value }
                }
              })}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Greeting Message
            </label>
            <textarea
              value={config.behavior?.greetingMessage || 'Hello! How can I help you with your legal questions today?'}
              onChange={(e) => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  behavior: { ...config.behavior, greetingMessage: e.target.value }
                }
              })}
              rows={3}
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              Allowed Domains
            </label>
            <textarea
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              rows={2}
              placeholder="example.com, www.example.com"
              className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
            <div>
              <p className="font-medium text-navy-900">Show Branding</p>
              <p className="text-sm text-navy-600">Display "Powered by ezLegal.ai"</p>
            </div>
            <button
              onClick={() => setEditedIntegration({
                ...editedIntegration,
                config: {
                  ...config,
                  appearance: { ...config.appearance, showBranding: !config.appearance?.showBranding }
                }
              })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                config.appearance?.showBranding ? 'bg-teal-600' : 'bg-navy-300'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                config.appearance?.showBranding ? 'left-7' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-navy-50 border-t border-navy-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-navy-700 font-medium hover:bg-navy-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

```

---

## src/pages/SimpleChatbot.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 37.4 KB | 38.1 KB |
| Lines | 857 | 876 |
| Delta | — | 102% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { chatService, DocumentAttachment, ThinkingDetails } from '../services/chat-service';
import { extractTextFromFiles, convertPdfToImages, convertImageToBase64, DocumentImage } from '../lib/document-extractor';
import {
  Send, Bot, User, Sparkles, Download, Mic, MicOff, Upload, FileText, Trash2, ChevronDown, ChevronUp, BookOpen, X, Zap, Loader2, Scale
} from 'lucide-react';
import { practiceAreas } from '../data/practiceAreas';
import DocumentUploadWarning from '../components/DocumentUploadWarning';
import CitationDisplay, { Citation } from '../components/CitationDisplay';
import CourtReadyOutputBuilder, { CourtReadyOutput } from '../components/CourtReadyOutputBuilder';
import LegalResponseFormatter from '../components/LegalResponseFormatter';
import ThinkingDetailsPanel from '../components/ThinkingDetailsPanel';
import ChatSharePrompt from '../components/ChatSharePrompt';
import EmailCapturePanel from '../components/EmailCapturePanel';
import InFlowTrustStrip from '../components/InFlowTrustStrip';
import PersonaNextSteps from '../components/PersonaNextSteps';
import { useEngagementThrottle } from '../hooks/useEngagementThrottle';

interface Message {
  id: string;
  message: string;
  response: string;
  created_at: string;
  model_used?: string;
  tokens_used?: number;
  citations?: Citation[];
  jurisdiction?: string;
  thinkingDetails?: ThinkingDetails;
}

export default function SimpleChatbot() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedDocumentText, setExtractedDocumentText] = useState<string>('');
  const [documentImages, setDocumentImages] = useState<DocumentImage[]>([]);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showCourtReadyOutput, setShowCourtReadyOutput] = useState(false);
  const [courtReadyData, setCourtReadyData] = useState<CourtReadyOutput | null>(null);
  const [userTriggeredAction, setUserTriggeredAction] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const engagement = useEngagementThrottle();

  useEffect(() => {
    loadMessages();
    initializeSpeechRecognition();
  }, [user]);

  useEffect(() => {
    const topicFromDashboard = (location.state as { topic?: string })?.topic;
    if (topicFromDashboard) {
      setSelectedTopic(topicFromDashboard);
      const question = `I need help with ${topicFromDashboard}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
      submitTopicQuestion(question);
      window.history.replaceState({}, document.title);
    }
  }, [location.key]);

  const submitTopicQuestion = async (question: string) => {
    setLoading(true);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }

      const aiResult = await chatService.sendMessage(question);
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const thinkingDetails = aiResult.thinkingDetails;

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: question,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages(prev => [...prev, { ...data, model_used: modelUsed, tokens_used: tokensUsed, thinkingDetails }]);
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: question,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
          thinkingDetails,
        };
        setMessages(prev => [...prev, tempMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'es' ? 'es-US' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPendingFiles(files);
    setShowUploadWarning(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFilesAfterConsent = async () => {
    if (pendingFiles.length === 0) return;

    setShowUploadWarning(false);
    setUploadedFiles(prev => [...prev, ...pendingFiles]);
    setIsExtractingText(true);
    setExtractionError(null);

    try {
      const allFiles = [...uploadedFiles, ...pendingFiles];
      const allImages: DocumentImage[] = [];

      for (const file of allFiles) {
        const fileName = file.name.toLowerCase();
        const fileType = file.type;

        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          const pdfImages = await convertPdfToImages(file, 5);
          allImages.push(...pdfImages);
        } else if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/.test(fileName)) {
          const imgData = await convertImageToBase64(file);
          if (imgData) {
            allImages.push(imgData);
          }
        }
      }

      setDocumentImages(allImages);

      const extractedText = await extractTextFromFiles(allFiles);
      setExtractedDocumentText(extractedText);

      if (allImages.length > 0) {
        setExtractionError(null);
      } else if (!extractedText || extractedText.trim().length < 50) {
        setExtractionError('Could not extract readable text from this document. The file may be scanned/image-based or encrypted.');
      }
    } catch (error) {
      console.error('Failed to process files:', error);
      setExtractionError('Failed to process document. Please try a different file format.');
    } finally {
      setIsExtractingText(false);
      setPendingFiles([]);
    }
  };

  const removeFile = async (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setExtractionError(null);

    if (newFiles.length === 0) {
      setExtractedDocumentText('');
      setDocumentImages([]);
    } else {
      setIsExtractingText(true);
      try {
        const allImages: DocumentImage[] = [];
        for (const file of newFiles) {
          const fileName = file.name.toLowerCase();
          const fileType = file.type;
          if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            const pdfImages = await convertPdfToImages(file, 5);
            allImages.push(...pdfImages);
          } else if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/.test(fileName)) {
            const imgData = await convertImageToBase64(file);
            if (imgData) allImages.push(imgData);
          }
        }
        setDocumentImages(allImages);

        const extractedText = await extractTextFromFiles(newFiles);
        setExtractedDocumentText(extractedText);
        if (allImages.length === 0 && (!extractedText || extractedText.trim().length < 50)) {
          setExtractionError('Could not extract readable text from this document.');
        }
      } catch (error) {
        console.error('Failed to process files:', error);
        setExtractionError('Failed to process document.');
      } finally {
        setIsExtractingText(false);
      }
    }
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg =>
      `User: ${msg.message}\n\nAI Assistant: ${msg.response}\n\n${'='.repeat(80)}\n\n`
    ).join('');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadMessages = async () => {
    if (!user) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isExtractingText) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    const documentTextToSend = extractedDocumentText;
    const imagesToSend = documentImages;
    const fileCount = uploadedFiles.length;
    const fileNames = uploadedFiles.map(f => f.name).join(', ');
    setUploadedFiles([]);
    setExtractedDocumentText('');
    setDocumentImages([]);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }

      const attachments: DocumentAttachment[] = imagesToSend.map(img => ({
        type: 'pdf_page' as const,
        data: img.data,
        mimeType: img.mimeType,
        filename: img.filename,
        pageNumber: img.pageNumber,
      }));

      const aiResult = await chatService.sendMessage(
        userMessage,
        attachments.length === 0 ? documentTextToSend : undefined,
        attachments.length > 0 ? attachments : undefined
      );
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const thinkingDetails = aiResult.thinkingDetails;

      const displayMessage = (documentTextToSend || attachments.length > 0) && fileCount > 0
        ? `${userMessage}\n[Attached: ${fileCount} document(s): ${fileNames}]`
        : userMessage;

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: displayMessage,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages([...messages, { ...data, model_used: modelUsed, tokens_used: tokensUsed, thinkingDetails }]);
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: displayMessage,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
          thinkingDetails,
        };
        setMessages([...messages, tempMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  const quickPrompts = [
    "Help me understand contract law",
    "What should I know about intellectual property?",
    "Explain employment rights in Arizona",
    "How do I start a business?",
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <InFlowTrustStrip compact />
      {!user && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-b-2 border-teal-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-teal-600" />
              <div>
                <p className="font-semibold text-navy-900">
                  {language === 'en' ? 'Welcome, Guest!' : 'Bienvenido, Invitado!'}
                </p>
                <p className="text-sm text-navy-600">
                  {language === 'en' ? 'Sign in to save your conversations' : 'Inicia sesion para guardar tus conversaciones'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                {language === 'en' ? 'Create Account' : 'Crear Cuenta'}
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-200 rounded-lg transition-colors font-medium text-sm"
              >
                {language === 'en' ? 'Sign In' : 'Iniciar Sesion'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-navy-50 to-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {selectedTopic && (
            <div className="bg-gradient-to-r from-teal-600/10 to-teal-700/10 border-2 border-teal-600/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                      {language === 'en' ? 'Current Topic' : 'Tema Actual'}
                    </p>
                    <p className="font-bold text-navy-900">{selectedTopic}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 hover:bg-navy-200 rounded-lg transition-colors"
                  title="Clear topic"
                >
                  <X className="w-4 h-4 text-navy-500" />
                </button>
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mb-2">
                ezLegal.ai<sup className="text-lg">TM</sup> Legal Assistant
              </h3>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[10px] font-medium text-navy-500 uppercase tracking-wide">Powered by</span>
                <span className="text-sm font-bold text-navy-700">Legalbreeze®</span>
              </div>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto mb-8">
                {language === 'en'
                  ? "Ask any legal question and get instant guidance. I'm trained on Arizona law to help consumers and small businesses understand their legal situation before consulting with an attorney."
                  : "Haga cualquier pregunta legal y obtenga orientacion al instante. Estoy entrenado en la ley de Arizona para ayudar a consumidores y pequenas empresas a entender su situacion legal antes de consultar con un abogado."}
              </p>

              <h4 className="text-lg font-semibold text-navy-900 mb-4">
                {language === 'en' ? 'Popular Questions' : 'Preguntas Populares'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 100);
                    }}
                    className="text-left p-4 bg-white border border-navy-200 rounded-xl hover:border-teal-600 hover:shadow-lg transition-all group"
                  >
                    <p className="text-sm font-medium text-navy-700 group-hover:text-teal-600">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl rounded-tr-md px-5 py-4 max-w-2xl shadow-lg">
                    <p className="text-[15px] leading-relaxed">{msg.message}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-2xl">
                    {msg.thinkingDetails && (
                      <ThinkingDetailsPanel thinking={msg.thinkingDetails} />
                    )}
                    <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                      <LegalResponseFormatter content={msg.response} />
                      {msg.model_used && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-100">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-navy-400">
                            Powered by {msg.model_used}
                            {msg.tokens_used && ` (${msg.tokens_used} tokens)`}
                          </span>
                        </div>
                      )}
                      <CitationDisplay
                        citations={msg.citations}
                        jurisdiction={msg.jurisdiction || 'Arizona'}
                        lastUpdated={new Date(msg.created_at).toLocaleDateString()}
                        verificationStatus={msg.citations && msg.citations.length > 0 ? 'verified' : 'unverified'}
                        showCompact={true}
                      />
                      {messages.indexOf(msg) === messages.length - 1 && engagement.shouldShowSharePrompt(messages.length) && (
                        <ChatSharePrompt
                          messageCount={messages.length}
                          onDismiss={() => engagement.dismiss('sharePrompt')}
                        />
                      )}
                      {messages.indexOf(msg) === messages.length - 1 && !user && engagement.shouldShowEmailCapture(userTriggeredAction, !!user) && (
                        <EmailCapturePanel
                          context={msg.response.slice(0, 200)}
                          onDismiss={() => engagement.dismiss('emailCapture')}
                        />
                      )}
                    </div>
                    {messages.indexOf(msg) === messages.length - 1 && engagement.shouldShowNextBestStep(messages.length) && (
                      <div className="mt-3">
                        <PersonaNextSteps context="chat" compact maxItems={3} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 max-w-2xl">
                <ThinkingDetailsPanel thinking={null} isLoading={true} />
                <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-navy-200 px-6 py-5 shadow-xl">
        <div className="max-w-4xl mx-auto">
          {messages.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => { setUserTriggeredAction(true); exportConversation(); }}
                className="flex items-center gap-2 px-4 py-2 bg-navy-100 hover:bg-navy-200 text-navy-700 rounded-lg transition-all font-medium text-sm"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
                {language === 'en' ? 'Export Conversation' : 'Exportar Conversacion'}
              </button>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-300 text-amber-700 rounded-lg transition-all font-semibold text-sm w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {language === 'en' ? 'Browse Topics' : 'Explorar Temas'}
              </span>
              {showPromptLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPromptLibrary && (
              <div className="mt-3 bg-gradient-to-br from-navy-50 to-white border-2 border-navy-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-navy-200">
                  {practiceAreas.map((area) => {
                    const Icon = area.icon;
                    return (
                      <button
                        key={area.id}
                        onClick={() => setExpandedCategory(expandedCategory === area.id ? null : area.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          expandedCategory === area.id
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-white border border-navy-200 text-navy-700 hover:border-teal-600 hover:text-teal-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {area.name}
                        {expandedCategory === area.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {expandedCategory && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-teal-600">
                        {practiceAreas.find(a => a.id === expandedCategory)?.name} Services
                      </h4>
                      <button
                        onClick={() => setExpandedCategory(null)}
                        className="p-1 hover:bg-navy-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-navy-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {practiceAreas
                        .find(a => a.id === expandedCategory)
                        ?.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              const topic = `${practiceAreas.find(a => a.id === expandedCategory)?.name}: ${sub.name}`;
                              setSelectedTopic(topic);
                              setShowPromptLibrary(false);
                              setExpandedCategory(null);
                              const question = `I need help with ${topic}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
                              submitTopicQuestion(question);
                            }}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-navy-200 hover:border-teal-600 hover:shadow-md transition-all text-left group"
                          >
                            <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0" />
                            <span className="text-sm text-navy-700 group-hover:text-teal-600 transition-colors">
                              {sub.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {!expandedCategory && (
                  <p className="text-sm text-navy-500 text-center py-4">
                    {language === 'en' ? 'Click a category above to see available services' : 'Haga clic en una categoria para ver los servicios disponibles'}
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {uploadedFiles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-teal-50 border-2 border-teal-200 rounded-lg px-3 py-2"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-navy-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-navy-400 hover:text-red-600 transition-colors"
                        disabled={isExtractingText}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {isExtractingText ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing document(s) for AI analysis...</span>
                  </div>
                ) : extractionError && documentImages.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <X className="w-4 h-4" />
                    <span>{extractionError}</span>
                  </div>
                ) : documentImages.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Document ready for AI Vision analysis ({documentImages.length} page{documentImages.length > 1 ? 's' : ''} captured)</span>
                  </div>
                ) : extractedDocumentText ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Document content ready ({Math.round(extractedDocumentText.length / 1000)}KB extracted)</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp,image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-navy-100 hover:bg-navy-200 text-navy-700 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Upload documents"
              >
                <Upload className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-navy-100 hover:bg-navy-200 text-navy-700'
                } p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <label htmlFor="simple-chat-input" className="sr-only">Ask your legal question</label>
              <input
                id="simple-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' ? 'Ask your legal question...' : 'Haga su pregunta legal...'}
                disabled={loading}
                aria-label="Ask your legal question"
                className="flex-1 px-5 py-3 border-2 border-navy-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 placeholder-navy-400 text-[15px]"
              />

              <button
                type="submit"
                disabled={loading || !input.trim() || isExtractingText}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                title={documentImages.length > 0 ? `Send with ${documentImages.length} document page(s) for AI Vision analysis` : 'Send message'}
              >
                {isExtractingText ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {messages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-navy-200">
              <button
                onClick={() => {
                  const output: CourtReadyOutput = {
                    title: 'Court-Ready Action Plan',
                    jurisdiction: 'Arizona',
                    caseType: selectedTopic || 'Legal Matter',
                    generatedDate: new Date().toLocaleDateString(),
                    summary: 'Based on your conversation, here is an action plan to help you prepare for your legal matter.',
                    warnings: [
                      'Deadlines are critical in legal matters - missing a deadline can result in losing your case',
                      'This is informational guidance only and does not constitute legal advice',
                      'For complex matters, consult with a licensed attorney'
                    ],
                    checklist: [
                      { id: '1', text: 'Gather all relevant documents', priority: 'high' },
                      { id: '2', text: 'Note all important dates and deadlines', priority: 'high' },
                      { id: '3', text: 'Make copies of all documents for your records', priority: 'medium' },
                      { id: '4', text: 'Write a timeline of events', priority: 'medium' },
                      { id: '5', text: 'Identify potential witnesses', priority: 'medium' },
                      { id: '6', text: 'Research relevant laws and statutes', priority: 'low' },
                      { id: '7', text: 'Consider consulting with an attorney', priority: 'high' },
                    ],
                    documentsNeeded: [
                      'Any contracts or written agreements',
                      'Correspondence (emails, letters, texts)',
                      'Receipts or proof of payment',
                      'Photo or video evidence',
                      'Witness contact information',
                      'Government-issued ID',
                    ],
                    nextSteps: [
                      'Review the checklist and gather all documents',
                      'Research free legal aid resources in your area',
                      'Consider scheduling a consultation with an attorney',
                      'File any necessary court documents before deadlines',
                    ],
                    courtInfo: {
                      name: 'Maricopa County Superior Court',
                      address: '201 W. Jefferson St., Phoenix, AZ 85003',
                      phone: '(602) 506-3204',
                      hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
                      website: 'https://superiorcourt.maricopa.gov',
                    },
                  };
                  setCourtReadyData(output);
                  setShowCourtReadyOutput(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white rounded-lg transition-all font-medium text-sm shadow-md"
              >
                <Scale className="w-4 h-4" />
                {language === 'en' ? 'Generate Court-Ready Action Plan' : 'Generar Plan de Accion para el Tribunal'}
              </button>
            </div>
          )}
        </div>
      </div>

      <DocumentUploadWarning
        isOpen={showUploadWarning}
        onClose={() => {
          setShowUploadWarning(false);
          setPendingFiles([]);
        }}
        onConsent={processFilesAfterConsent}
        fileName={pendingFiles.length > 0 ? pendingFiles.map(f => f.name).join(', ') : undefined}
      />

      {showCourtReadyOutput && courtReadyData && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CourtReadyOutputBuilder
            output={courtReadyData}
            onClose={() => {
              setShowCourtReadyOutput(false);
              setCourtReadyData(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { chatService, DocumentAttachment, ThinkingDetails } from '../services/chat-service';
import { extractTextFromFiles, convertPdfToImages, convertImageToBase64, DocumentImage } from '../lib/document-extractor';
import {
  Send, Bot, User, Sparkles, Download, Mic, MicOff, Upload, FileText, Trash2, ChevronDown, ChevronUp, BookOpen, X, Zap, Loader2, Scale
} from 'lucide-react';
import { practiceAreas } from '../data/practiceAreas';
import DocumentUploadWarning from '../components/DocumentUploadWarning';
import CitationDisplay, { Citation } from '../components/CitationDisplay';
import CourtReadyOutputBuilder, { CourtReadyOutput } from '../components/CourtReadyOutputBuilder';
import LegalResponseFormatter from '../components/LegalResponseFormatter';
import ThinkingDetailsPanel from '../components/ThinkingDetailsPanel';
import ChatSharePrompt from '../components/ChatSharePrompt';
import EmailCapturePanel from '../components/EmailCapturePanel';
import InFlowTrustStrip from '../components/InFlowTrustStrip';
import PersonaNextSteps from '../components/PersonaNextSteps';
import UserMenu from '../components/UserMenu';
import { useEngagementThrottle } from '../hooks/useEngagementThrottle';

interface Message {
  id: string;
  message: string;
  response: string;
  created_at: string;
  model_used?: string;
  tokens_used?: number;
  citations?: Citation[];
  jurisdiction?: string;
  thinkingDetails?: ThinkingDetails;
}

export default function SimpleChatbot() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [extractedDocumentText, setExtractedDocumentText] = useState<string>('');
  const [documentImages, setDocumentImages] = useState<DocumentImage[]>([]);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showUploadWarning, setShowUploadWarning] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showCourtReadyOutput, setShowCourtReadyOutput] = useState(false);
  const [courtReadyData, setCourtReadyData] = useState<CourtReadyOutput | null>(null);
  const [userTriggeredAction, setUserTriggeredAction] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const engagement = useEngagementThrottle();

  useEffect(() => {
    loadMessages();
    initializeSpeechRecognition();
  }, [user]);

  useEffect(() => {
    const topicFromDashboard = (location.state as { topic?: string })?.topic;
    if (topicFromDashboard) {
      setSelectedTopic(topicFromDashboard);
      const question = `I need help with ${topicFromDashboard}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
      submitTopicQuestion(question);
      window.history.replaceState({}, document.title);
    }
  }, [location.key]);

  const submitTopicQuestion = async (question: string) => {
    setLoading(true);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }

      const aiResult = await chatService.sendMessage(question);
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const thinkingDetails = aiResult.thinkingDetails;

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: question,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages(prev => [...prev, { ...data, model_used: modelUsed, tokens_used: tokensUsed, thinkingDetails }]);
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: question,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
          thinkingDetails,
        };
        setMessages(prev => [...prev, tempMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'es' ? 'es-US' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPendingFiles(files);
    setShowUploadWarning(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFilesAfterConsent = async () => {
    if (pendingFiles.length === 0) return;

    setShowUploadWarning(false);
    setUploadedFiles(prev => [...prev, ...pendingFiles]);
    setIsExtractingText(true);
    setExtractionError(null);

    try {
      const allFiles = [...uploadedFiles, ...pendingFiles];
      const allImages: DocumentImage[] = [];

      for (const file of allFiles) {
        const fileName = file.name.toLowerCase();
        const fileType = file.type;

        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          const pdfImages = await convertPdfToImages(file, 5);
          allImages.push(...pdfImages);
        } else if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/.test(fileName)) {
          const imgData = await convertImageToBase64(file);
          if (imgData) {
            allImages.push(imgData);
          }
        }
      }

      setDocumentImages(allImages);

      const extractedText = await extractTextFromFiles(allFiles);
      setExtractedDocumentText(extractedText);

      if (allImages.length > 0) {
        setExtractionError(null);
      } else if (!extractedText || extractedText.trim().length < 50) {
        setExtractionError('Could not extract readable text from this document. The file may be scanned/image-based or encrypted.');
      }
    } catch (error) {
      console.error('Failed to process files:', error);
      setExtractionError('Failed to process document. Please try a different file format.');
    } finally {
      setIsExtractingText(false);
      setPendingFiles([]);
    }
  };

  const removeFile = async (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setExtractionError(null);

    if (newFiles.length === 0) {
      setExtractedDocumentText('');
      setDocumentImages([]);
    } else {
      setIsExtractingText(true);
      try {
        const allImages: DocumentImage[] = [];
        for (const file of newFiles) {
          const fileName = file.name.toLowerCase();
          const fileType = file.type;
          if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            const pdfImages = await convertPdfToImages(file, 5);
            allImages.push(...pdfImages);
          } else if (fileType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/.test(fileName)) {
            const imgData = await convertImageToBase64(file);
            if (imgData) allImages.push(imgData);
          }
        }
        setDocumentImages(allImages);

        const extractedText = await extractTextFromFiles(newFiles);
        setExtractedDocumentText(extractedText);
        if (allImages.length === 0 && (!extractedText || extractedText.trim().length < 50)) {
          setExtractionError('Could not extract readable text from this document.');
        }
      } catch (error) {
        console.error('Failed to process files:', error);
        setExtractionError('Failed to process document.');
      } finally {
        setIsExtractingText(false);
      }
    }
  };

  const exportConversation = () => {
    const conversationText = messages.map(msg =>
      `User: ${msg.message}\n\nAI Assistant: ${msg.response}\n\n${'='.repeat(80)}\n\n`
    ).join('');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadMessages = async () => {
    if (!user) {
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isExtractingText) return;

    setLoading(true);
    const userMessage = input.trim();
    setInput('');

    const documentTextToSend = extractedDocumentText;
    const imagesToSend = documentImages;
    const fileCount = uploadedFiles.length;
    const fileNames = uploadedFiles.map(f => f.name).join(', ');
    setUploadedFiles([]);
    setExtractedDocumentText('');
    setDocumentImages([]);

    try {
      if (user) {
        chatService.setUserId(user.id);
      }

      const attachments: DocumentAttachment[] = imagesToSend.map(img => ({
        type: 'pdf_page' as const,
        data: img.data,
        mimeType: img.mimeType,
        filename: img.filename,
        pageNumber: img.pageNumber,
      }));

      const aiResult = await chatService.sendMessage(
        userMessage,
        attachments.length === 0 ? documentTextToSend : undefined,
        attachments.length > 0 ? attachments : undefined
      );
      const aiResponse = aiResult.content;
      const modelUsed = aiResult.modelUsed;
      const tokensUsed = aiResult.usage?.totalTokens;
      const thinkingDetails = aiResult.thinkingDetails;

      const displayMessage = (documentTextToSend || attachments.length > 0) && fileCount > 0
        ? `${userMessage}\n[Attached: ${fileCount} document(s): ${fileNames}]`
        : userMessage;

      if (user) {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: displayMessage,
            response: aiResponse,
          })
          .select()
          .single();

        if (!error && data) {
          setMessages([...messages, { ...data, model_used: modelUsed, tokens_used: tokensUsed, thinkingDetails }]);
        }
      } else {
        const tempMessage: Message = {
          id: Date.now().toString(),
          message: displayMessage,
          response: aiResponse,
          created_at: new Date().toISOString(),
          model_used: modelUsed,
          tokens_used: tokensUsed,
          thinkingDetails,
        };
        setMessages([...messages, tempMessage]);
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
    }

    setLoading(false);
  };

  const quickPrompts = [
    "Help me understand contract law",
    "What should I know about intellectual property?",
    "Explain employment rights in Arizona",
    "How do I start a business?",
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {user && (
        <header
          role="banner"
          className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-navy-200 shadow-sm"
        >
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded"
              aria-label="ezLegal.ai"
            >
              <img
                src="/red-and-grey-minamali-business-card-2-1-2.svg"
                alt="ezLegal.ai"
                width={120}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            <UserMenu />
          </div>
        </header>
      )}
      <InFlowTrustStrip compact />
      {!user && (
        <div className="bg-gradient-to-r from-teal-50 to-teal-100 border-b-2 border-teal-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-teal-600" />
              <div>
                <p className="font-semibold text-navy-900">
                  {language === 'en' ? 'Welcome, Guest!' : 'Bienvenido, Invitado!'}
                </p>
                <p className="text-sm text-navy-600">
                  {language === 'en' ? 'Sign in to save your conversations' : 'Inicia sesion para guardar tus conversaciones'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/signup"
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white rounded-lg transition-all font-semibold shadow-md text-sm"
              >
                {language === 'en' ? 'Create Account' : 'Crear Cuenta'}
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 bg-white hover:bg-navy-50 text-navy-700 border-2 border-navy-200 rounded-lg transition-colors font-medium text-sm"
              >
                {language === 'en' ? 'Sign In' : 'Iniciar Sesion'}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-6 bg-gradient-to-b from-navy-50 to-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {selectedTopic && (
            <div className="bg-gradient-to-r from-teal-600/10 to-teal-700/10 border-2 border-teal-600/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-600 uppercase tracking-wider">
                      {language === 'en' ? 'Current Topic' : 'Tema Actual'}
                    </p>
                    <p className="font-bold text-navy-900">{selectedTopic}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 hover:bg-navy-200 rounded-lg transition-colors"
                  title="Clear topic"
                >
                  <X className="w-4 h-4 text-navy-500" />
                </button>
              </div>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bot className="w-10 h-10 text-teal-600" />
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mb-2">
                ezLegal.ai<sup className="text-lg">TM</sup> Legal Assistant
              </h3>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[10px] font-medium text-navy-500 uppercase tracking-wide">Powered by</span>
                <span className="text-sm font-bold text-navy-700">Legalbreeze®</span>
              </div>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto mb-8">
                {language === 'en'
                  ? "Ask any legal question and get instant guidance. I'm trained on Arizona law to help consumers and small businesses understand their legal situation before consulting with an attorney."
                  : "Haga cualquier pregunta legal y obtenga orientación al instante. Estoy entrenado en la ley de Arizona para ayudar a consumidores y pequenas empresas a entender su situación legal antes de consultar con un abogado."}
              </p>

              <h4 className="text-lg font-semibold text-navy-900 mb-4">
                {language === 'en' ? 'Popular Questions' : 'Preguntas Populares'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(prompt);
                      setTimeout(() => {
                        const form = document.querySelector('form');
                        if (form) {
                          const event = new Event('submit', { bubbles: true, cancelable: true });
                          form.dispatchEvent(event);
                        }
                      }, 100);
                    }}
                    className="text-left p-4 bg-white border border-navy-200 rounded-xl hover:border-teal-600 hover:shadow-lg transition-all group"
                  >
                    <p className="text-sm font-medium text-navy-700 group-hover:text-teal-600">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                <div className="flex gap-3 justify-end">
                  <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-2xl rounded-tr-md px-5 py-4 max-w-2xl shadow-lg">
                    <p className="text-[15px] leading-relaxed">{msg.message}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-navy-600 to-navy-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-5 h-5 text-white" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 max-w-2xl">
                    {msg.thinkingDetails && (
                      <ThinkingDetailsPanel thinking={msg.thinkingDetails} />
                    )}
                    <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                      <LegalResponseFormatter content={msg.response} />
                      {msg.model_used && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-navy-100">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-navy-400">
                            Powered by {msg.model_used}
                            {msg.tokens_used && ` (${msg.tokens_used} tokens)`}
                          </span>
                        </div>
                      )}
                      <CitationDisplay
                        citations={msg.citations}
                        jurisdiction={msg.jurisdiction || 'Arizona'}
                        lastUpdated={new Date(msg.created_at).toLocaleDateString()}
                        verificationStatus={msg.citations && msg.citations.length > 0 ? 'verified' : 'unverified'}
                        showCompact={true}
                      />
                      {messages.indexOf(msg) === messages.length - 1 && (() => {
                        if (engagement.shouldShowNextBestStep(messages.length)) {
                          return <div className="mt-3"><PersonaNextSteps context="chat" compact maxItems={2} /></div>;
                        }
                        if (!user && engagement.shouldShowEmailCapture(userTriggeredAction, !!user)) {
                          return <EmailCapturePanel context={msg.response.slice(0, 200)} onDismiss={() => engagement.dismiss('emailCapture')} />;
                        }
                        if (engagement.shouldShowSharePrompt(messages.length)) {
                          return <ChatSharePrompt messageCount={messages.length} onDismiss={() => engagement.dismiss('sharePrompt')} />;
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 max-w-2xl">
                <ThinkingDetailsPanel thinking={null} isLoading={true} />
                <div className="bg-white border-2 border-navy-200 rounded-2xl rounded-tl-md px-5 py-4 shadow-md">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-white border-t border-navy-200 px-6 py-5 shadow-xl">
        <div className="max-w-4xl mx-auto">
          {messages.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => { setUserTriggeredAction(true); exportConversation(); }}
                className="flex items-center gap-2 px-4 py-2 bg-navy-100 hover:bg-navy-200 text-navy-700 rounded-lg transition-all font-medium text-sm"
                title="Export conversation"
              >
                <Download className="w-4 h-4" />
                {language === 'en' ? 'Export Conversation' : 'Exportar Conversacion'}
              </button>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-2 border-amber-300 text-amber-700 rounded-lg transition-all font-semibold text-sm w-full justify-between"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {language === 'en' ? 'Browse Topics' : 'Explorar Temas'}
              </span>
              {showPromptLibrary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showPromptLibrary && (
              <div className="mt-3 bg-gradient-to-br from-navy-50 to-white border-2 border-navy-200 rounded-xl p-4 max-h-96 overflow-y-auto">
                <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-navy-200">
                  {practiceAreas.map((area) => {
                    const Icon = area.icon;
                    return (
                      <button
                        key={area.id}
                        onClick={() => setExpandedCategory(expandedCategory === area.id ? null : area.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          expandedCategory === area.id
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-white border border-navy-200 text-navy-700 hover:border-teal-600 hover:text-teal-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {area.name}
                        {expandedCategory === area.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {expandedCategory && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-teal-600">
                        {practiceAreas.find(a => a.id === expandedCategory)?.name} Services
                      </h4>
                      <button
                        onClick={() => setExpandedCategory(null)}
                        className="p-1 hover:bg-navy-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-navy-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {practiceAreas
                        .find(a => a.id === expandedCategory)
                        ?.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              const topic = `${practiceAreas.find(a => a.id === expandedCategory)?.name}: ${sub.name}`;
                              setSelectedTopic(topic);
                              setShowPromptLibrary(false);
                              setExpandedCategory(null);
                              const question = `I need help with ${topic}. Can you explain what this involves, the typical process, costs to expect, and what documents I might need?`;
                              submitTopicQuestion(question);
                            }}
                            className="flex items-center gap-2 p-2 bg-white rounded-lg border border-navy-200 hover:border-teal-600 hover:shadow-md transition-all text-left group"
                          >
                            <div className="w-2 h-2 bg-teal-600 rounded-full flex-shrink-0" />
                            <span className="text-sm text-navy-700 group-hover:text-teal-600 transition-colors">
                              {sub.name}
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {!expandedCategory && (
                  <p className="text-sm text-navy-500 text-center py-4">
                    {language === 'en' ? 'Click a category above to see available services' : 'Haga clic en una categoria para ver los servicios disponibles'}
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {uploadedFiles.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-teal-50 border-2 border-teal-200 rounded-lg px-3 py-2"
                    >
                      <FileText className="w-4 h-4 text-teal-600" />
                      <span className="text-sm text-navy-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-navy-400 hover:text-red-600 transition-colors"
                        disabled={isExtractingText}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                {isExtractingText ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing document(s) for AI analysis...</span>
                  </div>
                ) : extractionError && documentImages.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <X className="w-4 h-4" />
                    <span>{extractionError}</span>
                  </div>
                ) : documentImages.length > 0 ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Document ready for AI Vision analysis ({documentImages.length} page{documentImages.length > 1 ? 's' : ''} captured)</span>
                  </div>
                ) : extractedDocumentText ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Document content ready ({Math.round(extractedDocumentText.length / 1000)}KB extracted)</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp,image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="bg-navy-100 hover:bg-navy-200 text-navy-700 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Upload documents"
              >
                <Upload className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loading}
                className={`${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-navy-100 hover:bg-navy-200 text-navy-700'
                } p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <label htmlFor="simple-chat-input" className="sr-only">Ask your legal question</label>
              <input
                id="simple-chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' ? 'Ask your legal question...' : 'Haga su pregunta legal...'}
                disabled={loading}
                aria-label="Ask your legal question"
                className="flex-1 px-5 py-3 border-2 border-navy-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-600 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 placeholder-navy-400 text-[15px]"
              />

              <button
                type="submit"
                disabled={loading || !input.trim() || isExtractingText}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                title={documentImages.length > 0 ? `Send with ${documentImages.length} document page(s) for AI Vision analysis` : 'Send message'}
              >
                {isExtractingText ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {messages.length > 0 && (
            <div className="mt-4 pt-4 border-t border-navy-200">
              <button
                onClick={() => {
                  const output: CourtReadyOutput = {
                    title: 'Court-Ready Action Plan',
                    jurisdiction: 'Arizona',
                    caseType: selectedTopic || 'Legal Matter',
                    generatedDate: new Date().toLocaleDateString(),
                    summary: 'Based on your conversation, here is an action plan to help you prepare for your legal matter.',
                    warnings: [
                      'Deadlines are critical in legal matters - missing a deadline can result in losing your case',
                      'This is informational guidance only and does not constitute legal advice',
                      'For complex matters, consult with a licensed attorney'
                    ],
                    checklist: [
                      { id: '1', text: 'Gather all relevant documents', priority: 'high' },
                      { id: '2', text: 'Note all important dates and deadlines', priority: 'high' },
                      { id: '3', text: 'Make copies of all documents for your records', priority: 'medium' },
                      { id: '4', text: 'Write a timeline of events', priority: 'medium' },
                      { id: '5', text: 'Identify potential witnesses', priority: 'medium' },
                      { id: '6', text: 'Research relevant laws and statutes', priority: 'low' },
                      { id: '7', text: 'Consider consulting with an attorney', priority: 'high' },
                    ],
                    documentsNeeded: [
                      'Any contracts or written agreements',
                      'Correspondence (emails, letters, texts)',
                      'Receipts or proof of payment',
                      'Photo or video evidence',
                      'Witness contact information',
                      'Government-issued ID',
                    ],
                    nextSteps: [
                      'Review the checklist and gather all documents',
                      'Research free legal aid resources in your area',
                      'Consider scheduling a consultation with an attorney',
                      'File any necessary court documents before deadlines',
                    ],
                    courtInfo: {
                      name: 'Maricopa County Superior Court',
                      address: '201 W. Jefferson St., Phoenix, AZ 85003',
                      phone: '(602) 506-3204',
                      hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
                      website: 'https://superiorcourt.maricopa.gov',
                    },
                  };
                  setCourtReadyData(output);
                  setShowCourtReadyOutput(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-navy-700 to-navy-800 hover:from-navy-800 hover:to-navy-900 text-white rounded-lg transition-all font-medium text-sm shadow-md"
              >
                <Scale className="w-4 h-4" />
                {language === 'en' ? 'Generate Court-Ready Action Plan' : 'Generar Plan de Accion para el Tribunal'}
              </button>
            </div>
          )}
        </div>
      </div>

      <DocumentUploadWarning
        isOpen={showUploadWarning}
        onClose={() => {
          setShowUploadWarning(false);
          setPendingFiles([]);
        }}
        onConsent={processFilesAfterConsent}
        fileName={pendingFiles.length > 0 ? pendingFiles.map(f => f.name).join(', ') : undefined}
      />

      {showCourtReadyOutput && courtReadyData && (
        <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CourtReadyOutputBuilder
            output={courtReadyData}
            onClose={() => {
              setShowCourtReadyOutput(false);
              setCourtReadyData(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

```

---

## src/pages/TrustCenter.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 51.5 KB | 10.2 KB |
| Lines | 1007 | 269 |
| Delta | — | 27% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Shield, Lock, FileText, AlertCircle, Eye, Database, Server,
  CheckCircle, Clock, Trash2, Download, MessageSquare,
  ExternalLink, HelpCircle, Flag, Users, Brain, ShieldCheck,
  Fingerprint, Building2, Layers, Key, Globe, Ban, Network
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import TrustSafetyReportModal from '../components/TrustSafetyReportModal';
import TrustFAQ from '../components/TrustFAQ';
import SafeUseChecklist from '../components/SafeUseChecklist';

function generatePDF(title: string, content: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - ezLegal.ai&trade;</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #102A43; line-height: 1.6; }
        h1 { color: #0D9488; border-bottom: 2px solid #0D9488; padding-bottom: 10px; }
        h2 { color: #0A8A8A; margin-top: 30px; }
        h3 { color: #102A43; margin-top: 20px; }
        ul { padding-left: 20px; }
        li { margin: 8px 0; }
        .header { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #0D9488; }
        .date { color: #627D98; font-size: 14px; margin-top: 5px; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #D9E2EC; color: #627D98; font-size: 12px; }
        .check { color: #16a34a; }
        .tm { font-size: 0.7em; vertical-align: super; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">ezLegal.ai<span class="tm">&trade;</span></div>
      </div>
      <h1>${title}</h1>
      <p class="date">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      ${content}
      <div class="footer">
        <p>ezLegal.ai&trade; - AI-Powered Legal Information Platform</p>
        <p>Powered by LegalBreeze&trade;</p>
        <p>This document is for informational purposes only and does not constitute legal advice.</p>
        <p>Contact: trust@ezlegal.ai | www.ezlegal.ai/trust-center</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');

  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}

const pdfContents = {
  privacy: {
    title: 'Privacy & Data Practices Policy',
    content: `
      <h2>Data Collection</h2>
      <ul>
        <li><span class="check">&#10003;</span> We collect only information necessary to provide our services</li>
        <li><span class="check">&#10003;</span> Chat conversations are stored to improve your experience</li>
        <li><span class="check">&#10003;</span> Account information for registered users</li>
      </ul>

      <h2>Data Use</h2>
      <ul>
        <li><span class="check">&#10003;</span> <strong>Never used to train AI models</strong></li>
        <li><span class="check">&#10003;</span> Not sold to third parties</li>
        <li><span class="check">&#10003;</span> Used only to provide and improve services</li>
      </ul>

      <h2>Data Retention</h2>
      <ul>
        <li><span class="check">&#10003;</span> Chat history automatically deleted after 90 days</li>
        <li><span class="check">&#10003;</span> Documents retained for 1 year, then automatically deleted</li>
        <li><span class="check">&#10003;</span> Free chat sessions expire after 24 hours of inactivity</li>
      </ul>

      <h2>Your Rights</h2>
      <ul>
        <li><span class="check">&#10003;</span> Export your data in JSON or CSV format from your profile</li>
        <li><span class="check">&#10003;</span> Request data deletion with immediate or scheduled options</li>
        <li><span class="check">&#10003;</span> Access and correct your personal information</li>
      </ul>

      <h2>Contact</h2>
      <p>For privacy-related inquiries, contact us at: privacy@ezlegal.ai</p>
    `
  },
  dataSovereignty: {
    title: 'Data Sovereignty & AI Training Policy',
    content: `
      <h2>Zero Training Guarantee</h2>
      <p><strong>Your client data is NEVER used to train foundational large language models.</strong> This is a core principle of our platform architecture, not just a policy choice.</p>

      <h2>Inference-Only Architecture</h2>
      <p>Our AI uses pre-trained models in inference-only mode. Your queries and conversations are processed to generate responses but are never fed back into model training pipelines.</p>

      <h2>Isolated Processing</h2>
      <p>Your data runs in its own space. It is never mixed with another client's data at any step.</p>

      <h2>White-Label Client Guarantees</h2>
      <h3>Logical Isolation</h3>
      <p>Each white-label setup runs in its own space. It has its own database, API routes, and access rules.</p>

      <h3>Encryption</h3>
      <p>All data is encrypted at rest (AES-256) and in transit (TLS 1.3) via our cloud infrastructure provider (Supabase).</p>

      <h3>Data Hosting</h3>
      <p>Data is hosted in the United States via Supabase's managed cloud infrastructure.</p>

      <h2>What We Guarantee</h2>
      <ul>
        <li><span class="check">&#10003;</span> Your data is never used to train, fine-tune, or improve any AI models</li>
        <li><span class="check">&#10003;</span> Your data is never shared with AI model providers for their training purposes</li>
        <li><span class="check">&#10003;</span> Your data is never accessible to other ezLegal.ai&trade; clients or tenants</li>
        <li><span class="check">&#10003;</span> Complete data deletion is available within 30 days upon request</li>
      </ul>

      <h2>Audit & Verification</h2>
      <ul>
        <li><span class="check">&#10003;</span> Infrastructure provider (Supabase) maintains SOC 2 Type II certification</li>
        <li><span class="check">&#10003;</span> Row Level Security enforces data access controls at the database level</li>
        <li><span class="check">&#10003;</span> Activity audit logs track user actions and data access</li>
        <li><span class="check">&#10003;</span> Data export and deletion available through account settings</li>
      </ul>
    `
  },
  security: {
    title: 'Security Whitepaper',
    content: `
      <h2>Encryption</h2>
      <h3>TLS 1.3 (in transit) + AES-256 (at rest)</h3>
      <p>All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption via our cloud infrastructure provider.</p>
      <p><strong>Last verified:</strong> January 2026</p>

      <h2>Secure Cloud Infrastructure</h2>
      <p>Built on enterprise-grade cloud infrastructure with continuous monitoring, automated backups, and redundancy.</p>
      <p><strong>Infrastructure provider:</strong> Supabase (SOC 2 Type II certified)</p>

      <h2>Compliance</h2>
      <h3>CCPA Compliant</h3>
      <p>We comply with the California Consumer Privacy Act and honor data access and deletion requests.</p>

      <h2>Security Practices</h2>
      <ul>
        <li><span class="check">&#10003;</span> Multi-factor authentication available</li>
        <li><span class="check">&#10003;</span> Secure session management via Supabase Auth</li>
        <li><span class="check">&#10003;</span> Row Level Security for database access control</li>
        <li><span class="check">&#10003;</span> Activity logging and audit trails</li>
      </ul>

      <h2>Infrastructure Security</h2>
      <ul>
        <li>Hosted on Supabase (SOC 2 Type II certified infrastructure)</li>
        <li>Automated database backups and point-in-time recovery</li>
        <li>Managed PostgreSQL with high availability</li>
        <li>Serverless edge functions for secure API processing</li>
      </ul>
    `
  },
  aiEthics: {
    title: 'AI Ethics & Governance Policy',
    content: `
      <h2>Accuracy & Limitations</h2>
      <h3>Citations & Sources</h3>
      <p>Where possible, AI responses include references to relevant laws, statutes, and jurisdiction-specific information. We indicate when information may be outdated or when uncertainty exists.</p>

      <h3>Jurisdiction Awareness</h3>
      <p>We ask for your location to provide jurisdiction-relevant information. Laws vary significantly between states and countries.</p>

      <h3>Uncertainty & Limitations</h3>
      <p>AI explicitly indicates when it's uncertain or when a question is too complex for general guidance. We recommend attorney consultation for high-stakes matters.</p>

      <h2>Ethical Commitments</h2>
      <ul>
        <li><span class="check">&#10003;</span> <strong>No Dark Patterns:</strong> No urgency pressure, hidden fees, or manipulative upgrade prompts</li>
        <li><span class="check">&#10003;</span> <strong>Clear Escalation Paths:</strong> Always provide routes to human attorneys and free legal aid</li>
        <li><span class="check">&#10003;</span> <strong>Crisis Safety Rails:</strong> Automatic detection and escalation for crisis situations</li>
        <li><span class="check">&#10003;</span> <strong>Access to Justice:</strong> Free tier and pro bono pathways ensure access regardless of ability to pay</li>
        <li><span class="check">&#10003;</span> <strong>Bias Monitoring:</strong> Regular audits for bias in AI responses across demographics</li>
      </ul>

      <h2>AI Governance Framework</h2>
      <ul>
        <li>Human oversight of AI decision-making</li>
        <li>Regular model evaluation and testing</li>
        <li>Transparent disclosure of AI capabilities and limitations</li>
        <li>Continuous improvement based on user feedback</li>
      </ul>

      <h2>Responsible AI Principles</h2>
      <ul>
        <li>Fairness: AI treats all users equitably</li>
        <li>Transparency: Clear about what AI can and cannot do</li>
        <li>Accountability: Human oversight and review processes</li>
        <li>Privacy: Minimal data collection, maximum protection</li>
      </ul>
    `
  }
};

export default function TrustCenter() {
  const [showReportModal, setShowReportModal] = useState(false);

  const handleDownloadPDF = (type: keyof typeof pdfContents) => {
    const pdf = pdfContents[type];
    generatePDF(pdf.title, pdf.content);
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <Breadcrumbs className="mt-24" />
      <TrustSafetyReportModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-16 pt-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full mb-6">
              <ShieldCheck className="w-4 h-4 text-gold-300" />
              <span className="text-sm font-semibold">Trust & Safety</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Trust Center</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Transparency, security, and ethical AI practices are foundational to ezLegal.ai™.
              Learn how we protect your data and ensure responsible AI use.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">Quick Answers</h2>
            <p className="text-navy-600 mb-6">Find specific information quickly</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link
                to="/privacy-faq"
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-100 transition-all group"
              >
                <Eye className="w-6 h-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-teal-700">Privacy FAQ</h3>
                <p className="text-sm text-navy-600">Common privacy questions</p>
              </Link>

              <Link
                to="/security-faq"
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-100 transition-all group"
              >
                <Shield className="w-6 h-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-teal-700">Security FAQ</h3>
                <p className="text-sm text-navy-600">How we protect your data</p>
              </Link>

              <Link
                to="/scope-disclaimers"
                className="p-4 bg-teal-50 border border-teal-200 rounded-lg hover:border-teal-400 hover:bg-teal-100 transition-all group"
              >
                <HelpCircle className="w-6 h-6 text-teal-600 mb-2" />
                <h3 className="font-semibold text-navy-900 mb-1 group-hover:text-teal-700">Scope FAQ</h3>
                <p className="text-sm text-navy-600">What we can and can't do</p>
              </Link>
            </div>
          </div>

          <h2 className="text-xl font-bold text-navy-900 mb-4">Full Documentation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#privacy" className="flex items-center gap-3 p-4">
                <Lock className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Privacy & Data</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('privacy')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#data-sovereignty" className="flex items-center gap-3 p-4">
                <Fingerprint className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Data Sovereignty</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('dataSovereignty')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#security" className="flex items-center gap-3 p-4">
                <Shield className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Security</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('security')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#ai-ethics" className="flex items-center gap-3 p-4">
                <Brain className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">AI Ethics</span>
              </a>
              <button
                onClick={() => handleDownloadPDF('aiEthics')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-teal-600 hover:bg-teal-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
            <div className="bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors group overflow-hidden">
              <a href="#report" className="flex items-center gap-3 p-4">
                <Flag className="w-6 h-6 text-teal-600" />
                <span className="font-semibold text-navy-900 group-hover:text-teal-600">Report Concern</span>
              </a>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium border-t border-navy-200 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-navy-900 mb-1">Important Legal Notice</h3>
              <p className="text-navy-700 text-sm">
                <strong>ezLegal.ai™ gives legal information, not legal advice.</strong> We are not a law firm.
                Using this service does not create an attorney-client relationship, and your messages here
                do not carry attorney-client privilege. For complex matters, court representation, or
                advice on your case, talk to a licensed attorney.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrustFAQ />
      <SafeUseChecklist />

      <section id="privacy" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Privacy & Data Practices</h2>
              <p className="text-navy-600">How we collect, use, and protect your information</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Database className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Data Collection</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>We collect only information necessary to provide our services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Chat conversations are stored to improve your experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Account information for registered users</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Eye className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Data Use</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Never used to train AI models</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Not sold to third parties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Used only to provide and improve services</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Data Retention</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Chat history automatically deleted after 90 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Documents retained for 1 year, then automatically deleted</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Free chat sessions expire after 24 hours of inactivity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-start gap-4">
                <Trash2 className="w-5 h-5 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-bold text-navy-900 mb-2">Your Rights</h3>
                  <ul className="text-navy-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Export your data in JSON or CSV format from your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Request data deletion with immediate or scheduled options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <span>Access and correct your personal information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
            >
              <FileText className="w-4 h-4" />
              Full Privacy Policy
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-navy-700 font-semibold"
            >
              <FileText className="w-4 h-4" />
              Terms of Service
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <section id="data-sovereignty" className="py-16 bg-navy-50 border-b border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Fingerprint className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Data Sovereignty & AI Training Policy</h2>
              <p className="text-navy-600">Your data remains yours - never used to train AI models</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Ban className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Zero Training Guarantee</h3>
                <p className="text-navy-700 text-lg">
                  <strong>Your client data is NEVER used to train foundational large language models.</strong> This is a core principle of our platform architecture, not just a policy choice.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 border border-navy-200">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-navy-900">Inference-Only Architecture</h4>
                </div>
                <p className="text-navy-600 text-sm">
                  Our AI uses pre-trained models in inference-only mode. Your queries and conversations are processed to generate responses but are never fed back into model training pipelines.
                </p>
              </div>

              <div className="bg-white rounded-xl p-5 border border-navy-200">
                <div className="flex items-center gap-3 mb-3">
                  <Network className="w-5 h-5 text-teal-600" />
                  <h4 className="font-bold text-navy-900">Isolated Processing</h4>
                </div>
                <p className="text-navy-600 text-sm">
                  All data processing occurs in logically isolated environments. Your organization's data is never commingled with other clients' data during any stage of processing.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-navy-600" />
              White-Label Client Guarantees
            </h3>
            <div className="bg-white rounded-xl border border-navy-200 overflow-hidden">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-navy-200">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Layers className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-navy-900">Logical Isolation</h4>
                  </div>
                  <p className="text-navy-600 text-sm">
                    Each white-label setup runs in its own space. It has its own database, API routes, and access rules.
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Key className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-navy-900">Encryption Standards</h4>
                  </div>
                  <p className="text-navy-600 text-sm">
                    All data encrypted at rest (AES-256) and in transit (TLS 1.3) via our infrastructure provider (Supabase).
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-navy-900">US-Based Hosting</h4>
                  </div>
                  <p className="text-navy-600 text-sm">
                    Data is hosted in the United States via Supabase's managed cloud infrastructure with automated backups.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                What We Guarantee
              </h4>
              <ul className="space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data is never used to train, fine-tune, or improve any AI models</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data is never shared with AI model providers for their training purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Your data is never accessible to other ezLegal.ai™ clients or tenants</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Complete data deletion is available within 30 days upon request</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-teal-600" />
                Audit & Verification
              </h4>
              <ul className="space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Infrastructure provider (Supabase) maintains SOC 2 Type II certification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Contractual DPA (Data Processing Agreement) for enterprise clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Annual third-party security assessments available on request</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <span>Real-time access logs available for enterprise clients</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/partner-hub"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold"
            >
              <Building2 className="w-4 h-4" />
              Learn more about our Partner Program
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      <section id="security" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Security</h2>
              <p className="text-navy-600">Enterprise-grade protection for your information</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <Lock className="w-8 h-8 text-success-600 mb-4" />
              <h3 className="font-bold text-navy-900 mb-2">TLS 1.3 (in transit) + AES-256 (at rest)</h3>
              <p className="text-navy-600 text-sm">
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption via our cloud infrastructure provider.
              </p>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <p className="text-xs text-navy-500">
                  <span className="font-semibold">Last verified:</span> January 2026
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <Server className="w-8 h-8 text-success-600 mb-4" />
              <h3 className="font-bold text-navy-900 mb-2">Secure Cloud Infrastructure</h3>
              <p className="text-navy-600 text-sm">
                Built on enterprise-grade cloud infrastructure with continuous monitoring, automated backups, and redundancy.
              </p>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <p className="text-xs text-navy-500">
                  <span className="font-semibold">Infrastructure:</span> Hosted on Supabase (SOC 2 Type II certified)
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <ShieldCheck className="w-8 h-8 text-success-600 mb-4" />
              <h3 className="font-bold text-navy-900 mb-2">CCPA Compliant</h3>
              <p className="text-navy-600 text-sm">
                We comply with the California Consumer Privacy Act and honor data access and deletion requests.
              </p>
              <div className="mt-3 pt-3 border-t border-navy-100">
                <p className="text-xs text-navy-500">
                  <span className="font-semibold">Compliance verified:</span> January 2026
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl p-6 border border-navy-200">
            <h3 className="font-bold text-navy-900 mb-4">Security Practices</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-navy-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Row Level Security for database access control</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Multi-factor authentication available</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Secure session management</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Activity logging and audit trails</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Automated database backups via Supabase</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Role-based access permissions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="ai-ethics" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">AI Ethics & Accuracy</h2>
              <p className="text-navy-600">How we ensure responsible, accurate AI guidance</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-navy-900 mb-4">Accuracy & Limitations</h3>
              <div className="space-y-4">
                <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Citations & Sources</h4>
                  <p className="text-navy-600 text-sm">
                    Where possible, AI responses include references to relevant laws, statutes, and
                    jurisdiction-specific information. We indicate when information may be outdated
                    or when uncertainty exists.
                  </p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Jurisdiction Awareness</h4>
                  <p className="text-navy-600 text-sm">
                    We ask for your location to provide jurisdiction-relevant information. Laws vary
                    significantly between states and countries.
                  </p>
                </div>
                <div className="bg-navy-50 rounded-lg p-4 border border-navy-200">
                  <h4 className="font-semibold text-navy-900 mb-2">Uncertainty & Limitations</h4>
                  <p className="text-navy-600 text-sm">
                    AI explicitly indicates when it's uncertain or when a question is too complex
                    for general guidance. We recommend attorney consultation for high-stakes matters.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-navy-900 mb-4">Ethical Commitments</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">No Dark Patterns</h4>
                    <p className="text-navy-600 text-sm">No urgency pressure, hidden fees, or manipulative upgrade prompts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Clear Escalation Paths</h4>
                    <p className="text-navy-600 text-sm">Always provide routes to human attorneys and free legal aid</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Crisis Safety Rails</h4>
                    <p className="text-navy-600 text-sm">Automatic detection and escalation for crisis situations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Access to Justice</h4>
                    <p className="text-navy-600 text-sm">Free tier and pro bono pathways ensure access regardless of ability to pay</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-navy-900">Bias Monitoring</h4>
                    <p className="text-navy-600 text-sm">Regular audits for bias in AI responses across demographics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-navy-50 rounded-xl p-6 border border-navy-200">
            <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-navy-600" />
              Attorney Matching & Referral Transparency
            </h3>
            <div className="text-sm text-navy-600 space-y-2">
              <p>
                We match attorneys on four factors: practice area, jurisdiction, availability, and user rating. Attorneys cannot pay for higher rankings.
              </p>
              <p>
                Attorneys opt into our directory and we verify their profiles. We do not endorse any attorney. Check their credentials and disciplinary history yourself before you hire.
              </p>
              <Link
                to="/find-attorney"
                className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-semibold mt-1"
              >
                View Lawyer Directory
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/ai-governance"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-navy-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <FileText className="w-5 h-5" />
              View Full AI Governance Policy
            </Link>
          </div>
        </div>
      </section>

      <section id="report" className="py-16 bg-navy-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Flag className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-navy-900">Report a Concern</h2>
              <p className="text-navy-600">Help us improve by reporting issues</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-4">What You Can Report</h3>
              <ul className="space-y-3 text-sm text-navy-600">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Inaccurate Information:</strong> AI provided incorrect or misleading legal information</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Bias or Discrimination:</strong> AI showed bias based on demographics or case type</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Privacy Concerns:</strong> Issues with data handling or privacy</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Ethical Issues:</strong> AI behaved unethically or inappropriately</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Safety Concerns:</strong> Missed crisis detection or inappropriate responses</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-4">How It Works</h3>
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">1</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Submit:</strong> File your report via the button below or email trust@ezlegal.ai. You will receive an acknowledgment within 1 business day.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">2</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Review:</strong> Our Trust & Safety team investigates every report within 24 hours. Critical safety issues are escalated immediately.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">3</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Resolution:</strong> We take corrective action (model adjustments, content fixes, policy updates) and document findings internally.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-navy-700">4</span>
                  </div>
                  <p className="text-sm text-navy-600"><strong>Follow-Up:</strong> If you provided contact information, we will notify you of the outcome and any changes made.</p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors justify-center"
                >
                  <Flag className="w-4 h-4" />
                  Submit a Concern Report
                </button>
                <a
                  href="mailto:trust@ezlegal.ai"
                  className="flex items-center gap-2 w-full border border-navy-300 bg-white hover:bg-navy-50 text-navy-700 px-4 py-3 rounded-lg font-semibold transition-colors justify-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  Email: trust@ezlegal.ai
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-teal-50 border-t border-teal-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Enterprise Security Documentation</h3>
              <p className="text-navy-600">
                For legal aid organizations and nonprofits: security architecture overview, infrastructure details, and data handling documentation.
              </p>
            </div>
            <Link
              to="/enterprise-security"
              className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Enterprise Security
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Quick Links</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/privacy"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <Lock className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">Privacy Policy</span>
            </Link>
            <Link
              to="/terms"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <FileText className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">Terms of Service</span>
            </Link>
            <Link
              to="/ai-governance"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <Brain className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">AI Governance</span>
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-3 p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-navy-900">Contact Support</span>
            </Link>
          </div>
        </div>
      </section>

      <RelatedLinks />
      <Footer />
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { Link } from 'react-router-dom';
import {
  Lock,
  Shield,
  Eye,
  Scale,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface TrustSection {
  icon: typeof Lock;
  title: string;
  description: string;
  items: string[];
}

const TRUST_SECTIONS: TrustSection[] = [
  {
    icon: Lock,
    title: 'Security',
    description: 'Your data is protected with industry-leading security practices.',
    items: [
      'Row-Level Security (RLS) on all databases',
      'Content Security Policy (CSP) enabled',
      'End-to-end encryption for sensitive data',
      'Regular security audits and penetration testing',
    ],
  },
  {
    icon: Eye,
    title: 'Privacy',
    description:
      'We are committed to protecting your personal information.',
    items: [
      'Zero data sharing with third parties without consent',
      'Clear data handling and retention policies',
      'GDPR and CCPA compliant',
      'User data deletion on request',
    ],
  },
  {
    icon: Shield,
    title: 'AI Safety',
    description: 'Our AI systems are designed with safety guardrails.',
    items: [
      'Crisis detection and escalation protocols',
      'Harmful content filtering',
      'Bias monitoring and mitigation',
      'Human oversight for critical decisions',
    ],
  },
  {
    icon: Scale,
    title: 'Compliance',
    description: 'We operate in full compliance with legal requirements.',
    items: [
      'Unauthorized Practice of Law (UPL) protections',
      'Access to Justice (A2J) screening before paid services',
      'Scope disclaimers on all high-risk pages',
      'Compliance with state bar regulations',
    ],
  },
];

const QUICK_LINKS = [
  {
    icon: Shield,
    title: 'Audit Readiness',
    description: 'Platform audit documentation and metrics.',
    link: '/audit-readiness',
  },
  {
    icon: Shield,
    title: 'AI Governance',
    description: 'How we govern AI systems and make decisions.',
    link: '/ai-governance',
  },
  {
    icon: AlertCircle,
    title: 'Scope Disclaimers',
    description: 'What our AI can and cannot do.',
    link: '/scope-disclaimers',
  },
];

export default function TrustCenter() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <CheckCircle className="w-4 h-4" />
              {en ? 'Your Trust Matters' : 'Tu Confianza Es Importante'}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'Trust Center' : 'Centro de Confianza'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              {en
                ? 'Comprehensive information about security, privacy, and ethical AI practices.'
                : 'Información integral sobre seguridad, privacidad y prácticas de IA ética.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {TRUST_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="bg-white border border-slate-200 rounded-xl p-8 hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-slate-600 mb-6">{section.description}</p>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              {en ? 'Key Documentation' : 'Documentación Clave'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {QUICK_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {item.description}
                    </p>
                    <span className="text-teal-600 text-sm font-medium flex items-center gap-1">
                      {en ? 'View' : 'Ver'} <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-12 mb-12">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                  {en
                    ? 'Critical Disclaimers'
                    : 'Avisos Críticos'}
                </h2>
                <div className="space-y-4 text-slate-700">
                  <p>
                    <span className="font-semibold">
                      {en
                        ? '1. Not a Law Firm:'
                        : '1. No Es Un Despacho de Abogados:'}
                    </span>{' '}
                    {en
                      ? 'ezLegal.ai does not provide legal services or establish an attorney-client relationship.'
                      : 'ezLegal.ai no proporciona servicios legales ni establece una relación abogado-cliente.'}
                  </p>
                  <p>
                    <span className="font-semibold">
                      {en
                        ? '2. Legal Information Only:'
                        : '2. Solo Información Legal:'}
                    </span>{' '}
                    {en
                      ? 'Our AI provides educational legal information, not legal advice. Always consult a licensed attorney.'
                      : 'Nuestra IA proporciona información legal educativa, no asesoramiento legal. Siempre consulta un abogado licenciado.'}
                  </p>
                  <p>
                    <span className="font-semibold">
                      {en
                        ? '3. Jurisdictional Limitations:'
                        : '3. Limitaciones de Jurisdicción:'}
                    </span>{' '}
                    {en
                      ? 'Content is jurisdiction-specific and may not apply to your situation.'
                      : 'El contenido es específico de la jurisdicción y puede no aplicar a tu situación.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              {en ? 'Compliance Standards' : 'Estándares de Cumplimiento'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'GDPR', status: 'Compliant' },
                { label: 'CCPA', status: 'Compliant' },
                { label: 'HIPAA', status: 'Applicable' },
                { label: 'SOC 2 Type II', status: 'Audited' },
                { label: 'ISO/IEC 27001', status: 'In Progress' },
                { label: 'WCAG 2.1 AA', status: 'Certified' },
              ].map((standard) => (
                <div
                  key={standard.label}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <span className="font-semibold text-slate-900">
                    {standard.label}
                  </span>
                  <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    {standard.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {en ? 'Security Concerns?' : 'Preocupaciones de Seguridad?'}
            </h2>
            <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
              {en
                ? 'Please report security vulnerabilities responsibly to our security team.'
                : 'Por favor, reporta vulnerabilidades de seguridad responsablemente a nuestro equipo de seguridad.'}
            </p>
            <a
              href="mailto:security@ezlegal.ai"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Report Security Issue' : 'Reportar Problema de Seguridad'}
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/Matters.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 26.6 KB | 4.3 KB |
| Lines | 651 | 131 |
| Delta | — | 20% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  Plus, Search, Calendar, AlertCircle, CheckCircle, Clock, Filter,
  FolderOpen, FileText, Users, ChevronRight, Archive,
  MoreVertical, Download, Scale, MapPin
} from 'lucide-react';
import { US_STATES } from '../data/jurisdictions';

interface Matter {
  id: string;
  title: string;
  description: string | null;
  practice_area: string | null;
  jurisdiction: string | null;
  status: 'open' | 'closed' | 'on_hold' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
  document_count?: number;
  message_count?: number;
  participant_count?: number;
}

interface MatterStats {
  total: number;
  open: number;
  closed: number;
  on_hold: number;
}

const PRACTICE_AREAS = [
  'Family Law',
  'Criminal Defense',
  'Immigration',
  'Employment',
  'Housing & Tenant Rights',
  'Consumer Protection',
  'Small Claims',
  'Estate Planning',
  'Business Formation',
  'Contracts',
  'Personal Injury',
  'Civil Rights',
];

export default function Matters() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [matters, setMatters] = useState<Matter[]>([]);
  const [filteredMatters, setFilteredMatters] = useState<Matter[]>([]);
  const [stats, setStats] = useState<MatterStats>({ total: 0, open: 0, closed: 0, on_hold: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('all');
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    practice_area: '',
    jurisdiction: 'Arizona',
    status: 'open',
    priority: 'medium',
  });

  useEffect(() => {
    if (user) {
      loadMatters();
    }
  }, [user]);

  useEffect(() => {
    filterMatters();
  }, [matters, searchTerm, statusFilter, practiceAreaFilter]);

  const loadMatters = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('matters')
      .select(`
        *,
        matter_documents(count),
        matter_participants(count)
      `)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      const mattersWithCounts = data.map(m => ({
        ...m,
        document_count: m.matter_documents?.[0]?.count || 0,
        participant_count: m.matter_participants?.[0]?.count || 0,
      }));
      setMatters(mattersWithCounts);

      setStats({
        total: data.length,
        open: data.filter(m => m.status === 'open').length,
        closed: data.filter(m => m.status === 'closed').length,
        on_hold: data.filter(m => m.status === 'on_hold').length,
      });
    }
    setLoading(false);
  };

  const filterMatters = () => {
    let filtered = matters;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.title.toLowerCase().includes(term) ||
          m.description?.toLowerCase().includes(term) ||
          m.practice_area?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    if (practiceAreaFilter !== 'all') {
      filtered = filtered.filter(m => m.practice_area === practiceAreaFilter);
    }

    setFilteredMatters(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from('matters').insert({
      user_id: user.id,
      ...formData,
    });

    if (!error) {
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        practice_area: '',
        jurisdiction: 'Arizona',
        status: 'open',
        priority: 'medium',
      });
      loadMatters();
    }
  };

  const handleExportRecord = async (matterId: string) => {
    setExporting(true);
    try {
      const { data, error } = await supabase.rpc('export_matter_record', {
        p_matter_id: matterId
      });

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `matter-record-${matterId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-navy-100 text-navy-700 border-navy-200';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { icon: Clock, color: 'text-teal-600 bg-teal-50', label: t('matters.open') };
      case 'on_hold':
        return { icon: AlertCircle, color: 'text-amber-600 bg-amber-50', label: t('matters.onHold') };
      case 'closed':
        return { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: t('matters.closed') };
      case 'archived':
        return { icon: Archive, color: 'text-navy-500 bg-navy-100', label: t('matters.archived') };
      default:
        return { icon: Clock, color: 'text-navy-500 bg-navy-100', label: status };
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">{t('matters.title')}</h2>
          <p className="text-navy-600 mb-6">
            {t('matters.signInPrompt')}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-6 py-2 border-2 border-navy-200 text-navy-700 rounded-lg font-semibold hover:bg-navy-50 transition-all"
            >
              {t('matters.signIn')}
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all"
            >
              {t('matters.createAccount')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('matters.heading')}</h1>
              <p className="text-teal-100">{t('matters.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-teal-600 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 hover:bg-teal-50 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {t('matters.newMatter')}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.total}</div>
              <div className="text-sm text-teal-100">{t('matters.totalMatters')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-green-300">{stats.open}</div>
              <div className="text-sm text-teal-100">{t('matters.active')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-amber-300">{stats.on_hold}</div>
              <div className="text-sm text-teal-100">{t('matters.onHold')}</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
              <div className="text-3xl font-bold text-navy-300">{stats.closed}</div>
              <div className="text-sm text-teal-100">{t('matters.closed')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('matters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 appearance-none bg-white text-sm"
                >
                  <option value="all">{t('matters.allStatus')}</option>
                  <option value="open">{t('matters.open')}</option>
                  <option value="on_hold">{t('matters.onHold')}</option>
                  <option value="closed">{t('matters.closed')}</option>
                  <option value="archived">{t('matters.archived')}</option>
                </select>
              </div>

              <div className="relative">
                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy-400 w-4 h-4" />
                <select
                  value={practiceAreaFilter}
                  onChange={(e) => setPracticeAreaFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 appearance-none bg-white text-sm"
                >
                  <option value="all">{t('matters.allPracticeAreas')}</option>
                  {PRACTICE_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {filteredMatters.length === 0 ? (
          <div className="bg-white rounded-xl border border-navy-200 p-12 text-center">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-navy-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">
              {searchTerm || statusFilter !== 'all' || practiceAreaFilter !== 'all'
                ? t('matters.noMatch')
                : t('matters.noMatters')}
            </h3>
            <p className="text-navy-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' || practiceAreaFilter !== 'all'
                ? t('matters.adjustFilters')
                : t('matters.createFirst')}
            </p>
            {!searchTerm && statusFilter === 'all' && practiceAreaFilter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 hover:bg-teal-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                {t('matters.createFirstBtn')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatters.map((matter) => {
              const statusConfig = getStatusConfig(matter.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={matter.id}
                  className="bg-white rounded-xl shadow-sm border border-navy-200 hover:shadow-md hover:border-navy-300 transition-all"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-navy-900 truncate">
                            {matter.title}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(matter.priority)}`}>
                            {matter.priority}
                          </span>
                        </div>

                        {matter.description && (
                          <p className="text-sm text-navy-600 mb-3 line-clamp-2">
                            {matter.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>

                          {matter.practice_area && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-700 rounded-lg">
                              <Scale className="w-3.5 h-3.5" />
                              {matter.practice_area}
                            </span>
                          )}

                          {matter.jurisdiction && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-100 text-navy-600 rounded-lg">
                              <MapPin className="w-3.5 h-3.5" />
                              {matter.jurisdiction}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMatter(matter);
                            setShowExportModal(true);
                          }}
                          className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors"
                          title={t('matters.exportRecord')}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-navy-400 hover:text-navy-600 hover:bg-navy-100 rounded-lg transition-colors">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-navy-100">
                      <div className="flex items-center gap-6 text-sm text-navy-500">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-4 h-4" />
                          <span>{matter.document_count || 0} {t('matters.documents')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{matter.participant_count || 0} {t('matters.participants')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{t('matters.updated')} {new Date(matter.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedMatter(matter)}
                        className="inline-flex items-center gap-1 text-teal-600 font-medium text-sm hover:gap-2 transition-all"
                      >
                        {t('matters.viewDetails')}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-200">
              <h2 className="text-2xl font-bold text-navy-900">{t('matters.createNewMatter')}</h2>
              <p className="text-navy-600 text-sm mt-1">
                {t('matters.createDesc')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t('matters.matterTitle')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Lease Agreement Review, Employment Dispute"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.practiceArea')}
                  </label>
                  <select
                    value={formData.practice_area}
                    onChange={(e) => setFormData({ ...formData, practice_area: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="">{t('matters.selectPracticeArea')}</option>
                    {PRACTICE_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.jurisdictionLabel')}
                  </label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    {US_STATES.map(j => (
                      <option key={j.code} value={j.name}>{j.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.priority')}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="low">{t('matters.priorityLow')}</option>
                    <option value="medium">{t('matters.priorityMedium')}</option>
                    <option value="high">{t('matters.priorityHigh')}</option>
                    <option value="urgent">{t('matters.priorityUrgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">
                    {t('matters.status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  >
                    <option value="open">{t('matters.open')}</option>
                    <option value="on_hold">{t('matters.onHold')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 mb-2">
                  {t('matters.description')}
                </label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe the legal matter..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-navy-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                >
                  {t('matters.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('matters.createMatter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExportModal && selectedMatter && (
        <div className="fixed inset-0 bg-navy-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">{t('matters.exportTitle')}</h3>
              <p className="text-navy-600 mb-4">
                {t('matters.exportDesc')}
              </p>
              <div className="bg-navy-50 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-navy-700 mb-2">{t('matters.exportIncludes')}</h4>
                <ul className="text-sm text-navy-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem3')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('matters.exportItem4')}
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 px-4 py-2.5 border border-navy-300 text-navy-700 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                >
                  {t('matters.cancel')}
                </button>
                <button
                  onClick={() => handleExportRecord(selectedMatter.id)}
                  disabled={exporting}
                  className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('matters.exporting')}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {t('matters.exportJSON')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { FileText, CheckCircle, Clock, Trash2 } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Matter {
  id: string;
  title: string;
  status: 'open' | 'closed';
  createdDate: string;
  lastUpdated: string;
}

const MATTERS: Matter[] = [
  {
    id: '1',
    title: 'Tenant Eviction Defense',
    status: 'open',
    createdDate: '2024-04-15',
    lastUpdated: '2024-06-01',
  },
  {
    id: '2',
    title: 'Employment Contract Review',
    status: 'open',
    createdDate: '2024-05-20',
    lastUpdated: '2024-05-28',
  },
  {
    id: '3',
    title: 'Small Claims Settlement',
    status: 'closed',
    createdDate: '2024-02-10',
    lastUpdated: '2024-05-15',
  },
];

export default function Matters() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [matters, setMatters] = useState(MATTERS);

  const handleDelete = (id: string) => {
    setMatters(matters.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'My Legal Matters' : 'Mis Asuntos Legales'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Track and manage your open and closed legal matters.'
                : 'Rastrea y administra tus asuntos legales abiertos y cerrados.'}
            </p>
          </div>

          <div className="space-y-4">
            {matters.map((matter) => (
              <div
                key={matter.id}
                className={`flex items-start justify-between p-6 rounded-xl border ${
                  matter.status === 'open'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      matter.status === 'open'
                        ? 'bg-blue-100'
                        : 'bg-slate-200'
                    }`}
                  >
                    {matter.status === 'open' ? (
                      <Clock className={`w-5 h-5 ${matter.status === 'open' ? 'text-blue-600' : 'text-slate-600'}`} />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{matter.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {en ? 'Created' : 'Creado'}: {new Date(matter.createdDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-600">
                      {en ? 'Updated' : 'Actualizado'}: {new Date(matter.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      matter.status === 'open'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {matter.status === 'open'
                      ? en
                        ? 'Open'
                        : 'Abierto'
                      : en
                        ? 'Closed'
                        : 'Cerrado'}
                  </span>
                  <button
                    onClick={() => handleDelete(matter.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/Profile.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 40.8 KB | 6.2 KB |
| Lines | 947 | 151 |
| Delta | — | 16% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Phone, Briefcase, Building2, FileText, Bell, Lock, Save, Camera, Download, Trash2, Shield, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  bio: string;
  avatar_url: string;
  notification_email: boolean;
  notification_sms: boolean;
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security' | 'data'>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    bio: '',
    avatar_url: '',
    notification_email: true,
    notification_sms: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [dataExporting, setDataExporting] = useState(false);
  const [dataDeleting, setDataDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [exportRequests, setExportRequests] = useState<Array<{
    id: string;
    status: string;
    requested_at: string;
    completed_at: string | null;
  }>>([]);
  const [deletionRequests, setDeletionRequests] = useState<Array<{
    id: string;
    status: string;
    request_type: string;
    scheduled_for: string | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'data') {
      loadDataRequests();
    }
  }, [user, activeTab]);

  const loadDataRequests = async () => {
    if (!user) return;

    const [exportRes, deletionRes] = await Promise.all([
      supabase
        .from('data_export_requests')
        .select('id, status, requested_at, completed_at')
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false })
        .limit(5),
      supabase
        .from('data_deletion_requests')
        .select('id, status, request_type, scheduled_for, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (exportRes.data) setExportRequests(exportRes.data);
    if (deletionRes.data) setDeletionRequests(deletionRes.data);
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          email: data.email || user?.email || '',
          phone: data.phone || '',
          company: data.company || '',
          job_title: data.job_title || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          notification_email: data.notification_email ?? true,
          notification_sms: data.notification_sms ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const trimmedEmail = profileData.email.trim().toLowerCase();
      const emailChanged = !!user?.email && trimmedEmail && trimmedEmail !== user.email.toLowerCase();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

      if (emailChanged && !emailValid) {
        setMessage({ type: 'error', text: 'Please enter a valid email address.' });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          company: profileData.company,
          job_title: profileData.job_title,
          bio: profileData.bio,
          notification_email: profileData.notification_email,
          notification_sms: profileData.notification_sms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      if (emailChanged) {
        const { error: emailErr } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (emailErr) throw emailErr;
        setMessage({
          type: 'success',
          text: 'Profile saved. Check your new inbox to confirm the email change.',
        });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      }

      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      const text = error instanceof Error ? error.message : 'Failed to update profile';
      setMessage({ type: 'error', text });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv' = 'json') => {
    if (!user) return;
    setDataExporting(true);
    setMessage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-export`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            format,
            includeChatHistory: true,
            includeDocuments: true,
            includeProfile: true,
            includeActivityLogs: false,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ezlegal_data_export_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({ type: 'success', text: 'Your data has been exported successfully' });
      loadDataRequests();
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to export data' });
    } finally {
      setDataExporting(false);
    }
  };

  const handleRequestDeletion = async (immediate: boolean = false) => {
    if (!user || deleteConfirmText !== 'DELETE') return;
    setDataDeleting(true);
    setMessage(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/data-deletion`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: 'chat_only',
            reason: 'User requested deletion',
            legalBasis: 'user_request',
            immediate,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Deletion request failed');
      }

      if (result.blockedByLegalHold) {
        setMessage({ type: 'error', text: result.message });
      } else if (result.status === 'scheduled') {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'success', text: 'Your data has been deleted successfully' });
      }

      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
      loadDataRequests();
    } catch (error) {
      console.error('Deletion error:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to request deletion' });
    } finally {
      setDataDeleting(false);
    }
  };

  const handleCancelDeletion = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('data_deletion_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Deletion request cancelled' });
      loadDataRequests();
    } catch (error) {
      console.error('Cancel error:', error);
      setMessage({ type: 'error', text: 'Failed to cancel deletion request' });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2097152) {
      setMessage({ type: 'error', text: 'File size must be less than 2MB' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, PNG, WebP, and GIF images are allowed' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const updatedProfileData = { ...profileData, avatar_url: publicUrl };
      setProfileData(updatedProfileData);

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
        });

      if (updateError) throw updateError;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profile photo updated successfully' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to upload photo' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900">{t('profile.title')}</h1>
          <p className="mt-2 text-navy-600">{t('profile.subtitle')}</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-navy-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <User className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabProfile')}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Bell className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabPreferences')}
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Lock className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabSecurity')}
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'data'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-navy-600 hover:text-navy-900 hover:border-navy-300'
                }`}
              >
                <Shield className="w-5 h-5 inline-block mr-2" />
                {t('profile.tabData')}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-navy-200">
                  <div className="relative">
                    {profileData.avatar_url ? (
                      <img
                        src={profileData.avatar_url}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-navy-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-semibold">
                        {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg border border-navy-200 hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Upload photo"
                    >
                      <Camera className="w-4 h-4 text-navy-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900">{t('profile.photoTitle')}</h3>
                    <p className="text-sm text-navy-600 mt-1">
                      {uploading ? t('profile.photoUploading') : t('profile.photoDesc')}
                    </p>
                    <p className="text-xs text-navy-500 mt-1">{t('profile.photoFormats')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <User className="w-4 h-4 inline-block mr-1" />
                      {t('profile.fullName')}
                    </label>
                    <input
                      type="text"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Mail className="w-4 h-4 inline-block mr-1" />
                      {t('profile.emailAddress')}
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      autoComplete="email"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="email"
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-navy-900"
                    />
                    <p className="mt-1 text-xs text-navy-500">
                      Changing your email sends a confirmation link to the new address. The change
                      takes effect after you confirm it.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Phone className="w-4 h-4 inline-block mr-1" />
                      {t('profile.phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Briefcase className="w-4 h-4 inline-block mr-1" />
                      {t('profile.jobTitle')}
                    </label>
                    <input
                      type="text"
                      value={profileData.job_title}
                      onChange={(e) => setProfileData({ ...profileData, job_title: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Senior Attorney"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <Building2 className="w-4 h-4 inline-block mr-1" />
                      {t('profile.company')}
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="ABC Organization"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-700 mb-2">
                      <FileText className="w-4 h-4 inline-block mr-1" />
                      {t('profile.bio')}
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder={t('profile.bioPlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-navy-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('profile.saving') : t('profile.saveChanges')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.notifTitle')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-medium text-navy-900">{t('profile.emailNotif')}</div>
                        <div className="text-sm text-navy-600 mt-1">
                          {t('profile.emailNotifDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notification_email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, notification_email: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-navy-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-navy-50 rounded-lg">
                      <div>
                        <div className="font-medium text-navy-900">{t('profile.smsNotif')}</div>
                        <div className="text-sm text-navy-600 mt-1">
                          {t('profile.smsNotifDesc')}
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileData.notification_sms}
                          onChange={(e) =>
                            setProfileData({ ...profileData, notification_sms: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-navy-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-navy-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 border-t border-navy-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? t('profile.saving') : t('profile.savePreferences')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.changePassword')}</h3>
                  <p className="text-sm text-navy-600 mb-6">
                    {t('profile.changePasswordDesc')}
                  </p>

                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {t('profile.newPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        {t('profile.confirmPassword')}
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleChangePassword}
                        disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {saving ? t('profile.updating') : t('profile.updatePassword')}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('profile.accountInfo')}</h3>
                  <div className="space-y-2 text-sm text-navy-600">
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.accountId')}</span> {user?.id}
                    </p>
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.emailLabel')}</span> {user?.email}
                    </p>
                    <p>
                      <span className="font-medium text-navy-700">{t('profile.accountCreated')}</span>{' '}
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-8">
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-2">{t('profile.dataRights')}</h3>
                      <p className="text-sm text-navy-600">
                        {t('profile.dataRightsDesc')}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-navy-900 mb-4">{t('profile.exportTitle')}</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    {t('profile.exportDesc')}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleExportData('json')}
                      disabled={dataExporting}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dataExporting ? t('profile.exportingData') : t('profile.exportJSON')}
                    </button>
                    <button
                      onClick={() => handleExportData('csv')}
                      disabled={dataExporting}
                      className="px-4 py-2 bg-white text-navy-700 border border-navy-300 rounded-lg font-medium hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dataExporting ? t('profile.exportingData') : t('profile.exportCSV')}
                    </button>
                  </div>

                  {exportRequests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-navy-700 mb-2">{t('profile.recentExports')}</h4>
                      <div className="space-y-2">
                        {exportRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                            {req.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : req.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{req.status}</span>
                            <span className="text-navy-400">-</span>
                            <span>{new Date(req.requested_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-navy-900 mb-2">{t('profile.dataRetention')}</h3>
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-navy-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-navy-500" />
                        <span className="font-medium text-navy-700">{t('profile.chatHistory')}</span>
                      </div>
                      <p className="text-sm text-navy-600">{t('profile.chatRetention')}</p>
                    </div>
                    <div className="bg-navy-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-navy-500" />
                        <span className="font-medium text-navy-700">{t('profile.documentsLabel')}</span>
                      </div>
                      <p className="text-sm text-navy-600">{t('profile.docRetention')}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-navy-200">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">{t('profile.deleteTitle')}</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    {t('profile.deleteDesc')}
                  </p>

                  {deletionRequests.some(r => ['pending', 'verified', 'scheduled'].includes(r.status)) ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-amber-800">{t('profile.deletionPending')}</p>
                          {deletionRequests.filter(r => ['pending', 'verified', 'scheduled'].includes(r.status)).map((req) => (
                            <div key={req.id} className="mt-2 text-sm text-amber-700">
                              <p>
                                Status: <span className="capitalize font-medium">{req.status}</span>
                                {req.scheduled_for && (
                                  <> - Scheduled for {new Date(req.scheduled_for).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</>
                                )}
                              </p>
                              <button
                                onClick={() => handleCancelDeletion(req.id)}
                                className="mt-2 text-amber-800 underline hover:no-underline"
                              >
                                {t('profile.cancelRequest')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : !showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('profile.requestDeletion')}
                    </button>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">{t('profile.confirmDeletion')}</p>
                          <p className="text-sm text-red-700 mt-1">
                            {t('profile.confirmDeletionDesc')}
                          </p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="w-full max-w-xs px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleRequestDeletion(false)}
                          disabled={dataDeleting || deleteConfirmText !== 'DELETE'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          {dataDeleting ? t('profile.processing') : t('profile.scheduleDeletion')}
                        </button>
                        <button
                          onClick={() => handleRequestDeletion(true)}
                          disabled={dataDeleting || deleteConfirmText !== 'DELETE'}
                          className="px-4 py-2 bg-red-800 text-white rounded-lg font-medium hover:bg-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {dataDeleting ? t('profile.processing') : t('profile.deleteImmediately')}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteConfirmText('');
                          }}
                          className="px-4 py-2 bg-white text-navy-700 border border-navy-300 rounded-lg font-medium hover:bg-navy-50 transition-colors"
                        >
                          {t('profile.cancel')}
                        </button>
                      </div>
                    </div>
                  )}

                  {deletionRequests.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-navy-700 mb-2">{t('profile.deletionHistory')}</h4>
                      <div className="space-y-2">
                        {deletionRequests.map((req) => (
                          <div key={req.id} className="flex items-center gap-3 text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                            {req.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : req.status === 'blocked' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : req.status === 'cancelled' ? (
                              <XCircle className="w-4 h-4 text-navy-400" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                            <span className="capitalize">{req.status}</span>
                            <span className="text-navy-400">-</span>
                            <span className="capitalize">{req.request_type.replace('_', ' ')}</span>
                            <span className="text-navy-400">-</span>
                            <span>{new Date(req.created_at).toLocaleDateString(language === 'es' ? 'es-ES' : 'en-US')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { User, Mail, Globe, MapPin, CreditCard, Save } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Profile() {
  const { language, setLanguage } = useLanguage();
  const en = language === 'en';
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    jurisdiction: 'California',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {en ? 'Profile Settings' : 'Configuración de Perfil'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Manage your account settings and preferences.'
                : 'Gestiona la configuración de tu cuenta y preferencias.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                {en ? 'Personal Information' : 'Información Personal'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {en ? 'Full Name' : 'Nombre Completo'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {en ? 'Email' : 'Correo'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-600" />
                {en ? 'Preferences' : 'Preferencias'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {en ? 'Language' : 'Idioma'}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'en' | 'es')}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="en">{en ? 'English' : 'Inglés'}</option>
                    <option value="es">{en ? 'Spanish' : 'Español'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {en ? 'Jurisdiction' : 'Jurisdicción'}
                  </label>
                  <select
                    name="jurisdiction"
                    value={formData.jurisdiction}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option>California</option>
                    <option>Texas</option>
                    <option>New York</option>
                    <option>Florida</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                {en ? 'Subscription' : 'Suscripción'}
              </h2>
              <p className="text-slate-600 mb-4">
                {en ? 'Current plan: Professional' : 'Plan actual: Profesional'}
              </p>
              <button
                type="button"
                className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {en ? 'Manage Subscription' : 'Gestionar Suscripción'}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (en ? 'Saving...' : 'Guardando...') : (en ? 'Save Changes' : 'Guardar Cambios')}
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

## src/pages/Checkout.tsx

| Metric | Baseline (Apr 28) | Current |
|--------|-------------------|--------|
| Size | 22.9 KB | 7.1 KB |
| Lines | 442 | 157 |
| Delta | — | 36% of baseline |

### BASELINE VERSION (Apr 28)

```tsx
import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Lock, ArrowLeft, ArrowRight, Zap, Shield, CreditCard,
  Building2, Users, FileText, Download, Calendar, AlertTriangle, Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import { supabase } from '../lib/supabase';
import { clearPendingPlan, readPendingPlan, setPendingPlan } from '../lib/plan-context';

type CheckoutStep = 'review' | 'payment' | 'confirmation';

const PRODUCT_DETAILS: Record<string, {
  name: { en: string; es: string };
  description: { en: string; es: string };
  includes: { en: string[]; es: string[] };
}> = {
  immigration: {
    name: { en: 'Immigration Help Pack', es: 'Paquete de Inmigracion' },
    description: { en: 'Complete action plan for immigration situations', es: 'Plan de accion completo para situaciones de inmigracion' },
    includes: {
      en: ['5-page action plan', 'Know Your Rights document', 'Emergency contacts', 'Deadline checklist', 'Attorney referral'],
      es: ['Plan de accion de 5 paginas', 'Documento de derechos', 'Contactos de emergencia', 'Lista de fechas', 'Referencia a abogado'],
    },
  },
  housing: {
    name: { en: 'Housing & Eviction Pack', es: 'Paquete de Vivienda' },
    description: { en: 'Eviction defense and tenant rights toolkit', es: 'Kit de defensa contra desalojo y derechos del inquilino' },
    includes: {
      en: ['Eviction response template', 'Tenant rights guide', 'Court prep checklist', 'Evidence guide', 'Attorney referral'],
      es: ['Plantilla de respuesta', 'Guia de derechos', 'Lista del tribunal', 'Guia de evidencia', 'Referencia a abogado'],
    },
  },
  family: {
    name: { en: 'Family Matters Pack', es: 'Paquete Familiar' },
    description: { en: 'Divorce, custody, and family court guidance', es: 'Orientacion sobre divorcio, custodia y tribunal familiar' },
    includes: {
      en: ['Self-representation guide', 'Custody templates', 'Support calculator', 'Court prep', 'Attorney referral'],
      es: ['Guia de autorepresentacion', 'Plantillas de custodia', 'Calculadora', 'Preparacion', 'Referencia a abogado'],
    },
  },
  employment: {
    name: { en: 'Employment & Wages Pack', es: 'Paquete de Empleo' },
    description: { en: 'Wage claims and workplace rights tools', es: 'Herramientas de reclamos salariales y derechos laborales' },
    includes: {
      en: ['Wage claim guide', 'Demand letter templates', 'Evidence guide', 'Filing deadlines', 'Attorney referral'],
      es: ['Guia de reclamo', 'Plantillas de demanda', 'Guia de evidencia', 'Fechas limite', 'Referencia a abogado'],
    },
  },
  debt: {
    name: { en: 'Debt Defense Pack', es: 'Paquete de Deudas' },
    description: { en: 'Debt collection defense and negotiation tools', es: 'Herramientas de defensa contra cobro de deudas' },
    includes: {
      en: ['Validation letters', 'Response guide', 'Statute checker', 'Negotiation scripts', 'Attorney referral'],
      es: ['Cartas de validacion', 'Guia de respuesta', 'Verificador', 'Guiones', 'Referencia a abogado'],
    },
  },
  negotiation: {
    name: { en: 'Negotiation Strategy Planner', es: 'Planificador de Negociacion' },
    description: { en: 'AI-generated negotiation strategy document', es: 'Documento de estrategia generado por IA' },
    includes: {
      en: ['Opening scripts', 'Settlement calculator', 'Counter-offer strategies', 'Red flag detection', 'PDF strategy doc'],
      es: ['Guiones de apertura', 'Calculadora', 'Contraofertas', 'Deteccion de riesgos', 'Documento PDF'],
    },
  },
  predictor: {
    name: { en: 'AI Case Predictor', es: 'Predictor de Casos IA' },
    description: { en: 'Data-informed probability range for your case', es: 'Rango de probabilidad basado en datos para tu caso' },
    includes: {
      en: ['Probability range', 'Key factor analysis', 'Similar case comparisons', 'Recommended next steps'],
      es: ['Rango de probabilidad', 'Analisis de factores', 'Comparaciones de casos', 'Proximos pasos'],
    },
  },
};

const PRICES: Record<string, number> = {
  immigration: 39, housing: 29, family: 39, employment: 29, debt: 29, negotiation: 49, predictor: 4.99,
};

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isBusiness, isOrganization } = usePersonaRouting();
  const lang = language === 'en' ? 'en' : 'es';

  const queryPlan = searchParams.get('plan');
  const pending = readPendingPlan();
  const plan = queryPlan || pending?.planId || 'housing';
  const product = PRODUCT_DETAILS[plan] || PRODUCT_DETAILS['housing'];
  const price = PRICES[plan] || 29;

  const [step, setStep] = useState<CheckoutStep>('review');
  const [email, setEmail] = useState(user?.email || '');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [waitlistMsg, setWaitlistMsg] = useState('');

  if (!user) {
    setPendingPlan(plan, 'checkout-gate');
    return (
      <div className="min-h-screen bg-navy-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">
            {language === 'en' ? 'Sign in to continue' : 'Inicia sesion para continuar'}
          </h1>
          <p className="text-navy-600 mb-6">
            {language === 'en' ? 'Create a free account to complete your purchase and access your materials.' : 'Crea una cuenta gratis para completar tu compra y acceder a tus materiales.'}
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${plan}`)}`}
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            {language === 'en' ? 'Sign In to Continue' : 'Iniciar Sesion'}
          </Link>
          <p className="text-xs text-navy-500 mt-3">
            {language === 'en' ? 'No credit card required for account creation' : 'No se requiere tarjeta para crear cuenta'}
          </p>
        </div>
      </div>
    );
  }

  const handleSubmitPayment = async () => {
    setProcessing(true);
    setErrorMsg('');
    setWaitlistMsg('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) {
        setErrorMsg(language === 'en' ? 'Your session expired. Please sign in again.' : 'Sesion expirada. Inicia sesion de nuevo.');
        setProcessing(false);
        return;
      }
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout-session`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan,
          successUrl: `${window.location.origin}/dashboard/billing?status=success`,
          cancelUrl: `${window.location.origin}/checkout?plan=${plan}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.error ?? (language === 'en' ? 'Could not start checkout.' : 'No se pudo iniciar el pago.'));
        setProcessing(false);
        return;
      }
      if (data.mode === 'stripe' && data.url) {
        clearPendingPlan();
        window.location.href = data.url;
        return;
      }
      clearPendingPlan();
      setWaitlistMsg(
        language === 'en'
          ? 'Stripe is being finalized. Your interest is queued and we will email you within one business day.'
          : 'Stripe esta en configuracion. Guardamos tu interes y te contactaremos en un dia habil.',
      );
      setStep('confirmation');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <header className="bg-white border-b border-navy-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <img src="/red-and-grey-minamali-business-card-2-1-2.svg" alt="ezLegal.ai" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-navy-600">
              <Lock className="w-4 h-4 text-green-600" />
              <span>{language === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="sr-only">{language === 'en' ? 'Secure Checkout' : 'Pago Seguro'}</h1>
        <button
          onClick={() => step === 'review' ? navigate(-1) : setStep('review')}
          className="flex items-center gap-2 text-navy-600 hover:text-navy-900 mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'review'
            ? (language === 'en' ? 'Back' : 'Volver')
            : (language === 'en' ? 'Back to review' : 'Volver a revision')}
        </button>

        <div className="flex items-center gap-2 mb-8">
          {(['review', 'payment', 'confirmation'] as CheckoutStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === s ? 'bg-teal-600 text-white' :
                (['review', 'payment', 'confirmation'].indexOf(step) > i) ? 'bg-teal-100 text-teal-700' :
                'bg-navy-200 text-navy-500'
              }`}>
                {(['review', 'payment', 'confirmation'].indexOf(step) > i) ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-navy-900' : 'text-navy-500'} hidden sm:block`}>
                {s === 'review' ? (language === 'en' ? 'Review' : 'Revision') :
                 s === 'payment' ? (language === 'en' ? 'Payment' : 'Pago') :
                 (language === 'en' ? 'Confirmation' : 'Confirmacion')}
              </span>
              {i < 2 && <div className="w-8 sm:w-16 h-px bg-navy-200" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'review' && product && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-navy-900 mb-4">
                  {language === 'en' ? 'Order Review' : 'Revision del Pedido'}
                </h2>

                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-1">{product.name[lang]}</h3>
                  <p className="text-sm text-navy-600 mb-3">{product.description[lang]}</p>
                  <ul className="space-y-1">
                    {product.includes[lang].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-navy-700">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {isOrganization && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      {language === 'en' ? 'Organization plans include multi-seat licensing and grant-eligible invoicing.' : 'Planes de organizacion incluyen licencias multi-usuario.'}
                    </p>
                  </div>
                )}

                {isBusiness && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      {language === 'en' ? 'Business plans include priority support and team sharing.' : 'Planes de negocios incluyen soporte prioritario.'}
                    </p>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-green-700">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{language === 'en' ? '7-day satisfaction guarantee' : 'Garantia de 7 dias'}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 ml-6">
                    {language === 'en' ? 'Full refund if not satisfied. No questions asked.' : 'Reembolso completo si no estas satisfecho.'}
                  </p>
                </div>

                <button
                  onClick={() => setStep('payment')}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {language === 'en' ? 'Continue to Payment' : 'Continuar al Pago'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <CreditCard className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                  <h2 className="text-xl font-bold text-navy-900">{language === 'en' ? 'Payment' : 'Pago'}</h2>
                </div>

                <div className="bg-navy-50 border border-navy-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-navy-900 text-sm">{language === 'en' ? 'Payment Security' : 'Seguridad de Pago'}</h3>
                      <p className="text-xs text-navy-600 mb-2">
                        {language === 'en' ? 'Your connection is protected with TLS 1.3 encryption. Payment processing via Stripe is in progress.' : 'Tu conexion esta protegida con cifrado TLS 1.3. El procesamiento de pagos via Stripe esta en progreso.'}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs text-navy-500">
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> TLS 1.3</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> AES-256</span>
                        <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-600" /> {language === 'en' ? 'Stripe (coming soon)' : 'Stripe (proximamente)'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1">{language === 'en' ? 'Email for receipt' : 'Email para recibo'}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-navy-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{errorMsg}</p>
                  </div>
                )}
                {waitlistMsg && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-2">
                    <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{waitlistMsg}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmitPayment}
                  disabled={processing}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> {language === 'en' ? 'Processing...' : 'Procesando...'}</>
                  ) : (
                    <><Lock className="w-4 h-4" /> {language === 'en' ? `Pay $${price}` : `Pagar $${price}`}</>
                  )}
                </button>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 sm:p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-navy-900 mb-2">
                    {language === 'en' ? 'Purchase Complete!' : 'Compra Completada!'}
                  </h2>
                  <p className="text-navy-600">
                    {language === 'en' ? 'Your materials are ready in your dashboard.' : 'Tus materiales estan listos en tu panel.'}
                  </p>
                </div>

                <div className="bg-navy-50 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-3">
                    {language === 'en' ? 'What happens next' : 'Que sigue'}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Download, text: language === 'en' ? 'Download your action plan and templates now' : 'Descarga tu plan de accion y plantillas ahora' },
                      { icon: FileText, text: language === 'en' ? 'Fill in templates with your specific details' : 'Completa las plantillas con tus datos' },
                      { icon: Calendar, text: language === 'en' ? 'Review your deadline checklist and key dates' : 'Revisa tu lista de fechas limite' },
                      { icon: Mail, text: language === 'en' ? 'Receipt sent to ' + email : 'Recibo enviado a ' + email },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm text-navy-700">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
                  <p className="text-xs text-green-700">
                    <span className="font-semibold">{language === 'en' ? 'Refund policy:' : 'Politica de reembolso:'}</span>{' '}
                    {language === 'en' ? '7-day full refund if not satisfied. Contact support@ezlegal.ai' : '7 dias de reembolso completo. Contacta support@ezlegal.ai'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/dashboard"
                    className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {language === 'en' ? 'Go to Dashboard' : 'Ir al Panel'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/find-attorney"
                    className="flex-1 bg-white hover:bg-navy-50 text-navy-700 font-semibold py-4 px-6 rounded-xl transition-all border border-navy-300 flex items-center justify-center gap-2"
                  >
                    {language === 'en' ? 'Find an Attorney' : 'Encontrar Abogado'}
                  </Link>
                </div>

                <p className="text-center text-xs text-navy-500 mt-4">
                  {language === 'en' ? 'Need help? Email support@ezlegal.ai' : 'Necesitas ayuda? Email support@ezlegal.ai'}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-navy-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-navy-900 mb-4">{language === 'en' ? 'Order Summary' : 'Resumen del Pedido'}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-navy-900 text-sm">{product?.name[lang] || plan}</p>
                    <p className="text-xs text-navy-500">{language === 'en' ? 'One-time purchase' : 'Compra unica'}</p>
                  </div>
                  <p className="font-bold text-navy-900">${price}</p>
                </div>
              </div>
              <div className="border-t border-navy-200 pt-3 mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-navy-900">{language === 'en' ? 'Total' : 'Total'}</span>
                  <span className="text-teal-600">${price}</span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-navy-500">
                <div className="flex items-center gap-2"><Lock className="w-3 h-3 text-green-600" /> TLS 1.3 + AES-256</div>
                <div className="flex items-center gap-2"><Shield className="w-3 h-3 text-green-600" /> {language === 'en' ? '7-day refund guarantee' : 'Garantia de 7 dias'}</div>
                <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-green-600" /> {language === 'en' ? 'Instant access' : 'Acceso instantaneo'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

### CURRENT VERSION

```tsx
import { useState } from 'react';
import { ShoppingCart, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Checkout() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [isBusiness, setIsBusiness] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [a2jPassed, setA2jPassed] = useState(false);
  const [acknowledgedScope, setAcknowledgedScope] = useState(false);

  const showA2JScreening = !isBusiness && !isOrganization && !a2jPassed;

  const handleA2JPass = () => {
    setA2jPassed(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            {en ? 'Checkout' : 'Pagar'}
          </h1>

          {showA2JScreening ? (
            <div className="bg-teal-50 border border-teal-300 rounded-xl p-8 mb-8">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {en ? 'Access to Justice Screening' : 'Evaluación de Acceso a la Justicia'}
                  </h2>
                  <p className="text-slate-700">
                    {en
                      ? 'We want to make sure you have access to affordable legal help. Please answer a few questions.'
                      : 'Queremos asegurarnos de que tengas acceso a ayuda legal asequible. Por favor, responde algunas preguntas.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={(e) => setIsBusiness(e.target.checked)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className="text-slate-700">
                      {en ? 'I am representing a business' : 'Represento un negocio'}
                    </span>
                  </label>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={(e) => setIsOrganization(e.target.checked)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className="text-slate-700">
                      {en ? 'I represent an organization' : 'Represento una organización'}
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleA2JPass}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {en ? 'Continue' : 'Continuar'}
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-600" />
                  {en ? 'Order Summary' : 'Resumen del Pedido'}
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">{en ? 'Professional Plan' : 'Plan Profesional'}</span>
                    <span className="font-semibold text-slate-900">$29.99/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">{en ? 'Annual Billing (Save 20%)' : 'Facturación Anual (Ahorra 20%)'}</span>
                    <span className="font-semibold text-green-600">-$72/year</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-6">
                  <span>{en ? 'Total' : 'Total'}:</span>
                  <span>$287.88/year</span>
                </div>

                {/* Stripe Placeholder */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-500 text-center">
                    {en ? 'Stripe payment form will load here' : 'El formulario de pago de Stripe se cargará aquí'}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {en ? 'Important Notice' : 'Aviso Importante'}
                    </h3>
                    <p className="text-sm text-slate-700">
                      {en
                        ? 'ezLegal.ai is not a law firm and does not provide legal advice. Always consult with a licensed attorney for legal matters.'
                        : 'ezLegal.ai no es un despacho de abogados y no proporciona asesoramiento legal. Siempre consulta con un abogado licenciado para asuntos legales.'}
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgedScope}
                    onChange={(e) => setAcknowledgedScope(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 mt-1"
                  />
                  <span className="text-sm text-slate-700">
                    {en
                      ? 'I understand the scope and limitations of this service'
                      : 'Entiendo el alcance y las limitaciones de este servicio'}
                  </span>
                </label>
              </div>

              <button
                disabled={!acknowledgedScope}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {en ? 'Complete Purchase' : 'Completar Compra'} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

```

---

