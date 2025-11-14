/**
 * RBAC初始化脚本
 * 创建默认角色、权限并分配关系
 *
 * 运行: npx ts-node scripts/seed-rbac.ts
 */

import { eq } from 'drizzle-orm';
import { getDb } from '../src/db';
import {
  permissions,
  rolePermissions,
  roles,
  user,
  userRoles,
} from '../src/db/schema';

// 默认权限定义
const defaultPermissions = [
  // 用户管理
  {
    name: 'admin.users.read',
    displayName: '查看用户',
    description: '查看用户列表和详情',
    category: 'user_management',
  },
  {
    name: 'admin.users.write',
    displayName: '编辑用户',
    description: '编辑用户信息',
    category: 'user_management',
  },
  {
    name: 'admin.users.delete',
    displayName: '删除用户',
    description: '删除用户账号',
    category: 'user_management',
  },
  {
    name: 'admin.users.ban',
    displayName: '封禁用户',
    description: '封禁/解封用户账号',
    category: 'user_management',
  },

  // 角色管理
  {
    name: 'admin.roles.read',
    displayName: '查看角色',
    description: '查看角色列表和详情',
    category: 'role_management',
  },
  {
    name: 'admin.roles.write',
    displayName: '编辑角色',
    description: '创建、编辑角色',
    category: 'role_management',
  },
  {
    name: 'admin.roles.delete',
    displayName: '删除角色',
    description: '删除非系统角色',
    category: 'role_management',
  },
  {
    name: 'admin.roles.assign',
    displayName: '分配角色',
    description: '为用户分配/移除角色',
    category: 'role_management',
  },

  // 权限管理
  {
    name: 'admin.permissions.read',
    displayName: '查看权限',
    description: '查看权限列表',
    category: 'role_management',
  },
  {
    name: 'admin.permissions.assign',
    displayName: '分配权限',
    description: '为角色分配/移除权限',
    category: 'role_management',
  },

  // 内容管理 - 分析数据
  {
    name: 'content.analysis.read',
    displayName: '查看分析记录',
    description: '查看八字、风水等分析记录',
    category: 'content_management',
  },
  {
    name: 'content.analysis.delete',
    displayName: '删除分析记录',
    description: '删除分析记录',
    category: 'content_management',
  },
  {
    name: 'content.analysis.export',
    displayName: '导出分析数据',
    description: '导出分析数据报表',
    category: 'content_management',
  },

  // 财务管理
  {
    name: 'finance.credits.read',
    displayName: '查看积分记录',
    description: '查看积分交易记录',
    category: 'finance',
  },
  {
    name: 'finance.credits.adjust',
    displayName: '调整用户积分',
    description: '手动增减用户积分',
    category: 'finance',
  },
  {
    name: 'finance.payments.read',
    displayName: '查看支付记录',
    description: '查看支付和订阅记录',
    category: 'finance',
  },
  {
    name: 'finance.refunds.process',
    displayName: '处理退款',
    description: '处理用户退款请求',
    category: 'finance',
  },

  // 数据分析
  {
    name: 'analytics.dashboard.read',
    displayName: '查看数据仪表板',
    description: '查看各类数据统计和报表',
    category: 'analytics',
  },
  {
    name: 'analytics.reports.export',
    displayName: '导出分析报告',
    description: '导出业务分析报告',
    category: 'analytics',
  },

  // 系统设置
  {
    name: 'system.settings.read',
    displayName: '查看系统设置',
    description: '查看系统配置',
    category: 'system',
  },
  {
    name: 'system.settings.write',
    displayName: '修改系统设置',
    description: '修改系统配置',
    category: 'system',
  },
  {
    name: 'system.logs.read',
    displayName: '查看系统日志',
    description: '查看审计日志和系统日志',
    category: 'system',
  },
];

// 默认角色定义
const defaultRoles = [
  {
    name: 'super_admin',
    displayName: '超级管理员',
    description: '拥有所有权限,可以管理其他管理员',
    isSystem: true,
  },
  {
    name: 'admin',
    displayName: '管理员',
    description: '拥有大部分管理权限,但不能管理角色和权限',
    isSystem: true,
  },
  {
    name: 'content_moderator',
    displayName: '内容审核员',
    description: '负责内容审核和用户管理',
    isSystem: false,
  },
  {
    name: 'finance_manager',
    displayName: '财务管理员',
    description: '负责财务相关事务',
    isSystem: false,
  },
  {
    name: 'analyst',
    displayName: '数据分析师',
    description: '负责数据分析和报表',
    isSystem: false,
  },
];

