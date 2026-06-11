/*
  # Cognitive overload reduction — phase 2

  This migration adds the persistence layer for the six prioritized recommendations
  (hero variant memory, route deprecations, single-slot UI dismissals, readability audit,
  and persona-aware default landing). It is additive only — no columns are dropped.

  1. New columns on `profiles`
     - `hero_variant_seen` (boolean, default false) — whether the user has seen the
       consolidated hero; used to avoid re-showing the single-CTA variant.
     - `default_landing_route` (text, nullable) — cached persona-aware landing route
       computed on first persona capture; used by authenticated home to skip the
       marketing surface on repeat visits.

  2. New tables
     - `route_deprecations` — tracks legacy routes redirected to new ones, with a
       `hits` counter so we can prove a deprecated route is dead before code removal.
     - `ui_dismissals` — single-slot floating-chrome dismissal ledger. One row per
       (user, surface). Guarantees the PWA prompt and reading toolbar do not re-stack.
     - `readability_audit` — per-route Flesch reading-ease score so CI can fail
       regressions below 60 on dashboard routes.

  3. Security
     - RLS enabled on all new tables.
     - `route_deprecations` and `readability_audit` are readable by authenticated users
       (shared reference data); writes restricted to admins.
     - `ui_dismissals` is strictly per-user.

  4. Notes
     - New columns have defaults so no backfill is required.
     - `route_deprecations` supports an anonymous-friendly `increment_route_deprecation_hit`
       function so a link-health ping can bump the counter via RPC.
*/

-- 1. Profile columns -----------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'hero_variant_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN hero_variant_seen boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'default_landing_route'
  ) THEN
    ALTER TABLE profiles ADD COLUMN default_landing_route text;
  END IF;
END $$;

-- 2. route_deprecations --------------------------------------------------------

CREATE TABLE IF NOT EXISTS route_deprecations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_path text UNIQUE NOT NULL,
  new_path text NOT NULL,
  reason text DEFAULT '',
  deprecated_at timestamptz NOT NULL DEFAULT now(),
  hits bigint NOT NULL DEFAULT 0,
  last_hit_at timestamptz
);

ALTER TABLE route_deprecations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read route deprecations" ON route_deprecations;
CREATE POLICY "Authenticated users can read route deprecations"
  ON route_deprecations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert route deprecations" ON route_deprecations;
CREATE POLICY "Admins can insert route deprecations"
  ON route_deprecations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update route deprecations" ON route_deprecations;
CREATE POLICY "Admins can update route deprecations"
  ON route_deprecations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can delete route deprecations" ON route_deprecations;
CREATE POLICY "Admins can delete route deprecations"
  ON route_deprecations FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  );

CREATE OR REPLACE FUNCTION increment_route_deprecation_hit(p_old_path text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE route_deprecations
  SET hits = hits + 1, last_hit_at = now()
  WHERE old_path = p_old_path;
END;
$$;

GRANT EXECUTE ON FUNCTION increment_route_deprecation_hit(text) TO anon, authenticated;

INSERT INTO route_deprecations (old_path, new_path, reason) VALUES
  ('/chatbot', '/chat', 'Legacy chat consolidated into ChatV2'),
  ('/chatbot-standalone', '/chat', 'Legacy standalone chat consolidated into ChatV2'),
  ('/chat-v2', '/chat', 'Alias retired'),
  ('/ez-reads', '/ezreads', 'Canonical slug'),
  ('/terms-of-service', '/terms', 'Canonical slug'),
  ('/privacy-policy', '/privacy', 'Canonical slug'),
  ('/trust-safety', '/trust-center', 'Canonical slug'),
  ('/billing', '/dashboard/billing', 'Billing lives under dashboard')
ON CONFLICT (old_path) DO NOTHING;

-- 3. ui_dismissals --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ui_dismissals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id text NOT NULL,
  dismissed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, surface_id)
);

CREATE INDEX IF NOT EXISTS idx_ui_dismissals_user_id ON ui_dismissals(user_id);

ALTER TABLE ui_dismissals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own ui_dismissals" ON ui_dismissals;
CREATE POLICY "Users can read own ui_dismissals"
  ON ui_dismissals FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own ui_dismissals" ON ui_dismissals;
CREATE POLICY "Users can insert own ui_dismissals"
  ON ui_dismissals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own ui_dismissals" ON ui_dismissals;
CREATE POLICY "Users can update own ui_dismissals"
  ON ui_dismissals FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own ui_dismissals" ON ui_dismissals;
CREATE POLICY "Users can delete own ui_dismissals"
  ON ui_dismissals FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- 4. readability_audit ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS readability_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route text UNIQUE NOT NULL,
  flesch_score numeric(5,2) NOT NULL DEFAULT 0,
  passes boolean NOT NULL DEFAULT false,
  checked_at timestamptz NOT NULL DEFAULT now(),
  notes text DEFAULT ''
);

ALTER TABLE readability_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read readability_audit" ON readability_audit;
CREATE POLICY "Authenticated users can read readability_audit"
  ON readability_audit FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can insert readability_audit" ON readability_audit;
CREATE POLICY "Admins can insert readability_audit"
  ON readability_audit FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can update readability_audit" ON readability_audit;
CREATE POLICY "Admins can update readability_audit"
  ON readability_audit FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  );

DROP POLICY IF EXISTS "Admins can delete readability_audit" ON readability_audit;
CREATE POLICY "Admins can delete readability_audit"
  ON readability_audit FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = (select auth.uid()) AND p.is_admin = true)
  );
