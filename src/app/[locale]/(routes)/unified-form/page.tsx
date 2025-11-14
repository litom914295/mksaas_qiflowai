'use client';

import { getCreditBalanceAction } from '@/actions/get-credit-balance';
import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
// import { HistoryQuickFill } from '@/components/history/history-quick-fill'; // 已被禁用
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
import { useTranslations } from 'next-intl';
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
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthTime: string;
  gender: 'male' | 'female' | '';
  birthCity: string;
  calendarType: CalendarType;
}

interface HouseInfo {
  direction: string; // 代表房屋朝向（如「坐北朝南」的度数：0-360）
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
  { name: '张女士', rating: 5, text: '非常准确！帮我找到了适合的方位！' },
  { name: '李先生', rating: 5, text: 'AI智能很厉害，解决了我很多疑问。' },
  { name: '王女士', rating: 5, text: '服务很好，响应迅速，值得推荐！' },
];

export default function UnifiedFormPage() {
  // 代表维护开关 - 设置为true时启用维护
  const MAINTENANCE_MODE = false;
  // 旧系统跳转开关
  const REDIRECT_TO_NEW_SYSTEM = false;

  const t = useTranslations();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const analysisContext = useAnalysisContext();

  // ⚠️ 改进：使用 TanStack Query hook 获取余额而不是自己调action
  const { data: creditsAvailable = 0, isLoading: isLoadingCredits } =
    useCreditBalance();

  const [formData, setFormData] = useState<FormData>({
    personal: {
      name: '',
      birthYear: '',
      birthMonth: '',
      birthDay: '',
      birthTime: '',
      gender: 'female', // 自动设置为女性
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

  // 生成年月日数组
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [showHouseInfo, setShowHouseInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [compassOpen, setCompassOpen] = useState(false);

  // 计算完成进度
  useEffect(() => {
    const personalFields = Object.values(formData.personal).filter(
      (v) => v !== ''
    ).length;
    const totalPersonalFields = 8; // 个人必填字段数（name + birthYear + birthMonth + birthDay + birthTime + gender + birthCity + calendarType）
    const houseFields = showHouseInfo
      ? Object.values(formData.house).filter((v) => v !== '' && v !== null)
          .length
      : 0;
    const totalHouseFields = 4; // 房屋必填字段数

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

  // ⚠️ 改进：不再手动调用action获取余额,useCreditBalance() hook会自动处理
  // 当表单提交成功后,queryClient.invalidateQueries会自动更新这个hook触发刷新

  // 计算所需余额
  useEffect(() => {
    const hasHouseInfo =
      showHouseInfo && formData.house.direction && formData.house.roomCount;
    setCreditsRequired(hasHouseInfo ? 30 : 10);
  }, [showHouseInfo, formData.house.direction, formData.house.roomCount]);

  // 快速填充数据
  const handleQuickFill = (data: FormData) => {
    setFormData(data);
    if (data.house.direction || data.house.roomCount) {
      setShowHouseInfo(true);
    }

    // 自动设置 AI-Chat 上下文
    if (analysisContext) {
      const birthHour = data.personal.birthTime
        ? Number.parseInt(data.personal.birthTime.split(':')[0])
        : undefined;
      const birthYear = data.personal.birthYear ? Number.parseInt(data.personal.birthYear) : undefined;
      const birthMonth = data.personal.birthMonth ? Number.parseInt(data.personal.birthMonth) : undefined;
      const birthDay = data.personal.birthDay ? Number.parseInt(data.personal.birthDay) : undefined;

      analysisContext.setUserInput({
        personal: {
          name: data.personal.name,
          gender: data.personal.gender === 'male' ? 'male' : 'female',
          birthDate: `${data.personal.birthYear}-${data.personal.birthMonth.padStart(2, '0')}-${data.personal.birthDay.padStart(2, '0')}`,
          birthTime: data.personal.birthTime,
          birthYear,
          birthMonth,
          birthDay,
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
      console.log('✓ [Unified Form] AI-Chat 上下文已设置');
    }
  };

  // 处理个人必填变化
  const handlePersonalChange = (field: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  // 处理房屋必填变化
  const handleHouseChange = (field: keyof HouseInfo, value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        [field]: value,
      },
    }));
  };

  // 关键提交 - 保留数据并跳转到报告页面
  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log('='.repeat(50));
    console.log('🚀 [调试] 开始关键提交');

    // 1. 验证必填项
    if (
      !formData.personal.name ||
      !formData.personal.birthYear ||
      !formData.personal.birthMonth ||
      !formData.personal.birthDay ||
      !formData.personal.birthTime ||
      !formData.personal.gender
    ) {
      alert('请填完所需必填的个人必填');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. 格式化日期
      const birthDate = `${formData.personal.birthYear}-${formData.personal.birthMonth.padStart(2, '0')}-${formData.personal.birthDay.padStart(2, '0')}`;
      console.log('💾 保留提交数据到 localStorage...');

      // 构造用于保存和传递的数据格式（兼容旧格式）
      const reportData = {
        personal: {
          ...formData.personal,
          birthDate,
        },
        house: formData.house,
      };

      // 保留到 formHistory（即为历史快捷填充）
      try {
        const existingHistory = localStorage.getItem('formHistory') || '[]';
        const history = JSON.parse(existingHistory);
        const newEntry = { ...formData, timestamp: Date.now() };
        history.unshift(newEntry);
        localStorage.setItem(
          'formHistory',
          JSON.stringify(history.slice(0, 5))
        );
        console.log('✓ 已保留到 formHistory');
      } catch (e) {
        console.error('✖ 保留 formHistory 失败:', e);
      }

      // 另外保留到 lastBaziForm（单用）
      try {
        localStorage.setItem('lastBaziForm', JSON.stringify(formData));
        console.log('✓ 已保留到 lastBaziForm（单用）');
      } catch (e) {
        console.error('✖ 保留 lastBaziForm 失败:', e);
      }

      // 3. 另写到 AnalysisContext
      if (analysisContext) {
        console.log('🔄 另写用户输入到 AnalysisContext...');
        const [birthHourStr] = formData.personal.birthTime.split(':');
        const birthHour = Number.parseInt(birthHourStr, 10);

        analysisContext.setUserInput({
          personal: {
            birthYear: Number.parseInt(formData.personal.birthYear),
            birthMonth: Number.parseInt(formData.personal.birthMonth),
            birthDay: Number.parseInt(formData.personal.birthDay),
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
        console.log('✓ AnalysisContext 已另写');
      }

      // 4. 保留到 sessionStorage 并跳转到报告页面
      console.log('🔗 跳转到报告页面...');
      sessionStorage.setItem('analysisFormData', JSON.stringify(reportData));
      await new Promise((resolve) => setTimeout(resolve, 300)); // 确保数据保留完成

      // 跳转到报告页面（不带URL参数传数据）
      router.push('/zh-CN/report');
    } catch (error) {
      console.error('✖ 关键失败:', error);
      alert('关键失败，请再试一弟');
      setIsSubmitting(false);
    }
  };

  // 如果要用跳转到旧系统
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

  // 如果处于代表维护，显示维护页面
  if (MAINTENANCE_MODE) {
    return <MaintenancePage />;
  }

  // 判断是否可以关键
  const canSubmit =
    formData.personal.name &&
    formData.personal.birthYear &&
    formData.personal.birthMonth &&
    formData.personal.birthDay &&
    formData.personal.birthTime &&
    formData.personal.gender;

  // 朝向变化 → 另写到 AnalysisContext（余处）
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

  // 临调试函数
  useEffect(() => {
    console.log('📊 canSubmit:', canSubmit);
    console.log('📋 Personal data:', {
      name: formData.personal.name,
      birthDay: formData.personal.birthDay,
      birthTime: formData.personal.birthTime,
      gender: formData.personal.gender,
    });
  }, [canSubmit, formData.personal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* AI智能对话框（上下文自动） */}
      <AIChatWithContext />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI智能风水分析</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            气流AI - 专业八字风水分析
          </h1>
          <p className="text-gray-600">
            填完必填必填，获取精准专业化的命理分析和风水布局建议
          </p>
        </div>

        {/* 进度条 */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                填完进度
              </span>
              <span className="text-sm font-bold text-purple-600">
                {progress}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>个人必填</span>
              <span>房屋必填（可选）</span>
              <span>完成</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主提交区域 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 登录用户：分析余额提示 */}
            {session && (
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">智能分析开关</h3>
                        <p className="text-sm text-gray-600">
                          {creditsAvailable >= creditsRequired
                            ? `您可用代表开关进行高精度分析（需要${creditsRequired}余额）`
                            : '余额不足，您可用部分精度开关'}
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
                        ? '✓ 高精度分析'
                        : '⚠ 部分分析'}
                    </Badge>
                  </div>
                  {creditsAvailable < creditsRequired && (
                    <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-gray-600">
                      当前可用：<strong>{creditsAvailable}</strong> 余额 |
                      所需：
                      <strong className="text-red-600">
                        {creditsRequired}
                      </strong>{' '}
                      余额
                      <Button
                        variant="link"
                        className="ml-2 p-0 h-auto text-blue-600"
                        onClick={() => router.push('/settings/credits')}
                      >
                        获取充值 →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 历史快速填充 */}
            {/* <HistoryQuickFill onQuickFill={handleQuickFill} /> */}

            {/* 个人必填 */}
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
                  请准确填完您的出生必填，确保命理分析的精确
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
                  <Label className="flex items-center gap-1 mb-2">
                    出生日期 <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select 
                      value={formData.personal.birthYear} 
                      onValueChange={(v) => handlePersonalChange('birthYear', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="年" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {years.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}年</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={formData.personal.birthMonth} 
                      onValueChange={(v) => handlePersonalChange('birthMonth', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="月" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {months.map(m => (
                          <SelectItem key={m} value={String(m)}>{m}月</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={formData.personal.birthDay} 
                      onValueChange={(v) => handlePersonalChange('birthDay', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="日" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {days.map(d => (
                          <SelectItem key={d} value={String(d)}>{d}日</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 出生时辰 */}
                <div>
                  <Label
                    htmlFor="birthTime"
                    className="flex items-center gap-1"
                  >
                    {t('UnifiedForm.personal.birthTimeLabel')}{' '}
                    <span className="text-red-500">*</span>
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
                    {t('UnifiedForm.personal.birthCityLabel')}{' '}
                    <span className="text-gray-400 text-xs">
                      ({t('UnifiedForm.house.optionalBadge')})
                    </span>
                  </Label>
                  <CityLocationPicker
                    value={formData.personal.birthCity}
                    onChange={(city) => handlePersonalChange('birthCity', city)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 房屋必填（可折叠） */}
            <Card className="shadow-lg border-2 border-blue-100">
              <CardHeader
                className="bg-gradient-to-r from-blue-100 to-purple-100 cursor-pointer"
                onClick={() => setShowHouseInfo(!showHouseInfo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-blue-600" />
                    <CardTitle>{t('UnifiedForm.house.title')}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {t('UnifiedForm.house.optionalBadge')}
                    </Badge>
                    {showHouseInfo ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
                <CardDescription>
                  {showHouseInfo
                    ? t('UnifiedForm.house.collapseHint')
                    : t('UnifiedForm.house.expandHint')}
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
                      {t('UnifiedForm.house.direction')}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="direction"
                        type="number"
                        placeholder={t(
                          'UnifiedForm.house.directionPlaceholder'
                        )}
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
                        {t('UnifiedForm.house.compassSelect')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('UnifiedForm.house.directionHint')}
                    </p>
                  </div>

                  {/* 房间数 */}
                  <div>
                    <Label htmlFor="roomCount">
                      {t('UnifiedForm.house.roomCount')}
                    </Label>
                    <Select
                      value={formData.house.roomCount}
                      onValueChange={(value) =>
                        handleHouseChange('roomCount', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={t(
                            'UnifiedForm.house.roomCountPlaceholder'
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">
                          {t('UnifiedForm.house.rooms.1')}
                        </SelectItem>
                        <SelectItem value="2">
                          {t('UnifiedForm.house.rooms.2')}
                        </SelectItem>
                        <SelectItem value="3">
                          {t('UnifiedForm.house.rooms.3')}
                        </SelectItem>
                        <SelectItem value="4">
                          {t('UnifiedForm.house.rooms.4')}
                        </SelectItem>
                        <SelectItem value="5+">
                          {t('UnifiedForm.house.rooms.5+')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 标准户型 */}
                  <div>
                    <Label htmlFor="standardLayout">
                      {t('UnifiedForm.house.standardLayout')}
                    </Label>
                    <Select
                      value={formData.house.standardLayout}
                      onValueChange={(value) =>
                        handleHouseChange('standardLayout', value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue
                          placeholder={t('UnifiedForm.house.layoutPlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="type1">
                          {t('UnifiedForm.house.layoutOptions.type1')}
                        </SelectItem>
                        <SelectItem value="type2">
                          {t('UnifiedForm.house.layoutOptions.type2')}
                        </SelectItem>
                        <SelectItem value="type3">
                          {t('UnifiedForm.house.layoutOptions.type3')}
                        </SelectItem>
                        <SelectItem value="type4">
                          {t('UnifiedForm.house.layoutOptions.type4')}
                        </SelectItem>
                        <SelectItem value="custom">
                          {t('UnifiedForm.house.layoutOptions.custom')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 平面图上传其它 */}
                  <div>
                    <Label className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t('UnifiedForm.house.floorPlan')}
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

            {/* 关键按钮 */}
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
                      {t('guestAnalysis.analyzing')}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {t('guestAnalysis.analysisReady.startAnalysis')}
                    </>
                  )}
                </Button>
                {!canSubmit && (
                  <p className="text-center text-sm mt-3 text-white/80">
                    {t('UnifiedForm.validation.fillRequired')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 服务亮点 */}
            <Card className="shadow-lg border-2 border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  {t('UnifiedForm.features.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('UnifiedForm.features.baziAnalysis')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('UnifiedForm.features.fengshuiLayout')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('UnifiedForm.features.aiChat')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('UnifiedForm.features.privacy')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{t('UnifiedForm.features.report')}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* 用户评价 */}
            <Card className="shadow-lg border-2 border-yellow-100">
              <CardHeader className="bg-gradient-to-r from-yellow-100 to-orange-100">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  {t('UnifiedForm.userFeedback.title')}
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

            {/* 友善关系 */}
            <Card className="shadow-lg border-2 border-gray-200">
              <CardContent className="pt-6">
                <div className="text-xs text-gray-600 space-y-2">
                  <p className="font-medium">
                    {t('UnifiedForm.privacy.title')}
                  </p>
                  <p>{t('UnifiedForm.privacy.content')}</p>
                  <p className="font-medium mt-3">
                    {t('UnifiedForm.privacy.disclaimerTitle')}
                  </p>
                  <p>{t('UnifiedForm.privacy.disclaimerContent')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 罗盘组件弹窗 */}
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
