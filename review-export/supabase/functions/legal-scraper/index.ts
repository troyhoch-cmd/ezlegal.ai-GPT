import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ScrapeRequest {
  action:
    | "scrape_source"
    | "scrape_section"
    | "embed_pending"
    | "status"
    | "list_sources"
    | "refresh_stale";
  source_key?: string;
  section?: string;
  title?: string;
  limit?: number;
}

interface ScrapedContent {
  source_key: string;
  jurisdiction: string;
  content_type: string;
  title_number: string;
  title_name: string;
  section_number: string;
  section_title: string;
  content: string;
  url: string;
  practice_areas: string[];
  keywords: string[];
}

const USER_AGENT =
  "ezLegal.ai Legal Research Bot (educational/access-to-justice; contact@ezlegal.ai)";
const RATE_LIMIT_MS = 600;

const PRACTICE_AREA_KEYWORDS: Record<string, string[]> = {
  housing: [
    "landlord",
    "tenant",
    "lease",
    "rent",
    "eviction",
    "dwelling",
    "habitability",
    "security deposit",
    "premises",
    "occupancy",
  ],
  employment: [
    "employer",
    "employee",
    "wage",
    "salary",
    "discrimination",
    "harassment",
    "termination",
    "overtime",
    "labor",
    "workplace",
  ],
  family: [
    "marriage",
    "divorce",
    "custody",
    "child support",
    "alimony",
    "adoption",
    "domestic",
    "paternity",
    "guardian",
    "visitation",
  ],
  consumer: [
    "consumer",
    "fraud",
    "deceptive",
    "warranty",
    "debt",
    "credit",
    "collection",
    "unfair",
    "complaint",
    "refund",
  ],
  criminal: [
    "crime",
    "felony",
    "misdemeanor",
    "sentence",
    "probation",
    "parole",
    "arrest",
    "indictment",
    "plea",
    "conviction",
  ],
  bankruptcy: [
    "bankruptcy",
    "debtor",
    "creditor",
    "discharge",
    "chapter 7",
    "chapter 13",
    "liquidation",
    "reorganization",
    "trustee",
    "exemption",
  ],
  immigration: [
    "immigration",
    "visa",
    "asylum",
    "deportation",
    "naturalization",
    "citizenship",
    "alien",
    "refugee",
    "green card",
    "petition",
  ],
  personal_injury: [
    "negligence",
    "liability",
    "damages",
    "injury",
    "tort",
    "accident",
    "malpractice",
    "wrongful death",
    "compensation",
    "causation",
  ],
};

const STATE_SCRAPER_CONFIGS: Record<
  string,
  {
    fetchSection: (
      title: string,
      section: string,
      baseUrl: string
    ) => Promise<string | null>;
    buildUrl: (title: string, section: string, baseUrl: string) => string;
    sections: Record<string, Array<{ section: string; title: string }>>;
    titleMap: Record<string, { name: string; practice_areas: string[] }>;
  }
