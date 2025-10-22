'use client';

import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
import { HistoryQuickFill } from '@/components/qiflow/history-quick-fill';
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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisContext } from '@/contexts/analysis-context';
import { useCreditBalance } from '@/hooks/use-credits';
import { creditsKeys } from '@/hooks/use-credits';
import { authClient } from '@/lib/auth-client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Heart,
  History,
  Home,
  Loader2,
  MapPin,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { AnalysisResult, BaziFormData as BaziFormDataType } from '@/types/bazi-analysis';

// 扩展表单类型以匹配当前使用
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

export default function BaziAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();
  const analysisContext = useAnalysisContext();
  const queryClient = useQueryClient();

  // 🔥 关键修复：使用 TanStack Query hook 获取实时积分余额
  const {
    data: credits = 0,
    isLoading: isLoadingCredits,
    refetch: refetchCredits,
  } = useCreditBalance();

  const [formData, setFormData] = useState<BaziFormData>({
    name: '',
    gender: '',
    birthDate: '',
    birthTime: '',
    birthPlace: {
      province: '',
      city: '',
    },
    analysisType: 'basic',
  });

  // 🔥 从 URL 参数、sessionStorage 或 localStorage 读取表单数据
  useEffect(() => {
    console.log('🔍 尝试加载表单数据...');

    // 1. 从 URL 参数读取
    const urlData = searchParams.get('data');
    if (urlData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(urlData));
        console.log('✅ 从 URL 加载数据:', decoded);

        setFormData({
          name: decoded.personal?.name || decoded.name || '',
          gender:
            decoded.personal?.gender === 'male'
              ? '男'
              : decoded.personal?.gender === 'female'
                ? '女'
                : decoded.gender || '',
          birthDate: decoded.personal?.birthDate || decoded.birthDate || '',
          birthTime: decoded.personal?.birthTime || decoded.birthTime || '',
          birthPlace: {
            province: decoded.personal?.birthCity?.split(' ')[0] || '',
            city: decoded.personal?.birthCity || decoded.birthPlace?.city || '',
          },
          analysisType: 'basic',
        });
        return;
      } catch (e) {
        console.warn('⚠️ URL数据解析失败:', e);
      }
    }

    // 2. 🔥 从 sessionStorage 读取 (HeroWithForm 保存的数据)
    try {
      const sessionData = sessionStorage.getItem('analysisFormData');
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        console.log('✅ 从 sessionStorage 加载数据:', parsed);

        setFormData({
          name: parsed.personal?.name || '',
          gender:
            parsed.personal?.gender === 'male'
              ? '男'
              : parsed.personal?.gender === 'female'
                ? '女'
                : parsed.personal?.gender || '',
          birthDate: parsed.personal?.birthDate || '',
          birthTime: parsed.personal?.birthTime || '',
          birthPlace: {
            province: parsed.personal?.birthCity?.split(' ')[0] || '',
            city: parsed.personal?.birthCity || '',
          },
          analysisType: 'basic',
        });

        // 🔥 清理 sessionStorage，避免数据污染
        sessionStorage.removeItem('analysisFormData');
        return;
      }
    } catch (e) {
      console.warn('⚠️ sessionStorage数据解析失败:', e);
    }

    // 3. 从 localStorage 读取最近的表单数据
    try {
      // 🔥 修复：从 formHistory 读取最新的记录
      const formHistory = localStorage.getItem('formHistory');
      if (formHistory) {
        const history = JSON.parse(formHistory);
        if (history.length > 0) {
          const latestRecord = history[0]; // 最新的记录
          console.log('✅ 从 formHistory 加载数据:', latestRecord);

          setFormData({
            name: latestRecord.personal?.name || '',
            gender:
              latestRecord.personal?.gender === 'male'
                ? '男'
                : latestRecord.personal?.gender === 'female'
                  ? '女'
                  : '',
            birthDate: latestRecord.personal?.birthDate || '',
            birthTime: latestRecord.personal?.birthTime || '',
            birthPlace: {
              province: latestRecord.personal?.birthCity?.split(' ')[0] || '',
              city: latestRecord.personal?.birthCity || '',
            },
            analysisType: 'basic',
          });
          return;
        }
      }

      // 备用：尝试从 lastBaziForm 读取
      const lastBaziForm = localStorage.getItem('lastBaziForm');
      if (lastBaziForm) {
        const parsed = JSON.parse(lastBaziForm);
        console.log('✅ 从 lastBaziForm 加载数据:', parsed);
        setFormData(parsed);
        return;
      }
    } catch (e) {
      console.warn('⚠️ localStorage数据解析失败:', e);
    }

    // 4. 从 analysisContext 读取
    if (analysisContext?.userInput?.personal) {
      const { personal } = analysisContext.userInput;
      console.log('✅ 从 analysisContext 加载数据:', personal);

      setFormData((prev) => ({
        ...prev,
        name: personal.name || prev.name,
        gender:
          personal.gender === 'male'
            ? '男'
            : personal.gender === 'female'
              ? '女'
              : prev.gender,
        birthDate: personal.birthDate || prev.birthDate,
        birthTime: personal.birthTime || prev.birthTime,
      }));
    }
  }, [searchParams, analysisContext]);

  // 🔥 保存表单数据到 localStorage
  useEffect(() => {
    // 只有当表单有数据时才保存
    if (
      formData.name &&
      formData.birthDate &&
      formData.birthTime &&
      formData.gender
    ) {
      try {
        // 保存到 formHistory （与首页一致）
        const record = {
          personal: {
            name: formData.name,
            birthDate: formData.birthDate,
            birthTime: formData.birthTime,
            gender: formData.gender === '男' ? 'male' : 'female',
            birthCity: formData.birthPlace.city || '',
            calendarType: 'solar' as const,
          },
          house: {
            direction: '',
            roomCount: '',
            layoutImage: null,
            standardLayout: '',
          },
          timestamp: Date.now(),
        };

        const existingHistory = localStorage.getItem('formHistory');
        const history = existingHistory ? JSON.parse(existingHistory) : [];

        // 检查是否已存在相同的记录（避免重复）
        const isDuplicate = history.some(
          (item: any) =>
            item.personal?.name === record.personal.name &&
            item.personal?.birthDate === record.personal.birthDate &&
            item.personal?.birthTime === record.personal.birthTime
        );

        if (!isDuplicate) {
          history.unshift(record);
          localStorage.setItem(
            'formHistory',
            JSON.stringify(history.slice(0, 5))
          );
          console.log('💾 已保存表单数据到 formHistory');
        }

        // 也保存到 lastBaziForm 作为备用
        localStorage.setItem('lastBaziForm', JSON.stringify(formData));
      } catch (e) {
        console.warn('⚠️ 保存数据失败:', e);
      }
    }
  }, [formData]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [historyRecords, setHistoryRecords] = useState([]);
  const [activeTab, setActiveTab] = useState('input');

  // 🔥 关键修复：不再需要 fetchCredits，使用 useCreditBalance() hook 自动管理
  // 当签到成功后，queryClient.invalidateQueries 会自动触发这个 hook 重新获取

  // 获取历史记录
  // 🔥 暂时禁用历史记录功能，因为API路由不存在
  // useEffect(() => {
  //   if (session?.user) {
  //     fetchHistory();
  //   }
  // }, [session]);

  const fetchHistory = async () => {
    // 🔥 暂时禁用，待API实现后再启用
    console.log('历史记录功能暂未实现');
    // try {
    //   const response = await fetch('/api/bazi/history?pageSize=5');
    //   const data = await response.json();
    //   if (data.success) {
    //     setHistoryRecords(data.data.records);
    //   }
    // } catch (error) {
    //   console.error('Failed to fetch history:', error);
    // }
  };

  // 计算所需积分
  const getRequiredCredits = () => {
    const prices = {
      basic: 10,
      detailed: 30,
      professional: 50,
    };
    return prices[formData.analysisType];
  };

  // 处理表单提交
  const handleSubmit = async () => {
    console.log('🔍 开始分析 - 表单数据:', formData);
    console.log('🔍 当前积分:', credits);
    console.log('🔍 所需积分:', getRequiredCredits());

    // 验证必填字段
    if (
      !formData.name ||
      !formData.gender ||
      !formData.birthDate ||
      !formData.birthTime
    ) {
      console.error('❌ 表单验证失败:', {
        name: formData.name,
        gender: formData.gender,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
      });
      toast.error('请填写所有必填信息');
      return;
    }

    console.log('✅ 表单验证通过');

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
      console.log('📤 发送八字分析请求...');

      // 🔥 修复：调用正确的API路由
      const response = await fetch('/api/qiflow/bazi-unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          gender: formData.gender === '男' ? 'male' : 'female',
          birthCity: formData.birthPlace.city || '',
          calendarType: 'solar',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API响应错误:', errorData);
        throw new Error(errorData.error || '分析失败');
      }

      const result = await response.json();
      console.log('✅ API响应成功:', result);
      console.log(
        '📑 API返回的data结构:',
        JSON.stringify(result.data, null, 2)
      );

      if (result.success) {
        setAnalysisResult(result.data);
        setActiveTab('result');
        const creditsUsed = result.data?.creditsUsed || requiredCredits;
        toast.success(`分析成功，消耗${creditsUsed}积分`);

        // 🔥 关键修复：刷新积分缓存和历史记录
        queryClient.invalidateQueries({
          queryKey: creditsKeys.balance(),
        });
        queryClient.invalidateQueries({
          queryKey: creditsKeys.stats(),
        });
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
      analysisType: record.analysisType || 'basic',
    });
    toast.success('已从历史记录加载');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* AI大师悬浮按钮（上下文增强版） */}
      <AIChatWithContext />

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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="input">信息输入</TabsTrigger>
            <TabsTrigger value="result" disabled={!analysisResult}>
              分析结果
            </TabsTrigger>
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
                    <CardDescription>
                      不同类型提供不同深度的分析内容
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <RadioGroup
                      value={formData.analysisType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, analysisType: value as any })
                      }
                    >
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem
                            value="basic"
                            id="basic"
                            className="mt-1"
                          />
                          <Label
                            htmlFor="basic"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-semibold">
                              基础分析（10积分）
                            </div>
                            <div className="text-sm text-gray-600">
                              四柱八字、五行强弱、性格总结
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem
                            value="detailed"
                            id="detailed"
                            className="mt-1"
                          />
                          <Label
                            htmlFor="detailed"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-semibold">
                              详细分析（30积分）
                            </div>
                            <div className="text-sm text-gray-600">
                              包含十神分析、用神喜忌、事业财运、婚姻感情
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem
                            value="professional"
                            id="professional"
                            className="mt-1"
                          />
                          <Label
                            htmlFor="professional"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-semibold flex items-center gap-2">
                              专业分析（50积分）
                              <Badge variant="secondary">推荐</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              完整分析报告，包含大运流年、详细建议
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* 历史快速填充 */}
                <HistoryQuickFill
                  onQuickFill={(data) => {
                    const newFormData = {
                      name: data.personal.name,
                      gender: data.personal.gender as '男' | '女' | '',
                      birthDate: data.personal.birthDate,
                      birthTime: data.personal.birthTime,
                      birthPlace: {
                        province: data.personal.birthCity.split(' ')[0] || '',
                        city:
                          data.personal.birthCity.split(' ')[1] ||
                          data.personal.birthCity,
                      },
                      analysisType: 'basic' as
                        | 'basic'
                        | 'professional'
                        | 'detailed',
                    };

                    setFormData(newFormData);

                    // 自动设置 AI-Chat 上下文
                    if (analysisContext) {
                      analysisContext.setUserInput({
                        personal: {
                          name: data.personal.name,
                          gender:
                            data.personal.gender === 'male' ? 'male' : 'female',
                          birthDate: data.personal.birthDate,
                          birthTime: data.personal.birthTime,
                          birthYear: data.personal.birthDate
                            ? new Date(data.personal.birthDate).getFullYear()
                            : undefined,
                          birthMonth: data.personal.birthDate
                            ? new Date(data.personal.birthDate).getMonth() + 1
                            : undefined,
                          birthDay: data.personal.birthDate
                            ? new Date(data.personal.birthDate).getDate()
                            : undefined,
                          birthHour: data.personal.birthTime
                            ? Number.parseInt(
                                data.personal.birthTime.split(':')[0]
                              )
                            : undefined,
                        },
                        house:
                          data.house.direction || data.house.roomCount
                            ? {
                                direction: data.house.direction,
                              }
                            : undefined,
                      });
                      console.log(
                        '✅ AI-Chat 上下文已设置:',
                        analysisContext.userInput
                      );
                    }

                    toast.success('✅ 已从历史记录快速填充');
                  }}
                  maxRecords={5}
                />

                {/* 当前已填充的信息展示 */}
                {(formData.name || formData.birthDate) && (
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        当前分析信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-2">
                      {formData.name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            <span className="font-semibold">
                              {formData.name}
                            </span>
                            {formData.gender && (
                              <span className="ml-2 text-gray-500">
                                ({formData.gender})
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                      {formData.birthDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {formData.birthDate}
                            {formData.birthTime && (
                              <span className="ml-2">{formData.birthTime}</span>
                            )}
                          </span>
                        </div>
                      )}
                      {(formData.birthPlace.province ||
                        formData.birthPlace.city) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {formData.birthPlace.province}{' '}
                            {formData.birthPlace.city}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 提交按钮 */}
                <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm opacity-90">所需积分</p>
                        <p className="text-2xl font-bold">
                          {getRequiredCredits()}
                        </p>
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
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <p className="text-sm text-center mb-2 opacity-90">
                          积分不足，需要 {getRequiredCredits()} 积分，当前仅有{' '}
                          {credits} 积分
                        </p>
                        <Button
                          variant="outline"
                          className="w-full bg-white text-purple-600 hover:bg-gray-100 border-0"
                          onClick={() => router.push('/settings/credits')}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          立即充值
                        </Button>
                      </div>
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
                        <div className="text-sm text-gray-600">
                          根据出生地经度精确校正
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">精确节气判断</div>
                        <div className="text-sm text-gray-600">
                          精确到秒的节气计算
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">专业十神分析</div>
                        <div className="text-sm text-gray-600">
                          完整的生克制化关系
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium">五行量化评分</div>
                        <div className="text-sm text-gray-600">
                          科学的力量评估体系
                        </div>
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
                {/* 🔥 调试信息 */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="font-semibold text-sm mb-2">
                    🔍 API返回的数据结构：
                  </p>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(analysisResult, null, 2)}
                  </pre>
                </div>

                {/* 基础信息卡片 */}
                {analysisResult.inputData && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                      <CardTitle>基础信息</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">姓名</p>
                          <p className="font-semibold">
                            {analysisResult.inputData?.name || '无'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">性别</p>
                          <p className="font-semibold">
                            {analysisResult.inputData?.gender === 'female'
                              ? '女'
                              : '男'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">出生日期</p>
                          <p className="font-semibold">
                            {analysisResult.inputData?.birthDate || '无'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">出生时间</p>
                          <p className="font-semibold">
                            {analysisResult.inputData?.birthTime || '无'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 四柱八字 */}
                {analysisResult.bazi && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                      <CardTitle>四柱八字</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">年柱</p>
                          <div className="text-2xl font-bold text-purple-600">
                            {analysisResult.bazi.year?.gan}
                            {analysisResult.bazi.year?.zhi}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">月柱</p>
                          <div className="text-2xl font-bold text-purple-600">
                            {analysisResult.bazi.month?.gan}
                            {analysisResult.bazi.month?.zhi}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">日柱</p>
                          <div className="text-2xl font-bold text-purple-600">
                            {analysisResult.bazi.day?.gan}
                            {analysisResult.bazi.day?.zhi}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">时柱</p>
                          <div className="text-2xl font-bold text-purple-600">
                            {analysisResult.bazi.hour?.gan}
                            {analysisResult.bazi.hour?.zhi}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 五行分析 */}
                {analysisResult.wuxing && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                      <CardTitle>五行分析</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {[
                          { key: 'wood', label: '木' },
                          { key: 'fire', label: '火' },
                          { key: 'earth', label: '土' },
                          { key: 'metal', label: '金' },
                          { key: 'water', label: '水' },
                        ].map(({ key, label }) => {
                          const value =
                            (analysisResult.wuxing?.[
                              key as keyof typeof analysisResult.wuxing
                            ] as number) || 0;
                          const percentage = Math.round((value / 8) * 100); // 8个字，转换为百分比
                          return (
                            <div key={key}>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">{label}</span>
                                <span className="text-sm text-gray-600">
                                  {value}个 ({percentage}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                      {analysisResult.wuxing.analysis && (
                        <>
                          <Separator className="my-4" />
                          <div>
                            <p className="text-sm text-gray-600">五行分析</p>
                            <p className="font-semibold">
                              {analysisResult.wuxing.analysis}
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 性格分析 */}
                {analysisResult.personality && (
                  <Card>
                    <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        性格分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-gray-700 mb-4">
                        {analysisResult.personality.summary}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2 text-green-600">
                            优势特质
                          </h4>
                          <ul className="space-y-1">
                            {analysisResult.personality.strengths?.map(
                              (item: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 text-orange-600">
                            需注意之处
                          </h4>
                          <ul className="space-y-1">
                            {analysisResult.personality.weaknesses?.map(
                              (item: string, index: number) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                                  <span className="text-sm">{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 事业财运 */}
                {(analysisResult.career || analysisResult.wealth) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.career && (
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100">
                          <CardTitle>事业运势</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              适合行业
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.career.suitable?.map(
                                (item: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          {analysisResult.career.direction && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                发展方向
                              </p>
                              <p className="text-sm">
                                {analysisResult.career.direction}
                              </p>
                            </div>
                          )}
                          {analysisResult.career.timing && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                运势分析
                              </p>
                              <p className="text-sm">
                                {analysisResult.career.timing}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {analysisResult.wealth && (
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                          <CardTitle>财运分析</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          {analysisResult.wealth.overall && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                总体财运
                              </p>
                              <p className="text-sm font-semibold">
                                {analysisResult.wealth.overall}
                              </p>
                            </div>
                          )}
                          {analysisResult.wealth.advice && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                理财建议
                              </p>
                              <p className="text-sm">
                                {analysisResult.wealth.advice}
                              </p>
                            </div>
                          )}
                          {analysisResult.wealth.timing && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                时机分析
                              </p>
                              <p className="text-sm">
                                {analysisResult.wealth.timing}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* 健康与情感 */}
                {(analysisResult.health || analysisResult.relationships) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.health && (
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100">
                          <CardTitle>健康建议</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          {analysisResult.health.concerns &&
                            analysisResult.health.concerns.length > 0 && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2">
                                  需注意
                                </p>
                                <ul className="space-y-1">
                                  {analysisResult.health.concerns.map(
                                    (item: string, index: number) => (
                                      <li
                                        key={index}
                                        className="flex items-start gap-2"
                                      >
                                        <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                          {analysisResult.health.advice && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">建议</p>
                              <p className="text-sm">
                                {analysisResult.health.advice}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {analysisResult.relationships && (
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-pink-100 to-rose-100">
                          <CardTitle>情感与人际</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          {analysisResult.relationships.love && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                感情运
                              </p>
                              <p className="text-sm">
                                {analysisResult.relationships.love}
                              </p>
                            </div>
                          )}
                          {analysisResult.relationships.family && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                家庭运
                              </p>
                              <p className="text-sm">
                                {analysisResult.relationships.family}
                              </p>
                            </div>
                          )}
                          {analysisResult.relationships.friends && (
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                人际关系
                              </p>
                              <p className="text-sm">
                                {analysisResult.relationships.friends}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

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
                      <div
                        key={record.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{record.name}</h4>
                            <p className="text-sm text-gray-600">
                              {record.gender} | {record.birthDate}{' '}
                              {record.birthTime}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              分析类型：
                              {record.analysisType === 'basic'
                                ? '基础'
                                : record.analysisType === 'detailed'
                                  ? '详细'
                                  : '专业'}
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
                              onClick={() =>
                                router.push(`/zh-CN/bazi-analysis/${record.id}`)
                              }
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
