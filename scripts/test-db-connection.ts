/**
 * 数据库连接测试脚本
 * 验证QiFlow表的连通性和基本操作
 */

import 'dotenv/config'
import { getDb } from '../src/db'
import { baziCalculations, fengshuiAnalysis, pdfAudit, copyrightAudit } from '../src/db/schema'

async function testDatabaseConnection() {
	console.log('🔍 开始测试数据库连接...\n')

	try {
		// 获取数据库连接
		const db = await getDb()
		console.log('✅ 数据库连接成功\n')

		// 测试用户ID（需要先确保user表有数据）
		const testUserId = 'test-user-' + Date.now()

		// 测试1: 插入八字计算记录
		console.log('📝 测试1: 插入八字计算记录...')
		try {
			const baziResult = await db.insert(baziCalculations).values({
				userId: testUserId,
				input: {
					name: '测试用户',
					birth: '1990-05-10T12:30:00',
					gender: 'male',
					timezone: 'Asia/Shanghai',
				},
				result: {
					pillars: {
						year: { heavenly: '甲', earthly: '子' },
						month: { heavenly: '乙', earthly: '丑' },
						day: { heavenly: '丙', earthly: '寅' },
						hour: { heavenly: '丁', earthly: '卯' },
					},
				},
				creditsUsed: 10,
			}).returning()

			console.log('✅ 八字记录插入成功:', baziResult[0]?.id)
		} catch (error) {
			console.error('❌ 八字记录插入失败:', error)
		}

		// 测试2: 插入玄空风水分析记录
		console.log('\n📝 测试2: 插入玄空风水分析记录...')
		try {
			const xuankongResult = await db.insert(fengshuiAnalysis).values({
				userId: testUserId,
				input: {
					address: '北京市朝阳区',
					facing: 180,
					observedAt: new Date().toISOString(),
				},
				result: {
					period: 8,
					geju: {
						type: '旺山旺向',
						strength: 0.85,
					},
				},
				confidence: '0.85',
				creditsUsed: 20,
			}).returning()

			console.log('✅ 玄空风水记录插入成功:', xuankongResult[0]?.id)
		} catch (error) {
			console.error('❌ 玄空风水记录插入失败:', error)
		}

		// 测试3: 插入PDF审计记录
		console.log('\n📝 测试3: 插入PDF审计记录...')
		try {
			const pdfResult = await db.insert(pdfAudit).values({
				userId: testUserId,
				fileKey: 'test-file-' + Date.now() + '.pdf',
				meta: {
					size: 1024,
					pages: 10,
				},
			}).returning()

			console.log('✅ PDF审计记录插入成功:', pdfResult[0]?.id)
		} catch (error) {
			console.error('❌ PDF审计记录插入失败:', error)
		}

		// 测试4: 插入版权审计记录
		console.log('\n📝 测试4: 插入版权审计记录...')
		try {
			const copyrightResult = await db.insert(copyrightAudit).values({
				userId: testUserId,
				payload: {
					content: '测试内容',
					checkType: 'similarity',
				},
			}).returning()

			console.log('✅ 版权审计记录插入成功:', copyrightResult[0]?.id)
		} catch (error) {
			console.error('❌ 版权审计记录插入失败:', error)
		}

		// 测试5: 查询记录数量
		console.log('\n📊 测试5: 查询各表记录数量...')
		try {
			const baziCount = await db.select().from(baziCalculations)
			const xuankongCount = await db.select().from(fengshuiAnalysis)
			const pdfCount = await db.select().from(pdfAudit)
			const copyrightCount = await db.select().from(copyrightAudit)

			console.log('✅ 八字记录数:', baziCount.length)
			console.log('✅ 玄空风水记录数:', xuankongCount.length)
			console.log('✅ PDF审计记录数:', pdfCount.length)
			console.log('✅ 版权审计记录数:', copyrightCount.length)
		} catch (error) {
			console.error('❌ 查询记录失败:', error)
		}

		console.log('\n✅ 所有测试完成！')
		console.log('\n📝 注意：测试使用了临时用户ID，不会创建真实用户记录')
		console.log('⚠️  这些测试记录可能会因为外键约束而无法插入（如果user表没有对应用户）')
		
	} catch (error) {
		console.error('\n❌ 数据库连接测试失败:', error)
		process.exit(1)
	}

	process.exit(0)
}

// 运行测试
testDatabaseConnection()

