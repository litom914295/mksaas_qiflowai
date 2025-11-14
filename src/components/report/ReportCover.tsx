'use client';

import React from 'react';

/**
 * ReportCover - VIP 报告封面
 *
 * 功能：
 * - 展示用户姓名和性别标题
 * - 显示报告日期
 * - VIP 分析耗时标记
 * - 图表数量标记
 * - 高端设计风格
 */

interface ReportCoverProps {
  name: string;
  genderTitle: string; // "先生" | "女士"
  reportDate: string;
  analysisHours: number;
  chartsCount: number;
  supportPlan?: string;
  birthInfo: {
    date: string;
    time: string;
    city: string;
  };
}

export default function ReportCover({
  name,
  genderTitle,
  reportDate,
  analysisHours,
  chartsCount,
  supportPlan = '180天跟踪服务',
  birthInfo,
}: ReportCoverProps) {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Logo 区域 */}
        <div className="mb-8">
          <div className="text-4xl font-bold tracking-wider">
            <span className="text-yellow-400">气</span>
            <span className="text-white">流</span>
            <span className="text-yellow-400">AI</span>
          </div>
          <div className="text-sm text-center text-gray-300 mt-2 tracking-widest">
            QIFLOW AI
          </div>
        </div>

        {/* VIP 标记 */}
        <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-yellow-300 text-sm font-semibold">
            专业版报告
          </span>
        </div>

        {/* 标题 */}
        <h1 className="text-5xl md:text-6xl font-bold text-center mb-4">
          八字风水专业报告
        </h1>

        {/* 用户姓名 */}
        <div className="text-3xl md:text-4xl font-semibold text-center mb-8">
          {name} {genderTitle}
        </div>

        {/* 分割线 */}
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mb-8" />

        {/* 出生信息 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 max-w-md w-full">
          <div className="space-y-3 text-center">
            <div className="text-gray-300 text-sm">
              <span className="text-gray-400">出生日期：</span>
              {birthInfo.date}
            </div>
            <div className="text-gray-300 text-sm">
              <span className="text-gray-400">出生时辰：</span>
              {birthInfo.time}
            </div>
            <div className="text-gray-300 text-sm">
              <span className="text-gray-400">出生地：</span>
              {birthInfo.city}
            </div>
          </div>
        </div>

        {/* VIP 特性标记 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl w-full">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {analysisHours}h
            </div>
            <div className="text-sm text-gray-300">专属分析</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {chartsCount}+
            </div>
            <div className="text-sm text-gray-300">专属图表</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-yellow-400 mb-1">180</div>
            <div className="text-sm text-gray-300">天跟踪服务</div>
          </div>
        </div>

        {/* 报告日期 */}
        <div className="text-gray-400 text-sm mb-4">
          报告生成日期：{reportDate}
        </div>

        {/* 稀缺性提示 */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-6 py-3 max-w-lg">
          <p className="text-yellow-300 text-sm text-center">
            <span className="font-semibold">🌟 稀缺格局：</span>
            您的八字格局属于人群前 15%，报告包含独家深度分析
          </p>
        </div>

        {/* 页脚提示 */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-gray-500 text-xs">
          <p>本报告为{name}{genderTitle}专属定制 · 严禁传播或商业使用</p>
        </div>
      </div>
    </div>
  );
}
