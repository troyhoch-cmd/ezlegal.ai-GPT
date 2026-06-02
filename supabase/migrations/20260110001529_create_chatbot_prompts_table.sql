/*
  # Create Chatbot Prompts Management Tables

  1. New Tables
    - `chatbot_prompts` - Stores predefined prompts that users can select
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key to prompt_categories)
      - `subcategory_id` (uuid, foreign key to prompt_subcategories)
      - `title` (text) - Display title for the prompt
      - `prompt_text` (text) - The actual prompt text
      - `description` (text) - Brief description of what this prompt does
      - `system_instructions` (text) - System prompt to prepend
      - `jurisdiction` (text) - Applicable jurisdiction (e.g., Arizona)
      - `tags` (text array) - Searchable tags
      - `usage_count` (integer) - How many times this prompt has been used
      - `is_active` (boolean) - Whether this prompt is available
      - `is_featured` (boolean) - Whether to feature this prompt
      - `display_order` (integer) - Order in which to display
      - `created_by` (uuid) - Admin who created this prompt
      - `created_at`, `updated_at` (timestamps)

  2. Security
    - Enable RLS on `chatbot_prompts` table
    - Admins can manage prompts
    - All authenticated users can read active prompts
*/

CREATE TABLE IF NOT EXISTS chatbot_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES prompt_categories(id) ON DELETE SET NULL,
  subcategory_id uuid REFERENCES prompt_subcategories(id) ON DELETE SET NULL,
  title text NOT NULL,
  prompt_text text NOT NULL,
  description text DEFAULT '',
  system_instructions text DEFAULT '',
  jurisdiction text DEFAULT 'Arizona',
  tags text[] DEFAULT '{}',
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_category ON chatbot_prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_subcategory ON chatbot_prompts(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_active ON chatbot_prompts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_chatbot_prompts_featured ON chatbot_prompts(is_featured) WHERE is_featured = true;

ALTER TABLE chatbot_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage chatbot prompts"
  ON chatbot_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Authenticated users can read active prompts"
  ON chatbot_prompts
  FOR SELECT
  TO authenticated
  USING (is_active = true);

INSERT INTO chatbot_prompts (title, prompt_text, description, jurisdiction, tags, is_featured, display_order) VALUES
('Eviction Notice Review', 'I received an eviction notice. Can you help me understand my rights and what steps I should take?', 'Help users understand eviction notices and their options', 'Arizona', ARRAY['eviction', 'tenant', 'housing', 'landlord'], true, 1),
('Divorce Filing Questions', 'I am considering filing for divorce. What are the basic requirements and process in my state?', 'Guide users through divorce filing basics', 'Arizona', ARRAY['divorce', 'family', 'marriage'], true, 2),
('Child Custody Overview', 'Can you explain how child custody works and what factors courts consider?', 'Explain custody arrangements and court considerations', 'Arizona', ARRAY['custody', 'children', 'family', 'parenting'], true, 3),
('Small Claims Guidance', 'I want to sue someone in small claims court. What is the process and what are the limits?', 'Help users understand small claims court procedures', 'Arizona', ARRAY['small claims', 'lawsuit', 'court'], false, 4),
('Lease Agreement Review', 'Can you help me understand the key terms in my lease agreement?', 'Review and explain lease agreement terms', 'Arizona', ARRAY['lease', 'rental', 'tenant', 'landlord'], false, 5),
('Debt Collection Rights', 'A debt collector is contacting me. What are my rights and how should I respond?', 'Explain consumer rights regarding debt collection', 'Arizona', ARRAY['debt', 'collection', 'consumer', 'credit'], false, 6);
