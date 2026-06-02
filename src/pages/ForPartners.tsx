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
                Bilingual intake and triage tools for legal aid and community organizations.
              </h1>
              <p className="text-xl text-navy-300 mb-4">
                Client intake, triage, referrals, Spanish support, case summaries, and partner workflows. Designed to support, not replace, legal aid staff and pro bono attorneys.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Link
                  to="/schedule-demo"
                  className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
                >
                  Partner with ezLegal
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/start?persona=organization"
                  className="inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white/60 text-white px-7 py-3.5 rounded-full font-semibold transition-colors"
                >
                  Preview intake flow
                </Link>
              </div>
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
