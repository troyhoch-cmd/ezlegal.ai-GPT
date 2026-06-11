import { useState } from 'react';
import { FileText, Search, FolderSync, Users, HelpCircle, ArrowRight, AlertTriangle, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { SMB_SEGMENTS } from '../../lib/intake/types';
import { shouldRecommendAttorneyReview } from '../../lib/intake/routes';
import { CHECKOUT_ACKNOWLEDGMENT } from '../../lib/intake/scopeBoundaries';
import { trackEvent } from '../../services/analytics-service';
import GuidedIntakeShell from './GuidedIntakeShell';
import PlainLanguageHelp from './PlainLanguageHelp';

const SEGMENT_ICONS: Record<string, typeof FileText> = {
  create_contract: FileText,
  review_document: Search,
  recurring_docs: FolderSync,
  attorney_review: Users,
  not_sure: HelpCircle,
};

const DETAIL_OPTIONS = [
  { id: 'employment_contract', labelEn: 'Employment contract', labelEs: 'Contrato laboral' },
  { id: 'vendor_agreement', labelEn: 'Vendor/service agreement', labelEs: 'Acuerdo con proveedor' },
  { id: 'nda', labelEn: 'Non-disclosure agreement (NDA)', labelEs: 'Acuerdo de confidencialidad (NDA)' },
  { id: 'investor_funding', labelEn: 'Investor/funding document', labelEs: 'Documento de inversión' },
  { id: 'privacy_policy', labelEn: 'Privacy policy or terms', labelEs: 'Política de privacidad o términos' },
  { id: 'litigation_dispute', labelEn: 'Dispute or demand letter', labelEs: 'Disputa o carta de demanda' },
  { id: 'government_regulatory', labelEn: 'Regulatory/compliance document', labelEs: 'Documento regulatorio' },
  { id: 'operating_agreement', labelEn: 'LLC/Corp operating agreement', labelEs: 'Acuerdo operativo LLC/Corp' },
  { id: 'other', labelEn: 'Something else', labelEs: 'Otra cosa' },
];

type Step = 'segment' | 'detail' | 'review_rec' | 'acknowledgment' | 'done';

export default function BusinessIntakeSegmentation() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [step, setStep] = useState<Step>('segment');
  const [segment, setSegment] = useState('');
  const [detail, setDetail] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [showAttorneyRec, setShowAttorneyRec] = useState(false);

  const stepIndex: Record<Step, number> = { segment: 1, detail: 2, review_rec: 3, acknowledgment: 4, done: 5 };

  const handleSegment = (id: string) => {
    setSegment(id);
    trackEvent('smb_segment_selected', { segment: id });
    if (id === 'attorney_review') {
      trackEvent('smb_attorney_review_selected', {});
      setStep('acknowledgment');
    } else if (id === 'not_sure') {
      setStep('detail');
    } else {
      setStep('detail');
    }
  };

  const handleDetail = (id: string) => {
    setDetail(id);
    const needsReview = shouldRecommendAttorneyReview(id);
    setShowAttorneyRec(needsReview);
    if (needsReview) {
      setStep('review_rec');
    } else {
      setStep('acknowledgment');
    }
  };

  const handleAcknowledge = () => {
    if (!acknowledged) return;
    trackEvent('smb_checkout_scope_acknowledged', { segment, detail });
    trackEvent('smb_intake_completed', { segment, detail, attorney_review: showAttorneyRec });
    setStep('done');
  };

  const handleBack = () => {
    const steps: Step[] = ['segment', 'detail', 'review_rec', 'acknowledgment', 'done'];
    const idx = steps.indexOf(step);
    if (idx > 0) {
      if (step === 'acknowledgment' && !showAttorneyRec) {
        setStep('detail');
      } else {
        setStep(steps[idx - 1]);
      }
    }
  };

  return (
    <GuidedIntakeShell
      icp="smb"
      currentStep={stepIndex[step]}
      totalSteps={5}
      showScopeBoundary={step === 'segment'}
      onBack={stepIndex[step] > 1 ? handleBack : undefined}
      titleEn={
        step === 'segment' ? 'What does your business need?' :
        step === 'detail' ? 'Tell us more' :
        step === 'review_rec' ? 'Attorney review recommended' :
        step === 'acknowledgment' ? 'Before you continue' :
        'You are all set'
      }
      titleEs={
        step === 'segment' ? '¿Qué necesita su negocio?' :
        step === 'detail' ? 'Cuéntenos más' :
        step === 'review_rec' ? 'Revisión de abogado recomendada' :
        step === 'acknowledgment' ? 'Antes de continuar' :
        'Todo listo'
      }
    >
      {step === 'segment' && (
        <div className="space-y-3">
          {SMB_SEGMENTS.map((seg) => {
            const Icon = SEGMENT_ICONS[seg.id] || FileText;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => handleSegment(seg.id)}
                className="w-full flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <Icon className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                <p className="font-semibold text-slate-900 text-sm">{en ? seg.labelEn : seg.labelEs}</p>
              </button>
            );
          })}
        </div>
      )}

      {step === 'detail' && (
        <div className="space-y-4">
          <PlainLanguageHelp
            questionEn="Why we ask this"
            questionEs="¿Por qué preguntamos esto?"
            answerEn="Some document types have higher risk and may benefit from professional attorney review."
            answerEs="Algunos tipos de documentos tienen mayor riesgo y pueden beneficiarse de revisión profesional de abogado."
          />
          <div className="grid gap-2">
            {DETAIL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleDetail(opt.id)}
                className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 text-sm font-medium text-slate-800 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {en ? opt.labelEn : opt.labelEs}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 'review_rec' && (
        <div className="space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-amber-900 mb-1">
                  {en ? 'Attorney review recommended' : 'Revisión de abogado recomendada'}
                </h3>
                <p className="text-sm text-amber-800">
                  {en
                    ? 'This type of document may have significant legal or financial implications. We recommend having an attorney review it before you sign or send.'
                    : 'Este tipo de documento puede tener implicaciones legales o financieras significativas. Recomendamos que un abogado lo revise antes de firmar o enviar.'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent('smb_attorney_review_selected', {});
                setStep('acknowledgment');
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-800 transition text-sm"
            >
              {en ? 'Add attorney review' : 'Agregar revisión de abogado'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setStep('acknowledgment')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-sm"
            >
              {en ? 'Continue without attorney review' : 'Continuar sin revisión de abogado'}
            </button>
          </div>
        </div>
      )}

      {step === 'acknowledgment' && (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-800 leading-relaxed">
              {en ? CHECKOUT_ACKNOWLEDGMENT.en : CHECKOUT_ACKNOWLEDGMENT.es}
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-slate-700">
              {en
                ? 'I understand that ezLegal provides legal information and tools, not legal advice.'
                : 'Entiendo que ezLegal proporciona información y herramientas legales, no asesoría legal.'}
            </span>
          </label>
          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={!acknowledged}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-800 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckSquare className="w-4 h-4" aria-hidden="true" />
            {en ? 'Continue' : 'Continuar'}
          </button>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <h3 className="font-bold text-green-900 mb-2">
              {en ? 'Your intake is complete' : 'Su admisión está completa'}
            </h3>
            <p className="text-sm text-green-800">
              {en
                ? 'We have the information we need to help you get started.'
                : 'Tenemos la información necesaria para ayudarle a comenzar.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-800 transition text-sm"
            >
              {en ? 'Start working on your document' : 'Empezar a trabajar en su documento'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/schedule-demo"
              onClick={() => trackEvent('smb_demo_clicked', {})}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition text-sm"
            >
              {en ? 'Schedule a demo instead' : 'Agendar una demostración'}
            </Link>
            <Link
              to="/pricing"
              onClick={() => trackEvent('smb_pricing_clicked', {})}
              className="text-sm text-sky-700 hover:text-sky-900 font-medium text-center"
            >
              {en ? 'View pricing' : 'Ver precios'} &rarr;
            </Link>
          </div>
        </div>
      )}
    </GuidedIntakeShell>
  );
}
