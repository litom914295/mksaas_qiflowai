import crypto from 'crypto';

// 游客会话相关的工具函数
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// 安全的JWT签名密钥获取
const getJWTSecret = (): string => {
  const secret = process.env.GUEST_SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('GUEST_SESSION_SECRET environment variable is required in production');
    }
    // 开发环境使用预定义的测试密钥（不安全，仅用于开发）
    const devSecret = 'dev-only-secret-key-do-not-use-in-production-' + Date.now();
    console.warn('[DEV ONLY] Using generated JWT secret. Set GUEST_SESSION_SECRET for production.');
    return devSecret;
  }
  if (secret.length < 32) {
    throw new Error('GUEST_SESSION_SECRET must be at least 32 characters long');
  }
  // 验证密钥不是明显的弱密钥
  const weakSecrets = ['secret', 'password', 'key', '123456', 'admin'];
  if (weakSecrets.some(weak => secret.toLowerCase().includes(weak))) {
    throw new Error('GUEST_SESSION_SECRET appears to be weak. Use a cryptographically secure random key.');
  }
  return secret;
};

const JWT_SECRET = getJWTSecret();

export function signGuestToken(payload: Record<string, unknown>): string {
  // 添加标准JWT声明
  const now = Math.floor(Date.now() / 1000);
  const enhancedPayload = {
    ...payload,
    iat: now, // issued at
    nbf: now, // not before
    iss: 'qiflow-ai', // issuer
    aud: 'qiflow-guest', // audience
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(enhancedPayload)).toString('base64url');
  
  // 生成HMAC签名
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyGuestToken(token: string): { valid: boolean; payload?: Record<string, unknown>; error?: string } {
  try {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Invalid token format' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid JWT structure' };
    }
    
    const [header, payload, signature] = parts;
    
    // 验证header
    try {
      const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString());
      if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') {
        return { valid: false, error: 'Invalid JWT header' };
      }
    } catch {
      return { valid: false, error: 'Invalid header encoding' };
    }
    
    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    // 使用时间安全的比较防止时序攻击
    if (!crypto.timingSafeEqual(
      Buffer.from(signature, 'base64url'),
      Buffer.from(expectedSignature, 'base64url')
    )) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // 解析载荷
    let decodedPayload: any;
    try {
      decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch {
      return { valid: false, error: 'Invalid payload encoding' };
    }
    
    // 验证时间声明
    const now = Math.floor(Date.now() / 1000);
    
    // 检查not before
    if (decodedPayload.nbf && now < decodedPayload.nbf) {
      return { valid: false, error: 'Token not yet valid' };
    }
    
    // 检查过期时间
    if (decodedPayload.exp && now > decodedPayload.exp) {
      return { valid: false, error: 'Token expired' };
    }
    
    // 验证issuer和audience
    if (decodedPayload.iss && decodedPayload.iss !== 'qiflow-ai') {
      return { valid: false, error: 'Invalid issuer' };
    }
    
    if (decodedPayload.aud && decodedPayload.aud !== 'qiflow-guest') {
      return { valid: false, error: 'Invalid audience' };
    }
    
    return { valid: true, payload: decodedPayload };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Token verification failed' 
    };
  }
}