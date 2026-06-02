/*
  # Add Missing Foreign Key Indexes - Batch 3

  Adds covering indexes for unindexed foreign keys on K-O tables.

  1. Tables indexed
    - knowledge_documents (uploaded_by)
    - lawyer_consultations (lawyer_match_id)
    - lawyer_matches (chat_message_id)
    - lawyer_messages (connection_id)
    - legal_content (source_id)
    - legal_holds (created_by, matter_id, user_id)
    - lso_audit_logs (user_id)
    - lso_case_hours (attorney_id, intake_id)
    - lso_client_intakes (assigned_attorney_id, assigned_by, organization_id)
    - lso_staff (organization_id)
    - lso_volunteer_attorneys (organization_id, user_id)
    - match_feedback (match_id, organization_id, submitted_by)
    - matching_notifications (attorney_id, match_id)
    - matter_activity_timeline (matter_id)
    - matter_documents (added_by)
    - negotiation_batna_analysis (negotiation_id)
    - negotiation_plans_generated (user_id)
    - negotiation_rounds (negotiation_id)
    - negotiation_zopa (negotiation_id)
    - negotiations (user_id)
    - openai_rate_limits (user_id)
    - openai_usage_logs (user_id)

  2. Important notes
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by
  ON public.knowledge_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id
  ON public.lawyer_consultations (lawyer_match_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id
  ON public.lawyer_matches (chat_message_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id
  ON public.lawyer_messages (connection_id);

CREATE INDEX IF NOT EXISTS idx_legal_content_source_id
  ON public.legal_content (source_id);

CREATE INDEX IF NOT EXISTS idx_legal_holds_created_by
  ON public.legal_holds (created_by);

CREATE INDEX IF NOT EXISTS idx_legal_holds_matter_id
  ON public.legal_holds (matter_id);

CREATE INDEX IF NOT EXISTS idx_legal_holds_user_id
  ON public.legal_holds (user_id);

CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id
  ON public.lso_audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_attorney_id
  ON public.lso_case_hours (attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_intake_id
  ON public.lso_case_hours (intake_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_attorney_id
  ON public.lso_client_intakes (assigned_attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by
  ON public.lso_client_intakes (assigned_by);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_organization_id
  ON public.lso_client_intakes (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_staff_organization_id
  ON public.lso_staff (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_organization_id
  ON public.lso_volunteer_attorneys (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id
  ON public.lso_volunteer_attorneys (user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_match_id
  ON public.match_feedback (match_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id
  ON public.match_feedback (organization_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by
  ON public.match_feedback (submitted_by);

CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id
  ON public.matching_notifications (attorney_id);

CREATE INDEX IF NOT EXISTS idx_matching_notifications_match_id
  ON public.matching_notifications (match_id);

CREATE INDEX IF NOT EXISTS idx_matter_activity_timeline_matter_id
  ON public.matter_activity_timeline (matter_id);

CREATE INDEX IF NOT EXISTS idx_matter_documents_added_by
  ON public.matter_documents (added_by);

CREATE INDEX IF NOT EXISTS idx_negotiation_batna_analysis_negotiation_id
  ON public.negotiation_batna_analysis (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_plans_generated_user_id
  ON public.negotiation_plans_generated (user_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_negotiation_id
  ON public.negotiation_rounds (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_zopa_negotiation_id
  ON public.negotiation_zopa (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiations_user_id
  ON public.negotiations (user_id);

CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id
  ON public.openai_rate_limits (user_id);

CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id
  ON public.openai_usage_logs (user_id);
