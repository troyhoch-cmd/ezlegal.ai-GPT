import { useState } from 'react';
import { Calendar, Mail, Building2, Clock, Send } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function ScheduleDemo() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              {en ? 'Schedule a Demo' : 'Programar una Demostración'}
            </h1>
            <p className="text-slate-600">
              {en
                ? 'Book a personalized demo with our team to learn how ezLegal.ai can help your organization.'
                : 'Reserva una demostración personalizada con nuestro equipo para aprender cómo ezLegal.ai puede ayudar a tu organización.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {en ? 'Full Name' : 'Nombre Completo'} *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder={en ? 'John Doe' : 'Juan Pérez'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {en ? 'Email' : 'Correo'} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-2" />
                  {en ? 'Organization' : 'Organización'} *
                </label>
                <input
                  type="text"
                  name="organization"
                  required
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder={en ? 'Legal Aid Org' : 'Organización Legal'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  {en ? 'Preferred Time' : 'Hora Preferida'}
                </label>
                <input
                  type="text"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={en ? 'e.g., Tuesdays 2-4pm EST' : 'p. ej., Martes 2-4pm EST'}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                {en ? 'Request Demo' : 'Solicitar Demostración'}
              </button>
            </div>

            {submitted && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center text-green-800">
                {en
                  ? 'Thanks! We will be in touch soon.'
                  : 'Gracias! Nos pondremos en contacto pronto.'}
              </div>
            )}
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}
