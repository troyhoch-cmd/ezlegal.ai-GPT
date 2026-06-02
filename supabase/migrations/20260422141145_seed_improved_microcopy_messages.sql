/*
  # Seed improved microcopy for forms and auth errors

  1. Purpose
    - Upserts clearer, more helpful form-validation and auth-error strings into the existing form_validation_messages table.
    - Replaces raw backend errors (e.g. "Invalid login credentials") with friendly, actionable copy.
    - Provides bilingual (EN/ES) coverage across required, email, password, phone, zip, url, submit, and auth.* keys.

  2. Data changes
    - INSERT ... ON CONFLICT (rule_id) DO UPDATE on form_validation_messages for ~20 rule_ids.
    - No schema changes, no destructive operations.

  3. Security
    - form_validation_messages already has RLS; this migration is data only.
*/

INSERT INTO form_validation_messages (rule_id, message_en, message_es, tone) VALUES
  ('required', 'Please fill this in so we can continue.', 'Por favor completa esto para continuar.', 'helpful'),
  ('email.invalid', 'That email looks off. Try the format name@example.com.', 'Ese correo no parece valido. Usa el formato nombre@ejemplo.com.', 'helpful'),
  ('password.too_short', 'Use at least 8 characters so your account stays secure.', 'Usa al menos 8 caracteres para proteger tu cuenta.', 'helpful'),
  ('password.too_weak', 'Add a number or symbol to make your password stronger.', 'Agrega un numero o simbolo para que sea mas fuerte.', 'helpful'),
  ('password.mismatch', 'The two passwords don''t match yet. Retype them to confirm.', 'Las dos contrasenas no coinciden. Vuelve a escribirlas.', 'warning'),
  ('phone.invalid', 'Enter a 10-digit US phone number (e.g., 520-555-0199).', 'Ingresa un numero de telefono de EE. UU. de 10 digitos (ej., 520-555-0199).', 'helpful'),
  ('zip.invalid', 'Use a 5-digit ZIP code, like 85701.', 'Usa un codigo postal de 5 digitos, como 85701.', 'helpful'),
  ('url.invalid', 'Include the full link, starting with https://', 'Incluye el enlace completo, empezando con https://', 'helpful'),
  ('min_length', 'Add a few more details so we can help more accurately.', 'Agrega mas detalles para ayudarte con mas precision.', 'helpful'),
  ('max_length', 'You''ve reached the character limit. Trim a bit and try again.', 'Llegaste al limite de caracteres. Acorta un poco e intenta de nuevo.', 'warning'),
  ('submit.generic_error', 'Something didn''t go through. Check your connection and try again.', 'Algo no se envio. Revisa tu conexion e intenta de nuevo.', 'error'),
  ('submit.success', 'All set. We received your information.', 'Listo. Recibimos tu informacion.', 'helpful'),
  ('auth.invalid_credentials', 'That email and password don''t match an account. Check both and try again, or reset your password.', 'Ese correo y contrasena no coinciden. Revisa ambos o restablece tu contrasena.', 'error'),
  ('auth.email_in_use', 'An account with this email already exists. Try signing in instead.', 'Ya existe una cuenta con este correo. Intenta iniciar sesion.', 'warning'),
  ('auth.weak_password', 'Choose a password with at least 8 characters, including a number or symbol.', 'Elige una contrasena con al menos 8 caracteres, incluyendo un numero o simbolo.', 'helpful'),
  ('auth.rate_limited', 'Too many attempts. Please wait a minute before trying again.', 'Demasiados intentos. Espera un minuto antes de intentar de nuevo.', 'warning'),
  ('auth.email_not_confirmed', 'Confirm your email first. Check your inbox for the confirmation link.', 'Confirma tu correo primero. Revisa tu bandeja de entrada.', 'helpful'),
  ('auth.reset_sent', 'Check your email for a password reset link. It expires in one hour.', 'Revisa tu correo para el enlace de restablecimiento. Expira en una hora.', 'helpful'),
  ('auth.network_error', 'We couldn''t reach our servers. Check your connection and try again.', 'No pudimos conectar con el servidor. Revisa tu conexion e intenta de nuevo.', 'error'),
  ('auth.generic', 'We couldn''t complete that action. Please try again in a moment.', 'No pudimos completar esa accion. Intenta de nuevo en un momento.', 'error')
ON CONFLICT (rule_id) DO UPDATE SET
  message_en = EXCLUDED.message_en,
  message_es = EXCLUDED.message_es,
  tone = EXCLUDED.tone,
  updated_at = now();
