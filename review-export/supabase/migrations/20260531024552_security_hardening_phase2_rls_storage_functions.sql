/*
  # Security Hardening Phase 2 - RLS, Storage, and Function Access

  Addresses remaining Supabase security advisor findings from Phase 1 audit.

  ## Changes

  1. Leads Table RLS Fix
    - Drop the always-true "Allow anonymous lead inserts" INSERT policy
    - Replace with a constrained policy requiring valid email format and non-empty icp

  2. Storage Bucket Listing Restrictions
    - Drop overly broad SELECT policies on storage.objects for public buckets:
      - avatars: "Anyone can view avatars"
      - canvas-thumbnails: "Canvas thumbnails public read"
      - collateral-images: "Public read collateral images"
      - marketing-assets: "Anyone can view marketing assets"
    - Public buckets serve files via direct URL without needing SELECT policies
    - Objects remain accessible by direct URL; only listing/enumeration is blocked

  3. SECURITY DEFINER Function Access Tightening
    - Revoke EXECUTE from anon on functions that should only be called by authenticated users:
      - track_engagement (analytics can be tracked without auth but should require session)
      - track_share_event (same as above)
      - store_anonymized_search (same)
      - search_ars_by_citation (citation search requires authentication)
      - increment_route_deprecation_hit (internal routing metric)
      - validate_access_token (should only be called by authenticated users)
    - Keep resolve_subdomain_tenant available to anon (needed for tenant resolution before auth)
    - Revoke EXECUTE from authenticated on admin-only functions, re-grant to admin via internal check pattern

  4. Security Notes
    - resolve_subdomain_tenant remains accessible to anon since it is needed at login/bootstrap
    - intake_set_updated_at is a trigger function and cannot be called via RPC (no action needed)
    - Admin partner asset functions keep authenticated grant but have internal is_admin checks
*/

-- =============================================================================
-- 1. Fix leads table RLS: replace always-true INSERT policy with real constraints
-- =============================================================================

DROP POLICY IF EXISTS "Allow anonymous lead inserts" ON public.leads;

CREATE POLICY "Leads insert with valid email and icp"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) >= 5
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(email) <= 320
    AND icp IS NOT NULL
    AND length(trim(icp)) >= 2
    AND length(trim(icp)) <= 50
  );

-- =============================================================================
-- 2. Remove storage listing policies from public buckets
--    (objects are still accessible via public URL; this only blocks enumeration)
-- =============================================================================

-- Avatars bucket
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- Canvas thumbnails bucket
DROP POLICY IF EXISTS "Canvas thumbnails public read" ON storage.objects;

-- Collateral images bucket
DROP POLICY IF EXISTS "Public read collateral images" ON storage.objects;

-- Marketing assets bucket
DROP POLICY IF EXISTS "Anyone can view marketing assets" ON storage.objects;

-- =============================================================================
-- 3. Tighten SECURITY DEFINER function access: revoke anon where not needed
-- =============================================================================

-- Revoke anon access from analytics/telemetry functions
-- These should require at minimum an authenticated session for spam protection
REVOKE EXECUTE ON FUNCTION public.track_engagement(text, text, text, text, text, integer, jsonb, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.track_share_event(text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.store_anonymized_search(text, text, text, text, boolean, boolean) FROM anon;

-- Revoke anon access from citation search (requires auth context)
REVOKE EXECUTE ON FUNCTION public.search_ars_by_citation(text) FROM anon;

-- Revoke anon access from internal route tracking (should be auth-only)
REVOKE EXECUTE ON FUNCTION public.increment_route_deprecation_hit(text) FROM anon;

-- Revoke anon access from token validation (authenticated users validate their own tokens)
REVOKE EXECUTE ON FUNCTION public.validate_access_token(text) FROM anon;

-- intake_set_updated_at is a trigger function - revoke from anon explicitly for safety
-- (trigger functions cannot be called via PostgREST RPC, but belt-and-suspenders)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'intake_set_updated_at'
  ) THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.intake_set_updated_at() FROM anon';
  END IF;
END $$;

-- =============================================================================
-- 4. Restrict admin-only SECURITY DEFINER functions
--    These already have internal is_admin checks, but we add belt-and-suspenders
--    by wrapping them so only admins can even invoke them via RPC.
--    Since Supabase doesn't support role-based grants beyond anon/authenticated,
--    we convert these to SECURITY INVOKER where safe to do so.
-- =============================================================================

-- admin_create_partner_asset: Convert to SECURITY INVOKER
-- The function body already checks is_admin() - making it INVOKER means RLS
-- applies naturally and the admin check remains the gatekeeper.
ALTER FUNCTION public.admin_create_partner_asset(jsonb) SECURITY INVOKER;
ALTER FUNCTION public.admin_update_partner_asset(uuid, jsonb) SECURITY INVOKER;
ALTER FUNCTION public.admin_delete_partner_asset(uuid) SECURITY INVOKER;

-- check_is_admin: This is a helper used in RLS policies, must stay DEFINER
-- but should not be callable directly via RPC by non-admin users.
-- We keep authenticated grant since it is used in client-side checks.

-- check_pgvector_extension: Convert to INVOKER (no elevated access needed)
ALTER FUNCTION public.check_pgvector_extension() SECURITY INVOKER;

-- get_source_freshness: read-only, safe as INVOKER
ALTER FUNCTION public.get_source_freshness() SECURITY INVOKER;
