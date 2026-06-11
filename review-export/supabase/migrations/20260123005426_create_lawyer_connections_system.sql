/*
  # Lawyer Connections System

  1. New Tables
    - `lawyer_connections` - Tracks all user-lawyer connection requests and status
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `lawyer_id` (text, references lawyer profile ID)
      - `lawyer_name` (text)
      - `lawyer_image` (text)
      - `connection_type` (text) - 'chat', 'appointment', 'quote'
      - `status` (text) - 'pending', 'accepted', 'declined', 'completed', 'cancelled'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `lawyer_messages` - Chat messages between users and lawyers
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references lawyer_connections)
      - `sender_type` (text) - 'user' or 'lawyer'
      - `sender_id` (text)
      - `message` (text)
      - `read_at` (timestamptz)
      - `created_at` (timestamptz)

    - `appointment_requests` - Appointment scheduling requests
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references lawyer_connections)
      - `appointment_type` (text) - 'phone', 'video', 'in_person'
      - `preferred_date` (date)
      - `preferred_time` (text)
      - `alternate_date` (date)
      - `alternate_time` (text)
      - `case_description` (text)
      - `confirmed_date` (timestamptz)
      - `notes` (text)

    - `quote_requests` - Legal service quote requests
      - `id` (uuid, primary key)
      - `connection_id` (uuid, references lawyer_connections)
      - `service_type` (text)
      - `case_description` (text)
      - `urgency` (text)
      - `budget_range` (text)
      - `quote_amount` (numeric)
      - `quote_notes` (text)
      - `quote_valid_until` (date)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own connections and messages
*/

-- Lawyer Connections table
CREATE TABLE IF NOT EXISTS lawyer_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id text NOT NULL,
  lawyer_name text NOT NULL,
  lawyer_image text,
  lawyer_practice_areas text[],
  connection_type text NOT NULL CHECK (connection_type IN ('chat', 'appointment', 'quote')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'accepted', 'declined', 'completed', 'cancelled')),
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Lawyer Messages table
CREATE TABLE IF NOT EXISTS lawyer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES lawyer_connections(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'lawyer', 'system')),
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'appointment_request', 'quote_request', 'system')),
  metadata jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Appointment Requests table
CREATE TABLE IF NOT EXISTS appointment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES lawyer_connections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id text NOT NULL,
  appointment_type text NOT NULL CHECK (appointment_type IN ('phone', 'video', 'in_person')),
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  alternate_date date,
  alternate_time text,
  case_type text,
  case_description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show')),
  confirmed_datetime timestamptz,
  meeting_link text,
  meeting_location text,
  lawyer_notes text,
  user_notes text,
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quote Requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES lawyer_connections(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id text NOT NULL,
  service_type text NOT NULL,
  case_description text NOT NULL,
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  budget_range text,
  preferred_fee_structure text CHECK (preferred_fee_structure IN ('hourly', 'flat_fee', 'contingency', 'retainer', 'flexible')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'declined', 'expired')),
  quote_amount numeric,
  quote_fee_structure text,
  quote_description text,
  quote_valid_until date,
  quote_provided_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE lawyer_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lawyer_connections
CREATE POLICY "Users can view their own connections"
  ON lawyer_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create connections"
  ON lawyer_connections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
  ON lawyer_connections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for lawyer_messages
CREATE POLICY "Users can view messages for their connections"
  ON lawyer_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their connections"
  ON lawyer_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages for their connections"
  ON lawyer_messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = auth.uid()
    )
  );

-- RLS Policies for appointment_requests
CREATE POLICY "Users can view their own appointment requests"
  ON appointment_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointment requests"
  ON appointment_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointment requests"
  ON appointment_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quote_requests
CREATE POLICY "Users can view their own quote requests"
  ON quote_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create quote requests"
  ON quote_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quote requests"
  ON quote_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lawyer_connections_user_id ON lawyer_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_connections_status ON lawyer_connections(status);
CREATE INDEX IF NOT EXISTS idx_lawyer_connections_lawyer_id ON lawyer_connections(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_connection_id ON lawyer_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_messages_created_at ON lawyer_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_user_id ON appointment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_preferred_date ON appointment_requests(preferred_date);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user_id ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);

-- Function to update connection last_activity_at when new message is added
CREATE OR REPLACE FUNCTION update_connection_last_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE lawyer_connections
  SET last_activity_at = now(), updated_at = now()
  WHERE id = NEW.connection_id;
  RETURN NEW;
END;
$$;

-- Trigger to update last_activity_at
DROP TRIGGER IF EXISTS trigger_update_connection_activity ON lawyer_messages;
CREATE TRIGGER trigger_update_connection_activity
  AFTER INSERT ON lawyer_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_last_activity();
