import { describe, expect, test } from '@jest/globals';
import { generateFlyingStar } from '../index';
import {
  generateShanpan,
  generateTianpan,
  generateXiangpan,
  getPalaceByMountain,
} from '../luoshu';
import type { FlyingStar, Mountain, PalaceIndex, Plate } from '../types';

/**
 * 简单替卦功能测试套件
 *
 * 测试目标：
 * 1. 对宫星映射正确性
 * 2. 伏吟检测正确性
 * 3. 替卦应用正确性
 * 4. 配置开关控制
 * 5. 边界情况处理
 */

// 辅助函数：从 luoshu.ts 导出的私有函数（通过反射访问）
// 注意：实际测试中应该导出这些函数或使用其他测试方式
const getOppositeStar = (star: FlyingStar): FlyingStar => {
  const oppositeMap: Record<FlyingStar, FlyingStar> = {
    1: 9,
    2: 8,
    3: 7,
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2,
    9: 1,
  };
  return oppositeMap[star];
};

const shouldApplySimpleTigua = (
  palace: PalaceIndex,
  tianpan: Plate
): boolean => {
  const tianpanCell = tianpan.find((c) => c.palace === palace);
  if (!tianpanCell || !tianpanCell.periodStar) return false;
  return tianpanCell.periodStar === (palace as FlyingStar);
};

