'use client';

import { type CompassThemeKey, getThemeList } from '@/lib/compass/themes';
import Image from 'next/image';
import type React from 'react';

interface CompassThemeSelectorProps {
  currentTheme: CompassThemeKey;
  onThemeChange: (theme: CompassThemeKey) => void;
  className?: string;
}

const CompassThemeSelector: React.FC<CompassThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className = '',
}) => {
  const themes = getThemeList();

  return (
    <div className={`compass-theme-selector ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          选择罗盘主题
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          不同主题展现不同的风水元素和视觉风格
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200
              ${
                currentTheme === theme.key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
              }
            `}
            onClick={() => onThemeChange(theme.key)}
          >
            {/* 主题预览图片 */}
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              {theme.preview ? (
                <Image
                  src={`/compass-themes/${theme.preview}`}
                  alt={theme.name}
                  width={80}
                  height={80}
                  className="object-cover w-20 h-20"
                />
              ) : null}
              {/* 备用图标 */}
              <div
                className="w-10 h-10 rounded-full border-2 border-gray-400 dark:border-gray-500 relative"
                style={{ display: theme.preview ? 'none' : 'flex' }}
              >
                <div className="absolute inset-1 rounded-full border border-gray-300 dark:border-gray-600" />
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-gray-500 dark:bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* 主题信息 */}
            <div className="text-center">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {theme.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                主题 ID: {theme.id}
              </p>
            </div>

            {/* 选中指示器 */}
            {currentTheme === theme.key && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 主题特色说明 */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
          主题特色
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2" />
            豪华经典：完整风水元素
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2" />
            暗夜星辰：神秘夜间主题
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
            圆规尺：简洁测量工具
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
            八卦多边形：几何美学
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2" />
            简约现代：核心功能
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-brown-400 rounded-full mr-2" />
            专业版：完整传统元素
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompassThemeSelector;
