/**
 * 前端集成示例
 *
 * 展示如何在前端组件中使用 unified 系统
 * 并通过适配器与现有 UI 组件（如 ComprehensiveAnalysisPanel）集成
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

import { UnifiedFengshuiEngine, adaptToFrontend } from '../index';
import type { UnifiedAnalysisInput } from '../types';

/**
 * 示例1: 基础用法 - 在 React 组件中使用
 */
export async function example1_BasicUsageInReactComponent() {
  // 1. 准备输入数据
  const input: UnifiedAnalysisInput = {
    bazi: {
      birthYear: 1985,
      birthMonth: 3,
      birthDay: 15,
      birthHour: 10,
      gender: 'male',
      dayMaster: 'wood',
      favorableElements: ['water', 'wood'],
      unfavorableElements: ['metal'],
    },
    house: {
      facing: 180, // 正南
      buildYear: 2010,
      location: {
        lat: 31.2304,
        lon: 121.4737,
        address: '上海市黄浦区',
      },
      floor: 8,
      layout: [
        {
          id: 'bedroom1',
          type: 'bedroom',
          name: '主卧',
          palace: 1,
          area: 20,
          isPrimary: true,
        },
        {
          id: 'living1',
          type: 'living',
          name: '客厅',
          palace: 5,
          area: 35,
          isPrimary: true,
        },
      ],
    },
    time: {
      currentYear: 2024,
      currentMonth: 12,
    },
    options: {
      depth: 'comprehensive',
      includeLiunian: true,
      includePersonalization: true,
      includeScoring: true,
      includeWarnings: true,
    },
  };

  // 2. 执行分析
  const engine = new UnifiedFengshuiEngine();
  const unifiedResult = await engine.analyze(input);

  // 3. 适配为前端组件格式
  const frontendResult = adaptToFrontend(unifiedResult);

  // 4. 传递给前端组件
  // <ComprehensiveAnalysisPanel analysisResult={frontendResult} />

  return frontendResult;
}

/**
 * 示例2: 在 Next.js API Route 中使用
 */
export async function example2_NextjsApiRoute(requestData: any) {
  try {
    // 1. 从请求中提取数据
    const { bazi, house, time, options } = requestData;

    // 2. 构建输入
    const input: UnifiedAnalysisInput = {
      bazi: {
        birthYear: bazi.year,
        birthMonth: bazi.month,
        birthDay: bazi.day,
        birthHour: bazi.hour,
        gender: bazi.gender,
      },
      house: {
        facing: house.facing,
        buildYear: house.buildYear,
        location: house.location,
        floor: house.floor,
        layout: house.rooms,
      },
      time: {
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
      },
      options: {
        depth: options?.depth || 'standard',
        includeLiunian: options?.includeLiunian ?? true,
        includePersonalization: options?.includePersonalization ?? true,
        includeScoring: true,
        includeWarnings: true,
      },
    };

    // 3. 执行分析
    const engine = new UnifiedFengshuiEngine();
    const unifiedResult = await engine.analyze(input);

    // 4. 适配为前端格式
    const frontendResult = adaptToFrontend(unifiedResult);

    // 5. 返回 JSON 响应
    return {
      success: true,
      data: frontendResult,
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: unifiedResult.metadata.version,
        computationTime: unifiedResult.metadata.computationTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '分析失败',
    };
  }
}

/**
 * 示例3: 在 React Server Component 中使用
 */
