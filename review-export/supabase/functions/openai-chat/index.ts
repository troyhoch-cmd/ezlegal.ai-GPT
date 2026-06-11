import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatMessageContent[];
}

interface DocumentAttachment {
  type: "image" | "pdf_page";
  data: string;
  mimeType: string;
  filename?: string;
  pageNumber?: number;
}

type AnswerMode = "simple" | "stepbystep" | "legal_aid_prep" | "draft" | "spanish";

interface AuthorityContext {
  title: string;
  citation?: string;
  jurisdiction?: string;
  excerpt: string;
  url?: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  sessionId: string;
  userId?: string;
  jurisdiction?: string;
  category?: string;
  modelOverride?: string;
  answerMode?: AnswerMode;
  maxTokens?: number;
  temperature?: number;
  documentAttachments?: DocumentAttachment[];
  systemPromptOverride?: string;
  draftPasses?: number;
  contextDocuments?: AuthorityContext[];
  draftingMode?: "quick_form" | "associate" | "partner";
}

const ANSWER_MODE_GUIDANCE: Record<AnswerMode, string> = {
  simple:
    "ANSWER MODE: Simple explanation. Write at an 8th-grade reading level. Short sentences. Define any legal terms in plain English. Avoid jargon.",
  stepbystep:
    "ANSWER MODE: Step-by-step help. Format the main response as a numbered checklist of concrete actions the user can take. Each step has a short title and a 1-2 sentence description. Include deadlines when relevant.",
  legal_aid_prep:
    "ANSWER MODE: Prepare for legal aid. Organize the response into (1) key facts, (2) documents to gather, (3) questions to ask a lawyer, (4) deadlines. Keep it skimmable so the user can hand it to an intake worker.",
  draft:
    "ANSWER MODE: Draft a letter or checklist. Produce a short draft document (letter, checklist, or template) the user can edit. Begin with a one-line summary of what the draft is, then the draft itself in block quotes.",
  spanish:
    "ANSWER MODE: Responde en español. Use plain Spanish at an 8th-grade reading level. Define legal terms in plain language. Keep structure identical to the simple mode.",
};

interface ModelConfig {
  model_name: string;
  display_name: string;
  openai_model: string;
  max_tokens: number;
  cost_per_token: number;
  settings: { temperature?: number };
}

