import { useState } from 'react';
import { Download, CheckCircle, X } from 'lucide-react';
import { CHECKLIST_CONTENT } from '../../lib/gtm-content';
import { track, identifyLead } from '../../lib/gtm-analytics';

export default function ChecklistDownload() {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const performDownload = () => {
    const blob = new Blob([CHECKLIST_CONTENT], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal-readiness-checklist.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    track('checklist_download', { source: 'page' });
    track('summary_downloaded', { type: 'checklist' });
  };

  const handleDownloadClick = () => {
    const existingEmail = localStorage.getItem('ezlegal_user_email');
    if (existingEmail) {
      performDownload();
    } else {
      setShowModal(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    localStorage.setItem('ezlegal_user_email', email);
    identifyLead(email, { source: 'checklist_download' });
    setSubmitted(true);
    performDownload();
    setTimeout(() => setShowModal(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDownloadClick}
        className="inline-flex items-center gap-2 bg-white border-2 border-teal-600 text-teal-700 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-all"
      >
        <Download className="w-5 h-5" />
        Download Legal Readiness Checklist
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button type="button" onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-navy-400 hover:text-navy-600">
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                <p className="font-semibold text-navy-900">Downloading your checklist...</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-navy-900 mb-2">Get the Legal Readiness Checklist</h3>
                <p className="text-sm text-navy-600 mb-4">Enter your email to download the comprehensive checklist.</p>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="checklist-email" className="block text-sm font-medium text-navy-700 mb-1">Work email</label>
                  <input
                    id="checklist-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-2"
                  />
                  {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                  <button type="submit" className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-all mt-2">
                    Download Checklist
                  </button>
                  <p className="text-xs text-navy-500 mt-3">No attorney-client relationship is created. We will not spam you.</p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
