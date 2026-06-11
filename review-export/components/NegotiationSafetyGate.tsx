import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Scale } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDisclosure } from '../lib/legal-disclosures';
import { JurisdictionSelector, CrisisResourceCard, LegalDisclaimer } from './shared';

interface SafetyData {
  jurisdiction: string;
  safetyRisk: boolean | null;
  courtOrder: boolean | null;
  activeLawsuit: boolean | null;
}

interface NegotiationSafetyGateProps {
  safetyData: SafetyData;
  onChange: (data: SafetyData) => void;
}

const t = {
  en: {
    safetyTitle: 'Safety & Context Check',
    safetyDesc: 'These questions help us provide safer, more relevant guidance.',
    safetyQuestion: 'Is anyone\'s physical safety at risk in this dispute?',
    yes: 'Yes',
    no: 'No',
    notSure: 'Not sure',
    courtOrderQuestion: 'Is there an active court order or restraining order related to this matter?',
    lawsuitQuestion: 'Is there an active lawsuit or pending litigation about this issue?',
    consultAttorney: 'Consider Consulting an Attorney',
    bothFlags: 'With both an active court order and pending litigation, direct negotiation could affect your legal position. We strongly recommend consulting an attorney before sending any communications.',
    courtFlag: 'An active court order may restrict what you can communicate and to whom. Violating a court order can have serious legal consequences. Please consult an attorney before proceeding.',
    lawsuitFlag: 'With active litigation, anything you communicate may be used in court proceedings. We recommend consulting an attorney before sending negotiation communications.',
    findAttorney: 'Find an Attorney',
    proBonoCheck: 'Check Pro Bono Eligibility',
  },
  es: {
    safetyTitle: 'Verificacion de Seguridad y Contexto',
    safetyDesc: 'Estas preguntas nos ayudan a proporcionar orientación mas segura y relevante.',
    safetyQuestion: 'Esta en riesgo la seguridad fisica de alguien en esta disputa?',
    yes: 'Si',
    no: 'No',
    notSure: 'No estoy seguro/a',
    courtOrderQuestion: 'Existe una orden judicial activa o una orden de restricción relacionada con este asunto?',
    lawsuitQuestion: 'Existe una demanda activa o un litigio pendiente sobre este asunto?',
    consultAttorney: 'Considere Consultar a un Abogado',
    bothFlags: 'Con una orden judicial activa y un litigio pendiente, la negociacion directa podria afectar su posicion legal. Recomendamos encarecidamente consultar a un abogado antes de enviar cualquier comunicacion.',
    courtFlag: 'Una orden judicial activa puede restringir lo que puede comunicar y a quien. Violar una orden judicial puede tener consecuencias legales graves. Consulte a un abogado antes de continuar.',
    lawsuitFlag: 'Con un litigio activo, cualquier cosa que comunique puede usarse en procedimientos judiciales. Recomendamos consultar a un abogado antes de enviar comunicaciones de negociacion.',
    findAttorney: 'Buscar un Abogado',
    proBonoCheck: 'Verificar Elegibilidad Pro Bono',
  },
};

