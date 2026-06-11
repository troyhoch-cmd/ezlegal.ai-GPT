import { Bookmark, MessageSquare, Globe, UserCheck, Shield, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const reducers = {
  en: [
    { icon: Bookmark, label: 'Save your progress' },
    { icon: MessageSquare, label: 'Plain-language explanations' },
    { icon: Globe, label: 'Spanish-first support' },
    { icon: UserCheck, label: 'Human review available' },
    { icon: Shield, label: 'No retainer required' },
    { icon: Lock, label: 'Private and encrypted' },
  ],
  es: [
    { icon: Bookmark, label: 'Guarda tu progreso' },
    { icon: MessageSquare, label: 'Explicaciones en lenguaje simple' },
    { icon: Globe, label: 'Soporte en español' },
    { icon: UserCheck, label: 'Revisión humana disponible' },
    { icon: Shield, label: 'Sin anticipo requerido' },
    { icon: Lock, label: 'Privado y cifrado' },
  ],
};

export function RiskReducers() {
  const { language } = useLanguage();
  const en = language === 'en';
  const items = en ? reducers.en : reducers.es;

  return (
    <section className="py-8 sm:py-10 bg-white border-y border-slate-100" aria-labelledby="reducers-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="reducers-heading" className="text-lg font-bold text-slate-900 text-center mb-5">
          {en ? 'Why people trust ezLegal' : '¿Por qué la gente confía en ezLegal?'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
              <Icon className="w-4 h-4 text-teal-600 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs font-medium text-slate-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
