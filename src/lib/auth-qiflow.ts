import { getDb } from '@/db'
import { baziCalculations, fengshuiAnalysis, pdfAudit, copyrightAudit } from '@/db/schema'
import { addCredits } from '@/credits/credits'
import { websiteConfig } from '@/config/website'
import type { User } from 'better-auth'

/**
 * QiFlow 用户创建钩子
 * 在用户注册时初始化 QiFlow 相关档案和可选注册送分
 */
export async function onQiflowUserCreated(user: User) {
	const { id: userId } = user
	const db = await getDb()
	
	try {
		// 初始化用户档案 - 创建空的记录作为占位符
		await Promise.all([
			// 八字计算档案
			db.insert(baziCalculations).values({
				userId,
				input: { init: true },
				result: { init: true },
				creditsUsed: 0,
			}),
			// 风水分析档案
			db.insert(fengshuiAnalysis).values({
				userId,
				input: { init: true },
				result: { init: true },
				confidence: '0.0',
				creditsUsed: 0,
			}),
			// PDF 审计档案
			db.insert(pdfAudit).values({
				userId,
				fileKey: `init-${userId}`,
				meta: { init: true },
				createdAt: new Date(),
			}),
			// 版权审计档案
			db.insert(copyrightAudit).values({
				userId,
				payload: { init: true },
				createdAt: new Date(),
			}),
		])
		
		console.log(`QiFlow profiles initialized for user ${userId}`)
	} catch (error) {
		console.error(`Failed to initialize QiFlow profiles for user ${userId}:`, error)
		// 不抛出错误，避免影响用户注册流程
	}
}

/**
 * 为 QiFlow 用户添加注册奖励积分
 * 如果启用了积分系统且配置了注册奖励
 */
export async function grantQiflowSignupBonus(userId: string) {
	if (
		websiteConfig.credits.enableCredits &&
		websiteConfig.credits.registerGiftCredits.enable &&
		websiteConfig.credits.registerGiftCredits.amount > 0
	) {
		try {
			await addCredits({
				userId,
				amount: websiteConfig.credits.registerGiftCredits.amount,
				type: 'qiflow-signup-bonus',
				description: 'QiFlow 注册奖励积分',
				expireDays: websiteConfig.credits.registerGiftCredits.expireDays,
			})
			console.log(`QiFlow signup bonus granted to user ${userId}`)
		} catch (error) {
			console.error(`Failed to grant QiFlow signup bonus to user ${userId}:`, error)
		}
	}
}

/**
 * 兼容性函数 - 保持向后兼容
 * @deprecated 使用 onQiflowUserCreated 替代
 */
export async function onUserCreated(params: { userId: string; grantSignupBonus?: boolean }) {
	const { userId, grantSignupBonus } = params
	
	// 创建模拟用户对象
	const mockUser = { id: userId } as User
	
	// 初始化档案
	await onQiflowUserCreated(mockUser)
	
	// 如果请求注册奖励，则添加积分
	if (grantSignupBonus) {
		await grantQiflowSignupBonus(userId)
	}
}






