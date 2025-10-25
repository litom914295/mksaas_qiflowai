'use client';

import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
// import { HistoryQuickFill } from '@/components/history/history-quick-fill'; // 已移除
import { CityLocationPicker } from '@/components/qiflow/city-location-picker';
import { HouseLayoutUpload } from '@/components/qiflow/house-layout-upload';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalysisContext } from '@/contexts/analysis-context';
import { useCreditBalance } from '@/hooks/use-credits';
import { authClient } from '@/lib/auth-client';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Home,
  Sparkles,
  Star,
  Upload,
  User,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import MaintenancePage from './maintenance';

const CompassPickerDialog = dynamic(
  () =>
    import('@/components/compass/compass-picker-dialog').then(
      (m) => m.CompassPickerDialog
    ),
  { ssr: false }
);

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
  direction: string; // 统一存储为“真北参考”的度数（0-360）
  roomCount: string;
  layoutImage: string | null;
  standardLayout: string;
  northRef?: 'magnetic' | 'true';
  declination?: number; // 磁偏角，度
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
  const MAINTENANCE_MODE = false;
  // 新系统重定向开关
  const REDIRECT_TO_NEW_SYSTEM = false;

  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const analysisContext = useAnalysisContext();

  // 🔥 关键修复：使用 TanStack Query hook 获取实时积分余额
  const { data: creditsAvailable = 0, isLoading: isLoadingCredits } =
    useCreditBalance();

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
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [compassOpen, setCompassOpen] = useState(false);

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

  // 🔥 关键修复：不再需要手动获取积分,useCreditBalance() hook会自动处理
  // 当签到成功后,queryClient.invalidateQueries会自动触发这个hook重新获取

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

    // 自动设置 AI-Chat 上下文
    if (analysisContext) {
      const birthDate = data.personal.birthDate
        ? new Date(data.personal.birthDate)
        : null;
      const birthHour = data.personal.birthTime
        ? Number.parseInt(data.personal.birthTime.split(':')[0])
        : undefined;

      analysisContext.setUserInput({
        personal: {
          name: data.personal.name,
          gender: data.personal.gender === 'male' ? 'male' : 'female',
          birthDate: data.personal.birthDate,
          birthTime: data.personal.birthTime,
          birthYear: birthDate?.getFullYear(),
          birthMonth: birthDate ? birthDate.getMonth() + 1 : undefined,
          birthDay: birthDate?.getDate(),
          birthHour: Number.isNaN(birthHour as number) ? undefined : birthHour,
        },
        house:
          data.house.direction || data.house.roomCount
            ? {
                direction: data.house.direction,
                facing: data.house.direction
                  ? Number.parseInt(data.house.direction)
                  : undefined,
              }
            : undefined,
      });
      console.log('✅ [Unified Form] AI-Chat 上下文已设置');
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

  // 提交表单 - 保存数据并跳转到分析页面
  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('='.repeat(50));
    console.log('🚀 [首页] 开始提交表单');

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
      // 2. 保存数据到 localStorage
      console.log('💾 保存表单数据到 localStorage...');

      // 保存到 formHistory（作为历史记录数组）
      try {
        const existingHistory = localStorage.getItem('formHistory') || '[]';
        const history = JSON.parse(existingHistory);
        const newEntry = { ...formData, timestamp: Date.now() };
        history.unshift(newEntry);
        localStorage.setItem(
          'formHistory',
          JSON.stringify(history.slice(0, 5))
        );
        console.log('✅ 已保存到 formHistory');
      } catch (e) {
        console.error('❌ 保存 formHistory 失败:', e);
      }

      // 同时保存到 lastBaziForm（备用）
      try {
        localStorage.setItem('lastBaziForm', JSON.stringify(formData));
        console.log('✅ 已保存到 lastBaziForm（备用）');
      } catch (e) {
        console.error('❌ 保存 lastBaziForm 失败:', e);
      }

      // 3. 同步到 AnalysisContext
      if (analysisContext) {
        console.log('🔄 同步用户输入到 AnalysisContext...');
        const birthDate = new Date(formData.personal.birthDate);
        const [birthHourStr] = formData.personal.birthTime.split(':');
        const birthHour = Number.parseInt(birthHourStr, 10);

        analysisContext.setUserInput({
          personal: {
            birthYear: birthDate.getFullYear(),
            birthMonth: birthDate.getMonth() + 1,
            birthDay: birthDate.getDate(),
            birthHour: Number.isNaN(birthHour) ? undefined : birthHour,
            gender: formData.personal.gender as 'male' | 'female',
          },
          house: formData.house.direction
            ? {
                facing: Number.parseInt(formData.house.direction, 10) || 180,
                buildYear: new Date().getFullYear(),
              }
            : undefined,
        });
        console.log('✅ AnalysisContext 已同步');
      }

      // 4. 保存到 sessionStorage 并跳转到报告页面
      console.log('🔀 跳转到报告页面...');
      sessionStorage.setItem('analysisFormData', JSON.stringify(formData));
      await new Promise((resolve) => setTimeout(resolve, 300)); // 确保数据保存完成

      // 跳转到报告页面（不在URL中传递数据）
      router.push('/zh-CN/report');
    } catch (error) {
      console.error('❌ 提交失败:', error);
      alert('提交失败，请再试一次');
      setIsSubmitting(false);
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

  // 朝向变化 → 同步到 AnalysisContext（实时）
  useEffect(() => {
    if (!analysisContext) return;
    const d = Number.parseInt(formData.house.direction || '');
    if (!Number.isNaN(d)) {
      analysisContext.setUserInput({
        personal: undefined,
        house: { facing: d },
      });
    }
  }, [formData.house.direction, analysisContext]);

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
      {/* AI大师悬浮按钮（上下文增强版） */}
      <AIChatWithContext />

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

            {/* 历史快速填充 */}
            {/* <HistoryQuickFill onQuickFill={handleQuickFill} /> */}

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
                      <Button
                        variant="outline"
                        className="whitespace-nowrap"
                        onClick={() => setCompassOpen(true)}
                      >
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

      {/* 罗盘拾取器弹窗 */}
      <CompassPickerDialog
        open={compassOpen}
        onOpenChange={setCompassOpen}
        value={Number.parseInt(formData.house.direction || '0') || 0}
        onChange={(deg, meta) => {
          handleHouseChange('direction', String(Math.round(deg)));
          if (meta?.northRef)
            handleHouseChange('northRef', meta.northRef as any);
          if (typeof meta?.declination === 'number')
            handleHouseChange('declination', String(meta.declination));
        }}
        onConfirm={(deg) => {
          handleHouseChange('direction', String(Math.round(deg)));
          setCompassOpen(false);
        }}
        snapStep={1}
      />
    </div>
  );
}
