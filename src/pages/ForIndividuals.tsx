import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  MessageSquare, CheckCircle, Shield, ArrowRight,
  Users, FileText, Home, Briefcase, Car, Heart,
  Scale, Sparkles, Globe,
  ChevronDown, ChevronUp
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { StandardDisclaimer } from '../components/templates/LegalDisclosureModule';
import TrustModule from '../components/templates/TrustModule';
import { useLanguage } from '../contexts/LanguageContext';
import { getAffordabilityMessage } from '../lib/microcopy';

const PRACTICE_AREAS = [
  {
    icon: Home,
    name: { en: 'Housing & Tenant Rights', es: 'Vivienda y Derechos del Inquilino' },
    description: { en: 'Eviction defense, lease disputes, security deposits, habitability issues', es: 'Defensa de desalojo, disputas de arrendamiento, depósitos de seguridad, problemas de habitabilidad' },
    examples: { en: ['My landlord is trying to evict me', 'How do I get my security deposit back?', 'Can my landlord enter without notice?'], es: ['Mi arrendador intenta desalojarme', '¿Cómo recupero mi depósito?', '¿Puede mi arrendador entrar sin aviso?'] }
  },
  {
    icon: Briefcase,
    name: { en: 'Employment & Workplace', es: 'Empleo y Trabajo' },
    description: { en: 'Wrongful termination, discrimination, wage theft, harassment', es: 'Despido injusto, discriminación, robo de salarios, acoso' },
    examples: { en: ['Was I wrongfully terminated?', 'My employer owes me overtime', 'How do I file a discrimination complaint?'], es: ['¿Fui despedido injustamente?', 'Mi empleador me debe horas extra', '¿Cómo presento una queja de discriminación?'] }
  },
  {
    icon: Heart,
    name: { en: 'Family Law', es: 'Derecho Familiar' },
    description: { en: 'Divorce basics, custody questions, child support, domestic issues', es: 'Divorcio, custodia, pensión alimenticia, problemas domésticos' },
    examples: { en: ['What are my rights in a divorce?', 'How is child support calculated?', 'What is the custody process?'], es: ['¿Cuáles son mis derechos en un divorcio?', '¿Cómo se calcula la pensión alimenticia?', '¿Cuál es el proceso de custodia?'] }
  },
  {
    icon: Car,
    name: { en: 'Consumer Protection', es: 'Protección al Consumidor' },
    description: { en: 'Debt collection, lemon law, scams, credit disputes', es: 'Cobranza de deudas, ley limón, estafas, disputas de crédito' },
    examples: { en: ['A debt collector is harassing me', 'I bought a defective car', 'How do I dispute a credit error?'], es: ['Un cobrador me está acosando', 'Compré un auto defectuoso', '¿Cómo disputo un error de crédito?'] }
  },
  {
    icon: FileText,
    name: { en: 'Contracts & Agreements', es: 'Contratos y Acuerdos' },
    description: { en: 'Understanding terms, breach of contract, negotiations', es: 'Entender términos, incumplimiento de contrato, negociaciones' },
    examples: { en: ['Is this contract enforceable?', 'What happens if I break a lease?', 'Can I get out of this agreement?'], es: ['¿Es ejecutable este contrato?', '¿Qué pasa si rompo un arrendamiento?', '¿Puedo salirme de este acuerdo?'] }
  },
  {
    icon: Scale,
    name: { en: 'Small Claims & Civil', es: 'Demandas Menores y Civil' },
    description: { en: 'Filing claims, collecting judgments, court procedures', es: 'Presentar demandas, cobrar sentencias, procedimientos judiciales' },
    examples: { en: ['How do I sue in small claims court?', 'What can I recover?', 'How do I collect a judgment?'], es: ['¿Cómo demando en tribunal menor?', '¿Qué puedo recuperar?', '¿Cómo cobro una sentencia?'] }
  },
];

