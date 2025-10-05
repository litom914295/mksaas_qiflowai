'use server';

import { QIFLOW_PRICING } from '@/config/qiflow-pricing';
import { websiteConfig } from '@/config/website';
import { consumeCredits } from '@/credits/credits';
import { getDb } from '@/db';
import { fengshuiAnalysis } from '@/db/schema';
import {
  type CompassConfig,
  type SensorData,
  readCompassSmart,
} from '@/lib/qiflow/compass';
import { getSession } from '@/lib/server';
import { z } from 'zod';

const InputSchema = z.object({
  accelerometer: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  magnetometer: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  gyroscope: z
    .object({
      x: z.number(),
      y: z.number(),
      z: z.number(),
    })
    .optional(),
  timestamp: z.number().optional().default(Date.now()),
  config: z
    .object({
      calibrationData: z.array(z.number()).optional(),
      enableFiltering: z.boolean().optional().default(true),
      enableTrueNorth: z.boolean().optional().default(true),
    })
    .optional(),
});

export async function compassReadingAction(formData: FormData) {
  const parsed = InputSchema.safeParse({
    accelerometer: JSON.parse(formData.get('accelerometer') as string),
    magnetometer: formData.get('magnetometer')
      ? JSON.parse(formData.get('magnetometer') as string)
      : undefined,
    gyroscope: formData.get('gyroscope')
      ? JSON.parse(formData.get('gyroscope') as string)
      : undefined,
    timestamp: formData.get('timestamp')
      ? Number.parseInt(formData.get('timestamp') as string)
      : undefined,
    config: formData.get('config')
      ? JSON.parse(formData.get('config') as string)
      : undefined,
  });
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'INVALID_INPUT',
      issues: parsed.error.issues,
    };
  }
  const input = parsed.data;

  const session = await getSession();
  const userId = session?.user?.id ?? 'anonymous';

  // 检查用户积分（仅在积分系统启用时）
  const creditsUsed = QIFLOW_PRICING.aiChat; // Using aiChat pricing for compass reading for now
  if (websiteConfig.credits.enableCredits) {
    try {
      await consumeCredits({
        userId,
        amount: creditsUsed,
        description: '罗盘读取',
      });
    } catch (error) {
      return { ok: false as const, error: 'INSUFFICIENT_CREDITS' };
    }
  }

  // 使用真实的罗盘算法
  let result;
  let confidence = '0.0';
  try {
    const sensorData: SensorData = {
      accelerometer: input.accelerometer,
      magnetometer: input.magnetometer,
      gyroscope: input.gyroscope,
      timestamp: input.timestamp,
    };
    const compassConfig: CompassConfig = input.config || {};

    result = await readCompassSmart(sensorData, compassConfig);

    if (!result) {
      throw new Error('罗盘读取失败');
    }

    // 假设罗盘算法返回一个置信度
    confidence = result.confidence ? result.confidence : '0.75'; // Placeholder confidence
    if (Number.parseFloat(confidence) < 0.5) {
      console.warn(
        `[compass] Low confidence reading for user ${userId}: ${confidence}`
      );
      // 可以返回一个特定的错误码或警告
    }
  } catch (error) {
    console.error('罗盘读取错误:', error);
    return { ok: false as const, error: 'CALCULATION_FAILED' };
  }

  // 保存到数据库 (暂时使用 fengshuiAnalysis 表)
  try {
    const db = await getDb();
    await db.insert(fengshuiAnalysis).values({
      userId,
      input: {
        sensorData: input, // Store raw sensor data as input
        config: input.config,
      },
      result: {
        heading: result.heading,
        trueNorthHeading: result.trueNorthHeading,
        calibrationStatus: result.calibrationStatus,
      } as unknown as Record<string, unknown>,
      confidence,
      creditsUsed,
    });
  } catch (e) {
    console.warn('[compass] skip insert (db not ready?):', e);
  }

  return { ok: true as const, result, confidence, creditsUsed, userId };
}
