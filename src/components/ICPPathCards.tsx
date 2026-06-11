import { Link } from 'react-router-dom';
import { Users, Building2, Heart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const PATHS = [
  {
    id: 'individuals',
    icon: Users,
    enTitle: 'Individuals & Families',
    esTitle: 'Personas y Familias',
    enDesc: 'Understand your rights, prepare documents, and find help — in plain language.',
    esDesc: 'Entiende tus derechos, prepara documentos y encuentra ayuda — en lenguaje simple.',
    enGoals: [
      'Respond to an eviction, debt collector, or court notice',
      'Prepare for a custody hearing or divorce',
      'Understand immigration options and organize documents',
    ],
    esGoals: [
      'Responder a un desalojo, cobrador de deudas o aviso de corte',
      'Prepararse para una audiencia de custodia o divorcio',
      'Entender opciones de inmigración y organizar documentos',
    ],
    primaryHref: '/start',
    primaryEn: 'Start with 3 questions',
    primaryEs: 'Empieza con 3 preguntas',
    secondaryHref: '/espanol',
    secondaryEn: 'Ayuda en español',
    secondaryEs: 'Ayuda en español',
  },
  {
    id: 'business',
    icon: Building2,
    enTitle: 'Small & Medium Businesses',
    esTitle: 'Pequeños y Medianos Negocios',
    enDesc: 'Contracts, compliance, employee issues, and everyday legal questions — without hourly fees.',
    esDesc: 'Contratos, cumplimiento, empleados y preguntas legales cotidianas — sin tarifas por hora.',
    enGoals: [
      'Draft or review a contract, lease, or NDA',
      'Handle a customer dispute or unpaid invoice',
      'Stay compliant with employment and business regulations',
    ],
    esGoals: [
      'Redactar o revisar un contrato, arrendamiento o NDA',
      'Manejar una disputa con un cliente o factura impaga',
      'Cumplir con regulaciones de empleo y negocios',
    ],
    primaryHref: '/for-business',
    primaryEn: 'Protect my business',
    primaryEs: 'Proteger mi negocio',
    secondaryHref: '/pricing',
    secondaryEn: 'See plans',
    secondaryEs: 'Ver planes',
  },
  {
    id: 'organizations',
    icon: Heart,
    enTitle: 'Legal Aid & Community Partners',
    esTitle: 'Ayuda Legal y Socios Comunitarios',
    enDesc: 'Bilingual intake, triage, and referral workflows for your team and the people you serve.',
    esDesc: 'Intake bilingüe, triaje y flujos de referencia para tu equipo y las personas que atienden.',
    enGoals: [
      'Streamline client intake and triage in English and Spanish',
      'Generate grant reports and impact metrics',
      'Offer AI-assisted document preparation to clients',
    ],
    esGoals: [
      'Simplificar el intake y triaje de clientes en inglés y español',
      'Generar reportes de subvenciones y métricas de impacto',
      'Ofrecer preparación de documentos asistida por IA a clientes',
    ],
    primaryHref: '/for-organizations',
    primaryEn: 'Partner with ezLegal',
    primaryEs: 'Asociarse con ezLegal',
    secondaryHref: '/schedule-demo',
    secondaryEn: 'Schedule a demo',
    secondaryEs: 'Agendar demo',
  },
];

export default function ICPPathCards() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <section id="who-we-help" className="py-14 sm:py-16" aria-labelledby="icp-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="icp-heading"
          className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950 text-center mb-10"
        >
          {en ? 'Choose your path' : 'Elige tu camino'}
        </h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <article
                key={path.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 text-teal-700">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {en ? path.enTitle : path.esTitle}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {en ? path.enDesc : path.esDesc}
                </p>

                <ul className="space-y-2 mb-6 flex-1" aria-label={en ? 'Common goals' : 'Metas comunes'}>
                  {(en ? path.enGoals : path.esGoals).map((goal, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" aria-hidden="true" />
                      {goal}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-2 mt-auto">
                  <Link
                    to={path.primaryHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    {en ? path.primaryEn : path.primaryEs}
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    to={path.secondaryHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    {en ? path.secondaryEn : path.secondaryEs}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
