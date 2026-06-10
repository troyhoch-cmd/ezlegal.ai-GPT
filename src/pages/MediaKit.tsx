import { useState } from 'react';
import { Download, Mail, Copy, Check, Scale } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

const BOILERPLATE_EN = 'ezLegal.ai offers AI-powered legal information and document generation designed for access to justice.';
const BOILERPLATE_ES = 'ezLegal.ai ofrece información legal impulsada por IA y generación de documentos diseñados para acceso a la justicia.';

export default function MediaKit() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = en ? BOILERPLATE_EN : BOILERPLATE_ES;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Media Kit' : 'Kit de Medios'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Press materials, logos, and brand guidelines for journalists and media outlets.'
                : 'Materiales de prensa, logotipos y guías de marca para periodistas y medios.'}
            </p>
          </div>

          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 mb-8 flex items-start gap-3">
            <Scale className="w-5 h-5 text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              {en
                ? 'ezLegal.ai provides legal information, not legal advice. We are not a law firm and do not replace licensed attorneys.'
                : 'ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados y no reemplazamos a abogados licenciados.'}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {en ? 'Logo & Branding' : 'Logo y Marca'}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <a
                  href="/assets/ezlegal-logo.png"
                  download="ezlegal-logo.png"
                  className="p-4 border border-slate-300 rounded-lg hover:border-teal-300 transition-colors text-left block"
                >
                  <Download className="w-5 h-5 text-teal-600 mb-2" />
                  <p className="font-medium text-slate-900">Logo (PNG)</p>
                  <p className="text-sm text-slate-600">{en ? 'High resolution' : 'Alta resolución'}</p>
                </a>
                <a
                  href="/assets/ezlegal-logo.svg"
                  download="ezlegal-logo.svg"
                  className="p-4 border border-slate-300 rounded-lg hover:border-teal-300 transition-colors text-left block"
                >
                  <Download className="w-5 h-5 text-teal-600 mb-2" />
                  <p className="font-medium text-slate-900">Logo (SVG)</p>
                  <p className="text-sm text-slate-600">{en ? 'Scalable format' : 'Formato escalable'}</p>
                </a>
                <a
                  href="/assets/ezlegal-brand-guide.pdf"
                  download="ezlegal-brand-guide.pdf"
                  className="p-4 border border-slate-300 rounded-lg hover:border-teal-300 transition-colors text-left block"
                >
                  <Download className="w-5 h-5 text-teal-600 mb-2" />
                  <p className="font-medium text-slate-900">{en ? 'Brand Guide' : 'Guía de Marca'}</p>
                  <p className="text-sm text-slate-600">{en ? 'PDF guidelines' : 'Guía en PDF'}</p>
                </a>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {en ? 'Press Releases' : 'Comunicados de Prensa'}
              </h2>
              <div className="space-y-3">
                <a
                  href="/assets/ezlegal-press-release-2024-06.pdf"
                  download
                  className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-300 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {en ? 'Latest Press Release' : 'Comunicado de Prensa Más Reciente'}
                    </p>
                    <p className="text-sm text-slate-600">
                      {en ? 'June 1, 2024' : '1 de junio de 2024'}
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-teal-600" />
                </a>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {en ? 'About ezLegal.ai' : 'Acerca de ezLegal.ai'}
              </h2>
              <p className="text-slate-700 mb-6">
                {en
                  ? 'ezLegal.ai is an AI-powered legal tech platform providing accessible legal information and document generation for individuals and organizations.'
                  : 'ezLegal.ai es una plataforma de tecnología legal impulsada por IA que proporciona información legal accesible y generación de documentos para individuos y organizaciones.'}
              </p>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-2">
                    {en
                      ? 'Boilerplate text (copy and paste)'
                      : 'Texto estándar (copiar y pegar)'}
                  </p>
                  <p className="text-slate-700">
                    {en ? BOILERPLATE_EN : BOILERPLATE_ES}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                  aria-label={en ? 'Copy to clipboard' : 'Copiar al portapapeles'}
                >
                  {copied ? <Check className="w-5 h-5 text-teal-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {en ? 'Press Inquiries' : 'Consultas de Prensa'}
              </h2>
              <p className="text-slate-700 mb-4">
                {en
                  ? 'For media inquiries, please contact our communications team.'
                  : 'Para consultas de medios, comunícate con nuestro equipo de comunicaciones.'}
              </p>
              <a href="mailto:press@ezlegal.ai" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium">
                <Mail className="w-4 h-4" />
                press@ezlegal.ai
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
