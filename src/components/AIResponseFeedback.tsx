import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Flag } from 'lucide-react';

interface AIResponseFeedbackProps {
  messageId: string;
  language?: 'en' | 'es';
  compact?: boolean;
}

export default function AIResponseFeedback({ language = 'en', compact = false }: AIResponseFeedbackProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | 'reported' | null>(null);

  const handleFeedback = (type: 'positive' | 'negative' | 'reported') => {
    setFeedback(type);
  };

  if (feedback) {
    return (
      <p className="text-xs text-navy-400 mt-1">
        {feedback === 'reported'
          ? (language === 'es' ? 'Reportado. Gracias.' : 'Reported. Thank you.')
          : (language === 'es' ? 'Gracias por tu respuesta.' : 'Thanks for your feedback.')}
      </p>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${compact ? 'mt-1' : 'mt-2'}`}>
      <button
        type="button"
        onClick={() => handleFeedback('positive')}
        className="p-1 rounded hover:bg-navy-100 text-navy-400 hover:text-teal-600 transition-colors"
        aria-label={language === 'es' ? 'Respuesta útil' : 'Helpful response'}
        title={language === 'es' ? 'Útil' : 'Helpful'}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleFeedback('negative')}
        className="p-1 rounded hover:bg-navy-100 text-navy-400 hover:text-amber-600 transition-colors"
        aria-label={language === 'es' ? 'Respuesta no útil' : 'Not helpful'}
        title={language === 'es' ? 'No útil' : 'Not helpful'}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => handleFeedback('reported')}
        className="p-1 rounded hover:bg-navy-100 text-navy-400 hover:text-red-600 transition-colors"
        aria-label={language === 'es' ? 'Reportar respuesta incorrecta' : 'Report incorrect answer'}
        title={language === 'es' ? 'Reportar' : 'Report'}
      >
        <Flag className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
