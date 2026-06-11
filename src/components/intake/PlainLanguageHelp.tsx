import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface PlainLanguageHelpProps {
  questionEn: string;
  questionEs: string;
  answerEn: string;
  answerEs: string;
  variant?: 'tooltip' | 'expandable';
}

export default function PlainLanguageHelp({
  questionEn,
  questionEs,
  answerEn,
  answerEs,
  variant = 'expandable',
}: PlainLanguageHelpProps) {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const en = language === 'en';
  const question = en ? questionEn : questionEs;
  const answer = en ? answerEn : answerEs;

  if (variant === 'tooltip') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 group relative">
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="underline decoration-dotted cursor-help">{question}</span>
        <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-slate-800 text-white text-xs rounded-lg px-3 py-2 max-w-xs z-50 shadow-lg" role="tooltip">
          {answer}
        </span>
      </span>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
        aria-expanded={open}
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
        {question}
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <p className="mt-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          {answer}
        </p>
      )}
    </div>
  );
}
