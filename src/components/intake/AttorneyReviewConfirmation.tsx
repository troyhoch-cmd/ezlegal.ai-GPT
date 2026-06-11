import { useState } from 'react';
import { CheckCircle, AlertTriangle, Clock, FileCheck, ArrowRight, Info } from 'lucide-react';
import type { ReviewAcknowledgment, ReviewUrgency } from '../../lib/attorneyReview/types';
import { REVIEW_ACKNOWLEDGMENT_TEXTS, ATTORNEY_REVIEW_DISCLOSURES } from '../../lib/attorneyReview/types';
import { REVIEW_PRICING_TIERS, calculateReviewPrice, formatPriceCents, getEstimatedTurnaround } from '../../lib/attorneyReview/pricing';

interface AttorneyReviewConfirmationProps {
  businessSegment: string;
  documentType: string | null;
  triggerReasons: string[];
  jurisdiction: string | null;
  language: 'en' | 'es';
  onConfirm: (tierId: string, urgency: ReviewUrgency, priceCents: number) => void;
  onDecline: () => void;
}

export function AttorneyReviewConfirmation({
  businessSegment,
  documentType,
  triggerReasons,
  jurisdiction,
  language,
  onConfirm,
  onDecline,
}: AttorneyReviewConfirmationProps) {
  const [selectedTier, setSelectedTier] = useState<string>('basic_review');
  const [urgency, setUrgency] = useState<ReviewUrgency>('standard');
  const [acknowledgments, setAcknowledgments] = useState<ReviewAcknowledgment>({
    notLegalAdviceUntilReviewed: false,
    attorneyMayDecline: false,
    separateEngagement: false,
    noGuaranteedOutcome: false,
    timelinesAreEstimates: false,
    jurisdictionMayAffect: false,
  });
  const [showDisclosures, setShowDisclosures] = useState(false);

  const allAcknowledged = Object.values(acknowledgments).every(Boolean);
  const price = calculateReviewPrice(selectedTier, urgency);
  const turnaround = getEstimatedTurnaround(selectedTier, urgency);
  const texts = REVIEW_ACKNOWLEDGMENT_TEXTS[language];
  const disclosures = ATTORNEY_REVIEW_DISCLOSURES[language];

  function toggleAcknowledgment(key: keyof ReviewAcknowledgment) {
    setAcknowledgments((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleConfirm() {
    if (!allAcknowledged || !price) return;
    onConfirm(selectedTier, urgency, price);
  }

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-900 text-sm">
              {language === 'es' ? 'Se Recomienda Revisión de Abogado' : 'Attorney Review Recommended'}
            </h3>
            <p className="text-amber-800 text-sm mt-1">
              {language === 'es'
                ? 'Basado en su tipo de documento y situación, se recomienda revisión profesional.'
                : 'Based on your document type and situation, professional review is recommended.'}
            </p>
            {triggerReasons.length > 0 && (
              <ul className="mt-2 space-y-1">
                {triggerReasons.map((reason) => (
                  <li key={reason} className="text-amber-700 text-xs flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-amber-500 rounded-full" />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Disclosures panel */}
      <div className="border border-slate-200 rounded-lg">
        <button
          type="button"
          onClick={() => setShowDisclosures(!showDisclosures)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Info className="w-4 h-4 text-slate-500" />
            {disclosures.headline}
          </span>
          <span className="text-slate-400 text-xs">{showDisclosures ? '−' : '+'}</span>
        </button>
        {showDisclosures && (
          <div className="px-4 pb-4 border-t border-slate-100 pt-3">
            <ul className="space-y-2 mb-4">
              {disclosures.points.map((point, i) => (
                <li key={i} className="text-slate-700 text-xs flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="bg-slate-50 rounded p-3">
              <p className="text-slate-500 text-xs font-medium mb-1.5">
                {language === 'es' ? 'No incluido:' : 'Not included:'}
              </p>
              <ul className="space-y-1">
                {disclosures.notIncluded.map((item, i) => (
                  <li key={i} className="text-slate-500 text-xs flex items-center gap-1.5">
                    <span className="text-red-400">×</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Context summary */}
      <div className="bg-slate-50 rounded-lg p-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          {documentType && (
            <div>
              <span className="text-slate-500">{language === 'es' ? 'Documento:' : 'Document:'}</span>
              <span className="ml-1 text-slate-800 font-medium">{documentType}</span>
            </div>
          )}
          {jurisdiction && (
            <div>
              <span className="text-slate-500">{language === 'es' ? 'Jurisdicción:' : 'Jurisdiction:'}</span>
              <span className="ml-1 text-slate-800 font-medium">{jurisdiction}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500">{language === 'es' ? 'Segmento:' : 'Segment:'}</span>
            <span className="ml-1 text-slate-800 font-medium">{businessSegment}</span>
          </div>
        </div>
      </div>

      {/* Tier selection */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3 text-sm">
          {language === 'es' ? 'Seleccione Nivel de Revisión' : 'Select Review Level'}
        </h4>
        <div className="space-y-3">
          {REVIEW_PRICING_TIERS.map((tier) => {
            const tierPrice = calculateReviewPrice(tier.id, urgency);
            const basePrice = tier.basePriceCents;
            const showMultiplier = urgency !== 'standard';
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedTier === tier.id
                    ? 'border-teal-600 bg-teal-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{tier.label}</p>
                    <p className="text-slate-600 text-xs mt-0.5">{tier.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-teal-700 font-semibold text-sm">
                      {tierPrice ? formatPriceCents(tierPrice) : '—'}
                    </span>
                    {showMultiplier && (
                      <p className="text-slate-400 text-xs line-through">{formatPriceCents(basePrice)}</p>
                    )}
                  </div>
                </div>
                <ul className="mt-2 space-y-0.5">
                  {tier.includes.map((item) => (
                    <li key={item} className="text-slate-500 text-xs flex items-center gap-1.5">
                      <FileCheck className="w-3 h-3 text-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {/* Urgency selection */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3 text-sm">
          {language === 'es' ? 'Urgencia' : 'Urgency'}
        </h4>
        <div className="flex gap-2">
          {(['standard', 'expedited', 'emergency'] as ReviewUrgency[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUrgency(u)}
              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                urgency === u
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {u === 'standard' && (language === 'es' ? 'Estándar' : 'Standard')}
              {u === 'expedited' && (language === 'es' ? 'Expedito' : 'Expedited')}
              {u === 'emergency' && (language === 'es' ? 'Emergencia' : 'Emergency')}
            </button>
          ))}
        </div>
        {turnaround && (
          <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {language === 'es' ? 'Tiempo estimado (no garantizado):' : 'Estimated turnaround (not guaranteed):'} {turnaround}
          </p>
        )}
      </div>

      {/* Acknowledgments */}
      <div>
        <h4 className="font-semibold text-slate-800 mb-3 text-sm">
          {language === 'es' ? 'Reconocimientos Requeridos' : 'Required Acknowledgments'}
        </h4>
        <div className="space-y-3">
          {(Object.keys(acknowledgments) as (keyof ReviewAcknowledgment)[]).map((key) => (
            <label
              key={key}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={acknowledgments[key]}
                onChange={() => toggleAcknowledgment(key)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 text-sm leading-snug group-hover:text-slate-900">
                {texts[key]}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!allAcknowledged}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          {language === 'es' ? 'Solicitar Revisión' : 'Request Review'}
          {price && <span className="ml-1">({formatPriceCents(price)})</span>}
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDecline}
          className="px-5 py-3 text-slate-600 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          {language === 'es' ? 'Continuar sin revisión' : 'Continue without review'}
        </button>
      </div>

      {/* Scope disclaimer */}
      <p className="text-slate-400 text-xs text-center">
        {language === 'es'
          ? 'ezLegal no es un bufete de abogados. La revisión de abogado es un servicio separado proporcionado por abogados licenciados independientes. Los precios mostrados son la tarifa base; los cargos finales pueden variar.'
          : 'ezLegal is not a law firm. Attorney review is a separate service provided by independent licensed attorneys. Prices shown are the base fee; final charges may vary.'}
      </p>
    </div>
  );
}
