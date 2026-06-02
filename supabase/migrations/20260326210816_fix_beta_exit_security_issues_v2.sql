/*
  # Fix Beta Exit System Security Issues

  This migration addresses multiple security and performance issues:

  ## 1. Missing Foreign Key Indexes
  - ab_test_sessions.user_id
  - beta_exit_evaluations.evaluated_by
  - beta_qa_results.tested_by
  - llm_config.updated_by_user_id

  ## 2. RLS Policy Optimization
  Using (select auth.uid()) for better query performance

  ## 3. Duplicate and Redundant Policies
  Consolidating policies on cognitive_overload_metrics and ab_test_sessions

  ## 4. Security Definer Views
  Converting to SECURITY INVOKER

  ## 5. Unused Index Cleanup
*/

-- ============================================================
-- SECTION 1: Add Missing Foreign Key Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ab_test_sessions_user_id 
  ON ab_test_sessions(user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_exit_evaluations') THEN
    CREATE INDEX IF NOT EXISTS idx_beta_exit_evaluations_evaluated_by 
      ON beta_exit_evaluations(evaluated_by);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_qa_results') THEN
    CREATE INDEX IF NOT EXISTS idx_beta_qa_results_tested_by 
      ON beta_qa_results(tested_by);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'llm_config') THEN
    CREATE INDEX IF NOT EXISTS idx_llm_config_updated_by_user_id 
      ON llm_config(updated_by_user_id);
  END IF;
END $$;

-- ============================================================
-- SECTION 2: Fix RLS Policies - cognitive_overload_metrics
-- ============================================================

DROP POLICY IF EXISTS "Admins can read all cognitive metrics" ON cognitive_overload_metrics;
DROP POLICY IF EXISTS "Users can read own cognitive metrics" ON cognitive_overload_metrics;
DROP POLICY IF EXISTS "Users can view own cognitive metrics" ON cognitive_overload_metrics;
DROP POLICY IF EXISTS "Anyone can insert cognitive metrics" ON cognitive_overload_metrics;
DROP POLICY IF EXISTS "Users can insert cognitive metrics" ON cognitive_overload_metrics;

CREATE POLICY "Users can view own cognitive metrics"
  ON cognitive_overload_metrics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can read all cognitive metrics"
  ON cognitive_overload_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert own cognitive metrics"
  ON cognitive_overload_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert cognitive metrics"
  ON cognitive_overload_metrics FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- SECTION 3: Fix RLS Policies - ab_test_metrics
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all metrics" ON ab_test_metrics;
DROP POLICY IF EXISTS "Anyone can insert metrics" ON ab_test_metrics;

CREATE POLICY "Admins can view all metrics"
  ON ab_test_metrics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert metrics"
  ON ab_test_metrics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ab_test_sessions s
      WHERE s.session_id = ab_test_metrics.session_id
      AND (s.user_id = (select auth.uid()) OR s.user_id IS NULL)
    )
  );

CREATE POLICY "Anonymous users can insert metrics"
  ON ab_test_metrics FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ab_test_sessions s
      WHERE s.session_id = ab_test_metrics.session_id
      AND s.user_id IS NULL
    )
  );

-- ============================================================
-- SECTION 4: Fix RLS Policies - ab_test_sessions
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all sessions" ON ab_test_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON ab_test_sessions;
DROP POLICY IF EXISTS "Anyone can insert sessions" ON ab_test_sessions;

CREATE POLICY "Users can view own sessions"
  ON ab_test_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) OR user_id IS NULL);

CREATE POLICY "Admins can view all sessions"
  ON ab_test_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can insert sessions"
  ON ab_test_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()) OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert sessions"
  ON ab_test_sessions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- ============================================================
-- SECTION 5: Fix RLS Policies - beta_exit_evaluations
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_exit_evaluations') THEN
    DROP POLICY IF EXISTS "Admins can manage evaluations" ON beta_exit_evaluations;
    
    CREATE POLICY "Admins can manage evaluations"
      ON beta_exit_evaluations FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================
