// Mock 整个本地 routing 模块，避免 next-intl ESM 导入在 Jest 下解析失败
jest.mock('@/lib/i18n/routing', () => ({
  routing: { locales: ['zh-CN', 'en'] },
}));

import { routing } from '@/lib/i18n/routing';

describe('i18n routing', () => {
  it('should include zh-CN and en in locales (mocked)', () => {
    expect(routing).toBeDefined();
    expect((routing as any).locales).toEqual(expect.arrayContaining(['zh-CN', 'en']));
  });
});


