import { Routes } from '@/routes';
import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  createLocalizedRoutes,
  getLocalizedRoute,
  getLocalizedRouteFromRequest,
} from '../i18n-routes';

describe('i18n-routes', () => {
  describe('getLocalizedRoute', () => {
    it('应该为路由添加默认 locale 前缀 (zh-CN)', () => {
      const result = getLocalizedRoute(Routes.AIChat);
      expect(result).toBe('/zh-CN/ai/chat');
    });

    it('应该为路由添加指定的 locale 前缀', () => {
      expect(getLocalizedRoute(Routes.AIChat, 'zh-CN')).toBe('/zh-CN/ai/chat');
      expect(getLocalizedRoute(Routes.AIChat, 'en')).toBe('/en/ai/chat');
    });

    it('应该正确处理根路径', () => {
      expect(getLocalizedRoute(Routes.Root, 'zh-CN')).toBe('/zh-CN');
      expect(getLocalizedRoute(Routes.Root, 'en')).toBe('/en');
    });

    it('应该保持外部链接不变', () => {
      const url = getLocalizedRoute(Routes.Roadmap);
      expect(url).toBe('https://mksaas.link/roadmap');
    });

    it('应该保持锚点链接不变', () => {
      const url = getLocalizedRoute(Routes.FAQ);
      expect(url).toBe('/#faq');
    });

    it('应该保持已有 locale 前缀的路径不变', () => {
      const alreadyLocalized = '/zh-CN/dashboard' as Routes;
      const result = getLocalizedRoute(alreadyLocalized, 'en');
      expect(result).toBe('/zh-CN/dashboard');
    });

    it('应该正确处理多级路径', () => {
      expect(getLocalizedRoute(Routes.QiflowBazi, 'zh-CN')).toBe(
        '/zh-CN/analysis/bazi'
      );
      expect(getLocalizedRoute(Routes.SettingsProfile, 'en')).toBe(
        '/en/settings/profile'
      );
    });
  });

  describe('getLocalizedRouteFromRequest', () => {
    it('应该从 cookie 中检测 locale', () => {
      const request = new Request('https://example.com', {
        headers: {
          cookie: 'NEXT_LOCALE=en; other=value',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/en/ai/chat');
    });

    it('应该从 Accept-Language header 检测 locale (精确匹配)', () => {
      const request = new Request('https://example.com', {
        headers: {
          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      // en-US 不在支持的 locales 中，应该回退到 zh-CN
      expect(result).toBe('/zh-CN/ai/chat');
    });

    it('应该从 Accept-Language header 检测 locale (语言代码匹配)', () => {
      const request = new Request('https://example.com', {
        headers: {
          'accept-language': 'zh,en;q=0.9',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/zh-CN/ai/chat'); // zh 匹配到 zh-CN
    });

    it('应该优先使用 cookie 而不是 Accept-Language', () => {
      const request = new Request('https://example.com', {
        headers: {
          cookie: 'NEXT_LOCALE=en',
          'accept-language': 'zh-CN,zh;q=0.9',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/en/ai/chat');
    });

    it('应该回退到默认 locale (zh-CN)', () => {
      const request = new Request('https://example.com', {
        headers: {},
      });

      const result = getLocalizedRouteFromRequest(Routes.Dashboard, request);
      expect(result).toBe('/zh-CN/dashboard');
    });

    it('应该忽略不支持的 locale', () => {
      const request = new Request('https://example.com', {
        headers: {
          cookie: 'NEXT_LOCALE=fr', // 不支持的 locale
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/zh-CN/ai/chat'); // 回退到默认
    });

    it('应该正确处理外部链接', () => {
      const request = new Request('https://example.com', {
        headers: {
          cookie: 'NEXT_LOCALE=en',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.Roadmap, request);
      expect(result).toBe('https://mksaas.link/roadmap');
    });
  });

  describe('createLocalizedRoutes', () => {
    it('应该创建指定 locale 的所有路由', () => {
      const zhRoutes = createLocalizedRoutes('zh-CN');

      expect(zhRoutes.AIChat).toBe('/zh-CN/ai/chat');
      expect(zhRoutes.Dashboard).toBe('/zh-CN/dashboard');
      expect(zhRoutes.QiflowBazi).toBe('/zh-CN/analysis/bazi');
      expect(zhRoutes.SettingsProfile).toBe('/zh-CN/settings/profile');
    });

    it('应该使用默认 locale 创建路由', () => {
      const routes = createLocalizedRoutes();

      expect(routes.AIChat).toBe('/zh-CN/ai/chat');
      expect(routes.Dashboard).toBe('/zh-CN/dashboard');
    });

    it('应该支持不同的 locale', () => {
      const enRoutes = createLocalizedRoutes('en');

      expect(enRoutes.AIChat).toBe('/en/ai/chat');
      expect(enRoutes.Dashboard).toBe('/en/dashboard');
    });

    it('应该正确处理外部链接', () => {
      const routes = createLocalizedRoutes('zh-CN');
      expect(routes.Roadmap).toBe('https://mksaas.link/roadmap');
    });

    it('应该正确处理根路径', () => {
      const routes = createLocalizedRoutes('zh-CN');
      expect(routes.Root).toBe('/zh-CN');
    });

    it('应该返回 undefined 对于不存在的 key', () => {
      const routes = createLocalizedRoutes('zh-CN');
      // @ts-expect-error - 测试不存在的 key
      expect(routes.NonExistentRoute).toBeUndefined();
    });
  });

  describe('边界情况', () => {
    it('应该处理空 cookie 字符串', () => {
      const request = new Request('https://example.com', {
        headers: { cookie: '' },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/zh-CN/ai/chat');
    });

    it('应该处理格式错误的 cookie', () => {
      const request = new Request('https://example.com', {
        headers: { cookie: 'invalid-cookie-format' },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/zh-CN/ai/chat');
    });

    it('应该处理空 Accept-Language header', () => {
      const request = new Request('https://example.com', {
        headers: { 'accept-language': '' },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/zh-CN/ai/chat');
    });

    it('应该处理包含多个 NEXT_LOCALE cookie 的情况', () => {
      const request = new Request('https://example.com', {
        headers: {
          // 只应使用第一个
          cookie: 'NEXT_LOCALE=en; other=value; NEXT_LOCALE=zh-CN',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      expect(result).toBe('/en/ai/chat');
    });

    it('应该处理复杂的 Accept-Language header', () => {
      const request = new Request('https://example.com', {
        headers: {
          'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,ja;q=0.6',
        },
      });

      const result = getLocalizedRouteFromRequest(Routes.AIChat, request);
      // 应该找到第一个支持的 locale (zh-CN)
      expect(result).toBe('/zh-CN/ai/chat');
    });
  });

  describe('性能测试', () => {
    it('应该快速处理大量路由生成', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        getLocalizedRoute(Routes.AIChat, 'zh-CN');
        getLocalizedRoute(Routes.Dashboard, 'en');
      }

      const end = performance.now();
      const duration = end - start;

      // 1000次调用应该在100ms内完成
      expect(duration).toBeLessThan(100);
    });

    it('应该快速处理批量路由创建', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const routes = createLocalizedRoutes('zh-CN');
        routes.AIChat;
        routes.Dashboard;
        routes.QiflowBazi;
      }

      const end = performance.now();
      const duration = end - start;

      // 100次批量创建应该在50ms内完成
      expect(duration).toBeLessThan(50);
    });
  });

  describe('类型安全', () => {
    it('应该接受所有 Routes 枚举值', () => {
      // 这个测试主要验证 TypeScript 类型，如果编译通过就说明类型正确
      const testRoutes: Routes[] = [
        Routes.Root,
        Routes.Dashboard,
        Routes.AIChat,
        Routes.QiflowBazi,
        Routes.QiflowXuankong,
        Routes.Login,
        Routes.Register,
      ];

      testRoutes.forEach((route) => {
        const result = getLocalizedRoute(route, 'zh-CN');
        expect(typeof result).toBe('string');
      });
    });
  });
});
