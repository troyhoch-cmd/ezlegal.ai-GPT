import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  MessageCircle,
  AlertTriangle,
  Phone,
  CheckCircle,
  Clock,
  Scale,
  Home,
  Briefcase,
  Car,
  Baby,
  Globe,
  ArrowRight,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WhatsAppChat from '../components/espanol/WhatsAppChat';
import WhatsAppOptIn from '../components/WhatsAppOptIn';
import NotarioFraudChecker from '../components/espanol/NotarioFraudChecker';
import ImmigrationStatusChecker from '../components/espanol/ImmigrationStatusChecker';
import KnowYourRightsSection from '../components/espanol/KnowYourRightsSection';
import ShareButton from '../components/ShareButton';
import Navigation from '../components/Navigation';
import { AccessibleGallery } from '../components/inclusive';
import SmartImage from '../components/SmartImage';

const COMMUNITY_VALUES = [
  { name: 'Confidencial', description: 'Tu información está protegida y nunca se comparte' },
  { name: 'Sin Juicio', description: 'Ayuda legal sin importar tu estatus migratorio' },
  { name: 'En Español', description: 'Servicio completo en tu idioma' },
  { name: 'Accesible', description: 'Preguntas ilimitadas gratis, sin tarjeta de crédito' }
];

const USE_CASES = [
  {
    title: 'Derechos Laborales',
    description: 'Si tu patrón no te paga lo justo, te ayudamos a entender tus derechos y opciones legales.',
    icon: Briefcase,
    color: 'bg-amber-500'
  },
  {
    title: 'Fraude de Notario',
    description: 'Aprende a identificar fraude de notario y qué hacer si alguien te cobra por servicios legales que no puede ofrecer.',
    icon: AlertTriangle,
    color: 'bg-rose-500'
  },
  {
    title: 'Robo de Salario',
    description: 'Si no te han pagado horas extras o el salario mínimo, te explicamos cómo presentar un reclamo paso a paso.',
    icon: Scale,
    color: 'bg-teal-500'
  }
];

const LEGAL_AREAS = [
  { icon: Globe, title: 'Inmigración', description: 'DACA, visas, ciudadanía, deportación', color: 'bg-teal-500' },
  { icon: Briefcase, title: 'Trabajo', description: 'Salarios, discriminación, despidos', color: 'bg-amber-500' },
  { icon: Home, title: 'Vivienda', description: 'Desalojos, depósitos, reparaciones', color: 'bg-emerald-500' },
  { icon: Baby, title: 'Familia', description: 'Custodia, manutención, divorcio', color: 'bg-rose-500' },
  { icon: Car, title: 'Accidentes', description: 'Autos, lesiones, compensación', color: 'bg-sky-500' },
  { icon: Scale, title: 'Criminal', description: 'Derechos, defensa, antecedentes', color: 'bg-navy-500' }
];

const FAQ_ITEMS = [
  {
    q: '¿No tengo papeles. Es seguro usar ezLegal?',
    a: 'Sí. Tu información está cifrada y protegida. NO compartimos datos con ICE, la policía, ni ninguna agencia del gobierno. Tu privacidad es nuestra prioridad. Nota: ezLegal proporciona información legal, no representación legal, por lo que las conversaciones no están cubiertas por el privilegio abogado-cliente.'
  },
  {
    q: '¿Cuánto cuesta?',
    a: 'Preguntas ilimitadas son GRATIS, sin tarjeta de crédito. Cuando necesites planes de acción detallados y plantillas de documentos, ofrecemos Paquetes de Ayuda desde $29. Si calificas para ayuda legal gratuita, te conectamos sin costo.'
  },
  {
    q: '¿Hablan español de verdad?',
    a: 'Sí. Nuestra plataforma de IA está completamente disponible en español. Las respuestas están diseñadas para ser claras y accesibles en tu idioma.'
  },
  {
    q: '¿Cómo sé que no son notarios falsos?',
    a: 'ezLegal es una plataforma de información legal con IA, no un despacho de abogados. Cuando necesites representación, te conectamos con abogados licenciados que puedes verificar directamente en el colegio de abogados de tu estado.'
  },
  {
    q: '¿Pueden ayudarme si vivo en otro estado?',
    a: 'Sí. Nuestra IA puede ayudarte con información legal general. Cuando necesites un abogado, nuestro directorio te conecta con abogados licenciados en tu estado.'
  }
];

