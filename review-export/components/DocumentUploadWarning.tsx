import { useState } from 'react';
import { Shield, AlertTriangle, Eye, Clock, X, CheckCircle, FileWarning } from 'lucide-react';

interface DocumentUploadWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: () => void;
  fileName?: string;
}

const SENSITIVE_DATA_EXAMPLES = [
  { icon: Shield, label: 'Social Security Numbers', description: 'Full or partial SSN' },
  { icon: Eye, label: 'Bank Account Numbers', description: 'Account and routing numbers' },
  { icon: AlertTriangle, label: 'Medical Records', description: 'Health information protected by HIPAA' },
  { icon: FileWarning, label: 'Privileged Communications', description: 'Attorney-client privileged documents' },
];

const REDACTION_TIPS = [
  'Replace SSN with XXX-XX-XXXX',
  'Remove bank account details or use XXX format',
  'Redact names of minors with initials',
  'Remove credit card numbers entirely',
  'Black out signatures if not needed for review',
];

export default function DocumentUploadWarning({ isOpen, onClose, onConsent }: DocumentUploadWarningProps) {
  const [hasReadWarning, setHasReadWarning] = useState(false);
  const [understandsRetention, setUnderstandsRetention] = useState(false);

  const canProceed = hasReadWarning && understandsRetention;

  const handleConsent = () => {
    if (canProceed) {
      onConsent();
      setHasReadWarning(false);
      setUnderstandsRetention(false);
    }
  };

  const handleClose = () => {
    setHasReadWarning(false);
    setUnderstandsRetention(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="upload-warning-title"
        aria-describedby="upload-warning-description"
      >
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 id="upload-warning-title" className="text-xl font-bold text-white">
                  Document Upload Safety
                </h2>
                <p className="text-amber-100 text-sm">Please review before uploading</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div id="upload-warning-description" className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Important: Protect Your Sensitive Information</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Before uploading documents, please review them for sensitive personal information.
                  Consider redacting data that is not necessary for your legal question.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileWarning className="w-5 h-5 text-red-500" />
              Do NOT Upload (Unless Necessary):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SENSITIVE_DATA_EXAMPLES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900 text-sm">{item.label}</p>
                      <p className="text-red-700 text-xs">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Redaction Tips:
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <ul className="space-y-2">
                {REDACTION_TIPS.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                    <span className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-green-700">
                      {index + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              How Your Document Is Handled
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-800 mb-1">Step 1: In-Session Processing</p>
                <p className="text-sm text-slate-600">Text is extracted from your document in your browser session to answer your question. The AI processes the extracted text but does not retain the original file in memory after extraction.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-800 mb-1">Step 2: Encrypted Storage</p>
                <p className="text-sm text-slate-600">Uploaded files are stored encrypted (AES-256) for up to 90 days so you can reference them later. After 90 days, files are automatically deleted.</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <p className="text-xs font-semibold text-slate-800 mb-1">Your Controls</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Delete your documents and conversation history at any time from your profile
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    We never share your documents with third parties
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <button
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                onClick={() => window.open('/privacy', '_blank')}
              >
                <Eye className="w-4 h-4" />
                View Full Privacy Policy
              </button>
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasReadWarning}
                onChange={(e) => setHasReadWarning(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                I have reviewed my document for sensitive information and removed or redacted any data that is not necessary for my legal question.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={understandsRetention}
                onChange={(e) => setUnderstandsRetention(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                I understand how my document will be stored and processed, and I consent to uploading this document.
              </span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConsent}
              disabled={!canProceed}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                canProceed
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Proceed with Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
