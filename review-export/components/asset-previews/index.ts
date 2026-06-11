import { OnePagerPreview, BrandGuidelinesPreview, SpanishFlyerPreview, LogoPackPreview } from './MarketingPreviews';
import { TechGuidePreview, WidgetGuidePreview, SecurityWhitepaperPreview, LandingTemplatePreview } from './TechnicalPreviews';
import { PitchDeckPreview, ImpactReportPreview } from './PresentationPreviews';
import {
  TenantRightsEN, TenantRightsES,
  FamilyLawEN, FamilyLawES,
  ImmigrationEN, ImmigrationES,
  ConsumerRightsEN, ConsumerRightsES,
  EmploymentEN, EmploymentES,
} from './CommunityFlyerPreviews';

const previewMap: Record<string, () => JSX.Element> = {
  'one-pager': OnePagerPreview,
  'tech-guide': TechGuidePreview,
  'brand-guidelines': BrandGuidelinesPreview,
  'landing-template': LandingTemplatePreview,
  'widget-guide': WidgetGuidePreview,
  'impact-template': ImpactReportPreview,
  'pitch-deck': PitchDeckPreview,
  'spanish-flyer': SpanishFlyerPreview,
  'security-whitepaper': SecurityWhitepaperPreview,
  'logo-pack': LogoPackPreview,
  'tenant-rights-en': TenantRightsEN,
  'tenant-rights-es': TenantRightsES,
  'family-law-en': FamilyLawEN,
  'family-law-es': FamilyLawES,
  'immigration-en': ImmigrationEN,
  'immigration-es': ImmigrationES,
  'consumer-rights-en': ConsumerRightsEN,
  'consumer-rights-es': ConsumerRightsES,
  'employment-en': EmploymentEN,
  'employment-es': EmploymentES,
};

export function getAssetPreview(assetId: string): (() => JSX.Element) | null {
  return previewMap[assetId] || null;
}