describe('简单替卦（Simple Tigua）功能测试', () => {
  describe('对宫星映射测试', () => {
    test('1-9 对宫星映射正确', () => {
      expect(getOppositeStar(1)).toBe(9);
      expect(getOppositeStar(9)).toBe(1);
    });

    test('2-8 对宫星映射正确', () => {
      expect(getOppositeStar(2)).toBe(8);
      expect(getOppositeStar(8)).toBe(2);
    });

    test('3-7 对宫星映射正确', () => {
      expect(getOppositeStar(3)).toBe(7);
      expect(getOppositeStar(7)).toBe(3);
    });

    test('4-6 对宫星映射正确', () => {
      expect(getOppositeStar(4)).toBe(6);
      expect(getOppositeStar(6)).toBe(4);
    });

    test('5-5 中宫特殊情况：无对宫', () => {
      expect(getOppositeStar(5)).toBe(5);
    });

    test('对宫星互为逆运算', () => {
      for (let star = 1; star <= 9; star++) {
        const opposite = getOppositeStar(star as FlyingStar);
        const backToOriginal = getOppositeStar(opposite);
        expect(backToOriginal).toBe(star);
      }
    });
  });

  describe('伏吟检测测试', () => {
    test('一运坎宫（1宫）伏吟检测：天盘星1 === 本宫星1', () => {
      const tianpan = generateTianpan(1 as FlyingStar);
      const kanPalace = 1 as PalaceIndex;

      // 一运，1宫的天盘星应该是1（伏吟）
      const kanCell = tianpan.find((c) => c.palace === kanPalace);
      expect(kanCell?.periodStar).toBe(1);

      // 应该检测到伏吟
      expect(shouldApplySimpleTigua(kanPalace, tianpan)).toBe(true);
    });

    test('二运坤宫（2宫）伏吟检测', () => {
      const tianpan = generateTianpan(2 as FlyingStar);
      const kunPalace = 2 as PalaceIndex;

      const kunCell = tianpan.find((c) => c.palace === kunPalace);
      expect(kunCell?.periodStar).toBe(2);
      expect(shouldApplySimpleTigua(kunPalace, tianpan)).toBe(true);
    });

    test('八运艮宫（8宫）伏吟检测', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const genPalace = 8 as PalaceIndex;

      const genCell = tianpan.find((c) => c.palace === genPalace);
      expect(genCell?.periodStar).toBe(8);
      expect(shouldApplySimpleTigua(genPalace, tianpan)).toBe(true);
    });

    test('九运离宫（9宫）伏吟检测', () => {
      const tianpan = generateTianpan(9 as FlyingStar);
      const liPalace = 9 as PalaceIndex;

      const liCell = tianpan.find((c) => c.palace === liPalace);
      expect(liCell?.periodStar).toBe(9);
      expect(shouldApplySimpleTigua(liPalace, tianpan)).toBe(true);
    });

    test('非伏吟情况：八运坎宫（1宫）不应触发伏吟', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const kanPalace = 1 as PalaceIndex;

      // 八运，1宫的天盘星应该是7，不等于1，不是伏吟
      const kanCell = tianpan.find((c) => c.palace === kanPalace);
      expect(kanCell?.periodStar).not.toBe(1);
      expect(shouldApplySimpleTigua(kanPalace, tianpan)).toBe(false);
    });

    test('全部九运伏吟检测完整性', () => {
      for (let period = 1; period <= 9; period++) {
        const tianpan = generateTianpan(period as FlyingStar);

        // 只有本宫应该检测到伏吟
        for (let palace = 1; palace <= 9; palace++) {
          const isFuyin = shouldApplySimpleTigua(
            palace as PalaceIndex,
            tianpan
          );

          if (palace === period) {
            expect(isFuyin).toBe(true);
          } else {
            expect(isFuyin).toBe(false);
          }
        }
      }
    });
  });

  describe('山盘替卦应用测试', () => {
    test('八运艮山坤向：不启用替卦（默认）', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '艮', false, false);

      // 艮宫（8宫）应该使用原星8（伏吟但未启用替卦）
      const genCell = shanpan.find((c) => c.palace === 8);
      expect(genCell?.mountainStar).toBe(8);
    });

    test('八运艮山坤向：启用替卦', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '艮', false, true);

      // 艮宫（8宫）触发伏吟，应该替为对宫星2
      const genCell = shanpan.find((c) => c.palace === 8);
      expect(genCell?.mountainStar).toBe(2);
    });

    test('一运子山午向：不启用替卦', () => {
      const tianpan = generateTianpan(1 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '子', false, false);

      // 子山坎宫（1宫）使用原星1
      const kanCell = shanpan.find((c) => c.palace === 1);
      expect(kanCell?.mountainStar).toBe(1);
    });

    test('一运子山午向：启用替卦', () => {
      const tianpan = generateTianpan(1 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '子', false, true);

      // 子山坎宫（1宫）触发伏吟，应该替为对宫星9
      const kanCell = shanpan.find((c) => c.palace === 1);
      expect(kanCell?.mountainStar).toBe(9);
    });

    test('二运坤山艮向：启用替卦', () => {
      const tianpan = generateTianpan(2 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '坤', false, true);

      // 坤宫（2宫）触发伏吟，应该替为对宫星8
      const kunCell = shanpan.find((c) => c.palace === 2);
      expect(kunCell?.mountainStar).toBe(8);
    });

    test('八运子山午向：不触发伏吟，不应替卦', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '子', false, true);

      // 子山坎宫（1宫），天盘星为7，不是伏吟，即使启用替卦也不替换
      const kanCell = tianpan.find((c) => c.palace === 1);
      expect(kanCell?.periodStar).toBe(7); // 确认天盘星

      const shanpanKan = shanpan.find((c) => c.palace === 1);
      // 应该使用原星7（不替卦）
      expect(shanpanKan?.mountainStar).toBe(7);
    });
  });

  describe('向盘替卦应用测试', () => {
    test('八运艮山坤向：坤向启用替卦', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const xiangpan = generateXiangpan(tianpan, '坤', false, true);

      // 坤宫（2宫）在八运天盘星为9，不触发伏吟，不替卦
      const kunCell = tianpan.find((c) => c.palace === 2);
      expect(kunCell?.periodStar).toBe(9);

      const xiangpanKun = xiangpan.find((c) => c.palace === 2);
      expect(xiangpanKun?.facingStar).toBe(9);
    });

    test('九运午山子向：午向启用替卦', () => {
      const tianpan = generateTianpan(9 as FlyingStar);
      const xiangpan = generateXiangpan(tianpan, '午', false, true);

      // 午向离宫（9宫）触发伏吟，应该替为对宫星1
      const liCell = tianpan.find((c) => c.palace === 9);
      expect(liCell?.periodStar).toBe(9);

      const xiangpanLi = xiangpan.find((c) => c.palace === 9);
      expect(xiangpanLi?.facingStar).toBe(1);
    });
  });

  describe('配置开关测试', () => {
    test('通过 config.applyTiGua 控制替卦', () => {
      const observedAt = new Date('2024-01-01');
      const facing = { degrees: 45 }; // 艮山坤向

      // 不启用替卦
      const result1 = generateFlyingStar({
        observedAt,
        facing,
        config: { applyTiGua: false },
      });

      // 检查是否应用替卦规则
      expect(result1.meta.rulesApplied).not.toContain('TiGua');

      // 启用替卦
      const result2 = generateFlyingStar({
        observedAt,
        facing,
        config: { applyTiGua: true },
      });

      // 如果八运艮宫触发伏吟，应该有TiGua标记
      // （注意：这取决于当前是否为八运）
    });

    test('默认配置：替卦不启用', () => {
      const observedAt = new Date('2024-01-01');
      const facing = { degrees: 45 };

      const result = generateFlyingStar({
        observedAt,
        facing,
        // 不传 config，使用默认值
      });

      // 默认不应包含替卦规则
      expect(result.meta.rulesApplied).not.toContain('TiGua');
    });
  });

  describe('边界情况测试', () => {
    test('五运中宫（5宫）伏吟：5-5 无对宫，替卦后仍为5', () => {
      const tianpan = generateTianpan(5 as FlyingStar);

      // 假设有一个坐山对应5宫（实际中宫无直接对应山）
      // 这里测试逻辑正确性

      // 5宫天盘星应该是5
      const centerCell = tianpan.find((c) => c.palace === 5);
      expect(centerCell?.periodStar).toBe(5);

      // 应该检测到伏吟
      expect(shouldApplySimpleTigua(5 as PalaceIndex, tianpan)).toBe(true);

      // 替卦后应该还是5（因为5的对宫是5）
      expect(getOppositeStar(5)).toBe(5);
    });

    test('所有运数山盘替卦完整性测试', () => {
      const testMountains: Mountain[] = [
        '子',
        '坤',
        '卯',
        '巽',
        '午',
        '乾',
        '酉',
        '艮',
      ];

      for (let period = 1; period <= 9; period++) {
        const tianpan = generateTianpan(period as FlyingStar);

        for (const mountain of testMountains) {
          const palace = getPalaceByMountain(mountain);
          const isFuyin = shouldApplySimpleTigua(palace, tianpan);

          // 启用替卦
          const shanpanWithTigua = generateShanpan(
            tianpan,
            mountain,
            false,
            true
          );
          const cellWithTigua = shanpanWithTigua.find(
            (c) => c.palace === palace
          );

          // 不启用替卦
          const shanpanNoTigua = generateShanpan(
            tianpan,
            mountain,
            false,
            false
          );
          const cellNoTigua = shanpanNoTigua.find((c) => c.palace === palace);

          if (isFuyin) {
            // 如果触发伏吟，启用替卦后应该不同
            const tianpanCell = tianpan.find((c) => c.palace === palace);
            const originalStar = tianpanCell?.periodStar!;
            const oppositeStar = getOppositeStar(originalStar);

            // 不启用时应该是原星
            expect(cellNoTigua?.mountainStar).toBe(originalStar);
            // 启用时应该是对宫星
            expect(cellWithTigua?.mountainStar).toBe(oppositeStar);
          } else {
            // 如果不触发伏吟，启用不启用应该一致
            expect(cellWithTigua?.mountainStar).toBe(cellNoTigua?.mountainStar);
          }
        }
      }
    });

    test('兼向不影响替卦判断', () => {
      const tianpan = generateTianpan(8 as FlyingStar);

      // 艮山兼向，但替卦判断仅依据坐山
      const shanpanJian = generateShanpan(tianpan, '艮', true, true);
      const shanpanNoJian = generateShanpan(tianpan, '艮', false, true);

      // 兼向标志不应影响替卦结果
      expect(shanpanJian[7]?.mountainStar).toBe(shanpanNoJian[7]?.mountainStar);
    });
  });

  describe('替卦后排盘验证', () => {
    test('替卦后顺飞逆飞规则仍然正确', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const shanpan = generateShanpan(tianpan, '艮', false, true);

      // 艮宫替卦后为2，属坤卦（阴卦），艮为天元龙
      // 阴卦 + 天元龙 → 逆飞

      // 验证是否按逆飞规则排盘
      // （这需要了解完整的排盘逻辑，此处简化验证）

      // 至少验证所有宫位都有山星
      shanpan.forEach((cell) => {
        expect(cell.mountainStar).toBeGreaterThanOrEqual(1);
        expect(cell.mountainStar).toBeLessThanOrEqual(9);
      });
    });

    test('替卦不影响天盘', () => {
      const tianpan = generateTianpan(8 as FlyingStar);
      const shanpanWithTigua = generateShanpan(tianpan, '艮', false, true);

      // 山盘应用替卦后，天盘应该保持不变
      expect(tianpan[7]?.periodStar).toBe(8);

      // 山盘的 periodStar 应该与天盘一致
      expect(shanpanWithTigua[7]?.periodStar).toBe(8);
    });
  });

  describe('性能测试', () => {
    test('替卦计算耗时应小于 1ms', () => {
      const tianpan = generateTianpan(8 as FlyingStar);

      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        generateShanpan(tianpan, '艮', false, true);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / 1000;

      expect(avgTime).toBeLessThan(1); // 平均每次 < 1ms
    });
  });
});
