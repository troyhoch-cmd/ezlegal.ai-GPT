/*
  # Pro Bono Intake System

  1. New Tables
    - `pro_bono_applications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for logged in users)
      - `email` (text, required for follow-up)
      - `phone` (text, optional)
      - `full_name` (text, required)
      - `preferred_language` (text, default 'en')
      - `county` (text, required for geographic eligibility)
      - `state` (text, required)
      - `zip_code` (text, optional)
      - `household_income` (numeric, required for eligibility)
      - `household_size` (integer, required for eligibility)
      - `legal_issue_category` (text, required - employment, housing, family, etc.)
      - `legal_issue_description` (text, required)
      - `urgency_level` (text, default 'normal' - immediate, urgent, normal)
      - `ai_eligibility_score` (numeric, nullable - AI-generated eligibility score 0-100)
      - `ai_recommendation` (text, nullable - AI-generated recommendation)
      - `status` (text, default 'pending' - pending, reviewing, approved, referred, closed)
      - `assigned_to` (uuid, nullable - admin/attorney assigned)
      - `partner_organization` (text, nullable - for white label partners)
      - `referral_source` (text, nullable)
      - `opposing_party_name` (text, nullable)
      - `case_deadline` (date, nullable)
      - `previous_attorney` (boolean, default false)
      - `current_court_case` (boolean, default false)
      - `notes` (text, nullable - internal notes)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `contacted_at` (timestamptz, nullable)
    
    - `pro_bono_documents`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to pro_bono_applications)
      - `file_name` (text, required)
      - `file_path` (text, required - storage path)
      - `file_type` (text, required)
      - `file_size` (integer, required)
      - `uploaded_by` (uuid, nullable - user who uploaded)
      - `created_at` (timestamptz, default now())
    
    - `pro_bono_communications`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to pro_bono_applications)
      - `from_user_id` (uuid, nullable)
      - `message` (text, required)
      - `message_type` (text, default 'note' - note, email, sms, call)
      - `sent_by_admin` (boolean, default false)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Applicants can insert their own applications
    - Applicants can view their own applications
    - Only admins can update application status
    - Only admins can view all applications
*/

-- Create pro_bono_applications table
CREATE TABLE IF NOT EXISTS pro_bono_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text,
  full_name text NOT NULL,
  preferred_language text DEFAULT 'en',
  county text NOT NULL,
  state text NOT NULL,
  zip_code text,
  household_income numeric NOT NULL,
  household_size integer NOT NULL,
  legal_issue_category text NOT NULL,
  legal_issue_description text NOT NULL,
  urgency_level text DEFAULT 'normal',
  ai_eligibility_score numeric,
  ai_recommendation text,
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  partner_organization text,
  referral_source text,
  opposing_party_name text,
  case_deadline date,
  previous_attorney boolean DEFAULT false,
  current_court_case boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  contacted_at timestamptz
);

-- Create pro_bono_documents table
CREATE TABLE IF NOT EXISTS pro_bono_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES pro_bono_applications(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create pro_bono_communications table
CREATE TABLE IF NOT EXISTS pro_bono_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES pro_bono_applications(id) ON DELETE CASCADE NOT NULL,
  from_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  message text NOT NULL,
  message_type text DEFAULT 'note',
  sent_by_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE pro_bono_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_bono_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_bono_communications ENABLE ROW LEVEL SECURITY;

-- Policies for pro_bono_applications

-- Anyone can insert their own application (even unauthenticated for initial submission)
CREATE POLICY "Anyone can submit pro bono application"
  ON pro_bono_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON pro_bono_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
  ON pro_bono_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Admins can update any application
CREATE POLICY "Admins can update applications"
  ON pro_bono_applications
  FOR UPDATE
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

-- Policies for pro_bono_documents

-- Authenticated users can upload documents to their applications
CREATE POLICY "Users can upload documents to own applications"
  ON pro_bono_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid() 
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Users can view documents for their own applications
CREATE POLICY "Users can view own application documents"
  ON pro_bono_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid()
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
  ON pro_bono_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policies for pro_bono_communications

-- Users can add communications to their own applications
CREATE POLICY "Users can add communications to own applications"
  ON pro_bono_communications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid()
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Users can view communications for their own applications
CREATE POLICY "Users can view own application communications"
  ON pro_bono_communications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pro_bono_applications
      WHERE pro_bono_applications.id = application_id
      AND (pro_bono_applications.user_id = auth.uid()
           OR pro_bono_applications.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Admins can manage all communications
CREATE POLICY "Admins can manage all communications"
  ON pro_bono_communications
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_user_id ON pro_bono_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_email ON pro_bono_applications(email);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_status ON pro_bono_applications(status);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_created_at ON pro_bono_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pro_bono_applications_partner_org ON pro_bono_applications(partner_organization);
CREATE INDEX IF NOT EXISTS idx_pro_bono_documents_application_id ON pro_bono_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_pro_bono_communications_application_id ON pro_bono_communications(application_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pro_bono_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_pro_bono_applications_updated_at'
  ) THEN
    CREATE TRIGGER update_pro_bono_applications_updated_at
      BEFORE UPDATE ON pro_bono_applications
      FOR EACH ROW
      EXECUTE FUNCTION update_pro_bono_application_updated_at();
  END IF;
END $$;