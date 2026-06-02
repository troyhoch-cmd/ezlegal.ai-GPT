/*
  # Add Missing Foreign Key Indexes - Security Fix

  This migration adds indexes for foreign key columns that were missing indexes,
  which can cause performance issues during JOIN operations and CASCADE deletes.

  ## Tables with new indexes:
  1. access_requests - reviewed_by
  2. access_token_usage - user_id
  3. analytics_events - user_id
  4. appointment_requests - connection_id
  5. approval_decisions - request_id
  6. approval_requests - requested_by
  7. case_matches - attorney_profile_id
  8. case_matching_queue - created_by
  9. cases - client_id
  10. chatbot_documents - created_by
  11. conflict_checks - performed_by
  12. conflict_waivers - conflict_check_id, matter_id
  13. crisis_incidents - user_id
  14. data_deletion_requests - processed_by
  15. data_retention_policies - created_by, organization_id
  16. documents - case_id
  17. engagement_analytics - user_id
  18. grant_expenses - approved_by
  19. grant_reports - generated_by, reviewed_by
  20. knowledge_documents - uploaded_by
  21. lawyer_consultations - lawyer_match_id
  22. lawyer_matches - chat_message_id
  23. legal_holds - created_by
  24. lso_audit_logs - user_id
  25. lso_client_intakes - assigned_by
  26. lso_volunteer_attorneys - user_id
  27. match_feedback - organization_id, submitted_by
  28. matching_notifications - attorney_id
  29. matter_documents - added_by
  30. openai_rate_limits - user_id
  31. openai_usage_logs - user_id
  32. pro_bono_applications - assigned_to
  33. pro_bono_communications - from_user_id
  34. pro_bono_documents - uploaded_by
  35. quote_requests - connection_id
  36. referral_codes - referrer_id
  37. subscription_history - changed_by
  38. system_settings - updated_by
  39. trust_safety_reports - user_id
  40. user_roles - role_id
  41. widget_conversations - widget_id
*/

-- access_requests.reviewed_by
CREATE INDEX IF NOT EXISTS idx_access_requests_reviewed_by 
ON public.access_requests(reviewed_by);

-- access_token_usage.user_id
CREATE INDEX IF NOT EXISTS idx_access_token_usage_user_id 
ON public.access_token_usage(user_id);

-- analytics_events.user_id
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id 
ON public.analytics_events(user_id);

-- appointment_requests.connection_id
CREATE INDEX IF NOT EXISTS idx_appointment_requests_connection_id 
ON public.appointment_requests(connection_id);

-- approval_decisions.request_id
CREATE INDEX IF NOT EXISTS idx_approval_decisions_request_id 
ON public.approval_decisions(request_id);

-- approval_requests.requested_by
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by 
ON public.approval_requests(requested_by);

-- case_matches.attorney_profile_id
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id 
ON public.case_matches(attorney_profile_id);

-- case_matching_queue.created_by
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by 
ON public.case_matching_queue(created_by);

-- cases.client_id
CREATE INDEX IF NOT EXISTS idx_cases_client_id 
ON public.cases(client_id);

-- chatbot_documents.created_by
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by 
ON public.chatbot_documents(created_by);

-- conflict_checks.performed_by
CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by 
ON public.conflict_checks(performed_by);

-- conflict_waivers.conflict_check_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflict_check_id 
ON public.conflict_waivers(conflict_check_id);

-- conflict_waivers.matter_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter_id 
ON public.conflict_waivers(matter_id);

-- crisis_incidents.user_id
CREATE INDEX IF NOT EXISTS idx_crisis_incidents_user_id 
ON public.crisis_incidents(user_id);

-- data_deletion_requests.processed_by
CREATE INDEX IF NOT EXISTS idx_data_deletion_requests_processed_by 
ON public.data_deletion_requests(processed_by);

-- data_retention_policies.created_by
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_created_by 
ON public.data_retention_policies(created_by);

-- data_retention_policies.organization_id
CREATE INDEX IF NOT EXISTS idx_data_retention_policies_organization_id 
ON public.data_retention_policies(organization_id);

-- documents.case_id
CREATE INDEX IF NOT EXISTS idx_documents_case_id 
ON public.documents(case_id);

-- engagement_analytics.user_id
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_id 
ON public.engagement_analytics(user_id);

-- grant_expenses.approved_by
CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by 
ON public.grant_expenses(approved_by);

-- grant_reports.generated_by
CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by 
ON public.grant_reports(generated_by);

-- grant_reports.reviewed_by
CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by 
ON public.grant_reports(reviewed_by);

-- knowledge_documents.uploaded_by
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by 
ON public.knowledge_documents(uploaded_by);

-- lawyer_consultations.lawyer_match_id
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id 
ON public.lawyer_consultations(lawyer_match_id);

-- lawyer_matches.chat_message_id
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id 
ON public.lawyer_matches(chat_message_id);

-- legal_holds.created_by
CREATE INDEX IF NOT EXISTS idx_legal_holds_created_by 
ON public.legal_holds(created_by);

-- lso_audit_logs.user_id
CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id 
ON public.lso_audit_logs(user_id);

-- lso_client_intakes.assigned_by
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by 
ON public.lso_client_intakes(assigned_by);

-- lso_volunteer_attorneys.user_id
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id 
ON public.lso_volunteer_attorneys(user_id);

-- match_feedback.organization_id
CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id 
ON public.match_feedback(organization_id);

-- match_feedback.submitted_by
CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by 
ON public.match_feedback(submitted_by);

-- matching_notifications.attorney_id
CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id 
ON public.matching_notifications(attorney_id);

-- matter_documents.added_by
CREATE INDEX IF NOT EXISTS idx_matter_documents_added_by 
ON public.matter_documents(added_by);

-- openai_rate_limits.user_id
CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id 
ON public.openai_rate_limits(user_id);

-- openai_usage_logs.user_id
CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id 
ON public.openai_usage_logs(user_id);

-- pro_bono_applications.assigned_to
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to 
ON public.pro_bono_applications(assigned_to);

-- pro_bono_communications.from_user_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id 
ON public.pro_bono_communications(from_user_id);

-- pro_bono_documents.uploaded_by
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by 
ON public.pro_bono_documents(uploaded_by);

-- quote_requests.connection_id
CREATE INDEX IF NOT EXISTS idx_quote_requests_connection_id 
ON public.quote_requests(connection_id);

-- referral_codes.referrer_id
CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id 
ON public.referral_codes(referrer_id);

-- subscription_history.changed_by
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by 
ON public.subscription_history(changed_by);

-- system_settings.updated_by
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by 
ON public.system_settings(updated_by);

-- trust_safety_reports.user_id
CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user_id 
ON public.trust_safety_reports(user_id);

-- user_roles.role_id
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id 
ON public.user_roles(role_id);

-- widget_conversations.widget_id
CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id 
ON public.widget_conversations(widget_id);