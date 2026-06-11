/*
  # Add Missing Foreign Key Indexes - Batch 2

  Adds covering indexes for unindexed foreign keys on mid-alphabet tables.

  1. Tables indexed
    - chatbot_documents (created_by)
    - chatbot_prompts (category_id, subcategory_id)
    - conflict_checks (performed_by)
    - conflict_waivers (conflict_check_id, conflicting_matter_id, matter_id)
    - conversion_events (session_id)
    - crisis_incidents (user_id)
    - data_deletion_requests (processed_by, user_id)
    - data_export_requests (user_id)
    - data_retention_policies (created_by, organization_id)
    - documents (case_id, matter_id)
    - engagement_analytics (user_id)
    - engagement_events (user_id)
    - funding_requests (user_id)
    - grant_expenses (approved_by, grant_id)
    - grant_metrics (grant_id)
    - grant_milestones (grant_id)
    - grant_reports (generated_by, grant_id, reviewed_by)
    - grants (funder_id)

  2. Important notes
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by
  ON public.chatbot_documents (created_by);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category_id
  ON public.chatbot_prompts (category_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory_id
  ON public.chatbot_prompts (subcategory_id);

CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by
  ON public.conflict_checks (performed_by);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflict_check_id
  ON public.conflict_waivers (conflict_check_id);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflicting_matter_id
  ON public.conflict_waivers (conflicting_matter_id);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter_id
  ON public.conflict_waivers (matter_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id
  ON public.conversion_events (session_id);

CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id
  ON public.crisis_incidents (user_id);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_processed_by
  ON public.data_deletion_requests (processed_by);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id
  ON public.data_deletion_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id
  ON public.data_export_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_created_by
  ON public.data_retention_policies (created_by);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_organization_id
  ON public.data_retention_policies (organization_id);

CREATE INDEX IF NOT EXISTS idx_documents_case_id
  ON public.documents (case_id);

CREATE INDEX IF NOT EXISTS idx_documents_matter_id
  ON public.documents (matter_id);

CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id
  ON public.engagement_analytics (user_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_user_id
  ON public.engagement_events (user_id);

CREATE INDEX IF NOT EXISTS idx_funding_requests_user_id
  ON public.funding_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by
  ON public.grant_expenses (approved_by);

CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id
  ON public.grant_expenses (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id
  ON public.grant_metrics (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id
  ON public.grant_milestones (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by
  ON public.grant_reports (generated_by);

CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id
  ON public.grant_reports (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by
  ON public.grant_reports (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_grants_funder_id
  ON public.grants (funder_id);