-- SECTION 6: Fix RLS Policies - beta_qa_results
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'beta_qa_results') THEN
    DROP POLICY IF EXISTS "Admins can manage QA results" ON beta_qa_results;
    
    CREATE POLICY "Admins can manage QA results"
      ON beta_qa_results FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = (select auth.uid())
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================
-- SECTION 7: Fix Security Definer Views
-- ============================================================

DROP VIEW IF EXISTS ab_test_sessions_summary;
DROP VIEW IF EXISTS ab_test_metrics_summary;

CREATE VIEW ab_test_sessions_summary
WITH (security_invoker = true)
AS
SELECT 
  test_id,
  variant_id,
  device_type,
  count(*) AS session_count,
  count(DISTINCT date(started_at)) AS active_days,
  min(started_at) AS first_session,
  max(started_at) AS last_session
FROM ab_test_sessions
GROUP BY test_id, variant_id, device_type;

CREATE VIEW ab_test_metrics_summary
WITH (security_invoker = true)
AS
SELECT 
  test_id,
  variant_id,
  metric_name,
  count(*) AS event_count,
  avg(metric_value) AS avg_value,
  percentile_cont(0.5) WITHIN GROUP (ORDER BY metric_value::double precision) AS p50_value,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY metric_value::double precision) AS p95_value,
  min(metric_value) AS min_value,
  max(metric_value) AS max_value,
  min(created_at) AS first_event,
  max(created_at) AS last_event
FROM ab_test_metrics
GROUP BY test_id, variant_id, metric_name;

-- ============================================================
-- SECTION 8: Drop Duplicate Index
-- ============================================================

DROP INDEX IF EXISTS idx_cognitive_metrics_session;

-- ============================================================
-- SECTION 9: Drop Unused Indexes - Beta Exit Tables
-- ============================================================

DROP INDEX IF EXISTS idx_cognitive_metrics_user;
DROP INDEX IF EXISTS idx_cognitive_metrics_event_type;
DROP INDEX IF EXISTS idx_cognitive_metrics_timestamp;
DROP INDEX IF EXISTS idx_cognitive_metrics_page_path;
DROP INDEX IF EXISTS idx_cognitive_metrics_session_id;
DROP INDEX IF EXISTS idx_cognitive_metrics_created_at;
DROP INDEX IF EXISTS idx_cognitive_metrics_user_id;
DROP INDEX IF EXISTS idx_ab_test_metrics_created_at;
DROP INDEX IF EXISTS idx_beta_exit_evaluations_test_id;
DROP INDEX IF EXISTS idx_beta_qa_results_test_id;
DROP INDEX IF EXISTS idx_ab_test_sessions_test_id;
DROP INDEX IF EXISTS idx_ab_test_sessions_variant_id;
DROP INDEX IF EXISTS idx_ab_test_sessions_started_at;
DROP INDEX IF EXISTS idx_ab_test_sessions_device_type;
DROP INDEX IF EXISTS idx_ab_test_metrics_session_id;
DROP INDEX IF EXISTS idx_ab_test_metrics_test_id;
DROP INDEX IF EXISTS idx_ab_test_metrics_metric_name;
DROP INDEX IF EXISTS idx_beta_qa_results_qa_type;

-- ============================================================
-- SECTION 10: Drop Unused Indexes - Access/Auth tables
-- ============================================================

DROP INDEX IF EXISTS idx_access_requests_invited_by;
DROP INDEX IF EXISTS idx_access_requests_reviewed_by;
DROP INDEX IF EXISTS idx_access_token_usage_token_id;
DROP INDEX IF EXISTS idx_access_token_usage_user_id;
DROP INDEX IF EXISTS idx_access_tokens_created_by;

-- ============================================================
-- SECTION 11: Drop Unused Indexes - AI/Analytics tables
-- ============================================================

DROP INDEX IF EXISTS idx_ai_response_citations_provenance_id;
DROP INDEX IF EXISTS idx_ai_response_provenance_matter_id;
DROP INDEX IF EXISTS idx_analytics_events_user_id;
DROP INDEX IF EXISTS idx_appointment_requests_connection_id;
DROP INDEX IF EXISTS idx_approval_decisions_request_id;
DROP INDEX IF EXISTS idx_approval_requests_requested_by;
DROP INDEX IF EXISTS idx_approval_requests_workflow_id;

