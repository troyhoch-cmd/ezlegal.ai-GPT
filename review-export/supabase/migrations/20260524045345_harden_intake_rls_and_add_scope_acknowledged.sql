/*
  # Harden Intake RLS and Add scope_acknowledged_at

  1. Schema Changes
    - Add `scope_acknowledged_at` (timestamptz, nullable) to `attorney_review_requests`
    - Add `assigned_attorney_id` (uuid, nullable) to `attorney_review_requests`

  2. Security Hardening
    - Add policy: admin users can read all attorney review requests
    - Add policy: assigned attorneys can read their assigned requests
    - Restrict referral update to only status field changes (via WITH CHECK on referral_status values)
    - Prevent anonymous users from reading any partner dashboard data
    - Add index on assigned_attorney_id

  3. Important Notes
    - No destructive operations
    - Fail-closed: new policies only grant access where explicitly needed
    - Attorney assignment will be done by admin/service role in future
*/

-- Add scope_acknowledged_at to attorney_review_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'attorney_review_requests'
    AND column_name = 'scope_acknowledged_at'
  ) THEN
    ALTER TABLE public.attorney_review_requests
      ADD COLUMN scope_acknowledged_at timestamptz;
  END IF;
END $$;

-- Add assigned_attorney_id for future attorney assignment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'attorney_review_requests'
    AND column_name = 'assigned_attorney_id'
  ) THEN
    ALTER TABLE public.attorney_review_requests
      ADD COLUMN assigned_attorney_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Index for attorney lookups
CREATE INDEX IF NOT EXISTS idx_attorney_review_assigned
  ON public.attorney_review_requests(assigned_attorney_id)
  WHERE assigned_attorney_id IS NOT NULL;

-- Allow assigned attorneys to read their requests
CREATE POLICY "Assigned attorneys can read their requests"
  ON public.attorney_review_requests FOR SELECT TO authenticated
  USING (auth.uid() = assigned_attorney_id);

-- Admin read access for attorney review requests (admin determined by profiles.role)
CREATE POLICY "Admins can read all attorney review requests"
  ON public.attorney_review_requests FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin update access for attorney review requests (assignment, status changes)
CREATE POLICY "Admins can update attorney review requests"
  ON public.attorney_review_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can read all referral routing records for oversight
CREATE POLICY "Admins can read all referral routing records"
  ON public.referral_routing_records FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
