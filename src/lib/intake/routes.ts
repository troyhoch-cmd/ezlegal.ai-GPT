import type { ICP, IntakeStep, IntakeRouteDecision, AffordabilityStatus, TriageRiskLevel } from './types';

export const INTAKE_STEPS: Record<ICP, IntakeStep[]> = {
  individual_es: [
    { id: 'triage', titleEn: 'Triage', titleEs: 'Evaluación inicial', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'affordability', titleEn: 'Affordability', titleEs: 'Capacidad de pago', requiresScopeBoundary: false, allowsCheckout: false, escalationTriggers: ['emergency'] },
    { id: 'issue', titleEn: 'Issue type', titleEs: 'Tipo de problema', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'details', titleEn: 'Details', titleEs: 'Detalles', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'confirmation', titleEn: 'Next steps', titleEs: 'Próximos pasos', requiresScopeBoundary: true, allowsCheckout: true },
  ],
  smb: [
    { id: 'segment', titleEn: 'Business need', titleEs: 'Necesidad del negocio', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'details', titleEn: 'Details', titleEs: 'Detalles', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'review_option', titleEn: 'Review option', titleEs: 'Opción de revisión', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'acknowledgment', titleEn: 'Scope acknowledgment', titleEs: 'Reconocimiento de alcance', requiresScopeBoundary: true, allowsCheckout: true },
    { id: 'confirmation', titleEn: 'Confirmation', titleEs: 'Confirmación', requiresScopeBoundary: false, allowsCheckout: false },
  ],
  organization: [
    { id: 'org_type', titleEn: 'Organization type', titleEs: 'Tipo de organización', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'jurisdictions', titleEn: 'Jurisdictions', titleEs: 'Jurisdicciones', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'capacity', titleEn: 'Capacity', titleEs: 'Capacidad', requiresScopeBoundary: false, allowsCheckout: false },
    { id: 'data_consent', titleEn: 'Data consent', titleEs: 'Consentimiento de datos', requiresScopeBoundary: true, allowsCheckout: false },
    { id: 'confirmation', titleEn: 'Confirmation', titleEs: 'Confirmación', requiresScopeBoundary: false, allowsCheckout: false },
  ],
};

export function resolveIntakeRoute(
  icp: ICP,
  affordability: AffordabilityStatus,
  risk: TriageRiskLevel
): IntakeRouteDecision {
  if (risk === 'emergency') {
    return {
      icp,
      affordability,
      risk,
      destination: '/emergency-resources',
      escalation: 'emergency_resource',
      blockCheckout: true,
    };
  }

  if (icp === 'individual_es') {
    if (affordability === 'cannot_pay') {
      return {
        icp,
        affordability,
        risk,
        destination: '/pro-bono',
        escalation: 'legal_aid',
        blockCheckout: true,
      };
    }
    if (affordability === 'low_cost_needed') {
      return {
        icp,
        affordability,
        risk,
        destination: '/legal-safety-net',
        escalation: 'legal_aid',
        blockCheckout: false,
      };
    }
  }

  if (icp === 'smb') {
    return {
      icp,
      affordability,
      risk,
      destination: '/start?persona=business',
      escalation: risk === 'urgent' ? 'attorney_review' : undefined,
      blockCheckout: false,
    };
  }

  if (icp === 'organization') {
    return {
      icp,
      affordability,
      risk,
      destination: '/schedule-demo',
      escalation: 'partner_org',
      blockCheckout: true,
    };
  }

  return {
    icp,
    affordability,
    risk,
    destination: '/chat',
    blockCheckout: false,
  };
}

export function shouldRecommendAttorneyReview(segment: string): boolean {
  const triggers = ['employment_contract', 'investor_funding', 'litigation_dispute', 'government_regulatory', 'high_value_transaction'];
  return triggers.includes(segment);
}
