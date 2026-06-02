import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Info, Users, ChevronDown, ChevronUp, ExternalLink, UserX, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDisclosure } from '../lib/legal-disclosures';

interface InFlowTrustStripProps {
  jurisdiction?: string;
  compact?: boolean;
  showEscalation?: boolean;
}

export default function InFlowTrustStrip({ jurisdiction, compact = false, showEscalation = true }: InFlowTrustStripProps) {
  const { language } = useLanguage();
  const en = language === 'en';
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="bg-navy-50 border-b border-navy-200">
        <div className="flex items-center justify-between px-3 py-1.5 text-xs text-navy-600">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-500" />
              {en ? 'Legal info, not advice' : 'Info legal, no asesoramiento'}
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-green-600" />
              {en ? 'Encrypted' : 'Encriptado'}
            </span>
            <span className="flex items-center gap-1">
              <UserX className="w-3 h-3 text-slate-500" />
              {en ? 'No attorney-client privilege' : 'Sin privilegio abogado-cliente'}
            </span>
            {jurisdiction && (
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-teal-600" />
                {jurisdiction}
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium"
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
        {expanded && (
          <div className="px-3 pb-2 text-xs text-navy-600 border-t border-navy-200 pt-2 space-y-2">
            <div>
              <span className="font-semibold">{en ? 'Scope:' : 'Alcance:'}</span>{' '}
              {getDisclosure('scopeFull', language)}
            </div>
            <div>
              <span className="font-semibold">{en ? 'Privilege:' : 'Privilegio:'}</span>{' '}
              {getDisclosure('privilegeFull', language)}
            </div>
            <div>
              <span className="font-semibold">{en ? 'Data:' : 'Datos:'}</span>{' '}
              {getDisclosure('dataFull', language)}
            </div>
            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <Link to="/privacy" className="flex items-center gap-1 text-teal-600 hover:underline">
                <Trash2 className="w-3 h-3" />
                {en ? 'Data Retention & Deletion' : 'Retencion y Eliminacion de Datos'}
              </Link>
              {showEscalation && (
                <>
                  <Link to="/find-attorney" className="flex items-center gap-1 text-teal-600 hover:underline">
                    <Users className="w-3 h-3" />
                    {en ? 'Find Attorney' : 'Encontrar Abogado'}
                  </Link>
                  <Link to="/pro-bono" className="flex items-center gap-1 text-teal-600 hover:underline">
                    <ExternalLink className="w-3 h-3" />
                    {en ? 'Free Legal Aid' : 'Ayuda Legal Gratuita'}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-navy-50 rounded-lg border border-navy-200 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-navy-800">
        <Shield className="w-4 h-4 text-teal-600" />
        {en ? 'Your Protection' : 'Tu Proteccion'}
        {jurisdiction && (
          <span className="ml-auto text-xs font-normal text-navy-500 bg-white px-2 py-0.5 rounded-full border border-navy-200">
            {jurisdiction}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-navy-600">
        <div className="flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <span>{getDisclosure('notAdvice', language)}</span>
        </div>
        <div className="flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
          <span>{en ? 'AES-256 encrypted' : 'Encriptado AES-256'}</span>
        </div>
        <div className="flex items-start gap-2">
          <UserX className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
          <span>{en ? 'Not attorney-client privileged' : 'Sin privilegio abogado-cliente'}</span>
        </div>
        <div className="flex items-start gap-2">
          <Trash2 className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
          <Link to="/privacy" className="text-teal-600 hover:underline">
            {en ? 'Data retention & deletion' : 'Retencion y eliminacion de datos'}
          </Link>
        </div>
      </div>
      {showEscalation && (
        <div className="flex items-center gap-3 pt-2 border-t border-navy-200 text-xs">
          <span className="text-navy-500">{en ? 'Need a licensed attorney?' : 'Necesitas un abogado?'}</span>
          <Link to="/find-attorney" className="text-teal-600 font-medium hover:underline">
            {en ? 'Find Attorney' : 'Encontrar Abogado'}
          </Link>
          <Link to="/pro-bono" className="text-teal-600 font-medium hover:underline">
            {en ? 'Free Legal Aid' : 'Ayuda Legal Gratuita'}
          </Link>
        </div>
      )}
    </div>
  );
}