export async function example3_ReactServerComponent(params: {
  userId: string;
  houseId: string;
}) {
  // 1. 从数据库获取用户和房屋数据
  // const userData = await db.user.findUnique({ where: { id: params.userId } });
  // const houseData = await db.house.findUnique({ where: { id: params.houseId } });

  // 模拟数据
  const userData = {
    birthYear: 1990,
    birthMonth: 5,
    birthDay: 20,
    gender: 'female' as const,
  };

  const houseData = {
    facing: 90, // 正东
    buildYear: 2015,
    location: { lat: 39.9042, lon: 116.4074 },
  };

  // 2. 构建输入
  const input: UnifiedAnalysisInput = {
    bazi: {
      ...userData,
      dayMaster: 'fire',
      favorableElements: ['wood', 'fire'],
      unfavorableElements: ['water'],
    },
    house: {
      ...houseData,
    },
    time: {
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1,
    },
    options: {
      depth: 'comprehensive',
      includeLiunian: true,
      includePersonalization: true,
      includeScoring: true,
      includeWarnings: true,
    },
  };

  // 3. 执行分析（使用缓存）
  const engine = new UnifiedFengshuiEngine();
  const unifiedResult = await engine.analyze(input);

  // 4. 适配为前端格式
  const frontendResult = adaptToFrontend(unifiedResult);

  // 5. 直接在服务器组件中渲染
  return frontendResult;
}

/**
 * 示例4: 渐进式迁移 - 同时使用旧系统和新系统
 */
export async function example4_GradualMigration(input: UnifiedAnalysisInput) {
  // 新系统分析
  const engine = new UnifiedFengshuiEngine();
  const newResult = await engine.analyze(input);
  const adaptedResult = adaptToFrontend(newResult);

  // 可以与旧系统的结果进行比较或合并
  // const oldResult = await oldSystemAnalyze(...);

  // 返回新系统结果
  return {
    result: adaptedResult,
    system: 'unified',
    version: newResult.metadata.version,
  };
}

/**
 * 示例5: 批量分析 - 为多个用户或房屋生成报告
 */
export async function example5_BatchAnalysis(
  users: Array<{ bazi: any }>,
  houses: Array<{ house: any }>
) {
  const engine = new UnifiedFengshuiEngine();
  const results = [];

  for (let i = 0; i < Math.min(users.length, houses.length); i++) {
    const input: UnifiedAnalysisInput = {
      bazi: users[i].bazi,
      house: houses[i].house,
      time: {
        currentYear: new Date().getFullYear(),
        currentMonth: new Date().getMonth() + 1,
      },
      options: {
        depth: 'standard',
        includeLiunian: true,
        includeScoring: true,
      },
    };

    const unifiedResult = await engine.analyze(input);
    const frontendResult = adaptToFrontend(unifiedResult);

    results.push({
      userId: users[i],
      houseId: houses[i],
      analysis: frontendResult,
    });
  }

  return results;
}

/**
 * 示例6: 实时更新 - WebSocket 或 Server-Sent Events
 */
export async function example6_RealtimeUpdate(
  input: UnifiedAnalysisInput,
  onProgress: (progress: number, message: string) => void
) {
  const engine = new UnifiedFengshuiEngine();

  // 模拟进度更新
  onProgress(10, '正在初始化分析引擎...');

  // 执行基础分析
  onProgress(30, '正在计算玄空飞星盘...');

  // 执行个性化分析
  onProgress(50, '正在进行个性化分析...');

  // 执行智能评分
  onProgress(70, '正在计算智能评分...');

  // 生成预警
  onProgress(90, '正在生成智能预警...');

  // 完整分析
  const unifiedResult = await engine.analyze(input);
  const frontendResult = adaptToFrontend(unifiedResult);

  onProgress(100, '分析完成！');

  return frontendResult;
}

/**
 * 示例7: 错误处理和降级策略
 */
export async function example7_ErrorHandling(input: UnifiedAnalysisInput) {
  try {
    // 尝试使用 unified 系统
    const engine = new UnifiedFengshuiEngine();
    const unifiedResult = await engine.analyze(input);
    const frontendResult = adaptToFrontend(unifiedResult);

    return {
      success: true,
      result: frontendResult,
      system: 'unified',
    };
  } catch (error) {
    console.error('Unified system failed:', error);

    // 降级到基础分析
    try {
      // const basicResult = await basicAnalyze(...);
      return {
        success: true,
        result: null, // basicResult,
        system: 'fallback',
        warning: '使用了降级分析',
      };
    } catch (fallbackError) {
      console.error('Fallback system failed:', fallbackError);

      return {
        success: false,
        error: '分析失败，请稍后重试',
        system: 'none',
      };
    }
  }
}
