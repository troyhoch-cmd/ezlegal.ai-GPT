/*
  # Add missing FK indexes batch 4

  Covers:
  - openai_rate_limits (user_id)
  - openai_usage_logs (user_id)
  - partner_co_branded_pages (partner_id)
  - partner_kit_generations (generated_by)
  - partner_pipeline_activities (partner_id, performed_by)
  - partner_referral_events (referral_link_id, user_id)
  - partner_referral_links (organization_id)
  - partner_referrals (partner_id, referred_user_id)
  - partners (user_id)
  - partnership_organizations (created_by)
  - partnership_pipeline (assigned_to, organization_id)
  - pipeline_activity_log (created_by, pipeline_id)
  - prediction_consent_log (user_id)
  - pro_bono_applications (assigned_to)
  - pro_bono_communications (application_id, from_user_id)
  - pro_bono_documents (application_id, uploaded_by)
  - prompt_subcategories (category_id)
  - quote_requests (connection_id)
  - referral_codes (referred_user_id, referrer_id)
  - report_templates (funder_id)
  - scraper_run_logs (source_id)
  - subscription_history (changed_by)
  - system_settings (updated_by)
  - trust_safety_reports (user_id)
  - user_data_requests (fulfilled_by)
  - user_plans (user_id)
  - user_roles (role_id)
  - widget_conversations (widget_id)
  - wizard_progress (user_id)
  - workspaces (user_id)
*/

CREATE INDEX IF NOT EXISTS idx_openai_rate_limits_user_id
  ON openai_rate_limits (user_id);

CREATE INDEX IF NOT EXISTS idx_openai_usage_logs_user_id
  ON openai_usage_logs (user_id);

CREATE INDEX IF NOT EXISTS idx_partner_co_branded_pages_partner_id
  ON partner_co_branded_pages (partner_id);

CREATE INDEX IF NOT EXISTS idx_partner_kit_generations_generated_by
  ON partner_kit_generations (generated_by);

CREATE INDEX IF NOT EXISTS idx_partner_pipeline_activities_partner_id
  ON partner_pipeline_activities (partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_pipeline_activities_performed_by
  ON partner_pipeline_activities (performed_by);

CREATE INDEX IF NOT EXISTS idx_partner_referral_events_referral_link_id
  ON partner_referral_events (referral_link_id);
CREATE INDEX IF NOT EXISTS idx_partner_referral_events_user_id
  ON partner_referral_events (user_id);

CREATE INDEX IF NOT EXISTS idx_partner_referral_links_organization_id
  ON partner_referral_links (organization_id);

CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_id
  ON partner_referrals (partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_referred_user_id
  ON partner_referrals (referred_user_id);

CREATE INDEX IF NOT EXISTS idx_partners_user_id
  ON partners (user_id);

CREATE INDEX IF NOT EXISTS idx_partnership_organizations_created_by
  ON partnership_organizations (created_by);

CREATE INDEX IF NOT EXISTS idx_partnership_pipeline_assigned_to
  ON partnership_pipeline (assigned_to);
CREATE INDEX IF NOT EXISTS idx_partnership_pipeline_organization_id
  ON partnership_pipeline (organization_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_activity_log_created_by
  ON pipeline_activity_log (created_by);
CREATE INDEX IF NOT EXISTS idx_pipeline_activity_log_pipeline_id
  ON pipeline_activity_log (pipeline_id);

CREATE INDEX IF NOT EXISTS idx_prediction_consent_log_user_id
  ON prediction_consent_log (user_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to
  ON pro_bono_applications (assigned_to);

CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id
  ON pro_bono_communications (application_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id
  ON pro_bono_communications (from_user_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id
  ON pro_bono_documents (application_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by
  ON pro_bono_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category_id
  ON prompt_subcategories (category_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_connection_id
  ON quote_requests (connection_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referred_user_id
  ON referral_codes (referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id
  ON referral_codes (referrer_id);

CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id
  ON report_templates (funder_id);

CREATE INDEX IF NOT EXISTS idx_scraper_run_logs_source_id
  ON scraper_run_logs (source_id);

CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by
  ON subscription_history (changed_by);

CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by
  ON system_settings (updated_by);

CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user_id
  ON trust_safety_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_user_data_requests_fulfilled_by
  ON user_data_requests (fulfilled_by);

CREATE INDEX IF NOT EXISTS idx_user_plans_user_id
  ON user_plans (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id
  ON user_roles (role_id);

CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id
  ON widget_conversations (widget_id);

CREATE INDEX IF NOT EXISTS idx_wizard_progress_user_id
  ON wizard_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_workspaces_user_id
  ON workspaces (user_id);
