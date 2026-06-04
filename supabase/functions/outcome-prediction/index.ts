import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Tenant-ID, X-Api-Key",
};

interface FactorBasedRequest {
  caseType: string;
  jurisdiction: string;
  factorAnswers: Record<string, string | boolean>;
  additionalContext?: string;
  localScore?: number;
  useAdvancedReasoning?: boolean;
}

interface SimilarCasesRequest {
  action: 'findSimilarCases';
  caseType: string;
  jurisdiction: string;
  factorAnswers: Record<string, string | boolean>;
  predictionScore: number;
  additionalContext?: string;
  contextCases?: ComparableCase[];
}

interface ComparableCase {
  caseName: string;
  jurisdiction: string;
  year: number;
  relevanceScore: number;
  factPattern: string;
  keyFacts: string[];
  outcome: string;
  outcomeType: 'favorable' | 'unfavorable' | 'settled' | 'mixed';
  damages?: string;
  keyTakeaway: string;
  citation?: string;
}

interface EducationalPattern {
  patternDescription: string;
  typicalFactors: string[];
  typicalOutcome: string;
  outcomeType: 'favorable' | 'unfavorable' | 'settled' | 'mixed';
  keyTakeaway: string;
  disclaimer: string;
}

interface LegacyRequest {
  caseId?: string;
  caseSource?: string;
  tenantId?: string;
  apiKey?: string;
  caseData?: {
    caseType: string;
    subtopic?: string;
    jurisdiction: string;
    courtLevel?: string;
    urgencyLevel: string;
    incomeEligible: boolean;
    hasDocumentation: boolean;
    documentationQuality: string;
    hasOpposingCounsel: boolean;
    opposingFirmSize?: string;
    attorneySpecialtyMatch: boolean;
    attorneyYearsExperience: number;
    caseComplexity?: string;
    caseAge?: string;
    priorRulings?: string;
    clientType?: string;
    estimatedValue?: string;
    householdSize?: number;
    issueDescription?: string;
    proBonoEligible?: boolean;
  };
}

type PredictionRequest = FactorBasedRequest | LegacyRequest | SimilarCasesRequest;

function isSimilarCasesRequest(request: PredictionRequest): request is SimilarCasesRequest {
  return 'action' in request && request.action === 'findSimilarCases';
}

interface PredictionFactors {
  factor: string;
  impact: "positive" | "negative" | "neutral";
  weight: number;
  description: string;
  reasoning?: string;
}

const CASE_TYPE_PROMPTS: Record<string, string> = {
  housing: `You are analyzing a landlord-tenant or housing law case. Key factors include:
- Written lease agreements and their terms
- Rent payment history
- Proper notice requirements
- Habitability issues and documented repairs
- Retaliation claims
- Security deposit handling
Consider state-specific tenant protection laws.`,

  family: `You are analyzing a family law case (custody, divorce, support). Key factors include:
- Primary caregiver status
- Stable living arrangements
- Employment and financial stability
- Any domestic violence history
- Willingness to co-parent
- Children's preferences (if applicable)
- Substance abuse concerns
Consider the best interests of the child standard.`,

  employment: `You are analyzing an employment law case. Key factors include:
- Written documentation of issues
- Witness availability
- Protected class discrimination
- HR complaint history
- EEOC/agency filings
- Employer size and resources
- Timing suggesting retaliation
Consider at-will employment doctrines and exceptions.`,

  consumer: `You are analyzing a consumer protection case. Key factors include:
- FDCPA violations by collectors
- Debt validation requests
- Credit report errors and disputes
- Written dispute documentation
- Financial harm suffered
- Statute of limitations issues
Consider federal and state consumer protection statutes.`,

  immigration: `You are analyzing an immigration case. Key factors include:
- Current immigration status
- US family ties
- Criminal history
- Asylum grounds (if applicable)
- Prior removal orders
- Length of US residence
Consider current immigration policy and discretionary factors.`,

  benefits: `You are analyzing a government benefits case. Key factors include:
- Medical documentation quality
- Work history sufficiency
- Stage of appeals process
- Treating physician support
- Functional limitations documentation
- Age-related grid rules
Consider SSA regulations and medical-vocational guidelines.`,

  personal_injury: `You are analyzing a personal injury case. Key factors include:
- Clarity of liability
- Medical documentation timing
- Insurance coverage availability
- Witness and evidence quality
- Injury severity
- Comparative negligence issues
Consider damage caps and tort reform in the jurisdiction.`,

  criminal: `You are analyzing a criminal defense case. Key factors include:
- Charge severity (misdemeanor vs felony)
- Prior criminal record
- Strength of evidence
- Constitutional issues (search, Miranda)
- Diversion program eligibility
- Victim cooperation
Consider plea bargaining trends and sentencing guidelines.`,
};

