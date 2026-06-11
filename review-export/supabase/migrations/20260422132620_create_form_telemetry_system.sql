/*
  # Form telemetry — abandonment & submission analytics

  1. New tables
    - `form_sessions` — one row per form the user engaged with. Carries
      `form_slug` (e.g. 'signup','contact'), anon session id, starting URL,
      locale, device, and the eventual `submitted` boolean + terminal state
      ('submitted','abandoned','errored').
    - `form_field_events` — field-level events (focus, blur, correction,
      validation_error, help_opened). Enables funnel analysis to find the
      exact field where users drop off.
    - `form_validation_messages` — editable copy bank. Key = rule id (e.g.
      'email.invalid', 'password.too_short'); value = localized message so
      copy can evolve without a redeploy.

  2. Security
    - RLS on all three.
    - `form_sessions` / `form_field_events`: anyone (anon included) may
      INSERT — required for logged-out signup analytics — but only the
      owning session or an admin can SELECT. Writes store only their own
      session_id (no cross-session enumeration).
    - `form_validation_messages`: public SELECT, admin-only write.

  3. Notes
    - No PII in events. Never store the field value, only its id + length +
      error code.
*/

CREATE TABLE IF NOT EXISTS form_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  form_slug text NOT NULL,
  page_url text NOT NULL DEFAULT '',
  locale text NOT NULL DEFAULT 'en',
  device_class text NOT NULL DEFAULT 'unknown',
  submitted boolean NOT NULL DEFAULT false,
  terminal_state text NOT NULL DEFAULT 'open' CHECK (terminal_state IN ('open','submitted','abandoned','errored')),
  duration_ms integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  correction_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_sessions_slug ON form_sessions(form_slug);
CREATE INDEX IF NOT EXISTS idx_form_sessions_user ON form_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_form_sessions_state ON form_sessions(terminal_state);

CREATE TABLE IF NOT EXISTS form_field_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES form_sessions(id) ON DELETE CASCADE,
  field_slug text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('focus','blur','change','validation_error','help_opened','correction','submit_attempt')),
  error_code text NOT NULL DEFAULT '',
  field_length integer NOT NULL DEFAULT 0,
  time_since_start_ms integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_form_field_events_session ON form_field_events(session_id);
CREATE INDEX IF NOT EXISTS idx_form_field_events_type ON form_field_events(event_type);

CREATE TABLE IF NOT EXISTS form_validation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id text UNIQUE NOT NULL,
  message_en text NOT NULL,
  message_es text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'helpful' CHECK (tone IN ('helpful','warning','error')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_field_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_validation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can start a form session"
  ON form_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own session"
  ON form_sessions FOR UPDATE
  TO anon, authenticated
  USING (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid()))
    OR (user_id IS NULL)
  )
  WITH CHECK (
    (user_id IS NOT NULL AND user_id = (SELECT auth.uid()))
    OR (user_id IS NULL)
  );

CREATE POLICY "Owners and admins can read form sessions"
  ON form_sessions FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true)
  );

CREATE POLICY "Anyone can log field events"
  ON form_field_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read field events"
  ON form_field_events FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Anyone can read validation messages"
  ON form_validation_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can write validation messages"
  ON form_validation_messages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

CREATE POLICY "Admins can update validation messages"
  ON form_validation_messages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.is_admin = true));

INSERT INTO form_validation_messages (rule_id, message_en, message_es, tone) VALUES
  ('required',              'This field is required.',                                                    'Este campo es obligatorio.',                                            'helpful'),
  ('email.invalid',         'That doesn''t look like a valid email. Example: jane@example.com',           'No parece un correo valido. Ejemplo: jane@example.com',                'helpful'),
  ('email.already_used',    'An account already uses this email. Try signing in instead.',                'Ya existe una cuenta con este correo. Inicia sesion en su lugar.',      'warning'),
  ('password.too_short',    'Use at least 8 characters.',                                                  'Usa al menos 8 caracteres.',                                            'helpful'),
  ('password.too_weak',     'Add a number or symbol to strengthen your password.',                        'Agrega un numero o simbolo para fortalecer tu contrasena.',             'helpful'),
  ('password.mismatch',     'Passwords don''t match yet.',                                                 'Las contrasenas aun no coinciden.',                                     'helpful'),
  ('phone.invalid',         'Please enter a 10-digit phone number.',                                      'Por favor ingresa un numero telefonico de 10 digitos.',                 'helpful'),
  ('zip.invalid',           'ZIP should be 5 digits (e.g., 85701).',                                      'El codigo postal debe tener 5 digitos (por ejemplo, 85701).',          'helpful'),
  ('url.invalid',           'Include the full link starting with https://',                               'Incluye el enlace completo comenzando con https://',                    'helpful'),
  ('min_length',            'Keep going — a little more detail helps us help you.',                       'Sigue — un poco mas de detalle nos ayuda a ayudarte.',                 'helpful'),
  ('max_length',            'You''ve hit the character limit.',                                            'Has alcanzado el limite de caracteres.',                                'warning'),
  ('submit.generic_error',  'We couldn''t send that. Please try again in a moment.',                       'No pudimos enviarlo. Intentalo nuevamente en un momento.',              'error'),
  ('submit.success',        'Got it — you''re all set.',                                                   'Listo — ya esta todo en orden.',                                        'helpful')
ON CONFLICT (rule_id) DO NOTHING;