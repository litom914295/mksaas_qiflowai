'use client';

import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import MaintenancePage from './maintenance';
import { AIMasterChatButton } from '@/components/qiflow/ai-master-chat-button';
import { CityLocationPicker } from '@/components/qiflow/city-location-picker';
import { HistoryQuickFill } from '@/components/qiflow/history-quick-fill';
import { HouseLayoutUpload } from '@/components/qiflow/house-layout-upload';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnonymousTrial } from '@/hooks/use-anonymous-trial';
import { authClient } from '@/lib/auth-client';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  Compass,
  Gift,
  History,
  Home,
  MapPin,
  Sparkles,
  Star,
  Upload,
  User,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAnalysisContext } from '@/contexts/analysis-context';

type CalendarType = 'solar' | 'lunar';

interface PersonalInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female' | '';
  birthCity: string;
  calendarType: CalendarType;
}

interface HouseInfo {
  direction: string;
  roomCount: string;
  layoutImage: string | null;
  standardLayout: string;
}

interface FormData {
  personal: PersonalInfo;
  house: HouseInfo;
}

const testimonials = [
  { name: '张女士', rating: 5, text: '非常准确！帮我调整了财位，真的有改善。' },
  { name: '李先生', rating: 5, text: 'AI大师很专业，解答了我很多疑问。' },
  { name: '王女士', rating: 5, text: '报告详细，操作简单，值得推荐！' },
];

