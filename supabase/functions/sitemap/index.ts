import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const ROUTES: { path: string; priority: number; changefreq: string }[] = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/for-individuals', priority: 0.9, changefreq: 'weekly' },
  { path: '/for-business', priority: 0.9, changefreq: 'weekly' },
  { path: '/for-organizations', priority: 0.9, changefreq: 'weekly' },
  { path: '/for-partners', priority: 0.9, changefreq: 'weekly' },
  { path: '/pricing', priority: 0.9, changefreq: 'weekly' },
  { path: '/trust-center', priority: 0.8, changefreq: 'monthly' },
  { path: '/case-predictor', priority: 0.8, changefreq: 'monthly' },
  { path: '/case-predictor/start', priority: 0.6, changefreq: 'monthly' },
  { path: '/negotiate', priority: 0.8, changefreq: 'monthly' },
  { path: '/ezreads', priority: 0.8, changefreq: 'weekly' },
  { path: '/emergency-resources', priority: 0.9, changefreq: 'monthly' },
  { path: '/how-it-works', priority: 0.7, changefreq: 'monthly' },
  { path: '/features', priority: 0.7, changefreq: 'monthly' },
  { path: '/about', priority: 0.6, changefreq: 'monthly' },
  { path: '/contact', priority: 0.6, changefreq: 'monthly' },
  { path: '/accessibility-statement', priority: 0.4, changefreq: 'yearly' },
  { path: '/privacy-policy', priority: 0.4, changefreq: 'yearly' },
  { path: '/terms-of-service', priority: 0.4, changefreq: 'yearly' },
  { path: '/sla', priority: 0.4, changefreq: 'yearly' },
  { path: '/scope-disclaimers', priority: 0.4, changefreq: 'yearly' },
  { path: '/security-faq', priority: 0.5, changefreq: 'monthly' },
  { path: '/privacy-faq', priority: 0.5, changefreq: 'monthly' },
  { path: '/enterprise-security', priority: 0.5, changefreq: 'monthly' },
  { path: '/how-reports-are-reviewed', priority: 0.5, changefreq: 'monthly' },
  { path: '/schedule-demo', priority: 0.6, changefreq: 'monthly' },
  { path: '/pro-bono', priority: 0.7, changefreq: 'monthly' },
  { path: '/espanol', priority: 0.9, changefreq: 'weekly' },
  { path: '/media-kit', priority: 0.5, changefreq: 'monthly' },
  { path: '/partner-hub', priority: 0.6, changefreq: 'monthly' },
  { path: '/lawyer-profiles', priority: 0.8, changefreq: 'weekly' },
  { path: '/issue-packs', priority: 0.7, changefreq: 'monthly' },
];

function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_ANON_KEY')!;
    const sb = createClient(url, key);

    const origin = new URL(req.url).searchParams.get('origin') || 'https://ezlegal.ai';
    const now = new Date().toISOString().slice(0, 10);

    const entries: { loc: string; lastmod: string; priority: number; changefreq: string }[] = [];

    for (const r of ROUTES) {
      entries.push({ loc: `${origin}${r.path}`, lastmod: now, priority: r.priority, changefreq: r.changefreq });
    }

    const { data: articles } = await sb
      .from('ezreads_articles')
      .select('slug, updated_at, published_at')
      .eq('is_published', true);

    for (const a of articles ?? []) {
      entries.push({
        loc: `${origin}/ezreads/${a.slug}`,
        lastmod: (a.updated_at || a.published_at || new Date().toISOString()).slice(0, 10),
        priority: 0.6,
        changefreq: 'monthly',
      });
    }

    const { data: lawyers } = await sb
      .from('lawyer_profiles')
      .select('slug, updated_at')
      .eq('is_public', true);

    for (const l of lawyers ?? []) {
      if (!l.slug) continue;
      entries.push({
        loc: `${origin}/lawyer-profiles/${l.slug}`,
        lastmod: (l.updated_at || new Date().toISOString()).slice(0, 10),
        priority: 0.5,
        changefreq: 'monthly',
      });
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    for (const e of entries) {
      xml += '  <url>\n';
      xml += `    <loc>${xmlEscape(e.loc)}</loc>\n`;
      xml += `    <lastmod>${e.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${e.changefreq}</changefreq>\n`;
      xml += `    <priority>${e.priority.toFixed(1)}</priority>\n`;
      xml += '  </url>\n';
    }
    xml += '</urlset>\n';

    return new Response(xml, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response(
      `<?xml version="1.0"?><error>${xmlEscape(String(err))}</error>`,
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/xml' } },
    );
  }
});
