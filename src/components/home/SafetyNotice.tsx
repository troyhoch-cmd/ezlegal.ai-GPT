import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Globe, UserCheck, Lock, Eye, Layers, AlertTriangle, Printer } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const aiCards = [
  { icon: Shield, t_en: 'Legal information, not legal advice', t_es: 'Información legal, no asesoría legal', d_en: 'We clearly state what AI can and cannot do before every interaction.', d_es: 'Declaramos claramente qué puede y no puede hacer la IA antes de cada interacción.' },
  { icon: Globe, t_en: 'Jurisdiction matters', t_es: 'La jurisdicción importa', d_en: 'We ask where you live because legal rules differ by state and county.', d_es: 'Preguntamos dónde vives porque las reglas legales difieren por estado y condado.' },
  { icon: UserCheck, t_en: 'Human fallback', t_es: 'Respaldo humano', d_en: 'When your issue needs a professional, we say so and help you reach one.', d_es: 'Cuando tu asunto necesita un profesional, lo decimos y te ayudamos a contactar uno.' },
  { icon: Lock, t_en: 'Privacy-first intake', t_es: 'Intake con privacidad primero', d_en: 'Encrypted conversations. No data sold. No AI training on your data.', d_es: 'Conversaciones cifradas. Sin venta de datos. Sin entrenar IA con tu información.' },
  { icon: Eye, t_en: 'Sources and explanations', t_es: 'Fuentes y explicaciones', d_en: 'We show where guidance comes from and explain why we ask each question.', d_es: 'Mostramos de dónde viene la orientación y explicamos por qué hacemos cada pregunta.' },
  { icon: Layers, t_en: 'Bias and language-quality review', t_es: 'Revisión de sesgo y calidad de lenguaje', d_en: 'Content is reviewed for accuracy, bias, and plain-language clarity.', d_es: 'El contenido se revisa en busca de precisión, sesgo y claridad en lenguaje simple.' },
];

const safeguards = [
  { icon: Shield, en: 'Not a lawyer and not legal advice', es: 'No es un abogado ni asesoría legal' },
  { icon: AlertTriangle, en: 'Does not replace emergency help or court deadlines', es: 'No reemplaza ayuda de emergencia ni plazos judiciales' },
  { icon: Lock, en: 'Avoid entering SSNs, full account numbers, or sensitive IDs', es: 'Evita ingresar SSN, números de cuenta completos o IDs sensibles' },
  { icon: Globe, en: 'Spanish and plain-language support', es: 'Soporte en español y lenguaje sencillo' },
  { icon: UserCheck, en: 'Human and legal-aid referral options where available', es: 'Opciones de referencia a humanos y ayuda legal cuando estén disponibles' },
  { icon: Printer, en: 'You can save or print a summary at any time', es: 'Puedes guardar o imprimir un resumen en cualquier momento' },
];

export function SafetyNotice() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-10 sm:py-12" aria-labelledby="ai-responsible-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold text-teal-700 text-center mb-1 uppercase tracking-wide">
          {en ? 'For everyone who uses our AI tools' : 'Para todos los que usan nuestras herramientas de IA'}
        </p>
        <h2 id="ai-responsible-heading" className="text-lg font-bold text-slate-900 text-center mb-1">
          {en ? 'Responsible legal AI' : 'IA legal responsable'}
        </h2>
        <p className="text-xs text-slate-500 text-center mb-5">
          {en ? 'Legal information only. Never legal advice. Always transparent.' : 'Solo información legal. Nunca asesoría legal. Siempre transparente.'}
        </p>

        {/* Concise safeguards checklist */}
        <div className="mx-auto max-w-2xl mb-8 rounded-xl border border-slate-100 bg-white p-4 sm:p-5">
          <div className="grid gap-2 sm:grid-cols-2">
            {safeguards.map(({ icon: Icon, en: textEn, es: textEs }, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <Icon className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-snug">{en ? textEn : textEs}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed card grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aiCards.map(({ icon: Icon, ...item }, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <Icon className="w-5 h-5 text-teal-600 mb-2" aria-hidden="true" />
              <p className="font-semibold text-sm text-slate-900 mb-1">{en ? item.t_en : item.t_es}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{en ? item.d_en : item.d_es}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center">
          <Link
            to="/ai-safety"
            className="text-sm font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded"
          >
            {en ? 'Read our AI safety principles' : 'Lee nuestros principios de seguridad de IA'}
          </Link>
        </div>
      </div>
    </section>
  );
}
