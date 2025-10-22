// P1-002: 即时体验API
// POST /api/instant-preview
// 功能: 轻量级八字分析 + AI今日运势 + 速率限制

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求验证Schema
const instantPreviewSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误（需要：YYYY-MM-DD）'),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, '时间格式错误（需要：HH:MM）')
    .optional(),
});

// 响应类型
interface InstantPreviewResponse {
  success: boolean;
  data?: {
    dayPillar: string;
    wuxing: string;
    wuxingStrength: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    todayFortune: string;
    favorable: string[];
    unfavorable: string[];
  };
  error?: string;
  rateLimited?: boolean;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<InstantPreviewResponse>> {
  try {
    // 1. 获取IP地址（用于速率限制）
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    // 2. 速率限制检查（IP级别：每日5次）
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          error: '今日体验次数已用完，请明天再试或注册账号获取更多次数',
        },
        { status: 429 }
      );
    }

    // 3. 验证请求体
    const body = await req.json();
    const validationResult = instantPreviewSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            validationResult.error.issues[0]?.message || '输入数据格式错误',
        },
        { status: 400 }
      );
    }

    const { birthDate, birthTime } = validationResult.data;

    // 4. 计算八字（轻量级模式）
    const baziResult = await calculateBaZiLightweight({
      date: new Date(birthDate),
      time: birthTime,
    });

    // 5. 生成今日运势（带缓存）
    const todayFortune = await generateTodayFortune({
      dayPillar: baziResult.dayPillar,
      wuxing: baziResult.wuxing.dominant,
    });

    // 6. 异步记录到数据库（不阻塞响应）
    recordInstantPreview({
      ip,
      fingerprint: req.headers.get('x-fingerprint') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      birthDate: new Date(birthDate),
      birthTime: birthTime ? new Date(`1970-01-01T${birthTime}:00`) : undefined,
      ...baziResult,
      todayFortune,
    }).catch((error) => {
      console.error('Failed to record instant preview:', error);
      // 不影响主流程
    });

    // 7. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        dayPillar: baziResult.dayPillar,
        wuxing: baziResult.wuxing.dominant,
        wuxingStrength: baziResult.wuxing.strength,
        todayFortune,
        favorable: baziResult.favorable,
        unfavorable: baziResult.unfavorable,
      },
    });
  } catch (error) {
    console.error('Instant preview error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '分析失败，请稍后重试',
      },
      { status: 500 }
    );
  }
}

// ============================================
// 辅助函数
// ============================================

/**
 * 速率限制检查
 * 使用Redis INCR + EXPIRE实现
 */
async function checkRateLimit(
  ip: string
): Promise<{ success: boolean; remaining: number }> {
  // TODO: 实现Redis速率限制
  // 临时实现：直接返回成功
  // const redis = await getRedisClient();
  // const key = `rate-limit:instant-preview:${ip}`;
  // const current = await redis.incr(key);
  // if (current === 1) {
  //   await redis.expire(key, 24 * 60 * 60); // 24小时
  // }
  // return {
  //   success: current <= 5,
  //   remaining: Math.max(0, 5 - current),
  // };

  return { success: true, remaining: 5 };
}

/**
 * 轻量级八字计算
 * 只计算日柱和五行，不做深度分析
 */
