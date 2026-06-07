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
  Inbox,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { DASHBOARD_CONFIGS } from '../data/dashboardConfig';
import type { UserType, DashboardMatter } from '../data/dashboardConfig';

const ICON_MAP: Record<string, typeof MessageSquare> = {
  MessageSquare,
  FileText,
  Users,
  Clock,
  Shield,
  Sparkles,
  Inbox,
  BarChart3,
  BookOpen,
  Scale,
};

const STATUS_STYLES: Record<string, { label: { en: string; es: string }; class: string }> = {
  active: { label: { en: 'Active', es: 'Activo' }, class: 'bg-teal-50 text-teal-700 border-teal-200' },
  needs_review: { label: { en: 'In Review', es: 'En Revisión' }, class: 'bg-amber-50 text-amber-700 border-amber-200' },
  referred: { label: { en: 'Referred', es: 'Referido' }, class: 'bg-blue-50 text-blue-700 border-blue-200' },
  resolved: { label: { en: 'Resolved', es: 'Resuelto' }, class: 'bg-green-50 text-green-700 border-green-200' },
};

function resolveIcon(name: string) {
  return ICON_MAP[name] || Sparkles;
}

function getDisplayName(profile: any, email: string | undefined, en: boolean): string {
  if (profile?.full_name) return profile.full_name.split(' ')[0];
  if (!email) return en ? 'there' : 'usuario';
  const local = email.split('@')[0];
  if (/^[a-zA-Z]+$/.test(local) && local.length > 2 && local.length < 20) {
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return en ? 'there' : 'usuario';
}

export default function DashboardHome() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';

  const userType: UserType = (profile?.user_type as UserType) || 'individual';
  const config = DASHBOARD_CONFIGS[userType];
  const displayName = getDisplayName(profile, user?.email, en);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <section className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900">
          {en ? `Welcome back, ${displayName}` : `Bienvenido, ${displayName}`}
        </h1>
        <p className="mt-1 text-navy-600 text-sm sm:text-base">
          {userType === 'business'
            ? (en ? 'Your business legal dashboard. Review contracts, check compliance, or ask a question.' : 'Tu panel legal empresarial. Revisa contratos, verifica cumplimiento o haz una pregunta.')
            : userType === 'organization'
            ? (en ? 'Your organization dashboard. Manage intakes, referrals, and reporting.' : 'Tu panel de organización. Gestiona admisiones, referencias y reportes.')
            : (en ? 'Your legal help dashboard. Pick up where you left off or start something new.' : 'Tu panel de ayuda legal. Continúa donde te quedaste o comienza algo nuevo.')}
        </p>
      </section>

      {/* Quick Actions */}
      <section className="mb-10" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="sr-only">
          {en ? 'Quick actions' : 'Acciones rápidas'}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.quickActions.map((action) => {
            const Icon = resolveIcon(action.icon);
            return (
              <Link
                key={action.id}
                to={action.href}
                className={`group flex flex-col gap-3 p-5 rounded-xl transition-all shadow-sm hover:shadow-md ${
                  action.primary
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-white hover:bg-slate-50 text-navy-900 border border-slate-200'
                }`}
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
          <MattersList
            heading={config.mattersHeading}
            matters={config.sampleMatters}
            language={language}
            en={en}
          />

          {userType === 'individual' && <NextSteps en={en} />}
          {userType === 'organization' && <CapacityOverview en={en} />}
        </section>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          <RightRail config={config} userType={userType} language={language} en={en} profile={profile} />
        </aside>
      </div>
    </div>
  );
}

function MattersList({ heading, matters, language, en }: {
  heading: { en: string; es: string };
  matters: DashboardMatter[];
  language: 'en' | 'es';
  en: boolean;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-teal-600" aria-hidden="true" />
          {heading[language]}
        </h2>
        <Link
          to="/dashboard/matters"
          className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
        >
          {en ? 'View all' : 'Ver todos'}
        </Link>
      </div>

      {matters.length > 0 ? (
        <ul className="space-y-3" role="list">
          {matters.map((matter) => {
            const status = STATUS_STYLES[matter.status];
            return (
              <li key={matter.id}>
                <Link
                  to="/dashboard/matters"
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
            {en ? 'No matters yet. Ask a question to get started.' : 'Sin asuntos aún. Haz una pregunta para comenzar.'}
          </p>
        </div>
      )}
    </div>
  );
}

function NextSteps({ en }: { en: boolean }) {
  return (
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
  );
}

function CapacityOverview({ en }: { en: boolean }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-600" aria-hidden="true" />
          {en ? 'Capacity Overview' : 'Vista de Capacidad'}
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 rounded-lg bg-teal-50 border border-teal-100">
          <p className="text-2xl font-bold text-teal-700">12</p>
          <p className="text-[11px] text-navy-600">{en ? 'Pending intakes' : 'Admisiones pendientes'}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-2xl font-bold text-amber-700">5</p>
          <p className="text-[11px] text-navy-600">{en ? 'In review' : 'En revisión'}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-green-50 border border-green-100">
          <p className="text-2xl font-bold text-green-700">28</p>
          <p className="text-[11px] text-navy-600">{en ? 'Resolved this month' : 'Resueltos este mes'}</p>
        </div>
      </div>
    </div>
  );
}

function RightRail({ config, userType, language, en, profile }: {
  config: typeof DASHBOARD_CONFIGS['individual'];
  userType: UserType;
  language: 'en' | 'es';
  en: boolean;
  profile: any;
}) {
  const { rightRail, trustCopy } = config;

  return (
    <>
      {rightRail.showPlanCard && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-3">
            {en ? 'Your Plan' : 'Tu Plan'}
          </h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-navy-500">{en ? 'Current plan' : 'Plan actual'}</span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              {profile?.subscription_tier === 'free' || !profile?.subscription_tier
                ? rightRail.planLabel[language]
                : profile.subscription_tier}
            </span>
          </div>
          <Link
            to={rightRail.planCTAHref}
            className="block w-full text-center text-xs font-medium text-teal-600 hover:text-teal-800 border border-teal-200 hover:border-teal-300 rounded-lg py-2 transition-colors"
          >
            {rightRail.planCTALabel[language]}
          </Link>
        </div>
      )}

      {rightRail.showReferrals && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" aria-hidden="true" />
            {en ? 'Legal Help & Referrals' : 'Ayuda Legal y Referencias'}
          </h3>
          <p className="text-xs text-navy-500 mb-3">
            {en ? 'Find free or low-cost legal help near you.' : 'Encuentra ayuda legal gratuita o de bajo costo cerca de ti.'}
          </p>
          <Link
            to="/find-attorney"
            className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
          >
            {en ? 'Browse legal help' : 'Buscar ayuda legal'}
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      )}

      {rightRail.showUrgentHelp && (
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
      )}

      {rightRail.showGovernance && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
            {en ? 'AI Governance' : 'Gobernanza de IA'}
          </h3>
          <p className="text-xs text-navy-500 mb-3">
            {en
              ? 'Review AI safety policies, audit logs, and compliance controls.'
              : 'Revisa políticas de seguridad de IA, registros de auditoría y controles de cumplimiento.'}
          </p>
          <Link
            to="/ai-governance"
            className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
          >
            {en ? 'View governance' : 'Ver gobernanza'}
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Trust & Safety - always visible */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-navy-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-600" aria-hidden="true" />
          {en ? 'Trust & Safety' : 'Confianza y Seguridad'}
        </h3>
        <p className="text-xs text-navy-600 leading-relaxed">
          {trustCopy[language]}
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
    </>
  );
}
