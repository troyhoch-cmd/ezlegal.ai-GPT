import { useState } from 'react';
import { X, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LawyerProfile } from '../data/arizonaLawyers';

interface QuoteRequestFormProps {
  lawyer: LawyerProfile;
  onClose: () => void;
}

const LEGAL_MATTER_TYPES = [
  'Family Law (Divorce, Custody, Support)',
  'Immigration',
  'Criminal Defense',
  'Personal Injury',
  'Employment Law',
  'Bankruptcy / Debt',
  'Real Estate / Housing',
  'Business / Corporate',
  'Estate Planning / Probate',
  'Civil Litigation',
  'Insurance Dispute',
  'Other',
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Not urgent', description: 'Flexible timing' },
  { value: 'medium', label: 'Moderate', description: 'Within 2-4 weeks' },
  { value: 'high', label: 'Urgent', description: 'Within 1 week' },
  { value: 'urgent', label: 'Emergency', description: 'Immediate attention needed' },
];

const BUDGET_RANGES = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000 - $25,000',
  '$25,000+',
  'Contingency fee preferred',
  'Not sure / Need guidance',
];

export default function QuoteRequestForm({ lawyer, onClose }: QuoteRequestFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    legalMatterType: '',
    caseDescription: '',
    urgency: 'medium',
    budgetRange: '',
    preferredContactMethod: 'email',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.requesterName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!formData.requesterEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requesterEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.legalMatterType) {
      setError('Please select a legal matter type');
      return;
    }
    if (!formData.caseDescription.trim() || formData.caseDescription.length < 20) {
      setError('Please describe your situation (at least 20 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('quote_requests')
        .insert({
          user_id: user?.id || null,
          lawyer_id: lawyer.id,
          lawyer_name: lawyer.name,
          requester_name: formData.requesterName.trim(),
          requester_email: formData.requesterEmail.trim().toLowerCase(),
          requester_phone: formData.requesterPhone.trim() || null,
          legal_matter_type: formData.legalMatterType,
          case_description: formData.caseDescription.trim(),
          urgency: formData.urgency,
          budget_range: formData.budgetRange || null,
          preferred_contact_method: formData.preferredContactMethod,
        });

      if (submitError) throw submitError;
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting quote request:', err);
      setError('Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted</h2>
          <p className="text-slate-600 mb-6">
            Your quote request has been sent to {lawyer.name}. They will contact you within 1-2 business days.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request a Quote</h2>
            <p className="text-sm text-slate-500">From {lawyer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Your Contact Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="requesterName" className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="requesterName"
                    name="requesterName"
                    value={formData.requesterName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label htmlFor="requesterEmail" className="block text-sm font-medium text-slate-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="requesterEmail"
                    name="requesterEmail"
                    value={formData.requesterEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="requesterPhone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="requesterPhone"
                    name="requesterPhone"
                    value={formData.requesterPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-slate-700 mb-1">
                    Preferred Contact
                  </label>
                  <select
                    id="preferredContactMethod"
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="either">Either</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-4">About Your Legal Matter</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="legalMatterType" className="block text-sm font-medium text-slate-700 mb-1">
                    Type of Legal Matter <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="legalMatterType"
                    name="legalMatterType"
                    value={formData.legalMatterType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="">Select a matter type...</option>
                    {LEGAL_MATTER_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="caseDescription" className="block text-sm font-medium text-slate-700 mb-1">
                    Describe Your Situation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="caseDescription"
                    name="caseDescription"
                    value={formData.caseDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                    placeholder="Brief overview of your legal situation..."
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.caseDescription.length}/500 (min 20)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Urgency</label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {URGENCY_OPTIONS.map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.urgency === opt.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={opt.value}
                          checked={formData.urgency === opt.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div>
                          <span className="font-medium text-slate-900 text-sm">{opt.label}</span>
                          <p className="text-xs text-slate-500">{opt.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="budgetRange" className="block text-sm font-medium text-slate-700 mb-1">
                    Budget Range <span className="text-slate-400">(optional)</span>
                  </label>
                  <select
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="">Prefer not to say</option>
                    {BUDGET_RANGES.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-4">
              By submitting, your information will be shared with {lawyer.name}. This does not create an attorney-client relationship.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <><Send className="w-5 h-5" />Submit Request</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
