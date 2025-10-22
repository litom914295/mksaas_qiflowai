/**
 * QiFlow AI Chat API
 * 算法优先策略 + 积分管理
 * 流程：识别意图 -> 检查数据 -> 算法计算 -> AI组织语言
 */

import { auth } from '@/lib/auth';
import { creditsManager } from '@/lib/credits/manager';
import {
  detectFengshuiIntent,
  hasDirectionInfo,
} from '@/lib/qiflow/ai/input-parser';
import {
  AI_FENGSHUI_QUICK_PROMPT,
  getSystemPrompt,
} from '@/lib/qiflow/ai/system-prompt';
import { computeBaziSmart } from '@/lib/qiflow/bazi';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { generateText, streamText } from 'ai';
import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求验证schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z
    .object({
      type: z.enum(['bazi', 'xuankong', 'general']).optional(),
      data: z.record(z.string(), z.any()).optional(),
      birthInfo: z
        .object({
          date: z.string(),
          time: z.string(),
          gender: z.enum(['male', 'female']).optional(),
          location: z.string().optional(),
        })
        .optional(),
      houseInfo: z
        .object({
          facing: z.string().optional(),
          degree: z.number().optional(),
          buildYear: z.number().optional(),
          location: z.string().optional(),
        })
        .optional(),
      calculatedBazi: z.any().optional(), // 已计算的八字数据
      calculatedFengshui: z.any().optional(), // 已计算的风水数据
      originalQuestion: z.string().optional(), // 原始问题（用于补充数据后回答）
    })
    .optional(),
});

// 简单的生辰信息解析（Edge Runtime兼容）
function parseSimpleBirthInfo(text: string) {
  // 移除空格
  const cleanText = text.replace(/\s+/g, '');

  // 日期匹配
  const dateMatch = text.match(
    /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日号]?/
  );
  // 时间匹配
  const timeMatch = text.match(/(\d{1,2})[点时:](\d{1,2})[分]?/);
  const hourMatch = text.match(/(\d{1,2})[点时]/);

  // 性别匹配
  let gender: 'male' | 'female' | undefined;
  if (text.includes('男') || text.includes('先生')) {
    gender = 'male';
  } else if (text.includes('女') || text.includes('女士')) {
    gender = 'female';
  }

  if (dateMatch) {
    const year = dateMatch[1];
    const month = dateMatch[2].padStart(2, '0');
    const day = dateMatch[3].padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    let time = '12:00'; // 默认中午
    if (timeMatch) {
      const hour = timeMatch[1].padStart(2, '0');
      const minute = (timeMatch[2] || '00').padStart(2, '0');
      time = `${hour}:${minute}`;
    } else if (hourMatch) {
      const hour = hourMatch[1].padStart(2, '0');
      time = `${hour}:00`;
    }

    return { date, time, gender };
  }

  return null;
}

// 检测是否是命理/风水相关问题
function detectQuestionType(message: string) {
  const baziKeywords = [
    '八字',
    '命理',
    '五行',
    '用神',
    '喜神',
    '忌神',
    '大运',
    '流年',
    '财运',
    '事业',
    '婚姻',
    '感情',
    '健康',
    '性格',
    '天干',
    '地支',
    '十神',
    '正财',
    '偏财',
    '正官',
    '七杀',
    '正印',
    '偏印',
    '食神',
    '伤官',
  ];
  const fengshuiKeywords = [
    '风水',
    '玄空',
    '飞星',
    '九宫',
    '朝向',
    '坐向',
    '山星',
    '水星',
    '财位',
    '文昌',
    '桃花位',
    '煞位',
    '房屋',
    '住宅',
    '办公室',
    '房子',
    '布置',
    '布局',
    '摆放',
    '装修',
    '家居',
    '卧室',
    '客厅',
    '厨房',
  ];

  const isBaziQuestion = baziKeywords.some((k) => message.includes(k));
  const isFengshuiQuestion = fengshuiKeywords.some((k) => message.includes(k));

  return { isBaziQuestion, isFengshuiQuestion };
}

// 增强的房屋朝向解析函数
function parseHouseDirection(input: string): any {
  const directionMap: any = {
    北: 0,
    东北: 45,
    东: 90,
    东南: 135,
    南: 180,
    西南: 225,
    西: 270,
    西北: 315,
    坐北朝南: 180,
    坐南朝北: 0,
    坐东朝西: 270,
    坐西朝东: 90,
    坐东南朝西北: 315,
    坐西北朝东南: 135,
    坐东北朝西南: 225,
    坐西南朝东北: 45,
  };

  // 1. 查找朝向关键词
  let degree: number | null = null;
  for (const [key, val] of Object.entries(directionMap)) {
    if (input.includes(key)) {
      degree = val as number;
      break;
    }
  }

  // 2. 提取度数（支持"180度、"180°等格式）
  const degreeMatch = input.match(/(\d{1,3})\s*[度°]/);
  if (degreeMatch) {
    degree = Number.parseInt(degreeMatch[1]);
  }

  // 3. 提取建成年份
  const yearMatch = input.match(/(\d{4})\s*年/);
  const buildYear = yearMatch
    ? Number.parseInt(yearMatch[1])
    : new Date().getFullYear();

  return {
    facing: degree !== null ? `${degree}度` : '未知',
    degree: degree !== null ? degree : 180, // 默认朝南
    buildYear,
    originalQuery: input,
  };
}

// 简单的房屋信息解析(保留兼容性)
function parseHouseInfo(text: string) {
  return parseHouseDirection(text);
}

// 格式化五行显示
function formatFiveElements(elements: any): string {
  if (!elements) return '未计算';
  return Object.entries(elements)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .map(([element, percent]) => `${element}${percent}%`)
    .join('、');
}

// 获取最弱的五行
function getWeakestElement(elements: any): string {
  if (!elements) return '火';
  const sorted = Object.entries(elements).sort(
    (a, b) => (a[1] as number) - (b[1] as number)
  );
  return sorted[0]?.[0] || '火';
}

