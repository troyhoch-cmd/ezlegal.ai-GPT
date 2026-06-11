import { Link } from 'react-router-dom';
import { FileText, Users, DollarSign, Scale, Building2, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface IssueCard {
  icon: typeof FileText;
  title: { en: string; es: string };
  description: { en: string; es: string };
  selfServe: { en: string; es: string };
  lawyerHelp: { en: string; es: string };
  costNote: { en: string; es: string };
  route: string;
}

const ISSUE_CARDS: IssueCard[] = [
  {
    icon: FileText,
    title: { en: 'Contracts', es: 'Contratos' },
    description: { en: 'Draft, review, or revise business contracts and agreements.', es: 'Redacta, revisa o modifica contratos y acuerdos comerciales.' },
    selfServe: { en: 'AI-assisted drafting and clause suggestions', es: 'Redacción asistida por IA y sugerencias de cláusulas' },
    lawyerHelp: { en: 'Optional paid lawyer review before signing', es: 'Revisión pagada opcional de abogado antes de firmar' },
    costNote: { en: 'Free draft | $49-149 lawyer review', es: 'Borrador gratis | $49-149 revisión de abogado' },
    route: '/start?path=smb&issue=contracts',
  },
  {
    icon: Users,
    title: { en: 'Employment', es: 'Empleo' },
    description: { en: 'Handle employee issues, policies, and compliance questions.', es: 'Maneja problemas de empleados, políticas y preguntas de cumplimiento.' },
    selfServe: { en: 'Policy templates and compliance checklists', es: 'Plantillas de políticas y listas de verificación de cumplimiento' },
    lawyerHelp: { en: 'Lawyer review for terminations or disputes', es: 'Revisión de abogado para despidos o disputas' },
    costNote: { en: 'Free templates | $79-199 lawyer review', es: 'Plantillas gratis | $79-199 revisión de abogado' },
    route: '/start?path=smb&issue=employment',
  },
  {
    icon: DollarSign,
    title: { en: 'Collections', es: 'Cobros' },
    description: { en: 'Send demand letters and manage outstanding receivables.', es: 'Envía cartas de demanda y gestiona cuentas por cobrar pendientes.' },
    selfServe: { en: 'AI-drafted demand letters and follow-up templates', es: 'Cartas de demanda redactadas por IA y plantillas de seguimiento' },
    lawyerHelp: { en: 'Escalation to litigation support', es: 'Escalamiento a soporte de litigación' },
    costNote: { en: 'Free draft | May need lawyer for court', es: 'Borrador gratis | Puede necesitar abogado para tribunal' },
    route: '/start?path=smb&issue=collections',
  },
  {
    icon: Building2,
    title: { en: 'Leases', es: 'Arrendamientos' },
    description: { en: 'Prepare or review commercial leases and vendor agreements.', es: 'Prepara o revisa arrendamientos comerciales y acuerdos con proveedores.' },
    selfServe: { en: 'Lease comparison and red-flag detection', es: 'Comparación de arrendamientos y detección de señales de alerta' },
    lawyerHelp: { en: 'Negotiation support and clause review', es: 'Soporte de negociación y revisión de cláusulas' },
    costNote: { en: 'Free analysis | $99-249 full review', es: 'Análisis gratis | $99-249 revisión completa' },
    route: '/start?path=smb&issue=leases',
  },
  {
    icon: Shield,
    title: { en: 'Compliance', es: 'Cumplimiento' },
    description: { en: 'Stay on top of regulatory deadlines and licensing requirements.', es: 'Mantente al día con plazos regulatorios y requisitos de licencias.' },
    selfServe: { en: 'Deadline tracking and compliance checklists', es: 'Seguimiento de plazos y listas de verificación de cumplimiento' },
    lawyerHelp: { en: 'Regulatory audit and filing support', es: 'Auditoría regulatoria y soporte de presentación' },
    costNote: { en: 'Free tracking | Varies by filing', es: 'Seguimiento gratis | Varía por presentación' },
    route: '/start?path=smb&issue=compliance',
  },
  {
    icon: Scale,
    title: { en: 'Entity & admin', es: 'Entidad y administración' },
    description: { en: 'Formation documents, operating agreements, and corporate governance.', es: 'Documentos de formación, acuerdos operativos y gobierno corporativo.' },
    selfServe: { en: 'Templates for formation and governance docs', es: 'Plantillas para documentos de formación y gobierno' },
    lawyerHelp: { en: 'Attorney review for complex structures', es: 'Revisión de abogado para estructuras complejas' },
    costNote: { en: 'Free templates | $149-399 for formation', es: 'Plantillas gratis | $149-399 para formación' },
    route: '/start?path=smb&issue=entity',
  },
];

export default function BusinessIssueCards() {
  const { language } = useLanguage();
  const en = language === 'en';

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ISSUE_CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.route} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-teal-200 hover:shadow-sm transition">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-teal-600" aria-hidden="true" />
              <h3 className="font-semibold text-slate-900 text-sm">
                {en ? card.title.en : card.title.es}
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              {en ? card.description.en : card.description.es}
            </p>

            <div className="space-y-1.5 mb-3">
              <div className="flex items-start gap-1.5">
                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-slate-700">{en ? card.selfServe.en : card.selfServe.es}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Users className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[11px] text-slate-500">{en ? card.lawyerHelp.en : card.lawyerHelp.es}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 font-medium">
                {en ? card.costNote.en : card.costNote.es}
              </span>
              <Link
                to={card.route}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 no-underline focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
              >
                {en ? 'Start' : 'Iniciar'}
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
