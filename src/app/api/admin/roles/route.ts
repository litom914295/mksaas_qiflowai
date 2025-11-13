import { getDb } from '@/db';
import { permissions, rolePermissions, roles } from '@/db/schema';
import { AuditAction, AuditStatus, logRoleAction } from '@/lib/audit/logAudit';
import { verifyAuth } from '@/lib/auth/verify';
import { and, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// 获取角色列表
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const includePermissions =
      searchParams.get('includePermissions') === 'true';

    // 获取所有角色
    const allRoles = await db.select().from(roles).orderBy(roles.createdAt);

    // 如果需要包含权限信息
    if (includePermissions) {
      const rolesWithPermissions = await Promise.all(
        allRoles.map(async (role) => {
          const rolePerms = await db
            .select({
              id: permissions.id,
              name: permissions.name,
              displayName: permissions.displayName,
              category: permissions.category,
            })
            .from(rolePermissions)
            .innerJoin(
              permissions,
              eq(rolePermissions.permissionId, permissions.id)
            )
            .where(eq(rolePermissions.roleId, role.id));

          return {
            ...role,
            permissions: rolePerms,
            permissionCount: rolePerms.length,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: rolesWithPermissions,
      });
    }

    // 获取每个角色的权限数量
    const rolesWithCount = await Promise.all(
      allRoles.map(async (role) => {
        const permCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, role.id));

        return {
          ...role,
          permissionCount: Number(permCount[0]?.count || 0),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: rolesWithCount,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// 创建新角色
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, displayName, description, permissionIds } = body;

    // 验证必填字段
    if (!name || !displayName) {
      return NextResponse.json(
        { success: false, error: '角色名称和显示名称为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查角色名是否已存在
    const existing = await db
      .select()
      .from(roles)
      .where(eq(roles.name, name))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: '角色名称已存在' },
        { status: 400 }
      );
    }

    // 创建角色
    const newRole = await db
      .insert(roles)
      .values({
        name,
        displayName,
        description: description || null,
        isSystem: false,
      })
      .returning();

    // 如果提供了权限ID,分配权限
    if (
      permissionIds &&
      Array.isArray(permissionIds) &&
      permissionIds.length > 0
    ) {
      const permissionValues = permissionIds.map((permId: string) => ({
        roleId: newRole[0].id,
        permissionId: permId,
      }));

      await db.insert(rolePermissions).values(permissionValues);
    }

    // 记录审计日志
    await logRoleAction({
      userId,
      action: AuditAction.ROLE_CREATE,
      roleId: newRole[0].id,
      description: `创建角色: ${displayName} (${name})`,
      changes: {
        after: {
          name,
          displayName,
          description,
          permissionCount: permissionIds?.length || 0,
        },
      },
      request,
    });

    return NextResponse.json({
      success: true,
      data: newRole[0],
      message: '角色创建成功',
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

// 更新角色
export async function PUT(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, displayName, description } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '角色ID为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查角色是否存在
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    if (existingRole.length === 0) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不允许修改
    if (existingRole[0].isSystem) {
      return NextResponse.json(
        { success: false, error: '系统角色不允许修改' },
        { status: 403 }
      );
    }

    // 更新角色
    const updated = await db
      .update(roles)
      .set({
        displayName: displayName || existingRole[0].displayName,
        description:
          description !== undefined ? description : existingRole[0].description,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();

    // 记录审计日志
    await logRoleAction({
      userId,
      action: AuditAction.ROLE_UPDATE,
      roleId: id,
      description: `更新角色: ${updated[0].displayName}`,
      changes: {
        before: {
          displayName: existingRole[0].displayName,
          description: existingRole[0].description,
        },
        after: {
          displayName: updated[0].displayName,
          description: updated[0].description,
        },
      },
      request,
    });

    return NextResponse.json({
      success: true,
      data: updated[0],
      message: '角色更新成功',
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// 删除角色
export async function DELETE(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '角色ID为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查角色是否存在
    const existingRole = await db
      .select()
      .from(roles)
      .where(eq(roles.id, id))
      .limit(1);
    if (existingRole.length === 0) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不允许删除
    if (existingRole[0].isSystem) {
      return NextResponse.json(
        { success: false, error: '系统角色不允许删除' },
        { status: 403 }
      );
    }

    // 删除角色 (级联删除关联的权限和用户角色)
    await db.delete(roles).where(eq(roles.id, id));

    // 记录审计日志
    await logRoleAction({
      userId,
      action: AuditAction.ROLE_DELETE,
      roleId: id,
      description: `删除角色: ${existingRole[0].displayName}`,
      changes: {
        before: {
          name: existingRole[0].name,
          displayName: existingRole[0].displayName,
          description: existingRole[0].description,
        },
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: '角色删除成功',
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
