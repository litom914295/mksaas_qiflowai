import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

// 每个测试后自动清理
afterEach(() => {
  cleanup();
});

// Mock Next.js 路由
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh-CN',
}));

// Mock 环境变量
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

// 全局测试辅助函数
global.testHelpers = {
  // 模拟用户
  mockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides,
  }),

  // 模拟管理员
  mockAdmin: () => ({
    id: 'admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  }),

  // 延迟函数
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// 类型声明
declare global {
  var testHelpers: {
    mockUser: (overrides?: any) => any;
    mockAdmin: () => any;
    wait: (ms: number) => Promise<void>;
  };
}