async function calculateBaZiLightweight(input: {
  date: Date;
  time?: string;
}): Promise<{
  dayPillar: string;
  wuxing: {
    dominant: string;
    strength: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
  };
  favorable: string[];
  unfavorable: string[];
}> {
  // TODO: 实现真实的八字计算
  // 这里是模拟实现
  const dayPillars = [
    '甲子',
    '乙丑',
    '丙寅',
    '丁卯',
    '戊辰',
    '己巳',
    '庚午',
    '辛未',
    '壬申',
    '癸酉',
  ];
  const wuxingList = ['木', '火', '土', '金', '水'];
  const favorableList = [
    ['学习', '社交', '创业'],
    ['投资', '合作', '旅行'],
    ['休息', '思考', '规划'],
    ['运动', '交流', '娱乐'],
    ['工作', '决策', '谈判'],
  ];
  const unfavorableList = [
    ['冲动', '争执', '冒险'],
    ['犹豫', '拖延', '浪费'],
    ['焦虑', '压力', '疲劳'],
    ['分心', '失误', '错过'],
    ['冷漠', '孤独', '消极'],
  ];

  // 简单哈希生成
  const dateHash = input.date.getTime() % dayPillars.length;
  const dayPillar = dayPillars[dateHash];
  const wuxingIndex = dateHash % wuxingList.length;
  const dominant = wuxingList[wuxingIndex];

  // 生成五行力量分布
  const strength: Record<string, number> = {
    wood: 20,
    fire: 20,
    earth: 20,
    metal: 20,
    water: 20,
  };

  // 增强主属性
  const dominantKey =
    dominant === '木'
      ? 'wood'
      : dominant === '火'
        ? 'fire'
        : dominant === '土'
          ? 'earth'
          : dominant === '金'
            ? 'metal'
            : 'water';
  strength[dominantKey] = 35;

  // 调整其他属性
  const remaining = (100 - 35) / 4;
  Object.keys(strength).forEach((key) => {
    if (key !== dominantKey) {
      strength[key] = Math.round(remaining);
    }
  });

  return {
    dayPillar,
    wuxing: {
      dominant,
      strength: {
        wood: strength.wood,
        fire: strength.fire,
        earth: strength.earth,
        metal: strength.metal,
        water: strength.water,
      },
    },
    favorable: favorableList[wuxingIndex],
    unfavorable: unfavorableList[wuxingIndex],
  };
}

/**
 * 生成今日运势
 * 带Redis缓存（key: fortune:{dayPillar}:{date}）
 */
async function generateTodayFortune(input: {
  dayPillar: string;
  wuxing: string;
}): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `fortune:${input.dayPillar}:${today}`;

  // TODO: 检查Redis缓存
  // const redis = await getRedisClient();
  // const cached = await redis.get(cacheKey);
  // if (cached) {
  //   return cached;
  // }

  // 生成运势（临时使用模板）
  const fortunes = [
    `今日运势旺盛，适宜主动出击。${input.wuxing}属性的你，在人际交往和事业发展方面将有不错的机遇。建议多与他人沟通，把握好时机。`,
    `今天适合稳扎稳打，不宜冒进。${input.wuxing}属性使你今日较为谨慎，这是好事。专注于手头的工作，避免分心，将有不错的收获。`,
    `今日心情愉悦，贵人相助。${input.wuxing}能量强劲，适合拓展人脉和寻求合作。保持积极心态，好运自然降临。`,
    `今日宜静不宜动，适合思考和规划。${input.wuxing}属性让你今日更适合内省和总结。静下心来，思考未来方向，将大有裨益。`,
  ];

  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

  // TODO: 保存到Redis缓存
  // await redis.set(cacheKey, fortune, 'EX', 24 * 60 * 60);

  return fortune;
}

/**
 * 记录即时体验到数据库
 */
async function recordInstantPreview(data: {
  ip: string;
  fingerprint?: string;
  userAgent?: string;
  birthDate: Date;
  birthTime?: Date;
  dayPillar: string;
  wuxing: {
    dominant: string;
    strength: Record<string, number>;
  };
  favorable: string[];
  unfavorable: string[];
  todayFortune: string;
}): Promise<void> {
  // TODO: 使用Prisma保存到数据库
  // const prisma = await getPrismaClient();
  // await prisma.instantPreview.create({
  //   data: {
  //     birthDate: data.birthDate,
  //     birthTime: data.birthTime,
  //     ipAddress: data.ip,
  //     fingerprint: data.fingerprint,
  //     userAgent: data.userAgent,
  //     dayPillar: data.dayPillar,
  //     wuxing: data.wuxing.dominant,
  //     wuxingStrength: data.wuxing.strength,
  //     todayFortune: data.todayFortune,
  //     favorable: data.favorable,
  //     unfavorable: data.unfavorable,
  //   },
  // });

  console.log('Instant preview recorded:', {
    ip: data.ip,
    dayPillar: data.dayPillar,
    wuxing: data.wuxing.dominant,
  });
}
