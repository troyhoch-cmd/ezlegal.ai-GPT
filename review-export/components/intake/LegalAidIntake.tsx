import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Layers, User, UserCheck, ArrowRight, ArrowLeft, Clock, Shield, Scale } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEngagement, trackFunnelEvent } from '../../services/engagement-service';

type WorkflowMode = 'individual-client' | 'bulk-triage' | 'self-help-support' | 'staff-assisted';
type Scale = 'low' | 'medium' | 'high' | 'very-high';

const WORKFLOW_MODES = [
  {
    id: 'individual-client' as WorkflowMode,
    icon: User,
    color: 'teal',
    enLabel: 'Individual Client Intake',
    esLabel: 'Ingreso de Cliente Individual',
    enDesc: 'One-on-one intake for a single client matter',
    esDesc: 'Ingreso individual para un caso de un solo cliente'
  },
  {
    id: 'bulk-triage' as WorkflowMode,
    icon: Layers,
    color: 'blue',
    enLabel: 'Group / Bulk Triage',
    esLabel: 'Clasificación Grupal / Masiva',
    enDesc: 'Process multiple clients or intake forms at once',
    esDesc: 'Procesar múltiples clientes o formularios de ingreso a la vez'
  },
  {
    id: 'self-help-support' as WorkflowMode,
    icon: Users,
    color: 'amber',
    enLabel: 'Self-Help / Clinic Support',
    esLabel: 'Apoyo de Autoayuda / Clínica',
    enDesc: 'Tools for walk-in clinics or self-help centers',
    esDesc: 'Herramientas para clínicas sin cita o centros de autoayuda'
  },
  {
    id: 'staff-assisted' as WorkflowMode,
    icon: UserCheck,
    color: 'emerald',
    enLabel: 'Staff-Assisted Workflow',
    esLabel: 'Flujo Asistido por Personal',
    enDesc: 'Intake with staff oversight and review',
    esDesc: 'Ingreso con supervisión y revisión del personal'
  },
];

const SCALE_OPTIONS = [
  {
    id: 'low' as Scale,
    enLabel: '1-10 matters per week',
    esLabel: '1-10 casos por semana',
    color: 'green'
  },
  {
    id: 'medium' as Scale,
    enLabel: '10-50 matters per week',
    esLabel: '10-50 casos por semana',
    color: 'blue'
  },
  {
    id: 'high' as Scale,
    enLabel: '50-100 matters per week',
    esLabel: '50-100 casos por semana',
    color: 'amber'
  },
  {
    id: 'very-high' as Scale,
    enLabel: '100+ matters per week',
    esLabel: '100+ casos por semana',
    color: 'red'
  },
];

export default function LegalAidIntake() {
  const [step, setStep] = useState<'workflow' | 'scale' | 'summary'>('workflow');
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode | null>(null);
  const [scale, setScale] = useState<Scale | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'view',
      metadata: { persona: 'legal-aid', step }
    });
  }, [step]);

  const handleWorkflowSelect = (mode: WorkflowMode) => {
    setWorkflowMode(mode);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'legal-aid', step: 'workflow', selection: mode }
    });
    setStep('scale');
  };

  const handleScaleSelect = (scaleValue: Scale) => {
    setScale(scaleValue);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'legal-aid', step: 'scale', selection: scaleValue }
    });
    setStep('summary');
  };

  const handleContinue = () => {
    trackFunnelEvent('persona_intake_completed', {
      persona: 'legal-aid',
      workflowMode,
      scale
    });
    try {
      sessionStorage.setItem('ez_intake_data', JSON.stringify({
        persona: 'legal-aid',
        workflowMode,
        scale,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // sessionStorage disabled
    }

    if (workflowMode === 'individual-client') {
      navigate('/pro-bono-intake');
    } else {
      navigate('/partner-hub');
    }
  };

  const handleBack = () => {
    if (step === 'scale') {
      setStep('workflow');
      setScale(null);
    } else if (step === 'summary') {
      setStep('scale');
    }
  };

  if (step === 'workflow') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 1 of 3' : 'Paso 1 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Select your workflow mode' : 'Selecciona tu modo de flujo de trabajo'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Choose the workflow that best fits how you serve clients'
                : 'Elige el flujo de trabajo que mejor se adapte a cómo sirves a los clientes'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en'
                    ? 'Designed for ethical access to justice • Compliant with LSO guidelines'
                    : 'Diseñado para acceso ético a la justicia • Cumple con las pautas de LSO'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'Built specifically for legal aid organizations, pro bono programs, and access to justice initiatives.'
                    : 'Construido específicamente para organizaciones de asistencia legal, programas pro bono e iniciativas de acceso a la justicia.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {WORKFLOW_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleWorkflowSelect(mode.id)}
                className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${mode.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <mode.icon className={`w-6 h-6 text-${mode.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {language === 'en' ? mode.enLabel : mode.esLabel}
                </h3>
                <p className="text-navy-300 text-sm mb-3">
                  {language === 'en' ? mode.enDesc : mode.esDesc}
                </p>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'scale') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 2 of 3' : 'Paso 2 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What is your typical volume?' : '¿Cuál es tu volumen típico?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us optimize the workflow for your organization'
                : 'Esto nos ayuda a optimizar el flujo de trabajo para tu organización'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {SCALE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleScaleSelect(opt.id)}
                className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-${opt.color}-500/50 rounded-2xl p-6 text-left transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-${opt.color}-500`}></div>
                    <span className="text-white font-semibold text-lg">
                      {language === 'en' ? opt.enLabel : opt.esLabel}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-emerald-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to workflow modes' : 'Volver a modos de flujo de trabajo'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const selectedWorkflow = WORKFLOW_MODES.find(w => w.id === workflowMode);
    const selectedScale = SCALE_OPTIONS.find(s => s.id === scale);

    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 3 of 3' : 'Paso 3 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Workflow configured' : 'Flujo de trabajo configurado'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Ready to start processing client matters efficiently'
                : 'Listo para empezar a procesar casos de clientes eficientemente'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-semibold">
                {language === 'en' ? 'Your configuration:' : 'Tu configuración:'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedWorkflow && <selectedWorkflow.icon className={`w-5 h-5 text-${selectedWorkflow.color}-400`} />}
                <span className="text-navy-100">
                  {language === 'en' ? selectedWorkflow?.enLabel : selectedWorkflow?.esLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${selectedScale?.color}-500`}></div>
                <span className="text-navy-100">
                  {language === 'en' ? selectedScale?.enLabel : selectedScale?.esLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-200 font-medium text-sm mb-1">
                  {language === 'en' ? 'Access to justice focused' : 'Enfocado en acceso a la justicia'}
                </p>
                <p className="text-emerald-300/80 text-xs">
                  {language === 'en'
                    ? 'All outputs include oversight flags, ethical disclosures, and are designed for attorney review.'
                    : 'Todas las salidas incluyen marcadores de supervisión, divulgaciones éticas y están diseñadas para revisión de abogados.'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
          >
            {language === 'en'
              ? (workflowMode === 'individual-client' ? 'Start Client Intake' : 'Go to Partner Hub')
              : (workflowMode === 'individual-client' ? 'Iniciar Ingreso de Cliente' : 'Ir al Centro de Socios')}
          </button>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back' : 'Atrás'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
