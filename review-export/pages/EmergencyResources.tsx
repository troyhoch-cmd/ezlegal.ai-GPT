import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import RelatedLinks from '../components/RelatedLinks';
import {
  Phone, Shield, Home, Heart, Scale, AlertTriangle, ExternalLink,
  Clock, Users, Globe, ChevronRight, MessageSquare, FileText, MapPin,
  LogOut, Smartphone
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CrisisTriageGate from '../components/CrisisTriageGate';

interface Resource {
  name: string;
  nameEs?: string;
  phone: string;
  description: string;
  descriptionEs?: string;
  available: string;
  website?: string;
  isNational?: boolean;
  states?: string[];
}

interface ResourceCategory {
  id: string;
  title: string;
  titleEs: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  resources: Resource[];
}

const US_STATES = [
  { code: 'ALL', name: 'All States (National Resources)' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'FL', name: 'Florida' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
];

const resourceCategories: ResourceCategory[] = [
  {
    id: 'domestic-violence',
    title: 'Domestic Violence',
    titleEs: 'Violencia Domestica',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    resources: [
      {
        name: 'National Domestic Violence Hotline',
        nameEs: 'Línea Nacional de Violencia Doméstica',
        phone: '1-800-799-7233',
        description: 'Free, confidential support 24/7 for victims and survivors of domestic violence.',
        descriptionEs: 'Apoyo gratuito y confidencial 24/7 para víctimas y sobrevivientes de violencia doméstica.',
        available: '24/7',
        website: 'https://www.thehotline.org',
        isNational: true
      },
      {
        name: 'Crisis Text Line',
        phone: 'Text HOME to 741741',
        description: 'Free crisis support via text message.',
        available: '24/7',
        isNational: true
      },
      {
        name: 'Arizona Coalition to End Sexual and Domestic Violence',
        phone: '1-800-782-6400',
        description: 'Arizona-specific resources, shelter referrals, and legal advocacy.',
        available: '24/7',
        website: 'https://www.acesdv.org',
        states: ['AZ']
      },
      {
        name: 'California Partnership to End Domestic Violence',
        phone: '1-800-524-4765',
        description: 'California statewide resources, shelter referrals, and advocacy services.',
        available: '24/7',
        website: 'https://www.cpedv.org',
        states: ['CA']
      },
      {
        name: 'Texas Council on Family Violence',
        phone: '1-800-525-1978',
        description: 'Texas statewide domestic violence hotline and resources.',
        available: '24/7',
        website: 'https://tcfv.org',
        states: ['TX']
      }
    ]
  },
  {
    id: 'housing',
    title: 'Housing & Eviction',
    titleEs: 'Vivienda y Desalojo',
    icon: <Home className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    resources: [
      {
        name: 'HUD Housing Counseling',
        phone: '1-800-569-4287',
        description: 'Free HUD-approved housing counseling for foreclosure, rental issues.',
        available: 'Mon-Fri 8am-8pm EST',
        isNational: true
      },
      {
        name: 'National Low Income Housing Coalition',
        phone: '',
        description: 'Resources and advocacy for affordable housing nationwide.',
        available: 'Online 24/7',
        website: 'https://nlihc.org',
        isNational: true
      },
      {
        name: 'Arizona Housing Coalition',
        phone: '1-877-211-8661',
        description: 'Emergency housing assistance, rental help, and eviction prevention.',
        descriptionEs: 'Asistencia de emergencia para vivienda, ayuda con el alquiler y prevencion de desalojos.',
        available: 'Mon-Fri 8am-5pm',
        website: 'https://www.azhomeless.org',
        states: ['AZ']
      },
      {
        name: 'Community Legal Services (Phoenix)',
        phone: '(602) 258-3434',
        description: 'Free legal help for eviction defense, landlord disputes, and housing rights.',
        available: 'Mon-Fri 8am-5pm',
        website: 'https://www.clsaz.org',
        states: ['AZ']
      },
      {
        name: 'California Housing Partnership',
        phone: '(415) 433-6804',
        description: 'Statewide resources for affordable housing and tenant rights in California.',
        available: 'Mon-Fri 9am-5pm PT',
        website: 'https://chpc.net',
        states: ['CA']
      },
      {
        name: 'Texas RioGrande Legal Aid - Housing',
        phone: '1-888-988-9996',
        description: 'Free legal help for housing issues in Texas.',
        available: 'Mon-Fri 8am-5pm CT',
        website: 'https://www.trla.org',
        states: ['TX']
      }
    ]
  },
  {
    id: 'mental-health',
    title: 'Mental Health Crisis',
    titleEs: 'Crisis de Salud Mental',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        nameEs: 'Linea de Prevencion del Suicidio',
        phone: '988',
        description: 'Free, confidential crisis support for mental health emergencies.',
        descriptionEs: 'Apoyo gratuito y confidencial para emergencias de salud mental.',
        available: '24/7',
        website: 'https://988lifeline.org',
        isNational: true
      },
      {
        name: 'SAMHSA National Helpline',
        phone: '1-800-662-4357',
        description: 'Treatment referrals and information for mental health and substance abuse.',
        available: '24/7',
        website: 'https://www.samhsa.gov/find-help/national-helpline',
        isNational: true
      },
      {
        name: 'Crisis Response Network (Arizona)',
        phone: '1-800-631-1314',
        description: 'Arizona behavioral health crisis line with mobile crisis teams.',
        available: '24/7',
        website: 'https://crisisnetwork.org',
        states: ['AZ']
      },
      {
        name: 'California Mental Health Services',
        phone: '1-855-845-7415',
        description: 'CalHOPE crisis line for California residents.',
        available: '24/7',
        website: 'https://www.calhope.org',
        states: ['CA']
      },
      {
        name: 'Texas Health and Human Services Crisis Line',
        phone: '1-800-252-8154',
        description: 'Texas statewide mental health crisis support.',
        available: '24/7',
        states: ['TX']
      }
    ]
  },
  {
    id: 'immigration',
    title: 'Immigration',
    titleEs: 'Inmigracion',
    icon: <Globe className="w-6 h-6" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    resources: [
      {
        name: 'National Immigration Law Center',
        phone: '(213) 639-3900',
        description: 'Immigration policy information and legal resources.',
        available: 'Mon-Fri 9am-5pm PT',
        website: 'https://www.nilc.org',
        isNational: true
      },
      {
        name: 'USCIS Contact Center',
        phone: '1-800-375-5283',
        description: 'Official USCIS information on immigration status and applications.',
        available: 'Mon-Fri 8am-8pm ET',
        isNational: true
      },
      {
        name: 'Florence Immigrant & Refugee Rights Project',
        phone: '(520) 868-0191',
        description: 'Free legal services for detained immigrants in Arizona.',
        descriptionEs: 'Servicios legales gratuitos para inmigrantes detenidos en Arizona.',
        available: 'Mon-Fri 9am-5pm',
        website: 'https://firrp.org',
        states: ['AZ']
      },
      {
        name: 'California Immigrant Policy Center',
        phone: '(213) 250-5000',
        description: 'Immigration resources and policy advocacy for California.',
        available: 'Mon-Fri 9am-5pm PT',
        website: 'https://caimmigrant.org',
        states: ['CA']
      },
      {
        name: 'RAICES Texas',
        phone: '(210) 787-3933',
        description: 'Free and low-cost legal services for immigrant families in Texas.',
        available: 'Mon-Fri 9am-5pm CT',
        website: 'https://www.raicestexas.org',
        states: ['TX']
      }
    ]
  },
  {
    id: 'legal-aid',
    title: 'General Legal Aid',
    titleEs: 'Asistencia Legal General',
    icon: <Scale className="w-6 h-6" />,
    color: 'text-navy-600',
    bgColor: 'bg-navy-50',
    resources: [
      {
        name: 'ABA Free Legal Answers',
        phone: '',
        description: 'Free legal advice from volunteer attorneys for qualifying low-income individuals via an online Q&A platform.',
        available: 'Online 24/7',
        website: 'https://www.americanbar.org/groups/probono_public_service/projects_awards/free-legal-answers/',
        isNational: true
      },
      {
        name: 'LawHelp.org',
        phone: '',
        description: 'National directory connecting low-income individuals with free legal aid programs, court forms, and self-help resources.',
        available: 'Online 24/7',
        website: 'https://www.lawhelp.org/resource/legal-aid-and-other-low-cost-legal-help',
        isNational: true
      },
      {
        name: 'Arizona Bar Foundation for Legal Services',
        phone: '',
        description: 'Supports legal aid organizations providing civil legal services to low-income Arizonans.',
        available: 'Online 24/7',
        website: 'https://www.azbf.org/',
        states: ['AZ']
      },
      {
        name: 'State Bar of Arizona Legal Aid Resources',
        phone: '',
        description: 'Comprehensive directory of legal aid organizations, pro bono programs, and self-help resources for Arizonans.',
        available: 'Online 24/7',
        website: 'https://www.azbar.org/for-the-public/public-service-center-self-help-education/legal-aid-resources/',
        states: ['AZ']
      },
      {
        name: 'Community Legal Services (Arizona)',
        phone: '(602) 258-3434',
        description: 'Free civil legal assistance for low-income individuals and families in Maricopa, Yavapai, and other Arizona counties.',
        available: 'Mon-Fri 8am-5pm',
        website: 'https://clsaz.org/apply-for-services/',
        states: ['AZ']
      },
      {
        name: 'Southern Arizona Legal Aid',
        phone: '(520) 623-9461',
        description: 'Free civil legal services for low-income residents in Southern Arizona.',
        available: 'Mon-Fri 8am-5pm',
        website: 'https://www.sazlegalaid.org',
        states: ['AZ']
      },
      {
        name: 'DNA People\'s Legal Services',
        phone: '1-800-789-7287',
        description: 'Free legal services for Native American communities in AZ, NM, and UT.',
        available: 'Mon-Fri 8am-5pm',
        website: 'https://www.dnalegalservices.org',
        states: ['AZ', 'NM', 'UT']
      },
      {
        name: 'Legal Aid Foundation of Los Angeles',
        phone: '(800) 399-4529',
        description: 'Free civil legal services for low-income residents in Los Angeles County.',
        available: 'Mon-Fri 9am-5pm PT',
        website: 'https://lafla.org',
        states: ['CA']
      },
      {
        name: 'Texas RioGrande Legal Aid',
        phone: '1-888-988-9996',
        description: 'Free civil legal services for low-income Texans.',
        available: 'Mon-Fri 8am-5pm CT',
        website: 'https://www.trla.org',
        states: ['TX']
      },
      {
        name: 'Step Up to Justice',
        phone: '',
        description: 'Free legal information and self-help resources to help individuals understand and navigate common legal issues.',
        available: 'Online 24/7',
        website: 'https://www.stepuptojustice.org/',
        isNational: true
      }
    ]
  }
];

