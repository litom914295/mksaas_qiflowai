/**
 * 风水罗盘引擎单元测试
 */

import { CompassUtil, FengShuiCompassEngine } from '../feng-shui-engine';
import type { LayerData } from '../feng-shui-types';

describe('FengShuiCompassEngine', () => {
  let engine: FengShuiCompassEngine;

  beforeEach(() => {
    engine = new FengShuiCompassEngine({ x: 200, y: 200 }, 150);
  });

  describe('基础配置', () => {
    test('应该正确设置中心点', () => {
      engine.setCenterPoint(100, 100);
      const config = engine.getConfig();
      expect(config.centralPoint).toEqual({ x: 100, y: 100 });
    });

    test('应该正确设置半径', () => {
      engine.setRadius(200);
      const config = engine.getConfig();
      expect(config.radius).toBe(200);
    });

    test('应该正确设置边框', () => {
      engine.setBorder(5, '#ff0000');
      const config = engine.getConfig();
      expect(config.borderWidth).toBe(5);
      expect(config.borderColor).toBe('#ff0000');
    });
  });

  describe('数据处理', () => {
    const testData: LayerData[] = [
      {
        name: '测试层',
        startAngle: 0,
        textColor: '#ffffff',
        data: ['北', '东北', '东', '东南', '南', '西南', '西', '西北'],
      },
    ];

    test('应该正确设置罗盘数据', () => {
      engine.setCompassData(testData);
      expect(engine.getLayersLength()).toBe(1);
      expect(engine.getLayerDataLength(0)).toBe(8);
    });

    test('应该正确获取角度对应的数据', () => {
      engine.setCompassData(testData);
      const data = engine.getDataByAngle(0, 0);
      expect(data).toBe('北');
    });

    test('应该处理无效的层索引', () => {
      engine.setCompassData(testData);
      expect(() => engine.getDataByAngle(-1, 0)).toThrow();
      expect(() => engine.getDataByAngle(10, 0)).toThrow();
    });

    test('应该正确处理角度归一化', () => {
      engine.setCompassData(testData);
      const data1 = engine.getDataByAngle(0, 360);
      const data2 = engine.getDataByAngle(0, 0);
      expect(data1).toBe(data2);
    });
  });

  describe('角度计算', () => {
    test('应该正确转换角度为弧度', () => {
      const rads = engine.rads(90);
      expect(rads).toBeCloseTo(0, 2);
    });

    test('应该正确计算层半径', () => {
      const testData: LayerData[] = [
        {
          name: '层1',
          startAngle: 0,
          textColor: '#ffffff',
          data: ['A', 'B', 'C', 'D'],
        },
      ];

      engine.setCompassData(testData);
      const radius = engine.getLayerRadius(0);
      expect(radius).toBeGreaterThan(0);
    });
  });
});

describe('CompassUtil', () => {
  let engine: FengShuiCompassEngine;
  let util: CompassUtil;

  beforeEach(() => {
    engine = new FengShuiCompassEngine({ x: 200, y: 200 }, 150);
    util = new CompassUtil(engine);
  });

  describe('二十四山', () => {
    test('应该正确获取二十四山信息', () => {
      const mountain = util.getTwentyFourMountain(0);
      expect(mountain.name).toBe('子');
      expect(mountain.bagua).toBe('坎');
      expect(mountain.element).toBe('水');
    });

    test('应该处理不同角度的二十四山', () => {
      const mountain1 = util.getTwentyFourMountain(90);
      const mountain2 = util.getTwentyFourMountain(180);
      const mountain3 = util.getTwentyFourMountain(270);

      expect(mountain1.name).toBeDefined();
      expect(mountain2.name).toBeDefined();
      expect(mountain3.name).toBeDefined();
    });
  });

  describe('八卦', () => {
    test('应该正确获取八卦信息', () => {
      const bagua = util.getBaguaInfo(0);
      expect(bagua.name).toBe('坎');
      expect(bagua.element).toBe('水');
      expect(bagua.meaning).toBe('水');
    });

    test('应该处理360度循环', () => {
      const bagua1 = util.getBaguaInfo(0);
      const bagua2 = util.getBaguaInfo(360);
      expect(bagua1).toEqual(bagua2);
    });
  });
});
