import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Briefcase,
  FileText,
  Search,
  UserPlus,
  Shield,
  CheckCircle,
  ArrowRight,
  Brain,
  Database,
  Lock,
  BarChart3,
  Globe,
  Workflow,
  DollarSign,
  Star,
  BookOpen,
  AlertTriangle,
  Scale,
  HelpCircle,
  FileCheck,
  Users
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const journeySteps = [
  { icon: HelpCircle, label: 'Ask Your Question', description: 'Describe your situation in plain language' },
  { icon: Scale, label: 'Get Clear Answers', description: 'Citation-backed, jurisdiction-aware guidance' },
  { icon: FileCheck, label: 'Build Your Action Plan', description: 'Documents, timelines, and next steps' },
  { icon: Users, label: 'Connect If Needed', description: 'Lawyer referrals for complex matters' }
];

const coreFeatures = [
  {
    icon: MessageSquare,
    title: 'AI Legal Assistant',
    description: 'Get instant answers to your legal questions with our ezLegal.ai Chatbot trained on legal documentation and case law.',
    benefits: ['24/7 availability', 'Plain English explanations', 'All 50 U.S. states + territories']
  },
  {
    icon: BookOpen,
    title: 'Citation-Backed Answers',
    description: 'Every response references specific statutes, regulations, and case law so you can verify the information yourself.',
    benefits: ['Linked statute references', 'Case law citations', 'Source transparency'],
    highlight: true
  },
  {
    icon: AlertTriangle,
    title: 'Safety Screening & Escalation',
    description: 'Built-in safety checks detect crisis situations, flag high-risk matters, and connect you with emergency resources or a licensed attorney.',
    benefits: ['Crisis detection & resources', 'High-risk matter flagging', 'Human escalation pathways'],
    highlight: true
  },
  {
    icon: Shield,
    title: 'Jurisdiction-Aware Guidance',
    description: 'Responses are tailored to your specific state and local laws. The system confirms your jurisdiction before providing guidance.',
    benefits: ['State-specific statutes', 'Jurisdiction confirmation step', 'Local court information'],
    highlight: true
  },
  {
    icon: Briefcase,
    title: 'Case Tracking',
    description: 'Keep track of your legal matters in one place with simple workflows and automated reminders.',
    benefits: ['Deadline tracking', 'Priority management', 'Document organization']
  },
  {
    icon: FileText,
    title: 'Document Generation',
    description: 'Create legal documents quickly using AI-powered templates designed for common situations.',
    benefits: ['Legal document templates', 'Easy form filling', 'Instant downloads']
  },
  {
    icon: Search,
    title: 'Legal Research',
    description: 'Search through legal information and understand how laws apply to your situation.',
    benefits: ['Easy-to-understand results', 'Case examples', 'Updated with current statutes']
  },
  {
    icon: UserPlus,
    title: 'Contact Management',
    description: 'Keep your matter-level legal contacts and communications organized in one secure place.',
    benefits: ['Per-matter contact lists', 'Communication history', 'Secure document sharing']
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Monitor your legal matters and get insights on next steps.',
    benefits: ['Status tracking', 'Timeline views', 'Helpful reminders']
  }
];

const technologyFeatures = [
  {
    icon: Brain,
    title: 'Legalbreeze® AI',
    titleStyled: true,
    description: 'Powered by state-of-the-art AI models fine-tuned specifically for legal guidance and assistance.',
    link: '/ai-governance'
  },
  {
    icon: Shield,
    title: 'AES-256 Encryption',
    description: 'Your personal and legal information is protected with AES-256 encryption at rest and TLS 1.3 in transit.',
    link: '/trust-center'
  },
  {
    icon: Database,
    title: 'Secure Cloud Storage',
    description: 'Your documents are safely stored with SOC 2 compliant infrastructure and instant access whenever you need them.',
    link: '/trust-center'
  },
  {
    icon: Workflow,
    title: 'Simple Automation',
    description: 'Automated reminders and simple workflows help you stay on top of important deadlines.',
    link: '/signup'
  },
  {
    icon: Globe,
    title: '50-State Coverage',
    description: 'Support for all 50 U.S. states and territories with region-specific legal information and local court details.',
    link: '/signup'
  },
  {
    icon: Lock,
    title: 'Zero-Training Data Policy',
    description: 'Your data is never used to train our models. Your information stays private, always. Full data export and deletion available.',
    link: '/privacy'
  }
];

