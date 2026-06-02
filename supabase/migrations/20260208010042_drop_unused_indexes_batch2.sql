/*
  # Drop Unused Indexes - Batch 2

  Removes remaining ~61 unused indexes confirmed via pg_stat_user_indexes.

  1. Tables affected:
    - matter_activity_timeline, pro_bono_communications, pro_bono_documents
    - prompt_subcategories, referral_codes, report_templates
    - user_preferences, approval_requests, case_matches
    - case_matching_queue, cases, chatbot_documents
    - conflict_checks, conflict_waivers, crisis_incidents
    - data_deletion_requests, data_retention_policies, documents
    - engagement_analytics, grant_expenses, grant_reports
    - knowledge_documents, lawyer_consultations, lawyer_matches
    - legal_holds, lso_audit_logs, lso_client_intakes
    - lso_volunteer_attorneys, match_feedback, matching_notifications
    - matter_documents, access_requests, access_tokens
    - access_token_usage, openai_rate_limits, openai_usage_logs
    - pro_bono_applications, quote_requests, subscription_history
    - system_settings, trust_safety_reports, user_roles
    - widget_conversations, data_export_requests

  2. Important Notes
    - All use IF EXISTS for safety
    - Foreign key constraint indexes are separate and NOT affected
*/

DROP INDEX IF EXISTS idx_matter_activity_timeline_matter_id;
DROP INDEX IF EXISTS idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_application_id;
DROP INDEX IF EXISTS idx_prompt_subcategories_category_id;
DROP INDEX IF EXISTS idx_referral_codes_referred_user_id;
DROP INDEX IF EXISTS idx_report_templates_funder_id;
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_approval_requests_requested_by;
DROP INDEX IF EXISTS idx_case_matches_attorney_profile_id;
DROP INDEX IF EXISTS idx_case_matching_queue_created_by;
DROP INDEX IF EXISTS idx_cases_client_id;
DROP INDEX IF EXISTS idx_chatbot_documents_created_by;
DROP INDEX IF EXISTS idx_conflict_checks_performed_by;
DROP INDEX IF EXISTS idx_conflict_waivers_conflict_check_id;
DROP INDEX IF EXISTS idx_conflict_waivers_matter_id;
DROP INDEX IF EXISTS idx_crisis_incidents_user_id;
DROP INDEX IF EXISTS idx_data_deletion_requests_processed_by;
DROP INDEX IF EXISTS idx_data_retention_policies_created_by;
DROP INDEX IF EXISTS idx_data_retention_policies_organization_id;
DROP INDEX IF EXISTS idx_documents_case_id;
DROP INDEX IF EXISTS idx_engagement_analytics_user_id;
DROP INDEX IF EXISTS idx_grant_expenses_approved_by;
DROP INDEX IF EXISTS idx_grant_reports_generated_by;
DROP INDEX IF EXISTS idx_grant_reports_reviewed_by;
DROP INDEX IF EXISTS idx_knowledge_documents_uploaded_by;
DROP INDEX IF EXISTS idx_lawyer_consultations_lawyer_match_id;
DROP INDEX IF EXISTS idx_lawyer_matches_chat_message_id;
DROP INDEX IF EXISTS idx_legal_holds_created_by;
DROP INDEX IF EXISTS idx_lso_audit_logs_user_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_by;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_user_id;
DROP INDEX IF EXISTS idx_match_feedback_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_submitted_by;
DROP INDEX IF EXISTS idx_matching_notifications_attorney_id;
DROP INDEX IF EXISTS idx_matter_documents_added_by;
DROP INDEX IF EXISTS idx_access_requests_email;
DROP INDEX IF EXISTS idx_access_requests_invited_by;
DROP INDEX IF EXISTS idx_access_requests_resource;
DROP INDEX IF EXISTS idx_access_tokens_token;
DROP INDEX IF EXISTS idx_access_tokens_created_by;
DROP INDEX IF EXISTS idx_access_tokens_expires_at;
DROP INDEX IF EXISTS idx_access_token_usage_token_id;
DROP INDEX IF EXISTS idx_openai_rate_limits_user_id;
DROP INDEX IF EXISTS idx_openai_usage_logs_user_id;
DROP INDEX IF EXISTS idx_pro_bono_applications_assigned_to;
DROP INDEX IF EXISTS idx_pro_bono_communications_from_user_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_uploaded_by;
DROP INDEX IF EXISTS idx_quote_requests_connection_id;
DROP INDEX IF EXISTS idx_referral_codes_referrer_id;
DROP INDEX IF EXISTS idx_subscription_history_changed_by;
DROP INDEX IF EXISTS idx_system_settings_updated_by;
DROP INDEX IF EXISTS idx_trust_safety_reports_user_id;
DROP INDEX IF EXISTS idx_user_roles_role_id;
DROP INDEX IF EXISTS idx_widget_conversations_widget_id;
DROP INDEX IF EXISTS idx_legal_holds_active;
DROP INDEX IF EXISTS idx_legal_holds_user;
DROP INDEX IF EXISTS idx_legal_holds_matter;
DROP INDEX IF EXISTS idx_data_export_requests_user;
DROP INDEX IF EXISTS idx_data_export_requests_status;
DROP INDEX IF EXISTS idx_data_deletion_requests_user;
