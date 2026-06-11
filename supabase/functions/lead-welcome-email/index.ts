import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface LeadPayload {
  email: string;
  source: string;
  persona?: string;
  language?: string;
  metadata?: Record<string, unknown>;
}

function getWelcomeEmail(lead: LeadPayload): { subject: string; html: string } {
  const isSpanish = lead.language === "es";
  const persona = lead.persona || "consumer";

  if (persona === "smb" || lead.source === "business_landing") {
    return {
      subject: isSpanish
        ? "Tu checklist legal de negocio - ezLegal.ai"
        : "Your Business Legal Checkup - ezLegal.ai",
      html: isSpanish
        ? `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h1 style="color:#0f172a;font-size:24px;margin-bottom:16px">Bienvenido a ezLegal.ai</h1>
            <p style="color:#475569;line-height:1.6">Gracias por tu interés en ezLegal.ai para tu negocio. Aquí tienes tu checklist legal personalizada:</p>
            <ul style="color:#475569;line-height:2">
              <li>Revisión de contratos de empleo</li>
              <li>Cumplimiento de salarios y horarios</li>
              <li>Política de acoso y discriminación</li>
              <li>Protección de propiedad intelectual</li>
              <li>Cumplimiento de privacidad de datos</li>
            </ul>
            <a href="https://ezlegal.ai/ask?utm_source=email&utm_medium=welcome&utm_campaign=business_lead" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Haz tu primera pregunta gratis</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados.</p>
          </div>`
        : `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h1 style="color:#0f172a;font-size:24px;margin-bottom:16px">Welcome to ezLegal.ai</h1>
            <p style="color:#475569;line-height:1.6">Thanks for your interest in ezLegal.ai for your business. Here's your personalized legal compliance checklist:</p>
            <ul style="color:#475569;line-height:2">
              <li>Employment contract review</li>
              <li>Wage & hour compliance</li>
              <li>Harassment & discrimination policy</li>
              <li>Intellectual property protection</li>
              <li>Data privacy compliance</li>
            </ul>
            <a href="https://ezlegal.ai/ask?utm_source=email&utm_medium=welcome&utm_campaign=business_lead" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Ask your first question free</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">ezLegal.ai provides legal information, not legal advice. We are not a law firm.</p>
          </div>`,
    };
  }

  if (persona === "partner" || lead.source === "partner_landing") {
    return {
      subject: isSpanish
        ? "Solicitud de socio recibida - ezLegal.ai"
        : "Partner Application Received - ezLegal.ai",
      html: isSpanish
        ? `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h1 style="color:#0f172a;font-size:24px;margin-bottom:16px">Solicitud recibida</h1>
            <p style="color:#475569;line-height:1.6">Gracias por tu interés en asociarte con ezLegal.ai. Nuestro equipo revisará tu solicitud y te contactará en 24 horas.</p>
            <p style="color:#475569;line-height:1.6">Mientras tanto, puedes explorar nuestra documentación de integración:</p>
            <a href="https://ezlegal.ai/for-partners?utm_source=email&utm_medium=welcome&utm_campaign=partner_lead" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Ver opciones de integración</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">ezLegal.ai proporciona tecnología de información legal para socios.</p>
          </div>`
        : `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
            <h1 style="color:#0f172a;font-size:24px;margin-bottom:16px">Application Received</h1>
            <p style="color:#475569;line-height:1.6">Thanks for your interest in partnering with ezLegal.ai. Our team will review your application and reach out within 24 hours.</p>
            <p style="color:#475569;line-height:1.6">In the meantime, explore our integration documentation:</p>
            <a href="https://ezlegal.ai/for-partners?utm_source=email&utm_medium=welcome&utm_campaign=partner_lead" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">View integration options</a>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px">ezLegal.ai provides legal information technology for partners.</p>
          </div>`,
    };
  }

  // Default consumer welcome
  return {
    subject: isSpanish
      ? "Bienvenido a ezLegal.ai - Tu primera pregunta es gratis"
      : "Welcome to ezLegal.ai - Your first question is free",
    html: isSpanish
      ? `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h1 style="color:#0f172a;font-size:24px;margin-bottom:16px">Bienvenido a ezLegal.ai</h1>
          <p style="color:#475569;line-height:1.6">Estamos aquí para ayudarte a entender tus derechos y opciones legales. Haz preguntas ilimitadas gratis.</p>
          <a href="https://ezlegal.ai/ask?utm_source=email&utm_medium=welcome&utm_campaign=consumer_lead" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Haz tu pregunta ahora</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">ezLegal.ai proporciona información legal, no asesoramiento legal. No somos un bufete de abogados.</p>
        </div>`
      : `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h1 style="color:#0f172a;font-size:24px;margin-bottom:16px">Welcome to ezLegal.ai</h1>
          <p style="color:#475569;line-height:1.6">We're here to help you understand your legal rights and options. Ask unlimited questions for free.</p>
          <a href="https://ezlegal.ai/ask?utm_source=email&utm_medium=welcome&utm_campaign=consumer_lead" style="display:inline-block;background:#0d9488;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px">Ask your question now</a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">ezLegal.ai provides legal information, not legal advice. We are not a law firm.</p>
        </div>`,
  };
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log(`[DRY RUN] Would send to ${to}: "${subject}"`);
    return { success: true, dry_run: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ezLegal.ai <hello@ezlegal.ai>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API error: ${res.status} ${err}`);
  }

  return await res.json();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: LeadPayload = await req.json();

    if (!payload.email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the lead
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from("lead_captures").insert({
      email: payload.email,
      source: payload.source || "unknown",
      persona: payload.persona,
      language: payload.language || "en",
      metadata: payload.metadata || {},
    });

    // Send welcome email
    const { subject, html } = getWelcomeEmail(payload);
    const emailResult = await sendEmail(payload.email, subject, html);

    return new Response(
      JSON.stringify({ success: true, email_sent: !!emailResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
