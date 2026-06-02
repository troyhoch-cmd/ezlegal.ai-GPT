/*
  # Optimize RLS Policies - Batch 2 (Matters Tables) - Fixed

  This migration optimizes RLS policies for matters and matter-related tables.
  Uses `removed_at IS NULL` instead of `is_active = true` for active participants.

  ## Tables Updated:
  1. matters - All CRUD policies
  2. matter_participants - All CRUD policies
  3. matter_documents - All CRUD policies
  4. matter_activity_timeline - All policies
*/

-- matters: Users can create own matters
DROP POLICY IF EXISTS "Users can create own matters" ON public.matters;
CREATE POLICY "Users can create own matters" ON public.matters
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- matters: Users can delete own matters
DROP POLICY IF EXISTS "Users can delete own matters" ON public.matters;
CREATE POLICY "Users can delete own matters" ON public.matters
  FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- matters: Users can update own matters
DROP POLICY IF EXISTS "Users can update own matters" ON public.matters;
CREATE POLICY "Users can update own matters" ON public.matters
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- matters: Users can view own or participating matters
DROP POLICY IF EXISTS "Users can view own or participating matters" ON public.matters;
CREATE POLICY "Users can view own or participating matters" ON public.matters
  FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.matter_participants
      WHERE matter_participants.matter_id = matters.id
      AND matter_participants.user_id = (select auth.uid())
      AND matter_participants.removed_at IS NULL
    )
  );

-- matter_participants: Matter owners can add participants
DROP POLICY IF EXISTS "Matter owners can add participants" ON public.matter_participants;
CREATE POLICY "Matter owners can add participants" ON public.matter_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_participants: Matter owners can remove participants
DROP POLICY IF EXISTS "Matter owners can remove participants" ON public.matter_participants;
CREATE POLICY "Matter owners can remove participants" ON public.matter_participants
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_participants: Matter owners can update participants
DROP POLICY IF EXISTS "Matter owners can update participants" ON public.matter_participants;
CREATE POLICY "Matter owners can update participants" ON public.matter_participants
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_participants: Users can view matter participants
DROP POLICY IF EXISTS "Users can view matter participants" ON public.matter_participants;
CREATE POLICY "Users can view matter participants" ON public.matter_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_participants.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_documents: Users can add documents to matters
DROP POLICY IF EXISTS "Users can add documents to matters" ON public.matter_documents;
CREATE POLICY "Users can add documents to matters" ON public.matter_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_documents: Users can remove matter documents
DROP POLICY IF EXISTS "Users can remove matter documents" ON public.matter_documents;
CREATE POLICY "Users can remove matter documents" ON public.matter_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND matters.user_id = (select auth.uid())
    )
  );

-- matter_documents: Users can update matter documents
DROP POLICY IF EXISTS "Users can update matter documents" ON public.matter_documents;
CREATE POLICY "Users can update matter documents" ON public.matter_documents
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_documents: Users can view matter documents
DROP POLICY IF EXISTS "Users can view matter documents" ON public.matter_documents;
CREATE POLICY "Users can view matter documents" ON public.matter_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_documents.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_activity_timeline: Users can log matter activity
DROP POLICY IF EXISTS "Users can log matter activity" ON public.matter_activity_timeline;
CREATE POLICY "Users can log matter activity" ON public.matter_activity_timeline
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_activity_timeline.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );

-- matter_activity_timeline: Users can view matter activity
DROP POLICY IF EXISTS "Users can view matter activity" ON public.matter_activity_timeline;
CREATE POLICY "Users can view matter activity" ON public.matter_activity_timeline
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matters
      WHERE matters.id = matter_activity_timeline.matter_id
      AND (
        matters.user_id = (select auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.matter_participants mp
          WHERE mp.matter_id = matters.id
          AND mp.user_id = (select auth.uid())
          AND mp.removed_at IS NULL
        )
      )
    )
  );
