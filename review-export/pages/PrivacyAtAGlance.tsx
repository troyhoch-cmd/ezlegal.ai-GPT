import { Link } from 'react-router-dom';
import { Shield, Lock, FileText, Trash2, Users, Globe, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface Row {
  icon: typeof Shield;
  question: { en: string; es: string };
  answer: { en: string; es: string };
}

const ROWS: Row[] = [
  {
    icon: Lock,
    question: { en: 'Is my data encrypted?', es: '¿Mis datos están cifrados?' },
    answer: {
      en: 'Yes. Traffic is encrypted in transit using TLS 1.2+ and data is encrypted at rest in Supabase Postgres. Files in storage use server-side encryption.',
      es: 'Sí. El tráfico se cifra en tránsito con TLS 1.2+ y los datos se cifran en reposo en Postgres de Supabase. Los archivos almacenados usan cifrado del lado del servidor.',
    },
  },
  {
    icon: Users,
    question: { en: 'Do my questions train public AI models?', es: '¿Mis preguntas entrenan modelos públicos de IA?' },
    answer: {
      en: 'No. We use OpenAI via API with zero-retention/data-processing controls where available. Your chats are not used to train public foundation models.',
      es: 'No. Usamos OpenAI por API con controles de retención cero / procesamiento de datos donde están disponibles. Tus chats no se usan para entrenar modelos públicos.',
    },
  },
  {
    icon: FileText,
    question: { en: 'What do you store?', es: '¿Qué almacenan?' },
    answer: {
      en: 'Account info (email, plan), your chat history, uploaded documents, and aggregate analytics. Crisis-gate sessions store category and quick-exit flags but not narrative details.',
      es: 'Información de cuenta (correo, plan), tu historial de chat, documentos subidos y analítica agregada. Las sesiones de la puerta de crisis almacenan categoría y uso de salida rápida, no detalles narrativos.',
    },
  },
  {
    icon: Trash2,
    question: { en: 'Can I delete my data?', es: '¿Puedo eliminar mis datos?' },
    answer: {
      en: 'Yes. Signed-in users can delete chats and request full account deletion from Profile → Data. We complete deletion within 30 days, subject to legal holds.',
      es: 'Sí. Los usuarios registrados pueden borrar chats y solicitar la eliminación total de la cuenta desde Perfil → Datos. Completamos la eliminación en 30 días, sujeto a retenciones legales.',
    },
  },
  {
    icon: Globe,
    question: { en: 'Where is my data processed?', es: '¿Dónde se procesan mis datos?' },
    answer: {
      en: 'Primary storage is US-based (Supabase). AI inference runs on OpenAI infrastructure. We do not sell personal data. For EU users we rely on SCCs for cross-border transfers.',
      es: 'El almacenamiento principal está en EE. UU. (Supabase). La inferencia de IA se ejecuta en la infraestructura de OpenAI. No vendemos datos personales. Para usuarios de la UE usamos SCC para transferencias internacionales.',
    },
  },
  {
    icon: Shield,
    question: { en: 'What about sensitive issues (DV, immigration, minors)?', es: '¿Y los temas sensibles (VD, inmigración, menores)?' },
    answer: {
      en: 'Crisis categories see a safety gate first, with quick-exit, hotline links, and no required sign-in. We minimize data collection for these paths.',
      es: 'Las categorías de crisis pasan primero por una puerta de seguridad, con salida rápida, enlaces a líneas de ayuda y sin requerir inicio de sesión. Minimizamos la recolección de datos.',
    },
  },
];

export default function PrivacyAtAGlance() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-sm font-semibold text-teal-700 mb-2">
              {en ? 'Privacy, in plain language' : 'Privacidad, en lenguaje simple'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
              {en ? 'Privacy at a glance' : 'Privacidad de un vistazo'}
            </h1>
            <p className="text-navy-600 leading-relaxed">
              {en
                ? 'A short, honest summary of what we do with your information. For the full legal terms, see our Privacy Policy.'
                : 'Un resumen breve y honesto de lo que hacemos con tu información. Para los términos legales completos, consulta nuestra Política de Privacidad.'}
            </p>
          </header>

          <div className="space-y-4">
            {ROWS.map((row) => {
              const Icon = row.icon;
              return (
                <section
                  key={row.question.en}
                  className="rounded-xl border border-navy-200 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-base sm:text-lg font-semibold text-navy-900 mb-1">
                        {en ? row.question.en : row.question.es}
                      </h2>
                      <p className="text-sm text-navy-700 leading-relaxed">
                        {en ? row.answer.en : row.answer.es}
                      </p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 text-white px-4 py-2 text-sm font-semibold hover:bg-navy-800"
            >
              {en ? 'Read the full Privacy Policy' : 'Leer la Política de Privacidad'}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/trust-center"
              className="inline-flex items-center gap-2 rounded-lg border border-navy-300 text-navy-800 hover:bg-navy-50 px-4 py-2 text-sm font-semibold"
            >
              {en ? 'Trust center' : 'Centro de confianza'}
            </Link>
          </div>

          <p className="mt-8 text-xs text-navy-500">
            {en
              ? 'ezLegal.ai provides legal information, not legal advice. Using this site does not create an attorney-client relationship.'
              : 'ezLegal.ai ofrece información legal, no asesoría legal. El uso de este sitio no crea una relación abogado-cliente.'}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
