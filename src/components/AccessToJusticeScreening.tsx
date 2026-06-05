import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, ArrowRight, Users, Scale, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const A2J_STORAGE_KEY = 'ezlegal_a2j_screening';

interface AccessToJusticeScreeningProps {
  onContinueToCheckout: () => void;
}

type Answer = 'yes' | 'maybe' | 'no' | null;

export default function AccessToJusticeScreening({ onContinueToCheckout }: AccessToJusticeScreeningProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [answer, setAnswer] = useState<Answer>(null);

  const handleContinue = () => {
    try { localStorage.setItem(A2J_STORAGE_KEY, JSON.stringify({ answer, ts: new Date().toISOString() })); } catch { /* ignore */ }
    onContinueToCheckout();
  };

  const showResources = answer === 'yes' || answer === 'maybe';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-teal-600" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          {en ? 'Before you pay' : 'Antes de pagar'}
        </h2>
      </div>

      <p className="text-sm text-slate-600 mb-5">
        {en
          ? 'We believe everyone deserves access to legal help. If paying would be a hardship, free or low-cost options may be available to you.'
          : 'Creemos que todos merecen acceso a ayuda legal. Si pagar sería una dificultad, opciones gratuitas o de bajo costo pueden estar disponibles.'}
      </p>

      <p className="text-sm font-medium text-slate-800 mb-3">
        {en
          ? 'Would paying for legal help be difficult for you right now?'
          : '¿Pagar por ayuda legal sería difícil para usted ahora?'}
      </p>

      <div className="flex flex-col gap-2 mb-6">
        <button
          onClick={() => setAnswer('yes')}
          className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
            answer === 'yes'
              ? 'border-teal-500 bg-teal-50 text-teal-800'
              : 'border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {en ? 'Yes, I need free or low-cost help' : 'Sí, necesito ayuda gratuita o de bajo costo'}
        </button>
        <button
          onClick={() => setAnswer('maybe')}
          className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
            answer === 'maybe'
              ? 'border-teal-500 bg-teal-50 text-teal-800'
              : 'border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {en ? 'Maybe, show me options' : 'Tal vez, muéstrame opciones'}
        </button>
        <button
          onClick={() => setAnswer('no')}
          className={`w-full py-3 px-4 rounded-xl border text-sm font-medium transition-all text-left ${
            answer === 'no'
              ? 'border-teal-500 bg-teal-50 text-teal-800'
              : 'border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {en ? 'No, continue to checkout' : 'No, continuar al pago'}
        </button>
      </div>

      {showResources && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-bold text-slate-900">
            {en ? 'Free or lower-cost options to consider' : 'Opciones gratuitas o de menor costo'}
          </h3>
          <Link
            to="/find-attorney"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
          >
            <Users className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {en ? 'Legal aid organizations' : 'Organizaciones de ayuda legal'}
              </p>
              <p className="text-xs text-slate-500">
                {en ? 'Free help based on income and location' : 'Ayuda gratuita basada en ingresos y ubicación'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
          <Link
            to="/pro-bono"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
          >
            <Heart className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {en ? 'Pro bono programs' : 'Programas pro bono'}
              </p>
              <p className="text-xs text-slate-500">
                {en ? 'Volunteer attorneys for qualifying individuals' : 'Abogados voluntarios para personas que califican'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
          <Link
            to="/safety-net"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
          >
            <Shield className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {en ? 'Court self-help centers' : 'Centros de autoayuda del tribunal'}
              </p>
              <p className="text-xs text-slate-500">
                {en ? 'Free assistance at your local courthouse' : 'Asistencia gratuita en su tribunal local'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>
          <Link
            to="/find-attorney"
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all group"
          >
            <Scale className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {en ? 'Lawyer referral services' : 'Servicios de referencia de abogados'}
              </p>
              <p className="text-xs text-slate-500">
                {en ? 'Low-cost initial consultations' : 'Consultas iniciales de bajo costo'}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
          </Link>

          <div className="pt-4 space-y-2">
            <Link
              to="/find-attorney"
              className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              {en ? 'Explore free and low-cost options' : 'Explorar opciones gratuitas'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleContinue}
              className="w-full py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {en ? 'Continue with ezLegal paid option' : 'Continuar con opción de pago de ezLegal'}
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-3">
            {en
              ? 'These resources may not be available in every location. ezLegal does not guarantee representation.'
              : 'Estos recursos pueden no estar disponibles en todas las ubicaciones. ezLegal no garantiza representación.'}
          </p>
        </div>
      )}

      {answer === 'no' && (
        <button
          onClick={handleContinue}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {en ? 'Continue to checkout' : 'Continuar al pago'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function hasCompletedA2JScreening(): boolean {
  try {
    const stored = sessionStorage.getItem('ezlegal-a2j-screened');
    if (stored === 'true') return true;
    const ls = localStorage.getItem('ezlegal_a2j_screening');
    return !!ls;
  } catch { return false; }
}