-- ============================================================
-- SECTION 12: Drop Unused Indexes - Asset tables
-- ============================================================

DROP INDEX IF EXISTS idx_asset_downloads_asset_id;
DROP INDEX IF EXISTS idx_asset_downloads_user_id;
DROP INDEX IF EXISTS idx_asset_readiness_brand_approver_id;
DROP INDEX IF EXISTS idx_asset_readiness_legal_reviewer_id;
DROP INDEX IF EXISTS idx_asset_readiness_spanish_reviewer_id;
DROP INDEX IF EXISTS idx_asset_readiness_audit_log_asset_id;
DROP INDEX IF EXISTS idx_asset_readiness_audit_log_changed_by;

-- ============================================================
-- SECTION 13: Drop Unused Indexes - Attorney/Case tables
-- ============================================================

DROP INDEX IF EXISTS idx_attorney_matching_profiles_organization_id;
DROP INDEX IF EXISTS idx_case_matches_attorney_id;
DROP INDEX IF EXISTS idx_case_matches_attorney_profile_id;
DROP INDEX IF EXISTS idx_case_matches_case_id;
DROP INDEX IF EXISTS idx_case_matches_organization_id;
DROP INDEX IF EXISTS idx_case_matching_queue_created_by;
DROP INDEX IF EXISTS idx_case_matching_queue_organization_id;
DROP INDEX IF EXISTS idx_cases_client_id;

-- ============================================================
-- SECTION 14: Drop Unused Indexes - Chat tables
-- ============================================================

DROP INDEX IF EXISTS idx_chat_contexts_matter_id;
DROP INDEX IF EXISTS idx_chat_messages_anonymous_session_id;
DROP INDEX IF EXISTS idx_chatbot_documents_created_by;
DROP INDEX IF EXISTS idx_chatbot_prompts_category_id;
DROP INDEX IF EXISTS idx_chatbot_prompts_subcategory_id;

-- ============================================================
-- SECTION 15: Drop Unused Indexes - Citation/Conflict tables
-- ============================================================

DROP INDEX IF EXISTS idx_citations_superseded_by_id;
DROP INDEX IF EXISTS idx_citations_user_id;
DROP INDEX IF EXISTS idx_conflict_checks_performed_by;
DROP INDEX IF EXISTS idx_conflict_waivers_conflict_check_id;
DROP INDEX IF EXISTS idx_conflict_waivers_conflicting_matter_id;
DROP INDEX IF EXISTS idx_conflict_waivers_matter_id;

-- ============================================================
-- SECTION 16: Drop Unused Indexes - Conversion/Crisis/Data tables
-- ============================================================

DROP INDEX IF EXISTS idx_conversion_events_session_id;
DROP INDEX IF EXISTS idx_crisis_incidents_user_id;
DROP INDEX IF EXISTS idx_data_deletion_requests_processed_by;
DROP INDEX IF EXISTS idx_data_deletion_requests_user_id;
DROP INDEX IF EXISTS idx_data_export_requests_user_id;
DROP INDEX IF EXISTS idx_data_retention_policies_created_by;
DROP INDEX IF EXISTS idx_data_retention_policies_organization_id;

-- ============================================================
-- SECTION 17: Drop Unused Indexes - Document/Engagement tables
-- ============================================================

DROP INDEX IF EXISTS idx_documents_case_id;
DROP INDEX IF EXISTS idx_documents_matter_id;
DROP INDEX IF EXISTS idx_engagement_analytics_user_id;
DROP INDEX IF EXISTS idx_engagement_events_user_id;
DROP INDEX IF EXISTS idx_experiment_assignments_user_id;
DROP INDEX IF EXISTS idx_export_jobs_user_id;
DROP INDEX IF EXISTS idx_funding_requests_user_id;
DROP INDEX IF EXISTS idx_audit_events_user_id;

-- ============================================================
-- SECTION 18: Drop Unused Indexes - Legal/User Data tables
-- ============================================================

