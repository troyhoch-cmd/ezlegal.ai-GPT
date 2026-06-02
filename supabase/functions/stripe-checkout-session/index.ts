import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json(401, { error: "missing_authorization" });

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json(401, { error: "invalid_session" });
    const user = userData.user;

    const body = (await req.json()) as CheckoutRequest;
    if (!body?.planId) return json(400, { error: "plan_id_required" });

    const admin = createClient(supabaseUrl, supabaseService);

    const { data: plan } = await admin
      .from("subscription_plans")
      .select("*")
      .eq("id", body.planId)
      .eq("is_active", true)
      .maybeSingle();

    if (!plan) return json(404, { error: "plan_not_found" });

    if (!stripeSecret) {
      const { data: intent, error: intentErr } = await admin
        .from("purchase_intents")
        .insert({
          user_id: user.id,
          email: user.email ?? "",
          plan_id: plan.id,
          amount_cents: plan.price_cents,
          currency: plan.currency,
          status: "queued",
          notes: "Stripe not configured; intent captured for manual follow-up.",
          metadata: { plan_name: plan.name, tier: plan.tier },
        })
        .select()
        .maybeSingle();

      if (intentErr) return json(500, { error: "intent_failed", detail: intentErr.message });

      return json(200, {
        mode: "waitlist",
        intentId: intent?.id ?? null,
        message: "Stripe is not configured. We saved your interest and will email you.",
      });
    }

    let stripeCustomerId: string | null = null;
    const { data: existingCustomer } = await admin
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomerId = existingCustomer.stripe_customer_id;
    } else {
      const customerRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: user.email ?? "",
          "metadata[user_id]": user.id,
        }),
      });
      const customerData = await customerRes.json();
      if (!customerRes.ok) return json(502, { error: "stripe_customer_failed", detail: customerData });
      stripeCustomerId = customerData.id as string;
      await admin.from("stripe_customers").upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomerId,
        email: user.email ?? "",
        updated_at: new Date().toISOString(),
      });
    }

    const sessionParams = new URLSearchParams();
    sessionParams.set("mode", plan.interval === "one_time" ? "payment" : "subscription");
    sessionParams.set("customer", stripeCustomerId ?? "");
    sessionParams.set("client_reference_id", user.id);
    sessionParams.set("success_url", body.successUrl ?? `${new URL(req.url).origin}/dashboard/billing?status=success`);
    sessionParams.set("cancel_url", body.cancelUrl ?? `${new URL(req.url).origin}/pricing?status=cancel`);
    sessionParams.set("metadata[user_id]", user.id);
    sessionParams.set("metadata[plan_id]", plan.id);
    sessionParams.set("metadata[tier]", plan.tier);

    if (plan.stripe_price_id) {
      sessionParams.set("line_items[0][price]", plan.stripe_price_id);
      sessionParams.set("line_items[0][quantity]", "1");
    } else {
      sessionParams.set("line_items[0][price_data][currency]", plan.currency);
      sessionParams.set("line_items[0][price_data][product_data][name]", plan.name);
      sessionParams.set("line_items[0][price_data][unit_amount]", String(plan.price_cents));
      if (plan.interval !== "one_time") {
        sessionParams.set("line_items[0][price_data][recurring][interval]", plan.interval);
      }
      sessionParams.set("line_items[0][quantity]", "1");
    }

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: sessionParams,
    });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok) return json(502, { error: "stripe_session_failed", detail: sessionData });

    return json(200, { mode: "stripe", url: sessionData.url, id: sessionData.id });
  } catch (err) {
    return json(500, { error: "unexpected", detail: err instanceof Error ? err.message : String(err) });
  }
});
