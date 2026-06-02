/*
  # Cognitive-overload reduction tables

  Adds the persistence surfaces needed to collapse stacked disclosures,
  throttle interruptions, provide a plain-language glossary, and persist
  layout preferences per user.

  1. New Tables
    - `user_consents` — one row per (user, scope). Records that the user
      has acknowledged a unified consent summary (e.g. chat_safety,
      negotiation_safety, document_upload, attorney_matching). Scope is a
      free-form text column so new flows can adopt it without a schema
      change.
    - `engagement_throttle` — rolling record of when a user was last shown
      any interruption surface in a given window. Enforces the "at most
      one concurrent interruption" rule across onboarding checklists,
      email capture, exit-intent, trial nudges, etc.
    - `glossary_terms` — plain-language definitions for legal and product
      jargon used across the consumer surface. Publicly readable so
      anonymous visitors can see tooltips too.
  2. Modified Tables
    - `profiles.layout_preferences` (jsonb, default '{}') — persists hide
      sidebar, collapsed trust strips, suppressed onboarding, etc.
  3. Security
    - RLS enabled on all new tables.
    - `user_consents` + `engagement_throttle`: the owning user may select,
      insert, and update their own rows; no delete policy (consent history
      is append-only, throttle rows are idempotent).
    - `glossary_terms`: public read (anon + authenticated); no client
      write policies (managed via admin tools only).
*/

CREATE TABLE IF NOT EXISTS public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scope text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, scope)
);

CREATE INDEX IF NOT EXISTS user_consents_user_id_idx
  ON public.user_consents (user_id);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_consents'
      AND policyname = 'Users can read own consents'
  ) THEN
    CREATE POLICY "Users can read own consents"
      ON public.user_consents FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_consents'
      AND policyname = 'Users can insert own consents'
  ) THEN
    CREATE POLICY "Users can insert own consents"
      ON public.user_consents FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_consents'
      AND policyname = 'Users can update own consents'
  ) THEN
    CREATE POLICY "Users can update own consents"
      ON public.user_consents FOR UPDATE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS public.engagement_throttle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interruption_key text NOT NULL,
  last_shown_at timestamptz NOT NULL DEFAULT now(),
  show_count integer NOT NULL DEFAULT 1,
  UNIQUE (user_id, interruption_key)
);

CREATE INDEX IF NOT EXISTS engagement_throttle_user_id_idx
  ON public.engagement_throttle (user_id);

CREATE INDEX IF NOT EXISTS engagement_throttle_last_shown_idx
  ON public.engagement_throttle (user_id, last_shown_at DESC);

ALTER TABLE public.engagement_throttle ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'engagement_throttle'
      AND policyname = 'Users can read own throttle'
  ) THEN
    CREATE POLICY "Users can read own throttle"
      ON public.engagement_throttle FOR SELECT
      TO authenticated
      USING ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'engagement_throttle'
      AND policyname = 'Users can insert own throttle'
  ) THEN
    CREATE POLICY "Users can insert own throttle"
      ON public.engagement_throttle FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'engagement_throttle'
      AND policyname = 'Users can update own throttle'
  ) THEN
    CREATE POLICY "Users can update own throttle"
      ON public.engagement_throttle FOR UPDATE
      TO authenticated
      USING ((SELECT auth.uid()) = user_id)
      WITH CHECK ((SELECT auth.uid()) = user_id);
  END IF;
END $$;


CREATE TABLE IF NOT EXISTS public.glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  term text NOT NULL,
  plain_language text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS glossary_terms_language_idx
  ON public.glossary_terms (language);

ALTER TABLE public.glossary_terms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'glossary_terms'
      AND policyname = 'Anyone can read glossary'
  ) THEN
    CREATE POLICY "Anyone can read glossary"
      ON public.glossary_terms FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;


DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'layout_preferences'
  ) THEN
    ALTER TABLE public.profiles
      ADD COLUMN layout_preferences jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;
