import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Server, Database, FileText, CheckCircle, Key,
  Users, Eye, GitBranch, Activity, Clock, AlertTriangle,
  Zap, FileCheck, Download, ArrowRight,
  Layers, Code, Search, BookOpen, Scale, Brain, ShieldCheck, Calendar
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const certifications = [
  {
    name: 'SOC 2 Type II Infrastructure',
    status: 'Via Supabase',
    description: 'Our database and infrastructure provider (Supabase) maintains SOC 2 Type II certification for security, availability, and confidentiality controls',
    lastAudit: 'Supabase audit current',
    evidence: 'Certification held by Supabase (infrastructure provider), not by ezLegal application layer directly.',
    icon: <ShieldCheck className="w-6 h-6" />
  },
  {
    name: 'CCPA Compliant',
    status: 'Compliant',
    description: 'We honor California Consumer Privacy Act data access and deletion requests',
    lastAudit: 'Ongoing',
    evidence: 'Data export, deletion, and opt-out endpoints implemented with 45-day fulfillment target.',
    icon: <FileCheck className="w-6 h-6" />
  },
  {
    name: 'Encryption Standards',
    status: 'Active',
    description: 'TLS 1.3 in transit and AES-256 at rest via our cloud infrastructure provider',
    lastAudit: 'Continuous',
    evidence: 'Provided by Supabase/AWS infrastructure. Covers data in transit and at rest; does not create attorney-client privilege.',
    icon: <Lock className="w-6 h-6" />
  },
  {
    name: 'Zero AI Training',
    status: 'Policy',
    description: 'Your data is never used to train AI models per our provider agreements',
    lastAudit: 'Contractual',
    evidence: 'Internal policy enforced via OpenAI API ToS (data not used for training) and architecture design (inference-only mode).',
    icon: <Shield className="w-6 h-6" />
  }
];

const architectureFeatures = [
  {
    title: 'Row-Level Security Isolation',
    description: 'Each client matter is logically isolated using PostgreSQL Row Level Security (RLS). Cross-matter data access is prevented at the database query level.',
    technical: 'Supabase RLS policies with user and matter-level access controls, AES-256 encryption at rest',
    icon: <Database className="w-6 h-6" />
  },
  {
    title: 'Managed Cloud Infrastructure',
    description: 'Built on Supabase, a SOC 2 Type II certified managed PostgreSQL platform with automated backups, monitoring, and high availability.',
    technical: 'Supabase managed PostgreSQL, automated daily backups, point-in-time recovery',
    icon: <Server className="w-6 h-6" />
  },
  {
    title: 'Encryption at Rest & In Transit',
    description: 'All data is encrypted using industry-standard protocols provided by our infrastructure layer.',
    technical: 'TLS 1.3 for data in transit, AES-256 for data at rest via Supabase/AWS infrastructure',
    icon: <Key className="w-6 h-6" />
  },
  {
    title: 'Activity Audit Logs',
    description: 'User actions, data access, and AI interactions are logged in structured audit tables for accountability and review.',
    technical: 'Database-backed audit log tables with timestamps, user attribution, and action tracking',
    icon: <Activity className="w-6 h-6" />
  }
];

const conflictFeatures = [
  {
    title: 'Conflict Detection',
    description: 'Automated screening against existing matters and parties before any case is opened to prevent conflicts of interest.',
    integration: 'Built-in conflict checking via database queries'
  },
  {
    title: 'Multi-Dimensional Screening',
    description: 'Checks parties, related entities, and adverse parties across active and closed matters within the platform.',
    integration: 'Configurable screening rules per practice area'
  },
  {
    title: 'Access Control Management',
    description: 'Role-based access controls with matter-level permissions to restrict data access to authorized personnel.',
    integration: 'Supabase RLS policies and role-based permissions'
  }
];

