import { Home, Users, Briefcase, FileWarning, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface IssueCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  prompt_seed: string;
  audience: string;
}
interface Props {
  audience?: 'all' | 'individual' | 'business' | 'legal_aid';
  onSelect: (card: IssueCard) => void;
}
const topics = [
  { slug: 'housing', Icon: Home, en: ['Housing and eviction', 'Understand notices and tenant questions.', 'What should I check first after receiving an eviction notice in Arizona?'], es: ['Vivienda y desalojo', 'Entiende avisos y preguntas de inquilinos.', '¿Qué debo revisar primero al recibir un aviso de desalojo en Arizona?'] },
  { slug: 'family', Icon: Users, en: ['Family matters', 'Prepare questions about custody or support.', 'What information should I prepare to discuss child custody with an Arizona lawyer?'], es: ['Asuntos familiares', 'Prepara preguntas de custodia o manutención.', '¿Qué información debo preparar para hablar de custodia con un abogado de Arizona?'] },
  { slug: 'employment', Icon: Briefcase, en: ['Work and wages', 'Explore unpaid wages and workplace rights.', 'What records should I keep about unpaid wages in Arizona?'], es: ['Trabajo y salarios', 'Explora salarios impagos y derechos laborales.', '¿Qué registros debo guardar sobre salarios impagos en Arizona?'] },
  { slug: 'debt', Icon: FileWarning, en: ['Debt and collections', 'Understand collection notices and next steps.', 'How can I check a debt collection notice in Arizona?'], es: ['Deudas y cobros', 'Entiende avisos de cobro y próximos pasos.', '¿Cómo puedo revisar un aviso de cobro de deudas en Arizona?'] },
  { slug: 'immigration', Icon: Globe, en: ['Immigration resources', 'Prepare for a conversation with qualified help.', 'How can I find qualified immigration legal help in Arizona?'], es: ['Recursos de inmigración', 'Prepárate para hablar con ayuda calificada.', '¿Cómo puedo encontrar ayuda legal de inmigración calificada en Arizona?'] },
] as const;

export default function GuidedIssueLauncher({ onSelect }: Props) {
  const { language } = useLanguage();
  const en = language === 'en';
  return <section className="space-y-4" aria-label={en ? 'Starting points' : 'Puntos de partida'}>
    <div className="text-center">
      <h2 className="text-xl font-semibold text-slate-900">{en ? 'What kind of legal issue are you facing?' : '¿Qué tipo de asunto legal tienes?'}</h2>
      <p className="mt-1 text-sm text-slate-600">{en ? 'Choose a starting question, edit it, then review the notice before sending.' : 'Elige una pregunta, edítala y revisa el aviso antes de enviarla.'}</p>
    </div>
    <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-3">
      {topics.map((topic, index) => {
        const [title, description, prompt] = en ? topic.en : topic.es;
        const Icon = topic.Icon;
        return <button key={topic.slug} type="button" onClick={() => onSelect({ id: topic.slug, slug: topic.slug, title, description, icon: topic.slug, sort_order: index, prompt_seed: prompt, audience: 'all' })}
          className="group flex flex-col items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">
          <Icon className="w-5 h-5 text-teal-700" aria-hidden="true" />
          <span className="font-semibold text-slate-900">{title}</span><span className="text-xs text-slate-600">{description}</span>
        </button>;
      })}
    </div>
  </section>;
}
