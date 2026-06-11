import { useState } from 'react';
import {
  ChevronDown, ChevronRight, Users, Puzzle,
  CheckCircle, Globe, Shield, Lock, Eye,
  Key, Award, Fingerprint,
  FileText, Download,
  Copy, Check
} from 'lucide-react';
import { DOWNLOADABLE_ASSETS } from '../data/partnerAssetContent';
import { AssetsDashboard } from './AssetsDashboard';

interface TileData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  content: string[];
  price?: string;
  pricePeriod?: string;
  idealFor?: string;
  notIncluded?: string[];
  highlight?: boolean;
}

const PARTNERSHIP_TIERS: TileData[] = [
  {
    id: 'legal_aid_free',
    title: 'Legal Aid Partner',
    subtitle: 'For nonprofits & legal aid orgs',
    category: 'Partnership Tier',
    price: 'Free',
    pricePeriod: '',
    idealFor: '501(c)(3) legal aid organizations',
    highlight: false,
    content: [
      'Unlimited embed widget',
      'Spanish & English support',
      'Custom branding with your logo',
      'Monthly impact reports',
      'Pro bono case intake integration',
      'Dedicated onboarding specialist',
    ],
  },
  {
    id: 'pro',
    title: 'Pro Partner',
    subtitle: 'Embed widget on your site',
    category: 'Partnership Tier',
    price: '$79',
    pricePeriod: '/mo',
    idealFor: 'Community orgs, law firms, and small businesses',
    highlight: true,
    content: [
      '500 conversations/month included',
      'Lead capture & email collection',
      'Real-time analytics dashboard',
      'Custom colors & positioning',
      'Conversation history export',
      'Priority email support',
    ],
  },
  {
    id: 'developer',
    title: 'Developer Partner',
    subtitle: 'API access for custom builds',
    category: 'Partnership Tier',
    price: '$0.02',
    pricePeriod: '/query',
    idealFor: 'Legal tech startups, custom app builders',
    highlight: false,
    content: [
      'Full REST API access',
      'Jurisdiction-aware responses',
      'Webhook notifications',
      'Sandbox testing environment',
      'SDKs for JS, Python, Ruby',
      'Technical account manager',
    ],
  },
  {
    id: 'enterprise',
    title: 'Enterprise Partner',
    subtitle: 'White-label & custom solutions',
    category: 'Partnership Tier',
    price: 'Custom',
    pricePeriod: '',
    idealFor: 'Large organizations, legal tech companies, franchises',
    highlight: false,
    content: [
      'White-label branding (no ezLegal marks)',
      'Custom domain & SSL',
      'Dedicated infrastructure',
      'SLA with 99.9% uptime guarantee',
      'Custom AI model fine-tuning',
      'Quarterly business reviews',
    ],
  },
];

const INTEGRATION_TIERS: TileData[] = [
  {
    id: 'widget',
    title: 'Pro Widget',
    subtitle: 'Add AI to Your Website',
    category: 'Integration Tier',
    price: '$79',
    pricePeriod: '/month',
    idealFor: 'Legal aid orgs, nonprofits, community organizations',
    highlight: true,
    content: [
      'Copy-paste installation (5 minutes)',
      'Customize colors and branding',
      'Lead capture and email collection',
      'Real-time analytics dashboard',
      'Conversation history and export',
    ],
    notIncluded: ['Custom domain', 'Remove ezLegal branding', 'API access'],
  },
  {
    id: 'api',
    title: 'Developer API',
    subtitle: 'Build Custom Integrations',
    category: 'Integration Tier',
    price: '$0.02',
    pricePeriod: '/query',
    idealFor: 'Legal tech startups, custom app builders',
    highlight: false,
    content: [
      'Full API documentation',
      'Sandbox environment for testing',
      'Webhook notifications',
      'Rate limiting controls',
      'Technical support via email',
    ],
    notIncluded: ['White-label rights', 'Dedicated support', 'Custom model training'],
  },
  {
    id: 'whitelabel',
    title: 'Enterprise White Label',
    subtitle: 'Deploy as Your Own Product',
    category: 'Integration Tier',
    price: 'Custom',
    pricePeriod: '',
    idealFor: 'Large organizations, legal tech companies, franchises',
    highlight: false,
    content: [
      'Custom domain (yourorg.ai)',
      'Complete brand customization',
      'Remove all ezLegal branding',
      'SSO/SAML integration',
      'Dedicated account manager',
      'Custom AI training on your content',
      'SLA guarantees',
    ],
    notIncluded: [],
  },
];

