import { Heart, Scale, Globe, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface AccessToJusticeCardProps {
  variant?: 'full' | 'compact';
  showProBono?: boolean;
}

export default function AccessToJusticeCard({ variant = 'full', showProBono = true }: AccessToJusticeCardProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (variant === 'compact') {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Heart className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-teal-800">
              {en ? 'Cannot afford a lawyer?' : 'No puedes pagar un abogado?'}
            </p>
            <p className="text-xs text-teal-700 mt-1">
              {en
                ? 'Free help is available. We screen for eligibility before showing paid options.'
                : 'Hay ayuda gratuita disponible. Evaluamos elegibilidad antes de mostrar opciones pagadas.'}
            </p>
            <div className="flex gap-3 mt-2">
              <Link to="/pro-bono" className="text-xs text-teal-700 hover:text-teal-900 font-medium underline">
                {en ? 'Free resources' : 'Recursos gratuitos'}
              </Link>
              <Link to="/legal-safety-net" className="text-xs text-teal-700 hover:text-teal-900 font-medium underline">
                {en ? 'Low-cost help' : 'Ayuda de bajo costo'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: DollarSign,
      titleEn: 'Free tier always available',
      titleEs: 'Nivel gratuito siempre disponible',
      descEn: 'Ask unlimited questions at no cost. No signup required.',
      descEs: 'Haz preguntas ilimitadas sin costo. No requiere registro.',
    },
    {
      icon: Scale,
      titleEn: 'Hardship screening first',
      titleEs: 'Evaluación de dificultad económica primero',
      descEn: 'We check if you qualify for free or reduced-cost help before showing paid options.',
      descEs: 'Verificamos si calificas para ayuda gratuita o de bajo costo antes de mostrar opciones pagadas.',
    },
    {
      icon: Globe,
      titleEn: 'Bilingual access',
      titleEs: 'Acceso bilingüe',
      descEn: 'Full platform support in English and Spanish.',
      descEs: 'Soporte completo de la plataforma en inglés y español.',
    },
    {
      icon: Heart,
      titleEn: 'Pro bono pathways',
      titleEs: 'Opciones pro bono',
      descEn: 'Connections to free legal assistance programs.',
      descEs: 'Conexiones a programas de asistencia legal gratuita.',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {en ? 'Access to Justice Commitment' : 'Compromiso de Acceso a la Justicia'}
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        {en
          ? 'Everyone deserves to understand their legal rights, regardless of ability to pay.'
          : 'Todos merecen entender sus derechos legales, sin importar su capacidad de pago.'}
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{en ? f.titleEn : f.titleEs}</p>
                <p className="text-xs text-slate-600 mt-0.5">{en ? f.descEn : f.descEs}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showProBono && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
          <Link
            to="/pro-bono"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            {en ? 'Find free help' : 'Encontrar ayuda gratuita'}
          </Link>
          <Link
            to="/legal-safety-net"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            {en ? 'Low-cost options' : 'Opciones de bajo costo'}
          </Link>
        </div>
      )}

      <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
        {en
          ? 'Free and emergency resources are never ranked by payment. Paid options appear only after eligibility screening.'
          : 'Los recursos gratuitos y de emergencia nunca se clasifican por pago. Las opciones pagadas aparecen solo despues de la evaluacion de elegibilidad.'}
      </p>
    </div>
  );
}
