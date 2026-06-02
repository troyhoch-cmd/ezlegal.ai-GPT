/*
  # Drop Unused Indexes - Final Batch

  This migration drops indexes that have not been used according to pg_stat_user_indexes.
  Unused indexes consume storage and slow down write operations without providing query benefits.

  ## Indexes Dropped:
  - Various indexes on access_audit_log, approval_requests, attorney_matching_profiles
  - Various indexes on case_matches, case_matching_queue, lso_case_hours
  - Various indexes on chat, chatbot, conflict, conversion tables
  - Various indexes on grant, lso, match, pro_bono tables
  - Various indexes on matters, documents, ai_response tables
  - Various indexes on arizona_legal_sources, lawyer_connections tables

  ## Safety Note:
  These indexes were identified as unused. If any queries slow down after this migration,
  the indexes can be recreated.
*/

-- profiles
DROP INDEX IF EXISTS idx_profiles_role;

-- access_audit_log
DROP INDEX IF EXISTS idx_access_audit_entity;
DROP INDEX IF EXISTS idx_access_audit_action;
DROP INDEX IF EXISTS idx_access_audit_granted;
DROP INDEX IF EXISTS idx_access_audit_created_at;

-- approval_requests
DROP INDEX IF EXISTS idx_approval_requests_workflow_id;

-- attorney_matching_profiles
DROP INDEX IF EXISTS idx_attorney_matching_profiles_organization_id;

-- case_matches
DROP INDEX IF EXISTS idx_case_matches_attorney_id;
DROP INDEX IF EXISTS idx_case_matches_case_id;
DROP INDEX IF EXISTS idx_case_matches_organization_id;

-- case_matching_queue
DROP INDEX IF EXISTS idx_case_matching_queue_organization_id;

-- lso_case_hours
DROP INDEX IF EXISTS idx_lso_case_hours_attorney_id;
DROP INDEX IF EXISTS idx_lso_case_hours_intake_id;

-- lso_client_intakes
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_attorney_id;

-- chat_messages_anonymous
DROP INDEX IF EXISTS idx_chat_messages_anonymous_session_id;

-- chatbot_prompts
DROP INDEX IF EXISTS idx_chatbot_prompts_category_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_subcategory_id;

-- conflict_waivers
DROP INDEX IF EXISTS idx_conflict_waivers_conflicting_matter_id;

-- conversion_events
DROP INDEX IF EXISTS idx_conversion_events_session_id;

-- grant tables
DROP INDEX IF EXISTS idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS idx_grant_reports_grant_id;
DROP INDEX IF EXISTS idx_grants_funder_id;

-- lso tables
DROP INDEX IF EXISTS idx_lso_client_intakes_organization_id;
DROP INDEX IF EXISTS idx_lso_staff_organization_id;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_organization_id;

-- match tables
DROP INDEX IF EXISTS idx_match_feedback_match_id;
DROP INDEX IF EXISTS idx_matching_notifications_match_id;

-- pro_bono tables
DROP INDEX IF EXISTS idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_application_id;

-- prompt tables
DROP INDEX IF EXISTS idx_prompt_subcategories_category_id;

-- report_templates
DROP INDEX IF EXISTS idx_report_templates_funder_id;

-- user_preferences
DROP INDEX IF EXISTS idx_user_preferences_user_id;

-- matters
DROP INDEX IF EXISTS idx_matters_status;
DROP INDEX IF EXISTS idx_matters_practice_area;
DROP INDEX IF EXISTS idx_matters_created_at;

-- matter_participants
DROP INDEX IF EXISTS idx_matter_participants_matter_id;
DROP INDEX IF EXISTS idx_matter_participants_role;
DROP INDEX IF EXISTS idx_matter_participants_active;

-- matter_documents
DROP INDEX IF EXISTS idx_matter_documents_matter_id;
DROP INDEX IF EXISTS idx_matter_documents_category;

-- matter_activity_timeline
DROP INDEX IF EXISTS idx_matter_activity_matter_id;
DROP INDEX IF EXISTS idx_matter_activity_type;
DROP INDEX IF EXISTS idx_matter_activity_created_at;

-- chatbot_documents
DROP INDEX IF EXISTS idx_chatbot_documents_embedding;

-- chat_contexts
DROP INDEX IF EXISTS idx_chat_contexts_matter_id;

-- documents
DROP INDEX IF EXISTS idx_documents_matter_id;

-- ai_response_provenance
DROP INDEX IF EXISTS idx_ai_provenance_matter_id;
DROP INDEX IF EXISTS idx_ai_provenance_model_id;
DROP INDEX IF EXISTS idx_ai_provenance_created_at;

-- ai_response_citations
DROP INDEX IF EXISTS idx_ai_citations_provenance_id;
DROP INDEX IF EXISTS idx_ai_citations_source_type;
DROP INDEX IF EXISTS idx_ai_citations_source_id;

-- ai_consent_records
DROP INDEX IF EXISTS idx_ai_consent_type;
DROP INDEX IF EXISTS idx_ai_consent_granted_at;

-- ai_disclosure_acknowledgments
DROP INDEX IF EXISTS idx_ai_disclosure_type;

-- usage_alerts
DROP INDEX IF EXISTS idx_usage_alerts_unack;

-- arizona_legal_sources
DROP INDEX IF EXISTS idx_arizona_legal_sources_embedding;
DROP INDEX IF EXISTS idx_arizona_legal_sources_source_type;
DROP INDEX IF EXISTS idx_arizona_legal_sources_title_number;
DROP INDEX IF EXISTS idx_arizona_legal_sources_section;
DROP INDEX IF EXISTS idx_arizona_legal_sources_is_active;
DROP INDEX IF EXISTS idx_arizona_legal_sources_scraped_at;
DROP INDEX IF EXISTS idx_arizona_legal_sources_practice_areas;
DROP INDEX IF EXISTS idx_arizona_legal_sources_keywords;

-- lawyer_connections
DROP INDEX IF EXISTS idx_lawyer_connections_status;
DROP INDEX IF EXISTS idx_lawyer_connections_lawyer_id;

-- lawyer_messages
DROP INDEX IF EXISTS idx_lawyer_messages_connection_id;
DROP INDEX IF EXISTS idx_lawyer_messages_created_at;

-- appointment_requests
DROP INDEX IF EXISTS idx_appointment_requests_status;
DROP INDEX IF EXISTS idx_appointment_requests_preferred_date;

-- quote_requests
DROP INDEX IF EXISTS idx_quote_requests_status;
