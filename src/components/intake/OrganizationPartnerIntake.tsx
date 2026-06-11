import { useState } from 'react';
import { ArrowRight, Building2, Globe, Scale, BarChart3, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { DATA_CONSENT_ORG } from '../../lib/intake/scopeBoundaries';
import { trackEvent } from '../../services/analytics-service';
import GuidedIntakeShell from './GuidedIntakeShell';
import PlainLanguageHelp from './PlainLanguageHelp';

type Step = 'org_type' | 'jurisdictions' | 'capacity' | 'data_consent' | 'confirmation';

const ORG_TYPES = [
  { id: 'legal_aid', labelEn: 'Legal aid organization', labelEs: 'Organización de ayuda legal', icon: Scale },
  { id: 'law_clinic', labelEn: 'Law school clinic', labelEs: 'Clínica de derecho', icon: Building2 },
  { id: 'bar_association', labelEn: 'Bar association', labelEs: 'Colegio de abogados', icon: Shield },
  { id: 'community_org', labelEn: 'Community organization', labelEs: 'Organización comunitaria', icon: Users },
  { id: 'court_self_help', labelEn: 'Court self-help center', labelEs: 'Centro de auto-ayuda judicial', icon: BarChart3 },
  { id: 'other', labelEn: 'Other organization', labelEs: 'Otra organización', icon: Globe },
];

const ISSUE_AREAS = [
  { id: 'housing', labelEn: 'Housing/Eviction', labelEs: 'Vivienda/Desalojo' },
  { id: 'family', labelEn: 'Family law', labelEs: 'Derecho familiar' },
  { id: 'employment', labelEn: 'Employment', labelEs: 'Empleo' },
  { id: 'immigration', labelEn: 'Immigration', labelEs: 'Inmigración' },
  { id: 'debt', labelEn: 'Debt/Consumer', labelEs: 'Deudas/Consumidor' },
  { id: 'criminal', labelEn: 'Criminal/Traffic', labelEs: 'Penal/Tránsito' },
  { id: 'benefits', labelEn: 'Public benefits', labelEs: 'Beneficios públicos' },
  { id: 'dv', labelEn: 'Domestic violence', labelEs: 'Violencia doméstica' },
];

const VOLUME_OPTIONS = [
  { id: 'low', labelEn: 'Under 50 intakes/month', labelEs: 'Menos de 50 admisiones/mes' },
  { id: 'mid', labelEn: '50-200 intakes/month', labelEs: '50-200 admisiones/mes' },
  { id: 'high', labelEn: '200-500 intakes/month', labelEs: '200-500 admisiones/mes' },
  { id: 'very_high', labelEn: '500+ intakes/month', labelEs: '500+ admisiones/mes' },
];

export default function OrganizationPartnerIntake() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [step, setStep] = useState<Step>('org_type');
  const [orgType, setOrgType] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [volume, setVolume] = useState('');
  const [languages, setLanguages] = useState<string[]>(['en']);
  const [acceptsReferrals, setAcceptsReferrals] = useState(false);
  const [requiresConflict, setRequiresConflict] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const stepIndex: Record<Step, number> = { org_type: 1, jurisdictions: 2, capacity: 3, data_consent: 4, confirmation: 5 };

  const handleBack = () => {
    const steps: Step[] = ['org_type', 'jurisdictions', 'capacity', 'data_consent', 'confirmation'];
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const toggleArea = (id: string) => {
    setSelectedAreas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  return (
    <GuidedIntakeShell
      icp="organization"
      currentStep={stepIndex[step]}
      totalSteps={5}
      showScopeBoundary={step === 'org_type'}
      onBack={stepIndex[step] > 1 ? handleBack : undefined}
      titleEn={
        step === 'org_type' ? 'Tell us about your organization' :
        step === 'jurisdictions' ? 'Legal areas and reach' :
        step === 'capacity' ? 'Intake capacity' :
        step === 'data_consent' ? 'Data and privacy' :
        'Partner profile complete'
      }
      titleEs={
        step === 'org_type' ? 'Cuéntenos sobre su organización' :
        step === 'jurisdictions' ? 'Áreas legales y alcance' :
        step === 'capacity' ? 'Capacidad de admisión' :
        step === 'data_consent' ? 'Datos y privacidad' :
        'Perfil de socio completo'
      }
    >
      {step === 'org_type' && (
        <div className="space-y-3">
          {ORG_TYPES.map((org) => {
            const Icon = org.icon;
            return (
              <button
                key={org.id}
                type="button"
                onClick={() => {
                  setOrgType(org.id);
                  trackEvent('org_partner_intake_started', { orgType: org.id });
                  setStep('jurisdictions');
                }}
                className="w-full flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <Icon className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="font-semibold text-slate-900 text-sm">{en ? org.labelEn : org.labelEs}</p>
              </button>
            );
          })}
        </div>
      )}

      {step === 'jurisdictions' && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {en ? 'Which legal areas do you serve?' : '¿Qué áreas legales atiende?'}
            </p>
            <p className="text-xs text-slate-500 mb-3">{en ? 'Select all that apply' : 'Seleccione todos los que aplican'}</p>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_AREAS.map((area) => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleArea(area.id)}
                  className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    selectedAreas.includes(area.id)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  {en ? area.labelEn : area.labelEs}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {en ? 'Languages supported' : 'Idiomas que soporta'}
            </p>
            <div className="flex gap-3">
              {[{ id: 'en', label: 'English' }, { id: 'es', label: 'Español' }, { id: 'other', label: en ? 'Other' : 'Otro' }].map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguages(prev => prev.includes(lang.id) ? prev.filter(l => l !== lang.id) : [...prev, lang.id])}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    languages.includes(lang.id)
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep('capacity')}
            disabled={selectedAreas.length === 0}
            className="w-full px-5 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {en ? 'Continue' : 'Continuar'}
          </button>
        </div>
      )}

      {step === 'capacity' && (
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-3">
              {en ? 'Current intake volume' : 'Volumen actual de admisiones'}
            </p>
            <div className="grid gap-2">
              {VOLUME_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setVolume(opt.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    volume === opt.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-700 hover:border-emerald-300'
                  }`}
                >
                  {en ? opt.labelEn : opt.labelEs}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptsReferrals}
                onChange={(e) => setAcceptsReferrals(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">
                {en ? 'We accept warm referrals from partner platforms' : 'Aceptamos referencias de plataformas asociadas'}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requiresConflict}
                onChange={(e) => setRequiresConflict(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">
                {en ? 'We require conflict checks before accepting referrals' : 'Requerimos verificación de conflictos antes de aceptar referencias'}
              </span>
            </label>
          </div>
          <PlainLanguageHelp
            questionEn="What are warm referrals?"
            questionEs="¿Qué son las referencias?"
            answerEn="When a user's situation matches your intake criteria, we can send you their basic information (with their consent) so you can follow up."
            answerEs="Cuando la situación de un usuario coincide con sus criterios de admisión, podemos enviarle su información básica (con su consentimiento) para que pueda dar seguimiento."
          />
          <button
            type="button"
            onClick={() => setStep('data_consent')}
            disabled={!volume}
            className="w-full px-5 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {en ? 'Continue' : 'Continuar'}
          </button>
        </div>
      )}

      {step === 'data_consent' && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {en ? 'Data handling and consent' : 'Manejo de datos y consentimiento'}
            </h3>
            {Object.entries(en ? DATA_CONSENT_ORG.en : DATA_CONSENT_ORG.es).map(([key, text]) => (
              <div key={key} className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="text-xs text-slate-700">{text}</p>
              </div>
            ))}
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-700">
              {en
                ? 'I understand and agree to these data handling practices for our organization.'
                : 'Entiendo y acepto estas prácticas de manejo de datos para nuestra organización.'}
            </span>
          </label>
          <button
            type="button"
            onClick={() => {
              trackEvent('org_partner_intake_completed', { orgType, areas: selectedAreas.join(','), volume, languages: languages.join(','), acceptsReferrals, requiresConflict });
              setStep('confirmation');
            }}
            disabled={!consentGiven}
            className="w-full px-5 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {en ? 'Complete partner profile' : 'Completar perfil de socio'}
          </button>
        </div>
      )}

      {step === 'confirmation' && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <h3 className="font-bold text-green-900 mb-2">
              {en ? 'Partner profile submitted' : 'Perfil de socio enviado'}
            </h3>
            <p className="text-sm text-green-800">
              {en
                ? 'Our partnerships team will review your information and reach out to schedule a walkthrough.'
                : 'Nuestro equipo de asociaciones revisará su información y se comunicará para agendar una presentación.'}
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-600">
              {en
                ? 'Designed to support reporting workflows. Exportable intake and referral data. Configurable outcome fields.'
                : 'Diseñado para apoyar flujos de informes. Datos de admisión y referencia exportables. Campos de resultados configurables.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/schedule-demo"
              onClick={() => trackEvent('org_demo_clicked', {})}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition text-sm"
            >
              {en ? 'Schedule a partner demo' : 'Agendar demostración para socios'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/ai-governance"
              onClick={() => trackEvent('org_governance_clicked', {})}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-sm"
            >
              {en ? 'Review AI governance' : 'Revisar gobernanza de IA'}
            </Link>
          </div>
        </div>
      )}
    </GuidedIntakeShell>
  );
}
