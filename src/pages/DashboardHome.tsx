import { Link } from 'react-router-dom';
import {
  MessageSquare,
  FileText,
  Users,
  Clock,
  ArrowRight,
  Shield,
  Sparkles,
  Calendar,
  Scale,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface QuickAction {
  id: string;
  icon: typeof MessageSquare;
  label: { en: string; es: string };
  description: { en: string; es: string };
  href: string;
  color: string;
  primary?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-question',
    icon: Sparkles,
    label: { en: 'Ask a legal question', es: 'Hacer una pregunta legal' },
    description: { en: 'Get instant guidance on your situation', es: 'Obtén orientación instantánea sobre tu situación' },
    href: '/chat',
    color: 'bg-teal-600 hover:bg-teal-700 text-white',
    primary: true,
  },
  {
    id: 'documents',
    icon: FileText,
    label: { en: 'My Documents', es: 'Mis Documentos' },
    description: { en: 'Uploads, drafts, and generated forms', es: 'Cargas, borradores y formularios generados' },
    href: '/dashboard/documents',
    color: 'bg-white hover:bg-slate-50 text-navy-900 border border-slate-200',
  },
  {
    id: 'history',
    icon: Clock,
    label: { en: 'Past Questions', es: 'Preguntas Anteriores' },
    description: { en: 'Review previous consultations', es: 'Revisa consultas anteriores' },
    href: '/dashboard/history',
    color: 'bg-white hover:bg-slate-50 text-navy-900 border border-slate-200',
  },
  {
    id: 'find-help',
    icon: Users,
    label: { en: 'Find Legal Help', es: 'Encontrar Ayuda Legal' },
    description: { en: 'Attorneys, legal aid, and pro bono', es: 'Abogados, ayuda legal y pro bono' },
    href: '/find-attorney',
    color: 'bg-white hover:bg-slate-50 text-navy-900 border border-slate-200',
  },
];

interface RecentMatter {
  id: string;
  title: { en: string; es: string };
  status: 'active' | 'needs_review' | 'referred' | 'resolved';
  lastUpdated: string;
  nextStep: { en: string; es: string };
}

const SAMPLE_MATTERS: RecentMatter[] = [
  {
    id: '1',
    title: { en: 'Review eviction notice deadline', es: 'Revisar fecha límite de aviso de desalojo' },
    status: 'active',
    lastUpdated: '2026-06-05',
    nextStep: { en: 'Prepare response letter', es: 'Preparar carta de respuesta' },
  },
  {
    id: '2',
    title: { en: 'Employment complaint filing', es: 'Presentación de queja laboral' },
    status: 'needs_review',
    lastUpdated: '2026-06-03',
    nextStep: { en: 'Human review in progress', es: 'Revisión humana en progreso' },
  },
  {
    id: '3',
    title: { en: 'Small claims preparation', es: 'Preparación de reclamo menor' },
    status: 'resolved',
    lastUpdated: '2026-05-28',
    nextStep: { en: 'Documents ready for filing', es: 'Documentos listos para presentar' },
  },
];

