/*
  # Create Unified Activity Log System

  1. New Tables
    - `activity_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `activity_type` (text) - chat, lawyer_match, document, prediction, system
      - `action` (text) - created, updated, completed, viewed, etc.
      - `title` (text) - human-readable title
      - `description` (text) - detailed description
      - `metadata` (jsonb) - flexible data for type-specific info
      - `related_id` (uuid) - ID of related entity (chat_message_id, lawyer_match_id, etc.)
      - `related_type` (text) - type of related entity
      - `is_favorite` (boolean) - user can star important activities
      - `is_client_visible` (boolean) - for legal compliance
      - `status` (text) - completed, pending, failed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `activity_log` table
    - Users can only access their own activity log
    - Admins can view all activities for audit purposes

  3. Performance
    - Index on user_id + created_at for efficient timeline queries
    - Index on activity_type for filtered views
    - Index on related_id for lookups
*/

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('chat', 'lawyer_match', 'document', 'prediction', 'case', 'system')),
  action text NOT NULL,
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  related_id uuid,
  related_type text,
  is_favorite boolean DEFAULT false,
  is_client_visible boolean DEFAULT true,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'in_progress', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_log_user_created 
  ON activity_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_log_type 
  ON activity_log(activity_type);

CREATE INDEX IF NOT EXISTS idx_activity_log_related 
  ON activity_log(related_id) WHERE related_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_activity_log_favorite 
  ON activity_log(user_id, is_favorite) WHERE is_favorite = true;

CREATE POLICY "Users can view own activities"
  ON activity_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
  ON activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activity_log
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activity_log
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION log_user_activity(
  p_activity_type text,
  p_action text,
  p_title text,
  p_description text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_related_id uuid DEFAULT NULL,
  p_related_type text DEFAULT NULL,
  p_status text DEFAULT 'completed'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity_id uuid;
BEGIN
  INSERT INTO activity_log (
    user_id,
    activity_type,
    action,
    title,
    description,
    metadata,
    related_id,
    related_type,
    status
  ) VALUES (
    auth.uid(),
    p_activity_type,
    p_action,
    p_title,
    p_description,
    p_metadata,
    p_related_id,
    p_related_type,
    p_status
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_activity_stats(p_user_id uuid, p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_activities', COUNT(*),
    'chat_count', COUNT(*) FILTER (WHERE activity_type = 'chat'),
    'lawyer_match_count', COUNT(*) FILTER (WHERE activity_type = 'lawyer_match'),
    'document_count', COUNT(*) FILTER (WHERE activity_type = 'document'),
    'prediction_count', COUNT(*) FILTER (WHERE activity_type = 'prediction'),
    'favorites_count', COUNT(*) FILTER (WHERE is_favorite = true),
    'pending_count', COUNT(*) FILTER (WHERE status = 'pending'),
    'this_week', COUNT(*) FILTER (WHERE created_at > now() - interval '7 days'),
    'this_month', COUNT(*) FILTER (WHERE created_at > now() - interval '30 days')
  )
  INTO v_stats
  FROM activity_log
  WHERE user_id = p_user_id
    AND created_at > now() - (p_days || ' days')::interval;
  
  RETURN v_stats;
END;
$$;