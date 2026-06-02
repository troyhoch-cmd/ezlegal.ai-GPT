import { useState } from 'react';
import { Info, ChevronDown, ChevronUp, Scale, DollarSign, Handshake, Shield, ExternalLink, ListOrdered } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface AttorneyMatchingDisclosureProps {
  variant?: 'inline' | 'panel' | 'modal';
  className?: string;
}

export default function AttorneyMatchingDisclosure({
  variant = 'panel',
  className = '',
}: AttorneyMatchingDisclosureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-600 ${className}`}>
        <Info className="w-4 h-4 text-slate-400" />
        <span>
          {language === 'en' ? 'Attorney matching is informational only.' : 'El emparejamiento de abogados es solo informativo.'}{' '}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#0067FF] hover:underline"
          >
            {language === 'en' ? 'Learn more' : 'Mas información'}
          </button>
        </span>
        {isExpanded && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsExpanded(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <DisclosureContent language={language} />
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full mt-4 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                {language === 'en' ? 'Close' : 'Cerrar'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'panel') {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-xl overflow-hidden ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0067FF]" />
            <span className="text-sm font-medium text-slate-800">
              {language === 'en' ? 'About Attorney Matching' : 'Sobre el Emparejamiento de Abogados'}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-blue-200">
            <DisclosureContent language={language} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 ${className}`}>
      <DisclosureContent language={language} />
    </div>
  );
}

const disclosureText = {
  en: {
    matchingTitle: 'Matching Criteria',
    matchingDesc: 'Attorneys are matched based on practice area, location, availability, and client reviews. We verify bar membership and good standing.',
    feesTitle: 'Fees & Referrals',
    feesDesc: 'ezLegal.ai does not charge referral fees. Attorney consultation fees vary by provider. Some offer free initial consultations.',
    relationshipTitle: 'Attorney-Client Relationship',
    relationshipDesc: 'An attorney-client relationship begins only when you and the attorney both agree to representation, typically through a signed engagement letter or retainer agreement.',
    noAdviceTitle: 'No Legal Advice from ezLegal.ai',
    noAdviceDesc: 'ezLegal.ai is not a law firm and does not provide legal advice. We provide legal information and connect you with licensed attorneys.',
    rankingTitle: 'Ranking Neutrality',
    rankingDesc: 'Attorney results are ranked by relevance to your legal issue, location proximity, and verified client reviews. No attorney pays for placement, priority positioning, or preferential display. ezLegal.ai has no sponsorship, advertising, or commercial relationships that influence how attorneys appear in results.',
    terms: 'Terms of Service',
    governance: 'AI Governance',
  },
  es: {
    matchingTitle: 'Criterios de Emparejamiento',
    matchingDesc: 'Los abogados se emparejan segun el area de practica, ubicacion, disponibilidad y resenas de clientes. Verificamos la membresia del colegio de abogados y su buen estado.',
    feesTitle: 'Honorarios y Referencias',
    feesDesc: 'ezLegal.ai no cobra honorarios de referencia. Los honorarios de consulta de abogados varian segun el proveedor. Algunos ofrecen consultas iniciales gratuitas.',
    relationshipTitle: 'Relacion Abogado-Cliente',
    relationshipDesc: 'Una relacion abogado-cliente comienza solo cuando usted y el abogado acuerdan la representacion, generalmente a traves de una carta de compromiso firmada o un acuerdo de anticipo.',
    noAdviceTitle: 'Sin Asesoria Legal de ezLegal.ai',
    noAdviceDesc: 'ezLegal.ai no es un bufete de abogados y no proporciona asesoria legal. Proporcionamos información legal y lo conectamos con abogados licenciados.',
    rankingTitle: 'Neutralidad de Clasificacion',
    rankingDesc: 'Los resultados de abogados se clasifican por relevancia a su problema legal, proximidad de ubicacion y resenas verificadas de clientes. Ningun abogado paga por colocacion, posicionamiento prioritario o exhibicion preferencial. ezLegal.ai no tiene relaciones de patrocinio, publicidad o comerciales que influyan en como aparecen los abogados en los resultados.',
    terms: 'Terminos de Servicio',
    governance: 'Gobernanza de IA',
  },
};

function DisclosureContent({ language }: { language: string }) {
  const t = language === 'es' ? disclosureText.es : disclosureText.en;

  return (
    <div className="space-y-4">
      <div className="space-y-3 mt-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Scale className="w-4 h-4 text-[#0067FF]" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{t.matchingTitle}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.matchingDesc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{t.feesTitle}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.feesDesc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Handshake className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{t.relationshipTitle}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.relationshipDesc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{t.noAdviceTitle}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.noAdviceDesc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ListOrdered className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 text-sm">{t.rankingTitle}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t.rankingDesc}</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 flex items-center gap-4 text-xs">
        <Link
          to="/terms"
          className="text-[#0067FF] hover:underline inline-flex items-center gap-1"
        >
          {t.terms} <ExternalLink className="w-3 h-3" />
        </Link>
        <Link
          to="/ai-governance"
          className="text-[#0067FF] hover:underline inline-flex items-center gap-1"
        >
          {t.governance} <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
