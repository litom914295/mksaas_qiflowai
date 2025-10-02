import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, locales } from './lib/i18n/config';

// Security configuration constants
const SECURITY_CONFIG = {
  // Rate limiting configuration (requests/minute)
  RATE_LIMIT: {
    WINDOW_MS: 60 * 1000, // 1 minute window
    MAX_REQUESTS: 200,    // Maximum requests
    MAX_IP_REQUESTS: 100, // Maximum requests per IP
  },
  // Malicious pattern detection
  MALICIOUS_PATTERNS: [
    /\.\.[\/\\]/g,           // Path traversal ../
    /%2e%2e[\/\\]/gi,        // URL encoded path traversal
    /\%00/g,                 // Null byte injection
    /<script[^>]*>/gi,       // XSS script tags
    /javascript:/gi,         // JavaScript protocol
    /vbscript:/gi,           // VBScript protocol
    /data:/gi,               // Data protocol
    /eval\s*\(/gi,           // eval function calls
    /expression\s*\(/gi,     // CSS expressions
  ],
  // Sensitive file path patterns
  SENSITIVE_PATHS: [
    /^\/\.env/i,             // Environment variable files
    /^\/\.git/i,             // Git repository files
    /^\/node_modules/i,      // Node modules directory
    /^\/\.next/i,            // Next.js build directory
    /^\/\.vercel/i,          // Vercel configuration
    /^\/package\.json$/i,    // Package configuration file
    /^\/package-lock\.json$/i, // Package lock file
    /^\/yarn\.lock$/i,       // Yarn lock file
    /^\/tsconfig\.json$/i,   // TypeScript configuration
    /^\/next\.config/i,      // Next.js configuration
    /^\/database\//i,        // Database files
    /^\/backup/i,            // Backup files
    /^\/log[s]?\//i,         // Log files
    /^\/admin/i,             // Admin panel (adjust if needed)
    /\.sql$/i,               // SQL files
    /\.bak$/i,               // Backup files
    /\.log$/i,               // Log files
    /\.key$/i,               // Key files
    /\.pem$/i,               // Certificate files
  ],
  // IP whitelist (configure as needed)
  IP_WHITELIST: [
    // '127.0.0.1',
    // '::1',
  ],
  // IP blacklist (configure as needed)
  IP_BLACKLIST: [
    // '192.168.1.100',
  ],
};

// In-memory rate limiting data storage
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * 检查请求是否超出频率限制
   * @param key 限制键 (通常是IP地址)
   * @returns 是否允许请求
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.requests.get(key);

    if (!record || now > record.resetTime) {
      // 新窗口或过期记录，重置计数
      this.requests.set(key, {
        count: 1,
        resetTime: now + SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS,
      });
      return true;
    }

    if (record.count >= SECURITY_CONFIG.RATE_LIMIT.MAX_IP_REQUESTS) {
      return false;
    }

    record.count++;
    return true;
  }

  /**
   * 清理过期的记录
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.requests.forEach((record, key) => {
      if (now > record.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => {
      this.requests.delete(key);
    });
  }
}

// 全局速率限制器实例
const rateLimiter = new RateLimiter();

// 定期清理过期记录
setInterval(() => {
  rateLimiter.cleanup();
}, SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS);

/**
 * 获取客户端IP地址
 * @param req NextRequest对象
 * @returns IP地址字符串
 */
function getClientIP(req: NextRequest): string {
  // 按优先级检查各种IP头部
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // 获取连接IP (Vercel/Netlify等平台)
  const remoteAddr = req.headers.get('x-vercel-forwarded-for') || 
                     req.headers.get('x-forwarded-for');

  return remoteAddr || 'unknown';
}

/**
 * 检查路径是否包含恶意模式
 * @param path 请求路径
 * @returns 是否包含恶意模式
 */
function containsMaliciousPatterns(path: string): boolean {
  const decodedPath = decodeURIComponent(path);
  
  return SECURITY_CONFIG.MALICIOUS_PATTERNS.some(pattern => 
    pattern.test(path) || pattern.test(decodedPath)
  );
}

/**
 * 检查是否访问敏感文件路径
 * @param path 请求路径
 * @returns 是否为敏感路径
 */
function isSensitivePath(path: string): boolean {
  return SECURITY_CONFIG.SENSITIVE_PATHS.some(pattern => 
    pattern.test(path)
  );
}

/**
 * 检查IP是否在白名单中
 * @param ip IP地址
 * @returns 是否在白名单中
 */
function isIPWhitelisted(ip: string): boolean {
  const list: readonly string[] = SECURITY_CONFIG.IP_WHITELIST as unknown as readonly string[];
  return list.length === 0 || list.includes(ip);
}

/**
 * 检查IP是否在黑名单中
 * @param ip IP地址
 * @returns 是否在黑名单中
 */
function isIPBlacklisted(ip: string): boolean {
  const list: readonly string[] = SECURITY_CONFIG.IP_BLACKLIST as unknown as readonly string[];
  return list.includes(ip);
}

/**
 * 创建带有安全头部的响应
 * @param response NextResponse对象
 * @returns 设置了安全头部的响应
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy - 根据项目需求调整
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');

  // 设置安全响应头
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=*');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Ensure responses vary by language for correct CDN/browser caching per locale
  const existingVary = response.headers.get('Vary') || '';
  const varyTokens = existingVary
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!varyTokens.includes('Accept-Language')) {
    varyTokens.push('Accept-Language');
  }
  if (varyTokens.length > 0) {
    response.headers.set('Vary', varyTokens.join(', '));
  }

  return response;
}

/**
 * 创建安全错误响应
 * @param status HTTP状态码
 * @param message 错误消息
 * @returns 错误响应
 */
function createSecurityErrorResponse(status: number, message: string): NextResponse {
  const response = new NextResponse(
    JSON.stringify({
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return addSecurityHeaders(response);
}

/**
 * 强制HTTPS重定向 (仅在生产环境)
 * @param req NextRequest对象
 * @returns 重定向响应或null
 */
function enforceHTTPS(req: NextRequest): NextResponse | null {
  // 仅在生产环境强制HTTPS
  if (process.env.NODE_ENV === 'production') {
    const proto = req.headers.get('x-forwarded-proto');
    const host = req.headers.get('host');
    
    if (proto === 'http' && host) {
      const httpsUrl = `https://${host}${req.nextUrl.pathname}${req.nextUrl.search}`;
      return NextResponse.redirect(httpsUrl, 301);
    }
  }
  
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const fullPath = pathname + search;
  const clientIP = getClientIP(req);

  try {
    // 1. HTTPS强制重定向检查
    const httpsRedirect = enforceHTTPS(req);
    if (httpsRedirect) {
      return addSecurityHeaders(httpsRedirect);
    }

    // 2. IP黑名单检查
    if (isIPBlacklisted(clientIP)) {
      console.warn(`[Security] Blocked blacklisted IP: ${clientIP}`);
      return createSecurityErrorResponse(403, 'Access denied');
    }

    // 3. IP白名单检查 (如果配置了白名单)
    if (!isIPWhitelisted(clientIP)) {
      console.warn(`[Security] Blocked non-whitelisted IP: ${clientIP}`);
      return createSecurityErrorResponse(403, 'Access denied');
    }

    // 4. 频率限制检查
    if (!rateLimiter.isAllowed(clientIP)) {
      console.warn(`[Security] Rate limit exceeded for IP: ${clientIP}`);
      return createSecurityErrorResponse(429, 'Too many requests');
    }

    // 5. 路径遍历攻击检测
    if (containsMaliciousPatterns(fullPath)) {
      console.warn(`[Security] Malicious pattern detected in path: ${fullPath} from IP: ${clientIP}`);
      return createSecurityErrorResponse(400, 'Invalid request');
    }

    // 6. 敏感文件访问检查
    if (isSensitivePath(pathname)) {
      console.warn(`[Security] Sensitive path access attempt: ${pathname} from IP: ${clientIP}`);
      return createSecurityErrorResponse(404, 'Not found');
    }

    // 7. 请求头部安全检查
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    
    // 检查可疑的User-Agent
    if (userAgent.length > 1000 || containsMaliciousPatterns(userAgent)) {
      console.warn(`[Security] Suspicious User-Agent: ${userAgent.substring(0, 100)}... from IP: ${clientIP}`);
      return createSecurityErrorResponse(400, 'Invalid request');
    }

    // 检查可疑的Referer
    if (referer && containsMaliciousPatterns(referer)) {
      console.warn(`[Security] Suspicious Referer: ${referer} from IP: ${clientIP}`);
      return createSecurityErrorResponse(400, 'Invalid request');
    }

    // 8. 跳过无需国际化处理的路径
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/_vercel') ||
      pathname === '/favicon.ico' ||
      pathname === '/icon' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // 9. 国际化路由处理
    const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
      const response = NextResponse.next();
      return addSecurityHeaders(response);
    }

    // 10. 重定向到默认语言版本
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname}`;
    const response = NextResponse.redirect(url);
    return addSecurityHeaders(response);

  } catch (error) {
    // 异常处理 - 记录错误但不暴露敏感信息
    console.error(`[Security] Middleware error: ${error} for IP: ${clientIP}, Path: ${pathname}`);
    return createSecurityErrorResponse(500, 'Internal server error');
  }
}

export const config = {
  matcher: [
    // 匹配所有路径，除了以下路径：
    '/((?!api|_next/static|_next/image|favicon.ico|icon|robots.txt|sitemap.xml|.*\\..*|_vercel).*)',
  ],
};
