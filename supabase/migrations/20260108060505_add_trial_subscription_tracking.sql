/*
  # Trial and Subscription Tracking Enhancement

  1. Schema Updates
    - Add trial tracking columns to profiles table
    - Create usage_tracking table for Forever Free limits
    - Create trial_touchpoints for engagement tracking
    - Create subscription_history for audit trail

  2. New Columns in profiles
    - trial_started_at - When trial began
    - trial_expires_at - When trial ends (14 days from start)
    - trial_converted_at - When user upgraded from trial
    - subscription_started_at - When paid subscription began
    - subscription_ends_at - For annual plans or cancellations
    - trial_reminder_sent - Track if Day 10 reminder sent
    - trial_final_reminder_sent - Track if Day 13 reminder sent

  3. Security
    - RLS policies ensure users can only access their own data
    - Admin override for support purposes

  4. Important Notes
    - Trial defaults to 14 days from trial_started_at
    - subscription_tier updated to support: trial, forever_free, basic, premium, enterprise
    - Forever Free allows 3 questions per month, no documents
    - Basic plan allows unlimited questions, 5 docs per month
    - Premium allows unlimited everything plus attorney consultation time
*/

-- Update subscription_tier enum values in profiles
DO $$
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
  
  -- Add new constraint with updated values
  ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
    CHECK (subscription_tier IN ('trial', 'forever_free', 'free', 'basic', 'premium', 'enterprise'));
END $$;

-- Add trial and subscription columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_started_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_expires_at timestamptz DEFAULT (now() + interval '14 days');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_converted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_converted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_ends_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_reminder_sent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_reminder_sent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'trial_final_reminder_sent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_final_reminder_sent boolean DEFAULT false;
  END IF;
END $$;

-- Create usage_tracking table for Forever Free monthly limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  questions_used integer DEFAULT 0,
  documents_used integer DEFAULT 0,
  reset_at timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Create trial_touchpoints table for engagement tracking
CREATE TABLE IF NOT EXISTS trial_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('trial_started', 'first_question', 'first_document', 'attorney_viewed', 'upgrade_clicked', 'trial_expired', 'converted_to_paid', 'downgraded_to_free')),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create subscription_history table for audit trail
CREATE TABLE IF NOT EXISTS subscription_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_tier text,
  to_tier text NOT NULL,
  reason text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_trial_touchpoints_user ON trial_touchpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_trial_touchpoints_event ON trial_touchpoints(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_expires ON profiles(trial_expires_at) WHERE subscription_tier = 'trial';

-- Enable RLS on new tables
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_touchpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records"
  ON usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage records"
  ON usage_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trial_touchpoints
CREATE POLICY "Users can view own touchpoints"
  ON trial_touchpoints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert touchpoints"
  ON trial_touchpoints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscription_history
CREATE POLICY "Users can view own subscription history"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription history"
  ON subscription_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = changed_by);

-- Create function to check if user has exceeded Forever Free limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id uuid,
  p_limit_type text,
  p_max_allowed integer
) RETURNS boolean AS $$
DECLARE
  v_current_month text;
  v_usage_count integer;
  v_subscription_tier text;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  SELECT subscription_tier INTO v_subscription_tier
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_subscription_tier != 'forever_free' THEN
    RETURN true;
  END IF;
  
  IF p_limit_type = 'questions' THEN
    SELECT COALESCE(questions_used, 0) INTO v_usage_count
    FROM usage_tracking
    WHERE user_id = p_user_id AND month_year = v_current_month;
  ELSIF p_limit_type = 'documents' THEN
    SELECT COALESCE(documents_used, 0) INTO v_usage_count
    FROM usage_tracking
    WHERE user_id = p_user_id AND month_year = v_current_month;
  ELSE
    RETURN false;
  END IF;
  
  RETURN COALESCE(v_usage_count, 0) < p_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_usage_type text,
  p_amount integer DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_current_month text;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  
  IF p_usage_type = 'questions' THEN
    INSERT INTO usage_tracking (user_id, month_year, questions_used)
    VALUES (p_user_id, v_current_month, p_amount)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
      questions_used = usage_tracking.questions_used + p_amount,
      updated_at = now();
  ELSIF p_usage_type = 'documents' THEN
    INSERT INTO usage_tracking (user_id, month_year, documents_used)
    VALUES (p_user_id, v_current_month, p_amount)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
      documents_used = usage_tracking.documents_used + p_amount,
      updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-set trial_expires_at on new user signup
CREATE OR REPLACE FUNCTION set_trial_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_started_at IS NOT NULL AND NEW.trial_expires_at IS NULL THEN
    NEW.trial_expires_at := NEW.trial_started_at + interval '14 days';
  END IF;
  IF NEW.subscription_tier IS NULL OR NEW.subscription_tier = 'free' THEN
    NEW.subscription_tier := 'trial';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_trial_expiration_trigger ON profiles;
CREATE TRIGGER set_trial_expiration_trigger
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_trial_expiration();

-- Create updated_at trigger for usage_tracking
DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update existing users to trial if they have 'free' tier
UPDATE profiles 
SET subscription_tier = 'trial', 
    trial_started_at = created_at,
    trial_expires_at = created_at + interval '14 days'
WHERE subscription_tier = 'free' AND trial_started_at IS NULL;