> = {
  az_ars: {
    fetchSection: async (title, section, baseUrl) => {
      const paddedSection = section.split("-")[1]?.padStart(5, "0") || section;
      const url = `${baseUrl}/${title}/${paddedSection}.htm`;
      return fetchHtmlContent(url);
    },
    buildUrl: (title, section, baseUrl) => {
      const paddedSection = section.split("-")[1]?.padStart(5, "0") || section;
      return `${baseUrl}/${title}/${paddedSection}.htm`;
    },
    titleMap: {
      "12": {
        name: "Courts and Civil Proceedings",
        practice_areas: ["civil_procedure", "litigation"],
      },
      "13": { name: "Criminal Code", practice_areas: ["criminal"] },
      "14": {
        name: "Trusts, Estates and Protective Proceedings",
        practice_areas: ["estate_planning", "probate"],
      },
      "23": { name: "Labor", practice_areas: ["employment", "labor"] },
      "25": {
        name: "Marital and Domestic Relations",
        practice_areas: ["family"],
      },
      "33": {
        name: "Property",
        practice_areas: ["housing", "landlord_tenant", "property"],
      },
      "34": {
        name: "Public Buildings and Improvements",
        practice_areas: ["construction", "government"],
      },
      "36": {
        name: "Public Health and Safety",
        practice_areas: ["health", "safety"],
      },
      "44": {
        name: "Trade and Commerce",
        practice_areas: ["consumer", "contracts"],
      },
    },
    sections: {
      "33": [
        { section: "33-1301", title: "Short title" },
        { section: "33-1302", title: "Purposes" },
        { section: "33-1303", title: "Supplementary principles of law" },
        { section: "33-1304", title: "Construction" },
        { section: "33-1305", title: "Obligations and rights" },
        { section: "33-1310", title: "General definitions" },
        { section: "33-1311", title: "Notice" },
        { section: "33-1312", title: "Terms and conditions of rental agreement" },
        { section: "33-1314", title: "Prohibited provisions in rental agreements" },
        { section: "33-1316", title: "Landlord to supply possession" },
        { section: "33-1318", title: "Tenant to maintain dwelling unit" },
        { section: "33-1321", title: "Security deposits" },
        { section: "33-1322", title: "Disclosure" },
        { section: "33-1323", title: "Landlord to maintain fit premises" },
        { section: "33-1341", title: "Tenant to maintain dwelling unit" },
        { section: "33-1342", title: "Rules and regulations" },
        { section: "33-1343", title: "Access" },
        { section: "33-1361", title: "Noncompliance by the landlord" },
        { section: "33-1363", title: "Self-help for minor defects" },
        {
          section: "33-1364",
          title: "Wrongful failure to supply essential services",
        },
        { section: "33-1366", title: "Fire or casualty damage" },
        {
          section: "33-1368",
          title: "Noncompliance with rental agreement by tenant",
        },
        { section: "33-1370", title: "Absence, nonuse and abandonment" },
        { section: "33-1372", title: "Retaliatory conduct prohibited" },
        { section: "33-1374", title: "Special detainer actions" },
        { section: "33-1375", title: "Periodic tenancy; holdover remedies" },
        {
          section: "33-1377",
          title: "Victim's right to terminate rental agreement",
        },
        { section: "33-1381", title: "Bed bugs" },
      ],
      "23": [
        { section: "23-350", title: "Definitions" },
        {
          section: "23-351",
          title: "Payment of wages; singling out employees; direction of payment",
        },
        { section: "23-352", title: "Withholding of wages" },
        { section: "23-353", title: "Payment of wages of discharged employee" },
        { section: "23-355", title: "Penalties on employer" },
        { section: "23-363", title: "Minimum wage" },
        { section: "23-364", title: "Earned paid sick time" },
      ],
      "25": [
        { section: "25-311", title: "Dissolution of marriage; legal separation" },
        { section: "25-312", title: "Irretrievable breakdown" },
        { section: "25-314", title: "Separation agreement" },
        {
          section: "25-318",
          title: "Disposition of property; consideration of excessive or abnormal expenditures",
        },
        { section: "25-319", title: "Maintenance" },
        { section: "25-320", title: "Child support" },
        { section: "25-403", title: "Legal decision-making and parenting time" },
      ],
    },
  },
  ca_codes: {
    fetchSection: async (_title, section, _baseUrl) => {
      const url = `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=${section}&lawCode=CIV`;
      return fetchHtmlContent(url);
    },
    buildUrl: (_title, section, _baseUrl) => {
      return `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=${section}&lawCode=CIV`;
    },
    titleMap: {
      CIV: { name: "Civil Code", practice_areas: ["civil", "housing", "consumer"] },
      FAM: { name: "Family Code", practice_areas: ["family"] },
      LAB: { name: "Labor Code", practice_areas: ["employment", "labor"] },
      CCP: {
        name: "Code of Civil Procedure",
        practice_areas: ["civil_procedure"],
      },
      PEN: { name: "Penal Code", practice_areas: ["criminal"] },
    },
    sections: {
      CIV: [
        { section: "1940", title: "Hiring of real property - definitions" },
        { section: "1941", title: "Landlord obligations" },
        { section: "1941.1", title: "Untenantable dwelling" },
        { section: "1942", title: "Tenant repair and deduct" },
        { section: "1942.4", title: "Substandard conditions - rent reduction" },
        { section: "1942.5", title: "Retaliatory eviction" },
        { section: "1946.2", title: "Just cause for termination of tenancy" },
        { section: "1947.12", title: "Rent cap - AB 1482" },
        { section: "1950.5", title: "Security deposits" },
        { section: "1951.2", title: "Tenant abandonment" },
      ],
      LAB: [
        { section: "201", title: "Payment upon discharge" },
        { section: "202", title: "Payment upon quitting" },
        { section: "203", title: "Waiting time penalty" },
        { section: "226", title: "Itemized wage statement" },
        { section: "510", title: "Overtime" },
        { section: "1182.12", title: "Minimum wage" },
      ],
    },
  },
  tx_statutes: {
    fetchSection: async (title, section, _baseUrl) => {
      const url = `https://statutes.capitol.texas.gov/Docs/${title}/htm/${title}.${section}.htm`;
      return fetchHtmlContent(url);
    },
    buildUrl: (title, section, _baseUrl) => {
      return `https://statutes.capitol.texas.gov/Docs/${title}/htm/${title}.${section}.htm`;
    },
    titleMap: {
      PR: { name: "Property Code", practice_areas: ["housing", "property"] },
      FA: { name: "Family Code", practice_areas: ["family"] },
      LA: { name: "Labor Code", practice_areas: ["employment"] },
      CP: {
        name: "Civil Practice and Remedies Code",
        practice_areas: ["civil_procedure"],
      },
      PE: { name: "Penal Code", practice_areas: ["criminal"] },
    },
    sections: {
      PR: [
        { section: "92.001", title: "Definitions" },
        { section: "92.008", title: "Interruption of utilities" },
        { section: "92.052", title: "Landlord's duty to repair or remedy" },
        { section: "92.056", title: "Landlord liability; lien" },
        { section: "92.101", title: "Security deposit" },
        { section: "92.104", title: "Return of security deposit" },
        { section: "92.331", title: "Retaliation by landlord" },
      ],
      LA: [
        { section: "61.001", title: "Definitions - payday" },
        { section: "61.011", title: "Payment of wages" },
        { section: "61.014", title: "Payment after termination" },
      ],
    },
  },
  ny_laws: {
    fetchSection: async (_title, section, _baseUrl) => {
      const url = `https://www.nysenate.gov/legislation/laws/RPP/${section}`;
      return fetchHtmlContent(url);
    },
    buildUrl: (_title, section, _baseUrl) => {
      return `https://www.nysenate.gov/legislation/laws/RPP/${section}`;
    },
    titleMap: {
      RPP: {
        name: "Real Property Law",
        practice_areas: ["housing", "property"],
      },
      LAB: { name: "Labor Law", practice_areas: ["employment"] },
      DOM: { name: "Domestic Relations Law", practice_areas: ["family"] },
      GBS: {
        name: "General Business Law",
        practice_areas: ["consumer", "business"],
      },
    },
    sections: {
      RPP: [
        { section: "220", title: "When tenant may surrender premises" },
        { section: "226-b", title: "Right to sublease or assign" },
        { section: "227", title: "Removal of tenant" },
        { section: "227-a", title: "Rent abatement for failure to provide services" },
        { section: "230", title: "Constructive eviction" },
        { section: "232-a", title: "Notice to terminate monthly tenancy" },
        { section: "233-a", title: "Retaliatory eviction" },
        { section: "234", title: "Right of tenant to recover attorneys fees" },
        { section: "235-b", title: "Warranty of habitability" },
        { section: "235-e", title: "Duty of landlord to provide written receipts" },
      ],
    },
  },
  fl_statutes: {
    fetchSection: async (title, section, _baseUrl) => {
      const url = `http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0000-0099/00${title}/Sections/00${title}.${section}.html`;
      return fetchHtmlContent(url);
    },
    buildUrl: (title, section, _baseUrl) => {
      return `http://www.flsenate.gov/Laws/Statutes/${title}.${section}`;
    },
    titleMap: {
      "83": {
        name: "Landlord and Tenant",
        practice_areas: ["housing", "landlord_tenant"],
      },
      "61": { name: "Dissolution of Marriage", practice_areas: ["family"] },
      "440": {
        name: "Workers Compensation",
        practice_areas: ["employment", "personal_injury"],
      },
      "448": { name: "General Labor Regulations", practice_areas: ["employment"] },
    },
    sections: {
      "83": [
        { section: "40", title: "Rights of the landlord" },
        { section: "41", title: "Distress for rent" },
        { section: "43", title: "Landlord's lien for rent" },
        { section: "46", title: "Rent; duration of tenancies" },
        { section: "47", title: "Certain written obligations held valid" },
        { section: "48", title: "Detention of rental property" },
        { section: "49", title: "Security deposits" },
        { section: "51", title: "Landlord's obligation to maintain premises" },
        { section: "56", title: "Remedies for failure to maintain" },
        { section: "57", title: "Termination of rental agreement" },
        { section: "595", title: "Retaliatory conduct" },
      ],
    },
  },
};

