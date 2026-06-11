import { useLanguage } from '../contexts/LanguageContext';

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function DashboardOnboardingTour({ onComplete, onSkip }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-3">
          {en ? 'Welcome to Your Dashboard' : 'Bienvenido a tu Panel'}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {en
            ? 'This is your legal command center. Ask questions, generate documents, and track your progress all in one place.'
            : 'Este es tu centro de comando legal. Haz preguntas, genera documentos y sigue tu progreso en un solo lugar.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            {en ? 'Skip tour' : 'Omitir'}
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            {en ? 'Get started' : 'Comenzar'}
          </button>
        </div>
      </div>
    </div>
  );
}
