/*
  # Create Conflict Checking System for White-Label Tenants

  This migration establishes a comprehensive conflict-of-interest checking system
  designed specifically for white-label law firm tenants using ezLegal.ai.

  ## Overview
  Law firms must prevent conflicts of interest when accepting new clients or matters.
  This system provides:
  - Client/matter registration with party information
  - Automated conflict checking against existing clients
  - Audit trail of all conflict checks performed
  - Tenant isolation ensuring data privacy between organizations

  ## New Tables

  1. `client_matters` - Stores client/matter information for conflict checking
     - `id` (uuid, primary key)
     - `tenant_id` (uuid) - The organization/law firm this belongs to
     - `matter_name` (text) - Name/description of the matter
     - `matter_number` (text) - Internal reference number
     - `client_name` (text) - Primary client name
     - `client_type` (text) - Individual, business, government, etc.
     - `adverse_parties` (jsonb) - Array of opposing parties
     - `related_parties` (jsonb) - Array of related/connected parties
     - `practice_area` (text) - Area of law
     - `status` (text) - Active, closed, prospective
     - `opened_date` (timestamptz)
     - `closed_date` (timestamptz)
     - `created_by` (uuid) - User who created the record
     - `created_at` / `updated_at` timestamps

  2. `conflict_checks` - Audit log of all conflict searches performed
     - `id` (uuid, primary key)
     - `tenant_id` (uuid) - Organization performing the check
     - `search_query` (text) - What was searched
     - `search_type` (text) - client_name, adverse_party, all_parties
     - `results_count` (integer) - Number of potential conflicts found
     - `results_data` (jsonb) - Detailed results
     - `status` (text) - clear, potential_conflict, conflict_confirmed
     - `reviewed_by` (uuid) - Attorney who reviewed
     - `reviewed_at` (timestamptz)
     - `notes` (text) - Review notes
     - `performed_by` (uuid)
     - `created_at` timestamp

  3. `conflict_waivers` - Documents conflict waivers when conflicts are waived
     - `id` (uuid, primary key)
     - `tenant_id` (uuid)
     - `conflict_check_id` (uuid) - Reference to the conflict check
     - `matter_id` (uuid) - The matter being opened despite conflict
     - `waiver_type` (text) - informed_consent, advance_waiver, etc.
     - `waiver_details` (text)
     - `client_consent_date` (timestamptz)
     - `supervising_attorney` (uuid)
     - `approved_at` (timestamptz)
     - `created_at` timestamp

  ## Security
  - RLS enabled on all tables
  - Policies restrict access to same-tenant users only
  - Audit logging for compliance requirements
*/

-- Create client_matters table
CREATE TABLE IF NOT EXISTS client_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  matter_name text NOT NULL,
  matter_number text,
  client_name text NOT NULL,
  client_type text NOT NULL DEFAULT 'individual',
  adverse_parties jsonb DEFAULT '[]'::jsonb,
  related_parties jsonb DEFAULT '[]'::jsonb,
  practice_area text,
  status text NOT NULL DEFAULT 'active',
  opened_date timestamptz DEFAULT now(),
  closed_date timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT client_matters_client_type_check CHECK (client_type IN ('individual', 'business', 'government', 'nonprofit', 'other')),
  CONSTRAINT client_matters_status_check CHECK (status IN ('prospective', 'active', 'closed', 'declined'))
);

