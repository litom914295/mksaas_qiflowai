/**
 * 八字分析 API 接口（简化版）
 * POST /api/bazi/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 请求参数验证
const AnalyzeRequestSchema = z.object({
  datetime: z.string(), // ISO format: YYYY-MM-DDTHH:mm
  gender: z.enum(['male', 'female']),
  timezone: z.string().default('Asia/Shanghai'),
  isTimeKnown: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // 1. 参数验证
    const body = await request.json();
    const validationResult = AnalyzeRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: '参数错误',
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      );
    }

    const params = validationResult.data;
    
    // 2. 解析日期时间
    const datetime = new Date(params.datetime);
    if (isNaN(datetime.getTime())) {
      return NextResponse.json(
        { error: '无效的日期时间格式' },
        { status: 400 }
      );
    }

    // 3. 执行八字分析
    // TODO: 集成完整的 bazi-pro 分析引擎
    // 目前返回模拟数据
    const mockResult = generateMockBaziAnalysis(datetime, params.gender);

    return NextResponse.json({
      success: true,
      data: mockResult,
    });

  } catch (error: any) {
    console.error('八字分析错误:', error);
    return NextResponse.json(
      { error: error.message || '分析失败，请稍后重试' },
      { status: 500 }
    );
  }
}

/**
 * 生成模拟的八字分析结果（用于测试）
 */
function generateMockBaziAnalysis(datetime: Date, gender: string) {
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  const day = datetime.getDate();
  const hour = datetime.getHours();

  // 简化的天干地支数组
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const elements = ['木', '火', '土', '金', '水'];

  // 模拟四柱计算
  const yearStem = heavenlyStems[year % 10];
  const yearBranch = earthlyBranches[year % 12];
  const monthStem = heavenlyStems[month % 10];
  const monthBranch = earthlyBranches[month % 12];
  const dayStem = heavenlyStems[day % 10];
  const dayBranch = earthlyBranches[day % 12];
  const hourStem = heavenlyStems[Math.floor(hour / 2) % 10];
  const hourBranch = earthlyBranches[Math.floor(hour / 2) % 12];

  return {
    chart: {
      pillars: {
        year: { 
          heavenlyStem: yearStem, 
          earthlyBranch: yearBranch,
          nayin: '海中金',
          hiddenStems: [yearBranch]
        },
        month: { 
          heavenlyStem: monthStem, 
          earthlyBranch: monthBranch,
          nayin: '炉中火',
          hiddenStems: [monthBranch]
        },
        day: { 
          heavenlyStem: dayStem, 
          earthlyBranch: dayBranch,
          nayin: '大林木',
          hiddenStems: [dayBranch]
        },
        hour: { 
          heavenlyStem: hourStem, 
          earthlyBranch: hourBranch,
          nayin: '路旁土',
          hiddenStems: [hourBranch]
        },
      },
      dayMaster: dayStem,
      gender: gender === 'male' ? '男' : '女',
    },
    wuxing: {
      elements: {
        木: 20,
        火: 15,
        土: 25,
        金: 20,
        水: 20,
      },
      dayMasterStrength: 65,
      balance: {
        strongest: '土',
        weakest: '火',
        balanced: false,
      }
    },
    yongshen: {
      primary: {
        element: '金',
        reason: '日主偏强，取金泄身为用神',
      },
      secondary: {
        element: '水',
        reason: '水可助金，为喜神',
      },
      avoid: {
        element: '土',
        reason: '土过旺，为忌神',
      },
      recommendations: [
        '适宜从事金融、法律、机械等属金行业',
        '居住环境宜西方或西北方',
        '穿衣可选白色、金色、银色',
      ]
    },
    pattern: {
      primary: '正官格',
      strength: 75,
      details: [{
        name: '正官格',
        description: '日主中和，正官有力，为人正直，适合从事管理工作',
        advantages: ['正直守信', '责任心强', '善于管理'],
        challenges: ['过于保守', '缺乏变通'],
      }],
      subPatterns: ['食神生财'],
    },
    shensha: {
      jiShen: [
        {
          name: '天乙贵人',
          description: '遇事有贵人相助，化险为夷',
          strength: 85,
          location: '年支'
        },
        {
          name: '文昌星',
          description: '聪明好学，利于学业和文化事业',
          strength: 70,
          location: '月支'
        }
      ],
      xiongShen: [
        {
          name: '孤辰',
          description: '感情易有波折，需注意人际关系',
          strength: 50,
          location: '日支',
          advice: '多与人交往，培养社交能力'
        }
      ]
    },
    interpretation: {
      summary: {
        overview: '整体命局中和偏强，五行土旺需金泄，格局清正，适合稳定发展。',
        strengths: [
          '性格稳重可靠，责任心强',
          '做事认真细致，善于计划',
          '财运较好，适合理财投资',
        ],
        challenges: [
          '有时过于谨慎，错失机会',
          '人际关系需要主动经营',
          '健康方面注意脾胃保养',
        ]
      },
      detailed: {
        personality: [
          '基本性格：稳重务实，注重细节，责任感强',
          '优点：踏实可靠、有耐心、善于积累',
          '缺点：有时过于保守、缺乏冒险精神',
        ],
        career: [
          '适合从事金融、会计、法律等稳定行业',
          '中年后事业运势上升，职位稳步提升',
          '不宜频繁跳槽，长期发展为佳',
        ],
        wealth: [
          '整体财运平稳，正财运较好',
          '适合储蓄理财，不宜投机冒险',
          '中晚年财富积累明显',
        ],
        relationships: [
          '感情发展较晚，但婚姻稳定',
          '需要主动表达，避免过于被动',
          '配偶多为贤良淑德，相互扶持',
        ],
        health: [
          '整体健康状况良好',
          '注意脾胃消化系统保养',
          '适度运动，保持规律作息',
        ]
      }
    }
  };
}