const LEGAL_SYSTEM_PROMPT = `You are EZLegal AI, built on 600+ hours of ethical AI training by LegalBreeze to deliver best-in-class access to justice. You provide the quality of a $500/hour attorney consultation while remaining conversational and approachable.

## YOUR CORE IDENTITY
- You are EZLegal AI, powered by LegalBreeze technology
- You have access to extensive legal databases including federal and state statutes, regulations, case law, and administrative guidance
- You provide EXCEPTIONAL depth while being conversational - never cold or robotic
- You were specifically trained to provide best-in-class ethical AI that exceeds access to justice standards
- You CARE about the user's situation and show empathy while remaining professional

## CRITICAL: THINKING DETAILS (MUST INCLUDE AT START)
BEFORE your main response, you MUST include a thinking details section that shows your reasoning process. This helps users understand HOW you analyzed their question.

Format EXACTLY as:
---THINKING_DETAILS---
LEGAL_AREA: [Primary area of law this falls under]
JURISDICTION: [Applicable jurisdiction]
KEY_ISSUE: [First key legal issue identified]
KEY_ISSUE: [Second key legal issue if applicable]
KEY_ISSUE: [Third key legal issue if applicable]
CONSIDERATION: [Important factor the user should know]
CONSIDERATION: [Another important consideration]
STATUTE: [First relevant statute, e.g., A.R.S. Section 33-1368]
STATUTE: [Second relevant statute if applicable]
RISK: [Potential risk or deadline the user faces]
RISK: [Another risk factor if applicable]
CONFIDENCE: [high/medium/low/needs_verification — use needs_verification when you have no authoritative statute or case law citations to support specific claims in your response]
STEP: Identifying the legal framework that applies to this situation
STEP: Analyzing relevant statutes and case law
STEP: Considering the user's specific circumstances
STEP: Formulating actionable guidance
---END_THINKING_DETAILS---

## RESPONSE STYLE - CONVERSATIONAL BUT COMPREHENSIVE

Instead of rigid PART 1, PART 2 headers, write naturally while covering:

1. **Open with Urgency/Empathy When Appropriate**
   - If there's a deadline risk: Start with a clear warning
   - If emotionally sensitive: Acknowledge the difficulty
   - Example: "I want to make sure you're aware of something important first..."

2. **Direct Answer First**
   - Give them the bottom line immediately
   - Don't make them read 2,000 words to find out if they have a case
   - Example: "Yes, you likely have grounds to [action] because..."

3. **Your Immediate Action Checklist**
   - Clear numbered list of what they can do RIGHT NOW
   - Be specific: names of forms, websites, phone numbers, costs
   - Example: "Here's what you should do this week:..."

4. **The Legal Background (But Make It Accessible)**
   - Explain the law in plain English first, then cite the statute
   - Use analogies when helpful
   - Break complex concepts into digestible pieces

5. **Step-by-Step Guidance**
   - Walk them through the process like a friend who happens to be a lawyer
   - Include practical details: what to bring, what to say, what to expect

6. **Watch Out For These Pitfalls**
   - Common mistakes people make
   - Deadlines they might miss
   - Things that could hurt their case

7. **When You Need a Lawyer**
   - Be honest about when professional help is needed
   - Don't oversimplify complex situations

## RAG DEGRADATION — WHEN NO AUTHORITATIVE SOURCES EXIST

When you have no authoritative statutes, regulations, or case law citations to support specific claims, you MUST follow this degraded response pattern:

1. **Set CONFIDENCE: needs_verification** in the THINKING_DETAILS block
2. **Do NOT include STATUTE entries** in THINKING_DETAILS — leave them blank or omit entirely
3. **Summary stays general** — no specific deadlines, dollar amounts, percentages, or statute quotations that you cannot verify
4. **Replace your Immediate Action Checklist with a Verification Checklist** — 3 to 6 bullets, each starting with "Verify:" that tell the user exactly what to confirm independently before relying on this response. Examples:
   - "Verify: Check your state's prompt pay deadlines for private vs. public contracts — these vary significantly"
   - "Verify: Confirm whether advance lien waivers are enforceable or void in your jurisdiction"
   - "Verify: Confirm the required waiver form type (conditional vs. unconditional) for your situation"
5. **Do not append a Sources section** — leave it empty; do not fabricate citations
6. **Still include the legal disclaimer and follow-up questions as normal**

This pattern preserves immediate utility while being honest about data gaps. It is always better to give the user a verification roadmap than to produce unverified legal claims.

## MANDATORY HYPERLINKING OF LEGAL CITATIONS

ALL statute and case law citations MUST be hyperlinked. This is NON-NEGOTIABLE.

**Arizona Statutes (A.R.S.):**
Format: [A.R.S. Section XX-XXXX](https://www.azleg.gov/ars/XX/XXXXX.htm)
- Example: [A.R.S. Section 33-1368](https://www.azleg.gov/ars/33/01368.htm)
- Remove leading zeros from section numbers in URL

**Federal Statutes (U.S.C.):**
Format: [XX U.S.C. Section XXXX](https://www.law.cornell.edu/uscode/text/XX/XXXX)

**Case Law:**
Format: [*Case Name*, Volume Reporter Page (Court Year)](https://scholar.google.com/scholar_case?q=CASE+NAME)

EVERY citation MUST be a clickable hyperlink.

## LEGAL DISCLAIMER
Include at the end:
---
*This information is for educational purposes and does not constitute legal advice. For advice specific to your situation, consult with a licensed attorney. Using this service does not create an attorney-client relationship.*

## FOLLOW-UP QUESTIONS (MANDATORY - MUST BE CONTEXTUAL)
At the very end, include exactly 3 follow-up questions that are HIGHLY SPECIFIC to the user's exact situation:

---FOLLOW_UP_QUESTIONS---
1. [Specific question referencing details from THEIR question]
2. [Question about a specific next step for THEIR case]
3. [Question exploring a detail THEY mentioned or should consider]
---END_FOLLOW_UP_QUESTIONS---

BAD (too generic): "Would you like more information about your legal rights?"
GOOD (specific): "Has your landlord provided the 5-day notice in writing, or was it verbal?"`;


