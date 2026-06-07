import { Shield, Lock, Eye, Server, Scale } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface TrustSafeguard {
  id: string;
  icon: LucideIcon;
  claim: { en: string; es: string };
  proofHref: string;
  proofStatus: 'verified' | 'policy' | 'roadmap';
  shortEvidence: { en: string; es: string };
}

export const trustSafeguards: TrustSafeguard[] = [
  {
    id: 'no-training',
    icon: Server,
    claim: {
      en: 'Your data never trains AI models',
      es: 'Tus datos nunca entrenan modelos de IA',
    },
    proofHref: '/privacy-policy#data-use',
    proofStatus: 'policy',
    shortEvidence: {
      en: 'See our Privacy Policy, Section: Data Use',
      es: 'Ver nuestra Política de Privacidad, Sección: Uso de datos',
    },
  },
  {
    id: 'encryption',
    icon: Lock,
    claim: {
      en: 'Encrypted in transit and at rest',
      es: 'Encriptado en tránsito y en reposo',
    },
    proofHref: '/trust-center#encryption',
    proofStatus: 'verified',
    shortEvidence: {
      en: 'TLS 1.3 in transit, AES-256 at rest via Supabase',
      es: 'TLS 1.3 en tránsito, AES-256 en reposo vía Supabase',
    },
  },
  {
    id: 'human-review',
    icon: Eye,
    claim: {
      en: 'Human review available on every plan',
      es: 'Revisión humana disponible en cada plan',
    },
    proofHref: '/how-reports-are-reviewed',
    proofStatus: 'verified',
    shortEvidence: {
      en: 'Staff-reviewed outputs for safety-critical matters',
      es: 'Resultados revisados por personal para asuntos críticos',
    },
  },
  {
    id: 'scope-boundary',
    icon: Scale,
    claim: {
      en: 'Not legal advice — clear boundaries always',
      es: 'No es asesoría legal — límites claros siempre',
    },
    proofHref: '/scope-disclaimers',
    proofStatus: 'verified',
    shortEvidence: {
      en: 'Scope disclosures on every interaction',
      es: 'Divulgaciones de alcance en cada interacción',
    },
  },
  {
    id: 'security-controls',
    icon: Shield,
    claim: {
      en: 'SOC 2-aligned controls & ABA AI ethics aligned',
      es: 'Controles alineados con SOC 2 y ética ABA AI',
    },
    proofHref: '/trust-center#security',
    proofStatus: 'policy',
    shortEvidence: {
      en: 'Controls implemented per SOC 2 framework; formal audit planned',
      es: 'Controles implementados según marco SOC 2; auditoría formal planeada',
    },
  },
];
