import { useState } from 'react';
import {
  X,
  Globe,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Shield,
  Clock,
  Users,
  Briefcase,
  Heart,
  AlertTriangle,
  Phone,
  MessageCircle,
  FileText,
  Home,
  GraduationCap
} from 'lucide-react';

interface ImmigrationStatusCheckerProps {
  onClose: () => void;
}

interface QuestionOption {
  label: string;
  value: string;
  icon?: any;
}

interface Question {
  id: string;
  text: string;
  subtext?: string;
  type: 'single' | 'multiple' | 'text';
  options?: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 'current_status',
    text: '¿Cuál es tu situación actual en Estados Unidos?',
    type: 'single',
    options: [
      { label: 'No tengo documentos/papeles', value: 'undocumented', icon: AlertTriangle },
      { label: 'Tengo DACA', value: 'daca', icon: FileText },
      { label: 'Tengo visa de trabajo (H-1B, L-1, etc.)', value: 'work_visa', icon: Briefcase },
      { label: 'Tengo visa de estudiante (F-1)', value: 'student_visa', icon: GraduationCap },
      { label: 'Tengo TPS (Estatus de Protección Temporal)', value: 'tps', icon: Shield },
      { label: 'Tengo residencia permanente (green card)', value: 'green_card', icon: Home },
      { label: 'Otra situación', value: 'other', icon: Globe }
    ]
  },
  {
    id: 'time_in_us',
    text: '¿Cuánto tiempo llevas viviendo en Estados Unidos?',
    type: 'single',
    options: [
      { label: 'Menos de 1 año', value: 'less_1' },
      { label: '1-5 años', value: '1_5' },
      { label: '5-10 años', value: '5_10' },
      { label: '10-15 años', value: '10_15' },
      { label: 'Más de 15 años', value: 'more_15' }
    ]
  },
  {
    id: 'family_status',
    text: '¿Tienes familiares ciudadanos o residentes en Estados Unidos?',
    type: 'single',
    options: [
      { label: 'Esposo/a ciudadano(a)', value: 'spouse_citizen', icon: Heart },
      { label: 'Esposo/a residente', value: 'spouse_resident', icon: Heart },
      { label: 'Hijos ciudadanos mayores de 21 años', value: 'adult_children', icon: Users },
      { label: 'Padres ciudadanos (y yo soy mayor de 21)', value: 'parents', icon: Users },
      { label: 'Hermanos ciudadanos', value: 'siblings', icon: Users },
      { label: 'No tengo familiares con estatus', value: 'none', icon: AlertTriangle }
    ]
  },
  {
    id: 'employment',
    text: '¿Cómo es tu situación de trabajo?',
    type: 'single',
    options: [
      { label: 'Tengo un empleador que quiere patrocinarme', value: 'sponsor', icon: Briefcase },
      { label: 'Trabajo pero no tengo patrocinador', value: 'working_no_sponsor', icon: Briefcase },
      { label: 'Tengo mi propio negocio', value: 'business_owner', icon: Briefcase },
      { label: 'No trabajo actualmente', value: 'not_working', icon: Clock }
    ]
  },
  {
    id: 'criminal_history',
    text: '¿Tienes algún historial criminal en Estados Unidos?',
    subtext: 'Esta pregunta es importante para evaluar tus opciones. Tu respuesta es confidencial.',
    type: 'single',
    options: [
      { label: 'No, nunca he sido arrestado', value: 'none' },
      { label: 'Infracciones menores de tránsito', value: 'traffic' },
      { label: 'Arrestado pero no condenado', value: 'arrested_not_convicted' },
      { label: 'Delito menor (misdemeanor)', value: 'misdemeanor' },
      { label: 'Delito grave (felony)', value: 'felony' },
      { label: 'Prefiero no responder', value: 'prefer_not' }
    ]
  },
  {
    id: 'entry_type',
    text: '¿Cómo entraste a Estados Unidos?',
    type: 'single',
    options: [
      { label: 'Con visa y me quedé más tiempo del permitido (overstay)', value: 'overstay' },
      { label: 'Crucé la frontera sin inspección', value: 'ewe' },
      { label: 'Con permiso de turista (B-1/B-2)', value: 'tourist' },
      { label: 'Con visa de estudiante', value: 'student' },
      { label: 'Con visa de trabajo', value: 'work' },
      { label: 'Otro', value: 'other' }
    ]
  }
];