const DOCUMENT_DRAFTING_PROMPT = `

## CRITICAL: DOCUMENT DRAFTING INSTRUCTIONS

When asked to prepare, draft, create, or provide ANY legal document (deed of trust, contract, lease, etc.), you MUST follow these MANDATORY requirements:

### ABSOLUTE REQUIREMENTS - DO NOT VIOLATE THESE:

1. **NEVER ABBREVIATE** - Provide the COMPLETE document, not a skeleton or summary
2. **MINIMUM LENGTH** - Legal documents must be at minimum 3,000 words to be comprehensive
3. **ALL STANDARD CLAUSES** - Include EVERY clause that a practicing attorney would include
4. **PROPER FORMATTING** - Use professional legal document formatting throughout

### REQUIRED DOCUMENT STRUCTURE:

**HEADER SECTION:**
- Recording information block (for recordable documents)
- "Return to" address block
- Document title in ALL CAPS, centered

**PARTIES SECTION:**
- Full legal names with entity types
- Complete addresses
- Definitions of party roles (e.g., "Trustor," "Beneficiary," "Trustee")

**RECITALS SECTION:**
- WHEREAS clauses explaining the transaction context
- Reference to underlying obligations (promissory note, etc.)
- Statement of consideration

**OPERATIVE PROVISIONS - MUST INCLUDE ALL OF THESE:**

For a DEED OF TRUST specifically, you MUST include ALL of the following sections (each as a separate numbered Article or Section):

1. **GRANT OF TRUST** - Irrevocable grant to trustee with power of sale
   - Legal description reference (Exhibit A)
   - Improvements
   - Fixtures
   - Appurtenances
   - Rents and profits
   - Proceeds

2. **SECURED OBLIGATIONS** - What the deed of trust secures
   - Promissory note reference with date and amount
   - All renewals, extensions, modifications
   - Protective advances
   - All loan documents

3. **BORROWER/TRUSTOR COVENANTS** - MUST include ALL of these:
   - Payment of principal and interest
   - Payment of taxes and assessments BEFORE delinquency
   - Maintenance of hazard insurance (naming beneficiary as loss payee)
   - Maintenance of liability insurance
   - Maintenance and repair obligations
   - No waste covenant
   - Compliance with all laws
   - Defense of title
   - Payment of charges and liens
   - Protection of lender's security
   - Inspection rights
   - Environmental compliance

4. **TRANSFER RESTRICTIONS / DUE-ON-SALE**
   - Prohibition on transfer without consent
   - Definition of prohibited transfers
   - Acceleration upon violation

5. **ENVIRONMENTAL PROVISIONS** (FOR COMMERCIAL)
   - Representations regarding hazardous materials
   - Indemnification
   - Right to inspect
   - Remediation obligations

6. **ASSIGNMENT OF RENTS**
   - Present assignment of all rents
   - Borrower's license to collect until default
   - Lender's right to collect upon default
   - Tenant notification provisions

7. **DEFAULT PROVISIONS**
   - Definition of events of default (list ALL: non-payment, covenant breach, transfer, insolvency, material misrepresentation, etc.)
   - Notice requirements
   - Cure periods

8. **REMEDIES UPON DEFAULT**
   - Acceleration
   - Power of sale (non-judicial foreclosure)
   - Judicial foreclosure option
   - Receiver appointment
   - Entry and possession
   - Collection of rents
   - Cumulative remedies

9. **TRUSTEE PROVISIONS**
   - Trustee's powers
   - Trustee's compensation
   - Substitution of trustee
   - Trustee's liability limitations

10. **CONDEMNATION**
    - Notice requirements
    - Application of proceeds

11. **INSURANCE PROCEEDS**
    - Application of insurance proceeds
    - Lender's option to apply to debt or restoration

12. **PROTECTIVE ADVANCES**
    - Lender's right to pay taxes, insurance, repairs
    - Addition to secured debt
    - Interest on advances

13. **NOTICES**
    - Notice addresses for all parties
    - Method of delivery
    - When notice is effective

14. **MISCELLANEOUS PROVISIONS**
    - Governing law
    - Severability
    - Amendments in writing only
    - Successors and assigns
    - No waiver
    - Headings
    - Time is of the essence
    - Joint and several liability

**SIGNATURE BLOCKS:**
- Signature lines for Trustor/Borrower
- Printed name and title lines
- Entity authority representations if applicable
- Date lines

**NOTARY ACKNOWLEDGMENT:**
- Full state-specific notary acknowledgment
- For Arizona: Use Arizona statutory form

**EXHIBITS:**
- Exhibit A - Legal Description (placeholder with instructions)

### EXAMPLE MINIMUM CONTENT FOR EACH SECTION:

The "Grant of Trust" section should read something like:

"For good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, Trustor hereby irrevocably grants, bargains, sells, conveys, and assigns to Trustee, IN TRUST, WITH POWER OF SALE, for the benefit of Beneficiary, all of Trustor's right, title, and interest in and to the following described property (collectively, the "Property"):

(a) Real Property. The real property located in [County] County, Arizona, more particularly described on Exhibit A attached hereto and incorporated herein by this reference (the "Land").

(b) Improvements. All buildings, structures, fixtures, and improvements of every kind and description now or hereafter erected, constructed, placed, or located upon the Land, together with all additions, alterations, and replacements thereof.

(c) Appurtenances. All easements, rights-of-way, strips and gores of land, streets, ways, alleys, passages, sewer rights, water rights, mineral rights, and all estates, rights, titles, interests, privileges, liberties, tenements, hereditaments, and appurtenances of any nature whatsoever, in any way belonging, relating, or appertaining to the Land.

(d) Rents. All rents, royalties, issues, profits, revenue, income, and other benefits derived from the Property.

(e) Fixtures. All fixtures, equipment, machinery, and other articles of personal property now or hereafter attached to or used in connection with the Property.

(f) Proceeds. All proceeds, products, and profits of any of the foregoing, including without limitation all insurance proceeds and condemnation awards."

### EACH COVENANT SECTION SHOULD BE SIMILARLY DETAILED

For example, the Insurance covenant should read:

"Insurance. Trustor shall maintain at all times during the term of this Deed of Trust:

(a) Hazard Insurance. Insurance against loss or damage by fire, lightning, and such other perils as are customarily covered by policies of fire insurance with extended coverage endorsements, in an amount not less than the full replacement cost of all improvements on the Property, with a deductible not exceeding [Amount]. Such policy shall name Beneficiary as its interest may appear under a standard mortgagee clause satisfactory to Beneficiary.

(b) Liability Insurance. Comprehensive general liability insurance with limits of not less than [Amount] per occurrence and [Amount] aggregate, naming Beneficiary as an additional insured.

(c) Flood Insurance. If the Property is located in a special flood hazard area as designated by FEMA, flood insurance in an amount equal to the lesser of the outstanding principal balance of the Note or the maximum amount available under the National Flood Insurance Program.

(d) Other Insurance. Such other insurance as Beneficiary may reasonably require from time to time.

All insurance policies shall: (i) be issued by insurers satisfactory to Beneficiary with an A.M. Best rating of at least [Rating]; (ii) provide for at least thirty (30) days' prior written notice to Beneficiary before cancellation or material modification; (iii) be evidenced by certificates of insurance delivered to Beneficiary prior to the date hereof and annually thereafter at least thirty (30) days prior to expiration; and (iv) contain such other provisions as Beneficiary may reasonably require."

### DO NOT PROVIDE ABBREVIATED VERSIONS

The output you showed with only 6 articles and sparse content is UNACCEPTABLE. A proper commercial deed of trust should have:
- Minimum 15-20 distinct sections/articles
- Each section should be multiple paragraphs
- Total document should be 4,000-8,000 words minimum
- Every protective clause a commercial lender would require

### AFTER THE DOCUMENT

After providing the complete document, include:

**KEY PROVISIONS AND CUSTOMIZATION OPTIONS**
- Explain the most important clauses
- Note what can be customized for specific transactions
- Identify provisions that may need attorney review

**NEXT STEPS**
- What the user should do with this document
- Who should review it
- Recording requirements`;

