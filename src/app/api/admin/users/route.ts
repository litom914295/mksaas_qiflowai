import { getDb } from '@/db';
import { user } from '@/db/schema';
import { verifyAuth } from '@/lib/auth/verify';
import bcrypt from 'bcryptjs';
import { asc, desc, eq, like, or, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 用户查询参数验证
const querySchema = z.object({
  page: z.string().optional().default('1'),
  pageSize: z.string().optional().default('10'),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// 获取用户列表
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const page = Number.parseInt(params.page);
    const pageSize = Number.parseInt(params.pageSize);
    const skip = (page - 1) * pageSize;

    const db = await getDb();

    // 构建查询条件
    const conditions = [];

    // 搜索条件
    if (params.search) {
      conditions.push(
        or(
          like(user.email, `%${params.search}%`),
          like(user.name, `%${params.search}%`)
        )
      );
    }

    // 状态筛选 - 注意: user 表需要有 status 字段
    // if (params.status && params.status !== 'all') {
    //   conditions.push(eq(user.status, params.status));
    // }

    // 排序
    const orderByColumn =
      params.sortBy === 'createdAt' ? user.createdAt : user.createdAt;
    const orderByDirection =
      params.sortOrder === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    // 查询用户
    const usersQuery = db
      .select()
      .from(user)
      .limit(pageSize)
      .offset(skip)
      .orderBy(orderByDirection);

    if (conditions.length > 0) {
      usersQuery.where(
        conditions.length === 1
          ? conditions[0]
          : sql`${conditions.join(' AND ')}`
      );
    }

    const [users, totalResult] = await Promise.all([
      usersQuery,
      db.select({ count: sql<number>`count(*)` }).from(user),
    ]);

    const total = Number(totalResult[0]?.count || 0);

    // 格式化返回数据 (简化版本)
    const formattedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role || 'user',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      // 注意: 以下字段需要 schema 支持
      // image: u.image,
      // banned: u.banned,
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取用户列表失败',
      },
      { status: 500 }
    );
  }
}

// 创建用户验证
// TODO: 重构为 Drizzle - 需要 roles 表定义
/*
const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional().default('user'),
  status: z.enum(['active', 'inactive', 'banned']).optional().default('active'),
  credits: z.number().optional().default(0),
  referredBy: z.string().optional(),
});

// 创建新用户 - 暂时禁用，需要角色系统支持
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未授权' },
        { status: 401 }
      );
    }

    // 验证请求数据
    const body = await request.json();
    const data = createUserSchema.parse(body);

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      );
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 查找角色
    const role = await prisma.role.findUnique({
      where: { name: data.role },
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: '角色不存在' },
        { status: 400 }
      );
    }

    // 生成推荐码
    const referralCode = generateReferralCode();

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: data.email,
        hashedPassword,
        name: data.name,
        phone: data.phone,
        status: data.status,
        credits: data.credits,
        referralCode,
        referredBy: data.referredBy,
        roles: {
          create: {
            roleId: role.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 如果有推荐人，更新推荐关系
    if (data.referredBy) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: data.referredBy },
      });

      if (referrer) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            status: 'completed',
            rewardCredits: 10, // 推荐奖励积分
          },
        });

        // 给推荐人增加积分
        await prisma.user.update({
          where: { id: referrer.id },
          data: { credits: { increment: 10 } },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: (user as any).roles?.[0]?.role.name,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '创建用户失败',
      },
      { status: 500 }
    );
  }
}

*/

// 生成推荐码
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