const evictionTimeline = {
  en: [
    { day: 'Day 1', title: 'Notice Received', description: 'Landlord serves eviction notice. You typically have 5-30 days depending on reason.' },
    { day: 'Day 5-10', title: 'Response Deadline', description: 'For non-payment, you may have only 5 days. Cure the issue or prepare defense.' },
    { day: 'Day 10-30', title: 'Court Filing', description: 'If not resolved, landlord files with court. You\'ll receive a summons.' },
    { day: 'Hearing', title: 'Court Date', description: 'Attend your hearing. Bring all documentation and evidence.' },
    { day: 'After', title: 'Judgment', description: 'If ruled against, you typically have 5 days to vacate or appeal.' },
  ],
  es: [
    { day: 'Dia 1', title: 'Aviso Recibido', description: 'El casero entrega aviso de desalojo. Tipicamente tiene 5-30 dias dependiendo de la razon.' },
    { day: 'Dia 5-10', title: 'Fecha Limite de Respuesta', description: 'Por falta de pago, puede tener solo 5 dias. Resuelva el problema o prepare su defensa.' },
    { day: 'Dia 10-30', title: 'Presentacion en Corte', description: 'Si no se resuelve, el casero presenta ante la corte. Recibira una citacion.' },
    { day: 'Audiencia', title: 'Fecha de Corte', description: 'Asista a su audiencia. Lleve toda la documentacion y evidencia.' },
    { day: 'Despues', title: 'Sentencia', description: 'Si falla en su contra, tipicamente tiene 5 dias para desocupar o apelar.' },
  ],
};

