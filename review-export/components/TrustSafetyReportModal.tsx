import { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, Loader2, Shield, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface TrustSafetyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
}

const REPORT_TYPES = [
  { value: 'ai_output', label: 'AI Response Accuracy Issue', description: 'Incorrect, misleading, or harmful AI-generated content' },
  { value: 'bias', label: 'Potential Bias or Discrimination', description: 'Content that unfairly favors or discriminates against groups' },
  { value: 'privacy', label: 'Privacy or Data Security Concern', description: 'Unauthorized data collection, exposure, or misuse' },
  { value: 'legal_advice', label: 'Unauthorized Legal Advice', description: 'AI providing specific legal advice instead of information' },
  { value: 'harassment', label: 'Harassment or Abuse', description: 'Threatening, abusive, or harassing content or behavior' },
  { value: 'security', label: 'Security Vulnerability', description: 'Technical security issues or vulnerabilities' },
  { value: 'other', label: 'Other Safety Concern', description: 'Any other trust or safety issue not listed above' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'Low', description: 'Minor issue or suggestion for improvement', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'medium', label: 'Medium', description: 'Notable concern that should be addressed', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'high', label: 'High', description: 'Serious issue requiring prompt attention', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'critical', label: 'Critical', description: 'Immediate safety risk or harm', color: 'bg-red-100 text-red-700 border-red-200' },
];

export default function TrustSafetyReportModal({ isOpen, onClose, conversationId }: TrustSafetyReportModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reportType: '',
    severity: 'medium',
    description: '',
    email: user?.email || '',
    name: '',
    evidenceUrls: '',
    anonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const evidenceArray = formData.evidenceUrls
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const { data, error: submitError } = await supabase
        .from('trust_safety_reports')
        .insert({
          report_type: formData.reportType,
          severity: formData.severity,
          description: formData.description,
          reporter_email: formData.anonymous ? 'anonymous@ezlegal.ai' : formData.email,
          reporter_name: formData.anonymous ? null : formData.name || null,
          user_id: user?.id || null,
          conversation_id: conversationId || null,
          evidence_urls: evidenceArray.length > 0 ? evidenceArray : null,
        })
        .select('id')
        .single();

      if (submitError) throw submitError;

      setReportId(data?.id || null);
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again or contact support directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setIsSubmitted(false);
      setError(null);
      setReportId(null);
      setFormData({
        reportType: '',
        severity: 'medium',
        description: '',
        email: user?.email || '',
        name: '',
        evidenceUrls: '',
        anonymous: false
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="report-modal-title">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-xl font-bold text-stone-900">Report Trust & Safety Concern</h2>
              <p className="text-sm text-stone-500">We take all reports seriously and will investigate promptly</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">Report Submitted</h3>
            <p className="text-stone-600 mb-4">
              Thank you for helping us maintain a safe and trustworthy platform.
            </p>
            {reportId && (
              <div className="bg-slate-50 rounded-lg p-4 max-w-sm mx-auto mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Reference Number</p>
                <p className="font-mono text-sm text-slate-900 select-all">{reportId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
              <Clock className="w-4 h-4" />
              <span>Our team typically reviews reports within 24-48 hours</span>
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-3">
                Type of Concern <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {REPORT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.reportType === type.value
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={type.value}
                      checked={formData.reportType === type.value}
                      onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                      className="mt-0.5 w-4 h-4 text-blue-600 border-stone-300 focus:ring-blue-500"
                      required
                    />
                    <div>
                      <span className="font-medium text-stone-900 text-sm">{type.label}</span>
                      <span className="block text-xs text-stone-500 mt-0.5">{type.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-900 mb-3">
                Severity Level <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.severity === level.value
                        ? `${level.color} ring-1`
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="severity"
                        value={level.value}
                        checked={formData.severity === level.value}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="w-4 h-4 text-blue-600 border-stone-300 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-sm">{level.label}</span>
                    </div>
                    <span className="text-xs mt-1 ml-6 opacity-75">{level.description}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-stone-900 mb-2">
                Detailed Description <span className="text-red-600">*</span>
              </label>
              <textarea
                id="description"
                required
                rows={5}
                minLength={20}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please describe the issue in detail. Include:
- What happened and when
- The context or conversation where this occurred
- Why you believe this is a concern
- Any impact or harm caused"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
              />
              <p className="mt-1.5 text-xs text-stone-500">
                Minimum 20 characters. The more detail you provide, the better we can investigate.
              </p>
            </div>

            <div>
              <label htmlFor="evidenceUrls" className="block text-sm font-semibold text-stone-900 mb-2">
                Evidence Links (optional)
              </label>
              <textarea
                id="evidenceUrls"
                rows={2}
                value={formData.evidenceUrls}
                onChange={(e) => setFormData({ ...formData, evidenceUrls: e.target.value })}
                placeholder="Paste screenshot URLs or relevant links, one per line"
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
              />
            </div>

            <div className="border-t border-stone-200 pt-6">
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.anonymous}
                  onChange={(e) => setFormData({
                    ...formData,
                    anonymous: e.target.checked,
                    email: e.target.checked ? '' : (user?.email || ''),
                    name: e.target.checked ? '' : formData.name
                  })}
                  className="mt-1 w-4 h-4 text-blue-600 border-stone-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-sm text-stone-700">
                  <span className="font-medium">Submit anonymously</span>
                  <span className="block text-stone-500 mt-0.5">
                    We will investigate your report but cannot follow up with you directly
                  </span>
                </label>
              </div>

              {!formData.anonymous && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                      Your Name (optional)
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                      Contact Email <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-600">
                <strong className="text-slate-900">Confidentiality:</strong> All reports are handled confidentially
                by our Trust & Safety team. We review each report thoroughly and take appropriate action to maintain
                platform integrity and user safety.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-stone-300 text-stone-700 font-semibold rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.reportType || !formData.description}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
