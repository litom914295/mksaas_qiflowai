'use server'

import { z } from 'zod'
import { getDb } from '@/src/db'
import { baziCalculations } from '@/src/db/schema'
import { QIFLOW_PRICING } from '@/src/config/qiflow-pricing'
import { getSession } from '@/src/lib/server'
import { assertNoSensitive } from '@/src/lib/qiflow/compliance/sensitive'
import { computeBaziSmart, type EnhancedBirthData } from '@/src/lib/qiflow/bazi'
import { consumeCredits } from '@/credits/credits'
import { handleDegradation, handleManualInput } from '@/src/lib/qiflow/degradation-handler'
import { PerformanceTimer, qiflowLogger } from '@/src/lib/qiflow/logger'

const InputSchema = z.object({
	name: z.string().min(1).max(50),
	birth: z.string().min(1),
	gender: z.enum(['male', 'female']).optional(),
	timezone: z.string().optional().default('Asia/Shanghai'),
	isTimeKnown: z.boolean().optional().default(true),
})

export async function calculateBaziAction(formData: FormData) {
	const timer = new PerformanceTimer()
	const traceId = timer.getTraceId()

	const parsed = InputSchema.safeParse({
		name: formData.get('name'),
		birth: formData.get('birth'),
		gender: formData.get('gender') ?? undefined,
		timezone: formData.get('timezone') ?? 'Asia/Shanghai',
		isTimeKnown: formData.get('isTimeKnown') === 'true',
	})
	if (!parsed.success) {
		qiflowLogger.warn('Bazi calculation - invalid input', { traceId, action: 'bazi-calculate' })
		return { ok: false as const, error: 'INVALID_INPUT', issues: parsed.error.issues }
	}
	const input = parsed.data

	// 合规：敏感词拒答
	try { 
		assertNoSensitive([input.name]) 
	} catch { 
		return { ok: false as const, error: 'SENSITIVE_CONTENT' } 
	}

	const session = await getSession()
	const userId = session?.user?.id ?? 'anonymous'

	// 检查用户积分
	const creditsUsed = QIFLOW_PRICING.bazi
	try {
		await consumeCredits({
			userId,
			amount: creditsUsed,
			type: 'bazi-calculation',
			description: `八字计算 - ${input.name}`,
		})
	} catch (error) {
		return { ok: false as const, error: 'INSUFFICIENT_CREDITS' }
	}

	// 使用真实的八字算法
	let result
	let confidence = 0.5
	let calculationErrors: string[] = []
	
	try {
		const birthData: EnhancedBirthData = {
			datetime: input.birth,
			gender: input.gender || 'male',
			timezone: input.timezone,
			isTimeKnown: input.isTimeKnown,
		}
		
		result = await computeBaziSmart(birthData)
		
		if (!result) {
			throw new Error('八字计算失败')
		}
		
		// 计算置信度（基于输入完整性和结果质量）
		confidence = calculateBaziConfidence(input, result)
		
	} catch (error) {
		console.error('八字计算错误:', error)
		calculationErrors.push(error instanceof Error ? error.message : '计算失败')
		
		// 尝试降级处理
		const degradationResponse = await handleDegradation('bazi', 0.1, input, null, calculationErrors)
		
		if (degradationResponse.shouldReject) {
			return { 
				ok: false as const, 
				error: 'DEGRADATION_REQUIRED',
				degradationResult: degradationResponse.degradationResult,
				confidence: degradationResponse.confidence
			}
		}
		
		return { ok: false as const, error: 'CALCULATION_FAILED' }
	}
	
	// 检查是否需要降级处理
	const degradationResponse = await handleDegradation('bazi', confidence, input, result, calculationErrors)
	
	if (degradationResponse.shouldReject) {
		return { 
			ok: false as const, 
			error: 'DEGRADATION_REQUIRED',
			degradationResult: degradationResponse.degradationResult,
			confidence: degradationResponse.confidence
		}
	}

	// 保存到数据库
	try {
		const db = await getDb()
		await db.insert(baziCalculations).values({
			userId,
			input: {
				name: input.name,
				birth: input.birth,
				gender: input.gender,
				timezone: input.timezone,
				isTimeKnown: input.isTimeKnown,
			},
			result,
			creditsUsed,
		})
	} catch (e) {
		console.warn('[bazi] skip insert (db not ready?):', e)
	}

	// 记录成功日志
	timer.finish('bazi-calculate', {
		userId,
		cost: creditsUsed,
		coins: creditsUsed,
		status: 'success',
		metadata: { confidence },
	})

	return { ok: true as const, result, confidence, creditsUsed, userId }
}

