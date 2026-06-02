import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Copy, Check, Share2, MessageCircle, Facebook,
  MapPin, FileText, Image, Globe, ArrowRight, CheckCircle,
  Shield, Users, Megaphone, QrCode, Printer, Loader2,
  Download, BookOpen, Presentation, FileCode, Lock
} from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { getReadinessLabel, type PartnerAsset } from '../services/asset-service';

interface SocialTemplate {
  id: string;
  platform: string;
  icon_name: string;
  color: string;
  label_en: string;
  label_es: string;
  text_en: string;
  text_es: string;
  display_order: number;
}

const ICON_MAP: Record<string, typeof MessageCircle> = {
  MessageCircle,
  Facebook,
  MapPin,
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  pptx: Presentation,
  docx: BookOpen,
  html: FileCode,
  zip: Download,
  'community-flyer': BookOpen,
};

const FLYER_CONTENT = {
  en: {
    headline: 'Free Legal Help - Available 24/7',
    subheadline: 'Get answers to your legal questions in plain English',
    bullets: [
      'Housing: Evictions, lease disputes, repairs',
      'Employment: Unpaid wages, discrimination, wrongful termination',
      'Immigration: Know your rights regardless of status',
      'Family: Custody, divorce, child support',
      'Criminal: Your rights, defense options',
    ],
    footer: 'Visit ezlegal.ai or scan the QR code',
    disclaimer: 'Legal information, not legal advice. Consult a licensed attorney for specific counsel.',
  },
  es: {
    headline: 'Ayuda Legal Gratis - Disponible 24/7',
    subheadline: 'Obtien respuestas a tus preguntas legales en español simple',
    bullets: [
      'Vivienda: Desalojos, disputas de renta, reparaciones',
      'Trabajo: Salarios impagados, discriminacion, despido injusto',
      'Inmigracion: Conoce tus derechos sin importar tu estatus',
      'Familia: Custodia, divorcio, manutencion',
      'Criminal: Tus derechos, opciones de defensa',
    ],
    footer: 'Visita ezlegal.ai o escanea el codigo QR',
    disclaimer: 'Información legal, no asesoria legal. Consulte a un abogado licenciado para asesoramiento especifico.',
  },
};

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-navy-100 text-navy-700 hover:bg-navy-200'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied' : (label || 'Copy')}
    </button>
  );
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF',
    pptx: 'Presentation',
    docx: 'Document',
    html: 'HTML Template',
    zip: 'Archive',
    'community-flyer': 'Community Flyer',
  };
  return labels[type] || type.toUpperCase();
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-700',
    pptx: 'bg-amber-100 text-amber-700',
    docx: 'bg-blue-100 text-blue-700',
    html: 'bg-green-100 text-green-700',
    zip: 'bg-navy-100 text-navy-700',
    'community-flyer': 'bg-teal-100 text-teal-700',
  };
  return colors[type] || 'bg-navy-100 text-navy-700';
}

