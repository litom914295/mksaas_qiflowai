import { GET } from '../route';

describe('api/health', () => {
  it('returns 200 and health payload', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('healthy');
  });
});


