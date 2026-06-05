import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowLeft, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { BusinessLocation, FALLBACK_LOCATION, fetchPrimaryLocation, formatAddressOneLine } from '../lib/local-seo';
import { useLanguage } from '../contexts/LanguageContext';
import { trackEvent } from '../services/analytics-service';

export default function Contact() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loc, setLoc] = useState<BusinessLocation>(FALLBACK_LOCATION);

  useEffect(() => {
    fetchPrimaryLocation().then(setLoc);
  }, []);

  const mapsHref = loc.google_place_id
    ? `https://www.google.com/maps/place/?q=place_id:${loc.google_place_id}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddressOneLine(loc))}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert([formData]);

      if (submitError) throw submitError;

      trackEvent('support_contacted', { method: 'contact_form' });
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setError('Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-navy-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2 text-center">
              {en ? 'Thank You!' : 'Gracias!'}
            </h2>
            <p className="text-navy-600 mb-6 text-center">
              {en ? "We've received your message and will get back to you within 24 hours." : 'Hemos recibido tu mensaje y te responderemos dentro de 24 horas.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setSubmitSuccess(false)}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                {en ? 'Send Another Message' : 'Enviar Otro Mensaje'}
              </button>
              <Link
                to="/"
                className="flex-1 px-6 py-3 border border-navy-200 text-navy-600 rounded-lg font-medium hover:bg-white transition-colors text-center"
              >
                {en ? 'Back to Home' : 'Volver al Inicio'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-16 pt-32 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy-900 mb-4">
            {en ? 'Get in Touch' : 'Contáctanos'}
          </h1>
          <p className="text-xl text-navy-600 max-w-2xl mx-auto">
            {en ? "Have a question or need assistance? We're here to help you navigate your legal needs." : 'Tienes una pregunta o necesitas ayuda? Estamos aquí para ayudarte con tus necesidades legales.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-navy-900 mb-2">Email Us</h2>
            <p className="text-navy-600 text-sm mb-2">
              Send us an email anytime
            </p>
            <a href={`mailto:${loc.email}`} className="text-teal-600 hover:text-teal-700 font-medium text-sm">
              {loc.email}
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-navy-900 mb-2">Call Us</h2>
            <p className="text-navy-600 text-sm mb-2">
              Mon-Fri from 9am to 6pm MST
            </p>
            <a href={`tel:${loc.phone_e164}`} className="text-teal-600 hover:text-teal-700 font-medium text-sm">
              {loc.phone_display}
            </a>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-navy-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-navy-900 mb-2">Visit Us</h2>
            <address className="text-navy-600 text-sm not-italic" itemScope itemType="https://schema.org/PostalAddress">
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors">
                <span itemProp="streetAddress">{loc.street_address}</span><br />
                <span itemProp="addressLocality">{loc.address_locality}</span>,{' '}
                <span itemProp="addressRegion">{loc.address_region}</span>{' '}
                <span itemProp="postalCode">{loc.postal_code}</span>
              </a>
            </address>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-navy-200">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">Send us a Message</h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-navy-600 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-navy-600 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-navy-600 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    placeholder="+1 (234) 567-890"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-navy-600 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
                    placeholder="Your Company"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-navy-600 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-navy-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 focus:ring-4 focus:ring-teal-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-8 border border-navy-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-navy-900 mb-2">
                  Questions About Pricing?
                </h3>
                <p className="text-navy-600 mb-4">
                  We believe in transparent pricing. Free unlimited questions for everyone. Issue Packs from $29 when you need action plans. Businesses from $29/month. No hidden fees, ever.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700 transition-colors"
                >
                  View All Plans & Pricing
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
