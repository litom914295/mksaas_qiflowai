import { vi } from 'vitest';

// Mock Drizzle ORM 操作
export const mockDb = {
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([])),
      })),
      limit: vi.fn(() => Promise.resolve([])),
    })),
  })),

  insert: vi.fn(() => ({
    values: vi.fn(() => Promise.resolve()),
  })),

  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  })),

  delete: vi.fn(() => ({
    where: vi.fn(() => Promise.resolve()),
  })),

  transaction: vi.fn(async (callback) => {
    return await callback(mockDb);
  }),
};

// Mock getDb 函数
export const mockGetDb = vi.fn(() => Promise.resolve(mockDb));

// 设置测试环境
export function setupTestDb() {
  // Mock @/db 模块
  vi.mock('@/db', () => ({
    getDb: mockGetDb,
    closeDb: vi.fn(),
  }));

  // Mock @/db/schema
  vi.mock('@/db/schema', () => ({
    user: {
      id: 'id',
      email: 'email',
      name: 'name',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
    userCredit: {
      id: 'id',
      userId: 'userId',
      currentCredits: 'currentCredits',
      totalCredits: 'totalCredits',
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  }));

  return { mockDb, mockGetDb };
}
