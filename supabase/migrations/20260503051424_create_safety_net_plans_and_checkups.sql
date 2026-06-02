/*
  # Safety Net plan entitlements, checkup flow, and vault storage

  ## Purpose
  1. Persist plan entitlements so UI can gate vault size, reminder channels,
     and matter count by subscription tier (free / plus / protection).
  2. Capture monthly legal checkup responses so we can surface deltas over
     time (new notices, changed addresses, missed deadlines, etc).
  3. Create a private `legal-vault` Storage bucket with RLS-style policies.

  ## New Tables
  1. safety_plan_entitlements - one row per user with computed limits
  2. safety_checkups - monthly checkup responses (jsonb answers)

  ## Storage
  Private bucket `legal-vault`. Users can only read/write their own folder,
  keyed by user_id prefix in the object path.

  ## Security
  RLS enforced on all new tables. Storage policies restrict to own folder.
*/

CREATE TABLE IF NOT EXISTS safety_plan_entitlements (
  user_id uuid PRIMARY KEY,
  plan text NOT NULL DEFAULT 'free',
  vault_mb_limit integer NOT NULL DEFAULT 10,
  matter_limit integer NOT NULL DEFAULT 1,
  reminder_channels text[] NOT NULL DEFAULT ARRAY['in_app']::text[],
  monthly_checkup_enabled boolean NOT NULL DEFAULT false,
  attorney_handoff_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT safety_plan_check CHECK (plan IN ('free','plus','protection','business','business_plus'))
);

ALTER TABLE safety_plan_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own entitlements" ON safety_plan_entitlements FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own entitlements" ON safety_plan_entitlements FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own entitlements" ON safety_plan_entitlements FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS safety_checkups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period_key text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  action_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT safety_checkups_user_period_unique UNIQUE (user_id, period_key)
);

CREATE INDEX IF NOT EXISTS safety_checkups_user_idx ON safety_checkups(user_id, completed_at DESC);

ALTER TABLE safety_checkups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own checkups" ON safety_checkups FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own checkups" ON safety_checkups FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own checkups" ON safety_checkups FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own checkups" ON safety_checkups FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('legal-vault', 'legal-vault', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users read own vault files' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users read own vault files"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'legal-vault' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users upload to own vault folder' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users upload to own vault folder"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'legal-vault' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own vault files' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users update own vault files"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'legal-vault' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text)
      WITH CHECK (bucket_id = 'legal-vault' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users delete own vault files' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Users delete own vault files"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'legal-vault' AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);
  END IF;
END $$;
