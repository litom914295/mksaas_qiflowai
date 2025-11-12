import { describe, expect, test } from 'vitest';
import {
  analyzeLingzheng,
  analyzeLingzhengPositions,
  analyzeLingzhengTimeChange,
  checkZeroPositiveReversed,
  generateLingzhengRecommendations,
  getLingzhengInfo,
  LINGZHENG_PERIOD_TABLE,
} from '../lingzheng';
import type { Plate, Yun } from '../types';

/**
 * 零正理论测试套件
 *
 * 测试覆盖：
 * - 测试组1：零神正神判断 (15个案例)
 * - 测试组2：颠倒应用 (12个案例)
 * - 测试组3：特殊情况 (9个案例)
 * - 测试组4：集成测试 (8个案例)
 * - 测试组5：边缘案例 (7个案例)
 *
 * 总计：51个测试案例
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

describe('零正理论模块测试', () => {
  // ==================== 测试组1：零神正神判断 (15个案例) ====================
  describe('零神正神判断', () => {
    describe('零正神信息获取', () => {
      test('一运零正神 - 1正神7零神', () => {
        const info = getLingzhengInfo(1);
        expect(info.period).toBe(1);
        expect(info.positiveGod).toBe(1);
        expect(info.zeroGod).toBe(7);
        expect(info.description).toContain('一运');
      });

      test('二运零正神 - 2正神8零神', () => {
        const info = getLingzhengInfo(2);
        expect(info.positiveGod).toBe(2);
        expect(info.zeroGod).toBe(8);
      });

      test('八运零正神 - 8正神5零神', () => {
        const info = getLingzhengInfo(8);
        expect(info.positiveGod).toBe(8);
        expect(info.zeroGod).toBe(5);
      });

      test('九运零正神 - 9正神6零神', () => {
        const info = getLingzhengInfo(9);
        expect(info.positiveGod).toBe(9);
        expect(info.zeroGod).toBe(6);
      });

      test('零正神表完整性 - 九运完整', () => {
        expect(LINGZHENG_PERIOD_TABLE).toHaveLength(9);
        LINGZHENG_PERIOD_TABLE.forEach((item) => {
          expect(item.period).toBeGreaterThanOrEqual(1);
          expect(item.period).toBeLessThanOrEqual(9);
          expect(item.positiveGod).toBe(item.period);
        });
      });
    });

    describe('零正神位置分析', () => {
      test('八运飞星盘 - 零神5在坤宫', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        expect(positions.zeroGodPositions).toContain(3); // 震宫
        expect(positions.zeroGodDetails.length).toBeGreaterThan(0);
      });

      test('八运飞星盘 - 正神8在多个宫位', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [8, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 8, 4]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        expect(positions.positiveGodPositions).toContain(1); // 离宫天盘
        expect(positions.positiveGodPositions).toContain(4); // 巽宫天盘
        expect(positions.positiveGodDetails.length).toBeGreaterThan(0);
      });

      test('九运飞星盘 - 零神6位置识别', () => {
        const plate = createTestPlate(
          [9, 3, 6, 9, 3, 6, 9, 3, 6],
          [1, 2, 4, 5, 7, 8, 1, 2, 4],
          [1, 2, 4, 5, 7, 8, 1, 2, 4]
        );
        const positions = analyzeLingzhengPositions(plate, 9);
        expect(positions.zeroGodPositions).toContain(3); // 震宫
        expect(positions.zeroGodPositions).toContain(6); // 乾宫
        expect(positions.zeroGodPositions).toContain(9); // 巽宫
      });

      test('详细信息 - 星盘类型标识', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5], // 天盘5在3/6/9宫
          [1, 3, 5, 6, 7, 9, 1, 3, 4], // 山盘5在3宫
          [1, 3, 4, 6, 7, 5, 1, 3, 4] // 向盘5在6宫
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        const periodDetails = positions.zeroGodDetails.filter(
          (d) => d.starType === 'period'
        );
        const mountainDetails = positions.zeroGodDetails.filter(
          (d) => d.starType === 'mountain'
        );
        const facingDetails = positions.zeroGodDetails.filter(
          (d) => d.starType === 'facing'
        );

        expect(periodDetails.length).toBeGreaterThan(0);
        expect(mountainDetails.length).toBeGreaterThan(0);
        expect(facingDetails.length).toBeGreaterThan(0);
      });

      test('无零正神位置', () => {
        // 构造一个不包含8和5的飞星盘（八运）
        const plate = createTestPlate(
          [1, 2, 3, 4, 6, 7, 9, 1, 2],
          [1, 2, 3, 4, 6, 7, 9, 1, 2],
          [1, 2, 3, 4, 6, 7, 9, 1, 2]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        expect(positions.zeroGodPositions).toHaveLength(0);
        expect(positions.positiveGodPositions).toHaveLength(0);
      });
    });

    describe('宫位归属验证', () => {
      test('零神位宫位映射正确', () => {
        const plate = createTestPlate(
          [1, 5, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 9]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        // 零神5在坤宫(2)和中宫(5)
        expect(positions.zeroGodPositions).toContain(2);
        expect(positions.zeroGodPositions).toContain(5);
      });

      test('正神位宫位映射正确', () => {
        const plate = createTestPlate(
          [8, 2, 3, 8, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 9]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        // 正神8在离宫(1)、巽宫(4)、艮宫(8)、乾宫(8山盘)、乾宫(8向盘)
        expect(positions.positiveGodPositions).toContain(1);
        expect(positions.positiveGodPositions).toContain(4);
        expect(positions.positiveGodPositions).toContain(8);
      });

      test('同宫多盘位置合并', () => {
        const plate = createTestPlate(
          [5, 2, 3, 4, 5, 6, 7, 8, 9],
          [5, 2, 3, 4, 5, 6, 7, 8, 9],
          [5, 2, 3, 4, 5, 6, 7, 8, 9]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        // 离宫(1)和中宫(5)零神，但宫位数组不重复
        expect(positions.zeroGodPositions).toHaveLength(2);
        expect(positions.zeroGodDetails).toHaveLength(6); // 3个盘×2个宫位
      });
    });

    describe('各运零正神验证', () => {
      test('三运零正神', () => {
        const info = getLingzhengInfo(3);
        expect(info.positiveGod).toBe(3);
        expect(info.zeroGod).toBe(9);
      });

      test('五运零正神 - 特殊五黄', () => {
        const info = getLingzhengInfo(5);
        expect(info.positiveGod).toBe(5);
        expect(info.zeroGod).toBe(2);
      });
    });
  });

  // ==================== 测试组2：颠倒应用 (12个案例) ====================
  describe('零正颠倒应用', () => {
    describe('零神见山检测', () => {
      test('八运零神见山 - 单个宫位', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [3], // 震宫有山，而天盘5在震宫
        });
        expect(result.isReversed).toBe(true);
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.issues[0]).toContain('零神见山');
        expect(result.severity).toBe('major');
      });

      test('八运零神见山 - 多个宫位', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [3, 6], // 震宫和乾宫都有山
        });
        expect(result.isReversed).toBe(true);
        expect(result.severity).toBe('major');
      });

      test('零神不见山 - 正常情况', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [1, 2], // 离宫和坤宫有山，不是零神位
        });
        expect(result.isReversed).toBe(false);
        expect(result.severity).toBe('none');
      });
    });

    describe('正神见水检测', () => {
      test('八运正神见水 - 单个宫位', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          waterPositions: [1], // 离宫有水，而天盘8在离宫
        });
        expect(result.isReversed).toBe(true);
        expect(result.issues[0]).toContain('正神见水');
        expect(result.severity).toBe('major');
      });

      test('八运正神见水 - 多个宫位', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          waterPositions: [1, 4, 7], // 多个正神位有水
        });
        expect(result.isReversed).toBe(true);
        expect(result.severity).toBe('major');
      });

      test('正神不见水 - 正常情况', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          waterPositions: [3, 6], // 零神位有水，正常
        });
        expect(result.isReversed).toBe(false);
      });
    });

    describe('颠倒影响详情', () => {
      test('零神见山影响宫位识别', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [3, 6, 9], // 全部零神位有山
        });
        expect(result.issues[0]).toContain('震');
        expect(result.issues[0]).toContain('乾');
        expect(result.issues[0]).toContain('巽');
      });

      test('正神见水影响宫位识别', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          waterPositions: [1, 4, 7], // 全部正神位有水
        });
        expect(result.issues[0]).toContain('离');
        expect(result.issues[0]).toContain('巽');
        expect(result.issues[0]).toContain('艮');
      });
    });

    describe('严重性评估', () => {
      test('Critical级 - 零神见山且正神见水', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [3], // 零神位见山
          waterPositions: [1], // 正神位见水
        });
        expect(result.isReversed).toBe(true);
        expect(result.severity).toBe('critical');
        expect(result.issues.length).toBe(2);
      });

      test('Major级 - 仅零神见山', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [3],
        });
        expect(result.severity).toBe('major');
      });

      test('Major级 - 仅正神见水', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          waterPositions: [1],
        });
        expect(result.severity).toBe('major');
      });

      test('None级 - 无颠倒', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          mountainPositions: [1, 2], // 非零神位
          waterPositions: [3, 6], // 零神位见水，正常
        });
        expect(result.isReversed).toBe(false);
        expect(result.severity).toBe('none');
      });
    });
  });

  // ==================== 测试组3：特殊情况 (9个案例) ====================
  describe('特殊情况处理', () => {
    describe('缺乏环境信息', () => {
      test('无环境信息 - 返回none', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午');
        expect(result.isReversed).toBe(false);
        expect(result.severity).toBe('none');
        expect(result.issues[0]).toContain('缺乏环境信息');
      });

      test('空环境信息 - 不颠倒', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {});
        expect(result.isReversed).toBe(false);
      });

      test('部分环境信息 - 仅水位', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
          waterPositions: [1],
        });
        expect(result.isReversed).toBe(true);
        expect(result.issues[0]).toContain('正神见水');
      });
    });

    describe('五运特殊处理', () => {
      test('五运正神为五黄', () => {
        const info = getLingzhengInfo(5);
        expect(info.positiveGod).toBe(5);
        expect(info.zeroGod).toBe(2);
      });

      test('五运零正神位置', () => {
        const plate = createTestPlate(
          [5, 2, 8, 5, 2, 8, 5, 2, 8],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const positions = analyzeLingzhengPositions(plate, 5);
        expect(positions.positiveGodPositions.length).toBeGreaterThan(0); // 5在多个宫位
        expect(positions.zeroGodPositions.length).toBeGreaterThan(0); // 2在多个宫位
      });

      test('五运建议包含五黄化解', () => {
        const plate = createTestPlate(
          [5, 2, 8, 5, 2, 8, 5, 2, 8],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const recommendations = generateLingzhengRecommendations(
          plate,
          5,
          '子',
          '午'
        );
        expect(
          recommendations.generalAdvice.some((advice) => advice.includes('五黄'))
        ).toBe(true);
      });
    });

    describe('边缘案例', () => {
      test('所有宫位都是零神', () => {
        const plate = createTestPlate(
          [5, 5, 5, 5, 5, 5, 5, 5, 5],
          [5, 5, 5, 5, 5, 5, 5, 5, 5],
          [5, 5, 5, 5, 5, 5, 5, 5, 5]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        expect(positions.zeroGodPositions).toHaveLength(9);
        expect(positions.zeroGodDetails).toHaveLength(27); // 9宫×3盘
      });

      test('所有宫位都是正神', () => {
        const plate = createTestPlate(
          [8, 8, 8, 8, 8, 8, 8, 8, 8],
          [8, 8, 8, 8, 8, 8, 8, 8, 8],
          [8, 8, 8, 8, 8, 8, 8, 8, 8]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        expect(positions.positiveGodPositions).toHaveLength(9);
        expect(positions.positiveGodDetails).toHaveLength(27);
      });

      test('同宫零正神共存', () => {
        const plate = createTestPlate(
          [8, 2, 3, 4, 5, 6, 7, 8, 9],
          [5, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 9]
        );
        const positions = analyzeLingzhengPositions(plate, 8);
        // 离宫(1): 天盘8正神, 山盘5零神
        expect(positions.zeroGodPositions).toContain(1);
        expect(positions.positiveGodPositions).toContain(1);
      });
    });
  });

  // ==================== 测试组4：集成测试 (8个案例) ====================
  describe('集成测试', () => {
    describe('完整零正分析', () => {
      test('八运完整分析 - 无颠倒', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const analysis = analyzeLingzheng(plate, 8, '子', '午', {
          waterPositions: [3, 6], // 零神位见水
          mountainPositions: [1, 4], // 正神位见山
        });

        expect(analysis.zeroGodPosition.length).toBeGreaterThan(0);
        expect(analysis.positiveGodPosition.length).toBeGreaterThan(0);
        expect(analysis.isZeroPositiveReversed).toBe(false);
        expect(analysis.waterPlacement.favorable.length).toBeGreaterThan(0);
        expect(analysis.mountainPlacement.favorable.length).toBeGreaterThan(0);
        expect(analysis.recommendations.length).toBeGreaterThan(0);
      });

      test('八运完整分析 - 有颠倒', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const analysis = analyzeLingzheng(plate, 8, '子', '午', {
          waterPositions: [1], // 正神位见水
          mountainPositions: [3], // 零神位见山
        });

        expect(analysis.isZeroPositiveReversed).toBe(true);
        expect(
          analysis.recommendations.some((r) => r.includes('颠倒'))
        ).toBe(true);
      });
    });

    describe('时运变化分析', () => {
      test('八运到九运 - 零正神变化', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const timeChange = analyzeLingzhengTimeChange(8, 9, plate);

        expect(timeChange.currentAnalysis).toBeDefined();
        expect(timeChange.futureAnalysis).toBeDefined();
        expect(timeChange.transitionAdvice.length).toBeGreaterThan(0);
        expect(timeChange.riskAssessment).toBeDefined();
        expect(['high', 'medium', 'low']).toContain(
          timeChange.riskAssessment.level
        );
      });

      test('七运到八运 - 风险评估', () => {
        const plate = createTestPlate(
          [7, 1, 4, 7, 1, 4, 7, 1, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const timeChange = analyzeLingzhengTimeChange(7, 8, plate);

        expect(timeChange.transitionAdvice.length).toBeGreaterThan(0);
        expect(timeChange.riskAssessment.level).toBeDefined();
      });

      test('一运到二运 - 建议生成', () => {
        const plate = createTestPlate(
          [1, 4, 7, 1, 4, 7, 1, 4, 7],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const timeChange = analyzeLingzhengTimeChange(1, 2, plate);

        expect(
          timeChange.transitionAdvice.some((a) => a.includes('零神'))
        ).toBe(true);
        expect(
          timeChange.transitionAdvice.some((a) => a.includes('正神'))
        ).toBe(true);
      });
    });

    describe('建议生成', () => {
      test('水位布置建议', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const recommendations = generateLingzhengRecommendations(
          plate,
          8,
          '子',
          '午'
        );

        expect(recommendations.waterPlacement.favorable.length).toBeGreaterThan(
          0
        );
        expect(
          recommendations.waterPlacement.unfavorable.length
        ).toBeGreaterThan(0);
        expect(recommendations.waterPlacement.details.length).toBeGreaterThan(
          0
        );
      });

      test('山位布置建议', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const recommendations = generateLingzhengRecommendations(
          plate,
          8,
          '子',
          '午'
        );

        expect(
          recommendations.mountainPlacement.favorable.length
        ).toBeGreaterThan(0);
        expect(
          recommendations.mountainPlacement.unfavorable.length
        ).toBeGreaterThan(0);
        expect(
          recommendations.mountainPlacement.details.length
        ).toBeGreaterThan(0);
      });

      test('综合建议生成', () => {
        const plate = createTestPlate(
          [8, 2, 5, 8, 2, 5, 8, 2, 5],
          [1, 3, 4, 6, 7, 9, 1, 3, 4],
          [1, 3, 4, 6, 7, 9, 1, 3, 4]
        );
        const recommendations = generateLingzhengRecommendations(
          plate,
          8,
          '子',
          '午'
        );

        expect(recommendations.generalAdvice.length).toBeGreaterThanOrEqual(4);
        expect(
          recommendations.generalAdvice.some((a) => a.includes('零神'))
        ).toBe(true);
        expect(
          recommendations.generalAdvice.some((a) => a.includes('正神'))
        ).toBe(true);
      });
    });
  });

  // ==================== 测试组5：边缘案例 (7个案例) ====================
  describe('边缘案例', () => {
    test('多重颠倒情况', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 7, 9, 1, 3, 4],
        [1, 3, 4, 6, 7, 9, 1, 3, 4]
      );
      const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
        waterPositions: [1, 4, 7], // 多个正神位见水
        mountainPositions: [3, 6, 9], // 多个零神位见山
      });

      expect(result.isReversed).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.issues.length).toBe(2);
    });

    test('零神正神位置重叠', () => {
      const plate = createTestPlate(
        [8, 2, 3, 4, 5, 6, 7, 8, 9],
        [5, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 5, 6, 7, 8, 9]
      );
      const positions = analyzeLingzhengPositions(plate, 8);

      // 离宫既有正神又有零神
      expect(positions.zeroGodPositions).toContain(1);
      expect(positions.positiveGodPositions).toContain(1);

      const zeroInPalace1 = positions.zeroGodDetails.filter(
        (d) => d.palace === 1
      );
      const positiveInPalace1 = positions.positiveGodDetails.filter(
        (d) => d.palace === 1
      );

      expect(zeroInPalace1.length).toBeGreaterThan(0);
      expect(positiveInPalace1.length).toBeGreaterThan(0);
    });

    test('高风险时运变化', () => {
      // 创建一个影响多个宫位的飞星盘
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [8, 8, 8, 5, 5, 5, 1, 1, 1],
        [8, 8, 8, 5, 5, 5, 1, 1, 1]
      );
      const timeChange = analyzeLingzhengTimeChange(8, 9, plate);

      expect(timeChange.riskAssessment.level).toBe('high');
      expect(timeChange.riskAssessment.description).toContain('影响较大');
    });

    test('低风险时运变化', () => {
      // 创建影响较少宫位的飞星盘
      const plate = createTestPlate(
        [8, 2, 3, 4, 6, 7, 9, 1, 3],
        [1, 2, 3, 4, 6, 7, 9, 1, 3],
        [1, 2, 3, 4, 6, 7, 9, 1, 3]
      );
      const timeChange = analyzeLingzhengTimeChange(8, 9, plate);

      expect(['low', 'medium']).toContain(timeChange.riskAssessment.level);
    });

    test('性能测试 - 1000次零正分析<200ms', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 7, 9, 1, 3, 4],
        [1, 3, 4, 6, 7, 9, 1, 3, 4]
      );
      const startTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        analyzeLingzheng(plate, 8, '子', '午', {
          waterPositions: [3],
          mountainPositions: [1],
        });
      }
      const endTime = Date.now();
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(200);
    });

    test('异常输入 - 无效运数处理', () => {
      expect(() => getLingzhengInfo(0 as Yun)).toThrow();
      expect(() => getLingzhengInfo(10 as Yun)).toThrow();
    });

    test('空宫位环境 - 无水无山', () => {
      const plate = createTestPlate(
        [8, 2, 5, 8, 2, 5, 8, 2, 5],
        [1, 3, 4, 6, 7, 9, 1, 3, 4],
        [1, 3, 4, 6, 7, 9, 1, 3, 4]
      );
      const result = checkZeroPositiveReversed(plate, 8, '子', '午', {
        waterPositions: [],
        mountainPositions: [],
      });

      expect(result.isReversed).toBe(false);
      expect(result.severity).toBe('none');
    });
  });
});
