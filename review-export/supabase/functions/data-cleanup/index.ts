import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CleanupResult {
  success: boolean;
  executedAt: string;
  retentionPoliciesApplied: {
    chatMessages: { retentionDays: number; softDeleted: number };
    chatContexts: { retentionDays: number; softDeleted: number };
    freeChats: { expiryHours: number; deleted: number };
    expiredExports: { deleted: number };
  };
  scheduledDeletionsProcessed: number;
  errors: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    const cronSecret = req.headers.get("X-Cron-Secret");
    const expectedCronSecret = Deno.env.get("CRON_SECRET");

    let isAuthorized = false;

    if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
      isAuthorized = true;
    } else if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "admin") {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: "Admin authorization required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: CleanupResult = {
      success: true,
      executedAt: new Date().toISOString(),
      retentionPoliciesApplied: {
        chatMessages: { retentionDays: 90, softDeleted: 0 },
        chatContexts: { retentionDays: 90, softDeleted: 0 },
        freeChats: { expiryHours: 24, deleted: 0 },
        expiredExports: { deleted: 0 },
      },
      scheduledDeletionsProcessed: 0,
      errors: [],
    };

    const { data: msgRetention } = await supabase.rpc("get_retention_days", {
      p_data_type: "chat_messages",
      p_org_id: null,
    });
    const chatRetentionDays = msgRetention || 90;
    result.retentionPoliciesApplied.chatMessages.retentionDays = chatRetentionDays;

    const retentionCutoff = new Date();
    retentionCutoff.setDate(retentionCutoff.getDate() - chatRetentionDays);

    const { data: expiredMessages, error: msgError } = await supabase
      .from("chat_messages")
      .update({
        deleted_at: new Date().toISOString(),
        deletion_reason: "retention_policy_cleanup",
      })
      .lt("created_at", retentionCutoff.toISOString())
      .is("deleted_at", null)
      .select("id, user_id");

    if (msgError) {
      result.errors.push(`Chat messages cleanup error: ${msgError.message}`);
    } else if (expiredMessages) {
      const usersWithHolds = new Set<string>();
      for (const msg of expiredMessages) {
        if (msg.user_id) {
          const { data: hasHold } = await supabase.rpc("check_legal_hold", {
            p_user_id: msg.user_id,
            p_matter_id: null,
          });
          if (hasHold) {
            usersWithHolds.add(msg.user_id);
          }
        }
      }

      if (usersWithHolds.size > 0) {
        await supabase
          .from("chat_messages")
          .update({ deleted_at: null, deletion_reason: null })
          .in("user_id", Array.from(usersWithHolds))
          .eq("deletion_reason", "retention_policy_cleanup");
      }

      result.retentionPoliciesApplied.chatMessages.softDeleted =
        expiredMessages.length - usersWithHolds.size;
    }

    const { data: ctxRetention } = await supabase.rpc("get_retention_days", {
      p_data_type: "chat_contexts",
      p_org_id: null,
    });
    const contextRetentionDays = ctxRetention || 90;
    result.retentionPoliciesApplied.chatContexts.retentionDays = contextRetentionDays;

    const contextCutoff = new Date();
    contextCutoff.setDate(contextCutoff.getDate() - contextRetentionDays);

    const { count: contextCount, error: ctxError } = await supabase
      .from("chat_contexts")
      .update({ deleted_at: new Date().toISOString() })
      .lt("created_at", contextCutoff.toISOString())
      .is("deleted_at", null);

    if (ctxError) {
      result.errors.push(`Chat contexts cleanup error: ${ctxError.message}`);
    } else {
      result.retentionPoliciesApplied.chatContexts.softDeleted = contextCount || 0;
    }

    const freeExpiryHours = 24;
    const freeChatCutoff = new Date();
    freeChatCutoff.setHours(freeChatCutoff.getHours() - freeExpiryHours);

    const { count: freeCount, error: freeError } = await supabase
      .from("free_chat_sessions")
      .delete()
      .lt("last_active_at", freeChatCutoff.toISOString());

    if (freeError) {
      result.errors.push(`Free chat cleanup error: ${freeError.message}`);
    } else {
      result.retentionPoliciesApplied.freeChats.deleted = freeCount || 0;
    }

    const { count: exportCount, error: exportError } = await supabase
      .from("data_export_requests")
      .update({ status: "expired", download_url: null })
      .eq("status", "completed")
      .lt("download_expires_at", new Date().toISOString());

    if (exportError) {
      result.errors.push(`Export cleanup error: ${exportError.message}`);
    } else {
      result.retentionPoliciesApplied.expiredExports.deleted = exportCount || 0;
    }

    const { data: scheduledDeletions, error: schedError } = await supabase
      .from("data_deletion_requests")
      .select("id, user_id, request_type")
      .eq("status", "scheduled")
      .lte("scheduled_for", new Date().toISOString());

    if (schedError) {
      result.errors.push(`Scheduled deletions query error: ${schedError.message}`);
    } else if (scheduledDeletions && scheduledDeletions.length > 0) {
      for (const deletion of scheduledDeletions) {
        const { data: hasHold } = await supabase.rpc("check_legal_hold", {
          p_user_id: deletion.user_id,
          p_matter_id: null,
        });

        if (hasHold) {
          await supabase
            .from("data_deletion_requests")
            .update({
              status: "blocked",
              blocked_by_legal_hold: true,
            })
            .eq("id", deletion.id);
          continue;
        }

        await supabase
          .from("data_deletion_requests")
          .update({ status: "processing" })
          .eq("id", deletion.id);

        const deletionLog: Array<{ table: string; count: number; timestamp: string }> = [];

        if (deletion.request_type === "full" || deletion.request_type === "chat_only") {
          const { data: contexts } = await supabase
            .from("chat_contexts")
            .select("id")
            .eq("user_id", deletion.user_id)
            .is("deleted_at", null);

          if (contexts && contexts.length > 0) {
            const contextIds = contexts.map((c) => c.id);

            const { count: msgCount } = await supabase
              .from("chat_messages")
              .update({
                deleted_at: new Date().toISOString(),
                deletion_reason: `scheduled_deletion_${deletion.id}`,
              })
              .in("context_id", contextIds)
              .is("deleted_at", null);

            deletionLog.push({
              table: "chat_messages",
              count: msgCount || 0,
              timestamp: new Date().toISOString(),
            });

            const { count: ctxCount } = await supabase
              .from("chat_contexts")
              .update({ deleted_at: new Date().toISOString() })
              .eq("user_id", deletion.user_id)
              .is("deleted_at", null);

            deletionLog.push({
              table: "chat_contexts",
              count: ctxCount || 0,
              timestamp: new Date().toISOString(),
            });
          }
        }

        if (deletion.request_type === "full" || deletion.request_type === "documents_only") {
          const { count: docCount } = await supabase
            .from("chatbot_documents")
            .delete()
            .eq("user_id", deletion.user_id);

          deletionLog.push({
            table: "chatbot_documents",
            count: docCount || 0,
            timestamp: new Date().toISOString(),
          });
        }

        await supabase
          .from("data_deletion_requests")
          .update({
            status: "completed",
            processed_at: new Date().toISOString(),
            deletion_log: deletionLog,
          })
          .eq("id", deletion.id);

        result.scheduledDeletionsProcessed++;
      }
    }

    await supabase.from("lso_audit_logs").insert({
      action: "data_cleanup_executed",
      performed_by: "system",
      details: result,
    });

    if (result.errors.length > 0) {
      result.success = false;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Data cleanup error:", error);
    return new Response(
      JSON.stringify({ error: "Cleanup failed", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
