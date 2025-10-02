import { generateFlyingStar } from '../index';
import { generateFlyingStarExplanation } from '../explanation';

describe('Enhanced Flying Star System', () => {
  test('should generate complete flying star analysis with all new features', () => {
    const input = {
      observedAt: new Date('2024-01-01'),
      facing: { degrees: 180 }, // 子山午向
      config: {
        toleranceDeg: 0.5,
        applyTiGua: false,
        applyFanGua: false,
        evaluationProfile: 'standard' as const
      }
    };

    const result = generateFlyingStar(input);
    
    // 验证基本结构
    expect(result.period).toBeDefined();
    expect(result.plates).toBeDefined();
    expect(result.evaluation).toBeDefined();
    expect(result.meta).toBeDefined();
    
    // 验证新增功能
    expect(result.geju).toBeDefined();
    expect(result.wenchangwei).toBeDefined();
    expect(result.caiwei).toBeDefined();
    
    // 验证格局分析
    expect(result.geju?.types).toBeInstanceOf(Array);
    expect(result.geju?.descriptions).toBeInstanceOf(Array);
    expect(typeof result.geju?.isFavorable).toBe('boolean');
    
    // 验证文昌位和财位
    expect(typeof result.wenchangwei).toBe('string');
    expect(typeof result.caiwei).toBe('string');
    
    // 验证评价系统
    expect(Object.keys(result.evaluation)).toHaveLength(9);
    for (let i = 1; i <= 9; i++) {
      const evaluation = result.evaluation[i as keyof typeof result.evaluation];
      expect(evaluation.score).toBeDefined();
      expect(evaluation.tags).toBeInstanceOf(Array);
      expect(evaluation.reasons).toBeInstanceOf(Array);
    }
  });

  test('should handle jianxiang (兼向) correctly', () => {
    const input = {
      observedAt: new Date('2024-01-01'),
      facing: { degrees: 3 }, // 子山午向兼癸丁
      config: {
        toleranceDeg: 0.5,
        applyTiGua: false,
        applyFanGua: false,
        evaluationProfile: 'standard' as const
      }
    };

    const result = generateFlyingStar(input);
    
    // 验证兼向处理
    expect(result.meta.rulesApplied).toContain('兼向');
    expect(result.geju).toBeDefined();
  });

  test('should generate detailed explanation', () => {
    const input = {
      observedAt: new Date('2024-01-01'),
      facing: { degrees: 180 },
      config: {
        toleranceDeg: 0.5,
        applyTiGua: false,
        applyFanGua: false,
        evaluationProfile: 'standard' as const
      }
    };

    const result = generateFlyingStar(input);
    const explanation = generateFlyingStarExplanation(
      result.plates.period,
      result.period,
      result.geju!,
      result.wenchangwei!,
      result.caiwei!
    );
    
    // 验证解释结构
    expect(explanation.period).toBeDefined();
    expect(explanation.periodName).toBeDefined();
    expect(explanation.geju).toBeDefined();
    expect(explanation.wenchangwei).toBeDefined();
    expect(explanation.caiwei).toBeDefined();
    expect(explanation.palaces).toHaveLength(9);
    expect(explanation.summary).toBeDefined();
    
    // 验证宫位解释
    explanation.palaces.forEach((palace, index) => {
      expect(palace.palace).toBe(index + 1);
      expect(palace.bagua).toBeDefined();
      expect(palace.tianpan).toBeDefined();
      expect(palace.overall).toBeDefined();
      expect(['大吉', '吉', '平', '凶', '大凶']).toContain(palace.overall.level);
    });
  });

  test('should detect various geju patterns', () => {
    // 测试不同角度的格局检测
    const testCases = [
      { degrees: 0, expectedGeju: ['双星会向'] },
      { degrees: 90, expectedGeju: ['双星会坐'] },
      { degrees: 180, expectedGeju: ['双星会向'] },
      { degrees: 270, expectedGeju: ['双星会坐'] }
    ];

    testCases.forEach(({ degrees, expectedGeju }) => {
      const input = {
        observedAt: new Date('2024-01-01'),
        facing: { degrees },
        config: {
          toleranceDeg: 0.5,
          applyTiGua: false,
          applyFanGua: false,
          evaluationProfile: 'standard' as const
        }
      };

      const result = generateFlyingStar(input);
      expect(result.geju).toBeDefined();
      
      // 检查是否包含预期的格局类型
      expectedGeju.forEach(gejuType => {
        expect(result.geju?.types).toContain(gejuType);
      });
    });
  });

  test('should provide meaningful wenchangwei and caiwei', () => {
    const input = {
      observedAt: new Date('2024-01-01'),
      facing: { degrees: 180 },
      config: {
        toleranceDeg: 0.5,
        applyTiGua: false,
        applyFanGua: false,
        evaluationProfile: 'standard' as const
      }
    };

    const result = generateFlyingStar(input);
    
    // 验证文昌位
    expect(result.wenchangwei).toBeDefined();
    expect(result.wenchangwei?.length).toBeGreaterThan(0);
    
    // 验证财位
    expect(result.caiwei).toBeDefined();
    expect(result.caiwei?.length).toBeGreaterThan(0);
  });
});