export default function ForIndividuals() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [expandedArea, setExpandedArea] = useState<number | null>(null);
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <main id="main-content" className="pt-4">
        <section className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-6">
                  <Users className="w-4 h-4 text-teal-200" />
                  <span className="text-sm font-semibold">For Individuals</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                  {lang === 'en'
                    ? 'Understand your options before you pay for legal help.'
                    : 'Entiende tus opciones antes de pagar por ayuda legal.'}
                </h1>
                <p className="text-xl text-teal-100 mb-4 leading-relaxed">
                  {lang === 'en'
                    ? 'Plain-language guidance for your situation. No account required to start. Available in English and Spanish.'
                    : 'Orientación en lenguaje simple para tu situación. No se requiere cuenta para empezar. Disponible en inglés y español.'}
                </p>
                <p className="text-sm text-teal-200 mb-8">
                  {lang === 'en'
                    ? 'If you cannot afford a lawyer, we\'ll help you look for free or lower-cost options first.'
                    : 'Si no puede pagar un abogado, le ayudaremos a buscar opciones gratuitas o de menor costo primero.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Link
                    to="/start"
                    className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-bold hover:bg-teal-50 transition-all shadow-lg text-lg"
                  >
                    <MessageSquare className="w-5 h-5" />
                    {lang === 'en' ? 'Start with 3 questions' : 'Comienza con 3 preguntas'}
                  </Link>
                  <Link
                    to="/start?lang=es"
                    className="inline-flex items-center justify-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-teal-400 transition-all border border-teal-400 text-lg"
                  >
                    <Globe className="w-5 h-5" />
                    Ayuda en español
                  </Link>
                </div>

                <p className="text-teal-200 text-sm font-medium mb-6">
                  {getAffordabilityMessage('FREE_GUIDANCE', lang)}. {getAffordabilityMessage('LOW_COST_OPTIONS', lang)}.
                </p>

                <TrustModule signals={['NO_SIGNUP', 'AVAILABLE_24_7', 'SECURE']} variant="list" className="text-teal-100" />
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-navy-200">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-navy-200">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900">AI Legal Assistant</p>
                      <p className="text-xs text-navy-500">Online now</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-navy-100 rounded-lg p-3 max-w-[85%]">
                      <p className="text-navy-700 text-sm">
                        My landlord just gave me 3 days to move out. Is this legal?
                      </p>
                    </div>
                    <div className="bg-teal-600 rounded-lg p-3 max-w-[85%] ml-auto">
                      <p className="text-white text-sm">
                        I can help you understand your rights. First, what state do you live in?
                        Eviction notice requirements vary significantly by location.
                      </p>
                    </div>
                    <div className="bg-navy-100 rounded-lg p-3 max-w-[85%]">
                      <p className="text-navy-700 text-sm">California</p>
                    </div>
                    <div className="bg-teal-600 rounded-lg p-3 max-w-[90%] ml-auto">
                      <p className="text-white text-sm">
                        In California, landlords must typically provide 30-60 days notice depending
                        on how long you've lived there. A 3-day notice is only valid for specific
                        reasons like unpaid rent. Let me explain your options...
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-navy-200">
                    <StandardDisclaimer variant="compact" />
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                  Response in 5 seconds
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-navy-50 border-b border-navy-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">$350</div>
                <p className="text-navy-600 text-sm">{lang === 'en' ? 'Average hourly lawyer rate' : 'Tarifa promedio por hora de abogado'}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
                <p className="text-navy-600 text-sm">{lang === 'en' ? 'ezLegal.ai unlimited questions' : 'ezLegal.ai preguntas ilimitadas'}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">5 sec</div>
                <p className="text-navy-600 text-sm">{lang === 'en' ? 'Average response time' : 'Tiempo promedio de respuesta'}</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-teal-600 mb-2">24/7</div>
                <p className="text-navy-600 text-sm">{lang === 'en' ? 'Always available' : 'Siempre disponible'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {lang === 'en' ? 'Common Legal Questions We Help With' : 'Preguntas Legales Comunes con las que Ayudamos'}
              </h2>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                {lang === 'en'
                  ? 'From everyday issues to complex situations, get clear guidance on the legal matters that affect your life'
                  : 'Desde problemas cotidianos hasta situaciones complejas, obtén orientación clara sobre los asuntos legales que afectan tu vida'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRACTICE_AREAS.map((area, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-navy-200 overflow-hidden hover:shadow-lg transition-all"
                >
                  <button
                    onClick={() => setExpandedArea(expandedArea === index ? null : index)}
                    className="w-full p-6 text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <area.icon className="w-6 h-6 text-teal-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-navy-900 mb-1">{area.name[lang]}</h3>
                          <p className="text-sm text-navy-600">{area.description[lang]}</p>
                        </div>
                      </div>
                      {expandedArea === index ? (
                        <ChevronUp className="w-5 h-5 text-navy-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {expandedArea === index && (
                    <div className="px-6 pb-6 pt-0">
                      <div className="bg-navy-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-navy-500 uppercase tracking-wide mb-3">
                          {lang === 'en' ? 'Example Questions' : 'Preguntas de Ejemplo'}
                        </p>
                        <ul className="space-y-2">
                          {area.examples[lang].map((example, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                              <MessageSquare className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                              <span>"{example}"</span>
                            </li>
                          ))}
                        </ul>
                        <Link
                          to="/chat"
                          className="mt-4 inline-flex items-center gap-2 text-teal-600 font-semibold text-sm hover:text-teal-700"
                        >
                          {lang === 'en' ? `Ask about ${area.name.en.toLowerCase()}` : `Preguntar sobre ${area.name.es.toLowerCase()}`}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{lang === 'en' ? 'How ezLegal.ai Helps You' : 'Cómo ezLegal.ai te Ayuda'}</h2>
              <p className="text-lg text-navy-300 max-w-2xl mx-auto">
                {lang === 'en'
                  ? 'Your personal legal front door - understand your situation before deciding next steps'
                  : 'Tu puerta de entrada legal - entiende tu situación antes de decidir los próximos pasos'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-8 h-8 text-teal-400" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">1</div>
                <h3 className="text-xl font-bold mb-3">{lang === 'en' ? 'Describe Your Situation' : 'Describe tu Situación'}</h3>
                <p className="text-navy-300">
                  {lang === 'en'
                    ? 'Tell us what\'s happening in your own words. Our AI understands context and asks clarifying questions to fully understand your situation.'
                    : 'Cuéntanos lo que está pasando en tus propias palabras. Nuestra IA entiende el contexto y hace preguntas aclaratorias para comprender tu situación.'}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">2</div>
                <h3 className="text-xl font-bold mb-3">{lang === 'en' ? 'Get Local Guidance' : 'Obtén Orientación Local'}</h3>
                <p className="text-navy-300">
                  {lang === 'en'
                    ? 'Receive information tailored to your jurisdiction. Laws vary by location, and our AI knows the differences that matter for your situation.'
                    : 'Recibe información adaptada a tu jurisdicción. Las leyes varían por ubicación, y nuestra IA conoce las diferencias que importan para tu situación.'}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-amber-400" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">3</div>
                <h3 className="text-xl font-bold mb-3">{lang === 'en' ? 'Know Your Options' : 'Conoce tus Opciones'}</h3>
                <p className="text-navy-300">
                  {lang === 'en'
                    ? 'Understand your rights, deadlines, and next steps. Generate documents, or connect with a licensed attorney when needed.'
                    : 'Entiende tus derechos, plazos y próximos pasos. Genera documentos o conéctate con un abogado licenciado cuando sea necesario.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {lang === 'en' ? 'Designed for Real Legal Challenges' : 'Diseñado para Desafíos Legales Reales'}
              </h2>
              <p className="text-lg text-navy-600 max-w-2xl mx-auto">
                {lang === 'en'
                  ? 'ezLegal.ai is built to help people navigate the legal situations that feel most overwhelming.'
                  : 'ezLegal.ai está diseñado para ayudar a las personas a navegar las situaciones legales más abrumadoras.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                  <Home className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{lang === 'en' ? 'Housing & Eviction' : 'Vivienda y Desalojo'}</h3>
                <p className="text-navy-700 mb-4">
                  {lang === 'en'
                    ? 'Facing an eviction notice or landlord dispute? Get instant guidance on your tenant rights, response deadlines, and next steps to protect your home.'
                    : 'Enfrentando un aviso de desalojo o disputa con el propietario? Obtenga orientación instantánea sobre sus derechos como inquilino, plazos de respuesta y próximos pasos para proteger su hogar.'}
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Free to ask unlimited questions' : 'Gratis para hacer preguntas ilimitadas'}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{lang === 'en' ? 'Employment & Wages' : 'Empleo y Salarios'}</h3>
                <p className="text-navy-700 mb-4">
                  {lang === 'en'
                    ? 'Dealing with unpaid wages, wrongful termination, or workplace issues? Understand your options and get help drafting demand letters.'
                    : 'Lidiando con salarios no pagados, despido injusto o problemas laborales? Entienda sus opciones y obtenga ayuda para redactar cartas de demanda.'}
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Attorney referrals when needed' : 'Referencias a abogados cuando sea necesario'}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-navy-200 shadow-sm">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                  <Heart className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{lang === 'en' ? 'Family Law' : 'Derecho Familiar'}</h3>
                <p className="text-navy-700 mb-4">
                  {lang === 'en'
                    ? 'Navigating divorce, custody, or support issues? Get clear explanations of the process so you know what to expect at every step.'
                    : 'Navegando divorcio, custodia o asuntos de manutención? Obtenga explicaciones claras del proceso para saber qué esperar en cada paso.'}
                </p>
                <div className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Compassionate, judgment-free help' : 'Ayuda compasiva y sin juicios'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {lang === 'en' ? 'Choose Your Plan' : 'Elige tu Plan'}
              </h2>
              <p className="text-lg text-navy-600">
                {lang === 'en' ? 'Start free, upgrade when you need more' : 'Comienza gratis, mejora cuando necesites más'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border-2 border-navy-200 p-8">
                <h3 className="text-xl font-bold text-navy-900 mb-2">{lang === 'en' ? 'Free' : 'Gratis'}</h3>
                <div className="text-4xl font-bold text-navy-900 mb-4">
                  $0
                  <span className="text-lg text-navy-500 font-normal">/{lang === 'en' ? 'month' : 'mes'}</span>
                </div>
                <p className="text-navy-600 mb-6">{lang === 'en' ? 'Unlimited questions forever' : 'Preguntas ilimitadas para siempre'}</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-navy-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{lang === 'en' ? 'Unlimited free questions' : 'Preguntas gratuitas ilimitadas'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-navy-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{lang === 'en' ? 'Basic legal information' : 'Información legal básica'}</span>
                  </li>
                  <li className="flex items-center gap-3 text-navy-700">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{lang === 'en' ? 'Attorney directory access' : 'Acceso al directorio de abogados'}</span>
                  </li>
                </ul>
                <Link
                  to="/ask"
                  className="block w-full text-center bg-navy-100 hover:bg-navy-200 text-navy-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {lang === 'en' ? 'Try Free' : 'Probar Gratis'}
                </Link>
              </div>

              <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-400 text-navy-900 px-3 py-1 rounded-full text-sm font-bold">
                  {lang === 'en' ? 'PAY AS NEEDED' : 'PAGA SEGÚN NECESITES'}
                </div>
                <h3 className="text-xl font-bold mb-2">{lang === 'en' ? 'Issue Packs' : 'Paquetes de Problemas'}</h3>
                <div className="text-4xl font-bold mb-4">
                  $29-$49
                  <span className="text-lg text-teal-200 font-normal"> {lang === 'en' ? 'one-time' : 'único pago'}</span>
                </div>
                <p className="text-teal-100 mb-6">{lang === 'en' ? 'When you need action plans' : 'Cuando necesitas planes de acción'}</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>{lang === 'en' ? 'Detailed action plan for your issue' : 'Plan de acción detallado para tu problema'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>{lang === 'en' ? 'Document templates included' : 'Plantillas de documentos incluidas'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>{lang === 'en' ? 'Deadline checklists' : 'Listas de verificación de plazos'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>{lang === 'en' ? 'Jurisdiction-specific guidance' : 'Orientación específica por jurisdicción'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span>{lang === 'en' ? 'Attorney referrals included' : 'Referencias a abogados incluidas'}</span>
                  </li>
                </ul>
                <Link
                  to="/pricing"
                  className="block w-full text-center bg-white hover:bg-teal-50 text-teal-600 px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  {lang === 'en' ? 'View Issue Packs' : 'Ver Paquetes'}
                </Link>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/pricing"
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                {lang === 'en' ? 'View all Issue Packs and pricing options' : 'Ver todos los paquetes y opciones de precios'}
                <ArrowRight className="w-4 h-4 inline ml-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-navy-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy-900 mb-4">
                {lang === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
              </h2>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: lang === 'en' ? "Is ezLegal.ai a replacement for a lawyer?" : "¿Es ezLegal.ai un reemplazo para un abogado?",
                  a: lang === 'en' ? "No. We provide legal information to help you understand your situation, but we cannot provide legal advice or represent you. For complex matters, litigation, or when you need someone to act on your behalf, you'll need a licensed attorney. We can help you find one." : "No. Proporcionamos información legal para ayudarle a entender su situación, pero no podemos dar asesoría legal ni representarle. Para asuntos complejos o litigios, necesitará un abogado licenciado. Podemos ayudarle a encontrar uno."
                },
                {
                  q: lang === 'en' ? "How is this different from just Googling my legal question?" : "¿En qué se diferencia de buscar mi pregunta legal en Google?",
                  a: lang === 'en' ? "Our AI understands context, asks clarifying questions, and provides jurisdiction-specific information. Instead of sifting through generic articles, you get personalized guidance based on your specific situation and location." : "Nuestra IA entiende el contexto, hace preguntas aclaratorias y proporciona información específica de su jurisdicción. En vez de buscar en artículos genéricos, obtiene orientación personalizada basada en su situación y ubicación."
                },
                {
                  q: lang === 'en' ? "Is my information private?" : "¿Mi información es privada?",
                  a: lang === 'en' ? "Yes. We use TLS 1.3 + AES-256 encryption and never share or sell your data. Your conversations are not used to train AI models. However, since we're not a law firm, conversations are not protected by attorney-client privilege." : "Sí. Usamos encriptación TLS 1.3 + AES-256 y nunca compartimos ni vendemos sus datos. Sus conversaciones no se usan para entrenar modelos de IA. Sin embargo, como no somos un bufete de abogados, las conversaciones no están protegidas por el privilegio abogado-cliente."
                },
                {
                  q: lang === 'en' ? "What if I need an actual attorney?" : "¿Qué pasa si necesito un abogado?",
                  a: lang === 'en' ? "We'll always tell you when your situation would benefit from professional representation. Our directory includes verified, bar-licensed attorneys you can contact directly." : "Siempre le diremos cuando su situación se beneficiaría de representación profesional. Nuestro directorio incluye abogados verificados que puede contactar directamente."
                },
                {
                  q: lang === 'en' ? "Can I cancel anytime?" : "¿Puedo cancelar en cualquier momento?",
                  a: lang === 'en' ? "Yes, cancel anytime with no penalties. If you're not satisfied, we offer a 30-day money-back guarantee." : "Sí, cancele en cualquier momento sin penalidades. Si no está satisfecho, ofrecemos garantía de devolución de 30 días."
                }
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-navy-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-navy-50 transition-colors"
                  >
                    <span className="font-semibold text-navy-900 pr-4">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 bg-navy-50 border-t border-navy-200">
                      <p className="text-navy-600 leading-relaxed pt-4">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              {lang === 'en' ? 'Ready to Understand Your Legal Situation?' : '¿Listo para entender su situación legal?'}
            </h2>
            <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
              {lang === 'en'
                ? 'Stop wondering and start getting answers. Our AI is ready to help you navigate your legal questions right now.'
                : 'Deje de preguntarse y comience a obtener respuestas. Nuestra IA está lista para ayudarle a navegar sus preguntas legales ahora mismo.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center justify-center gap-2 bg-white text-teal-600 px-8 py-4 rounded-lg font-bold hover:bg-teal-50 transition-all shadow-lg text-lg"
              >
                <MessageSquare className="w-5 h-5" />
                {lang === 'en' ? 'Start Free Chat Now' : 'Iniciar Chat Gratis'}
              </Link>
            </div>
            <p className="text-teal-200 text-sm mt-6">
              {lang === 'en' ? 'No account required | Answers in seconds | Free questions, always' : 'Sin cuenta requerida | Respuestas en segundos | Preguntas gratis, siempre'}
            </p>
          </div>
        </section>
      </main>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
