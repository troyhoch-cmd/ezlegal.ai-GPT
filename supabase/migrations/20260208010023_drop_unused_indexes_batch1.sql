/*
  # Drop Unused Indexes - Batch 1

  Removes 60 indexes that have never been used according to pg_stat_user_indexes.
  Unused indexes waste disk space and slow down INSERT/UPDATE/DELETE operations
  because every write must also update the index.

  1. Tables affected:
    - data_deletion_requests, chat_messages, appointment_requests
    - negotiations, negotiation_batna_analysis, negotiation_zopa
    - negotiation_rounds, negotiation_scripts, funding_requests
    - negotiation_planner_purchases, negotiation_plans_generated
    - quote_requests, ai_response_citations, ai_response_provenance
    - approval_requests, attorney_matching_profiles, case_matches
    - case_matching_queue, chat_contexts, chat_messages_anonymous
    - chatbot_prompts, conflict_waivers, conversion_events
    - documents, engagement_events, grant_expenses, grant_metrics
    - grant_milestones, grant_reports, access_requests
    - access_token_usage, analytics_events, approval_decisions
    - grants, lawyer_messages

  2. Important Notes
    - All use IF EXISTS for safety
    - These indexes were confirmed unused via pg_stat_user_indexes
    - Indexes backing unique constraints or primary keys are NOT dropped
*/

DROP INDEX IF EXISTS idx_data_deletion_requests_status;
DROP INDEX IF EXISTS idx_chat_messages_deleted;
DROP INDEX IF EXISTS idx_chat_messages_retention;
DROP INDEX IF EXISTS idx_appointment_requests_lawyer_id;
DROP INDEX IF EXISTS idx_appointment_requests_status;
DROP INDEX IF EXISTS idx_appointment_requests_preferred_date;
DROP INDEX IF EXISTS idx_negotiations_user_id;
DROP INDEX IF EXISTS idx_negotiations_session_id;
DROP INDEX IF EXISTS idx_negotiations_status;
DROP INDEX IF EXISTS idx_negotiations_dispute_type;
DROP INDEX IF EXISTS idx_negotiation_batna_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_zopa_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_rounds_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_rounds_round_number;
DROP INDEX IF EXISTS idx_negotiation_scripts_dispute_type;
DROP INDEX IF EXISTS idx_negotiation_scripts_scenario;
DROP INDEX IF EXISTS idx_funding_requests_user_id;
DROP INDEX IF EXISTS idx_funding_requests_lawyer_id;
DROP INDEX IF EXISTS idx_funding_requests_status;
DROP INDEX IF EXISTS idx_funding_requests_funding_type;
DROP INDEX IF EXISTS idx_negotiation_purchases_email;
DROP INDEX IF EXISTS idx_negotiation_plans_user_id;
DROP INDEX IF EXISTS idx_negotiation_plans_session_id;
DROP INDEX IF EXISTS idx_quote_requests_lawyer_id;
DROP INDEX IF EXISTS idx_quote_requests_status;
DROP INDEX IF EXISTS idx_quote_requests_created_at;
DROP INDEX IF EXISTS idx_ai_response_citations_provenance_id;
DROP INDEX IF EXISTS idx_ai_response_provenance_matter_id;
DROP INDEX IF EXISTS idx_approval_requests_workflow_id;
DROP INDEX IF EXISTS idx_attorney_matching_profiles_organization_id;
DROP INDEX IF EXISTS idx_case_matches_attorney_id;
DROP INDEX IF EXISTS idx_case_matches_case_id;
DROP INDEX IF EXISTS idx_case_matches_organization_id;
DROP INDEX IF EXISTS idx_case_matching_queue_organization_id;
DROP INDEX IF EXISTS idx_chat_contexts_matter_id;
DROP INDEX IF EXISTS idx_chat_messages_anonymous_session_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_category_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_subcategory_id;
DROP INDEX IF EXISTS idx_conflict_waivers_conflicting_matter_id;
DROP INDEX IF EXISTS idx_conversion_events_session_id;
DROP INDEX IF EXISTS idx_documents_matter_id;
DROP INDEX IF EXISTS idx_engagement_events_user_id;
DROP INDEX IF EXISTS idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS idx_grant_reports_grant_id;
DROP INDEX IF EXISTS idx_access_requests_reviewed_by;
DROP INDEX IF EXISTS idx_access_token_usage_user_id;
DROP INDEX IF EXISTS idx_analytics_events_user_id;
DROP INDEX IF EXISTS idx_appointment_requests_connection_id;
DROP INDEX IF EXISTS idx_approval_decisions_request_id;
DROP INDEX IF EXISTS idx_grants_funder_id;
DROP INDEX IF EXISTS idx_lawyer_messages_connection_id;
DROP INDEX IF EXISTS idx_lso_case_hours_attorney_id;
DROP INDEX IF EXISTS idx_lso_case_hours_intake_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_attorney_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_organization_id;
DROP INDEX IF EXISTS idx_lso_staff_organization_id;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_match_id;
DROP INDEX IF EXISTS idx_matching_notifications_match_id;
