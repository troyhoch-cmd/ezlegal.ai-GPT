import { useEffect, useMemo, useState } from 'react';
import { X, Calendar, AlertCircle, CheckCircle, Loader2, Clock, Plus, Phone, Video, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { LawyerProfile } from '../data/arizonaLawyers';

interface AppointmentRequestFormProps {
  lawyer: LawyerProfile;
  onClose: () => void;
}

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

const CONSULTATION_TYPES = [
  { value: 'phone', label: 'Phone', description: '15-30 min call', icon: Phone },
  { value: 'video', label: 'Video', description: 'Zoom or Teams', icon: Video },
  { value: 'in_person', label: 'In-Person', description: 'Office visit', icon: MapPin },
] as const;

type FieldErrors = Partial<Record<'requesterName' | 'requesterEmail' | 'requesterPhone' | 'preferredDate' | 'preferredTime' | 'consent', string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s().+-]{7,}$/;

function getMinDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function getNextBusinessDay(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function AppointmentRequestForm({ lawyer, onClose }: AppointmentRequestFormProps) {
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [showAlternate, setShowAlternate] = useState(false);
  const [conflictCheckConsent, setConflictCheckConsent] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    preferredDate: getNextBusinessDay(),
    preferredTime: '10:00 AM',
    alternateDate: '',
    alternateTime: '',
    consultationType: 'phone',
    briefDescription: '',
  });

  useEffect(() => {
    if (!profile && !user?.email) return;
    setFormData(prev => ({
      ...prev,
      requesterName: prev.requesterName || profile?.full_name || '',
      requesterEmail: prev.requesterEmail || profile?.email || user?.email || '',
    }));
  }, [profile, user?.email]);

  const errors = useMemo<FieldErrors>(() => {
    const e: FieldErrors = {};
    if (!formData.requesterName.trim()) e.requesterName = 'Name is required';
    if (!formData.requesterEmail.trim()) e.requesterEmail = 'Email is required';
    else if (!EMAIL_RE.test(formData.requesterEmail)) e.requesterEmail = 'Enter a valid email';
    if (formData.consultationType === 'phone' && !formData.requesterPhone.trim()) {
      e.requesterPhone = 'Phone number is required for a phone call';
    } else if (formData.requesterPhone.trim() && !PHONE_RE.test(formData.requesterPhone)) {
      e.requesterPhone = 'Enter a valid phone number';
    }
    if (!formData.preferredDate) e.preferredDate = 'Pick a date';
    if (!formData.preferredTime) e.preferredTime = 'Pick a time';
    if (!conflictCheckConsent) e.consent = 'Please acknowledge the screening disclosure';
    return e;
  }, [formData, conflictCheckConsent]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitError(null);
  };

  const markTouched = (name: string) => setTouched(prev => ({ ...prev, [name]: true }));

  const showError = (name: keyof FieldErrors): string | undefined =>
    (touched[name] ? errors[name] : undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!isValid) {
      setTouched({
        requesterName: true,
        requesterEmail: true,
        requesterPhone: true,
        preferredDate: true,
        preferredTime: true,
        consent: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: submitErr } = await supabase
        .from('appointment_requests')
        .insert({
          user_id: user?.id || null,
          lawyer_id: lawyer.id,
          lawyer_name: lawyer.name,
          requester_name: formData.requesterName.trim(),
          requester_email: formData.requesterEmail.trim().toLowerCase(),
          requester_phone: formData.requesterPhone.trim() || null,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          alternate_date: formData.alternateDate || null,
          alternate_time: formData.alternateTime || null,
          consultation_type: formData.consultationType,
          brief_description: formData.briefDescription.trim() || null,
        });

      if (submitErr) throw submitErr;
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting appointment request:', err);
      setSubmitError('Failed to submit your request. Please try again.');
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
            Your appointment request has been sent to {lawyer.name}'s office.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-slate-900 mb-2">Requested Time:</p>
            <p className="text-sm text-slate-600">
              {new Date(formData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {formData.preferredTime}
            </p>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            You will receive a confirmation email once the appointment is scheduled.
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

  const inputClass = (name: keyof FieldErrors) =>
    `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors ${
      showError(name) ? 'border-red-400 bg-red-50' : 'border-slate-300'
    }`;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request an Appointment</h2>
            <p className="text-sm text-slate-500">With {lawyer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6">
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm">{submitError}</p>
            </div>
          )}

          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">How should the attorney reach you?</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {CONSULTATION_TYPES.map(type => {
                  const Icon = type.icon;
                  const selected = formData.consultationType === type.value;
                  return (
                    <label
                      key={type.value}
                      className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                        selected ? 'border-brand-500 bg-brand-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="consultationType"
                        value={type.value}
                        checked={selected}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <Icon className={`w-5 h-5 mb-1 ${selected ? 'text-brand-600' : 'text-slate-500'}`} />
                      <span className="font-medium text-slate-900 text-sm">{type.label}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{type.description}</span>
                    </label>
                  );
                })}
              </div>

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
                    onBlur={() => markTouched('requesterName')}
                    autoComplete="name"
                    className={inputClass('requesterName')}
                    placeholder="John Smith"
                  />
                  {showError('requesterName') && (
                    <p className="mt-1 text-xs text-red-600">{showError('requesterName')}</p>
                  )}
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
                    onBlur={() => markTouched('requesterEmail')}
                    autoComplete="email"
                    inputMode="email"
                    className={inputClass('requesterEmail')}
                    placeholder="john@example.com"
                  />
                  {showError('requesterEmail') && (
                    <p className="mt-1 text-xs text-red-600">{showError('requesterEmail')}</p>
                  )}
                </div>
              </div>

              {formData.consultationType === 'phone' && (
                <div className="mt-4">
                  <label htmlFor="requesterPhone" className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="requesterPhone"
                    name="requesterPhone"
                    value={formData.requesterPhone}
                    onChange={handleChange}
                    onBlur={() => markTouched('requesterPhone')}
                    autoComplete="tel"
                    inputMode="tel"
                    className={inputClass('requesterPhone')}
                    placeholder="(555) 123-4567"
                  />
                  {showError('requesterPhone') && (
                    <p className="mt-1 text-xs text-red-600">{showError('requesterPhone')}</p>
                  )}
                </div>
              )}
            </section>

            <section className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-900">When works for you? <span className="text-red-500">*</span></h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    onBlur={() => markTouched('preferredDate')}
                    min={getMinDate()}
                    className={inputClass('preferredDate')}
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm text-slate-600 mb-1">Time</label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    onBlur={() => markTouched('preferredTime')}
                    className={`${inputClass('preferredTime')} bg-white`}
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {!showAlternate ? (
                <button
                  type="button"
                  onClick={() => setShowAlternate(true)}
                  className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:text-brand-800 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add an alternate time
                </button>
              ) : (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h4 className="text-sm font-medium text-slate-700">Alternate time</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAlternate(false);
                        setFormData(prev => ({ ...prev, alternateDate: '', alternateTime: '' }));
                      }}
                      className="ml-auto text-xs text-slate-500 hover:text-slate-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="date"
                      name="alternateDate"
                      value={formData.alternateDate}
                      onChange={handleChange}
                      min={getMinDate()}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                    <select
                      name="alternateTime"
                      value={formData.alternateTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    >
                      <option value="">Select time...</option>
                      {TIME_SLOTS.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </section>

            <section>
              <label htmlFor="briefDescription" className="block text-sm font-medium text-slate-700 mb-1">
                Brief Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="briefDescription"
                name="briefDescription"
                value={formData.briefDescription}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                placeholder="What would you like to discuss?"
              />
              <p className="mt-1 text-xs text-slate-500 text-right">{formData.briefDescription.length}/500</p>
            </section>
          </div>

          <div className={`mt-5 rounded-lg p-4 border ${showError('consent') ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={conflictCheckConsent}
                onChange={(e) => { setConflictCheckConsent(e.target.checked); markTouched('consent'); setSubmitError(null); }}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 flex-shrink-0"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Conflict Screening Disclosure:</strong> I understand that my name, email, and a brief description of my legal matter may be shared with the selected attorney's office for conflict-of-interest screening purposes before the consultation is confirmed. No detailed case information will be shared until the attorney confirms there is no conflict. This request does not create an attorney-client relationship.
              </span>
            </label>
            {showError('consent') && (
              <p className="mt-2 text-xs text-red-600 pl-7">{showError('consent')}</p>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 px-4 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</> : <><Calendar className="w-5 h-5" />Request Appointment</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
