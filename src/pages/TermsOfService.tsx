import { Shield, FileText, Users, Scale, AlertTriangle, CheckCircle, Brain, Lock, CreditCard, Clock, XCircle, Mail, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function TermsOfService() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <FileText className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">{en ? 'Legal Agreement' : 'Acuerdo Legal'}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {en ? 'Terms of Service' : 'Términos de Servicio'}
            </h1>
            <p className="text-xl text-navy-200 mb-4">
              {en
                ? 'Please read these terms carefully before using ezLegal.ai services. By using our platform, you agree to be bound by these terms.'
                : 'Lee estos términos cuidadosamente antes de usar los servicios de ezLegal.ai. Al usar nuestra plataforma, aceptas estos términos.'}
            </p>
            <p className="text-navy-300">
              {en ? 'Last Updated: January 15, 2026 | Effective Date: January 15, 2026' : 'Última actualización: 15 de enero, 2026 | Fecha efectiva: 15 de enero, 2026'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white border-b border-navy-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-navy-900 mb-2">Important Notice</h3>
                <p className="text-navy-700 text-sm">
                  ezLegal.ai provides AI-powered legal information and tools for educational and informational purposes only.
                  We are NOT a law firm and do NOT provide legal advice. The information provided through our services does not
                  create an attorney-client relationship. For specific legal advice, please consult a licensed attorney in your jurisdiction.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="bg-navy-50 rounded-xl p-6 border border-navy-200 mb-12">
            <h2 className="text-lg font-bold text-navy-900 mb-4">Table of Contents</h2>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#acceptance" className="text-teal-600 hover:text-teal-800">1. Acceptance of Terms</a>
              <a href="#definitions" className="text-teal-600 hover:text-teal-800">2. Definitions</a>
              <a href="#services" className="text-teal-600 hover:text-teal-800">3. Description of Services</a>
              <a href="#ai-services" className="text-teal-600 hover:text-teal-800">4. AI-Powered Services</a>
              <a href="#accounts" className="text-teal-600 hover:text-teal-800">5. User Accounts</a>
              <a href="#subscriptions" className="text-teal-600 hover:text-teal-800">6. Subscriptions & Payment</a>
              <a href="#user-conduct" className="text-teal-600 hover:text-teal-800">7. User Conduct</a>
              <a href="#intellectual-property" className="text-teal-600 hover:text-teal-800">8. Intellectual Property</a>
              <a href="#disclaimers" className="text-teal-600 hover:text-teal-800">9. Disclaimers</a>
              <a href="#limitation" className="text-teal-600 hover:text-teal-800">10. Limitation of Liability</a>
              <a href="#indemnification" className="text-teal-600 hover:text-teal-800">11. Indemnification</a>
              <a href="#termination" className="text-teal-600 hover:text-teal-800">12. Termination</a>
              <a href="#disputes" className="text-teal-600 hover:text-teal-800">13. Dispute Resolution</a>
              <a href="#general" className="text-teal-600 hover:text-teal-800">14. General Provisions</a>
              <a href="#contact" className="text-teal-600 hover:text-teal-800">15. Contact Information</a>
            </div>
          </nav>

          <div className="max-w-none">
            <section id="acceptance" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">1. Acceptance of Terms</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-4">
                  By accessing or using the ezLegal.ai website at https://ezlegal.ai (the "Website") and any related services,
                  applications, or features (collectively, the "Services"), you ("User," "you," or "your") agree to be bound by
                  these Terms of Service ("Terms"), our Privacy Policy, and our AI Governance, Ethics & Access Policy.
                </p>
                <p className="text-navy-700 mb-4">
                  If you do not agree to these Terms, you must not access or use our Services. Your continued use of the Services
                  after any modifications to these Terms constitutes your acceptance of such modifications.
                </p>
                <p className="text-navy-700">
                  You must be at least 18 years of age or the age of majority in your jurisdiction to use our Services.
                  By using our Services, you represent and warrant that you meet these eligibility requirements.
                </p>
              </div>
            </section>

            <section id="definitions" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">2. Definitions</h2>
              </div>
              <div className="pl-11">
                <ul className="space-y-3 text-navy-700">
                  <li><strong>"Company," "we," "us," or "our"</strong> refers to ezLegal.ai, Inc. and its parent company LegalBreeze, Inc.</li>
                  <li><strong>"Services"</strong> refers to all products, features, applications, and content provided through our platform, including AI-powered legal assistance, document generation, legal research tools, and attorney matching.</li>
                  <li><strong>"User Content"</strong> refers to any information, data, text, documents, or materials that you submit, upload, or transmit through our Services.</li>
                  <li><strong>"AI Output"</strong> refers to any response, document, analysis, or content generated by our artificial intelligence systems.</li>
                  <li><strong>"Subscription"</strong> refers to paid access plans that provide enhanced features and capabilities.</li>
                  <li><strong>"Legal Service Organization (LSO)"</strong> refers to legal aid organizations, pro bono networks, and nonprofit legal service providers that use our enterprise services.</li>
                </ul>
              </div>
            </section>

            <section id="services" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">3. Description of Services</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">3.1 What We Provide</h3>
                <p className="text-navy-700 mb-4">
                  ezLegal.ai is an AI-powered platform designed to expand access to justice by providing:
                </p>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>AI-powered legal information and guidance</li>
                  <li>Document generation and legal form assistance</li>
                  <li>Legal research tools and resources</li>
                  <li>Attorney matching and referral services</li>
                  <li>Educational legal content and guides</li>
                  <li>Pro bono intake and eligibility screening</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">3.2 What We Do NOT Provide</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <ul className="space-y-2 text-navy-700">
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Legal advice or legal representation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Attorney-client relationships</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Guaranteed legal outcomes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <span>Representation in court or legal proceedings</span>
                    </li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">3.3 Service Availability</h3>
                <p className="text-navy-700">
                  We strive to maintain 24/7 availability of our Services but do not guarantee uninterrupted access.
                  We may modify, suspend, or discontinue any aspect of our Services at any time with reasonable notice.
                </p>
              </div>
            </section>

            <section id="ai-services" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">4. AI-Powered Services</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">4.1 Nature of AI Services</h3>
                <p className="text-navy-700 mb-4">
                  Our Services use AI, which includes large language models and machine learning. The AI gives legal information and drafts documents. By using the Services, you agree that:
                </p>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>AI Output is generated by automated systems and may contain errors, inaccuracies, or omissions</li>
                  <li>AI Output should not be relied upon as a substitute for professional legal advice</li>
                  <li>You are solely responsible for verifying the accuracy and appropriateness of any AI Output</li>
                  <li>AI systems may produce different results for similar queries</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">4.2 AI Governance Commitment</h3>
                <p className="text-navy-700 mb-4">
                  We are committed to ethical AI development and deployment as outlined in our
                  <Link to="/ai-governance" className="text-teal-600 hover:text-teal-800"> AI Governance, Ethics & Access Policy</Link>.
                  Our AI systems are designed to:
                </p>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>Provide clear disclaimers when you are interacting with AI</li>
                  <li>Avoid generating content that is discriminatory or biased</li>
                  <li>Recommend human legal professionals for complex or high-stakes matters</li>
                  <li>Protect your data with enterprise-grade security</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">4.3 AI Output Ownership</h3>
                <p className="text-navy-700 mb-4">
                  Subject to your compliance with these Terms, you own the AI Output generated specifically for you through our Services.
                  However, due to the nature of AI systems, similar or identical outputs may be generated for other users.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">4.4 Data Usage</h3>
                <p className="text-navy-700">
                  We use enterprise-tier AI services that contractually prohibit using your data to train or improve general AI models.
                  Your legal data remains yours. See our <Link to="/privacy" className="text-teal-600 hover:text-teal-800">Privacy Policy</Link> for details.
                </p>
              </div>
            </section>

            <section id="accounts" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">5. User Accounts</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">5.1 Account Registration</h3>
                <p className="text-navy-700 mb-4">
                  Certain features require you to create an account. You agree to provide accurate, current, and complete
                  registration information and to update such information to keep it accurate, current, and complete.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">5.2 Account Security</h3>
                <p className="text-navy-700 mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities
                  that occur under your account. You agree to:
                </p>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>Create a strong, unique password</li>
                  <li>Not share your account credentials with others</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Log out of your account on shared devices</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">5.3 Account Types</h3>
                <p className="text-navy-700">
                  We offer individual consumer accounts and organizational accounts for Legal Service Organizations.
                  Each account type has specific terms and features as described on our pricing page.
                </p>
              </div>
            </section>

            <section id="subscriptions" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">6. Subscriptions & Payment</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">6.1 Subscription Plans</h3>
                <p className="text-navy-700 mb-4">We offer the following service tiers:</p>
                <div className="bg-navy-50 rounded-xl p-4 mb-6">
                  <ul className="space-y-3 text-navy-700">
                    <li><strong>Free Tier:</strong> Unlimited AI questions, basic legal guides, attorney directory access</li>
                    <li><strong>Issue Packs ($29-$49 one-time):</strong> Detailed action plans, document templates, deadline checklists</li>
                    <li><strong>Business Plans (from $29/month):</strong> Team access, branded portal, compliance monitoring</li>
                    <li><strong>Organization Plans (from $79/month):</strong> For Legal Service Organizations with grant reporting and custom features</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">6.2 Billing and Payment</h3>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>Paid subscriptions are billed in advance on a monthly basis</li>
                  <li>Payment is processed through secure third-party processors (Stripe)</li>
                  <li>You authorize us to charge your payment method on a recurring basis</li>
                  <li>All fees are non-refundable except as required by law or our refund policy</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">6.3 Free Trial & Money-Back Guarantee</h3>
                <p className="text-navy-700 mb-4">
                  We offer a free trial period for new users and a 30-day money-back guarantee for paid subscriptions.
                  If you are not satisfied, contact us within 30 days of your first payment for a full refund.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">6.4 Cancellation</h3>
                <p className="text-navy-700 mb-4">
                  You may cancel your subscription at any time through your account settings. Cancellation takes effect at the
                  end of your current billing period. You will retain access to paid features until then.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">6.5 Price Changes</h3>
                <p className="text-navy-700">
                  We may change subscription prices with at least 30 days' notice. Price changes will take effect at your
                  next billing cycle after the notice period.
                </p>
              </div>
            </section>

            <section id="user-conduct" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">7. User Conduct</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">7.1 Acceptable Use</h3>
                <p className="text-navy-700 mb-4">You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>Use our Services for any illegal purpose or to violate any laws</li>
                  <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                  <li>Interfere with or disrupt the integrity or performance of our Services</li>
                  <li>Transmit any malware, viruses, or harmful code</li>
                  <li>Attempt to reverse engineer, decompile, or extract source code from our AI systems</li>
                  <li>Use automated systems to access our Services without permission</li>
                  <li>Resell, redistribute, or sublicense our Services without authorization</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">7.2 User Content Responsibilities</h3>
                <p className="text-navy-700 mb-4">
                  You are solely responsible for User Content you submit. By submitting User Content, you represent and warrant that:
                </p>
                <ul className="space-y-2 text-navy-700 mb-6">
                  <li>You have the right to submit such content</li>
                  <li>The content is accurate and not misleading</li>
                  <li>The content does not violate any third-party rights</li>
                  <li>The content does not contain illegal, defamatory, or harmful material</li>
                </ul>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">7.3 Prohibited Content</h3>
                <p className="text-navy-700">
                  You may not use our Services to generate, store, or transmit content that is fraudulent, deceptive,
                  discriminatory, harassing, threatening, or that promotes illegal activities.
                </p>
              </div>
            </section>

            <section id="intellectual-property" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">8. Intellectual Property</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">8.1 Our Intellectual Property</h3>
                <p className="text-navy-700 mb-4">
                  The Services, including all content, features, functionality, software, AI models, and underlying technology,
                  are owned by ezLegal.ai and LegalBreeze, Inc. and are protected by intellectual property laws. Our trademarks,
                  logos, and service marks may not be used without our prior written consent.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">8.2 Limited License</h3>
                <p className="text-navy-700 mb-4">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to access and use our Services
                  for your personal or internal business purposes in accordance with these Terms.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">8.3 Your Content</h3>
                <p className="text-navy-700 mb-4">
                  You retain ownership of User Content you submit. By submitting User Content, you grant us a limited license
                  to use, process, and store such content solely to provide and improve our Services to you.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">8.4 Feedback</h3>
                <p className="text-navy-700">
                  Any feedback, suggestions, or ideas you provide about our Services may be used by us without restriction
                  or compensation to you.
                </p>
              </div>
            </section>

            <section id="disclaimers" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">9. Disclaimers</h2>
              </div>
              <div className="pl-11">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-bold text-navy-900 mb-3">9.1 No Legal Advice</h3>
                  <p className="text-navy-700 font-medium">
                    THE INFORMATION PROVIDED THROUGH OUR SERVICES IS FOR INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.
                    EZLEGAL.AI IS NOT A LAW FIRM AND DOES NOT PROVIDE LEGAL ADVICE. OUR AI SYSTEMS ARE NOT LICENSED ATTORNEYS.
                    YOUR USE OF OUR SERVICES DOES NOT CREATE AN ATTORNEY-CLIENT RELATIONSHIP BETWEEN YOU AND EZLEGAL.AI.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">9.2 No Guarantee of Accuracy</h3>
                <p className="text-navy-700 mb-4">
                  While we strive for accuracy, we do not guarantee that AI Output or any information provided through our
                  Services is complete, accurate, current, or error-free. Laws and regulations vary by jurisdiction and
                  change frequently. You are solely responsible for verifying any information before relying on it.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">9.3 As-Is Basis</h3>
                <p className="text-navy-700 mb-4 uppercase font-medium">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
                  INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE,
                  AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">9.4 Third-Party Services</h3>
                <p className="text-navy-700">
                  Our Services may integrate with or link to third-party services. We are not responsible for the content,
                  accuracy, or practices of any third-party services.
                </p>
              </div>
            </section>

            <section id="limitation" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">10. Limitation of Liability</h2>
              </div>
              <div className="pl-11">
                <div className="bg-navy-100 border border-navy-300 rounded-xl p-6 mb-6">
                  <p className="text-navy-700 font-medium uppercase text-sm">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, EZLEGAL.AI, ITS PARENT COMPANY LEGALBREEZE, INC., AND THEIR
                    RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS,
                    DATA, USE, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OUR SERVICES, WHETHER BASED ON
                    WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY.
                  </p>
                </div>
                <p className="text-navy-700 mb-4">
                  OUR TOTAL LIABILITY TO YOU WILL NEVER BE MORE THAN THE GREATER OF: (A) $100 USD, OR (B) THE TOTAL YOU PAID US IN THE LAST TWELVE (12) MONTHS. THIS CAP COVERS ALL CLAIMS TIED TO THESE TERMS OR YOUR USE OF THE SERVICES.
                </p>
                <p className="text-navy-700">
                  Some states or countries do not allow these limits. If yours is one of them, our limit is the most the law in your area allows.
                </p>
              </div>
            </section>

            <section id="indemnification" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">11. Indemnification</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700">
                  You agree to indemnify, defend, and hold harmless ezLegal.ai, LegalBreeze, Inc., and their respective
                  officers, directors, employees, agents, and affiliates from and against any claims, damages, losses,
                  liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
                  (a) your use of our Services; (b) your User Content; (c) your violation of these Terms; (d) your violation
                  of any third-party rights; or (e) your violation of any applicable law.
                </p>
              </div>
            </section>

            <section id="termination" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">12. Termination</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">12.1 Termination by You</h3>
                <p className="text-navy-700 mb-4">
                  You may terminate your account at any time by contacting us or using the account closure feature in your settings.
                  Upon termination, your right to use our Services will immediately cease.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">12.2 Termination by Us</h3>
                <p className="text-navy-700 mb-4">
                  We may suspend or terminate your access to our Services at any time, with or without cause, including if we
                  reasonably believe you have violated these Terms. We will provide notice when practicable.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">12.3 Effect of Termination</h3>
                <p className="text-navy-700 mb-4">
                  Upon termination, you will no longer have access to your account or any data stored therein.
                  We may delete your data in accordance with our Privacy Policy. Provisions that by their nature
                  should survive termination shall survive, including Sections 8-11, 13, and 14.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">12.4 Data Export</h3>
                <p className="text-navy-700">
                  Prior to termination, you may request an export of your data. Contact us at privacy@ezlegal.ai to request
                  your data within 30 days of account closure.
                </p>
              </div>
            </section>

            <section id="disputes" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">13. Dispute Resolution</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">13.1 Governing Law</h3>
                <p className="text-navy-700 mb-4">
                  These Terms and any disputes arising hereunder shall be governed by and construed in accordance with the
                  laws of the State of Arizona, without regard to its conflict of law provisions.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">13.2 Informal Resolution</h3>
                <p className="text-navy-700 mb-4">
                  Before initiating any formal dispute resolution, you agree to contact us at legal@ezlegal.ai to attempt
                  to resolve any dispute informally. We will attempt to resolve disputes within 45 days of receipt of notice.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">13.3 Arbitration</h3>
                <p className="text-navy-700 mb-4">
                  If informal resolution fails, any dispute shall be resolved by binding arbitration in accordance with
                  JAMS Comprehensive Arbitration Rules. Arbitration shall be conducted in Pima County, Arizona, or via
                  video conference at your option.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">13.4 Class Action Waiver</h3>
                <p className="text-navy-700 mb-4 font-medium">
                  YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT
                  IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">13.5 Exceptions</h3>
                <p className="text-navy-700">
                  Either party may seek injunctive or other equitable relief in any court of competent jurisdiction to
                  prevent the actual or threatened infringement of intellectual property rights.
                </p>
              </div>
            </section>

            <section id="general" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">14. General Provisions</h2>
              </div>
              <div className="pl-11">
                <h3 className="text-lg font-semibold text-navy-900 mb-3">14.1 Entire Agreement</h3>
                <p className="text-navy-700 mb-4">
                  These Terms, together with our Privacy Policy and AI Governance Policy, constitute the entire agreement
                  between you and ezLegal.ai regarding your use of our Services.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">14.2 Severability</h3>
                <p className="text-navy-700 mb-4">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue
                  in full force and effect.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">14.3 Waiver</h3>
                <p className="text-navy-700 mb-4">
                  Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such
                  right or provision.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">14.4 Assignment</h3>
                <p className="text-navy-700 mb-4">
                  You may not assign or transfer these Terms without our prior written consent. We may assign these Terms
                  without restriction.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">14.5 Modifications</h3>
                <p className="text-navy-700 mb-4">
                  We reserve the right to modify these Terms at any time. Material changes will be communicated via email
                  or prominent notice on our website at least 30 days before taking effect.
                </p>

                <h3 className="text-lg font-semibold text-navy-900 mb-3">14.6 Force Majeure</h3>
                <p className="text-navy-700">
                  We are not liable if events outside our control stop or slow our work. These events include natural disasters, war, riots, embargoes, government acts, or outages at outside services we rely on.
                </p>
              </div>
            </section>

            <section id="contact" className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900 m-0">15. Contact Information</h2>
              </div>
              <div className="pl-11">
                <p className="text-navy-700 mb-6">
                  If you have questions about these Terms, please contact us:
                </p>
                <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                  <div className="flex items-start gap-4 mb-4">
                    <Building className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-navy-900">ezLegal.ai<sup className="text-[8px]">TM</sup></p>
                      <p className="text-navy-600">A <span className="text-navy-800">Legalbre</span><span className="text-teal-500">ez</span><span className="text-navy-800">e</span><sup className="text-[8px] text-navy-500">TM</sup> Company</p>
                      <p className="text-navy-600">177 N. Church Ave., Suite 808</p>
                      <p className="text-navy-600">Tucson, AZ 85701</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <Mail className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-navy-700">Legal Inquiries: <a href="mailto:legal@ezlegal.ai" className="text-teal-600 hover:text-teal-800">legal@ezlegal.ai</a></p>
                      <p className="text-navy-700">Privacy Inquiries: <a href="mailto:privacy@ezlegal.ai" className="text-teal-600 hover:text-teal-800">privacy@ezlegal.ai</a></p>
                      <p className="text-navy-700">General Support: <a href="mailto:support@legalbreeze.com" className="text-teal-600 hover:text-teal-800">support@legalbreeze.com</a></p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Related Policies</h2>
          <p className="text-navy-200 mb-8">
            These Terms work together with our other policies to protect your rights and outline our commitments.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/privacy"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/ai-governance"
              className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              AI Governance, Ethics & Access
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
