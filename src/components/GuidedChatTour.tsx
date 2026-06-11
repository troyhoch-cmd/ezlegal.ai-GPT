import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GuidedChatTour({ onComplete, onSkip }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          {en ? 'Welcome to ezLegal AI Chat' : 'Bienvenido al Chat de ezLegal AI'}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {en
            ? 'Ask any legal question in plain language. Our AI provides legal information tailored to your jurisdiction.'
            : 'Haga cualquier pregunta legal en lenguaje simple. Nuestra IA proporciona informacion legal adaptada a su jurisdiccion.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            {en ? 'Skip' : 'Omitir'}
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            {en ? 'Got it' : 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
}
