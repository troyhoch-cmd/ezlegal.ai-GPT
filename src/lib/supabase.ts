import { createClient } from '@supabase/supabase-js';
import { hasBackendConfiguration, unavailableBackendFetch } from './backend-availability';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isBackendConfigured = hasBackendConfiguration(supabaseUrl, supabaseAnonKey);

// The SDK requires a URL and key even for public pages that never make requests.
// The reserved .invalid address cannot serve data, and the local transport below
// prevents requests entirely until the deployment has its real configuration.
export const supabase = createClient(
  isBackendConfigured ? supabaseUrl : 'https://backend-unavailable.invalid',
  isBackendConfigured ? supabaseAnonKey : 'unconfigured-preview',
  {
    ...(!isBackendConfigured ? { global: { fetch: unavailableBackendFetch } } : {}),
    auth: {
      flowType: 'pkce',
      autoRefreshToken: isBackendConfigured,
      persistSession: isBackendConfigured,
      detectSessionInUrl: isBackendConfigured,
    },
  },
);
