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
      expect(result.metadata.version).toBe('1.0.0');
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
});
