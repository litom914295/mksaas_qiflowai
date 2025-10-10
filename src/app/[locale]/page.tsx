'use client';

import { SimpleGuestAnalysis } from '@/components/analysis/simple-guest-analysis';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/enhanced-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  Compass,
  Download,
  Heart,
  Home,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisScore, setAnalysisScore] = useState<number | null>(null);

  // 模拟分析完成后的回调
  const handleAnalysisComplete = (score: number) => {
    setAnalysisScore(score);
    setShowAnalysis(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 粘性导航栏 */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  八字风水智能分析平台
                </h1>
              </div>
            </div>
            {showAnalysis && analysisScore && (
              <div className="flex items-center gap-4">
                <Badge
                  className={`
                  ${
                    analysisScore >= 80
                      ? 'bg-green-500'
                      : analysisScore >= 60
                        ? 'bg-blue-500'
                        : analysisScore >= 40
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                  }
                `}
                >
                  综合评分: {analysisScore}分
                </Badge>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  导出报告
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - 增强版 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center animate-pulse animation-delay-200">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-600 rounded-full flex items-center justify-center animate-pulse animation-delay-400">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              探索命理玄机 · 掌握风水密码
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            融合传统八字命理与现代玄空飞星理论，运用AI智能算法为您提供专业的人生指导和居住环境优化方案
          </p>

          {/* 功能特色卡片 - 五行主题 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card
              variant="cultural"
              element="wood"
              interactive={true}
              className="p-4 text-center group"
            >
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-green-900 text-sm">事业运势</h4>
              <p className="text-xs text-green-700 mt-1">深度解析职业发展</p>
            </Card>

            <Card
              variant="cultural"
              element="fire"
              interactive={true}
              className="p-4 text-center group"
            >
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-red-900 text-sm">感情婚姻</h4>
              <p className="text-xs text-red-700 mt-1">洞察情感走势</p>
            </Card>

            <Card
              variant="cultural"
              element="earth"
              interactive={true}
              className="p-4 text-center group"
            >
              <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-yellow-900 text-sm">
                家宅风水
              </h4>
              <p className="text-xs text-yellow-800 mt-1">优化居住环境</p>
            </Card>

            <Card
              variant="cultural"
              element="metal"
              interactive={true}
              className="p-4 text-center group"
            >
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">健康保障</h4>
              <p className="text-xs text-gray-700 mt-1">预防潜在风险</p>
            </Card>

            <Card
              variant="cultural"
              element="water"
              interactive={true}
              className="p-4 text-center group"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Award className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-blue-900 text-sm">财运分析</h4>
              <p className="text-xs text-blue-700 mt-1">把握财富机遇</p>
            </Card>
          </div>
        </div>

        {/* 主分析区域 - 使用增强卡片 */}
        <Card variant="feng-shui" size="lg" className="mb-8 shadow-2xl">
          <div className="space-y-6">
            <SimpleGuestAnalysis />
          </div>
        </Card>

        {/* 底部功能特色展示 */}
        {!showAnalysis && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              为什么选择我们的平台？
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                variant="glass"
                className="p-6 text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  专业算法
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  采用传统易学理论结合现代计算技术，确保分析结果的准确性和权威性
                </p>
              </Card>

              <Card
                variant="glass"
                className="p-6 text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  个性化建议
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  根据您的独特命理特征和居住环境，提供量身定制的改善方案
                </p>
              </Card>

              <Card
                variant="glass"
                className="p-6 text-center group hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                  隐私保护
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  采用先进的数据加密技术，确保您的个人信息安全，绝不泄露隐私
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* 页脚 */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-sm">
            本分析基于传统易学理论，结合现代科技算法，仅供参考。重大决策请结合实际情况慎重考虑。
          </p>
          <p className="text-xs mt-2">
            © 2024 八字风水智能分析平台 · 传承千年智慧 · 开创科技未来
          </p>
        </footer>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
}