export default function EmergencyResources() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [activeCategory, setActiveCategory] = useState<string>('domestic-violence');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [triageAcknowledged, setTriageAcknowledged] = useState<boolean>(() => {
    try { return sessionStorage.getItem('ezlegal-crisis-triage-ack') === '1'; } catch { return false; }
  });

  const handleTriageAck = useCallback(() => {
    try { sessionStorage.setItem('ezlegal-crisis-triage-ack', '1'); } catch {}
    setTriageAcknowledged(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    return () => { document.documentElement.lang = 'en'; };
  }, [language]);

  const handleQuickExit = useCallback(() => {
    window.open('https://weather.gov', '_self');
    window.location.replace('https://weather.gov');
  }, []);

  const activeResources = resourceCategories.find(c => c.id === activeCategory);

  const filteredResources = activeResources?.resources.filter(resource => {
    if (selectedState === 'ALL') {
      return resource.isNational;
    }
    return resource.isNational || resource.states?.includes(selectedState);
  }) || [];

  return (
    <div className="min-h-screen bg-white">
      {!triageAcknowledged && <CrisisTriageGate onAcknowledge={handleTriageAck} />}
      <Navigation />
      <Breadcrumbs className="mt-24" />

      <button
        onClick={handleQuickExit}
        className="fixed top-4 right-4 z-[9999] bg-navy-800 hover:bg-navy-900 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg transition-colors"
        aria-label={language === 'en' ? 'Quick exit - leave this page immediately' : 'Salida rapida - salir de esta página inmediatamente'}
      >
        <LogOut className="w-4 h-4" />
        {language === 'en' ? 'Quick Exit' : 'Salida Rapida'}
      </button>

      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full">
              <AlertTriangle className="w-4 h-4 text-orange-300" />
              <span className="text-white text-sm font-semibold">Emergency Resources</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 border border-white/30 px-3 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-gold-300" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent text-white text-sm font-semibold border-none outline-none cursor-pointer appearance-none pr-2"
                >
                  {US_STATES.map(state => (
                    <option key={state.code} value={state.code} className="text-navy-900">
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2 rounded-full transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-semibold">{language === 'en' ? 'Español' : 'English'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            {language === 'en' ? 'Crisis Resources & Hotlines' : 'Recursos de Crisis y Lineas de Ayuda'}
          </h1>
          <p className="text-xl text-navy-100 max-w-3xl">
            {language === 'en'
              ? 'Immediate help is available. These resources provide free, confidential support for emergencies.'
              : 'La ayuda inmediata esta disponible. Estos recursos brindan apoyo gratuito y confidencial para emergencias.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="tel:911"
              className="bg-white text-teal-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-teal-50 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {language === 'en' ? 'Call 911 for Emergencies' : 'Llame al 911 para Emergencias'}
            </a>
            <a
              href="tel:988"
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <Heart className="w-5 h-5" />
              {language === 'en' ? 'Call 988 for Mental Health Crisis' : 'Llame al 988 para Crisis de Salud Mental'}
            </a>
            <a
              href="sms:988"
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              <Smartphone className="w-5 h-5" />
              {language === 'en' ? 'Text 988' : 'Texto al 988'}
            </a>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white border-b border-navy-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-50 border border-navy-200 rounded-xl p-5">
            <h2 className="font-bold text-navy-900 text-lg mb-3">
              {language === 'en' ? 'Not sure where to start?' : '¿No sabe por dónde empezar?'}
            </h2>
            <ul className="space-y-2 text-navy-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="font-bold text-red-600 mt-0.5 shrink-0">1.</span>
                <span>
                  {language === 'en'
                    ? 'If you are in immediate danger, call 911 now.'
                    : 'Si esta en peligro inmediato, llame al 911 ahora.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-teal-600 mt-0.5 shrink-0">2.</span>
                <span>
                  {language === 'en'
                    ? 'If you are thinking about harming yourself or others, call or text 988.'
                    : 'Si esta pensando en hacerse dano o hacer dano a otros, llame o envie un texto al 988.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-navy-600 mt-0.5 shrink-0">3.</span>
                <span>
                  {language === 'en'
                    ? 'If you need urgent shelter, legal help, or other support, choose a category below.'
                    : 'Si necesita refugio urgente, ayuda legal u otro apoyo, elija una categoria a continuacion.'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 bg-navy-50 border-b border-navy-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {resourceCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                  activeCategory === category.id
                    ? `${category.bgColor} ${category.color} shadow-md`
                    : 'bg-white text-navy-600 hover:bg-navy-100 border border-navy-200'
                }`}
              >
                {category.icon}
                <span>{language === 'en' ? category.title : category.titleEs}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeResources && (
            <div className="grid gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className={`text-2xl font-bold ${activeResources.color} flex items-center gap-3`}>
                  {activeResources.icon}
                  {language === 'en' ? activeResources.title : activeResources.titleEs} {language === 'en' ? 'Resources' : 'Recursos'}
                </h2>
                {selectedState !== 'ALL' && (
                  <span className="inline-flex items-center gap-2 bg-navy-50 text-navy-700 px-3 py-1.5 rounded-full text-sm font-medium border border-navy-200">
                    <MapPin className="w-4 h-4" />
                    {language === 'en' ? 'Showing' : 'Mostrando'}: {US_STATES.find(s => s.code === selectedState)?.name} + {language === 'en' ? 'National' : 'Nacional'}
                  </span>
                )}
              </div>

              {activeCategory === 'domestic-violence' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-800">
                    <span className="font-bold">
                      {language === 'en' ? 'Browsing Safety: ' : 'Seguridad de Navegacion: '}
                    </span>
                    {language === 'en'
                      ? 'If you are concerned someone may be monitoring your device, consider using a private/incognito browser window and clearing your history after visiting this page. The "Quick Exit" button at the top right will immediately leave this site.'
                      : 'Si le preocupa que alguien pueda estar monitoreando su dispositivo, considere usar una ventana de navegacion privada/incognito y borrar su historial despues de visitar esta página. El boton "Salida Rapida" en la parte superior derecha saldra inmediatamente de este sitio.'}
                  </div>
                </div>
              )}

              {filteredResources.length === 0 ? (
                <div className="bg-navy-50 border border-navy-200 rounded-2xl p-8 text-center">
                  <p className="text-navy-600">
                    {language === 'en'
                      ? 'No state-specific resources available for this category. Showing national resources only.'
                      : 'No hay recursos especificos para este estado en esta categoria. Mostrando solo recursos nacionales.'}
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource, index) => (
                    <div
                      key={index}
                      className={`${activeResources.bgColor} border border-navy-200 rounded-2xl p-6 hover:shadow-lg transition-shadow relative`}
                    >
                      {resource.isNational && (
                        <span className="absolute top-3 right-3 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {language === 'en' ? 'National' : 'Nacional'}
                        </span>
                      )}
                      {resource.states && !resource.isNational && (
                        <span className="absolute top-3 right-3 bg-teal-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {resource.states.join(', ')}
                        </span>
                      )}
                      <h3 className="font-bold text-navy-900 text-lg mb-2 pr-16">
                        {language === 'es' && resource.nameEs ? resource.nameEs : resource.name}
                      </h3>
                      {resource.phone ? (
                        <a
                          href={resource.phone.startsWith('Text')
                            ? `sms:${resource.phone.replace(/[^0-9]/g, '')}${resource.phone.includes('HOME') ? '?body=HOME' : ''}`
                            : `tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                          className={`text-xl font-bold ${activeResources.color} hover:underline flex items-center gap-2 mb-3`}
                        >
                          {resource.phone.startsWith('Text') ? <Smartphone className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                          {resource.phone}
                        </a>
                      ) : (
                        <div className="mb-3" />
                      )}
                      <p className="text-navy-600 text-sm mb-3">
                        {language === 'es' && resource.descriptionEs ? resource.descriptionEs : resource.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-navy-500">
                          <Clock className="w-4 h-4" />
                          {resource.available}
                        </span>
                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${activeResources.color} hover:underline flex items-center gap-1`}
                          >
                            {language === 'en' ? 'Website' : 'Sitio Web'} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-orange-50 border-y border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-900 mb-4">
              {language === 'en' ? 'General Eviction Timeline' : 'Cronograma General de Desalojo'}
            </h2>
            <p className="text-navy-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Know your rights and deadlines. Acting quickly can help protect your housing. Timelines vary by state - use our AI assistant for state-specific guidance.'
                : 'Conozca sus derechos y plazos. Actuar rapidamente puede ayudar a proteger su vivienda. Los plazos varian segun el estado - use nuestro asistente de IA para orientación especifica.'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium border border-amber-200">
              <AlertTriangle className="w-4 h-4" />
              {language === 'en' ? 'Timelines shown are general guidelines - your state may differ' : 'Los plazos mostrados son pautas generales - su estado puede variar'}
            </div>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-orange-300 -translate-y-1/2" />
            <div className="grid md:grid-cols-5 gap-4">
              {evictionTimeline[language].map((step, index) => (
                <div key={index} className="relative bg-white rounded-xl p-5 border border-orange-200 shadow-sm">
                  <div className="hidden md:block absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-500 rounded-full border-4 border-white" />
                  <div className="text-orange-600 font-bold text-sm mb-1">{step.day}</div>
                  <h3 className="font-bold text-navy-900 mb-2">{step.title}</h3>
                  <p className="text-navy-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/pro-bono"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              <Scale className="w-5 h-5" />
              {language === 'en' ? 'Check If You Qualify for Free Legal Help' : 'Verifique Si Califica para Ayuda Legal Gratuita'}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/ask"
              className="bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-2xl p-8 text-center transition-colors group"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-bold text-navy-900 text-xl mb-2">
                {language === 'en' ? 'Ask My Question Free' : 'Hacer Mi Pregunta Gratis'}
              </h3>
              <p className="text-navy-600">
                {language === 'en' ? 'Get instant answers to your legal questions 24/7.' : 'Obtenga respuestas instantaneas a sus preguntas legales 24/7.'}
              </p>
            </Link>

            <Link
              to="/dashboard/documents"
              className="bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-2xl p-8 text-center transition-colors group"
            >
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="font-bold text-navy-900 text-xl mb-2">
                {language === 'en' ? 'Legal Documents' : 'Documentos Legales'}
              </h3>
              <p className="text-navy-600">
                {language === 'en' ? 'Generate legal documents for free, instantly.' : 'Genere documentos legales gratis, al instante.'}
              </p>
            </Link>

            <Link
              to="/find-attorney"
              className="bg-navy-50 hover:bg-navy-100 border border-navy-200 rounded-2xl p-8 text-center transition-colors group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-navy-900 text-xl mb-2">
                {language === 'en' ? 'Find an Attorney' : 'Encontrar un Abogado'}
              </h3>
              <p className="text-navy-600">
                {language === 'en' ? 'Connect with vetted attorneys in your area.' : 'Conecte con abogados verificados en su area.'}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <RelatedLinks />
      <Footer />
    </div>
  );
}
