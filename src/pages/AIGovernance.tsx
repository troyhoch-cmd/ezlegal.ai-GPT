import { Link } from 'react-router-dom';
import { Shield, Database, TrendingUp, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface GovernanceCard {
  icon: typeof Shield;
  title: string;
  description: string;
  link: string;
}

const GOVERNANCE_CARDS: GovernanceCard[] = [
  {
    icon: Shield,
    title: 'Model Card',
    description: 'AI model specifications, capabilities, and limitations.',
    link: '/model-card',
  },
  {
    icon: TrendingUp,
    title: 'Bias Monitoring',
    description: 'Ongoing monitoring and mitigation of algorithmic bias.',
    link: '/bias-monitoring',
  },
  {
    icon: AlertCircle,
    title: 'Impact Assessment',
    description: 'Algorithmic impact on users and legal outcomes.',
    link: '/impact-assessment',
  },
  {
    icon: Database,
    title: 'Data Provenance',
    description: 'Transparency about training data sources and lineage.',
    link: '/ai-data-provenance',
  },
  {
    icon: Zap,
    title: 'Scope Disclaimers',
    description: 'Clear boundaries on what the AI can and cannot do.',
    link: '/scope-disclaimers',
  },
];

const PRINCIPLES = [
  {
    title: 'Transparency',
    description: 'We disclose how our AI works and its limitations.',
  },
  {
    title: 'Accountability',
    description: 'We take responsibility for AI decisions and outcomes.',
  },
  {
    title: 'Fairness',
    description: 'We work to prevent bias and ensure equitable access.',
  },
  {
    title: 'Safety',
    description: 'We prioritize user safety and harmful content detection.',
  },
];

export default function AIGovernance() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'AI Governance Hub' : 'Centro de Gobernanza de IA'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl">
              {en
                ? 'Comprehensive documentation of how we govern and oversee artificial intelligence systems.'
                : 'Documentación integral de cómo gobernamos y supervisamos sistemas de inteligencia artificial.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {GOVERNANCE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">{card.description}</p>
                  <div className="text-teal-600 text-sm font-medium flex items-center gap-1">
                    {en ? 'Learn more' : 'Aprende más'} <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })}
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              {en ? 'Our Principles' : 'Nuestros Principios'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-slate-600">{principle.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              {en ? 'Implementation Evidence' : 'Evidencia de Implementación'}
            </h2>
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {en
                    ? 'Regular Audits & Testing'
                    : 'Auditorías y Pruebas Regulares'}
                </h3>
                <p className="text-slate-600 text-sm">
                  {en
                    ? 'Quarterly bias testing, performance evaluation, and impact assessment.'
                    : 'Pruebas de sesgo trimestrales, evaluación de rendimiento y evaluación de impacto.'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {en ? 'Governance Board' : 'Junta de Gobernanza'}
                </h3>
                <p className="text-slate-600 text-sm">
                  {en
                    ? 'Diverse advisory board overseeing AI decisions and policies.'
                    : 'Junta asesora diversa que supervisa decisiones y políticas de IA.'}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-2">
                  {en
                    ? 'Public Disclosures'
                    : 'Divulgaciones Públicas'}
                </h3>
                <p className="text-slate-600 text-sm">
                  {en
                    ? 'Annual AI impact reports and transparency documentation.'
                    : 'Informes anuales de impacto de IA y documentación de transparencia.'}
                </p>
              </div>
            </div>
          </section>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {en ? 'Questions About Our AI?' : 'Preguntas sobre Nuestro IA?'}
            </h2>
            <p className="text-slate-700 mb-8">
              {en
                ? 'We are committed to transparency and accountability.'
                : 'Estamos comprometidos con la transparencia y la rendición de cuentas.'}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Contact Us' : 'Contáctanos'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
