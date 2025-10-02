import { NextRequest } from 'next/server';
import { POST } from '../route';

jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
  headers: async () => ({ get: () => undefined })
}));

describe('api/guest/merge', () => {
  it('returns 400 when no guest cookie present', async () => {
    const res = await POST(new NextRequest('http://localhost:3000/api/guest/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'test-token' })
    }));
    expect(res.status).toBe(400);
  });
});


