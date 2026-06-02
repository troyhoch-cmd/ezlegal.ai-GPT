/*
  # Add Missing Foreign Key Indexes - Final Batch

  This migration adds indexes to all foreign key columns that are missing indexes.
  Missing indexes on foreign keys can cause suboptimal query performance during JOINs and cascading operations.

  ## Tables and Indexes Added:
  1. analytics_events.user_id
  2. appointment_requests.connection_id
  3. approval_decisions.request_id
  4. approval_requests.requested_by
  5. case_matches.attorney_profile_id
  6. case_matching_queue.created_by
  7. cases.client_id
  8. chatbot_documents.created_by
  9. conflict_checks.performed_by
  10. conflict_waivers.conflict_check_id
  11. conflict_waivers.matter_id
  12. crisis_incidents.user_id
  13. documents.case_id
  14. grant_expenses.approved_by
  15. grant_reports.generated_by
  16. grant_reports.reviewed_by
  17. knowledge_documents.uploaded_by
  18. lawyer_consultations.lawyer_match_id
  19. lawyer_matches.chat_message_id
  20. lso_audit_logs.user_id
  21. lso_client_intakes.assigned_by
  22. lso_volunteer_attorneys.user_id
  23. match_feedback.organization_id
  24. match_feedback.submitted_by
  25. matching_notifications.attorney_id
  26. matter_documents.added_by
  27. openai_rate_limits.user_id
  28. openai_usage_logs.user_id
  29. pro_bono_applications.assigned_to
  30. pro_bono_communications.from_user_id
  31. pro_bono_documents.uploaded_by
  32. quote_requests.connection_id
  33. subscription_history.changed_by
  34. system_settings.updated_by
  35. trust_safety_reports.user_id
  36. user_roles.role_id
  37. widget_conversations.widget_id
*/

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

-- documents.case_id
CREATE INDEX IF NOT EXISTS idx_documents_case_id 
ON public.documents(case_id);

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
