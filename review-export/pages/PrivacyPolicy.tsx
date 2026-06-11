import { Shield, Lock, Eye, Database, Trash2, Users, Globe, AlertTriangle, CheckCircle, Brain, FileText, Mail, Download, UserX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-navy-50">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-teal-700 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500">
        Skip to content
      </a>
      <Navigation />

      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Shield className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">Your Privacy Matters</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-navy-200 mb-4">
              How we protect your personal information and legal data with{' '}
              <a href="#security" className="underline underline-offset-2 hover:text-white transition-colors">enterprise-grade security</a> and ethical AI practices.
            </p>
            <p className="text-navy-300">
              Last Updated: January 15, 2026 | Effective Date: January 15, 2026
            </p>
          </div>
        </div>
      </section>

      <section id="main-content" className="py-12 bg-white border-b border-navy-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Privacy at a Glance</h2>
            <p className="text-navy-600 text-sm mb-5">
              Here are the answers to the 5 questions most people have. For full details, read the policy below.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-navy-700 text-sm">
                  <strong>Do you train AI on my data?</strong> No. Your conversations and documents are never used to train our AI models.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-navy-700 text-sm">
                  <strong>How long do you keep my data?</strong> Chat history is kept for 90 days by default. Documents stay until you delete them. Account data is removed 30 days after you close your account. <a href="#retention" className="text-teal-600 hover:text-teal-800 underline">Full details</a>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-navy-700 text-sm">
                  <strong>Can I delete or export my data?</strong> Yes, at any time. Use your <Link to="/dashboard/profile" className="text-teal-600 hover:text-teal-800 underline">account settings</Link> or email us at <a href="mailto:privacy@ezlegal.ai" className="text-teal-600 hover:text-teal-800 underline">privacy@ezlegal.ai</a>. <a href="#rights" className="text-teal-600 hover:text-teal-800 underline">Full details</a>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-navy-700 text-sm">
                  <strong>Who do you share my data with?</strong> Only when you opt in (e.g., lawyer matching), with service providers who help us operate, or when legally required. We never sell your data. <a href="#sharing" className="text-teal-600 hover:text-teal-800 underline">Full details</a>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-navy-700 text-sm">
                  <strong>How do I contact you about privacy?</strong> Email <a href="mailto:privacy@ezlegal.ai" className="text-teal-600 hover:text-teal-800 underline">privacy@ezlegal.ai</a>. We respond within 30 days.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export My Data
            </Link>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-navy-900 border border-navy-300 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
            >
              <UserX className="w-4 h-4" />
              Delete My Data
            </Link>
            <a
              href="mailto:privacy@ezlegal.ai"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-navy-900 border border-navy-300 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
            >
              <Mail className="w-4 h-4" />
              Contact Privacy Team
            </a>
            <Link
              to="/trust-center"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-700 border border-teal-300 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium"
            >
              <Shield className="w-4 h-4" />
              Report a Concern
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Privacy Policy table of contents" className="bg-navy-50 rounded-xl p-6 border border-navy-200 mb-12">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#introduction" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">1. Introduction</a>
              <a href="#ethical-ai" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">2. Ethical AI Commitment</a>
              <a href="#collection" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">3. Information We Collect</a>
              <a href="#use" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">4. How We Use Your Information</a>
              <a href="#sharing" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">5. Information Sharing</a>
              <a href="#security" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">6. Data Security</a>
              <a href="#retention" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">7. Data Retention</a>
              <a href="#rights" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">8. Your Rights</a>
              <a href="#children" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">9. Children's Privacy</a>
              <a href="#international" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">10. International Users</a>
              <a href="#changes" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">11. Policy Changes</a>
              <a href="#contact" className="text-teal-600 hover:text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded px-1 -mx-1">12. Contact Us</a>
            </div>
          </nav>

          <div className="max-w-none">
            <section id="introduction" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">1. Introduction</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">
                  ezLegal.ai™ ("we", "us", "our") is committed to protecting the privacy of individuals who visit
                  our website and use our services. This Privacy Policy describes how we collect, use, disclose,
                  and safeguard your information when you visit our website at https://ezlegal.ai and use our
                  AI-powered legal assistance services.
                </p>
                <p className="text-navy-700 mb-4">
                  <strong>Who We Serve:</strong> ezLegal.ai™ serves individuals, families, small businesses,
                  pro bono organizations, and consumers who need legal assistance but cannot afford traditional
                  lawyer fees. We are NOT a service for lawyers or law firms.
                </p>
                <p className="text-navy-700 mb-4">
                  <strong>Powered by <span className="text-navy-800">Legalbre</span><span className="text-teal-500">ez</span><span className="text-navy-800">e</span><sup className="text-[8px] text-navy-500">TM</sup>:</strong> Our platform and AI capabilities are provided by our
                  parent company, <span className="text-navy-800">Legalbre</span><span className="text-teal-500">ez</span><span className="text-navy-800">e</span>.
                </p>
                <p className="text-navy-700">
                  <strong>Not legal advice:</strong> ezLegal.ai provides legal information, not legal advice. Communications through our platform are not attorney-client privileged. For full details on what our service does and does not cover, see our{' '}
                  <Link to="/scope-disclaimers" className="text-teal-600 hover:text-teal-800 font-medium">Scope & Disclaimers</Link>.
                </p>
              </div>
            </section>

            <section id="ethical-ai" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">2. Ethical AI Commitment</h2>
              </div>
              <div className="pl-11">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-navy-900 mb-3">Our Ethical AI Principles</h3>
                  <p className="text-navy-700 mb-4">
                    As an AI-powered service dedicated to access to justice, we commit to the following ethical principles:
                  </p>
                  <ul className="space-y-2 text-navy-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span><strong>No AI Training on Your Data:</strong> Your conversations and documents are NEVER used to train our AI models</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span><strong>Transparency:</strong> We clearly disclose when you're interacting with AI vs. human services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span><strong>Human Oversight:</strong> Critical decisions always involve human review options</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span><strong>Bias Mitigation:</strong> We actively work to identify and reduce algorithmic bias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <span><strong>Access to Justice:</strong> We prioritize making legal help available to underserved communities</span>
                    </li>
                  </ul>
                </div>
                <p className="text-navy-700">
                  For complete details on our AI governance practices, please review our{' '}
                  <Link to="/ai-governance" className="text-teal-600 hover:text-teal-800 font-medium">
                    AI Governance, Ethics & Access Policy
                  </Link>.
                </p>
              </div>
            </section>

            <section id="collection" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Database className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">3. Information We Collect</h2>
              </div>
              <div className="pl-11">
                <h3 className="font-semibold text-navy-900 mb-3">Information You Provide</h3>
                <ul className="list-disc pl-5 text-navy-700 mb-6 space-y-2">
                  <li><strong>Account Information:</strong> Name, email address, password (encrypted), and contact information</li>
                  <li><strong>Profile Information:</strong> State/jurisdiction, legal matter categories of interest</li>
                  <li><strong>Legal Information:</strong> Questions you ask, documents you upload, case details you provide</li>
                  <li><strong>Communication Data:</strong> Messages with our support team, feedback you submit</li>
                  <li><strong>Payment Information:</strong> Processed securely through Stripe; we never store full card numbers</li>
                </ul>

                <h3 className="font-semibold text-navy-900 mb-3">Information Collected Automatically</h3>
                <ul className="list-disc pl-5 text-navy-700 mb-6 space-y-2">
                  <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the platform</li>
                  <li><strong>Log Data:</strong> IP addresses, access times, error logs</li>
                  <li><strong>Cookies:</strong> Session management, preferences, analytics (with consent)</li>
                </ul>

                <h3 className="font-semibold text-navy-900 mb-3">Information We Do NOT Collect</h3>
                <ul className="list-disc pl-5 text-navy-700 space-y-2">
                  <li>Social Security numbers (unless explicitly required for specific legal forms)</li>
                  <li>Full credit card numbers (handled by Stripe)</li>
                  <li>Biometric data</li>
                  <li>Information from children under 18</li>
                </ul>
              </div>
            </section>

            <section id="use" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">4. How We Use Your Information</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">We use your information to:</p>
                <ul className="list-disc pl-5 text-navy-700 space-y-2">
                  <li>Provide AI-powered legal information and document generation services</li>
                  <li>Match you with appropriate legal aid resources or pro bono attorneys</li>
                  <li>Personalize your experience based on your jurisdiction and legal needs</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send service updates, security alerts, and (with consent) promotional content</li>
                  <li>Improve our services through aggregated, anonymized analytics</li>
                  <li>Comply with legal obligations and protect our legal rights</li>
                </ul>
              </div>
            </section>

            <section id="sharing" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">5. Information Sharing</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">We share your information only in these limited circumstances:</p>
                <ul className="list-disc pl-5 text-navy-700 space-y-2 mb-6">
                  <li><strong>With Your Consent:</strong> When you opt-in to lawyer matching or pro bono referrals</li>
                  <li><strong>Service Providers:</strong> Third parties who help us operate (hosting, payment processing, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions (with notice)</li>
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-navy-700 text-sm">
                      <strong>We Never Sell Your Personal Information.</strong> Your legal data is never sold to
                      advertisers, data brokers, or any third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="security" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">6. Data Security</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">We implement the following security measures:</p>
                <ul className="list-disc pl-5 text-navy-700 space-y-2">
                  <li><strong>Encryption:</strong> All data encrypted in transit (TLS 1.3) and at rest (AES-256) via our infrastructure provider</li>
                  <li><strong>Access Controls:</strong> Row Level Security and role-based access with multi-factor authentication via Supabase Auth</li>
                  <li><strong>Infrastructure:</strong> Hosted on Supabase (SOC 2 Type II certified managed cloud infrastructure)</li>
                  <li><strong>Monitoring:</strong> Activity audit logging and automated database backups</li>
                  <li><strong>Data Isolation:</strong> Row Level Security ensures users only access their authorized data</li>
                </ul>
                <p className="text-navy-700 mt-4">
                  Want more detail? See how we build security, the audits we hold, and how we handle incidents on our{' '}
                  <Link to="/enterprise-security" className="text-teal-600 hover:text-teal-800 font-medium">Enterprise Security</Link> page.
                </p>
              </div>
            </section>

            <section id="retention" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">7. Data Retention</h2>
              </div>
              <div className="pl-11">
                <ul className="list-disc pl-5 text-navy-700 space-y-2">
                  <li><strong>Chat History:</strong> Retained for 90 days by default (configurable in settings)</li>
                  <li><strong>Documents:</strong> Retained until you delete them or close your account</li>
                  <li><strong>Account Data:</strong> Retained while your account is active, plus 30 days after deletion</li>
                  <li><strong>Legal Requirements:</strong> Some data may be retained longer for legal compliance</li>
                </ul>
                <p className="text-navy-700 mt-4">
                  You can export or delete your data at any time through your account settings.
                </p>
              </div>
            </section>

            <section id="rights" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">8. Your Rights</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-5 text-navy-700 space-y-2 mb-6">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
                </ul>
                <p className="text-navy-700 mb-4">
                  To exercise these rights, contact us at{' '}
                  <a href="mailto:privacy@ezlegal.ai" className="text-teal-600 hover:text-teal-800">
                    privacy@ezlegal.ai
                  </a>{' '}
                  or use the settings in your <Link to="/dashboard/profile" className="text-teal-600 hover:text-teal-800">account dashboard</Link>. We respond to all requests within 30 days.
                </p>
                <p className="text-navy-700">
                  If you have a concern about how your data has been handled, you can submit a report through our{' '}
                  <Link to="/trust-center" className="text-teal-600 hover:text-teal-800 font-medium">Trust Center</Link>. For questions about how AI processes your data, see our{' '}
                  <Link to="/ai-governance" className="text-teal-600 hover:text-teal-800 font-medium">AI Governance Policy</Link>.
                </p>
              </div>
            </section>

            <section id="children" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">9. Children's Privacy</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly
                  collect personal information from children. If you believe we have collected information
                  from a child, please contact us immediately at{' '}
                  <a href="mailto:privacy@ezlegal.ai" className="text-teal-600 hover:text-teal-800">
                    privacy@ezlegal.ai
                  </a>.
                </p>
              </div>
            </section>

            <section id="international" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">10. International Users</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700">
                  ezLegal.ai™ primarily serves users in the United States. If you access our services from
                  outside the U.S., please be aware that your information may be transferred to and processed
                  in the United States, where data protection laws may differ from your jurisdiction.
                  By using our services, you consent to this transfer.
                </p>
              </div>
            </section>

            <section id="changes" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">11. Policy Changes</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700">
                  We may update this Privacy Policy periodically. We will notify you of material changes
                  via email and/or a prominent notice on our website. Your continued use of our services
                  after such notice constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section id="contact" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">12. Contact Us</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">
                  For privacy-related questions or to exercise your rights:
                </p>
                <div className="bg-navy-50 border border-navy-200 rounded-xl p-5">
                  <p className="text-navy-700 mb-2"><strong>ezLegal.ai™ Privacy Team</strong></p>
                  <p className="text-navy-700 mb-1">
                    Email:{' '}
                    <a href="mailto:privacy@ezlegal.ai" className="text-teal-600 hover:text-teal-800">
                      privacy@ezlegal.ai
                    </a>
                  </p>
                  <p className="text-navy-700 mb-4">
                    Address: 123 Legal Avenue, Suite 100, San Francisco, CA 94102
                  </p>
                  <p className="text-navy-700 text-sm">
                    We aim to respond to all privacy inquiries within 30 days.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-navy-200">
            <h3 className="font-bold text-navy-900 mb-4">Related Policies</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
              >
                <FileText className="w-4 h-4" />
                Terms of Service
              </Link>
              <Link
                to="/ai-governance"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
              >
                <Brain className="w-4 h-4" />
                AI Governance Policy
              </Link>
              <Link
                to="/trust-center"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
              >
                <Shield className="w-4 h-4" />
                Trust Center
              </Link>
              <Link
                to="/scope-disclaimers"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
              >
                <AlertTriangle className="w-4 h-4" />
                Scope & Disclaimers
              </Link>
              <Link
                to="/enterprise-security"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors font-medium"
              >
                <Lock className="w-4 h-4" />
                Enterprise Security
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
