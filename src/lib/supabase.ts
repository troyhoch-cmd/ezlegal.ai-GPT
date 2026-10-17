import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isBackendConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let client: SupabaseClient | undefined;

// Public pages must render even when the preview has no backend configuration.
// Initialize on use so existing request error handlers can handle unavailability.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    if (!client) {
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Account and data services are currently unavailable. Please try again later.');
      }
      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
    }

    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
