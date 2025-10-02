import { describe, expect, test } from '@jest/globals';
import { generateFlyingStar } from '../index';
import {
  generateShanpan,
  generateTianpan,
  generateXiangpan,
  getBaguaByStar,
  getBaguaYinYang,
  getPalaceByMountain,
  getYuanLong,
  LUOSHU_ORDER,
  mergePlates,
  niFei,
  shunFei,
} from '../luoshu';

describe('九宫飞星排盘算法验证', () => {
  describe('基础飞星计算', () => {
    test('顺飞函数 shunFei 正确性验证', () => {
      // 测试顺飞1-9的循环
      expect(shunFei(1, 1)).toBe(2);
      expect(shunFei(9, 1)).toBe(1);
      expect(shunFei(5, 4)).toBe(9);
      expect(shunFei(8, 2)).toBe(1);

      // 测试多步顺飞
      expect(shunFei(1, 8)).toBe(9);
      expect(shunFei(1, 9)).toBe(1);
      expect(shunFei(1, 18)).toBe(1); // 18 = 9*2，应该回到原位
    });

    test('逆飞函数 niFei 正确性验证', () => {
      // 测试逆飞1-9的循环
      expect(niFei(2, 1)).toBe(1);
      expect(niFei(1, 1)).toBe(9);
      expect(niFei(9, 1)).toBe(8);
      expect(niFei(5, 4)).toBe(1);

      // 测试多步逆飞
      expect(niFei(9, 8)).toBe(1);
      expect(niFei(9, 9)).toBe(9);
      expect(niFei(9, 18)).toBe(9); // 18 = 9*2，应该回到原位
    });

    test('顺飞逆飞互为逆运算', () => {
      for (let start = 1; start <= 9; start++) {
        for (let steps = 1; steps <= 9; steps++) {
          const shunResult = shunFei(start as any, steps);
          const niResult = niFei(shunResult, steps);
          expect(niResult).toBe(start);
        }
      }
    });
  });

  describe('天盘生成算法', () => {
    test('九运天盘生成正确性', () => {
      const tianpan = generateTianpan(9);

      // 验证洛书顺序：中心→西北→西→东北→南→北→西南→东→东南
      expect(LUOSHU_ORDER).toEqual([5, 6, 7, 8, 9, 1, 2, 3, 4]);

      // 验证九运天盘：中心宫位应该是9
      const centerPalace = tianpan.find(cell => cell.palace === 5);
      expect(centerPalace?.periodStar).toBe(9);

      // 验证按洛书顺序顺飞
      let expectedStar = 9;
      for (let i = 0; i < LUOSHU_ORDER.length; i++) {
        const palace = LUOSHU_ORDER[i];
        const cell = tianpan.find(c => c.palace === palace);
        expect(cell?.periodStar).toBe(expectedStar);
        expectedStar = shunFei(expectedStar as any, 1);
      }
    });

    test('不同运数天盘生成', () => {
      for (let period = 1; period <= 9; period++) {
        const tianpan = generateTianpan(period as any);

        // 中心宫位应该是当前运数
        const centerPalace = tianpan.find(cell => cell.palace === 5);
        expect(centerPalace?.periodStar).toBe(period);

        // 验证所有宫位都有飞星
        expect(tianpan).toHaveLength(9);
        tianpan.forEach(cell => {
          expect(cell.periodStar).toBeGreaterThanOrEqual(1);
          expect(cell.periodStar).toBeLessThanOrEqual(9);
        });
      }
    });
  });

  describe('二十四山方位映射', () => {
    test('二十四山到九宫映射正确性', () => {
      // 测试主要山向
      expect(getPalaceByMountain('子')).toBe(1); // 坎宫
      expect(getPalaceByMountain('午')).toBe(9); // 离宫
      expect(getPalaceByMountain('卯')).toBe(3); // 震宫
      expect(getPalaceByMountain('酉')).toBe(7); // 兑宫
      expect(getPalaceByMountain('乾')).toBe(6); // 乾宫
      expect(getPalaceByMountain('坤')).toBe(2); // 坤宫
      expect(getPalaceByMountain('艮')).toBe(8); // 艮宫
      expect(getPalaceByMountain('巽')).toBe(4); // 巽宫
    });

    test('元龙属性判断正确性', () => {
      // 天元龙：子午卯酉乾坤艮巽
      expect(getYuanLong('子')).toBe('天');
      expect(getYuanLong('午')).toBe('天');
      expect(getYuanLong('卯')).toBe('天');
      expect(getYuanLong('酉')).toBe('天');
      expect(getYuanLong('乾')).toBe('天');
      expect(getYuanLong('坤')).toBe('天');
      expect(getYuanLong('艮')).toBe('天');
      expect(getYuanLong('巽')).toBe('天');

      // 人元龙：乙辛丁癸
      expect(getYuanLong('乙')).toBe('人');
      expect(getYuanLong('辛')).toBe('人');
      expect(getYuanLong('丁')).toBe('人');
      expect(getYuanLong('癸')).toBe('人');

      // 地元龙：甲庚丙壬辰戌丑未
      expect(getYuanLong('甲')).toBe('地');
      expect(getYuanLong('庚')).toBe('地');
      expect(getYuanLong('丙')).toBe('地');
      expect(getYuanLong('壬')).toBe('地');
      expect(getYuanLong('辰')).toBe('地');
      expect(getYuanLong('戌')).toBe('地');
      expect(getYuanLong('丑')).toBe('地');
      expect(getYuanLong('未')).toBe('地');
    });

    test('九星八卦对应关系', () => {
      const expectedMapping = {
        1: '坎',
        2: '坤',
        3: '震',
        4: '巽',
        5: '中',
        6: '乾',
        7: '兑',
        8: '艮',
        9: '离',
      };

      for (let star = 1; star <= 9; star++) {
        expect(getBaguaByStar(star as any)).toBe(
          expectedMapping[star as keyof typeof expectedMapping]
        );
      }
    });

    test('八卦阴阳属性', () => {
      // 阴卦：坤巽离兑
      expect(getBaguaYinYang('坤')).toBe('阴');
      expect(getBaguaYinYang('巽')).toBe('阴');
      expect(getBaguaYinYang('离')).toBe('阴');
      expect(getBaguaYinYang('兑')).toBe('阴');

      // 阳卦：坎震乾艮
      expect(getBaguaYinYang('坎')).toBe('阳');
      expect(getBaguaYinYang('震')).toBe('阳');
      expect(getBaguaYinYang('乾')).toBe('阳');
      expect(getBaguaYinYang('艮')).toBe('阳');
    });
  });

  describe('山盘生成算法', () => {
    test('子山午向山盘生成', () => {
      const tianpan = generateTianpan(9);
      const shanpan = generateShanpan(tianpan, '子', false);

      // 子山对应坎宫（1宫），九运天盘1宫应该是5星
      const tianpan1 = tianpan.find(cell => cell.palace === 1);
      expect(tianpan1?.periodStar).toBe(5);

      // 5星对应中宫，中宫为阳，子山为天元龙，应该顺飞
      // 验证山盘1宫是1星（5星顺飞后的结果）
      const shanpan1 = shanpan.find(cell => cell.palace === 1);
      expect(shanpan1?.mountainStar).toBe(1);

      // 验证按洛书顺序顺飞
      let expectedStar = 5;
      for (let i = 0; i < LUOSHU_ORDER.length; i++) {
        const palace = LUOSHU_ORDER[i];
        const cell = shanpan.find(c => c.palace === palace);
        expect(cell?.mountainStar).toBe(expectedStar);
        expectedStar = shunFei(expectedStar as any, 1);
      }
    });

    test('午山子向山盘生成', () => {
      const tianpan = generateTianpan(9);
      const shanpan = generateShanpan(tianpan, '午', false);

      // 午山对应离宫（9宫），九运天盘9宫应该是4星
      const tianpan9 = tianpan.find(cell => cell.palace === 9);
      expect(tianpan9?.periodStar).toBe(4);

      // 4星对应巽卦，巽卦为阴，午山为天元龙，应该逆飞
      // 验证山盘9宫是9星（4星逆飞后的结果）
      const shanpan9 = shanpan.find(cell => cell.palace === 9);
      expect(shanpan9?.mountainStar).toBe(9);

      // 验证按洛书顺序逆飞
      let expectedStar = 4;
      for (let i = 0; i < LUOSHU_ORDER.length; i++) {
        const palace = LUOSHU_ORDER[i];
        const cell = shanpan.find(c => c.palace === palace);
        expect(cell?.mountainStar).toBe(expectedStar);
        expectedStar = niFei(expectedStar as any, 1);
      }
    });
  });

  describe('向盘生成算法', () => {
    test('子山午向向盘生成', () => {
      const tianpan = generateTianpan(9);
      const xiangpan = generateXiangpan(tianpan, '午', false);

      // 午向对应离宫（9宫），九运天盘9宫应该是4星
      const tianpan9 = tianpan.find(cell => cell.palace === 9);
      expect(tianpan9?.periodStar).toBe(4);

      // 4星对应巽卦，巽卦为阴，午向为天元龙，应该逆飞
      // 验证向盘9宫是9星（4星逆飞后的结果）
      const xiangpan9 = xiangpan.find(cell => cell.palace === 9);
      expect(xiangpan9?.facingStar).toBe(9);

      // 验证按洛书顺序逆飞
      let expectedStar = 4;
      for (let i = 0; i < LUOSHU_ORDER.length; i++) {
        const palace = LUOSHU_ORDER[i];
        const cell = xiangpan.find(c => c.palace === palace);
        expect(cell?.facingStar).toBe(expectedStar);
        expectedStar = niFei(expectedStar as any, 1);
      }
    });
  });

  describe('三盘合并算法', () => {
    test('三盘合并正确性', () => {
      const tianpan = generateTianpan(9);
      const shanpan = generateShanpan(tianpan, '子', false);
      const xiangpan = generateXiangpan(tianpan, '午', false);
      const merged = mergePlates(tianpan, shanpan, xiangpan);

      // 验证合并后的盘有9个宫位
      expect(merged).toHaveLength(9);

      // 验证每个宫位都有正确的数据
      for (let i = 1; i <= 9; i++) {
        const cell = merged.find(c => c.palace === i);
        expect(cell).toBeDefined();
        expect(cell?.periodStar).toBeDefined();
        expect(cell?.mountainStar).toBeGreaterThanOrEqual(0);
        expect(cell?.facingStar).toBeGreaterThanOrEqual(0);
      }

      // 验证特定宫位的数据
      const centerCell = merged.find(c => c.palace === 5);
      console.log('中宫(5宫):', centerCell);
      expect(centerCell?.periodStar).toBe(9); // 九运中心
      expect(centerCell?.mountainStar).toBe(5); // 子山山盘中心
      expect(centerCell?.facingStar).toBe(5); // 午向向盘中心
    });
  });

  describe('完整飞星排盘验证', () => {
    test('子山午向九运完整排盘', () => {
      const result = generateFlyingStar({
        observedAt: new Date('2024-01-01'),
        facing: { degrees: 180 }, // 子山午向
      });

      // 验证基本结构
      expect(result.period).toBe(9);
      expect(result.plates.period).toHaveLength(9);
      expect(result.evaluation).toBeDefined();
      expect(result.geju).toBeDefined();

      // 验证九运天盘
      const centerPalace = result.plates.period.find(cell => cell.palace === 5);
      expect(centerPalace?.periodStar).toBe(9);

      // 验证子山午向的山向星
      const northPalace = result.plates.period.find(cell => cell.palace === 1); // 坎宫
      const southPalace = result.plates.period.find(cell => cell.palace === 9); // 离宫

      // 打印实际值用于调试
      console.log('北宫(1宫):', northPalace);
      console.log('南宫(9宫):', southPalace);

      // 子山在坎宫，应该顺飞，1宫山星应该是1
      expect(northPalace?.mountainStar).toBe(1);
      // 午向在离宫，应该逆飞，9宫向星应该是9
      expect(southPalace?.facingStar).toBe(9);
    });

    test('不同山向的排盘一致性', () => {
      const testCases = [
        { degrees: 0, description: '子山午向' },
        { degrees: 90, description: '卯山酉向' },
        { degrees: 180, description: '午山子向' },
        { degrees: 270, description: '酉山卯向' },
      ];

      testCases.forEach(({ degrees, description }) => {
        const result = generateFlyingStar({
          observedAt: new Date('2024-01-01'),
          facing: { degrees },
        });

        // 验证基本结构完整
        expect(result.period).toBeDefined();
        expect(result.plates.period).toHaveLength(9);
        expect(result.evaluation).toBeDefined();
        expect(result.geju).toBeDefined();

        // 验证所有宫位都有数据
        result.plates.period.forEach(cell => {
          expect(cell.periodStar).toBeGreaterThanOrEqual(1);
          expect(cell.periodStar).toBeLessThanOrEqual(9);
          expect(cell.mountainStar).toBeGreaterThanOrEqual(0);
          expect(cell.facingStar).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('边界情况测试', () => {
    test('极值角度处理', () => {
      const extremeAngles = [0, 90, 180, 270, 360];

      extremeAngles.forEach(angle => {
        expect(() => {
          generateFlyingStar({
            observedAt: new Date('2024-01-01'),
            facing: { degrees: angle },
          });
        }).not.toThrow();
      });
    });

    test('不同运数的排盘', () => {
      // 测试不同年份对应不同运数
      const testDates = [
        { date: '1864-01-01', expectedPeriod: 1 },
        { date: '1884-01-01', expectedPeriod: 2 },
        { date: '1904-01-01', expectedPeriod: 3 },
        { date: '1924-01-01', expectedPeriod: 4 },
        { date: '1944-01-01', expectedPeriod: 5 },
        { date: '1964-01-01', expectedPeriod: 6 },
        { date: '1984-01-01', expectedPeriod: 7 },
        { date: '2004-01-01', expectedPeriod: 8 },
        { date: '2024-01-01', expectedPeriod: 9 },
      ];

      testDates.forEach(({ date, expectedPeriod }) => {
        const result = generateFlyingStar({
          observedAt: new Date(date),
          facing: { degrees: 180 },
        });
        expect(result.period).toBe(expectedPeriod);
      });
    });
  });
});
