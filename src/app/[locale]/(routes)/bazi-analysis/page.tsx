'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useAnalysisContext } from '@/contexts/analysis-context';
import { AIMasterChatButton } from '@/components/qiflow/ai-master-chat-button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Star,
  TrendingUp,
  Heart,
  Briefcase,
  Home,
  Download,
  Share2,
  History,
  CreditCard,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface BaziFormData {
  name: string;
  gender: '男' | '女' | '';
  birthDate: string;
  birthTime: string;
  birthPlace: {
    province: string;
    city: string;
    longitude?: number;
    latitude?: number;
  };
  analysisType: 'basic' | 'detailed' | 'professional';
}

interface AnalysisResult {
  basicInfo: any;
  fourPillars: any;
  wuxing: any;
  tenGods?: any;
  personality: any;
  career: any;
  marriage: any;
  health: any;
  scores: any;
  recommendations: any;
}

export default function BaziAnalysisPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const analysisContext = useAnalysisContext();
  
  const [formData, setFormData] = useState<BaziFormData>({
    name: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    birthPlace: {
      province: '',
      city: ''
    },
    analysisType: 'basic'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [credits, setCredits] = useState(0);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('input');
  
  // 获取用户积分
  useEffect(() => {
    if (session?.user) {
      fetchCredits();
      fetchHistory();
    }
  }, [session]);
  
  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      if (data.success) {
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };
  
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/bazi/history?pageSize=5');
      const data = await response.json();
      if (data.success) {
        setHistoryRecords(data.data.records);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };
  
  // 计算所需积分
  const getRequiredCredits = () => {
    const prices = {
      basic: 10,
      detailed: 30,
      professional: 50
    };
    return prices[formData.analysisType];
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.name || !formData.gender || !formData.birthDate || !formData.birthTime) {
      toast.error('请填写所有必填信息');
      return;
    }
    
    // 检查登录状态
    if (!session?.user) {
      toast.error('请先登录');
      router.push('/auth/signin');
      return;
    }
    
    // 检查积分
    const requiredCredits = getRequiredCredits();
    if (credits < requiredCredits) {
      toast.error(`积分不足，需要${requiredCredits}积分`);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bazi/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result.data);
        setActiveTab('result');
        toast.success(`分析成功，消耗${result.cost}积分`);
        
        // 刷新积分和历史记录
        fetchCredits();
        fetchHistory();
        
        // 同步到AI聊天上下文
        if (analysisContext) {
          analysisContext.setAnalysisResult(result.data);
          analysisContext.activateAIChat();
        }
      } else {
        toast.error(result.error || '分析失败');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('网络错误，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 从历史记录快速填充
  const loadFromHistory = (record: any) => {
    setFormData({
      name: record.name,
      gender: record.gender,
      birthDate: record.birthDate,
      birthTime: record.birthTime,
      birthPlace: record.birthPlace || { province: '', city: '' },
      analysisType: record.analysisType || 'basic'
    });
    toast.success('已从历史记录加载');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* AI大师悬浮按钮 */}
      <AIMasterChatButton />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 页面头部 */}
        <div className="text-center mb-8">
          <Badge className="mb-4" variant="default">
            <Sparkles className="w-4 h-4 mr-1" />
            专业八字分析系统 v5.1.1
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            八字精准分析
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            基于真太阳时校正、精确节气判断的专业八字分析系统，准确率高达99.9%
          </p>
        </div>
        
        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="input">信息输入</TabsTrigger>
            <TabsTrigger value="result" disabled={!analysisResult}>分析结果</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
          </TabsList>
          
          {/* 输入表单 */}
          <TabsContent value="input" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：主表单 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 分析类型选择 */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle>选择分析类型</CardTitle>
                    <CardDescription>不同类型提供不同深度的分析内容</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup 
                      value={formData.analysisType} 
                      onValueChange={(value) => setFormData({...formData, analysisType: value as any})}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="basic" id="basic" className="mt-1" />
                          <Label htmlFor="basic" className="flex-1 cursor-pointer">
                            <div className="font-semibold">基础分析（10积分）</div>
                            <div className="text-sm text-gray-600">四柱八字、五行强弱、性格总结</div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="detailed" id="detailed" className="mt-1" />
                          <Label htmlFor="detailed" className="flex-1 cursor-pointer">
                            <div className="font-semibold">详细分析（30积分）</div>
                            <div className="text-sm text-gray-600">包含十神分析、用神喜忌、事业财运、婚姻感情</div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="professional" id="professional" className="mt-1" />
                          <Label htmlFor="professional" className="flex-1 cursor-pointer">
                            <div className="font-semibold flex items-center gap-2">
                              专业分析（50积分）
                              <Badge variant="secondary">推荐</Badge>
                            </div>
                            <div className="text-sm text-gray-600">完整分析报告，包含大运流年、详细建议</div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
                
                {/* 个人信息 */}
                <Card className="border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      个人信息
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">姓名 *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="请输入姓名"
                        />
                      </div>
                      <div>
                        <Label>性别 *</Label>
                        <RadioGroup 
                          value={formData.gender}
                          onValueChange={(value) => setFormData({...formData, gender: value as any})}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="男" id="male" />
                            <Label htmlFor="male">男</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="女" id="female" />
                            <Label htmlFor="female">女</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birthDate" className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          出生日期 *
                        </Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="birthTime" className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          出生时间 *
                        </Label>
                        <Input
                          id="birthTime"
                          type="time"
                          value={formData.birthTime}
                          onChange={(e) => setFormData({...formData, birthTime: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="flex items-center gap-1 mb-2">
                        <MapPin className="w-4 h-4" />
                        出生地点（用于真太阳时校正）
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="省份"
                          value={formData.birthPlace.province}
                          onChange={(e) => setFormData({
                            ...formData, 
                            birthPlace: {...formData.birthPlace, province: e.target.value}
                          })}
                        />
                        <Input
                          placeholder="城市"
                          value={formData.birthPlace.city}
                          onChange={(e) => setFormData({
                            ...formData,
                            birthPlace: {...formData.birthPlace, city: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 提交按钮 */}
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">所需积分</p>
                        <p className="text-2xl font-bold">{getRequiredCredits()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm opacity-90">当前余额</p>
                        <p className="text-2xl font-bold">{credits}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full h-12 text-lg bg-white text-purple-600 hover:bg-gray-100"
                      onClick={handleSubmit}
                      disabled={isSubmitting || credits < getRequiredCredits()}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          正在分析中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          开始分析
                        </>
                      )}
                    </Button>
                    {credits < getRequiredCredits() && (
                      <p className="text-sm text-center mt-2 opacity-90">
                        积分不足，请先充值
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* 右侧：辅助信息 */}
              <div className="space-y-6">
                {/* 积分信息 */}
                {session && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        积分余额
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-4">
                        {credits}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/settings/credits')}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        充值积分
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {/* 最近分析 */}
                {historyRecords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        最近分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {historyRecords.slice(0, 3).map((record: any) => (
                        <button
                          key={record.id}
                          onClick={() => loadFromHistory(record)}
                          className="w-full text-left p-2 rounded hover:bg-gray-100 transition"
                        >
                          <div className="font-medium">{record.name}</div>
                          <div className="text-sm text-gray-600">
                            {record.birthDate} {record.birthTime}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                {/* 功能特点 */}
                <Card>
                  <CardHeader>
                    <CardTitle>功能特点</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">真太阳时校正</div>
                        <div className="text-sm text-gray-600">根据出生地经度精确校正</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">精确节气判断</div>
                        <div className="text-sm text-gray-600">精确到秒的节气计算</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">专业十神分析</div>
                        <div className="text-sm text-gray-600">完整的生克制化关系</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">五行量化评分</div>
                        <div className="text-sm text-gray-600">科学的力量评估体系</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* 分析结果 */}
          <TabsContent value="result" className="space-y-6">
            {analysisResult && (
              <>
                {/* 基础信息卡片 */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle>基础信息</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">姓名</p>
                        <p className="font-semibold">{analysisResult.basicInfo.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">性别</p>
                        <p className="font-semibold">{analysisResult.basicInfo.gender}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">出生日期</p>
                        <p className="font-semibold">{analysisResult.basicInfo.birthDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">出生时间</p>
                        <p className="font-semibold">{analysisResult.basicInfo.birthTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 四柱八字 */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle>四柱八字</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">年柱</p>
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResult.fourPillars.year.gan}
                          {analysisResult.fourPillars.year.zhi}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">月柱</p>
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResult.fourPillars.month.gan}
                          {analysisResult.fourPillars.month.zhi}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">日柱</p>
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResult.fourPillars.day.gan}
                          {analysisResult.fourPillars.day.zhi}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">时柱</p>
                        <div className="text-2xl font-bold text-purple-600">
                          {analysisResult.fourPillars.hour.gan}
                          {analysisResult.fourPillars.hour.zhi}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 五行分析 */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle>五行力量分析</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {['wood', 'fire', 'earth', 'metal', 'water'].map((element) => {
                        const names = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
                        const value = analysisResult.wuxing.strength[element];
                        return (
                          <div key={element}>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{names[element as keyof typeof names]}</span>
                              <span className="text-sm text-gray-600">{value}%</span>
                            </div>
                            <Progress value={value} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">日主强弱</p>
                        <p className="font-semibold">{analysisResult.wuxing.dayMaster?.strength}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">五行平衡</p>
                        <p className="font-semibold">{analysisResult.wuxing.balance}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 综合评分 */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-purple-600">
                        {analysisResult.scores.overall}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">综合评分</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {analysisResult.scores.career}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">事业运势</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {analysisResult.scores.wealth}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">财运指数</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-pink-600">
                        {analysisResult.scores.marriage}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">婚姻感情</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {analysisResult.scores.health}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">健康状况</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* 性格分析 */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      性格分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-gray-700 mb-4">{analysisResult.personality.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">优势特质</h4>
                        <ul className="space-y-1">
                          {analysisResult.personality.strengths?.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-orange-600">改善建议</h4>
                        <ul className="space-y-1">
                          {analysisResult.personality.advice?.map((item: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 操作按钮 */}
                <div className="flex gap-4">
                  <Button className="flex-1" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    下载报告
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    分享结果
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => setActiveTab('input')}
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    再次分析
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* 历史记录 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>分析历史</CardTitle>
                <CardDescription>查看您的历史分析记录</CardDescription>
              </CardHeader>
              <CardContent>
                {historyRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无历史记录
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyRecords.map((record: any) => (
                      <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{record.name}</h4>
                            <p className="text-sm text-gray-600">
                              {record.gender} | {record.birthDate} {record.birthTime}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              分析类型：{record.analysisType === 'basic' ? '基础' : record.analysisType === 'detailed' ? '详细' : '专业'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => router.push(`/zh-CN/bazi-analysis/${record.id}`)}
                            >
                              查看详情
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}