DROP INDEX IF EXISTS idx_legal_documents_document_type_id;
DROP INDEX IF EXISTS idx_user_data_requests_user_id;
DROP INDEX IF EXISTS idx_partner_asset_versions_partner_asset_id;
DROP INDEX IF EXISTS idx_partner_assets_updated_by;
DROP INDEX IF EXISTS idx_funnel_events_user_id;
DROP INDEX IF EXISTS idx_generated_documents_user_id;

-- ============================================================
-- SECTION 19: Drop Unused Indexes - Grant tables
-- ============================================================

DROP INDEX IF EXISTS idx_grant_expenses_approved_by;
DROP INDEX IF EXISTS idx_grant_expenses_grant_id;
DROP INDEX IF EXISTS idx_grant_metrics_grant_id;
DROP INDEX IF EXISTS idx_grant_milestones_grant_id;
DROP INDEX IF EXISTS idx_grant_reports_generated_by;
DROP INDEX IF EXISTS idx_grant_reports_grant_id;
DROP INDEX IF EXISTS idx_grant_reports_reviewed_by;
DROP INDEX IF EXISTS idx_grants_funder_id;
DROP INDEX IF EXISTS idx_guardrail_alerts_resolved_by;

-- ============================================================
-- SECTION 20: Drop Unused Indexes - Intake/Knowledge tables
-- ============================================================

DROP INDEX IF EXISTS idx_intakes_user_id;
DROP INDEX IF EXISTS idx_knowledge_documents_uploaded_by;
DROP INDEX IF EXISTS idx_lawyer_consultations_lawyer_match_id;
DROP INDEX IF EXISTS idx_lawyer_matches_chat_message_id;
DROP INDEX IF EXISTS idx_lawyer_messages_connection_id;
DROP INDEX IF EXISTS idx_legal_content_source_id;
DROP INDEX IF EXISTS idx_legal_documents_user_id;

-- ============================================================
-- SECTION 21: Drop Unused Indexes - Legal Hold/LSO tables
-- ============================================================

DROP INDEX IF EXISTS idx_legal_holds_created_by;
DROP INDEX IF EXISTS idx_legal_holds_matter_id;
DROP INDEX IF EXISTS idx_legal_holds_user_id;
DROP INDEX IF EXISTS idx_lso_audit_logs_user_id;
DROP INDEX IF EXISTS idx_lso_case_hours_attorney_id;
DROP INDEX IF EXISTS idx_lso_case_hours_intake_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_attorney_id;
DROP INDEX IF EXISTS idx_lso_client_intakes_assigned_by;
DROP INDEX IF EXISTS idx_lso_client_intakes_organization_id;
DROP INDEX IF EXISTS idx_lso_staff_organization_id;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_organization_id;
DROP INDEX IF EXISTS idx_lso_volunteer_attorneys_user_id;

-- ============================================================
-- SECTION 22: Drop Unused Indexes - Marketing/Match tables
-- ============================================================

DROP INDEX IF EXISTS idx_marketing_block_versions_block_id;
DROP INDEX IF EXISTS idx_marketing_block_versions_changed_by;
DROP INDEX IF EXISTS idx_marketing_blocks_updated_by;
DROP INDEX IF EXISTS idx_match_feedback_match_id;
DROP INDEX IF EXISTS idx_match_feedback_organization_id;
DROP INDEX IF EXISTS idx_match_feedback_submitted_by;
DROP INDEX IF EXISTS idx_matching_notifications_attorney_id;
DROP INDEX IF EXISTS idx_matching_notifications_match_id;

-- ============================================================
-- SECTION 23: Drop Unused Indexes - Matter tables
-- ============================================================

DROP INDEX IF EXISTS idx_matter_activity_timeline_matter_id;
DROP INDEX IF EXISTS idx_matter_deadlines_matter_id;
DROP INDEX IF EXISTS idx_matter_documents_added_by;
DROP INDEX IF EXISTS idx_matter_recommendations_matter_id;
DROP INDEX IF EXISTS idx_matter_steps_matter_id;
DROP INDEX IF EXISTS idx_matter_steps_step_definition_id;

