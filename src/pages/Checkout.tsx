import { useState } from 'react';
import { ShoppingCart, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';

export default function Checkout() {
  const { language } = useLanguage();
  const en = language === 'en';
  const [isBusiness, setIsBusiness] = useState(false);
  const [isOrganization, setIsOrganization] = useState(false);
  const [a2jPassed, setA2jPassed] = useState(false);
  const [acknowledgedScope, setAcknowledgedScope] = useState(false);

  const showA2JScreening = !isBusiness && !isOrganization && !a2jPassed;

  const handleA2JPass = () => {
    setA2jPassed(true);
  };

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
                    {en ? 'Access to Justice Screening' : 'Evaluación de Acceso a la Justicia'}
                  </h2>
                  <p className="text-slate-700">
                    {en
                      ? 'We want to make sure you have access to affordable legal help. Please answer a few questions.'
                      : 'Queremos asegurarnos de que tengas acceso a ayuda legal asequible. Por favor, responde algunas preguntas.'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={(e) => setIsBusiness(e.target.checked)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className="text-slate-700">
                      {en ? 'I am representing a business' : 'Represento un negocio'}
                    </span>
                  </label>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={(e) => setIsOrganization(e.target.checked)}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <span className="text-slate-700">
                      {en ? 'I represent an organization' : 'Represento una organización'}
                    </span>
                  </label>
                </div>
              </div>

              <button
                onClick={handleA2JPass}
                className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
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
                    <span className="text-slate-700">{en ? 'Professional Plan' : 'Plan Profesional'}</span>
                    <span className="font-semibold text-slate-900">$29/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-700">{en ? 'Annual Billing (Save 17%)' : 'Facturacion Anual (Ahorra 17%)'}</span>
                    <span className="font-semibold text-green-600">-$58/year</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-6">
                  <span>{en ? 'Total' : 'Total'}:</span>
                  <span>$287.88/year</span>
                </div>

                {/* Stripe Placeholder */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-slate-500 text-center">
                    {en ? 'Stripe payment form will load here' : 'El formulario de pago de Stripe se cargará aquí'}
                  </p>
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
                className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {en ? 'Complete Purchase' : 'Completar Compra'} <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
