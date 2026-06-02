/*
  # Fix Function Search Path - Security

  This migration fixes the mutable search_path issue in the 
  `update_arizona_legal_sources_updated_at` function.

  ## Issue:
  Functions with mutable search_path can be exploited if an attacker can 
  manipulate the search_path to substitute malicious functions.

  ## Solution:
  Set an explicit, immutable search_path for the function.
*/

-- Drop and recreate the function with secure search_path
CREATE OR REPLACE FUNCTION public.update_arizona_legal_sources_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
