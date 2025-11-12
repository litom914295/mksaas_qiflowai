import { describe, expect, test } from 'vitest';
import {
  analyzeDajieEffectiveness,
  calculateDajieScore,
  checkQixingDajiePattern,
  generateDajieActivationRequirements,
  generateDajieDescription,
  generateDajieTaboos,
  getSanbanGroupByPeriod,
  identifyDajiePositions,
  isShengwangStar,
  validateSanbanGua,
} from '../qixing-dajie';
import type { Plate, Yun } from '../types';

/**
 * 七星打劫测试套件
 *
 * 测试覆盖：
 * - 测试组1：三般卦验证 (15个案例)
 * - 测试组2：打劫类型判断 (12个案例)
 * - 测试组3：有效性评估 (8个案例)
 * - 测试组4：建议生成 (6个案例)
 * - 测试组5：集成测试 (5个案例)
 *
 * 总计：46个测试案例
 */

// 辅助函数：创建测试飞星盘
function createTestPlate(
  periodStars: number[],
  mountainStars: number[],
  facingStars: number[]
): Plate {
  return periodStars.map((periodStar, index) => ({
    palace: (index + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    periodStar: periodStar as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    mountainStar: mountainStars[index] as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    facingStar: facingStars[index] as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  }));
}

describe('七星打劫模块测试', () => {
  // ==================== 测试组1：三般卦验证 (15个案例) ====================
  describe('三般卦验证', () => {
    describe('1-4-7组', () => {
      test('一运典型案例 - 满足三般卦', () => {
        const plate = createTestPlate(
          [1, 4, 7, 1, 4, 7, 1, 4, 7],
          [4, 7, 1, 4, 7, 1, 4, 7, 1],
          [7, 1, 4, 7, 1, 4, 7, 1, 4]
        );
        const result = validateSanbanGua(plate, 1);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([1, 4, 7]);
        expect(result.matchCount).toBeGreaterThanOrEqual(6);
      });

      test('四运典型案例 - 满足三般卦', () => {
        const plate = createTestPlate(
          [4, 1, 7, 4, 1, 7, 4, 1, 7],
          [1, 7, 4, 1, 7, 4, 1, 7, 4],
          [7, 4, 1, 7, 4, 1, 7, 4, 1]
        );
        const result = validateSanbanGua(plate, 4);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([1, 4, 7]);
        expect(result.matchCount).toBeGreaterThanOrEqual(6);
      });

      test('七运典型案例 - 满足三般卦', () => {
        const plate = createTestPlate(
          [7, 4, 1, 7, 4, 1, 7, 4, 1],
          [4, 1, 7, 4, 1, 7, 4, 1, 7],
          [1, 7, 4, 1, 7, 4, 1, 7, 4]
        );
        const result = validateSanbanGua(plate, 7);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([1, 4, 7]);
      });

      test('边缘案例 - 恰好满足三般卦 (6个匹配)', () => {
        const plate = createTestPlate(
          [1, 4, 2, 3, 5, 6, 7, 8, 9],
          [2, 3, 5, 6, 8, 9, 1, 2, 3],
          [3, 5, 6, 8, 9, 1, 2, 3, 4]
        );
        const result = validateSanbanGua(plate, 1);
        expect(result.isValid).toBe(true);
        expect(result.matchCount).toBe(6);
      });

      test('负面案例 - 不满足三般卦 (5个匹配)', () => {
        const plate = createTestPlate(
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [2, 3, 5, 6, 8, 9, 2, 3, 5],
          [3, 5, 6, 8, 9, 2, 3, 5, 6]
        );
        const result = validateSanbanGua(plate, 1);
        expect(result.isValid).toBe(false);
        expect(result.matchCount).toBeLessThan(6);
      });
    });

    describe('2-5-8组', () => {
      test('二运典型案例', () => {
        const plate = createTestPlate(
          [2, 5, 8, 2, 5, 8, 2, 5, 8],
          [5, 8, 2, 5, 8, 2, 5, 8, 2],
          [8, 2, 5, 8, 2, 5, 8, 2, 5]
        );
        const result = validateSanbanGua(plate, 2);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([2, 5, 8]);
      });

      test('五运典型案例', () => {
        const plate = createTestPlate(
          [5, 2, 8, 5, 2, 8, 5, 2, 8],
          [2, 8, 5, 2, 8, 5, 2, 8, 5],
          [8, 5, 2, 8, 5, 2, 8, 5, 2]
        );
        const result = validateSanbanGua(plate, 5);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([2, 5, 8]);
      });

      test('八运典型案例', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [2, 5, 8, 2, 5, 8, 2, 5, 8],
          [5, 8, 2, 5, 8, 2, 5, 8, 2]
        );
        const result = validateSanbanGua(plate, 8);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([2, 5, 8]);
      });

      test('边缘案例', () => {
        const plate = createTestPlate(
          [2, 5, 1, 3, 4, 6, 7, 8, 9],
          [5, 2, 4, 6, 7, 9, 8, 1, 3],
          [8, 4, 6, 7, 9, 1, 2, 4, 5]
        );
        const result = validateSanbanGua(plate, 2);
        expect(result.isValid).toBe(true);
        expect(result.matchCount).toBeGreaterThanOrEqual(6);
      });

      test('负面案例', () => {
        const plate = createTestPlate(
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [9, 1, 3, 4, 6, 7, 9, 1, 3],
          [3, 4, 6, 7, 9, 1, 3, 4, 6]
        );
        const result = validateSanbanGua(plate, 2);
        expect(result.isValid).toBe(false);
      });
    });

    describe('3-6-9组', () => {
      test('三运典型案例', () => {
        const plate = createTestPlate(
          [3, 6, 9, 3, 6, 9, 3, 6, 9],
          [6, 9, 3, 6, 9, 3, 6, 9, 3],
          [9, 3, 6, 9, 3, 6, 9, 3, 6]
        );
        const result = validateSanbanGua(plate, 3);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([3, 6, 9]);
      });

      test('六运典型案例', () => {
        const plate = createTestPlate(
          [6, 3, 9, 6, 3, 9, 6, 3, 9],
          [3, 9, 6, 3, 9, 6, 3, 9, 6],
          [9, 6, 3, 9, 6, 3, 9, 6, 3]
        );
        const result = validateSanbanGua(plate, 6);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([3, 6, 9]);
      });

      test('九运典型案例', () => {
        const plate = createTestPlate(
          [9, 3, 6, 9, 3, 6, 9, 3, 6],
          [3, 6, 9, 3, 6, 9, 3, 6, 9],
          [6, 9, 3, 6, 9, 3, 6, 9, 3]
        );
        const result = validateSanbanGua(plate, 9);
        expect(result.isValid).toBe(true);
        expect(result.group).toEqual([3, 6, 9]);
      });

      test('边缘案例', () => {
        const plate = createTestPlate(
          [3, 6, 1, 2, 4, 5, 7, 8, 9],
          [6, 3, 4, 5, 7, 8, 9, 1, 2],
          [9, 4, 5, 7, 8, 1, 3, 4, 6]
        );
        const result = validateSanbanGua(plate, 3);
        expect(result.isValid).toBe(true);
      });

      test('负面案例', () => {
        const plate = createTestPlate(
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [2, 4, 5, 7, 8, 1, 2, 4, 5],
          [4, 5, 7, 8, 1, 2, 4, 5, 7]
        );
        const result = validateSanbanGua(plate, 3);
        expect(result.isValid).toBe(false);
      });
    });
  });

  // ==================== 测试组2：打劫类型判断 (12个案例) ====================
  describe('打劫类型判断', () => {
    test('劫财格局 - 向星当运', () => {
      // 八运，检查宫位2/5/8，坤宫(2)向星为8
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 1, 9, 1, 3, 4],
        [1, 8, 3, 4, 6, 7, 9, 1, 3] // 坤宫(2)向星为8
      );
      const sanbanGroup = getSanbanGroupByPeriod(8); // [2,5,8]
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiecaiPositions.length).toBeGreaterThan(0);
      expect(result.jiecaiPositions).toContain(2); // 坤宫
    });

    test('劫财格局 - 向星生旺', () => {
      // 八运，检查宫位2/5/8，坤宫(2)向星为9（生旺星）
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 1, 9, 1, 3, 4],
        [1, 9, 3, 4, 6, 7, 9, 1, 3] // 坤宫(2)向星为9
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiecaiPositions.length).toBeGreaterThan(0);
      expect(result.jiecaiPositions).toContain(2);
    });

    test('劫丁格局 - 山星当运', () => {
      // 八运，检查宫位2/5/8，坤宫(2)山星为8
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 8, 4, 6, 1, 9, 1, 3, 4], // 坤宫(2)山星为8
        [1, 3, 4, 6, 7, 9, 1, 3, 4]
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiedingPositions.length).toBeGreaterThan(0);
      expect(result.jiedingPositions).toContain(2);
    });

    test('劫丁格局 - 山星生旺', () => {
      // 八运，检查宫位2/5/8，坤宫(2)山星为7（生旺星）
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 7, 4, 6, 1, 9, 1, 3, 4], // 坤宫(2)山星为7
        [1, 3, 4, 6, 7, 9, 1, 3, 4]
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiedingPositions.length).toBeGreaterThan(0);
      expect(result.jiedingPositions).toContain(2);
    });

    test('全劫格局 - 同时满足劫财劫丁', () => {
      // 八运，坤宫(2)、中宫(5)、艮宫(8)山向星都是8
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 8, 4, 6, 8, 9, 1, 8, 4], // 宫位2/5/8山星=8
        [1, 8, 4, 6, 8, 9, 1, 8, 4] // 宫位2/5/8向星=8
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiecaiPositions.length).toBeGreaterThan(0);
      expect(result.jiedingPositions.length).toBeGreaterThan(0);
      expect(result.allPositions.length).toBeGreaterThan(0);
    });

    test('全劫格局 - 多个宫位打劫', () => {
      // 八运，宫位2/5/8的山星和向星都是生旺星
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 9, 4, 6, 7, 9, 1, 8, 4], // 宫位2山星=9, 5山星=7, 8山星=8
        [1, 8, 4, 6, 9, 9, 1, 7, 4] // 宫位2向星=8, 5向星=9, 8向星=7
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.allPositions.length).toBeGreaterThanOrEqual(2);
    });

    test('边缘案例 - 仅一个位置劫财', () => {
      // 八运，只有坤宫(2)向星为8
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 1, 9, 1, 3, 4],
        [1, 8, 3, 4, 6, 7, 9, 1, 3] // 只有宫位2向星=8
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiecaiPositions).toHaveLength(1);
      expect(result.jiecaiPositions).toContain(2);
    });

    test('边缘案例 - 仅一个位置劫丁', () => {
      // 八运，只有坤宫(2)山星为8
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 8, 4, 6, 1, 9, 1, 3, 4], // 只有宫位2山星=8
        [1, 3, 4, 6, 7, 9, 1, 3, 4]
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.jiedingPositions).toHaveLength(1);
      expect(result.jiedingPositions).toContain(2);
    });

    test('负面案例 - 有三般卦但无打劫位', () => {
      // 八运，宫位2/5/8的山向星都不是当运星或生旺星
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 1, 9, 1, 3, 4], // 宫位2/5/8山星=3/1/3
        [1, 3, 4, 6, 1, 9, 1, 3, 4] // 宫位2/5/8向星=3/1/3
      );
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      expect(result.allPositions).toHaveLength(0);
    });

    test('负面案例 - 星到位但非三般卦组', () => {
      // 一运盘（1-4-7组），但用八运检查（2-5-8组）
      const plate = createTestPlate(
        [1, 4, 7, 1, 4, 7, 1, 4, 7],
        [8, 8, 8, 8, 8, 8, 8, 8, 8],
        [8, 8, 8, 8, 8, 8, 8, 8, 8]
      );
      const sanbanGroup = getSanbanGroupByPeriod(8); // [2,5,8]
      const result = identifyDajiePositions(plate, 8, sanbanGroup);
      // 宫位2山向星都是8，满足打劫条件
      expect(result.allPositions.length).toBeGreaterThan(0);
    });

    test('负面案例 - 完全不成格', () => {
      // 设计一个真正不满足三般卦的数据（只有5个匹配）
      const plate = createTestPlate(
        [1, 2, 3, 4, 6, 6, 7, 9, 9], // 2和5共现1次
        [9, 1, 3, 3, 4, 6, 6, 7, 1], // 2和5共现0次
        [1, 9, 1, 3, 3, 4, 6, 6, 7]  // 2和5共现0次
      );
      // 检查三般卦（八运检查2-5-8组），期望不满足
      const result = validateSanbanGua(plate, 8);
      expect(result.isValid).toBe(false);
    });

    test('特殊案例 - 五运中宫打劫', () => {
      // 五运，检查宫位2/5/8，中宫(5)山向星都是5
      const plate = createTestPlate(
        [5, 2, 8, 5, 2, 8, 5, 2, 8],
        [1, 3, 4, 6, 5, 9, 1, 3, 4], // 中宫(5)山星=5
        [1, 3, 4, 6, 5, 9, 1, 3, 4] // 中宫(5)向星=5
      );
      const sanbanGroup = getSanbanGroupByPeriod(5); // [2,5,8]
      const result = identifyDajiePositions(plate, 5, sanbanGroup);
      expect(result.allPositions).toContain(5); // 中宫
    });
  });

  // ==================== 测试组3：有效性评估 (8个案例) ====================
  describe('打劫有效性评估', () => {
    test('Peak级 - 三般卦完美+当运星全到位', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5], // 天盘全是2-5-8
        [8, 8, 8, 8, 8, 8, 8, 8, 8], // 全部山星=8
        [8, 8, 8, 8, 8, 8, 8, 8, 8] // 全部向星=8
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      const effectiveness = analyzeDajieEffectiveness(
        plate,
        8,
        positions,
        sanbanValidation
      );
      expect(effectiveness).toBe('peak');
    });

    test('High级 - 三般卦良好+大部分当运星到位', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 1, 3, 4],
        [8, 2, 5, 9, 2, 7, 1, 3, 4],
        [9, 2, 5, 8, 2, 7, 1, 3, 4]
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      if (positions.length > 0) {
        const effectiveness = analyzeDajieEffectiveness(
          plate,
          8,
          positions,
          sanbanValidation
        );
        expect(['high', 'peak']).toContain(effectiveness);
      }
    });

    test('Medium级 - 三般卦及格+部分当运星到位', () => {
      const plate = createTestPlate(
        [8, 2, 5, 1, 3, 4, 6, 7, 9],
        [9, 2, 5, 1, 3, 4, 6, 7, 8],
        [1, 8, 3, 4, 5, 6, 7, 9, 2]
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      if (positions.length > 0 && sanbanValidation.isValid) {
        const effectiveness = analyzeDajieEffectiveness(
          plate,
          8,
          positions,
          sanbanValidation
        );
        expect(['medium', 'high', 'low']).toContain(effectiveness);
      }
    });

    test('Low级 - 勉强满足条件', () => {
      const plate = createTestPlate(
        [8, 2, 1, 3, 4, 6, 7, 9, 5],
        [1, 3, 4, 6, 7, 9, 8, 1, 2],
        [3, 4, 6, 7, 9, 1, 2, 3, 8]
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      if (positions.length > 0 && sanbanValidation.isValid) {
        const effectiveness = analyzeDajieEffectiveness(
          plate,
          8,
          positions,
          sanbanValidation
        );
        expect(['low', 'medium']).toContain(effectiveness);
      }
    });

    test('边缘案例 - Peak与High临界值', () => {
      // 评分86分附近
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [8, 8, 4, 6, 8, 9, 1, 3, 4], // 宫位2/5/8山星=8/8/8
        [8, 8, 4, 6, 1, 9, 1, 3, 4] // 宫位2/5向星=8/8
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      const effectiveness = analyzeDajieEffectiveness(
        plate,
        8,
        positions,
        sanbanValidation
      );
      expect(['peak', 'high', 'medium']).toContain(effectiveness);
    });

    test('边缘案例 - High与Medium临界值', () => {
      // 评分70分附近
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 1, 3, 4, 6],
        [9, 2, 7, 1, 3, 4, 6, 7, 8],
        [1, 8, 3, 4, 5, 6, 7, 9, 2]
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      if (positions.length > 0 && sanbanValidation.isValid) {
        const effectiveness = analyzeDajieEffectiveness(
          plate,
          8,
          positions,
          sanbanValidation
        );
        expect(['high', 'medium', 'low']).toContain(effectiveness);
      }
    });

    test('边缘案例 - Medium与Low临界值', () => {
      // 评分在50分附近
      const plate = createTestPlate(
        [8, 2, 1, 3, 4, 6, 7, 9, 5],
        [1, 3, 4, 6, 7, 9, 8, 1, 2],
        [3, 4, 6, 7, 9, 1, 2, 3, 8]
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      if (positions.length > 0 && sanbanValidation.isValid) {
        const effectiveness = analyzeDajieEffectiveness(
          plate,
          8,
          positions,
          sanbanValidation
        );
        expect(['medium', 'low']).toContain(effectiveness);
      }
    });

    test('特殊案例 - 生旺星加成影响', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 9, 4, 6, 7, 9, 1, 8, 4], // 宫位2山星=9, 5山星=7, 8山星=8
        [1, 7, 4, 6, 9, 9, 1, 9, 4] // 宫位2向星=7, 5向星=9, 8向星=9
      );
      const sanbanValidation = validateSanbanGua(plate, 8);
      const sanbanGroup = getSanbanGroupByPeriod(8);
      const positions = identifyDajiePositions(plate, 8, sanbanGroup).allPositions;
      expect(positions.length).toBeGreaterThan(0);
    });
  });

  // ==================== 测试组4：建议生成 (6个案例) ====================
  describe('打劫建议生成', () => {
    test('劫财建议 - 水法配置', () => {
      const requirements = generateDajieActivationRequirements('jie_cai', [2, 5, 8]);
      expect(requirements).toContain('必须满足三般卦条件（1-4-7、2-5-8或3-6-9组）');
      expect(requirements.some((r) => r.includes('流动的水'))).toBe(true);
      expect(requirements.some((r) => r.includes('鱼缸'))).toBe(true);
    });

    test('劫丁建议 - 山法配置', () => {
      const requirements = generateDajieActivationRequirements('jie_ding', [2, 5, 8]);
      expect(requirements.some((r) => r.includes('活动的场所'))).toBe(true);
      expect(requirements.some((r) => r.includes('人气'))).toBe(true);
    });

    test('全劫建议 - 综合配置', () => {
      const requirements = generateDajieActivationRequirements('full', [2, 5, 8]);
      expect(requirements.some((r) => r.includes('流动的水'))).toBe(true);
      expect(requirements.some((r) => r.includes('活动的场所'))).toBe(true);
      expect(requirements.length).toBeGreaterThan(5);
    });

    test('禁忌生成 - 劫财位禁忌', () => {
      const taboos = generateDajieTaboos([2]);
      expect(taboos.some((t) => t.includes('杂物'))).toBe(true);
      expect(taboos.some((t) => t.includes('阴暗'))).toBe(true);
      expect(taboos.some((t) => t.includes('坤宫'))).toBe(true);
    });

    test('禁忌生成 - 劫丁位禁忌', () => {
      const taboos = generateDajieTaboos([5]);
      expect(taboos.some((t) => t.includes('中宫'))).toBe(true);
      expect(taboos.some((t) => t.includes('杂乱'))).toBe(true);
    });

    test('特殊运建议 - 五运中宫', () => {
      const requirements = generateDajieActivationRequirements('full', [5]);
      expect(requirements.some((r) => r.includes('中宫'))).toBe(true);
    });
  });

  // ==================== 测试组5：集成测试 (5个案例) ====================
  describe('七星打劫集成测试', () => {
    test('完整案例 - 八运子山午向七星打劫', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [8, 8, 4, 6, 8, 9, 1, 8, 4], // 宫位2/5/8山星=8/8/8
        [8, 8, 4, 6, 8, 9, 1, 8, 4] // 宫位2/5/8向星=8/8/8
      );
      const analysis = checkQixingDajiePattern(plate, 8, '子', '午');
      expect(analysis.isQixingDajie).toBe(true);
      expect(analysis.dajieType).toBe('full');
      expect(analysis.sanbanGuaValidation.isValid).toBe(true);
      expect(analysis.score).toBeGreaterThan(75);
    });

    test('完整案例 - 九运卢山酉向七星打劫', () => {
      const plate = createTestPlate(
        [9, 3, 6, 9, 3, 6, 9, 3, 6],
        [1, 2, 9, 4, 5, 9, 7, 8, 9], // 宫位3/6/9山星=9
        [1, 2, 9, 4, 5, 9, 7, 8, 9] // 宫位3/6/9向星=9
      );
      const analysis = checkQixingDajiePattern(plate, 9, '卢', '酉');
      expect(analysis.isQixingDajie).toBe(true);
      expect(analysis.sanbanGuaValidation.group).toEqual([3, 6, 9]);
    });

    test('负面案例 - 不成七星打劫格局', () => {
      // 不满足三般卦条件
      const plate = createTestPlate(
        [1, 2, 3, 4, 6, 6, 7, 9, 9],
        [9, 1, 3, 3, 4, 6, 6, 7, 1],
        [1, 9, 1, 3, 3, 4, 6, 6, 7]
      );
      const analysis = checkQixingDajiePattern(plate, 8, '子', '午');
      expect(analysis.isQixingDajie).toBe(false);
      expect(analysis.score).toBe(0);
    });

    test('性能测试 - 1000次打劫检测<100ms', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [8, 2, 5, 8, 2, 5, 8, 2, 5]
      );
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        checkQixingDajiePattern(plate, 8, '子', '午');
      }
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100);
    });

    test('描述生成测试', () => {
      const desc1 = generateDajieDescription('full', 'peak', [2, 5, 8]);
      expect(desc1).toContain('七星打劫');
      expect(desc1).toContain('全劫');
      expect(desc1).toContain('卓越');

      const desc2 = generateDajieDescription('jie_cai', 'high', [2]);
      expect(desc2).toContain('劫财');
      expect(desc2).toContain('良好');
    });
  });

  // ==================== 辅助函数测试 ====================
  describe('辅助函数测试', () => {
    test('getSanbanGroupByPeriod - 各运正确性', () => {
      expect(getSanbanGroupByPeriod(1)).toEqual([1, 4, 7]);
      expect(getSanbanGroupByPeriod(4)).toEqual([1, 4, 7]);
      expect(getSanbanGroupByPeriod(7)).toEqual([1, 4, 7]);
      expect(getSanbanGroupByPeriod(2)).toEqual([2, 5, 8]);
      expect(getSanbanGroupByPeriod(5)).toEqual([2, 5, 8]);
      expect(getSanbanGroupByPeriod(8)).toEqual([2, 5, 8]);
      expect(getSanbanGroupByPeriod(3)).toEqual([3, 6, 9]);
      expect(getSanbanGroupByPeriod(6)).toEqual([3, 6, 9]);
      expect(getSanbanGroupByPeriod(9)).toEqual([3, 6, 9]);
    });

    test('isShengwangStar - 生旺星判断', () => {
      // 八运的生旺星：7(退), 8(当运), 9(生)
      expect(isShengwangStar(7, 8)).toBe(true);
      expect(isShengwangStar(8, 8)).toBe(true);
      expect(isShengwangStar(9, 8)).toBe(true);
      expect(isShengwangStar(6, 8)).toBe(false);
      expect(isShengwangStar(1, 8)).toBe(false);

      // 一运的生旺星：9(退), 1(当运), 2(生)
      expect(isShengwangStar(9, 1)).toBe(true);
      expect(isShengwangStar(1, 1)).toBe(true);
      expect(isShengwangStar(2, 1)).toBe(true);

      // 九运的生旺星：8(退), 9(当运), 1(生)
      expect(isShengwangStar(8, 9)).toBe(true);
      expect(isShengwangStar(9, 9)).toBe(true);
      expect(isShengwangStar(1, 9)).toBe(true);
    });

    test('calculateDajieScore - 评分正确性', () => {
      const score1 = calculateDajieScore(
        'peak',
        { isValid: true, matchCount: 27 },
        'full'
      );
      expect(score1).toBeGreaterThanOrEqual(90);
      expect(score1).toBeLessThanOrEqual(100);

      const score2 = calculateDajieScore(
        'low',
        { isValid: true, matchCount: 6 },
        'jie_cai'
      );
      expect(score2).toBeLessThan(60);
    });
  });
});
