'use client';

import { OptimizedBaziAnalysisResult } from '@/components/analysis/optimized-bazi-analysis-result';
import { useState } from 'react';

export default function TestBaziFixed() {
  const [testData, setTestData] = useState<{ datetime: string; gender: 'male' | 'female'; timezone: string; isTimeKnown: boolean }>({
    datetime: '1990-05-10T10:30:00',
    gender: 'male',
    timezone: 'Asia/Shanghai',
    isTimeKnown: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            八字UI修复测试页面
          </h1>
          <p className="text-lg text-gray-600">
            测试修复后的八字分析功能是否完整显示
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">测试数据</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出生日期时间
              </label>
              <input
                type="datetime-local"
                value={testData.datetime}
                onChange={(e) => setTestData(prev => ({ ...prev, datetime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <select
                value={testData.gender}
                onChange={(e) => setTestData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
          </div>
        </div>

        <OptimizedBaziAnalysisResult
          birthData={testData}
          onAnalysisComplete={(result) => {
            console.log('八字分析完成:', result);
          }}
        />
      </div>
    </div>
  );
}

