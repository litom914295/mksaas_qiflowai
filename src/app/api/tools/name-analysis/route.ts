import { NextResponse } from 'next/server';
import { z } from 'zod';

// 验证请求数据的 schema
const NameAnalysisSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  birthDate: z.string().min(1, '请输入出生时间'),
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

// 笔画五行映射（按笔画尾数）
const STROKE_ELEMENT_MAP: Record<number, string> = {
  1: '木',
  2: '木',
  3: '火',
  4: '火',
  5: '土',
  6: '土',
  7: '金',
  8: '金',
  9: '水',
  0: '水',
};

// 常见汉字笔画数（简化版，实际应使用完整字典）
const CHAR_STROKES: Record<string, number> = {
  // 姓氏
  张: 11,
  王: 4,
  李: 7,
  刘: 15,
  陈: 16,
  杨: 13,
  黄: 12,
  赵: 14,
  周: 8,
  吴: 7,
  徐: 10,
  孙: 10,
  马: 10,
  朱: 6,
  胡: 11,
  林: 8,
  郭: 15,
  何: 7,
  高: 10,
  罗: 19,
  // 常用名字
  明: 8,
  华: 14,
  伟: 11,
  强: 12,
  军: 9,
  磊: 15,
  洋: 9,
  勇: 9,
  芳: 10,
  娜: 10,
  静: 16,
  丽: 19,
  敏: 11,
  艳: 24,
  秀: 7,
  英: 11,
  涛: 18,
  鹏: 19,
  杰: 12,
  文: 4,
  清: 11,
  云: 12,
  建: 9,
  国: 11,
  民: 5,
  永: 5,
  红: 9,
  新: 13,
  海: 11,
  亮: 9,
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

// 计算姓名笔画和五行
function analyzeNameStrokes(name: string) {
  const chars = name.split('');
  const strokes = chars.map((char) => CHAR_STROKES[char] || 10); // 默认10画
  const elements = strokes.map((stroke) => STROKE_ELEMENT_MAP[stroke % 10]);

  // 姓名五行分布
  const nameElements: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
  elements.forEach((elem) => {
    nameElements[elem]++;
  });

  return {
    strokes,
    elements,
    distribution: nameElements,
    totalStrokes: strokes.reduce((a, b) => a + b, 0),
  };
}

// 分析姓名与八字的适配度
function analyzeNameCompatibility(
  baziElements: Record<string, number>,
  nameInfo: {
    strokes: number[];
    elements: string[];
    distribution: Record<string, number>;
    totalStrokes: number;
  }
) {
  let score = 50; // 基础分

  const baziWeak = Object.entries(baziElements)
    .filter(([_, count]) => count === 0)
    .map(([elem, _]) => elem);

  const baziStrong = Object.entries(baziElements)
    .filter(([_, count]) => count >= 3)
    .map(([elem, _]) => elem);

  const suggestions = [];

  // 检查姓名是否补了八字缺少的五行
  baziWeak.forEach((elem) => {
    if (nameInfo.distribution[elem] > 0) {
      score += 15;
      suggestions.push(`姓名补了八字所缺的${elem}行，非常好`);
    } else {
      score -= 10;
      suggestions.push(`建议在姓名中补充${elem}行`);
    }
  });

  // 检查姓名是否避免了八字过旺的五行
  baziStrong.forEach((elem) => {
    if (nameInfo.distribution[elem] === 0) {
      score += 10;
      suggestions.push(`姓名避开了八字过旺的${elem}行`);
    } else {
      score -= 5;
      suggestions.push(`八字${elem}行已旺，姓名宜避免`);
    }
  });

  // 姓名五行平衡性检查
  const nameElemValues = Object.values(nameInfo.distribution) as number[];
  const maxNameElem = Math.max(...nameElemValues);
  const minNameElem = Math.min(...nameElemValues);
  if (maxNameElem - minNameElem <= 2) {
    score += 10;
    suggestions.push('姓名五行分布较为平衡');
  }

  // 笔画吉祥数检查（简化版）
  const luckyNumbers = [
    1, 3, 5, 6, 7, 8, 11, 13, 15, 16, 17, 18, 21, 23, 24, 25, 31, 32, 33, 35,
    37, 39, 41, 45, 47, 48, 52, 57, 63, 65, 67, 68, 81,
  ];
  if (luckyNumbers.includes(nameInfo.totalStrokes)) {
    score += 10;
    suggestions.push('姓名总笔画数为吉数');
  }

  // 确保分数在合理范围
  score = Math.max(30, Math.min(100, score));

  return {
    score,
    suggestions,
  };
}

// 生成改名建议
function generateNameSuggestions(
  baziElements: Record<string, number>,
  currentName: string
) {
  const suggestions = [];
  const weak = Object.entries(baziElements)
    .filter(([_, count]) => count === 0)
    .map(([elem, _]) => elem);

  if (weak.length > 0) {
    weak.forEach((elem) => {
      const chars = getCharsByElement(elem);
      suggestions.push({
        element: elem,
        reason: `八字缺${elem}，建议使用${elem}行字`,
        recommendedChars: chars,
      });
    });
  } else {
    suggestions.push({
      element: '均衡',
      reason: '八字五行相对平衡，可根据喜好选择',
      recommendedChars: [],
    });
  }

  return suggestions;
}

// 根据五行推荐汉字
function getCharsByElement(element: string): string[] {
  const charMap: Record<string, string[]> = {
    木: ['林', '森', '柏', '松', '桂', '梓', '楠', '樱', '芳', '茂'],
    火: ['炎', '焱', '烨', '灿', '煜', '晖', '昱', '明', '晨', '曦'],
    土: ['坤', '培', '圳', '城', '堃', '均', '墨', '壕', '增', '基'],
    金: ['鑫', '锦', '钰', '铭', '锐', '锋', '钢', '铎', '银', '铃'],
    水: ['洋', '涛', '波', '浩', '海', '江', '河', '泽', '淼', '沐'],
  };
  return charMap[element] || [];
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = NameAnalysisSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, birthDate } = validation.data;

    // 计算八字
    const bazi = calculateBazi(birthDate);
    const baziElements = getBaziElementDistribution(bazi);

    // 分析姓名
    const nameInfo = analyzeNameStrokes(name);
    const compatibility = analyzeNameCompatibility(baziElements, nameInfo);
    const nameSuggestions = generateNameSuggestions(baziElements, name);

    // 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        name,
        bazi: {
          pillars: bazi,
          elements: baziElements,
        },
        nameAnalysis: {
          strokes: nameInfo.strokes,
          totalStrokes: nameInfo.totalStrokes,
          elements: nameInfo.distribution,
          charElements: name.split('').map((char, idx) => ({
            char,
            stroke: nameInfo.strokes[idx],
            element: nameInfo.elements[idx],
          })),
        },
        compatibility: {
          score: Math.round(compatibility.score),
          level:
            compatibility.score >= 80
              ? '优秀'
              : compatibility.score >= 60
                ? '良好'
                : '一般',
          suggestions: compatibility.suggestions,
        },
        recommendations: nameSuggestions,
      },
    });
  } catch (error) {
    console.error('Name analysis error:', error);
    return NextResponse.json(
      { error: '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