/**
 * 计算八字分析的置信度
 */
function calculateBaziConfidence(input: any, result: any): number {
	let confidence = 0.5 // 基础置信度
	
	// 基于输入完整性调整置信度
	if (input.datetime) confidence += 0.2
	if (input.gender) confidence += 0.1
	if (input.timezone) confidence += 0.1
	if (input.isTimeKnown) confidence += 0.1
	
	// 基于结果质量调整置信度
	if (result && result.pillars) {
		confidence += 0.1
	}
	
	if (result && result.score && result.score.overall > 0.5) {
		confidence += 0.1
	}
	
	return Math.min(1, Math.max(0, confidence))
}

/**
 * 处理手动输入的八字数据
 */
export async function calculateBaziManualAction(formData: FormData) {
	const parsed = z.object({
		name: z.string().min(1).max(50),
		yearPillar: z.string().min(1),
		monthPillar: z.string().min(1),
		dayPillar: z.string().min(1),
		hourPillar: z.string().min(1),
		gender: z.enum(['male', 'female']).optional(),
		timezone: z.string().optional().default('Asia/Shanghai'),
	}).safeParse({
		name: formData.get('name'),
		yearPillar: formData.get('yearPillar'),
		monthPillar: formData.get('monthPillar'),
		dayPillar: formData.get('dayPillar'),
		hourPillar: formData.get('hourPillar'),
		gender: formData.get('gender') ?? undefined,
		timezone: formData.get('timezone') ?? 'Asia/Shanghai',
	})
	
	if (!parsed.success) {
		return { ok: false as const, error: 'INVALID_INPUT', issues: parsed.error.issues }
	}
	
	const input = parsed.data
	
	// 合规：敏感词拒答
	try { 
		assertNoSensitive([input.name]) 
	} catch { 
		return { ok: false as const, error: 'SENSITIVE_CONTENT' } 
	}
	
	const session = await getSession()
	const userId = session?.user?.id ?? 'anonymous'
	
	// 检查用户积分
	const creditsUsed = QIFLOW_PRICING.bazi
	try {
		await consumeCredits({
			userId,
			amount: creditsUsed,
			type: 'bazi-calculation-manual',
			description: `八字计算(手动) - ${input.name}`,
		})
	} catch (error) {
		return { ok: false as const, error: 'INSUFFICIENT_CREDITS' }
	}
	
	// 处理手动输入
	const manualInputResponse = await handleManualInput('bazi', {
		yearPillar: input.yearPillar,
		monthPillar: input.monthPillar,
		dayPillar: input.dayPillar,
		hourPillar: input.hourPillar,
	}, {
		name: input.name,
		gender: input.gender,
		timezone: input.timezone,
	})
	
	if (!manualInputResponse.success) {
		return { ok: false as const, error: 'MANUAL_INPUT_FAILED', message: manualInputResponse.error }
	}
	
	const result = manualInputResponse.fallbackData
	const confidence = manualInputResponse.confidence
	
	// 保存到数据库
	try {
		const db = await getDb()
		await db.insert(baziCalculations).values({
			userId,
			input: {
				name: input.name,
				yearPillar: input.yearPillar,
				monthPillar: input.monthPillar,
				dayPillar: input.dayPillar,
				hourPillar: input.hourPillar,
				gender: input.gender,
				timezone: input.timezone,
				isManual: true,
			},
			result,
			creditsUsed,
		})
	} catch (e) {
		console.warn('[bazi-manual] skip insert (db not ready?):', e)
	}
	
	return { ok: true as const, result, confidence, creditsUsed, userId }
}
