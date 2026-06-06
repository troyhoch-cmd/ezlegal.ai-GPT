import { Link } from 'react-router-dom';
import { Briefcase, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function ForBusiness() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              {en ? 'For Small Businesses' : 'Para Pequeños Negocios'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {en
                ? 'Protect your business with affordable legal guidance and compliance tools.'
                : 'Protege tu negocio con orientación legal asequible y herramientas de cumplimiento.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <Briefcase className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {en ? 'Business Compliance' : 'Cumplimiento Empresarial'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Stay compliant with employment laws, contracts, and regulations.'
                  : 'Cumple con las leyes laborales, contratos y regulaciones.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <Users className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {en ? 'Employment Law' : 'Derecho Laboral'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Navigate hiring, contracts, and employee relations.'
                  : 'Navega contratación, contratos y relaciones laborales.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <TrendingUp className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {en ? 'Contract Management' : 'Gestión de Contratos'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Generate and review contracts with confidence.'
                  : 'Genera y revisa contratos con confianza.'}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <Shield className="w-12 h-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {en ? 'Risk Management' : 'Gestión de Riesgos'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Identify and mitigate legal risks.'
                  : 'Identifica y mitiga riesgos legales.'}
              </p>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              {en ? 'Business Pricing' : 'Precios para Negocios'}
            </h2>
            <p className="text-slate-700 mb-8 max-w-2xl mx-auto">
              {en
                ? 'Flexible plans designed for growing businesses.'
                : 'Planes flexibles diseñados para negocios en crecimiento.'}
            </p>
            <Link
              to="/pricing?tab=business"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'View Plans' : 'Ver Planes'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
