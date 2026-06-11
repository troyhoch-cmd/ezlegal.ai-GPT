import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { trackEvent } from '../services/analytics-service';
import { type AudiencePath } from '../data/audiencePaths';
import {
  HomeShell,
  UrgentStrip,
  HeroIntake,
  SituationExplorer,
  SMBConversionSection,
  LegalAidPartnerSection,
  BilingualParityNotice,
  SafetyNotice,
  FinalCTA,
} from '../components/home';

export default function Home() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentPath = (searchParams.get('path') || 'legal-aid') as AudiencePath;

  useEffect(() => {
    if (user) navigate('/chat', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    trackEvent('homepage_viewed', { language });
  }, []);

  return (
    <HomeShell>
      <UrgentStrip />
      <HeroIntake currentPath={currentPath} />
      <SituationExplorer />
      <SMBConversionSection />
      <LegalAidPartnerSection />
      <BilingualParityNotice />
      <SafetyNotice />
      <FinalCTA />
    </HomeShell>
  );
}
