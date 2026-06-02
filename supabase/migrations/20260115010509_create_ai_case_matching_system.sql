/*
  # AI-Powered Case Matching System

  This migration creates the database infrastructure for an AI-powered case matching
  system that automatically pairs legal cases with appropriate attorneys based on
  expertise, availability, and historical performance.

  ## New Tables

  1. `case_matching_queue`
     - Stores cases pending AI matching
     - Includes case details, urgency, complexity scores
     - Tracks matching status and assignment

  2. `attorney_matching_profiles`
     - Extended attorney profiles for matching
     - Expertise scores by practice area
     - Capacity and workload metrics
     - Historical performance data

  3. `case_matches`
     - Stores match records between cases and attorneys
     - Confidence scores and match reasoning
     - Status tracking (proposed, accepted, declined, completed)

  4. `match_feedback`
     - Feedback loop for improving match quality
     - Tracks outcomes and attorney satisfaction
     - Used to improve matching algorithm

  5. `matching_algorithm_config`
     - Configurable weights for matching factors
     - Organization-specific settings

  ## Security
  - RLS enabled on all tables
  - Organization-scoped access policies
*/

-- Case Matching Queue: Stores cases awaiting or undergoing AI matching
CREATE TABLE IF NOT EXISTS case_matching_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Case identification
  source_type text NOT NULL CHECK (source_type IN ('lso_intake', 'pro_bono', 'external', 'manual')),
  source_id uuid,
  external_reference text,
  
  -- Client information (anonymized for matching)
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  client_county text,
  client_zip_code text,
  preferred_language text DEFAULT 'en',
  
  -- Case details
  case_type text NOT NULL,
  case_subcategory text,
  case_description text NOT NULL,
  legal_issue_summary text,
  
  -- Urgency and complexity
  urgency_level text NOT NULL DEFAULT 'normal' CHECK (urgency_level IN ('critical', 'high', 'normal', 'low')),
  complexity_score integer DEFAULT 50 CHECK (complexity_score >= 0 AND complexity_score <= 100),
  deadline_date date,
  court_date date,
  
  -- AI analysis results
  ai_case_analysis jsonb DEFAULT '{}'::jsonb,
  ai_recommended_practice_areas text[] DEFAULT '{}'::text[],
  ai_estimated_hours integer,
  ai_risk_assessment text,
  
  -- Documentation status
  has_documentation boolean DEFAULT false,
  documentation_quality text DEFAULT 'none' CHECK (documentation_quality IN ('none', 'partial', 'complete', 'excellent')),
  documents_count integer DEFAULT 0,
  
  -- Opposing party info
  has_opposing_counsel boolean DEFAULT false,
  opposing_counsel_name text,
  
  -- Financial eligibility
  income_eligible boolean,
  income_amount numeric,
  household_size integer,
  poverty_percentage numeric,
  
  -- Matching status
  matching_status text NOT NULL DEFAULT 'pending' CHECK (matching_status IN ('pending', 'in_progress', 'matched', 'no_match', 'closed', 'cancelled')),
  matching_attempts integer DEFAULT 0,
  last_matching_run timestamptz,
  
  -- Assignment
  assigned_attorney_id uuid,
  assigned_at timestamptz,
  assignment_notes text,
  
  -- Metadata
  priority_override integer,
  tags text[] DEFAULT '{}'::text[],
  internal_notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Attorney Matching Profiles: Extended profiles for matching optimization
CREATE TABLE IF NOT EXISTS attorney_matching_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attorney_id uuid NOT NULL REFERENCES lso_volunteer_attorneys(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Practice area expertise (0-100 score per area)
  expertise_scores jsonb DEFAULT '{}'::jsonb,
  -- Example: {"housing": 95, "family": 80, "immigration": 60}
  
  -- Language capabilities
  languages text[] DEFAULT '{en}'::text[],
  
  -- Geographic preferences
  preferred_counties text[] DEFAULT '{}'::text[],
  max_travel_distance_miles integer,
  accepts_virtual_cases boolean DEFAULT true,
  
  -- Capacity management
  current_case_count integer DEFAULT 0,
  max_case_capacity integer DEFAULT 5,
  available_hours_per_week integer DEFAULT 10,
  current_weekly_hours integer DEFAULT 0,
  
  -- Workload preferences
  preferred_complexity_min integer DEFAULT 0,
  preferred_complexity_max integer DEFAULT 100,
  accepts_urgent_cases boolean DEFAULT true,
  accepts_court_appearances boolean DEFAULT true,
  
  -- Historical performance
  total_cases_handled integer DEFAULT 0,
  successful_outcomes integer DEFAULT 0,
  success_rate numeric DEFAULT 0,
  average_case_duration_days integer,
  average_client_rating numeric DEFAULT 0,
  
  -- Matching algorithm scores
  reliability_score integer DEFAULT 50 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  responsiveness_score integer DEFAULT 50 CHECK (responsiveness_score >= 0 AND responsiveness_score <= 100),
  overall_match_score integer DEFAULT 50 CHECK (overall_match_score >= 0 AND overall_match_score <= 100),
  
  -- Preferences
  case_type_preferences text[] DEFAULT '{}'::text[],
  case_type_exclusions text[] DEFAULT '{}'::text[],
  special_certifications text[] DEFAULT '{}'::text[],
  
  -- Availability schedule
  availability_schedule jsonb DEFAULT '{}'::jsonb,
  -- Example: {"monday": {"start": "09:00", "end": "17:00"}, ...}
  
  next_available_date date,
  on_leave_until date,
  
  -- Settings
  auto_match_enabled boolean DEFAULT true,
  notification_preferences jsonb DEFAULT '{"email": true, "sms": false}'::jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(attorney_id, organization_id)
);

