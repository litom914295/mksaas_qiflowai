import { requirePermission } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import type { User } from '@/lib/db';
import bcrypt from 'bcryptjs';
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
    await requirePermission('user:read');

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    const page = Number.parseInt(params.page);
    const pageSize = Number.parseInt(params.pageSize);
    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Record<string, any> = {};

    // 搜索条件
    if (params.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    // 角色筛选
    if (params.role && params.role !== 'all') {
      where.roles = {
        some: {
          role: {
            name: params.role,
          },
        },
      };
    }

    // 状态筛选
    if (params.status && params.status !== 'all') {
      where.status = params.status;
    }

    // 查询用户
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: {
          [params.sortBy]: params.sortOrder,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              referrals: true,
              transactions: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // 格式化返回数据
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      role: (user as any).roles?.[0]?.role.name || 'user',
      status: user.status,
      credits: user.credits,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      _count: user._count,
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

// 创建新用户
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    await requirePermission('user:write');

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

// 生成推荐码
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
