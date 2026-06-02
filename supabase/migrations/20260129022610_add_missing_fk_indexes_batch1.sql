/*
  # Add Missing Foreign Key Indexes - Batch 1

  ## Purpose
  Add indexes on foreign key columns to improve query performance.
  Foreign keys without indexes cause slow JOIN operations and cascading deletes.

  ## Tables Affected (17 tables)
  1. ai_response_citations - provenance_id
  2. ai_response_provenance - matter_id
  3. approval_requests - workflow_id
  4. attorney_matching_profiles - organization_id
  5. case_matches - attorney_id, case_id, organization_id
  6. case_matching_queue - organization_id
  7. chat_contexts - matter_id
  8. chat_messages_anonymous - session_id
  9. chatbot_prompts - category_id, subcategory_id
  10. conflict_waivers - conflicting_matter_id
  11. conversion_events - session_id
  12. documents - matter_id
  13. engagement_events - user_id
  14. grant_expenses - grant_id
  15. grant_metrics - grant_id
  16. grant_milestones - grant_id
  17. grant_reports - grant_id

  ## Security
  No security changes - index creation only
*/

-- ai_response_citations.provenance_id
CREATE INDEX IF NOT EXISTS idx_ai_response_citations_provenance_id
  ON public.ai_response_citations(provenance_id);

-- ai_response_provenance.matter_id
CREATE INDEX IF NOT EXISTS idx_ai_response_provenance_matter_id
  ON public.ai_response_provenance(matter_id);

-- approval_requests.workflow_id
CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id
  ON public.approval_requests(workflow_id);

-- attorney_matching_profiles.organization_id
CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_organization_id
  ON public.attorney_matching_profiles(organization_id);

-- case_matches foreign keys
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney_id
  ON public.case_matches(attorney_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_case_id
  ON public.case_matches(case_id);

CREATE INDEX IF NOT EXISTS idx_case_matches_organization_id
  ON public.case_matches(organization_id);

-- case_matching_queue.organization_id
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_organization_id
  ON public.case_matching_queue(organization_id);

-- chat_contexts.matter_id
CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id
  ON public.chat_contexts(matter_id);

-- chat_messages_anonymous.session_id
CREATE INDEX IF NOT EXISTS idx_chat_messages_anonymous_session_id
  ON public.chat_messages_anonymous(session_id);

-- chatbot_prompts foreign keys
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category_id
  ON public.chatbot_prompts(category_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory_id
  ON public.chatbot_prompts(subcategory_id);

-- conflict_waivers.conflicting_matter_id
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_conflicting_matter_id
  ON public.conflict_waivers(conflicting_matter_id);

-- conversion_events.session_id
CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id
  ON public.conversion_events(session_id);

-- documents.matter_id
CREATE INDEX IF NOT EXISTS idx_documents_matter_id
  ON public.documents(matter_id);

-- engagement_events.user_id
CREATE INDEX IF NOT EXISTS idx_engagement_events_user_id
  ON public.engagement_events(user_id);

-- grant_expenses.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_expenses_grant_id
  ON public.grant_expenses(grant_id);

-- grant_metrics.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_metrics_grant_id
  ON public.grant_metrics(grant_id);

-- grant_milestones.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_milestones_grant_id
  ON public.grant_milestones(grant_id);

-- grant_reports.grant_id
CREATE INDEX IF NOT EXISTS idx_grant_reports_grant_id
  ON public.grant_reports(grant_id);
