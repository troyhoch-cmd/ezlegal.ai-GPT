import { useState } from 'react';
import { AlertTriangle, Heart, DollarSign, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AffordabilityStatus, TriageRiskLevel } from '../../lib/intake/types';
import { resolveIntakeRoute } from '../../lib/intake/routes';
import { LEGAL_AID_CAUTION } from '../../lib/intake/scopeBoundaries';
import { trackEvent } from '../../services/analytics-service';
import GuidedIntakeShell from './GuidedIntakeShell';
import EmergencyTriageNotice from './EmergencyTriageNotice';
import PlainLanguageHelp from './PlainLanguageHelp';

interface SpanishTriageScreenProps {
  onComplete: (affordability: AffordabilityStatus, risk: TriageRiskLevel, jurisdiction: string) => void;
}

type Step = 'affordability' | 'deadline' | 'risk' | 'jurisdiction' | 'result';

export default function SpanishTriageScreen({ onComplete }: SpanishTriageScreenProps) {
  const [step, setStep] = useState<Step>('affordability');
  const [affordability, setAffordability] = useState<AffordabilityStatus | null>(null);
  const [hasDeadline, setHasDeadline] = useState<boolean | null>(null);
  const [risk, setRisk] = useState<TriageRiskLevel>('normal');
  const [jurisdiction, setJurisdiction] = useState('');

  const stepIndex = { affordability: 1, deadline: 2, risk: 3, jurisdiction: 4, result: 5 };
  const currentStep = stepIndex[step];

  const handleAffordability = (status: AffordabilityStatus) => {
    setAffordability(status);
    trackEvent('spanish_triage_started', { affordability: status });
    setStep('deadline');
  };

  const handleDeadline = (hasOne: boolean) => {
    setHasDeadline(hasOne);
    setStep('risk');
  };

  const handleRisk = (level: TriageRiskLevel) => {
    setRisk(level);
    if (level === 'emergency') {
      trackEvent('spanish_emergency_triage_shown', {});
      setStep('result');
    } else {
      setStep('jurisdiction');
    }
  };

  const handleJurisdiction = (state: string) => {
    setJurisdiction(state);
    setStep('result');
  };

  const handlePrevious = () => {
    const steps: Step[] = ['affordability', 'deadline', 'risk', 'jurisdiction', 'result'];
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const decision = affordability && risk
    ? resolveIntakeRoute('individual_es', affordability, risk)
    : null;

  return (
    <GuidedIntakeShell
      icp="individual_es"
      currentStep={currentStep}
      totalSteps={5}
      showEmergency={risk === 'emergency'}
      showScopeBoundary={currentStep === 1}
      onBack={currentStep > 1 ? handlePrevious : undefined}
      titleEs={
        step === 'affordability' ? 'Evaluación inicial' :
        step === 'deadline' ? 'Fechas importantes' :
        step === 'risk' ? 'Evaluación de riesgo' :
        step === 'jurisdiction' ? 'Su ubicación' :
        'Próximos pasos'
      }
      stepLabels={[
        { en: 'Affordability', es: 'Capacidad de pago' },
        { en: 'Deadlines', es: 'Fechas límite' },
        { en: 'Risk assessment', es: 'Evaluación de riesgo' },
        { en: 'Location', es: 'Ubicación' },
        { en: 'Next steps', es: 'Próximos pasos' },
      ]}
    >
      {step === 'affordability' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            ¿Puede pagar ayuda legal en este momento?
          </p>
          <PlainLanguageHelp
            questionEn="Why we ask this"
            questionEs="¿Por qué preguntamos esto?"
            answerEn="We ask so we can show you free or low-cost options first if payment is difficult."
            answerEs="Preguntamos para poder mostrarle opciones gratuitas o de bajo costo primero si el pago es difícil."
          />
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => handleAffordability('cannot_pay')}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <Heart className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">No puedo pagar en este momento</p>
                <p className="text-xs text-slate-600 mt-0.5">Le mostraremos ayuda gratuita primero</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleAffordability('low_cost_needed')}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <DollarSign className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">Necesito opciones de bajo costo</p>
                <p className="text-xs text-slate-600 mt-0.5">Verá opciones gratuitas y de bajo costo</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleAffordability('can_pay')}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/50 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <DollarSign className="w-5 h-5 text-green-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">Puedo pagar servicios</p>
                <p className="text-xs text-slate-600 mt-0.5">Verá todas las opciones disponibles</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'deadline' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            ¿Su problema tiene una fecha límite próxima?
          </p>
          <PlainLanguageHelp
            questionEn="Why we ask this"
            questionEs="¿Por qué preguntamos esto?"
            answerEn="Deadlines can change your legal options. Court dates, eviction notices, and filing deadlines are time-sensitive."
            answerEs="Las fechas límite pueden cambiar sus opciones legales. Fechas de tribunal, avisos de desalojo y plazos de presentación son urgentes."
          />
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => handleDeadline(true)}
              className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:border-amber-300 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-slate-900">Sí, tengo una fecha límite</p>
                <p className="text-xs text-slate-600 mt-0.5">Fecha de tribunal, desalojo, u otro plazo</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleDeadline(false)}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-300 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">No, no tengo fecha límite ahora</p>
                <p className="text-xs text-slate-600 mt-0.5">Puedo tomarme un poco de tiempo</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'risk' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            ¿Hay riesgo de desalojo, violencia, pérdida de custodia, arresto, o daño inmediato?
          </p>
          <PlainLanguageHelp
            questionEn="Why we ask this"
            questionEs="¿Por qué preguntamos esto?"
            answerEn="If you are in danger, we need to show you emergency resources immediately."
            answerEs="Si está en peligro, necesitamos mostrarle recursos de emergencia inmediatamente."
          />
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => handleRisk('emergency')}
              className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50/50 hover:border-red-300 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-red-900">Sí, hay peligro inmediato</p>
                <p className="text-xs text-red-700 mt-0.5">Desalojo, violencia, custodia, arresto</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleRisk(hasDeadline ? 'urgent' : 'normal')}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-teal-300 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">No, no hay peligro inmediato</p>
                <p className="text-xs text-slate-600 mt-0.5">Mi situación es difícil pero no peligrosa</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 'jurisdiction' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-700 font-medium">
            ¿En qué estado vive?
          </p>
          <PlainLanguageHelp
            questionEn="Why we ask this"
            questionEs="¿Por qué preguntamos esto?"
            answerEn="Laws vary by state. This helps us provide relevant information."
            answerEs="Las leyes varían por estado. Esto nos ayuda a dar información relevante."
          />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <select
              value={jurisdiction}
              onChange={(e) => handleJurisdiction(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              aria-label="Seleccionar estado"
            >
              <option value="">Seleccionar estado...</option>
              <option value="AZ">Arizona</option>
              <option value="CA">California</option>
              <option value="FL">Florida</option>
              <option value="IL">Illinois</option>
              <option value="NY">New York</option>
              <option value="TX">Texas</option>
              <option value="other">Otro estado</option>
            </select>
          </div>
        </div>
      )}

      {step === 'result' && risk === 'emergency' && (
        <div className="space-y-5">
          <EmergencyTriageNotice variant="card" />
          <p className="text-sm text-slate-600">
            No le llevaremos a pagar. Primero, aquí hay recursos gratuitos y confidenciales.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to="/emergency-resources"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-700 text-white font-semibold rounded-lg hover:bg-red-800 transition text-sm"
            >
              Ver recursos de emergencia
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pro-bono?lang=es"
              onClick={() => trackEvent('spanish_free_help_selected', {})}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-sm"
            >
              Buscar ayuda legal gratuita
            </Link>
          </div>
        </div>
      )}

      {step === 'result' && risk !== 'emergency' && decision && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-900 mb-2">Qué pasa ahora</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 mt-0.5">1.</span>
                Le mostraremos opciones según su situación
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 mt-0.5">2.</span>
                Puede elegir recursos gratuitos, documentos, o ayuda de abogado
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 mt-0.5">3.</span>
                Su información se guarda solo en este dispositivo
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600 mt-0.5">4.</span>
                Si necesita un abogado, le ayudamos a encontrar uno
              </li>
            </ul>
          </div>

          {affordability === 'cannot_pay' && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-sm text-teal-800 font-medium mb-1">Opciones gratuitas disponibles</p>
              <p className="text-xs text-teal-700">{LEGAL_AID_CAUTION.es}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {affordability === 'cannot_pay' && (
              <Link
                to="/pro-bono?lang=es"
                onClick={() => trackEvent('spanish_free_help_selected', {})}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition text-sm"
              >
                Ver ayuda gratuita
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            {affordability === 'low_cost_needed' && (
              <>
                <Link
                  to="/pro-bono?lang=es"
                  onClick={() => trackEvent('spanish_free_help_selected', {})}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition text-sm"
                >
                  Ver opciones gratuitas y de bajo costo
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('spanish_paid_document_selected', {});
                    onComplete(affordability, risk, jurisdiction);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-sm"
                >
                  También ver documentos de pago
                </button>
              </>
            )}
            {affordability === 'can_pay' && (
              <button
                type="button"
                onClick={() => {
                  trackEvent('spanish_paid_document_selected', {});
                  onComplete(affordability, risk, jurisdiction);
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition text-sm"
              >
                Continuar a opciones de documentos
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <p className="text-xs text-slate-500">
              <strong>Lo que guardamos:</strong> Solo sus respuestas en este dispositivo. No se envía a ningún servidor hasta que usted lo decida.
            </p>
            <p className="text-xs text-slate-500">
              <strong>Cuándo hablar con un abogado:</strong> Si tiene una fecha de tribunal, enfrenta cargos penales, o necesita que alguien le represente.
            </p>
            <p className="text-xs text-slate-500">
              <strong>Cómo volver:</strong> Su progreso se guarda automáticamente. Puede cerrar y regresar después.
            </p>
          </div>
        </div>
      )}
    </GuidedIntakeShell>
  );
}
