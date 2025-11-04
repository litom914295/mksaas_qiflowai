'use client';

import { SEOHead } from '@/components/seo/seo-head';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/enhanced-card';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  Compass as CompassIcon,
  Crown,
  Download,
  Gift,
  MessageCircle,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';

// 懒加载重型组件
const GuestAnalysisPage = dynamic(
  () => import('@/components/qiflow/analysis/guest-analysis-page'),
  {
    loading: () => <div className="p-8 text-center">加载分析组件...</div>,
    ssr: false,
  }
);

const AIChatPopup = dynamic(
  () =>
    import('@/components/home/ai-chat-popup').then((mod) => ({
      default: mod.AIChatPopup,
    })),
  { ssr: false }
);

const ReportExport = dynamic(
  () =>
    import('@/components/feedback/report-export').then((mod) => ({
      default: mod.ReportExport,
    })),
  { ssr: false }
);

const RecommendationCard = dynamic(
  () =>
    import('@/components/feedback/recommendation-card').then((mod) => ({
      default: mod.RecommendationCard,
    })),
  { ssr: false }
);

// 动态导入Tabs组件（优化：合并导入）
const TabsComponents = dynamic(
  () =>
    import('@/components/ui/tabs').then((mod) => ({
      default: () => null, // placeholder
      Tabs: mod.Tabs,
      TabsList: mod.TabsList,
      TabsTrigger: mod.TabsTrigger,
      TabsContent: mod.TabsContent,
    })),
  { ssr: false }
);

// 为了保持兼容性，导出各个组件
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 动态导入confetti
const triggerCelebration = async () => {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
  });
};

// 导入分析和支付系统
import {
  ConversionFunnel,
  PerformanceMonitor,
  UserBehaviorTracker,
} from '@/lib/analytics';
import { usePayment } from '@/lib/payment';

// 优化的图片组件 - 使用 next/image
type OptimizedImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

const OptimizedImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  ...props
}: OptimizedImageProps) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};

// 用户见证数据
const testimonials = [
  {
    name: '张先生',
    avatar: '👨‍💼',
    text: '准确度惊人！按照建议调整后，生意明显好转',
    rating: 5,
  },
  {
    name: '李女士',
    avatar: '👩‍💻',
    text: '终于找到了适合我的风水布局，感觉运气都变好了',
    rating: 5,
  },
  {
    name: '王总',
    avatar: '👨‍💼',
    text: '专业的分析帮我选对了办公室，事业蒸蒸日上',
    rating: 5,
  },
];

// 实时统计数据
const stats = {
  totalUsers: 126543,
  todayUsers: 1432,
  accuracy: 96.8,
  satisfaction: 98.5,
};

