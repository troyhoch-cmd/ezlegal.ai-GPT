import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const steps = {
  en: [
    { step: '1', title: 'Describe the problem', text: 'Tell us what happened in your own words — no legal terms needed.' },
    { step: '2', title: 'We ask only the key follow-up questions', text: 'Location, deadlines, and who is involved. Nothing unnecessary.' },
    { step: '3', title: 'Get plain-language next steps', text: 'What your issue might involve, what documents may be needed, and what deadlines may matter.' },
    { step: '4', title: 'Prepare documents or find human help', text: 'Self-guided tools, document prep, legal aid referrals, or attorney connections when needed.' },
  ],
  es: [
    { step: '1', title: 'Describe el problema', text: 'Cu\u00e9ntanos qu\u00e9 pas\u00f3 en tus propias palabras \u2014 no necesitas t\u00e9rminos legales.' },
    { step: '2', title: 'Hacemos solo las preguntas clave', text: 'Ubicaci\u00f3n, plazos y qui\u00e9n est\u00e1 involucrado. Nada innecesario.' },
    { step: '3', title: 'Recibe los siguientes pasos en lenguaje simple', text: 'Qu\u00e9 puede involucrar tu asunto, qu\u00e9 documentos pueden necesitarse y qu\u00e9 plazos importan.' },
    { step: '4', title: 'Prepara documentos o encuentra ayuda humana', text: 'Herramientas guiadas, preparaci\u00f3n de documentos, referencias a ayuda legal o conexi\u00f3n con abogados.' },
  ],
};

export function HowItWorksSteps() {
  const { language } = useLanguage();
  const en = language === 'en';
  const items = en ? steps.en : steps.es;

  return (
    <section className="py-10 sm:py-12 bg-white border-y border-slate-100" aria-labelledby="how-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold text-teal-700 text-center mb-1 uppercase tracking-wide">
          {en ? 'For anyone facing a legal question' : 'Para cualquier persona con una pregunta legal'}
        </p>
        <h2 id="how-heading" className="text-lg font-bold text-slate-900 text-center mb-1">
          {en ? 'How ezLegal handles your question' : 'C\u00f3mo ezLegal maneja tu pregunta'}
        </h2>
        <p className="text-xs text-slate-500 text-center mb-6">
          {en ? 'Free to start. Not legal advice. Human help when needed.' : 'Gratis para empezar. No es asesor\u00eda legal. Ayuda humana cuando sea necesario.'}
        </p>
        <ol className="space-y-5">
          {items.map(({ step, title, text }) => (
            <li key={step} className="flex items-start gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 font-bold text-sm">
                {step}
              </span>
              <div>
                <p className="font-semibold text-sm text-slate-900">{title}</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{text}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 text-center">
          <Link
            to="/start"
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 no-underline"
          >
            {en ? 'Start your legal checkup' : 'Inicia tu chequeo legal'}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
