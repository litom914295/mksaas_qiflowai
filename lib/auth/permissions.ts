/**
 * 权限管理模块
 */

// 权限定义
export const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
    ADMIN: 'users:admin',
  },
  CONTENT: {
    READ: 'content:read',
    WRITE: 'content:write',
    DELETE: 'content:delete',
    PUBLISH: 'content:publish',
  },
  ORDERS: {
    READ: 'orders:read',
    WRITE: 'orders:write',
    DELETE: 'orders:delete',
    REFUND: 'orders:refund',
  },
  SYSTEM: {
    READ: 'system:read',
    WRITE: 'system:write',
    ADMIN: 'system:admin',
    CONFIG: 'system:config',
  },
  ANALYTICS: {
    READ: 'analytics:read',
    EXPORT: 'analytics:export',
  },
} as const;

// 角色定义
export const ROLES = {
  SUPER_ADMIN: {
    name: 'super_admin',
    displayName: 'Super Administrator',
    permissions: ['*'],
  },
  ADMIN: {
    name: 'admin',
    displayName: 'Administrator',
    permissions: [
      'users:*',
      'content:*',
      'orders:*',
      'system:read',
      'system:write',
      'system:config',
      'analytics:*',
    ],
  },
  OPERATOR: {
    name: 'operator',
    displayName: 'Operator',
    permissions: [
      'users:read',
      'users:write',
      'content:read',
      'content:write',
      'orders:read',
      'orders:write',
    ],
  },
  USER: {
    name: 'user',
    displayName: 'User',
    permissions: ['content:read', 'orders:read'],
  },
} as const;

interface User {
  permissions?: string[];
}

/**
 * 检查用户是否有特定权限
 */
export function hasPermission(
  user: User | undefined,
  permission: string
): boolean {
  if (!user || !user.permissions) {
    return false;
  }

  // 检查是否有完全匹配的权限
  if (user.permissions.includes(permission)) {
    return true;
  }

  // 检查是否有通配符权限
  if (user.permissions.includes('*')) {
    return true;
  }

  // 检查模块级通配符（如 users:*）
  const [module] = permission.split(':');
  if (user.permissions.includes(`${module}:*`)) {
    return true;
  }

  return false;
}

/**
 * 检查用户是否有任意一个权限
 */
export function hasAnyPermission(
  user: User | undefined,
  permissions: string[]
): boolean {
  if (!permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * 检查用户是否有所有权限
 */
export function hasAllPermissions(
  user: User | undefined,
  permissions: string[]
): boolean {
  if (!permissions || permissions.length === 0) {
    return true;
  }

  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * 根据角色名获取角色定义
 */
export function getRoleByName(roleName: string) {
  return Object.values(ROLES).find((role) => role.name === roleName);
}

/**
 * 检查用户是否有特定角色
 */
export function hasRole(
  user: User & { role?: string },
  roleName: string
): boolean {
  return user.role === roleName;
}

/**
 * 获取用户的所有权限（包括角色权限）
 */
export function getUserPermissions(user: User & { role?: string }): string[] {
  const rolePermissions = user.role
    ? getRoleByName(user.role)?.permissions || []
    : [];
  const userPermissions = user.permissions || [];

  return [...new Set([...rolePermissions, ...userPermissions])];
}
