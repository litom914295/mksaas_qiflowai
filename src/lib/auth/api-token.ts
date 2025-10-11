import { prisma } from '@/lib/db';
import { generateApiKey, verifyToken } from './jwt';
import crypto from 'crypto';

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  permissions: string[];
  expiresAt: Date | null;
  lastUsed: Date | null;
  createdAt: Date;
}

/**
 * 创建API Token
 */
export async function createApiToken(
  userId: string,
  name: string,
  permissions: string[] = [],
  expiresIn?: number // 过期时间（天）
): Promise<ApiToken> {
  // 生成唯一的token
  const token = generateApiKey(userId);
  const hashedToken = hashToken(token);

  const expiresAt = expiresIn 
    ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000)
    : null;

  const apiToken = await prisma.apiToken.create({
    data: {
      userId,
      name,
      token: hashedToken,
      permissions: permissions.join(','),
      expiresAt,
    }
  });

  return {
    id: apiToken.id,
    name: apiToken.name,
    token, // 返回原始token（只在创建时显示一次）
    permissions,
    expiresAt: apiToken.expiresAt,
    lastUsed: apiToken.lastUsed,
    createdAt: apiToken.createdAt,
  };
}

/**
 * 哈希化token
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * 验证API Token
 */
export async function validateApiToken(token: string): Promise<{
  valid: boolean;
  userId?: string;
  permissions?: string[];
  tokenId?: string;
}> {
  // 验证JWT格式
  const payload = verifyToken(token);
  if (!payload || payload.type !== 'api') {
    return { valid: false };
  }

  // 查找token记录
  const hashedToken = hashToken(token);
  const apiToken = await prisma.apiToken.findUnique({
    where: { 
      token: hashedToken,
      userId: payload.userId,
    }
  });

  if (!apiToken) {
    return { valid: false };
  }

  // 检查是否过期
  if (apiToken.expiresAt && apiToken.expiresAt < new Date()) {
    return { valid: false };
  }

  // 更新最后使用时间
  await prisma.apiToken.update({
    where: { id: apiToken.id },
    data: { lastUsed: new Date() }
  });

  return {
    valid: true,
    userId: apiToken.userId,
    permissions: apiToken.permissions ? apiToken.permissions.split(',') : [],
    tokenId: apiToken.id,
  };
}

/**
 * 撤销API Token
 */
export async function revokeApiToken(
  tokenId: string,
  userId?: string
): Promise<boolean> {
  try {
    const where = userId 
      ? { id: tokenId, userId }
      : { id: tokenId };

    await prisma.apiToken.delete({ where });
    return true;
  } catch (error) {
    console.error('撤销API Token失败:', error);
    return false;
  }
}

/**
 * 获取用户的所有API Token
 */
export async function getUserApiTokens(
  userId: string
): Promise<Omit<ApiToken, 'token'>[]> {
  const tokens = await prisma.apiToken.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  return tokens.map(token => ({
    id: token.id,
    name: token.name,
    token: '***', // 隐藏实际token
    permissions: token.permissions ? token.permissions.split(',') : [],
    expiresAt: token.expiresAt,
    lastUsed: token.lastUsed,
    createdAt: token.createdAt,
  }));
}

/**
 * 刷新API Token
 */
export async function refreshApiToken(
  tokenId: string,
  userId: string
): Promise<ApiToken | null> {
  const existingToken = await prisma.apiToken.findUnique({
    where: { id: tokenId, userId }
  });

  if (!existingToken) {
    return null;
  }

  // 生成新token
  const newToken = generateApiKey(userId);
  const hashedToken = hashToken(newToken);

  // 更新token
  const updated = await prisma.apiToken.update({
    where: { id: tokenId },
    data: {
      token: hashedToken,
      lastUsed: null,
    }
  });

  return {
    id: updated.id,
    name: updated.name,
    token: newToken, // 返回新的原始token
    permissions: updated.permissions ? updated.permissions.split(',') : [],
    expiresAt: updated.expiresAt,
    lastUsed: updated.lastUsed,
    createdAt: updated.createdAt,
  };
}

/**
 * 验证API请求权限
 */
export async function verifyApiPermission(
  token: string,
  requiredPermission: string
): Promise<boolean> {
  const validation = await validateApiToken(token);
  
  if (!validation.valid || !validation.permissions) {
    return false;
  }

  // 检查是否有所需权限
  return validation.permissions.includes(requiredPermission) ||
         validation.permissions.includes('*'); // 通配符权限
}

/**
 * 清理过期的API Token
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.apiToken.deleteMany({
    where: {
      expiresAt: {
        not: null,
        lt: new Date()
      }
    }
  });

  return result.count;
}