-- Case Matches: Records of case-attorney matches
CREATE TABLE IF NOT EXISTS case_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Case and attorney references
  case_id uuid NOT NULL REFERENCES case_matching_queue(id) ON DELETE CASCADE,
  attorney_id uuid NOT NULL REFERENCES lso_volunteer_attorneys(id),
  attorney_profile_id uuid REFERENCES attorney_matching_profiles(id),
  
  -- Match scoring
  overall_confidence_score integer NOT NULL CHECK (overall_confidence_score >= 0 AND overall_confidence_score <= 100),
  expertise_match_score integer CHECK (expertise_match_score >= 0 AND expertise_match_score <= 100),
  availability_match_score integer CHECK (availability_match_score >= 0 AND availability_match_score <= 100),
  geographic_match_score integer CHECK (geographic_match_score >= 0 AND geographic_match_score <= 100),
  workload_match_score integer CHECK (workload_match_score >= 0 AND workload_match_score <= 100),
  language_match_score integer CHECK (language_match_score >= 0 AND language_match_score <= 100),
  
  -- Match reasoning
  match_factors jsonb DEFAULT '{}'::jsonb,
  match_reasoning text,
  algorithm_version text DEFAULT 'v1.0',
  
  -- Match ranking (for multiple matches per case)
  rank_position integer DEFAULT 1,
  is_primary_match boolean DEFAULT false,
  
  -- Status tracking
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'notified', 'accepted', 'declined', 'expired', 'completed', 'cancelled')),
  
  -- Notifications
  notification_sent_at timestamptz,
  notification_method text,
  response_deadline timestamptz,
  
  -- Attorney response
  attorney_response text,
  attorney_response_at timestamptz,
  decline_reason text,
  
  -- Acceptance and completion
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Outcome tracking
  case_outcome text CHECK (case_outcome IN ('favorable', 'unfavorable', 'settled', 'dismissed', 'withdrawn', 'ongoing', 'other')),
  outcome_notes text,
  hours_spent numeric,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Match Feedback: Feedback for improving matching algorithm
CREATE TABLE IF NOT EXISTS match_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES case_matches(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Feedback source
  feedback_type text NOT NULL CHECK (feedback_type IN ('attorney', 'client', 'staff', 'system')),
  submitted_by uuid REFERENCES auth.users(id),
  
  -- Ratings (1-5 scale)
  overall_satisfaction integer CHECK (overall_satisfaction >= 1 AND overall_satisfaction <= 5),
  match_quality_rating integer CHECK (match_quality_rating >= 1 AND match_quality_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  outcome_satisfaction integer CHECK (outcome_satisfaction >= 1 AND outcome_satisfaction <= 5),
  
  -- Qualitative feedback
  feedback_text text,
  improvement_suggestions text,
  
  -- Match assessment
  was_good_match boolean,
  would_work_with_again boolean,
  match_issues text[] DEFAULT '{}'::text[],
  -- Example issues: ["expertise_mismatch", "schedule_conflict", "language_barrier"]
  
  -- Algorithm training data
  should_have_matched boolean,
  better_match_criteria text,
  
  created_at timestamptz DEFAULT now()
);

-- Matching Algorithm Configuration: Organization-specific settings
CREATE TABLE IF NOT EXISTS matching_algorithm_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES lso_organizations(id) ON DELETE CASCADE,
  
  -- Weight factors (should sum to 100)
  expertise_weight integer DEFAULT 35 CHECK (expertise_weight >= 0 AND expertise_weight <= 100),
  availability_weight integer DEFAULT 25 CHECK (availability_weight >= 0 AND availability_weight <= 100),
  geographic_weight integer DEFAULT 15 CHECK (geographic_weight >= 0 AND geographic_weight <= 100),
  workload_weight integer DEFAULT 15 CHECK (workload_weight >= 0 AND workload_weight <= 100),
  language_weight integer DEFAULT 10 CHECK (language_weight >= 0 AND language_weight <= 100),
  
  -- Thresholds
  minimum_confidence_threshold integer DEFAULT 60,
  auto_match_threshold integer DEFAULT 85,
  max_matches_per_case integer DEFAULT 3,
  
  -- Timing settings
  notification_delay_minutes integer DEFAULT 0,
  response_deadline_hours integer DEFAULT 48,
  match_expiry_hours integer DEFAULT 72,
  
  -- Preferences
  prioritize_new_attorneys boolean DEFAULT false,
  balance_workload boolean DEFAULT true,
  allow_capacity_overflow boolean DEFAULT false,
  
  -- Custom rules (JSON format)
  custom_rules jsonb DEFAULT '[]'::jsonb,
  
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id)
);

