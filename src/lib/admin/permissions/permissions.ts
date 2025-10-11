// 权限定义
export const PERMISSIONS = {
  // 用户管理权限
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  USER_ROLE_ASSIGN: 'user.role.assign',
  
  // 角色管理权限
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_EDIT: 'role.edit',
  ROLE_DELETE: 'role.delete',
  
  // 内容管理权限
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_EDIT: 'content.edit',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  
  // 运营管理权限
  OPERATION_VIEW: 'operation.view',
  OPERATION_MANAGE: 'operation.manage',
  ORDER_VIEW: 'order.view',
  ORDER_REFUND: 'order.refund',
  
  // 数据分析权限
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
  
  // 系统设置权限
  SYSTEM_VIEW: 'system.view',
  SYSTEM_CONFIG: 'system.config',
  AUDIT_LOG_VIEW: 'audit.log.view',
  
  // 风控管理权限
  FRAUD_VIEW: 'fraud.view',
  FRAUD_MANAGE: 'fraud.manage',
  BLACKLIST_MANAGE: 'blacklist.manage',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// 角色定义
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  permissions: Permission[]
  isSystem?: boolean
}

// 预定义角色
export const PREDEFINED_ROLES: Role[] = [
  {
    id: 'admin',
    name: '超级管理员',
    code: 'admin',
    description: '拥有系统所有权限',
    permissions: Object.values(PERMISSIONS),
    isSystem: true
  },
  {
    id: 'operator',
    name: '运营人员',
    code: 'operator',
    description: '负责日常运营管理',
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.CONTENT_VIEW,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_EDIT,
      PERMISSIONS.CONTENT_PUBLISH,
      PERMISSIONS.OPERATION_VIEW,
      PERMISSIONS.OPERATION_MANAGE,
      PERMISSIONS.ORDER_VIEW,
      PERMISSIONS.ANALYTICS_VIEW,
    ],
    isSystem: true
  },
  {
    id: 'analyst',
    name: '数据分析师',
    code: 'analyst',
    description: '查看和分析数据',
    permissions: [
      PERMISSIONS.USER_VIEW,
      PERMISSIONS.ANALYTICS_VIEW,
      PERMISSIONS.ANALYTICS_EXPORT,
      PERMISSIONS.ORDER_VIEW,
    ],
    isSystem: true
  },
  {
    id: 'editor',
    name: '内容编辑',
    code: 'editor',
    description: '管理内容创作和发布',
    permissions: [
      PERMISSIONS.CONTENT_VIEW,
      PERMISSIONS.CONTENT_CREATE,
      PERMISSIONS.CONTENT_EDIT,
    ],
    isSystem: true
  }
]

// 权限检查函数
export function hasPermission(
  userPermissions: Permission[],
  requiredPermission: Permission
): boolean {
  return userPermissions.includes(requiredPermission)
}

export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => 
    userPermissions.includes(permission)
  )
}

export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  )
}

// 根据角色代码获取权限
export function getPermissionsByRole(roleCode: string): Permission[] {
  const role = PREDEFINED_ROLES.find(r => r.code === roleCode)
  return role?.permissions || []
}