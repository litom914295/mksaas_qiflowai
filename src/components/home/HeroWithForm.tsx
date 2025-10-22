'use client';

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
import { LocaleLink } from '@/i18n/navigation';
import {
  SIMPLE_TIME_PERIODS,
  type TIME_PERIODS,
  getDefaultTimeForPeriod,
  getDefaultTimeForSimplePeriod,
} from '@/lib/time-constants';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Home as HomeIcon,
  MapPin,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

type CalendarType = 'solar' | 'lunar';
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'exact';
type TimePeriod = (typeof TIME_PERIODS)[number]['value'];

interface FormData {
  name: string;
  gender: 'male' | 'female' | '';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  timeOfDay: TimeOfDay; // 简化时段选择
  timePeriod: string; // 十二时辰选择
  exactTime: string; // 精确时间输入
  birthCity: string;
  calendarType: CalendarType;
}

interface HouseInfo {
  direction: string;
  roomCount: string;
  completionYear: string;
  completionMonth: string;
}

export function HeroWithForm() {
  const t = useTranslations('BaziHome');
  const tForm = useTranslations('form');
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    gender: 'female', // 默认女性（本项目女性用户>50%）
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    timeOfDay: 'morning', // 默认上午
    timePeriod: 'chen', // 默认辰时（8点）
    exactTime: '08:00', // 默认8点
    birthCity: '',
    calendarType: 'solar', // 默认阳历（应用最广）
  });

  const [houseInfo, setHouseInfo] = useState<HouseInfo>({
    direction: '',
    roomCount: '',
    completionYear: '',
    completionMonth: '',
  });

  const [showHouseInfo, setShowHouseInfo] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 核心特性标签
  const features = [
    {
      icon: Zap,
      text: t('feature1'),
      color: 'text-primary',
    },
    {
      icon: Shield,
      text: t('feature2'),
      color: 'text-primary',
    },
    {
      icon: TrendingUp,
      text: t('feature3'),
      color: 'text-primary',
    },
  ];

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

    // 转换为旧格式的日期和时间
    const birthDate = `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`;
    let birthTime = '';

    if (formData.timeOfDay === 'exact' && formData.exactTime) {
      // 用户选择了精确时间
      birthTime = formData.exactTime;
    } else {
      // 根据简化时段获取默认时间
      birthTime = getDefaultTimeForSimplePeriod(formData.timeOfDay);
    }

    // 准备传递给报告页面的数据
    const reportData = {
      personal: {
        name: formData.name,
        birthDate,
        birthTime,
        gender: formData.gender,
        birthCity: formData.birthCity || '',
        calendarType: 'solar' as const,
      },
      house: showHouseInfo
        ? houseInfo
        : {
            direction: '',
            roomCount: '',
            completionYear: '',
            completionMonth: '',
          },
    };

    // 保存到 sessionStorage 和 localStorage
    sessionStorage.setItem('analysisFormData', JSON.stringify(reportData));

    try {
      const existingHistory = localStorage.getItem('formHistory') || '[]';
      const history = JSON.parse(existingHistory);
      history.unshift({ ...reportData, timestamp: Date.now() });
      localStorage.setItem('formHistory', JSON.stringify(history.slice(0, 5)));
    } catch (e) {
      console.error('保存历史失败:', e);
    }

    // 跳转到报告页面（不在URL中传递数据，使用sessionStorage）
    router.push('/zh-CN/report');
  };

  // 处理字段变化
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理房屋信息变化
  const handleHouseChange = (field: keyof HouseInfo, value: string) => {
    setHouseInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(88,166,255,0.08)_0%,rgba(0,0,0,0)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 -z-20 opacity-[0.015]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* 左侧 Hero 内容 - 55% */}
          <div className="lg:col-span-6 space-y-5 lg:space-y-6">
            {/* 标题和副标题 */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground"
              >
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  {t('mainTitle')}
                  <br />
                  {t('mainTitleLine2')}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                {t('mainSubtitle')}
              </motion.p>
            </div>

            {/* 特性标签 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="group flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <feature.icon className="w-4 h-4 group-hover:animate-pulse" />
                  <span className={`font-medium ${feature.color}`}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* 社会证明 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
                    className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 ring-2 ring-background"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {t('usersGuidedPrefix')}{' '}
                {isVisible && (
                  <CountUp
                    end={127843}
                    duration={2.5}
                    separator=","
                    className="font-semibold text-primary"
                  />
                )}{' '}
                {t('usersGuided')}
              </span>
            </motion.div>

            {/* 次要CTA - 仅桌面端显示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="hidden lg:flex flex-wrap gap-3"
            >
              <LocaleLink
                href="/showcase"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span>👀</span>
                <span>{t('viewExample')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </LocaleLink>
              <span className="text-muted-foreground/40">|</span>
              <LocaleLink
                href="/ai-chat"
                className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span>✨</span>
                <span>{t('aiConsult')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </LocaleLink>
            </motion.div>

            {/* 信任指标 - 仅桌面端显示 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="hidden lg:flex items-center gap-6 p-4 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg text-primary">
                      ★
                    </span>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-foreground">
                    {isVisible && (
                      <CountUp end={4.9} duration={2} decimals={1} />
                    )}
                    /5
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('userRating')}
                  </span>
                </div>
              </div>

              <div className="h-8 w-px bg-border" />

              <div className="flex flex-col">
                <span className="text-base font-bold text-primary">
                  {isVisible && <CountUp end={98} duration={2} />}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('algorithmAccuracy')}
                </span>
              </div>
            </motion.div>
          </div>

          {/* 右侧表单卡片 - 45% */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-6"
          >
            <Card className="shadow-xl border-2 border-primary/20 bg-card/95 backdrop-blur">
              <CardContent className="p-5 lg:p-6">
                {/* 表单头部 - 精简版 */}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {tForm('title')}
                  </h2>
                </div>

                {/* 表单内容 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 第一行: 姓名 + 性别 + 城市 */}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-4 space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        <User className="w-3.5 h-3.5" />
                        {tForm('name')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder={tForm('namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-sm font-medium">
                        {tForm('gender')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.gender}
                        onValueChange={(value) => handleChange('gender', value)}
                        className="flex gap-2 h-10 items-center"
                      >
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="female" id="female" />
                          <Label
                            htmlFor="female"
                            className="cursor-pointer font-normal text-sm"
                          >
                            {tForm('female')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="male" id="male" />
                          <Label
                            htmlFor="male"
                            className="cursor-pointer font-normal text-sm"
                          >
                            {tForm('male')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="col-span-5 space-y-2">
                      <Label
                        htmlFor="birthCity"
                        className="text-sm font-medium flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        {tForm('birthCity')}{' '}
                        <span className="text-xs text-muted-foreground">
                          ({tForm('solarTime')})
                        </span>
                      </Label>
                      <Input
                        id="birthCity"
                        placeholder={tForm('birthCityPlaceholder')}
                        value={formData.birthCity}
                        onChange={(e) =>
                          handleChange('birthCity', e.target.value)
                        }
                        className="h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* 第二行: 出生日期 (年月日分开) + 阴阳历选择 */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {tForm('birthDate')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.calendarType}
                        onValueChange={(value: CalendarType) =>
                          handleChange('calendarType', value)
                        }
                        className="flex gap-3"
                      >
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="solar" id="solar" />
                          <Label
                            htmlFor="solar"
                            className="cursor-pointer font-normal text-xs"
                          >
                            {tForm('solar')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <RadioGroupItem value="lunar" id="lunar" />
                          <Label
                            htmlFor="lunar"
                            className="cursor-pointer font-normal text-xs"
                          >
                            {tForm('lunar')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={formData.birthYear}
                        onValueChange={(value) =>
                          handleChange('birthYear', value)
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={tForm('yearPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                              {tForm('yearSuffix')}
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
                        <SelectTrigger className="h-10">
                          <SelectValue
                            placeholder={tForm('monthPlaceholder')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}
                              {tForm('monthSuffix')}
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
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={tForm('dayPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {days.map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                              {tForm('daySuffix')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.calendarType === 'lunar' && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>🌙</span>
                        <span>{tForm('lunarNote')}</span>
                      </p>
                    )}
                  </div>

                  {/* 第三行: 出生时间 (时间选择+快捷按钮) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {tForm('birthTime')}{' '}
                      <span className="text-destructive">*</span>
                    </Label>

                    <div className="flex gap-2">
                      {/* 左侧：时间选择器 */}
                      <Input
                        type="time"
                        value={formData.exactTime}
                        onChange={(e) =>
                          handleChange('exactTime', e.target.value)
                        }
                        className="h-10 flex-1"
                        required
                      />

                      {/* 右侧：3个快捷按钮 */}
                      <div className="flex gap-1">
                        {SIMPLE_TIME_PERIODS.map((period) => (
                          <button
                            key={period.value}
                            type="button"
                            onClick={() => {
                              handleChange('timeOfDay', period.value);
                              handleChange('exactTime', period.defaultTime);
                            }}
                            className={`px-3 py-2 text-xs rounded border-2 transition-all whitespace-nowrap ${
                              formData.timeOfDay === period.value
                                ? 'border-primary bg-primary/5 text-primary font-medium'
                                : 'border-border hover:border-primary/50 hover:bg-accent'
                            }`}
                            title={tForm(
                              `time${period.value.charAt(0).toUpperCase() + period.value.slice(1)}Tooltip` as any
                            )}
                          >
                            {tForm(
                              `time${period.value.charAt(0).toUpperCase() + period.value.slice(1)}` as any
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 第四行: 风水信息折叠区 */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setShowHouseInfo(!showHouseInfo)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <HomeIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {tForm('addFengshuiInfo')}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${showHouseInfo ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showHouseInfo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 p-3 bg-muted/20 rounded-lg border border-border"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              {tForm('houseDirection')}
                            </Label>
                            <Select
                              value={houseInfo.direction}
                              onValueChange={(value) =>
                                handleHouseChange('direction', value)
                              }
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue
                                  placeholder={tForm('selectDirection')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="north">
                                  {tForm('directionNorth')}
                                </SelectItem>
                                <SelectItem value="south">
                                  {tForm('directionSouth')}
                                </SelectItem>
                                <SelectItem value="east">
                                  {tForm('directionEast')}
                                </SelectItem>
                                <SelectItem value="west">
                                  {tForm('directionWest')}
                                </SelectItem>
                                <SelectItem value="northeast">
                                  {tForm('directionNortheast')}
                                </SelectItem>
                                <SelectItem value="northwest">
                                  {tForm('directionNorthwest')}
                                </SelectItem>
                                <SelectItem value="southeast">
                                  {tForm('directionSoutheast')}
                                </SelectItem>
                                <SelectItem value="southwest">
                                  {tForm('directionSouthwest')}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              {tForm('roomCountLabel')}
                            </Label>
                            <Select
                              value={houseInfo.roomCount}
                              onValueChange={(value) =>
                                handleHouseChange('roomCount', value)
                              }
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue
                                  placeholder={tForm('roomCountPlaceholder')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num}
                                    {tForm('roomSuffix')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              {tForm('completionYear')}
                            </Label>
                            <Input
                              placeholder={tForm('completionYearPlaceholder')}
                              value={houseInfo.completionYear}
                              onChange={(e) =>
                                handleHouseChange(
                                  'completionYear',
                                  e.target.value
                                )
                              }
                              className="h-9 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">
                              {tForm('completionMonth')}
                            </Label>
                            <Select
                              value={houseInfo.completionMonth}
                              onValueChange={(value) =>
                                handleHouseChange('completionMonth', value)
                              }
                            >
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue
                                  placeholder={tForm('monthPlaceholder')}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem
                                    key={month}
                                    value={month.toString()}
                                  >
                                    {month}
                                    {tForm('monthSuffix')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 提交按钮 */}
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {tForm('submitButton')}
                  </Button>

                  {/* 提示文本 */}
                  <p className="text-xs text-center text-muted-foreground">
                    {tForm('bottomHint')}
                  </p>
                </form>

                {/* 信任标记 - 移动端 */}
                <div className="mt-6 pt-6 border-t border-border lg:hidden">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-primary">★★★★★</span>
                      <span className="text-muted-foreground ml-1">4.9/5</span>
                    </div>
                    <span className="text-muted-foreground">
                      {tForm('mobileUsers')}
                    </span>
                    <span className="text-primary font-semibold">
                      {tForm('mobileAccuracy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
