import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface ScopeBoundaryCardProps {
  variant?: 'compact' | 'full';
}

export default function ScopeBoundaryCard({ variant = 'full' }: ScopeBoundaryCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const canDo = en
    ? [
        'Explain legal concepts in plain language',
        'Help you understand your rights in general terms',
        'Generate document drafts and checklists',
        'Identify possible next steps for your situation',
        'Connect you with attorney directories',
      ]
    : [
        'Explicar conceptos legales en lenguaje simple',
        'Ayudarte a entender tus derechos en términos generales',
        'Generar borradores de documentos y listas de verificación',
        'Identificar posibles próximos pasos para tu situación',
        'Conectarte con directorios de abogados',
      ];

  const cannotDo = en
    ? [
        'Provide legal advice for your specific case',
        'Represent you in court or negotiations',
        'Guarantee any legal outcome',
        'Replace a licensed attorney',
      ]
    : [
        'Dar asesoría legal para tu caso específico',
        'Representarte en tribunal o negociaciones',
        'Garantizar resultados legales',
        'Reemplazar a un abogado licenciado',
      ];

  if (variant === 'compact') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm text-slate-700 font-medium">
              {en
                ? 'ezLegal provides legal information, not legal advice.'
                : 'ezLegal proporciona información legal, no asesoría legal.'}
            </p>
            <Link to="/trust-center" className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-1 inline-block">
              {en ? 'Learn more about our scope' : 'Conoce más sobre nuestro alcance'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">
        {en ? 'What ezLegal can and cannot do' : 'Qué puede y no puede hacer ezLegal'}
      </h3>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            {en ? 'We can help with' : 'Podemos ayudar con'}
          </h4>
          <ul className="space-y-2">
            {canDo.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" aria-hidden="true" />
            {en ? 'We cannot' : 'No podemos'}
          </h4>
          <ul className="space-y-2">
            {cannotDo.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        <Link to="/trust-center" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {en ? 'View full Trust Center' : 'Ver el Centro de Confianza completo'} &rarr;
        </Link>
      </div>
    </div>
  );
}
