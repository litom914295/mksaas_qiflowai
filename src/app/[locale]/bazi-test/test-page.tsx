'use client';

import { useTranslations } from 'next-intl';

export default function SimpleTestPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">测试页面</h1>
        <p className="text-gray-600 mb-4">
          如果你能看到这个页面，说明基本路由是正常的。
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">状态检查</h2>
          <ul className="list-disc list-inside text-blue-800 space-y-2">
            <li>✅ Next.js 路由正常</li>
            <li>✅ 国际化正常</li>
            <li>✅ Tailwind CSS 正常</li>
            <li>✅ 客户端组件正常</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">
            现在可以尝试加载完整的 GuestAnalysisPage 组件了。
          </p>
        </div>
      </div>
    </div>
  );
}