// 获取最强的五行
function getStrongestElement(elements: any): string {
  if (!elements) return '水';
  const sorted = Object.entries(elements).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  return sorted[0]?.[0] || '水';
}

// 使用AI回答命理问题（基于算法数据）
async function generateAIResponse(
  message: string,
  baziData: any,
  originalQuestion?: string
): Promise<string> {
  const actualQuestion = originalQuestion || message;

  // 使用优化后的系统提示词
  const systemPrompt =
    getSystemPrompt('bazi') +
    '\n\n【当前用户八字数据】\n' +
    '四柱八字：\n' +
    `年柱：${baziData.yearPillar?.stem}${baziData.yearPillar?.branch}\n` +
    `月柱：${baziData.monthPillar?.stem}${baziData.monthPillar?.branch}\n` +
    `日柱：${baziData.dayPillar?.stem}${baziData.dayPillar?.branch}\n` +
    `时柱：${baziData.hourPillar?.stem}${baziData.hourPillar?.branch}\n\n` +
    `日主：${baziData.dayMaster}\n` +
    `五行分析：${JSON.stringify(baziData.fiveElements)}\n` +
    `十神：${baziData.tenGods?.map((g: any) => g.name).join('、') || '未计算'}\n` +
    `用神：${baziData.favorableGod || '未计算'}\n` +
    `喜神：${baziData.joyGod || '未计算'}\n` +
    `忌神：${baziData.avoidGod || '未计算'}\n` +
    (baziData.universalFortune
      ? `大运：${JSON.stringify(baziData.universalFortune)}\n`
      : '') +
    (baziData.yearlyFortune
      ? `流年运势：${JSON.stringify(baziData.yearlyFortune)}`
      : '');

  try {
    // 尝试使用配置的AI服务
    const models = [
      {
        provider: 'deepseek',
        model: () => openai('deepseek-chat'),
        key: process.env.DEEPSEEK_API_KEY,
      },
      {
        provider: 'openai',
        model: () => openai('gpt-3.5-turbo'),
        key: process.env.OPENAI_API_KEY,
      },
      {
        provider: 'google',
        model: () => google('gemini-pro'),
        key: process.env.GOOGLE_API_KEY,
      },
    ];

    for (const { provider, model, key } of models) {
      if (!key) continue;

      try {
        console.log(`尝试使用 ${provider} 生成回答...`);
        const result = await generateText({
          model: model(),
          system: systemPrompt,
          prompt: actualQuestion,
          temperature: 0.7,
        });

        return result.text;
      } catch (error) {
        console.error(`${provider} 调用失败:`, error);
      }
    }

    // 所有AI服务都失败，使用本地智能回答
    return generateLocalSmartResponse(actualQuestion, baziData);
  } catch (error) {
    console.error('AI响应生成失败:', error);
    return generateLocalSmartResponse(actualQuestion, baziData);
  }
}

// 基于八字的个性化九宫飞星计算
function generatePersonalizedFengshuiAnalysis(houseInfo: any, baziData?: any) {
  // 将朝向转换为度数
  let degree = houseInfo.degree;
  if (!degree && houseInfo.facing) {
    const directionMap: any = {
      北: 0,
      东北: 45,
      东: 90,
      东南: 135,
      南: 180,
      西南: 225,
      西: 270,
      西北: 315,
      坐北朝南: 180,
      坐南朝北: 0,
      坐东朝西: 270,
      坐西朝东: 90,
      坐东南朝西北: 315,
      坐西北朝东南: 135,
      坐东北朝西南: 225,
      坐西南朝东北: 45,
    };

    for (const [key, val] of Object.entries(directionMap)) {
      if (houseInfo.facing.includes(key)) {
        degree = val as number;
        break;
      }
    }
  }

  // 确定山向
  const getMountainFacing = (deg: number) => {
    if (deg >= 337.5 || deg < 22.5)
      return { mountain: '子', facing: '午', palace: '坎宫' };
    if (deg >= 22.5 && deg < 67.5)
      return { mountain: '丑寅', facing: '未申', palace: '艮宫' };
    if (deg >= 67.5 && deg < 112.5)
      return { mountain: '卯甲', facing: '酉庚', palace: '震宫' };
    if (deg >= 112.5 && deg < 157.5)
      return { mountain: '乙辰', facing: '辛戌', palace: '巽宫' };
    if (deg >= 157.5 && deg < 202.5)
      return { mountain: '巳丙', facing: '亥壬', palace: '离宫' };
    if (deg >= 202.5 && deg < 247.5)
      return { mountain: '丁未', facing: '癸丑', palace: '坤宫' };
    if (deg >= 247.5 && deg < 292.5)
      return { mountain: '申庚', facing: '寅甲', palace: '兑宫' };
    if (deg >= 292.5 && deg < 337.5)
      return { mountain: '辛戌', facing: '乙辰', palace: '乾宫' };
    return { mountain: '子', facing: '午', palace: '坎宫' };
  };

  const { mountain, facing, palace } = getMountainFacing(degree || 180);

  // 当前运（2024年为九运）
  const currentPeriod = 9;

  // 九宫飞星基本局
  const nineStarMap = {
    坎宫: { position: '北方', star: 1, element: '水', meaning: '智慧、事业' },
    坤宫: { position: '西南', star: 2, element: '土', meaning: '病符、健康' },
    震宫: { position: '东方', star: 3, element: '木', meaning: '是非、口舌' },
    巽宫: { position: '东南', star: 4, element: '木', meaning: '文昌、学业' },
    中宫: { position: '中央', star: 5, element: '土', meaning: '五黄煞、凶星' },
    乾宫: { position: '西北', star: 6, element: '金', meaning: '武曲、贵人' },
    兑宫: { position: '西方', star: 7, element: '金', meaning: '破军、盗贼' },
    艮宫: { position: '东北', star: 8, element: '土', meaning: '左辅、财运' },
    离宫: { position: '南方', star: 9, element: '火', meaning: '右弼、喜庆' },
  };

  // 【核心】基于八字的个性化分析
  let personalizedGuidance: any = {};
  if (baziData) {
    const fiveElements = baziData.fiveElements || {};
    const dayMaster = baziData.dayMaster || '';

    // 分析五行强弱
    const elementStrength = Object.entries(fiveElements).sort(
      (a, b) => (b[1] as number) - (a[1] as number)
    );
    const strongestElement = elementStrength[0]?.[0] || '水';
    const weakestElement =
      elementStrength[elementStrength.length - 1]?.[0] || '火';

    // 根据八字五行喜忌确定个性化方位
    personalizedGuidance = {
      // 用神方位（最需要加强的）
      favorableDirection: getDirectionByElement(weakestElement),
      // 忌神方位（需要化解的）
      unfavorableDirection: getDirectionByElement(strongestElement),
      // 财位调整（基于日主）
      wealthDirection: getWealthDirection(dayMaster, weakestElement),
      // 文昌位调整（基于八字）
      studyDirection: getStudyDirection(dayMaster),
      // 健康方位（基于五行平衡）
      healthDirection: getHealthDirection(fiveElements),
      // 颜色建议
      favorableColors: getElementColors(weakestElement),
      unfavorableColors: getElementColors(strongestElement),
      // 材质建议
      favorableMaterials: getElementMaterials(weakestElement),
    };
  }

  // 生成个性化分析报告
  const analysis = {
    degree: degree || 180,
    mountain,
    facing,
    palace,
    currentPeriod,
    nineStars: nineStarMap,
    personalizedGuidance,
    summary: baziData
      ? '【基于您的八字定制的风水分析】\n' +
        `房屋坐${mountain}朝${facing}，属于${palace}。\n` +
        `当前为${currentPeriod}运。\n\n` +
        `根据您的八字（${baziData.dayMaster}日主），五行${personalizedGuidance.favorableDirection?.element || ''}偏弱：\n` +
        `• 您的用神方位：${personalizedGuidance.favorableDirection?.direction || ''}（最需要加强）\n` +
        `• 您的财位：${personalizedGuidance.wealthDirection?.direction || ''}（旺财必选）\n` +
        `• 您的文昌位：${personalizedGuidance.studyDirection?.direction || ''}（利学业事业）\n` +
        `• 需要化解方位：${personalizedGuidance.unfavorableDirection?.direction || ''}（${personalizedGuidance.unfavorableDirection?.element || ''}过旺）\n` +
        `• 健康调理方位：${personalizedGuidance.healthDirection?.direction || ''}`
      : `房屋坐${mountain}朝${facing}，属于${palace}。\n` +
        `当前为${currentPeriod}运，主要吉位：\n` +
        '• 财位：东北方（八白财星）\n' +
        '• 文昌位：东南方（四绿文昌星）\n' +
        '• 贵人位：西北方（六白武曲星）\n' +
        '\n需要注意的位置：\n' +
        '• 五黄位：中宫（避免布置重要物品）\n' +
        '• 二黑位：西南方（注意健康问题）',
    recommendations: baziData
      ? generatePersonalizedRecommendations(baziData, personalizedGuidance)
      : [
          '财位可摆放财神、水晶、鱼缸等招财物品',
          '文昌位适合设置书房或学习区',
          '卧室避免设在五黄位和二黑位',
          '大门朝向吉位有助于纳吉气',
        ],
  };

  return analysis;
}

