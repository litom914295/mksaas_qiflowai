import { beforeEach, describe, expect, it } from 'vitest';
import {
  type ComprehensiveAnalysisOptions,
  comprehensiveAnalysis,
} from '../comprehensive-engine';

describe('Comprehensive Analysis Engine', () => {
  let basicOptions: ComprehensiveAnalysisOptions;

  beforeEach(() => {
    // 设置基础测试选项
    basicOptions = {
      observedAt: new Date('2024-06-01T12:00:00Z'),
      facing: { degrees: 180 },
      config: {
        applyTiGua: false,
        evaluationProfile: 'standard',
      },
    };
  });

  describe('Basic Analysis', () => {
    it('should return valid analysis result with basic options', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      expect(result).toBeDefined();
      expect(result.basicAnalysis).toBeDefined();
      expect(result.basicAnalysis.period).toBeGreaterThanOrEqual(1);
      expect(result.basicAnalysis.period).toBeLessThanOrEqual(9);
      expect(result.enhancedPlate).toBeDefined();
      expect(result.enhancedPlate).toHaveLength(9);
      expect(result.overallAssessment).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('should calculate correct period for given date', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      // 2024年应该是九运
      expect(result.basicAnalysis.period).toBe(9);
    });

    it('should generate enhanced plate with all required fields', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      result.enhancedPlate.forEach((cell) => {
        expect(cell.palace).toBeGreaterThanOrEqual(1);
        expect(cell.palace).toBeLessThanOrEqual(9);
        expect(cell.mountainStar).toBeGreaterThanOrEqual(1);
        expect(cell.mountainStar).toBeLessThanOrEqual(9);
        expect(cell.facingStar).toBeGreaterThanOrEqual(1);
        expect(cell.facingStar).toBeLessThanOrEqual(9);
        expect(cell.displayConfig).toBeDefined();
        expect(cell.mountainStarInfo).toBeDefined();
        expect(cell.facingStarInfo).toBeDefined();
        expect(cell.combinationAnalysis).toBeDefined();
      });
    });

    it('should generate overall assessment with valid score', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      expect(result.overallAssessment.score).toBeGreaterThanOrEqual(0);
      expect(result.overallAssessment.score).toBeLessThanOrEqual(100);
      expect(['excellent', 'good', 'fair', 'poor']).toContain(
        result.overallAssessment.rating
      );
      expect(Array.isArray(result.overallAssessment.strengths)).toBe(true);
      expect(Array.isArray(result.overallAssessment.weaknesses)).toBe(true);
      expect(Array.isArray(result.overallAssessment.topPriorities)).toBe(true);
      expect(Array.isArray(result.overallAssessment.longTermPlan)).toBe(true);
    });
  });

  describe('Liunian Analysis', () => {
    it('should include liunian analysis when enabled', async () => {
      const options: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        includeLiunian: true,
        targetYear: 2025,
      };

      const result = await comprehensiveAnalysis(options);

      expect(result.liunianAnalysis).toBeDefined();
      expect(result.liunianAnalysis?.overlayAnalysis).toBeDefined();
      expect(result.liunianAnalysis?.yearlyTrends).toBeDefined();
      expect(result.liunianAnalysis?.seasonalAdjustments).toBeDefined();
      expect(result.liunianAnalysis?.dayunTransition).toBeDefined();
    });

    it('should not include liunian analysis when disabled', async () => {
      const options: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        includeLiunian: false,
      };

      const result = await comprehensiveAnalysis(options);

      expect(result.liunianAnalysis).toBeUndefined();
    });
  });

  describe('Personalized Analysis', () => {
    it('should include personalized analysis when user profile provided', async () => {
      const options: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        includePersonalization: true,
        userProfile: {
          birthYear: 1985,
          birthMonth: 3,
          birthDay: 15,
          gender: 'male',
          occupation: '软件工程师',
          livingHabits: {
            workFromHome: true,
            frequentTraveling: false,
            hasChildren: false,
            elderlyLiving: false,
            petsOwner: false,
          },
          familyStatus: 'single',
          financialGoals: 'growth',
        },
      };

      const result = await comprehensiveAnalysis(options);

      expect(result.personalizedAnalysis).toBeDefined();
      expect(result.personalizedAnalysis?.compatibility).toBeDefined();
      expect(result.personalizedAnalysis?.roomRecommendations).toBeDefined();
      expect(result.personalizedAnalysis?.careerEnhancement).toBeDefined();
      expect(result.personalizedAnalysis?.healthAndWellness).toBeDefined();
    });
  });

  describe('Smart Recommendations', () => {
    it('should always include smart recommendations', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      expect(result.smartRecommendations).toBeDefined();
      expect(result.smartRecommendations.all).toBeDefined();
      expect(Array.isArray(result.smartRecommendations.all)).toBe(true);
      expect(result.smartRecommendations.urgent).toBeDefined();
      expect(result.smartRecommendations.today).toBeDefined();
      expect(result.smartRecommendations.byCategory).toBeDefined();
    });

    it('should categorize recommendations correctly', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      const categories = Object.keys(result.smartRecommendations.byCategory);
      expect(categories).toContain('health');
      expect(categories).toContain('wealth');
      expect(categories).toContain('career');
      expect(categories).toContain('relationship');
      expect(categories).toContain('study');
      expect(categories).toContain('general');
    });
  });

  describe('Metadata', () => {
    it('should include correct metadata', async () => {
      const result = await comprehensiveAnalysis(basicOptions);

      expect(result.metadata.analyzedAt).toBeInstanceOf(Date);
      // 版本号应该是字符串格式，不固定具体值（因为会升级）
      expect(typeof result.metadata.version).toBe('string');
      expect(result.metadata.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(['basic', 'standard', 'comprehensive', 'expert']).toContain(
        result.metadata.analysisDepth
      );
      expect(result.metadata.computationTime).toBeGreaterThan(0);
    });

    it('should determine correct analysis depth', async () => {
      // Basic depth
      const basicResult = await comprehensiveAnalysis(basicOptions);
      expect(basicResult.metadata.analysisDepth).toBe('basic');

      // Standard depth
      const standardOptions: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        includeLiunian: true,
      };
      const standardResult = await comprehensiveAnalysis(standardOptions);
      expect(standardResult.metadata.analysisDepth).toBe('standard');

      // Comprehensive depth
      const comprehensiveOptions: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        includeLiunian: true,
        includePersonalization: true,
        userProfile: {
          birthYear: 1985,
          birthMonth: 3,
          birthDay: 15,
          gender: 'male',
          occupation: '测试',
          livingHabits: {
            workFromHome: true,
            frequentTraveling: false,
            hasChildren: false,
            elderlyLiving: false,
            petsOwner: false,
          },
          familyStatus: 'single',
        },
      };
      const comprehensiveResult =
        await comprehensiveAnalysis(comprehensiveOptions);
      expect(comprehensiveResult.metadata.analysisDepth).toBe('comprehensive');

      // Expert depth
      const expertOptions: ComprehensiveAnalysisOptions = {
        ...comprehensiveOptions,
        includeTiguaAnalysis: true,
      };
      const expertResult = await comprehensiveAnalysis(expertOptions);
      expect(expertResult.metadata.analysisDepth).toBe('expert');
    });
  });

  describe('Performance', () => {
    it('should complete basic analysis in reasonable time', async () => {
      const startTime = Date.now();
      await comprehensiveAnalysis(basicOptions);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should complete expert analysis in reasonable time', async () => {
      const expertOptions: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        includeLiunian: true,
        includePersonalization: true,
        includeTiguaAnalysis: true,
        includeLingzheng: true,
        includeChengmenjue: true,
        userProfile: {
          birthYear: 1985,
          birthMonth: 3,
          birthDay: 15,
          gender: 'male',
          occupation: '测试',
          livingHabits: {
            workFromHome: true,
            frequentTraveling: false,
            hasChildren: false,
            elderlyLiving: false,
            petsOwner: false,
          },
          familyStatus: 'single',
        },
      };

      const startTime = Date.now();
      await comprehensiveAnalysis(expertOptions);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Edge Cases', () => {
    it('should handle boundary dates correctly', async () => {
      // Test at运转换边界
      const options: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        observedAt: new Date('2024-02-04T00:00:00Z'), // 立春附近
      };

      const result = await comprehensiveAnalysis(options);
      expect(result).toBeDefined();
      expect(result.basicAnalysis.period).toBe(9);
    });

    it('should handle edge case angles', async () => {
      // Test 360度边界
      const options: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        facing: { degrees: 359.9 },
      };

      const result = await comprehensiveAnalysis(options);
      expect(result).toBeDefined();
      expect(result.basicAnalysis).toBeDefined();
    });

    it('should handle zero degree angle', async () => {
      const options: ComprehensiveAnalysisOptions = {
        ...basicOptions,
        facing: { degrees: 0 },
      };

      const result = await comprehensiveAnalysis(options);
      expect(result).toBeDefined();
      expect(result.basicAnalysis).toBeDefined();
    });
  });

  describe('Advanced Patterns Integration (Week 4 Tests)', () => {
    describe('Qixingdajie Analysis', () => {
      it('should include qixingdajie analysis when enabled', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
          observedAt: new Date('2024-06-01T12:00:00Z'), // 九运
          facing: { degrees: 180 }, // 坐子向午
        };

        const result = await comprehensiveAnalysis(options);

        expect(result.qixingdajieAnalysis).toBeDefined();
        expect(result.qixingdajieAnalysis).toHaveProperty('isQixingDajie');
        expect(result.qixingdajieAnalysis).toHaveProperty('dajieType');
        expect(result.qixingdajieAnalysis).toHaveProperty('dajiePositions');
        expect(result.qixingdajieAnalysis).toHaveProperty('effectiveness');
        expect(result.qixingdajieAnalysis).toHaveProperty('score');
        expect(result.qixingdajieAnalysis).toHaveProperty('sanbanGuaValidation');
        expect(result.qixingdajieAnalysis).toHaveProperty(
          'activationRequirements'
        );
        expect(result.qixingdajieAnalysis).toHaveProperty('taboos');
      });

      it('should not include qixingdajie analysis when disabled', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: false,
        };

        const result = await comprehensiveAnalysis(options);
        expect(result.qixingdajieAnalysis).toBeUndefined();
      });

      it('should validate sanban gua structure', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
        };

        const result = await comprehensiveAnalysis(options);
        const sanbanValidation =
          result.qixingdajieAnalysis?.sanbanGuaValidation;

        expect(sanbanValidation).toBeDefined();
        expect(sanbanValidation).toHaveProperty('isValid');
        expect(sanbanValidation).toHaveProperty('group');
        expect(sanbanValidation).toHaveProperty('matchCount');
        expect(sanbanValidation).toHaveProperty('details');
        expect(Array.isArray(sanbanValidation?.group)).toBe(true);
        expect(Array.isArray(sanbanValidation?.details)).toBe(true);
      });

      it('should return valid effectiveness level', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
        };

        const result = await comprehensiveAnalysis(options);
        const effectiveness = result.qixingdajieAnalysis?.effectiveness;

        expect(['peak', 'high', 'medium', 'low']).toContain(effectiveness);
      });

      it('should return score between 0-100', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
        };

        const result = await comprehensiveAnalysis(options);
        const score = result.qixingdajieAnalysis?.score;

        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });

      it('should include qixingdajie in overall assessment when present', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
        };

        const result = await comprehensiveAnalysis(options);

        if (result.qixingdajieAnalysis?.isQixingDajie) {
          const hasQixingInStrengths = result.overallAssessment.strengths.some(
            (s) => s.includes('七星打劫')
          );
          const hasQixingInPriorities =
            result.overallAssessment.topPriorities.some((p) =>
              p.includes('七星打劫')
            );

          expect(hasQixingInStrengths || hasQixingInPriorities).toBe(true);
        }
      });
    });

    describe('Chengmenjue Analysis', () => {
      it('should include chengmenjue analysis when enabled', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeChengmenjue: true,
        };

        const result = await comprehensiveAnalysis(options);

        expect(result.chengmenjueAnalysis).toBeDefined();
        expect(result.chengmenjueAnalysis).toHaveProperty('hasChengmen');
        expect(result.chengmenjueAnalysis).toHaveProperty('chengmenPositions');
        expect(result.chengmenjueAnalysis).toHaveProperty('activationMethods');
        expect(result.chengmenjueAnalysis).toHaveProperty('taboos');
      });

      it('should return valid chengmen positions', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeChengmenjue: true,
        };

        const result = await comprehensiveAnalysis(options);
        const positions = result.chengmenjueAnalysis?.chengmenPositions;

        expect(Array.isArray(positions)).toBe(true);
        positions?.forEach((pos: any) => {
          expect(pos).toHaveProperty('palace');
          expect(pos).toHaveProperty('description');
          expect(pos).toHaveProperty('effectiveness');
          expect(['high', 'medium', 'low']).toContain(pos.effectiveness);
        });
      });
    });

    describe('Lingzheng Analysis', () => {
      it('should include lingzheng analysis when enabled', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeLingzheng: true,
        };

        const result = await comprehensiveAnalysis(options);

        expect(result.lingzhengAnalysis).toBeDefined();
        expect(result.lingzhengAnalysis).toHaveProperty('zeroGodPosition');
        expect(result.lingzhengAnalysis).toHaveProperty('positiveGodPosition');
        expect(result.lingzhengAnalysis).toHaveProperty(
          'isZeroPositiveReversed'
        );
        expect(result.lingzhengAnalysis).toHaveProperty('waterPlacement');
        expect(result.lingzhengAnalysis).toHaveProperty('mountainPlacement');
      });

      it('should detect zero-positive reversal', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeLingzheng: true,
        };

        const result = await comprehensiveAnalysis(options);
        const isReversed = result.lingzhengAnalysis?.isZeroPositiveReversed;

        expect(typeof isReversed).toBe('boolean');

        if (isReversed) {
          // 如果零正颠倒，应该在综合评估中反映
          const hasWarning = result.overallAssessment.weaknesses.some(
            (w) => w.includes('零正颠倒') || w.includes('零正')
          );
          expect(hasWarning).toBe(true);
        }
      });

      it('should return valid water and mountain placements', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeLingzheng: true,
        };

        const result = await comprehensiveAnalysis(options);
        const waterPlacement = result.lingzhengAnalysis?.waterPlacement;
        const mountainPlacement = result.lingzhengAnalysis?.mountainPlacement;

        expect(waterPlacement).toBeDefined();
        expect(waterPlacement).toHaveProperty('favorable');
        expect(waterPlacement).toHaveProperty('unfavorable');
        expect(Array.isArray(waterPlacement?.favorable)).toBe(true);
        expect(Array.isArray(waterPlacement?.unfavorable)).toBe(true);

        expect(mountainPlacement).toBeDefined();
        expect(mountainPlacement).toHaveProperty('favorable');
        expect(mountainPlacement).toHaveProperty('unfavorable');
        expect(Array.isArray(mountainPlacement?.favorable)).toBe(true);
        expect(Array.isArray(mountainPlacement?.unfavorable)).toBe(true);
      });
    });

    describe('All Three Patterns Together', () => {
      it('should handle all three advanced patterns simultaneously', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
          includeChengmenjue: true,
          includeLingzheng: true,
        };

        const result = await comprehensiveAnalysis(options);

        expect(result.qixingdajieAnalysis).toBeDefined();
        expect(result.chengmenjueAnalysis).toBeDefined();
        expect(result.lingzhengAnalysis).toBeDefined();

        // 验证综合评估考虑了所有三种格局
        expect(result.overallAssessment).toBeDefined();
        expect(result.overallAssessment.score).toBeGreaterThanOrEqual(0);
        expect(result.overallAssessment.score).toBeLessThanOrEqual(100);
      });

      it('should complete all three patterns within performance threshold', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
          includeChengmenjue: true,
          includeLingzheng: true,
        };

        const startTime = Date.now();
        const result = await comprehensiveAnalysis(options);
        const endTime = Date.now();

        const duration = endTime - startTime;
        expect(duration).toBeLessThan(2000); // 应该在2秒内完成
        expect(result).toBeDefined();
      });

      it('should update version to 6.1.0 when qixingdajie is included', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          includeQixingdajie: true,
        };

        const result = await comprehensiveAnalysis(options);
        expect(result.metadata.version).toBe('6.1.0');
      });
    });

    describe('Different Yun Periods', () => {
      it('should analyze Yun 8 (2004-2023)', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          observedAt: new Date('2020-06-01T12:00:00Z'), // 八运
          includeQixingdajie: true,
          includeChengmenjue: true,
          includeLingzheng: true,
        };

        const result = await comprehensiveAnalysis(options);

        expect(result.basicAnalysis.period).toBe(8);
        expect(result.qixingdajieAnalysis).toBeDefined();
        expect(result.chengmenjueAnalysis).toBeDefined();
        expect(result.lingzhengAnalysis).toBeDefined();
      });

      it('should analyze Yun 9 (2024-2043)', async () => {
        const options: ComprehensiveAnalysisOptions = {
          ...basicOptions,
          observedAt: new Date('2025-06-01T12:00:00Z'), // 九运
          includeQixingdajie: true,
          includeChengmenjue: true,
          includeLingzheng: true,
        };

        const result = await comprehensiveAnalysis(options);

        expect(result.basicAnalysis.period).toBe(9);
        expect(result.qixingdajieAnalysis).toBeDefined();
        expect(result.chengmenjueAnalysis).toBeDefined();
        expect(result.lingzhengAnalysis).toBeDefined();
      });
    });
  });
});
