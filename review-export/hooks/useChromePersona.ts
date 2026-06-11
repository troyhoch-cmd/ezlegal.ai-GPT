import { useAuth } from '../contexts/AuthContext';

export type ChromePersona = 'consumer' | 'business' | 'organization' | 'admin';

export interface ChromeFlags {
  persona: ChromePersona;
  showSidebar: boolean;
  showAdminLinks: boolean;
  showGovernanceLinks: boolean;
  showProBonoLinks: boolean;
  showBusinessLinks: boolean;
  showTrustStrips: boolean;
}

export function useChromePersona(): ChromeFlags {
  const { profile } = useAuth();

  if (profile?.is_admin) {
    return {
      persona: 'admin',
      showSidebar: true,
      showAdminLinks: true,
      showGovernanceLinks: true,
      showProBonoLinks: true,
      showBusinessLinks: true,
      showTrustStrips: true,
    };
  }

  const userType = profile?.user_type ?? 'individual';
  if (userType === 'organization') {
    return {
      persona: 'organization',
      showSidebar: true,
      showAdminLinks: false,
      showGovernanceLinks: true,
      showProBonoLinks: true,
      showBusinessLinks: false,
      showTrustStrips: true,
    };
  }
  if (userType === 'business') {
    return {
      persona: 'business',
      showSidebar: true,
      showAdminLinks: false,
      showGovernanceLinks: false,
      showProBonoLinks: false,
      showBusinessLinks: true,
      showTrustStrips: true,
    };
  }
  return {
    persona: 'consumer',
    showSidebar: false,
    showAdminLinks: false,
    showGovernanceLinks: false,
    showProBonoLinks: false,
    showBusinessLinks: false,
    showTrustStrips: false,
  };
}