// 根据五行获取对应方位
function getDirectionByElement(element: string) {
  const elementDirectionMap: any = {
    木: { direction: '东方、东南方', element: '木', description: '生发之气' },
    火: { direction: '南方', element: '火', description: '旺盛之气' },
    土: {
      direction: '中央、东北、西南',
      element: '土',
      description: '稳定之气',
    },
    金: { direction: '西方、西北方', element: '金', description: '收敛之气' },
    水: { direction: '北方', element: '水', description: '智慧之气' },
  };
  return elementDirectionMap[element] || elementDirectionMap.木;
}

// 根据日主和用神确定财位
function getWealthDirection(dayMaster: string, favorableElement: string) {
  // 根据日主五行属性和用神确定最佳财位
  if (dayMaster.includes('甲') || dayMaster.includes('乙')) {
    // 木日主
    return favorableElement === '火'
      ? { direction: '南方', reason: '火为木之财' }
      : { direction: '东北方', reason: '土为木之财' };
  }
  if (dayMaster.includes('丙') || dayMaster.includes('丁')) {
    // 火日主
    return favorableElement === '土'
      ? { direction: '西南方', reason: '土为火之财' }
      : { direction: '西方', reason: '金为火之财' };
  }
  if (dayMaster.includes('戊') || dayMaster.includes('己')) {
    // 土日主
    return favorableElement === '金'
      ? { direction: '西北方', reason: '金为土之财' }
      : { direction: '北方', reason: '水为土之财' };
  }
  if (dayMaster.includes('庚') || dayMaster.includes('辛')) {
    // 金日主
    return favorableElement === '水'
      ? { direction: '北方', reason: '水为金之财' }
      : { direction: '东方', reason: '木为金之财' };
  }
  // 水日主
  return favorableElement === '木'
    ? { direction: '东南方', reason: '木为水之财' }
    : { direction: '南方', reason: '火为水之财' };
}

// 根据日主确定文昌位
function getStudyDirection(dayMaster: string) {
  // 文昌位根据日主天干确定
  const wenchangMap: any = {
    甲: { direction: '东南方', star: '巳位文昌' },
    乙: { direction: '南方', star: '午位文昌' },
    丙: { direction: '西南方', star: '申位文昌' },
    丁: { direction: '西方', star: '酉位文昌' },
    戊: { direction: '西南方', star: '申位文昌' },
    己: { direction: '西方', star: '酉位文昌' },
    庚: { direction: '西北方', star: '亥位文昌' },
    辛: { direction: '北方', star: '子位文昌' },
    壬: { direction: '东北方', star: '寅位文昌' },
    癸: { direction: '东方', star: '卯位文昌' },
  };

  const stem = dayMaster.charAt(0);
  return wenchangMap[stem] || { direction: '东南方', star: '默认文昌' };
}

