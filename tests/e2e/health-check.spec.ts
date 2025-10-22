import { expect, test } from '@playwright/test';

test('API Health Check', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.ok).toBeTruthy();
  expect(json.time).toBeDefined();
});
