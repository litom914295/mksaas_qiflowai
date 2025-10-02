/**
 * 降级处理系统测试
 */

import { describe, it, expect } from 'vitest'
import {
  analyzeDegradationReason,
  getDegradationResult,
  canDegrade,
  getDegradationSuggestions,
  type DegradationReason,
} from '../degradation'

describe('降级处理系统', () => {
  describe('analyzeDegradationReason', () => {
    it('should analyze low confidence reason', () => {
      const reason = analyzeDegradationReason(0.3, 'bazi', {})
      
      expect(reason.code).toBe('LOW_CONFIDENCE')
      expect(reason.message).toBe('分析结果置信度过低')
      expect(reason.severity).toBe('high')
      expect(reason.suggestions).toContain('请检查输入信息的完整性和准确性')
    })

    it('should analyze missing datetime for bazi', () => {
      const reason = analyzeDegradationReason(0.5, 'bazi', { gender: 'male' })
      
      expect(reason.code).toBe('MISSING_DATETIME')
      expect(reason.message).toBe('缺少出生时间信息')
      expect(reason.severity).toBe('high')
    })

    it('should analyze missing gender for bazi', () => {
      const reason = analyzeDegradationReason(0.5, 'bazi', { datetime: '1990-05-10' })
      
      expect(reason.code).toBe('MISSING_GENDER')
      expect(reason.message).toBe('缺少性别信息')
      expect(reason.severity).toBe('medium')
    })

    it('should analyze invalid facing for xuankong', () => {
      const reason = analyzeDegradationReason(0.5, 'xuankong', { facing: 400 })
      
      expect(reason.code).toBe('INVALID_FACING')
      expect(reason.message).toBe('朝向角度无效')
      expect(reason.severity).toBe('high')
    })

    it('should analyze missing sensor data for compass', () => {
      const reason = analyzeDegradationReason(0.5, 'compass', {})
      
      expect(reason.code).toBe('MISSING_SENSOR_DATA')
      expect(reason.message).toBe('传感器数据不完整')
      expect(reason.severity).toBe('high')
    })

    it('should analyze processing errors', () => {
      const reason = analyzeDegradationReason(0.5, 'bazi', {}, ['计算错误', '数据格式错误'])
      
      expect(reason.code).toBe('PROCESSING_ERRORS')
      expect(reason.message).toBe('处理过程中出现错误')
      expect(reason.severity).toBe('high')
    })
  })

  describe('getDegradationResult', () => {
    it('should not reject for high confidence', () => {
      const result = getDegradationResult(0.8, 'bazi', {
        datetime: '1990-05-10',
        gender: 'male',
      })
      
      expect(result.shouldReject).toBe(false)
      expect(result.fallbackOptions).toHaveLength(0)
      expect(result.manualInputRequired).toBe(false)
    })

    it('should reject for low confidence', () => {
      const result = getDegradationResult(0.3, 'bazi', {})
      
      expect(result.shouldReject).toBe(true)
      expect(result.reason).toBeDefined()
      expect(result.fallbackOptions.length).toBeGreaterThan(0)
      expect(result.manualInputRequired).toBe(true)
    })

    it('should provide bazi fallback options', () => {
      const result = getDegradationResult(0.3, 'bazi', {})
      
      expect(result.fallbackOptions).toContainEqual(
        expect.objectContaining({
          id: 'manual-bazi',
          name: '手动输入八字',
          requiresManualInput: true,
        })
      )
      
      expect(result.fallbackOptions).toContainEqual(
        expect.objectContaining({
          id: 'simplified-bazi',
          name: '简化八字分析',
          requiresManualInput: false,
        })
      )
    })

    it('should provide xuankong fallback options', () => {
      const result = getDegradationResult(0.3, 'xuankong', {})
      
      expect(result.fallbackOptions).toContainEqual(
        expect.objectContaining({
          id: 'manual-xuankong',
          name: '手动输入朝向',
          requiresManualInput: true,
        })
      )
      
      expect(result.fallbackOptions).toContainEqual(
        expect.objectContaining({
          id: 'compass-tool',
          name: '使用罗盘工具',
          requiresManualInput: false,
        })
      )
    })

    it('should provide compass fallback options', () => {
      const result = getDegradationResult(0.3, 'compass', {})
      
      expect(result.fallbackOptions).toContainEqual(
        expect.objectContaining({
          id: 'manual-compass',
          name: '手动输入方向',
          requiresManualInput: true,
        })
      )
      
      expect(result.fallbackOptions).toContainEqual(
        expect.objectContaining({
          id: 'calibrate-compass',
          name: '重新校准',
          requiresManualInput: false,
        })
      )
    })
  })

  describe('canDegrade', () => {
    it('should return false for high confidence', () => {
      expect(canDegrade(0.8, 'bazi')).toBe(false)
      expect(canDegrade(0.9, 'xuankong')).toBe(false)
      expect(canDegrade(0.95, 'compass')).toBe(false)
    })

    it('should return true for low confidence', () => {
      expect(canDegrade(0.3, 'bazi')).toBe(true)
      expect(canDegrade(0.2, 'xuankong')).toBe(true)
      expect(canDegrade(0.1, 'compass')).toBe(true)
    })
  })

  describe('getDegradationSuggestions', () => {
    it('should return empty array for high confidence', () => {
      const suggestions = getDegradationSuggestions(0.8, 'bazi', {
        datetime: '1990-05-10',
        gender: 'male',
      })
      
      expect(suggestions).toHaveLength(0)
    })

    it('should return suggestions for low confidence', () => {
      const suggestions = getDegradationSuggestions(0.3, 'bazi', {})
      
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions).toContain('请检查输入信息的完整性和准确性')
      expect(suggestions).toContain('您可以选择以下替代方案：')
    })

    it('should include fallback options in suggestions', () => {
      const suggestions = getDegradationSuggestions(0.3, 'bazi', {})
      
      const fallbackSection = suggestions.find(s => s.includes('您可以选择以下替代方案：'))
      expect(fallbackSection).toBeDefined()
      
      const hasManualOption = suggestions.some(s => s.includes('手动输入八字'))
      expect(hasManualOption).toBe(true)
    })
  })
})

