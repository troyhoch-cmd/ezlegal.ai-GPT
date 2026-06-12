import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, Lock, Eye, FileText, UserX, Download, Clock } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function PrivacyFAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { language } = useLanguage();

  const faqs = [
    {
      icon: Lock,
      question: language === 'en'
        ? 'Is my information secure?'
        : 'Mi información está segura?',
      answer: language === 'en'
        ? 'Yes. We use TLS 1.3 encryption in transit and AES-256 encryption at rest. Your data is stored in secure data centers. We never sell your information to third parties.'
        : 'Sí. Usamos cifrado TLS 1.3 en tránsito y AES-256 en reposo. Tus datos se almacenan en centros de datos seguros. Nunca vendemos tu información.'
    },
    {
      icon: Eye,
      question: language === 'en'
        ? 'Who can see my conversations?'
        : 'Quién puede ver mis conversaciones?',
      answer: language === 'en'
        ? 'Only you can see your conversations by default. Our AI processes your questions to provide answers, but your conversations are never used to train our models. Staff may review conversations only for quality assurance, safety screening, or if you report an issue.'
        : 'Solo tú puedes ver tus conversaciones por defecto. Nuestra IA procesa tus preguntas para dar respuestas, pero tus conversaciones nunca se usan para entrenar modelos.'
    },
    {
      icon: Shield,
      question: language === 'en'
        ? 'Is this protected by attorney-client privilege?'
        : 'Está protegido por privilegio abogado-cliente?',
      answer: language === 'en'
        ? 'No. Since ezLegal.ai is not a law firm and does not provide legal representation, conversations are not protected by attorney-client privilege. When we connect you with a licensed attorney, communications with that attorney may be privileged.'
        : 'No. Como ezLegal.ai no es un bufete de abogados y no proporciona representación legal, las conversaciones no están protegidas por privilegio abogado-cliente.'
    },
    {
      icon: FileText,
      question: language === 'en'
        ? 'What information do you collect?'
        : 'Qué información recopilan?',
      answer: language === 'en'
        ? 'We collect: (1) Account information (email, name if provided), (2) Questions and conversations you have with our AI, (3) Usage data (pages visited, features used), (4) Device and browser information. We do not collect sensitive personal data like SSN or financial account numbers unless you voluntarily provide them in a conversation.'
        : 'Recopilamos: (1) Información de cuenta (correo, nombre si se proporciona), (2) Preguntas y conversaciones con nuestra IA, (3) Datos de uso, (4) Información de dispositivo y navegador.'
    },
    {
      icon: UserX,
      question: language === 'en'
        ? 'Can I delete my data?'
        : 'Puedo borrar mis datos?',
      answer: language === 'en'
        ? 'Yes. You can request deletion of your account and associated data at any time from your Profile settings, or by contacting privacy@ezlegal.ai. We will delete your data within 30 days, except where we are legally required to retain certain records.'
        : 'Sí. Puedes solicitar la eliminación de tu cuenta y datos en cualquier momento desde la configuración de tu perfil, o contactando a privacy@ezlegal.ai.'
    },
    {
      icon: Download,
      question: language === 'en'
        ? 'Can I download my data?'
        : 'Puedo descargar mis datos?',
      answer: language === 'en'
        ? 'Yes. You can request a copy of all your data in a machine-readable format (JSON) from your Profile settings. We will provide your data within 30 days of your request.'
        : 'Sí. Puedes solicitar una copia de todos tus datos en formato legible por máquina (JSON) desde la configuración de tu perfil.'
    },
    {
      icon: Clock,
      question: language === 'en'
        ? 'How long do you keep my data?'
        : 'Cuánto tiempo guardan mis datos?',
      answer: language === 'en'
        ? 'Active accounts and conversations are retained as long as your account is active. If you delete your account, we delete your data within 30 days. We may retain anonymized usage statistics for product improvement.'
        : 'Las cuentas activas y conversaciones se conservan mientras tu cuenta esté activa. Si eliminas tu cuenta, borramos tus datos en 30 días.'
    },
    {
      icon: Shield,
      question: language === 'en'
        ? 'Are you CCPA/GDPR compliant?'
        : 'Cumplen con CCPA/GDPR?',
      answer: language === 'en'
        ? 'Yes. We comply with the California Consumer Privacy Act (CCPA) and honor GDPR principles. You have the right to access, correct, delete, and export your data. You can exercise these rights from your Profile settings or by contacting us.'
        : 'Sí. Cumplimos con la Ley de Privacidad del Consumidor de California (CCPA) y los principios GDPR. Tienes derecho a acceder, corregir, eliminar y exportar tus datos.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content" className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4 text-teal-600" />
              <span className="text-teal-700 text-sm font-semibold">
                {language === 'en' ? 'Privacy & Security' : 'Privacidad y Seguridad'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-4">
              {language === 'en'
                ? 'Privacy Fast Answers'
                : 'Respuestas Rápidas de Privacidad'}
            </h1>

            <p className="text-lg text-navy-500 max-w-2xl mx-auto mb-6">
              {language === 'en'
                ? 'Quick answers to your most common privacy questions'
                : 'Respuestas rápidas a tus preguntas más comunes sobre privacidad'}
            </p>

            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              {language === 'en'
                ? 'Read full Privacy Policy'
                : 'Leer Política de Privacidad completa'}
            </Link>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-navy-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-navy-50 transition-colors min-h-[64px] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <faq.icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="font-semibold text-navy-900 pr-4">{faq.question}</span>
                  </div>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-navy-300 flex-shrink-0" />
                  )}
                </button>

                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  hidden={openFaq !== i}
                  className={openFaq === i ? 'px-5 pb-5 pt-2 bg-navy-50 border-t border-navy-100' : ''}
                >
                  {openFaq === i && (
                    <p className="text-navy-600 leading-relaxed pl-14">{faq.answer}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-br from-navy-900 to-navy-800 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'en'
                ? 'Still have questions?'
                : '¿Todavía tienes preguntas?'}
            </h2>
            <p className="text-navy-100 mb-6 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Contact our privacy team for specific questions about how we handle your data.'
                : 'Contacta a nuestro equipo de privacidad para preguntas específicas sobre cómo manejamos tus datos.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@ezlegal.ai"
                className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                {language === 'en' ? 'Email Privacy Team' : 'Enviar Email'}
              </a>
              <Link
                to="/privacy-policy"
                className="inline-flex items-center justify-center gap-2 bg-navy-700 hover:bg-navy-600 border border-navy-500 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                {language === 'en' ? 'Full Privacy Policy' : 'Política Completa'}
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
