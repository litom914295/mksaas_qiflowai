import { NextResponse } from 'next/server';
import { z } from 'zod';

// 验证请求数据的 schema
const BusinessNamingSchema = z.object({
  industry: z.string().min(1, '请输入行业类型'),
  founderName: z.string().min(1, '请输入法人姓名'),
  birthDate: z.string().min(1, '请输入法人生辰'),
  preferences: z
    .object({
      style: z
        .enum(['modern', 'traditional', 'creative', 'professional'])
        .optional(),
      length: z.enum(['short', 'medium', 'long']).optional(),
    })
    .optional(),
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

// 行业五行属性
const INDUSTRY_ELEMENTS: Record<string, string> = {
  科技: '金',
  互联网: '金',
  电子: '金',
  IT: '金',
  软件: '金',
  餐饮: '火',
  食品: '火',
  美容: '火',
  娱乐: '火',
  文化: '火',
  教育: '木',
  出版: '木',
  医疗: '木',
  健康: '木',
  环保: '木',
  房地产: '土',
  建筑: '土',
  装修: '土',
  物流: '土',
  农业: '土',
  金融: '水',
  贸易: '水',
  运输: '水',
  旅游: '水',
  咨询: '水',
};

// 吉祥用字库（按五行分类）
const AUSPICIOUS_CHARS: Record<string, string[]> = {
  木: [
    '森',
    '林',
    '柏',
    '松',
    '梓',
    '楠',
    '桂',
    '荣',
    '茂',
    '英',
    '华',
    '彬',
    '杰',
    '权',
    '标',
  ],
  火: [
    '昌',
    '明',
    '晖',
    '晨',
    '曦',
    '炎',
    '烨',
    '煜',
    '焕',
    '辉',
    '灿',
    '耀',
    '腾',
    '达',
    '盛',
  ],
  土: [
    '坤',
    '城',
    '基',
    '培',
    '增',
    '墨',
    '嘉',
    '安',
    '宁',
    '稳',
    '泰',
    '祥',
    '瑞',
    '丰',
    '厚',
  ],
  金: [
    '鑫',
    '锦',
    '铭',
    '锐',
    '钰',
    '银',
    '财',
    '富',
    '盛',
    '兴',
    '隆',
    '昌',
    '瑞',
    '宝',
    '鼎',
  ],
  水: [
    '泽',
    '海',
    '洋',
    '波',
    '涛',
    '江',
    '河',
    '浩',
    '润',
    '霖',
    '沛',
    '源',
    '汇',
    '博',
    '泓',
  ],
};

// 前缀词库（表达企业特质）
const PREFIX_WORDS: Record<string, string[]> = {
  modern: ['智', '云', '数', '创', '新', '锐', '极', '星', '峰', '擎'],
  traditional: ['瑞', '恒', '泰', '嘉', '盛', '隆', '宝', '鼎', '永', '昌'],
  creative: ['奇', '梦', '彩', '悦', '趣', '妙', '酷', '炫', '乐', '飞'],
  professional: ['信', '诚', '达', '通', '正', '佳', '优', '精', '卓', '越'],
};

// 后缀词库（表达行业属性）
const SUFFIX_WORDS: Record<string, string[]> = {
  科技: ['科技', '信息', '网络', '智能', '数据', '云端', '系统'],
  互联网: ['科技', '网络', '在线', '互联', '数字'],
  餐饮: ['餐饮', '食品', '美食', '膳食', '饮食'],
  金融: ['金融', '投资', '资本', '财富', '基金'],
  教育: ['教育', '培训', '学院', '学堂', '书院'],
  咨询: ['咨询', '顾问', '智库', '策略', '方案'],
  default: ['企业', '集团', '公司', '实业', '产业'],
};

// 简化的八字计算
function calculateBazi(birthDate: string) {
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();

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

// 计算八字五行分布
function getBaziElementDistribution(bazi: any) {
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

// 确定需要的五行
function getNeededElements(
  baziElements: Record<string, number>,
  industryElement: string
) {
  // 找出八字缺少的五行
  const weak = Object.entries(baziElements)
    .filter(([_, count]) => count === 0)
    .map(([elem, _]) => elem);

  // 优先考虑行业五行
  const needed = [industryElement];

  // 添加八字缺少的五行（但限制数量）
  weak.slice(0, 2).forEach((elem) => {
    if (!needed.includes(elem)) {
      needed.push(elem);
    }
  });

  return needed;
}

// 生成公司名称
function generateBusinessNames(
  industry: string,
  neededElements: string[],
  style = 'professional',
  count = 5
) {
  const names: Array<{
    name: string;
    score: number;
    reason: string;
    elements: string[];
  }> = [];

  const prefixes = PREFIX_WORDS[style] || PREFIX_WORDS.professional;
  const suffixes = SUFFIX_WORDS[industry] || SUFFIX_WORDS.default;

  // 生成多个名称组合
  for (let i = 0; i < count * 2; i++) {
    const prefix = prefixes[i % prefixes.length];
    const middleElement = neededElements[i % neededElements.length];
    const middle =
      AUSPICIOUS_CHARS[middleElement][
        Math.floor(Math.random() * AUSPICIOUS_CHARS[middleElement].length)
      ];
    const suffix = suffixes[i % suffixes.length];

    // 组合名称
    const fullName = `${prefix}${middle}${suffix}`;

    // 评分逻辑
    let score = 75; // 基础分
    const reasons: string[] = [];
    const usedElements: string[] = [];

    // 检查五行覆盖
    neededElements.forEach((elem) => {
      if (AUSPICIOUS_CHARS[elem].some((char) => fullName.includes(char))) {
        score += 5;
        usedElements.push(elem);
      }
    });

    // 长度评分
    if (fullName.length >= 4 && fullName.length <= 6) {
      score += 5;
      reasons.push('名称长度适中');
    }

    // 寓意评分
    const auspiciousChars = [
      '瑞',
      '鑫',
      '盛',
      '达',
      '兴',
      '隆',
      '泰',
      '嘉',
      '昌',
      '荣',
    ];
    const hasAuspicious = auspiciousChars.some((char) =>
      fullName.includes(char)
    );
    if (hasAuspicious) {
      score += 8;
      reasons.push('含吉祥寓意');
    }

    // 行业相关性
    if (fullName.includes(suffix)) {
      score += 5;
      reasons.push(`贴合${industry}行业`);
    }

    // 五行理由
    if (usedElements.length > 0) {
      reasons.push(
        `五行包含${usedElements.join('、')}，${usedElements.length > 1 ? '五行均衡' : '补益命格'}`
      );
    }

    // 添加随机变化避免雷同
    score += Math.floor(Math.random() * 10) - 5;

    // 确保分数在合理范围
    score = Math.max(60, Math.min(98, score));

    names.push({
      name: fullName,
      score,
      reason: reasons.join('，') || '寓意良好',
      elements: usedElements,
    });
  }

  // 按评分排序并去重
  return names
    .sort((a, b) => b.score - a.score)
    .filter(
      (name, index, self) =>
        index === self.findIndex((n) => n.name === name.name)
    )
    .slice(0, count);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = BusinessNamingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { industry, founderName, birthDate, preferences } = validation.data;

    // 计算法人八字
    const bazi = calculateBazi(birthDate);
    const baziElements = getBaziElementDistribution(bazi);

    // 确定行业五行
    const industryElement = INDUSTRY_ELEMENTS[industry] || '金';

    // 确定需要补充的五行
    const neededElements = getNeededElements(baziElements, industryElement);

    // 生成公司名称建议
    const style = preferences?.style || 'professional';
    const recommendations = generateBusinessNames(
      industry,
      neededElements,
      style,
      5
    );

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        founder: {
          name: founderName,
          bazi: {
            pillars: bazi,
            elements: baziElements,
          },
        },
        industry: {
          name: industry,
          element: industryElement,
          description: `${industry}行业五行属${industryElement}`,
        },
        analysis: {
          neededElements,
          explanation: `根据法人八字和${industry}行业特点，建议使用${neededElements.join('、')}行字`,
        },
        recommendations: recommendations.map((rec) => ({
          name: rec.name,
          score: rec.score,
          reason: rec.reason,
          elements: rec.elements,
          suitable:
            rec.score >= 80
              ? '非常适合'
              : rec.score >= 70
                ? '较为适合'
                : '可以考虑',
        })),
      },
    });
  } catch (error) {
    console.error('Business naming error:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
