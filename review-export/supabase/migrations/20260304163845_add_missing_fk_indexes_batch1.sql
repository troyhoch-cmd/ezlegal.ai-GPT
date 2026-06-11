/*
  # Add missing FK indexes batch 1

  Covers:
  - access_requests (invited_by, reviewed_by)
  - access_token_usage (token_id, user_id)
  - access_tokens (created_by)
  - ai_response_citations (provenance_id)
  - ai_response_provenance (matter_id)
  - analytics_events (user_id)
  - appointment_requests (connection_id)
  - approval_decisions (request_id)
  - approval_requests (requested_by, workflow_id)
  - asset_downloads (asset_id, user_id)
  - asset_readiness (brand_approver_id, legal_reviewer_id, spanish_reviewer_id)
  - asset_readiness_audit_log (asset_id, changed_by)
  - attorney_matching_profiles (organization_id)
  - case_matches (attorney_id, attorney_profile_id, case_id, organization_id)
  - case_matching_queue (created_by, organization_id)
  - cases (client_id)
  - chat_contexts (matter_id)
  - chat_messages_anonymous (session_id)
  - chatbot_documents (created_by)
  - chatbot_prompts (category_id, subcategory_id)
*/

CREATE INDEX IF NOT EXISTS idx_access_requests_invited_by
  ON access_requests (invited_by);
CREATE INDEX IF NOT EXISTS idx_access_requests_reviewed_by
  ON access_requests (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_access_token_usage_token_id
  ON access_token_usage (token_id);
CREATE INDEX IF NOT EXISTS idx_access_token_usage_user_id
  ON access_token_usage (user_id);

CREATE INDEX IF NOT EXISTS idx_access_tokens_created_by
  ON access_tokens (created_by);

CREATE INDEX IF NOT EXISTS idx_ai_response_citations_provenance_id
  ON ai_response_citations (provenance_id);

CREATE INDEX IF NOT EXISTS idx_ai_response_provenance_matter_id
  ON ai_response_provenance (matter_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id
  ON analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_connection_id
  ON appointment_requests (connection_id);

CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id
  ON approval_decisions (request_id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by
  ON approval_requests (requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id
  ON approval_requests (workflow_id);

CREATE INDEX IF NOT EXISTS idx_asset_downloads_asset_id
  ON asset_downloads (asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_downloads_user_id
  ON asset_downloads (user_id);

CREATE INDEX IF NOT EXISTS idx_asset_readiness_brand_approver_id
  ON asset_readiness (brand_approver_id);
CREATE INDEX IF NOT EXISTS idx_asset_readiness_legal_reviewer_id
  ON asset_readiness (legal_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_asset_readiness_spanish_reviewer_id
  ON asset_readiness (spanish_reviewer_id);

CREATE INDEX IF NOT EXISTS idx_asset_readiness_audit_log_asset_id
  ON asset_readiness_audit_log (asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_readiness_audit_log_changed_by
  ON asset_readiness_audit_log (changed_by);

CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_organization_id
  ON attorney_matching_profiles (organization_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_id
  ON case_matches (attorney_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id
  ON case_matches (attorney_profile_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_case_id
  ON case_matches (case_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_organization_id
  ON case_matches (organization_id);

CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by
  ON case_matching_queue (created_by);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_organization_id
  ON case_matching_queue (organization_id);

CREATE INDEX IF NOT EXISTS idx_cases_client_id
  ON cases (client_id);

CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id
  ON chat_contexts (matter_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id
  ON chat_messages_anonymous (session_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by
  ON chatbot_documents (created_by);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category_id
  ON chatbot_prompts (category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory_id
  ON chatbot_prompts (subcategory_id);
