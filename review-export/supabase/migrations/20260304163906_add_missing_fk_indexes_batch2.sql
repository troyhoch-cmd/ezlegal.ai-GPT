/*
  # Add missing FK indexes batch 2

  Covers:
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
  - funnel_events (user_id)
  - generated_documents (user_id)
  - grant_expenses (approved_by, grant_id)
  - grant_metrics (grant_id)
  - grant_milestones (grant_id)
  - grant_reports (generated_by, grant_id, reviewed_by)
  - grants (funder_id)
  - guardrail_alerts (resolved_by)
  - knowledge_documents (uploaded_by)
  - lawyer_consultations (lawyer_match_id)
  - lawyer_matches (chat_message_id)
  - lawyer_messages (connection_id)
  - legal_content (source_id)
  - legal_documents (user_id)
  - legal_holds (created_by, matter_id, user_id)
*/

CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by
  ON conflict_checks (performed_by);

CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflict_check_id
  ON conflict_waivers (conflict_check_id);
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflicting_matter_id
  ON conflict_waivers (conflicting_matter_id);
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter_id
  ON conflict_waivers (matter_id);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id
  ON conversion_events (session_id);

CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id
  ON crisis_incidents (user_id);

CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_processed_by
  ON data_deletion_requests (processed_by);
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_user_id
  ON data_deletion_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id
  ON data_export_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_data_retention_policies_created_by
  ON data_retention_policies (created_by);
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_organization_id
  ON data_retention_policies (organization_id);

CREATE INDEX IF NOT EXISTS idx_documents_case_id
  ON documents (case_id);
CREATE INDEX IF NOT EXISTS idx_documents_matter_id
  ON documents (matter_id);

CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id
  ON engagement_analytics (user_id);

CREATE INDEX IF NOT EXISTS idx_engagement_events_user_id
  ON engagement_events (user_id);

CREATE INDEX IF NOT EXISTS idx_funding_requests_user_id
  ON funding_requests (user_id);

CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id
  ON funnel_events (user_id);

CREATE INDEX IF NOT EXISTS idx_generated_documents_user_id
  ON generated_documents (user_id);

CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by
  ON grant_expenses (approved_by);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id
  ON grant_expenses (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id
  ON grant_metrics (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id
  ON grant_milestones (grant_id);

CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by
  ON grant_reports (generated_by);
CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id
  ON grant_reports (grant_id);
CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by
  ON grant_reports (reviewed_by);

CREATE INDEX IF NOT EXISTS idx_grants_funder_id
  ON grants (funder_id);

CREATE INDEX IF NOT EXISTS idx_guardrail_alerts_resolved_by
  ON guardrail_alerts (resolved_by);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by
  ON knowledge_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id
  ON lawyer_consultations (lawyer_match_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id
  ON lawyer_matches (chat_message_id);

CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id
  ON lawyer_messages (connection_id);

CREATE INDEX IF NOT EXISTS idx_legal_content_source_id
  ON legal_content (source_id);

CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id
  ON legal_documents (user_id);

CREATE INDEX IF NOT EXISTS idx_legal_holds_created_by
  ON legal_holds (created_by);
CREATE INDEX IF NOT EXISTS idx_legal_holds_matter_id
  ON legal_holds (matter_id);
CREATE INDEX IF NOT EXISTS idx_legal_holds_user_id
  ON legal_holds (user_id);
