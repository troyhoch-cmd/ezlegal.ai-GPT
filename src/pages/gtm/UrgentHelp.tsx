import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, AlertTriangle, Shield, Heart, Home,
  Scale, Globe, ExternalLink, MessageCircle
} from 'lucide-react';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePersonalization } from '../../contexts/PersonalizationContext';

const CRISIS_RESOURCES = [
  {
    icon: Heart,
    title: { en: 'Domestic Violence', es: 'Violencia Doméstica' },
    org: { en: 'National DV Hotline', es: 'Línea Nacional de Violencia Doméstica' },
    phone: '1-800-799-7233',
    desc: { en: '24/7, free, confidential. En español disponible.', es: '24/7, gratis, confidencial. Disponible en español.' },
    color: 'bg-rose-50 text-rose-600 border-rose-200',
  },
  {
    icon: Home,
    title: { en: 'Eviction / Housing Crisis', es: 'Desalojo / Crisis de Vivienda' },
    org: { en: '211 - Local Housing Help', es: '211 - Ayuda Local de Vivienda' },
    phone: '211',
    desc: { en: 'Free legal aid referrals, emergency shelter.', es: 'Referencias a ayuda legal gratuita, refugio de emergencia.' },
    color: 'bg-amber-50 text-amber-600 border-amber-200',
  },
  {
    icon: Globe,
    title: { en: 'Immigration / ICE', es: 'Inmigración / ICE' },
    org: { en: 'United We Dream Hotline', es: 'Línea de United We Dream' },
    phone: '1-844-363-1423',
    desc: { en: 'Know-your-rights info, raid preparedness.', es: 'Información de derechos, preparación ante redadas.' },
    color: 'bg-sky-50 text-sky-600 border-sky-200',
  },
  {
    icon: Scale,
    title: { en: 'Criminal Arrest', es: 'Arresto Criminal' },
    org: { en: 'Public Defender Office', es: 'Defensor Público' },
    phone: '211',
    desc: { en: 'If arrested, you have the right to an attorney. Call 211 for local legal aid.', es: 'Si te arrestan, tienes derecho a un abogado. Llama al 211 para ayuda legal.' },
    color: 'bg-navy-50 text-navy-600 border-navy-200',
  },
  {
    icon: AlertTriangle,
    title: { en: 'Wage Theft / Workplace', es: 'Robo de Salario / Trabajo' },
    org: { en: 'Dept. of Labor Wage & Hour', es: 'Dept. del Trabajo' },
    phone: '1-866-487-9243',
    desc: { en: 'File unpaid wage complaints. Free, no immigration status check.', es: 'Presenta quejas por salarios impagos. Gratis, sin verificación migratoria.' },
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
];

export default function UrgentHelp() {
  const { language } = useLanguage();
  const { trackPageVisit } = usePersonalization();

  useEffect(() => {
    trackPageVisit('/urgent-help');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const en = language === 'en';

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main id="main-content">
        {/* Emergency Banner */}
        <section className="pt-24 pb-10 bg-rose-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-2xl mb-4">
              <Phone className="w-7 h-7" />
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              {en ? 'If you are in immediate danger, call 911' : 'Si estás en peligro inmediato, llama al 911'}
            </h1>

            <p className="text-lg text-rose-100 mb-6 max-w-2xl mx-auto">
              {en
                ? 'Below are free, confidential resources for common legal emergencies. All services are available regardless of immigration status.'
                : 'A continuación hay recursos gratuitos y confidenciales para emergencias legales comunes. Todos los servicios están disponibles sin importar tu estatus migratorio.'
              }
            </p>

            <a
              href="tel:911"
              className="inline-flex items-center gap-2 bg-white text-rose-700 px-6 py-3 rounded-xl font-bold hover:bg-rose-50 transition-colors"
            >
              <Phone className="w-5 h-5" />
              {en ? 'Call 911 Now' : 'Llamar 911 Ahora'}
            </a>
          </div>
        </section>

        {/* Safety Notice */}
        <section className="py-4 bg-navy-900 text-white">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-3 text-sm">
            <Shield className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>
              {en
                ? 'Your privacy is protected. We do NOT share data with ICE, police, or any government agency.'
                : 'Tu privacidad está protegida. NO compartimos datos con ICE, la policía ni ninguna agencia del gobierno.'
              }
            </span>
          </div>
        </section>

        {/* Crisis Resources */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">
              {en ? 'Free Crisis Resources' : 'Recursos de Crisis Gratuitos'}
            </h2>

            <div className="space-y-4">
              {CRISIS_RESOURCES.map(({ icon: Icon, title, org, phone, desc, color }, i) => (
                <div key={i} className={`flex items-start gap-4 p-5 rounded-xl border ${color}`}>
                  <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white shadow-sm flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-navy-900 mb-1">
                      {en ? title.en : title.es}
                    </h3>
                    <p className="text-sm text-navy-600 mb-2">
                      {en ? org.en : org.es}
                    </p>
                    <p className="text-xs text-navy-500 mb-3">
                      {en ? desc.en : desc.es}
                    </p>
                    <a
                      href={`tel:${phone.replace(/-/g, '')}`}
                      className="inline-flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Non-Emergency Help */}
        <section className="py-12 bg-navy-50 border-y border-slate-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-navy-900 mb-3">
              {en ? 'Not an emergency? We can still help.' : '¿No es una emergencia? Aún podemos ayudar.'}
            </h2>
            <p className="text-navy-600 mb-6">
              {en
                ? 'Ask a free legal question about your situation and get clear next steps.'
                : 'Haz una pregunta legal gratuita sobre tu situación y recibe próximos pasos claros.'
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/ask"
                data-cta="urgent-help-ask"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                {en ? 'Ask a Free Question' : 'Haz una Pregunta Gratis'}
              </Link>
              <Link
                to="/pro-bono"
                className="inline-flex items-center gap-2 text-navy-700 hover:text-navy-900 border border-navy-300 hover:border-navy-400 px-6 py-3 rounded-xl font-medium transition-all"
              >
                {en ? 'Check Pro Bono Eligibility' : 'Verificar Elegibilidad Pro Bono'}
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center text-xs text-navy-500">
            <p>
              {en
                ? 'ezLegal.ai provides legal information, not legal advice. If you are in immediate danger, call 911. The resources listed above are third-party services; ezLegal.ai is not responsible for their availability or outcomes.'
                : 'ezLegal.ai proporciona información legal, no asesoramiento legal. Si estás en peligro inmediato, llama al 911. Los recursos listados son servicios de terceros; ezLegal.ai no es responsable de su disponibilidad o resultados.'
              }
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
