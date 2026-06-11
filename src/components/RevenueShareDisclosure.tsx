import { Info, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface RevenueShareDisclosureProps {
  variant?: 'inline' | 'modal' | 'expandable';
  partnerName?: string;
}

export default function RevenueShareDisclosure({ variant = 'inline', partnerName }: RevenueShareDisclosureProps) {
  const { language } = useLanguage();
  const en = language === 'en';

  if (variant === 'inline') {
    return (
      <div className="flex gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-slate-700">
            {en ? 'Provider Disclosure' : 'Divulgacion de Proveedores'}
          </p>
          <p>
            {en
              ? `Some attorneys, legal service providers, or partner organizations may pay platform, sponsorship, marketing, or administrative fees to ${partnerName || 'ezLegal.ai'}. These fees do not affect your legal rights, do not guarantee representation, and do not require you to choose any listed provider. You may choose any lawyer or legal aid organization.`
              : `Algunos abogados, proveedores de servicios legales u organizaciones asociadas pueden pagar tarifas de plataforma, patrocinio, marketing o administracion a ${partnerName || 'ezLegal.ai'}. Estas tarifas no afectan sus derechos legales, no garantizan representacion y no requieren que elija ningun proveedor listado. Puede elegir cualquier abogado u organizacion de ayuda legal.`}
          </p>
          <a
            href="/scope-disclaimers"
            className="text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            {en ? 'Learn more' : 'Mas informacion'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <details className="group border border-slate-200 rounded-lg overflow-hidden">
      <summary className="flex items-center gap-2 p-3 cursor-pointer text-sm text-slate-700 hover:bg-slate-50">
        <Info className="w-4 h-4 text-slate-400" />
        {en ? 'How attorney connections work' : 'Como funcionan las conexiones con abogados'}
      </summary>
      <div className="p-3 pt-0 text-xs text-slate-600 space-y-2 border-t border-slate-100">
        <p>
          {en
            ? 'Some attorneys, legal service providers, or partner organizations listed on this platform may pay platform, sponsorship, marketing, or administrative fees. These are not referral fees and do not create a recommendation or endorsement.'
            : 'Algunos abogados, proveedores de servicios legales u organizaciones asociadas listadas en esta plataforma pueden pagar tarifas de plataforma, patrocinio, marketing o administracion. Estas no son tarifas de referencia y no crean una recomendacion o respaldo.'}
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>{en ? 'These fees do not affect your legal rights' : 'Estas tarifas no afectan sus derechos legales'}</li>
          <li>{en ? 'No provider pays for priority placement' : 'Ningun proveedor paga por ubicacion prioritaria'}</li>
          <li>{en ? 'You are free to choose any attorney or legal aid organization' : 'Usted es libre de elegir cualquier abogado u organizacion de ayuda legal'}</li>
          <li>{en ? 'No attorney-client relationship is created through this platform' : 'No se crea relacion abogado-cliente a traves de esta plataforma'}</li>
        </ul>
      </div>
    </details>
  );
}
