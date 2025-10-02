import { ONE_DAY_MS, signGuestToken } from '@/lib/auth/guest';
import { migrateGuestDataToUser } from '@/lib/auth/guest-migrate';
import { audit } from '@/lib/observability/audit';
import { NextRequest } from 'next/server';
import { POST } from '../route';
jest.mock('@/lib/auth/guest-migrate', () => ({
  migrateGuestDataToUser: jest.fn().mockResolvedValue({ ok: true, updated: { bazi: 0, houses: 0, analyses: 0 } })
}));

process.env.GUEST_SESSION_SECRET = 'test-secret';

let mockCookieValue: string | undefined;
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => (mockCookieValue ? { name: 'guest_session_token', value: mockCookieValue } : undefined),
  }),
  headers: async () => ({ get: (k: string) => (k === 'x-user-id' ? 'user-1' : undefined) })
}));

describe('api/guest/merge success', () => {
  beforeEach(() => { mockCookieValue = undefined; audit.reset(); });

  it('accepts valid token and clears cookie', async () => {
    // 直接mock模块实现
    (migrateGuestDataToUser as unknown as jest.Mock) = jest.fn().mockResolvedValue({ ok: true, updated: { bazi: 0, houses: 0, analyses: 0 } });
    const now = Date.now();
    mockCookieValue = signGuestToken({ i: 'sid-3', iat: now, exp: now + ONE_DAY_MS });
    const res = await POST(new NextRequest('http://localhost:3000/api/guest/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'valid-token' })
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(audit.getMetric('guest_merge_success')).toBe(1);
  });
});


