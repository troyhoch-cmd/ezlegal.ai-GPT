import { describe, expect, it, vi } from 'vitest';
import { hasBackendConfiguration, unavailableBackendFetch } from '../../src/lib/backend-availability';

describe('unconfigured preview backend', () => {
  it('requires both nonempty connection settings', () => {
    expect(hasBackendConfiguration(undefined, undefined)).toBe(false);
    expect(hasBackendConfiguration('https://example.invalid', '')).toBe(false);
    expect(hasBackendConfiguration(' ', 'public-placeholder')).toBe(false);
    expect(hasBackendConfiguration('https://example.invalid', 'public-placeholder')).toBe(true);
  });

  it('returns an explicit service error without making a network request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const response = await unavailableBackendFetch();
      expect(response.status).toBe(503);
      expect(await response.json()).toMatchObject({ code: 'backend_unavailable' });
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
