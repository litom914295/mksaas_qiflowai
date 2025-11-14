import { creditRules } from '@/db/schema-credit-config';
import { auth } from '@/lib/auth';
import { getDb } from '@/db';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/credits/rules
 * 获取所有积分规则
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const db = await getDb();
    const rules = await db
      .select()
      .from(creditRules)
      .orderBy(creditRules.category, creditRules.ruleKey);

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('获取积分规则失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

/**
 * POST /api/admin/credits/rules
 * 创建新积分规则
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const db = await getDb();
    const body = await req.json();
    const {
      ruleKey,
      ruleName,
      ruleType,
      category,
      creditAmount,
      enabled,
      dailyLimit,
      description,
    } = body;

    // 验证必填字段
    if (
      !ruleKey ||
      !ruleName ||
      !ruleType ||
      !category ||
      creditAmount === undefined
    ) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查ruleKey是否已存在
    const existing = await db
      .select()
      .from(creditRules)
      .where(eq(creditRules.ruleKey, ruleKey))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: '规则标识已存在' }, { status: 400 });
    }

    const [newRule] = await db
      .insert(creditRules)
      .values({
        ruleKey,
        ruleName,
        ruleType,
        category,
        creditAmount,
        enabled: enabled ?? true,
        dailyLimit: dailyLimit || null,
        description: description || null,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ rule: newRule }, { status: 201 });
  } catch (error) {
    console.error('创建积分规则失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/credits/rules
 * 更新积分规则
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const db = await getDb();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少规则ID' }, { status: 400 });
    }

    const [updatedRule] = await db
      .update(creditRules)
      .set({
        ...updates,
        updatedBy: session.user.id,
        updatedAt: new Date(),
      })
      .where(eq(creditRules.id, id))
      .returning();

    if (!updatedRule) {
      return NextResponse.json({ error: '规则不存在' }, { status: 404 });
    }

    return NextResponse.json({ rule: updatedRule });
  } catch (error) {
    console.error('更新积分规则失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
