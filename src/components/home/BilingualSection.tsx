import { Globe, MessageSquare, UserCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const cards = [
  { icon: Globe, t: { en: 'Start in Spanish', es: 'Empieza en español' }, d: { en: 'Full intake, guidance, and documents in Spanish from the first click.', es: 'Intake completo, orientación y documentos en español desde el primer clic.' } },
  { icon: MessageSquare, t: { en: 'Plain-language explanations', es: 'Explicaciones en lenguaje simple' }, d: { en: 'No legal jargon. Every explanation is written so you can understand and act.', es: 'Sin jerga legal. Cada explicación está escrita para que puedas entender y actuar.' } },
  { icon: UserCheck, t: { en: 'Human help when AI is not enough', es: 'Ayuda humana cuando la IA no es suficiente' }, d: { en: 'We identify when your issue needs a professional and help you prepare to reach one.', es: 'Identificamos cuando tu asunto necesita un profesional y te ayudamos a prepararte para contactar uno.' } },
];

export function BilingualSection() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section className="py-8 sm:py-10" aria-labelledby="bilingual-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="bilingual-heading" className="text-lg font-bold text-slate-900 text-center mb-5">
          {en ? 'Help that works in English and Spanish' : 'Ayuda que funciona en inglés y español'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map(({ icon: Icon, t, d }) => (
            <div key={t.en} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-center">
              <Icon className="w-6 h-6 text-teal-600 mx-auto mb-2" aria-hidden="true" />
              <h3 className="font-semibold text-sm text-slate-900 mb-1">{en ? t.en : t.es}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{en ? d.en : d.es}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
