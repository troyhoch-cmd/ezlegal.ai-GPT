import { useState } from 'react';
import { AlertCircle, DollarSign, Users, TrendingUp, Shield } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Negotiate() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [showDVWarning, setShowDVWarning] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Negotiation Tool' : 'Herramienta de Negociación'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Strategic guidance for settlements and disputes.'
                : 'Orientación estratégica para acuerdos y disputas.'}
            </p>
          </div>

          {showDVWarning && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {en ? 'Safety Alert' : 'Alerta de Seguridad'}
                  </h2>
                  <p className="text-slate-700 mb-4">
                    {en
                      ? 'If you are experiencing domestic violence or abuse, please reach out to the National Domestic Violence Hotline: 1-800-799-7233'
                      : 'Si estás experimentando violencia doméstica o abuso, comunícate con la Línea Nacional de Violencia Doméstica: 1-800-799-7233'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <DollarSign className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Settlement Strategy' : 'Estrategia de Acuerdo'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Learn how to negotiate fair settlement terms.'
                  : 'Aprende cómo negociar términos de acuerdo justos.'}
              </p>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Explore' : 'Explorar'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <Users className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Dispute Resolution' : 'Resolución de Disputas'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Navigate common disputes and find resolution paths.'
                  : 'Navega disputas comunes y encuentra caminos de resolución.'}
              </p>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Explore' : 'Explorar'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Negotiation Tips' : 'Consejos de Negociación'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Best practices for effective negotiation.'
                  : 'Mejores prácticas para negociación efectiva.'}
              </p>
              <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                {en ? 'Learn' : 'Aprender'}
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <AlertCircle className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {en ? 'Safety Screening' : 'Evaluación de Seguridad'}
              </h3>
              <p className="text-slate-600 mb-4">
                {en
                  ? 'Check for safety concerns in your situation.'
                  : 'Verifica preocupaciones de seguridad en tu situación.'}
              </p>
              <button
                onClick={() => setShowDVWarning(!showDVWarning)}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                {en ? 'Check Now' : 'Verificar Ahora'}
              </button>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
            <p className="text-slate-700">
              {en
                ? 'This tool provides educational guidance only. For serious disputes or legal matters, consult with a licensed attorney.'
                : 'Esta herramienta proporciona solo orientación educativa. Para disputas serias o asuntos legales, consulta con un abogado licenciado.'}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
