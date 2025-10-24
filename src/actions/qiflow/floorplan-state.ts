'use server';

/**
 * 户型图状态 Server Actions
 * 处理户型图状态的数据库持久化操作
 */

import { getDb } from '@/db';
import { fengshuiAnalysis } from '@/db/schema-qiflow';
import { getSession } from '@/lib/server';
import type {
  FloorplanState,
  MigrationDataItem,
  MigrationResult,
  SaveResult,
} from '@/types/floorplan';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { deleteCloudFile } from '@/lib/qiflow/floorplan-storage';

/**
 * Zod Schema - 户型图状态验证
 */
const FloorplanStateSchema = z.object({
  id: z.string().min(1),
  name: z.string().optional(),
  imageData: z.string().min(1),
  imageType: z.enum(['url', 'base64']),
  storageKey: z.string().optional(),
  rotation: z.number().min(0).max(360),
  scale: z.number().min(0.1).max(10),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  showOverlay: z.boolean(),
  showLabels: z.boolean(),
  overlayOpacity: z.number().min(0).max(1),
  gridLineWidth: z.number().min(0.5).max(10),
  analysisId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

/**
 * 保存户型图状态
 * @param analysisId 分析 ID
 * @param state 户型图状态
 * @returns 保存结果
 */
export async function saveFloorplanState(
  analysisId: string,
  state: FloorplanState
): Promise<SaveResult> {
  try {
    // 1. 验证输入
    const validatedState = FloorplanStateSchema.parse(state);

    // 2. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '未登录或会话已过期',
      };
    }

    const userId = session.user.id;

    // 3. 查找现有分析记录
    const db = await getDb();
    const existingAnalysis = await db
      .select()
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          eq(fengshuiAnalysis.id, analysisId)
        )
      )
      .limit(1);

    const now = new Date();

    if (existingAnalysis.length > 0) {
      // 4a. 更新现有记录
      await db
        .update(fengshuiAnalysis)
        .set({
          floorPlanUrl: validatedState.imageType === 'url' ? validatedState.imageData : null,
          floorPlanData: validatedState as any, // 存储完整状态
          updatedAt: now,
        })
        .where(eq(fengshuiAnalysis.id, analysisId));
    } else {
      // 4b. 创建新记录（边缘情况：如果分析记录不存在）
      // 注意：通常不应该走到这里，因为分析记录应该在玄空分析时创建
      console.warn('[Floorplan State] 创建新的风水分析记录:', analysisId);
      
      // 这里需要基础的风水分析数据，暂时使用占位符
      await db.insert(fengshuiAnalysis).values({
        id: analysisId,
        userId,
        buildingType: 'residential',
        facingDirection: 0,
        sittingDirection: 180,
        moveInDate: now,
        period: 9,
        flyingStars: {},
        analysis: {},
        floorPlanUrl: validatedState.imageType === 'url' ? validatedState.imageData : null,
        floorPlanData: validatedState as any,
        creditsUsed: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[Floorplan State] 保存失败:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `数据验证失败: ${error.errors.map(e => e.message).join(', ')}`,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : '保存失败',
    };
  }
}

/**
 * 加载户型图状态
 * @param analysisId 分析 ID
 * @returns 户型图状态或 null
 */
export async function loadFloorplanState(
  analysisId: string
): Promise<FloorplanState | null> {
  try {
    // 1. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }

    const userId = session.user.id;

    // 2. 查询数据库
    const db = await getDb();
    const result = await db
      .select({
        floorPlanData: fengshuiAnalysis.floorPlanData,
      })
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          eq(fengshuiAnalysis.id, analysisId)
        )
      )
      .limit(1);

    if (result.length === 0 || !result[0].floorPlanData) {
      return null;
    }

    // 3. 验证并返回数据
    const state = result[0].floorPlanData as FloorplanState;
    return FloorplanStateSchema.parse(state);
  } catch (error) {
    console.error('[Floorplan State] 加载失败:', error);
    return null;
  }
}

/**
 * 列出用户的所有户型图方案
 * @returns 户型图状态数组
 */
export async function listFloorplanStates(): Promise<FloorplanState[]> {
  try {
    // 1. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return [];
    }

    const userId = session.user.id;

    // 2. 查询数据库
    const db = await getDb();
    const results = await db
      .select({
        id: fengshuiAnalysis.id,
        floorPlanData: fengshuiAnalysis.floorPlanData,
        createdAt: fengshuiAnalysis.createdAt,
      })
      .from(fengshuiAnalysis)
      .where(eq(fengshuiAnalysis.userId, userId))
      .orderBy(desc(fengshuiAnalysis.updatedAt))
      .limit(50); // 限制返回数量

    // 3. 过滤并解析有户型图数据的记录
    const states: FloorplanState[] = [];
    for (const result of results) {
      if (result.floorPlanData) {
        try {
          const state = FloorplanStateSchema.parse(result.floorPlanData);
          states.push(state);
        } catch (error) {
          console.warn('[Floorplan State] 跳过无效数据:', result.id, error);
        }
      }
    }

    return states;
  } catch (error) {
    console.error('[Floorplan State] 列表加载失败:', error);
    return [];
  }
}

/**
 * 删除户型图状态
 * @param analysisId 分析 ID
 * @returns 删除结果
 */
