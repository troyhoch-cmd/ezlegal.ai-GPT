import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

type Action = "analyze" | "triage" | "research_plan" | "suggest_clause";

interface RequestBody {
  action: Action;
  documentId?: string;
  content?: string;
  intakeText?: string;
  jurisdiction?: string;
  goal?: string;
  clauseText?: string;
}

interface Clause {
  clause_index: number;
  heading: string;
  snippet: string;
  clause_type: string;
  start_offset: number;
  end_offset: number;
}

const CLAUSE_TYPE_KEYWORDS: Record<string, RegExp> = {
  indemnification: /\b(indemnif|hold\s+harmless)\b/i,
  limitation_of_liability: /\b(limitation\s+of\s+liability|no\s+liability|liability\s+cap)\b/i,
  confidentiality: /\b(confidential|nda|non[- ]disclosure)\b/i,
  termination: /\b(terminat|end\s+of\s+agreement|expiration)\b/i,
  governing_law: /\b(governing\s+law|jurisdiction|venue)\b/i,
  payment: /\b(payment|fee|invoice|compensation)\b/i,
  warranty: /\b(warrant|represent)\b/i,
  arbitration: /\b(arbitrat|dispute\s+resolution)\b/i,
  ip: /\b(intellectual\s+property|ip\s+ownership|assignment\s+of\s+ip)\b/i,
  non_compete: /\b(non[- ]?compete|restrictive\s+covenant)\b/i,
};

function detectClauseType(heading: string, body: string): string {
  const combined = `${heading} ${body}`;
  for (const [type, re] of Object.entries(CLAUSE_TYPE_KEYWORDS)) {
    if (re.test(combined)) return type;
  }
  return "general";
}

function segmentClauses(content: string): Clause[] {
  const lines = content.split(/\r?\n/);
  const clauses: Clause[] = [];
  let current: { heading: string; body: string[]; start: number } | null = null;
  let offset = 0;
  let idx = 0;
  const headingRe = /^\s*(ARTICLE\s+[IVXLCDM0-9]+|SECTION\s+\d+|\d+\.(?!\d)\s|[A-Z][A-Z \-]{3,}:?)\s*(.*)$/;

  for (const line of lines) {
    const lineLen = line.length + 1;
    if (headingRe.test(line)) {
      if (current) {
        const body = current.body.join("\n").trim();
        clauses.push({
          clause_index: idx++,
          heading: current.heading.trim().slice(0, 140),
          snippet: body.slice(0, 320),
          clause_type: detectClauseType(current.heading, body),
          start_offset: current.start,
          end_offset: offset,
        });
      }
      current = { heading: line, body: [], start: offset };
    } else if (current) {
      current.body.push(line);
    } else {
      current = { heading: "Preamble", body: [line], start: 0 };
    }
    offset += lineLen;
  }
  if (current) {
    const body = current.body.join("\n").trim();
    clauses.push({
      clause_index: idx,
      heading: current.heading.trim().slice(0, 140),
      snippet: body.slice(0, 320),
      clause_type: detectClauseType(current.heading, body),
      start_offset: current.start,
      end_offset: offset,
    });
  }
  return clauses;
}

interface HeuristicRisk {
  severity: "info" | "low" | "medium" | "high" | "critical";
  category: string;
  title: string;
  description: string;
  suggestion: string;
  clauseIndex?: number;
}

