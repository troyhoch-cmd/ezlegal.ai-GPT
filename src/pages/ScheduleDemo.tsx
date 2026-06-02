import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Clock, Users, Building2, CheckCircle,
  Phone, Mail, Brain, BarChart3, Shield, Zap, Globe, Video
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const demoTypes = [
  {
    id: 'lso',
    title: 'Legal Services Organizations',
    description: 'AI-powered case matching, grant reporting, and volunteer management',
    duration: '30 min',
    icon: <Building2 className="w-6 h-6" />,
    features: ['AI Case Matching Demo', 'Grant Report Generator', 'LegalServer Integration']
  },
  {
    id: 'nonprofit',
    title: 'Nonprofits & Community Orgs',
    description: 'Embedded AI chatbot, resource guides, and intake automation',
    duration: '30 min',
    icon: <Shield className="w-6 h-6" />,
    features: ['Embed Widget Demo', 'Resource Library', 'Intake Automation']
  },
  {
    id: 'enterprise',
    title: 'Enterprise / Multi-Office',
    description: 'Full platform tour with technical architecture deep dive',
    duration: '45 min',
    icon: <Globe className="w-6 h-6" />,
    features: ['Full Platform Tour', 'API Integration', 'Security & Compliance']
  }
];

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'
];

const benefits = [
  { icon: <Brain className="w-5 h-5" />, text: 'See AI case matching in action' },
  { icon: <BarChart3 className="w-5 h-5" />, text: 'Generate a sample grant report' },
  { icon: <Zap className="w-5 h-5" />, text: 'Experience the client chatbot' },
  { icon: <Shield className="w-5 h-5" />, text: 'Review security & compliance' }
];

export default function ScheduleDemo() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    role: '',
    currentSystem: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });
      }
    }
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    try {
      const { trackEvent: te } = await import('../services/analytics-service');
      te('demo_requested', { demo_type: selectedType, org: formData.organization });
    } catch { /* analytics best-effort */ }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />

        <section className="pt-32 pb-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-navy-900 mb-4">Demo Scheduled!</h1>
            <p className="text-lg text-navy-600 mb-8">
              Thank you for your interest in ezLegal.ai. We've sent a calendar invitation
              to <span className="font-semibold">{formData.email}</span> with the meeting details.
            </p>

            <div className="bg-navy-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-navy-900 mb-4">Your Demo Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <span>{selectedTime} (Eastern Time)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-teal-600" />
                  <span>Video call link will be in your email</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/lso-dashboard"
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Preview AI Dashboard
              </Link>
              <Link
                to="/"
                className="px-6 py-3 border border-navy-300 hover:bg-navy-50 text-navy-700 font-semibold rounded-lg transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="bg-gradient-to-br from-teal-700 via-teal-600 to-navy-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/30 px-4 py-2 rounded-full mb-6">
              <Video className="w-4 h-4 text-orange-400" />
              <span className="text-white text-sm font-semibold">Live Product Demo</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Schedule Your <span className="text-orange-400">Personalized</span> Demo
            </h1>
            <p className="text-xl text-teal-50 mb-8">
              See how ezLegal.ai can transform your legal services organization with AI-powered
              case matching, automated grant reporting, and intelligent client intake.
            </p>

            <div className="flex flex-wrap gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-teal-100">
                  <div className="text-orange-400">{benefit.icon}</div>
                  <span className="text-sm">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    Select Demo Type
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {demoTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedType === type.id
                            ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100'
                            : 'border-navy-200 hover:border-teal-300'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                          selectedType === type.id ? 'bg-teal-600 text-white' : 'bg-navy-100 text-navy-600'
                        }`}>
                          {type.icon}
                        </div>
                        <h3 className="font-semibold text-navy-900 text-sm mb-1">{type.title}</h3>
                        <p className="text-xs text-navy-600 mb-2">{type.description}</p>
                        <div className="flex items-center gap-1 text-xs text-teal-600">
                          <Clock className="w-3 h-3" />
                          {type.duration}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    Choose Date & Time
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Select Date
                      </label>
                      <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="">Choose a date...</option>
                        {generateDateOptions().map((date) => (
                          <option key={date.value} value={date.value}>{date.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Select Time (ET)
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="">Choose a time...</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    Your Information
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        value={formData.organization}
                        onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Your Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="">Select your role...</option>
                        <option value="executive">Executive Director / CEO</option>
                        <option value="managing_attorney">Managing Attorney</option>
                        <option value="it_director">IT Director / Manager</option>
                        <option value="operations">Operations Manager</option>
                        <option value="pro_bono_coordinator">Pro Bono Coordinator</option>
                        <option value="partner">Partner / Owner</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        Current Case Management System
                      </label>
                      <select
                        value={formData.currentSystem}
                        onChange={(e) => setFormData({ ...formData, currentSystem: e.target.value })}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      >
                        <option value="">Select current system...</option>
                        <option value="legalserver">LegalServer</option>
                        <option value="clio">Clio</option>
                        <option value="smokeball">Smokeball</option>
                        <option value="practicepanther">PracticePanther</option>
                        <option value="spreadsheets">Spreadsheets / Manual</option>
                        <option value="other">Other</option>
                        <option value="none">None / Starting Fresh</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-navy-700 mb-2">
                        What would you like to see in the demo?
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-navy-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                        placeholder="Any specific features, integrations, or questions you'd like us to address..."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedType || !selectedDate || !selectedTime}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-navy-300 text-white font-bold text-lg rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5" />
                      Schedule My Demo
                    </>
                  )}
                </button>

                <p className="text-sm text-navy-500 text-center">
                  By scheduling, you agree to receive communications from ezLegal.ai.
                  We respect your privacy and will never share your information.
                </p>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-navy-50 rounded-xl p-6 border border-navy-200">
                  <h3 className="font-bold text-navy-900 mb-4">What to Expect</h3>
                  <ul className="space-y-3 text-sm text-navy-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Personalized walkthrough of features relevant to your organization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Live demonstration of AI case matching and grant reporting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Q&A with our product specialists</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Custom pricing based on your needs</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
                  <h3 className="font-bold text-navy-900 mb-2">Prefer to Talk First?</h3>
                  <p className="text-sm text-navy-600 mb-4">
                    Have questions before scheduling? Our team is happy to chat.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:+18885555555"
                      className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
                    >
                      <Phone className="w-4 h-4" />
                      (888) 555-5555
                    </a>
                    <a
                      href="mailto:demos@ezlegal.ai"
                      className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700"
                    >
                      <Mail className="w-4 h-4" />
                      demos@ezlegal.ai
                    </a>
                  </div>
                </div>

                <div className="border border-navy-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-navy-900">Join Growing Organizations</span>
                  </div>
                  <p className="text-sm text-navy-600">
                    Legal aid organizations and nonprofits are using ezLegal.ai to serve
                    more clients efficiently with ethical AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