const FEDERAL_SECTIONS: Record<
  string,
  Array<{ section: string; title: string }>
> = {
  "11": [
    { section: "101", title: "Definitions" },
    { section: "109", title: "Bankruptcy filing fees" },
    { section: "301", title: "Voluntary bankruptcy cases" },
    { section: "362", title: "Automatic stay" },
    { section: "522", title: "Exemptions" },
    { section: "523", title: "Exceptions to discharge" },
    { section: "707", title: "Dismissal or conversion" },
    { section: "1301", title: "Stay of action against codebtor" },
    { section: "1322", title: "Contents of plan" },
    { section: "1325", title: "Confirmation of plan" },
  ],
  "29": [
    { section: "201", title: "Short title - Fair Labor Standards Act" },
    { section: "206", title: "Minimum wage" },
    { section: "207", title: "Maximum hours" },
    { section: "211", title: "Records keeping" },
    { section: "213", title: "Exemptions" },
    { section: "216", title: "Penalties" },
    { section: "2601", title: "Family and Medical Leave Act - findings" },
    { section: "2612", title: "Leave requirement" },
    { section: "2614", title: "Employment and benefits protection" },
    { section: "2615", title: "Prohibited acts" },
  ],
  "42": [
    { section: "1983", title: "Civil action for deprivation of rights" },
    { section: "2000e", title: "Title VII definitions" },
    { section: "2000e-2", title: "Unlawful employment practices" },
    { section: "2000e-3", title: "Other unlawful employment practices" },
    { section: "2000e-5", title: "Enforcement provisions" },
    { section: "3601", title: "Fair Housing Act - declaration of policy" },
    { section: "3604", title: "Discrimination in sale or rental of housing" },
    { section: "3613", title: "Enforcement by private persons" },
    { section: "12101", title: "ADA findings and purpose" },
    { section: "12112", title: "ADA discrimination" },
  ],
};

