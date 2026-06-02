import { Link } from 'react-router-dom';
import { ClipboardList, FileText, Bell, UserCheck, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const features = {
  en: [
    { icon: ClipboardList, label: 'Action plan status', desc: 'See what steps are done and what comes next.' },
    { icon: FileText, label: 'Documents checklist', desc: 'Track which documents you need and which are ready.' },
    { icon: Bell, label: 'Deadlines & reminders', desc: 'Never miss a court date or filing deadline.' },
    { icon: UserCheck, label: 'Human help options', desc: 'Legal aid, attorneys, and pro bono connections.' },
  ],
  es: [
    { icon: ClipboardList, label: 'Estado del plan', desc: 'Ve qu\u00e9 pasos est\u00e1n hechos y qu\u00e9 sigue.' },
    { icon: FileText, label: 'Lista de documentos', desc: 'Rastrea qu\u00e9 documentos necesitas y cu\u00e1les est\u00e1n listos.' },
    { icon: Bell, label: 'Plazos y recordatorios', desc: 'Nunca te pierdas una fecha de corte o plazo.' },
    { icon: UserCheck, label: 'Opciones de ayuda humana', desc: 'Ayuda legal, abogados y conexiones pro bono.' },
  ],
};

export function DashboardPreview() {
  const { language } = useLanguage();
  const en = language === 'en';
  const items = en ? features.en : features.es;

  return (
    <section className="py-10 sm:py-12" aria-labelledby="dashboard-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold text-teal-700 text-center mb-1 uppercase tracking-wide">
          {en ? 'For returning users' : 'Para usuarios que regresan'}
        </p>
        <h2 id="dashboard-heading" className="text-lg font-bold text-slate-900 text-center mb-2">
          {en ? 'Your legal action plan \u2014 saved and ready' : 'Tu plan de acci\u00f3n legal \u2014 guardado y listo'}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6 max-w-md mx-auto">
          {en ? 'After your first question, you get a personalized dashboard to track progress. Free. No sign-up to start.' : 'Despu\u00e9s de tu primera pregunta, obtienes un tablero personalizado. Gratis. Sin registro para empezar.'}
        </p>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/80">
                <Icon className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 text-center">
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
