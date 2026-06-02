import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, FolderLock, CheckCircle2, AlertTriangle, Plus, ArrowRight, Activity, Bell, Clock, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import DeadlineDetailDrawer from '../components/DeadlineDetailDrawer';
import VaultUploader from '../components/VaultUploader';
import MonthlyCheckupFlow from '../components/MonthlyCheckupFlow';
import SafetyPlanChooser from '../components/SafetyPlanChooser';
import {
  computeHealthSnapshot,
  listMatters,
  listUpcomingDeadlines,
  listVaultItems,
  createMatter,
  completeDeadline,
  getEntitlements,
  type HealthSnapshot,
  type LegalMatter,
  type PlanEntitlements,
  type SafetyDeadline,
  type VaultItem,
} from '../services/safety-net-service';

function scoreColor(score: number): string {
  if (score >= 75) return 'text-teal-700 bg-teal-100';
  if (score >= 50) return 'text-amber-700 bg-amber-100';
  if (score >= 25) return 'text-orange-700 bg-orange-100';
  return 'text-rose-700 bg-rose-100';
}

function scoreRing(score: number): string {
  if (score >= 75) return 'stroke-teal-600';
  if (score >= 50) return 'stroke-amber-500';
  if (score >= 25) return 'stroke-orange-500';
  return 'stroke-rose-500';
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
}