function detectRisks(content: string, clauses: Clause[]): HeuristicRisk[] {
  const risks: HeuristicRisk[] = [];
  const lower = content.toLowerCase();

  if (!/\bgoverning\s+law\b/.test(lower)) {
    risks.push({
      severity: "high",
      category: "governing_law",
      title: "Missing governing law clause",
      description: "Contract does not specify which state's law governs interpretation and enforcement.",
      suggestion: "Add a governing law clause naming the state whose law will apply.",
    });
  }
  if (!/\b(dispute\s+resolution|arbitration|venue)\b/.test(lower)) {
    risks.push({
      severity: "medium",
      category: "dispute_resolution",
      title: "No dispute-resolution mechanism",
      description: "No arbitration, venue, or dispute-resolution clause detected.",
      suggestion: "Add a dispute-resolution clause specifying venue or arbitration rules.",
    });
  }
  if (/\bunlimited\s+liability\b/.test(lower) || !/\blimitation\s+of\s+liability\b/.test(lower)) {
    risks.push({
      severity: "high",
      category: "liability",
      title: "No limitation of liability",
      description: "Agreement lacks a cap on liability, exposing parties to open-ended damages.",
      suggestion: "Add a limitation of liability clause with a cap tied to fees paid.",
    });
  }
  if (/\bperpetual\b/.test(lower) && /\b(license|term|agreement)\b/.test(lower)) {
    risks.push({
      severity: "medium",
      category: "term",
      title: "Perpetual term detected",
      description: "Perpetual language may be unenforceable or create unintended long-term obligations.",
      suggestion: "Replace with a defined term plus renewal mechanics.",
    });
  }
  if (!/\b(terminat|notice)\b/.test(lower)) {
    risks.push({
      severity: "medium",
      category: "termination",
      title: "No termination or notice mechanism",
      description: "Neither party can cleanly exit the agreement.",
      suggestion: "Add termination-for-convenience and termination-for-cause provisions with notice periods.",
    });
  }
  if (/\bsign\s+here\b/.test(lower) && !/\bnotary\b/.test(lower)) {
    risks.push({
      severity: "low",
      category: "execution",
      title: "Signature block without notarization",
      description: "Document invites signature but does not include notary acknowledgment.",
      suggestion: "If required by jurisdiction, add a notary acknowledgment block.",
    });
  }
  for (const c of clauses) {
    if (c.clause_type === "non_compete") {
      risks.push({
        severity: "high",
        category: "non_compete",
        title: "Non-compete clause present",
        description: `Clause "${c.heading}" contains a non-compete. Enforceability varies by state and recent FTC action.`,
        suggestion: "Narrow scope, duration, and geography; confirm enforceability in the governing jurisdiction.",
        clauseIndex: c.clause_index,
      });
    }
    if (c.clause_type === "indemnification" && /\bany\s+and\s+all\b/i.test(c.snippet)) {
      risks.push({
        severity: "medium",
        category: "indemnification",
        title: "Overbroad indemnification",
        description: `Clause "${c.heading}" uses "any and all" indemnification language.`,
        suggestion: "Limit indemnification to third-party claims arising from the indemnitor's breach or negligence.",
        clauseIndex: c.clause_index,
      });
    }
  }
  return risks;
}

interface SuggestionSeed {
  suggestion_type: string;
  title: string;
  suggested_text: string;
  rationale: string;
  clauseIndex?: number;
}

function generateClauseSuggestions(clauses: Clause[]): SuggestionSeed[] {
  const present = new Set(clauses.map((c) => c.clause_type));
  const out: SuggestionSeed[] = [];
  if (!present.has("governing_law")) {
    out.push({
      suggestion_type: "addition",
      title: "Add governing law & venue clause",
      suggested_text: "This Agreement shall be governed by and construed in accordance with the laws of the State of [State], without regard to conflict-of-law principles. The parties consent to the exclusive jurisdiction of the state and federal courts located in [County, State].",
      rationale: "Establishes predictable interpretation and forum.",
    });
  }
  if (!present.has("limitation_of_liability")) {
    out.push({
      suggestion_type: "addition",
      title: "Add limitation of liability",
      suggested_text: "EXCEPT FOR BREACHES OF CONFIDENTIALITY OR INDEMNIFICATION OBLIGATIONS, IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY EXCEED THE FEES PAID HEREUNDER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
      rationale: "Caps aggregate exposure while carving out the usual exceptions.",
    });
  }
  if (!present.has("confidentiality")) {
    out.push({
      suggestion_type: "addition",
      title: "Add mutual confidentiality clause",
      suggested_text: "Each party shall hold the other's Confidential Information in strict confidence and shall not disclose it to any third party except as required to perform under this Agreement or as required by law.",
      rationale: "Protects proprietary information exchanged between the parties.",
    });
  }
  return out;
}

function detectTriage(text: string) {
  const lower = text.toLowerCase();
  let matter = "general";
  if (/\b(eviction|landlord|tenant|lease)\b/.test(lower)) matter = "housing";
  else if (/\b(debt|collector|garnish)\b/.test(lower)) matter = "consumer_debt";
  else if (/\b(fired|wages|overtime|harass)\b/.test(lower)) matter = "employment";
  else if (/\b(divorce|custody|child\s+support)\b/.test(lower)) matter = "family";
  else if (/\b(contract|nda|vendor|msa)\b/.test(lower)) matter = "contract";
  else if (/\b(immigration|visa|green\s+card)\b/.test(lower)) matter = "immigration";

  let urgency: "standard" | "priority" | "emergency" = "standard";
  if (/\b(today|tomorrow|24\s*hours|emergency)\b/.test(lower)) urgency = "emergency";
  else if (/\b(this\s+week|deadline|asap|court\s+date)\b/.test(lower)) urgency = "priority";

  const templateMap: Record<string, string> = {
    housing: "tenant_notice_response",
    consumer_debt: "debt_dispute_letter",
    employment: "employment_demand_letter",
    family: "family_intake_worksheet",
    contract: "mutual_nda",
    immigration: "immigration_intake_worksheet",
    general: "general_intake_worksheet",
  };

  return {
    detected_matter_type: matter,
    urgency,
    suggested_template_slug: templateMap[matter],
    routing_recommendation:
      urgency === "emergency"
        ? "Route to on-call attorney within 24 hours."
        : urgency === "priority"
        ? "Route to specialist queue within 3 business days."
        : "Standard intake queue; 5-7 business day triage.",
    confidence: matter === "general" ? 0.55 : 0.82,
  };
}