const JURISDICTION_CONTEXT: Record<string, string> = {
  CA: "California has strong tenant, employee, and consumer protections. Community property state. Strong whistleblower laws.",
  NY: "New York has robust rent stabilization in NYC, strong employment protections, and consumer-friendly laws.",
  TX: "Texas is an at-will employment state with generally landlord-friendly laws. Community property state.",
  FL: "Florida follows comparative negligence. No state income tax affects benefit calculations. Strong HOA laws.",
  AZ: "Arizona has the ARLTA for tenant protections. Community property state. Employer-friendly employment laws.",
  IL: "Illinois has strong employee protections and consumer protection laws. Cook County has specific housing rules.",
  PA: "Pennsylvania has varied tenant protections by municipality. Strong workers compensation system.",
  OH: "Ohio follows comparative negligence. At-will employment with some exceptions.",
  GA: "Georgia is an at-will employment state with limited tenant protections outside Atlanta.",
  NC: "North Carolina has limited tenant protections. At-will employment state.",
  NJ: "New Jersey has strong tenant, employee, and consumer protections. Landlords must provide written receipts.",
  VA: "Virginia has the VRLTA. At-will employment with expanding protections.",
  WA: "Washington has strong tenant and employee protections. No state income tax.",
  MA: "Massachusetts has very strong tenant, employee, and consumer protections.",
  CO: "Colorado has expanding tenant and employee protections. Recent rent control preemption changes.",
  MN: "Minnesota has strong tenant and employee protections. Human Rights Act provides broad coverage.",
  OR: "Oregon has statewide rent control and strong tenant protections. Strong employee protections.",
  CT: "Connecticut has strong employee and consumer protections.",
  MD: "Maryland has strong tenant protections in some counties. Good employee protections.",
};

async function generateAdvancedPrediction(
  request: FactorBasedRequest,
  openaiKey: string
): Promise<{ score: number; reasoning: string; recommendations: string[] }> {
  const caseTypePrompt = CASE_TYPE_PROMPTS[request.caseType] || "You are analyzing a legal case.";
  const jurisdictionContext = JURISDICTION_CONTEXT[request.jurisdiction] || "";

  const factorSummary = Object.entries(request.factorAnswers)
    .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value}`)
    .join('\n');

  const systemPrompt = `You are an expert legal analyst AI assistant modeled after Blue J Legal's predictive analytics approach. Your role is to:

1. Analyze case factors objectively based on historical outcomes
2. Provide transparent reasoning explaining WHY each factor matters
3. Give confidence-calibrated predictions (not overconfident)
4. Offer actionable, practical recommendations
5. Always remind users to consult with an attorney for legal advice

${caseTypePrompt}

Jurisdiction context for ${request.jurisdiction}: ${jurisdictionContext}

IMPORTANT:
- Never guarantee outcomes
- Explain uncertainty when factors are unclear
- Focus on what the user can DO to improve their situation
- Use plain, accessible language`;

  const userPrompt = `Analyze this ${request.caseType} case in ${request.jurisdiction}:

CASE FACTORS:
${factorSummary}

${request.additionalContext ? `ADDITIONAL CONTEXT: ${request.additionalContext}` : ''}

Local algorithm estimated score: ${request.localScore || 'Not provided'}

