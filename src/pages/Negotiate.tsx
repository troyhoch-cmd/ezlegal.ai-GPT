import { useState } from 'react';
import { Target, TrendingUp, ArrowRight, Check, Shield, Brain, Sparkles, Handshake as HandshakeIcon, Building2, DollarSign, Clock, BookOpen, Play, Star, MessageSquare, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import { useLanguage } from '../contexts/LanguageContext';
import usePersonaRouting from '../hooks/usePersonaRouting';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import NegotiationStrategyPlanner from '../components/NegotiationStrategyPlanner';
import NegotiationStrategyQuiz from '../components/NegotiationStrategyQuiz';

export default function Negotiate() {
  const { language } = useLanguage();
  const { isOrganization, isBusiness } = usePersonaRouting();
  const [showPlanner, setShowPlanner] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const features = [
    {
      icon: Target,
      title: language === 'en' ? 'BATNA Analysis' : 'Analisis BATNA',
      description: language === 'en'
        ? 'Calculate your negotiating leverage by evaluating alternatives'
        : 'Calcula tu poder de negociacion evaluando alternativas',
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'ZOPA Calculator' : 'Calculadora ZOPA',
      description: language === 'en'
        ? 'Find the Zone of Possible Agreement where deals get done'
        : 'Encuentra la Zona de Posible Acuerdo donde se cierran tratos',
    },
    {
      icon: Sparkles,
      title: language === 'en' ? 'Anchoring Strategy' : 'Estrategia de Anclaje',
      description: language === 'en'
        ? 'Get AI-recommended opening numbers to maximize your outcome'
        : 'Obtiene numeros de apertura recomendados por IA para maximizar tu resultado',
    },
    {
      icon: MessageSquare,
      title: language === 'en' ? 'Ready Scripts' : 'Guiones Listos',
      description: language === 'en'
        ? 'Copy-and-send scripts for demands, counters, and tactics'
        : 'Guiones listos para copiar y enviar para demandas, contraofertas y tacticas',
    },
  ];

  const disputeTypes = [
    { name: language === 'en' ? 'Landlord Disputes' : 'Disputas con Casero', example: 'Security deposit, repairs, lease terms' },
    { name: language === 'en' ? 'Wage Claims' : 'Reclamos de Salarios', example: 'Unpaid wages, overtime, severance' },
    { name: language === 'en' ? 'Debt Collection' : 'Cobro de Deudas', example: 'Settlement negotiations, validation' },
    { name: language === 'en' ? 'Insurance Claims' : 'Reclamaciones de Seguro', example: 'Denied claims, low offers' },
    { name: language === 'en' ? 'Contract Disputes' : 'Disputas de Contratos', example: 'Breach, non-performance' },
    { name: language === 'en' ? 'Consumer Issues' : 'Problemas de Consumidor', example: 'Refunds, defective products' },
  ];

  const tactics = [
    {
      name: language === 'en' ? 'Anchoring' : 'Anclaje',
      description: language === 'en'
        ? 'The first number mentioned heavily influences the final outcome. Start ambitiously.'
        : 'El primer numero mencionado influye fuertemente en el resultado final. Empieza ambiciosamente.',
    },
    {
      name: language === 'en' ? 'Bracketing' : 'Acotamiento',
      description: language === 'en'
        ? '"If you move to X, I could accept Y" - a conditional offer that defines the settlement range.'
        : '"Si te mueves a X, podria aceptar Y" - una oferta condicional que define el rango de acuerdo.',
    },
    {
      name: language === 'en' ? 'Silence' : 'Silencio',
      description: language === 'en'
        ? 'After making an offer, wait. The discomfort of silence often leads them to improve their offer.'
        : 'Despues de hacer una oferta, espera. La incomodidad del silencio a menudo los lleva a mejorar su oferta.',
    },
    {
      name: language === 'en' ? 'Walk-Away Power' : 'Poder de Retirarse',
      description: language === 'en'
        ? 'A strong BATNA means you can walk away. This is your greatest source of leverage.'
        : 'Un BATNA fuerte significa que puedes retirarte. Esta es tu mayor fuente de poder.',
    },
  ];

  if (showPlanner) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Navigation />

        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <button
                  onClick={() => setShowPlanner(false)}
                  className="text-sm text-teal-600 hover:text-navy-700 mb-2"
                >
                  &larr; {language === 'en' ? 'Back to overview' : 'Volver a resumen'}
                </button>
                <h1 className="text-2xl font-bold text-navy-900">
                  {language === 'en' ? 'Negotiation Strategy Planner' : 'Planificador de Estrategia de Negociacion'}
                </h1>
                <p className="text-navy-600">
                  {language === 'en'
                    ? 'AmLaw 100 tactics, simplified for everyone'
                    : 'Tacticas de AmLaw 100, simplificadas para todos'
                  }
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-navy-500">
                <Shield className="w-4 h-4" />
                <span>{language === 'en' ? 'Your data stays private' : 'Tus datos permanecen privados'}</span>
              </div>
            </div>

            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-600">
              <Info className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
              <div>
                <span>
                  {language === 'en'
                    ? 'This tool provides legal information, not legal advice. It does not create an attorney-client relationship. For specific guidance on your situation, '
                    : 'Esta herramienta proporciona información legal, no asesoramiento legal. No crea una relacion abogado-cliente. Para orientación especifica sobre su situación, '
                  }
                </span>
                <Link to="/find-attorney" className="text-teal-600 hover:text-teal-700 font-medium">
                  {language === 'en' ? 'consult an attorney' : 'consulte a un abogado'}
                </Link>
                <span>
                  {language === 'en' ? ' or ' : ' o '}
                </span>
                <Link to="/pro-bono" className="text-teal-600 hover:text-teal-700 font-medium">
                  {language === 'en' ? 'check pro bono eligibility' : 'verifique elegibilidad pro bono'}
                </Link>
                <span>.</span>
              </div>
            </div>

            {isOrganization && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-800 mb-1">
                    {language === 'en' ? 'Organization Mode: Triage First' : 'Modo Organizacion: Triaje Primero'}
                  </p>
                  <p className="text-amber-700">
                    {language === 'en'
                      ? 'For client-facing negotiations, ensure the client has been screened for safety risks, active court orders, and crisis situations before generating scripts. Use this tool for case preparation -- not as direct client advice.'
                      : 'Para negociaciones con clientes, asegurese de que el cliente haya sido evaluado por riesgos de seguridad, ordenes judiciales activas y situaciones de crisis antes de generar guiones. Use esta herramienta para preparacion de casos, no como consejo directo al cliente.'}
                  </p>
                </div>
              </div>
            )}

            {isBusiness && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-800 mb-1">
                    {language === 'en' ? 'Business Disputes' : 'Disputas Comerciales'}
                  </p>
                  <p className="text-blue-700">
                    {language === 'en'
                      ? 'This tool supports contract disputes, vendor negotiations, lease terms, and B2B collections. For complex commercial litigation, we recommend consulting an attorney.'
                      : 'Esta herramienta apoya disputas de contratos, negociaciones con proveedores, terminos de arrendamiento y cobros B2B. Para litigios comerciales complejos, recomendamos consultar a un abogado.'}
                  </p>
                  <Link to="/find-attorney" className="text-blue-600 hover:text-blue-700 font-medium mt-1 inline-block">
                    {language === 'en' ? 'Find a business attorney' : 'Encontrar un abogado de negocios'} &rarr;
                  </Link>
                </div>
              </div>
            )}

            <NegotiationStrategyPlanner />
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-full mb-6">
              <Brain className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                {language === 'en' ? 'AI-Powered Negotiation Coach' : 'Coach de Negociacion Impulsado por IA'}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {language === 'en'
                ? 'Stand Up for Yourself with the Right Words'
                : 'Defiendete con las Palabras Correctas'
              }
            </h1>

            <p className="text-xl text-white/70 mb-8">
              {language === 'en'
                ? 'Free AI-powered scripts and strategies for handling disputes with landlords, debt collectors, insurance companies, and employers. No legal experience needed.'
                : 'Scripts y estrategias gratuitas impulsadas por IA para manejar disputas con caseros, cobradores de deudas, aseguradoras y empleadores. No se necesita experiencia legal.'
              }
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowPlanner(true)}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-900 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="w-5 h-5" />
                {language === 'en' ? 'Start Planning My Negotiation' : 'Empezar a Planificar Mi Negociacion'}
              </button>
              <a
                href="#how-it-works"
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {language === 'en' ? 'Learn the tactics first' : 'Aprende las tacticas primero'}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-navy-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              {language === 'en' ? 'The Tactics They Use Against You' : 'Las Tacticas Que Usan Contra Ti'}
            </h2>
            <p className="text-navy-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Insurance adjusters, debt collectors, landlords, and employers all use proven negotiation tactics. Now you can too.'
                : 'Ajustadores de seguros, cobradores de deudas, caseros y empleadores todos usan tacticas de negociacion probadas. Ahora tu también puedes.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tactics.map((tactic, index) => (
              <div key={index} className="bg-navy-900 rounded-xl p-6 text-white">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-amber-400 font-bold">{index + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{tactic.name}</h3>
                <p className="text-sm text-white/60">{tactic.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              {language === 'en' ? 'Works for Any Dispute' : 'Funciona para Cualquier Disputa'}
            </h2>
            <p className="text-navy-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Our negotiation framework adapts to your specific situation'
                : 'Nuestro marco de negociacion se adapta a tu situación especifica'
              }
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {disputeTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-5 border border-navy-200">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-navy-900">{type.name}</h3>
                    <p className="text-sm text-navy-500">{type.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  {language === 'en'
                    ? 'Why This Works'
                    : 'Por Que Esto Funciona'
                  }
                </h2>
                <div className="space-y-4 text-white/70">
                  <p>
                    {language === 'en'
                      ? "When a debt collector calls, they have scripts. When an insurance adjuster makes an offer, they have guidelines. When a landlord refuses your deposit, they're betting you don't know your rights."
                      : "Cuando un cobrador de deudas llama, tienen guiones. Cuando un ajustador de seguros hace una oferta, tienen pautas. Cuando un casero rechaza tu depósito, apuestan a que no conoces tus derechos."
                    }
                  </p>
                  <p>
                    {language === 'en'
                      ? "Our Negotiation Strategy Planner levels the playing field. It's built on proven negotiation frameworks and gives you the same preparation tools that make professional negotiators effective."
                      : "Nuestro Planificador de Estrategia de Negociacion nivela el campo de juego. Esta construido sobre marcos de negociacion probados y te da las mismas herramientas de preparacion que hacen efectivos a los negociadores profesionales."
                    }
                  </p>
                </div>

                <button
                  onClick={() => setShowPlanner(true)}
                  className="mt-8 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-navy-900 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  {language === 'en' ? 'Start My Negotiation Plan' : 'Comenzar Mi Plan de Negociacion'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold">73%</div>
                  </div>
                  <p className="text-sm text-white/60">
                    {language === 'en'
                      ? 'of people who prepare a negotiation strategy get better outcomes than those who wing it (Harvard PON research)'
                      : 'de las personas que preparan una estrategia de negociacion obtienen mejores resultados que los que improvisan (investigacion Harvard PON)'
                    }
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold">2-3x</div>
                  </div>
                  <p className="text-sm text-white/60">
                    {language === 'en'
                      ? 'the initial offer - typical improvement from proper anchoring technique (Galinsky & Mussweiler, negotiation research)'
                      : 'la oferta inicial - mejora tipica de la tecnica de anclaje adecuada (Galinsky & Mussweiler, investigacion de negociacion)'
                    }
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold">15 min</div>
                  </div>
                  <p className="text-sm text-white/60">
                    {language === 'en'
                      ? 'average time to complete your negotiation strategy - worth hours of better outcomes'
                      : 'tiempo promedio para completar tu estrategia de negociacion - vale horas de mejores resultados'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-green-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              {language === 'en' ? 'Free Tool' : 'Herramienta Gratis'}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-navy-900 mb-4">
            {language === 'en'
              ? 'Ready to Negotiate?'
              : 'Listo para Negociar?'
            }
          </h2>

          <p className="text-navy-600 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? "Stop going into negotiations unprepared. In 15 minutes, you'll have a complete strategy with scripts, tactics, and numbers."
              : "Deja de entrar a negociaciones sin preparacion. En 15 minutos, tendras una estrategia completa con guiones, tacticas y numeros."
            }
          </p>

          <button
            onClick={() => setShowPlanner(true)}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <HandshakeIcon className="w-5 h-5" />
            {language === 'en' ? 'Start My Negotiation Strategy' : 'Comenzar Mi Estrategia de Negociacion'}
          </button>

          <p className="text-sm text-navy-500 mt-4">
            {language === 'en'
              ? 'No signup required. Your data stays private.'
              : 'Sin registro requerido. Tus datos permanecen privados.'
            }
          </p>

          <div className="mt-6 bg-white/80 border border-navy-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-xs text-navy-600 text-center">
              {language === 'en'
                ? 'Want a complete, downloadable PDF strategy document with all scenarios and risk assessments?'
                : 'Quieres un documento PDF completo y descargable con todos los escenarios y evaluaciones de riesgo?'}
            </p>
            <Link
              to="/issue-packs?topic=negotiation#negotiation"
              className="flex items-center justify-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-700 mt-2"
            >
              {language === 'en' ? 'Get Negotiation Strategy Pack - $49' : 'Obtener Paquete de Negociacion - $49'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