export default function OptimizedHomePage() {
  const [step, setStep] = useState(0);
  const [baziScore, setBaziScore] = useState(0);
  const [fengshuiScore, setFengshuiScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userCount, setUserCount] = useState(stats.todayUsers);
  const [showChat, setShowChat] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);

  const analysisRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 支付系统集成
  const {
    createPayment,
    loading: paymentLoading,
    error: paymentError,
  } = usePayment();

  // 初始化分析系统
  useEffect(() => {
    // 初始化转化漏斗
    const funnel = ConversionFunnel.getInstance();
    funnel.trackStep('page_view', { page: 'home' });

    // 初始化用户行为追踪
    const behaviorTracker = UserBehaviorTracker.getInstance();

    // 初始化性能监控
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.measurePageLoad();

    return () => {
      // 清理
      funnel.clearFunnel();
    };
  }, []);

  // 模拟实时用户数增长
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 处理分析开始
  const handleStartAnalysis = () => {
    setStep(1);
    if (analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // 追踪漏斗步骤
    const funnel = ConversionFunnel.getInstance();
    funnel.trackStep('start_analysis');
  };

  // 处理分析结果
  const handleAnalysisComplete = (results: any) => {
    // 追踪漏斗步骤
    const funnel = ConversionFunnel.getInstance();
    funnel.trackStep('analysis_complete', results);

    // 模拟分析过程
    setTimeout(async () => {
      setBaziScore(85);
      setFengshuiScore(78);
      setShowResults(true);
      setStep(2);

      // 生成推荐
      const newRecommendations = [
        {
          type: 'wealth',
          title: '财运提升建议',
          description: '在东南方位放置绿植或水晶',
          importance: 'high',
        },
        {
          type: 'career',
          title: '事业发展指南',
          description: '2024年下半年有贵人相助',
          importance: 'medium',
        },
        {
          type: 'relationship',
          title: '感情运势分析',
          description: '农历七月桃花运旺盛',
          importance: 'high',
        },
      ];

      setRecommendations(newRecommendations);

      // 设置报告数据
      setReportData({
        baziAnalysis: results?.baziData || {},
        fengshuiAnalysis: results?.fengshuiData || {},
        score: { bazi: 85, fengshui: 78 },
        recommendations: newRecommendations,
      });

      // 触发庆祝动画
      await triggerCelebration();

      // 滚动到结果区域
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      // 追踪结果展示
      funnel.trackStep('results_shown', {
        baziScore: 85,
        fengshuiScore: 78,
      });

      // 延迟显示AI聊天和升级提示
      setTimeout(() => setShowChat(true), 3000);
      setTimeout(() => setShowUpgradeModal(true), 10000);
    }, 3000);
  };

  // 处理支付
  const handlePayment = async (method: 'alipay' | 'wechat') => {
    // 追踪转化
    const funnel = ConversionFunnel.getInstance();
    funnel.trackStep('payment_initiated', { method });

    const result = await createPayment(99, 'professional', method);

    if (result.success) {
      funnel.trackStep('payment_success', result);
    } else {
      funnel.trackStep('payment_failed', result);
    }
  };

  return (
    <>
      <SEOHead
        title="AI风水大师 - 专业八字命理与风水分析"
        description="融合千年易学智慧与现代AI科技，3分钟精准分析您的命理运势与风水格局"
      />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white">
        {/* 顶部导航栏 */}
        <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CompassIcon className="w-8 h-8 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI风水大师
                </span>
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-600 animate-pulse"
                >
                  限时8折
                </Badge>
              </div>

              {/* 实时数据展示 */}
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span>
                    今日用户：
                    <span className="font-bold text-green-600">
                      {userCount}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>
                    准确率：
                    <span className="font-bold text-blue-600">
                      {stats.accuracy}%
                    </span>
                  </span>
                </div>
              </div>

              {/* 得分展示 */}
              {showResults && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                    综合评分：{Math.round((baziScore + fengshuiScore) / 2)}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </nav>

        {/* 主英雄区 */}
        {step === 0 && (
          <motion.div
            className="relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="container mx-auto px-4 py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto"
              >
                {/* 信任徽章 */}
                <motion.div className="flex justify-center gap-4 mb-6">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Shield className="w-3 h-3" />
                    专业认证
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Star className="w-3 h-3" />
                    4.9分好评
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    <Users className="w-3 h-3" />
                    10万+用户
                  </Badge>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  AI智能风水分析
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                  融合千年易学智慧与现代AI科技
                  <br />
                  <span className="text-purple-600 font-semibold">3分钟</span>
                  精准分析您的
                  <span className="text-pink-600 font-semibold">命理运势</span>
                  与
                  <span className="text-blue-600 font-semibold">风水格局</span>
                </p>

                {/* 限时优惠 */}
                <motion.div
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 mb-8 max-w-2xl mx-auto"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Gift className="w-6 h-6" />
                    <span className="text-lg font-bold">
                      限时优惠：前100名用户享8折优惠
                    </span>
                    <Gift className="w-6 h-6" />
                  </div>
                </motion.div>

                {/* CTA按钮 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg shadow-xl"
                      onClick={handleStartAnalysis}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      立即免费分析
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg"
                    onClick={() => setShowChat(true)}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    先咨询AI大师
                  </Button>
                </div>

                {/* 用户见证 */}
                <div className="overflow-hidden max-w-3xl mx-auto">
                  <motion.div
                    className="flex gap-4"
                    animate={{ x: [0, -1000] }}
                    transition={{
                      duration: 20,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: 'linear',
                    }}
                  >
                    {[...testimonials, ...testimonials].map((item, index) => (
                      <Card
                        key={index}
                        variant="outlined"
                        className="flex-shrink-0 w-80 p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{item.avatar}</span>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <div className="flex text-yellow-500">
                              {[...Array(item.rating)].map((_, i) => (
                                <Star
                                  key={i}
                                  className="w-3 h-3 fill-current"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">"{item.text}"</p>
                      </Card>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* 分析表单区域 */}
        {step === 1 && (
          <div ref={analysisRef} className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-2xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">分析进度</span>
                  <span className="text-sm text-gray-500">步骤 2/3</span>
                </div>
                <Progress value={66} className="h-2" />
              </div>

              <Card variant="elevated" className="p-6">
                <Suspense
                  fallback={<div className="p-8 text-center">加载中...</div>}
                >
                  <GuestAnalysisPage />
                </Suspense>
              </Card>
            </motion.div>
          </div>
        )}

        {/* 结果展示区域 */}
        {step === 2 && showResults && (
          <div ref={resultsRef} className="container mx-auto px-4 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* 分数展示 */}
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card
                  variant="elevated"
                  className="p-6 bg-gradient-to-br from-purple-50 to-pink-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">八字命理评分</h3>
                    <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                      {baziScore}分
                    </Badge>
                  </div>
                  <Progress value={baziScore} className="h-4" />
                </Card>

                <Card
                  variant="elevated"
                  className="p-6 bg-gradient-to-br from-blue-50 to-green-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">风水格局评分</h3>
                    <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                      {fengshuiScore}分
                    </Badge>
                  </div>
                  <Progress value={fengshuiScore} className="h-4" />
                </Card>
              </div>

              {/* 智能推荐 */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">
                  个性化改运建议
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <Suspense fallback={<div>加载推荐...</div>}>
                    {recommendations.map((rec, index) => (
                      <RecommendationCard
                        key={index}
                        {...rec}
                        onClick={() => setShowUpgradeModal(true)}
                      />
                    ))}
                  </Suspense>
                </div>
              </div>

              {/* 详细结果 */}
              <Card variant="elevated" className="p-6 mb-12">
                <Suspense fallback={<div>加载详细结果...</div>}>
                  <Tabs defaultValue="summary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="summary">总览</TabsTrigger>
                      <TabsTrigger value="bazi">八字分析</TabsTrigger>
                      <TabsTrigger value="fengshui">风水分析</TabsTrigger>
                      <TabsTrigger value="advice">改运方案</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="mt-6">
                      <p className="text-gray-600">
                        根据您的八字命理和居住风水综合分析，您的整体运势处于中上水平...
                      </p>
                    </TabsContent>

                    <TabsContent value="bazi" className="mt-6">
                      <p className="text-gray-600">
                        您的八字组合显示五行较为平衡，日主身强...
                      </p>
                    </TabsContent>

                    <TabsContent value="fengshui" className="mt-6">
                      <p className="text-gray-600">
                        您的住宅坐向为坎宅，属于东四宅...
                      </p>
                    </TabsContent>

                    <TabsContent value="advice" className="mt-6">
                      <p className="text-gray-600">
                        基于综合分析，为您制定以下改运方案...
                      </p>
                    </TabsContent>
                  </Tabs>
                </Suspense>
              </Card>

              {/* 行动号召 */}
              <div className="text-center">
                <Card
                  variant="elevated"
                  className="p-8 bg-gradient-to-r from-purple-100 to-pink-100"
                >
                  <h2 className="text-2xl font-bold mb-4">
                    限时特惠，立即行动！
                  </h2>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-3xl text-gray-400 line-through">
                      ¥299
                    </span>
                    <span className="text-5xl font-bold text-red-600">¥99</span>
                  </div>

                  {/* 支付按钮 */}
                  <div className="flex gap-3 justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-blue-600"
                      onClick={() => handlePayment('alipay')}
                      disabled={paymentLoading}
                    >
                      支付宝支付
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-green-600"
                      onClick={() => handlePayment('wechat')}
                      disabled={paymentLoading}
                    >
                      微信支付
                    </Button>
                  </div>

                  {paymentError && (
                    <p className="text-red-500 mt-2">{paymentError}</p>
                  )}
                </Card>
              </div>
            </motion.div>
          </div>
        )}

        {/* AI聊天弹窗 */}
        <Suspense fallback={null}>
          <AIChatPopup
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            baziData={reportData?.baziAnalysis}
            fengshuiData={reportData?.fengshuiAnalysis}
          />
        </Suspense>

        {/* 报告导出 */}
        {reportData && (
          <Suspense fallback={null}>
            <div className="hidden">
              <ReportExport
                data={reportData}
                onExport={(format) => console.log(`Exporting in ${format}`)}
              />
            </div>
          </Suspense>
        )}
      </div>
    </>
  );
}
