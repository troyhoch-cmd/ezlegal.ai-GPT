import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { useLanguage } from '../contexts/LanguageContext';
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
import { GovernanceEvidencePanel } from '../components/trust/GovernanceEvidencePanel';

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
      <h2>Zero Training Policy</h2>
      <p><strong>Your client data is NEVER used to train foundational large language models.</strong> This is a core principle of our platform architecture, not just a policy choice.</p>

      <h2>Inference-Only Architecture</h2>
      <p>Our AI uses pre-trained models in inference-only mode. Your queries and conversations are processed to generate responses but are never fed back into model training pipelines.</p>

      <h2>Isolated Processing</h2>
      <p>Your data runs in its own space. It is never mixed with another client's data at any step.</p>

      <h2>White-Label Client Commitments</h2>
      <h3>Logical Isolation</h3>
      <p>Each white-label setup runs in its own space. It has its own database, API routes, and access rules.</p>

      <h3>Encryption</h3>
      <p>All data is encrypted at rest (AES-256) and in transit (TLS 1.3) via our cloud infrastructure provider (Supabase).</p>

      <h3>Data Hosting</h3>
      <p>Data is hosted in the United States via Supabase's managed cloud infrastructure.</p>

      <h2>What We Commit To</h2>
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
  const { language } = useLanguage();
  const en = language === 'en';
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
              <span className="text-sm font-semibold">{en ? 'Trust & Safety' : 'Confianza y Seguridad'}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{en ? 'Trust Center' : 'Centro de Confianza'}</h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              {en
                ? 'Transparency, security, and ethical AI practices are foundational to ezLegal.ai. Learn how we protect your data and ensure responsible AI use.'
                : 'Transparencia, seguridad y prácticas éticas de IA son fundamentales en ezLegal.ai. Conoce cómo protegemos tus datos y aseguramos un uso responsable de la IA.'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-navy-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">{en ? 'Quick Answers' : 'Respuestas Rápidas'}</h2>
            <p className="text-navy-600 mb-6">{en ? 'Find specific information quickly' : 'Encuentra información específica rápidamente'}</p>
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
                <h3 className="text-xl font-bold text-navy-900 mb-2">Zero Training Policy</h3>
                <p className="text-navy-700 text-lg">
                  <strong>Your client data is NEVER used to train foundational large language models.</strong> This is a core principle of our platform architecture, not just a policy choice.
                </p>
                <details className="mt-2 text-sm text-navy-600">
                  <summary className="cursor-pointer text-teal-600 hover:text-teal-700 font-medium text-sm">Why this claim appears</summary>
                  <p className="mt-1 leading-relaxed">Enforced via OpenAI API Terms of Service (API data not used for training) and our inference-only architecture. No fine-tuning or model improvement pipelines receive user data. Claim owner: ezLegal Engineering. Last reviewed: 2026-02.</p>
                </details>
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
              White-Label Client Commitments
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
                What We Commit To
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
              <details className="mt-2 text-xs text-navy-500">
                <summary className="cursor-pointer text-teal-600 hover:text-teal-700 font-medium">Why this claim appears</summary>
                <p className="mt-1 leading-relaxed">Provided by Supabase/AWS infrastructure. Covers data in transit and at rest only. Does not create attorney-client privilege.</p>
              </details>
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

          <div className="mt-10">
            <GovernanceEvidencePanel language={language} variant="full" />
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