export default function UnifiedFormPage() {
  // 维护模式开关 - 设置为true启用维护模式
  const MAINTENANCE_MODE = true;
  // 新系统重定向开关
  const REDIRECT_TO_NEW_SYSTEM = true;
  
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const analysisContext = useAnalysisContext();

  const [formData, setFormData] = useState<FormData>({
    personal: {
      name: '',
      birthDate: '',
      birthTime: '',
      gender: 'female', // 默认选择女性
      birthCity: '',
      calendarType: 'solar',
    },
    house: {
      direction: '',
      roomCount: '',
      layoutImage: null,
      standardLayout: '',
    },
  });

  const [showHouseInfo, setShowHouseInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 新增：积分和引擎相关状态
  const [engineUsed, setEngineUsed] = useState<'local' | 'unified'>('local');
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [showCreditPrompt, setShowCreditPrompt] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [creditsAvailable, setCreditsAvailable] = useState(0);

  // 匿名试用Hook
  const baziTrial = useAnonymousTrial('bazi');
  const completeTrial = useAnonymousTrial('complete');

  // 客户端状态管理（避免 hydration 错误）
  const [baziTrialsRemaining, setBaziTrialsRemaining] = useState<number | null>(
    null
  );
  const [completeTrialsRemaining, setCompleteTrialsRemaining] = useState<
    number | null
  >(null);
  const [isMounted, setIsMounted] = useState(false);

  // 挂载后读取试用次数
  useEffect(() => {
    setIsMounted(true);
    setBaziTrialsRemaining(baziTrial.remainingTrials());
    setCompleteTrialsRemaining(completeTrial.remainingTrials());
  }, []);

  // 计算填写进度
  useEffect(() => {
    const personalFields = Object.values(formData.personal).filter(
      (v) => v !== ''
    ).length;
    const totalPersonalFields = 6; // 个人信息字段数
    const houseFields = showHouseInfo
      ? Object.values(formData.house).filter((v) => v !== '' && v !== null)
          .length
      : 0;
    const totalHouseFields = 4; // 房屋信息字段数

    const completedFields = personalFields + houseFields;
    const totalFields =
      totalPersonalFields + (showHouseInfo ? totalHouseFields : 0);
    const newProgress = Math.round((completedFields / totalFields) * 100);
    setProgress(newProgress);
  }, [formData, showHouseInfo]);

  // 用户评价轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 获取用户积分余额
  useEffect(() => {
    if (session?.user && !isPending) {
      getCreditBalanceAction().then((result) => {
        if (result?.data?.success && result.data.credits !== undefined) {
          setCreditsAvailable(result.data.credits);
        }
      });
    }
  }, [session, isPending]);

  // 计算所需积分
  useEffect(() => {
    const hasHouseInfo =
      showHouseInfo && formData.house.direction && formData.house.roomCount;
    setCreditsRequired(hasHouseInfo ? 30 : 10);
  }, [showHouseInfo, formData.house.direction, formData.house.roomCount]);

  // 快速填充历史数据
  const handleQuickFill = (data: FormData) => {
    setFormData(data);
    if (data.house.direction || data.house.roomCount) {
      setShowHouseInfo(true);
    }
  };

  // 处理个人信息变化
  const handlePersonalChange = (field: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  // 处理房屋信息变化
  const handleHouseChange = (field: keyof HouseInfo, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        [field]: value,
      },
    }));
  };

  // 提交表单 - 重构版本
  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('='.repeat(50));
    console.log('🚀 [积分系统] 开始提交分析');

    // 1. 验证必填项
    if (
      !formData.personal.name ||
      !formData.personal.birthDate ||
      !formData.personal.birthTime ||
      !formData.personal.gender
    ) {
      alert('请填写所有必填的个人信息');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. 判断分析类型
      const hasHouseInfo =
        showHouseInfo && formData.house.direction && formData.house.roomCount;
      const analysisType = hasHouseInfo ? 'complete' : 'bazi';
      const requiredCredits = hasHouseInfo ? 30 : 10;
      const isLoggedIn = session?.user && !isPending;

      console.log('📊 分析类型:', analysisType);
      console.log('💰 需要积分:', requiredCredits);
      console.log('🔑 登录状态:', isLoggedIn);

      // 3. 匿名用户检查试用次数
      if (!isLoggedIn) {
        const trial = analysisType === 'bazi' ? baziTrial : completeTrial;

        if (!trial.canTrial()) {
          console.log('⚠️ 试用次数用尽');
          setShowSignupPrompt(true);
          setIsSubmitting(false);
          return;
        }

        console.log('✅ 匿名试用，剩余次数:', trial.remainingTrials());
        // 使用本地引擎
        await analyzeWithLocalEngine(formData, analysisType);
        trial.incrementTrial();
        // 更新显示的试用次数
        if (analysisType === 'bazi') {
          setBaziTrialsRemaining(baziTrial.remainingTrials());
        } else {
          setCompleteTrialsRemaining(completeTrial.remainingTrials());
        }
        return;
      }

      // 4. 登录用户检查积分
      const canUseUnified = creditsAvailable >= requiredCredits;

      if (!canUseUnified) {
        console.log('⚠️ 积分不足，显示提示');
        setShowCreditPrompt(true);
        setIsSubmitting(false);
        return;
      }

      // 5. 调用统一引擎 API
      console.log('✨ 使用统一引擎，开始分析...');
      await analyzeWithUnifiedEngine(formData, analysisType);
    } catch (error) {
      console.error('❌ 分析失败:', error);
      alert('分析失败，请再试一次');
      setIsSubmitting(false);
    }
  };

  // 本地引擎分析（匿名用户或积分不足时使用）
  const analyzeWithLocalEngine = async (
    data: FormData,
    type: 'bazi' | 'complete'
  ) => {
    console.log('📱 使用本地引擎分析...');
    setEngineUsed('local');

    // 同步用户输入到 AnalysisContext
    if (analysisContext) {
      console.log('🔄 同步用户输入到 AI 聊天上下文...');
      
      // 解析出生日期和时间
      const birthDate = new Date(data.personal.birthDate);
      const [birthHourStr] = data.personal.birthTime.split(':');
      const birthHour = parseInt(birthHourStr, 10);

      // 解析房屋朝向（如果有）
      const houseFacing = type === 'complete' ? parseInt(data.house.direction, 10) || 180 : 180;
      const buildYear = new Date().getFullYear(); // 默认当前年份

      analysisContext.setUserInput({
        personal: {
          birthYear: birthDate.getFullYear(),
          birthMonth: birthDate.getMonth() + 1,
          birthDay: birthDate.getDate(),
          birthHour: isNaN(birthHour) ? undefined : birthHour,
          gender: data.personal.gender as 'male' | 'female',
        },
        house: {
          facing: houseFacing,
          buildYear: buildYear,
        },
      });

      // 激活AI聊天上下文
      analysisContext.activateAIChat();
      console.log('✅ AI 聊天上下文已激活');
    }

    // 保存到历史记录
    try {
      const existingHistory = localStorage.getItem('formHistory') || '[]';
      const history = JSON.parse(existingHistory);
      const newEntry = { ...data, timestamp: Date.now() };
      history.unshift(newEntry);
      localStorage.setItem('formHistory', JSON.stringify(history.slice(0, 5)));
    } catch (e) {
      console.error('保存历史失败:', e);
    }

    // 模拟本地分析过程
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 跳转到报告页面，标记为本地引擎
    const dataParam = encodeURIComponent(
      JSON.stringify({ ...data, engineUsed: 'local' })
    );
    window.location.href = `/zh-CN/report?data=${dataParam}`;
  };

  // 统一引擎分析（登录用户且积分充足）
  const analyzeWithUnifiedEngine = async (
    data: FormData,
    type: 'bazi' | 'complete'
  ) => {
    console.log('✨ 使用统一引擎API分析...');

    try {
      const endpoint =
        type === 'bazi'
          ? '/api/qiflow/bazi-unified'
          : '/api/qiflow/complete-unified';
      const requestBody =
        type === 'bazi'
          ? data.personal
          : { personal: data.personal, house: data.house };

      console.log('📞 调用API:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        // API失败，降级到本地引擎
        console.warn('⚠️ 统一引擎失败，降级到本地引擎');
        await analyzeWithLocalEngine(data, type);
        return;
      }

      if (result.needsLogin) {
        alert('请先登录');
        setIsSubmitting(false);
        return;
      }

      if (result.needsCredits) {
        setShowCreditPrompt(true);
        setIsSubmitting(false);
        return;
      }

      // 成功！
      console.log('✅ 分析完成，消耗', result.data.creditsUsed, '积分');
      setEngineUsed('unified');

      // 同步用户输入和分析结果到 AnalysisContext
      if (analysisContext) {
        console.log('🔄 同步完整分析数据到 AI 聊天上下文...');
        
        // 解析出生日期和时间
        const birthDate = new Date(data.personal.birthDate);
        const [birthHourStr] = data.personal.birthTime.split(':');
        const birthHour = parseInt(birthHourStr, 10);

        // 解析房屋朝向（如果有）
        const houseFacing = type === 'complete' ? parseInt(data.house.direction, 10) || 180 : 180;
        const buildYear = new Date().getFullYear(); // 默认当前年份

        // 设置用户输入
        analysisContext.setUserInput({
          personal: {
            birthYear: birthDate.getFullYear(),
            birthMonth: birthDate.getMonth() + 1,
            birthDay: birthDate.getDate(),
            birthHour: isNaN(birthHour) ? undefined : birthHour,
            gender: data.personal.gender as 'male' | 'female',
          },
          house: {
            facing: houseFacing,
            buildYear: buildYear,
          },
        });

        // 设置分析结果
        analysisContext.setAnalysisResult(result.data);

        // 激活AI聊天
        analysisContext.activateAIChat();
        
        console.log('✅ 完整分析数据已同步到 AI 聊天上下文');
        console.log('📊 用户输入:', analysisContext.userInput);
        console.log('📋 分析结果摘要:', result.data.summary || '(无摘要)');
      }

      // 保存到历史记录
      try {
        const existingHistory = localStorage.getItem('formHistory') || '[]';
        const history = JSON.parse(existingHistory);
        const newEntry = { ...data, timestamp: Date.now() };
        history.unshift(newEntry);
        localStorage.setItem(
          'formHistory',
          JSON.stringify(history.slice(0, 5))
        );
      } catch (e) {
        console.error('保存历史失败:', e);
      }

      // 跳转到报告页面
      const reportData = {
        ...data,
        engineUsed: 'unified',
        creditsUsed: result.data.creditsUsed,
        analysisResult: result.data,
      };
      const dataParam = encodeURIComponent(JSON.stringify(reportData));
      window.location.href = `/zh-CN/report?data=${dataParam}`;
    } catch (error) {
      console.error('❌ API调用失败:', error);
      // 降级到本地引擎
      await analyzeWithLocalEngine(data, type);
    }
  };

  // 如果启用重定向到新系统
  if (REDIRECT_TO_NEW_SYSTEM) {
    useEffect(() => {
      router.push('/zh-CN/bazi-analysis');
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">正在跳转到新版系统</h3>
            <p className="text-gray-600">请稍候...</p>
            <div className="mt-4">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // 如果处于维护模式，显示维护页面
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }
  
  // 检查是否可以提交
  const canSubmit =
    formData.personal.name &&
    formData.personal.birthDate &&
    formData.personal.birthTime &&
    formData.personal.gender;

  // 调试日志
  useEffect(() => {
    console.log('🔍 canSubmit:', canSubmit);
    console.log('📝 Personal data:', {
      name: formData.personal.name,
      birthDate: formData.personal.birthDate,
      birthTime: formData.personal.birthTime,
      gender: formData.personal.gender,
    });
  }, [canSubmit, formData.personal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* AI大师悬浮按钮 */}
      <AIMasterChatButton />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI智能风水分析</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            气流AI - 一站式八字风水分析
          </h1>
          <p className="text-gray-600">
            填写基本信息，立即获取专业的八字命理和风水布局建议
          </p>
        </div>

        {/* 进度条 */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                填写进度
              </span>
              <span className="text-sm font-bold text-purple-600">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>个人信息</span>
              <span>房屋信息（可选）</span>
              <span>完成</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主表单区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 登录用户：分析模式卡片 */}
            {session && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">智能分析引擎</h3>
                        <p className="text-sm text-gray-600">
                          {creditsAvailable >= creditsRequired
                            ? `将使用统一引擎进行深度分析（消耗${creditsRequired}积分）`
                            : '积分不足，将使用基础本地引擎'}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        creditsAvailable >= creditsRequired
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {creditsAvailable >= creditsRequired
                        ? '✨ 深度分析'
                        : '📱 基础分析'}
                    </Badge>
                  </div>
                  {creditsAvailable < creditsRequired && (
                    <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-gray-600">
                      当前余额：<strong>{creditsAvailable}</strong> 积分 |
                      所需：
                      <strong className="text-red-600">
                        {creditsRequired}
                      </strong>{' '}
                      积分
                      <Button
                        variant="link"
                        className="ml-2 p-0 h-auto text-blue-600"
                        onClick={() => router.push('/settings/credits')}
                      >
                        立即充值 →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 匿名用户：试用提示 */}
            {!session && isMounted && (
              <Alert className="border-purple-200 bg-purple-50">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <AlertTitle>免费试用</AlertTitle>
                <AlertDescription>
                  您还有{' '}
                  <strong className="text-purple-600">
                    {baziTrialsRemaining ?? 0}
                  </strong>{' '}
                  次八字分析试用，
                  <strong className="text-purple-600">
                    {completeTrialsRemaining ?? 0}
                  </strong>{' '}
                  次完整分析试用。
                  <Button
                    variant="link"
                    className="ml-2 p-0 h-auto text-purple-600"
                    onClick={() => router.push('/auth/signin')}
                  >
                    注册获取100积分新手礼包 →
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* 历史快速填充 */}
            <HistoryQuickFill onQuickFill={handleQuickFill} />

            {/* 个人信息 */}
            <Card className="shadow-lg border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <CardTitle>个人资料</CardTitle>
                  </div>
                  <Badge variant="destructive">必填</Badge>
                </div>
                <CardDescription>
                  请准确填写您的出生信息，这是八字分析的基础
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* 姓名 */}
                <div>
                  <Label htmlFor="name" className="flex items-center gap-1">
                    姓名 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="请输入您的姓名"
                    value={formData.personal.name}
                    onChange={(e) =>
                      handlePersonalChange('name', e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                {/* 性别 */}
                <div>
                  <Label className="flex items-center gap-1 mb-2">
                    性别 <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.personal.gender}
                    onValueChange={(value) =>
                      handlePersonalChange('gender', value)
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">
                        男
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">
                        女
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* 历法类型 */}
                <div>
                  <Label className="mb-2 block">历法类型</Label>
                  <Tabs
                    value={formData.personal.calendarType}
                    onValueChange={(value) =>
                      handlePersonalChange(
                        'calendarType',
                        value as CalendarType
                      )
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="solar">阳历</TabsTrigger>
                      <TabsTrigger value="lunar">阴历</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* 出生日期 */}
                <div>
                  <Label
                    htmlFor="birthDate"
                    className="flex items-center gap-1"
                  >
                    出生日期 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.personal.birthDate}
                    onChange={(e) =>
                      handlePersonalChange('birthDate', e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                {/* 出生时间 */}
                <div>
                  <Label
                    htmlFor="birthTime"
                    className="flex items-center gap-1"
                  >
                    出生时间 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birthTime"
                    type="time"
                    value={formData.personal.birthTime}
                    onChange={(e) =>
                      handlePersonalChange('birthTime', e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                {/* 出生城市 */}
                <div>
                  <Label
                    htmlFor="birthCity"
                    className="flex items-center gap-1"
                  >
                    出生城市{' '}
                    <span className="text-gray-400 text-xs">(可选)</span>
                  </Label>
                  <CityLocationPicker
                    value={formData.personal.birthCity}
                    onChange={(city) => handlePersonalChange('birthCity', city)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 房屋信息（可折叠） */}
            <Card className="shadow-lg border-2 border-blue-100">
              <CardHeader
                className="bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer"
                onClick={() => setShowHouseInfo(!showHouseInfo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    <CardTitle>房屋风水信息</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">可选</Badge>
                    {showHouseInfo ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
                <CardDescription>
                  {showHouseInfo
                    ? '点击收起房屋信息'
                    : '点击展开，获取更精准的风水布局建议'}
                </CardDescription>
              </CardHeader>

              {showHouseInfo && (
                <CardContent className="pt-6 space-y-4">
                  {/* 房屋朝向 */}
                  <div>
                    <Label
                      htmlFor="direction"
                      className="flex items-center gap-2"
                    >
                      <Compass className="w-4 h-4" />
                      房屋朝向
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="direction"
                        type="number"
                        placeholder="输入度数（0-360）"
                        value={formData.house.direction}
                        onChange={(e) =>
                          handleHouseChange('direction', e.target.value)
                        }
                        min="0"
                        max="360"
                      />
                      <Button variant="outline" className="whitespace-nowrap">
                        <Compass className="w-4 h-4 mr-2" />
                        罗盘定位
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      提示：使用罗盘定位可获得更精确的方向
                    </p>
                  </div>

                  {/* 房间数 */}
                  <div>
                    <Label htmlFor="roomCount">房间数量</Label>
                    <Select
                      value={formData.house.roomCount}
                      onValueChange={(value) =>
                        handleHouseChange('roomCount', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择房间数量" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">一室</SelectItem>
                        <SelectItem value="2">二室</SelectItem>
                        <SelectItem value="3">三室</SelectItem>
                        <SelectItem value="4">四室</SelectItem>
                        <SelectItem value="5+">五室及以上</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 标准户型 */}
                  <div>
                    <Label htmlFor="standardLayout">标准户型（可选）</Label>
                    <Select
                      value={formData.house.standardLayout}
                      onValueChange={(value) =>
                        handleHouseChange('standardLayout', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择标准户型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type1">南北通透</SelectItem>
                        <SelectItem value="type2">全朝南</SelectItem>
                        <SelectItem value="type3">东西朝向</SelectItem>
                        <SelectItem value="type4">复式结构</SelectItem>
                        <SelectItem value="custom">自定义上传</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 平面图上传 */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      房屋平面图（可选）
                    </Label>
                    <HouseLayoutUpload
                      value={formData.house.layoutImage}
                      onChange={(image) =>
                        handleHouseChange('layoutImage', image)
                      }
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 提交按钮 */}
            <Card className="shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="w-full h-14 text-lg font-bold bg-white text-purple-600 hover:bg-gray-100"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                      正在分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      立即生成专属分析报告
                    </>
                  )}
                </Button>
                {!canSubmit && (
                  <p className="text-center text-sm mt-3 text-white/80">
                    请先填写所有必填的个人信息
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 功能亮点 */}
            <Card className="shadow-lg border-2 border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  功能亮点
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>精准八字四柱分析</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>九宫飞星风水布局</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>AI大师24/7在线答疑</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>个性化开运建议</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>专业报告导出分享</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 用户评价 */}
            <Card className="shadow-lg border-2 border-yellow-100">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  用户好评
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-500 fill-yellow-500"
                        />
                      )
                    )}
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    "{testimonials[currentTestimonial].text}"
                  </p>
                  <p className="text-xs text-gray-500">
                    — {testimonials[currentTestimonial].name}
                  </p>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  {testimonials.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentTestimonial
                          ? 'bg-yellow-500 w-6'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 安全提示 */}
            <Card className="shadow-lg border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-medium">🔒 隐私保护承诺</p>
                  <p>
                    您的个人信息将被严格加密保存，仅用于生成分析报告，不会用于其他用途。
                  </p>
                  <p className="font-medium mt-3">⚠️ 免责声明</p>
                  <p>
                    本服务提供的分析结果仅供参考，不构成任何决策建议。请理性看待。
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 试用用尽提示对话框 */}
      <Dialog open={showSignupPrompt} onOpenChange={setShowSignupPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              免费试用已用完
            </DialogTitle>
            <DialogDescription>
              您已使用完3次免费试用。注册账号即可获得100积分新手礼包，
              足够进行10次八字分析或3次完整分析！
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">注册即享：</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  100积分新手礼包
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  保存分析历史记录
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  个性化推荐建议
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  AI大师24/7在线答疑
                </li>
              </ul>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push('/auth/signin')}
            >
              立即注册领取礼包
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 积分不足提示对话框 */}
      <Dialog open={showCreditPrompt} onOpenChange={setShowCreditPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-600" />
              积分不足
            </DialogTitle>
            <DialogDescription>
              {creditsRequired === 10
                ? '八字分析需要10积分，您当前余额不足。'
                : '完整分析需要30积分，您当前余额不足。'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">当前余额</span>
              <span className="text-2xl font-bold">{creditsAvailable}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-600">所需积分</span>
              <span className="text-2xl font-bold text-red-600">
                {creditsRequired}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreditPrompt(false);
                  // 使用本地引擎继续
                  const hasHouseInfo =
                    showHouseInfo &&
                    formData.house.direction &&
                    formData.house.roomCount;
                  const type = hasHouseInfo ? 'complete' : 'bazi';
                  analyzeWithLocalEngine(formData, type);
                }}
              >
                使用基础引擎
              </Button>
              <Button onClick={() => router.push('/settings/credits')}>
                <Zap className="w-4 h-4 mr-2" />
                充值积分
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