Please provide:
1. A refined prediction score (0-100) based on your analysis
2. A clear, plain-language reasoning summary (2-3 sentences) explaining the outlook
3. 3-4 specific, actionable recommendations

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "reasoning": "<2-3 sentence plain-language analysis>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 800,
        temperature: 0.4,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    return {
      score: Math.max(0, Math.min(100, result.score || request.localScore || 50)),
      reasoning: result.reasoning || "",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations.slice(0, 4) : [],
    };
  } catch (error) {
    console.error("Advanced prediction error:", error);
    return {
      score: request.localScore || 50,
      reasoning: "",
      recommendations: [],
    };
  }
}

function isFactorBasedRequest(request: PredictionRequest): request is FactorBasedRequest {
  return 'factorAnswers' in request && typeof request.factorAnswers === 'object' && !('action' in request);
}

async function findSimilarCases(
  request: SimilarCasesRequest,
  openaiKey: string
): Promise<{ cases: ComparableCase[]; educationalPatterns: EducationalPattern[]; sourceMode: "verified_cases" | "illustrative_patterns"; warning: string }> {
  if (request.contextCases && request.contextCases.length > 0) {
    const verifiedCases: ComparableCase[] = request.contextCases.map((c) => ({
      caseName: c.caseName,
      jurisdiction: c.jurisdiction,
      year: c.year,
      relevanceScore: c.relevanceScore,
      factPattern: c.factPattern,
      keyFacts: Array.isArray(c.keyFacts) ? c.keyFacts : [],
      outcome: c.outcome,
      outcomeType: ['favorable', 'unfavorable', 'settled', 'mixed'].includes(c.outcomeType) ? c.outcomeType : 'mixed',
      damages: c.damages,
      keyTakeaway: c.keyTakeaway,
      citation: c.citation,
    }));

    return {
      cases: verifiedCases,
      educationalPatterns: [],
      sourceMode: "verified_cases",
      warning: "Cases sourced from provided verified data. Always confirm with an attorney.",
    };
  }

  const caseTypePrompt = CASE_TYPE_PROMPTS[request.caseType] || "a legal case";
  const factorSummary = Object.entries(request.factorAnswers)
    .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value}`)
    .join('\n');

  const systemPrompt = `You are a legal education assistant. You describe GENERAL PATTERNS seen in case law — you do NOT generate fake case names, fake citations, fake years, or fake dollar amounts.

Your output must be clearly labeled as illustrative patterns, not real cases.

${caseTypePrompt}`;

  const userPrompt = `Describe 3-4 general outcome patterns commonly seen in ${request.caseType} matters in ${request.jurisdiction} with these fact patterns:

${factorSummary}

For each pattern, provide:
1. A description of the typical fact pattern (no fake names)
2. Typical factors that lead to this outcome
3. The typical outcome
4. A key takeaway

Respond in JSON:
{
  "patterns": [
    {
      "patternDescription": "<general description without fake names or citations>",
      "typicalFactors": ["<factor 1>", "<factor 2>"],
      "typicalOutcome": "<what typically happens>",
      "outcomeType": "<favorable|unfavorable|settled|mixed>",
      "keyTakeaway": "<actionable lesson>"
    }
  ]
}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    const patterns: EducationalPattern[] = (result.patterns || []).slice(0, 4).map((p: Record<string, unknown>) => ({
      patternDescription: (p.patternDescription as string) || "",
      typicalFactors: Array.isArray(p.typicalFactors) ? p.typicalFactors as string[] : [],
      typicalOutcome: (p.typicalOutcome as string) || "",
      outcomeType: ['favorable', 'unfavorable', 'settled', 'mixed'].includes(p.outcomeType as string) ? p.outcomeType as EducationalPattern['outcomeType'] : 'mixed',
      keyTakeaway: (p.keyTakeaway as string) || "",
      disclaimer: "Illustrative pattern, not a real case.",
    }));

    return {
      cases: [],
      educationalPatterns: patterns,
      sourceMode: "illustrative_patterns",
      warning: "No verified case data provided. Patterns shown are illustrative and do not represent real cases. Do not cite these as authority.",
    };
  } catch (error) {
    console.error("Educational patterns error:", error);
    return {
      cases: [],
      educationalPatterns: [],
      sourceMode: "illustrative_patterns",
      warning: "Unable to generate patterns. No verified case data available.",
    };
  }
}

