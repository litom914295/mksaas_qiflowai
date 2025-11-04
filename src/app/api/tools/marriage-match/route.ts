import { NextResponse } from 'next/server';
import { z } from 'zod';

// 验证请求数据的 schema
const MarriageMatchSchema = z.object({
  person1: z.object({
    name: z.string().min(1, '请输入男方姓名'),
    birthDate: z.string().min(1, '请输入男方生辰'),
  }),
  person2: z.object({
    name: z.string().min(1, '请输入女方姓名'),
    birthDate: z.string().min(1, '请输入女方生辰'),
  }),
});

// 天干地支映射
const HEAVENLY_STEMS = [
  '甲',
  '乙',
  '丙',
  '丁',
  '戊',
  '己',
  '庚',
  '辛',
  '壬',
  '癸',
];
const EARTHLY_BRANCHES = [
  '子',
  '丑',
  '寅',
  '卯',
  '辰',
  '巳',
  '午',
  '未',
  '申',
  '酉',
  '戌',
  '亥',
];

// 五行映射
const ELEMENT_MAP: Record<string, string> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
  子: '水',
  亥: '水',
  寅: '木',
  卯: '木',
  巳: '火',
  午: '火',
  辰: '土',
  丑: '土',
  未: '土',
  戌: '土',
  申: '金',
  酉: '金',
};

// 五行相生相克关系
const ELEMENT_RELATIONS = {
  生: {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  },
  克: {
    木: '土',
    火: '金',
    土: '水',
    金: '木',
    水: '火',
  },
};

// 简化的八字计算（实际应使用完整的万年历算法）
function calculateBazi(birthDate: string) {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

  // 简化计算（实际需要考虑节气、真太阳时等）
  const yearStem = HEAVENLY_STEMS[(year - 4) % 10];
  const yearBranch = EARTHLY_BRANCHES[(year - 4) % 12];
  const monthStem = HEAVENLY_STEMS[(month + 2) % 10];
  const monthBranch = EARTHLY_BRANCHES[(month + 1) % 12];
  const dayStem = HEAVENLY_STEMS[(day - 1) % 10];
  const dayBranch = EARTHLY_BRANCHES[(day - 1) % 12];
  const hourStem = HEAVENLY_STEMS[(hour / 2) % 10];
  const hourBranch = EARTHLY_BRANCHES[Math.floor(hour / 2)];

  return {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayStem, branch: dayBranch },
    hour: { stem: hourStem, branch: hourBranch },
  };
}

// 计算五行分布
function getElementDistribution(bazi: any) {
  const elements: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  Object.values(bazi).forEach((pillar: any) => {
    elements[ELEMENT_MAP[pillar.stem]]++;
    elements[ELEMENT_MAP[pillar.branch]]++;
  });

  return elements;
}

// 分析五行互补情况
function analyzeElementCompatibility(
  elements1: Record<string, number>,
  elements2: Record<string, number>
) {
  const compatibility = {
    score: 0,
    strengths: [] as string[],
    concerns: [] as string[],
  };

  // 检查五行平衡
  const combined: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
  Object.keys(combined).forEach((elem) => {
    combined[elem] = elements1[elem] + elements2[elem];
  });

  // 计算方差来衡量平衡程度
  const avg = Object.values(combined).reduce((a, b) => a + b, 0) / 5;
  const variance =
    Object.values(combined).reduce((sum, val) => sum + (val - avg) ** 2, 0) / 5;

  // 方差越小，五行越平衡，得分越高
  compatibility.score = Math.max(0, Math.min(50, 50 - variance * 5));

  // 检查互补关系
  Object.entries(elements1).forEach(([elem, count]) => {
    if (count === 0 && elements2[elem] > 0) {
      compatibility.strengths.push(`${elem}行互补`);
      compatibility.score += 10;
    }
  });

  // 检查相生关系
  Object.entries(ELEMENT_RELATIONS.生).forEach(([from, to]) => {
    if (elements1[from] > 0 && elements2[to] > 0) {
      compatibility.strengths.push(`${from}生${to}，相生相助`);
      compatibility.score += 5;
    }
  });

  // 检查相克关系
  Object.entries(ELEMENT_RELATIONS.克).forEach(([from, to]) => {
    if (elements1[from] > elements1[to] && elements2[to] > elements2[from]) {
      compatibility.concerns.push(`需注意${from}克${to}的关系`);
      compatibility.score -= 5;
    }
  });

  // 基础分
  compatibility.score += 40;

  return compatibility;
}

// 判断婚配等级
function getMarriageLevel(score: number): string {
  if (score >= 85) return '上等婚配';
  if (score >= 70) return '中上婚配';
  if (score >= 60) return '中等婚配';
  if (score >= 50) return '中下婚配';
  return '下等婚配';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = MarriageMatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { person1, person2 } = validation.data;

    // 计算双方八字
    const bazi1 = calculateBazi(person1.birthDate);
    const bazi2 = calculateBazi(person2.birthDate);

    // 获取五行分布
    const elements1 = getElementDistribution(bazi1);
    const elements2 = getElementDistribution(bazi2);

    // 分析兼容性
    const compatibility = analyzeElementCompatibility(elements1, elements2);

    // 确保分数在 0-100 范围内
    compatibility.score = Math.max(0, Math.min(100, compatibility.score));

    // 添加默认建议（如果没有关注点）
    if (compatibility.concerns.length === 0) {
      compatibility.concerns.push('保持良好沟通，共同成长');
    }

    if (compatibility.strengths.length === 0) {
      compatibility.strengths.push('双方性格互补');
    }

    // 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        person1: {
          name: person1.name,
          bazi: bazi1,
          elements: elements1,
        },
        person2: {
          name: person2.name,
          bazi: bazi2,
          elements: elements2,
        },
        analysis: {
          score: Math.round(compatibility.score),
          level: getMarriageLevel(compatibility.score),
          strengths: compatibility.strengths,
          concerns: compatibility.concerns,
          recommendation:
            compatibility.score >= 70
              ? '双方八字较为相配，适合婚配'
              : '建议多方面考虑，谨慎决定',
        },
      },
    });
  } catch (error) {
    console.error('Marriage match error:', error);
    return NextResponse.json(
      { error: '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
