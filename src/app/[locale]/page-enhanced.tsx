'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Compass, 
  Star, 
  Home, 
  Sparkles, 
  Shield, 
  Heart,
  Target,
  Zap,
  Download,
  RefreshCw,
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  Unlock,
  ArrowDown,
  Gift,
  ChevronRight,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { GuestAnalysisPage } from '@/components/analysis/guest-analysis-page';
import { ComprehensiveScore } from '@/components/analysis/comprehensive-score';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function EnhancedHomePage() {
  const [currentStep, setCurrentStep] = useState<'form' | 'analyzing' | 'results'>('form');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [formData, setFormData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [analysisScore] = useState({
    bazi: 78,
    fengshui: 85,
    overall: 82,
    rating: 'good' as const
  });

  // 模拟分析过程
  const startAnalysis = () => {
    setCurrentStep('analyzing');
    setAnalysisProgress(0);
    
    // 进度条动画
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setCurrentStep('results');
            setShowResults(true);
            // 撒花效果
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  // 滚动到结果区域
  const scrollToResults = () => {
    document.getElementById('results-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      
      {/* 增强版 Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* 动态标题 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* 信任徽章 */}
            <div className="flex justify-center gap-4 mb-6">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                <Star className="w-4 h-4 mr-1" />
                已服务 50,000+ 用户
              </Badge>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                准确率 95%
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                隐私保护
              </Badge>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                30秒看透您的命运
              </span>
            </h1>
            
            <p className="text-2xl text-gray-700 dark:text-gray-300 mb-8">
              <span className="font-semibold">AI + 传统易学</span> 精准分析您的八字命理与家居风水
            </p>

            {/* 限时优惠提示 */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="inline-block"
            >
              <Card variant="gradient" className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span className="font-bold">限时优惠：</span>
                  <span>首次分析免费！原价 ¥99</span>
                  <span className="text-yellow-300 animate-pulse">仅剩 2 小时</span>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* 快速价值展示 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="glass" className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-bold">即时分析</h3>
                <p className="text-sm text-gray-600">30秒出结果</p>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="glass" className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold">精准度高</h3>
                <p className="text-sm text-gray-600">95%准确率</p>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="glass" className="p-4 text-center">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-bold">隐私安全</h3>
                <p className="text-sm text-gray-600">数据加密保护</p>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="glass" className="p-4 text-center">
                <Award className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <h3 className="font-bold">专家认证</h3>
                <p className="text-sm text-gray-600">易学大师推荐</p>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 主分析区域 - 单页漏斗 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* 步骤指示器 */}
        {currentStep === 'form' && (
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span className="font-semibold">填写信息</span>
              </div>
              <ChevronRight className="text-gray-400" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span>AI分析</span>
              </div>
              <ChevronRight className="text-gray-400" />
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span>查看结果</span>
              </div>
            </div>
          </div>
        )}

        {/* 表单区域 */}
        {currentStep === 'form' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="feng-shui" size="lg" className="relative overflow-visible">
              {/* 免费标签 */}
              <div className="absolute -top-4 -right-4 z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="bg-red-500 text-white px-6 py-2 rounded-full shadow-lg font-bold text-lg"
                >
                  免费分析
                </motion.div>
              </div>
              
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  立即开始您的命理分析
                </h2>
                
                {/* 简化的表单 */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">您的姓名</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                        placeholder="请输入真实姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">性别</label>
                      <select className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none">
                        <option value="">请选择</option>
                        <option value="male">男</option>
                        <option value="female">女</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">出生日期</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">出生时辰（可选）</label>
                      <input
                        type="time"
                        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">出生地点</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="如：北京市朝阳区"
                    />
                  </div>
                  
                  {/* CTA按钮 */}
                  <div className="text-center pt-4">
                    <Button
                      onClick={startAnalysis}
                      size="lg"
                      className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
                    >
                      <Sparkles className="mr-2" />
                      立即免费分析
                    </Button>
                    
                    <p className="mt-4 text-sm text-gray-600">
                      <Lock className="inline w-4 h-4 mr-1" />
                      您的信息将被严格保密，仅用于命理分析
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 分析中动画 */}
        {currentStep === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Card variant="elevated" className="max-w-2xl mx-auto p-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="w-24 h-24 mx-auto mb-6"
              >
                <Compass className="w-full h-full text-purple-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4">AI正在为您分析...</h2>
              <p className="text-gray-600 mb-8">
                融合传统易学智慧与现代AI技术，为您生成专属命理报告
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>分析八字命盘...</span>
                  <span className="text-purple-600 font-bold">{Math.min(analysisProgress * 1.5, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(analysisProgress * 1.5, 100)} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span>计算五行属性...</span>
                  <span className="text-blue-600 font-bold">{Math.min(analysisProgress * 1.2, 100).toFixed(0)}%</span>
                </div>
                <Progress value={Math.min(analysisProgress * 1.2, 100)} className="h-2" />
                
                <div className="flex items-center justify-between text-sm">
                  <span>生成个性化建议...</span>
                  <span className="text-green-600 font-bold">{analysisProgress}%</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
              </div>
              
              <div className="mt-8 text-sm text-gray-500">
                <p>正在分析的内容包括：</p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {['事业运势', '感情婚姻', '财运分析', '健康状况', '贵人运', '流年运程'].map((item, index) => (
                    <Badge key={index} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 结果展示区域 */}
        <AnimatePresence>
          {currentStep === 'results' && showResults && (
            <motion.div
              id="results-section"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* 综合评分 */}
              <ComprehensiveScore
                baziScore={analysisScore.bazi}
                fengshuiScore={analysisScore.fengshui}
                overallScore={analysisScore.overall}
                rating={analysisScore.rating}
                suggestions={[
                  '您的事业运势处于上升期，适合开展新项目',
                  '感情方面需要多加沟通，避免误解',
                  '健康状况良好，继续保持规律作息',
                  '财运有所起伏，建议稳健理财'
                ]}
              />

              {/* 详细分析内容（部分免费，部分锁定） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 免费内容 */}
                <Card variant="elevated" className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">基础命理分析</h3>
                    <Badge className="bg-green-500 text-white">免费</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>您的五行属性：木火平衡型</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>命格特征：聪慧果断，领导力强</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>幸运颜色：绿色、红色</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>幸运数字：3、8</span>
                    </div>
                  </div>
                </Card>

                {/* 付费内容预览 */}
                <Card variant="elevated" className="p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 to-transparent z-10 flex items-end justify-center pb-4">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      onClick={() => setShowPremiumPrompt(true)}
                    >
                      <Unlock className="mr-2" />
                      解锁完整报告
                    </Button>
                  </div>
                  
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">深度分析报告</h3>
                    <Badge className="bg-amber-500 text-white">
                      <Lock className="w-3 h-3 mr-1" />
                      高级
                    </Badge>
                  </div>
                  <div className="space-y-3 opacity-50 blur-[2px]">
                    <div>🔮 2024年详细运势预测</div>
                    <div>💰 财富增长机会分析</div>
                    <div>❤️ 感情姻缘深度解读</div>
                    <div>🏠 居家风水改善方案</div>
                    <div>⭐ 贵人方位与时机</div>
                    <div>📈 事业发展关键节点</div>
                  </div>
                </Card>
              </div>

              {/* 用户见证 */}
              <Card variant="gradient" className="p-8">
                <h3 className="text-2xl font-bold text-center mb-6">用户真实反馈</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { name: '张女士', age: 32, text: '分析非常准确，事业建议很有帮助！' },
                    { name: '李先生', age: 45, text: '风水调整后，生意明显好转了。' },
                    { name: '王小姐', age: 28, text: '感情分析让我找到了问题所在。' }
                  ].map((item, index) => (
                    <Card key={index} variant="glass" className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-8 h-8 text-gray-400" />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.age}岁</div>
                        </div>
                      </div>
                      <p className="text-sm italic">"{item.text}"</p>
                      <div className="mt-2">
                        {'⭐'.repeat(5)}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* 行动召唤 */}
              <div className="text-center py-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="inline-block"
                >
                  <Button
                    size="lg"
                    className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
                  >
                    <Download className="mr-2" />
                    下载完整分析报告
                  </Button>
                </motion.div>
                <p className="mt-4 text-gray-600">
                  限时优惠价 <span className="line-through">¥99</span>{' '}
                  <span className="text-2xl font-bold text-red-500">¥29</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}