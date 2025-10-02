import { ONE_DAY_MS, signGuestToken } from '@/lib/auth/guest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// 为测试提供密钥
process.env.GUEST_SESSION_SECRET = 'test-secret';

// 简单 mock cookies()
let mockCookieValue: string | undefined;
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: (_name: string) => (mockCookieValue ? { name: 'guest_session_token', value: mockCookieValue } : undefined),
  })
}));

describe('api/guest/start renew', () => {
  beforeEach(() => {
    mockCookieValue = undefined;
  });

  it('renews when token expires within 6 hours', async () => {
    const now = Date.now();
    const payload = { i: 'sid-1', iat: now - ONE_DAY_MS, exp: now + 6 * 60 * 60 * 1000 - 1 };
    mockCookieValue = signGuestToken(payload);

    const res = await POST(new NextRequest('http://localhost:3000/api/guest/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.renewed).toBe(true);
    expect(json.session?.id).toBe('sid-1');
    expect(json.session?.expiresAt).toBeGreaterThan(payload.exp);
  });

  it('returns existing when not near expiry', async () => {
    const now = Date.now();
    const payload = { i: 'sid-2', iat: now - 1000, exp: now + 6 * 60 * 60 * 1000 + 10_000 };
    mockCookieValue = signGuestToken(payload);

    const res = await POST(new NextRequest('http://localhost:3000/api/guest/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.renewed).toBe(false);
    expect(json.session?.id).toBe('sid-2');
    expect(json.session?.expiresAt).toBe(payload.exp);
  });
});