async function fetchHtmlContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    return parseHtml(html);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

function parseHtml(html: string): string {
  let content = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "");

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }

  content = content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&sect;/g, "\u00A7")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
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
        Authorization: `Bearer ${openaiKey}`,
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
    console.error("Embedding generation error:", error);
    return null;
  }
}

function extractKeywords(content: string, sectionTitle: string): string[] {
  const keywords: Set<string> = new Set();
  const lowerContent = content.toLowerCase();
  const lowerTitle = sectionTitle.toLowerCase();

  for (const [area, terms] of Object.entries(PRACTICE_AREA_KEYWORDS)) {
    for (const term of terms) {
      if (lowerContent.includes(term) || lowerTitle.includes(term)) {
        keywords.add(term);
        keywords.add(area);
      }
    }
  }

  const titleWords = sectionTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        !["the", "and", "for", "with", "from", "that", "this"].includes(w)
    );
  titleWords.forEach((w) => keywords.add(w));

  return Array.from(keywords).slice(0, 25);
}

function detectPracticeAreas(
  content: string,
  sectionTitle: string,
  existingAreas: string[]
): string[] {
  const areas = new Set(existingAreas);
  const lowerContent = content.toLowerCase();
  const lowerTitle = sectionTitle.toLowerCase();

  for (const [area, terms] of Object.entries(PRACTICE_AREA_KEYWORDS)) {
    let matchCount = 0;
    for (const term of terms) {
      if (lowerContent.includes(term) || lowerTitle.includes(term)) {
        matchCount++;
      }
    }
    if (matchCount >= 2) {
      areas.add(area);
    }
  }

  return Array.from(areas);
}

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function scrapeStateSource(
  supabase: ReturnType<typeof createClient>,
  sourceKey: string,
  titleFilter?: string,
  limit = 50
): Promise<{
  scraped: number;
  embedded: number;
  added: number;
  updated: number;
  errors: string[];
}> {
  const config = STATE_SCRAPER_CONFIGS[sourceKey];
  if (!config) {
    return { scraped: 0, embedded: 0, added: 0, updated: 0, errors: [`Unknown source: ${sourceKey}`] };
  }

  const { data: source } = await supabase
    .from("scraper_sources")
    .select("*")
    .eq("source_key", sourceKey)
    .maybeSingle();

  if (!source) {
    return { scraped: 0, embedded: 0, added: 0, updated: 0, errors: [`Source not registered: ${sourceKey}`] };
  }

  const sectionsMap = config.sections;
  const titlesToScrape = titleFilter
    ? { [titleFilter]: sectionsMap[titleFilter] || [] }
    : sectionsMap;

  let scraped = 0;
  let embedded = 0;
  let added = 0;
  let updated = 0;
  const errors: string[] = [];
  let totalProcessed = 0;

  for (const [titleKey, sections] of Object.entries(titlesToScrape)) {
    if (!sections || sections.length === 0) continue;
    const titleInfo = config.titleMap[titleKey] || {
      name: titleKey,
      practice_areas: [],
    };

    for (const sectionInfo of sections) {
      if (totalProcessed >= limit) break;

      try {
        const content = await config.fetchSection(
          titleKey,
          sectionInfo.section,
          source.base_url
        );
        if (!content || content.length < 50) {
          errors.push(
            `Empty/short content for ${sourceKey}:${sectionInfo.section}`
          );
          continue;
        }

        const contentHash = hashContent(content);

        const { data: existing } = await supabase
          .from("legal_content")
          .select("id, version_hash")
          .eq("source_key", sourceKey)
          .eq("section_number", sectionInfo.section)
          .maybeSingle();

        if (existing && existing.version_hash === contentHash) {
          totalProcessed++;
          continue;
        }

        const embeddingText = `${sectionInfo.title}\n\n${content}`;
        const embedding = await generateEmbedding(embeddingText);
        const keywords = extractKeywords(content, sectionInfo.title);
        const practiceAreas = detectPracticeAreas(
          content,
          sectionInfo.title,
          titleInfo.practice_areas
        );

        const url = config.buildUrl(titleKey, sectionInfo.section, source.base_url);

        const record: Record<string, unknown> = {
          source_id: source.id,
          source_key: sourceKey,
          jurisdiction: source.jurisdiction,
          content_type: "statute",
          title_number: titleKey,
          title_name: titleInfo.name,
          section_number: sectionInfo.section,
          section_title: sectionInfo.title,
          content,
          url,
          practice_areas: practiceAreas,
          keywords,
          version_hash: contentHash,
          scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };

        if (embedding) {
          record.embedding = embedding;
          embedded++;
        }

        const { error: upsertError } = await supabase
          .from("legal_content")
          .upsert(record, { onConflict: "source_key,section_number" });

        if (upsertError) {
          errors.push(
            `Upsert error for ${sectionInfo.section}: ${upsertError.message}`
          );
        } else {
          scraped++;
          if (existing) {
            updated++;
          } else {
            added++;
          }
        }

        totalProcessed++;
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
      } catch (err) {
        errors.push(`Error scraping ${sectionInfo.section}: ${String(err)}`);
      }
    }
    if (totalProcessed >= limit) break;
  }

  await supabase
    .from("scraper_sources")
    .update({
      last_scraped_at: new Date().toISOString(),
      last_successful_at: scraped > 0 ? new Date().toISOString() : undefined,
      sections_count: scraped,
      sections_with_embeddings: embedded,
      updated_at: new Date().toISOString(),
    })
    .eq("source_key", sourceKey);

  return { scraped, embedded, added, updated, errors };
}

