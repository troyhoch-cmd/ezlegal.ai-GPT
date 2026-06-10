import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_ITEMS } from '../../lib/gtm-content';
import { useLanguage } from '../../contexts/LanguageContext';

const FAQ_ITEMS_ES: { q: string; a: string }[] = [
  { q: '¿Es ezlegal.ai un bufete de abogados?', a: 'No. ezlegal.ai proporciona herramientas de automatización de flujos de trabajo e información legal. No es un bufete de abogados y no proporciona asesoramiento legal. No se crea ninguna relación abogado-cliente mediante el uso de esta plataforma.' },
  { q: '¿Esto reemplaza a un abogado?', a: 'No. ezlegal.ai ayuda a organizar hechos, documentos y flujos de trabajo para que cuando contrate a un abogado, el proceso sea más rápido y eficiente. No reemplaza el juicio legal profesional.' },
  { q: '¿Qué pasa después de completar la verificación de preparación?', a: 'Recibe un resumen personalizado de posibles vacíos legales y próximos pasos recomendados. Puede descargar una lista de verificación, reservar una demo para flujos avanzados o consultar a un abogado con su resumen organizado.' },
  { q: '¿Pueden los bufetes usar esto para admisión?', a: 'Sí. Los bufetes usan ezlegal.ai para estandarizar la admisión de clientes, recopilar documentos antes de consultas y generar resúmenes estructurados de asuntos que ahorran tiempo no facturable.' },
  { q: '¿Pueden los equipos internos usar esto para triaje de solicitudes legales?', a: 'Sí. Los equipos legales internos usan ezlegal.ai para centralizar solicitudes de unidades de negocio, calificar urgencia, recopilar hechos faltantes y enrutar asuntos al flujo de trabajo correcto.' },
  { q: '¿A dónde van mis datos?', a: 'Los datos se almacenan de forma segura. En producción, los leads se capturan mediante endpoints configurados o Supabase. La plataforma está diseñada para manejo configurable de datos con controles de privacidad.' },
  { q: '¿Podemos conectar esto a nuestro CRM o sistema de gestión de casos?', a: 'La plataforma está diseñada con la integración en mente. El acceso API está disponible en planes de nivel Firma. Contáctenos para discutir requisitos de integración específicos.' },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { language } = useLanguage();
  const items = language === 'es' ? FAQ_ITEMS_ES : FAQ_ITEMS;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-navy-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-navy-50 transition-colors"
              aria-expanded={openIndex === i}
            >
              <span className="font-semibold text-navy-900 pr-4">{item.q}</span>
              <ChevronDown className={`w-5 h-5 text-navy-500 flex-shrink-0 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-5 text-sm text-navy-600 leading-relaxed animate-in fade-in duration-150">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
