import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, AlertTriangle, Shield, Phone, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

type Urgency = 'safe' | 'caution' | 'emergency';
type Route = 'purchase' | 'attorney' | 'emergency';

interface Question {
  id: string;
  en: string;
  es: string;
  weight: number;
  emergencyIfYes?: boolean;
}

const QUESTION_SETS: Record<string, Question[]> = {
  housing: [
    { id: 'lockout', en: 'Are you currently locked out or has a sheriff posted a writ of restitution?', es: 'Estas fuera de tu casa o el sheriff ha publicado una orden de restitucion?', weight: 3, emergencyIfYes: true },
    { id: 'hearing_48h', en: 'Is your eviction hearing within the next 48 hours?', es: 'Tu audiencia de desalojo es en las proximas 48 horas?', weight: 3, emergencyIfYes: true },
    { id: 'hearing_14d', en: 'Is your hearing within 14 days?', es: 'Tu audiencia es en 14 dias?', weight: 2 },
    { id: 'formal_notice', en: 'Have you received a formal eviction notice with a court date?', es: 'Has recibido un aviso formal de desalojo con fecha de corte?', weight: 1 },
    { id: 'unsafe_conditions', en: 'Are you facing unsafe or uninhabitable conditions?', es: 'Enfrentas condiciones inseguras o inhabitables?', weight: 2 },
  ],
  immigration: [
    { id: 'detained', en: 'Are you or a family member currently detained by ICE or CBP?', es: 'Tu o un familiar estan detenidos por ICE o CBP?', weight: 3, emergencyIfYes: true },
    { id: 'hearing_30d', en: 'Do you have an immigration court hearing within the next 30 days?', es: 'Tienes audiencia en corte de inmigracion en los proximos 30 dias?', weight: 2 },
    { id: 'nta_received', en: 'Have you received a Notice to Appear (NTA)?', es: 'Has recibido una Notificacion de Comparecencia (NTA)?', weight: 2 },
    { id: 'visa_expiring', en: 'Is your visa or status expiring soon with no extension filed?', es: 'Tu visa o estatus vence pronto sin extension presentada?', weight: 1 },
    { id: 'active_encounter', en: 'Are you currently in an active ICE encounter?', es: 'Estas en un encuentro activo con ICE ahora?', weight: 3, emergencyIfYes: true },
  ],
  family: [
    { id: 'immediate_danger', en: 'Are you or your children in immediate danger (domestic violence)?', es: 'Tu o tus hijos estan en peligro inmediato (violencia domestica)?', weight: 3, emergencyIfYes: true },
    { id: 'child_removed', en: 'Has a child been removed by CPS/DCS?', es: 'Un hijo ha sido retirado por CPS/DCS?', weight: 3, emergencyIfYes: true },
    { id: 'hearing_14d', en: 'Is a custody hearing scheduled within 14 days?', es: 'Hay una audiencia de custodia en 14 dias?', weight: 2 },
    { id: 'need_protective_order', en: 'Do you need an emergency protective order?', es: 'Necesitas una orden de proteccion de emergencia?', weight: 3, emergencyIfYes: true },
  ],
};

interface Props {
  packId: string;
  packName: string;
  onClose: () => void;
  onProceed: () => void;
}

