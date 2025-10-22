import crypto from 'crypto';
// @ts-ignore - limiter library
import { RateLimiter } from 'limiter';
import { type NextRequest, NextResponse } from 'next/server';

// WAF规则配置
const WAF_RULES = {
  // SQL注入检测模式
  sqlInjection: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/gi,
    /(--|\||;|\/\*|\*\/|xp_|sp_|0x)/gi,
    /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
    /(\bAND\b\s*\d+\s*=\s*\d+)/gi,
  ],

  // XSS攻击检测模式
  xss: [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]*onerror\s*=/gi,
  ],

  // 路径遍历检测
  pathTraversal: [/\.\.\//g, /\.\\/g, /%2e%2e/gi, /%252e%252e/gi],

  // 命令注入检测
  commandInjection: [
    /(\||;|&|`|\$\(|\))/g,
    /(\bcat\b|\bls\b|\brm\b|\bwget\b|\bcurl\b)/gi,
  ],

  // 敏感文件访问
  sensitiveFiles: [
    /\.(env|git|config|key|pem|sql|bak)$/i,
    /\/(admin|api\/admin|wp-admin|phpmyadmin)/i,
  ],
};

// IP黑名单（实际应从数据库读取）
const IP_BLACKLIST = new Set<string>();

// 速率限制器配置
const rateLimiters = new Map<string, RateLimiter>();

// 获取或创建速率限制器
function getRateLimiter(
  key: string,
  tokensPerInterval: number,
  interval: string
): RateLimiter {
  if (!rateLimiters.has(key)) {
    rateLimiters.set(key, new RateLimiter({ tokensPerInterval, interval }));
  }
  return rateLimiters.get(key)!;
}

// 获取客户端IP
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || real || 'unknown';
  return ip.trim();
}

// 生成请求指纹
function generateRequestFingerprint(request: NextRequest): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';

  const fingerprint = `${ip}-${userAgent}-${acceptLanguage}-${acceptEncoding}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
}

// WAF检测函数
function wafDetection(request: NextRequest): {
  blocked: boolean;
  reason?: string;
} {
  const url = request.url;
  const body = request.body;
  const params = request.nextUrl.searchParams.toString();
  const headers = Object.fromEntries(request.headers.entries());

  // 合并所有需要检查的内容
  const contentToCheck = `${url} ${params} ${JSON.stringify(headers)} ${body || ''}`;

  // SQL注入检测
  for (const pattern of WAF_RULES.sqlInjection) {
    if (pattern.test(contentToCheck)) {
      return { blocked: true, reason: 'SQL Injection attempt detected' };
    }
  }

  // XSS检测
  for (const pattern of WAF_RULES.xss) {
    if (pattern.test(contentToCheck)) {
      return { blocked: true, reason: 'XSS attempt detected' };
    }
  }

  // 路径遍历检测
  for (const pattern of WAF_RULES.pathTraversal) {
    if (pattern.test(url)) {
      return { blocked: true, reason: 'Path traversal attempt detected' };
    }
  }

  // 命令注入检测
  for (const pattern of WAF_RULES.commandInjection) {
    if (pattern.test(contentToCheck)) {
      return { blocked: true, reason: 'Command injection attempt detected' };
    }
  }

  // 敏感文件访问检测
  for (const pattern of WAF_RULES.sensitiveFiles) {
    if (pattern.test(url)) {
      return {
        blocked: true,
        reason: 'Sensitive file access attempt detected',
      };
    }
  }

  return { blocked: false };
}

// 安全审计日志
async function logSecurityEvent(
  request: NextRequest,
  eventType: string,
  details: any
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip: getClientIp(request),
    fingerprint: generateRequestFingerprint(request),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
    eventType,
    details,
  };

  // 实际应写入数据库或日志系统
  console.log('[SECURITY AUDIT]', JSON.stringify(logEntry));

  // 发送到监控系统
  if (process.env.MONITORING_ENABLED === 'true') {
    // await sendToMonitoring(logEntry)
  }
}

// 主安全中间件
export async function securityMiddleware(request: NextRequest) {
  const ip = getClientIp(request);
  const fingerprint = generateRequestFingerprint(request);

  // 1. IP黑名单检查
  if (IP_BLACKLIST.has(ip)) {
    await logSecurityEvent(request, 'BLOCKED_IP', { ip });
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 2. 速率限制
  const globalLimiter = getRateLimiter('global', 100, 'minute');
  const ipLimiter = getRateLimiter(`ip:${ip}`, 60, 'minute');
  const fingerprintLimiter = getRateLimiter(`fp:${fingerprint}`, 30, 'minute');

  if (
    !globalLimiter.tryRemoveTokens(1) ||
    !ipLimiter.tryRemoveTokens(1) ||
    !fingerprintLimiter.tryRemoveTokens(1)
  ) {
    await logSecurityEvent(request, 'RATE_LIMIT_EXCEEDED', { ip, fingerprint });
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': '60',
      },
    });
  }

  // 3. WAF检测
  const wafResult = wafDetection(request);
  if (wafResult.blocked) {
    await logSecurityEvent(request, 'WAF_BLOCKED', {
      ip,
      reason: wafResult.reason,
    });

    // 将恶意IP加入临时黑名单
    IP_BLACKLIST.add(ip);
    setTimeout(() => IP_BLACKLIST.delete(ip), 3600000); // 1小时后移除

    return new NextResponse('Bad Request', { status: 400 });
  }

  // 4. 增长系统特定的安全检查
  if (request.url.includes('/api/admin/growth')) {
    // 检查推荐码滥用
    if (request.url.includes('/referrals') && request.method === 'POST') {
      const referralLimiter = getRateLimiter(`referral:${ip}`, 10, 'day');
      if (!referralLimiter.tryRemoveTokens(1)) {
        await logSecurityEvent(request, 'REFERRAL_ABUSE', { ip });
        return new NextResponse('Referral limit exceeded', { status: 429 });
      }
    }

    // 检查积分操作
    if (request.url.includes('/credits') && request.method === 'POST') {
      const creditLimiter = getRateLimiter(`credit:${fingerprint}`, 20, 'hour');
      if (!creditLimiter.tryRemoveTokens(1)) {
        await logSecurityEvent(request, 'CREDIT_ABUSE', { ip, fingerprint });
        return new NextResponse('Credit operation limit exceeded', {
          status: 429,
        });
      }
    }
  }

  // 5. 添加安全响应头
  const response = NextResponse.next();

  // 安全响应头
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // CSP策略
  if (process.env.CSP_ENABLED === 'true') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https: blob:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' https://api.example.com; " +
        "frame-ancestors 'none';"
    );
  }

  // HSTS
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

// 导出安全工具函数
export const SecurityUtils = {
  getClientIp,
  generateRequestFingerprint,
  wafDetection,
  logSecurityEvent,

  // 加密函数
  encrypt(text: string, key: string): string {
    const cipher = crypto.createCipher('aes-256-gcm', key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  },

  // 解密函数
  decrypt(encrypted: string, key: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  },

  // 生成安全令牌
  generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  // 密码哈希
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  },

  // 验证密码
  async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    const [salt, hash] = hashedPassword.split(':');
    const verifyHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
      .toString('hex');
    return hash === verifyHash;
  },
};