-- ============================================================
-- SECTION 24: Drop Unused Indexes - Negotiation tables
-- ============================================================

DROP INDEX IF EXISTS idx_negotiation_batna_analysis_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_plans_generated_user_id;
DROP INDEX IF EXISTS idx_negotiation_rounds_negotiation_id;
DROP INDEX IF EXISTS idx_negotiation_zopa_negotiation_id;
DROP INDEX IF EXISTS idx_negotiations_user_id;

-- ============================================================
-- SECTION 25: Drop Unused Indexes - OpenAI/Partner tables
-- ============================================================

DROP INDEX IF EXISTS idx_openai_rate_limits_user_id;
DROP INDEX IF EXISTS idx_openai_usage_logs_user_id;
DROP INDEX IF EXISTS idx_partner_asset_versions_edited_by;
DROP INDEX IF EXISTS idx_partner_co_branded_pages_partner_id;
DROP INDEX IF EXISTS idx_partner_kit_generations_generated_by;
DROP INDEX IF EXISTS idx_partner_pipeline_activities_partner_id;
DROP INDEX IF EXISTS idx_partner_pipeline_activities_performed_by;
DROP INDEX IF EXISTS idx_partner_referral_events_referral_link_id;
DROP INDEX IF EXISTS idx_partner_referral_events_user_id;
DROP INDEX IF EXISTS idx_partner_referral_links_organization_id;
DROP INDEX IF EXISTS idx_partner_referrals_partner_id;
DROP INDEX IF EXISTS idx_partner_referrals_referred_user_id;
DROP INDEX IF EXISTS idx_partners_user_id;

-- ============================================================
-- SECTION 26: Drop Unused Indexes - Partnership/Pipeline tables
-- ============================================================

DROP INDEX IF EXISTS idx_partnership_organizations_created_by;
DROP INDEX IF EXISTS idx_partnership_pipeline_assigned_to;
DROP INDEX IF EXISTS idx_partnership_pipeline_organization_id;
DROP INDEX IF EXISTS idx_pipeline_activity_log_created_by;
DROP INDEX IF EXISTS idx_pipeline_activity_log_pipeline_id;
DROP INDEX IF EXISTS idx_prediction_consent_log_user_id;

-- ============================================================
-- SECTION 27: Drop Unused Indexes - Pro Bono tables
-- ============================================================

DROP INDEX IF EXISTS idx_pro_bono_applications_assigned_to;
DROP INDEX IF EXISTS idx_pro_bono_communications_application_id;
DROP INDEX IF EXISTS idx_pro_bono_communications_from_user_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_application_id;
DROP INDEX IF EXISTS idx_pro_bono_documents_uploaded_by;
DROP INDEX IF EXISTS idx_prompt_subcategories_category_id;

-- ============================================================
-- SECTION 28: Drop Unused Indexes - Quote/RAG/Referral tables
-- ============================================================

DROP INDEX IF EXISTS idx_quote_requests_connection_id;
DROP INDEX IF EXISTS idx_rag_answer_cards_user_id;
DROP INDEX IF EXISTS idx_rag_documents_source_id;
DROP INDEX IF EXISTS idx_referral_codes_referred_user_id;
DROP INDEX IF EXISTS idx_referral_codes_referrer_id;
DROP INDEX IF EXISTS idx_report_templates_funder_id;

-- ============================================================
-- SECTION 29: Drop Unused Indexes - Remaining tables
-- ============================================================

DROP INDEX IF EXISTS idx_scraper_run_logs_source_id;
DROP INDEX IF EXISTS idx_subscription_history_changed_by;
DROP INDEX IF EXISTS idx_system_settings_updated_by;
DROP INDEX IF EXISTS idx_trust_safety_reports_user_id;
DROP INDEX IF EXISTS idx_user_data_requests_fulfilled_by;
DROP INDEX IF EXISTS idx_user_plans_user_id;
DROP INDEX IF EXISTS idx_user_roles_role_id;
DROP INDEX IF EXISTS idx_widget_conversations_widget_id;
DROP INDEX IF EXISTS idx_wizard_progress_user_id;
DROP INDEX IF EXISTS idx_workspaces_user_id;
