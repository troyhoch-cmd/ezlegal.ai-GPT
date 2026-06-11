import { Database, Trash2, Lock, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface DataUsePlainLanguageProps {
  variant?: 'full' | 'compact';
}

export default function DataUsePlainLanguage({ variant = 'full' }: DataUsePlainLanguageProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  const points = [
    {
      icon: Database,
      titleEn: 'What we store',
      titleEs: 'Qué almacenamos',
      descEn: 'Only the information you provide during conversations and intake.',
      descEs: 'Solo la información que proporcionas durante conversaciones y admisión.',
    },
    {
      icon: Lock,
      titleEn: 'How we protect it',
      titleEs: 'Cómo lo protegemos',
      descEn: 'Encrypted in transit and at rest. Access is limited to what is needed to serve you.',
      descEs: 'Cifrado en tránsito y en reposo. El acceso se limita a lo necesario para ayudarte.',
    },
    {
      icon: Eye,
      titleEn: 'Who can see it',
      titleEs: 'Quién puede verlo',
      descEn: 'Only you. We do not share your data with third parties for marketing.',
      descEs: 'Solo tú. No compartimos tus datos con terceros para marketing.',
    },
    {
      icon: Trash2,
      titleEn: 'How to delete it',
      titleEs: 'Cómo eliminarlo',
      descEn: 'You can request full data deletion at any time.',
      descEs: 'Puedes solicitar la eliminación completa de datos en cualquier momento.',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="text-sm text-slate-700 mb-2 font-medium">
          {en ? 'Your data is yours.' : 'Tus datos son tuyos.'}
        </p>
        <ul className="space-y-1">
          <li className="text-xs text-slate-600 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-teal-600" aria-hidden="true" />
            {en ? 'Encrypted and private' : 'Cifrado y privado'}
          </li>
          <li className="text-xs text-slate-600 flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-teal-600" aria-hidden="true" />
            {en ? 'Never shared for marketing' : 'Nunca compartido para marketing'}
          </li>
          <li className="text-xs text-slate-600 flex items-center gap-1.5">
            <Trash2 className="w-3 h-3 text-teal-600" aria-hidden="true" />
            {en ? 'Delete anytime' : 'Elimina en cualquier momento'}
          </li>
        </ul>
        <Link to="/privacy" className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-2 inline-block">
          {en ? 'Privacy policy' : 'Política de privacidad'} &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-2">
        {en ? 'How your data is used' : 'Cómo se usan tus datos'}
      </h3>
      <p className="text-sm text-slate-600 mb-5">
        {en ? 'In plain language:' : 'En lenguaje simple:'}
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {points.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{en ? p.titleEn : p.titleEs}</p>
                <p className="text-xs text-slate-600 mt-0.5">{en ? p.descEn : p.descEs}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 pt-4 border-t border-slate-100">
        <Link to="/privacy" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
          {en ? 'Full privacy policy' : 'Política de privacidad completa'} &rarr;
        </Link>
        <Link to="/trust-center" className="text-sm text-slate-500 hover:text-slate-700 font-medium">
          {en ? 'Trust Center' : 'Centro de Confianza'} &rarr;
        </Link>
      </div>
    </div>
  );
}
