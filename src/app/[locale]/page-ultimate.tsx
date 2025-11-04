'use client';

import { RecommendationCard } from '@/components/feedback/recommendation-card';
import { ReportExport } from '@/components/feedback/report-export';
import { AIChatPopup } from '@/components/home/ai-chat-popup';
import GuestAnalysisPage from '@/components/qiflow/analysis/guest-analysis-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/enhanced-card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import confetti from 'canvas-confetti';
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  ArrowUp,
  Award,
  CheckCircle,
  ChevronRight,
  Compass as CompassIcon,
  Crown,
  DollarSign,
  Download,
  Gift,
  Heart,
  Home,
  Lock,
  MessageCircle,
  Share2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Unlock,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

// 实时统计数据（增强可信度）
const stats = {
  totalUsers: 126543,
  todayUsers: 1432,
  accuracy: 96.8,
  satisfaction: 98.5,
};

export default function UltimateHomePage() {
  const [step, setStep] = useState(0); // 0: 首页, 1: 分析中, 2: 显示结果
  const [baziScore, setBaziScore] = useState(0);
  const [fengshuiScore, setFengshuiScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userCount, setUserCount] = useState(stats.todayUsers);
  const [showChat, setShowChat] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  // 模拟实时用户数增长
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 分析完成触发庆祝动画
  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B'],
    });
  };

  // 处理分析结果
  const handleAnalysisComplete = (results: any) => {
    setIsAnalyzing(true);

    // 模拟分析过程
    setTimeout(() => {
      setBaziScore(85);
      setFengshuiScore(78);
      setIsAnalyzing(false);
      setShowResults(true);
      setStep(2);

      // 生成推荐
      setRecommendations([
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
      ]);

      // 设置报告数据
      setReportData({
        baziAnalysis: results?.baziData || {},
        fengshuiAnalysis: results?.fengshuiData || {},
        score: { bazi: 85, fengshui: 78 },
        recommendations,
      });

      triggerCelebration();

      // 滚动到结果区域
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      // 延迟显示AI聊天提示
      setTimeout(() => {
        setShowChat(true);
      }, 3000);

      // 延迟显示升级提示
      setTimeout(() => {
        setShowUpgradeModal(true);
      }, 10000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white">
      {/* 顶部导航栏 - 增强版 */}
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
                  <span className="font-bold text-green-600">{userCount}</span>
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
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-600" />
                <span>
                  满意度：
                  <span className="font-bold text-red-600">
                    {stats.satisfaction}%
                  </span>
                </span>
              </div>
            </div>

            {/* 得分展示（分析后显示） */}
            {showResults && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-3"
              >
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                  综合评分：{Math.round((baziScore + fengshuiScore) / 2)}
                </Badge>
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  升级VIP
                </Button>
                <Button variant="outline" onClick={() => setShowChat(true)}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  AI咨询
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </nav>

      {/* 主英雄区 - 超强视觉冲击 */}
      {step === 0 && (
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-transparent" />
          <div className="container mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* 信任徽章 */}
              <motion.div
                className="flex justify-center gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
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
                <span className="text-pink-600 font-semibold">命理运势</span>与
                <span className="text-blue-600 font-semibold">风水格局</span>
              </p>

              {/* 限时优惠提醒 */}
              <motion.div
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 mb-8 max-w-2xl mx-auto"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <div className="flex items-center justify-center gap-3">
                  <Gift className="w-6 h-6" />
                  <span className="text-lg font-bold">
                    限时优惠：前100名用户享8折优惠 + 赠送月度运势报告
                  </span>
                  <Gift className="w-6 h-6" />
                </div>
              </motion.div>

              {/* CTA按钮组 */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg shadow-xl"
                    onClick={() => {
                      setStep(1);
                      if (analysisRef.current) {
                        analysisRef.current.scrollIntoView({
                          behavior: 'smooth',
                        });
                      }
                    }}
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

              {/* 用户见证滚动 */}
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
                              <Star key={i} className="w-3 h-3 fill-current" />
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
            {/* 进度指示器 */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">分析进度</span>
                <span className="text-sm text-gray-500">步骤 2/3</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>

            {/* 起始分析组件 */}
            <Card variant="elevated" className="p-6">
              <GuestAnalysisPage />
            </Card>
          </motion.div>
        </div>
      )}

      {/* 结果展示区域 - 增强版 */}
      {step === 2 && showResults && (
        <div ref={resultsRef} className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* 分数展示卡片 */}
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
                <Progress value={baziScore} className="h-4 mb-4" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>五行平衡度：优秀</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>命格层次：中上</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>运势趋势：上升期</span>
                  </div>
                </div>
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
                <Progress value={fengshuiScore} className="h-4 mb-4" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>坐向吉凶：大吉</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>财位状态：可优化</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>煞气化解：已处理</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* 智能推荐卡片 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">
                🎯 个性化改运建议
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    {...rec}
                    onClick={() => setShowUpgradeModal(true)}
                  />
                ))}
              </div>
            </div>

            {/* 详细结果标签页 */}
            <Card variant="elevated" className="p-6 mb-12">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="summary">总览</TabsTrigger>
                  <TabsTrigger value="bazi">八字分析</TabsTrigger>
                  <TabsTrigger value="fengshui">风水分析</TabsTrigger>
                  <TabsTrigger value="advice">改运方案</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="mt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold mb-3">综合评估</h3>
                      <p className="text-gray-600 leading-relaxed">
                        根据您的八字命理和居住风水综合分析，您的整体运势处于
                        <span className="text-purple-600 font-bold">
                          中上水平
                        </span>
                        。
                        命格显示您具有较强的事业心和财运基础，配合适当的风水调整，
                        可以进一步提升各方面运势。
                      </p>
                    </div>

                    {/* 免费展示部分内容 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-bold text-purple-700 mb-2">
                          ✨ 优势领域
                        </h4>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• 事业运势强劲</li>
                          <li>• 贵人运佳</li>
                          <li>• 健康状态良好</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-700 mb-2">
                          📈 提升空间
                        </h4>
                        <ul className="text-sm space-y-1 text-gray-600">
                          <li>• 财运可进一步增强</li>
                          <li>• 感情运需要把握时机</li>
                          <li>• 家宅风水待优化</li>
                        </ul>
                      </div>
                    </div>

                    {/* 锁定内容提示 */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-6 h-6 text-orange-600" />
                          <div>
                            <h4 className="font-bold text-orange-900">
                              查看完整分析报告
                            </h4>
                            <p className="text-sm text-orange-700">
                              包含详细命理解析、流年运势、风水改造方案
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Unlock className="w-4 h-4 mr-1" />
                          立即解锁
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="bazi" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      您的八字组合显示五行较为平衡，日主身强，适合发展事业...
                    </p>
                    {/* 部分内容展示 */}
                    <div className="bg-gray-100 rounded-lg p-4 blur-sm relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          className="z-10"
                        >
                          升级查看完整内容
                        </Button>
                      </div>
                      <p className="text-gray-400">
                        [详细八字分析内容已模糊处理，升级后可查看]
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fengshui" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      您的住宅坐向为坎宅，属于东四宅，整体格局良好...
                    </p>
                    {/* 部分内容展示 */}
                    <div className="bg-gray-100 rounded-lg p-4 blur-sm relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          className="z-10"
                        >
                          升级查看完整内容
                        </Button>
                      </div>
                      <p className="text-gray-400">
                        [详细风水分析内容已模糊处理，升级后可查看]
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advice" className="mt-6">
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      基于综合分析，为您制定以下改运方案...
                    </p>
                    {/* 部分内容展示 */}
                    <div className="bg-gray-100 rounded-lg p-4 blur-sm relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button
                          onClick={() => setShowUpgradeModal(true)}
                          className="z-10"
                        >
                          升级查看完整方案
                        </Button>
                      </div>
                      <p className="text-gray-400">
                        [个性化改运方案已模糊处理，升级后可查看]
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* 行动号召区 */}
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="inline-block"
              >
                <Card
                  variant="elevated"
                  className="p-8 bg-gradient-to-r from-purple-100 to-pink-100"
                >
                  <h2 className="text-2xl font-bold mb-4">
                    🎁 限时特惠，立即行动！
                  </h2>
                  <p className="text-gray-600 mb-6">
                    升级专业版，解锁全部功能，获得个性化改运方案
                  </p>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <span className="text-3xl text-gray-400 line-through">
                      ¥299
                    </span>
                    <span className="text-5xl font-bold text-red-600">¥99</span>
                    <Badge className="bg-red-500 text-white animate-pulse">
                      限时67折
                    </Badge>
                  </div>
                  <div className="space-y-2 mb-6 text-left max-w-sm mx-auto">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>完整八字命理分析报告</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>详细风水布局指导</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>个性化改运方案</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>12个月流年运势预测</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>无限次AI大师咨询</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>PDF报告下载</span>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      立即升级专业版
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => {
                        if (reportData) {
                          // 触发报告导出
                          const exportComponent =
                            document.getElementById('report-export');
                          if (exportComponent) {
                            exportComponent.click();
                          }
                        }
                      }}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      下载报告
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    ⚡ 限时优惠仅剩：
                    <span className="font-bold text-red-600">2小时34分</span>
                  </p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI聊天弹窗 */}
      <AIChatPopup
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        baziData={reportData?.baziAnalysis}
        fengshuiData={reportData?.fengshuiAnalysis}
      />

      {/* 报告导出组件（隐藏） */}
      {reportData && (
        <div className="hidden" id="report-export">
          <ReportExport
            data={reportData}
            onExport={(format) => {
              console.log(`Exporting report in ${format} format`);
              // 这里实现实际的导出逻辑
            }}
          />
        </div>
      )}

      {/* 升级弹窗 */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-lg w-full"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">升级到专业版</h2>
                <p className="text-gray-600">解锁全部功能，开启改运之旅</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="text-sm">终身使用，一次付费</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <span className="text-sm">30天无理由退款</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm">专属客服支持</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    // 处理支付逻辑
                    console.log('Processing payment...');
                  }}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  确认支付 ¥99
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                >
                  稍后决定
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                支持支付宝、微信支付
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部浮动栏（移动端） */}
      {showResults && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden z-30">
          <div className="flex gap-3">
            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={() => setShowUpgradeModal(true)}
            >
              <Crown className="w-4 h-4 mr-1" />
              升级VIP
            </Button>
            <Button variant="outline" onClick={() => setShowChat(true)}>
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // 分享功能
                if (navigator.share) {
                  navigator.share({
                    title: 'AI风水大师分析结果',
                    text: '我刚完成了风水分析，快来试试！',
                    url: window.location.href,
                  });
                }
              }}
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
