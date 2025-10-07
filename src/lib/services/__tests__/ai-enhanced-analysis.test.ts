/**
 * AI增强分析服务单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAIEnhancedAnalysis, generateQuickAIAnalysis } from '../ai-enhanced-analysis';
import type { BaziAnalysisResult } from '../bazi-calculator-service';

// Mock AI SDK
vi.mock('ai', () => ({
  generateText: vi.fn(),
}));

vi.mock('@ai-sdk/openai', () => ({
  openai: vi.fn(() => 'mocked-model'),
}));

// 测试用的八字分析结果
const mockBaziResult: BaziAnalysisResult = {
  fourPillars: {
    year: { heavenlyStem: '甲', earthlyBranch: '子' },
    month: { heavenlyStem: '乙', earthlyBranch: '丑' },
    day: { heavenlyStem: '丙', earthlyBranch: '寅' },
    hour: { heavenlyStem: '丁', earthlyBranch: '卯' },
  },
  dayMaster: '丙火',
  fiveElements: {
    wood: 3,
    fire: 2,
    earth: 1,
    metal: 1,
    water: 1,
  },
  favorableElements: ['木', '火'],
  unfavorableElements: ['水', '金'],
  strength: 'strong',
  analysis: '日主丙火身强，喜木火，忌水金。',
  luckyColors: ['绿色', '红色'],
  luckyNumbers: [3, 4, 9],
  careerGuidance: '适合从事文化、教育、艺术等领域。',
  wealthGuidance: '财运亨通，但需注意理财。',
  healthGuidance: '注意心血管健康。',
  relationshipGuidance: '感情生活和谐，需要互相理解。',
};

describe('AI增强分析服务', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAIEnhancedAnalysis', () => {
    it('应该生成完整的AI增强分析', async () => {
      const { generateText } = await import('ai');
      
      // Mock AI响应
      (generateText as any).mockResolvedValue({
        text: '测试分析内容',
      });

      const result = await generateAIEnhancedAnalysis(mockBaziResult);

      expect(result).toHaveProperty('personality');
      expect(result).toHaveProperty('career');
      expect(result).toHaveProperty('wealth');
      expect(result).toHaveProperty('relationship');
      expect(result).toHaveProperty('health');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('generatedAt');
      expect(result.generatedAt).toBeInstanceOf(Date);
    });

    it('AI调用失败时应该返回降级分析', async () => {
      const { generateText } = await import('ai');
      
      // Mock AI调用失败
      (generateText as any).mockRejectedValue(new Error('API Error'));

      const result = await generateAIEnhancedAnalysis(mockBaziResult);

      // 应该返回基础分析
      expect(result.personality).toBe('性格温和稳重，善于思考。');
      expect(result.career).toBe(mockBaziResult.careerGuidance);
      expect(result.wealth).toBe(mockBaziResult.wealthGuidance);
      expect(result.relationship).toBe(mockBaziResult.relationshipGuidance);
      expect(result.health).toBe(mockBaziResult.healthGuidance);
      expect(result.summary).toBe(mockBaziResult.analysis);
    });

    it('应该并行生成所有分析维度', async () => {
      const { generateText } = await import('ai');
      
      let callCount = 0;
      (generateText as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({ text: `分析内容 ${callCount}` });
      });

      await generateAIEnhancedAnalysis(mockBaziResult);

      // 应该调用6次（5个维度 + 总结）
      expect(callCount).toBe(6);
    });
  });

  describe('generateQuickAIAnalysis', () => {
    it('应该生成快速分析', async () => {
      const { generateText } = await import('ai');
      
      (generateText as any).mockResolvedValue({
        text: '这是一个快速分析',
      });

      const result = await generateQuickAIAnalysis(mockBaziResult);

      expect(result).toBe('这是一个快速分析');
    });

    it('快速分析失败时应该返回基础分析', async () => {
      const { generateText } = await import('ai');
      
      (generateText as any).mockRejectedValue(new Error('API Error'));

      const result = await generateQuickAIAnalysis(mockBaziResult);

      expect(result).toBe(mockBaziResult.analysis);
    });

    it('应该只调用一次AI', async () => {
      const { generateText } = await import('ai');
      
      let callCount = 0;
      (generateText as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({ text: '快速分析' });
      });

      await generateQuickAIAnalysis(mockBaziResult);

      expect(callCount).toBe(1);
    });
  });

  describe('类型验证', () => {
    it('返回的结果应该包含所有必需字段', async () => {
      const { generateText } = await import('ai');
      
      (generateText as any).mockResolvedValue({
        text: '测试内容',
      });

      const result = await generateAIEnhancedAnalysis(mockBaziResult);

      // 验证所有字段存在
      expect(typeof result.personality).toBe('string');
      expect(typeof result.career).toBe('string');
      expect(typeof result.wealth).toBe('string');
      expect(typeof result.relationship).toBe('string');
      expect(typeof result.health).toBe('string');
      expect(typeof result.summary).toBe('string');
      expect(result.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('边界情况', () => {
    it('应该处理空的喜用神数组', async () => {
      const { generateText } = await import('ai');
      
      (generateText as any).mockResolvedValue({
        text: '测试分析',
      });

      const emptyBaziResult = {
        ...mockBaziResult,
        favorableElements: [],
      };

      const result = await generateAIEnhancedAnalysis(emptyBaziResult);

      expect(result).toBeDefined();
      expect(result.personality).toBeTruthy();
    });

    it('应该处理极端的五行值', async () => {
      const { generateText } = await import('ai');
      
      (generateText as any).mockResolvedValue({
        text: '测试分析',
      });

      const extremeBaziResult = {
        ...mockBaziResult,
        fiveElements: {
          wood: 8,
          fire: 0,
          earth: 0,
          metal: 0,
          water: 0,
        },
      };

      const result = await generateAIEnhancedAnalysis(extremeBaziResult);

      expect(result).toBeDefined();
    });
  });
});
