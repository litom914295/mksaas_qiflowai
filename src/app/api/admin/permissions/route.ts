import { getDb } from '@/db';
import { permissions } from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import { type NextRequest, NextResponse } from 'next/server';

// 获取所有权限列表
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
    const category = searchParams.get('category');

    let query = db.select().from(permissions);

    // 按分类筛选
    if (category) {
      query = query.where(eq(permissions.category, category)) as any;
    }

    const allPermissions = await query.orderBy(
      permissions.category,
      permissions.name
    );

    // 按分类分组
    const groupedPermissions = allPermissions.reduce(
      (acc, perm) => {
        if (!acc[perm.category]) {
          acc[perm.category] = [];
        }
        acc[perm.category].push(perm);
        return acc;
      },
      {} as Record<string, typeof allPermissions>
    );

    return NextResponse.json({
      success: true,
      data: {
        all: allPermissions,
        grouped: groupedPermissions,
      },
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}
