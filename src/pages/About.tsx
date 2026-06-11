import { Link } from 'react-router-dom';
import { Heart, Users, Scale, AlertCircle, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function About() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              {en ? 'About ezLegal.ai' : 'Acerca de ezLegal.ai'}
            </h1>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-8">
              <p className="text-xl text-slate-800 font-semibold mb-2">
                {en
                  ? 'Access to justice through ethical AI'
                  : 'Acceso a la justicia a través de IA ética'}
              </p>
              <p className="text-slate-700">
                {en
                  ? 'We believe that everyone deserves access to quality legal guidance, regardless of their income. Our platform leverages responsible artificial intelligence to make legal assistance more accessible and affordable.'
                  : 'Creemos que todos merecen acceso a asesoramiento legal de calidad, independientemente de sus ingresos. Nuestra plataforma aprovecha la inteligencia artificial responsable para hacer que la asistencia legal sea más accesible y asequible.'}
              </p>
            </div>
          </div>

          <section className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              {en ? 'Our Values' : 'Nuestros Valores'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <Heart className="w-8 h-8 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {en ? 'Equity' : 'Equidad'}
                </h3>
                <p className="text-slate-600">
                  {en
                    ? 'We prioritize serving those with the greatest need.'
                    : 'Priorizamos servir a quienes tienen mayor necesidad.'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <Users className="w-8 h-8 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {en ? 'Transparency' : 'Transparencia'}
                </h3>
                <p className="text-slate-600">
                  {en
                    ? 'We are clear about what our AI can and cannot do.'
                    : 'Somos claros sobre lo que nuestra IA puede y no puede hacer.'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <Scale className="w-8 h-8 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {en ? 'Ethics' : 'Ética'}
                </h3>
                <p className="text-slate-600">
                  {en
                    ? 'We design with ethical guardrails and human oversight.'
                    : 'Diseñamos con protecciones éticas y supervisión humana.'}
                </p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <AlertCircle className="w-8 h-8 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {en ? 'Safety' : 'Seguridad'}
                </h3>
                <p className="text-slate-600">
                  {en
                    ? 'Your data and privacy are protected at all times.'
                    : 'Tus datos y privacidad están protegidos en todo momento.'}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-12">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {en
                    ? 'Important: Not a Law Firm'
                    : 'Importante: No es un Despacho de Abogados'}
                </h3>
                <p className="text-slate-700 mb-3">
                  {en
                    ? 'ezLegal.ai is not a law firm and does not provide legal advice. The information provided is for educational purposes only. We strongly encourage consultation with a licensed attorney for legal matters.'
                    : 'ezLegal.ai no es un despacho de abogados y no proporciona asesoramiento legal. La información proporcionada es solo con fines educativos. Recomendamos encarecidamente consultar con un abogado licenciado para asuntos legales.'}
                </p>
                <p className="text-slate-700">
                  {en
                    ? 'If you have a legal emergency or require immediate legal assistance, please contact a local legal aid organization or licensed attorney.'
                    : 'Si tienes una emergencia legal o necesitas asistencia legal inmediata, contacta a una organización de ayuda legal local o a un abogado licenciado.'}
                </p>
              </div>
            </div>
          </section>

          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              {en ? 'Get in Touch' : 'Ponte en Contacto'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