// 根据五行平衡确定健康方位
function getHealthDirection(fiveElements: any) {
  // 找出最弱的两个元素，这些方位有助于健康
  const sorted = Object.entries(fiveElements).sort(
    (a, b) => (a[1] as number) - (b[1] as number)
  );

  const weakest = sorted[0]?.[0];
  const secondWeakest = sorted[1]?.[0];

  const dirMap: any = {
    木: '东方',
    火: '南方',
    土: '中央',
    金: '西方',
    水: '北方',
  };

  return {
    direction: `${dirMap[weakest]}、${dirMap[secondWeakest]}`,
    reason: `补充${weakest}和${secondWeakest}元素，平衡五行`,
  };
}

// 获取五行对应颜色
function getElementColors(element: string) {
  const colorMap: any = {
    木: ['绿色', '青色', '翠绿色'],
    火: ['红色', '紫色', '橙色'],
    土: ['黄色', '棕色', '米色'],
    金: ['白色', '金色', '银色'],
    水: ['黑色', '蓝色', '灰色'],
  };
  return colorMap[element] || ['白色'];
}

// 获取五行对应材质
function getElementMaterials(element: string) {
  const materialMap: any = {
    木: ['实木', '竹制品', '棉麻'],
    火: ['塑料', '人造材料', '灯具'],
    土: ['陶瓷', '石材', '水晶'],
    金: ['金属', '玻璃', '镜子'],
    水: ['流水装置', '鱼缸', '水景'],
  };
  return materialMap[element] || ['天然材料'];
}

// 生成卧室布置建议
function generateBedroomAdvice(baziData: any, guidance: any) {
  const dayMaster = baziData.dayMaster || '';
  const weakElement = getWeakestElement(baziData.fiveElements);
  const directionInfo = getDirectionByElement(weakElement);

  const advice = [
    `**最佳位置**：${guidance.healthDirection?.direction || directionInfo.direction}`,
    `**床头朝向**：朝${directionInfo.direction}最佳（补充用神）`,
    '**色彩方案**：',
    `  - 床品：${guidance.favorableColors?.join('、')}系`,
    '  - 窗帘：暖色系，透光性好',
    '  - 墙面：米黄、浅粉、浅绿',
    '**装饰物**：',
    `  - 床头两侧放小夜灯（增加${weakElement}元素）`,
    `  - ${guidance.favorableMaterials?.[0]}材质床头柜`,
    `  - ${guidance.favorableColors?.[0]}或${guidance.favorableColors?.[1]}地毯`,
    `**避免**：床头朝${guidance.unfavorableDirection?.direction}（忌神方位）`,
  ];

  return advice.join('\n');
}

// 生成财运增强方案
function generateWealthEnhancementPlan(baziData: any, guidance: any) {
  const steps = [
    '### ⚡ 最高优先级：设置财位',
    `**位置**：${guidance.wealthDirection?.direction}`,
    `**原因**：${guidance.wealthDirection?.reason || ''}`,
    '**具体措施**：',
    `  - 摆放${guidance.favorableColors?.[0]}色聚宝盆或招财摆件`,
    `  - 放置${guidance.favorableMaterials?.[0]}材质的储钱罐`,
    '  - 保持该方位明亮整洁',
    '  - 可放置流水装置（需符合五行喜忌）',
    '',
    '### 🔥 次重点：主要活动区',
    `**位置**：${guidance.favorableDirection?.direction}`,
    '**原因**：这是您的用神方位，活动越多运势越旺',
    '**具体措施**：',
    '  - 客厅沙发面向此方位',
    '  - 办公桌朝向此方位',
    '  - 多在此方位活动',
    '',
    '### 🎨 辅助措施：整体色彩调整',
    `**主色调**：${guidance.favorableColors?.join('、')}（區30%）`,
    `**材质**：${guidance.favorableMaterials?.join('、')}`,
    `**避免**：${guidance.unfavorableColors?.join('、')}大面积使用`,
  ];

  return steps.join('\n');
}

// 生成个性化建议
function generatePersonalizedRecommendations(baziData: any, guidance: any) {
  const recommendations = [];

  // 1. 用神方位布置
  if (guidance.favorableDirection) {
    recommendations.push(
      `【最重要】在${guidance.favorableDirection.direction}设置主要活动区，这是您的用神方位，可大幅提升运势`
    );
  }

  // 2. 财位布置
  if (guidance.wealthDirection) {
    recommendations.push(
      `【旺财必选】${guidance.wealthDirection.direction}是您的最佳财位（${guidance.wealthDirection.reason}），摆放${guidance.favorableColors?.join('、')}色聚宝盆或水晶`
    );
  }

  // 3. 文昌位布置
  if (guidance.studyDirection) {
    recommendations.push(
      `【事业学业】${guidance.studyDirection.direction}是您的文昌位（${guidance.studyDirection.star}），最适合设置书房或办公区`
    );
  }

  // 4. 颜色建议
  if (guidance.favorableColors) {
    recommendations.push(
      `【颜色搭配】多使用${guidance.favorableColors.join('、')}（补充用神），避免${guidance.unfavorableColors?.join('、')}（忌神过旺）`
    );
  }

  // 5. 材质建议
  if (guidance.favorableMaterials) {
    recommendations.push(
      `【装饰材质】优选${guidance.favorableMaterials.join('、')}材质，增强用神能量`
    );
  }

  // 6. 卧室建议
  const dayMaster = baziData.dayMaster || '';
  if (dayMaster.includes('癸') || dayMaster.includes('壬')) {
    recommendations.push(
      '【卧室方位】您是水日主，卧室最好在南方（火）或东方（木），避免北方（水过旺）'
    );
  } else if (dayMaster.includes('甲') || dayMaster.includes('乙')) {
    recommendations.push(
      '【卧室方位】您是木日主，卧室最好在南方（火）或北方（水），避免西方（金克木）'
    );
  }

  return recommendations;
}

