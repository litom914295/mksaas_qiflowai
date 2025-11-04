'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BaziAnalysisEntry() {
  const router = useRouter();

  const features = [
    { icon: Star, text: '99.9%准确率', color: 'text-yellow-600' },
    { icon: Calendar, text: '真太阳时校正', color: 'text-blue-600' },
    { icon: TrendingUp, text: '专业分析报告', color: 'text-green-600' },
    { icon: Users, text: 'AI大师解答', color: 'text-purple-600' },
  ];

  return (
    <Card className="relative overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-50" />
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full opacity-20 blur-3xl" />

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              八字精准分析
            </CardTitle>
            <p className="text-gray-600 mt-2">
              专业级命理分析系统，为您解读命运密码
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            新版上线
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* 特性网格 */}
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* 价格信息 */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">服务定价</span>
            <Badge variant="secondary">限时优惠</Badge>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>基础分析</span>
              <span className="font-semibold">10 积分</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>详细分析</span>
              <span className="font-semibold">30 积分</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>专业分析</span>
              <span className="font-semibold text-purple-600">50 积分</span>
            </div>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            onClick={() => router.push('/zh-CN/bazi-analysis')}
          >
            <Zap className="w-4 h-4 mr-2" />
            立即体验
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/zh-CN/about#bazi')}
          >
            了解详情
          </Button>
        </div>

        {/* 用户数据 */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">10K+</p>
            <p className="text-xs text-gray-600">用户使用</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">99.9%</p>
            <p className="text-xs text-gray-600">准确率</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">4.9</p>
            <p className="text-xs text-gray-600">用户评分</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 迷你入口组件（适合放在侧边栏或小空间）
 */
export function BaziAnalysisMiniEntry() {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
      onClick={() => router.push('/zh-CN/bazi-analysis')}
    >
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">八字分析</h4>
            <p className="text-sm text-gray-600">专业命理解读</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 横幅广告组件
 */
export function BaziAnalysisBanner() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-white text-purple-600">
            <Sparkles className="w-3 h-3 mr-1" />
            新功能
          </Badge>
          <Badge className="bg-yellow-400 text-gray-900">限时优惠</Badge>
        </div>
        <h2 className="text-3xl font-bold mb-2">全新八字分析系统已上线！</h2>
        <p className="text-white/90 mb-4">
          基于真太阳时校正、精确节气判断，准确率高达99.9%的专业命理分析
        </p>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>专业算法</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>详细报告</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>AI解答</span>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-white text-purple-600 hover:bg-gray-100"
          onClick={() => router.push('/zh-CN/bazi-analysis')}
        >
          立即体验
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* 装饰元素 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
    </div>
  );
}
