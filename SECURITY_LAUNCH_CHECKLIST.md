# Security Launch Checklist

**Status:** REQUIRES MANUAL CONFIRMATION before public launch  
**Last Updated:** 2026-06-16

---

## Supabase Auth Security (Manual Verification Required)

These settings must be confirmed in the Supabase Dashboard (Authentication > Settings):

- [ ] **Leaked password protection** enabled (Auth > Settings > Security)
- [ ] **Auth DB pooling** set to percentage mode (Project Settings > Database)
- [ ] **Email confirmation** disabled for MVP (Auth > Settings > Email)
- [ ] **Password minimum length** >= 6 characters
- [ ] **Rate limiting** configured for auth endpoints
- [ ] **Google OAuth provider** enabled (if using Google sign-in buttons)

## Row Level Security (Verified via Migrations)

- [x] All tables have RLS enabled
- [x] Policies use `auth.uid()` for ownership checks
- [x] No `USING (true)` policies on user data tables
- [x] `lead_captures` INSERT policy validates email format and field presence
- [x] Functions use `SECURITY INVOKER` (hardening phases applied)
- [x] Anonymous SELECT policies limited to public reference/content tables only

## Edge Functions

- [x] All edge functions include CORS headers
- [x] JWT verification enabled on authenticated endpoints
- [x] Service role key only used server-side

## Client-Side Security

- [x] Supabase anon key used (not service role) in client
- [x] No secrets in client bundle
- [x] Input sanitization on user-facing forms
- [x] XSS prevention via React JSX escaping

## Data Privacy

- [x] Consent recording on signup (`ai_processing` consent type)
- [x] CCPA/privacy policy accessible
- [x] Data export edge function deployed
- [x] Data deletion edge function deployed

## Deployment

- [ ] **HTTPS enforced** on production domain
- [ ] **CSP headers** configured in netlify.toml or hosting platform
- [ ] **Environment variables** set in production (not committed to repo)

---

## How to Verify Supabase Settings

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Settings**
3. Under **Security**, confirm "Leaked password protection" is ON
4. Navigate to **Project Settings > Database**
5. Confirm connection pooling mode is set to percentage
6. Mark items above as checked once confirmed

**Do not claim these are done unless manually verified in the Supabase Dashboard.**
