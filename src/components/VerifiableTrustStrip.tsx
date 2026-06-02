import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, ShieldCheck, Eye, ArrowRight, X, ExternalLink, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getClaimEntry } from '../lib/claims-registry';

interface ProofDetail {
  key: string;
  registryKeys: string[];
  icon: typeof Shield;
  label: { en: string; es: string };
  shortLabel: { en: string; es: string };
  proof: { en: string[]; es: string[] };
  verifyLink?: string;
  verifyLabel?: { en: string; es: string };
  statusNote?: { en: string; es: string };
}

const TRUST_PROOFS: ProofDetail[] = [
  {
    key: 'encryption',
    registryKeys: ['tls-encryption', 'aes-256-encryption'],
    icon: Lock,
    label: { en: 'TLS 1.3 + AES-256 Encryption', es: 'Cifrado TLS 1.3 + AES-256' },
    shortLabel: { en: 'TLS 1.3 + AES-256', es: 'TLS 1.3 + AES-256' },
    proof: {
      en: [
        'AES-256 encryption for all stored data',
        'TLS 1.3 for all data in transit',
        'Infrastructure layer: SOC 2 Type II certified (Supabase)',
        'Application-layer security audit: in progress',
      ],
      es: [
        'Cifrado AES-256 para todos los datos almacenados',
        'TLS 1.3 para todos los datos en transito',
        'Capa de infraestructura: SOC 2 Tipo II certificada (Supabase)',
        'Auditoria de seguridad de la aplicacion: en progreso',
      ],
    },
    verifyLink: '/enterprise-security',
    verifyLabel: { en: 'Security Details', es: 'Detalles de Seguridad' },
    statusNote: { en: 'SOC 2 Type II applies to infrastructure (Supabase); ezLegal.ai application-layer audit in progress', es: 'SOC 2 Tipo II aplica a infraestructura (Supabase); auditoria de capa de aplicacion de ezLegal.ai en progreso' },
  },
  {
    key: 'privacy',
    registryKeys: ['zero-training'],
    icon: Eye,
    label: { en: 'Zero Training on Your Data', es: 'Cero Entrenamiento con Tus Datos' },
    shortLabel: { en: 'Zero Training', es: 'Sin Entrenamiento' },
    proof: {
      en: [
        'Your conversations are never used to train AI models',
        'Data stored in isolated, encrypted databases (Supabase RLS)',
        'Full data deletion available on request (CCPA/privacy policy)',
        'We do not sell or share personal data with third parties',
      ],
      es: [
        'Tus conversaciones nunca se usan para entrenar modelos de IA',
        'Datos en bases de datos aisladas y cifradas (Supabase RLS)',
        'Eliminacion total disponible a solicitud (CCPA/politica de privacidad)',
        'No vendemos ni compartimos datos personales con terceros',
      ],
    },
    verifyLink: '/privacy',
    verifyLabel: { en: 'Privacy Policy', es: 'Politica de Privacidad' },
  },
  {
    key: 'compliance',
    registryKeys: ['ccpa-compliance'],
    icon: ShieldCheck,
    label: { en: 'CCPA Compliant', es: 'Cumple con CCPA' },
    shortLabel: { en: 'CCPA', es: 'CCPA' },
    proof: {
      en: [
        'Right to know what data is collected',
        'Right to delete your personal information',
        'Right to opt-out of data sale (we never sell)',
        'Data access requests fulfilled within 45 days',
      ],
      es: [
        'Derecho a saber que datos se recopilan',
        'Derecho a eliminar tu información personal',
        'Derecho a no vender tus datos (nunca vendemos)',
        'Solicitudes de acceso atendidas en 45 dias',
      ],
    },
    verifyLink: '/privacy-policy',
    verifyLabel: { en: 'Privacy Policy', es: 'Politica de Privacidad' },
  },
];

interface VerifiableTrustStripProps {
  variant?: 'bar' | 'card';
  className?: string;
}

