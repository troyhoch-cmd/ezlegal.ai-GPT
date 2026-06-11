import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Database, Server, Eye, ChevronDown, ChevronUp, ExternalLink, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQ {
  question: string;
  answer: string;
  relatedLinks?: Array<{ text: string; url: string }>;
}

const securityFAQs: FAQ[] = [
  {
    question: 'How is my data encrypted?',
    answer: 'All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. This means your information is protected both when it travels over the internet and when it\'s stored on our servers. Our cloud infrastructure provider (Supabase) maintains SOC 2 Type II certification.',
    relatedLinks: [
      { text: 'Security Whitepaper', url: '/trust-center#security' },
      { text: 'Enterprise Security', url: '/enterprise-security' }
    ]
  },
  {
    question: 'Who can access my conversations and documents?',
    answer: 'Only you can access your conversations and documents. We implement Row Level Security (RLS) at the database level, which means the database itself enforces access controls. Even our engineers cannot access your data without explicit permission and logging. For white-label clients, each deployment operates in a logically isolated environment.',
    relatedLinks: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Data Sovereignty Policy', url: '/trust-center#data-sovereignty' }
    ]
  },
  {
    question: 'Is my data used to train AI models?',
    answer: 'No, never. Your data is NEVER used to train, fine-tune, or improve any AI models. This is a core architectural principle, not just a policy choice. We use pre-trained AI models in inference-only mode. Your queries are processed to generate responses but are never fed back into model training pipelines.',
    relatedLinks: [
      { text: 'Data Sovereignty', url: '/trust-center#data-sovereignty' },
      { text: 'AI Ethics Policy', url: '/trust-center#ai-ethics' }
    ]
  },
  {
    question: 'How long do you keep my data?',
    answer: 'Chat history is automatically deleted after 90 days. Documents are retained for 1 year, then automatically deleted. Free chat sessions expire after 24 hours of inactivity. You can delete your data at any time from your profile settings, with immediate or scheduled deletion options.',
    relatedLinks: [
      { text: 'Data Retention Policy', url: '/trust-center#privacy' },
      { text: 'Your Rights', url: '/privacy#your-rights' }
    ]
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes! You can export all your data in JSON or CSV format from your profile settings at any time. This includes your chat history, documents, and account information. The export is complete and machine-readable.',
    relatedLinks: [
      { text: 'Profile Settings', url: '/dashboard/profile' },
      { text: 'Privacy FAQ', url: '/privacy-faq' }
    ]
  },
  {
    question: 'Do you have multi-factor authentication (MFA)?',
    answer: 'Yes, we support multi-factor authentication through our authentication provider (Supabase Auth). You can enable MFA in your profile settings for an additional layer of security on your account.',
    relatedLinks: [
      { text: 'Enable MFA', url: '/dashboard/profile#security' }
    ]
  },
  {
    question: 'Where is my data stored?',
    answer: 'Your data is hosted in the United States via Supabase\'s managed cloud infrastructure, which uses industry-leading security practices including automated backups, point-in-time recovery, and high availability configurations.',
    relatedLinks: [
      { text: 'Infrastructure Details', url: '/trust-center#security' }
    ]
  },
  {
    question: 'What happens if there\'s a security breach?',
    answer: 'We have incident response procedures in place. In the unlikely event of a security breach, we will notify affected users within 72 hours and provide detailed information about the incident, affected data, and remediation steps. We also maintain security audit logs for forensic analysis.',
    relatedLinks: [
      { text: 'Security Practices', url: '/trust-center#security' },
      { text: 'Contact Security Team', url: 'mailto:security@ezlegal.ai' }
    ]
  },
  {
    question: 'Are you CCPA compliant?',
    answer: 'Yes, we comply with the California Consumer Privacy Act (CCPA). We honor all data access, deletion, and opt-out requests. You can exercise your CCPA rights through your profile settings or by contacting privacy@ezlegal.ai.',
    relatedLinks: [
      { text: 'Privacy Policy', url: '/privacy' },
      { text: 'Your Rights', url: '/privacy#your-rights' }
    ]
  },
  {
    question: 'How do you secure API communications?',
    answer: 'All API communications use HTTPS with TLS 1.3 encryption. API keys are stored securely using encrypted environment variables, never in code. We implement rate limiting and request validation to prevent abuse and unauthorized access.',
    relatedLinks: [
      { text: 'Security Whitepaper', url: '/trust-center#security' }
    ]
  },
  {
    question: 'Do you perform security audits?',
    answer: 'Yes, we maintain ongoing security monitoring and logging. Our infrastructure provider (Supabase) maintains SOC 2 Type II certification. We also conduct regular internal security reviews and maintain activity audit logs for all user actions.',
    relatedLinks: [
      { text: 'Trust Center', url: '/trust-center' },
      { text: 'Compliance', url: '/trust-center#security' }
    ]
  },
  {
    question: 'How can I report a security vulnerability?',
    answer: 'We take security reports seriously. Please email security@ezlegal.ai with details of the vulnerability. We will acknowledge your report within 48 hours and provide updates as we investigate and remediate the issue.',
    relatedLinks: [
      { text: 'Contact Security Team', url: 'mailto:security@ezlegal.ai' }
    ]
  }
];

