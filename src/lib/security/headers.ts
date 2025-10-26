import { NextResponse } from 'next/server';

/**
 * 安全响应头配置
 * 基于 OWASP 最佳实践
 */
export const securityHeaders = {
  // 防止点击劫持攻击
  'X-Frame-Options': 'DENY',
  
  // 防止 MIME 类型嗅探
  'X-Content-Type-Options': 'nosniff',
  
  // 启用浏览器 XSS 保护
  'X-XSS-Protection': '1; mode=block',
  
  // 强制 HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // 限制引用来源信息
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // 权限策略
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
  
  // 内容安全策略 (CSP)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.github.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

/**
 * 应用安全响应头到响应对象
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * 验证请求来源
 */
export function validateOrigin(request: Request, allowedOrigins?: string[]): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (!origin && !referer) {
    // 没有来源信息，可能是直接访问
    return true;
  }
  
  const requestOrigin = origin || new URL(referer!).origin;
  const defaultAllowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  
  const origins = allowedOrigins || defaultAllowedOrigins;
  return origins.includes(requestOrigin);
}

/**
 * 生成 CSP nonce
 */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}

/**
 * 获取带 nonce 的 CSP 头
 */
export function getCSPWithNonce(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://*.supabase.co`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.supabase.co https://avatars.githubusercontent.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.github.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}