// 生成风水AI回答
async function generateFengshuiResponse(
  message: string,
  fengshuiData: any
): Promise<string> {
  // 使用优化后的系统提示词
  const systemPrompt =
    getSystemPrompt('fengshui') +
    '\n\n【当前房屋风水数据】\n' +
    `坐山朝向：坐${fengshuiData.mountain}朝${fengshuiData.facing}\n` +
    `所属宫位：${fengshuiData.palace}\n` +
    `当前运势：${fengshuiData.currentPeriod}运\n` +
    `朝向度数：${fengshuiData.degree}度\n\n` +
    '九宫飞星分布：\n' +
    Object.entries(fengshuiData.nineStars)
      .map(
        ([k, v]: [string, any]) =>
          `${k}（${v.position}）：${v.star}号星，属${v.element}，代表${v.meaning}`
      )
      .join('\n');

  try {
    // 使用AI生成回答
    const models = [
      {
        provider: 'deepseek',
        model: () => openai('deepseek-chat'),
        key: process.env.DEEPSEEK_API_KEY,
      },
      {
        provider: 'openai',
        model: () => openai('gpt-3.5-turbo'),
        key: process.env.OPENAI_API_KEY,
      },
      {
        provider: 'google',
        model: () => google('gemini-pro'),
        key: process.env.GOOGLE_API_KEY,
      },
    ];

    for (const { provider, model, key } of models) {
      if (!key) continue;

      try {
        const result = await generateText({
          model: model(),
          system: systemPrompt,
          prompt: message,
          temperature: 0.7,
        });

        return result.text;
      } catch (error) {
        console.error(`${provider} 调用失败:`, error);
      }
    }

    // 没有AI服务可用，生成本地回答
    return (
      '根据您的房屋风水分析：\n\n' +
      fengshuiData.summary +
      '\n\n' +
      '建议：\n' +
      fengshuiData.recommendations.join('\n')
    );
  } catch (error) {
    console.error('风水AI回答生成失败:', error);
    return fengshuiData.summary;
  }
}

// 结合八字和风水的综合分析
async function generateCombinedFengshuiResponse(
  message: string,
  fengshuiData: any,
  baziData: any
): Promise<string> {
  // 使用优化后的系统提示词，同时标记有八字和房屋数据
  const systemPrompt =
    getSystemPrompt('fengshui') +
    '\n\n【综合分析数据】\n' +
    '\n一、用户八字信息：\n' +
    `日主：${baziData.dayMaster}\n` +
    `五行分析：${JSON.stringify(baziData.fiveElements)}\n` +
    `用神：${baziData.favorableGod || '未计算'}\n` +
    `喜神：${baziData.joyGod || '未计算'}\n` +
    `忌神：${baziData.avoidGod || '未计算'}\n` +
    '\n二、房屋风水数据：\n' +
    `坐山朝向：坐${fengshuiData.mountain}朝${fengshuiData.facing}\n` +
    `所属宫位：${fengshuiData.palace}\n` +
    `当前运势：${fengshuiData.currentPeriod}运\n` +
    `朝向度数：${fengshuiData.degree}度\n` +
    '\n三、九宫飞星分布：\n' +
    Object.entries(fengshuiData.nineStars)
      .map(
        ([k, v]: [string, any]) =>
          `${k}（${v.position}）：${v.star}号星，属${v.element}，代表${v.meaning}`
      )
      .join('\n') +
    `\n\n请严格遵循"算法优先、语言后置"原则，基于以上算法计算结果，结合用户八字喜忌与房屋九宫位特点，提供个性化的风水布局建议。`;

  try {
    // 使用AI生成结合分析
    const models = [
      {
        provider: 'deepseek',
        model: () => openai('deepseek-chat'),
        key: process.env.DEEPSEEK_API_KEY,
      },
      {
        provider: 'openai',
        model: () => openai('gpt-3.5-turbo'),
        key: process.env.OPENAI_API_KEY,
      },
      {
        provider: 'google',
        model: () => google('gemini-pro'),
        key: process.env.GOOGLE_API_KEY,
      },
    ];

    for (const { provider, model, key } of models) {
      if (!key) continue;

      try {
        const result = await generateText({
          model: model(),
          system: systemPrompt,
          prompt: message,
          temperature: 0.7,
        });

        return result.text;
      } catch (error) {
        console.error(`${provider} 调用失败:`, error);
      }
    }

    // 本地综合分析（使用新的详细建议函数）
    const fiveElements = baziData.fiveElements;
    const strongElement = getStrongestElement(fiveElements);
    const weakElement = getWeakestElement(fiveElements);
    const guidance = fengshuiData.personalizedGuidance || {};

    // 检查用户关注点
    const isWealthFocused =
      message.includes('财运') ||
      message.includes('旺财') ||
      message.includes('财位');

    let detailedAdvice = '';
    if (isWealthFocused && guidance.wealthDirection) {
      detailedAdvice =
        '\n\n## 💰 您的专属旺财方案\n\n' +
        generateWealthEnhancementPlan(baziData, guidance);
    }

    return (
      '🎉 完美！现在我可以为您提供完整的个性化风水旺财方案了！\n\n' +
      '---\n\n' +
      '## 📏 九宫飞星分析（基于您的房屋）\n\n' +
      '**房屋信息**：\n' +
      `- 坐向：坐${fengshuiData.mountain}朝${fengshuiData.facing}\n` +
      `- 朝向度数：${fengshuiData.degree}°\n` +
      `- 建成年份：属${fengshuiData.currentPeriod}运房屋\n` +
      `- 所属宫位：${fengshuiData.palace}\n\n` +
      '---\n\n' +
      '## 🔥 您的专属旺财方案（基于八字+九宫飞星）\n\n' +
      `### ⭐ 第一优先级：${guidance.favorableDirection?.direction || '南方'}（您的最佳财位）\n\n` +
      '**为什么是这个方位**：\n' +
      `1. 您八字${strongElement}旺${weakElement}弱，${guidance.favorableDirection?.direction}属${weakElement}，是您的用神方位\n` +
      '2. 结合九宫飞星，该方位为当旺星\n' +
      `3. ${baziData.dayMaster}日主，${guidance.wealthDirection?.direction}为您的正财方位\n\n` +
      '**具体布置**：\n' +
      `- 客厅沙发区设置在${guidance.favorableDirection?.direction}，增加停留时间\n` +
      `- 在${guidance.wealthDirection?.direction}墙面挂${guidance.favorableColors?.[0]}色装饰画\n` +
      `- 摆放${guidance.favorableColors?.[0]}色聚宝盆或${guidance.favorableMaterials?.[0]}材质摆件\n` +
      '- 安装暖色调射灯，保持明亮\n\n' +
      detailedAdvice +
      '\n\n---\n\n' +
      '## 🛏️ 卧室布置建议\n\n' +
      generateBedroomAdvice(baziData, guidance) +
      '\n\n---\n\n' +
      '## 💡 特别提醒\n\n' +
      '1. **渐进式调整**：不需要一次性大改，可以逐步更换\n' +
      `2. **保持整洁**：尤其是${guidance.wealthDirection?.direction}财位，务必保持整洁明亮\n` +
      `3. **活用空间**：多在${guidance.favorableDirection?.direction}活动，增强接收能量\n` +
      '4. **心态积极**：风水是辅助，主要还是靠自己努力\n\n' +
      '🔮 **预期效果**：完成以上布局后，预计3-6个月内您会感受到财运逐步改善、精神状态更好！'
    );
  } catch (error) {
    console.error('综合分析失败:', error);
    return fengshuiData.summary;
  }
}

