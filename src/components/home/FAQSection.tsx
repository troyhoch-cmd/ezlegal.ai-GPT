import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const faqs = [
  { q: { en: 'Is ezlegal.ai a law firm?', es: 'Ezlegal.ai es un bufete de abogados?' }, a: { en: 'No. ezlegal.ai is not a law firm and does not provide legal advice. We offer legal information, self-help tools, guided document preparation, and referral resources. When legal advice is needed, we help users prepare and connect with appropriate professionals.', es: 'No. ezlegal.ai no es un bufete de abogados y no ofrece asesorías legal. Ofrecemos información legal, herramientas de autoayuda, preparación guiada de documentos y recursos de referencia.' } },
  { q: { en: 'Can I use this if I cannot afford a lawyer?', es: 'Puedo usar esto si no puedo pagar un abogado?' }, a: { en: 'Yes. The legal checkup and AI navigator are free. We also help you find legal-aid organizations and pro bono services in your area. No retainer or payment is required to get started.', es: 'Sí. El chequeo legal y el navegador AI son gratis. También te ayudamos a encontrar organizaciones de ayuda legal y servicios pro bono en tu área. No se requiere anticipo ni pago para empezar.' } },
  { q: { en: 'Can I start in Spanish?', es: 'Puedo empezar en español?' }, a: { en: 'Yes. The full experience is available in Spanish. You can switch languages at any time using the toggle at the top of the page.', es: 'Sí. La experiencia completa está disponible en español. Puedes cambiar de idioma en cualquier momento usando el botón en la parte superior.' } },
  { q: { en: 'What happens if my issue is urgent?', es: 'Qué pasa si mi asunto es urgente?' }, a: { en: 'We detect urgency signals like deadlines, court dates, eviction notices, and safety concerns. When we detect these, we immediately provide urgent resource links and escalation options.', es: 'Detectamos señales de urgencia como plazos, fechas de corte, avisos de desalojo y preocupaciones de seguridad. Cuando las detectamos, proporcionamos inmediatamente recursos urgentes y opciones de escalación.' } },
  { q: { en: 'Will AI make legal decisions for me?', es: 'La IA tomará decisiones legales por mí?' }, a: { en: 'No. AI helps you understand your situation, organize your information, and identify next steps. It does not make decisions, give legal advice, or replace professional judgment. When a lawyer is needed, we say so clearly.', es: 'No. La IA te ayuda a entender tu situación, organizar tu información e identificar los siguientes pasos. No toma decisiones, no da asesorías legal ni reemplaza el juicio profesional. Cuando se necesita un abogado, lo decimos claramente.' } },
  { q: { en: 'Can a lawyer or legal-aid organization review my summary?', es: 'Puede un abogado u organización de ayuda legal revisar mi resumen?' }, a: { en: 'Yes. Your intake summary is designed to be shared with attorneys and legal-aid organizations. You can download or share it when you are ready to connect with human help.', es: 'Sí. Tu resumen de intake está diseñado para ser compartido con abogados y organizaciones de ayuda legal. Puedes descargarlo o compartirlo cuando estés listo para conectar con ayuda humana.' } },
  { q: { en: 'Is my information private?', es: 'Mi información es privada?' }, a: { en: 'Yes. Conversations are encrypted. We do not sell your data or use it to train AI models. You control what you share.', es: 'Sí. Las conversaciones están cifradas. No vendemos tus datos ni los usamos para entrenar modelos de IA. Tú controlas lo que compartes.' } },
  { q: { en: "I don't know what kind of legal problem I have.", es: 'No sé qué tipo de problema legal tengo.' }, a: { en: "That's perfectly fine. Start with our 2-minute legal checkup or simply describe your situation in your own words. We'll help you figure out what it might involve and what your options are.", es: 'Eso está perfectamente bien. Comienza con nuestro chequeo legal de 2 minutos o simplemente describe tu situación en tus propias palabras. Te ayudaremos a entender qué puede involucrar y cuáles son tus opciones.' } },
];

export function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section id="faq" className="py-8 sm:py-10 bg-white border-y border-slate-100" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 id="faq-heading" className="text-lg font-bold mb-5 text-slate-900">
          {en ? 'Common questions' : 'Preguntas comunes'}
        </h2>
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden bg-white">
          {faqs.map((item, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                aria-expanded={openFaq === i}
              >
                <span className="font-semibold text-slate-900 pr-4 text-sm">{en ? item.q.en : item.q.es}</span>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4">
                  <p className="text-sm leading-relaxed text-slate-600">{en ? item.a.en : item.a.es}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