function buildResearchSteps(goal: string) {
  const base = [
    { step_type: "research", title: "Identify controlling law", detail: `Determine the jurisdiction and controlling statutes/regulations for: ${goal}` },
    { step_type: "research", title: "Survey recent case law", detail: "Summarize the last 5 years of leading cases addressing the issue." },
    { step_type: "analysis", title: "Spot contested issues", detail: "List the disputed sub-issues and the strongest arguments on each side." },
    { step_type: "draft", title: "Draft first-pass document", detail: "Produce an initial draft with citations and clause-level comments." },
    { step_type: "review", title: "Run compliance & risk review", detail: "Check for governing-law, liability cap, confidentiality, termination, and signature blocks." },
    { step_type: "finalize", title: "Finalize & export", detail: "Finalize formatting, version-track, and prepare export-ready PDF/DOCX." },
  ];
  return base.map((s, i) => ({ ...s, step_order: i }));
}

async function handleAnalyze(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  documentId: string,
  content: string,
) {
  const clauses = segmentClauses(content);
  await supabase.from("document_clauses").delete().eq("document_id", documentId);
  const clauseRows = clauses.map((c) => ({ ...c, document_id: documentId, user_id: userId }));
  const { data: inserted } = clauseRows.length
    ? await supabase.from("document_clauses").insert(clauseRows).select()
    : { data: [] as Array<{ id: string; clause_index: number }> };

  const indexToId = new Map<number, string>();
  (inserted ?? []).forEach((row) => indexToId.set(row.clause_index, row.id));

  const risks = detectRisks(content, clauses);
  await supabase.from("document_risks").delete().eq("document_id", documentId);
  if (risks.length) {
    await supabase.from("document_risks").insert(
      risks.map((r) => ({
        document_id: documentId,
        user_id: userId,
        clause_id: r.clauseIndex !== undefined ? indexToId.get(r.clauseIndex) ?? null : null,
        severity: r.severity,
        category: r.category,
        title: r.title,
        description: r.description,
        suggestion: r.suggestion,
      })),
    );
  }

  const suggestions = generateClauseSuggestions(clauses);
  await supabase.from("document_clause_suggestions").delete().eq("document_id", documentId);
  if (suggestions.length) {
    await supabase.from("document_clause_suggestions").insert(
      suggestions.map((s) => ({
        document_id: documentId,
        user_id: userId,
        clause_id: s.clauseIndex !== undefined ? indexToId.get(s.clauseIndex) ?? null : null,
        suggestion_type: s.suggestion_type,
        title: s.title,
        suggested_text: s.suggested_text,
        rationale: s.rationale,
      })),
    );
  }

  return {
    clauses: inserted ?? [],
    riskCount: risks.length,
    suggestionCount: suggestions.length,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: auth } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    const body = (await req.json()) as RequestBody;

    if (body.action === "analyze") {
      if (!body.documentId || !body.content) {
        return new Response(JSON.stringify({ error: "documentId and content required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const result = await handleAnalyze(supabase, userId, body.documentId, body.content);
      return new Response(JSON.stringify({ ok: true, ...result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "triage") {
      if (!body.intakeText) {
        return new Response(JSON.stringify({ error: "intakeText required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const triage = detectTriage(body.intakeText);
      const { data } = await supabase
        .from("document_intake_triage")
        .insert({
          user_id: userId,
          raw_intake: body.intakeText.slice(0, 4000),
          ...triage,
        })
        .select()
        .single();
      return new Response(JSON.stringify({ ok: true, triage: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "research_plan") {
      if (!body.goal) {
        return new Response(JSON.stringify({ error: "goal required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: plan } = await supabase
        .from("document_research_plans")
        .insert({
          user_id: userId,
          document_id: body.documentId ?? null,
          goal: body.goal.slice(0, 2000),
          status: "active",
        })
        .select()
        .single();
      const steps = buildResearchSteps(body.goal).map((s) => ({
        ...s,
        plan_id: plan!.id,
        user_id: userId,
      }));
      await supabase.from("document_research_steps").insert(steps);
      return new Response(JSON.stringify({ ok: true, planId: plan!.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.action === "suggest_clause") {
      if (!body.clauseText) {
        return new Response(JSON.stringify({ error: "clauseText required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const suggestions = generateClauseSuggestions(segmentClauses(body.clauseText));
      return new Response(JSON.stringify({ ok: true, suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("analyze-document error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
