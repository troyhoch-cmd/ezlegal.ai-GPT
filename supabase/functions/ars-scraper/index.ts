import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScrapeRequest {
  action: "scrape_title" | "scrape_section" | "embed_pending" | "status";
  title?: string;
  section?: string;
  limit?: number;
}

interface StatuteData {
  source_type: string;
  title_number: string;
  title_name: string;
  chapter?: string;
  chapter_name?: string;
  article?: string;
  section: string;
  section_title: string;
  content: string;
  url: string;
  practice_areas: string[];
  keywords: string[];
}

const ARS_TITLES: Record<string, { name: string; practice_areas: string[] }> = {
  "1": { name: "General Provisions", practice_areas: ["general"] },
  "4": { name: "Alcoholic Beverages", practice_areas: ["business", "criminal"] },
  "6": { name: "Banks and Financial Institutions", practice_areas: ["banking", "business"] },
  "9": { name: "Cities and Towns", practice_areas: ["municipal", "government"] },
  "10": { name: "Corporations and Associations", practice_areas: ["business", "corporate"] },
  "11": { name: "Counties", practice_areas: ["government", "municipal"] },
  "12": { name: "Courts and Civil Proceedings", practice_areas: ["civil_procedure", "litigation"] },
  "13": { name: "Criminal Code", practice_areas: ["criminal"] },
  "14": { name: "Trusts, Estates and Protective Proceedings", practice_areas: ["estate_planning", "probate"] },
  "15": { name: "Education", practice_areas: ["education"] },
  "17": { name: "Game and Fish", practice_areas: ["environmental", "regulatory"] },
  "20": { name: "Insurance", practice_areas: ["insurance", "business"] },
  "23": { name: "Labor", practice_areas: ["employment", "labor"] },
  "25": { name: "Marital and Domestic Relations", practice_areas: ["family"] },
  "28": { name: "Transportation", practice_areas: ["traffic", "transportation"] },
  "29": { name: "Partnership", practice_areas: ["business", "corporate"] },
  "32": { name: "Professions and Occupations", practice_areas: ["licensing", "regulatory"] },
  "33": { name: "Property", practice_areas: ["real_estate", "landlord_tenant", "property"] },
  "34": { name: "Public Buildings and Improvements", practice_areas: ["construction", "government"] },
  "36": { name: "Public Health and Safety", practice_areas: ["health", "safety"] },
  "41": { name: "State Government", practice_areas: ["government", "administrative"] },
  "42": { name: "Taxation", practice_areas: ["tax"] },
  "44": { name: "Trade and Commerce", practice_areas: ["business", "consumer", "contracts"] },
  "46": { name: "Welfare", practice_areas: ["social_services", "benefits"] },
};

const LANDLORD_TENANT_SECTIONS = [
  { section: "33-1301", title: "Short title" },
  { section: "33-1302", title: "Purposes" },
  { section: "33-1303", title: "Supplementary principles of law" },
  { section: "33-1304", title: "Construction" },
  { section: "33-1305", title: "Obligations and rights" },
  { section: "33-1306", title: "Territorial application" },
  { section: "33-1307", title: "Exclusions from application of chapter" },
  { section: "33-1308", title: "Jurisdiction and service of process" },
  { section: "33-1310", title: "General definitions" },
  { section: "33-1311", title: "Notice" },
  { section: "33-1312", title: "Terms and conditions of rental agreement" },
  { section: "33-1313", title: "Effect of unsigned or undelivered rental agreement" },
  { section: "33-1314", title: "Prohibited provisions in rental agreements" },
  { section: "33-1315", title: "Separation of rents and obligations to maintain" },
  { section: "33-1316", title: "Landlord to supply possession of dwelling unit" },
  { section: "33-1317", title: "Wrongful failure to supply possession" },
  { section: "33-1318", title: "Tenant to maintain dwelling unit" },
  { section: "33-1319", title: "Early termination of rental agreement by tenant" },
  { section: "33-1321", title: "Security deposits" },
  { section: "33-1322", title: "Disclosure" },
  { section: "33-1323", title: "Landlord to maintain fit premises" },
  { section: "33-1324", title: "Limitation of liability" },
  { section: "33-1341", title: "Tenant to maintain dwelling unit" },
  { section: "33-1342", title: "Rules and regulations" },
  { section: "33-1343", title: "Access" },
  { section: "33-1344", title: "Tenant to use and occupy" },
  { section: "33-1361", title: "Noncompliance by the landlord" },
  { section: "33-1362", title: "Failure to deliver possession" },
  { section: "33-1363", title: "Self-help for minor defects" },
  { section: "33-1364", title: "Wrongful failure to supply essential services" },
  { section: "33-1365", title: "Landlord's noncompliance as defense to action for possession or rent" },
  { section: "33-1366", title: "Fire or casualty damage" },
  { section: "33-1367", title: "Tenant's remedies for landlord's unlawful ouster" },
  { section: "33-1368", title: "Noncompliance with rental agreement by tenant" },
  { section: "33-1369", title: "Failure to maintain" },
  { section: "33-1370", title: "Absence, nonuse and abandonment" },
  { section: "33-1371", title: "Landlord and tenant remedies for abuse of access" },
  { section: "33-1372", title: "Retaliatory conduct prohibited" },
  { section: "33-1374", title: "Special detainer actions" },
  { section: "33-1375", title: "Periodic tenancy; holdover remedies" },
  { section: "33-1376", title: "Remedies for abuse of access" },
  { section: "33-1377", title: "Victim's right to terminate rental agreement" },
  { section: "33-1378", title: "Pool and spa barriers" },
  { section: "33-1381", title: "Bed bugs" },
];

