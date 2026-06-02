import { useState, useEffect } from 'react';
import {
  Scale, Users, Zap, Building2, ArrowRight, Globe, Shield,
  Award, Lock, CheckCircle, Phone, Mail, FileText,
  Paintbrush, Type, Image, Heart, AlertTriangle,
  Smartphone, ExternalLink, ShieldCheck
} from 'lucide-react';
import { generateQRDataURL } from '../../lib/qr-generator';

export function OnePagerPreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d4a] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-tight">ezLegal.ai</p>
            <p className="text-teal-300 text-[10px] font-medium">Partner Program</p>
          </div>
        </div>
        <p className="text-teal-400 text-[10px] font-semibold uppercase tracking-widest">One-Pager</p>
      </div>

      <div className="px-6 py-4 bg-gradient-to-b from-teal-50 to-white border-b border-navy-100">
        <h2 className="text-navy-900 font-bold text-base leading-tight">
          Bring AI-Powered Legal Information to Your Community
        </h2>
        <p className="text-navy-500 text-[11px] mt-1 leading-relaxed">
          80% of low-income Americans cannot afford legal representation (LSC Justice Gap Report, 2022). ezLegal.ai bridges this gap with 24/7 bilingual AI legal information.
        </p>
      </div>

      <div className="px-6 py-3 grid grid-cols-4 gap-3 border-b border-navy-100 bg-navy-50/50">
        {[
          { num: '50', label: 'States' },
          { num: '24/7', label: 'Available' },
          { num: '99.9%', label: 'Target Uptime' },
          { num: '2', label: 'Languages' },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <p className="text-teal-600 font-bold text-lg leading-none">{s.num}</p>
            <p className="text-navy-400 text-[9px] mt-0.5 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="px-6 py-4">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Partnership Tiers</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'Legal Aid', price: 'Free', icon: Heart, color: 'bg-green-100 text-green-600' },
            { name: 'Pro', price: '$79/mo', icon: Zap, color: 'bg-teal-100 text-teal-600' },
            { name: 'Developer', price: '$0.02/q', icon: FileText, color: 'bg-blue-100 text-blue-600' },
            { name: 'Enterprise', price: 'Custom', icon: Building2, color: 'bg-navy-100 text-navy-600' },
          ].map((t, i) => (
            <div key={i} className="rounded-lg border border-navy-200 p-2 text-center">
              <div className={`w-6 h-6 ${t.color} rounded-md flex items-center justify-center mx-auto mb-1`}>
                <t.icon className="w-3 h-3" />
              </div>
              <p className="text-navy-900 font-bold text-[10px]">{t.name}</p>
              <p className="text-teal-600 font-semibold text-[9px]">{t.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-navy-100">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">How It Works</p>
        <div className="flex items-center justify-between">
          {['Apply', 'Discovery', 'Pilot', 'Onboard', 'Go Live'].map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white text-[8px] font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-[9px] font-medium text-navy-700">{step}</span>
              </div>
              {i < 4 && <ArrowRight className="w-3 h-3 text-navy-300 ml-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 bg-teal-600 flex items-center justify-between">
        <p className="text-white font-bold text-xs">Ready to partner?</p>
        <div className="flex items-center gap-3">
          <span className="text-teal-100 text-[10px] flex items-center gap-1"><Mail className="w-3 h-3" /> partners@ezlegal.ai</span>
          <span className="bg-white text-teal-700 px-3 py-1 rounded text-[10px] font-bold">Apply Now</span>
        </div>
      </div>

      <div className="px-6 py-2 bg-navy-50 border-t border-navy-100">
        <p className="text-[8px] text-navy-400 text-center">
          ezLegal.ai provides legal information, not legal advice. Not a law firm. Copyright 2026 ezLegal.ai.
        </p>
      </div>
    </div>
  );
}

export function BrandGuidelinesPreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-[#0A1628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-teal-400" />
          <span className="text-white font-bold text-sm">ezLegal.ai</span>
        </div>
        <p className="text-navy-400 text-[10px] font-semibold uppercase tracking-widest">Brand Guidelines</p>
      </div>

      <div className="p-6">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">Logo Variants</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-white border border-navy-200 rounded-lg p-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-navy-900 text-xs">ezLegal<span className="text-teal-600">.ai</span></span>
            </div>
            <p className="text-[8px] text-navy-400">Primary</p>
          </div>
          <div className="bg-[#0A1628] border border-navy-700 rounded-lg p-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Scale className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-white text-xs">ezLegal<span className="text-teal-400">.ai</span></span>
            </div>
            <p className="text-[8px] text-navy-500">Reversed</p>
          </div>
          <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 flex flex-col items-center gap-2">
            <Scale className="w-8 h-8 text-teal-600" />
            <p className="text-[8px] text-navy-400">Icon Only</p>
          </div>
        </div>

        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">Color Palette</p>
        <div className="grid grid-cols-8 gap-1.5 mb-5">
          {[
            { color: '#0A1628', name: 'Navy 900' },
            { color: '#1E293B', name: 'Navy 700' },
            { color: '#64748B', name: 'Navy 400' },
            { color: '#0D9488', name: 'Teal 600' },
            { color: '#2DD4BF', name: 'Teal 400' },
            { color: '#16A34A', name: 'Green 600' },
            { color: '#D97706', name: 'Amber 600' },
            { color: '#DC2626', name: 'Red 600' },
          ].map((c, i) => (
            <div key={i} className="text-center">
              <div className="w-full aspect-square rounded-md border border-navy-200" style={{ backgroundColor: c.color }} />
              <p className="text-[7px] text-navy-500 mt-1 font-medium">{c.name}</p>
            </div>
          ))}
        </div>

        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">Typography</p>
        <div className="bg-navy-50 rounded-lg p-4 mb-5 space-y-2">
          <p className="font-bold text-navy-900 text-lg leading-none">Inter Bold -- Headings</p>
          <p className="font-semibold text-navy-700 text-sm leading-none">Inter Semibold -- Subheadings</p>
          <p className="font-normal text-navy-600 text-xs leading-none">Inter Regular -- Body text and paragraphs</p>
          <p className="font-mono text-[10px] text-teal-600 leading-none">JetBrains Mono -- Code samples</p>
        </div>

        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">Voice & Tone</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { yes: 'Empowering', no: 'Patronizing' },
            { yes: 'Clear', no: 'Oversimplified' },
            { yes: 'Warm', no: 'Casual' },
            { yes: 'Honest', no: 'Evasive' },
          ].map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <span className="text-green-600 font-semibold flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />{v.yes}</span>
              <span className="text-navy-300">not</span>
              <span className="text-red-500 font-medium">{v.no}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RealQRCode({ url, size = 80 }: { url: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    generateQRDataURL(url, size * 2).then(setDataUrl);
  }, [url, size]);

  if (!dataUrl) {
    return (
      <div className="w-full h-full bg-navy-100 animate-pulse rounded" />
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code for ${url}`}
      width={size}
      height={size}
      className="rounded"
    />
  );
}

export function SpanishFlyerPreview({ printMode = false, partnerId }: { printMode?: boolean; partnerId?: string }) {
  const refId = partnerId || 'PARTNER_ID';
  const flyerUrl = `https://ezlegal.ai/es?ref=${refId}`;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Scale className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-sm">ezLegal.ai</span>
        </div>
        <h2 className="text-white font-bold text-lg leading-tight">
          Información Legal Gratuita
        </h2>
        <p className="text-teal-100 text-xs mt-1">
          Impulsada por Inteligencia Artificial -- Disponible 24/7
        </p>
        <p className="text-teal-200 text-[10px] mt-2 font-medium flex items-center justify-center gap-1.5">
          <Globe className="w-3 h-3" />
          Disponible en Español e Inglés
        </p>
      </div>

      <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
        <p className="text-amber-900 text-[11px] font-bold flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> El 80% de las personas de bajos ingresos no pueden pagar un abogado
        </p>
        <p className="text-amber-700 text-[8px] mt-0.5 ml-5">
          Fuente: Legal Services Corporation, The Justice Gap Report, 2022
        </p>
      </div>

      <div className="px-6 py-4">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-3">Temas Legales Disponibles</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: '🏠', name: 'Derechos del Inquilino' },
            { icon: '👨‍👩‍👧', name: 'Derecho de Familia' },
            { icon: '💼', name: 'Empleo' },
            { icon: '🌎', name: 'Inmigracion' },
            { icon: '🛡️', name: 'Derechos del Consumidor' },
            { icon: '⚖️', name: 'Reclamos Menores' },
          ].map((t, i) => (
            <div key={i} className="bg-navy-50 rounded-lg p-2.5 text-center">
              <span className="text-lg">{t.icon}</span>
              <p className="text-[9px] font-semibold text-navy-700 mt-1">{t.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-3 border-t border-navy-100">
        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Como Funciona</p>
        <div className="space-y-1.5">
          {[
            'Visite ezlegal.ai o el sitio de su organizacion',
            'Escriba su pregunta legal en español',
            'Reciba una respuesta inmediata con referencias legales',
            'Conectese con un abogado si necesita mas ayuda',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-[10px] text-navy-700">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-navy-100 bg-teal-50">
        <p className="text-[9px] font-bold text-teal-700 uppercase tracking-wider mb-3">Empiece Ahora</p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-lg border-2 border-teal-200 flex items-center justify-center flex-shrink-0 p-1">
            <RealQRCode url={flyerUrl} size={72} />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
              <p className="text-[10px] font-bold text-navy-800">
                Escanea para empezar (toma 2 minutos)
              </p>
            </div>
            {printMode ? (
              <p className="text-[10px] text-navy-600 font-medium">
                ezlegal.ai/es?ref=<span className="text-teal-600">{refId}</span>
              </p>
            ) : (
              <p className="text-[10px] text-teal-600 font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                ezlegal.ai/es?ref={refId}
              </p>
            )}
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-navy-500 flex items-center gap-1">
                <Phone className="w-3 h-3" /> WhatsApp: +1 (XXX) XXX-XXXX
              </span>
            </div>
            <p className="text-[8px] text-navy-400">
              Referencia de socio incluida automaticamente para seguimiento
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-teal-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-xs">GRATIS para organizaciones 501(c)(3)</p>
            <p className="text-teal-100 text-[10px]">Solicite alianza: ezlegal.ai/partners</p>
          </div>
          <div className="text-right">
            <p className="text-teal-100 text-[10px] flex items-center gap-1"><Mail className="w-3 h-3" /> partners@ezlegal.ai</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-navy-800 border-t border-navy-700">
        <div className="flex items-start gap-2 mb-2">
          <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[9px] text-white font-bold">AVISO LEGAL IMPORTANTE</p>
            <p className="text-[8px] text-navy-300 leading-relaxed mt-0.5">
              Información legal, no asesoramiento legal. No somos un bufete de abogados.
              El uso de ezLegal.ai no crea una relacion abogado-cliente.
              En emergencias, llame al 911 o a la Linea Nacional contra la Violencia Domestica: 1-800-799-7233 (en español).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 ml-5">
          <ShieldCheck className="w-3 h-3 text-teal-400" />
          <p className="text-[8px] text-navy-400">
            Como protegemos tu información: ezlegal.ai/privacidad
          </p>
        </div>
      </div>
    </div>
  );
}

export function LogoPackPreview() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-navy-200" style={{ maxWidth: 680 }}>
      <div className="bg-[#0A1628] px-6 py-3 flex items-center justify-between">
        <p className="text-white font-bold text-sm">ezLegal Logo Pack</p>
        <span className="text-[10px] px-2 py-0.5 bg-green-600 text-white rounded font-bold">SVG + PNG</span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-[8px] font-bold text-navy-400 uppercase tracking-wider mb-2">Light Backgrounds</p>
            <div className="bg-white border-2 border-navy-200 rounded-lg p-5 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Scale className="w-7 h-7 text-teal-600" />
                <span className="font-bold text-navy-900 text-base">ezLegal<span className="text-teal-600">.ai</span></span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[8px] font-bold text-navy-400 uppercase tracking-wider mb-2">Dark Backgrounds</p>
            <div className="bg-[#0A1628] border-2 border-navy-700 rounded-lg p-5 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Scale className="w-7 h-7 text-teal-400" />
                <span className="font-bold text-white text-base">ezLegal<span className="text-teal-400">.ai</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <div className="text-center">
            <div className="bg-navy-50 rounded-lg p-3 flex items-center justify-center aspect-square">
              <Scale className="w-8 h-8 text-teal-600" />
            </div>
            <p className="text-[8px] text-navy-500 mt-1">Icon Mark</p>
          </div>
          <div className="text-center">
            <div className="bg-navy-50 rounded-lg p-3 flex items-center justify-center aspect-square">
              <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-[8px] text-navy-500 mt-1">Favicon</p>
          </div>
          <div className="text-center">
            <div className="bg-navy-50 rounded-lg p-2 flex items-center justify-center aspect-square">
              <div className="bg-white border border-navy-200 rounded px-2 py-1 flex items-center gap-1">
                <span className="text-[7px] text-navy-400">Powered by</span>
                <Scale className="w-3 h-3 text-teal-600" />
                <span className="text-[7px] font-bold text-navy-900">ezLegal</span>
              </div>
            </div>
            <p className="text-[8px] text-navy-500 mt-1">Powered By</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-lg p-3 flex items-center justify-center aspect-square">
              <div className="text-center">
                <Scale className="w-6 h-6 text-white mx-auto" />
                <p className="text-white font-bold text-[7px] mt-1">ezLegal.ai</p>
              </div>
            </div>
            <p className="text-[8px] text-navy-500 mt-1">OG Image</p>
          </div>
        </div>

        <p className="text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-2">Co-Branding Layout</p>
        <div className="bg-navy-50 rounded-lg p-4 flex items-center justify-center gap-4">
          <div className="bg-navy-300 rounded px-3 py-2 text-[9px] text-white font-bold">Partner Logo</div>
          <div className="w-px h-8 bg-navy-300" />
          <div className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-navy-900 text-[10px]">ezLegal<span className="text-teal-600">.ai</span></span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { file: 'logo-primary.svg', size: '12 KB' },
            { file: 'logo-primary.png', size: '48 KB' },
            { file: 'logo-reversed.svg', size: '12 KB' },
            { file: 'logo-reversed.png', size: '48 KB' },
            { file: 'icon-only.svg', size: '4 KB' },
            { file: 'favicon.ico', size: '16 KB' },
            { file: 'favicon.svg', size: '3 KB' },
            { file: 'og-image.png', size: '180 KB' },
            { file: 'powered-by.svg', size: '8 KB' },
          ].map((f, i) => (
            <div key={i} className="flex items-center justify-between bg-navy-50 rounded px-2 py-1">
              <span className="text-[8px] text-navy-600 font-medium truncate">{f.file}</span>
              <span className="text-[7px] text-navy-400">{f.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