export default function VerifiableTrustStrip({ variant = 'bar', className = '' }: VerifiableTrustStripProps) {
  const { language } = useLanguage();
  const [expandedProof, setExpandedProof] = useState<string | null>(null);
  const lang = language === 'es' ? 'es' : 'en';
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closePopup = useCallback(() => {
    setExpandedProof(null);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!expandedProof) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePopup();
      }
      if (e.key === 'Tab' && popupRef.current) {
        const focusable = popupRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        closePopup();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedProof, closePopup]);

  useEffect(() => {
    if (expandedProof && popupRef.current) {
      const firstFocusable = popupRef.current.querySelector<HTMLElement>('button, [href]');
      firstFocusable?.focus();
    }
  }, [expandedProof]);

  if (variant === 'card') {
    return (
      <div className={`bg-navy-50 border border-navy-100 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-navy-900">
              {lang === 'en' ? 'Verified Security' : 'Seguridad Verificada'}
            </span>
          </div>
          <Link to="/trust-center" className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
            {lang === 'en' ? 'Trust Center' : 'Centro de Confianza'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2" role="list" aria-label={lang === 'en' ? 'Security certifications' : 'Certificaciones de seguridad'}>
          {TRUST_PROOFS.map((proof) => {
            const Icon = proof.icon;
            const isExpanded = expandedProof === proof.key;
            return (
              <div key={proof.key} role="listitem">
                <button
                  onClick={() => setExpandedProof(isExpanded ? null : proof.key)}
                  className="w-full flex items-center gap-2 text-left group"
                  aria-expanded={isExpanded}
                  aria-controls={`proof-card-${proof.key}`}
                >
                  <Icon className="w-3.5 h-3.5 text-navy-400 group-hover:text-teal-600 transition-colors" />
                  <span className="text-xs font-medium text-navy-600 group-hover:text-navy-800 transition-colors flex-1">
                    {proof.label[lang]}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </button>
                {isExpanded && (
                  <div id={`proof-card-${proof.key}`} className="ml-5.5 mt-1.5 pl-4 border-l-2 border-teal-200" role="region" aria-label={proof.label[lang]}>
                    <ul className="space-y-1">
                      {proof.proof[lang].map((item, idx) => (
                        <li key={idx} className="text-xs text-navy-500 flex items-start gap-1.5">
                          <span className="w-1 h-1 bg-teal-400 rounded-full mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {proof.statusNote && (
                      <p className="text-[10px] text-navy-400 mt-1.5 italic">{proof.statusNote[lang]}</p>
                    )}
                    {proof.registryKeys.length > 0 && (() => {
                      const scopes = proof.registryKeys.map(k => getClaimEntry(k)?.scope).filter(Boolean);
                      if (scopes.length === 0) return null;
                      return (
                        <p className="text-[10px] text-navy-400 mt-1 border-t border-navy-100 pt-1">
                          <span className="font-medium">{lang === 'en' ? 'Scope: ' : 'Alcance: '}</span>
                          {scopes.join('; ')}
                        </p>
                      );
                    })()}
                    {proof.verifyLink && (
                      <Link to={proof.verifyLink} className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-1.5 font-medium">
                        <ExternalLink className="w-3 h-3" />
                        {proof.verifyLabel?.[lang] || 'Verify'}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className={`py-3 bg-navy-50 border-b border-navy-100 ${className}`} aria-label={lang === 'en' ? 'Security and privacy' : 'Seguridad y privacidad'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 text-xs text-navy-400 font-medium">
          {TRUST_PROOFS.map((proof) => {
            const Icon = proof.icon;
            const isExpanded = expandedProof === proof.key;
            return (
              <div key={proof.key} className={`relative ${proof.key !== 'encryption' ? 'hidden sm:block' : ''}`}>
                <button
                  ref={isExpanded ? triggerRef : undefined}
                  onClick={() => setExpandedProof(isExpanded ? null : proof.key)}
                  className="flex items-center gap-1.5 hover:text-teal-600 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`proof-popup-${proof.key}`}
                  aria-haspopup="dialog"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{proof.shortLabel[lang]}</span>
                </button>
                {isExpanded && (
                  <div
                    ref={popupRef}
                    id={`proof-popup-${proof.key}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={`proof-title-${proof.key}`}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border border-navy-200 rounded-xl shadow-xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span id={`proof-title-${proof.key}`} className="text-sm font-semibold text-navy-900">{proof.label[lang]}</span>
                      <button
                        onClick={closePopup}
                        className="text-navy-400 hover:text-navy-600 p-0.5 rounded"
                        aria-label={lang === 'en' ? 'Close' : 'Cerrar'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {proof.proof[lang].map((item, idx) => (
                        <li key={idx} className="text-xs text-navy-600 flex items-start gap-1.5">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    {proof.statusNote && (
                      <p className="text-[10px] text-navy-400 mt-2 italic">{proof.statusNote[lang]}</p>
                    )}
                    {proof.registryKeys.length > 0 && (() => {
                      const scopes = proof.registryKeys.map(k => getClaimEntry(k)?.scope).filter(Boolean);
                      if (scopes.length === 0) return null;
                      return (
                        <p className="text-[10px] text-navy-400 mt-1.5 border-t border-navy-100 pt-1.5">
                          <span className="font-medium">{lang === 'en' ? 'Scope: ' : 'Alcance: '}</span>
                          {scopes.join('; ')}
                        </p>
                      );
                    })()}
                    {proof.verifyLink && (
                      <Link to={proof.verifyLink} className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 mt-2 font-medium">
                        <ExternalLink className="w-3 h-3" />
                        {proof.verifyLabel?.[lang] || 'Verify'}
                      </Link>
                    )}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-navy-200 rotate-45" />
                  </div>
                )}
              </div>
            );
          })}
          <Link to="/trust-center" className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 transition-colors">
            <span>{lang === 'en' ? 'Trust Center' : 'Centro de Confianza'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}