// 本地智能回答生成（当AI服务不可用时）
function generateLocalSmartResponse(question: string, baziData: any): string {
  const dayMaster = baziData.dayMaster;
  const fiveElements = baziData.fiveElements;

  // 根据问题关键词生成相应的回答
  if (question.includes('用神') || question.includes('喜神')) {
    return (
      '根据您的八字分析：\n\n' +
      `您的日主为「${dayMaster}」，五行分布为：\n` +
      `${Object.entries(fiveElements)
        .map(([k, v]) => `${k}：${v}`)
        .join('、')}\n\n` +
      '基于五行平衡原理，您的用神可能是五行中较弱的元素，需要加强。\n' +
      '建议在生活中多接触相应的颜色、方位和行业。'
    );
  }

  if (question.includes('财运')) {
    return (
      '基于您的八字命盘：\n\n' +
      `日主「${dayMaster}」的财运分析：\n` +
      '1. 财星状态：需要查看命盘中的正财、偏财星\n' +
      `2. 五行平衡：${JSON.stringify(fiveElements)}\n` +
      '3. 流年影响：不同年份的财运起伏\n\n' +
      '建议把握机遇，稳健理财，避免冒险投资。'
    );
  }

  if (question.includes('事业')) {
    return (
      '您的事业运势分析：\n\n' +
      `日主「${dayMaster}」的特质：\n` +
      `- 性格倾向：${dayMaster.includes('阳') ? '积极主动' : '稳重内敛'}\n` +
      '- 适合行业：根据五行喜忌选择\n' +
      '- 发展方向：结合大运流年规划\n\n' +
      '建议发挥自身优势，选择适合的发展方向。'
    );
  }

  // 通用回答
  return (
    '根据您的八字命盘分析：\n\n' +
    `四柱：${baziData.yearPillar?.stem}${baziData.yearPillar?.branch} ` +
    `${baziData.monthPillar?.stem}${baziData.monthPillar?.branch} ` +
    `${baziData.dayPillar?.stem}${baziData.dayPillar?.branch} ` +
    `${baziData.hourPillar?.stem}${baziData.hourPillar?.branch}\n\n` +
    `关于「${question.substring(0, 20)}...」的问题：\n` +
    '这需要结合您的命盘具体分析。建议您提供更多具体问题，我可以给出更详细的解答。'
  );
}

// 生成八字响应（基于算法数据）
function generateBaziResponse(data: any): string {
  const { pillars, tenGods, dayMaster } = data;

  let response = '根据您的八字分析：\n\n';

  if (dayMaster) {
    response += `日主：${dayMaster}\n`;
  }

  if (pillars) {
    response += '四柱：\n';
    response += `年柱：${pillars.year?.stem}${pillars.year?.branch}\n`;
    response += `月柱：${pillars.month?.stem}${pillars.month?.branch}\n`;
    response += `日柱：${pillars.day?.stem}${pillars.day?.branch}\n`;
    response += `时柱：${pillars.hour?.stem}${pillars.hour?.branch}\n`;
  }

  if (tenGods && tenGods.length > 0) {
    response += '\n十神分析：\n';
    tenGods.forEach((god: any) => {
      response += `${god.name}：${god.description}\n`;
    });
  }

  return response;
}

