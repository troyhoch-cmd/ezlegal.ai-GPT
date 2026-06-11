/*
  # Add Missing Foreign Key Indexes - Batch 1

  Adds covering indexes for unindexed foreign keys to improve JOIN and
  cascading-delete performance.

  1. Tables indexed
    - access_requests (invited_by, reviewed_by)
    - access_token_usage (token_id, user_id)
    - access_tokens (created_by)
    - ai_response_citations (provenance_id)
    - ai_response_provenance (matter_id)
    - analytics_events (user_id)
    - appointment_requests (connection_id)
    - approval_decisions (request_id)
    - approval_requests (requested_by, workflow_id)
    - attorney_matching_profiles (organization_id)
    - case_matches (attorney_id, attorney_profile_id, case_id, organization_id)
    - case_matching_queue (created_by, organization_id)
    - cases (client_id)
    - chat_contexts (matter_id)
    - chat_messages_anonymous (session_id)

  2. Important notes
    - All indexes use IF NOT EXISTS to be idempotent
    - Uses CONCURRENTLY where possible for zero-downtime
*/

CREATE INDEX IF NOT EXISTS idx_access_requests_invited_by
  ON public.access_requests (invited_by);

CREATE INDEX IF NOT EXISTS idx_access_requests_reviewed_by
  ON public.access_requests (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_access_token_usage_token_id
  ON public.access_token_usage (token_id);

CREATE INDEX IF NOT EXISTS idx_access_token_usage_user_id
  ON public.access_token_usage (user_id);

CREATE INDEX IF NOT EXISTS idx_access_tokens_created_by
  ON public.access_tokens (created_by);

CREATE INDEX IF NOT EXISTS idx_ai_response_citations_provenance_id
  ON public.ai_response_citations (provenance_id);

CREATE INDEX IF NOT EXISTS idx_ai_response_provenance_matter_id
  ON public.ai_response_provenance (matter_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
  ON public.analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_connection_id
  ON public.appointment_requests (connection_id);

CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id
  ON public.approval_decisions (request_id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by
  ON public.approval_requests (requested_by);

CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id
  ON public.approval_requests (workflow_id);

CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_organization_id
  ON public.attorney_matching_profiles (organization_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_id
  ON public.case_matches (attorney_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id
  ON public.case_matches (attorney_profile_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_case_id
  ON public.case_matches (case_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_organization_id
  ON public.case_matches (organization_id);

CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by
  ON public.case_matching_queue (created_by);

CREATE INDEX IF NOT EXISTS idx_case_matching_queue_organization_id
  ON public.case_matching_queue (organization_id);

CREATE INDEX IF NOT EXISTS idx_cases_client_id
  ON public.cases (client_id);

CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id
  ON public.chat_contexts (matter_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id
  ON public.chat_messages_anonymous (session_id);