const FLYER_CONTENT = [
  {
    id: 'partner-overview',
    title: 'Partner Program Overview Flyer',
    description: 'Main partner program flyer covering all tiers, pricing, and benefits for prospective partners.',
    sections: [
      {
        heading: 'Headline',
        body: 'Bring Legal Justice to Your Community - Partner with ezLegal.ai',
      },
      {
        heading: 'Subheadline',
        body: 'Partner with ezLegal.ai to deliver AI-powered legal information to those who need it most. Bilingual widget, easy integration, and dedicated support.',
      },
      {
        heading: 'Key Stats',
        body: 'Growing Partner Network | 99.9% Target Uptime | 2 Languages (EN/ES)',
      },
      {
        heading: 'Pipeline Process',
        body: 'Step 1: Apply | Step 2: Discovery Call | Step 3: Pilot (30 days) | Step 4: Onboarding | Step 5: Go Live',
      },
      {
        heading: 'CTA',
        body: 'Apply to Partner - Our team will reach out within 1 business day. Email: partners@ezlegal.ai',
      },
    ],
  },
  {
    id: 'technical-integration',
    title: 'Technical Integration Flyer',
    description: 'Developer-focused flyer covering API endpoints, security features, and integration options.',
    sections: [
      {
        heading: 'Headline',
        body: 'Build on Enterprise-Grade Legal AI',
      },
      {
        heading: 'API Endpoints',
        body: 'POST /v1/chat/completions | GET /v1/documents/{id} | POST /v1/documents/generate | GET /v1/jurisdictions | POST /v1/webhooks | GET /v1/analytics/usage',
      },
      {
        heading: 'Security Credentials',
        body: 'SOC 2 Type II Infrastructure | AES-256 & TLS 1.3 Encryption | US-Based Hosting | Row Level Security | Authenticated Access | Audit Logging',
      },
      {
        heading: 'Compliance',
        body: 'CCPA Compliant | Zero Training on Client Data | SOC 2 Type II (via Supabase) | MFA Support',
      },
      {
        heading: 'Quick Comparison',
        body: 'Widget: 5min setup, no skills needed, $79/mo | API: 1-2 week setup, developer needed, $0.02/query | White Label: 2-4 week setup, we handle it, custom pricing',
      },
    ],
  },
  {
    id: 'legal-aid-flyer',
    title: 'Legal Aid Partner Flyer',
    description: 'Targeted flyer for nonprofit legal aid organizations emphasizing free tier and impact metrics.',
    sections: [
      {
        heading: 'Headline',
        body: 'Free AI-Powered Legal Information for Your Community',
      },
      {
        heading: 'Offer',
        body: 'Legal Aid Partner tier is completely FREE for 501(c)(3) organizations. No cost, no catch.',
      },
      {
        heading: 'What You Get',
        body: 'Unlimited embed widget | Spanish & English support | Custom branding | Monthly impact reports | Pro bono case intake integration | Dedicated onboarding specialist',
      },
      {
        heading: 'Partner Benefits',
        body: 'Unlimited widget | Spanish & English support | Custom branding | Monthly impact reports | Pro bono case intake integration | Dedicated onboarding specialist',
      },
      {
        heading: 'CTA',
        body: 'Apply for free partnership at ezlegal.ai/partners. Schedule a demo at ezlegal.ai/schedule-demo.',
      },
    ],
  },
  {
    id: 'español-flyer',
    title: 'Spanish Language Partner Flyer',
    description: 'Full Spanish-language flyer for outreach to Latino-serving organizations.',
    sections: [
      {
        heading: 'Titular',
        body: 'Lleve Justicia Legal a su Comunidad',
      },
      {
        heading: 'Subtitulo',
        body: 'Asociese con ezLegal.ai para ofrecer información legal impulsada por IA a quienes mas la necesitan. Widget bilingue, integracion sencilla y soporte dedicado.',
      },
      {
        heading: 'Estadisticas Clave',
        body: '50+ Alianzas Activas | 10K+ Usuarios Atendidos | 99.9% SLA de Disponibilidad | 2 Idiomas',
      },
      {
        heading: 'Alianza Gratuita',
        body: 'La Alianza de Asistencia Legal es completamente GRATIS para organizaciones 501(c)(3). Widget integrado ilimitado, soporte en español e inglés, marca personalizada.',
      },
      {
        heading: 'CTA',
        body: 'Solicite alianza en ezlegal.ai/partners. Correo: partners@ezlegal.ai',
      },
    ],
  },
];