// 角色-权限映射
const rolePermissionMappings = {
  super_admin: 'all', // 所有权限
  admin: [
    // 用户管理
    'admin.users.read',
    'admin.users.write',
    'admin.users.ban',
    // 内容管理
    'content.analysis.read',
    'content.analysis.delete',
    'content.analysis.export',
    // 财务管理(只读)
    'finance.credits.read',
    'finance.payments.read',
    // 数据分析
    'analytics.dashboard.read',
    'analytics.reports.export',
    // 系统设置(只读)
    'system.settings.read',
    'system.logs.read',
  ],
  content_moderator: [
    'admin.users.read',
    'admin.users.ban',
    'content.analysis.read',
    'content.analysis.delete',
  ],
  finance_manager: [
    'admin.users.read',
    'finance.credits.read',
    'finance.credits.adjust',
    'finance.payments.read',
    'finance.refunds.process',
    'analytics.dashboard.read',
  ],
  analyst: [
    'analytics.dashboard.read',
    'analytics.reports.export',
    'content.analysis.read',
  ],
};

async function seedRBAC() {
  console.log('🚀 开始初始化RBAC系统...\n');

  const db = await getDb();

  // 1. 创建权限
  console.log('📋 创建权限...');
  const createdPermissions: Record<string, any> = {};

  for (const perm of defaultPermissions) {
    // 检查是否已存在
    const existing = await db
      .select()
      .from(permissions)
      .where(eq(permissions.name, perm.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭️  权限已存在: ${perm.displayName}`);
      createdPermissions[perm.name] = existing[0];
    } else {
      const created = await db.insert(permissions).values(perm).returning();
      console.log(`  ✅ 创建权限: ${perm.displayName}`);
      createdPermissions[perm.name] = created[0];
    }
  }

  console.log(
    `\n✅ 权限创建完成,共 ${Object.keys(createdPermissions).length} 个\n`
  );

  // 2. 创建角色
  console.log('👥 创建角色...');
  const createdRoles: Record<string, any> = {};

  for (const role of defaultRoles) {
    // 检查是否已存在
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, role.name))
      .limit(1);

    if (existing.length > 0) {
      console.log(`  ⏭️  角色已存在: ${role.displayName}`);
      createdRoles[role.name] = existing[0];
    } else {
      const created = await db.insert(roles).values(role).returning();
      console.log(`  ✅ 创建角色: ${role.displayName}`);
      createdRoles[role.name] = created[0];
    }
  }

  console.log(`\n✅ 角色创建完成,共 ${Object.keys(createdRoles).length} 个\n`);

  // 3. 分配权限给角色
  console.log('🔗 分配权限给角色...');

  for (const [roleName, permNames] of Object.entries(rolePermissionMappings)) {
    const role = createdRoles[roleName];
    if (!role) continue;

    // 删除角色现有权限
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id));

    if (permNames === 'all') {
      // 分配所有权限
      for (const perm of Object.values(createdPermissions)) {
        await db.insert(rolePermissions).values({
          roleId: role.id,
          permissionId: perm.id,
        });
      }
      console.log(`  ✅ 为 ${role.displayName} 分配所有权限`);
    } else {
      // 分配指定权限
      for (const permName of permNames as string[]) {
        const perm = createdPermissions[permName];
        if (perm) {
          await db.insert(rolePermissions).values({
            roleId: role.id,
            permissionId: perm.id,
          });
        }
      }
      console.log(
        `  ✅ 为 ${role.displayName} 分配 ${(permNames as string[]).length} 个权限`
      );
    }
  }

  console.log('\n✅ 权限分配完成\n');

  // 4. 为admin用户分配super_admin角色
  console.log('👑 为admin用户分配超级管理员角色...');

  const adminUsers = await db
    .select()
    .from(user)
    .where(eq(user.email, 'admin@qiflowai.com'))
    .limit(1);

  if (adminUsers.length > 0) {
    const adminUser = adminUsers[0];
    const superAdminRole = createdRoles.super_admin;

    // 检查是否已分配
    const existing = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, adminUser.id))
      .where(eq(userRoles.roleId, superAdminRole.id))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userRoles).values({
        userId: adminUser.id,
        roleId: superAdminRole.id,
        assignedBy: adminUser.id, // 自己分配给自己
      });
      console.log(`  ✅ 已为 ${adminUser.email} 分配超级管理员角色`);
    } else {
      console.log(`  ⏭️  ${adminUser.email} 已拥有超级管理员角色`);
    }
  } else {
    console.log('  ⚠️  未找到admin@qiflowai.com用户');
  }

  console.log('\n🎉 RBAC系统初始化完成!\n');
  console.log('📊 总结:');
  console.log(`  - 权限: ${Object.keys(createdPermissions).length} 个`);
  console.log(`  - 角色: ${Object.keys(createdRoles).length} 个`);
  console.log(
    `  - 超级管理员: ${adminUsers.length > 0 ? adminUsers[0].email : '无'}`
  );
  console.log('\n');
}

// 执行seeding
seedRBAC()
  .then(() => {
    console.log('✅ Seeding完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding失败:', error);
    process.exit(1);
  });
