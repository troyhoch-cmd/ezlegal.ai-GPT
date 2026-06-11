/*
  # Drop Unused Indexes

  1. Performance Improvement
     - Removes 100+ indexes that have never been used
     - Improves write performance and reduces storage costs
     - Reduces index maintenance overhead

  2. Database Optimization
     - Frees up storage space
     - Reduces memory usage for index caching
*/

DROP INDEX IF EXISTS public.idx_clients_user_id;
DROP INDEX IF EXISTS public.idx_lso_staff_org;
DROP INDEX IF EXISTS public.idx_lso_staff_user;
DROP INDEX IF EXISTS public.idx_lso_attorneys_org;
DROP INDEX IF EXISTS public.idx_lso_intakes_org;
DROP INDEX IF EXISTS public.idx_lso_intakes_status;
DROP INDEX IF EXISTS public.idx_lso_intakes_attorney;
DROP INDEX IF EXISTS public.idx_lso_hours_intake;
DROP INDEX IF EXISTS public.idx_lso_hours_attorney;
DROP INDEX IF EXISTS public.idx_auth_security_events_user_id;
DROP INDEX IF EXISTS public.idx_auth_security_events_created_at;
DROP INDEX IF EXISTS public.idx_auth_security_events_type;
DROP INDEX IF EXISTS public.idx_lawyer_matches_user_id;
DROP INDEX IF EXISTS public.idx_lawyer_matches_status;
DROP INDEX IF EXISTS public.idx_anonymous_sessions_ip_hash;
DROP INDEX IF EXISTS public.idx_anonymous_sessions_created_at;
DROP INDEX IF EXISTS public.idx_conversion_events_session_id;
DROP INDEX IF EXISTS public.idx_conversion_events_type;
DROP INDEX IF EXISTS public.idx_chat_messages_anonymous_session_id;
DROP INDEX IF EXISTS public.idx_chat_messages_anonymous_created_at;
DROP INDEX IF EXISTS public.idx_chat_attachments_message_id;
DROP INDEX IF EXISTS public.idx_lawyer_matches_created_at;
DROP INDEX IF EXISTS public.idx_lawyer_consultations_user_id;
DROP INDEX IF EXISTS public.idx_lawyer_consultations_status;
DROP INDEX IF EXISTS public.idx_lawyer_consultations_date;
DROP INDEX IF EXISTS public.idx_lawyer_profiles_city;
DROP INDEX IF EXISTS public.idx_lawyer_profiles_specialty;
DROP INDEX IF EXISTS public.idx_lawyer_profiles_practice_areas;
DROP INDEX IF EXISTS public.idx_email_captures_email;
DROP INDEX IF EXISTS public.idx_usage_tracking_user_month;
DROP INDEX IF EXISTS public.idx_trial_touchpoints_user;
DROP INDEX IF EXISTS public.idx_trial_touchpoints_event;
DROP INDEX IF EXISTS public.idx_subscription_history_user;
DROP INDEX IF EXISTS public.idx_profiles_subscription_tier;
DROP INDEX IF EXISTS public.idx_profiles_trial_expires;
DROP INDEX IF EXISTS public.idx_user_preferences_user_id;
DROP INDEX IF EXISTS public.idx_free_chat_sessions_session_token;
DROP INDEX IF EXISTS public.idx_trial_subscriptions_user_id;
DROP INDEX IF EXISTS public.idx_eligibility_screenings_user_id;
DROP INDEX IF EXISTS public.idx_eligibility_screenings_status;
DROP INDEX IF EXISTS public.idx_history_tenant;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_user_id;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_email;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_status;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_created_at;
DROP INDEX IF EXISTS public.idx_pro_bono_applications_partner_org;
DROP INDEX IF EXISTS public.idx_pro_bono_documents_application_id;
DROP INDEX IF EXISTS public.idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS public.idx_history_case_type;
DROP INDEX IF EXISTS public.idx_history_outcome;
DROP INDEX IF EXISTS public.idx_history_jurisdiction;
DROP INDEX IF EXISTS public.idx_predictions_tenant;
DROP INDEX IF EXISTS public.idx_predictions_case;
DROP INDEX IF EXISTS public.idx_knowledge_documents_status;
DROP INDEX IF EXISTS public.idx_knowledge_documents_jurisdiction;
DROP INDEX IF EXISTS public.idx_knowledge_documents_category;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_admin_id;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_entity_type;
DROP INDEX IF EXISTS public.idx_admin_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_analytics_events_type;
DROP INDEX IF EXISTS public.idx_analytics_events_created_at;
DROP INDEX IF EXISTS public.idx_analytics_events_tenant;
DROP INDEX IF EXISTS public.idx_predictions_active;
DROP INDEX IF EXISTS public.idx_model_perf_version;
DROP INDEX IF EXISTS public.idx_chatbot_documents_category;
DROP INDEX IF EXISTS public.idx_chatbot_documents_is_active;
DROP INDEX IF EXISTS public.idx_prompt_subcategories_category;
DROP INDEX IF EXISTS public.idx_chatbot_prompts_category;
DROP INDEX IF EXISTS public.idx_chatbot_prompts_subcategory;
DROP INDEX IF EXISTS public.idx_documents_user_jurisdiction;
DROP INDEX IF EXISTS public.idx_grants_user_id;
DROP INDEX IF EXISTS public.idx_grants_funder_id;
DROP INDEX IF EXISTS public.idx_grants_status;
DROP INDEX IF EXISTS public.idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS public.idx_grant_milestones_status;
DROP INDEX IF EXISTS public.idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS public.idx_grant_expenses_category;
DROP INDEX IF EXISTS public.idx_grant_reports_grant_id;
DROP INDEX IF EXISTS public.idx_grant_reports_status;
DROP INDEX IF EXISTS public.idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS public.idx_report_templates_funder_id;
DROP INDEX IF EXISTS public.idx_chat_messages_jurisdiction;
DROP INDEX IF EXISTS public.idx_documents_jurisdiction;
DROP INDEX IF EXISTS public.idx_ezreads_articles_published;
DROP INDEX IF EXISTS public.idx_case_matching_queue_org;
DROP INDEX IF EXISTS public.idx_case_matching_queue_status;
DROP INDEX IF EXISTS public.idx_case_matching_queue_urgency;
DROP INDEX IF EXISTS public.idx_case_matching_queue_case_type;
DROP INDEX IF EXISTS public.idx_case_matching_queue_created;
DROP INDEX IF EXISTS public.idx_attorney_matching_profiles_attorney;
DROP INDEX IF EXISTS public.idx_attorney_matching_profiles_org;
DROP INDEX IF EXISTS public.idx_attorney_matching_profiles_available;
DROP INDEX IF EXISTS public.idx_case_matches_case;
DROP INDEX IF EXISTS public.idx_case_matches_attorney;
DROP INDEX IF EXISTS public.idx_case_matches_status;
DROP INDEX IF EXISTS public.idx_case_matches_org;
DROP INDEX IF EXISTS public.idx_match_feedback_match;
DROP INDEX IF EXISTS public.idx_matching_notifications_match;
