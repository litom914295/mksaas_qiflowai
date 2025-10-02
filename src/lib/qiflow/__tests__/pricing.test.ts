/**
 * QiFlow定价模块单元测试
 * 使用Node.js内置assert，无需额外测试框架
 */

import assert from 'assert'
import {
	QIFLOW_PRICING,
	getQiflowPrice,
	hasEnoughCredits,
	calculateRequiredCredits,
	type QiflowProduct,
} from '../../../config/qiflow-pricing'

// 测试工具函数
function test(name: string, fn: () => void | Promise<void>) {
	try {
		const result = fn()
		if (result instanceof Promise) {
			result
				.then(() => console.log(`✅ PASS: ${name}`))
				.catch((err) => {
					console.error(`❌ FAIL: ${name}`)
					console.error(err)
					process.exit(1)
				})
		} else {
			console.log(`✅ PASS: ${name}`)
		}
	} catch (err) {
		console.error(`❌ FAIL: ${name}`)
		console.error(err)
		process.exit(1)
	}
}

// 测试套件
console.log('\n🧪 运行 QiFlow 定价模块测试...\n')

test('QIFLOW_PRICING 常量应包含所有产品定价', () => {
	assert.strictEqual(typeof QIFLOW_PRICING.aiChat, 'number')
	assert.strictEqual(typeof QIFLOW_PRICING.bazi, 'number')
	assert.strictEqual(typeof QIFLOW_PRICING.xuankong, 'number')
	assert.strictEqual(typeof QIFLOW_PRICING.deepInterpretation, 'number')
	assert.strictEqual(typeof QIFLOW_PRICING.pdfExport, 'number')
})

test('QIFLOW_PRICING 定价应为正数', () => {
	assert.ok(QIFLOW_PRICING.aiChat > 0)
	assert.ok(QIFLOW_PRICING.bazi > 0)
	assert.ok(QIFLOW_PRICING.xuankong > 0)
	assert.ok(QIFLOW_PRICING.deepInterpretation > 0)
	assert.ok(QIFLOW_PRICING.pdfExport > 0)
})

test('getQiflowPrice 应返回正确的产品价格', () => {
	assert.strictEqual(getQiflowPrice('aiChat'), QIFLOW_PRICING.aiChat)
	assert.strictEqual(getQiflowPrice('bazi'), QIFLOW_PRICING.bazi)
	assert.strictEqual(getQiflowPrice('xuankong'), QIFLOW_PRICING.xuankong)
	assert.strictEqual(getQiflowPrice('deepInterpretation'), QIFLOW_PRICING.deepInterpretation)
	assert.strictEqual(getQiflowPrice('pdfExport'), QIFLOW_PRICING.pdfExport)
})

test('hasEnoughCredits 应正确判断积分是否充足 - 充足情况', () => {
	assert.strictEqual(hasEnoughCredits(100, 'aiChat'), true)
	assert.strictEqual(hasEnoughCredits(10, 'bazi'), true)
	assert.strictEqual(hasEnoughCredits(20, 'xuankong'), true)
})

test('hasEnoughCredits 应正确判断积分是否充足 - 不足情况', () => {
	assert.strictEqual(hasEnoughCredits(4, 'aiChat'), false)
	assert.strictEqual(hasEnoughCredits(9, 'bazi'), false)
	assert.strictEqual(hasEnoughCredits(19, 'xuankong'), false)
})

test('hasEnoughCredits 应正确判断积分是否充足 - 临界情况', () => {
	assert.strictEqual(hasEnoughCredits(5, 'aiChat'), true) // 刚好等于价格
	assert.strictEqual(hasEnoughCredits(10, 'bazi'), true)
	assert.strictEqual(hasEnoughCredits(20, 'xuankong'), true)
})

test('calculateRequiredCredits 应正确计算多个产品所需积分', () => {
	const products: QiflowProduct[] = ['aiChat', 'bazi']
	const expected = QIFLOW_PRICING.aiChat + QIFLOW_PRICING.bazi
	assert.strictEqual(calculateRequiredCredits(products), expected)
})

test('calculateRequiredCredits 应正确处理空数组', () => {
	assert.strictEqual(calculateRequiredCredits([]), 0)
})

test('calculateRequiredCredits 应正确处理单个产品', () => {
	assert.strictEqual(calculateRequiredCredits(['bazi']), QIFLOW_PRICING.bazi)
})

test('calculateRequiredCredits 应正确处理所有产品', () => {
	const allProducts: QiflowProduct[] = ['aiChat', 'bazi', 'xuankong', 'deepInterpretation', 'pdfExport']
	const expected =
		QIFLOW_PRICING.aiChat +
		QIFLOW_PRICING.bazi +
		QIFLOW_PRICING.xuankong +
		QIFLOW_PRICING.deepInterpretation +
		QIFLOW_PRICING.pdfExport
	assert.strictEqual(calculateRequiredCredits(allProducts), expected)
})

console.log('\n✅ 所有定价模块测试通过！\n')

