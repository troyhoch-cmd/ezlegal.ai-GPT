import { useState } from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Shield,
  Phone,
  ExternalLink,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface NotarioFraudCheckerProps {
  onClose: () => void;
}

const RED_FLAGS = [
  'Te prometen la green card o ciudadanía "rápida" o "garantizada"',
  'Se llaman "notario" o "consultor de inmigración" pero no son abogados',
  'Te piden pagar todo en efectivo sin recibo',
  'Te presionan para firmar documentos que no entiendes',
  'No te dan copias de los documentos que firmas',
  'Te dicen que tienen "contactos" en inmigración',
  'Sus precios son mucho más baratos que los de un abogado',
  'No tienen oficina física o cambian de ubicación seguido'
];

const SAFE_SIGNS = [
  'Tienen licencia de abogado verificable en el colegio de abogados estatal',
  'Te explican claramente los riesgos y posibilidades de tu caso',
  'Te dan recibos y copias de todo lo que firmas',
  'No garantizan resultados - nadie puede garantizar inmigración',
  'Sus precios son razonables pero no sospechosamente baratos',
  'Tienen una oficina física establecida',
  'Están registrados con el BIA (Board of Immigration Appeals) si no son abogados'
];

const STATE_BAR_LINKS: Record<string, string> = {
  'California': 'https://www.calbar.ca.gov/Public/Licensee-Search',
  'Texas': 'https://www.texasbar.com/AM/Template.cfm?Section=Find_A_Lawyer',
  'Florida': 'https://www.floridabar.org/directories/find-mbr/',
  'New York': 'https://iapps.courts.state.ny.us/attorney/AttorneySearch',
  'Arizona': 'https://www.azbar.org/lawyer-referral-services/',
  'Nevada': 'https://nvbar.org/member-search/',
  'Illinois': 'https://www.iardc.org/lawyersearch.asp',
  'New Jersey': 'https://portal.njcourts.gov/webe7/attorneyindex',
  'Georgia': 'https://www.gabar.org/forthepublic/lawyersearch.cfm',
  'North Carolina': 'https://www.ncbar.gov/member-directory/'
};

export default function NotarioFraudChecker({ onClose }: NotarioFraudCheckerProps) {
  const [step, setStep] = useState<'intro' | 'questions' | 'results'>('intro');
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedState, setSelectedState] = useState('');

  const questions = [
    {
      text: '¿Te prometieron que pueden conseguirte papeles "rápido" o "garantizado"?',
      isRedFlag: true
    },
    {
      text: '¿La persona tiene licencia de ABOGADO (no solo notario público)?',
      isRedFlag: false
    },
    {
      text: '¿Te presionaron para pagar en efectivo sin recibo?',
      isRedFlag: true
    },
    {
      text: '¿Te dieron copias de todos los documentos que firmaste?',
      isRedFlag: false
    },
    {
      text: '¿Te explicaron claramente los riesgos de tu caso?',
      isRedFlag: false
    },
    {
      text: '¿Sus precios son mucho más baratos que otros abogados de inmigración?',
      isRedFlag: true
    }
  ];

  const handleAnswer = (answer: boolean) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep('results');
    }
  };

  const calculateRisk = () => {
    let redFlagCount = 0;
    questions.forEach((q, index) => {
      if (q.isRedFlag && answers[index] === true) redFlagCount++;
      if (!q.isRedFlag && answers[index] === false) redFlagCount++;
    });
    return redFlagCount;
  };

  const getRiskLevel = () => {
    const risk = calculateRisk();
    if (risk >= 4) return 'high';
    if (risk >= 2) return 'medium';
    return 'low';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div lang="es" className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Verificador de Fraude de Notarios</h2>
                <p className="text-red-100 text-sm">Protege tu dinero y tu caso</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-1">Importante saber:</h3>
                    <p className="text-red-800 text-sm">
                      En México, un "notario" es equivalente a un abogado con poder legal.
                      En Estados Unidos, un "notario público" (notary public) <strong>NO es abogado</strong> y
                      <strong> NO puede darte consejos legales</strong> ni ayudarte con inmigración.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Señales de peligro:</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {RED_FLAGS.slice(0, 4).map((flag, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Señales de que es legítimo:</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {SAFE_SIGNS.slice(0, 4).map((sign, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{sign}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep('questions')}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                >
                  Evaluar mi Situación
                </button>
                <a
                  href="https://reportefraude.ftc.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 px-6 rounded-xl font-semibold transition-colors text-center flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Reportar Fraude (FTC)
                </a>
              </div>
            </div>
          )}

          {step === 'questions' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-sm text-slate-500 mb-2">
                  Pregunta {currentQuestion + 1} de {questions.length}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-8">
                  {questions[currentQuestion].text}
                </h3>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="px-12 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-semibold transition-colors"
                  >
                    Sí
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="px-12 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-semibold transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentQuestion > 0) {
                    setCurrentQuestion(prev => prev - 1);
                  } else {
                    setStep('intro');
                  }
                }}
                className="text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1 mx-auto"
              >
                Regresar
              </button>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-6">
              {getRiskLevel() === 'high' && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-900 mb-2">ALTO RIESGO DE FRAUDE</h3>
                  <p className="text-red-800 mb-4">
                    Las respuestas indican múltiples señales de peligro.
                    <strong> No continúes con esta persona.</strong>
                  </p>
                </div>
              )}

              {getRiskLevel() === 'medium' && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-amber-900 mb-2">PROCEDE CON CUIDADO</h3>
                  <p className="text-amber-800 mb-4">
                    Hay algunas señales de advertencia. Verifica la licencia del abogado antes de continuar.
                  </p>
                </div>
              )}

              {getRiskLevel() === 'low' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">PARECE LEGÍTIMO</h3>
                  <p className="text-green-800 mb-4">
                    No se detectaron señales de fraude obvias. Aun así, siempre verifica la licencia.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Verifica la Licencia del Abogado
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Estado donde trabaja el abogado:
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Selecciona un estado</option>
                      {Object.keys(STATE_BAR_LINKS).map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  {selectedState && STATE_BAR_LINKS[selectedState] && (
                    <a
                      href={STATE_BAR_LINKS[selectedState]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Buscar en el Colegio de Abogados de {selectedState}
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-teal-900 mb-1">¿Necesitas ayuda real?</h4>
                    <p className="text-teal-800 text-sm mb-3">
                      ezLegal te conecta con abogados de inmigración verificados que hablan español.
                    </p>
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline"
                    >
                      <Phone className="w-4 h-4" />
                      Contáctanos para una consulta
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('intro');
                    setAnswers({});
                    setCurrentQuestion(0);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-semibold transition-colors"
                >
                  Evaluar Otra Persona
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition-colors"
                >
                  Hablar con Abogado Real
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
