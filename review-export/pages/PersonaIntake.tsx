import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Users, ArrowRight, Shield } from 'lucide-react';
import { usePersona } from '../contexts/PersonaContext';
import { useLanguage } from '../contexts/LanguageContext';
import { trackFeatureView, trackFunnelEvent } from '../services/engagement-service';
import IndividualIntake from '../components/intake/IndividualIntake';
import BusinessIntake from '../components/intake/BusinessIntake';
import LegalAidIntake from '../components/intake/LegalAidIntake';

export default function PersonaIntake() {
  const { persona, setPersona } = usePersona();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (!persona) {
      setShowSelector(true);
      trackFeatureView('persona_selector', { from: 'start_page' });
    } else {
      trackFunnelEvent('persona_selected', {
        persona,
        preSelected: true
      });
    }
  }, [persona]);

  const handlePersonaSelect = (selectedPersona: 'individual' | 'business' | 'legal-aid') => {
    setPersona(selectedPersona);
    trackFunnelEvent('persona_selected', {
      persona: selectedPersona,
      preSelected: false
    });
    setShowSelector(false);
  };

  if (showSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {language === 'en' ? 'Who are you here for today?' : '¿Para quién estás aquí hoy?'}
            </h1>
            <p className="text-navy-200 text-lg">
              {language === 'en'
                ? 'This helps us tailor examples and documents. You can change it later.'
                : 'Esto nos ayuda a personalizar ejemplos y documentos. Puedes cambiarlo más tarde.'}
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-medium text-sm">
                  {language === 'en'
                    ? 'Private by default • Not legal advice'
                    : 'Privado por defecto • No es asesoramiento legal'}
                </p>
                <p className="text-navy-300 text-xs mt-1">
                  {language === 'en'
                    ? 'We provide legal information to help you understand your options and next steps.'
                    : 'Proporcionamos información legal para ayudarte a entender tus opciones y próximos pasos.'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            <button
              onClick={() => handlePersonaSelect('individual')}
              className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-teal-500/50 rounded-2xl p-6 text-center transition-all group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-teal-500/20 mb-3 group-hover:scale-110 transition-transform">
                <User className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {language === 'en' ? 'Individual' : 'Individual'}
              </h3>
              <p className="text-navy-300 text-sm">
                {language === 'en'
                  ? 'Personal legal matter'
                  : 'Asunto legal personal'}
              </p>
            </button>

            <button
              onClick={() => handlePersonaSelect('business')}
              className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500/20 mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {language === 'en' ? 'Small business' : 'Pequeña empresa'}
              </h3>
              <p className="text-navy-300 text-sm">
                {language === 'en'
                  ? 'Business legal needs'
                  : 'Necesidades legales de negocio'}
              </p>
            </button>

            <button
              onClick={() => handlePersonaSelect('legal-aid')}
              className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 text-center transition-all group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/20 mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {language === 'en' ? 'Legal aid/pro bono org' : 'Org. de asistencia legal'}
              </h3>
              <p className="text-navy-300 text-sm">
                {language === 'en'
                  ? 'For organization use'
                  : 'Para uso organizacional'}
              </p>
            </button>

            <button
              onClick={() => handlePersonaSelect('legal-aid')}
              className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-purple-500/50 rounded-2xl p-6 text-center transition-all group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {language === 'en' ? 'Volunteer attorney' : 'Abogado voluntario'}
              </h3>
              <p className="text-navy-300 text-sm">
                {language === 'en'
                  ? 'Pro bono legal work'
                  : 'Trabajo legal pro bono'}
              </p>
            </button>

            <button
              onClick={() => handlePersonaSelect('individual')}
              className="bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-slate-500/50 rounded-2xl p-6 text-center transition-all group"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-500/20 mb-3 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">
                {language === 'en' ? 'Other' : 'Otro'}
              </h3>
              <p className="text-navy-300 text-sm">
                {language === 'en'
                  ? 'Not sure or different'
                  : 'No estoy seguro o diferente'}
              </p>
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="text-navy-200 hover:text-white text-base transition-colors underline underline-offset-4"
            >
              {language === 'en' ? 'Skip for now' : 'Omitir por ahora'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-navy-300 hover:text-white text-sm transition-colors"
            >
              {language === 'en' ? '← Back to home' : '← Volver al inicio'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (persona === 'individual') {
    return <IndividualIntake />;
  }

  if (persona === 'business') {
    return <BusinessIntake />;
  }

  if (persona === 'legal-aid') {
    return <LegalAidIntake />;
  }

  return null;
}
