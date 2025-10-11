import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

export type JWTPayload = {
  userId: string;
  email: string;
  role: string;
  permissions?: string[];
  type?: 'access' | 'refresh' | 'api';
};

/**
 * 生成JWT令牌
 */
export function generateToken(
  payload: JWTPayload,
  expiresIn: string = JWT_EXPIRES_IN
): string {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    {
      expiresIn,
      algorithm: 'HS256',
    }
  );
}

/**
 * 验证JWT令牌
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JWTPayload & jwt.JwtPayload;

    // 检查令牌是否过期
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      type: decoded.type,
    };
  } catch (error) {
    console.error('JWT验证失败:', error);
    return null;
  }
}

/**
 * 生成API密钥
 */
export function generateApiKey(userId: string): string {
  return generateToken(
    {
      userId,
      email: '',
      role: 'api',
      type: 'api',
    },
    '365d' // API密钥有效期1年
  );
}

/**
 * 生成刷新令牌
 */
export function generateRefreshToken(userId: string, email: string, role: string): string {
  return generateToken(
    {
      userId,
      email,
      role,
      type: 'refresh',
    },
    '90d' // 刷新令牌有效期90天
  );
}

/**
 * 生成访问令牌
 */
export function generateAccessToken(
  userId: string,
  email: string,
  role: string,
  permissions?: string[]
): string {
  return generateToken(
    {
      userId,
      email,
      role,
      permissions,
      type: 'access',
    },
    '1h' // 访问令牌有效期1小时
  );
}

/**
 * 解码JWT令牌（不验证签名）
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload & jwt.JwtPayload;
    if (!decoded) return null;

    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions,
      type: decoded.type,
    };
  } catch (error) {
    console.error('JWT解码失败:', error);
    return null;
  }
}