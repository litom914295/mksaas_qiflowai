'use server'

import { z } from 'zod'
import { getDb } from '@/src/db'
import { fengshuiAnalysis } from '@/src/db/schema'
import { QIFLOW_PRICING } from '@/src/config/qiflow-pricing'
import { getSession } from '@/src/lib/server'
import { assertNoSensitive } from '@/src/lib/qiflow/compliance/sensitive'
import { generateFlyingStar, type GenerateFlyingStarInput } from '@/src/lib/qiflow/xuankong'
import { consumeCredits } from '@/credits/credits'
import { PerformanceTimer, qiflowLogger } from '@/src/lib/qiflow/logger'

const InputSchema = z.object({
	address: z.string().min(1).max(200),
	facing: z.coerce.number().min(0).max(359),
	observedAt: z.string().optional().default(new Date().toISOString()),
	config: z.object({
		toleranceDeg: z.number().min(1).max(10).optional().default(3),
		applyTiGua: z.boolean().optional().default(true),
		applyFanGua: z.boolean().optional().default(true),
		enableAdvancedAnalysis: z.boolean().optional().default(true),
	}).optional(),
})

export async function xuankongAnalysisAction(formData: FormData) {
	const timer = new PerformanceTimer()
	const traceId = timer.getTraceId()

	const parsed = InputSchema.safeParse({
		address: formData.get('address'),
		facing: formData.get('facing'),
		observedAt: formData.get('observedAt') ?? new Date().toISOString(),
		config: formData.get('config') ? JSON.parse(formData.get('config') as string) : undefined,
	})
	if (!parsed.success) {
		qiflowLogger.warn('Xuankong analysis - invalid input', { traceId, action: 'xuankong-analysis' })
		return { ok: false as const, error: 'INVALID_INPUT', issues: parsed.error.issues }
	}
	const input = parsed.data

	// 合规：敏感词拒答
	try { 
		assertNoSensitive([input.address]) 
	} catch { 
		return { ok: false as const, error: 'SENSITIVE_CONTENT' } 
	}

	const session = await getSession()
	const userId = session?.user?.id ?? 'anonymous'

	// 检查用户积分
	const creditsUsed = QIFLOW_PRICING.xuankong
	try {
		await consumeCredits({
			userId,
			amount: creditsUsed,
			type: 'xuankong-analysis',
			description: `玄空风水分析 - ${input.address}`,
		})
	} catch (error) {
		return { ok: false as const, error: 'INSUFFICIENT_CREDITS' }
	}

	// 使用真实的玄空风水算法
	let result
	let confidence
	try {
		const analysisInput: GenerateFlyingStarInput = {
			observedAt: new Date(input.observedAt),
			facing: {
				degrees: input.facing,
			},
			config: input.config,
		}
		
		result = await generateFlyingStar(analysisInput)
		
		// 计算置信度（基于格局强度和规则应用情况）
		const gejuStrength = result.geju?.strength || 0.5
		const rulesCount = result.meta.rulesApplied.length
		confidence = Math.min(0.95, gejuStrength + (rulesCount * 0.1)).toFixed(2)
		
	} catch (error) {
		console.error('玄空风水分析错误:', error)
		return { ok: false as const, error: 'CALCULATION_FAILED' }
	}

	// 保存到数据库
	try {
		const db = await getDb()
		await db.insert(fengshuiAnalysis).values({
			userId,
			input: {
				address: input.address,
				facing: input.facing,
				observedAt: input.observedAt,
				config: input.config,
			},
			result,
			confidence,
			creditsUsed,
		})
	} catch (e) {
		console.warn('[xuankong] skip insert (db not ready?):', e)
	}

	// 记录成功日志
	timer.finish('xuankong-analysis', {
		userId,
		cost: creditsUsed,
		coins: creditsUsed,
		status: 'success',
		metadata: { confidence },
	})

	return { ok: true as const, result, confidence, creditsUsed, userId }
}