// 生成玄空响应（基于算法数据）
function generateXuankongResponse(data: any): string {
  const { facing, yun, flyingStars } = data;

  let response = '根据玄空风水分析：\n\n';

  if (facing) {
    response += `房屋坐向：${facing}度\n`;
  }

  if (yun) {
    response += `当前运势：${yun}运\n`;
  }

  if (flyingStars) {
    response += '\n九宫飞星：\n';
    // 这里可以添加飞星的详细解读
    response += '财位、文昌位、桃花位等方位已标注。\n';
  }

  return response;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 2. 验证请求数据
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);
    const { message, context } = validatedData;

    // 3. 检测问题类型
    const { isBaziQuestion, isFengshuiQuestion } = detectQuestionType(message);

    // 4. 处理命理相关问题
    if (isBaziQuestion) {
      // 检查是否已有生辰信息（来自上下文）
      let birthInfo = context?.birthInfo;
      let calculatedBazi = context?.calculatedBazi;

      // 如果没有上下文中的生辰信息，尝试从当前消息解析
      if (!birthInfo) {
        const parsed = parseSimpleBirthInfo(message);
        if (parsed) {
          birthInfo = parsed;
        }
      }

      // 如果有生辰信息但还没计算八字，立即计算
      if (birthInfo && !calculatedBazi) {
        try {
          console.log('计算八字数据:', birthInfo);
          // 构造ISO日期时间格式
          const isoDateTime = `${birthInfo.date}T${birthInfo.time}:00`;
          calculatedBazi = await computeBaziSmart({
            datetime: isoDateTime,
            gender: birthInfo.gender || 'male',
            timezone: 'Asia/Shanghai',
            isTimeKnown: true,
            preferredLocale: 'zh-CN',
          });
        } catch (error) {
          console.error('八字计算错误:', error);
        }
      }

      // 如果有完整的八字数据，使用AI回答问题
      if (calculatedBazi) {
        const result = await creditsManager.executeWithCredits(
          session.user.id,
          'aiChat',
          async () => {
            // 使用算法数据 + AI组织语言
            const aiResponse = await generateAIResponse(
              message,
              calculatedBazi,
              context?.originalQuestion
            );
            return aiResponse;
          }
        );

        if (result.type === 'insufficient') {
          return NextResponse.json(
            {
              error: result.message,
              required: result.required,
              balance: result.balance,
            },
            { status: 402 }
          );
        }

        return NextResponse.json({
          response: result.result,
          creditsUsed: result.creditsUsed,
          type: 'ai_with_algorithm',
          birthInfo,
          calculatedBazi,
        });
      }

      // 没有生辰信息，要求用户提供
      return NextResponse.json({
        response:
          '为了准确分析您的八字命理，我需要您的出生信息：\n\n' +
          '请提供：\n' +
          '1. 出生年月日（如：1990年1月1日）\n' +
          '2. 出生时间（如：下午3点30分）\n' +
          '3. 性别（男/女）\n' +
          '4. 出生地点（可选，用于真太阳时校正）\n\n' +
          '例如：「1990年1月1日下午3点30分，男，北京」',
        creditsUsed: 0,
        type: 'need_birth_info',
        originalQuestion: message, // 保存原始问题
      });
    }

    // 5. 处理用户提供生辰信息的情况
    const parsedBirthInfo = parseSimpleBirthInfo(message);
    if (parsedBirthInfo && !isBaziQuestion) {
      // 用户提供了生辰信息，但没有具体问题
      try {
        // 构造ISO日期时间格式
        const isoDateTime = `${parsedBirthInfo.date}T${parsedBirthInfo.time}:00`;
        const calculatedBazi = await computeBaziSmart({
          datetime: isoDateTime,
          gender: parsedBirthInfo.gender || 'male',
          timezone: 'Asia/Shanghai',
          isTimeKnown: true,
          preferredLocale: 'zh-CN',
        });

        // 检查计算结果
        if (!calculatedBazi) {
          return NextResponse.json({
            response: '抱歉，八字计算未成功。请检查您提供的时间信息是否正确。',
            creditsUsed: 0,
            type: 'error',
          });
        }

        // 生成基础八字信息
        const basicInfo =
          '已识别您的生辰信息并完成八字排盘：\n\n' +
          `📅 出生时间：${parsedBirthInfo.date} ${parsedBirthInfo.time}\n` +
          `👤 性别：${parsedBirthInfo.gender === 'male' ? '男' : '女'}\n\n` +
          '**四柱八字**\n' +
          `年柱：${(calculatedBazi as any).yearPillar?.stem || ''}${(calculatedBazi as any).yearPillar?.branch || ''}\n` +
          `月柱：${(calculatedBazi as any).monthPillar?.stem || ''}${(calculatedBazi as any).monthPillar?.branch || ''}\n` +
          `日柱：${(calculatedBazi as any).dayPillar?.stem || ''}${(calculatedBazi as any).dayPillar?.branch || ''}\n` +
          `时柱：${(calculatedBazi as any).hourPillar?.stem || ''}${(calculatedBazi as any).hourPillar?.branch || ''}\n\n` +
          `**日主**：${(calculatedBazi as any).dayMaster || '未知'}\n\n` +
          '现在您可以询问任何关于命理的问题，比如：\n' +
          '• 我的用神是什么？\n' +
          '• 今年财运如何？\n' +
          '• 适合什么职业？\n' +
          '• 婚姻感情运势如何？';

        return NextResponse.json({
          response: basicInfo,
          creditsUsed: 0,
          type: 'birth_info_saved',
          birthInfo: parsedBirthInfo,
          calculatedBazi,
        });
      } catch (error) {
        console.error('八字计算失败:', error);
        return NextResponse.json({
          response: '抱歉，八字计算出现问题。请检查您提供的时间信息是否正确。',
          creditsUsed: 0,
          type: 'error',
        });
      }
    }

    // 6. 处理风水相关问题
    if (isFengshuiQuestion) {
      // 【核心原则】风水分析必须基于八字命理
      // 先检查是否有八字数据
      const userBaziData = context?.calculatedBazi;

      // 6.1 如果没有八字数据，要求先提供
      if (!userBaziData) {
        return NextResponse.json({
          response:
            '要为您提供**个性化的风水布局方案**，我需要先了解您的八字信息。这样才能根据您的五行喜忌，确定最适合您的财位、文昌位等方位。\n\n' +
            '请告诉我：\n' +
            '📅 您的出生年月日时（请注明公历或农历）\n' +
            '👤 性别\n' +
            '📍 出生地点（用于时区校正）\n\n' +
            '例如：“我是1973年1月7日凌晨2点30分在岳阳出生的男性”',
          creditsUsed: 0,
          type: 'need_bazi_for_fengshui',
          originalQuestion: message,
        });
      }

      // 6.2 有八字但没有房屋朝向，引导提供
      const hasDirection = hasDirectionInfo(message);

      if (!hasDirection) {
        // 格式化五行信息
        const fiveElements = userBaziData.fiveElements || {};
        const weakElement = getWeakestElement(fiveElements);
        const strongElement = getStrongestElement(fiveElements);

        return NextResponse.json({
          response:
            '✨ 太好了！我已经知道您的八字特征：\n\n' +
            '**您的命理特点**：\n' +
            `- 日主：${userBaziData.dayMaster || '未知'}\n` +
            `- 五行分析：${formatFiveElements(fiveElements)}\n` +
            `- 需要补充的元素：${weakElement}\n\n` +
            '要为您量身定制房屋布局方案，我还需要知道：\n\n' +
            '🏠 **您的房屋朝向信息**：\n' +
            '1. 房屋的坐向（例如：坐北朝南、坐东朝西）或\n' +
            '2. 大门朝向度数（用手机指南针APP站在门外测量）\n\n' +
            '📅 房屋建成年份（可选，用于确定建筑运势）\n\n' +
            '例如：“我家是坐北朝南的房子，2015年建成”\n\n' +
            '有了这些信息，我将结合您的八字和**九宫飞星**为您计算：\n' +
            '✓ 您的专属财位（基于日主和五行）\n' +
            '✓ 最适合的卧室方位\n' +
            '✓ 事业文昌位\n' +
            '✓ 需要化解的煞位\n' +
            '✓ 个性化色彩和材质建议\n\n' +
            '💡 **为什么需要朝向**：\n' +
            '传统风水只能告诉您“财位在东南角”，但基于您的八字，您真正的旺财方位可能完全不同！结合九宫飞星，我能找到最适合**您**的财位。',
          creditsUsed: 0,
          type: 'need_house_direction',
          originalQuestion: message,
        });
      }

      // 检查是否已有房屋信息（来自上下文）
      let houseInfo = context?.houseInfo;
      let calculatedFengshui = context?.calculatedFengshui;

      // 如果没有上下文中的房屋信息，尝试从当前消息解析
      if (!houseInfo) {
        const parsed = parseHouseDirection(message);
        if (parsed?.degree) {
          houseInfo = parsed;
        }
      }

      // 如果有八字和房屋信息，计算个性化风水
      if (houseInfo && userBaziData && !calculatedFengshui) {
        try {
          // 【核心】基于用户八字的个性化风水计算
          calculatedFengshui = generatePersonalizedFengshuiAnalysis(
            houseInfo,
            userBaziData
          );
        } catch (error) {
          console.error('风水计算错误:', error);
        }
      }

      // 如果有完整的风水数据，使用AI回答问题
      if (calculatedFengshui && userBaziData) {
        // 必须结合八字分析
        const combinedAnalysis = await generateCombinedFengshuiResponse(
          message,
          calculatedFengshui,
          userBaziData
        );

        const result = await creditsManager.executeWithCredits(
          session.user.id,
          'xuankong',
          async () => combinedAnalysis
        );

        if (result.type === 'insufficient') {
          return NextResponse.json(
            {
              error: result.message,
              required: result.required,
              balance: result.balance,
            },
            { status: 402 }
          );
        }

        try {
          const { recordChatRoundAndTryActivate } = await import(
            '@/lib/growth/activation'
          );
          await recordChatRoundAndTryActivate(session.user.id);
        } catch {}
        return NextResponse.json({
          response: result.result,
          creditsUsed: result.creditsUsed,
          type: 'ai_with_fengshui',
          houseInfo,
          calculatedFengshui,
        });
      }

      // 没有房屋信息，要求用户提供
      return NextResponse.json({
        response:
          '为了准确进行风水分析，我需要您的房屋信息：\n\n' +
          '请提供以下信息：\n' +
          '1. 房屋朝向（如：坐北朝南、朝东南等）\n' +
          '2. 具体度数（可选，如：朝向120度）\n' +
          '3. 建造年份（可选）\n' +
          '4. 房屋地址（可选）\n\n' +
          '例如：「我的房子坐北朝南，2010年建造」\n' +
          '或者：「朝向东南120度」',
        creditsUsed: 0,
        type: 'need_house_info',
        originalQuestion: message, // 保存原始问题
      });
    }

    // 7. 处理用户提供房屋信息的情况
    const parsedHouseInfo = parseHouseInfo(message);
    if (parsedHouseInfo && !isFengshuiQuestion && !isBaziQuestion) {
      // 用户提供了房屋信息，但没有具体问题
      try {
        const calculatedFengshui =
          generatePersonalizedFengshuiAnalysis(parsedHouseInfo);

        // 生成基础风水信息
        const basicInfo =
          '已识别您的房屋信息并完成风水分析：\n\n' +
          `🏠 房屋朝向：${parsedHouseInfo.facing || parsedHouseInfo.degree + '度'}\n` +
          (parsedHouseInfo.buildYear
            ? `📅 建造年份：${parsedHouseInfo.buildYear}年\n`
            : '') +
          '\n**九宫飞星分析**\n' +
          `${calculatedFengshui.summary}\n\n` +
          '现在您可以询问任何关于风水的问题，比如：\n' +
          '• 哪个方位是财位？\n' +
          '• 卧室应该安排在哪里？\n' +
          '• 如何布置能增强财运？\n' +
          '• 有什么风水禁忌需要注意？';

        return NextResponse.json({
          response: basicInfo,
          creditsUsed: 0,
          type: 'house_info_saved',
          houseInfo: parsedHouseInfo,
          calculatedFengshui,
        });
      } catch (error) {
        console.error('风水计算失败:', error);
        return NextResponse.json({
          response: '抱歉，风水计算出现问题。请检查您提供的房屋信息是否正确。',
          creditsUsed: 0,
          type: 'error',
        });
      }
    }

    // 7. 通用AI对话（非命理风水问题）
    const result = await creditsManager.executeWithCredits(
      session.user.id,
      'aiChat',
      async () => {
        // 使用简化的系统提示词进行通用对话
        const systemPrompt = AI_FENGSHUI_QUICK_PROMPT;

        try {
          const aiResponse = await generateText({
            model: openai('gpt-3.5-turbo'),
            system: systemPrompt,
            prompt: message,
            temperature: 0.7,
            maxRetries: 3,
          });
          return aiResponse.text;
        } catch (error) {
          console.error('AI调用失败:', error);
          return '我是QiFlow AI助手，很高兴为您服务。请问有什么可以帮助您的吗？';
        }
      }
    );

    if (result.type === 'insufficient') {
      return NextResponse.json(
        {
          error: result.message,
          required: result.required,
          balance: result.balance,
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      response: result.result,
      creditsUsed: result.creditsUsed,
      type: 'general_chat',
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
