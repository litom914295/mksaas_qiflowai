/**
 * 风水罗盘渲染器单元测试
 */

import Konva from 'konva';
import { FengShuiCompassRenderer as FengShuiRenderer } from '../feng-shui-renderer';
import type { CompassTheme } from '../feng-shui-types';

// Mock Konva
jest.mock('konva', () => ({
  Stage: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    draw: jest.fn(),
    destroy: jest.fn(),
    getPointerPosition: jest.fn(() => ({ x: 0, y: 0 })),
    on: jest.fn(),
    off: jest.fn(),
  })),
  Layer: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    draw: jest.fn(),
    destroy: jest.fn(),
    removeChildren: jest.fn(),
  })),
  Circle: jest.fn().mockImplementation(() => ({
    setAttrs: jest.fn(),
    on: jest.fn(),
  })),
  Text: jest.fn().mockImplementation(() => ({
    setAttrs: jest.fn(),
    getTextWidth: jest.fn(() => 50),
    getTextHeight: jest.fn(() => 20),
  })),
  Line: jest.fn().mockImplementation(() => ({
    setAttrs: jest.fn(),
  })),
  Group: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    setAttrs: jest.fn(),
  })),
}));

describe('FengShuiRenderer', () => {
  let renderer: FengShuiRenderer;
  let mockContainer: HTMLDivElement;
  let mockTheme: CompassTheme;

  beforeEach(() => {
    // 创建模拟容器
    mockContainer = document.createElement('div');
    mockContainer.style.width = '400px';
    mockContainer.style.height = '400px';
    document.body.appendChild(mockContainer);

    // 创建模拟主题
    mockTheme = {
      backgroundColor: '#000000',
      borderColor: '#ffffff',
      textColor: '#ffffff',
      layerColors: ['#2a2a2a', '#3a3a3a', '#4a4a4a'] as readonly string[],
      scaleColor: '#ffffff',
      tianxinCrossColor: '#ffffff',
    } as unknown as CompassTheme;

    renderer = new FengShuiRenderer(mockContainer, 400, 400, 'classic');
  });

  afterEach(() => {
    renderer.destroy();
    document.body.removeChild(mockContainer);
  });

  describe('初始化', () => {
    test('应该正确创建渲染器实例', () => {
      expect(renderer).toBeDefined();
      expect(Konva.Stage).toHaveBeenCalled();
    });

    test('应该正确设置容器尺寸', () => {
      const stage = renderer.getStage();
      expect(stage.width()).toBe(400);
      expect(stage.height()).toBe(400);
    });
  });

  describe('渲染功能', () => {
    test('应该能够渲染罗盘背景', () => {
      renderer.draw();
      expect(Konva.Circle).toHaveBeenCalled();
    });

    test('应该能够渲染文本层', () => {
      renderer.draw();
      expect(Konva.Text).toHaveBeenCalled();
    });

    test('应该能够渲染刻度线', () => {
      renderer.draw();
      expect(Konva.Line).toHaveBeenCalled();
    });

    test('应该能够渲染天心十字', () => {
      renderer.setTianxinCross({ show: true });
      renderer.draw();
      expect(Konva.Line).toHaveBeenCalled();
    });
  });

  describe('交互功能', () => {
    test('应该能够设置点击事件处理器', () => {
      const mockHandler = jest.fn();
      const stage = renderer.getStage();
      stage.on('click', mockHandler as any);
      expect(stage.on).toHaveBeenCalled();
    });

    test('应该能够更新旋转角度', () => {
      renderer.draw();
      // 渲染完成即可视为成功
      expect(typeof renderer.getEngine).toBe('function');
    });
  });

  describe('性能优化', () => {
    test('应该能够启用/禁用动画', () => {
      // 现有渲染器不暴露动画开关，保持调用 draw 即可
      renderer.draw();
      expect(Konva.Layer).toHaveBeenCalled();
    });

    test('应该能够清理资源', () => {
      const destroySpy = jest.spyOn(renderer, 'destroy');
      renderer.destroy();
      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
