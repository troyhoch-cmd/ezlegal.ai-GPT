/*
  # Security Hardening Phase 1

  Addresses Supabase security advisor findings.

  ## Changes
  1. Move pg_trgm extension from public to extensions schema
  2. Replace always-true WITH CHECK RLS policies on 6 public-insert tables
  3. Restrict chat-documents storage bucket SELECT to owner/admin
  4. Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated,
     re-granting only for functions the client actually invokes

  ## Notes
  - Intentionally-public storage buckets (avatars, marketing-assets, collateral-images,
    canvas-thumbnails) remain readable; they serve public avatars/graphics.
  - Trigger-only functions need no explicit grant.
*/

-- 1. Move pg_trgm
DROP INDEX IF EXISTS public.idx_icp_templates_title_trgm;
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname='icp_document_templates' AND relnamespace='public'::regnamespace) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_icp_templates_title_trgm ON public.icp_document_templates USING gin (title extensions.gin_trgm_ops)';
  END IF;
END $$;

-- 2. Replace always-true WITH CHECK
DROP POLICY IF EXISTS "Anyone can log field events" ON public.form_field_events;
CREATE POLICY "Anyone can log field events" ON public.form_field_events FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.form_sessions s WHERE s.id = session_id));

DROP POLICY IF EXISTS "Anyone can start a form session" ON public.form_sessions;
CREATE POLICY "Anyone can start a form session" ON public.form_sessions FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL AND auth.uid() IS NULL) OR (user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Anyone can insert deadline screening" ON public.issue_pack_deadline_screenings;
CREATE POLICY "Anyone can insert deadline screening" ON public.issue_pack_deadline_screenings FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL AND auth.uid() IS NULL) OR (user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Anyone can insert safety screening records" ON public.issue_pack_safety_screenings;
CREATE POLICY "Anyone can insert safety screening records" ON public.issue_pack_safety_screenings FOR INSERT TO anon, authenticated
  WITH CHECK ((user_id IS NULL AND auth.uid() IS NULL) OR (user_id = (SELECT auth.uid())));

DROP POLICY IF EXISTS "Anyone can submit lso inquiry" ON public.lso_pricing_inquiries;
CREATE POLICY "Anyone can submit lso inquiry" ON public.lso_pricing_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(organization_name)) BETWEEN 2 AND 200
    AND length(trim(contact_name)) BETWEEN 2 AND 200
    AND contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(contact_email) <= 320
    AND seats_estimated BETWEEN 0 AND 100000
  );

DROP POLICY IF EXISTS "Anonymous users can create intake sessions" ON public.persona_intake_sessions;
CREATE POLICY "Anonymous users can create intake sessions" ON public.persona_intake_sessions FOR INSERT TO anon
  WITH CHECK (user_id IS NULL AND auth.uid() IS NULL);

-- 3. Restrict chat-documents
DROP POLICY IF EXISTS "Anyone can view chat documents" ON storage.objects;
CREATE POLICY "Owners and admins view chat documents" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-documents'
    AND (
      (storage.foldername(name))[1] = (auth.uid())::text
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    )
  );
UPDATE storage.buckets SET public = false WHERE id = 'chat-documents';

-- 4. Revoke and re-grant SECURITY DEFINER functions
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon, authenticated', r.proname, r.args);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.resolve_subdomain_tenant(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_pgvector_extension() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_openai_model() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tier(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_stats(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_source_freshness() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_lso_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_usage_limit(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_role_access(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_legal_hold(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_matter_permission(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_matter_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_matter_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_engagement(text, text, text, text, text, integer, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.track_share_event(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_anonymized_search(text, text, text, text, boolean, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity(text, text, text, text, jsonb, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_access_attempt(text, uuid, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_access_token(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.export_matter_record(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_case_match(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_case_match(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_case_matching(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_conflict_check(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_ars_by_citation(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_arizona_statutes(vector, double precision, integer, text, text, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_documents(vector, double precision, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_legal_content(vector, double precision, integer, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.match_rag_chunks(vector, double precision, integer, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_route_deprecation_hit(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_openai_usage(uuid, text, text, integer, integer, text, text, text, integer, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_openai_rate_limit(uuid, text, text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_partner_asset(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_partner_asset(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_partner_asset(uuid) TO authenticated;
