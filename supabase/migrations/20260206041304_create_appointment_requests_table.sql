/*
  # Create Appointment Requests Table

  1. New Tables
    - `appointment_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - allows anonymous requests)
      - `lawyer_id` (text)
      - `lawyer_name` (text)
      - `requester_name` (text)
      - `requester_email` (text)
      - `requester_phone` (text, optional)
      - `preferred_date` (date)
      - `preferred_time` (text)
      - `alternate_date` (date, optional)
      - `alternate_time` (text, optional)
      - `consultation_type` (text) - phone, video, in_person
      - `brief_description` (text, optional)
      - `status` (text) - pending, confirmed, cancelled, completed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Anyone can create requests
    - Authenticated users can view their own requests
*/

CREATE TABLE IF NOT EXISTS appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  lawyer_id text NOT NULL,
  lawyer_name text NOT NULL,
  requester_name text NOT NULL,
  requester_email text NOT NULL,
  requester_phone text,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  alternate_date date,
  alternate_time text,
  consultation_type text NOT NULL DEFAULT 'phone' CHECK (consultation_type IN ('phone', 'video', 'in_person')),
  brief_description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_user_id ON appointment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_lawyer_id ON appointment_requests(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_preferred_date ON appointment_requests(preferred_date);

ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create appointment requests"
  ON appointment_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view their own appointment requests"
  ON appointment_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can update their own appointment requests"
  ON appointment_requests
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