export default function NegotiationSafetyGate({ safetyData, onChange }: NegotiationSafetyGateProps) {
  const { language } = useLanguage();
  const s = t[language] || t.en;
  const [showCrisisResources, setShowCrisisResources] = useState(false);

  const hasSafetyFlags = safetyData.safetyRisk === true ||
    safetyData.courtOrder === true ||
    safetyData.activeLawsuit === true;

  return (
    <div className="space-y-6" aria-label={language === 'es' ? 'Verificacion de seguridad y jurisdicción' : 'Safety and jurisdiction check'}>
      <JurisdictionSelector
        value={safetyData.jurisdiction}
        onChange={(val) => onChange({ ...safetyData, jurisdiction: val })}
        variant="card"
      />

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900">{s.safetyTitle}</h3>
            <p className="text-xs text-stone-500">{s.safetyDesc}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-amber-100">
            <p className="text-sm font-medium text-stone-800 mb-3" id="safety-risk-label">
              {s.safetyQuestion}
            </p>
            <div className="flex gap-3" role="radiogroup" aria-labelledby="safety-risk-label">
              {[
                { value: true, label: s.yes },
                { value: false, label: s.no },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  role="radio"
                  aria-checked={safetyData.safetyRisk === opt.value}
                  onClick={() => {
                    onChange({ ...safetyData, safetyRisk: opt.value });
                    if (opt.value) setShowCrisisResources(true);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    safetyData.safetyRisk === opt.value
                      ? opt.value
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-stone-100 text-stone-600 border-2 border-transparent hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-amber-100">
            <p className="text-sm font-medium text-stone-800 mb-3" id="court-order-label">
              {s.courtOrderQuestion}
            </p>
            <div className="flex gap-3" role="radiogroup" aria-labelledby="court-order-label">
              {[
                { value: true, label: s.yes },
                { value: false, label: s.no },
                { value: null, label: s.notSure },
              ].map((opt, i) => (
                <button
                  key={i}
                  role="radio"
                  aria-checked={safetyData.courtOrder === opt.value && !(opt.value === null && safetyData.courtOrder !== null)}
                  onClick={() => onChange({ ...safetyData, courtOrder: opt.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    safetyData.courtOrder === opt.value && !(opt.value === null && safetyData.courtOrder !== null)
                      ? opt.value === true
                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                        : 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-stone-100 text-stone-600 border-2 border-transparent hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-amber-100">
            <p className="text-sm font-medium text-stone-800 mb-3" id="lawsuit-label">
              {s.lawsuitQuestion}
            </p>
            <div className="flex gap-3" role="radiogroup" aria-labelledby="lawsuit-label">
              {[
                { value: true, label: s.yes },
                { value: false, label: s.no },
                { value: null, label: s.notSure },
              ].map((opt, i) => (
                <button
                  key={i}
                  role="radio"
                  aria-checked={safetyData.activeLawsuit === opt.value && !(opt.value === null && safetyData.activeLawsuit !== null)}
                  onClick={() => onChange({ ...safetyData, activeLawsuit: opt.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    safetyData.activeLawsuit === opt.value && !(opt.value === null && safetyData.activeLawsuit !== null)
                      ? opt.value === true
                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-300'
                        : 'bg-green-100 text-green-800 border-2 border-green-300'
                      : 'bg-stone-100 text-stone-600 border-2 border-transparent hover:bg-stone-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {safetyData.safetyRisk === true && showCrisisResources && (
        <CrisisResourceCard variant="full" />
      )}

      {(safetyData.courtOrder === true || safetyData.activeLawsuit === true) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6" role="alert">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h3 className="font-bold text-amber-900">{s.consultAttorney}</h3>
              <p className="text-sm text-amber-800 mt-1">
                {safetyData.courtOrder === true && safetyData.activeLawsuit === true
                  ? s.bothFlags
                  : safetyData.courtOrder === true
                  ? s.courtFlag
                  : s.lawsuitFlag
                }
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  to="/find-attorney"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                >
                  <Scale className="w-4 h-4" />
                  {s.findAttorney}
                </Link>
                <Link
                  to="/pro-bono"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-amber-800 border border-amber-300 rounded-lg text-sm font-medium hover:bg-amber-50 transition-colors"
                >
                  {s.proBonoCheck}
                </Link>
              </div>
              <p className="text-xs text-amber-700 mt-3">{getDisclosure('educationalPurposes', language)}</p>
            </div>
          </div>
        </div>
      )}

      {hasSafetyFlags && !showCrisisResources && safetyData.safetyRisk !== true && (
        <LegalDisclaimer variant="inline" keys={['notAdvice', 'consultAttorney']} />
      )}
    </div>
  );
}

export type { SafetyData };
