import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle, Shield, Globe, Scale } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface CoBrandedPage {
  id: string;
  partner_id: string;
  slug: string;
  page_title: string;
  hero_heading: string;
  hero_subheading: string;
  partner_logo_url: string;
  primary_color: string;
  cta_text: string;
  cta_link: string;
  content: Array<{ type: string; heading?: string; body?: string; items?: string[] }>;
  language: string;
}

interface PartnerInfo {
  organization_name: string;
  partner_type: string;
}

export default function PartnerLanding() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const es = language === 'es';
  const [page, setPage] = useState<CoBrandedPage | null>(null);
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPage(slug);
      trackView(slug);
    }
  }, [slug]);

  const fetchPage = async (pageSlug: string) => {
    const { data, error } = await supabase
      .from('partner_co_branded_pages')
      .select('*, partners(organization_name, partner_type)')
      .eq('slug', pageSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setPage(data);
    if (data.partners) {
      setPartner(data.partners as unknown as PartnerInfo);
    }
    setLoading(false);
  };

  const trackView = async (pageSlug: string) => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      await supabase.from('partner_referrals').update({
        metadata: { last_visited: new Date().toISOString() },
      }).eq('referral_code', refCode);
    }

    await supabase.from('partner_co_branded_pages')
      .update({ view_count: (page?.view_count || 0) + 1 })
      .eq('slug', pageSlug);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen flex items-center justify-center bg-navy-50">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !page) {
    return (
      <>
        <Navigation />
        <main className="pt-24 min-h-screen flex items-center justify-center bg-navy-50">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold text-navy-900 mb-4">
              {es ? 'Página no encontrada' : 'Page Not Found'}
            </h1>
            <p className="text-navy-600 mb-6">
              {es
                ? 'Esta página de alianza no existe o ya no esta activa.'
                : 'This partner page does not exist or is no longer active.'}
            </p>
            <Link to="/partner-hub" className="text-teal-600 hover:text-teal-500 font-semibold">
              {es ? 'Ver nuestro programa de alianzas' : 'View our partner program'}
              <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main id="main-content" className="pt-20">
        <section
          className="py-24 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${page.primary_color}15, ${page.primary_color}05)` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
              {page.partner_logo_url && (
                <img src={page.partner_logo_url} alt={partner?.organization_name || ''} className="h-10 object-contain" />
              )}
              <div className="flex items-center gap-2 text-navy-500">
                <span className="text-sm">+</span>
                <div className="flex items-center gap-1.5">
                  <Scale className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-semibold text-navy-700">ezLegal.ai</span>
                </div>
              </div>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-6 leading-tight">
                {page.hero_heading}
              </h1>
              {page.hero_subheading && (
                <p className="text-xl text-navy-600 mb-8 leading-relaxed">
                  {page.hero_subheading}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={page.cta_link}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-all shadow-lg"
                  style={{ backgroundColor: page.primary_color }}
                >
                  {page.cta_text}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {page.content && Array.isArray(page.content) && page.content.map((block, idx) => (
          <section key={idx} className={`py-16 ${idx % 2 === 0 ? 'bg-white' : 'bg-navy-50'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {block.heading && (
                <h2 className="text-2xl font-bold text-navy-900 mb-4">{block.heading}</h2>
              )}
              {block.body && (
                <p className="text-navy-600 mb-6 leading-relaxed max-w-3xl">{block.body}</p>
              )}
              {block.items && (
                <ul className="grid md:grid-cols-2 gap-3">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-navy-700">
                      <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        <section className="py-12 bg-navy-100 border-t border-navy-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { icon: Shield, text: es ? 'Cifrado AES-256' : 'AES-256 Encryption' },
                { icon: Globe, text: es ? 'Bilingue EN/ES' : 'Bilingual EN/ES' },
                { icon: CheckCircle, text: es ? 'Cumplimiento SOC 2' : 'SOC 2 Compliant' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-sm text-navy-600">
                  <badge.icon className="w-4 h-4 text-teal-600" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-navy-500 mt-6">
              {es
                ? 'ezLegal.ai proporciona información legal, no asesoramiento legal. Consulte a un abogado licenciado para asesoramiento legal.'
                : 'ezLegal.ai provides legal information, not legal advice. Consult a licensed attorney for legal advice.'}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
