'use client';

import FengShuiCompass from '@/components/compass/feng-shui-compass';
import ThemeSelector from '@/components/compass/theme-selector';
import { compassThemes, type CompassThemeKey } from '@/lib/compass/themes';
import { useState } from 'react';

export default function CompassDemoPage() {
  const [currentTheme, setCurrentTheme] = useState<CompassThemeKey>('compass');
  const [compassSize, setCompassSize] = useState(400);

  const handleThemeChange = (theme: CompassThemeKey) => {
    setCurrentTheme(theme);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            风水罗盘演示
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            基于 FengShuiCompass 项目设计的多主题风水罗盘组件，支持设备方向感应和多种传统皮肤
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 罗盘显示区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  当前主题: {compassThemes[currentTheme].info.name}
                </h2>
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    尺寸:
                  </label>
                  <select
                    value={compassSize}
                    onChange={(e) => setCompassSize(Number(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value={300}>小 (300px)</option>
                    <option value={400}>中 (400px)</option>
                    <option value={500}>大 (500px)</option>
                    <option value={600}>特大 (600px)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <FengShuiCompass
                  width={compassSize}
                  height={compassSize}
                  theme={currentTheme}
                  interactive={true}
                  enableAnimation={true}
                  showDetailedInfo={true}
                  onDirectionChange={(direction) => {
                    console.log('方向变化:', direction);
                  }}
                />
              </div>
            </div>

            {/* 主题特性说明 */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                当前主题特性
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">数据层数:</span>
                    <span className="font-medium">{compassThemes[currentTheme].data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">天心十字:</span>
                    <span className="font-medium">
                      {compassThemes[currentTheme].isShowTianxinCross ? '显示' : '隐藏'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">刻度显示:</span>
                    <span className="font-medium">
                      {compassThemes[currentTheme].isShowScale !== false ? '显示' : '隐藏'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">旋转角度:</span>
                    <span className="font-medium">{compassThemes[currentTheme].rotate}°</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">动画效果:</span>
                    <span className="font-medium">
                      {compassThemes[currentTheme].animation?.enable ? '启用' : '禁用'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">自动字体:</span>
                    <span className="font-medium">
                      {compassThemes[currentTheme].autoFontSize ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 数据层详情 */}
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">数据层:</h4>
                <div className="flex flex-wrap gap-2">
                  {compassThemes[currentTheme].data.map((layer, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      style={{ 
                        color: Array.isArray(layer.textColor) ? layer.textColor[0] : layer.textColor,
                        borderColor: Array.isArray(layer.textColor) ? layer.textColor[0] : layer.textColor,
                        border: '1px solid'
                      }}
                    >
                      {Array.isArray(layer.name) ? layer.name[0] : layer.name}
                      {Array.isArray(layer.data[0]) 
                        ? ` (${(layer.data as string[][]).length}组)` 
                        : ` (${(layer.data as string[]).length}项)`
                      }
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 主题选择器 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
              />
            </div>

            {/* 使用说明 */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                使用说明
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <div>
                    <strong>启用传感器:</strong> 点击 &quot;启用方向传感器&quot; 按钮，允许浏览器访问设备方向
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <div>
                    <strong>切换主题:</strong> 在右侧选择不同的罗盘皮肤主题
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <div>
                    <strong>手动校准:</strong> 如果方向不准确，可以点击 &quot;手动校准&quot; 按钮
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <div>
                    <strong>查看方向:</strong> 罗盘会显示当前的坐山和朝向信息
                  </div>
                </div>
              </div>
            </div>

            {/* 技术特性 */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                技术特性
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>基于 FengShuiCompass 项目设计</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>支持设备方向感应</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>多层数据显示系统</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>平滑旋转动画</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>响应式设计</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>TypeScript 类型安全</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}