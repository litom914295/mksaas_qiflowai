'use client';

import BaziApiResult from '@/components/qiflow/analysis/bazi-api-result';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SIMPLE_TIME_PERIODS,
  getDefaultTimeForSimplePeriod,
} from '@/lib/time-constants';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type CalendarType = 'solar' | 'lunar';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'exact';

interface FormData {
  name: string;
  gender: 'male' | 'female' | '';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  timeOfDay: TimeOfDay;
  exactTime: string;
  birthCity: string;
  calendarType: CalendarType;
}

export function HeroWithBaziAnalysis() {
  const t = useTranslations('BaziHome');
  const tForm = useTranslations('form');
  const [showResult, setShowResult] = useState(false);
  const [personalData, setPersonalData] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: 'female',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    timeOfDay: 'morning',
    exactTime: '08:00',
    birthCity: '',
    calendarType: 'solar',
  });

  // 生成年份选项 (1900-2025)
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1899 },
    (_, i) => currentYear - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 检查是否可以提交
  const canSubmit =
    formData.name &&
    formData.gender &&
    formData.birthYear &&
    formData.birthMonth &&
    formData.birthDay;

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      alert(t('alertFillRequired'));
      return;
    }

    // 转换为日期和时间格式
    const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
    let birthTime = '';

    if (formData.timeOfDay === 'exact' && formData.exactTime) {
      birthTime = formData.exactTime;
    } else {
      birthTime = getDefaultTimeForSimplePeriod(formData.timeOfDay);
    }

    // 设置个人数据并显示分析结果
    setPersonalData({
      name: formData.name,
      birthDate: birthDate,
      birthTime: birthTime,
      gender: formData.gender as 'male' | 'female',
      birthCity: formData.birthCity || '',
      calendarType: formData.calendarType,
    });

    setShowResult(true);
  };

  // 处理字段变化
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 返回表单
  const handleBackToForm = () => {
    setShowResult(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background min-h-screen">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(88,166,255,0.08)_0%,rgba(0,0,0,0)_100%)]" />

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!showResult ? (
            // 表单视图
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              {/* 标题 */}
              <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  深度八字命理分析
                </h1>
                <p className="text-lg text-muted-foreground">
                  基于专业算法的个性化命理洞察
                </p>
              </div>

              {/* 表单卡片 */}
              <Card className="shadow-xl border-2 border-purple-200">
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 姓名 + 性别 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          姓名 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="请输入姓名"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          性别 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.gender}
                          onValueChange={(value) =>
                            handleChange('gender', value)
                          }
                          className="flex gap-4 h-11 items-center"
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
                    </div>

                    {/* 出生日期 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        出生日期 <span className="text-destructive">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={formData.birthYear}
                          onValueChange={(value) =>
                            handleChange('birthYear', value)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="年" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}年
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={formData.birthMonth}
                          onValueChange={(value) =>
                            handleChange('birthMonth', value)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="月" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month.toString()}>
                                {month}月
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={formData.birthDay}
                          onValueChange={(value) =>
                            handleChange('birthDay', value)
                          }
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="日" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {days.map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}日
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 出生时间 */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        出生时间 <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="time"
                          value={formData.exactTime}
                          onChange={(e) =>
                            handleChange('exactTime', e.target.value)
                          }
                          className="h-11 flex-1"
                          required
                        />
                        <div className="flex gap-1">
                          {SIMPLE_TIME_PERIODS.map((period) => (
                            <button
                              key={period.value}
                              type="button"
                              onClick={() => {
                                handleChange('timeOfDay', period.value);
                                handleChange('exactTime', period.defaultTime);
                              }}
                              className={`px-3 py-2 text-sm rounded border-2 transition-all ${
                                formData.timeOfDay === period.value
                                  ? 'border-purple-600 bg-purple-50 text-purple-900 font-medium'
                                  : 'border-border hover:border-purple-300'
                              }`}
                            >
                              {period.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 出生城市（可选） */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="birthCity"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        出生城市{' '}
                        <span className="text-xs text-muted-foreground">
                          (可选)
                        </span>
                      </Label>
                      <Input
                        id="birthCity"
                        placeholder="用于真太阳时校准"
                        value={formData.birthCity}
                        onChange={(e) =>
                          handleChange('birthCity', e.target.value)
                        }
                        className="h-11"
                      />
                    </div>

                    {/* 提交按钮 */}
                    <Button
                      type="submit"
                      disabled={!canSubmit}
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始专业分析
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      点击分析即表示您同意我们的隐私政策
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // 分析结果视图
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto"
            >
              {/* 返回按钮 */}
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={handleBackToForm}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回修改信息
                </Button>
              </div>

              {/* 标题 */}
              <div className="text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {formData.name}的八字命理分析
                </h1>
                <p className="text-muted-foreground">
                  专业版 · 包含大运流年预测
                </p>
              </div>

              {/* 八字分析结果 */}
              {personalData && <BaziApiResult personal={personalData} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