async function fetchStatuteContent(section: string): Promise<string | null> {
  const [title, sectionNum] = section.split("-");
  const paddedSection = sectionNum.padStart(5, "0");
  const url = `https://www.azleg.gov/ars/${title}/${paddedSection}.htm`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "ezLegal.ai Legal Research Bot (educational/access-to-justice)",
        "Accept": "text/html",
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const content = parseStatuteHtml(html);
    return content;
  } catch (error) {
    console.error(`Error fetching ${section}:`, error);
    return null;
  }
}

function parseStatuteHtml(html: string): string {
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }

  content = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return content;
}

async function generateEmbedding(text: string): Promise<number[] | null> {
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiKey) {
    console.error("OPENAI_API_KEY not set");
    return null;
  }

  try {
    const truncatedText = text.slice(0, 8000);

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: truncatedText,
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI embedding error:", error);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

function extractKeywords(content: string, sectionTitle: string): string[] {
  const keywords: Set<string> = new Set();

  const legalTerms = [
    "landlord", "tenant", "lease", "rent", "deposit", "security deposit",
    "eviction", "notice", "termination", "possession", "dwelling",
    "repair", "maintenance", "habitability", "breach", "remedy",
    "damages", "liability", "rights", "obligations", "agreement",
    "contract", "property", "real estate", "premises", "occupancy"
  ];

  const lowerContent = content.toLowerCase();
  const lowerTitle = sectionTitle.toLowerCase();

  for (const term of legalTerms) {
    if (lowerContent.includes(term) || lowerTitle.includes(term)) {
      keywords.add(term);
    }
  }

  const titleWords = sectionTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3 && !["the", "and", "for", "with"].includes(w));

  titleWords.forEach(w => keywords.add(w));

  return Array.from(keywords).slice(0, 20);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ScrapeRequest = await req.json();
    const { action, title, section, limit = 10 } = body;

    if (action === "status") {
      const { data: stats } = await supabase
        .from("arizona_legal_sources")
        .select("source_type, title_number, is_active")
        .eq("is_active", true);

      const { data: logs } = await supabase
        .from("arizona_scrape_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({
          total_statutes: stats?.length || 0,
          by_title: stats?.reduce((acc: Record<string, number>, s) => {
            acc[s.title_number] = (acc[s.title_number] || 0) + 1;
            return acc;
          }, {}),
          recent_logs: logs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "scrape_section" && section) {
      const logId = crypto.randomUUID();
      await supabase.from("arizona_scrape_logs").insert({
        id: logId,
        source_type: "ars",
        title_number: section.split("-")[0],
        status: "started",
      });

      const sectionInfo = LANDLORD_TENANT_SECTIONS.find(s => s.section === section);
      if (!sectionInfo) {
        return new Response(
          JSON.stringify({ error: "Section not found in known sections" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const content = await fetchStatuteContent(section);
      if (!content) {
        await supabase.from("arizona_scrape_logs").update({
          status: "failed",
          error_message: "Failed to fetch content",
          completed_at: new Date().toISOString(),
        }).eq("id", logId);

        return new Response(
          JSON.stringify({ error: "Failed to fetch statute content" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const embedding = await generateEmbedding(`${sectionInfo.title}\n\n${content}`);
      const keywords = extractKeywords(content, sectionInfo.title);
      const titleNum = section.split("-")[0];
      const titleInfo = ARS_TITLES[titleNum] || { name: "Unknown", practice_areas: [] };

      const statuteData: StatuteData = {
        source_type: "ars",
        title_number: titleNum,
        title_name: titleInfo.name,
        section: section,
        section_title: sectionInfo.title,
        content: content,
        url: `https://www.azleg.gov/ars/${titleNum}/${section.split("-")[1].padStart(5, "0")}.htm`,
        practice_areas: titleInfo.practice_areas,
        keywords: keywords,
      };

      const { error: insertError } = await supabase
        .from("arizona_legal_sources")
        .upsert({
          ...statuteData,
          embedding: embedding,
          scraped_at: new Date().toISOString(),
        }, {
          onConflict: "source_type,section",
        });

      if (insertError) {
        await supabase.from("arizona_scrape_logs").update({
          status: "failed",
          error_message: insertError.message,
          completed_at: new Date().toISOString(),
        }).eq("id", logId);

        return new Response(
          JSON.stringify({ error: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.from("arizona_scrape_logs").update({
        status: "completed",
        sections_scraped: 1,
        sections_embedded: embedding ? 1 : 0,
        completed_at: new Date().toISOString(),
      }).eq("id", logId);

      return new Response(
        JSON.stringify({
          success: true,
          section: section,
          title: sectionInfo.title,
          content_length: content.length,
          has_embedding: !!embedding,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "scrape_title" && title) {
      const logId = crypto.randomUUID();
      const startTime = Date.now();

      await supabase.from("arizona_scrape_logs").insert({
        id: logId,
        source_type: "ars",
        title_number: title,
        status: "started",
      });

      const sectionsToScrape = title === "33"
        ? LANDLORD_TENANT_SECTIONS.slice(0, limit)
        : [];

      if (sectionsToScrape.length === 0) {
        return new Response(
          JSON.stringify({
            error: "Currently only Title 33 (Landlord-Tenant) sections are pre-configured",
            available_titles: ["33"],
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let scraped = 0;
      let embedded = 0;
      const results: Array<{ section: string; success: boolean; error?: string }> = [];

      for (const sectionInfo of sectionsToScrape) {
        try {
          const content = await fetchStatuteContent(sectionInfo.section);
          if (!content) {
            results.push({ section: sectionInfo.section, success: false, error: "Failed to fetch" });
            continue;
          }

          const embedding = await generateEmbedding(`${sectionInfo.title}\n\n${content}`);
          const keywords = extractKeywords(content, sectionInfo.title);
          const titleInfo = ARS_TITLES[title] || { name: "Unknown", practice_areas: [] };

          const { error: insertError } = await supabase
            .from("arizona_legal_sources")
            .upsert({
              source_type: "ars",
              title_number: title,
              title_name: titleInfo.name,
              section: sectionInfo.section,
              section_title: sectionInfo.title,
              content: content,
              url: `https://www.azleg.gov/ars/${title}/${sectionInfo.section.split("-")[1].padStart(5, "0")}.htm`,
              practice_areas: titleInfo.practice_areas,
              keywords: keywords,
              embedding: embedding,
              scraped_at: new Date().toISOString(),
            }, {
              onConflict: "source_type,section",
            });

          if (insertError) {
            results.push({ section: sectionInfo.section, success: false, error: insertError.message });
          } else {
            scraped++;
            if (embedding) embedded++;
            results.push({ section: sectionInfo.section, success: true });
          }

          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          results.push({ section: sectionInfo.section, success: false, error: String(error) });
        }
      }

      const durationMs = Date.now() - startTime;

      await supabase.from("arizona_scrape_logs").update({
        status: scraped > 0 ? (scraped === sectionsToScrape.length ? "completed" : "partial") : "failed",
        sections_scraped: scraped,
        sections_embedded: embedded,
        completed_at: new Date().toISOString(),
        duration_ms: durationMs,
      }).eq("id", logId);

      return new Response(
        JSON.stringify({
          success: true,
          title: title,
          total_sections: sectionsToScrape.length,
          scraped: scraped,
          embedded: embedded,
          duration_ms: durationMs,
          results: results,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "embed_pending") {
      const { data: pending } = await supabase
        .from("arizona_legal_sources")
        .select("id, section, section_title, content")
        .is("embedding", null)
        .eq("is_active", true)
        .limit(limit);

      if (!pending || pending.length === 0) {
        return new Response(
          JSON.stringify({ message: "No pending embeddings" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let embedded = 0;
      for (const statute of pending) {
        const embedding = await generateEmbedding(`${statute.section_title}\n\n${statute.content}`);
        if (embedding) {
          await supabase
            .from("arizona_legal_sources")
            .update({ embedding })
            .eq("id", statute.id);
          embedded++;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return new Response(
        JSON.stringify({
          success: true,
          processed: pending.length,
          embedded: embedded,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action",
        available_actions: ["scrape_title", "scrape_section", "embed_pending", "status"],
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ARS Scraper error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
