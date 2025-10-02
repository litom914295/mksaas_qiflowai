import { audit } from '@/lib/observability/audit';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Mock cookies 返回伪造token
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => ({ name: 'guest_session_token', value: 'x.y.z' }),
  }),
  headers: async () => ({ get: () => undefined })
}));

describe('api/guest/merge invalid signature', () => {
  beforeEach(() => audit.reset());
  it('rejects invalid signature token', async () => {
    const res = await POST(new NextRequest('http://localhost:3000/api/guest/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'invalid-token' })
    }));
    expect(res.status).toBe(401);
    expect(audit.getMetric('guest_merge_failed')).toBe(1);
  });
});