-- Create indexes for efficient conflict searching
CREATE INDEX IF NOT EXISTS idx_client_matters_tenant ON client_matters(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_matters_client_name ON client_matters(tenant_id, lower(client_name));
CREATE INDEX IF NOT EXISTS idx_client_matters_matter_number ON client_matters(tenant_id, matter_number);
CREATE INDEX IF NOT EXISTS idx_client_matters_status ON client_matters(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_client_matters_adverse_parties ON client_matters USING gin(adverse_parties);
CREATE INDEX IF NOT EXISTS idx_client_matters_related_parties ON client_matters USING gin(related_parties);

-- Enable RLS
ALTER TABLE client_matters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_matters
CREATE POLICY "Users can view client matters in their tenant"
  ON client_matters FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert client matters in their tenant"
  ON client_matters FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update client matters in their tenant"
  ON client_matters FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Create conflict_checks audit table
CREATE TABLE IF NOT EXISTS conflict_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  search_query text NOT NULL,
  search_type text NOT NULL DEFAULT 'all_parties',
  results_count integer NOT NULL DEFAULT 0,
  results_data jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending_review',
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  review_notes text,
  performed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT conflict_checks_search_type_check CHECK (search_type IN ('client_name', 'adverse_party', 'related_party', 'all_parties')),
  CONSTRAINT conflict_checks_status_check CHECK (status IN ('pending_review', 'clear', 'potential_conflict', 'conflict_confirmed', 'waived'))
);

-- Indexes for conflict_checks
CREATE INDEX IF NOT EXISTS idx_conflict_checks_tenant ON conflict_checks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conflict_checks_status ON conflict_checks(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_conflict_checks_created ON conflict_checks(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conflict_checks_performed_by ON conflict_checks(performed_by);

-- Enable RLS
ALTER TABLE conflict_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conflict_checks
CREATE POLICY "Users can view conflict checks in their tenant"
  ON conflict_checks FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conflict checks in their tenant"
  ON conflict_checks FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update conflict checks in their tenant"
  ON conflict_checks FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Create conflict_waivers table
CREATE TABLE IF NOT EXISTS conflict_waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  conflict_check_id uuid REFERENCES conflict_checks(id),
  matter_id uuid REFERENCES client_matters(id),
  waiver_type text NOT NULL,
  waiver_details text,
  conflicting_matter_id uuid REFERENCES client_matters(id),
  client_consent_date timestamptz,
  supervising_attorney uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT conflict_waivers_type_check CHECK (waiver_type IN ('informed_consent', 'advance_waiver', 'former_client', 'screening'))
);

-- Indexes for conflict_waivers
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_tenant ON conflict_waivers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_check ON conflict_waivers(conflict_check_id);
CREATE INDEX IF NOT EXISTS idx_conflict_waivers_matter ON conflict_waivers(matter_id);

-- Enable RLS
ALTER TABLE conflict_waivers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conflict_waivers
CREATE POLICY "Users can view conflict waivers in their tenant"
  ON conflict_waivers FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conflict waivers in their tenant"
  ON conflict_waivers FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT (raw_app_meta_data->>'tenant_id')::uuid 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Function to perform conflict check (server-side for security)
CREATE OR REPLACE FUNCTION perform_conflict_check(
  p_tenant_id uuid,
  p_search_query text,
  p_search_type text DEFAULT 'all_parties'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_results jsonb;
  v_count integer;
  v_search_pattern text;
BEGIN
  v_search_pattern := '%' || lower(p_search_query) || '%';
  
  IF p_search_type = 'client_name' THEN
    SELECT jsonb_agg(jsonb_build_object(
      'matter_id', id,
      'matter_name', matter_name,
      'matter_number', matter_number,
      'client_name', client_name,
      'match_type', 'client_name',
      'status', status
    ))
    INTO v_results
    FROM client_matters
    WHERE tenant_id = p_tenant_id
      AND lower(client_name) LIKE v_search_pattern;
      
  ELSIF p_search_type = 'adverse_party' THEN
    SELECT jsonb_agg(jsonb_build_object(
      'matter_id', id,
      'matter_name', matter_name,
      'matter_number', matter_number,
      'client_name', client_name,
      'match_type', 'adverse_party',
      'matched_party', party,
      'status', status
    ))
    INTO v_results
    FROM client_matters,
         jsonb_array_elements_text(adverse_parties) AS party
    WHERE tenant_id = p_tenant_id
      AND lower(party) LIKE v_search_pattern;
      
  ELSE
    WITH all_matches AS (
      SELECT id, matter_name, matter_number, client_name, status,
             'client_name' as match_type,
             client_name as matched_party
      FROM client_matters
      WHERE tenant_id = p_tenant_id
        AND lower(client_name) LIKE v_search_pattern
      
      UNION ALL
      
      SELECT cm.id, cm.matter_name, cm.matter_number, cm.client_name, cm.status,
             'adverse_party' as match_type,
             party as matched_party
      FROM client_matters cm,
           jsonb_array_elements_text(cm.adverse_parties) AS party
      WHERE cm.tenant_id = p_tenant_id
        AND lower(party) LIKE v_search_pattern
        
      UNION ALL
      
      SELECT cm.id, cm.matter_name, cm.matter_number, cm.client_name, cm.status,
             'related_party' as match_type,
             party as matched_party
      FROM client_matters cm,
           jsonb_array_elements_text(cm.related_parties) AS party
      WHERE cm.tenant_id = p_tenant_id
        AND lower(party) LIKE v_search_pattern
    )
    SELECT jsonb_agg(jsonb_build_object(
      'matter_id', id,
      'matter_name', matter_name,
      'matter_number', matter_number,
      'client_name', client_name,
      'match_type', match_type,
      'matched_party', matched_party,
      'status', status
    ))
    INTO v_results
    FROM all_matches;
  END IF;
  
  IF v_results IS NULL THEN
    v_results := '[]'::jsonb;
  END IF;
  
  v_count := jsonb_array_length(v_results);
  
  INSERT INTO conflict_checks (
    tenant_id, search_query, search_type, results_count, results_data,
    status, performed_by
  ) VALUES (
    p_tenant_id, p_search_query, p_search_type, v_count, v_results,
    CASE WHEN v_count > 0 THEN 'potential_conflict' ELSE 'clear' END,
    auth.uid()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'results_count', v_count,
    'results', v_results,
    'status', CASE WHEN v_count > 0 THEN 'potential_conflict' ELSE 'clear' END
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION perform_conflict_check TO authenticated;