import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, FileText, AlertTriangle, Calendar,
  Scale, CheckCircle, Loader2, X, Globe, DollarSign, Users as UsersIcon,
  Brain, Sparkles, ChevronRight, ChevronLeft
} from 'lucide-react';
import {
  CaseMatchingInput,
  getCaseTypes,
  calculateComplexityScore,
  calculatePovertyPercentage,
  analyzeCase,
  submitCaseForMatching
} from '../services/case-matching-service';

interface CaseIntakeFormProps {
  organizationId: string;
  onSuccess?: (caseId: string) => void;
  onCancel?: () => void;
}

const COUNTIES = [
  'Apache', 'Cochise', 'Coconino', 'Gila', 'Graham', 'Greenlee',
  'La Paz', 'Maricopa', 'Mohave', 'Navajo', 'Pima', 'Pinal',
  'Santa Cruz', 'Yavapai', 'Yuma'
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'zh', label: 'Chinese (Mandarin)' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'ko', label: 'Korean' },
  { value: 'ar', label: 'Arabic' },
  { value: 'other', label: 'Other' },
];

export default function CaseIntakeForm({ organizationId, onSuccess, onCancel }: CaseIntakeFormProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [formData, setFormData] = useState<CaseMatchingInput>({
    organizationId,
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCounty: '',
    clientZipCode: '',
    preferredLanguage: 'en',
    caseType: '',
    caseSubcategory: '',
    caseDescription: '',
    urgencyLevel: 'normal',
    deadlineDate: '',
    courtDate: '',
    hasDocumentation: false,
    documentationQuality: 'none',
    hasOpposingCounsel: false,
    incomeAmount: undefined,
    householdSize: undefined,
  });

  const caseTypes = getCaseTypes();

  const updateField = <K extends keyof CaseMatchingInput>(
    field: K,
    value: CaseMatchingInput[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!formData.clientName && !!formData.clientCounty;
      case 2:
        return !!formData.caseType && !!formData.caseDescription;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
    } else {
      setError('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitCaseForMatching(formData);

      if (result.success && result.caseId) {
        onSuccess?.(result.caseId);
      } else {
        setError(result.error || 'Failed to submit case');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const complexityScore = calculateComplexityScore(formData);
  const analysis = analyzeCase(formData);
  const povertyPercentage = formData.incomeAmount && formData.householdSize
    ? calculatePovertyPercentage(formData.incomeAmount, formData.householdSize)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-stone-200 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-t-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Case Intake</h2>
              <p className="text-teal-100 text-sm">Smart case matching powered by AI</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? 'bg-white text-teal-600' :
                s === step ? 'bg-white/20 text-white ring-2 ring-white' :
                'bg-white/10 text-white/50'
              }`}>
                {s < step ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 mx-1 rounded ${
                  s < step ? 'bg-white' : 'bg-white/20'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex text-xs text-teal-100">
          <span className="w-8 text-center">Client</span>
          <span className="w-12" />
          <span className="w-8 text-center">Case</span>
          <span className="w-12" />
          <span className="w-8 text-center">Details</span>
          <span className="w-12" />
          <span className="w-8 text-center">Review</span>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg flex items-center gap-2 text-error-700 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900">Client Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Full Name <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => updateField('clientName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter client name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => updateField('clientEmail', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="client@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => updateField('clientPhone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  County <span className="text-error-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <select
                    value={formData.clientCounty}
                    onChange={(e) => updateField('clientCounty', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  >
                    <option value="">Select county</option>
                    {COUNTIES.map(county => (
                      <option key={county} value={county}>{county} County</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.clientZipCode}
                  onChange={(e) => updateField('clientZipCode', e.target.value)}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="85001"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Preferred Language
                </label>
                <div className="relative">
                  <Globe className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => updateField('preferredLanguage', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4">
              <h4 className="text-sm font-semibold text-stone-700 mb-3">Financial Information (Optional)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    Annual Household Income
                  </label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="number"
                      value={formData.incomeAmount || ''}
                      onChange={(e) => updateField('incomeAmount', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="30000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">
                    Household Size
                  </label>
                  <div className="relative">
                    <UsersIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="number"
                      value={formData.householdSize || ''}
                      onChange={(e) => updateField('householdSize', e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="4"
                      min={1}
                      max={20}
                    />
                  </div>
                </div>
              </div>

              {povertyPercentage !== null && (
                <div className={`mt-3 p-3 rounded-lg ${
                  povertyPercentage <= 125 ? 'bg-success-50 border border-success-200' :
                  povertyPercentage <= 200 ? 'bg-warning-50 border border-warning-200' :
                  'bg-stone-50 border border-stone-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {povertyPercentage <= 200 ? (
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-stone-500" />
                    )}
                    <span className="text-sm font-medium">
                      {povertyPercentage}% of Federal Poverty Level
                      {povertyPercentage <= 200 && ' - Likely eligible for pro bono services'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900">Case Information</h3>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Legal Issue Type <span className="text-error-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {caseTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('caseType', type.value)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      formData.caseType === type.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Case Description <span className="text-error-500">*</span>
              </label>
              <textarea
                value={formData.caseDescription}
                onChange={(e) => updateField('caseDescription', e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe the legal issue in detail. Include relevant facts, dates, and parties involved..."
              />
              <p className="mt-1 text-xs text-stone-500">
                {formData.caseDescription.length}/2000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">
                Urgency Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'critical', label: 'Critical', desc: 'Immediate action needed', color: 'error' },
                  { value: 'high', label: 'High', desc: 'Within days', color: 'warning' },
                  { value: 'normal', label: 'Normal', desc: 'Standard timeline', color: 'blue' },
                  { value: 'low', label: 'Low', desc: 'Flexible timeline', color: 'stone' },
                ].map(urgency => (
                  <button
                    key={urgency.value}
                    type="button"
                    onClick={() => updateField('urgencyLevel', urgency.value as 'critical' | 'high' | 'normal' | 'low')}
                    className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.urgencyLevel === urgency.value
                        ? `border-${urgency.color}-500 bg-${urgency.color}-50`
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-sm font-semibold block">{urgency.label}</span>
                    <span className="text-xs text-stone-500">{urgency.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-stone-900">Additional Details</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Important Deadline
                </label>
                <div className="relative">
                  <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="date"
                    value={formData.deadlineDate}
                    onChange={(e) => updateField('deadlineDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">
                  Court Date (if scheduled)
                </label>
                <div className="relative">
                  <Scale className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="date"
                    value={formData.courtDate}
                    onChange={(e) => updateField('courtDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-stone-500" />
                  <div>
                    <span className="text-sm font-medium text-stone-900">Has Supporting Documentation?</span>
                    <p className="text-xs text-stone-500">Contracts, letters, notices, etc.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDocumentation}
                    onChange={(e) => updateField('hasDocumentation', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {formData.hasDocumentation && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">
                    Documentation Quality
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'partial', label: 'Partial', desc: 'Some documents' },
                      { value: 'complete', label: 'Complete', desc: 'All key documents' },
                      { value: 'excellent', label: 'Excellent', desc: 'Comprehensive set' },
                    ].map(quality => (
                      <button
                        key={quality.value}
                        type="button"
                        onClick={() => updateField('documentationQuality', quality.value as 'partial' | 'complete' | 'excellent')}
                        className={`p-3 border-2 rounded-lg text-center transition-all ${
                          formData.documentationQuality === quality.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span className="text-sm font-medium block">{quality.label}</span>
                        <span className="text-xs text-stone-500">{quality.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <UsersIcon className="w-5 h-5 text-stone-500" />
                  <div>
                    <span className="text-sm font-medium text-stone-900">Opposing Party Has Attorney?</span>
                    <p className="text-xs text-stone-500">Is the other side represented by a lawyer?</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasOpposingCounsel}
                    onChange={(e) => updateField('hasOpposingCounsel', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">Review & Submit</h3>
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="flex items-center gap-2 text-teal-600 hover:text-teal-700 text-sm font-semibold"
              >
                <Brain className="w-4 h-4" />
                {showAnalysis ? 'Hide' : 'Show'} AI Analysis
              </button>
            </div>

            {showAnalysis && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-5 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-stone-900">AI Case Analysis</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-3xl font-bold text-teal-600">{complexityScore}</div>
                    <div className="text-sm text-stone-600">Complexity Score</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">{analysis.estimatedHours}h</div>
                    <div className="text-sm text-stone-600">Est. Hours</div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className={`text-xl font-bold ${
                      analysis.riskAssessment === 'high' ? 'text-error-600' :
                      analysis.riskAssessment === 'moderate' ? 'text-warning-600' :
                      'text-success-600'
                    }`}>
                      {analysis.riskAssessment.charAt(0).toUpperCase() + analysis.riskAssessment.slice(1)}
                    </div>
                    <div className="text-sm text-stone-600">Risk Level</div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-stone-600">
                    <strong>Recommended Practice Areas:</strong>{' '}
                    {analysis.recommendedPracticeAreas.join(', ')}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4">Case Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Client:</span>
                  <span className="font-medium text-stone-900">{formData.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">County:</span>
                  <span className="font-medium text-stone-900">{formData.clientCounty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Case Type:</span>
                  <span className="font-medium text-stone-900">
                    {caseTypes.find(t => t.value === formData.caseType)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Urgency:</span>
                  <span className={`font-medium ${
                    formData.urgencyLevel === 'critical' ? 'text-error-600' :
                    formData.urgencyLevel === 'high' ? 'text-warning-600' :
                    'text-stone-900'
                  }`}>
                    {formData.urgencyLevel.charAt(0).toUpperCase() + formData.urgencyLevel.slice(1)}
                  </span>
                </div>
                {formData.courtDate && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Court Date:</span>
                    <span className="font-medium text-error-600">{formData.courtDate}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-stone-200">
                  <p className="text-stone-600">{formData.caseDescription}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>What happens next:</strong> After submission, our AI will analyze the case and match it with the most suitable volunteer attorney based on expertise, availability, and location. You'll receive match recommendations within minutes.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-stone-200">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-800 font-semibold"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Submit for AI Matching
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
