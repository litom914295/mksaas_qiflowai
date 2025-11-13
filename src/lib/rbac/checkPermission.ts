import { getDb } from '@/db';
import { permissions, rolePermissions, roles, userRoles } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 权限缓存 (简单的内存缓存,生产环境建议使用Redis)
const permissionCache = new Map<
  string,
  { permissions: string[]; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

/**
 * 获取用户的所有权限
 * @param userId 用户ID
 * @returns 权限名称数组
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  // 检查缓存
  const cached = permissionCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }

  try {
    const db = await getDb();

    // 获取用户的所有角色
    const userRolesList = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(eq(userRoles.userId, userId));

    if (userRolesList.length === 0) {
      // 用户没有任何角色
      permissionCache.set(userId, { permissions: [], timestamp: Date.now() });
      return [];
    }

    const roleIds = userRolesList.map((ur) => ur.roleId);

    // 获取这些角色的所有权限
    const userPermissions = await db
      .select({ name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(
        // roleId IN (roleIds)
        eq(
          rolePermissions.roleId,
          roleIds.length === 1 ? roleIds[0] : (rolePermissions.roleId as any)
        )
      );

    // 如果有多个角色,需要分别查询并合并
    let allPermissions: string[] = [];
    for (const roleId of roleIds) {
      const rolePerms = await db
        .select({ name: permissions.name })
        .from(rolePermissions)
        .innerJoin(
          permissions,
          eq(rolePermissions.permissionId, permissions.id)
        )
        .where(eq(rolePermissions.roleId, roleId));

      allPermissions = allPermissions.concat(rolePerms.map((p) => p.name));
    }

    // 去重
    const uniquePermissions = Array.from(new Set(allPermissions));

    // 缓存结果
    permissionCache.set(userId, {
      permissions: uniquePermissions,
      timestamp: Date.now(),
    });

    return uniquePermissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * 检查用户是否拥有指定权限
 * @param userId 用户ID
 * @param permissionName 权限名称 (如: 'admin.users.write')
 * @returns 是否拥有权限
 */
export async function checkPermission(
  userId: string,
  permissionName: string
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.includes(permissionName);
}

/**
 * 检查用户是否拥有任一指定权限 (OR逻辑)
 * @param userId 用户ID
 * @param permissionNames 权限名称数组
 * @returns 是否拥有任一权限
 */
export async function checkAnyPermission(
  userId: string,
  permissionNames: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissionNames.some((perm) => userPermissions.includes(perm));
}

/**
 * 检查用户是否拥有所有指定权限 (AND逻辑)
 * @param userId 用户ID
 * @param permissionNames 权限名称数组
 * @returns 是否拥有所有权限
 */
export async function checkAllPermissions(
  userId: string,
  permissionNames: string[]
): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissionNames.every((perm) => userPermissions.includes(perm));
}

/**
 * 清除用户的权限缓存
 * @param userId 用户ID
 */
export function clearUserPermissionCache(userId: string): void {
  permissionCache.delete(userId);
}

/**
 * 清除所有权限缓存
 */
export function clearAllPermissionCache(): void {
  permissionCache.clear();
}

/**
 * 获取用户的所有角色
 * @param userId 用户ID
 * @returns 角色列表
 */
export async function getUserRoles(userId: string) {
  try {
    const db = await getDb();

    const userRolesList = await db
      .select({
        id: roles.id,
        name: roles.name,
        displayName: roles.displayName,
        description: roles.description,
        isSystem: roles.isSystem,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    return userRolesList;
  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * 检查用户是否拥有指定角色
 * @param userId 用户ID
 * @param roleName 角色名称 (如: 'super_admin', 'admin')
 * @returns 是否拥有该角色
 */
export async function hasRole(
  userId: string,
  roleName: string
): Promise<boolean> {
  const userRolesList = await getUserRoles(userId);
  return userRolesList.some((role) => role.name === roleName);
}

/**
 * 检查用户是否是超级管理员
 * @param userId 用户ID
 * @returns 是否是超级管理员
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'super_admin');
}
