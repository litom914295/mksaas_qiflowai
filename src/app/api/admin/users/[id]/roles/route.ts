import { getDb } from '@/db';
import { roles, user, userRoles } from '@/db/schema';
import { AuditAction, logUserAction } from '@/lib/audit/logAudit';
import { verifyAuth } from '@/lib/auth/verify';
import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

// 获取用户的角色列表
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证权限
    const currentUserId = await verifyAuth(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const targetUserId = params.id;
    const db = await getDb();

    // 检查用户是否存在
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);
    if (targetUser.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户的所有角色
    const userRolesList = await db
      .select({
        id: roles.id,
        name: roles.name,
        displayName: roles.displayName,
        description: roles.description,
        isSystem: roles.isSystem,
        assignedAt: userRoles.assignedAt,
        assignedBy: userRoles.assignedBy,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, targetUserId));

    return NextResponse.json({
      success: true,
      data: {
        user: targetUser[0],
        roles: userRolesList,
      },
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user roles' },
      { status: 500 }
    );
  }
}

// 为用户分配角色
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证权限
    const currentUserId = await verifyAuth(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const targetUserId = params.id;
    const body = await request.json();
    const { roleId } = body;

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'roleId为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查用户是否存在
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);
    if (targetUser.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

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

    // 检查是否已分配该角色
    const existing = await db
      .select()
      .from(userRoles)
      .where(
        and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId))
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: '用户已拥有该角色' },
        { status: 400 }
      );
    }

    // 分配角色
    await db.insert(userRoles).values({
      userId: targetUserId,
      roleId,
      assignedBy: currentUserId,
    });

    // 记录审计日志
    await logUserAction({
      userId: currentUserId,
      userEmail: targetUser[0].email,
      action: AuditAction.USER_ASSIGN_ROLE,
      targetUserId,
      description: `为用户 ${targetUser[0].email || targetUserId} 分配角色: ${role[0].displayName}`,
      changes: {
        after: { roleId, roleName: role[0].displayName },
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: '角色分配成功',
    });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign role' },
      { status: 500 }
    );
  }
}

// 移除用户的角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 验证权限
    const currentUserId = await verifyAuth(request);
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    const targetUserId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get('roleId');

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'roleId为必填项' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 检查用户是否存在
    const targetUser = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUserId))
      .limit(1);
    if (targetUser.length === 0) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取角色信息用于日志
    const role = await db
      .select()
      .from(roles)
      .where(eq(roles.id, roleId))
      .limit(1);

    // 移除角色
    await db
      .delete(userRoles)
      .where(
        and(eq(userRoles.userId, targetUserId), eq(userRoles.roleId, roleId))
      );

    // 记录审计日志
    await logUserAction({
      userId: currentUserId,
      userEmail: targetUser[0].email,
      action: AuditAction.USER_REVOKE_ROLE,
      targetUserId,
      description: `移除用户 ${targetUser[0].email || targetUserId} 的角色: ${role[0]?.displayName || roleId}`,
      changes: {
        before: { roleId, roleName: role[0]?.displayName || roleId },
      },
      request,
    });

    return NextResponse.json({
      success: true,
      message: '角色移除成功',
    });
  } catch (error) {
    console.error('Error removing role from user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove role' },
      { status: 500 }
    );
  }
}
