// 独立的增强版玄空风水页面
export default function XuankongEnhancedRoute() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            玄空风水分析系统 - 增强版
          </h1>

          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <p className="text-green-800">
              ✅ 独立页面创建成功！这是一个全新的页面，不会影响原系统。
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h2 className="text-xl font-semibold mb-2">功能特色</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>增强版九宫飞星盘</li>
                <li>关键位置智能分析</li>
                <li>流年运势深度解析</li>
                <li>专业布局建议</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h2 className="text-xl font-semibold mb-2">访问地址</h2>
              <p>
                原版本：
                <a
                  href="/zh-CN/analysis/xuankong"
                  className="text-blue-600 underline"
                >
                  /zh-CN/analysis/xuankong
                </a>
              </p>
              <p>
                增强版：
                <span className="font-mono text-purple-600">
                  /zh-CN/analysis/xuankong-enhanced
                </span>{' '}
                (当前页面)
              </p>
            </div>

            <div className="text-center mt-8">
              <a
                href="/zh-CN/analysis/xuankong"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                返回原版本
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
