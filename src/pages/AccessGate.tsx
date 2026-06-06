import { Link } from 'react-router-dom';
import { AlertCircle, Heart, Users, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function AccessGate() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Heart className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {en ? 'Access to Justice' : 'Acceso a la Justicia'}
                </h1>
                <p className="text-slate-700">
                  {en
                    ? 'We are committed to making legal assistance available to everyone. This screening helps us connect you with the right resources.'
                    : 'Nos comprometemos a hacer que la asistencia legal esté disponible para todos. Este proceso de evaluación nos ayuda a conectarte con los recursos adecuados.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              {en ? 'Financial Hardship Screening' : 'Evaluación de Dificultad Financiera'}
            </h2>

            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hardship"
                    className="w-4 h-4 accent-teal-600"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {en ? 'Below 125% of Federal Poverty Line' : 'Por debajo del 125% de la línea de pobreza federal'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {en
                        ? 'Qualified for free legal aid services'
                        : 'Calificado para servicios legales gratuitos'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hardship"
                    className="w-4 h-4 accent-teal-600"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {en ? '125% - 200% of Poverty Line' : '125% - 200% de la línea de pobreza'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {en
                        ? 'Eligible for reduced-cost resources'
                        : 'Elegible para recursos de costo reducido'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="hardship"
                    className="w-4 h-4 accent-teal-600"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {en ? 'Above 200% of Poverty Line' : 'Arriba del 200% de la línea de pobreza'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {en
                        ? 'Access to pro bono and discounted services'
                        : 'Acceso a servicios pro bono y con descuento'}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <button className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium mb-4">
              {en ? 'Continue' : 'Continuar'}
            </button>
          </div>

          <div className="mt-8 bg-teal-50 border border-teal-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              {en ? 'Other Resources' : 'Otros Recursos'}
            </h3>
            <p className="text-slate-700 mb-4">
              {en
                ? 'Regardless of income, you have access to:'
                : 'Independientemente de los ingresos, tienes acceso a:'}
            </p>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                {en
                  ? 'Free legal information and educational resources'
                  : 'Información legal gratuita y recursos educativos'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                {en
                  ? 'Emergency legal guidance for urgent matters'
                  : 'Orientación legal de emergencia para asuntos urgentes'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full" />
                {en
                  ? 'Referrals to local legal aid organizations'
                  : 'Derivaciones a organizaciones locales de ayuda legal'}
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