const ragPipeline = [
  {
    step: 1,
    title: 'Legal Database Ingestion',
    description: 'Ethically curated legal knowledge base with jurisdiction-specific content',
    details: 'Arizona-optimized legal corpus including statutes, regulations, and legal aid resources managed by the LegalBreeze backend'
  },
  {
    step: 2,
    title: 'FAISS Vector Indexing',
    description: 'Documents chunked and embedded via the LegalBreeze RAG pipeline',
    details: 'Legal-domain embeddings with jurisdiction-specific indexing for efficient retrieval'
  },
  {
    step: 3,
    title: 'Jurisdiction-Aware Retrieval',
    description: 'User jurisdiction filters retrieval to relevant state/federal sources',
    details: 'Multi-index architecture with jurisdiction-specific indices and citation graphs'
  },
  {
    step: 4,
    title: 'Grounded Response Generation',
    description: 'Multi-tier LLM generates response anchored to retrieved sources with explicit citations',
    details: 'GPT-4 Turbo and reasoning models with hallucination detection, confidence scoring, and source verification'
  }
];

const whiteLabelFeatures = [
  { feature: 'Custom Branding', description: 'Logo, colors, fonts, and subdomain' },
  { feature: 'Authentication', description: 'Email/password auth with MFA support via Supabase Auth' },
  { feature: 'Custom Workflows', description: 'Configurable intake forms and routing' },
  { feature: 'Supabase Edge Functions', description: 'Serverless API endpoints for custom logic' },
  { feature: 'Role-Based Access', description: 'Granular permissions via Row Level Security' },
  { feature: 'Analytics Dashboard', description: 'White-label reporting and metrics' }
];