function calculateLegacyPrediction(caseData: LegacyRequest["caseData"]): {
  score: number;
  confidence: "low" | "medium" | "high";
  outcome: "favorable" | "unfavorable" | "likely_settled" | "uncertain";
  factors: PredictionFactors[];
  recommendations: string[];
} {
  if (!caseData) {
    return {
      score: 50,
      confidence: "low",
      outcome: "uncertain",
      factors: [],
      recommendations: ["Provide more case details for accurate prediction"],
    };
  }

  let score = 50;
  const factors: PredictionFactors[] = [];
  const recommendations: string[] = [];

  const docQualityImpact: Record<string, number> = {
    excellent: 20,
    complete: 15,
    partial: 5,
    none: -15,
  };
  const docImpact = docQualityImpact[caseData.documentationQuality] || 0;
  score += docImpact;
  factors.push({
    factor: "Documentation Quality",
    impact: docImpact > 0 ? "positive" : docImpact < 0 ? "negative" : "neutral",
    weight: Math.abs(docImpact),
    description: `${caseData.documentationQuality} documentation level`,
    reasoning: "Courts heavily weigh documented evidence",
  });

  if (caseData.attorneySpecialtyMatch) {
    score += 12;
    factors.push({
      factor: "Attorney Specialty Match",
      impact: "positive",
      weight: 12,
      description: "Attorney specializes in this case type",
      reasoning: "Specialized knowledge improves case strategy",
    });
  }

  if (caseData.hasOpposingCounsel) {
    const firmMod = caseData.opposingFirmSize === "large" ? -18 : -10;
    score += firmMod;
    factors.push({
      factor: "Opposing Counsel",
      impact: "negative",
      weight: Math.abs(firmMod),
      description: "Opposing party has legal representation",
      reasoning: "Represented parties typically have procedural advantages",
    });
  } else {
    score += 10;
  }

  const caseTypeRates: Record<string, number> = {
    housing: 8, consumer: 10, benefits: 7, employment: 5,
    family: 3, immigration: -2, civil_rights: -5, criminal: -8,
  };
  score += caseTypeRates[caseData.caseType] || 0;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const confidence = score > 70 || score < 30 ? "high" : score > 40 && score < 60 ? "low" : "medium";

  let outcome: "favorable" | "unfavorable" | "likely_settled" | "uncertain";
  if (score >= 70) outcome = "favorable";
  else if (score >= 50) outcome = "likely_settled";
  else if (score >= 30) outcome = "uncertain";
  else outcome = "unfavorable";

  if (score < 50) {
    recommendations.push("Consider settlement negotiation to minimize costs and uncertainty");
  }
  if (score >= 65) {
    recommendations.push("Strong position - consider proceeding with full resolution strategy");
  }

  factors.sort((a, b) => b.weight - a.weight);

  return { score, confidence, outcome, factors: factors.slice(0, 8), recommendations };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const tenantId = req.headers.get("X-Tenant-ID") || "ezlegal";
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("X-Api-Key");

    let isAuthenticated = false;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (token) {
        const { data: userData } = await supabase.auth.getUser(token);
        if (userData?.user) {
          isAuthenticated = true;
        }
      }
      isAuthenticated = true;
    }

    if (apiKey) {
      const { data: widget } = await supabase
        .from("embed_widgets")
        .select("id, tenant_id")
        .eq("api_key", apiKey)
        .eq("is_active", true)
        .maybeSingle();

      if (widget) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated && !authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: PredictionRequest = await req.json();

    if (isSimilarCasesRequest(requestData)) {
      if (!openaiKey) {
        return new Response(
          JSON.stringify({ error: "Similar cases feature requires AI configuration" }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await findSimilarCases(requestData, openaiKey);

      return new Response(
        JSON.stringify({
          cases: result.cases,
          educationalPatterns: result.educationalPatterns,
          metadata: {
            caseType: requestData.caseType,
            jurisdiction: requestData.jurisdiction,
            generatedAt: new Date().toISOString(),
            sourceMode: result.sourceMode,
            warning: result.warning,
          },
          modelInfo: {
            version: "v3.1",
            aiEnhanced: true,
            accuracyEvidence: "not independently verified",
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isFactorBasedRequest(requestData)) {
      let prediction = {
        score: requestData.localScore || 50,
        reasoning: "",
        recommendations: [] as string[],
      };

      if (openaiKey && requestData.useAdvancedReasoning) {
        prediction = await generateAdvancedPrediction(requestData, openaiKey);
      }

      const confidence = prediction.score >= 75 ? "high" : prediction.score >= 55 ? "medium" : "low";
      let predictedOutcome: "favorable" | "unfavorable" | "likely_settled" | "uncertain";
      if (prediction.score >= 70) predictedOutcome = "favorable";
      else if (prediction.score >= 50) predictedOutcome = "likely_settled";
      else if (prediction.score >= 30) predictedOutcome = "uncertain";
      else predictedOutcome = "unfavorable";

      return new Response(
        JSON.stringify({
          prediction: {
            score: prediction.score,
            confidence,
            predictedOutcome,
            factors: [],
            recommendations: prediction.recommendations,
            reasoning: prediction.reasoning,
          },
          modelInfo: {
            version: "v3.1",
            aiEnhanced: !!openaiKey && requestData.useAdvancedReasoning,
            accuracyEvidence: "not independently verified",
          },
          tenantId,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const legacyRequest = requestData as LegacyRequest;
    let caseData = legacyRequest.caseData;

    if (legacyRequest.caseId && legacyRequest.caseSource && !caseData) {
      const { data: caseRecord } = await supabase
        .from(legacyRequest.caseSource)
        .select("*")
        .eq("id", legacyRequest.caseId)
        .maybeSingle();

      if (caseRecord) {
        caseData = {
          caseType: caseRecord.legal_issue_type || caseRecord.legal_issue_category || "other",
          jurisdiction: caseRecord.state || "AZ",
          urgencyLevel: caseRecord.urgency_level || "medium",
          incomeEligible: caseRecord.income_eligible !== false,
          hasDocumentation: !!caseRecord.intake_notes || !!caseRecord.legal_issue_description,
          documentationQuality: caseRecord.intake_notes?.length > 200 ? "complete" : "partial",
          hasOpposingCounsel: !!caseRecord.opposing_party_name,
          attorneySpecialtyMatch: !!caseRecord.assigned_attorney_id,
          attorneyYearsExperience: 5,
          issueDescription: caseRecord.issue_description || caseRecord.legal_issue_description,
        };
      }
    }

    const prediction = calculateLegacyPrediction(caseData);

    if (legacyRequest.caseId && legacyRequest.caseSource) {
      await supabase.from("case_outcome_predictions").insert({
        tenant_id: tenantId,
        case_id: legacyRequest.caseId,
        case_source: legacyRequest.caseSource,
        prediction_score: prediction.score,
        confidence_level: prediction.confidence,
        predicted_outcome: prediction.outcome,
        factors: prediction.factors,
        recommendations: prediction.recommendations,
        model_version: "v3.1",
        request_metadata: { input: caseData },
      }).catch(err => console.error("Failed to store prediction:", err));
    }

    return new Response(
      JSON.stringify({
        prediction: {
          score: prediction.score,
          confidence: prediction.confidence,
          predictedOutcome: prediction.outcome,
          factors: prediction.factors,
          recommendations: prediction.recommendations,
        },
        modelInfo: {
          version: "v3.1",
          aiEnhanced: false,
          accuracyEvidence: "not independently verified",
        },
        tenantId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Prediction error:", error);
    return new Response(
      JSON.stringify({ error: "Prediction failed", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
