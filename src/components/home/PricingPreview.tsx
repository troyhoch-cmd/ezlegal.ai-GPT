import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { homeCopy } from '../../data/homeCopy';
import { pricingAudiences } from '../../data/pricing';

const tiers = {
  en: [
    { title: 'Free legal checkup', desc: 'AI-guided triage, issue identification, and next-step plan.' },
    { title: 'Self-guided documents', price: 'Price shown before you start', desc: 'Guided preparation for common legal forms and letters.' },
    { title: 'Human document review', price: 'Optional, when available', desc: 'Attorney or paralegal review of your prepared documents.' },
    { title: 'SMB workspace', desc: 'Contract tracking, deadline management, and team access.' },
  ],
  es: [
    { title: 'Chequeo legal gratis', desc: 'Triaje guiado por IA, identificaci\u00f3n del problema y plan de pasos.' },
    { title: 'Documentos autoguiados', price: 'Precio mostrado antes de empezar', desc: 'Preparaci\u00f3n guiada para formularios y cartas legales comunes.' },
    { title: 'Revisi\u00f3n humana de documentos', price: 'Opcional, cuando est\u00e9 disponible', desc: 'Revisi\u00f3n por abogado o paralegal de tus documentos preparados.' },
    { title: 'Espacio de trabajo SMB', desc: 'Seguimiento de contratos, gesti\u00f3n de plazos y acceso de equipo.' },
  ],
};

export function PricingPreview() {
  const { language } = useLanguage();
  const en = language === 'en';
  const items = en ? tiers.en : tiers.es;

  return (
    <section className="py-10 sm:py-12 bg-white border-y border-slate-100" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold text-teal-700 text-center mb-1 uppercase tracking-wide">
          {en ? 'For individuals and small businesses' : 'Para individuos y peque\u00f1os negocios'}
        </p>
        <h2 id="pricing-heading" className="text-lg sm:text-xl font-bold text-slate-900 text-center mb-2">
          {en ? homeCopy.pricingPreview.heading.en : homeCopy.pricingPreview.heading.es}
        </h2>
        <p className="text-sm text-slate-500 text-center mb-6 max-w-md mx-auto">
          {en ? homeCopy.pricingPreview.subline.en : homeCopy.pricingPreview.subline.es}
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={item.title} className={`rounded-xl border p-4 ${i === 0 ? 'border-teal-200 bg-teal-50/30' : 'border-slate-150 bg-slate-50/50'}`}>
              <h3 className="font-semibold text-sm text-slate-900 mb-1">{item.title}</h3>
              <p className="text-teal-700 font-bold text-sm mb-2">
                {i === 0
                  ? (en ? pricingAudiences[0].plans[0].price.en : pricingAudiences[0].plans[0].price.es)
                  : i === 3
                    ? (en ? pricingAudiences[1].plans[0].price.en : pricingAudiences[1].plans[0].price.es)
                    : item.price}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">
          {en ? homeCopy.pricingPreview.disclaimer.en : homeCopy.pricingPreview.disclaimer.es}
        </p>
        <div className="mt-4 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 rounded"
          >
            {en ? 'See full pricing details' : 'Ver todos los detalles de precios'}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
