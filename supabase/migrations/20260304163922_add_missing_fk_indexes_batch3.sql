/*
  # Add missing FK indexes batch 3

  Covers:
  - lso_audit_logs (user_id)
  - lso_case_hours (attorney_id, intake_id)
  - lso_client_intakes (assigned_attorney_id, assigned_by, organization_id)
  - lso_staff (organization_id)
  - lso_volunteer_attorneys (organization_id, user_id)
  - match_feedback (match_id, organization_id, submitted_by)
  - matching_notifications (attorney_id, match_id)
  - matter_activity_timeline (matter_id)
  - matter_documents (added_by)
  - negotiation_batna_analysis (negotiation_id)
  - negotiation_plans_generated (user_id)
  - negotiation_rounds (negotiation_id)
  - negotiation_zopa (negotiation_id)
  - negotiations (user_id)
*/

CREATE INDEX IF NOT EXISTS idx_lso_audit_logs_user_id
  ON lso_audit_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_lso_case_hours_attorney_id
  ON lso_case_hours (attorney_id);
CREATE INDEX IF NOT EXISTS idx_lso_case_hours_intake_id
  ON lso_case_hours (intake_id);

CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_attorney_id
  ON lso_client_intakes (assigned_attorney_id);
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_assigned_by
  ON lso_client_intakes (assigned_by);
CREATE INDEX IF NOT EXISTS idx_lso_client_intakes_organization_id
  ON lso_client_intakes (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_staff_organization_id
  ON lso_staff (organization_id);

CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_organization_id
  ON lso_volunteer_attorneys (organization_id);
CREATE INDEX IF NOT EXISTS idx_lso_volunteer_attorneys_user_id
  ON lso_volunteer_attorneys (user_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_match_id
  ON match_feedback (match_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_organization_id
  ON match_feedback (organization_id);
CREATE INDEX IF NOT EXISTS idx_match_feedback_submitted_by
  ON match_feedback (submitted_by);

CREATE INDEX IF NOT EXISTS idx_matching_notifications_attorney_id
  ON matching_notifications (attorney_id);
CREATE INDEX IF NOT EXISTS idx_matching_notifications_match_id
  ON matching_notifications (match_id);

CREATE INDEX IF NOT EXISTS idx_matter_activity_timeline_matter_id
  ON matter_activity_timeline (matter_id);

CREATE INDEX IF NOT EXISTS idx_matter_documents_added_by
  ON matter_documents (added_by);

CREATE INDEX IF NOT EXISTS idx_negotiation_batna_analysis_negotiation_id
  ON negotiation_batna_analysis (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_plans_generated_user_id
  ON negotiation_plans_generated (user_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_rounds_negotiation_id
  ON negotiation_rounds (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiation_zopa_negotiation_id
  ON negotiation_zopa (negotiation_id);

CREATE INDEX IF NOT EXISTS idx_negotiations_user_id
  ON negotiations (user_id);
