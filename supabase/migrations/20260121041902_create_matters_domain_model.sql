/*
  # Create Matter-Centric Domain Model

  This migration introduces a first-class "Matter" entity as the organizing principle
  for legal work, addressing the information architecture gap identified in the 
  platform analysis. All related entities (documents, conversations, participants,
  activities) are linked to matters with enforced constraints.

  ## 1. New Tables

  ### `matters`
  Central organizing entity for legal work
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users) - matter owner/client
  - `title` (text) - human-readable matter name
  - `description` (text) - matter summary
  - `practice_area` (text) - legal category
  - `jurisdiction` (text) - applicable jurisdiction
  - `status` (text) - open, closed, on_hold, archived
  - `priority` (text) - low, medium, high, urgent
  - `created_at`, `updated_at` (timestamptz)

  ### `matter_participants`
  Links users to matters with specific roles
  - `id` (uuid, primary key)
  - `matter_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `role` (text) - client, attorney, paralegal, support
  - `permissions` (jsonb) - granular access controls
  - `added_at`, `removed_at` (timestamptz)

  ### `matter_documents`
  Links documents to matters
  - `id` (uuid, primary key)
  - `matter_id` (uuid, foreign key)
  - `document_id` (uuid, foreign key to documents)
  - `category` (text) - intake, evidence, correspondence, filing, output
  - `added_at` (timestamptz)

  ### `matter_activity_timeline`
  Audit trail of all matter-related events
  - `id` (uuid, primary key)
  - `matter_id` (uuid, foreign key)
  - `actor_id` (uuid, foreign key)
  - `activity_type` (text) - created, updated, document_added, message_sent, etc.
  - `activity_data` (jsonb) - structured event details
  - `created_at` (timestamptz)

  ## 2. Schema Changes

  ### `chat_contexts`
  - Add `matter_id` column to link conversations to matters

  ### `documents`
  - Add `matter_id` column for direct matter association

  ## 3. Security

  - RLS enabled on all new tables
  - Policies based on matter participation (not just ownership)
  - Supports ethical walls through participant-based access

  ## 4. Indexes

  - Foreign key indexes for performance
  - Composite indexes for common query patterns
*/

-- Create matters table
CREATE TABLE IF NOT EXISTS matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  practice_area text,
  jurisdiction text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'on_hold', 'archived')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  intake_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create matter_participants table
CREATE TABLE IF NOT EXISTS matter_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('client', 'attorney', 'paralegal', 'support', 'admin')),
  permissions jsonb NOT NULL DEFAULT '{"view": true, "edit": false, "delete": false, "manage_participants": false}',
  added_at timestamptz DEFAULT now(),
  removed_at timestamptz,
  UNIQUE (matter_id, user_id)
);

-- Create matter_documents junction table
CREATE TABLE IF NOT EXISTS matter_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('intake', 'evidence', 'correspondence', 'filing', 'output', 'general')),
  notes text,
  added_at timestamptz DEFAULT now(),
  added_by uuid REFERENCES auth.users(id),
  UNIQUE (matter_id, document_id)
);

-- Create matter_activity_timeline table
CREATE TABLE IF NOT EXISTS matter_activity_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id uuid NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id),
  activity_type text NOT NULL,
  activity_data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add matter_id to chat_contexts if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_contexts' AND column_name = 'matter_id'
  ) THEN
    ALTER TABLE chat_contexts ADD COLUMN matter_id uuid REFERENCES matters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add matter_id to documents if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'matter_id'
  ) THEN
    ALTER TABLE documents ADD COLUMN matter_id uuid REFERENCES matters(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create indexes for matters
CREATE INDEX IF NOT EXISTS idx_matters_user_id ON matters(user_id);
CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status);
CREATE INDEX IF NOT EXISTS idx_matters_practice_area ON matters(practice_area);
CREATE INDEX IF NOT EXISTS idx_matters_created_at ON matters(created_at DESC);

