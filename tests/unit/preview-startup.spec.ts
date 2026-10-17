import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('preview without backend settings', () => {
  it('loads public-page dependencies and navigation without backend credentials', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { supabase } = await import('../../src/lib/supabase');
    const { fetchNavigation } = await import('../../src/lib/navigation');

    expect((await fetchNavigation()).some(group => group.items.some(item => item.route === '/chat'))).toBe(true);
    expect(() => supabase.auth).toThrow('Account and data services are currently unavailable');
  });

  it('keeps the configured client methods usable', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://frontend-fixture.invalid');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'frontend-test-placeholder');

    const { supabase } = await import('../../src/lib/supabase');

    expect(supabase.auth).toBeDefined();
    expect(() => supabase.from('profiles').select('id')).not.toThrow();
  });
});