export default function EspanolLanding() {
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showNotarioChecker, setShowNotarioChecker] = useState(false);
  const [showImmigrationChecker, setShowImmigrationChecker] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { setLanguage } = useLanguage();

  useEffect(() => {
    setLanguage('es');
  }, [setLanguage]);

  return (
    <div lang="es" className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900">
      <Navigation />
      <div className="bg-red-600 text-white py-2 px-4 text-center text-sm pt-24">
        <AlertTriangle className="inline-block w-4 h-4 mr-2" />
        <span className="font-semibold">Si ICE está en tu puerta ahora:</span>
        {' '}No abras. Tienes derechos.
        <a href="tel:+18003549796" className="underline font-bold ml-2">
          Llama: 1-800-354-9796 (Línea de Emergencia)
        </a>
      </div>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/20 to-amber-600/20" />
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-full text-amber-300 text-sm mb-6">
                <Shield className="w-4 h-4" />
                Tu información está protegida. Prometido.
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Ayuda Legal
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-amber-400">
                  Para Nuestra Comunidad
                </span>
              </h1>

              <p className="text-xl text-navy-300 mb-8 leading-relaxed">
                Información legal con IA. En español. Sin miedo.
                <span className="block mt-2 text-navy-400">
                  No importa tu estatus migratorio.
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowWhatsApp(true)}
                  className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-green-500/30"
                >
                  <MessageCircle className="w-6 h-6" />
                  Escribe por WhatsApp
                </button>

                <Link
                  to="/contact"
                  className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                >
                  <Phone className="w-6 h-6" />
                  Contáctanos
                </Link>
              </div>

              <div className="flex items-center gap-6 text-navy-400 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-400" />
                  100% Confidencial
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Disponible 24/7
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <SmartImage
                  src="https://images.pexels.com/photos/7876667/pexels-photo-7876667.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Familia hispana sonriendo en una reunion legal comunitaria en Tucson, Arizona"
                  width={800}
                  height={400}
                  priority
                  className="w-full h-[400px] object-cover"
                  geoLocation="Tucson, AZ, USA"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="font-semibold">Ayuda Legal en Tu Idioma</p>
                  <p className="text-sm text-navy-300">Disponible 24/7 en español</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-800/50 border-y border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-teal-400">Creciendo</div>
              <div className="text-navy-400 text-sm">Comunidad activa</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">IA + Abogados</div>
              <div className="text-navy-400 text-sm">Asistencia bilingue</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">Arizona</div>
              <div className="text-navy-400 text-sm">Red de abogados verificados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-rose-400">$0</div>
              <div className="text-navy-400 text-sm">Preguntas ilimitadas gratis</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-red-900/30 to-orange-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-navy-800/80 backdrop-blur rounded-2xl p-8 border border-red-500/30">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  ALERTA DE FRAUDE
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Cuidado con los Notarios Falsos
                </h2>
                <p className="text-navy-300 mb-6">
                  En México, un "notario" es un abogado. En Estados Unidos, NO.
                  Miles de inmigrantes pierden dinero cada año por notarios que prometen
                  ayuda con inmigración pero no pueden hacerlo legalmente.
                </p>
                <ul className="space-y-3 text-navy-300 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    Solo un ABOGADO puede dar consejos de inmigración
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    Un notario público solo puede certificar firmas
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    Si te prometen papeles rápidos, es fraude
                  </li>
                </ul>
                <button
                  onClick={() => setShowNotarioChecker(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Verificar si Alguien es Legítimo
                </button>
              </div>
              <div className="relative">
                <SmartImage
                  src="https://images.pexels.com/photos/8112172/pexels-photo-8112172.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Revisando un documento legal para detectar fraude de notario"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-red-500 text-white p-4 rounded-xl shadow-lg">
                  <div className="text-2xl font-bold">Protegete</div>
                  <div className="text-sm">verifica antes de pagar</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              ¿En Qué Te Podemos Ayudar?
            </h2>
            <p className="text-navy-400 max-w-2xl mx-auto">
              Nuestra IA te ayuda con información legal en las areas
              que mas afectan a nuestra comunidad.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEGAL_AREAS.map((area) => (
              <button
                key={area.title}
                onClick={() => area.title === 'Inmigración' && setShowImmigrationChecker(true)}
                className="bg-navy-800/50 hover:bg-navy-800 border border-navy-700 hover:border-navy-600 rounded-xl p-6 text-left transition-all group"
              >
                <div className={`w-12 h-12 ${area.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <area.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{area.title}</h3>
                <p className="text-navy-400">{area.description}</p>
                <div className="mt-4 flex items-center gap-2 text-teal-400 text-sm font-medium">
                  Consultar ahora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-teal-900/30 to-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Revisa Tu Situación Migratoria
              </h2>
              <p className="text-navy-300 mb-6">
                Responde unas preguntas simples y te diremos qué opciones tienes.
                100% confidencial, no guardamos tu información.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-navy-300">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-400" />
                  </div>
                  Opciones de DACA y renovación
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-400" />
                  </div>
                  Visas familiares y de trabajo
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-400" />
                  </div>
                  Caminos a la residencia permanente
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-teal-400" />
                  </div>
                  Defensa contra deportación
                </li>
              </ul>
              <button
                onClick={() => setShowImmigrationChecker(true)}
                className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center gap-3"
              >
                <Globe className="w-6 h-6" />
                Comenzar Evaluación Gratis
              </button>
            </div>
            <div className="relative">
              <SmartImage
                src="https://images.pexels.com/photos/6147276/pexels-photo-6147276.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Pasaporte y documentos de inmigracion sobre un escritorio"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-navy-900 p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-teal-600" />
                  <span className="font-semibold">Privado y Seguro</span>
                </div>
                <p className="text-sm text-navy-600 mt-1">No compartimos con ICE</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <KnowYourRightsSection />

      <section className="py-20 bg-navy-900/40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Historias de Nuestra Comunidad
            </h2>
            <p className="text-navy-300 max-w-2xl mx-auto">
              Personas reales que usaron ezLegal para resolver problemas legales en español.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <AccessibleGallery
              label="Historias de la comunidad"
              autoplay={false}
              items={[
                {
                  id: 'maria',
                  title: 'Maria, Tucson',
                  content: (
                    <p className="text-navy-700 text-base leading-relaxed">
                      "ezLegal me ayudo a entender mi aviso de desalojo en 5 minutos. Supe exactamente que responder y gane tiempo para encontrar un nuevo lugar."
                    </p>
                  ),
                },
                {
                  id: 'carlos',
                  title: 'Carlos, Phoenix',
                  content: (
                    <p className="text-navy-700 text-base leading-relaxed">
                      "Redacte una carta de demanda gratis. Mi arrendador me devolvio el depósito sin pelear."
                    </p>
                  ),
                },
                {
                  id: 'rosa',
                  title: 'Rosa, Mesa',
                  content: (
                    <p className="text-navy-700 text-base leading-relaxed">
                      "Identificamos un fraude de notario antes de que le pagara. Protegio a toda mi familia."
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Cómo Te Podemos Ayudar
            </h2>
            <p className="text-navy-400">
              Situaciones legales comunes donde ezLegal te guía paso a paso
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {USE_CASES.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={index}
                  className="bg-navy-800/50 border border-navy-700 rounded-2xl p-6 hover:border-teal-500/50 transition-colors"
                >
                  <div className={`w-12 h-12 ${useCase.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-3">{useCase.title}</h3>
                  <p className="text-navy-300 mb-4">{useCase.description}</p>
                  <div className="inline-flex items-center gap-2 text-teal-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Preguntas ilimitadas gratis
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Precios Justos Para Todos
            </h2>
            <p className="text-navy-400 max-w-2xl mx-auto">
              No cobramos como los abogados tradicionales. Opciones flexibles para cada situación.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-8">
              <div className="text-navy-400 text-sm font-semibold mb-2">GRATIS</div>
              <div className="text-4xl font-bold text-white mb-2">$0</div>
              <div className="text-navy-400 mb-6">Para siempre</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  3 preguntas por WhatsApp
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Guía "Conoce tus Derechos"
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Verificador de notarios
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Evaluación migratoria básica
                </li>
              </ul>
              <button
                onClick={() => setShowWhatsApp(true)}
                className="w-full bg-navy-700 hover:bg-navy-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Empezar Gratis
              </button>
            </div>

            <div className="bg-navy-800/50 border border-teal-500 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                MÁS POPULAR
              </div>
              <div className="text-teal-400 text-sm font-semibold mb-2">PAGO POR DOCUMENTO</div>
              <div className="text-4xl font-bold text-white mb-2">$5-25</div>
              <div className="text-navy-400 mb-6">Por documento</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Cartas legales desde $5
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Formularios de inmigración $15
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Contratos de renta $20
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-teal-400" />
                  Revisión por abogado $25
                </li>
              </ul>
              <Link
                to="/chat"
                className="block w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition-colors text-center"
              >
                Ver Documentos
              </Link>
            </div>

            <div className="bg-navy-800/50 border border-navy-700 rounded-2xl p-8">
              <div className="text-amber-400 text-sm font-semibold mb-2">PAQUETES DE AYUDA</div>
              <div className="text-4xl font-bold text-white mb-2">$29-$49</div>
              <div className="text-navy-400 mb-6">Pago único</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                  Plan de acción detallado
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                  Plantillas de documentos
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                  Lista de fechas importantes
                </li>
                <li className="flex items-center gap-3 text-navy-300">
                  <CheckCircle className="w-5 h-5 text-amber-400" />
                  Conexión con abogados
                </li>
              </ul>
              <Link
                to="/issue-packs"
                className="block w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors text-center"
              >
                Ver Paquetes
              </Link>
              <Link
                to="/case-predictor"
                className="block w-full mt-3 bg-navy-700 hover:bg-navy-600 text-white py-3 rounded-xl font-semibold transition-colors text-center border border-navy-600"
              >
                Predictor de Casos - $4.99
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-navy-400">
              ¿No puedes pagar?
              <Link to="/pro-bono" className="text-teal-400 hover:underline ml-2">
                Revisa si calificas para ayuda legal gratuita
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h3 className="text-xl text-navy-400 mb-2">Nuestro Compromiso Contigo</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {COMMUNITY_VALUES.map((value) => (
              <div key={value.name} className="text-center">
                <div className="bg-navy-800 rounded-xl p-6 border border-navy-700 hover:border-teal-500/50 transition-colors">
                  <div className="text-xl font-bold text-white mb-1">{value.name}</div>
                  <div className="text-sm text-navy-400">{value.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="bg-navy-800/50 border border-navy-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-white pr-4">{item.q}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-navy-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-navy-300">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-navy-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Recibe Ayuda Legal por WhatsApp
              </h2>
              <p className="text-navy-300 mb-6">
                Deja tu numero y nuestro equipo bilingue te contactara en menos de 24 horas. Confidencial y seguro.
              </p>
              <WhatsAppOptIn source="espanol_landing" variant="full" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Comparte con Familia y Amigos
              </h2>
              <p className="text-navy-300 mb-6">
                Ayuda a alguien que necesita información legal. Comparte ezLegal de forma segura.
              </p>
              <ShareButton context="legal-help" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            No Estás Solo. Estamos Aquí Para Ayudarte.
          </h2>
          <p className="text-xl text-teal-100 mb-8">
            Hay ayuda legal disponible para ti. Da el primer paso hoy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowWhatsApp(true)}
              className="flex items-center justify-center gap-3 bg-white text-teal-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-50 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              Escribir por WhatsApp
            </button>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-3 bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-800 transition-colors"
            >
              <Phone className="w-6 h-6" />
              Contáctanos
            </Link>
          </div>
          <p className="mt-6 text-teal-100 text-sm">
            <Lock className="w-4 h-4 inline mr-2" />
            Tu privacidad está protegida. No compartimos información con agencias del gobierno.
          </p>
        </div>
      </section>

      <footer className="bg-navy-900 border-t border-navy-800 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-6 h-6 text-teal-400" />
                <span className="text-xl font-bold text-white">ezLegal</span>
                <span className="text-teal-400">en Español</span>
              </div>
              <p className="text-navy-400 text-sm">
                Ayuda legal accesible para la comunidad hispana.
                Abogados reales, precios justos, sin miedo.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Servicios</h4>
              <ul className="space-y-2 text-navy-400 text-sm">
                <li><Link to="/chat" className="hover:text-teal-400">Inmigración</Link></li>
                <li><Link to="/chat" className="hover:text-teal-400">Derechos Laborales</Link></li>
                <li><Link to="/chat" className="hover:text-teal-400">Vivienda</Link></li>
                <li><Link to="/chat" className="hover:text-teal-400">Familia</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Recursos</h4>
              <ul className="space-y-2 text-navy-400 text-sm">
                <li><Link to="/ezreads" className="hover:text-teal-400">Guías Legales</Link></li>
                <li><Link to="/find-attorney" className="hover:text-teal-400">Encontrar Abogado</Link></li>
                <li><Link to="/emergency-resources" className="hover:text-teal-400">Ayuda de Emergencia</Link></li>
                <li><Link to="/pro-bono" className="hover:text-teal-400">Ayuda Legal Gratuita</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-2 text-navy-400 text-sm">
                <li className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <Link to="/contact" className="hover:text-teal-400">Envíanos un mensaje</Link>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  IA disponible 24/7
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-navy-500 text-sm">
              &copy; 2026 ezLegal. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-navy-500 text-sm">
              <Link to="/privacy" className="hover:text-teal-400">Privacidad</Link>
              <Link to="/terms" className="hover:text-teal-400">Términos</Link>
              <Link to="/accessibility" className="hover:text-teal-400">Accesibilidad</Link>
            </div>
          </div>
        </div>
      </footer>

      {showWhatsApp && (
        <WhatsAppChat onClose={() => setShowWhatsApp(false)} />
      )}

      {showNotarioChecker && (
        <NotarioFraudChecker onClose={() => setShowNotarioChecker(false)} />
      )}

      {showImmigrationChecker && (
        <ImmigrationStatusChecker onClose={() => setShowImmigrationChecker(false)} />
      )}
    </div>
  );
}
