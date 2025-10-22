'use client';

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Compass,
  Home,
  MapPin,
  Sparkles,
  Star,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  completionYear: number;
  completionMonth: number;
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

export default function UnifiedAnalysisForm() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState<FormData>({
    personal: {
      name: '',
      birthDate: '',
      birthTime: '',
      gender: '',
      birthCity: '',
      calendarType: 'solar',
    },
    house: {
      direction: '',
      roomCount: '',
      completionYear: currentYear,
      completionMonth: 1,
    },
  });

  const [showHouseInfo, setShowHouseInfo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 计算填写进度
  useEffect(() => {
    const personalFields = Object.values(formData.personal).filter(
      (v) => v !== ''
    ).length;
    const totalPersonalFields = 6;
    const houseFields = showHouseInfo
      ? Object.values(formData.house).filter((v) => v !== '' && v !== 0).length
      : 0;
    const totalHouseFields = 4;

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
  const handleHouseChange = (
    field: keyof HouseInfo,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      house: {
        ...prev.house,
        [field]: value,
      },
    }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填项
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
      // 判断用户需要什么分析
      const hasHouseInfo =
        showHouseInfo &&
        formData.house.direction &&
        formData.house.roomCount &&
        formData.house.completionYear &&
        formData.house.completionMonth;

      // 保存表单数据到 sessionStorage
      sessionStorage.setItem('analysisFormData', JSON.stringify(formData));

      // 根据是否填写房屋信息路由到不同页面
      if (hasHouseInfo) {
        // 完整的八字风水分析
        // 先跳转到八字分析页面，显示八字结果
        // 然后提供"查看风水分析"按钮跳转到玄空风水
        router.push('/zh-CN/bazi-analysis?withFengshui=true');
      } else {
        // 仅八字分析
        router.push('/zh-CN/bazi-analysis');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请再试一次');
      setIsSubmitting(false);
    }
  };

  // 检查是否可以提交
  const canSubmit =
    formData.personal.name &&
    formData.personal.birthDate &&
    formData.personal.birthTime &&
    formData.personal.gender;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 主表单区域 */}
            <div className="lg:col-span-2 space-y-6">
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
                      required
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
                      required
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
                      required
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
                      required
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
                    <Input
                      id="birthCity"
                      placeholder="例如：北京"
                      value={formData.personal.birthCity}
                      onChange={(e) =>
                        handlePersonalChange('birthCity', e.target.value)
                      }
                      className="mt-1"
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
                    <Alert className="bg-blue-50 border-blue-200">
                      <Compass className="h-4 w-4" />
                      <AlertTitle>个性化风水分析</AlertTitle>
                      <AlertDescription>
                        填写房屋信息后，将基于您的八字命理，为您定制专属的风水布局建议
                      </AlertDescription>
                    </Alert>

                    {/* 房屋朝向 */}
                    <div>
                      <Label
                        htmlFor="direction"
                        className="flex items-center gap-2"
                      >
                        <Compass className="w-4 h-4" />
                        房屋朝向（度数）
                      </Label>
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
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        提示：0° 为正北，90° 为正东，180° 为正南，270° 为正西
                      </p>
                    </div>

                    {/* 房屋落成年份 */}
                    <div>
                      <Label htmlFor="completionYear">建筑落成年份</Label>
                      <Input
                        id="completionYear"
                        type="number"
                        placeholder="例如：2020"
                        value={formData.house.completionYear}
                        onChange={(e) =>
                          handleHouseChange(
                            'completionYear',
                            Number.parseInt(e.target.value)
                          )
                        }
                        min="1900"
                        max={currentYear}
                        className="mt-1"
                      />
                    </div>

                    {/* 房屋落成月份 */}
                    <div>
                      <Label htmlFor="completionMonth">建筑落成月份</Label>
                      <Select
                        value={formData.house.completionMonth.toString()}
                        onValueChange={(value) =>
                          handleHouseChange(
                            'completionMonth',
                            Number.parseInt(value)
                          )
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="请选择月份" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {month} 月
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
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
                  </CardContent>
                )}
              </Card>

              {/* 提交按钮 */}
              <Card className="shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full h-14 text-lg font-bold bg-white text-purple-600 hover:bg-gray-100"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                        正在处理中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        {showHouseInfo &&
                        formData.house.direction &&
                        formData.house.roomCount
                          ? '立即生成八字风水分析'
                          : '立即生成八字分析'}
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
                      <span>基于八字的个性化风水</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>AI大师24/7在线答疑</span>
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
        </form>
      </div>
    </div>
  );
}