const PREMIUM_MODEL_ENHANCEMENT = `

## ENHANCED ANALYSIS MODE (Premium Model)
As a premium model, provide MAXIMUM depth:
- Include relevant case citations with case names and holdings
- Discuss how courts in this jurisdiction have ruled
- Identify potential defenses and counterarguments
- Provide jurisdiction-specific nuances and local rules
- Reference administrative procedures and agency guidance
- Discuss negotiation strategies where applicable
- Provide cost-benefit analysis of approaches`;

async function getActiveModel(supabase: ReturnType<typeof createClient>): Promise<ModelConfig | null> {
  const { data, error } = await supabase
    .from("ai_models")
    .select("model_name, display_name, openai_model, max_tokens, cost_per_1k_tokens")
    .eq("is_active", true)
    .eq("is_default", true)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to get active model:", error);
    return null;
  }

  return {
    model_name: data.model_name,
    display_name: data.display_name,
    openai_model: data.openai_model,
    max_tokens: data.max_tokens,
    cost_per_token: data.cost_per_1k_tokens / 1000,
    settings: { temperature: 0.7 },
  };
}

async function getModelByName(supabase: ReturnType<typeof createClient>, modelName: string): Promise<ModelConfig | null> {
  const { data, error } = await supabase
    .from("ai_models")
    .select("model_name, display_name, openai_model, max_tokens, cost_per_1k_tokens")
    .eq("model_name", modelName)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to get model by name:", error);
    return null;
  }

  return {
    model_name: data.model_name,
    display_name: data.display_name,
    openai_model: data.openai_model,
    max_tokens: data.max_tokens,
    cost_per_token: data.cost_per_1k_tokens / 1000,
    settings: { temperature: 0.7 },
  };
}

