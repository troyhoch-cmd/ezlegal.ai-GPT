import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Scale, Users, Shield, Briefcase, AlertTriangle, ArrowRight, ArrowLeft, Clock, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEngagement, trackFunnelEvent } from '../../services/engagement-service';

type BusinessContext = 'contract' | 'dispute' | 'employment' | 'compliance' | 'formation' | 'other';
type Timeline = 'active-deadline' | 'planning' | 'ongoing';

const BUSINESS_CONTEXTS = [
  { id: 'contract' as BusinessContext, icon: FileText, color: 'blue', enLabel: 'Contract Review / Drafting', esLabel: 'Revisión / Redacción de Contratos' },
  { id: 'dispute' as BusinessContext, icon: Scale, color: 'red', enLabel: 'Business Dispute', esLabel: 'Disputa Comercial' },
  { id: 'employment' as BusinessContext, icon: Users, color: 'emerald', enLabel: 'Employment / HR Issue', esLabel: 'Problema de Empleo / RR.HH.' },
  { id: 'compliance' as BusinessContext, icon: Shield, color: 'amber', enLabel: 'Compliance / Regulations', esLabel: 'Cumplimiento / Regulaciones' },
  { id: 'formation' as BusinessContext, icon: Building2, color: 'teal', enLabel: 'Business Formation / Structure', esLabel: 'Formación / Estructura Empresarial' },
  { id: 'other' as BusinessContext, icon: Briefcase, color: 'slate', enLabel: 'Other Business Matter', esLabel: 'Otro Asunto Comercial' },
];

const TIMELINE_OPTIONS = [
  { id: 'active-deadline' as Timeline, enLabel: 'I have a deadline or notice', esLabel: 'Tengo un plazo o aviso', color: 'red', enDesc: 'Court date, contract deadline, or regulatory notice', esDesc: 'Fecha de corte, plazo contractual o aviso regulatorio' },
  { id: 'ongoing' as Timeline, enLabel: 'Ongoing issue that needs attention', esLabel: 'Problema en curso que necesita atención', color: 'amber', enDesc: 'Active dispute, employee matter, or vendor problem', esDesc: 'Disputa activa, asunto de empleado o problema con proveedor' },
  { id: 'planning' as Timeline, enLabel: 'Planning / preventative', esLabel: 'Planificación / preventivo', color: 'green', enDesc: 'Setting up policies, reviewing agreements, or planning ahead', esDesc: 'Estableciendo políticas, revisando acuerdos o planificando' },
];

export default function BusinessIntake() {
  const [step, setStep] = useState<'context' | 'timeline' | 'summary'>('context');
  const [context, setContext] = useState<BusinessContext | null>(null);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'view',
      metadata: { persona: 'business', step }
    });
  }, [step]);

  const handleContextSelect = (ctx: BusinessContext) => {
    setContext(ctx);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'business', step: 'context', selection: ctx }
    });
    setStep('timeline');
  };

  const handleTimelineSelect = (tl: Timeline) => {
    setTimeline(tl);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'business', step: 'timeline', selection: tl }
    });
    setStep('summary');
  };

  const handleContinue = () => {
    trackFunnelEvent('persona_intake_completed', {
      persona: 'business',
      context,
      timeline
    });
    try {
      sessionStorage.setItem('ez_intake_data', JSON.stringify({
        persona: 'business',
        context,
        timeline,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // sessionStorage disabled
    }
    navigate('/chat');
  };

  const handleBack = () => {
    if (step === 'timeline') {
      setStep('context');
      setTimeline(null);
    } else if (step === 'summary') {
      setStep('timeline');
    }
  };

  if (step === 'context') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 1 of 3' : 'Paso 1 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What type of business need is this?' : '¿Qué tipo de necesidad comercial es esta?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Select the category that best describes your business matter'
                : 'Selecciona la categoría que mejor describa tu asunto comercial'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en' ? 'Confidential • Business guidance only • Not legal advice' : 'Confidencial • Solo orientación comercial • No es asesoramiento legal'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'We help you understand your options and connect with the right legal resources.'
                    : 'Te ayudamos a entender tus opciones y conectarte con los recursos legales adecuados.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {BUSINESS_CONTEXTS.map((ctx) => (
              <button
                key={ctx.id}
                onClick={() => handleContextSelect(ctx.id)}
                className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-blue-500/50 rounded-2xl p-6 text-left transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${ctx.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <ctx.icon className={`w-6 h-6 text-${ctx.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  {language === 'en' ? ctx.enLabel : ctx.esLabel}
                </h3>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-blue-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'timeline') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 2 of 3' : 'Paso 2 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What is your timeline?' : '¿Cuál es tu cronograma?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us prioritize the most relevant guidance for your business'
                : 'Esto nos ayuda a priorizar la orientación más relevante para tu negocio'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {TIMELINE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleTimelineSelect(opt.id)}
                className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-${opt.color}-500/50 rounded-2xl p-6 text-left transition-all group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${opt.color}-500 mt-1`}></div>
                    <div>
                      <span className="text-white font-semibold text-lg block mb-1">
                        {language === 'en' ? opt.enLabel : opt.esLabel}
                      </span>
                      <span className="text-navy-300 text-sm">
                        {language === 'en' ? opt.enDesc : opt.esDesc}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-navy-300 hover:text-white transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to categories' : 'Volver a categorías'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    const selectedContext = BUSINESS_CONTEXTS.find(c => c.id === context);
    const selectedTimeline = TIMELINE_OPTIONS.find(t => t.id === timeline);

    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 3 of 3' : 'Paso 3 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Ready to get business guidance' : 'Listo para obtener orientación comercial'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? "We'll help you understand your options and next steps"
                : 'Te ayudaremos a entender tus opciones y próximos pasos'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">
                {language === 'en' ? 'Your business matter:' : 'Tu asunto comercial:'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedContext && <selectedContext.icon className={`w-5 h-5 text-${selectedContext.color}-400`} />}
                <span className="text-navy-100">
                  {language === 'en' ? selectedContext?.enLabel : selectedContext?.esLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${selectedTimeline?.color}-500`}></div>
                <span className="text-navy-100">
                  {language === 'en' ? selectedTimeline?.enLabel : selectedTimeline?.esLabel}
                </span>
              </div>
            </div>
          </div>

          {timeline === 'active-deadline' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-200 font-medium text-sm mb-1">
                    {language === 'en' ? 'Time-sensitive matter detected' : 'Asunto urgente detectado'}
                  </p>
                  <p className="text-red-300/80 text-xs">
                    {language === 'en'
                      ? 'Consider consulting with a business attorney if you have an active deadline or notice.'
                      : 'Considera consultar con un abogado comercial si tienes un plazo activo o aviso.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
          >
            {language === 'en' ? 'Start Business Chat' : 'Iniciar Chat Comercial'}
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
