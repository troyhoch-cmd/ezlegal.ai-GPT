import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExportRequest {
  format?: "json" | "csv";
  includeChatHistory?: boolean;
  includeDocuments?: boolean;
  includeProfile?: boolean;
  includeActivityLogs?: boolean;
}

interface UserDataExport {
  exportedAt: string;
  userId: string;
  profile: Record<string, unknown> | null;
  chatHistory: Array<{
    contextId: string;
    title: string;
    createdAt: string;
    messages: Array<{
      role: string;
      content: string;
      createdAt: string;
    }>;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    createdAt: string;
  }>;
  activityLogs: Array<{
    action: string;
    timestamp: string;
    details: Record<string, unknown>;
  }>;
}

function convertToCSV(data: UserDataExport): string {
  const lines: string[] = [];

  lines.push("# USER DATA EXPORT");
  lines.push(`# Exported At: ${data.exportedAt}`);
  lines.push(`# User ID: ${data.userId}`);
  lines.push("");

  if (data.profile) {
    lines.push("## PROFILE");
    lines.push("Field,Value");
    for (const [key, value] of Object.entries(data.profile)) {
      const escapedValue = String(value ?? "").replace(/"/g, '""');
      lines.push(`"${key}","${escapedValue}"`);
    }
    lines.push("");
  }

  if (data.chatHistory.length > 0) {
    lines.push("## CHAT HISTORY");
    lines.push("Context ID,Title,Created At,Role,Content");
    for (const context of data.chatHistory) {
      for (const msg of context.messages) {
        const escapedContent = msg.content.replace(/"/g, '""').replace(/\n/g, " ");
        lines.push(
          `"${context.contextId}","${context.title}","${context.createdAt}","${msg.role}","${escapedContent}"`
        );
      }
    }
    lines.push("");
  }

  if (data.documents.length > 0) {
    lines.push("## DOCUMENTS");
    lines.push("ID,Name,Type,Created At");
    for (const doc of data.documents) {
      lines.push(`"${doc.id}","${doc.name}","${doc.type}","${doc.createdAt}"`);
    }
    lines.push("");
  }

  if (data.activityLogs.length > 0) {
    lines.push("## ACTIVITY LOGS");
    lines.push("Action,Timestamp,Details");
    for (const log of data.activityLogs) {
      const details = JSON.stringify(log.details).replace(/"/g, '""');
      lines.push(`"${log.action}","${log.timestamp}","${details}"`);
    }
  }

  return lines.join("\n");
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

    const requestData: ExportRequest = req.method === "POST" ? await req.json() : {};
    const {
      format = "json",
      includeChatHistory = true,
      includeDocuments = true,
      includeProfile = true,
      includeActivityLogs = false,
    } = requestData;

    const { data: existingRequest } = await supabase
      .from("data_export_requests")
      .select("id, status, requested_at")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"])
      .maybeSingle();

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          error: "Export already in progress",
          requestId: existingRequest.id,
          status: existingRequest.status,
          requestedAt: existingRequest.requested_at,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: exportRequest, error: insertError } = await supabase
      .from("data_export_requests")
      .insert({
        user_id: user.id,
        status: "processing",
        export_format: format,
        include_chat_history: includeChatHistory,
        include_documents: includeDocuments,
        include_profile: includeProfile,
        include_activity_logs: includeActivityLogs,
        processing_started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create export request: ${insertError.message}`);
    }

    const exportData: UserDataExport = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      profile: null,
      chatHistory: [],
      documents: [],
      activityLogs: [],
    };

    if (includeProfile) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone, jurisdiction, preferred_language, created_at")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        exportData.profile = {
          ...profile,
          email: user.email,
        };
      }
    }

    if (includeChatHistory) {
      const { data: contexts } = await supabase
        .from("chat_contexts")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (contexts) {
        for (const context of contexts) {
          const { data: messages } = await supabase
            .from("chat_messages")
            .select("role, content, created_at")
            .eq("context_id", context.id)
            .is("deleted_at", null)
            .order("created_at", { ascending: true });

          exportData.chatHistory.push({
            contextId: context.id,
            title: context.title || "Untitled Conversation",
            createdAt: context.created_at,
            messages: messages || [],
          });
        }
      }
    }

    if (includeDocuments) {
      const { data: documents } = await supabase
        .from("chatbot_documents")
        .select("id, name, document_type, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (documents) {
        exportData.documents = documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.document_type,
          createdAt: doc.created_at,
        }));
      }
    }

    if (includeActivityLogs) {
      const { data: logs } = await supabase
        .from("unified_activity_log")
        .select("action_type, created_at, metadata")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (logs) {
        exportData.activityLogs = logs.map(log => ({
          action: log.action_type,
          timestamp: log.created_at,
          details: log.metadata || {},
        }));
      }
    }

    let exportContent: string;
    let contentType: string;
    let fileExtension: string;

    if (format === "csv") {
      exportContent = convertToCSV(exportData);
      contentType = "text/csv";
      fileExtension = "csv";
    } else {
      exportContent = JSON.stringify(exportData, null, 2);
      contentType = "application/json";
      fileExtension = "json";
    }

    const fileSizeBytes = new TextEncoder().encode(exportContent).length;

    await supabase
      .from("data_export_requests")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        file_size_bytes: fileSizeBytes,
      })
      .eq("id", exportRequest.id);

    await supabase.from("unified_activity_log").insert({
      user_id: user.id,
      action_type: "data_export",
      entity_type: "user_data",
      entity_id: exportRequest.id,
      metadata: {
        format,
        includeChatHistory,
        includeDocuments,
        includeProfile,
        includeActivityLogs,
        fileSizeBytes,
      },
    });

    const filename = `ezlegal_data_export_${new Date().toISOString().split("T")[0]}.${fileExtension}`;

    return new Response(exportContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Data export error:", error);
    return new Response(
      JSON.stringify({ error: "Export failed", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
