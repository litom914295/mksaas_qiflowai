'use client';

import { type CompassThemeKey, compassThemes } from '@/lib/compass/themes';
import type React from 'react';
import { useState } from 'react';
import CompassThemeSelector from './compass-theme-selector';
import FengShuiCompass from './feng-shui-compass';

interface CompassDemoProps {
  className?: string;
}

const CompassDemo: React.FC<CompassDemoProps> = ({ className = '' }) => {
  const [currentTheme, setCurrentTheme] = useState<CompassThemeKey>('compass');
  const [compassSize, setCompassSize] = useState(500);
  const [interactive, setInteractive] = useState(true);
  const [enableAnimation, setEnableAnimation] = useState(true);
  const [showDetailedInfo, setShowDetailedInfo] = useState(true);
  const [direction, setDirection] = useState(0);

  const handleDirectionChange = (newDirection: number) => {
    setDirection(newDirection);
  };

  const themeConfig = compassThemes[currentTheme];

  return (
    <div className={`compass-demo ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            风水罗盘演示
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            基于传统风水理论的专业罗盘组件，支持多种主题和交互模式
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* 罗盘显示区域 */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {themeConfig.info.name} - 罗盘
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>方位: {direction.toFixed(1)}°</span>
                  <span>主题: {themeConfig.info.name}</span>
                </div>
              </div>

              {/* 罗盘组件 */}
              <div className="flex justify-center">
                <FengShuiCompass
                  width={compassSize}
                  height={compassSize}
                  theme={currentTheme}
                  interactive={interactive}
                  enableAnimation={enableAnimation}
                  showDetailedInfo={showDetailedInfo}
                  onDirectionChange={handleDirectionChange}
                />
              </div>
            </div>
          </div>

          {/* 控制面板 */}
          <div className="space-y-6">
            {/* 主题选择器 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
              <CompassThemeSelector
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
              />
            </div>

            {/* 设置面板 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                罗盘设置
              </h3>

              <div className="space-y-4">
                {/* 尺寸设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    罗盘尺寸: {compassSize}px
                  </label>
                  <input
                    type="range"
                    min="300"
                    max="800"
                    step="50"
                    value={compassSize}
                    onChange={(e) => setCompassSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>300px</span>
                    <span>800px</span>
                  </div>
                </div>

                {/* 功能开关 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      交互模式
                    </label>
                    <button
                      onClick={() => setInteractive(!interactive)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${interactive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${interactive ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      动画效果
                    </label>
                    <button
                      onClick={() => setEnableAnimation(!enableAnimation)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${enableAnimation ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${enableAnimation ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      详细信息
                    </label>
                    <button
                      onClick={() => setShowDetailedInfo(!showDetailedInfo)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${showDetailedInfo ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${showDetailedInfo ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 当前主题信息 */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                当前主题信息
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    主题名称:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {themeConfig.info.name}
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    描述:
                  </span>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {themeConfig.info.preview || '经典风水罗盘主题'}
                  </p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    层数:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {themeConfig.data.length} 层
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    旋转角度:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {themeConfig.rotate}°
                  </span>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    天心十字:
                  </span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                    {themeConfig.isShowTianxinCross ? '显示' : '隐藏'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            使用说明
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                基本操作
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• 点击罗盘可设置方位角度</li>
                <li>• 切换主题查看不同风格</li>
                <li>• 调整尺寸适应不同场景</li>
                <li>• 开启/关闭动画效果</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                主题特色
              </h4>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• 豪华经典：传统风水完整元素</li>
                <li>• 暗夜星辰：适合夜间使用</li>
                <li>• 圆规尺：简洁的测量工具</li>
                <li>• 专业版：风水师专用版本</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassDemo;
