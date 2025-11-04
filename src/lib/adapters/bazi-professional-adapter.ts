import type { ProfessionalBaziData } from '@/components/qiflow/analysis/bazi-professional-result';

/**
 * 将简化的八字API响应转换为专业版格式
 * @param apiData - API返回的八字分析数据
 * @param birthInfo - 可选的出生信息，用于计算大运流年
 */
export function adaptToProfessionalBaziData(
  apiData: any,
  birthInfo?: { birthDate?: string; birthTime?: string }
): ProfessionalBaziData {
  // 天干地支纳音对照表（简化版）
  const nayinMap: Record<string, string> = {
    甲子: '海中金',
    乙丑: '海中金',
    丙寅: '炉中火',
    丁卯: '炉中火',
    戊辰: '大林木',
    己巳: '大林木',
    庚午: '路旁土',
    辛未: '路旁土',
    壬申: '剑锋金',
    癸酉: '剑锋金',
    甲戌: '山头火',
    乙亥: '山头火',
    丙子: '涧下水',
    丁丑: '涧下水',
    戊寅: '城墙土',
    己卯: '城墙土',
    庚辰: '白蜡金',
    辛巳: '白蜡金',
    壬午: '杨柳木',
    癸未: '杨柳木',
    甲申: '泉中水',
    乙酉: '泉中水',
    丙戌: '屋上土',
    丁亥: '屋上土',
    戊子: '霹雳火',
    己丑: '霹雳火',
    庚寅: '松柏木',
    辛卯: '松柏木',
    壬辰: '长流水',
    癸巳: '长流水',
    甲午: '沙中金',
    乙未: '沙中金',
    丙申: '山下火',
    丁酉: '山下火',
    戊戌: '平地木',
    己亥: '平地木',
    庚子: '壁上土',
    辛丑: '壁上土',
    壬寅: '金箔金',
    癸卯: '金箔金',
    甲辰: '覆灯火',
    乙巳: '覆灯火',
    丙午: '天河水',
    丁未: '天河水',
    戊申: '大驿土',
    己酉: '大驿土',
    庚戌: '钗钏金',
    辛亥: '钗钏金',
    壬子: '桑柘木',
    癸丑: '桑柘木',
    甲寅: '大溪水',
    乙卯: '大溪水',
    丙辰: '沙中土',
    丁巳: '沙中土',
    戊午: '天上火',
    己未: '天上火',
    庚申: '石榴木',
    辛酉: '石榴木',
    壬戌: '大海水',
    癸亥: '大海水',
  };

  // 获取纳音
  const getNayin = (gan: string, zhi: string): string => {
    const key = `${gan}${zhi}`;
    return nayinMap[key] || '未知';
  };

  // 计算日主强度（基于五行平衡）
  const calculateDayMasterStrength = (
    elements: Record<string, number>
  ): number => {
    const values = Object.values(elements);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    // 日主强度基于五行分布的均匀度
    // 分布越不均匀，差异越大
    return Math.max(30, Math.min(70, 50 + range / 2));
  };

  // 提取五行数据（支持英文和中文键名）
  const wuxingData = apiData.wuxing || {};
  const elements: Record<string, number> = {
    木: wuxingData.wood || wuxingData['木'] || 20,
    火: wuxingData.fire || wuxingData['火'] || 20,
    土: wuxingData.earth || wuxingData['土'] || 20,
    金: wuxingData.metal || wuxingData['金'] || 20,
    水: wuxingData.water || wuxingData['水'] || 20,
  };

  // 找出最强和最弱的五行
  const sortedElements = Object.entries(elements).sort((a, b) => b[1] - a[1]);
  const strongest = sortedElements[0][0];
  const weakest = sortedElements[sortedElements.length - 1][0];

  // 计算日主强度
  const dayMasterStrength = calculateDayMasterStrength(elements);

  // 确定用神（五行平衡原则）
  // 如果日主偏强，用神为克泄耗的五行
  // 如果日主偏弱，用神为生扶的五行
  const elementRelations: Record<
    string,
    { primary: string; secondary: string; avoid: string }
  > = {
    木: { primary: '水', secondary: '木', avoid: '金' },
    火: { primary: '木', secondary: '火', avoid: '水' },
    土: { primary: '火', secondary: '土', avoid: '木' },
    金: { primary: '土', secondary: '金', avoid: '火' },
    水: { primary: '金', secondary: '水', avoid: '土' },
  };

  const yongshenRelation = elementRelations[weakest] || elementRelations['木'];

  // 生成神煞数据（模拟）
  const jiShenPool = [
    {
      name: '天乙贵人',
      strength: 85,
      description: '遇事有贵人相助，逢凶化吉',
      advice: '多与贵人接触，谦逊受教',
    },
    {
      name: '文昌星',
      strength: 75,
      description: '聪明好学，文采出众，利于学业考试',
      advice: '加强学习与表达，珍惜考试与评审机会',
    },
    {
      name: '天德贵人',
      strength: 80,
      description: '心地善良，福德深厚，得天庇佑',
      advice: '多行善事，积累人脉与口碑',
    },
    {
      name: '月德贵人',
      strength: 78,
      description: '品行端正，得长辈提携',
      advice: '尊师重道，稳健推进',
    },
    {
      name: '福星贵人',
      strength: 72,
      description: '福气深厚，生活安康顺遂',
      advice: '保持感恩心态，稳中求进',
    },
    {
      name: '天喜星',
      strength: 70,
      description: '喜事临门，婚姻美满',
      advice: '把握合作与联结机会',
    },
  ];

  const xiongShenPool = [
    {
      name: '羊刃',
      strength: 65,
      description: '性格刚烈，注意控制情绪，避免冲动',
      advice: '遇事先稳后动，练习情绪管理',
    },
    {
      name: '劫煞',
      strength: 60,
      description: '易有破财之象,需谨慎理财',
      advice: '分散投资，避免高杠杆',
    },
    {
      name: '孤辰',
      strength: 55,
      description: '性格独立，注意加强人际关系',
      advice: '主动沟通，扩大社交圈',
    },
    {
      name: '亡神',
      strength: 50,
      description: '做事需谨慎，避免意外损失',
      advice: '注意安全合规，流程先行',
    },
  ];

  // 随机选择2-3个吉神和1-2个凶神
  const jiShen = jiShenPool.slice(0, 2 + Math.floor(Math.random() * 2));
  const xiongShen = xiongShenPool.slice(0, 1 + Math.floor(Math.random() * 2));

  // 生成命格分析
  const patternNames = ['正格', '从格', '化格', '专旺格', '两神成象'];
  const patternDescriptions = [
    '命格端正，五行平衡，一生平稳发展',
    '顺应天时，随遇而安，善于适应环境',
    '化气有情，追求变化，富有创新精神',
    '专注一行，执着坚定，易在专业领域成就',
    '阴阳调和，刚柔并济，处事圆融',
  ];

  const patternIndex = Math.floor(Math.random() * patternNames.length);
  const subPatterns = ['食神生财', '伤官配印', '财官双美'].slice(
    0,
    1 + Math.floor(Math.random() * 2)
  );

  // 生成大运流年数据
  let birthYear = 1990; // 默认值

  // 尝试从 birthInfo 或 apiData 中提取出生年份
  if (birthInfo?.birthDate) {
    const parsedYear = Number.parseInt(birthInfo.birthDate.split('-')[0]);
    if (!Number.isNaN(parsedYear)) {
      birthYear = parsedYear;
    }
  } else if (apiData.inputData?.birthDate) {
    const parsedYear = Number.parseInt(
      apiData.inputData.birthDate.split('-')[0]
    );
    if (!Number.isNaN(parsedYear)) {
      birthYear = parsedYear;
    }
  } else if (apiData.birthYear) {
    birthYear = apiData.birthYear;
  }
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;

  const dayunCycles = [];
  const heavenlyStems = [
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
  const earthlyBranches = [
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
  const qualities: Array<'excellent' | 'good' | 'neutral' | 'challenging'> = [
    'excellent',
    'good',
    'neutral',
    'challenging',
  ];

  for (let i = 0; i < 8; i++) {
    const age = 10 + i * 10;
    const startYear = birthYear + age;
    const endYear = startYear + 9;
    const heavenly = heavenlyStems[i % 10];
    const earthly = earthlyBranches[i % 12];
    const element = ['木', '火', '土', '金', '水'][i % 5];
    const quality = qualities[i % 4];

    dayunCycles.push({
      age,
      startYear,
      endYear,
      heavenly,
      earthly,
      element,
      quality,
      description: `${heavenly}${earthly}大运，${element}气当令`,
    });
  }

  // 组装专业版数据
  return {
    chart: {
      pillars: {
        year: {
          heavenlyStem: apiData.bazi?.year?.gan || '甲',
          earthlyBranch: apiData.bazi?.year?.zhi || '子',
          nayin: getNayin(
            apiData.bazi?.year?.gan || '甲',
            apiData.bazi?.year?.zhi || '子'
          ),
        },
        month: {
          heavenlyStem: apiData.bazi?.month?.gan || '丙',
          earthlyBranch: apiData.bazi?.month?.zhi || '寅',
          nayin: getNayin(
            apiData.bazi?.month?.gan || '丙',
            apiData.bazi?.month?.zhi || '寅'
          ),
        },
        day: {
          heavenlyStem: apiData.bazi?.day?.gan || '戊',
          earthlyBranch: apiData.bazi?.day?.zhi || '辰',
          nayin: getNayin(
            apiData.bazi?.day?.gan || '戊',
            apiData.bazi?.day?.zhi || '辰'
          ),
        },
        hour: {
          heavenlyStem: apiData.bazi?.hour?.gan || '庚',
          earthlyBranch: apiData.bazi?.hour?.zhi || '午',
          nayin: getNayin(
            apiData.bazi?.hour?.gan || '庚',
            apiData.bazi?.hour?.zhi || '午'
          ),
        },
      },
    },
    wuxing: {
      dayMasterStrength,
      elements,
      balance: {
        strongest,
        weakest,
      },
    },
    yongshen: {
      primary: { element: yongshenRelation.primary },
      secondary: { element: yongshenRelation.secondary },
      avoid: { element: yongshenRelation.avoid },
      recommendations: [
        `宜多接触${yongshenRelation.primary}属性的事物，如颜色、方位、职业等`,
        `避免过多接触${yongshenRelation.avoid}属性，以免加重五行失衡`,
        '保持心态平和，顺应自然规律发展',
      ],
    },
    pattern: {
      details: [
        {
          name: patternNames[patternIndex],
          description: patternDescriptions[patternIndex],
        },
      ],
      strength: 60 + Math.floor(Math.random() * 30),
      subPatterns,
    },
    shensha: {
      jiShen,
      xiongShen,
    },
    interpretation: {
      summary: {
        overview:
          apiData.personality?.summary ||
          '您的八字命局显示出独特的个性特征和人生轨迹。整体而言，命局结构良好，具有一定的发展潜力。',
        strengths: apiData.personality?.strengths || [
          '责任心强，做事认真负责',
          '善于思考，有独立见解',
          '待人真诚，容易获得他人信任',
        ],
        challenges: apiData.personality?.weaknesses || [
          '需要注意情绪管理，保持心态平和',
          '在关键决策时应多方考虑，避免冲动',
          '保持学习进取的心态，不断提升自我',
        ],
      },
      detailed: {
        personality: [
          `性格总结：${apiData.personality?.summary || '性格分析暂无数据'}`,
          ...(apiData.personality?.strengths || []).map(
            (s: string) => `优势：${s}`
          ),
          ...(apiData.personality?.weaknesses || []).map(
            (w: string) => `注意：${w}`
          ),
        ],
        career: [
          `发展方向：${apiData.career?.direction || '事业分析暂无数据'}`,
          `适合行业：${(apiData.career?.suitable || []).join('、') || '暂无推荐'}`,
          `运势分析：${apiData.career?.timing || '暂无分析'}`,
        ],
        wealth: [
          `总体财运：${apiData.wealth?.overall || '财运分析暂无数据'}`,
          `理财建议：${apiData.wealth?.advice || '暂无建议'}`,
          `时机分析：${apiData.wealth?.timing || '暂无分析'}`,
        ],
        relationships: [
          `感情运势：${apiData.relationships?.love || '感情分析暂无数据'}`,
          `家庭关系：${apiData.relationships?.family || '暂无分析'}`,
          `人际关系：${apiData.relationships?.friends || '暂无分析'}`,
        ],
        health: [
          `保健建议：${apiData.health?.advice || '健康分析暂无数据'}`,
          `注意事项：${(apiData.health?.concerns || []).join('、') || '暂无特别提醒'}`,
        ],
      },
    },
    dayun: {
      cycles: dayunCycles,
      currentAge,
    },
  };
}
