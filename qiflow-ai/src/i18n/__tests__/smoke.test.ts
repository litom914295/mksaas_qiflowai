import { describe, it, expect } from '@jest/globals';

describe('smoke', () => {
  it('i18n locale files should load zh-CN', async () => {
    const zh = await import('@/locales/zh-CN.json');
    expect(zh).toBeTruthy();
    expect(zh.default?.common?.loading).toBeDefined();
  });
});


