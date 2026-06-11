/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvement
     - Adds indexes to all foreign key columns that were missing covering indexes
     - Total: 22 new indexes for optimal join and query performance

  2. Security
     - Improves query performance which reduces DoS vulnerability from slow queries
*/

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_profile_id ON public.case_matches(attorney_profile_id);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created_by ON public.case_matching_queue(created_by);
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_documents_created_by ON public.chatbot_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON public.documents(case_id);
CREATE INDEX IF NOT EXISTS idx_grant_expenses_approved_by ON public.grant_expenses(approved_by);
CREATE INDEX IF NOT EXISTS idx_grant_reports_generated_by ON public.grant_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_grant_reports_reviewed_by ON public.grant_reports(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_uploaded_by ON public.knowledge_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_lawyer_consultations_lawyer_match_id ON public.lawyer_consultations(lawyer_match_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_matches_chat_message_id ON public.lawyer_matches(chat_message_id);
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by ON public.lso_client_intakes(assigned_by);
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id ON public.lso_volunteer_attorneys(user_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id ON public.match_feedback(organization_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by ON public.match_feedback(submitted_by);
CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id ON public.matching_notifications(attorney_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to ON public.pro_bono_applications(assigned_to);
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id ON public.pro_bono_communications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by ON public.pro_bono_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by ON public.subscription_history(changed_by);
CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by ON public.system_settings(updated_by);
