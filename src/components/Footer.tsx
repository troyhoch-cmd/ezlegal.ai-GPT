import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, AlertCircle, Phone, Scale, Heart, Flag, Building2, Brain, ClipboardCheck, Handshake, Share2, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import NAPBlock from './NAPBlock';

export default function Footer() {
  const { t, language } = useLanguage();

  return (
    <footer
      role="contentinfo"
      aria-label={language === 'en' ? 'Site footer' : 'Pie de página'}
      className="bg-navy-900 text-white py-16 border-t border-navy-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-navy-800/50 border border-navy-700 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">{t('footer.legalNotice')}</h4>
              <p className="text-navy-100 text-sm leading-relaxed">
                <strong className="text-white">{t('footer.notLawFirm')}</strong> {t('footer.legalNoticeText')}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link to="/emergency-resources" className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors font-semibold">
              <Phone className="w-4 h-4" />
              {t('footer.crisisResources')}
            </Link>
            <Link to="/pro-bono" className="inline-flex items-center gap-1.5 text-success-400 hover:text-success-300 transition-colors font-semibold">
              <Heart className="w-4 h-4" />
              {t('footer.freeLegalAid')}
            </Link>
            <Link to="/find-attorney" className="inline-flex items-center gap-1.5 text-teal-400 hover:text-teal-300 transition-colors font-semibold">
              <Scale className="w-4 h-4" />
              {t('footer.findAttorney')}
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-8 mb-12">
          <div>
            <img
              src="/red-and-grey-minamali-business-card-2-1-2.svg"
              alt="ezLegal.ai"
              className="h-12 w-auto bg-white px-3 py-1 rounded mb-3"
            />
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] text-navy-300 font-medium uppercase tracking-wider">{t('footer.poweredBy')}</span>
              <span className="text-sm font-bold">
                <span className="text-navy-300">Legalbre</span><span className="text-teal-400">ez</span><span className="text-navy-300">e</span><sup className="text-[7px] text-navy-400">TM</sup>
              </span>
            </div>
            <NAPBlock variant="stacked" className="text-navy-200 [&_a]:text-navy-200 [&_a:hover]:text-gold-400 [&_svg]:text-teal-400" />
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.product')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/features" className="hover:text-gold-400 transition-colors">{t('nav.features')}</Link></li>
              <li><Link to="/pricing" className="hover:text-gold-400 transition-colors">{t('nav.pricing')}</Link></li>
              <li><Link to="/ezreads" className="hover:text-gold-400 transition-colors">{t('nav.legalGuides')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/about" className="hover:text-gold-400 transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-gold-400 transition-colors">{t('nav.contact')}</Link></li>
              <li><Link to="/for-organizations" className="hover:text-gold-400 transition-colors">{t('footer.forOrganizations')}</Link></li>
              <li><Link to="/partner-hub" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Handshake className="w-3 h-3" />{t('nav.partnerProgram')}</Link></li>
              <li><Link to="/media-kit" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Share2 className="w-3 h-3" />{language === 'es' ? 'Kit de Medios' : 'Media Kit'}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('nav.trustSafety')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/trust-center" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" />{t('footer.trustCenter')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Brain className="w-3 h-3" />{t('nav.howAiWorks')}</Link></li>
              <li><Link to="/privacy" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Lock className="w-3 h-3" />{t('footer.privacy')}</Link></li>
              <li><Link to="/terms" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><FileText className="w-3 h-3" />{t('footer.terms')}</Link></li>
              <li><Link to="/privacy#cookies" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><FileText className="w-3 h-3" />{language === 'es' ? 'Preferencias de Cookies' : 'Cookie Preferences'}</Link></li>
              <li><Link to="/ai-governance" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" />{t('nav.aiGovernance')}</Link></li>
              <li><Link to="/enterprise-security" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Building2 className="w-3 h-3" />{t('footer.enterpriseSecurity')}</Link></li>
              <li><Link to="/sla" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><Clock className="w-3 h-3" />SLA & Uptime</Link></li>
              <li><Link to="/trust-center#report" className="hover:text-red-400 transition-colors flex items-center gap-1.5 text-red-400"><Flag className="w-3 h-3" />{t('footer.reportConcern')}</Link></li>
              <li><Link to="/how-reports-are-reviewed" className="hover:text-gold-400 transition-colors flex items-center gap-1.5"><ClipboardCheck className="w-3 h-3" />{t('footer.howReportsReviewed')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">{t('nav.getHelp')}</h4>
            <ul className="space-y-2 text-navy-200">
              <li><Link to="/ask" className="hover:text-gold-400 transition-colors">{language === 'es' ? 'Hacer una Pregunta' : 'Ask a Question'}</Link></li>
              <li><Link to="/scope-disclaimers" className="hover:text-gold-400 transition-colors">{language === 'es' ? 'Alcance y Limitaciones' : 'What We Can Help With'}</Link></li>
              <li><Link to="/accessibility" className="hover:text-gold-400 transition-colors">{language === 'es' ? 'Accesibilidad' : 'Accessibility'}</Link></li>
            </ul>
          </div>
        </div>

        <div className="bg-navy-800/30 border border-navy-700 rounded-lg p-4 mb-8">
          <h5 className="font-semibold text-white mb-2 text-sm">{t('footer.aboutAiData')}</h5>
          <ul className="text-navy-200 text-xs space-y-1">
            <li>{t('footer.dataNotUsed')}</li>
            <li>{t('footer.encrypted')}</li>
            <li>{t('footer.deleteData')}</li>
            <li>{t('footer.ccpaCompliant')}</li>
            <li>{t('footer.aiCitations')}</li>
          </ul>
        </div>

        <div className="bg-navy-800/30 border border-navy-700 rounded-lg p-4 mb-8">
          <h5 className="font-semibold text-white mb-2 text-sm">{t('footer.legalFreshness')}</h5>
          <div className="text-navy-200 text-xs space-y-1.5">
            <p><strong className="text-white">{t('footer.citationDatabase')}:</strong> {t('footer.citationUpdated')}</p>
            <p><strong className="text-white">{t('footer.courtInfo')}:</strong> {t('footer.courtUpdated')}</p>
            <p><strong className="text-white">{t('footer.verificationCycle')}:</strong> {t('footer.verificationText')}</p>
            <p><strong className="text-white">{t('footer.lastUpdate')}:</strong> {t('footer.lastUpdateDate')}</p>
            <p className="text-navy-300 italic mt-2">{t('footer.lawsVary')}</p>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 text-center text-navy-300 text-sm space-y-3">
          <p>&copy; 2026 ezLegal.ai<sup className="text-[8px]">TM</sup>, a <span className="text-navy-200">Legalbre</span><span className="text-teal-400">ez</span><span className="text-navy-200">e</span><sup className="text-[8px]">TM</sup> company. {t('footer.copyright')}</p>
          <p className="text-xs max-w-3xl mx-auto text-navy-200" data-testid="legal-disclaimer">
            {t('footer.commitmentText')}
          </p>
          <div className="pt-3 border-t border-navy-800/50">
            <p className="text-[11px] text-navy-300 font-medium tracking-wide">
              {t('footer.patentPending')}
            </p>
            <p className="text-[10px] text-navy-300 mt-1 max-w-xl mx-auto">
              {t('footer.patentText')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
