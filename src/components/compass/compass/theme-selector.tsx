'use client';

import type { CompassThemeKey } from '@/lib/compass/themes';
import type React from 'react';

interface ThemeSelectorProps {
  currentTheme: CompassThemeKey;
  onThemeChange: (theme: CompassThemeKey) => void;
  className?: string;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  className = '',
}) => {
  const themes = [
    {
      key: 'compass' as CompassThemeKey,
      name: '经典罗盘',
      preview: '/compass-themes/theme-compass-preview.png',
      description: '传统风水罗盘，包含完整的风水元素',
    },
    {
      key: 'dark' as CompassThemeKey,
      name: '暗夜主题',
      preview: '/compass-themes/theme-dark-preview.png',
      description: '深色主题，适合夜间使用',
    },
    {
      key: 'simple' as CompassThemeKey,
      name: '简约主题',
      preview: '/compass-themes/theme-polygon-preview.png',
      description: '简洁清爽的现代设计',
    },
    {
      key: 'polygon' as CompassThemeKey,
      name: '多边形主题',
      preview: '/compass-themes/theme-polygon-preview.png',
      description: '几何多边形设计风格',
    },
    {
      key: 'crice' as CompassThemeKey,
      name: '圆规主题',
      preview: '/compass-themes/theme-crice.png',
      description: '精密测量工具风格',
    },
  ];

  return (
    <div className={`theme-selector ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          选择罗盘主题
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          选择您喜欢的罗盘皮肤样式
        </p>
      </div>

      <div className="themes-container">
        <div className="theme-cards">
          {themes.map((theme) => (
            <div
              key={theme.key}
              className={`theme-card ${currentTheme === theme.key ? 'active' : ''}`}
              onClick={() => onThemeChange(theme.key)}
            >
              {currentTheme === theme.key && (
                <div className="active-badge">当前主题</div>
              )}

              <div
                className="theme-preview"
                style={{
                  backgroundImage: `url(${theme.preview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* 如果图片加载失败，显示备用内容 */}
                <div className="preview-fallback">
                  <div className="compass-icon">
                    <svg viewBox="0 0 100 100" className="w-12 h-12">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <line
                        x1="50"
                        y1="5"
                        x2="50"
                        y2="95"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <line
                        x1="5"
                        y1="50"
                        x2="95"
                        y2="50"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      <polygon points="50,20 45,30 55,30" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="theme-info">
                <h4 className="theme-name">{theme.name}</h4>
                <p className="theme-description">{theme.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .theme-selector {
          width: 100%;
        }

        .themes-container {
          width: 100%;
          overflow-x: auto;
          padding: 10px 0;
          scrollbar-width: thin;
          scrollbar-color: #4a4a4a #1e1e1e;
        }

        .themes-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .themes-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .themes-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
          transition: background 0.3s ease;
        }

        .themes-container::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }

        .theme-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .theme-cards {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 16px;
          }
        }

        .theme-card {
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .theme-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: #3b82f6;
        }

        .theme-card.active {
          border-color: #3b82f6;
          box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1);
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }

        .active-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          padding: 4px 12px;
          border-radius: 0 12px 0 12px;
          font-size: 12px;
          font-weight: 600;
          z-index: 10;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .theme-preview {
          width: 100%;
          height: 140px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 8px 8px 0 0;
          position: relative;
          overflow: hidden;
        }

        .preview-fallback {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          color: #64748b;
        }

        .compass-icon {
          opacity: 0.6;
        }

        .theme-info {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .theme-name {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }

        .theme-description {
          font-size: 13px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
          flex: 1;
        }

        .theme-card.active .theme-name {
          color: #1d4ed8;
        }

        .theme-card.active .theme-description {
          color: #3730a3;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          .theme-card {
            background: #1f2937;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
          }

          .theme-card.active {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          }

          .theme-name {
            color: #f9fafb;
          }

          .theme-description {
            color: #d1d5db;
          }

          .theme-card.active .theme-name {
            color: #dbeafe;
          }

          .theme-card.active .theme-description {
            color: #bfdbfe;
          }

          .preview-fallback {
            background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
            color: #9ca3af;
          }

          .themes-container::-webkit-scrollbar-track {
            background: #374151;
          }

          .themes-container::-webkit-scrollbar-thumb {
            background: #6b7280;
          }

          .themes-container::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeSelector;
