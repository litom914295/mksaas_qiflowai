import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, expect, vi } from 'vitest';

// MSW 设置
let server: any;

// 动态导入 MSW（仅在需要时）
beforeAll(async () => {
  if (typeof window === 'undefined') {
    // Node 环境下设置 MSW
    try {
      const { setupServer } = await import('msw/node');
      const { handlers } = await import('./mocks/handlers').catch(() => ({ handlers: [] }));
      
      if (handlers.length > 0) {
        server = setupServer(...handlers);
        server.listen({ onUnhandledRequest: 'warn' });
      }
    } catch (error) {
      // MSW 未安装或 handlers 文件不存在，跳过
      console.log('MSW not configured, skipping server setup');
    }
  }
});

// 每个测试后重置处理器
afterEach(() => {
  cleanup();
  if (server) {
    server.resetHandlers();
  }
  vi.clearAllMocks();
});

// 关闭 MSW 服务器
afterAll(() => {
  if (server) {
    server.close();
  }
});

// Mock Next.js 路由
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
    forward: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
    basePath: '',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => []),
  }),
  headers: () => new Headers(),
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'zh-CN',
  useMessages: () => ({}),
  useFormatter: () => ({
    dateTime: vi.fn((date) => date.toString()),
    number: vi.fn((num) => num.toString()),
    relativeTime: vi.fn(() => 'just now'),
  }),
}));

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
  getLocale: async () => 'zh-CN',
  getMessages: async () => ({}),
}));

// Mock 环境变量
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

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
