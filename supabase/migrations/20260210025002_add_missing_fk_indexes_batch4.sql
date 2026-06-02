/*
  # Add Missing Foreign Key Indexes - Batch 4

  Adds covering indexes for unindexed foreign keys on P-Z tables.

  1. Tables indexed
    - pro_bono_applications (assigned_to)
    - pro_bono_communications (application_id, from_user_id)
    - pro_bono_documents (application_id, uploaded_by)
    - prompt_subcategories (category_id)
    - quote_requests (connection_id)
    - referral_codes (referred_user_id, referrer_id)
    - report_templates (funder_id)
    - subscription_history (changed_by)
    - system_settings (updated_by)
    - trust_safety_reports (user_id)
    - user_preferences (user_id)
    - user_roles (role_id)
    - widget_conversations (widget_id)

  2. Important notes
    - All indexes use IF NOT EXISTS for idempotency
*/

CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_assigned_to
  ON public.pro_bono_applications (assigned_to);

CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id
  ON public.pro_bono_communications (application_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_from_user_id
  ON public.pro_bono_communications (from_user_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id
  ON public.pro_bono_documents (application_id);

CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_uploaded_by
  ON public.pro_bono_documents (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_prompt_subcategories_category_id
  ON public.prompt_subcategories (category_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_connection_id
  ON public.quote_requests (connection_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referred_user_id
  ON public.referral_codes (referred_user_id);

CREATE INDEX IF NOT EXISTS idx_referral_codes_referrer_id
  ON public.referral_codes (referrer_id);

CREATE INDEX IF NOT EXISTS idx_report_templates_funder_id
  ON public.report_templates (funder_id);

CREATE INDEX IF NOT EXISTS idx_subscription_history_changed_by
  ON public.subscription_history (changed_by);

CREATE INDEX IF NOT EXISTS idx_system_settings_updated_by
  ON public.system_settings (updated_by);

CREATE INDEX IF NOT EXISTS idx_trust_safety_reports_user_id
  ON public.trust_safety_reports (user_id);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id
  ON public.user_preferences (user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_role_id
  ON public.user_roles (role_id);

CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id
  ON public.widget_conversations (widget_id);
