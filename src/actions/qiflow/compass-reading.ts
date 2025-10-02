'use server'

import { z } from 'zod'
import { getDb } from '@/src/db'
import { fengshuiAnalysis } from '@/src/db/schema'
import { QIFLOW_PRICING } from '@/src/config/qiflow-pricing'
import { getSession } from '@/src/lib/server'
import { readCompassSmart, type SensorData, type CompassConfig } from '@/src/lib/qiflow/compass'
import { consumeCredits } from '@/credits/credits'

const InputSchema = z.object({
	accelerometer: z.object({
		x: z.number(),
		y: z.number(),
		z: z.number(),
	}),
	magnetometer: z.object({
		x: z.number(),
		y: z.number(),
		z: z.number(),
	}),
	gyroscope: z.object({
		x: z.number(),
		y: z.number(),
		z: z.number(),
	}),
	config: z.object({
		enableMagneticDeclination: z.boolean().optional().default(true),
		enableTrueNorth: z.boolean().optional().default(true),
		confidenceThreshold: z.number().min(0).max(1).optional().default(0.7),
		smoothingFactor: z.number().min(0).max(1).optional().default(0.8),
		calibrationRequired: z.boolean().optional().default(true),
	}).optional(),
	location: z.object({
		latitude: z.number().min(-90).max(90),
		longitude: z.number().min(-180).max(180),
	}).optional(),
})

export async function compassReadingAction(formData: FormData) {
	const parsed = InputSchema.safeParse({
		accelerometer: JSON.parse(formData.get('accelerometer') as string),
		magnetometer: JSON.parse(formData.get('magnetometer') as string),
		gyroscope: JSON.parse(formData.get('gyroscope') as string),
		config: formData.get('config') ? JSON.parse(formData.get('config') as string) : undefined,
		location: formData.get('location') ? JSON.parse(formData.get('location') as string) : undefined,
	})
	if (!parsed.success) {
		return { ok: false as const, error: 'INVALID_INPUT', issues: parsed.error.issues }
	}
	const input = parsed.data

	const session = await getSession()
	const userId = session?.user?.id ?? 'anonymous'

	// 检查用户积分
	const creditsUsed = QIFLOW_PRICING.xuankong // 罗盘读取使用玄空风水的积分
	try {
		await consumeCredits({
			userId,
			amount: creditsUsed,
			type: 'compass-reading',
			description: '罗盘读取分析',
		})
	} catch (error) {
		return { ok: false as const, error: 'INSUFFICIENT_CREDITS' }
	}

	// 使用真实的罗盘算法
	let result
	try {
		const sensorData: SensorData = {
			accelerometer: input.accelerometer,
			magnetometer: input.magnetometer,
			gyroscope: input.gyroscope,
			timestamp: Date.now(),
		}
		
		const compassConfig: Partial<CompassConfig> = input.config || {}
		
		result = await readCompassSmart(sensorData, compassConfig)
		
		// 如果置信度太低，返回警告
		if (result.reading.confidence === 'low') {
			return { 
				ok: false as const, 
				error: 'LOW_CONFIDENCE',
				message: '罗盘读数置信度过低，请重新校准或检查传感器',
				result 
			}
		}
		
	} catch (error) {
		console.error('罗盘读取错误:', error)
		return { ok: false as const, error: 'CALCULATION_FAILED' }
	}

	// 保存到数据库（使用风水分析表）
	try {
		const db = await getDb()
		await db.insert(fengshuiAnalysis).values({
			userId,
			input: {
				sensorData: {
					accelerometer: input.accelerometer,
					magnetometer: input.magnetometer,
					gyroscope: input.gyroscope,
				},
				config: input.config,
				location: input.location,
			},
			result: {
				reading: result.reading,
				calibration: result.calibration,
				sensors: result.sensors,
			},
			confidence: result.reading.confidence,
			creditsUsed,
		})
	} catch (e) {
		console.warn('[compass] skip insert (db not ready?):', e)
	}

	return { ok: true as const, result, creditsUsed, userId }
}
