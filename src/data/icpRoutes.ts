export interface ICPRoute {
  id: 'personal' | 'business' | 'partner';
  heading: { en: string; es: string };
  description: { en: string; es: string };
  cta: { en: string; es: string };
  href: string;
  iconName: string;
  accentColor: string;
}

export const icpRoutes: ICPRoute[] = [
  {
    id: 'personal',
    heading: { en: 'I need legal help for myself', es: 'Necesito ayuda legal para mí' },
    description: { en: 'Eviction, debt, court papers, family, immigration, benefits, or other personal legal issues.', es: 'Desalojo, deudas, papeles de corte, familia, inmigración, beneficios u otros problemas legales personales.' },
    cta: { en: 'Start personal intake', es: 'Iniciar intake personal' },
    href: '/start',
    iconName: 'Heart',
    accentColor: 'teal',
  },
  {
    id: 'business',
    heading: { en: 'I need legal help for my business', es: 'Necesito ayuda legal para mi negocio' },
    description: { en: 'Contracts, leases, employees, customers, compliance, collections, or business disputes.', es: 'Contratos, arrendamientos, empleados, clientes, cumplimiento, cobros o disputas de negocio.' },
    cta: { en: 'Start business intake', es: 'Iniciar intake de negocio' },
    href: '/for-business',
    iconName: 'Building2',
    accentColor: 'sky',
  },
  {
    id: 'partner',
    heading: { en: 'I work with a legal aid or pro bono organization', es: 'Trabajo con una organización de ayuda legal o pro bono' },
    description: { en: 'Bilingual AI intake, triage, referral routing, and document preparation for legal service teams.', es: 'Intake bilingüe con IA, triaje, enrutamiento de referencias y preparación de documentos para equipos legales.' },
    cta: { en: 'Explore partner workflow', es: 'Explorar flujo de socios' },
    href: '/for-organizations',
    iconName: 'Users',
    accentColor: 'emerald',
  },
];
