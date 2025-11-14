import { getDb } from '@/db';
import { permissions, rolePermissions, roles } from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// 获取角色的权限列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id: roleId } = await params;
    const db = await getDb();

    // 检查角色是否存在
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    if (role.length === 0) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 获取角色的所有权限
    const rolePerms = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        displayName: permissions.displayName,
        description: permissions.description,
        category: permissions.category,
        grantedAt: rolePermissions.grantedAt,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return NextResponse.json({
      success: true,
      data: {
        role: role[0],
        permissions: rolePerms,
      },
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
}

// 更新角色的权限 (完全替换)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id: roleId } = await params;
    const body = await request.json();
    const { permissionIds } = body;

    if (!Array.isArray(permissionIds)) {
      return NextResponse.json(
        { success: false, error: 'permissionIds必须是数组' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查角色是否存在
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    if (role.length === 0) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不允许修改权限
    if (role[0].isSystem) {
      return NextResponse.json(
        { success: false, error: '系统角色的权限不允许修改' },
        { status: 403 }
      );
    }

    // 删除角色的所有现有权限
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // 添加新权限
    if (permissionIds.length > 0) {
      const permissionValues = permissionIds.map((permId: string) => ({
        roleId,
        permissionId: permId,
      }));

      await db.insert(rolePermissions).values(permissionValues);
    }

    // 获取更新后的权限列表
    const updatedPerms = await db
      .select({
        id: permissions.id,
        name: permissions.name,
        displayName: permissions.displayName,
        category: permissions.category,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return NextResponse.json({
      success: true,
      data: updatedPerms,
      message: '角色权限更新成功',
    });
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role permissions' },
      { status: 500 }
    );
  }
}

// 为角色添加单个权限
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id: roleId } = await params;
    const body = await request.json();
    const { permissionId } = body;

    if (!permissionId) {
      return NextResponse.json(
        { success: false, error: 'permissionId为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查角色是否存在
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    if (role.length === 0) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不允许修改权限
    if (role[0].isSystem) {
      return NextResponse.json(
        { success: false, error: '系统角色的权限不允许修改' },
        { status: 403 }
      );
    }

    // 检查权限是否已存在
    const existing = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: '权限已存在' },
        { status: 400 }
      );
    }

    // 添加权限
    await db.insert(rolePermissions).values({
      roleId,
      permissionId,
    });

    return NextResponse.json({
      success: true,
      message: '权限添加成功',
    });
  } catch (error) {
    console.error('Error adding permission to role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add permission' },
      { status: 500 }
    );
  }
}

// 从角色移除单个权限
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const { id: roleId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const permissionId = searchParams.get('permissionId');

    if (!permissionId) {
      return NextResponse.json(
        { success: false, error: 'permissionId为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查角色是否存在
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);
    if (role.length === 0) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 404 }
      );
    }

    // 系统角色不允许修改权限
    if (role[0].isSystem) {
      return NextResponse.json(
        { success: false, error: '系统角色的权限不允许修改' },
        { status: 403 }
      );
    }

    // 移除权限
    await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.permissionId, permissionId)
        )
      );

    return NextResponse.json({
      success: true,
      message: '权限移除成功',
    });
  } catch (error) {
    console.error('Error removing permission from role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove permission' },
      { status: 500 }
    );
  }
}
