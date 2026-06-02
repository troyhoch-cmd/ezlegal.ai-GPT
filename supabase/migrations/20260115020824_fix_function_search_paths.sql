/*
  # Fix Function Search Paths

  1. Security Enhancement
     - Sets explicit search_path to prevent search path manipulation attacks
     - Protects against SQL injection via search_path

  2. Functions Updated
     - All 13 functions now have secure search_path configuration
*/

ALTER FUNCTION public.reset_daily_questions() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_chatbot_documents_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.cleanup_old_anonymous_data() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_pro_bono_application_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_usage_limit(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.increment_usage(uuid, text, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.set_trial_expiration() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_admin_analytics_summary(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_match_score(uuid, uuid, uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.run_case_matching(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.accept_case_match(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.decline_case_match(uuid, text) SET search_path = public, pg_temp;
