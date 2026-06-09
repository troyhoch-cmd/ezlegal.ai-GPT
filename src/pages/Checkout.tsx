import { useState } from 'react';
import { ShoppingCart, AlertCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { pricingAudiences } from '../data/pricing';

const businessPlans = pricingAudiences.find((a) => a.id === 'business')?.plans ?? [];
const starterPlan = businessPlans.find((p) => p.id === 'business-starter');

export default function Checkout() {
  const { language } = useLanguage();
  const lang = language === 'es' ? 'es' : 'en' as const;
  const en = lang === 'en';
  const [userType, setUserType] = useState<'individual' | 'business' | 'organization' | null>(null);
  const [a2jPassed, setA2jPassed] = useState(false);
  const [acknowledgedScope, setAcknowledgedScope] = useState(false);

  const showA2JScreening = !a2jPassed;

  if (!starterPlan) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Navigation />
        <main className="pt-24 pb-16 text-center">
          <p className="text-slate-600">{en ? 'Plan configuration unavailable.' : 'Configuracion del plan no disponible.'}</p>
          <Link to="/pricing" className="text-teal-600 underline mt-4 inline-block">
            {en ? 'View pricing' : 'Ver precios'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const monthlyPrice = starterPlan.monthlyPrice ?? 0;
  const annualPrice = starterPlan.annualPrice ?? 0;
  const annualSavings = (monthlyPrice * 12) - annualPrice;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <main id="main-content" className="pt-24 pb-16">
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">
            {en ? 'Checkout' : 'Pagar'}
          </h1>

          {showA2JScreening ? (
            <div className="bg-teal-50 border border-teal-300 rounded-xl p-8 mb-8">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {en ? 'Access to Justice Screening' : 'Evaluacion de Acceso a la Justicia'}
                  </h2>
                  <p className="text-slate-700">
                    {en
                      ? 'Help us understand your needs so we can direct you to the right plan.'
                      : 'Ayudanos a entender tus necesidades para dirigirte al plan adecuado.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-sm font-medium text-slate-800 mb-2">
                  {en ? 'I am:' : 'Soy:'}
                </p>
                {([
                  { value: 'individual' as const, label: { en: 'An individual seeking legal information', es: 'Un individuo buscando informacion legal' } },
                  { value: 'business' as const, label: { en: 'Representing a business', es: 'Representante de un negocio' } },
                  { value: 'organization' as const, label: { en: 'Representing an organization or legal aid provider', es: 'Representante de una organizacion o proveedor de asistencia legal' } },
                ]).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUserType(option.value)}
                    className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                      userType === option.value
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-slate-700">{option.label[lang]}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setA2jPassed(true)}
                disabled={!userType}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {en ? 'Continue' : 'Continuar'}
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-teal-600" />
                  {en ? 'Order Summary' : 'Resumen del Pedido'}
                </h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">{starterPlan.name[lang]}</span>
                    <span className="font-semibold text-slate-900">{starterPlan.priceDisplay[lang]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">
                      {en
                        ? `Annual Billing (Save $${annualSavings}/year)`
                        : `Facturacion Anual (Ahorra $${annualSavings}/ano)`}
                    </span>
                    <span className="font-semibold text-green-600">-${annualSavings}/{en ? 'year' : 'ano'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-6">
                  <span>{en ? 'Total' : 'Total'}:</span>
                  <span>{starterPlan.annualPriceDisplay?.[lang] ?? `$${annualPrice}/year`}</span>
                </div>

                {/* Payment integration pending */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      {en
                        ? 'Payment processing is being configured. Checkout will be available soon.'
                        : 'El procesamiento de pagos se esta configurando. El pago estara disponible pronto.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      {en ? 'Important Notice' : 'Aviso Importante'}
                    </h3>
                    <p className="text-sm text-slate-700">
                      {en
                        ? 'ezLegal.ai is not a law firm and does not provide legal advice. Always consult with a licensed attorney for legal matters.'
                        : 'ezLegal.ai no es un despacho de abogados y no proporciona asesoramiento legal. Siempre consulta con un abogado licenciado para asuntos legales.'}
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acknowledgedScope}
                    onChange={(e) => setAcknowledgedScope(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 mt-1"
                  />
                  <span className="text-sm text-slate-700">
                    {en
                      ? 'I understand the scope and limitations of this service'
                      : 'Entiendo el alcance y las limitaciones de este servicio'}
                  </span>
                </label>
              </div>

              <button
                disabled={!acknowledgedScope}
                className="w-full flex items-center justify-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-medium"
                aria-disabled="true"
              >
                {en ? 'Payment Coming Soon' : 'Pago Disponible Pronto'} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-slate-500 text-center mt-3">
                {en
                  ? 'Payment processing is being set up. You will be notified when checkout is available.'
                  : 'El procesamiento de pagos se esta configurando. Te notificaremos cuando el pago este disponible.'}
              </p>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