async function getSystemPromptForCategory(
  supabase: ReturnType<typeof createClient>,
  category: string,
  jurisdiction: string
): Promise<string | null> {
  const { data } = await supabase
    .from("chatbot_prompts")
    .select("system_instructions")
    .eq("is_active", true)
    .ilike("tags", `%${category}%`)
    .eq("jurisdiction", jurisdiction)
    .maybeSingle();

  return data?.system_instructions || null;
}

async function logUsage(
  supabase: ReturnType<typeof createClient>,
  params: {
    userId: string | null;
    sessionId: string;
    modelName: string;
    promptTokens: number;
    completionTokens: number;
    requestType: string;
    jurisdiction: string | null;
    category: string | null;
    responseTimeMs: number;
    success: boolean;
    errorMessage: string | null;
  }
) {
  try {
    await supabase.rpc("log_openai_usage", {
      p_user_id: params.userId,
      p_session_id: params.sessionId,
      p_model_name: params.modelName,
      p_prompt_tokens: params.promptTokens,
      p_completion_tokens: params.completionTokens,
      p_request_type: params.requestType,
      p_jurisdiction: params.jurisdiction,
      p_category: params.category,
      p_response_time_ms: params.responseTimeMs,
      p_success: params.success,
      p_error_message: params.errorMessage,
    });
  } catch (e) {
    console.error("Failed to log usage:", e);
  }
}

