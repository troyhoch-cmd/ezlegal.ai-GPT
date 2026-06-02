import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DeletionRequest {
  requestType: "full" | "chat_only" | "documents_only" | "specific_matter";
  matterId?: string;
  reason?: string;
  legalBasis?: "gdpr_article_17" | "ccpa" | "user_request" | "account_closure" | "other";
  immediate?: boolean;
}

interface DeletionResult {
  requestId: string;
  status: string;
  scheduledFor?: string;
  deletedCounts?: {
    chatContexts: number;
    chatMessages: number;
    documents: number;
    attachments: number;
  };
  blockedByLegalHold: boolean;
  message: string;
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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const { data: requests } = await supabase
        .from("data_deletion_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(
        JSON.stringify({ requests: requests || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: DeletionRequest = await req.json();
    const {
      requestType = "full",
      matterId,
      reason,
      legalBasis = "user_request",
      immediate = false,
    } = requestData;

    const { data: existingRequest } = await supabase
      .from("data_deletion_requests")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .in("status", ["pending", "verified", "scheduled", "processing"])
      .maybeSingle();

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          error: "Deletion request already pending",
          requestId: existingRequest.id,
          status: existingRequest.status,
          createdAt: existingRequest.created_at,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: legalHoldCheck } = await supabase.rpc("check_legal_hold", {
      p_user_id: user.id,
      p_matter_id: matterId || null,
    });

    if (legalHoldCheck === true) {
      const { data: deletionRequest } = await supabase
        .from("data_deletion_requests")
        .insert({
          user_id: user.id,
          request_type: requestType,
          status: "blocked",
          reason,
          legal_basis: legalBasis,
          blocked_by_legal_hold: true,
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          requestId: deletionRequest?.id,
          status: "blocked",
          blockedByLegalHold: true,
          message: "Your data is currently under a legal hold and cannot be deleted. Please contact support for more information.",
        } as DeletionResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scheduledFor = immediate
      ? new Date().toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: deletionRequest, error: insertError } = await supabase
      .from("data_deletion_requests")
      .insert({
        user_id: user.id,
        request_type: requestType,
        status: immediate ? "processing" : "scheduled",
        scheduled_for: scheduledFor,
        reason,
        legal_basis: legalBasis,
        verified_at: new Date().toISOString(),
        verification_method: "authenticated_session",
        blocked_by_legal_hold: false,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create deletion request: ${insertError.message}`);
    }

    if (!immediate) {
      await supabase.from("unified_activity_log").insert({
        user_id: user.id,
        action_type: "deletion_scheduled",
        entity_type: "data_deletion_request",
        entity_id: deletionRequest.id,
        metadata: {
          requestType,
          scheduledFor,
          legalBasis,
        },
      });

      return new Response(
        JSON.stringify({
          requestId: deletionRequest.id,
          status: "scheduled",
          scheduledFor,
          blockedByLegalHold: false,
          message: `Your data deletion request has been scheduled for ${new Date(scheduledFor).toLocaleDateString()}. You can cancel this request before the scheduled date.`,
        } as DeletionResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deletionLog: Array<{ table: string; count: number; timestamp: string }> = [];
    let chatContextsDeleted = 0;
    let chatMessagesDeleted = 0;
    let documentsDeleted = 0;
    let attachmentsDeleted = 0;

    if (requestType === "full" || requestType === "chat_only") {
      const { data: contexts } = await supabase
        .from("chat_contexts")
        .select("id")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      if (contexts && contexts.length > 0) {
        const contextIds = contexts.map(c => c.id);

        const { count: msgCount } = await supabase
          .from("chat_messages")
          .update({
            deleted_at: new Date().toISOString(),
            deletion_reason: `user_deletion_request_${deletionRequest.id}`,
          })
          .in("context_id", contextIds)
          .is("deleted_at", null);

        chatMessagesDeleted = msgCount || 0;
        deletionLog.push({
          table: "chat_messages",
          count: chatMessagesDeleted,
          timestamp: new Date().toISOString(),
        });

        const { count: ctxCount } = await supabase
          .from("chat_contexts")
          .update({ deleted_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .is("deleted_at", null);

        chatContextsDeleted = ctxCount || 0;
        deletionLog.push({
          table: "chat_contexts",
          count: chatContextsDeleted,
          timestamp: new Date().toISOString(),
        });
      }

      const { count: attachCount } = await supabase
        .from("chat_attachments")
        .delete()
        .eq("user_id", user.id);

      attachmentsDeleted = attachCount || 0;
      if (attachmentsDeleted > 0) {
        deletionLog.push({
          table: "chat_attachments",
          count: attachmentsDeleted,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (requestType === "full" || requestType === "documents_only") {
      const { count: docCount } = await supabase
        .from("chatbot_documents")
        .delete()
        .eq("user_id", user.id);

      documentsDeleted = docCount || 0;
      if (documentsDeleted > 0) {
        deletionLog.push({
          table: "chatbot_documents",
          count: documentsDeleted,
          timestamp: new Date().toISOString(),
        });
      }
    }

    await supabase
      .from("data_deletion_requests")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
        deletion_log: deletionLog,
      })
      .eq("id", deletionRequest.id);

    await supabase.from("unified_activity_log").insert({
      user_id: user.id,
      action_type: "data_deleted",
      entity_type: "data_deletion_request",
      entity_id: deletionRequest.id,
      metadata: {
        requestType,
        deletedCounts: {
          chatContexts: chatContextsDeleted,
          chatMessages: chatMessagesDeleted,
          documents: documentsDeleted,
          attachments: attachmentsDeleted,
        },
      },
    });

    return new Response(
      JSON.stringify({
        requestId: deletionRequest.id,
        status: "completed",
        blockedByLegalHold: false,
        deletedCounts: {
          chatContexts: chatContextsDeleted,
          chatMessages: chatMessagesDeleted,
          documents: documentsDeleted,
          attachments: attachmentsDeleted,
        },
        message: "Your data has been successfully deleted.",
      } as DeletionResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Data deletion error:", error);
    return new Response(
      JSON.stringify({ error: "Deletion failed", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
