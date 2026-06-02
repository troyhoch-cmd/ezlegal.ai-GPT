import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Stripe-Signature",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k.trim(), (v ?? "").trim()];
    }),
  );
  const timestamp = parts["t"];
  const signature = parts["v1"];
  if (!timestamp || !signature) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

    const payload = await req.text();
    const sigHeader = req.headers.get("Stripe-Signature") ?? "";

    if (webhookSecret) {
      const ok = await verifyStripeSignature(payload, sigHeader, webhookSecret);
      if (!ok) return json(400, { error: "invalid_signature" });
    }

    const event = JSON.parse(payload);
    const admin = createClient(supabaseUrl, supabaseService);

    const obj = event?.data?.object ?? {};
    const userIdFromMeta: string =
      obj?.metadata?.user_id || obj?.client_reference_id || obj?.subscription_details?.metadata?.user_id || "";
    const planIdFromMeta: string = obj?.metadata?.plan_id ?? "";
    const tierFromMeta: string = obj?.metadata?.tier ?? "";

    let resolvedUserId = userIdFromMeta;
    if (!resolvedUserId && obj?.customer) {
      const { data: cust } = await admin
        .from("stripe_customers")
        .select("user_id")
        .eq("stripe_customer_id", obj.customer)
        .maybeSingle();
      resolvedUserId = cust?.user_id ?? "";
    }

    await admin.from("subscription_events").insert({
      user_id: resolvedUserId || null,
      stripe_event_id: event?.id ?? null,
      event_type: event?.type ?? "unknown",
      plan_id: planIdFromMeta,
      tier: tierFromMeta,
      status: obj?.status ?? "",
      amount_cents: obj?.amount_total ?? obj?.amount_paid ?? 0,
      currency: obj?.currency ?? "usd",
      raw: event,
    });

    switch (event?.type) {
      case "checkout.session.completed":
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        if (resolvedUserId && tierFromMeta) {
          await admin.from("profiles").update({ subscription_tier: tierFromMeta }).eq("id", resolvedUserId);
        }
        if (event.type === "checkout.session.completed" && resolvedUserId) {
          await admin.from("billing_invoices").insert({
            user_id: resolvedUserId,
            stripe_invoice_id: obj?.invoice ?? null,
            stripe_payment_intent_id: obj?.payment_intent ?? "",
            plan_id: planIdFromMeta,
            description: `Checkout for ${planIdFromMeta || "plan"}`,
            amount_cents: obj?.amount_total ?? 0,
            currency: obj?.currency ?? "usd",
            status: "paid",
            paid_at: new Date().toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        if (resolvedUserId) {
          await admin.from("profiles").update({ subscription_tier: "free" }).eq("id", resolvedUserId);
        }
        break;
      }
      case "invoice.paid":
      case "invoice.payment_succeeded": {
        if (resolvedUserId) {
          await admin.from("billing_invoices").upsert(
            {
              user_id: resolvedUserId,
              stripe_invoice_id: obj?.id ?? null,
              plan_id: planIdFromMeta,
              description: obj?.lines?.data?.[0]?.description ?? "Subscription invoice",
              amount_cents: obj?.amount_paid ?? 0,
              currency: obj?.currency ?? "usd",
              status: "paid",
              hosted_invoice_url: obj?.hosted_invoice_url ?? "",
              receipt_url: obj?.receipt_url ?? "",
              paid_at: new Date().toISOString(),
            },
            { onConflict: "stripe_invoice_id" },
          );
        }
        break;
      }
      case "invoice.payment_failed": {
        if (resolvedUserId) {
          await admin.from("billing_invoices").upsert(
            {
              user_id: resolvedUserId,
              stripe_invoice_id: obj?.id ?? null,
              plan_id: planIdFromMeta,
              description: "Failed payment",
              amount_cents: obj?.amount_due ?? 0,
              currency: obj?.currency ?? "usd",
              status: "failed",
            },
            { onConflict: "stripe_invoice_id" },
          );
        }
        break;
      }
      default:
        break;
    }

    return json(200, { received: true });
  } catch (err) {
    return json(500, { error: "unexpected", detail: err instanceof Error ? err.message : String(err) });
  }
});