export default function LegalSafetyNet() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const en = language === 'en';
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [matters, setMatters] = useState<LegalMatter[]>([]);
  const [deadlines, setDeadlines] = useState<SafetyDeadline[]>([]);
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [newMatterOpen, setNewMatterOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIssueType, setNewIssueType] = useState('general');
  const [entitlements, setEntitlements] = useState<PlanEntitlements | null>(null);
  const [activeDeadline, setActiveDeadline] = useState<SafetyDeadline | null>(null);
  const [showPlanChooser, setShowPlanChooser] = useState(false);

  async function refresh() {
    setLoading(true);
    const [h, m, d, v, e] = await Promise.all([
      computeHealthSnapshot(),
      listMatters(),
      listUpcomingDeadlines(60),
      listVaultItems(),
      getEntitlements(),
    ]);
    setHealth(h);
    setMatters(m);
    setDeadlines(d);
    setVault(v);
    setEntitlements(e);
    setLoading(false);
  }

  async function refreshVault() {
    const v = await listVaultItems();
    setVault(v);
  }

  useEffect(() => {
    if (user) refresh();
    else setLoading(false);
  }, [user]);

  async function handleCreateMatter(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createMatter({ title: newTitle.trim(), issue_type: newIssueType });
    setNewTitle('');
    setNewIssueType('general');
    setNewMatterOpen(false);
    refresh();
  }

  async function handleCompleteDeadline(id: string) {
    await completeDeadline(id);
    refresh();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Navigation />
        <section className="pt-32 pb-20 px-4 max-w-3xl mx-auto text-center">
          <Shield className="w-16 h-16 text-teal-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-navy-900 mb-4">
            {en ? 'Your Legal Safety Net' : 'Tu Red de Seguridad Legal'}
          </h1>
          <p className="text-lg text-navy-600 mb-8">
            {en
              ? 'Save legal matters, track deadlines, store documents, and know your next step. In plain English or Spanish.'
              : 'Guarda casos legales, da seguimiento a fechas, almacena documentos y conoce tu siguiente paso. En ingles o espanol.'}
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-xl">
            {en ? 'Create a free account' : 'Crea una cuenta gratis'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  const score = health?.score ?? 0;
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-navy-50">
      <Navigation />
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="inline-flex items-center gap-2 bg-teal-100 px-3 py-1 rounded-full mb-3">
            <Shield className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-semibold text-teal-900">
              {en ? 'Legal Safety Net' : 'Red de Seguridad Legal'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-2">
            {en ? 'Your legal dashboard' : 'Tu panel legal'}
          </h1>
          <p className="text-navy-600">
            {en
              ? 'Everything we are tracking for you, in one place.'
              : 'Todo lo que estamos rastreando para ti, en un solo lugar.'}
          </p>
        </header>

        {loading ? (
          <div className="py-16 text-center text-navy-500">
            {en ? 'Loading your dashboard...' : 'Cargando tu panel...'}
          </div>
        ) : (
          <>
            <section className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-1 bg-white rounded-2xl p-6 border border-navy-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-navy-900">
                    {en ? 'Legal Health Score' : 'Puntaje de Salud Legal'}
                  </h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" strokeWidth="8" className="stroke-navy-100" fill="none" />
                      <circle
                        cx="50" cy="50" r="44" strokeWidth="8" fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className={`${scoreRing(score)} transition-all duration-700`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-navy-900">{score}</div>
                        <div className="text-[10px] text-navy-500 uppercase tracking-wide">
                          {en ? 'of 100' : 'de 100'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`${scoreColor(score)} rounded-lg px-3 py-1 text-xs font-bold`}>
                    {score >= 75 ? (en ? 'Prepared' : 'Preparado')
                      : score >= 50 ? (en ? 'Getting there' : 'Avanzando')
                      : score >= 25 ? (en ? 'Needs attention' : 'Necesita atencion')
                      : (en ? 'Just starting' : 'Apenas empezando')}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-navy-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-navy-900">
                    {en ? 'Raise your score' : 'Mejora tu puntaje'}
                  </h2>
                </div>
                {health && health.recommendations.length === 0 ? (
                  <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-4">
                    <CheckCircle2 className="w-6 h-6 text-teal-600" />
                    <p className="text-sm text-teal-900">
                      {en
                        ? 'You are fully set up. We will alert you when something needs attention.'
                        : 'Estas completamente listo. Te avisaremos cuando algo necesite atencion.'}
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {health?.recommendations.map((r) => (
                      <li key={r.id}>
                        <Link
                          to={r.cta_route}
                          className="flex items-center justify-between gap-3 bg-navy-50 hover:bg-navy-100 rounded-xl p-3 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              +{r.weight}
                            </div>
                            <span className="text-sm text-navy-800 truncate">{en ? r.en : r.es}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-navy-400 flex-shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-4 mb-10">
              <StatCard
                icon={FolderLock}
                label={en ? 'Active matters' : 'Casos activos'}
                value={matters.filter(m => m.status === 'active' || m.status === 'escalated').length}
                accent="teal"
              />
              <StatCard
                icon={Calendar}
                label={en ? 'Deadlines (60 days)' : 'Fechas (60 dias)'}
                value={deadlines.length}
                accent="amber"
              />
              <StatCard
                icon={Shield}
                label={en ? 'Vault documents' : 'Documentos en boveda'}
                value={vault.length}
                accent="navy"
              />
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" />
                  {en ? 'Upcoming deadlines' : 'Proximas fechas'}
                </h2>
              </div>
              {deadlines.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-navy-200 text-center">
                  <Calendar className="w-8 h-8 text-navy-300 mx-auto mb-3" />
                  <p className="text-navy-600 text-sm">
                    {en
                      ? 'No deadlines tracked. Add one to any matter to get reminders before it matters.'
                      : 'Sin fechas rastreadas. Agrega una a cualquier caso para recibir recordatorios.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
                  <ul className="divide-y divide-navy-100">
                    {deadlines.map((d) => {
                      const days = daysUntil(d.due_at);
                      const urgent = days <= 3;
                      const overdue = days < 0;
                      return (
                        <li key={d.id} className="flex items-center gap-4 p-4 hover:bg-navy-50 cursor-pointer" onClick={() => setActiveDeadline(d)}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            overdue ? 'bg-rose-100 text-rose-700'
                              : urgent ? 'bg-amber-100 text-amber-700'
                              : 'bg-teal-100 text-teal-700'
                          }`}>
                            {overdue ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-navy-900 text-sm truncate">{d.title}</div>
                            <div className="text-xs text-navy-500">
                              {new Date(d.due_at).toLocaleDateString(en ? 'en-US' : 'es-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              {' \u2022 '}
                              {overdue ? (en ? `${-days}d overdue` : `${-days}d vencido`)
                                : days === 0 ? (en ? 'today' : 'hoy')
                                : (en ? `in ${days}d` : `en ${days}d`)}
                            </div>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveDeadline(d); }}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-900 px-3 py-1.5 rounded-md hover:bg-amber-50 flex items-center gap-1"
                          >
                            <Bell className="w-3.5 h-3.5" />
                            {en ? 'Remind' : 'Avisar'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCompleteDeadline(d.id); }}
                            className="text-xs font-semibold text-teal-700 hover:text-teal-900 px-3 py-1.5 rounded-md hover:bg-teal-50"
                          >
                            {en ? 'Mark done' : 'Marcar hecho'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <FolderLock className="w-5 h-5 text-teal-600" />
                  {en ? 'Your legal matters' : 'Tus casos legales'}
                </h2>
                <button
                  onClick={() => setNewMatterOpen(true)}
                  className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-3 py-2 rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                  {en ? 'New matter' : 'Nuevo caso'}
                </button>
              </div>

              {newMatterOpen && (
                <form onSubmit={handleCreateMatter} className="bg-white rounded-2xl p-5 border border-teal-200 mb-4">
                  <label className="block text-sm font-semibold text-navy-900 mb-1">
                    {en ? 'What do you want to track?' : 'Que quieres rastrear?'}
                  </label>
                  <input
                    autoFocus
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={en ? 'e.g. Eviction notice from landlord' : 'ej. Aviso de desalojo del arrendador'}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm mb-3"
                  />
                  <label className="block text-sm font-semibold text-navy-900 mb-1">
                    {en ? 'Issue type' : 'Tipo de problema'}
                  </label>
                  <select
                    value={newIssueType}
                    onChange={(e) => setNewIssueType(e.target.value)}
                    className="w-full px-3 py-2 border border-navy-200 rounded-lg text-sm mb-4"
                  >
                    <option value="general">{en ? 'General' : 'General'}</option>
                    <option value="housing">{en ? 'Housing / eviction' : 'Vivienda / desalojo'}</option>
                    <option value="employment">{en ? 'Employment' : 'Empleo'}</option>
                    <option value="immigration">{en ? 'Immigration' : 'Inmigracion'}</option>
                    <option value="family">{en ? 'Family law' : 'Derecho familiar'}</option>
                    <option value="debt">{en ? 'Debt / consumer' : 'Deudas / consumidor'}</option>
                    <option value="contract">{en ? 'Contract' : 'Contrato'}</option>
                    <option value="business">{en ? 'Business' : 'Negocios'}</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-2 rounded-lg">
                      {en ? 'Save matter' : 'Guardar caso'}
                    </button>
                    <button type="button" onClick={() => setNewMatterOpen(false)} className="px-4 border border-navy-200 text-navy-700 text-sm font-semibold rounded-lg">
                      {en ? 'Cancel' : 'Cancelar'}
                    </button>
                  </div>
                </form>
              )}

              {matters.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-navy-200 text-center">
                  <FolderLock className="w-8 h-8 text-navy-300 mx-auto mb-3" />
                  <p className="text-navy-600 text-sm mb-4">
                    {en
                      ? 'No saved matters yet. Save your first one so we can track deadlines, documents, and next steps for you.'
                      : 'Sin casos guardados. Guarda el primero y rastreamos fechas, documentos y siguientes pasos por ti.'}
                  </p>
                  <button
                    onClick={() => setNewMatterOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {en ? 'Save your first matter' : 'Guarda tu primer caso'}
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matters.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl p-5 border border-navy-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-navy-900 text-sm">{m.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.risk_level === 'urgent' ? 'bg-rose-100 text-rose-700'
                            : m.risk_level === 'high' ? 'bg-orange-100 text-orange-700'
                            : m.risk_level === 'medium' ? 'bg-amber-100 text-amber-700'
                            : 'bg-teal-100 text-teal-700'
                        }`}>
                          {m.risk_level.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-navy-500 mb-3 capitalize">
                        {m.issue_type}
                        {m.jurisdiction && ` \u2022 ${m.jurisdiction}`}
                      </div>
                      {m.next_step && (
                        <div className="bg-navy-50 rounded-lg p-3 text-xs">
                          <div className="text-[10px] font-bold text-navy-500 uppercase mb-0.5">
                            {en ? 'Next step' : 'Siguiente paso'}
                          </div>
                          <div className="text-navy-800">{m.next_step}</div>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-navy-100 flex items-center justify-between text-[10px] text-navy-500">
                        <span>{m.status}</span>
                        <span>{new Date(m.updated_at).toLocaleDateString(en ? 'en-US' : 'es-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section id="vault" className="grid md:grid-cols-5 gap-6 mb-10">
              <div className="md:col-span-3">
                <VaultUploader
                  items={vault}
                  entitlements={entitlements}
                  onChange={refreshVault}
                  onUpgrade={() => setShowPlanChooser(true)}
                />
              </div>
              <div className="md:col-span-2">
                <MonthlyCheckupFlow entitlements={entitlements} onComplete={refresh} />
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-teal-600" />
                  {en ? 'Your plan' : 'Tu plan'}
                </h2>
                <button
                  onClick={() => setShowPlanChooser((v) => !v)}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  {showPlanChooser ? (en ? 'Hide' : 'Ocultar') : (en ? 'Change plan' : 'Cambiar plan')}
                </button>
              </div>
              {entitlements && !showPlanChooser && (
                <div className="bg-white rounded-2xl p-5 border border-navy-200 flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-navy-500">{en ? 'Current plan' : 'Plan actual'}</div>
                    <div className="font-bold text-navy-900 capitalize">{entitlements.plan.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-navy-500">{en ? 'Vault' : 'Boveda'}</div>
                    <div className="text-navy-800">{entitlements.vault_mb_limit} MB</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-navy-500">{en ? 'Matters' : 'Casos'}</div>
                    <div className="text-navy-800">{entitlements.matter_limit}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-navy-500">{en ? 'Reminders' : 'Recordatorios'}</div>
                    <div className="text-navy-800 capitalize">{entitlements.reminder_channels.join(', ').replace(/_/g, ' ')}</div>
                  </div>
                </div>
              )}
              {showPlanChooser && (
                <SafetyPlanChooser current={entitlements} onChange={(next) => { setEntitlements(next); setShowPlanChooser(false); }} />
              )}
            </section>
          </>
        )}
      </div>
      {activeDeadline && (
        <DeadlineDetailDrawer
          deadline={activeDeadline}
          entitlements={entitlements}
          onClose={() => setActiveDeadline(null)}
        />
      )}
      <Footer />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof Shield; label: string; value: number; accent: 'teal' | 'amber' | 'navy' }) {
  const styles = {
    teal: 'bg-teal-100 text-teal-700',
    amber: 'bg-amber-100 text-amber-700',
    navy: 'bg-navy-100 text-navy-700',
  }[accent];
  return (
    <div className="bg-white rounded-2xl p-5 border border-navy-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${styles}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-navy-900">{value}</div>
          <div className="text-xs text-navy-500">{label}</div>
        </div>
      </div>
    </div>
  );
}
