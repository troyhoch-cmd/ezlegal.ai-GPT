/**
 * Client-Side Security Regression Tests
 *
 * Verifies that security helper functions fail closed by default.
 * Mocks Supabase client to test each security pathway.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
    })),
  },
}));

import { supabase } from '../src/lib/supabase';
import {
  requireAuthenticated,
  requirePartnerAccess,
  requireReferralOwnership,
  requireRequestOwnership,
} from '../src/lib/intake/security';

const mockGetUser = supabase.auth.getUser as ReturnType<typeof vi.fn>;

function mockSupabaseQuery(returnValue: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(returnValue);
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({ select });
  return { select, eq, maybeSingle };
}

describe('requireAuthenticated', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fails closed when no user session exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await requireAuthenticated();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_authenticated');
  });

  it('fails closed when getUser returns null user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('network') });
    const result = await requireAuthenticated();
    expect(result.ok).toBe(false);
  });

  it('succeeds with valid user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    const result = await requireAuthenticated();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.userId).toBe('user-123');
  });
});

describe('requirePartnerAccess', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fails closed when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await requirePartnerAccess();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_authenticated');
  });

  it('fails closed when no partner profile exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockSupabaseQuery({ data: null, error: null });
    const result = await requirePartnerAccess();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no_partner_profile');
  });

  it('fails closed on database error', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockSupabaseQuery({ data: null, error: new Error('db error') });
    const result = await requirePartnerAccess();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no_partner_profile');
  });

  it('succeeds when partner profile exists', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockSupabaseQuery({ data: { id: 'partner-456' }, error: null });
    const result = await requirePartnerAccess();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.userId).toBe('user-123');
      expect(result.partnerProfileId).toBe('partner-456');
    }
  });
});

describe('requireReferralOwnership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fails closed when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await requireReferralOwnership('ref-001');
    expect(result.ok).toBe(false);
  });

  it('fails closed when referral not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    const maybeSingleFirst = vi.fn().mockResolvedValue({ data: { id: 'partner-456' }, error: null });
    const maybeSingleSecond = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqFirst = vi.fn(() => ({ maybeSingle: maybeSingleFirst }));
    const eqSecond = vi.fn(() => ({ maybeSingle: maybeSingleSecond }));
    const selectFirst = vi.fn(() => ({ eq: eqFirst }));
    const selectSecond = vi.fn(() => ({ eq: eqSecond }));
    let callCount = 0;
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      return { select: callCount === 1 ? selectFirst : selectSecond };
    });

    const result = await requireReferralOwnership('ref-001');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('referral_not_found');
  });

  it('blocks mismatched referral ownership', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    const maybeSingleFirst = vi.fn().mockResolvedValue({ data: { id: 'partner-456' }, error: null });
    const maybeSingleSecond = vi.fn().mockResolvedValue({
      data: { id: 'ref-001', partner_profile_id: 'partner-OTHER' },
      error: null,
    });
    const eqFirst = vi.fn(() => ({ maybeSingle: maybeSingleFirst }));
    const eqSecond = vi.fn(() => ({ maybeSingle: maybeSingleSecond }));
    const selectFirst = vi.fn(() => ({ eq: eqFirst }));
    const selectSecond = vi.fn(() => ({ eq: eqSecond }));
    let callCount = 0;
    (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => {
      callCount++;
      return { select: callCount === 1 ? selectFirst : selectSecond };
    });

    const result = await requireReferralOwnership('ref-001');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('referral_not_assigned_to_partner');
  });
});

describe('requireRequestOwnership', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fails closed when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const result = await requireRequestOwnership('req-001');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_authenticated');
  });

  it('fails closed when request not found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockSupabaseQuery({ data: null, error: null });
    const result = await requireRequestOwnership('req-001');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('request_not_found');
  });

  it('fails closed when request belongs to different user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockSupabaseQuery({ data: { id: 'req-001', user_id: 'different-user' }, error: null });
    const result = await requireRequestOwnership('req-001');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('request_not_owned_by_user');
  });

  it('succeeds when user owns the request', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
    mockSupabaseQuery({ data: { id: 'req-001', user_id: 'user-123' }, error: null });
    const result = await requireRequestOwnership('req-001');
    expect(result.ok).toBe(true);
  });
});
