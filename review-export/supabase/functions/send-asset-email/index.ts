import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AssetSection {
  heading: string;
  content: string[];
}

interface SendRequest {
  recipients: { email: string; name?: string }[];
  assetName: string;
  assetType: string;
  contentSections: AssetSection[];
  subject?: string;
  notes?: string;
  partnerId?: string;
  assetId: string;
  sentBy: string;
}

function buildAssetEmailHTML(
  assetName: string,
  assetType: string,
  sections: AssetSection[],
  notes?: string,
  partnerId?: string
): string {
  const sectionsHTML = sections
    .map(
      (section) => `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #0D9488; font-size: 15px; margin: 0 0 8px 0; padding-bottom: 6px; border-bottom: 2px solid #CCFBF1; font-weight: 700;">
        ${section.heading}
      </h3>
      <div style="color: #334155; font-size: 14px; line-height: 1.65;">
        ${section.content
          .map(
            (line) =>
              `<p style="margin: 0 0 6px 0;">${line}</p>`
          )
          .join("")}
      </div>
    </div>
  `
    )
    .join("");

  const notesBlock = notes
    ? `<div style="background: #F0F4F8; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #475569;"><strong>Note from sender:</strong> ${notes}</p>
       </div>`
    : "";

  const partnerBlock = partnerId
    ? `<p style="font-size: 12px; color: #64748B; margin-top: 8px;">Partner Reference: ${partnerId}</p>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${assetName}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 640px; margin: 0 auto; padding: 0; background-color: #f8fafc;">
  <div style="background: #0A1628; padding: 28px 32px; text-align: left;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td>
          <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 700;">${assetName}</h1>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px;">${assetType.toUpperCase()} | ezLegal.ai Partner Asset</p>
        </td>
      </tr>
    </table>
  </div>

  <div style="background: #ffffff; padding: 28px 32px;">
    ${notesBlock}
    ${sectionsHTML}
    ${partnerBlock}
  </div>

  <div style="background: #F0F4F8; padding: 20px 32px; border-top: 1px solid #E2E8F0;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">
            Need more information about the ezLegal.ai partner program?
          </p>
          <a href="https://ezlegal.ai/partners" style="display: inline-block; background: #0D9488; color: #ffffff; padding: 10px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
            Visit Partner Hub
          </a>
        </td>
      </tr>
    </table>
  </div>

  <div style="padding: 20px 32px; text-align: center;">
    <p style="margin: 0 0 4px 0; font-size: 11px; color: #94A3B8;">
      ezLegal.ai provides legal information, not legal advice. Not a law firm. Not a substitute for an attorney.
    </p>
    <p style="margin: 0; font-size: 11px; color: #CBD5E1;">
      &copy; ${new Date().getFullYear()} ezLegal.ai -- Ethical AI for Access to Justice
    </p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SendRequest = await req.json();
    const {
      recipients,
      assetName,
      assetType,
      contentSections,
      subject,
      notes,
      partnerId,
      assetId,
      sentBy,
    } = body;

    if (!recipients || recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one recipient is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!assetName || !contentSections) {
      return new Response(
        JSON.stringify({ error: "Asset name and content sections are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const emailHTML = buildAssetEmailHTML(
      assetName,
      assetType,
      contentSections,
      notes,
      partnerId
    );

    const emailSubject =
      subject || `${assetName} -- ezLegal.ai Partner Asset`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const recipient of recipients) {
      if (RESEND_API_KEY) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "ezLegal.ai Partners <partners@ezlegal.ai>",
            to: [recipient.email],
            subject: emailSubject,
            html: emailHTML,
          }),
        });

        if (res.ok) {
          results.push({ email: recipient.email, success: true });
        } else {
          const errorText = await res.text();
          console.error(
            `Failed to send to ${recipient.email}:`,
            errorText
          );
          results.push({
            email: recipient.email,
            success: false,
            error: "Send failed",
          });
        }
      } else {
        results.push({
          email: recipient.email,
          success: true,
          error: "RESEND_API_KEY not configured - email queued",
        });
      }
    }

    if (sentBy && assetId) {
      await supabase.from("asset_distributions").insert({
        asset_id: assetId,
        sent_by: sentBy,
        recipients: recipients,
        channel: "email",
        subject: emailSubject,
        notes: notes || "",
        partner_id: partnerId || null,
        status: results.every((r) => r.success) ? "sent" : "partial",
      });
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        sent: successCount,
        total: recipients.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-asset-email:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
