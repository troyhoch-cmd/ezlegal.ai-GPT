import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Mail, Send, ArrowLeft, CheckCircle, Scale, Bot, Users,
  Briefcase, Award, Lightbulb, Quote, Shield
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

interface FormData {
  fullName: string;
  email: string;
  organization: string;
  role: string;
  yearsExperience: string;
  aiToolsUsed: string[];
  useCases: string[];
  impactDescription: string;
  challengesDescription: string;
  ethicsApproach: string;
  willingToInterview: boolean;
  willingToBeQuoted: boolean;
  additionalComments: string;
}

const aiToolOptions = [
  'ezLegal.ai / LegalBreeze',
  'ChatGPT / GPT-4',
  'Claude',
  'Casetext / CoCounsel',
  'Harvey AI',
  'Custom AI Solutions',
  'Other'
];

const useCaseOptions = [
  'Client Intake Automation',
  'Legal Research',
  'Document Drafting',
  'Case Assessment',
  'Eligibility Screening',
  'Document Review',
  'Translation Services',
  'Client Communication',
  'Other'
];

export default function SharePerspective() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    organization: '',
    role: '',
    yearsExperience: '',
    aiToolsUsed: [],
    useCases: [],
    impactDescription: '',
    challengesDescription: '',
    ethicsApproach: '',
    willingToInterview: false,
    willingToBeQuoted: false,
    additionalComments: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (field: 'aiToolsUsed' | 'useCases', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('perspective_submissions')
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          organization: formData.organization,
          role: formData.role,
          years_experience: formData.yearsExperience,
          ai_tools_used: formData.aiToolsUsed,
          use_cases: formData.useCases,
          impact_description: formData.impactDescription,
          challenges_description: formData.challengesDescription,
          ethics_approach: formData.ethicsApproach,
          willing_to_interview: formData.willingToInterview,
          willing_to_be_quoted: formData.willingToBeQuoted,
          additional_comments: formData.additionalComments
        });

      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError('There was an error submitting your response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50">
        <Navigation />
        <div className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 mb-4">
              Thank You for Sharing!
            </h1>
            <p className="text-lg text-navy-600 mb-8">
              Your insights on AI in legal services are invaluable to our community. We'll review your submission and may reach out if we'd like to feature your perspective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/for-organizations"
                className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Organizations
              </Link>
              <Link
                to="/ezreads"
                className="inline-flex items-center justify-center gap-2 bg-navy-100 hover:bg-navy-200 text-navy-700 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Browse Legal Guides
              </Link>
            </div>
          </div>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-teal-50">
      <Navigation />
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-16 pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/for-organizations"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Organizations
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Quote className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">
                Share Your AI Perspective
              </h1>
              <p className="text-teal-100 text-lg mt-1">
                For Legal Professionals Using AI in Pro Bono & Legal Aid Work
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Why We're Asking
              </h3>
              <p className="text-sm text-navy-600 mb-6">
                We're compiling insights from legal professionals who are pioneering ethical AI use in access to justice work. Your experiences help shape best practices and inspire others.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">Featured Spotlights</p>
                    <p className="text-xs text-navy-500">Selected stories may be featured in our Legal Guides</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">Community Building</p>
                    <p className="text-xs text-navy-500">Connect with like-minded professionals</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-900">Your Privacy</p>
                    <p className="text-xs text-navy-500">You control what's shared publicly</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2 pb-2 border-b border-navy-200">
                    <Briefcase className="w-5 h-5 text-teal-600" />
                    About You
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                        placeholder="jane@organization.org"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Organization <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                        placeholder="Legal Aid Society"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Your Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                      >
                        <option value="">Select your role</option>
                        <option value="attorney">Attorney</option>
                        <option value="paralegal">Paralegal</option>
                        <option value="legal_director">Legal Director</option>
                        <option value="executive_director">Executive Director</option>
                        <option value="technology_lead">Technology Lead</option>
                        <option value="pro_bono_coordinator">Pro Bono Coordinator</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Years of Experience in Legal Services
                      </label>
                      <select
                        name="yearsExperience"
                        value={formData.yearsExperience}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all"
                      >
                        <option value="">Select experience level</option>
                        <option value="0-2">0-2 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="11-20">11-20 years</option>
                        <option value="20+">20+ years</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2 pb-2 border-b border-navy-200">
                    <Bot className="w-5 h-5 text-teal-600" />
                    Your AI Experience
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-3">
                        Which AI tools have you used in your legal work? <span className="text-red-500">*</span>
                      </label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {aiToolOptions.map(tool => (
                          <label
                            key={tool}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.aiToolsUsed.includes(tool)
                                ? 'border-teal-600 bg-teal-50'
                                : 'border-navy-200 hover:border-navy-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.aiToolsUsed.includes(tool)}
                              onChange={() => handleMultiSelect('aiToolsUsed', tool)}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                            />
                            <span className="text-sm text-navy-700">{tool}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-3">
                        What are your primary AI use cases? <span className="text-red-500">*</span>
                      </label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {useCaseOptions.map(useCase => (
                          <label
                            key={useCase}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.useCases.includes(useCase)
                                ? 'border-teal-600 bg-teal-50'
                                : 'border-navy-200 hover:border-navy-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.useCases.includes(useCase)}
                              onChange={() => handleMultiSelect('useCases', useCase)}
                              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-600"
                            />
                            <span className="text-sm text-navy-700">{useCase}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2 pb-2 border-b border-navy-200">
                    <Scale className="w-5 h-5 text-teal-600" />
                    Your Insights
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        What positive impact has AI had on your pro bono or legal aid work? <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="impactDescription"
                        value={formData.impactDescription}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all resize-none"
                        placeholder="Share specific examples of how AI has helped you serve more clients, improve efficiency, or enhance the quality of legal services..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        What challenges have you encountered using AI in legal services?
                      </label>
                      <textarea
                        name="challengesDescription"
                        value={formData.challengesDescription}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all resize-none"
                        placeholder="Describe any obstacles you've faced - accuracy concerns, client skepticism, ethical considerations, technical limitations..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        How do you approach AI ethics and ensure responsible use?
                      </label>
                      <textarea
                        name="ethicsApproach"
                        value={formData.ethicsApproach}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all resize-none"
                        placeholder="Share your practices for human oversight, accuracy verification, client disclosure, or any governance frameworks you follow..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2 pb-2 border-b border-navy-200">
                    <Mail className="w-5 h-5 text-teal-600" />
                    Sharing Preferences
                  </h3>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 p-4 bg-navy-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        name="willingToInterview"
                        checked={formData.willingToInterview}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-600 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-navy-900">I'm open to a brief interview</p>
                        <p className="text-sm text-navy-500">We may reach out for a 15-20 minute conversation to learn more about your experience</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 bg-navy-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        name="willingToBeQuoted"
                        checked={formData.willingToBeQuoted}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-600 rounded focus:ring-teal-600 mt-0.5"
                      />
                      <div>
                        <p className="font-medium text-navy-900">I'm willing to be quoted publicly</p>
                        <p className="text-sm text-navy-500">Your insights may be featured in articles or case studies (we'll confirm exact quotes before publishing)</p>
                      </div>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Anything else you'd like to share?
                      </label>
                      <textarea
                        name="additionalComments"
                        value={formData.additionalComments}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-navy-200 rounded-xl focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 outline-none transition-all resize-none"
                        placeholder="Additional thoughts, suggestions, or questions..."
                      />
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || formData.aiToolsUsed.length === 0 || formData.useCases.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-navy-800 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Your Perspective
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-navy-500 text-center">
                  By submitting, you agree that we may contact you about your submission.
                  Your information will be handled according to our{' '}
                  <Link to="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
