import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GUIDE_CONTENT = {
  general: {
    title: "Know Your Legal Rights",
    subtitle: "Essential Guide for U.S. Residents",
    sections: [
      {
        title: "Tenant Rights (Federal)",
        items: [
          "Fair Housing Act protects against discrimination based on race, color, religion, sex, national origin, disability, and familial status",
          "Landlords must provide habitable conditions including working plumbing, heating, and structural safety",
          "Security deposits have legal limits in most states - typically 1-2 months rent",
          "Written notice is required before eviction proceedings can begin",
          "Tenants have the right to request reasonable accommodations for disabilities",
        ],
      },
      {
        title: "Employment Rights",
        items: [
          "Federal minimum wage is $7.25/hour (many states have higher minimums)",
          "Overtime pay (1.5x regular rate) required after 40 hours/week for non-exempt employees",
          "Protection from workplace discrimination based on protected characteristics",
          "Right to safe working conditions under OSHA regulations",
          "Family and Medical Leave Act (FMLA) provides up to 12 weeks unpaid leave",
          "Workers' compensation for on-the-job injuries",
        ],
      },
      {
        title: "Consumer Protection",
        items: [
          "Fair Debt Collection Practices Act limits when and how collectors can contact you",
          "Debt collectors cannot threaten, harass, or use profane language",
          "You have the right to request debt validation within 30 days",
          "Truth in Lending Act requires clear disclosure of loan terms and APR",
          "3-day cooling-off period for door-to-door sales over $25",
          "Warranty protections under Magnuson-Moss Warranty Act",
        ],
      },
      {
        title: "Family Law Basics",
        items: [
          "Marriage and divorce are regulated at the state level",
          "Child custody decisions are based on the best interest of the child standard",
          "Child support guidelines exist in every state with calculators available",
          "Domestic violence protections and protective orders available in all states",
          "Adoption procedures vary by state but federal oversight exists",
        ],
      },
    ],
    disclaimer:
      "This guide provides general legal information for educational purposes only. Laws vary significantly by state and jurisdiction. This is NOT legal advice. Consult with a licensed attorney for advice specific to your situation.",
  },
  AZ: {
    title: "Arizona Legal Rights Guide",
    subtitle: "Know Your Rights in the Grand Canyon State",
    sections: [
      {
        title: "Arizona Tenant Rights",
        items: [
          "Security deposit limit: 1.5 months rent maximum",
          "Landlord must return security deposit within 14 business days",
          "Written rental agreement required for leases over 1 year",
          "5-day notice for non-payment of rent, 10-day notice for lease violations",
          "Landlord must maintain habitable premises under A.R.S. 33-1324",
          "Tenant can withhold rent or repair and deduct for serious habitability issues",
          "Landlord cannot retaliate for tenant exercising legal rights",
        ],
      },
      {
        title: "Arizona Employment Law",
        items: [
          "Minimum wage: $14.35/hour (2024), adjusted annually for inflation",
          "Arizona is an at-will employment state with limited exceptions",
          "Paid sick leave required under Proposition 206 (1 hour per 30 hours worked)",
          "Final paycheck due within 7 working days (voluntary quit) or 3 days (termination)",
          "Employers cannot discriminate based on protected characteristics under ACRA",
          "Workers' compensation required for most employers",
        ],
      },
      {
        title: "Arizona Consumer Protection",
        items: [
          "Arizona Consumer Fraud Act (A.R.S. 44-1521) protects against deceptive practices",
          "3-day right to cancel door-to-door sales over $25",
          "Debt collection statute of limitations: 6 years for written contracts, 3 years for oral",
          "Identity theft victims can place security freezes for free",
          "Lemon law protection for new vehicle purchases with defects",
          "Automatic renewal contracts require clear disclosure",
        ],
      },
      {
        title: "Arizona Family Law",
        items: [
          "Community property state - marital assets divided 50/50",
          "No-fault divorce available (irretrievable breakdown of marriage)",
          "60-day waiting period for divorce if children involved",
          "Child custody based on best interest factors under A.R.S. 25-403",
          "Child support follows Arizona Child Support Guidelines",
          "Grandparent visitation rights available in limited circumstances",
        ],
      },
    ],
    disclaimer:
      "This guide provides general Arizona legal information as of 2024. Laws change frequently. This is NOT legal advice. Consult with an Arizona-licensed attorney for advice specific to your situation.",
  },
};

function generateEmailHTML(guideType: string, stateName: string): string {
  const guide = GUIDE_CONTENT[guideType as keyof typeof GUIDE_CONTENT] || GUIDE_CONTENT.general;

  const sectionsHTML = guide.sections
    .map(
      (section) => `
    <div style="margin-bottom: 24px;">
      <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 12px; border-bottom: 2px solid #dbeafe; padding-bottom: 8px;">
        ${section.title}
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        ${section.items.map((item) => `<li style="margin-bottom: 8px; line-height: 1.5;">${item}</li>`).join("")}
      </ul>
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${guide.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="margin: 0 0 8px 0; font-size: 28px;">${guide.title}</h1>
    <p style="margin: 0; opacity: 0.9;">${guide.subtitle}</p>
  </div>

  <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
    <p style="color: #6b7280; margin-bottom: 24px;">
      Thank you for your interest in understanding your legal rights. Below you'll find essential information to help you navigate common legal situations.
    </p>

    ${sectionsHTML}

    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-top: 24px;">
      <p style="margin: 0; font-size: 12px; color: #92400e;">
        <strong>Important Disclaimer:</strong> ${guide.disclaimer}
      </p>
    </div>

    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; margin-bottom: 16px;">Need personalized legal help?</p>
      <a href="https://ezlegal.ai" style="display: inline-block; background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Chat with ezLegal.ai
      </a>
    </div>
  </div>

  <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
    <p style="margin: 0 0 8px 0;">&copy; ${new Date().getFullYear()} ezLegal.ai - AI-Powered Legal Information</p>
    <p style="margin: 0;">This email was sent because you requested our Legal Rights Guide.</p>
  </div>
</body>
</html>
  `;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    const { email, state, guideType } = await req.json();

    if (!email || !state) {
      return new Response(JSON.stringify({ error: "Email and state are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const stateNames: Record<string, string> = {
      AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
      CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
      HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
      KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
      MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
      MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
      NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
      OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
      SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
      VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
    };

    const stateName = stateNames[state] || state;
    const effectiveGuideType = guideType || (GUIDE_CONTENT[state as keyof typeof GUIDE_CONTENT] ? state : "general");
    const emailHTML = generateEmailHTML(effectiveGuideType, stateName);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "ezLegal.ai <guides@ezlegal.ai>",
          to: [email],
          subject: effectiveGuideType === "general"
            ? "Your Free Legal Rights Guide from ezLegal.ai"
            : `Your Free ${stateName} Legal Rights Guide from ezLegal.ai`,
          html: emailHTML,
        }),
      });

      if (res.ok) {
        await supabase
          .from("email_captures")
          .update({ guide_sent_at: new Date().toISOString() })
          .eq("email", email.toLowerCase());

        return new Response(JSON.stringify({ success: true, message: "Guide sent successfully" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const errorData = await res.text();
        console.error("Resend API error:", errorData);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email capture recorded. Email sending requires RESEND_API_KEY configuration.",
        guideType: effectiveGuideType,
        html: emailHTML,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-legal-guide:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