export default function SecurityFAQ() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-20 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="w-8 h-8 text-teal-400" />
            <h1 className="text-4xl font-bold">{en ? 'Security FAQ' : 'Preguntas de Seguridad'}</h1>
          </div>
          <p className="text-xl text-teal-100 text-center max-w-2xl mx-auto">
            {en ? 'Common questions about how we protect your data and maintain security' : 'Preguntas frecuentes sobre cómo protegemos tus datos y mantenemos la seguridad'}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Link
              to="/trust-center"
              className="p-4 bg-teal-50 border border-teal-200 rounded-xl hover:border-teal-400 transition-all group"
            >
              <Shield className="w-8 h-8 text-teal-600 mb-2" />
              <h3 className="font-semibold text-navy-900 mb-1">Trust Center</h3>
              <p className="text-sm text-navy-600">Overview of all policies</p>
            </Link>

            <Link
              to="/privacy-faq"
              className="p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-all group"
            >
              <Eye className="w-8 h-8 text-navy-600 mb-2 group-hover:text-teal-600" />
              <h3 className="font-semibold text-navy-900 mb-1">Privacy FAQ</h3>
              <p className="text-sm text-navy-600">Data privacy questions</p>
            </Link>

            <Link
              to="/scope-disclaimers"
              className="p-4 bg-navy-50 border border-navy-200 rounded-xl hover:border-teal-400 transition-all group"
            >
              <Database className="w-8 h-8 text-navy-600 mb-2 group-hover:text-teal-600" />
              <h3 className="font-semibold text-navy-900 mb-1">Scope FAQ</h3>
              <p className="text-sm text-navy-600">What we can and can't do</p>
            </Link>
          </div>

          <div className="space-y-3">
            {securityFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-navy-200 rounded-xl overflow-hidden hover:border-teal-300 transition-colors"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-navy-50 transition-colors"
                >
                  <span className="font-semibold text-navy-900 pr-4">{faq.question}</span>
                  {expandedIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                  )}
                </button>

                {expandedIndex === index && (
                  <div className="px-6 pb-4 pt-2 border-t border-navy-100">
                    <p className="text-navy-700 mb-4">{faq.answer}</p>

                    {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-navy-100">
                        <p className="text-sm font-medium text-navy-700 mb-2">Related Links:</p>
                        <div className="flex flex-wrap gap-2">
                          {faq.relatedLinks.map((link, linkIndex) => (
                            <Link
                              key={linkIndex}
                              to={link.url}
                              className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                            >
                              {link.text}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-br from-teal-50 to-navy-50 border border-teal-200 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Still have questions?</h3>
                <p className="text-navy-700 mb-4">
                  Our security team is here to help. Contact us at{' '}
                  <a href="mailto:security@ezlegal.ai" className="text-teal-600 font-medium hover:underline">
                    security@ezlegal.ai
                  </a>
                </p>
                <Link
                  to="/trust-center"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
                >
                  View Trust Center
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
