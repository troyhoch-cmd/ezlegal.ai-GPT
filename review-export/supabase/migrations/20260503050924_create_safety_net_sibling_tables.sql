/*
  # Legal Safety Net: deadlines, vault, timeline, health, reminders

  ## Context
  legal_matters already exists. The existing matter_deadlines / matter_documents
  tables belong to a separate `matters` domain (matter_participants, etc.),
  so we create sibling tables prefixed with safety_* and link them to
  legal_matters by id to avoid collision.

  ## New Tables
  1. safety_deadlines - Court dates, response windows, renewals, compliance
  2. safety_vault_items - Document metadata for the personal legal vault
  3. safety_timeline_events - Durable matter activity log
  4. legal_health_snapshots - 0-100 legal preparedness score per user
  5. safety_reminders - Scheduled reminder deliveries

  ## Security
  RLS enabled. Every policy enforces auth.uid() = user_id.
*/

CREATE TABLE IF NOT EXISTS safety_deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES legal_matters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  due_at timestamptz NOT NULL,
  kind text NOT NULL DEFAULT 'other',
  completed_at timestamptz,
  reminder_days_before integer[] NOT NULL DEFAULT ARRAY[7,1]::integer[],
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT safety_deadlines_kind_check CHECK (kind IN ('court_date','response','filing','renewal','compliance','notice','other'))
);

CREATE INDEX IF NOT EXISTS safety_deadlines_user_due_idx ON safety_deadlines(user_id, due_at);
CREATE INDEX IF NOT EXISTS safety_deadlines_matter_idx ON safety_deadlines(matter_id);

ALTER TABLE safety_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own safety deadlines" ON safety_deadlines FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own safety deadlines" ON safety_deadlines FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own safety deadlines" ON safety_deadlines FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own safety deadlines" ON safety_deadlines FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS safety_vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid REFERENCES legal_matters(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT '',
  kind text NOT NULL DEFAULT 'other',
  storage_path text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT '',
  size_bytes bigint NOT NULL DEFAULT 0,
  summary text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT safety_vault_kind_check CHECK (kind IN ('notice','lease','contract','court','correspondence','policy','identity','other'))
);

CREATE INDEX IF NOT EXISTS safety_vault_user_idx ON safety_vault_items(user_id);
CREATE INDEX IF NOT EXISTS safety_vault_matter_idx ON safety_vault_items(matter_id);

ALTER TABLE safety_vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own vault" ON safety_vault_items FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own vault" ON safety_vault_items FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own vault" ON safety_vault_items FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own vault" ON safety_vault_items FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS safety_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES legal_matters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'note_added',
  summary text NOT NULL DEFAULT '',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS safety_timeline_matter_idx ON safety_timeline_events(matter_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS safety_timeline_user_idx ON safety_timeline_events(user_id);

ALTER TABLE safety_timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own safety timeline" ON safety_timeline_events FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own safety timeline" ON safety_timeline_events FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own safety timeline" ON safety_timeline_events FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own safety timeline" ON safety_timeline_events FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS legal_health_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  score integer NOT NULL DEFAULT 0,
  signals jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT legal_health_score_check CHECK (score BETWEEN 0 AND 100)
);

CREATE INDEX IF NOT EXISTS legal_health_user_idx ON legal_health_snapshots(user_id, computed_at DESC);

ALTER TABLE legal_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own health" ON legal_health_snapshots FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own health" ON legal_health_snapshots FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own health" ON legal_health_snapshots FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own health" ON legal_health_snapshots FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS safety_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_id uuid NOT NULL REFERENCES safety_deadlines(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'in_app',
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  CONSTRAINT safety_reminders_channel_check CHECK (channel IN ('email','sms','whatsapp','in_app')),
  CONSTRAINT safety_reminders_status_check CHECK (status IN ('pending','sent','failed','canceled'))
);

CREATE INDEX IF NOT EXISTS safety_reminders_user_idx ON safety_reminders(user_id, scheduled_for);

ALTER TABLE safety_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own safety reminders" ON safety_reminders FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own safety reminders" ON safety_reminders FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users update own safety reminders" ON safety_reminders FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own safety reminders" ON safety_reminders FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);