export async function deleteFloorplanState(
  analysisId: string
): Promise<SaveResult> {
  try {
    // 1. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '未登录或会话已过期',
      };
    }

    const userId = session.user.id;

    // 2. 先获取当前状态（用于删除云存储文件）
    const db = await getDb();
    const existing = await db
      .select({
        floorPlanData: fengshuiAnalysis.floorPlanData,
      })
      .from(fengshuiAnalysis)
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          eq(fengshuiAnalysis.id, analysisId)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return {
        success: false,
        error: '方案不存在',
      };
    }

    // 3. 删除云存储文件（如果存在）
    const state = existing[0].floorPlanData as FloorplanState | null;
    if (state?.storageKey) {
      deleteCloudFile(state.storageKey).catch((error) => {
        console.error('[Floorplan State] 删除云文件失败:', error);
      });
    }

    // 4. 清空数据库中的户型图数据
    await db
      .update(fengshuiAnalysis)
      .set({
        floorPlanUrl: null,
        floorPlanData: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(fengshuiAnalysis.userId, userId),
          eq(fengshuiAnalysis.id, analysisId)
        )
      );

    return {
      success: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[Floorplan State] 删除失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除失败',
    };
  }
}

/**
 * 创建新的户型图方案
 * @param initialState 初始状态（可选）
 * @param name 方案名称（可选）
 * @returns 创建的状态或 null
 */
export async function createFloorplanState(
  initialState?: Partial<FloorplanState>,
  name?: string
): Promise<FloorplanState | null> {
  try {
    // 1. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return null;
    }

    // 2. 生成新状态
    const now = Date.now();
    const newState: FloorplanState = {
      id: `floorplan_${now}`,
      name: name || `方案 ${new Date().toLocaleString('zh-CN')}`,
      imageData: initialState?.imageData || '',
      imageType: initialState?.imageType || 'base64',
      storageKey: initialState?.storageKey,
      rotation: initialState?.rotation ?? 0,
      scale: initialState?.scale ?? 1,
      position: initialState?.position ?? { x: 0, y: 0 },
      showOverlay: initialState?.showOverlay ?? true,
      showLabels: initialState?.showLabels ?? true,
      overlayOpacity: initialState?.overlayOpacity ?? 0.7,
      gridLineWidth: initialState?.gridLineWidth ?? 2,
      analysisId: initialState?.analysisId,
      createdAt: now,
      updatedAt: now,
    };

    // 3. 验证
    const validatedState = FloorplanStateSchema.parse(newState);

    return validatedState;
  } catch (error) {
    console.error('[Floorplan State] 创建失败:', error);
    return null;
  }
}

/**
 * 重命名户型图方案
 * @param analysisId 分析 ID
 * @param name 新名称
 * @returns 保存结果
 */
export async function renameFloorplanState(
  analysisId: string,
  name: string
): Promise<SaveResult> {
  try {
    // 1. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        error: '未登录或会话已过期',
      };
    }

    const userId = session.user.id;

    // 2. 加载当前状态
    const currentState = await loadFloorplanState(analysisId);
    if (!currentState) {
      return {
        success: false,
        error: '方案不存在',
      };
    }

    // 3. 更新名称
    const updatedState: FloorplanState = {
      ...currentState,
      name,
      updatedAt: Date.now(),
    };

    // 4. 保存
    return await saveFloorplanState(analysisId, updatedState);
  } catch (error) {
    console.error('[Floorplan State] 重命名失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '重命名失败',
    };
  }
}

/**
 * 迁移匿名用户数据
 * @param anonymousData 匿名数据数组
 * @returns 迁移结果
 */
export async function migrateAnonymousData(
  anonymousData: MigrationDataItem[]
): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedCount: 0,
    failedCount: 0,
    errors: [],
  };

  try {
    // 1. 获取会话并验证用户
    const session = await getSession();
    if (!session?.user?.id) {
      return {
        success: false,
        migratedCount: 0,
        failedCount: anonymousData.length,
        errors: [{ analysisId: 'all', error: '未登录' }],
      };
    }

    // 2. 逐个迁移
    for (const item of anonymousData) {
      try {
        // 检查是否已存在
        const existing = await loadFloorplanState(item.analysisId);
        
        if (existing) {
          // 如果已存在，比较时间戳，保留较新的
          if (item.state.updatedAt > existing.updatedAt) {
            // 匿名数据更新，覆盖
            await saveFloorplanState(item.analysisId, {
              ...item.state,
              updatedAt: Date.now(),
            });
            result.migratedCount++;
          } else {
            // 数据库数据更新，跳过
            console.log('[Floorplan State] 跳过旧数据:', item.analysisId);
          }
        } else {
          // 不存在，直接保存
          await saveFloorplanState(item.analysisId, {
            ...item.state,
            updatedAt: Date.now(),
          });
          result.migratedCount++;
        }
      } catch (error) {
        console.error('[Floorplan State] 迁移单项失败:', item.analysisId, error);
        result.failedCount++;
        result.errors.push({
          analysisId: item.analysisId,
          error: error instanceof Error ? error.message : '迁移失败',
        });
      }
    }

    result.success = result.failedCount === 0;
    return result;
  } catch (error) {
    console.error('[Floorplan State] 迁移失败:', error);
    return {
      success: false,
      migratedCount: result.migratedCount,
      failedCount: anonymousData.length - result.migratedCount,
      errors: [
        {
          analysisId: 'all',
          error: error instanceof Error ? error.message : '迁移失败',
        },
      ],
    };
  }
}

/**
 * 批量删除户型图状态
 * @param analysisIds 分析 ID 数组
 * @returns 删除结果
 */
export async function batchDeleteFloorplanStates(
  analysisIds: string[]
): Promise<{ successCount: number; failedCount: number }> {
  let successCount = 0;
  let failedCount = 0;

  for (const analysisId of analysisIds) {
    const result = await deleteFloorplanState(analysisId);
    if (result.success) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  return { successCount, failedCount };
}
