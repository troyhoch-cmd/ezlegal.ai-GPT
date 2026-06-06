import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Download } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Template {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  category: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'lease',
    title: 'Lease Agreement',
    description: 'Residential or commercial lease template with customizable terms.',
    icon: FileText,
    category: 'Housing',
  },
  {
    id: 'demand',
    title: 'Demand Letter',
    description: 'Professional demand letter for payment or contract performance.',
    icon: FileText,
    category: 'Collections',
  },
  {
    id: 'llc',
    title: 'LLC Formation',
    description: 'Articles of Organization and operating agreement templates.',
    icon: FileText,
    category: 'Business',
  },
  {
    id: 'nda',
    title: 'Non-Disclosure Agreement',
    description: 'Confidentiality and NDA template for business partnerships.',
    icon: FileText,
    category: 'Business',
  },
  {
    id: 'employment',
    title: 'Employment Agreement',
    description: 'Employment contract with key terms and conditions.',
    icon: FileText,
    category: 'Employment',
  },
];

export default function Documents() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              {en ? 'Legal Document Generator' : 'Generador de Documentos Legales'}
            </h1>
            <p className="text-lg text-slate-600">
              {en
                ? 'Generate customizable legal documents in minutes.'
                : 'Genera documentos legales personalizables en minutos.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {template.title}
                </h3>
                <p className="text-slate-600 text-sm mb-4">{template.description}</p>
                <button className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium">
                  {en ? 'Generate' : 'Generar'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {selectedTemplate && (
            <div className="mt-12 bg-teal-50 border border-teal-200 rounded-xl p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {en ? 'Document Details' : 'Detalles del Documento'}
                  </h2>
                  <p className="text-slate-600">
                    {en
                      ? 'Customize the template below and download your document.'
                      : 'Personaliza la plantilla a continuación y descarga tu documento.'}
                  </p>
                </div>
                <Download className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
