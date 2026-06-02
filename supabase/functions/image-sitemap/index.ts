import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function xmlEscape(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_ANON_KEY')!;
    const sb = createClient(url, key);

    const siteOrigin = new URL(req.url).searchParams.get('origin') || 'https://ezlegal.ai';

    const { data, error } = await sb
      .from('image_catalog')
      .select('slug, file_path, page_url, alt_en, caption, license, geo_location, in_sitemap, is_public')
      .eq('in_sitemap', true)
      .eq('is_public', true);

    if (error) throw error;

    const byPage = new Map<string, typeof data>();
    for (const row of data ?? []) {
      const page = row.page_url || '/';
      if (!byPage.has(page)) byPage.set(page, []);
      byPage.get(page)!.push(row);
    }

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
    for (const [page, images] of byPage) {
      xml += '  <url>\n';
      xml += `    <loc>${xmlEscape(siteOrigin + page)}</loc>\n`;
      for (const img of images) {
        const loc = img.file_path.startsWith('http') ? img.file_path : siteOrigin + img.file_path;
        xml += '    <image:image>\n';
        xml += `      <image:loc>${xmlEscape(loc)}</image:loc>\n`;
        if (img.caption) xml += `      <image:caption>${xmlEscape(img.caption)}</image:caption>\n`;
        if (img.alt_en) xml += `      <image:title>${xmlEscape(img.alt_en)}</image:title>\n`;
        if (img.geo_location) xml += `      <image:geo_location>${xmlEscape(img.geo_location)}</image:geo_location>\n`;
        if (img.license) xml += `      <image:license>${xmlEscape(img.license)}</image:license>\n`;
        xml += '    </image:image>\n';
      }
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
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
