'use client';

import CompassDemo from '@/components/compass/compass-demo';

export default function CompassTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            风水罗盘测试页面
          </h1>
          <p className="text-gray-300 text-lg">
            基于 FengShuiCompass 项目设计的多主题风水罗盘组件
          </p>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <CompassDemo />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">功能特性</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• 多层次数据结构支持</li>
              <li>• 6种预设主题皮肤</li>
              <li>• 交互式方向指示</li>
              <li>• 动画效果支持</li>
              <li>• 专业风水元素</li>
            </ul>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">主题列表</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• 奢华金典 (Luxury)</li>
              <li>• 经典罗盘 (Compass)</li>
              <li>• 暗夜主题 (Dark)</li>
              <li>• 圆规尺 (Crice)</li>
              <li>• 多边形 (Polygon)</li>
              <li>• 简约风格 (Simple)</li>
            </ul>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-3">技术特点</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• React + TypeScript</li>
              <li>• Konva.js 渲染引擎</li>
              <li>• 响应式设计</li>
              <li>• 模块化架构</li>
              <li>• 高性能动画</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}