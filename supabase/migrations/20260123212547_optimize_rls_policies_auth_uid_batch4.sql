/*
  # Optimize RLS Policies - Batch 4 (Lawyer & Appointment Tables)

  This migration optimizes RLS policies for lawyer connections and appointment tables.

  ## Tables Updated:
  1. lawyer_connections - All policies
  2. lawyer_messages - All policies
  3. appointment_requests - All policies
  4. quote_requests - All policies
*/

-- lawyer_connections: Users can create connections
DROP POLICY IF EXISTS "Users can create connections" ON public.lawyer_connections;
CREATE POLICY "Users can create connections" ON public.lawyer_connections
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- lawyer_connections: Users can update their own connections
DROP POLICY IF EXISTS "Users can update their own connections" ON public.lawyer_connections;
CREATE POLICY "Users can update their own connections" ON public.lawyer_connections
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- lawyer_connections: Users can view their own connections
DROP POLICY IF EXISTS "Users can view their own connections" ON public.lawyer_connections;
CREATE POLICY "Users can view their own connections" ON public.lawyer_connections
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

-- lawyer_messages: Users can send messages to their connections
DROP POLICY IF EXISTS "Users can send messages to their connections" ON public.lawyer_messages;
CREATE POLICY "Users can send messages to their connections" ON public.lawyer_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- lawyer_messages: Users can update messages for their connections
DROP POLICY IF EXISTS "Users can update messages for their connections" ON public.lawyer_messages;
CREATE POLICY "Users can update messages for their connections" ON public.lawyer_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- lawyer_messages: Users can view messages for their connections
DROP POLICY IF EXISTS "Users can view messages for their connections" ON public.lawyer_messages;
CREATE POLICY "Users can view messages for their connections" ON public.lawyer_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = lawyer_messages.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- appointment_requests: Users can create appointment requests
DROP POLICY IF EXISTS "Users can create appointment requests" ON public.appointment_requests;
CREATE POLICY "Users can create appointment requests" ON public.appointment_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- appointment_requests: Users can update their own appointment requests
DROP POLICY IF EXISTS "Users can update their own appointment requests" ON public.appointment_requests;
CREATE POLICY "Users can update their own appointment requests" ON public.appointment_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- appointment_requests: Users can view their own appointment requests
DROP POLICY IF EXISTS "Users can view their own appointment requests" ON public.appointment_requests;
CREATE POLICY "Users can view their own appointment requests" ON public.appointment_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = appointment_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- quote_requests: Users can create quote requests
DROP POLICY IF EXISTS "Users can create quote requests" ON public.quote_requests;
CREATE POLICY "Users can create quote requests" ON public.quote_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- quote_requests: Users can update their own quote requests
DROP POLICY IF EXISTS "Users can update their own quote requests" ON public.quote_requests;
CREATE POLICY "Users can update their own quote requests" ON public.quote_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );

-- quote_requests: Users can view their own quote requests
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
CREATE POLICY "Users can view their own quote requests" ON public.quote_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lawyer_connections
      WHERE lawyer_connections.id = quote_requests.connection_id
      AND lawyer_connections.user_id = (select auth.uid())
    )
  );