-- Matching Notifications: Track notifications sent to attorneys
CREATE TABLE IF NOT EXISTS matching_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES case_matches(id) ON DELETE CASCADE,
  attorney_id uuid NOT NULL REFERENCES lso_volunteer_attorneys(id),
  
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'sms', 'in_app', 'push')),
  notification_template text,
  
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  clicked_at timestamptz,
  
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE case_matching_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE attorney_matching_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_algorithm_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_matching_queue
CREATE POLICY "Organization staff can view their case queue"
  ON case_matching_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  );

CREATE POLICY "Organization staff can insert cases"
  ON case_matching_queue FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  );

CREATE POLICY "Organization staff can update cases"
  ON case_matching_queue FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matching_queue.organization_id
    )
  );

-- RLS Policies for attorney_matching_profiles
CREATE POLICY "Organization staff can view attorney profiles"
  ON attorney_matching_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = attorney_matching_profiles.organization_id
    )
  );

CREATE POLICY "Organization staff can manage attorney profiles"
  ON attorney_matching_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = attorney_matching_profiles.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = attorney_matching_profiles.organization_id
    )
  );

-- RLS Policies for case_matches
CREATE POLICY "Organization staff can view matches"
  ON case_matches FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matches.organization_id
    )
  );

CREATE POLICY "Organization staff can manage matches"
  ON case_matches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matches.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = case_matches.organization_id
    )
  );

-- RLS Policies for match_feedback
CREATE POLICY "Organization staff can view feedback"
  ON match_feedback FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = match_feedback.organization_id
    )
  );

CREATE POLICY "Authenticated users can submit feedback"
  ON match_feedback FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for matching_algorithm_config
CREATE POLICY "Organization staff can view config"
  ON matching_algorithm_config FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = matching_algorithm_config.organization_id
    )
  );

CREATE POLICY "Organization admins can manage config"
  ON matching_algorithm_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = matching_algorithm_config.organization_id
      AND lso_staff.role IN ('admin', 'owner')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lso_staff
      WHERE lso_staff.user_id = auth.uid()
      AND lso_staff.organization_id = matching_algorithm_config.organization_id
      AND lso_staff.role IN ('admin', 'owner')
    )
  );

-- RLS Policies for matching_notifications
CREATE POLICY "Organization staff can view notifications"
  ON matching_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM case_matches cm
      JOIN lso_staff ON lso_staff.organization_id = cm.organization_id
      WHERE cm.id = matching_notifications.match_id
      AND lso_staff.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert notifications"
  ON matching_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_org ON case_matching_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_status ON case_matching_queue(matching_status);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_urgency ON case_matching_queue(urgency_level);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_case_type ON case_matching_queue(case_type);