interface PathwayResult {
  title: string;
  description: string;
  likelihood: 'high' | 'medium' | 'low';
  timeframe: string;
  nextSteps: string[];
  warnings?: string[];
}

export default function ImmigrationStatusChecker({ onClose }: ImmigrationStatusCheckerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculatePathways = (): PathwayResult[] => {
    const pathways: PathwayResult[] = [];

    if (answers.family_status === 'spouse_citizen') {
      pathways.push({
        title: 'Residencia por Matrimonio con Ciudadano',
        description: 'Tu esposo/a ciudadano puede peticionarte para la residencia permanente.',
        likelihood: answers.entry_type === 'overstay' ? 'high' : 'medium',
        timeframe: '1-2 años',
        nextSteps: [
          'Reunir pruebas de matrimonio genuino',
          'Formulario I-130 (petición familiar)',
          'Si entraste legalmente: ajuste de estatus (I-485)',
          'Si entraste sin inspección: puede requerir perdón'
        ],
        warnings: answers.entry_type === 'ewe'
          ? ['Si entraste sin inspección, puede requerir salir del país y solicitar un perdón (waiver)']
          : undefined
      });
    }

    if (answers.family_status === 'spouse_resident') {
      pathways.push({
        title: 'Residencia por Matrimonio con Residente',
        description: 'Tu esposo/a residente puede peticionarte, pero hay lista de espera.',
        likelihood: 'medium',
        timeframe: '2-4 años',
        nextSteps: [
          'Formulario I-130',
          'Esperar que la fecha de prioridad esté vigente',
          'Ajuste de estatus o proceso consular'
        ]
      });
    }

    if (answers.family_status === 'adult_children') {
      pathways.push({
        title: 'Petición Familiar por Hijos Ciudadanos',
        description: 'Tus hijos mayores de 21 años pueden peticionarte como "familiar inmediato".',
        likelihood: 'high',
        timeframe: '1-2 años',
        nextSteps: [
          'Tu hijo presenta Formulario I-130',
          'No hay límite de visas - proceso más rápido',
          'Ajuste de estatus si entraste legalmente'
        ]
      });
    }

    if (answers.current_status === 'daca') {
      pathways.push({
        title: 'Renovación de DACA',
        description: 'Puedes renovar tu DACA mientras el programa siga vigente.',
        likelihood: 'high',
        timeframe: '3-6 meses para renovación',
        nextSteps: [
          'Presentar renovación 150 días antes del vencimiento',
          'Mantener elegibilidad (no delitos)',
          'Considerar opciones adicionales si tienes familiar ciudadano'
        ],
        warnings: [
          'El programa DACA está en litigio legal',
          'Importante explorar otras opciones para el futuro'
        ]
      });
    }

    if (answers.employment === 'sponsor') {
      pathways.push({
        title: 'Visa de Trabajo con Patrocinador',
        description: 'Tu empleador puede patrocinarte para una visa de trabajo o residencia.',
        likelihood: 'medium',
        timeframe: '1-5 años dependiendo del tipo',
        nextSteps: [
          'Certificación laboral (PERM) si es para green card',
          'Petición I-140 del empleador',
          'H-1B para profesionales (lotería anual)'
        ]
      });
    }

    if (answers.time_in_us === 'more_15' || answers.time_in_us === '10_15') {
      pathways.push({
        title: 'Cancelación de Deportación',
        description: 'Si has vivido 10+ años y tienes familia ciudadana, puede ser opción.',
        likelihood: 'low',
        timeframe: '2-4 años en corte',
        nextSteps: [
          'Demostrar presencia continua de 10 años',
          'Demostrar "dificultad extrema" para familiar ciudadano',
          'Requiere estar en proceso de deportación'
        ],
        warnings: [
          'Solo disponible si estás en procedimientos de deportación',
          'Tasa de aprobación muy baja (~15%)',
          'Necesitas abogado experimentado'
        ]
      });
    }

    if (answers.current_status === 'tps') {
      pathways.push({
        title: 'Mantener y Extender TPS',
        description: 'Si tienes TPS, puedes mantener tu estatus y explorar otras opciones.',
        likelihood: 'high',
        timeframe: 'Depende de tu país',
        nextSteps: [
          'Renovar TPS cuando se anuncien extensiones',
          'Si tienes familiar ciudadano, explorar petición familiar',
          'Algunos con TPS pueden ajustar estatus si entraron legalmente'
        ]
      });
    }

    if (pathways.length === 0) {
      pathways.push({
        title: 'Consulta Personalizada Necesaria',
        description: 'Tu situación requiere evaluación detallada por un abogado.',
        likelihood: 'medium',
        timeframe: 'Depende del caso',
        nextSteps: [
          'Programar consulta con abogado de inmigración',
          'Reunir todos tus documentos',
          'Explorar opciones de protección como asilo si aplica'
        ]
      });
    }

    return pathways;
  };

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div lang="es" className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Evaluación de Opciones Migratorias</h2>
                <p className="text-teal-100 text-sm">100% confidencial</p>
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
          {!showResults ? (
            <div>
              <div className="mb-8">
                <div className="flex justify-between text-sm text-slate-500 mb-2">
                  <span>Pregunta {currentStep + 1} de {QUESTIONS.length}</span>
                  <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-teal-800 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Tus respuestas son confidenciales y NO se comparten con ninguna agencia del gobierno.</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {currentQuestion.text}
                </h3>
                {currentQuestion.subtext && (
                  <p className="text-slate-600 text-sm">{currentQuestion.subtext}</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition-colors text-left group"
                  >
                    {option.icon && (
                      <div className="w-10 h-10 bg-slate-200 group-hover:bg-teal-200 rounded-full flex items-center justify-center transition-colors">
                        <option.icon className="w-5 h-5 text-slate-600 group-hover:text-teal-700" />
                      </div>
                    )}
                    <span className="font-medium text-slate-900">{option.label}</span>
                    <ArrowRight className="w-5 h-5 text-slate-400 ml-auto group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Pregunta anterior
                </button>
              )}
            </div>
          ) : (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Tus Posibles Opciones
                </h3>
                <p className="text-slate-600">
                  Basado en tus respuestas, estas son las opciones que podrían aplicar a tu caso.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {calculatePathways().map((pathway, index) => (
                  <div
                    key={index}
                    className={`border rounded-xl p-5 ${
                      pathway.likelihood === 'high'
                        ? 'border-green-300 bg-green-50'
                        : pathway.likelihood === 'medium'
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">{pathway.title}</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        pathway.likelihood === 'high'
                          ? 'bg-green-200 text-green-800'
                          : pathway.likelihood === 'medium'
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {pathway.likelihood === 'high' ? 'Alta probabilidad' :
                         pathway.likelihood === 'medium' ? 'Probabilidad media' : 'Baja probabilidad'}
                      </span>
                    </div>

                    <p className="text-slate-700 text-sm mb-3">{pathway.description}</p>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{pathway.timeframe}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-sm font-medium text-slate-700 mb-2">Próximos pasos:</div>
                      <ul className="space-y-1">
                        {pathway.nextSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <CheckCircle className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {pathway.warnings && (
                      <div className="bg-amber-100 border border-amber-200 rounded-lg p-3 mt-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            {pathway.warnings.map((warning, i) => (
                              <p key={i} className={i > 0 ? 'mt-1' : ''}>{warning}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-slate-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-600">
                  <strong>Importante:</strong> Esta evaluación es solo informativa y NO constituye consejo legal.
                  Cada caso es único y debe ser evaluado por un abogado de inmigración licenciado.
                  Las leyes de inmigración cambian frecuentemente.
                </p>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
                <h4 className="font-semibold text-teal-900 mb-2">
                  ¿Quieres una evaluación completa de tu caso?
                </h4>
                <p className="text-teal-800 text-sm mb-4">
                  Nuestros abogados de inmigración hispanohablantes pueden revisar tu situación
                  en detalle y explicarte todas tus opciones.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/contact"
                    className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    Contáctanos para una consulta
                  </a>
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-teal-700 border border-teal-300 px-6 py-3 rounded-xl font-semibold transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat por WhatsApp
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowResults(false);
                  setCurrentStep(0);
                  setAnswers({});
                }}
                className="mt-6 text-slate-500 hover:text-slate-700 text-sm flex items-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Comenzar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
