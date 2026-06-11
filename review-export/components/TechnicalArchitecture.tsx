import { useState } from 'react';
import {
  Brain, Database, Shield, Server, Zap, Lock, FileText, Search,
  ChevronDown, ChevronUp, CheckCircle, Scale, Globe,
  Layers, GitBranch, RefreshCw, Users
} from 'lucide-react';

const ragSteps = [
  {
    step: 1,
    title: 'Query Processing',
    description: 'User question is analyzed for intent, jurisdiction, and legal domain',
    icon: <Search className="w-6 h-6" />,
    details: [
      'Natural language understanding extracts legal concepts',
      'Jurisdiction detection (state/federal/international)',
      'Practice area classification (95%+ accuracy)',
      'Query expansion for legal synonyms and terminology'
    ]
  },
  {
    step: 2,
    title: 'Document Retrieval',
    description: 'Relevant legal sources retrieved from authoritative databases',
    icon: <Database className="w-6 h-6" />,
    details: [
      'Vector similarity search across legal corpus',
      'Statute and regulation retrieval by jurisdiction',
      'Case law matching with precedent ranking',
      'Secondary source integration (treatises, guides)'
    ]
  },
  {
    step: 3,
    title: 'Context Assembly',
    description: 'Retrieved documents ranked and assembled with metadata',
    icon: <Layers className="w-6 h-6" />,
    details: [
      'Relevance scoring and deduplication',
      'Citation chain analysis',
      'Temporal ordering (most recent law first)',
      'Context window optimization'
    ]
  },
  {
    step: 4,
    title: 'Response Generation',
    description: 'AI generates response grounded in retrieved sources',
    icon: <Brain className="w-6 h-6" />,
    details: [
      'Source attribution for every legal statement',
      'Confidence scoring per assertion',
      'Disclaimer and limitation injection',
      'Plain language translation with legal accuracy'
    ]
  },
  {
    step: 5,
    title: 'Guardrails & Review',
    description: 'Response validated against ethical and accuracy standards',
    icon: <Shield className="w-6 h-6" />,
    details: [
      'Unauthorized practice of law (UPL) filtering',
      'Hallucination detection via source verification',
      'Crisis/emergency escalation triggers',
      'Bias and fairness monitoring'
    ]
  }
];

const securityFeatures = [
  {
    title: 'Data Isolation',
    icon: <Lock className="w-6 h-6" />,
    description: 'Complete tenant separation at database level',
    details: 'Each white-label tenant operates in an isolated data partition. Row-level security policies prevent any cross-tenant data access. Matter and client data never commingles between organizations.'
  },
  {
    title: 'Encryption',
    icon: <Shield className="w-6 h-6" />,
    description: 'AES-256 encryption at rest and in transit',
    details: 'All data encrypted using AES-256 at rest and TLS 1.3 in transit via our cloud infrastructure provider (Supabase). Encryption managed at the infrastructure level.'
  },
  {
    title: 'Access Control',
    icon: <Users className="w-6 h-6" />,
    description: 'Role-based permissions with audit logging',
    details: 'Granular RBAC with attorney, paralegal, admin, and viewer roles. All access logged with user, timestamp, and action. Session management with configurable timeouts. MFA support for all accounts.'
  },
  {
    title: 'Compliance',
    icon: <FileText className="w-6 h-6" />,
    description: 'SOC 2 Type II infrastructure, CCPA compliant',
    details: 'Built on Supabase, which maintains SOC 2 Type II certification. CCPA compliant data handling practices. Row Level Security for data access control. Activity audit logging for accountability.'
  }
];

const ethicalSafeguards = [
  {
    title: 'UPL Prevention',
    description: 'Responses never constitute legal advice; always recommend attorney consultation for specific matters'
  },
  {
    title: 'Source Attribution',
    description: 'Every legal statement linked to authoritative source (statute, case, regulation)'
  },
  {
    title: 'Confidence Scoring',
    description: 'AI indicates certainty level; low-confidence responses flagged for human review'
  },
  {
    title: 'Crisis Escalation',
    description: 'Domestic violence, self-harm, and emergency situations trigger immediate human escalation'
  },
  {
    title: 'Bias Monitoring',
    description: 'Continuous analysis for demographic disparities in response quality and outcomes'
  },
  {
    title: 'Human Oversight',
    description: 'Supervising attorneys review flagged responses; correction loop improves model'
  }
];

export default function TechnicalArchitecture() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [expandedSecurity, setExpandedSecurity] = useState<string | null>(null);

  return (
    <div className="space-y-16">
      <section className="bg-gradient-to-br from-stone-900 to-blue-900 rounded-3xl p-8 lg:p-12 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-blue-300" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold">Technical Architecture</h2>
            <p className="text-blue-200">For IT Leaders and Technical Decision Makers</p>
          </div>
        </div>

        <p className="text-lg text-stone-300 mb-8 max-w-3xl">
          ezLegal.ai uses a Retrieval-Augmented Generation (RAG) architecture to ensure
          AI responses are grounded in current, authoritative legal sources rather than
          relying solely on pre-trained model knowledge.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            RAG Pipeline: How Answers Are Generated
          </h3>

          <div className="space-y-4">
            {ragSteps.map((step) => (
              <div
                key={step.step}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold">{step.step}</span>
                  </div>
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-300">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{step.title}</h4>
                    <p className="text-sm text-stone-400">{step.description}</p>
                  </div>
                  {expandedStep === step.step ? (
                    <ChevronUp className="w-5 h-5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  )}
                </button>

                {expandedStep === step.step && (
                  <div className="px-4 pb-4 pl-24">
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-stone-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-stone-900 mb-4">
            Enterprise Security & Compliance
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            Built for organizations with stringent data protection and regulatory requirements
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {securityFeatures.map((feature) => (
            <div
              key={feature.title}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setExpandedSecurity(expandedSecurity === feature.title ? null : feature.title)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-stone-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-stone-600">{feature.description}</p>
                  </div>
                  {expandedSecurity === feature.title ? (
                    <ChevronUp className="w-5 h-5 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400" />
                  )}
                </div>
              </button>

              {expandedSecurity === feature.title && (
                <div className="px-6 pb-6 pt-0">
                  <div className="pl-16 pt-2 border-t border-stone-100">
                    <p className="text-sm text-stone-700 leading-relaxed pt-4">
                      {feature.details}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8 lg:p-12 border border-blue-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-stone-900">Ethical AI Safeguards</h2>
            <p className="text-stone-600">Responsible AI for legal applications</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ethicalSafeguards.map((safeguard, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-stone-200 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-stone-900">{safeguard.title}</h3>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {safeguard.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border border-stone-200 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-blue-600" />
          Integration Architecture
        </h2>

        <div className="grid lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              API Access
            </h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                RESTful API with OpenAPI 3.0 spec
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Webhook support for async events
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Rate limiting with burst allowance
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                API key + JWT authentication
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-blue-600" />
              Case Management Sync
            </h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                LegalServer bi-directional sync
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Clio integration (coming soon)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Custom CMS via API
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                CSV/bulk data import
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              White-Label Options
            </h3>
            <ul className="space-y-2 text-sm text-stone-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Custom domain support
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Brand theming (colors, logos)
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Embeddable chat widget
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                Isolated tenant environments
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