CREATE INDEX IF NOT EXISTS idx_case_matching_queue_created ON case_matching_queue(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_attorney ON attorney_matching_profiles(attorney_id);
CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_org ON attorney_matching_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_attorney_matching_profiles_available ON attorney_matching_profiles(auto_match_enabled, next_available_date);

CREATE INDEX IF NOT EXISTS idx_case_matches_case ON case_matches(case_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_attorney ON case_matches(attorney_id);
CREATE INDEX IF NOT EXISTS idx_case_matches_status ON case_matches(status);
CREATE INDEX IF NOT EXISTS idx_case_matches_org ON case_matches(organization_id);

CREATE INDEX IF NOT EXISTS idx_match_feedback_match ON match_feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_matching_notifications_match ON matching_notifications(match_id);

-- Function to calculate match confidence score
CREATE OR REPLACE FUNCTION calculate_match_score(
  p_case_id uuid,
  p_attorney_profile_id uuid,
  p_org_id uuid
) RETURNS TABLE (
  overall_score integer,
  expertise_score integer,
  availability_score integer,
  geographic_score integer,
  workload_score integer,
  language_score integer,
  factors jsonb
) AS $$
DECLARE
  v_config matching_algorithm_config%ROWTYPE;
  v_case case_matching_queue%ROWTYPE;
  v_profile attorney_matching_profiles%ROWTYPE;
  v_expertise_score integer := 50;
  v_availability_score integer := 50;
  v_geographic_score integer := 50;
  v_workload_score integer := 50;
  v_language_score integer := 50;
  v_factors jsonb := '{}';
BEGIN
  -- Get configuration
  SELECT * INTO v_config FROM matching_algorithm_config WHERE organization_id = p_org_id AND is_active = true;
  IF v_config IS NULL THEN
    v_config.expertise_weight := 35;
    v_config.availability_weight := 25;
    v_config.geographic_weight := 15;
    v_config.workload_weight := 15;
    v_config.language_weight := 10;
  END IF;

  -- Get case details
  SELECT * INTO v_case FROM case_matching_queue WHERE id = p_case_id;
  
  -- Get attorney profile
  SELECT * INTO v_profile FROM attorney_matching_profiles WHERE id = p_attorney_profile_id;

  -- Calculate expertise score
  IF v_profile.expertise_scores ? v_case.case_type THEN
    v_expertise_score := (v_profile.expertise_scores->v_case.case_type)::integer;
  END IF;
  v_factors := v_factors || jsonb_build_object('expertise', jsonb_build_object('score', v_expertise_score, 'case_type', v_case.case_type));

  -- Calculate availability score
  IF v_profile.current_case_count < v_profile.max_case_capacity THEN
    v_availability_score := 100 - ((v_profile.current_case_count::numeric / v_profile.max_case_capacity::numeric) * 100)::integer;
  ELSE
    v_availability_score := 0;
  END IF;
  v_factors := v_factors || jsonb_build_object('availability', jsonb_build_object('score', v_availability_score, 'current_cases', v_profile.current_case_count, 'max_capacity', v_profile.max_case_capacity));

  -- Calculate geographic score
  IF v_case.client_county = ANY(v_profile.preferred_counties) THEN
    v_geographic_score := 100;
  ELSIF v_profile.accepts_virtual_cases THEN
    v_geographic_score := 70;
  ELSE
    v_geographic_score := 30;
  END IF;
  v_factors := v_factors || jsonb_build_object('geographic', jsonb_build_object('score', v_geographic_score, 'client_county', v_case.client_county));

  -- Calculate workload score
  IF v_case.complexity_score BETWEEN v_profile.preferred_complexity_min AND v_profile.preferred_complexity_max THEN
    v_workload_score := 100;
  ELSE
    v_workload_score := 50;
  END IF;
  v_factors := v_factors || jsonb_build_object('workload', jsonb_build_object('score', v_workload_score, 'case_complexity', v_case.complexity_score));

  -- Calculate language score
  IF v_case.preferred_language = ANY(v_profile.languages) THEN
    v_language_score := 100;
  ELSE
    v_language_score := 30;
  END IF;
  v_factors := v_factors || jsonb_build_object('language', jsonb_build_object('score', v_language_score, 'required', v_case.preferred_language));

  -- Calculate overall weighted score
  overall_score := (
    (v_expertise_score * v_config.expertise_weight +
     v_availability_score * v_config.availability_weight +
     v_geographic_score * v_config.geographic_weight +
     v_workload_score * v_config.workload_weight +
     v_language_score * v_config.language_weight) / 100
  )::integer;

  expertise_score := v_expertise_score;
  availability_score := v_availability_score;
  geographic_score := v_geographic_score;
  workload_score := v_workload_score;
  language_score := v_language_score;
  factors := v_factors;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to run AI matching for a case
CREATE OR REPLACE FUNCTION run_case_matching(
  p_case_id uuid
) RETURNS TABLE (
  match_id uuid,
  attorney_id uuid,
  attorney_name text,
  confidence_score integer,
  rank_position integer
) AS $$
DECLARE
  v_case case_matching_queue%ROWTYPE;
  v_org_id uuid;
  v_match_record RECORD;
  v_rank integer := 0;
  v_config matching_algorithm_config%ROWTYPE;
BEGIN
  -- Get case details
  SELECT * INTO v_case FROM case_matching_queue WHERE id = p_case_id;
  IF v_case IS NULL THEN
    RAISE EXCEPTION 'Case not found';
  END IF;
  
  v_org_id := v_case.organization_id;
  
  -- Get config
  SELECT * INTO v_config FROM matching_algorithm_config WHERE organization_id = v_org_id AND is_active = true;
  IF v_config IS NULL THEN
    v_config.max_matches_per_case := 3;
    v_config.minimum_confidence_threshold := 60;
  END IF;

  -- Update case status
  UPDATE case_matching_queue 
  SET matching_status = 'in_progress', 
      matching_attempts = matching_attempts + 1,
      last_matching_run = now()
  WHERE id = p_case_id;

  -- Find and create matches
  FOR v_match_record IN (
    SELECT 
      amp.id as profile_id,
      amp.attorney_id,
      lva.name as attorney_name,
      (SELECT overall_score FROM calculate_match_score(p_case_id, amp.id, v_org_id)) as score
    FROM attorney_matching_profiles amp
    JOIN lso_volunteer_attorneys lva ON lva.id = amp.attorney_id
    WHERE amp.organization_id = v_org_id
      AND amp.auto_match_enabled = true
      AND amp.current_case_count < amp.max_case_capacity
      AND (amp.on_leave_until IS NULL OR amp.on_leave_until < CURRENT_DATE)
      AND lva.is_active = true
      AND lva.availability_status = 'available'
    ORDER BY score DESC
    LIMIT v_config.max_matches_per_case
  ) LOOP
    v_rank := v_rank + 1;
    
    -- Skip if below threshold
    IF v_match_record.score < v_config.minimum_confidence_threshold THEN
      CONTINUE;
    END IF;
    
    -- Insert match record
    INSERT INTO case_matches (
      organization_id,
      case_id,
      attorney_id,
      attorney_profile_id,
      overall_confidence_score,
      rank_position,
      is_primary_match,
      status
    )
    SELECT 
      v_org_id,
      p_case_id,
      v_match_record.attorney_id,
      v_match_record.profile_id,
      v_match_record.score,
      v_rank,
      v_rank = 1,
      'proposed'
    RETURNING id INTO match_id;

    attorney_id := v_match_record.attorney_id;
    attorney_name := v_match_record.attorney_name;
    confidence_score := v_match_record.score;
    rank_position := v_rank;
    
    RETURN NEXT;
  END LOOP;

  -- Update case status based on matches found
  IF v_rank > 0 THEN
    UPDATE case_matching_queue SET matching_status = 'matched' WHERE id = p_case_id;
  ELSE
    UPDATE case_matching_queue SET matching_status = 'no_match' WHERE id = p_case_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept a match
CREATE OR REPLACE FUNCTION accept_case_match(
  p_match_id uuid,
  p_response text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_match case_matches%ROWTYPE;
BEGIN
  SELECT * INTO v_match FROM case_matches WHERE id = p_match_id;
  
  IF v_match IS NULL THEN
    RETURN false;
  END IF;

  -- Update the match
  UPDATE case_matches
  SET 
    status = 'accepted',
    attorney_response = p_response,
    attorney_response_at = now(),
    accepted_at = now(),
    updated_at = now()
  WHERE id = p_match_id;

  -- Decline other matches for this case
  UPDATE case_matches
  SET 
    status = 'cancelled',
    updated_at = now()
  WHERE case_id = v_match.case_id 
    AND id != p_match_id 
    AND status = 'proposed';

  -- Update the case
  UPDATE case_matching_queue
  SET 
    assigned_attorney_id = v_match.attorney_id,
    assigned_at = now(),
    matching_status = 'matched',
    updated_at = now()
  WHERE id = v_match.case_id;

  -- Update attorney profile
  UPDATE attorney_matching_profiles
  SET 
    current_case_count = current_case_count + 1,
    updated_at = now()
  WHERE attorney_id = v_match.attorney_id 
    AND organization_id = v_match.organization_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline a match
CREATE OR REPLACE FUNCTION decline_case_match(
  p_match_id uuid,
  p_reason text DEFAULT NULL
) RETURNS boolean AS $$
DECLARE
  v_match case_matches%ROWTYPE;
BEGIN
  SELECT * INTO v_match FROM case_matches WHERE id = p_match_id;
  
  IF v_match IS NULL THEN
    RETURN false;
  END IF;

  UPDATE case_matches
  SET 
    status = 'declined',
    attorney_response_at = now(),
    decline_reason = p_reason,
    updated_at = now()
  WHERE id = p_match_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
