import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, BookOpen, Target, Award } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function AIModelCard() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-semibold mb-4">
              <Award className="w-4 h-4" />
              {en ? 'Version 3.2' : 'Versión 3.2'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'AI Model Card' : 'Tarjeta de Modelo IA'}
            </h1>
            <p className="text-lg text-slate-600">
              {en
                ? 'Documentation of model capabilities, limitations, and governance.'
                : 'Documentación de capacidades del modelo, limitaciones y gobernanza.'}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <div className="flex items-start gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    {en ? 'Model Specifications' : 'Especificaciones del Modelo'}
                  </h2>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      <span className="font-semibold">{en ? 'Version:' : 'Versión:'}</span> 3.2
                    </p>
                    <p>
                      <span className="font-semibold">{en ? 'Architecture:' : 'Arquitectura:'}</span>{' '}
                      {en
                        ? 'Transformer-based language model'
                        : 'Modelo de lenguaje basado en Transformer'}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {en ? 'Training Data:' : 'Datos de Entrenamiento:'}
                      </span>{' '}
                      {en
                        ? 'Legal publications, statute databases, case law'
                        : 'Publicaciones legales, bases de datos de estatutos, jurisprudencia'}
                    </p>
                    <p>
                      <span className="font-semibold">
                        {en ? 'Last Updated:' : 'Última Actualización:'}
                      </span>{' '}
                      January 2024
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {en ? 'Compliance Standards' : 'Estándares de Cumplimiento'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      ISO/IEC 42001
                    </p>
                    <p className="text-sm text-slate-700">
                      AI Management Systems
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">NIST AI RMF</p>
                    <p className="text-sm text-slate-700">
                      Risk Management Framework
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      EU AI Act Aligned
                    </p>
                    <p className="text-sm text-slate-700">
                      High-risk AI practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {en ? 'EEOC Guidelines' : 'Directrices de la EEOC'}
                    </p>
                    <p className="text-sm text-slate-700">
                      AI Discrimination Prevention
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <div className="flex items-start gap-3 mb-4">
                <Target className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">
                    {en ? 'Model Limitations' : 'Limitaciones del Modelo'}
                  </h2>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">•</span>
                      {en
                        ? 'Does not provide legal advice or attorney services'
                        : 'No proporciona asesoramiento legal ni servicios de abogado'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">•</span>
                      {en
                        ? 'Training data has a knowledge cutoff'
                        : 'Los datos de entrenamiento tienen un límite de conocimiento'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">•</span>
                      {en
                        ? 'May not reflect all recent legal changes'
                        : 'Puede no reflejar todos los cambios legales recientes'}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold mt-0.5">•</span>
                      {en
                        ? 'Jurisdiction-specific accuracy varies'
                        : 'La precisión específica de la jurisdicción varía'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {en ? 'Important Notice' : 'Aviso Importante'}
                  </h2>
                  <p className="text-slate-700">
                    {en
                      ? 'For critical legal matters, always consult with a licensed attorney. This AI model is designed to support research and learning, not replace professional legal counsel.'
                      : 'Para asuntos legales críticos, siempre consulta con un abogado licenciado. Este modelo de IA está diseñado para apoyar investigación y aprendizaje, no para reemplazar consejo legal profesional.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/ai-governance"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold"
              >
                {en ? 'View AI Governance Hub' : 'Ver Centro de Gobernanza de IA'}
                →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