-- Create indexes for matter_participants
CREATE INDEX IF NOT EXISTS idx_matter_participants_matter_id ON matter_participants(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_participants_user_id ON matter_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_matter_participants_role ON matter_participants(role);
CREATE INDEX IF NOT EXISTS idx_matter_participants_active ON matter_participants(matter_id) WHERE removed_at IS NULL;

-- Create indexes for matter_documents
CREATE INDEX IF NOT EXISTS idx_matter_documents_matter_id ON matter_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_documents_document_id ON matter_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_matter_documents_category ON matter_documents(category);

-- Create indexes for matter_activity_timeline
CREATE INDEX IF NOT EXISTS idx_matter_activity_matter_id ON matter_activity_timeline(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_activity_actor_id ON matter_activity_timeline(actor_id);
CREATE INDEX IF NOT EXISTS idx_matter_activity_type ON matter_activity_timeline(activity_type);
CREATE INDEX IF NOT EXISTS idx_matter_activity_created_at ON matter_activity_timeline(created_at DESC);

-- Create index on chat_contexts.matter_id
CREATE INDEX IF NOT EXISTS idx_chat_contexts_matter_id ON chat_contexts(matter_id);

-- Create index on documents.matter_id
CREATE INDEX IF NOT EXISTS idx_documents_matter_id ON documents(matter_id);

-- Enable RLS on all new tables
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE matter_activity_timeline ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is participant in matter
CREATE OR REPLACE FUNCTION public.is_matter_participant(p_matter_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matter_participants
    WHERE matter_id = p_matter_id
    AND user_id = p_user_id
    AND removed_at IS NULL
  );
$$;

-- Helper function to check if user owns matter
CREATE OR REPLACE FUNCTION public.is_matter_owner(p_matter_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matters
    WHERE id = p_matter_id
    AND user_id = p_user_id
  );
$$;

-- Helper function to check participant permission
CREATE OR REPLACE FUNCTION public.has_matter_permission(p_matter_id uuid, p_user_id uuid, p_permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM matter_participants
    WHERE matter_id = p_matter_id
    AND user_id = p_user_id
    AND removed_at IS NULL
    AND (permissions->>p_permission)::boolean = true
  );
$$;

-- RLS Policies for matters table

-- Users can view matters they own or participate in
CREATE POLICY "Users can view own or participating matters"
  ON matters FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    public.is_matter_participant(id, auth.uid())
  );

-- Users can create their own matters
CREATE POLICY "Users can create own matters"
  ON matters FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update matters they own
CREATE POLICY "Users can update own matters"
  ON matters FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete matters they own
CREATE POLICY "Users can delete own matters"
  ON matters FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for matter_participants table

-- Users can view participants for matters they access
CREATE POLICY "Users can view matter participants"
  ON matter_participants FOR SELECT
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- Only matter owners can add participants
CREATE POLICY "Matter owners can add participants"
  ON matter_participants FOR INSERT
  TO authenticated
  WITH CHECK (public.is_matter_owner(matter_id, auth.uid()));

-- Only matter owners can update participants
CREATE POLICY "Matter owners can update participants"
  ON matter_participants FOR UPDATE
  TO authenticated
  USING (public.is_matter_owner(matter_id, auth.uid()))
  WITH CHECK (public.is_matter_owner(matter_id, auth.uid()));

-- Only matter owners can remove participants
CREATE POLICY "Matter owners can remove participants"
  ON matter_participants FOR DELETE
  TO authenticated
  USING (public.is_matter_owner(matter_id, auth.uid()));

-- RLS Policies for matter_documents table

-- Users can view documents for matters they access
CREATE POLICY "Users can view matter documents"
  ON matter_documents FOR SELECT
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- Users can add documents to matters they own or have edit permission
CREATE POLICY "Users can add documents to matters"
  ON matter_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'edit')
  );

-- Users can update document links in matters they own or have edit permission
CREATE POLICY "Users can update matter documents"
  ON matter_documents FOR UPDATE
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'edit')
  )
  WITH CHECK (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'edit')
  );

-- Only matter owners or users with delete permission can remove document links
CREATE POLICY "Users can remove matter documents"
  ON matter_documents FOR DELETE
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.has_matter_permission(matter_id, auth.uid(), 'delete')
  );

-- RLS Policies for matter_activity_timeline table

-- Users can view activity for matters they access
CREATE POLICY "Users can view matter activity"
  ON matter_activity_timeline FOR SELECT
  TO authenticated
  USING (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- System and participants can insert activity records
CREATE POLICY "Users can log matter activity"
  ON matter_activity_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_matter_owner(matter_id, auth.uid()) OR
    public.is_matter_participant(matter_id, auth.uid())
  );

-- Activity records are immutable (no update/delete policies)

-- Create trigger to auto-add owner as participant
CREATE OR REPLACE FUNCTION public.add_matter_owner_as_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO matter_participants (matter_id, user_id, role, permissions)
  VALUES (
    NEW.id,
    NEW.user_id,
    'client',
    '{"view": true, "edit": true, "delete": true, "manage_participants": true}'::jsonb
  )
  ON CONFLICT (matter_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_add_matter_owner_participant ON matters;
CREATE TRIGGER trigger_add_matter_owner_participant
  AFTER INSERT ON matters
  FOR EACH ROW
  EXECUTE FUNCTION public.add_matter_owner_as_participant();

-- Create trigger to log matter activity
CREATE OR REPLACE FUNCTION public.log_matter_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO matter_activity_timeline (matter_id, actor_id, activity_type, activity_data)
    VALUES (NEW.id, NEW.user_id, 'matter_created', jsonb_build_object('title', NEW.title, 'practice_area', NEW.practice_area));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO matter_activity_timeline (matter_id, actor_id, activity_type, activity_data)
    VALUES (NEW.id, auth.uid(), 'matter_updated', jsonb_build_object(
      'changes', jsonb_build_object(
        'status', CASE WHEN OLD.status != NEW.status THEN jsonb_build_object('from', OLD.status, 'to', NEW.status) ELSE NULL END,
        'priority', CASE WHEN OLD.priority != NEW.priority THEN jsonb_build_object('from', OLD.priority, 'to', NEW.priority) ELSE NULL END
      )
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_matter_activity ON matters;
CREATE TRIGGER trigger_log_matter_activity
  AFTER INSERT OR UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION public.log_matter_activity();

-- Create updated_at trigger for matters
CREATE OR REPLACE FUNCTION public.update_matters_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_matters_updated_at ON matters;
CREATE TRIGGER trigger_matters_updated_at
  BEFORE UPDATE ON matters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_matters_updated_at();
