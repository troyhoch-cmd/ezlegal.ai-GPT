import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { tenantManager, TenantConfig, TenantBranding, TenantFeatures } from '../lib/tenant-config';

interface TenantContextType {
  config: TenantConfig;
  branding: TenantBranding;
  features: TenantFeatures;
  tenantId: string;
  isFeatureEnabled: (feature: keyof TenantFeatures) => boolean;
  maxFreeQuestions: number;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    tenantManager.applyBrandingToDocument();
    setIsReady(true);
  }, []);

  const value: TenantContextType = {
    config: tenantManager.getConfig(),
    branding: tenantManager.getBranding(),
    features: tenantManager.getFeatures(),
    tenantId: tenantManager.getTenantId(),
    isFeatureEnabled: (feature) => tenantManager.isFeatureEnabled(feature),
    maxFreeQuestions: tenantManager.getMaxFreeQuestions(),
  };

  if (!isReady) {
    return null;
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
