/*
  # Add Missing Foreign Key Indexes - Batch 2

  ## Purpose
  Continue adding indexes on foreign key columns for optimal query performance.

  ## Tables Affected (20 tables)
  1. grants - funder_id
  2. lawyer_messages - connection_id
  3. lso_case_hours - attorney_id, intake_id
  4. lso_client_intakes - assigned_attorney_id, organization_id
  5. lso_staff - organization_id
  6. lso_volunteer_attorneys - organization_id
  7. match_feedback - match_id
  8. matching_notifications - match_id
  9. matter_activity_timeline - matter_id
  10. pro_bono_communications - application_id
  11. pro_bono_documents - application_id
  12. prompt_subcategories - category_id
  13. referral_codes - referred_user_id
  14. report_templates - funder_id
  15. user_preferences - user_id

  ## Security
  No security changes - index creation only
*/

-- grants.funder_id
CREATE INDEX IF NOT EXISTS idx_grants_funder_id
  ON public.grants(funder_id);

-- lawyer_messages.connection_id
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id
  ON public.lawyer_messages(connection_id);

-- lso_case_hours foreign keys
CREATE INDEX IF NOT EXISTS idx_lso_case_hours_attorney_id
  ON public.lso_case_hours(attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_intake_id
  ON public.lso_case_hours(intake_id);

-- lso_client_intakes foreign keys
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_attorney_id
  ON public.lso_client_intakes(assigned_attorney_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_organization_id
  ON public.lso_client_intakes(organization_id);

-- lso_staff.organization_id
CREATE INDEX IF NOT EXISTS idx_lso_staff_organization_id
  ON public.lso_staff(organization_id);

-- lso_volunteer_attorneys.organization_id
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_organization_id
  ON public.lso_volunteer_attorneys(organization_id);

-- match_feedback.match_id
CREATE INDEX IF NOT EXISTS idx_match_feedback_match_id
  ON public.match_feedback(match_id);

-- matching_notifications.match_id
CREATE INDEX IF NOT EXISTS idx_matching_notifications_match_id
  ON public.matching_notifications(match_id);

-- matter_activity_timeline.matter_id
CREATE INDEX IF NOT EXISTS idx_matter_activity_timeline_matter_id
  ON public.matter_activity_timeline(matter_id);

-- pro_bono_communications.application_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id
  ON public.pro_bono_communications(application_id);

-- pro_bono_documents.application_id
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id
  ON public.pro_bono_documents(application_id);

-- prompt_subcategories.category_id
CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category_id
  ON public.prompt_subcategories(category_id);

-- referral_codes.referred_user_id
CREATE INDEX IF NOT EXISTS idx_referral_codes_referred_user_id
  ON public.referral_codes(referred_user_id);

-- report_templates.funder_id
CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id
  ON public.report_templates(funder_id);

-- user_preferences.user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences(user_id);
