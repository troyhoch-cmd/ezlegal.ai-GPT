import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, ChevronLeft, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { JurisdictionSelector, AcknowledgmentChecklist } from './shared';
import type { DisclosureKey } from '../lib/legal-disclosures';

interface PredictionConsentGateProps {
  onConsent: (jurisdiction: string) => void;
  onDecline: () => void;
  initialJurisdiction?: string;
}

const ACKNOWLEDGMENT_KEYS: DisclosureKey[] = [
  'predictionNotGuarantee',
  'predictionHistorical',
  'predictionConsultAttorney',
  'noAttorneyClient',
];

export default function PredictionConsentGate({ onConsent, onDecline, initialJurisdiction }: PredictionConsentGateProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [jurisdiction, setJurisdiction] = useState(initialJurisdiction || '');
  const [checkedItems, setCheckedItems] = useState<boolean[]>(new Array(ACKNOWLEDGMENT_KEYS.length).fill(false));

  const allChecked = checkedItems.every(Boolean);
  const canProceed = jurisdiction && allChecked;

  const handleToggle = (index: number, checked: boolean) => {
    const updated = [...checkedItems];
    updated[index] = checked;
    setCheckedItems(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-navy-200 max-w-lg w-full mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-lg font-bold text-white">
              {en ? 'Before You Continue' : 'Antes de Continuar'}
            </h2>
            <p className="text-amber-100 text-sm">
              {en ? 'Important information about outcome estimates' : 'Información importante sobre estimaciones de resultados'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-teal-800 mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {en ? 'What This Tool Does' : 'Lo Que Hace Esta Herramienta'}
          </h3>
          <p className="text-sm text-teal-700">
            {en
              ? 'Analyzes historical case data to generate estimated outcome scenarios. Identifies patterns and factors that may influence results. Predictions are statistical estimates, not deterministic conclusions.'
              : 'Analiza datos historicos de casos para generar escenarios estimados. Identifica patrones y factores que pueden influir. Las predicciones son estimaciones estadisticas, no conclusiones deterministas.'}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {en ? 'What This Tool Does NOT Do' : 'Lo Que Esta Herramienta NO Hace'}
          </h3>
          <ul className="space-y-1.5 text-sm text-red-700">
            {[
              en ? 'Provide legal advice or representation' : 'Proporcionar asesoramiento o representacion legal',
              en ? 'Guarantee any particular outcome' : 'Garantizar ningun resultado particular',
              en ? 'Replace the judgment of a licensed attorney' : 'Reemplazar el juicio de un abogado licenciado',
              en ? 'Create an attorney-client relationship' : 'Crear una relacion abogado-cliente',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="prediction-jurisdiction" className="block text-sm font-bold text-navy-800 mb-1.5">
            {en ? 'Confirm Your Jurisdiction' : 'Confirma Tu Jurisdicción'}
          </label>
          <p className="text-xs text-navy-500 mb-2">
            {en
              ? 'Outcomes vary significantly by jurisdiction. Accurate state selection improves estimate quality.'
              : 'Los resultados varian significativamente por jurisdicción. La seleccion precisa del estado mejora la calidad.'}
          </p>
          <JurisdictionSelector
            value={jurisdiction}
            onChange={setJurisdiction}
            variant="compact"
            id="prediction-jurisdiction"
          />
        </div>

        <AcknowledgmentChecklist
          items={ACKNOWLEDGMENT_KEYS}
          checkedItems={checkedItems}
          onChange={handleToggle}
        />
      </div>

      <div className="px-6 pb-6 space-y-3">
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-navy-300 text-navy-700 rounded-lg hover:bg-navy-50 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            {en ? 'Go Back' : 'Volver'}
          </button>
          <button
            onClick={() => canProceed && onConsent(jurisdiction)}
            disabled={!canProceed}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {en ? 'I Understand, Continue' : 'Entiendo, Continuar'}
          </button>
        </div>
        <div className="flex items-center justify-between text-xs text-navy-500">
          <Link to="/find-attorney" className="flex items-center gap-1 hover:text-teal-600">
            <ExternalLink className="w-3 h-3" />
            {en ? 'Find an Attorney Instead' : 'Encontrar un Abogado'}
          </Link>
          <Link to="/scope-disclaimers" className="hover:text-teal-600">
            {en ? 'Full Disclaimers' : 'Descargos Completos'}
          </Link>
        </div>
      </div>
    </div>
  );
}
