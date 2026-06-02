import { Handshake, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { trackEngagement } from '../../services/engagement-service';

interface Props {
  language: 'en' | 'es';
}

export default function MarketplaceSection({ language }: Props) {
  const l = language === 'es' ? 'es' : 'en';

  const handleLearnMore = () => {
    trackEngagement({
      featureName: 'marketplace_referral_learn_more_clicked',
      engagementType: 'click',
      metadata: {},
    });
  };

  const copy = {
    heading: {
      en: 'Professional help when you need it',
      es: 'Ayuda profesional cuando la necesites',
    },
    description: {
      en: 'ezLegal.ai helps you prepare, organize, and understand your situation. When appropriate, we connect you to legal aid, pro bono services, low-cost lawyers, or vetted professional services.',
      es: 'ezLegal.ai te ayuda a prepararte, organizarte y entender tu situacion. Cuando es apropiado, te conectamos con ayuda legal, servicios pro bono, abogados de bajo costo, o servicios profesionales verificados.',
    },
    models: {
      en: [
        'Free legal-aid referrals are never pay-to-rank',
        'Foundations and employers can sponsor community access',
        'Banks, fintechs, and HR platforms can offer this as a member benefit',
        'Small-business partners can bundle legal navigation tools',
        'Funders and agencies can sponsor triage for communities',
      ],
      es: [
        'Las referencias gratuitas de ayuda legal nunca son de pago por posicion',
        'Fundaciones y empleadores pueden patrocinar acceso comunitario',
        'Bancos, fintechs y plataformas de RRHH pueden ofrecerlo como beneficio',
        'Socios de pequenos negocios pueden combinar herramientas legales',
        'Financiadores y agencias pueden patrocinar triaje comunitario',
      ],
    },
    disclosure: {
      en: 'Free and urgent-help resources are never ranked by who pays us. Paid professional referrals, if available, are clearly labeled and must meet our suitability and ethics standards.',
      es: 'Los recursos gratuitos y de ayuda urgente nunca se clasifican por quien nos paga. Las referencias profesionales de pago, si estan disponibles, estan claramente etiquetadas y deben cumplir nuestros estandares de idoneidad y etica.',
    },
    learnMore: { en: 'Partner with us', es: 'Asociate con nosotros' },
  };

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-teal-100 rounded-xl flex-shrink-0">
            <Handshake className="w-6 h-6 text-teal-700" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900">{copy.heading[l]}</h2>
            <p className="mt-2 text-sm text-navy-600 leading-relaxed max-w-2xl">{copy.description[l]}</p>
          </div>
        </div>

        <ul className="space-y-2 mb-6 ml-14" role="list">
          {copy.models[l].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-navy-700">
              <span className="w-1.5 h-1.5 mt-2 rounded-full bg-teal-500 flex-shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <div className="ml-14 flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl">
          <Shield className="w-4 h-4 text-navy-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-navy-600 leading-relaxed">{copy.disclosure[l]}</p>
        </div>

        <div className="ml-14 mt-4">
          <Link
            to="/for-partners"
            onClick={handleLearnMore}
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
          >
            {copy.learnMore[l]}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