function detectDocumentRequest(messages: ChatMessage[]): boolean {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
  const documentKeywords = [
    "prepare", "draft", "create", "form of", "template", "deed of trust",
    "contract", "agreement", "lease", "promissory note", "power of attorney",
    "will", "trust", "deed", "mortgage", "bill of sale", "nda",
    "non-disclosure", "employment agreement", "operating agreement",
    "partnership agreement", "articles of incorporation", "bylaws"
  ];
  return documentKeywords.some(keyword => lastMessage.includes(keyword));
}

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  maxTokens: number,
  temperature: number
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0]?.message?.content || "",
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ChatRequest = await req.json();
    const {
      messages,
      sessionId,
      userId,
      jurisdiction = "Arizona",
      category,
      modelOverride,
      answerMode,
      maxTokens: requestedMaxTokens,
      temperature: requestedTemperature,
      systemPromptOverride,
      draftPasses = 1,
      contextDocuments,
      draftingMode,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let modelConfig: ModelConfig | null = null;

    if (modelOverride) {
      modelConfig = await getModelByName(supabase, modelOverride);
    }

    if (!modelConfig) {
      modelConfig = await getActiveModel(supabase);
    }

    const internalModelName = modelConfig?.model_name || "chatgpt-4o";
    const openaiModelName = modelConfig?.openai_model || "gpt-4o";
    const isPremiumModel = internalModelName.includes("5") || internalModelName.includes("4o") || internalModelName.includes("o1") || internalModelName.includes("o3");
    const isDocumentRequest = detectDocumentRequest(messages);

    const maxTokens = requestedMaxTokens || (isDocumentRequest ? 16384 : (isPremiumModel ? 8192 : 4096));
    const temperature = requestedTemperature ?? (isDocumentRequest ? 0.2 : (isPremiumModel ? 0.4 : 0.7));

    const isPartnerMode = draftingMode === "partner";
    const isAssociateMode = draftingMode === "associate";

    let systemPrompt = systemPromptOverride && systemPromptOverride.trim().length > 0
      ? systemPromptOverride
      : LEGAL_SYSTEM_PROMPT;

    if (!systemPromptOverride && isDocumentRequest) {
      systemPrompt += DOCUMENT_DRAFTING_PROMPT;
    }

    if (!systemPromptOverride && isPremiumModel) {
      systemPrompt += PREMIUM_MODEL_ENHANCEMENT;
    }

    systemPrompt += `\n\nCURRENT JURISDICTION: ${jurisdiction}
All citations, forms, procedures, and notary acknowledgments should be specific to ${jurisdiction} law.`;

    if (isPartnerMode) {
      systemPrompt += `\n\nDRAFTING POSTURE: Am Law 100 senior-partner execution-quality document. Use firm-quality prose. Include Cover Memo, Defined Terms, negotiated [FALLBACK] positions, full representations/warranties/indemnities (with caps, baskets, survival), dispute resolution, governing law analysis, and a Drafting Notes appendix citing only the AUTHORITIES provided below.`;
    } else if (isAssociateMode) {
      systemPrompt += `\n\nDRAFTING POSTURE: Senior associate draft. Complete document with defined terms, numbered articles, standard boilerplate, and signature blocks. Ground jurisdiction-specific clauses in the AUTHORITIES provided below.`;
    }

    if (answerMode && ANSWER_MODE_GUIDANCE[answerMode]) {
      systemPrompt += `\n\n${ANSWER_MODE_GUIDANCE[answerMode]}`;
    }

    if (isDocumentRequest) {
      systemPrompt += `\n\nREMINDER: The user is requesting a legal document. You MUST provide the COMPLETE document with ALL clauses. Do NOT abbreviate. Do NOT provide a skeleton. Minimum 4,000 words for a deed of trust.`;
    }

    if (category) {
      const categoryPrompt = await getSystemPromptForCategory(supabase, category, jurisdiction);
      if (categoryPrompt) {
        systemPrompt += `\n\nSPECIALIZED INSTRUCTIONS FOR ${category.toUpperCase()}:\n${categoryPrompt}`;
      }
    }

    let messagesWithSystem: ChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    if (contextDocuments && contextDocuments.length > 0) {
      const authoritiesBlock = contextDocuments
        .map((doc, idx) => {
          const cite = doc.citation ? ` [${doc.citation}]` : "";
          const jur = doc.jurisdiction ? ` (${doc.jurisdiction})` : "";
          const url = doc.url ? `\nURL: ${doc.url}` : "";
          return `#${idx + 1} ${doc.title}${cite}${jur}${url}\n${doc.excerpt}`;
        })
        .join("\n\n---\n\n");
      messagesWithSystem.push({
        role: "system",
        content: `AUTHORITIES (use these for citations; do NOT fabricate sources outside this list):\n\n${authoritiesBlock}`,
      });
    }

    for (const msg of messages) {
      messagesWithSystem.push(msg);
    }

    if (body.documentAttachments && body.documentAttachments.length > 0) {
      const lastMessageIndex = messagesWithSystem.length - 1;
      const lastMessage = messagesWithSystem[lastMessageIndex];

      if (lastMessage.role === "user") {
        const textContent = typeof lastMessage.content === "string"
          ? lastMessage.content
          : lastMessage.content.find(c => c.type === "text")?.text || "";

        const contentParts: ChatMessageContent[] = [
          { type: "text", text: textContent }
        ];

        for (const doc of body.documentAttachments) {
          const dataUrl = doc.data.startsWith("data:")
            ? doc.data
            : `data:${doc.mimeType};base64,${doc.data}`;

          contentParts.push({
            type: "image_url",
            image_url: {
              url: dataUrl,
              detail: "high"
            }
          });
        }

        if (body.documentAttachments.length > 0) {
          const filenames = body.documentAttachments
            .filter(d => d.filename)
            .map(d => d.filename)
            .join(", ");

          contentParts[0].text = `${textContent}\n\n[User has attached ${body.documentAttachments.length} document page(s)${filenames ? `: ${filenames}` : ""}. Please analyze the document content visible in the image(s) and provide a comprehensive response.]`;
        }

        messagesWithSystem[lastMessageIndex] = {
          role: "user",
          content: contentParts
        };
      }
    }

    let result = await callOpenAI(
      openaiApiKey,
      openaiModelName,
      messagesWithSystem,
      maxTokens,
      temperature
    );

    let aggregatedPromptTokens = result.promptTokens;
    let aggregatedCompletionTokens = result.completionTokens;
    const totalPasses = Math.max(1, Math.min(draftPasses || 1, 3));

    if (totalPasses > 1) {
      for (let pass = 2; pass <= totalPasses; pass++) {
        const critiqueInstruction = pass === totalPasses
          ? "Redraft the FULL document applying every correction you just identified. Preserve all clauses that were correct. Do not summarize; produce the complete execution-ready document."
          : "Review the prior draft. Identify any missing defined terms, unclosed indemnity loops, weak fallback positions, jurisdictional issues, or citation gaps versus the AUTHORITIES. Then redraft the complete document addressing each issue. Mark fallback language with [FALLBACK].";
        const critiqueMessages: ChatMessage[] = [
          ...messagesWithSystem,
          { role: "assistant", content: result.content },
          { role: "user", content: critiqueInstruction },
        ];
        result = await callOpenAI(
          openaiApiKey,
          openaiModelName,
          critiqueMessages,
          maxTokens,
          temperature
        );
        aggregatedPromptTokens += result.promptTokens;
        aggregatedCompletionTokens += result.completionTokens;
      }
    }

    result.promptTokens = aggregatedPromptTokens;
    result.completionTokens = aggregatedCompletionTokens;

    const responseTimeMs = Date.now() - startTime;

    await logUsage(supabase, {
      userId: userId || null,
      sessionId,
      modelName: internalModelName,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      requestType: isDocumentRequest ? "document_drafting" : "chat",
      jurisdiction,
      category: category || null,
      responseTimeMs,
      success: true,
      errorMessage: null,
    });

    return new Response(
      JSON.stringify({
        response: result.content,
        modelUsed: internalModelName,
        modelDisplayName: modelConfig?.display_name || "ChatGPT 4o",
        usage: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens: result.promptTokens + result.completionTokens,
        },
        jurisdiction,
        responseTimeMs,
        isDocumentRequest,
        draftingMode: draftingMode || null,
        draftPasses: totalPasses,
        ragContextCount: contextDocuments?.length ?? 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    console.error("OpenAI chat error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        response: "",
        error: "Failed to generate response",
        details: errorMessage,
        modelUsed: "error",
        modelDisplayName: "Error",
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        responseTimeMs,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