export default function MediaKit() {
  const { language } = useLanguage();
  const es = language === 'es';
  const [activeTab, setActiveTab] = useState<'social' | 'flyer' | 'assets'>('social');
  const [templates, setTemplates] = useState<SocialTemplate[]>([]);
  const [partnerAssets, setPartnerAssets] = useState<PartnerAsset[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);

  useEffect(() => {
    loadTemplates();
    loadPartnerAssets();
  }, []);

  const loadTemplates = async () => {
    const { data } = await supabase
      .from('social_media_templates')
      .select('*')
      .eq('is_active', true)
      .order('display_order');
    setTemplates((data || []) as SocialTemplate[]);
    setLoadingTemplates(false);
  };

  const loadPartnerAssets = async () => {
    const { data: assets } = await supabase
      .from('partner_assets')
      .select('*')
      .eq('is_active', true)
      .order('pinned', { ascending: false })
      .order('recommended', { ascending: false })
      .order('updated_at', { ascending: false });

    if (assets) {
      const { data: readinessData } = await supabase
        .from('asset_readiness')
        .select('*')
        .in('asset_id', assets.map(a => a.id));

      const readinessMap = new Map<string, PartnerAsset['readiness']>();
      (readinessData || []).forEach(r => readinessMap.set(r.asset_id, r as PartnerAsset['readiness']));

      setPartnerAssets(assets.map(a => ({
        ...a,
        content_sections: a.content_sections || [],
        jurisdictions: a.jurisdictions || [],
        pipeline_stages: a.pipeline_stages || [],
        readiness: readinessMap.get(a.id) || null,
        download_count: 0,
      })) as PartnerAsset[]);
    }
    setLoadingAssets(false);
  };

  const flyer = es ? FLYER_CONTENT.es : FLYER_CONTENT.en;

  const communityFlyers = partnerAssets.filter(a => a.asset_type === 'community-flyer');
  const otherAssets = partnerAssets.filter(a => a.asset_type !== 'community-flyer');

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full mb-6">
                <Share2 className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-medium text-teal-300">
                  {es ? 'Kit de Medios para Aliados' : 'Partner Media Kit'}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {es
                  ? 'Comparte ezLegal con tu Comunidad'
                  : 'Share ezLegal With Your Community'}
              </h1>
              <p className="text-lg text-navy-200 mb-8 leading-relaxed">
                {es
                  ? 'Plantillas de posts, contenido para volantes y activos de marca listos para usar en inglés y español. Copie, pegue y comparta.'
                  : 'Ready-to-use social posts, flyer content, and brand assets in English and Spanish. Copy, paste, and share.'}
              </p>
              <Link
                to="/partner-hub"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all"
              >
                {es ? 'Convertirse en Aliado' : 'Become a Partner'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-4 bg-white border-b border-navy-200 sticky top-20 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'social' as const, icon: Megaphone, en: 'Social Media Posts', es: 'Posts para Redes Sociales' },
                { id: 'flyer' as const, icon: Printer, en: 'Flyer Content', es: 'Contenido para Volantes' },
                { id: 'assets' as const, icon: Image, en: 'Partner Assets', es: 'Activos para Aliados', count: partnerAssets.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-navy-50 text-navy-700 hover:bg-navy-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {es ? tab.es : tab.en}
                  {'count' in tab && (tab.count ?? 0) > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-navy-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {activeTab === 'social' && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">
                  {es ? 'Plantillas de Posts para Redes Sociales' : 'Social Media Post Templates'}
                </h2>
                <p className="text-navy-600">
                  {es
                    ? 'Copie estos mensajes pre-escritos y publiquelos en sus canales. Disponibles en inglés y español.'
                    : 'Copy these pre-written messages and post them to your channels. Available in English and Spanish.'}
                </p>
              </div>

              {loadingTemplates ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  {templates.map(template => {
                    const Icon = ICON_MAP[template.icon_name] || MessageCircle;
                    const label = es ? template.label_es : template.label_en;
                    const text = es ? template.text_es : template.text_en;
                    const otherText = es ? template.text_en : template.text_es;
                    return (
                      <div key={template.id} className="bg-white rounded-2xl border border-navy-200 overflow-hidden">
                        <div className={`${template.color} px-5 py-3 flex items-center gap-2`}>
                          <Icon className="w-5 h-5 text-white" />
                          <span className="text-white font-semibold text-sm">{label}</span>
                        </div>
                        <div className="p-5">
                          <div className="bg-navy-50 rounded-xl p-4 mb-4">
                            <p className="text-sm text-navy-800 whitespace-pre-wrap leading-relaxed">{text}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <CopyButton text={text} />
                            <button
                              onClick={() => navigator.clipboard.writeText(otherText)}
                              className="text-xs text-navy-500 hover:text-navy-700 underline transition-colors"
                            >
                              {es ? 'Copy in English' : 'Copiar en Español'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm mb-1">
                      {es ? 'Recordatorio de Cumplimiento' : 'Compliance Reminder'}
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      {es
                        ? 'Siempre incluya la aclaracion de que ezLegal.ai proporciona información legal, no asesoria legal. Nunca haga afirmaciones sobre resultados garantizados. No modifique los mensajes para implicar una relacion abogado-cliente.'
                        : 'Always include the disclaimer that ezLegal.ai provides legal information, not legal advice. Never make claims about guaranteed outcomes. Do not modify messages to imply an attorney-client relationship.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'flyer' && (
          <section className="py-12 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">
                  {es ? 'Contenido para Volantes Impresos' : 'Printable Flyer Content'}
                </h2>
                <p className="text-navy-600">
                  {es
                    ? 'Use este contenido para crear volantes para bibliotecas, iglesias, centros comunitarios y tableros de anuncios.'
                    : 'Use this content to create flyers for libraries, churches, community centers, and bulletin boards.'}
                </p>
              </div>

              <div className="bg-white rounded-2xl border-2 border-navy-200 overflow-hidden shadow-lg">
                <div className="bg-teal-600 p-8 text-white text-center">
                  <p className="text-3xl font-bold mb-2">{flyer.headline}</p>
                  <p className="text-lg text-teal-100">{flyer.subheadline}</p>
                </div>
                <div className="p-8">
                  <div className="space-y-3 mb-8">
                    {flyer.bullets.map(bullet => (
                      <div key={bullet} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-navy-800 font-medium">{bullet}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-navy-50 rounded-xl p-6 text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Globe className="w-5 h-5 text-teal-600" />
                      <p className="text-lg font-bold text-navy-900">ezlegal.ai</p>
                    </div>
                    <div className="w-32 h-32 bg-navy-200 rounded-xl mx-auto flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-navy-400" />
                    </div>
                    <p className="text-sm text-navy-600 mt-3">{flyer.footer}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-navy-500">
                    <Shield className="w-4 h-4 text-navy-400 flex-shrink-0" />
                    <p>{flyer.disclaimer}</p>
                  </div>
                </div>
                <div className="border-t border-navy-200 px-6 py-4 bg-navy-50 flex items-center justify-between">
                  <CopyButton text={`${flyer.headline}\n\n${flyer.subheadline}\n\n${flyer.bullets.map(b => `- ${b}`).join('\n')}\n\n${flyer.footer}\n\n${flyer.disclaimer}`} />
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-500 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {es ? 'Imprimir' : 'Print'}
                  </button>
                </div>
              </div>

              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <QrCode className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm mb-1">
                      {es ? 'Codigos QR Personalizados' : 'Custom QR Codes'}
                    </p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {es
                        ? 'Los aliados reciben codigos QR personalizados con seguimiento integrado. Contacte partners@ezlegal.ai para solicitar el suyo.'
                        : 'Partners receive custom QR codes with built-in tracking. Contact partners@ezlegal.ai to request yours.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'assets' && (
          <section className="py-12 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-900 mb-2">
                  {es ? 'Activos para Aliados' : 'Partner Assets'}
                </h2>
                <p className="text-navy-600">
                  {es
                    ? 'Todos los recursos disponibles para aliados: guias, volantes comunitarios, plantillas y materiales de marca.'
                    : 'All resources available to partners: guides, community flyers, templates, and brand materials.'}
                </p>
              </div>

              {loadingAssets ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              ) : (
                <>
                  {communityFlyers.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                        <h3 className="text-lg font-bold text-navy-900">
                          {es ? 'Volantes Comunitarios de Derechos Legales' : 'Community Legal Rights Flyers'}
                        </h3>
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                          {communityFlyers.length}
                        </span>
                      </div>
                      <p className="text-sm text-navy-500 mb-4">
                        {es
                          ? 'Volantes bilingues listos para imprimir sobre temas legales clave para distribuciones comunitarias.'
                          : 'Bilingual print-ready flyers covering key legal topics for community distribution.'}
                      </p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {communityFlyers.map(asset => {
                          const Icon = TYPE_ICONS[asset.asset_type] || FileText;
                          const readinessText = asset.readiness ? getReadinessLabel(asset.readiness) : '';
                          const isReady = readinessText.includes('Ready');
                          return (
                            <div
                              key={asset.id}
                              className="bg-white rounded-xl border border-navy-200 p-5 hover:shadow-md hover:border-teal-300 transition-all group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                                  <Icon className="w-5 h-5 text-teal-600" />
                                </div>
                                {isReady && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                    {readinessText}
                                  </span>
                                )}
                              </div>
                              <h4 className="font-semibold text-navy-900 text-sm mb-1">{asset.name}</h4>
                              <p className="text-xs text-navy-500 mb-3 line-clamp-2">{asset.description}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(asset.asset_type)}`}>
                                  {getTypeLabel(asset.asset_type)}
                                </span>
                                <span className="text-xs text-navy-400">{asset.file_size}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {otherAssets.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-navy-600" />
                        <h3 className="text-lg font-bold text-navy-900">
                          {es ? 'Materiales de Marketing y Marca' : 'Marketing & Brand Materials'}
                        </h3>
                        <span className="text-xs bg-navy-100 text-navy-600 px-2 py-0.5 rounded-full font-medium">
                          {otherAssets.length}
                        </span>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {otherAssets.map(asset => {
                          const Icon = TYPE_ICONS[asset.asset_type] || FileText;
                          const readinessText = asset.readiness ? getReadinessLabel(asset.readiness) : '';
                          const isReady = readinessText.includes('Ready');
                          return (
                            <div
                              key={asset.id}
                              className="bg-navy-50 rounded-xl p-5 border border-navy-100 hover:shadow-md hover:border-navy-300 transition-all group"
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-navy-200 flex-shrink-0 group-hover:border-teal-300 transition-colors">
                                  <Icon className="w-6 h-6 text-navy-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-navy-900 mb-1">{asset.name}</h4>
                                  <p className="text-xs text-navy-500 mb-2 line-clamp-2">{asset.description}</p>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(asset.asset_type)}`}>
                                      {getTypeLabel(asset.asset_type)}
                                    </span>
                                    <span className="text-xs text-navy-400">{asset.file_size}</span>
                                    {isReady && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        {readinessText}
                                      </span>
                                    )}
                                    {asset.recommended && (
                                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                        {es ? 'Recomendado' : 'Recommended'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-200 p-8 text-center">
                    <Lock className="w-10 h-10 text-teal-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-navy-900 mb-2">
                      {es ? 'Descargue Todos los Activos' : 'Download All Assets'}
                    </h3>
                    <p className="text-navy-600 mb-6 max-w-md mx-auto">
                      {es
                        ? 'Registrese como aliado para descargar materiales completos, codigos QR personalizados y construir su propio kit de aliado.'
                        : 'Register as a partner to download full materials, get custom QR codes, and build your own partner kit.'}
                    </p>
                    <Link
                      to="/partner-hub#apply"
                      className="inline-flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-500 transition-all"
                    >
                      {es ? 'Solicitar Alianza' : 'Apply to Partner'}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <section className="py-12 bg-navy-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 text-center">
              {es ? 'Donde Distribuir' : 'Where to Distribute'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { en: 'Community Centers', es: 'Centros Comunitarios', icon: Users },
                { en: 'Churches & Temples', es: 'Iglesias y Templos', icon: Shield },
                { en: 'ESL Programs', es: 'Programas de ESL', icon: Globe },
                { en: 'Libraries', es: 'Bibliotecas', icon: FileText },
                { en: 'Consulate Boards', es: 'Tableros de Consulados', icon: Globe },
                { en: 'Legal Aid Offices', es: 'Oficinas de Asistencia Legal', icon: Shield },
                { en: 'Laundromats', es: 'Lavanderias', icon: MapPin },
                { en: 'Grocery Stores', es: 'Tiendas de Abarrotes', icon: MapPin },
              ].map(loc => (
                <div key={loc.en} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-navy-100">
                  <loc.icon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-navy-800">{es ? loc.es : loc.en}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
