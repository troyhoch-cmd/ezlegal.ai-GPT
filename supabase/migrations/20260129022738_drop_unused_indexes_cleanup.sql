/*
  # Drop Unused Indexes - Performance Cleanup

  ## Purpose
  Remove indexes that have never been used according to pg_stat_user_indexes.
  Unused indexes waste storage and slow down INSERT/UPDATE/DELETE operations.

  ## Indexes Being Dropped (47 indexes)
  - activity_log: idx_activity_log_related
  - engagement_analytics: idx_engagement_feature, idx_engagement_case_type, idx_engagement_created, idx_engagement_user
  - anonymized_searches: idx_anon_searches_category, idx_anon_searches_case_type, idx_anon_searches_keywords, idx_anon_searches_created
  - engagement_events: idx_engagement_events_type, idx_engagement_events_platform, idx_engagement_events_language, idx_engagement_events_created
  - referral_codes: idx_referral_codes_code, idx_referral_codes_referrer, idx_referral_codes_status
  - case_matches: idx_case_matches_attorney_profile_id
  - analytics_events: idx_analytics_events_user_id
  - case_matching_queue: idx_case_matching_queue_created_by
  - cases: idx_cases_client_id
  - chatbot_documents: idx_chatbot_documents_created_by
  - conflict_checks: idx_conflict_checks_performed_by
  - conflict_waivers: idx_conflict_waivers_conflict_check_id, idx_conflict_waivers_matter_id
  - crisis_incidents: idx_crisis_incidents_user_id
  - appointment_requests: idx_appointment_requests_connection_id
  - approval_decisions: idx_approval_decisions_request_id
  - approval_requests: idx_approval_requests_requested_by
  - documents: idx_documents_case_id
  - grant_expenses: idx_grant_expenses_approved_by
  - grant_reports: idx_grant_reports_generated_by, idx_grant_reports_reviewed_by
  - knowledge_documents: idx_knowledge_documents_uploaded_by
  - lawyer_consultations: idx_lawyer_consultations_lawyer_match_id
  - lawyer_matches: idx_lawyer_matches_chat_message_id
  - lso_audit_logs: idx_lso_audit_logs_user_id
  - lso_client_intakes: idx_lso_client_intakes_assigned_by
  - lso_volunteer_attorneys: idx_lso_volunteer_attorneys_user_id
  - match_feedback: idx_match_feedback_organization_id, idx_match_feedback_submitted_by
  - matching_notifications: idx_matching_notifications_attorney_id
  - matter_documents: idx_matter_documents_added_by
  - openai_rate_limits: idx_openai_rate_limits_user_id
  - openai_usage_logs: idx_openai_usage_logs_user_id
  - pro_bono_applications: idx_pro_bono_applications_assigned_to
  - pro_bono_communications: idx_pro_bono_communications_from_user_id
  - pro_bono_documents: idx_pro_bono_documents_uploaded_by
  - quote_requests: idx_quote_requests_connection_id
  - subscription_history: idx_subscription_history_changed_by
  - system_settings: idx_system_settings_updated_by
  - trust_safety_reports: idx_trust_safety_reports_user_id
  - user_roles: idx_user_roles_role_id
  - widget_conversations: idx_widget_conversations_widget_id

  ## Security
  No security changes - index management only

  ## Notes
  Indexes are dropped with IF EXISTS to prevent errors on repeated runs
*/

-- activity_log
DROP INDEX IF EXISTS idx_activity_log_related;

-- engagement_analytics
DROP INDEX IF EXISTS idx_engagement_feature;
DROP INDEX IF EXISTS idx_engagement_case_type;
DROP INDEX IF EXISTS idx_engagement_created;
DROP INDEX IF EXISTS idx_engagement_user;

-- anonymized_searches
DROP INDEX IF EXISTS idx_anon_searches_category;
DROP INDEX IF EXISTS idx_anon_searches_case_type;
DROP INDEX IF EXISTS idx_anon_searches_keywords;
DROP INDEX IF EXISTS idx_anon_searches_created;

