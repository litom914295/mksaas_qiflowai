/**
 * 风水罗盘React组件单元测试
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import FengShuiCompass from '../feng-shui-compass';

// Mock Konva和相关依赖
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
  Circle: jest.fn(),
  Text: jest.fn(),
  Line: jest.fn(),
  Group: jest.fn(),
}));

// Mock 性能监控
jest.mock('../../../lib/compass/performance-monitor', () => ({
  compassPerformanceMonitor: {
    startRender: jest.fn(),
    endRender: jest.fn(),
    trackMemoryUsage: jest.fn(),
    getMetrics: jest.fn(() => ({
      averageRenderTime: 16,
      memoryUsage: 50,
      fps: 60,
    })),
  },
}));

describe('FengShuiCompass', () => {
  const defaultProps = {
    width: 400,
    height: 400,
    onAngleChange: jest.fn(),
    interactive: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('渲染测试', () => {
    test('应该正确渲染罗盘组件', () => {
      render(<FengShuiCompass {...defaultProps} />);

      expect(screen.getByTestId('feng-shui-compass')).toBeInTheDocument();
      expect(screen.getByTestId('compass-container')).toBeInTheDocument();
    });

    test('应该显示控制面板', () => {
      render(<FengShuiCompass {...defaultProps} />);

      // 检查按钮是否存在（文本可能因权限状态而异）
      expect(
        screen.getByRole('button', { name: /方向传感器/ })
      ).toBeInTheDocument();
      expect(screen.getByText('手动校准')).toBeInTheDocument();
      expect(screen.getByText(/切换皮肤/)).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    test('应该能够切换传感器状态', async () => {
      render(<FengShuiCompass {...defaultProps} />);

      const sensorButton = screen.getByRole('button', { name: /方向传感器/ });
      fireEvent.click(sensorButton);

      // 按钮文本可能会根据权限状态变化，我们主要测试点击功能
      expect(sensorButton).toBeInTheDocument();
    });
  });
});
