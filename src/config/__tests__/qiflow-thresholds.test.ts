/**
 * QiFlow置信度阈值模块单元测试
 */

import assert from 'assert'
import {
	CONFIDENCE_THRESHOLDS,
	CONFIDENCE_STATES,
	getConfidenceLevel,
	validateAlgorithmInput,
	checkProcessingTimeout,
	getConfidencePercentage,
} from '../qiflow-thresholds'

function test(name: string, fn: () => void) {
	try {
		fn()
		console.log(`✅ PASS: ${name}`)
	} catch (err) {
		console.error(`❌ FAIL: ${name}`)
		console.error(err)
		process.exit(1)
	}
}

console.log('\n🧪 运行 QiFlow 置信度阈值测试...\n')

// 测试阈值常量
test('CONFIDENCE_THRESHOLDS 应正确定义', () => {
	assert.strictEqual(typeof CONFIDENCE_THRESHOLDS.REJECT, 'number')
	assert.strictEqual(typeof CONFIDENCE_THRESHOLDS.WARNING, 'number')
	assert.strictEqual(typeof CONFIDENCE_THRESHOLDS.NORMAL, 'number')
	assert.ok(CONFIDENCE_THRESHOLDS.REJECT <= CONFIDENCE_THRESHOLDS.WARNING)
	assert.strictEqual(CONFIDENCE_THRESHOLDS.REJECT, 0.4)
	assert.strictEqual(CONFIDENCE_THRESHOLDS.WARNING, 0.7)
})

// 测试 getConfidenceLevel
test('getConfidenceLevel - 低置信度(reject)', () => {
	assert.strictEqual(getConfidenceLevel(0.0), 'reject')
	assert.strictEqual(getConfidenceLevel(0.2), 'reject')
	assert.strictEqual(getConfidenceLevel(0.39), 'reject')
})

test('getConfidenceLevel - 中置信度(warning)', () => {
	assert.strictEqual(getConfidenceLevel(0.4), 'warning')
	assert.strictEqual(getConfidenceLevel(0.5), 'warning')
	assert.strictEqual(getConfidenceLevel(0.69), 'warning')
})

test('getConfidenceLevel - 高置信度(normal)', () => {
	assert.strictEqual(getConfidenceLevel(0.7), 'normal')
	assert.strictEqual(getConfidenceLevel(0.85), 'normal')
	assert.strictEqual(getConfidenceLevel(1.0), 'normal')
})

// 测试 CONFIDENCE_STATES
test('CONFIDENCE_STATES 应正确定义所有状态', () => {
	assert.ok(CONFIDENCE_STATES.reject)
	assert.ok(CONFIDENCE_STATES.warning)
	assert.ok(CONFIDENCE_STATES.normal)
	assert.strictEqual(CONFIDENCE_STATES.reject.color, 'red')
	assert.strictEqual(CONFIDENCE_STATES.warning.color, 'yellow')
	assert.strictEqual(CONFIDENCE_STATES.normal.color, 'green')
})

// 测试 validateAlgorithmInput
test('validateAlgorithmInput - 有效八字输入（有所有必需字段）', () => {
	const result = validateAlgorithmInput('bazi', {
		datetime: '1990-01-01',
		gender: 'male',
	})
	assert.strictEqual(result.valid, true)
	assert.strictEqual(result.missingFields.length, 0)
})

test('validateAlgorithmInput - 无效输入（缺少字段）', () => {
	const result = validateAlgorithmInput('bazi', {})
	assert.strictEqual(result.valid, false)
	assert.ok(result.missingFields.length > 0)
})

// 测试 checkProcessingTimeout
test('checkProcessingTimeout - 正常处理时间', () => {
	const result = checkProcessingTimeout('bazi', 1000)
	assert.strictEqual(result, false) // 函数返回boolean，true表示超时
})

test('checkProcessingTimeout - 超时', () => {
	const result = checkProcessingTimeout('bazi', 31000)
	assert.strictEqual(result, true) // 超过30s
})

// 测试 getConfidencePercentage
test('getConfidencePercentage - 应正确转换为百分比', () => {
	assert.strictEqual(getConfidencePercentage(0.75), '75%')
	assert.strictEqual(getConfidencePercentage(0.856), '86%')
	assert.strictEqual(getConfidencePercentage(1.0), '100%')
})

console.log('\n✅ 所有置信度阈值测试通过！\n')