const STATUS_STYLES: Record<string, { label: { en: string; es: string }; class: string }> = {
  active: { label: { en: 'Active', es: 'Activo' }, class: 'bg-teal-50 text-teal-700 border-teal-200' },
  needs_review: { label: { en: 'In Review', es: 'En Revisión' }, class: 'bg-amber-50 text-amber-700 border-amber-200' },
  referred: { label: { en: 'Referred', es: 'Referido' }, class: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved: { label: { en: 'Resolved', es: 'Resuelto' }, class: 'bg-green-50 text-green-700 border-green-200' },
};

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';

  const displayName = profile?.full_name || user?.email?.split('@')[0] || (en ? 'there' : 'usuario');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <section className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">
          {en ? `Welcome back, ${displayName}` : `Bienvenido, ${displayName}`}
        </h1>
        <p className="mt-1 text-navy-600 text-sm sm:text-base">
          {en
            ? 'Your legal help dashboard. Pick up where you left off or start something new.'
            : 'Tu panel de ayuda legal. Continúa donde te quedaste o comienza algo nuevo.'}
        </p>
      </section>

      {/* Quick Actions */}
      <section className="mb-10" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="sr-only">
          {en ? 'Quick actions' : 'Acciones rápidas'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.href}
                className={`group flex flex-col gap-3 p-5 rounded-xl transition-all shadow-sm hover:shadow-md ${action.color}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 ${action.primary ? 'text-white' : 'text-teal-600'}`} aria-hidden="true" />
                  <span className="font-semibold text-sm">{action.label[language]}</span>
                </div>
                <p className={`text-xs leading-relaxed ${action.primary ? 'text-teal-100' : 'text-navy-500'}`}>
                  {action.description[language]}
                </p>
                <ArrowRight
                  className={`w-4 h-4 mt-auto self-end opacity-0 group-hover:opacity-100 transition-opacity ${
                    action.primary ? 'text-teal-200' : 'text-teal-600'
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Matters - Left 2 columns */}
        <section className="lg:col-span-2 space-y-6">
          {/* Recent Matters */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-teal-600" aria-hidden="true" />
                {en ? 'My Legal Matters' : 'Mis Asuntos Legales'}
              </h2>
              <Link
                to="/dashboard/matters"
                className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
              >
                {en ? 'View all' : 'Ver todos'}
              </Link>
            </div>

            {SAMPLE_MATTERS.length > 0 ? (
              <ul className="space-y-3" role="list">
                {SAMPLE_MATTERS.map((matter) => {
                  const status = STATUS_STYLES[matter.status];
                  return (
                    <li key={matter.id}>
                      <Link
                        to={`/dashboard/matters`}
                        className="flex items-start justify-between gap-4 p-4 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-navy-900 text-sm truncate group-hover:text-teal-700 transition-colors">
                            {matter.title[language]}
                          </p>
                          <p className="text-xs text-navy-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {new Date(matter.lastUpdated).toLocaleDateString(en ? 'en-US' : 'es-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                            <span className="mx-1 text-slate-300">|</span>
                            {matter.nextStep[language]}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.class}`}>
                          {status.label[language]}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Scale className="w-8 h-8 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-navy-500">
                  {en
                    ? 'No matters yet. Ask a question to get started.'
                    : 'Sin asuntos aún. Haz una pregunta para comenzar.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Plan */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" aria-hidden="true" />
                {en ? 'Next Steps' : 'Próximos Pasos'}
              </h2>
              <Link
                to="/dashboard/action-plan"
                className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
              >
                {en ? 'Full plan' : 'Plan completo'}
              </Link>
            </div>
            <ul className="space-y-2" role="list">
              <li className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="text-sm text-navy-800">
                  {en ? 'Respond to eviction notice by Jun 15' : 'Responder al aviso de desalojo antes del 15 de junio'}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0" />
                <span className="text-sm text-navy-800">
                  {en ? 'Gather pay stubs for employment claim' : 'Reunir recibos de pago para reclamo laboral'}
                </span>
              </li>
              <li className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                <span className="text-sm text-navy-800 line-through text-navy-400">
                  {en ? 'File small claims form' : 'Presentar formulario de reclamo menor'}
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Account Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-3">
              {en ? 'Your Plan' : 'Tu Plan'}
            </h3>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-navy-500">{en ? 'Current plan' : 'Plan actual'}</span>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {profile?.subscription_tier || 'Free'}
              </span>
            </div>
            <Link
              to="/pricing"
              className="block w-full text-center text-xs font-medium text-teal-600 hover:text-teal-800 border border-teal-200 hover:border-teal-300 rounded-lg py-2 transition-colors"
            >
              {en ? 'View plans' : 'Ver planes'}
            </Link>
          </div>

          {/* Referrals Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" aria-hidden="true" />
              {en ? 'Legal Help & Referrals' : 'Ayuda Legal y Referencias'}
            </h3>
            <p className="text-xs text-navy-500 mb-3">
              {en
                ? 'Find free or low-cost legal help near you.'
                : 'Encuentra ayuda legal gratuita o de bajo costo cerca de ti.'}
            </p>
            <Link
              to="/find-attorney"
              className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
            >
              {en ? 'Browse legal help' : 'Buscar ayuda legal'}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Urgent Help Card */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-red-800 mb-2">
              {en ? 'Need urgent help?' : '¿Necesitas ayuda urgente?'}
            </h3>
            <p className="text-xs text-red-700 mb-3">
              {en
                ? 'Crisis hotlines, safety planning, and emergency resources are always free.'
                : 'Líneas de crisis, planes de seguridad y recursos de emergencia siempre son gratuitos.'}
            </p>
            <Link
              to="/urgent-help"
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 transition-colors"
            >
              {en ? 'Get urgent help now' : 'Obtener ayuda urgente ahora'}
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          {/* Trust & Safety Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
              {en ? 'Trust & Safety' : 'Confianza y Seguridad'}
            </h3>
            <p className="text-xs text-navy-600 leading-relaxed">
              {en
                ? 'ezLegal.ai provides legal information, not legal advice. For legal advice specific to your situation, consult a licensed attorney.'
                : 'ezLegal.ai proporciona información legal, no asesoría legal. Para asesoría específica a tu situación, consulta con un abogado licenciado.'}
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              <Link to="/scope-disclaimers" className="text-[11px] text-navy-500 hover:text-teal-600 transition-colors">
                {en ? 'Scope & limitations' : 'Alcance y limitaciones'}
              </Link>
              <Link to="/privacy-at-a-glance" className="text-[11px] text-navy-500 hover:text-teal-600 transition-colors">
                {en ? 'How we protect your data' : 'Cómo protegemos tus datos'}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