async function scrapeFederalSource(
  supabase: ReturnType<typeof createClient>,
  titleFilter?: string,
  limit = 50
): Promise<{
  scraped: number;
  embedded: number;
  added: number;
  updated: number;
  errors: string[];
}> {
  const { data: source } = await supabase
    .from("scraper_sources")
    .select("*")
    .eq("source_key", "us_code")
    .maybeSingle();

  if (!source) {
    return { scraped: 0, embedded: 0, added: 0, updated: 0, errors: ["us_code source not registered"] };
  }

  const titlesToScrape = titleFilter
    ? { [titleFilter]: FEDERAL_SECTIONS[titleFilter] || [] }
    : FEDERAL_SECTIONS;

  let scraped = 0;
  let embedded = 0;
  let added = 0;
  let updated = 0;
  const errors: string[] = [];
  let totalProcessed = 0;

  const titleNames: Record<string, { name: string; practice_areas: string[] }> = {
    "11": { name: "Bankruptcy", practice_areas: ["bankruptcy"] },
    "29": { name: "Labor", practice_areas: ["employment", "labor"] },
    "42": { name: "The Public Health and Welfare", practice_areas: ["civil_rights", "housing", "employment"] },
  };

  for (const [titleKey, sections] of Object.entries(titlesToScrape)) {
    if (!sections || sections.length === 0) continue;
    const titleInfo = titleNames[titleKey] || {
      name: `Title ${titleKey}`,
      practice_areas: [],
    };

    for (const sectionInfo of sections) {
      if (totalProcessed >= limit) break;

      try {
        const url = `https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title${titleKey}-section${sectionInfo.section}&num=0&edition=prelim`;
        const content = await fetchHtmlContent(url);

        if (!content || content.length < 50) {
          errors.push(`Empty/short content for USC ${titleKey}:${sectionInfo.section}`);
          continue;
        }

        const contentHash = hashContent(content);
        const sectionNum = `${titleKey}-USC-${sectionInfo.section}`;

        const { data: existing } = await supabase
          .from("legal_content")
          .select("id, version_hash")
          .eq("source_key", "us_code")
          .eq("section_number", sectionNum)
          .maybeSingle();

        if (existing && existing.version_hash === contentHash) {
          totalProcessed++;
          continue;
        }

        const embedding = await generateEmbedding(
          `${sectionInfo.title}\n\n${content}`
        );
        const keywords = extractKeywords(content, sectionInfo.title);
        const practiceAreas = detectPracticeAreas(
          content,
          sectionInfo.title,
          titleInfo.practice_areas
        );

        const record: Record<string, unknown> = {
          source_id: source.id,
          source_key: "us_code",
          jurisdiction: "federal",
          content_type: "statute",
          title_number: titleKey,
          title_name: titleInfo.name,
          section_number: sectionNum,
          section_title: sectionInfo.title,
          content,
          url,
          practice_areas: practiceAreas,
          keywords,
          version_hash: contentHash,
          scraped_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        };

        if (embedding) {
          record.embedding = embedding;
          embedded++;
        }

        const { error: upsertError } = await supabase
          .from("legal_content")
          .upsert(record, { onConflict: "source_key,section_number" });

        if (upsertError) {
          errors.push(
            `Upsert error for ${sectionNum}: ${upsertError.message}`
          );
        } else {
          scraped++;
          if (existing) updated++;
          else added++;
        }

        totalProcessed++;
        await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
      } catch (err) {
        errors.push(`Error scraping USC ${titleKey}:${sectionInfo.section}: ${String(err)}`);
      }
    }
    if (totalProcessed >= limit) break;
  }

  await supabase
    .from("scraper_sources")
    .update({
      last_scraped_at: new Date().toISOString(),
      last_successful_at: scraped > 0 ? new Date().toISOString() : undefined,
      sections_count: scraped,
      sections_with_embeddings: embedded,
      updated_at: new Date().toISOString(),
    })
    .eq("source_key", "us_code");

  return { scraped, embedded, added, updated, errors };
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
    const { action, source_key, title, limit = 20 } = body;

    if (action === "list_sources") {
      const { data: sources } = await supabase
        .from("scraper_sources")
        .select("*")
        .eq("is_active", true)
        .order("source_type");

      return new Response(JSON.stringify({ sources }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const { data: sources } = await supabase
        .from("scraper_sources")
        .select("*")
        .eq("is_active", true)
        .order("source_type");

      const { data: recentLogs } = await supabase
        .from("scraper_run_logs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);

      const { count: totalContent } = await supabase
        .from("legal_content")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: withEmbeddings } = await supabase
        .from("legal_content")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .not("embedding", "is", null);

      return new Response(
        JSON.stringify({
          sources,
          total_content: totalContent || 0,
          with_embeddings: withEmbeddings || 0,
          recent_logs: recentLogs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "scrape_source" && source_key) {
      const logId = crypto.randomUUID();
      const startTime = Date.now();

      const { data: source } = await supabase
        .from("scraper_sources")
        .select("*")
        .eq("source_key", source_key)
        .maybeSingle();

      if (!source) {
        return new Response(
          JSON.stringify({ error: `Source not found: ${source_key}` }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      await supabase.from("scraper_run_logs").insert({
        id: logId,
        source_id: source.id,
        source_key,
        action: "scrape",
        status: "started",
      });

      let result: {
        scraped: number;
        embedded: number;
        added: number;
        updated: number;
        errors: string[];
      };

      if (source_key === "us_code") {
        result = await scrapeFederalSource(supabase, title, limit);
      } else if (STATE_SCRAPER_CONFIGS[source_key]) {
        result = await scrapeStateSource(supabase, source_key, title, limit);
      } else {
        result = {
          scraped: 0,
          embedded: 0,
          added: 0,
          updated: 0,
          errors: [
            `No scraper implementation for source: ${source_key}. Available: us_code, ${Object.keys(STATE_SCRAPER_CONFIGS).join(", ")}`,
          ],
        };
      }

      const durationMs = Date.now() - startTime;

      await supabase
        .from("scraper_run_logs")
        .update({
          status:
            result.scraped > 0
              ? result.errors.length > 0
                ? "partial"
                : "completed"
              : "failed",
          sections_processed: result.scraped + result.errors.length,
          sections_added: result.added,
          sections_updated: result.updated,
          sections_embedded: result.embedded,
          error_message:
            result.errors.length > 0
              ? result.errors.slice(0, 5).join("; ")
              : null,
          duration_ms: durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq("id", logId);

      return new Response(
        JSON.stringify({
          source_key,
          ...result,
          duration_ms: durationMs,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "embed_pending") {
      const query = supabase
        .from("legal_content")
        .select("id, section_number, section_title, content")
        .is("embedding", null)
        .eq("is_active", true)
        .limit(limit);

      if (source_key) {
        query.eq("source_key", source_key);
      }

      const { data: pending } = await query;

      if (!pending || pending.length === 0) {
        return new Response(
          JSON.stringify({ message: "No pending embeddings" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let embedded = 0;
      for (const item of pending) {
        const embedding = await generateEmbedding(
          `${item.section_title}\n\n${item.content}`
        );
        if (embedding) {
          await supabase
            .from("legal_content")
            .update({ embedding, updated_at: new Date().toISOString() })
            .eq("id", item.id);
          embedded++;
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return new Response(
        JSON.stringify({
          processed: pending.length,
          embedded,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "refresh_stale") {
      const { data: staleSources } = await supabase
        .from("scraper_sources")
        .select("*")
        .eq("is_active", true)
        .or(
          `last_successful_at.is.null,last_successful_at.lt.${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`
        );

      if (!staleSources || staleSources.length === 0) {
        return new Response(
          JSON.stringify({ message: "All sources are fresh" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const results: Array<{
        source_key: string;
        scraped: number;
        errors: number;
      }> = [];

      for (const source of staleSources) {
        if (
          source.source_key === "us_code" ||
          STATE_SCRAPER_CONFIGS[source.source_key]
        ) {
          let result;
          if (source.source_key === "us_code") {
            result = await scrapeFederalSource(supabase, undefined, 10);
          } else {
            result = await scrapeStateSource(
              supabase,
              source.source_key,
              undefined,
              10
            );
          }
          results.push({
            source_key: source.source_key,
            scraped: result.scraped,
            errors: result.errors.length,
          });
        }
      }

      return new Response(JSON.stringify({ refreshed: results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "Invalid action",
        available_actions: [
          "scrape_source",
          "embed_pending",
          "status",
          "list_sources",
          "refresh_stale",
        ],
        available_sources: [
          "us_code",
          ...Object.keys(STATE_SCRAPER_CONFIGS),
        ],
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Legal scraper error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