export default function PartnerAssetsReview() {
  const [expandedSection, setExpandedSection] = useState<string | null>('tiers');
  const [expandedTile, setExpandedTile] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const toggleTile = (id: string) => {
    setExpandedTile(prev => prev === id ? null : id);
  };

  const copyContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-navy-900">Partner Assets & Flyer Content</h2>
        <p className="text-navy-500 mt-1">Review all partner-facing content, marketing assets, and flyer copy</p>
      </div>

      <SectionAccordion
        id="tiers"
        title="Partnership Tiers"
        subtitle="4 tiers displayed on the Partner Hub page"
        icon={<Users className="w-5 h-5" />}
        expanded={expandedSection === 'tiers'}
        onToggle={() => toggleSection('tiers')}
      >
        <div className="grid lg:grid-cols-2 gap-4">
          {PARTNERSHIP_TIERS.map(tier => (
            <TileCard
              key={tier.id}
              tile={tier}
              expanded={expandedTile === `tier-${tier.id}`}
              onToggle={() => toggleTile(`tier-${tier.id}`)}
              onCopy={(text) => copyContent(text, `tier-${tier.id}`)}
              copied={copiedId === `tier-${tier.id}`}
            />
          ))}
        </div>
      </SectionAccordion>

      <SectionAccordion
        id="integrations"
        title="Integration Options"
        subtitle="3 integration levels displayed on the For Partners page"
        icon={<Puzzle className="w-5 h-5" />}
        expanded={expandedSection === 'integrations'}
        onToggle={() => toggleSection('integrations')}
      >
        <div className="grid lg:grid-cols-3 gap-4">
          {INTEGRATION_TIERS.map(tier => (
            <TileCard
              key={tier.id}
              tile={tier}
              expanded={expandedTile === `int-${tier.id}`}
              onToggle={() => toggleTile(`int-${tier.id}`)}
              onCopy={(text) => copyContent(text, `int-${tier.id}`)}
              copied={copiedId === `int-${tier.id}`}
            />
          ))}
        </div>
      </SectionAccordion>

      <SectionAccordion
        id="flyers"
        title="Flyer Content"
        subtitle="Copy and messaging for partner flyers and marketing materials"
        icon={<FileText className="w-5 h-5" />}
        expanded={expandedSection === 'flyers'}
        onToggle={() => toggleSection('flyers')}
      >
        <div className="space-y-4">
          {FLYER_CONTENT.map(flyer => (
            <div key={flyer.id} className="bg-white rounded-xl border border-navy-200 overflow-hidden">
              <button
                onClick={() => toggleTile(`flyer-${flyer.id}`)}
                className="w-full flex items-center justify-between p-5 hover:bg-navy-50/50 transition-colors text-left"
              >
                <div>
                  <h4 className="font-bold text-navy-900">{flyer.title}</h4>
                  <p className="text-sm text-navy-500 mt-0.5">{flyer.description}</p>
                </div>
                {expandedTile === `flyer-${flyer.id}` ? (
                  <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-navy-400 flex-shrink-0" />
                )}
              </button>
              {expandedTile === `flyer-${flyer.id}` && (
                <div className="px-5 pb-5 border-t border-navy-100 pt-4 space-y-4">
                  {flyer.sections.map((section, sIdx) => (
                    <div key={sIdx} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">
                          {section.heading}
                        </span>
                        <button
                          onClick={() => copyContent(section.body, `flyer-${flyer.id}-${sIdx}`)}
                          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-navy-400 hover:text-teal-600 transition-all"
                        >
                          {copiedId === `flyer-${flyer.id}-${sIdx}` ? (
                            <><Check className="w-3 h-3" /> Copied</>
                          ) : (
                            <><Copy className="w-3 h-3" /> Copy</>
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-navy-700 leading-relaxed bg-navy-50 rounded-lg px-4 py-3">
                        {section.body}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const full = flyer.sections.map(s => `${s.heading}:\n${s.body}`).join('\n\n');
                      copyContent(full, `flyer-${flyer.id}-full`);
                    }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors"
                  >
                    {copiedId === `flyer-${flyer.id}-full` ? (
                      <><Check className="w-4 h-4" /> Copied all content</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy all flyer content</>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionAccordion>

      <SectionAccordion
        id="security"
        title="Security & Compliance Messaging"
        subtitle="Trust badges and security claims used across partner pages"
        icon={<Shield className="w-5 h-5" />}
        expanded={expandedSection === 'security'}
        onToggle={() => toggleSection('security')}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'SOC 2 Type II Infrastructure', desc: 'Built on Supabase, which maintains SOC 2 Type II certification for security, availability, and confidentiality.', icon: Award },
            { title: 'AES-256 & TLS 1.3 Encryption', desc: 'All data encrypted at rest and in transit via our cloud infrastructure provider.', icon: Shield },
            { title: 'US-Based Hosting', desc: 'Data hosted in the United States via Supabase managed cloud infrastructure.', icon: Globe },
            { title: 'Row Level Security', desc: 'Database-enforced access controls ensure users only access their authorized data.', icon: Key },
            { title: 'Authenticated Access', desc: 'Supabase Auth with MFA support. Every API request authenticated and authorized.', icon: Lock },
            { title: 'Audit Logging', desc: 'Activity audit trails of user actions and data access stored in database tables.', icon: Eye },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-navy-200 p-5 group">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-navy-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-navy-600 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => copyContent(`${item.title}: ${item.desc}`, `sec-${idx}`)}
                className="mt-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-navy-400 hover:text-teal-600 transition-all"
              >
                {copiedId === `sec-${idx}` ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-navy-50 rounded-xl border border-navy-200">
          <h4 className="text-sm font-bold text-navy-700 mb-2">Trust Bar (displayed on For Partners page)</h4>
          <div className="flex flex-wrap gap-4 text-xs text-navy-500">
            {[
              { icon: Award, label: 'SOC 2 Type II Infrastructure' },
              { icon: Shield, label: 'CCPA Compliant' },
              { icon: Lock, label: 'AES-256 Encryption' },
              { icon: Globe, label: 'TLS 1.3 In Transit' },
              { icon: Fingerprint, label: 'Zero Training on Client Data' },
            ].map((badge, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <badge.icon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </SectionAccordion>

      <SectionAccordion
        id="assets"
        title="Downloadable Assets"
        subtitle={`${DOWNLOADABLE_ASSETS.length} marketing collateral documents with full content preview`}
        icon={<Download className="w-5 h-5" />}
        expanded={expandedSection === 'assets'}
        onToggle={() => toggleSection('assets')}
      >
        <AssetsDashboard
          expandedTile={expandedTile}
          onToggleTile={toggleTile}
          onCopy={copyContent}
          copiedId={copiedId}
        />
      </SectionAccordion>
    </div>
  );
}

function SectionAccordion({
  title,
  subtitle,
  icon,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 bg-white rounded-xl border border-navy-200 hover:border-navy-300 transition-all text-left group"
      >
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 text-teal-600 group-hover:bg-teal-200 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-navy-900">{title}</h3>
          <p className="text-sm text-navy-500">{subtitle}</p>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-navy-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-navy-400" />
        )}
      </button>
      {expanded && (
        <div className="mt-3 pl-2 pr-2">
          {children}
        </div>
      )}
    </div>
  );
}

function TileCard({
  tile,
  expanded,
  onToggle,
  onCopy,
  copied,
}: {
  tile: TileData;
  expanded: boolean;
  onToggle: () => void;
  onCopy: (text: string) => void;
  copied: boolean;
}) {
  const fullText = [
    `${tile.title} - ${tile.subtitle}`,
    tile.price ? `Price: ${tile.price}${tile.pricePeriod || ''}` : '',
    tile.idealFor ? `Ideal for: ${tile.idealFor}` : '',
    'Features:',
    ...tile.content.map(c => `- ${c}`),
    ...(tile.notIncluded?.length ? ['Not included:', ...tile.notIncluded.map(n => `- ${n}`)] : []),
  ].filter(Boolean).join('\n');

  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all ${
      tile.highlight ? 'border-teal-300 shadow-sm' : 'border-navy-200'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-navy-50/50 transition-colors text-left"
      >
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-navy-900 text-sm">{tile.title}</h4>
            {tile.highlight && (
              <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-bold">
                POPULAR
              </span>
            )}
          </div>
          <p className="text-xs text-navy-500 mt-0.5">{tile.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {tile.price && (
            <span className="text-sm font-bold text-navy-900">
              {tile.price}<span className="text-xs text-navy-500 font-normal">{tile.pricePeriod}</span>
            </span>
          )}
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-navy-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-navy-400" />
          )}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-navy-100 pt-3 space-y-3">
          {tile.idealFor && (
            <div className="p-2.5 bg-navy-50 rounded-lg">
              <span className="text-xs text-navy-500">Ideal for: </span>
              <span className="text-xs font-medium text-navy-700">{tile.idealFor}</span>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-navy-600 mb-2">Included Features</p>
            <ul className="space-y-1.5">
              {tile.content.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-navy-700">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {tile.notIncluded && tile.notIncluded.length > 0 && (
            <div>
              <p className="text-xs font-bold text-navy-500 mb-2">Not Included</p>
              <ul className="space-y-1.5">
                {tile.notIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-navy-400">
                    <span className="w-3 h-3 rounded-full border border-navy-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={() => onCopy(fullText)}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-500 transition-colors pt-1"
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy tile content</>}
          </button>
        </div>
      )}
    </div>
  );
}