export default function IssuePackDeadlineScreening({ packId, packName, onClose, onProceed }: Props) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const questions = QUESTION_SETS[packId] || QUESTION_SETS.housing;
  const [answers, setAnswers] = useState<Record<string, boolean | null>>(
    Object.fromEntries(questions.map((q) => [q.id, null]))
  );
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== null);

  const result = useMemo(() => {
    let score = 0;
    let emergency = false;
    questions.forEach((q) => {
      if (answers[q.id] === true) {
        score += q.weight;
        if (q.emergencyIfYes) emergency = true;
      }
    });
    const urgency: Urgency = emergency ? 'emergency' : score >= 3 ? 'caution' : 'safe';
    const route: Route = urgency === 'emergency' ? 'emergency' : urgency === 'caution' ? 'attorney' : 'purchase';
    return { score, urgency, route };
  }, [answers, questions]);

  const handleSubmit = async () => {
    setSubmitted(true);
    try {
      await supabase.from('issue_pack_deadline_screenings').insert({
        user_id: user?.id ?? null,
        pack_id: packId,
        language,
        answers,
        computed_urgency: result.urgency,
        recommended_route: result.route,
      });
    } catch {
      // non-blocking
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl my-auto">
        <div className="bg-amber-50 border-b border-amber-200 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">
                {language === 'en' ? 'Safety Check' : 'Revision de Seguridad'}
              </h2>
              <p className="text-sm text-navy-600">{packName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={language === 'en' ? 'Close' : 'Cerrar'}
            className="w-8 h-8 rounded-full hover:bg-amber-100 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-navy-500" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!submitted && (
            <>
              <p className="text-sm text-navy-600 mb-5">
                {language === 'en'
                  ? 'Answer a few questions so we can route you safely. This is not legal advice and does not create an attorney-client relationship.'
                  : 'Responde algunas preguntas para dirigirte con seguridad. Esto no es asesoria legal ni crea una relacion abogado-cliente.'}
              </p>
              <div className="space-y-3 mb-5">
                {questions.map((q) => (
                  <div key={q.id} className="border border-navy-200 rounded-lg p-3">
                    <p className="text-sm text-navy-800 mb-2 font-medium">
                      {language === 'en' ? q.en : q.es}
                    </p>
                    <div className="flex gap-2">
                      {(['yes', 'no'] as const).map((v) => {
                        const value = v === 'yes';
                        const active = answers[q.id] === value;
                        return (
                          <button
                            key={v}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: value }))}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-colors ${
                              active
                                ? value
                                  ? 'bg-red-50 border-red-300 text-red-700'
                                  : 'bg-teal-50 border-teal-300 text-teal-700'
                                : 'bg-white border-navy-200 text-navy-600 hover:bg-navy-50'
                            }`}
                          >
                            {v === 'yes'
                              ? language === 'en' ? 'Yes' : 'Si'
                              : language === 'en' ? 'No' : 'No'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                  allAnswered
                    ? 'bg-teal-600 hover:bg-teal-500 text-white'
                    : 'bg-navy-100 text-navy-400 cursor-not-allowed'
                }`}
              >
                {language === 'en' ? 'See my recommendation' : 'Ver mi recomendacion'}
              </button>
            </>
          )}

          {submitted && result.urgency === 'emergency' && (
            <div>
              <div className="flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">
                    {language === 'en' ? 'Get urgent help first' : 'Obten ayuda urgente primero'}
                  </h3>
                  <p className="text-sm text-red-800">
                    {language === 'en'
                      ? 'Based on your answers, this pack is not the right first step. Please use emergency resources now.'
                      : 'Segun tus respuestas, este paquete no es el primer paso correcto. Usa recursos de emergencia ahora.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/emergency-resources"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {language === 'en' ? 'Emergency resources' : 'Recursos de emergencia'}
                </Link>
                <button
                  onClick={onClose}
                  className="py-2 text-sm text-navy-500 hover:text-navy-700"
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
              </div>
            </div>
          )}

          {submitted && result.urgency === 'caution' && (
            <div>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-amber-900 mb-1">
                  {language === 'en' ? 'Consider talking to an attorney' : 'Considera hablar con un abogado'}
                </h3>
                <p className="text-sm text-amber-800">
                  {language === 'en'
                    ? 'Your situation has significant deadlines. You can still use this pack to prepare, and we also recommend an attorney referral.'
                    : 'Tu situacion tiene fechas importantes. Aun puedes usar este paquete para prepararte, y tambien recomendamos referencia a abogado.'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onProceed}
                  className="inline-flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm"
                >
                  {language === 'en' ? 'Continue to pack + attorney referral' : 'Continuar con paquete + referencia'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/pro-bono-intake"
                  onClick={onClose}
                  className="text-center py-2 text-sm text-navy-600 hover:text-navy-900 underline"
                >
                  {language === 'en' ? 'Request free legal aid instead' : 'Solicitar ayuda legal gratis'}
                </Link>
              </div>
            </div>
          )}

          {submitted && result.urgency === 'safe' && (
            <div>
              <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4 mb-4">
                <h3 className="font-bold text-teal-900 mb-1">
                  {language === 'en' ? 'This pack looks like a good fit' : 'Este paquete parece buena opcion'}
                </h3>
                <p className="text-sm text-teal-800">
                  {language === 'en'
                    ? 'Your answers indicate self-help materials are appropriate for your current situation.'
                    : 'Tus respuestas indican que los materiales de autoayuda son apropiados para tu situacion.'}
                </p>
              </div>
              <button
                onClick={onProceed}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm"
              >
                {language === 'en' ? 'Continue to checkout' : 'Continuar al pago'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
