import { useState, useRef } from 'react';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, Shield } from 'lucide-react';
import { ICP_CONTENT, type ICPKey, LEGAL_DISCLAIMER } from '../../lib/gtm-content';
import { submitLead, calculateLeadScore, type LeadData } from '../../lib/leads';
import { track } from '../../lib/gtm-analytics';
import CTAButton from './CTAButton';

type Step = 'icp' | 'need' | 'urgency' | 'context' | 'contact' | 'result';

const LEGAL_NEEDS = [
  { value: 'contract_review', label: 'Contract review or negotiation' },
  { value: 'legal_intake', label: 'Legal intake automation' },
  { value: 'business_formation', label: 'Business formation or governance' },
  { value: 'employment', label: 'Employment/HR issue' },
  { value: 'privacy_compliance', label: 'Privacy/compliance readiness' },
  { value: 'fundraising', label: 'Fundraising/diligence' },
  { value: 'other', label: 'Other' },
];

const URGENCY_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'exploring', label: 'Exploring' },
];

interface FormState {
  icp: ICPKey | '';
  legalNeed: string;
  urgency: string;
  organizationName: string;
  teamSize: string;
  description: string;
  documentCount: string;
  firstName: string;
  email: string;
  role: string;
  consent: boolean;
  honeypot: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function LegalReadinessWizard() {
  const [step, setStep] = useState<Step>(() => { track('wizard_started'); return 'icp'; });
  const [form, setForm] = useState<FormState>({
    icp: '', legalNeed: '', urgency: '', organizationName: '', teamSize: '',
    description: '', documentCount: '', firstName: '', email: '', role: '',
    consent: false, honeypot: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; recommendation: string; method: string } | null>(null);
  const announcerRef = useRef<HTMLDivElement>(null);

  const announce = (msg: string) => {
    if (announcerRef.current) announcerRef.current.textContent = msg;
  };

  const steps: Step[] = ['icp', 'need', 'urgency', 'context', 'contact', 'result'];
  const currentIndex = steps.indexOf(step);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (step === 'icp' && !form.icp) e.icp = 'Select your role';
    if (step === 'need' && !form.legalNeed) e.legalNeed = 'Select a legal need';
    if (step === 'urgency' && !form.urgency) e.urgency = 'Select urgency';
    if (step === 'context') {
      if (!form.organizationName.trim()) e.organizationName = 'Organization name is required';
      if (!form.description.trim()) e.description = 'Description is required';
    }
    if (step === 'contact') {
      if (!form.firstName.trim()) e.firstName = 'First name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
      if (!form.consent) e.consent = 'Consent is required';
    }
    setErrors(e);
    if (Object.keys(e).length) announce(Object.values(e)[0]);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    track('wizard_step_completed', { step, icp: form.icp });
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setStep(nextStep);
  };

  const prev = () => {
    const prevStep = steps[currentIndex - 1];
    if (prevStep) setStep(prevStep);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (form.honeypot) return; // spam bot

    setSubmitting(true);
    const score = calculateLeadScore({ urgency: form.urgency, legalNeed: form.legalNeed, teamSize: form.teamSize, email: form.email });
    const recommendation = score >= 50
      ? 'Based on your urgency and needs, we recommend a priority consultation.'
      : 'Download the legal readiness checklist to start organizing your legal work.';

    const leadData: LeadData = {
      icp: form.icp,
      legalNeed: form.legalNeed,
      urgency: form.urgency,
      organizationName: form.organizationName,
      teamSize: form.teamSize,
      description: form.description,
      documentCount: form.documentCount,
      firstName: form.firstName,
      email: form.email,
      role: form.role,
      leadScore: score,
      recommendation,
    };

    const res = await submitLead(leadData);
    setResult({ score, recommendation, method: res.method });
    setStep('result');
    setSubmitting(false);
    track('wizard_completed', { icp: form.icp, score });
    announce('Submission complete. See your results below.');
  };

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  const renderError = (field: string) => errors[field] ? (
    <p className="text-red-600 text-sm mt-1" role="alert">{errors[field]}</p>
  ) : null;

  const progressPct = Math.round((currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="max-w-2xl mx-auto">
      <div ref={announcerRef} aria-live="assertive" className="sr-only" />

      {step !== 'result' && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-navy-500 mb-1">
            <span>Step {currentIndex + 1} of {steps.length - 1}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-600 transition-all duration-300 rounded-full" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {step === 'icp' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">What best describes you?</h2>
          <p className="text-navy-600 mb-6 text-sm">Select your role so we can tailor the experience.</p>
          <div className="space-y-3">
            {(Object.keys(ICP_CONTENT) as ICPKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => update('icp', key)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  form.icp === key ? 'border-teal-600 bg-teal-50' : 'border-navy-200 hover:border-teal-400'
                }`}
              >
                <span className="font-semibold text-navy-900">{ICP_CONTENT[key].label}</span>
                <p className="text-sm text-navy-600 mt-1">{ICP_CONTENT[key].pain}</p>
              </button>
            ))}
          </div>
          {renderError('icp')}
        </div>
      )}

      {step === 'need' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Primary legal need</h2>
          <p className="text-navy-600 mb-6 text-sm">What is the most pressing legal workflow you need help with?</p>
          <div className="space-y-2">
            {LEGAL_NEEDS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('legalNeed', opt.value)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all text-sm ${
                  form.legalNeed === opt.value ? 'border-teal-600 bg-teal-50 font-medium' : 'border-navy-200 hover:border-teal-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {renderError('legalNeed')}
        </div>
      )}

      {step === 'urgency' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">How urgent is this?</h2>
          <p className="text-navy-600 mb-6 text-sm">This helps us prioritize your request.</p>
          <div className="grid grid-cols-2 gap-3">
            {URGENCY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('urgency', opt.value)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  form.urgency === opt.value ? 'border-teal-600 bg-teal-50 font-semibold' : 'border-navy-200 hover:border-teal-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {renderError('urgency')}
        </div>
      )}

      {step === 'context' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Tell us about your situation</h2>
          <p className="text-navy-600 mb-6 text-sm">This helps us tailor recommendations.</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="org" className="block text-sm font-medium text-navy-700 mb-1">Organization name *</label>
              <input id="org" type="text" value={form.organizationName} onChange={(e) => update('organizationName', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('organizationName')}
            </div>
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-navy-700 mb-1">Team/company size</label>
              <input id="size" type="text" placeholder="e.g. 5, 25, 100+" value={form.teamSize} onChange={(e) => update('teamSize', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-navy-700 mb-1">Short description of the legal issue *</label>
              <textarea id="desc" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('description')}
            </div>
            <div>
              <label htmlFor="docs" className="block text-sm font-medium text-navy-700 mb-1">Document count (optional)</label>
              <input id="docs" type="text" placeholder="e.g. 3 contracts, 10 documents" value={form.documentCount} onChange={(e) => update('documentCount', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
          </div>
        </div>
      )}

      {step === 'contact' && (
        <div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">How can we reach you?</h2>
          <p className="text-navy-600 mb-6 text-sm">We will send your results and recommendations.</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="fname" className="block text-sm font-medium text-navy-700 mb-1">First name *</label>
              <input id="fname" type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('firstName')}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy-700 mb-1">Work email *</label>
              <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
              {renderError('email')}
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-navy-700 mb-1">Role/title</label>
              <input id="role" type="text" value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
            </div>
            {/* Honeypot */}
            <input type="text" name="website" value={form.honeypot} onChange={(e) => update('honeypot', e.target.value)} className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="flex items-start gap-2">
              <input id="consent" type="checkbox" checked={form.consent} onChange={(e) => update('consent', e.target.checked)} className="mt-1 w-4 h-4 rounded border-navy-300 text-teal-600 focus:ring-teal-500" />
              <label htmlFor="consent" className="text-sm text-navy-600">
                I agree to receive communications about my legal readiness results. I understand this does not create an attorney-client relationship.
              </label>
            </div>
            {renderError('consent')}
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">Your Legal Readiness Summary</h2>
          <p className="text-navy-600 mb-6">{result.recommendation}</p>

          <div className="bg-navy-50 rounded-xl p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-navy-500">Role:</span> <span className="font-medium text-navy-800">{form.icp && ICP_CONTENT[form.icp as ICPKey]?.label}</span></div>
              <div><span className="text-navy-500">Need:</span> <span className="font-medium text-navy-800">{LEGAL_NEEDS.find(n => n.value === form.legalNeed)?.label}</span></div>
              <div><span className="text-navy-500">Urgency:</span> <span className="font-medium text-navy-800 capitalize">{form.urgency.replace('_', ' ')}</span></div>
              <div><span className="text-navy-500">Score:</span> <span className="font-medium text-navy-800">{result.score}/100</span></div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            {result.score >= 50 ? (
              <CTAButton text="Book a priority demo" to="/schedule-demo" variant="primary" size="lg" trackEvent="demo_click" />
            ) : (
              <CTAButton text="Download the legal readiness checklist" to="/resources/legal-readiness-checklist" variant="primary" size="lg" trackEvent="checklist_download" />
            )}
          </div>

          {result.method === 'localStorage' && (
            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 mb-4">
              Your request was saved locally for this prototype. Configure VITE_LEAD_ENDPOINT or Supabase to collect leads in production.
            </p>
          )}

          <div className="flex items-start gap-2 text-xs text-navy-500 bg-navy-50 rounded-lg p-3">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{LEGAL_DISCLAIMER}</p>
          </div>
        </div>
      )}

      {step !== 'result' && (
        <div className="flex justify-between mt-8">
          {currentIndex > 0 ? (
            <button type="button" onClick={prev} className="flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div />}
          {step === 'contact' ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Submit
            </button>
          ) : (
            <button type="button" onClick={next} className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
