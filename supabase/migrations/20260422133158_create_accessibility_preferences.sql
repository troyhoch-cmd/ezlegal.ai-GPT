/*
  # Inclusive design preferences

  1. New tables
    - `accessibility_preferences` — per-user settings that override OS
      defaults when present. Fields: reduce_motion, high_contrast, text_size
      (normal/large/x-large), keyboard_first, screen_reader_hints,
      simplified_layout, link_underlines. Keyed by user_id; service writes
      to this table any time a user toggles a pref.
    - `component_audit_findings` — one row per inclusive-design issue found
      in the codebase (carousel_autoplay, infinite_scroll, non_native_select,
      missing_focus_trap, etc.) tracked so regressions can be caught in CI.

  2. Security
    - RLS enabled.
    - `accessibility_preferences`: user reads/writes their own row only.
      Admins can read for aggregate reporting (percent using high_contrast
      etc.) but not mutate another user's prefs.
    - `component_audit_findings`: admin-only reads, service-role writes.

  3. Notes
    - Defaults are enforced at the app layer; missing row == use OS defaults.
*/

CREATE TABLE IF NOT EXISTS accessibility_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reduce_motion boolean NOT NULL DEFAULT false,
  high_contrast boolean NOT NULL DEFAULT false,
  text_size text NOT NULL DEFAULT 'normal' CHECK (text_size IN ('normal','large','x-large')),
  keyboard_first boolean NOT NULL DEFAULT false,
  screen_reader_hints boolean NOT NULL DEFAULT false,
  simplified_layout boolean NOT NULL DEFAULT false,
  link_underlines boolean NOT NULL DEFAULT false,
  captions_default boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS component_audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  line_number integer NOT NULL DEFAULT 0,
  component_name text NOT NULL DEFAULT '',
  issue_type text NOT NULL CHECK (issue_type IN (
    'carousel_autoplay','infinite_scroll','non_native_select','missing_label',
    'missing_focus_trap','motion_without_pref_check','color_only_state',
    'small_touch_target','missing_skip_link','keyboard_trap','low_contrast'
  )),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','error')),
  suggestion text NOT NULL DEFAULT '',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cmp_audit_issue ON component_audit_findings(issue_type);
CREATE INDEX IF NOT EXISTS idx_cmp_audit_unresolved ON component_audit_findings(resolved) WHERE resolved = false;

ALTER TABLE accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_audit_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own accessibility prefs"
  ON accessibility_preferences FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users insert own accessibility prefs"
  ON accessibility_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users update own accessibility prefs"
  ON accessibility_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users delete own accessibility prefs"
  ON accessibility_preferences FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins read accessibility prefs for aggregate"
  ON accessibility_preferences FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins read component audit findings"
  ON component_audit_findings FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins update component audit findings"
  ON component_audit_findings FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

-- Seed a few findings so the admin dashboard is non-empty on first load.
INSERT INTO component_audit_findings (file_path, component_name, issue_type, severity, suggestion)
VALUES
  ('src/components/VideoSection.tsx',          'VideoSection',          'motion_without_pref_check', 'warning', 'Gate autoplay videos on prefers-reduced-motion.'),
  ('src/components/AnimatedCounter.tsx',       'AnimatedCounter',       'motion_without_pref_check', 'warning', 'Skip the count-up animation when user prefers reduced motion.'),
  ('src/pages/EspanolLanding.tsx',             'EspanolLanding',        'carousel_autoplay',         'warning', 'Replace auto-rotating hero with AccessibleGallery (manual controls, no autoplay).'),
  ('src/components/RealLawyerDirectory.tsx',   'RealLawyerDirectory',   'infinite_scroll',           'warning', 'Swap infinite scroll for PaginatedList with Load more button.'),
  ('src/components/shared/JurisdictionSelector.tsx','JurisdictionSelector','non_native_select',      'info',    'Prefer native <select> or AccessibleCombobox with full ARIA pattern.')
ON CONFLICT DO NOTHING;