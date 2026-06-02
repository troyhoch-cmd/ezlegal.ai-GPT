import { Shield, Brain, Eye, Users, Lock, Scale, AlertTriangle, CheckCircle, FileText, ShieldCheck, Heart, MapPin, Phone, MessageSquare, Clock, Download, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import AIMethodologySection from '../components/AIMethodologySection';
import JurisdictionCoverageTable from '../components/JurisdictionCoverageTable';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIGovernance() {
  const { language } = useLanguage();
  const en = language === 'en';
  const corePrinciples = [
    {
      icon: Scale,
      title: 'Access to Justice Mission',
      description: 'To democratize legal knowledge and empower individuals to understand and navigate their legal options. Our AI\'s performance is measured not just on technical accuracy but on its utility and comprehensibility for non-lawyers.',
    },
    {
      icon: Users,
      title: 'Human-Centricity & Oversight',
      description: 'A human remains ultimately responsible for legal outcomes. Our AI is an assistive tool. We implement mandatory "Human-in-the-Loop" review for high-risk categories and provide clear pathways for users to connect with human legal professionals.',
    },
    {
      icon: Eye,
      title: 'Transparency & Explainability',
      description: 'We are open about our AI\'s capabilities, limitations, and the sources of its information. All user interactions begin with a clear disclaimer that the user is speaking with an AI and not a lawyer.',
    },
    {
      icon: Shield,
      title: 'Fairness & Bias Mitigation',
      description: 'We proactively work to identify and mitigate discriminatory biases in our AI systems through regular bias audits, testing for disparate impact across protected classes, and dedicated feedback channels.',
    },
    {
      icon: Lock,
      title: 'Robustness & Safety',
      description: 'Our AI systems are reliable, secure, and perform consistently within their defined purpose. We implement continuous monitoring for model performance degradation and conduct "red teaming" exercises.',
    },
    {
      icon: Brain,
      title: 'Accountability & Governance',
      description: 'An AI Governance Board comprising legal, technical, compliance, and ethics experts is responsible for overseeing this policy, conducting risk assessments, and approving new AI use cases.',
    },
  ];

  const securityControls = [
    {
      title: 'Infrastructure Security',
      description: 'Our AI systems are hosted on Supabase (SOC 2 Type II certified) infrastructure, using OpenAI API models with contractual data processing protections.',
    },
    {
      title: 'Input/Output Security',
      description: 'We implement rigorous input sanitization to protect against prompt injection attacks. Outputs are scanned for potential security risks before delivery.',
    },
    {
      title: 'Data Encryption & Access',
      description: 'All data, in transit and at rest, is encrypted. We adhere to the principle of least privilege for access to AI systems, training data, and user data.',
    },
    {
      title: 'Incident Response',
      description: 'A defined AI security incident response plan addresses breaches, model compromises, or critical failures, including notification procedures if user data is affected.',
    },
  ];

  const dataHandlingPractices = [
    {
      title: 'Primary Use',
      description: 'To provide and personalize the AI-powered legal information services you request.',
    },
    {
      title: 'Service Improvement',
      description: 'We use enterprise-tier AI services that contractually prohibit using your data to train or improve their general models. Your legal data remains yours.',
    },
    {
      title: 'Compliance & Safety',
      description: 'To comply with laws, enforce our terms, and maintain the safety and security of our services.',
    },
    {
      title: 'Data Sharing',
      description: 'We do not sell your data. We only share it with trusted service providers bound by strict data processing agreements.',
    },
  ];

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">{en ? 'Ethical AI Framework' : 'Marco Ético de IA'}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              {en ? 'AI Governance, Ethics & Access' : 'Gobernanza, Ética y Acceso de IA'}
            </h1>
            <p className="text-xl text-navy-200 mb-4">
              {en
                ? 'Our AI is designed to empower, not replace, human legal judgment. We are committed to the ethical development and deployment of AI that expands access to justice.'
                : 'Nuestra IA está diseñada para empoderar, no reemplazar, el juicio legal humano. Estamos comprometidos con el desarrollo ético de IA que expande el acceso a la justicia.'}
            </p>
            <p className="text-navy-300">
              Designed with awareness of EU AI Act, Colorado AI Act, and evolving AI regulatory frameworks.
              Our platform currently serves users in the United States; regulatory alignment is assessed on an ongoing basis as frameworks mature and our geographic scope expands.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Core Principles & Implementation</h2>
            <p className="text-navy-600 max-w-2xl mx-auto">
              Our governance framework is built on six foundational principles that guide every aspect of our AI development and deployment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {corePrinciples.map((principle, index) => (
              <div key={index} className="bg-navy-50 rounded-2xl p-6 border border-navy-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <principle.icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{principle.title}</h3>
                <p className="text-navy-600 text-sm">{principle.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-navy-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Flag className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">See something wrong? Report it.</h3>
                <p className="text-navy-300 text-sm">
                  If our AI produces inaccurate, biased, or harmful output, we want to know. Reports are reviewed within 24 hours and you will receive a response.
                </p>
              </div>
            </div>
            <Link
              to="/trust-center#report"
              className="inline-flex items-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-rose-700 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Flag className="w-4 h-4" />
              Report a Concern
            </Link>
          </div>
        </div>
      </section>

      <AIMethodologySection />

      <JurisdictionCoverageTable />

      <section id="ethics" className="py-16 bg-white border-t border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-rose-100 px-4 py-2 rounded-full mb-4">
              <Scale className="w-4 h-4 text-rose-600" />
              <span className="text-sm font-semibold text-rose-900">Ethics</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Ethical AI Principles</h2>
            <p className="text-navy-600">
              We are committed to developing and deploying AI systems that uphold the highest ethical standards, prioritize human dignity, and promote fairness for all users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-rose-600" />
                Beneficence & Non-Maleficence
              </h3>
              <p className="text-navy-600 text-sm">
                Our AI is designed to help people and, above all, to do no harm. We continuously assess the potential impact of our systems on individuals and society.
              </p>
            </div>

            <div className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-rose-600" />
                Autonomy & Informed Consent
              </h3>
              <p className="text-navy-600 text-sm">
                We respect user autonomy by ensuring individuals understand they're interacting with AI, what data is collected, and how it's used. Users maintain control over their interactions.
              </p>
            </div>

            <div className="bg-navy-50 rounded-2xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-rose-600" />
                Justice & Fairness
              </h3>
              <p className="text-navy-600 text-sm">
                We work to ensure our AI treats all individuals fairly, regardless of protected characteristics, and actively monitor for and mitigate bias in our systems.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl p-8 border border-rose-100">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Our Ethical Commitment</h3>
            <ul className="space-y-3 text-navy-700">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>We prioritize transparency in our AI decision-making processes and limitations</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>We maintain human oversight for all high-stakes legal information delivery</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>We conduct regular ethical audits and impact assessments of our AI systems</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <span>We provide clear channels for reporting ethical concerns and respond promptly</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="access" className="py-16 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-900">Access to Justice</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-4">Expanding Access to Justice</h2>
            <p className="text-navy-600">
              Our mission is to democratize legal knowledge and bridge the justice gap by making legal information accessible, understandable, and actionable for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-navy-200 shadow-sm">
              <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-green-600" />
                Addressing the Justice Gap
              </h3>
              <p className="text-navy-600 mb-6">
                Over 70% of low-income Americans face legal issues without representation. Our AI-powered platform helps bridge this gap by providing accessible legal information and connecting people with attorneys when professional representation is needed.
              </p>
              <ul className="space-y-3 text-navy-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Free tier access for basic legal information and guidance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Pro bono lawyer matching for qualifying individuals</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Plain language explanations accessible to non-lawyers</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-navy-200 shadow-sm">
              <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-green-600" />
                Inclusive by Design
              </h3>
              <p className="text-navy-600 mb-6">
                We design our platform to be accessible and usable by people of all backgrounds, abilities, and technical proficiency levels.
              </p>
              <ul className="space-y-3 text-navy-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Multilingual support for diverse communities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>WCAG 2.1 AA accessibility compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Mobile-first design for users without desktop access</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Partnership with legal aid organizations nationwide</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border border-green-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Our Access to Justice Commitment</h3>
                <p className="text-navy-700 mb-4">
                  We measure our success not just by revenue, but by the number of people we help understand their legal rights and navigate the justice system. Every feature we build, every decision we make, is guided by the question: "Does this expand access to justice?"
                </p>
                <Link
                  to="/pro-bono"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  Learn About Our Pro Bono Program
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="in-practice" className="py-16 bg-white border-t border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-semibold text-teal-900">In Practice</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-4">How We Implement These Principles</h2>
            <p className="text-navy-600">
              Our governance commitments are not just words on a page. Here's how they are built into every user interaction on our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-navy-900">Jurisdiction Checks</h3>
              </div>
              <p className="text-navy-600 text-sm mb-3">
                Before providing legal information, we ask for your location to provide jurisdiction-specific guidance. Laws vary significantly between states.
              </p>
              <Link to="/chat" className="text-teal-600 text-sm font-semibold hover:underline">
                See in AI Chat
              </Link>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-bold text-navy-900">Crisis Escalation</h3>
              </div>
              <p className="text-navy-600 text-sm mb-3">
                Our AI detects crisis keywords and immediately surfaces hotlines and emergency resources for domestic violence, self-harm, and other emergencies.
              </p>
              <Link to="/emergency-resources" className="text-teal-600 text-sm font-semibold hover:underline">
                See Crisis Resources
              </Link>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-navy-900">Human Handoff</h3>
              </div>
              <p className="text-navy-600 text-sm mb-3">
                Persistent buttons let users connect to legal aid, find an attorney, or download a transcript to share with a lawyer at any point.
              </p>
              <Link to="/pro-bono" className="text-teal-600 text-sm font-semibold hover:underline">
                See Pro Bono Intake
              </Link>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-navy-900">Citation & Recency</h3>
              </div>
              <p className="text-navy-600 text-sm mb-3">
                AI responses include legal references, jurisdiction context, and "last updated" timestamps. We clearly indicate when information may be uncertain.
              </p>
              <Link to="/chat" className="text-teal-600 text-sm font-semibold hover:underline">
                See in AI Chat
              </Link>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-navy-900">Informed Consent</h3>
              </div>
              <p className="text-navy-600 text-sm mb-3">
                A consent checkpoint appears before chat, explaining AI limitations, confirming understanding, and warning against sharing sensitive identifiers.
              </p>
              <Link to="/chat" className="text-teal-600 text-sm font-semibold hover:underline">
                See Safety Checkpoint
              </Link>
            </div>

            <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                  <Flag className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-bold text-navy-900">Report Concerns</h3>
              </div>
              <p className="text-navy-600 text-sm mb-3">
                Users can report inaccurate information, bias concerns, or safety issues through our Trust & Safety menu. Reports are reviewed within 24 hours.
              </p>
              <Link to="/trust-center#report" className="text-teal-600 text-sm font-semibold hover:underline">
                See Trust Center
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-teal-50 to-navy-50 rounded-2xl p-8 border border-teal-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Transparency in Action</h3>
                <p className="text-navy-700 mb-4">
                  Every user can download their complete chat transcript, export their data, and request deletion at any time.
                  We maintain audit logs of AI interactions for accountability and continuous improvement.
                </p>
                <Link
                  to="/trust-center"
                  className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Visit Our Trust Center
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">AI Security Policy</h2>
              </div>
              <p className="text-navy-600 mb-8">
                We protect the integrity, confidentiality, and availability of our AI systems, models, and data against unauthorized access, manipulation, or attack.
              </p>
              <div className="space-y-4">
                {securityControls.map((control, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-navy-200">
                    <h4 className="font-semibold text-navy-900 mb-1">{control.title}</h4>
                    <p className="text-navy-600 text-sm">{control.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-navy-900">Privacy for AI Services</h2>
              </div>
              <p className="text-navy-600 mb-8">
                We are transparent about how we use your data to provide our AI-powered services while respecting user privacy and complying with global data protection laws.
              </p>
              <div className="space-y-4">
                {dataHandlingPractices.map((practice, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-navy-200">
                    <h4 className="font-semibold text-navy-900 mb-1">{practice.title}</h4>
                    <p className="text-navy-600 text-sm">{practice.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal-50 to-navy-50 rounded-3xl p-8 lg:p-12 border border-teal-100">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-2">Terms & Disclaimers</h2>
                <p className="text-navy-600">Important information about the nature of our AI services</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  No Legal Advice
                </h3>
                <p className="text-navy-600 text-sm">
                  The services provided by our AI are for informational and educational purposes only. The AI is not a licensed attorney. Your use does not create an attorney-client relationship. The information provided is not legal advice.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  No Guarantee of Accuracy
                </h3>
                <p className="text-navy-600 text-sm">
                  While we strive for accuracy, we do not guarantee that the AI's outputs are error-free, complete, or up-to-date. You are solely responsible for any actions you take based on the AI's output.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  Acknowledgement of AI Risks
                </h3>
                <p className="text-navy-600 text-sm">
                  You acknowledge that AI systems can sometimes produce inaccurate, biased, or otherwise harmful content. You expressly assume these risks when using our services.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200">
                <h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  Your Rights
                </h3>
                <p className="text-navy-600 text-sm">
                  You have the right to access, correct, delete, and export your personal data. You can object to or restrict certain processing. Your data is retained only as necessary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="regulatory" className="py-16 bg-navy-50 border-t border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">Regulatory Compliance</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-4">EU AI Act & Global Compliance</h2>
            <p className="text-navy-600">
              We proactively align with the EU AI Act, NIST AI Risk Management Framework, ISO/IEC 42001, and Colorado AI Act to meet the highest global standards for responsible AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-3">EU AI Act Classification</h3>
              <p className="text-sm text-navy-600 mb-3">
                ezLegal.ai is classified as a <strong>Limited-Risk AI System</strong> under Article 52 of the EU AI Act. We provide legal information, not automated decision-making affecting legal rights.
              </p>
              <ul className="space-y-2 text-sm text-navy-600">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Users informed they are interacting with AI (Art. 52(1))</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> No automated decisions about legal rights or benefits</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Technical documentation maintained (Art. 11)</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Transparency obligations met (Art. 13)</li>
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-navy-200">
              <h3 className="font-bold text-navy-900 mb-3">Right to Human Decision</h3>
              <p className="text-sm text-navy-600 mb-3">
                Every user has the <strong>unconditional right</strong> to reject AI-generated information and request connection to a human attorney at any point. This right:
              </p>
              <ul className="space-y-2 text-sm text-navy-600">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Cannot be waived through terms of service</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Available regardless of payment tier (free includes pro bono)</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> Accessible via persistent "Talk to Human" controls in every session</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" /> No AI gating, friction, or discouragement when exercised</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-navy-200">
            <h3 className="font-bold text-navy-900 mb-4">Transparency Documentation</h3>
            <p className="text-sm text-navy-600 mb-4">We publish comprehensive documentation exceeding regulatory requirements. No other consumer legal AI product makes this information publicly available.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/ai-model-card" className="group bg-navy-50 rounded-xl p-4 border border-navy-200 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <Brain className="w-6 h-6 text-teal-600 mb-2" />
                <h4 className="font-semibold text-navy-900 text-sm group-hover:text-teal-700">AI Model Card</h4>
                <p className="text-xs text-navy-500 mt-1">Complete model documentation per ISO/IEC 42001</p>
              </Link>
              <Link to="/algorithmic-impact-assessment" className="group bg-navy-50 rounded-xl p-4 border border-navy-200 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <Users className="w-6 h-6 text-teal-600 mb-2" />
                <h4 className="font-semibold text-navy-900 text-sm group-hover:text-teal-700">Impact Assessment</h4>
                <p className="text-xs text-navy-500 mt-1">Impact on vulnerable populations documented</p>
              </Link>
              <Link to="/bias-monitoring" className="group bg-navy-50 rounded-xl p-4 border border-navy-200 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <Scale className="w-6 h-6 text-teal-600 mb-2" />
                <h4 className="font-semibold text-navy-900 text-sm group-hover:text-teal-700">Bias Monitoring</h4>
                <p className="text-xs text-navy-500 mt-1">Public fairness testing results updated quarterly</p>
              </Link>
              <Link to="/scope-disclaimers" className="group bg-navy-50 rounded-xl p-4 border border-navy-200 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <AlertTriangle className="w-6 h-6 text-teal-600 mb-2" />
                <h4 className="font-semibold text-navy-900 text-sm group-hover:text-teal-700">Scope & Limitations</h4>
                <p className="text-xs text-navy-500 mt-1">Clear boundaries of what AI can and cannot do</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Risk Mitigation & Compliance</h2>
          <p className="text-navy-200 mb-8 max-w-2xl mx-auto">
            Our policies cover the big risks. We guard against fake AI claims. We keep our tools clear of giving legal advice. We track bias in our models. We watch new AI rules as they roll out.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/privacy"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
            >
              View Privacy Policy
            </Link>
            <Link
              to="/ai-model-card"
              className="bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors"
            >
              View AI Model Card
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
