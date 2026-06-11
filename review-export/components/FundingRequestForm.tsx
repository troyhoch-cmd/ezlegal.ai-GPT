import { useState } from 'react';
import { X, DollarSign, AlertCircle, CheckCircle, Loader2, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LawyerProfile } from '../data/arizonaLawyers';

interface FundingRequestFormProps {
  lawyer: LawyerProfile;
  onClose: () => void;
}

const INCOME_RANGES = [
  'Under $25,000',
  '$25,000 - $40,000',
  '$40,000 - $60,000',
  '$60,000 - $80,000',
  '$80,000+',
  'Prefer not to say',
];

const HOUSEHOLD_SIZES = ['1', '2', '3', '4', '5', '6+'];

const FUNDING_TYPES = [
  { value: 'pro_bono', label: 'Pro Bono Services', description: 'Free legal representation' },
  { value: 'sliding_scale', label: 'Sliding Scale Fees', description: 'Reduced rates based on income' },
  { value: 'payment_plan', label: 'Payment Plan', description: 'Spread costs over time' },
  { value: 'legal_aid', label: 'Legal Aid Referral', description: 'Connection to free services' },
];

export default function FundingRequestForm({ lawyer, onClose }: FundingRequestFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    annualIncome: '',
    householdSize: '1',
    fundingType: 'sliding_scale',
    currentlyEmployed: 'yes',
    receivingBenefits: 'no',
    legalMatterDescription: '',
    financialHardshipDescription: '',
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
    if (!formData.annualIncome) {
      setError('Please select your annual income range');
      return;
    }
    if (!formData.legalMatterDescription.trim()) {
      setError('Please describe your legal matter');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('funding_requests')
        .insert({
          user_id: user?.id || null,
          lawyer_id: lawyer.id,
          lawyer_name: lawyer.name,
          requester_name: formData.requesterName.trim(),
          requester_email: formData.requesterEmail.trim().toLowerCase(),
          requester_phone: formData.requesterPhone.trim() || null,
          annual_income: formData.annualIncome,
          household_size: parseInt(formData.householdSize),
          funding_type: formData.fundingType,
          currently_employed: formData.currentlyEmployed === 'yes',
          receiving_benefits: formData.receivingBenefits === 'yes',
          legal_matter_description: formData.legalMatterDescription.trim(),
          financial_hardship_description: formData.financialHardshipDescription.trim() || null,
        });

      if (submitError) throw submitError;
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting funding request:', err);
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
          <p className="text-slate-600 mb-4">
            Your funding assistance request has been submitted.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-blue-800">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Your information will be reviewed for eligibility</li>
              <li>You may be contacted for additional documentation</li>
              <li>A decision will typically be made within 5-7 business days</li>
            </ul>
          </div>
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
            <h2 className="text-xl font-bold text-slate-900">Request Funding Assistance</h2>
            <p className="text-sm text-slate-500">Through {lawyer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">About Funding Assistance</p>
              <p className="mt-1">Many attorneys offer reduced-fee or free services for clients who qualify based on income. This form helps determine your eligibility.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
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
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="requesterPhone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="requesterPhone"
                    name="requesterPhone"
                    value={formData.requesterPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-4">Financial Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="annualIncome" className="block text-sm font-medium text-slate-700 mb-1">
                    Annual Household Income <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="annualIncome"
                    name="annualIncome"
                    value={formData.annualIncome}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    <option value="">Select income range...</option>
                    {INCOME_RANGES.map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="householdSize" className="block text-sm font-medium text-slate-700 mb-1">
                    Household Size
                  </label>
                  <select
                    id="householdSize"
                    name="householdSize"
                    value={formData.householdSize}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                  >
                    {HOUSEHOLD_SIZES.map(size => (
                      <option key={size} value={size}>{size} {size === '1' ? 'person' : 'people'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currently Employed?</label>
                  <div className="flex gap-4">
                    {['yes', 'no'].map(val => (
                      <label key={val} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="currentlyEmployed"
                          value={val}
                          checked={formData.currentlyEmployed === val}
                          onChange={handleChange}
                          className="w-4 h-4 text-brand-600"
                        />
                        <span className="text-slate-700 capitalize">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Receiving Government Benefits?</label>
                  <div className="flex gap-4">
                    {['yes', 'no'].map(val => (
                      <label key={val} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="receivingBenefits"
                          value={val}
                          checked={formData.receivingBenefits === val}
                          onChange={handleChange}
                          className="w-4 h-4 text-brand-600"
                        />
                        <span className="text-slate-700 capitalize">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type of Assistance Requested</label>
              <div className="grid sm:grid-cols-2 gap-2">
                {FUNDING_TYPES.map(type => (
                  <label
                    key={type.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.fundingType === type.value ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fundingType"
                      value={type.value}
                      checked={formData.fundingType === type.value}
                      onChange={handleChange}
                      className="mt-1"
                    />
                    <div>
                      <span className="font-medium text-slate-900 text-sm">{type.label}</span>
                      <p className="text-xs text-slate-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="legalMatterDescription" className="block text-sm font-medium text-slate-700 mb-1">
                Describe Your Legal Matter <span className="text-red-500">*</span>
              </label>
              <textarea
                id="legalMatterDescription"
                name="legalMatterDescription"
                value={formData.legalMatterDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                placeholder="Brief description of your legal issue..."
              />
            </div>

            <div>
              <label htmlFor="financialHardshipDescription" className="block text-sm font-medium text-slate-700 mb-1">
                Additional Financial Circumstances <span className="text-slate-400">(optional)</span>
              </label>
              <textarea
                id="financialHardshipDescription"
                name="financialHardshipDescription"
                value={formData.financialHardshipDescription}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                placeholder="Any additional circumstances affecting your ability to pay..."
              />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-4">
              This information is confidential and used solely to determine eligibility for reduced-fee services.
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
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <><DollarSign className="w-5 h-5" />Submit Request</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
