import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Users, Briefcase, FileWarning, Globe, Shield, ArrowRight, ArrowLeft, AlertCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { trackEngagement, trackFunnelEvent } from '../../services/engagement-service';

type Category = 'housing' | 'family' | 'employment' | 'debt' | 'immigration' | 'criminal';
type Urgency = 'immediate' | 'upcoming' | 'planning';

const CATEGORIES = [
  { id: 'housing' as Category, icon: Home, color: 'sky', enLabel: 'Housing / Landlord', esLabel: 'Vivienda / Arrendador' },
  { id: 'family' as Category, icon: Users, color: 'rose', enLabel: 'Family Law', esLabel: 'Derecho Familiar' },
  { id: 'employment' as Category, icon: Briefcase, color: 'emerald', enLabel: 'Employment / Workplace', esLabel: 'Empleo / Trabajo' },
  { id: 'debt' as Category, icon: FileWarning, color: 'teal', enLabel: 'Debt / Collections', esLabel: 'Deudas / Cobros' },
  { id: 'immigration' as Category, icon: Globe, color: 'amber', enLabel: 'Immigration', esLabel: 'Inmigración' },
  { id: 'criminal' as Category, icon: Shield, color: 'slate', enLabel: 'Criminal / Traffic', esLabel: 'Penal / Tránsito' },
];

const URGENCY_OPTIONS = [
  { id: 'immediate' as Urgency, enLabel: 'Urgent (happening now or within days)', esLabel: 'Urgente (sucediendo ahora o en días)', color: 'red' },
  { id: 'upcoming' as Urgency, enLabel: 'Soon (within weeks)', esLabel: 'Pronto (en semanas)', color: 'amber' },
  { id: 'planning' as Urgency, enLabel: 'Planning ahead', esLabel: 'Planificando', color: 'green' },
];

export default function IndividualIntake() {
  const [step, setStep] = useState<'category' | 'urgency' | 'details'>('category');
  const [category, setCategory] = useState<Category | null>(null);
  const [urgency, setUrgency] = useState<Urgency | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'view',
      metadata: { persona: 'individual', step }
    });
  }, [step]);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'individual', step: 'category', selection: cat }
    });
    setStep('urgency');
  };

  const handleUrgencySelect = (urg: Urgency) => {
    setUrgency(urg);
    trackEngagement({
      featureName: 'persona_intake_step',
      engagementType: 'complete',
      metadata: { persona: 'individual', step: 'urgency', selection: urg }
    });
    setStep('details');
  };

  const handleContinue = () => {
    trackFunnelEvent('persona_intake_completed', {
      persona: 'individual',
      category,
      urgency
    });
    try {
      sessionStorage.setItem('ez_intake_data', JSON.stringify({
        persona: 'individual',
        category,
        urgency,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // sessionStorage disabled
    }
    navigate(`/ask/${category}`);
  };

  const handleBack = () => {
    if (step === 'urgency') {
      setStep('category');
      setUrgency(null);
    } else if (step === 'details') {
      setStep('urgency');
    }
  };

  if (step === 'category') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 1 of 3' : 'Paso 1 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'What type of legal issue do you have?' : '¿Qué tipo de problema legal tienes?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Choose the category that best matches your situation'
                : 'Elige la categoría que mejor se ajuste a tu situación'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en' ? 'Private by default • Legal information, not legal advice' : 'Privado por defecto • Información legal, no asesoría legal'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'We help you understand your options and next steps. No attorney-client relationship is created.'
                    : 'Te ayudamos a entender tus opciones y próximos pasos. No se crea relación abogado-cliente.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-teal-500/50 rounded-2xl p-6 text-left transition-all group"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-${cat.color}-500/20 mb-4 group-hover:scale-110 transition-transform`}>
                  <cat.icon className={`w-6 h-6 text-${cat.color}-400`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">
                  {language === 'en' ? cat.enLabel : cat.esLabel}
                </h3>
                <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-teal-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'urgency') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 2 of 3' : 'Paso 2 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'How urgent is this issue?' : '¿Qué tan urgente es este problema?'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us prioritize what information you need first'
                : 'Esto nos ayuda a priorizar qué información necesitas primero'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleUrgencySelect(opt.id)}
                className={`w-full bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-${opt.color}-500/50 rounded-2xl p-6 text-left transition-all group`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full bg-${opt.color}-500`}></div>
                    <span className="text-white font-semibold text-lg">
                      {language === 'en' ? opt.enLabel : opt.esLabel}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-navy-400 group-hover:text-teal-400 transition-colors" />
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

  if (step === 'details') {
    const selectedCategory = CATEGORIES.find(c => c.id === category);
    const selectedUrgency = URGENCY_OPTIONS.find(u => u.id === urgency);

    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Clock className="w-4 h-4" />
              {language === 'en' ? 'Step 3 of 3' : 'Paso 3 de 3'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {language === 'en' ? 'Great, we understand your situation' : 'Perfecto, entendemos tu situación'}
            </h2>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'Ready to get specific answers to your questions'
                : 'Listo para obtener respuestas específicas a tus preguntas'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-teal-400" />
              <h3 className="text-white font-semibold">
                {language === 'en' ? 'Your situation summary:' : 'Resumen de tu situación:'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {selectedCategory && <selectedCategory.icon className={`w-5 h-5 text-${selectedCategory.color}-400`} />}
                <span className="text-navy-100">
                  {language === 'en' ? selectedCategory?.enLabel : selectedCategory?.esLabel}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-${selectedUrgency?.color}-500`}></div>
                <span className="text-navy-100">
                  {language === 'en' ? selectedUrgency?.enLabel : selectedUrgency?.esLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl mb-4"
          >
            {language === 'en' ? 'Continue to Questions' : 'Continuar a Preguntas'}
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
