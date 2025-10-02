/**
 * Server Actions 测试
 * 验证三个核心Server Actions的基本功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateBaziAction } from '../calculate-bazi'
import { xuankongAnalysisAction } from '../xuankong-analysis'
import { compassReadingAction } from '../compass-reading'

// Mock dependencies
vi.mock('@/src/db', () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({})
    })
  })
}))

vi.mock('@/src/lib/server', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user-id' }
  })
}))

vi.mock('@/credits/credits', () => ({
  consumeCredits: vi.fn().mockResolvedValue({})
}))

vi.mock('@/src/lib/qiflow/compliance/sensitive', () => ({
  assertNoSensitive: vi.fn()
}))

vi.mock('@/src/lib/qiflow/bazi', () => ({
  computeBaziSmart: vi.fn().mockResolvedValue({
    birthInfo: { datetime: '1990-05-10T12:30:00', gender: 'male' },
    pillars: { year: { heavenly: '甲', earthly: '子' } },
    score: { overall: 0.8 }
  })
}))

vi.mock('@/src/lib/qiflow/xuankong', () => ({
  generateFlyingStar: vi.fn().mockResolvedValue({
    period: 8,
    plates: {},
    evaluation: {},
    meta: { rulesApplied: ['TiGua'] },
    geju: { strength: 0.8 }
  })
}))

vi.mock('@/src/lib/qiflow/compass', () => ({
  readCompassSmart: vi.fn().mockResolvedValue({
    reading: { magnetic: 45, true: 47, confidence: 'high', accuracy: 0.9 },
    calibration: { magnetic: true, trueNorth: true },
    sensors: { accelerometer: true, magnetometer: true, gyroscope: true }
  })
}))

describe('Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateBaziAction', () => {
    it('should calculate bazi successfully with valid input', async () => {
      const formData = new FormData()
      formData.append('name', '张三')
      formData.append('birth', '1990-05-10T12:30:00')
      formData.append('gender', 'male')
      formData.append('timezone', 'Asia/Shanghai')
      formData.append('isTimeKnown', 'true')

      const result = await calculateBaziAction(formData)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.result).toBeDefined()
        expect(result.creditsUsed).toBe(10)
        expect(result.userId).toBe('test-user-id')
      }
    })

    it('should return error for invalid input', async () => {
      const formData = new FormData()
      formData.append('name', '') // 空名称
      formData.append('birth', '1990-05-10T12:30:00')

      const result = await calculateBaziAction(formData)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('INVALID_INPUT')
      }
    })
  })

  describe('xuankongAnalysisAction', () => {
    it('should analyze xuankong successfully with valid input', async () => {
      const formData = new FormData()
      formData.append('address', '北京市朝阳区')
      formData.append('facing', '180')
      formData.append('observedAt', new Date().toISOString())

      const result = await xuankongAnalysisAction(formData)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.result).toBeDefined()
        expect(result.confidence).toBeDefined()
        expect(result.creditsUsed).toBe(20)
        expect(result.userId).toBe('test-user-id')
      }
    })

    it('should return error for invalid facing angle', async () => {
      const formData = new FormData()
      formData.append('address', '北京市朝阳区')
      formData.append('facing', '999') // 无效角度

      const result = await xuankongAnalysisAction(formData)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('INVALID_INPUT')
      }
    })
  })

  describe('compassReadingAction', () => {
    it('should read compass successfully with valid sensor data', async () => {
      const formData = new FormData()
      formData.append('accelerometer', JSON.stringify({ x: 0, y: 0, z: 9.8 }))
      formData.append('magnetometer', JSON.stringify({ x: 20, y: 0, z: 0 }))
      formData.append('gyroscope', JSON.stringify({ x: 0, y: 0, z: 0 }))

      const result = await compassReadingAction(formData)

      expect(result.ok).toBe(true)
      if (result.ok) {
        expect(result.result).toBeDefined()
        expect(result.creditsUsed).toBe(20)
        expect(result.userId).toBe('test-user-id')
      }
    })

    it('should return error for invalid sensor data', async () => {
      const formData = new FormData()
      formData.append('accelerometer', 'invalid-json')
      formData.append('magnetometer', JSON.stringify({ x: 20, y: 0, z: 0 }))
      formData.append('gyroscope', JSON.stringify({ x: 0, y: 0, z: 0 }))

      const result = await compassReadingAction(formData)

      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error).toBe('INVALID_INPUT')
      }
    })
  })
})