export default function EnterpriseSecurity() {
  const [activeTab, setActiveTab] = useState<'security' | 'architecture' | 'compliance'>('security');

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-teal-900 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/40 px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="text-teal-100 text-sm font-semibold">Enterprise Security</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Security & Compliance for Legal Professionals
            </h1>
            <p className="text-xl text-navy-300 mb-8">
              We run on Supabase, a SOC 2 Type II certified host. Your client data is kept in its own space, so legal aid and legal service teams can work without mixing files.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/schedule-demo"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Schedule Security Review
              </Link>
              <a
                href="#certifications"
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-white/30 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                View Security Details
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 bg-navy-100 border-b border-navy-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'security'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              Security Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'architecture'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              Technical Architecture
            </button>
            <button
              onClick={() => setActiveTab('compliance')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === 'compliance'
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-navy-600 hover:bg-navy-50 border border-navy-200'
              }`}
            >
              Compliance & Certifications
            </button>
          </div>
        </div>
      </section>

      {activeTab === 'security' && (
        <>
          <section id="certifications" className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Certifications & Compliance</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Independent third-party validation of our security controls and data protection practices.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      cert.status === 'Compliant' ? 'bg-green-100 text-green-600' :
                      cert.status === 'In Progress' ? 'bg-amber-100 text-amber-600' :
                      'bg-teal-100 text-teal-600'
                    }`}>
                      {cert.icon}
                    </div>
                    <h3 className="font-bold text-navy-900 mb-1">{cert.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mb-3 ${
                      cert.status === 'Compliant' ? 'bg-green-100 text-green-700' :
                      cert.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-teal-100 text-teal-700'
                    }`}>
                      {cert.status}
                    </span>
                    <p className="text-sm text-navy-600 mb-3">{cert.description}</p>
                    <details className="text-xs text-navy-500 mb-2">
                      <summary className="cursor-pointer text-teal-600 hover:text-teal-700 font-medium">Why this claim appears</summary>
                      <p className="mt-1 text-navy-600 leading-relaxed">{cert.evidence}</p>
                    </details>
                    <p className="text-xs text-navy-500">
                      <span className="font-medium">Last verified:</span> {cert.lastAudit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-navy-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Data Security Architecture</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Multi-layered security designed for sensitive legal data. Note: encryption and access controls do not create attorney-client privilege.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {architectureFeatures.map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-navy-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 text-teal-600">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                        <p className="text-navy-600 mb-3">{feature.description}</p>
                        <div className="bg-navy-50 rounded-lg p-3 border border-navy-200">
                          <p className="text-xs text-navy-500 font-mono">{feature.technical}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Conflict Checking System</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Automated conflict detection integrated with your existing systems.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {conflictFeatures.map((feature, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-navy-200">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                    <p className="text-navy-600 text-sm mb-4">{feature.description}</p>
                    <div className="pt-3 border-t border-navy-100">
                      <p className="text-xs text-teal-600 font-medium">{feature.integration}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-teal-50 rounded-xl p-6 border border-teal-200">
                <div className="flex items-start gap-4">
                  <Scale className="w-8 h-8 text-teal-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-navy-900 mb-2">Ethical Compliance Built-In</h3>
                    <p className="text-navy-600">
                      Our conflict checking system is designed to support compliance with ABA Model Rules 1.7, 1.9, and 1.10.
                      Configurable rules allow customization for state-specific ethics requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'architecture' && (
        <>
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">RAG Pipeline Architecture</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  How we ground AI responses in authoritative legal sources for jurisdiction-specific accuracy.
                </p>
              </div>

              <div className="relative">
                <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-teal-200" />

                <div className="space-y-8">
                  {ragPipeline.map((step, index) => (
                    <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                      <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                        <div className={`bg-white rounded-xl p-6 border border-navy-200 inline-block ${index % 2 === 0 ? 'lg:ml-auto' : 'lg:mr-auto'}`}>
                          <span className="inline-block w-8 h-8 bg-teal-600 text-white rounded-full text-sm font-bold flex items-center justify-center mb-3">
                            {step.step}
                          </span>
                          <h3 className="font-bold text-navy-900 mb-2">{step.title}</h3>
                          <p className="text-navy-600 mb-3">{step.description}</p>
                          <p className="text-xs text-navy-500 bg-navy-50 p-2 rounded">{step.details}</p>
                        </div>
                      </div>
                      <div className="hidden lg:flex w-12 h-12 bg-teal-100 rounded-full items-center justify-center flex-shrink-0 z-10 border-4 border-white">
                        {index === 0 && <Database className="w-5 h-5 text-teal-600" />}
                        {index === 1 && <Layers className="w-5 h-5 text-teal-600" />}
                        {index === 2 && <Search className="w-5 h-5 text-teal-600" />}
                        {index === 3 && <Brain className="w-5 h-5 text-teal-600" />}
                      </div>
                      <div className="flex-1 hidden lg:block" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-navy-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">White-Label Capabilities</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Deploy under your brand with complete customization and control.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {whiteLabelFeatures.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border border-navy-200 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-navy-900">{item.feature}</h3>
                      <p className="text-sm text-navy-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-white rounded-xl p-8 border border-navy-200">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-navy-900 mb-4">Authentication & Access Control</h3>
                    <p className="text-navy-600 mb-6">
                      Secure authentication powered by Supabase Auth with role-based access controls.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Email/password authentication with secure session management
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Multi-factor authentication (MFA) support
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Row Level Security for data access control
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Role-based permissions (admin, staff, user)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Code className="w-5 h-5 text-teal-600" />
                      <span className="font-mono text-sm text-navy-600">Supabase Auth</span>
                    </div>
                    <pre className="bg-navy-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto">
{`// Secure authentication via Supabase
const { data, error } = await supabase
  .auth.signInWithPassword({
    email: 'user@yourorg.com',
    password: '...'
  });

// Row Level Security enforced
// automatically on all queries
const { data: matters } = await supabase
  .from('matters')
  .select('*');
// Only returns user's authorized data`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">API Documentation</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Full REST API access for custom integrations with your practice management systems.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-navy-200">
                  <GitBranch className="w-8 h-8 text-teal-600 mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">Supabase Edge Functions</h3>
                  <p className="text-navy-600 text-sm mb-4">
                    Serverless API endpoints for custom business logic, AI processing, and data operations.
                  </p>
                  <span className="text-teal-600 text-sm font-semibold flex items-center gap-1">
                    Deno-powered serverless functions
                  </span>
                </div>

                <div className="bg-white rounded-xl p-6 border border-navy-200">
                  <Zap className="w-8 h-8 text-teal-600 mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">Data Export & Import</h3>
                  <p className="text-navy-600 text-sm mb-4">
                    Export your data in JSON or CSV format. Import client data from external systems via structured formats.
                  </p>
                  <span className="text-teal-600 text-sm font-semibold flex items-center gap-1">
                    JSON, CSV export supported
                  </span>
                </div>

                <div className="bg-white rounded-xl p-6 border border-navy-200">
                  <BookOpen className="w-8 h-8 text-teal-600 mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">Supabase Database API</h3>
                  <p className="text-navy-600 text-sm mb-4">
                    Auto-generated RESTful API from your database schema with built-in authentication and RLS.
                  </p>
                  <span className="text-teal-600 text-sm font-semibold flex items-center gap-1">
                    Auto-generated from schema
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'compliance' && (
        <>
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Data Sovereignty & Control</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Complete ownership and control over your organization's data.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-8 border border-navy-200">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-4">Your Data Stays Yours</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Never Used for AI Training</span>
                        <p className="text-sm text-navy-600">Client data is never used to train or improve AI models per our provider agreements</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Complete Data Portability</span>
                        <p className="text-sm text-navy-600">Export all data in JSON or CSV format at any time</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Right to Deletion</span>
                        <p className="text-sm text-navy-600">Request complete deletion of your data through our data deletion process</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">US-Based Infrastructure</span>
                        <p className="text-sm text-navy-600">Data hosted in the United States via Supabase cloud infrastructure</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-8 border border-navy-200">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
                    <Activity className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-navy-900 mb-4">Audit & Compliance Tools</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Activity Audit Trail</span>
                        <p className="text-sm text-navy-600">Actions logged in database audit tables with timestamps and user attribution</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Outcome Tracking</span>
                        <p className="text-sm text-navy-600">Track case outcomes for grant reporting and impact measurement</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Compliance Reports</span>
                        <p className="text-sm text-navy-600">Generate compliance reports for regulators and funders</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-navy-900">Configurable Retention</span>
                        <p className="text-sm text-navy-600">Data retention policies configurable through account settings</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-navy-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-navy-900 mb-4">Security Documentation</h2>
                <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                  Request detailed security documentation for your due diligence process.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-navy-200 hover:shadow-md transition-shadow">
                  <FileText className="w-8 h-8 text-teal-600 mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">Infrastructure Security</h3>
                  <p className="text-navy-600 text-sm mb-4">
                    Our infrastructure provider (Supabase) maintains SOC 2 Type II certification. Details available upon request for qualifying organizations.
                  </p>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-1">
                    Contact Us <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-navy-200 hover:shadow-md transition-shadow">
                  <Shield className="w-8 h-8 text-teal-600 mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">Security Overview</h3>
                  <p className="text-navy-600 text-sm mb-4">
                    Overview of our security architecture, data handling practices, and privacy controls.
                  </p>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-1">
                    Request Info <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 border border-navy-200 hover:shadow-md transition-shadow">
                  <Eye className="w-8 h-8 text-teal-600 mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">Privacy & Data Practices</h3>
                  <p className="text-navy-600 text-sm mb-4">
                    Documentation of our data collection, processing, retention, and deletion practices.
                  </p>
                  <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold flex items-center gap-1">
                    View Privacy Policy <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-teal-50 rounded-2xl p-8 lg:p-12 border border-teal-200">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-4">
                      Ready for a Security Deep Dive?
                    </h2>
                    <p className="text-navy-600 mb-6">
                      Schedule a call with our security team to discuss your specific requirements,
                      review our architecture, and answer technical questions.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        Live architecture walkthrough
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        Custom security questionnaire review
                      </li>
                      <li className="flex items-center gap-2 text-sm text-navy-600">
                        <CheckCircle className="w-4 h-4 text-teal-600" />
                        Integration planning session
                      </li>
                    </ul>
                    <Link
                      to="/schedule-demo"
                      className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule Security Review
                    </Link>
                  </div>
                  <div className="hidden lg:block">
                    <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-navy-900">Security Review Call</p>
                          <p className="text-sm text-navy-500">45 minutes with our security team</p>
                        </div>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-navy-600">
                          <Clock className="w-4 h-4" />
                          Architecture overview (15 min)
                        </div>
                        <div className="flex items-center gap-2 text-navy-600">
                          <Clock className="w-4 h-4" />
                          Q&A with security engineer (20 min)
                        </div>
                        <div className="flex items-center gap-2 text-navy-600">
                          <Clock className="w-4 h-4" />
                          Next steps & documentation (10 min)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
