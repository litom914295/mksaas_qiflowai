jest.mock('next/headers', () => ({
  cookies: async () => ({ get: () => undefined }),
}));

process.env.GUEST_SESSION_SECRET = process.env.GUEST_SESSION_SECRET || 'test-secret';

import { audit } from '@/lib/observability/audit';
import { NextRequest } from 'next/server';
import { POST } from '../route';

beforeEach(() => audit.reset());

describe('api/guest/start', () => {
  it('creates or renews guest session and sets signed cookie', async () => {
    jest.mock('next/headers', () => ({
      cookies: async () => ({
        get: () => undefined,
      })
    }));
    const res = await POST(new NextRequest('http://localhost:3000/api/guest/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.session?.id).toBeDefined();
    // metric incremented
    expect(audit.getMetric('guest_active_sessions')).toBeGreaterThanOrEqual(0);
  });
});


