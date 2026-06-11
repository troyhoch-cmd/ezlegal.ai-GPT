/*
  # Create Embed Widget System for Professional Tier

  1. New Tables
    - `embed_widgets` - Stores widget configurations for SMBs
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users) - widget owner
      - `name` (text) - widget display name
      - `widget_type` (text) - chat, lawyer_search, contact_form, document_analyzer
      - `api_key` (text, unique) - public API key for embedding
      - `config` (jsonb) - widget configuration (colors, position, behavior)
      - `allowed_domains` (text[]) - whitelist of domains allowed to embed
      - `is_active` (boolean) - whether widget is active
      - `created_at`, `updated_at` timestamps
    
    - `widget_analytics` - Tracks widget usage metrics
      - `id` (uuid, primary key)
      - `widget_id` (uuid, references embed_widgets)
      - `event_type` (text) - impression, open, message, email_collected, lawyer_search
      - `metadata` (jsonb) - additional event data
      - `domain` (text) - domain where event occurred
      - `created_at` timestamp
    
    - `widget_conversations` - Stores chat conversations from embedded widgets
      - `id` (uuid, primary key)
      - `widget_id` (uuid, references embed_widgets)
      - `visitor_id` (text) - anonymous visitor identifier
      - `visitor_email` (text) - collected email if provided
      - `messages` (jsonb) - array of messages
      - `metadata` (jsonb) - visitor info, device, etc.
      - `created_at`, `updated_at` timestamps

  2. Security
    - Enable RLS on all tables
    - Owners can manage their own widgets
    - Analytics and conversations accessible by widget owner
    
  3. Indexes
    - api_key lookup for widget serving
    - widget_id for analytics queries
    - created_at for time-based queries
*/

-- Create embed_widgets table
CREATE TABLE IF NOT EXISTS embed_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  widget_type text NOT NULL CHECK (widget_type IN ('chat', 'lawyer_search', 'contact_form', 'document_analyzer')),
  api_key text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64'),
  config jsonb NOT NULL DEFAULT '{
    "appearance": {
      "primaryColor": "#2563eb",
      "position": "bottom-right",
      "buttonText": "Legal Help",
      "headerTitle": "Legal Assistant",
      "showBranding": true
    },
    "behavior": {
      "autoOpen": false,
      "autoOpenDelay": 5000,
      "collectEmail": true,
      "greetingMessage": "Hello! How can I help you with your legal questions today?"
    }
  }'::jsonb,
  allowed_domains text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create widget_analytics table
CREATE TABLE IF NOT EXISTS widget_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES embed_widgets(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'open', 'message', 'email_collected', 'lawyer_search', 'contact_submitted', 'document_uploaded')),
  metadata jsonb DEFAULT '{}',
  domain text,
  visitor_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create widget_conversations table
CREATE TABLE IF NOT EXISTS widget_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid NOT NULL REFERENCES embed_widgets(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  visitor_email text,
  visitor_name text,
  messages jsonb NOT NULL DEFAULT '[]',
  metadata jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'escalated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE embed_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_conversations ENABLE ROW LEVEL SECURITY;

-- Policies for embed_widgets
CREATE POLICY "Users can view own widgets"
  ON embed_widgets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own widgets"
  ON embed_widgets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets"
  ON embed_widgets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets"
  ON embed_widgets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for widget_analytics
CREATE POLICY "Users can view analytics for own widgets"
  ON widget_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM embed_widgets
      WHERE embed_widgets.id = widget_analytics.widget_id
      AND embed_widgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert analytics"
  ON widget_analytics FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policies for widget_conversations
CREATE POLICY "Users can view conversations for own widgets"
  ON widget_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM embed_widgets
      WHERE embed_widgets.id = widget_conversations.widget_id
      AND embed_widgets.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage conversations"
  ON widget_conversations FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Service role can update conversations"
  ON widget_conversations FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_embed_widgets_api_key ON embed_widgets(api_key);
CREATE INDEX IF NOT EXISTS idx_embed_widgets_user_id ON embed_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_widget_id ON widget_analytics(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_created_at ON widget_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_type ON widget_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_widget_conversations_widget_id ON widget_conversations(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_conversations_visitor_id ON widget_conversations(visitor_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_embed_widget_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_embed_widgets_updated_at ON embed_widgets;
CREATE TRIGGER update_embed_widgets_updated_at
  BEFORE UPDATE ON embed_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_embed_widget_updated_at();

DROP TRIGGER IF EXISTS update_widget_conversations_updated_at ON widget_conversations;
CREATE TRIGGER update_widget_conversations_updated_at
  BEFORE UPDATE ON widget_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_embed_widget_updated_at();
