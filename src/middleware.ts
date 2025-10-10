import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// 使用 next-intl 的 middleware
export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，除了 API、_next 和静态文件
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