-- engagement_events
DROP INDEX IF EXISTS idx_engagement_events_type;
DROP INDEX IF EXISTS idx_engagement_events_platform;
DROP INDEX IF EXISTS idx_engagement_events_language;
DROP INDEX IF EXISTS idx_engagement_events_created;

-- referral_codes
DROP INDEX IF EXISTS idx_referral_codes_code;
DROP INDEX IF EXISTS idx_referral_codes_referrer;
DROP INDEX IF EXISTS idx_referral_codes_status;

-- case_matches
DROP INDEX IF EXISTS idx_case_matches_attorney_profile_id;

-- analytics_events
DROP INDEX IF EXISTS idx_analytics_events_user_id;

-- case_matching_queue
DROP INDEX IF EXISTS idx_case_matching_queue_created_by;

-- cases
DROP INDEX IF EXISTS idx_cases_client_id;

-- chatbot_documents
DROP INDEX IF EXISTS idx_chatbot_documents_created_by;

-- conflict_checks
DROP INDEX IF EXISTS idx_conflict_checks_performed_by;

-- conflict_waivers
DROP INDEX IF EXISTS idx_conflict_waivers_conflict_check_id;
DROP INDEX IF EXISTS idx_conflict_waivers_matter_id;

-- crisis_incidents
DROP INDEX IF EXISTS idx_crisis_incidents_user_id;

-- appointment_requests
DROP INDEX IF EXISTS idx_appointment_requests_connection_id;

-- approval_decisions
DROP INDEX IF EXISTS idx_approval_decisions_request_id;

-- approval_requests
DROP INDEX IF EXISTS idx_approval_requests_requested_by;

-- documents
DROP INDEX IF EXISTS idx_documents_case_id;

-- grant_expenses
DROP INDEX IF EXISTS idx_grant_expenses_approved_by;

-- grant_reports
DROP INDEX IF EXISTS idx_grant_reports_generated_by;
DROP INDEX IF EXISTS idx_grant_reports_reviewed_by;

-- knowledge_documents
DROP INDEX IF EXISTS idx_knowledge_documents_uploaded_by;

-- lawyer_consultations
DROP INDEX IF EXISTS idx_lawyer_consultations_lawyer_match_id;

-- lawyer_matches
DROP INDEX IF EXISTS idx_lawyer_matches_chat_message_id;

-- lso_audit_logs
DROP INDEX IF EXISTS idx_lso_audit_logs_user_id;

-- lso_client_intakes
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_by;

-- lso_volunteer_attorneys
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_user_id;

-- match_feedback
DROP INDEX IF EXISTS idx_match_feedback_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_submitted_by;

-- matching_notifications
DROP INDEX IF EXISTS idx_matching_notifications_attorney_id;

-- matter_documents
DROP INDEX IF EXISTS idx_matter_documents_added_by;

-- openai_rate_limits
DROP INDEX IF EXISTS idx_openai_rate_limits_user_id;

-- openai_usage_logs
DROP INDEX IF EXISTS idx_openai_usage_logs_user_id;

-- pro_bono_applications
DROP INDEX IF EXISTS idx_pro_bono_applications_assigned_to;

-- pro_bono_communications
DROP INDEX IF EXISTS idx_pro_bono_communications_from_user_id;

-- pro_bono_documents
DROP INDEX IF EXISTS idx_pro_bono_documents_uploaded_by;

-- quote_requests
DROP INDEX IF EXISTS idx_quote_requests_connection_id;

-- subscription_history
DROP INDEX IF EXISTS idx_subscription_history_changed_by;

-- system_settings
DROP INDEX IF EXISTS idx_system_settings_updated_by;

-- trust_safety_reports
DROP INDEX IF EXISTS idx_trust_safety_reports_user_id;

-- user_roles
DROP INDEX IF EXISTS idx_user_roles_role_id;

-- widget_conversations
DROP INDEX IF EXISTS idx_widget_conversations_widget_id;
