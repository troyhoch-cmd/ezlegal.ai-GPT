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