const comparisonFeatures = [
  { feature: 'AI Legal Assistant', us: true, traditional: 'Complements' },
  { feature: 'Document Templates', us: true, traditional: 'Complements' },
  { feature: 'Attorney Consultation', us: 'Referrals', traditional: true },
  { feature: 'Case Management', us: true, traditional: true },
  { feature: 'Legal Research', us: true, traditional: true },
  { feature: '24/7 Availability', us: true, traditional: 'Office hours' },
  { feature: 'Complex Litigation', us: 'Referrals', traditional: true },
  { feature: 'Court Representation', us: 'Referrals', traditional: true }
];

export default function Features() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />

      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-24 overflow-hidden pt-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cuc3ZnLm9yZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48ZyBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Star className="w-4 h-4 text-gold-300" aria-hidden="true" />
              <span className="text-sm font-semibold text-white">
                {en ? 'AI-Powered Legal Tools for Everyone' : 'Herramientas Legales IA Para Todos'}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {en
                ? <>Legal Tools That<br className="hidden sm:block" />Work for Everyone</>
                : <>Herramientas Legales<br className="hidden sm:block" />Que Funcionan Para Todos</>}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              {en
                ? <>AI-powered legal information for individuals, trusted by attorneys. <span className="font-bold text-gold-300">Free unlimited questions</span>--pay only when you need action plans and documents.</>
                : <>Información legal impulsada por IA para personas, confiada por abogados. <span className="font-bold text-gold-300">Preguntas ilimitadas gratis</span>--paga solo cuando necesites planes de acción y documentos.</>}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/ask"
                className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                {en ? 'Ask My Question Free' : 'Haz Tu Pregunta Gratis'}
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-white text-navy-700 rounded-xl font-bold hover:bg-navy-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {en ? 'See Pricing' : 'Ver Precios'}
              </Link>
            </div>
            <p className="text-sm text-white/80 mt-6 flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success-400" aria-hidden="true" /> {en ? '30-day money-back guarantee' : 'Garantía de 30 días'}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-success-400" aria-hidden="true" /> {en ? 'No credit card required' : 'Sin tarjeta de crédito'}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-1">{en ? 'Free' : 'Gratis'}</div>
              <p className="text-navy-600 text-sm">{en ? 'Unlimited Questions' : 'Preguntas Ilimitadas'}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-1">{en ? 'Instant' : 'Instantáneo'}</div>
              <p className="text-navy-600 text-sm">{en ? 'AI Responses' : 'Respuestas IA'}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-1">24/7</div>
              <p className="text-navy-600 text-sm">{en ? 'Always Available' : 'Siempre Disponible'}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-teal-600 mb-1">50+</div>
              <p className="text-navy-600 text-sm">{en ? 'Legal Topics' : 'Temas Legales'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50 border-b border-navy-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-2">{en ? 'How It Works' : 'Cómo Funciona'}</h2>
            <p className="text-navy-600">{en ? 'From question to resolution in four clear steps' : 'De pregunta a resolución en cuatro pasos claros'}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-3 relative">
                  <step.icon className="w-6 h-6 text-teal-700" aria-hidden="true" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-navy-800 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-bold text-navy-900 mb-1">{step.label}</h3>
                <p className="text-sm text-navy-600 leading-relaxed">{step.description}</p>
                {index < journeySteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-7 -right-3 w-5 h-5 text-navy-300" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              {en ? 'Everything You Need, One Simple Price' : 'Todo Lo Que Necesitas, Un Precio Simple'}
            </h2>
            <p className="text-xl text-navy-600 max-w-2xl mx-auto">
              {en ? 'Comprehensive legal tools designed to help you understand your situation and make informed decisions.' : 'Herramientas legales completas diseñadas para ayudarte a entender tu situación y tomar decisiones informadas.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border ${
                  feature.highlight
                    ? 'border-teal-300 ring-1 ring-teal-200'
                    : 'border-navy-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                  feature.highlight ? 'bg-teal-600' : 'bg-teal-100'
                }`}>
                  <feature.icon className={`w-6 h-6 ${feature.highlight ? 'text-white' : 'text-teal-600'}`} aria-hidden="true" />
                </div>
                {feature.highlight && (
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded mb-2">
                    Trust & Safety
                  </span>
                )}
                <h3 className="text-xl font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-navy-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-navy-600">
                      <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" aria-hidden="true" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/trust-center"
              className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:text-teal-800 transition-colors text-sm"
            >
              Learn more about our trust and safety approach
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              Powered by <span className="text-navy-800">Legalbre</span><span className="text-teal-500">ez</span><span className="text-navy-800">e</span><sup className="text-lg text-navy-500">TM</sup> Technology
            </h2>
            <p className="text-xl text-navy-600 max-w-2xl mx-auto">
              Secure infrastructure built for legal AI -- AES-256 encryption, SOC 2 compliance, and zero-training data policy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologyFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="flex gap-4 p-6 rounded-xl border border-navy-200 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-teal-50 group-hover:bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-600" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-2 group-hover:text-teal-600 transition-colors">
                    {feature.titleStyled ? (
                      <><span className="text-navy-800">Legalbre</span><span className="text-teal-500">ez</span><span className="text-navy-800">e</span><sup className="text-[10px] text-navy-500">TM</sup> AI</>
                    ) : feature.title}
                  </h3>
                  <p className="text-sm text-navy-600 leading-relaxed">{feature.description}</p>
                  <span className="text-xs text-teal-600 font-medium mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 border-2 border-green-200 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full mb-4">
              <DollarSign className="w-5 h-5 text-success-600" aria-hidden="true" />
              <span className="font-bold text-navy-900">Free to Get Started</span>
            </div>
            <h2 className="text-3xl font-bold text-navy-900 mb-3">
              Ask Unlimited Questions Free
            </h2>
            <p className="text-lg text-navy-600 mb-6 max-w-2xl mx-auto">
              Understand your legal situation before deciding if you need professional counsel. Pay only when you need detailed action plans and document templates.
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              Ask My Question Free
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <p className="text-sm text-navy-600 mt-4">Issue Packs from $29 when you need action plans</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 px-4 py-2 rounded-full mb-4">
              <Star className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <span className="text-navy-700 text-sm font-semibold">How We Work Together</span>
            </div>
            <h2 className="text-4xl font-bold text-navy-900 mb-4">
              ezLegal.ai + Attorneys = Better Outcomes
            </h2>
            <p className="text-xl text-navy-600">
              We complement legal professionals, not replace them. See how our tools fit into your legal journey.
            </p>
          </div>

          <div className="bg-navy-50 rounded-2xl overflow-hidden border-2 border-navy-200 shadow-lg">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b-2 border-navy-200 bg-navy-100">
                  <th scope="col" className="text-left font-bold text-navy-700 p-6">Service</th>
                  <th scope="col" className="text-center font-bold text-teal-600 p-6">ezLegal.ai</th>
                  <th scope="col" className="text-center font-bold text-navy-700 p-6">Licensed Attorneys</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-navy-200 last:border-0 hover:bg-white transition-colors"
                  >
                    <td className="text-navy-800 font-medium p-6">{item.feature}</td>
                    <td className="text-center p-6">
                      {item.us === true ? (
                        <CheckCircle className="w-6 h-6 text-success-600 mx-auto" aria-hidden="true" />
                      ) : typeof item.us === 'string' ? (
                        <span className="text-teal-600 font-medium text-sm">{item.us}</span>
                      ) : (
                        <span className="text-navy-400" aria-label="Not available">-</span>
                      )}
                      {item.us === true && <span className="sr-only">Yes</span>}
                    </td>
                    <td className="text-center p-6">
                      {item.traditional === true ? (
                        <CheckCircle className="w-6 h-6 text-success-600 mx-auto" aria-hidden="true" />
                      ) : typeof item.traditional === 'string' ? (
                        <span className="text-navy-600 font-medium text-sm">{item.traditional}</span>
                      ) : (
                        <span className="text-navy-400" aria-label="Not available">-</span>
                      )}
                      {item.traditional === true && <span className="sr-only">Yes</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-navy-50 border border-navy-200 rounded-xl p-6 text-center">
            <p className="text-navy-700 mb-4">
              <strong>Our philosophy:</strong> ezLegal.ai helps you understand your legal situation. For complex matters, court representation, or when you need legal advice, we'll connect you with qualified attorneys.
            </p>
            <Link
              to="/ask"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
            >
              Ask My Question Free
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {en ? 'Ready to Understand Your Legal Situation?' : 'Listo Para Entender Tu Situación Legal?'}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {en
              ? 'Get clarity on your legal questions. Our AI helps you understand your options so you can make informed decisions about next steps.'
              : 'Obtén claridad sobre tus preguntas legales. Nuestra IA te ayuda a entender tus opciones para tomar decisiones informadas.'}
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-teal-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
          >
            {en ? 'Ask My Question Free' : 'Haz Tu Pregunta Gratis'}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <p className="text-white/80 text-sm mt-6 flex items-center justify-center gap-4 flex-wrap">
            <span>{en ? 'Unlimited questions free' : 'Preguntas ilimitadas gratis'}</span>
            <span>{en ? 'No signup required' : 'Sin registro'}</span>
            <span>{en ? 'Issue Packs from $29 when needed' : 'Paquetes desde $29 cuando los necesites'}</span>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
