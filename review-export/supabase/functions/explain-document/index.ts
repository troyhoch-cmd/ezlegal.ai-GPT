import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExplainRequest {
  text: string;
  language?: "en" | "es";
  kind?: string;
}

interface ExplainResponse {
  summary: string;
  what_it_is: string;
  who_sent_it: string;
  what_they_want: string;
  deadlines: string[];
  risks: string[];
  suggested_next_steps: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = (await req.json()) as ExplainRequest;
    const { text, language = "en", kind = "other" } = body;

    if (!text || text.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: "Document text too short to analyze" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const truncated = text.slice(0, 12000);

    const system = language === "es"
      ? "Eres un asistente que explica documentos legales en espanol claro. NO es asesoria legal. Responde SOLO con JSON valido."
      : "You explain legal documents in plain English. This is NOT legal advice. Respond with ONLY valid JSON.";

    const schema = {
      summary: language === "es" ? "Resumen en 1-2 oraciones" : "1-2 sentence summary",
      what_it_is: language === "es" ? "Que tipo de documento es" : "What type of document this is",
      who_sent_it: language === "es" ? "Quien lo envio" : "Who sent it",
      what_they_want: language === "es" ? "Que pide o afirma" : "What they want or claim",
      deadlines: language === "es" ? "Lista de fechas/plazos mencionados (array de strings)" : "List of deadlines mentioned (array of strings)",
      risks: language === "es" ? "Riesgos si ignoras esto (array)" : "Risks if ignored (array)",
      suggested_next_steps: language === "es" ? "Proximos pasos sugeridos (array)" : "Suggested next steps (array)",
    };

    const user = `Document type: ${kind}\n\nDocument text:\n"""\n${truncated}\n"""\n\nReturn JSON with these keys:\n${JSON.stringify(schema, null, 2)}`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      return new Response(
        JSON.stringify({ error: "AI service failed", detail: errText.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: ExplainResponse;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        summary: content.slice(0, 500),
        what_it_is: "",
        who_sent_it: "",
        what_they_want: "",
        deadlines: [],
        risks: [],
        suggested_next_steps: [],
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
