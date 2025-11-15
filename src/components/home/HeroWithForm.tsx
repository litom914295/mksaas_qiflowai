'use client';

import { Badge } from '@/components/ui/badge';
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
import { Switch } from '@/components/ui/switch';
import { LocaleLink, useLocaleRouter } from '@/i18n/navigation';
import { getDirectionFromDegrees } from '@/lib/qiflow/xuankong/converters';
import {
  type Mountain,
  TwentyFourMountainsAnalyzer,
  MOUNTAIN_DEGREES,
} from '@/lib/qiflow/xuankong/twenty-four-mountains';
import {
  SIMPLE_TIME_PERIODS,
  type TIME_PERIODS,
  getDefaultTimeForPeriod,
  getDefaultTimeForSimplePeriod,
} from '@/lib/time-constants';
import { Routes } from '@/routes';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Compass,
  FileText,
  Home as HomeIcon,
  MapPin,
  RotateCcw,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import CountUp from 'react-countup';

const CompassPickerDialog = dynamic(
  () =>
    import('@/components/compass/compass-picker-dialog').then(
      (m) => m.CompassPickerDialog
    ),
  { ssr: false }
);

// 创建24山分析器单例
const analyzer = new TwentyFourMountainsAnalyzer();

// 24山常量数组（与库保持一致）
const TWENTY_FOUR_MOUNTAINS: Mountain[] = [
  '壬',
  '子',
  '癸', // 北方三山
  '丑',
  '艮',
  '寅', // 东北三山
  '甲',
  '卯',
  '乙', // 东方三山
  '辰',
  '巽',
  '巳', // 东南三山
  '丙',
  '午',
  '丁', // 南方三山
  '未',
  '坤',
  '申', // 西南三山
  '庚',
  '酉',
  '辛', // 西方三山
  '戌',
  '乾',
  '亥', // 西北三山
];

// 工具函数
function normalizeDeg(n: number): number {
  const r = Math.round(n) % 360;
  return r >= 0 ? r : r + 360;
}

function oppositeDeg(d: number): number {
  return (normalizeDeg(d) + 180) % 360;
}

function degreeToMountain(deg: number): Mountain | undefined {
  const m = analyzer.getMountainByDegree(normalizeDeg(deg));
  return typeof m === 'string' ? (m as Mountain) : undefined;
}

function buildSittingFacing(deg: number) {
  const facing = degreeToMountain(deg);
  const sitting = degreeToMountain(oppositeDeg(deg));
  const label = sitting && facing ? `${sitting}山${facing}向` : '';
  return { sitting, facing, label };
}

function getCoarseDirectionLabel(deg?: number): string {
  if (deg == null || Number.isNaN(deg)) return '';
  try {
    return getDirectionFromDegrees
      ? getDirectionFromDegrees(deg)
      : ['北', '东北', '东', '东南', '南', '西南', '西', '西北'][
          Math.round(normalizeDeg(deg) / 45) % 8
        ];
  } catch {
    return '';
  }
}

type CalendarType = 'solar' | 'lunar';
type CompassMeta = { northRef?: 'magnetic' | 'true'; declination?: number };
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
  direction: string; // 旧字段，保留兼容
  roomCount: string;
  completionYear: string;
  completionMonth: string;
  directionDegree?: string; // 真北参考角度，字符串便于受控输入
  northRef?: 'magnetic' | 'true';
  declination?: number;
  sittingMountain?: Mountain; // 坐山（24山）
  facingMountain?: Mountain; // 朝向（24山）
  sittingFacingLabel?: string; // 组合标签，如“子山午向”
}

export function HeroWithForm() {
  const t = useTranslations('BaziHome');
  const tForm = useTranslations('form');
  const router = useLocaleRouter();
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
  const [compassOpen, setCompassOpen] = useState(false);
  const [autoFollowCompass, setAutoFollowCompass] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 加载最近一次的表单数据
  useEffect(() => {
    setIsVisible(true);

    // 尝试从多个来源加载数据
    try {
      let parsed = null;

      // 1. 优先从 sessionStorage 读取（当前会话数据）
      const sessionData = sessionStorage.getItem('analysisFormData');
      if (sessionData) {
        parsed = JSON.parse(sessionData);
        console.log('[加载表单] 从 sessionStorage 加载数据');
      }

      // 2. 如果 sessionStorage 没有，则从 localStorage 的历史记录读取最近一次
      if (!parsed) {
        const historyData = localStorage.getItem('formHistory');
        if (historyData) {
          const history = JSON.parse(historyData);
          if (Array.isArray(history) && history.length > 0) {
            parsed = history[0]; // 取最近一次的记录
            console.log('[加载表单] 从 localStorage formHistory 加载数据');
          }
        }
      }

      // 如果找到了数据，填充表单
      if (parsed?.personal) {
        // 解析日期，去掉前导零
        const [year, month, day] = parsed.personal.birthDate.split('-');
        console.log('[加载表单] 日期解析:', { year, month, day });

        setFormData({
          name: parsed.personal.name || '',
          gender: parsed.personal.gender || 'female',
          birthYear: year || '',
          birthMonth: String(Number.parseInt(month, 10)) || '', // 去掉前导零
          birthDay: String(Number.parseInt(day, 10)) || '', // 去掉前导零
          timeOfDay: 'exact', // 自动设置为精确模式
          timePeriod: 'chen',
          exactTime: parsed.personal.birthTime || '08:00',
          birthCity: parsed.personal.birthCity || '',
          calendarType: parsed.personal.calendarType || 'solar',
        });

        console.log('[加载表单] ✅ 表单数据已加载');

        // 如果有房屋信息，也加载
        if (
          parsed.house &&
          (parsed.house.direction || parsed.house.directionDegree)
        ) {
          setHouseInfo({
            direction: parsed.house.direction || '',
            roomCount: parsed.house.roomCount || '',
            completionYear: parsed.house.completionYear || '',
            completionMonth: parsed.house.completionMonth || '',
            directionDegree: parsed.house.directionDegree?.toString() || '',
            northRef: parsed.house.northRef,
            declination: parsed.house.declination,
            sittingMountain: parsed.house.sittingMountain,
            facingMountain: parsed.house.facingMountain,
            sittingFacingLabel: parsed.house.sittingFacingLabel,
          });
          setShowHouseInfo(true);
          console.log('[加载表单] ✅ 房屋信息已加载');
        }
      } else {
        console.log('[加载表单] 没有找到保存的数据');
      }
    } catch (e) {
      console.error('[加载表单] 加载失败:', e);
    }
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
    console.log('[表单提交] 开始提交', { formData, canSubmit, isSubmitting });

    if (!canSubmit) {
      console.log('[表单提交] 验证失败，缺少必填项');
      alert(t('alertFillRequired'));
      return;
    }

    // 防止重复提交
    if (isSubmitting) {
      console.log('[表单提交] 正在提交中，跳过');
      return;
    }

    setIsSubmitting(true);
    console.log('[表单提交] 设置提交状态为true');

    try {
      // 转换为旧格式的日期和时间
      const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}`;
      console.log('[表单提交] 生成日期:', birthDate);
      let birthTime = '';

      if (formData.timeOfDay === 'exact' && formData.exactTime) {
        // 用户选择了精确时间
        birthTime = formData.exactTime;
      } else {
        // 根据简化时段获取默认时间
        birthTime = getDefaultTimeForSimplePeriod(formData.timeOfDay);
      }

      // 准备传递给报告页面的数据
      const degreeNum = Number(houseInfo.directionDegree);
      const persistedHouse = showHouseInfo
        ? {
            ...houseInfo,
            direction:
              houseInfo.direction || getCoarseDirectionLabel(degreeNum) || '',
            directionDegree: Number.isNaN(degreeNum) ? undefined : degreeNum,
            northRef: houseInfo.northRef,
            declination: houseInfo.declination,
            sittingMountain: houseInfo.sittingMountain,
            facingMountain: houseInfo.facingMountain,
            sittingFacingLabel: houseInfo.sittingFacingLabel,
          }
        : {
            direction: '',
            roomCount: '',
            completionYear: '',
            completionMonth: '',
          };

      const reportData = {
        personal: {
          name: formData.name,
          birthDate,
          birthTime,
          gender: formData.gender,
          birthCity: formData.birthCity || '',
          calendarType: 'solar' as const,
        },
        house: persistedHouse,
      };

      console.log('[表单提交] 准备保存数据:', reportData);

      // 保存到 sessionStorage 和 localStorage
      sessionStorage.setItem('analysisFormData', JSON.stringify(reportData));
      console.log('[表单提交] 数据已保存到sessionStorage');

      try {
        const existingHistory = localStorage.getItem('formHistory') || '[]';
        const history = JSON.parse(existingHistory);
        history.unshift({ ...reportData, timestamp: Date.now() });
        localStorage.setItem(
          'formHistory',
          JSON.stringify(history.slice(0, 5))
        );
      } catch (e) {
        console.error('保存历史失败:', e);
      }

      // 跳转到报告页面（不在URL中传递数据，使用sessionStorage）
      console.log('[表单提交] 准备跳转到/report');
      router.push('/report');
      console.log('[表单提交] router.push已调用');
    } catch (error) {
      // 如果出错，重置提交状态
      console.error('[表单提交] 提交失败:', error);
      setIsSubmitting(false);
      alert(tForm('submitError') || '提交失败，请重试');
    }
  };

  // 处理字段变化
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 处理房屋信息变化
  const handleHouseChange = (
    field: keyof HouseInfo,
    value: string | number
  ) => {
    setHouseInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 应用罗盘度数并更新坐山朝向
  const applyDegreeFromCompass = (
    deg: number,
    meta?: CompassMeta,
    follow = autoFollowCompass
  ) => {
    const d = normalizeDeg(deg);
    setHouseInfo((prev) => {
      const next: HouseInfo = {
        ...prev,
        directionDegree: String(d),
        northRef: meta?.northRef ?? prev.northRef ?? 'true',
        declination: meta?.declination ?? prev.declination,
      };
      if (follow) {
        const { sitting, facing, label } = buildSittingFacing(d);
        next.sittingMountain = sitting;
        next.facingMountain = facing;
        next.sittingFacingLabel = label;
        next.direction = getCoarseDirectionLabel(d) || prev.direction || '';
      }
      return next;
    });
  };

  // 处理度数输入框失焦
  const handleDegreeBlur = () => {
    const parsed = Number(houseInfo.directionDegree);
    if (!Number.isNaN(parsed)) {
      if (autoFollowCompass) {
        applyDegreeFromCompass(parsed, undefined, true);
      } else {
        setHouseInfo((prev) => ({
          ...prev,
          directionDegree: String(normalizeDeg(parsed)),
        }));
      }
    }
  };

  // 切换自动跟随罗盘
  const handleAutoFollowToggle = (checked: boolean) => {
    setAutoFollowCompass(checked);
    if (checked && houseInfo.directionDegree) {
      const deg = Number(houseInfo.directionDegree);
      if (!Number.isNaN(deg)) {
        applyDegreeFromCompass(deg, undefined, true);
      }
    }
  };

  // 生成v2.2专业报告
  const handleGenerateReport = async () => {
    // 优先检查是否正在提交，避免重复点击
    if (isSubmitting) {
      console.log('[Generate Report] 已在生成中，忽略重复点击');
      return;
    }

    if (!canSubmit) {
      alert(t('alertFillRequired') || '请填写所有必填项');
      return;
    }

    // 立即设置提交状态，防止重复点击
    setIsSubmitting(true);
    console.log('[Generate Report] 开始生成报告...');

    try {
      // 准备报告数据
      const birthDate = `${formData.birthYear}-${String(formData.birthMonth).padStart(2, '0')}-${String(formData.birthDay).padStart(2, '0')}`;
      let birthTime = '';

      if (formData.timeOfDay === 'exact' && formData.exactTime) {
        birthTime = formData.exactTime;
      } else {
        birthTime = getDefaultTimeForSimplePeriod(formData.timeOfDay);
      }

      const degreeNum = Number(houseInfo.directionDegree);
      const requestBody = {
        personal: {
          name: formData.name,
          gender: formData.gender,
          birthDate,
          birthTime,
          birthCity: formData.birthCity || '',
        },
        house: showHouseInfo
          ? {
              direction: houseInfo.direction || getCoarseDirectionLabel(degreeNum) || '',
              directionDegree: Number.isNaN(degreeNum) ? undefined : degreeNum,
            }
          : undefined,
        userContext: {},
      };

      // 将数据保存到 sessionStorage，便于登录后继续
      try {
        sessionStorage.setItem('analysisFormData', JSON.stringify({ personal: requestBody.personal, house: requestBody.house }));
      } catch {}

      // 调用v2.2报告生成API
      console.log('[Generate Report] 发送请求:', requestBody);
      const response = await fetch('/api/reports/v2-2/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('[Generate Report] 响应状态:', response.status);
      if (response.status === 401) {
        // 未登录：跳转到登录，回调返回当前页面
        const callbackUrl = encodeURIComponent(window.location.pathname);
        // 使用本地化路由器，确保语言前缀正确
        router.push(`/login?callbackUrl=${callbackUrl}`);
        return;
      }

      const result = await response.json();
      console.log('[Generate Report] 响应数据:', result);

      if (result.success && result.viewUrl) {
        // 使用路由器导航到报告页面，避免浏览器阻止弹窗
        console.log('[Generate Report] 报告生成成功，准备跳转到:', result.viewUrl);
        console.log('[Generate Report] (next-intl router will add locale prefix automatically)');
        router.push(result.viewUrl);
        // 使用 router.push 自动处理locale
        router.push(result.viewUrl);
      } else {
        // 安全地提取错误信息
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : result.error?.message || 'generate_failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('生成报告失败:', error);
      // 安全地提取错误消息
      const errorMessage = error instanceof Error 
        ? error.message 
        : (typeof error === 'string' ? error : '请重试');
      alert(`生成报告失败：${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
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
              <CardContent className="p-4 lg:p-5">
                {/* 表单头部 - 精简版 */}
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {tForm('title')}
                  </h2>
                  {/* 清空表单按钮 */}
                  {(formData.name || formData.birthYear) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          name: '',
                          gender: 'female',
                          birthYear: '',
                          birthMonth: '',
                          birthDay: '',
                          timeOfDay: 'morning',
                          timePeriod: 'chen',
                          exactTime: '08:00',
                          birthCity: '',
                          calendarType: 'solar',
                        });
                        setHouseInfo({
                          direction: '',
                          roomCount: '',
                          completionYear: '',
                          completionMonth: '',
                        });
                        setShowHouseInfo(false);
                        sessionStorage.removeItem('analysisFormData');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
                      title="清空表单"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>重置</span>
                    </button>
                  )}
                </div>

                {/* 表单内容 */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* 第一行: 姓名 + 性别 + 城市 */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-4 space-y-1.5">
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
                        autoComplete="name"
                        placeholder={tForm('namePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="h-8 text-sm"
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
                        className="flex gap-2 h-8 items-center"
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
                        autoComplete="address-level2"
                        placeholder={tForm('birthCityPlaceholder')}
                        value={formData.birthCity}
                        onChange={(e) =>
                          handleChange('birthCity', e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* 第二行: 出生日期时间 (年月日+时间一行) */}
                  <div className="space-y-2">
                    {/* 标签行：日期+阴阳历 + 时间标签 */}
                    <div className="flex items-center justify-between gap-4">
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
                      <Label className="text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3.5 h-3.5" />
                        {tForm('birthTime')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    
                    {/* 年月日+时间+快捷按钮 */}
                    <div className="flex flex-wrap gap-2">
                      {/* 年月日 */}
                      <div className="flex gap-2 flex-1 min-w-0">
                        <Select
                          value={formData.birthYear}
                          onValueChange={(value) =>
                            handleChange('birthYear', value)
                          }
                        >
                          <SelectTrigger className="h-8 text-sm flex-1">
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
                          <SelectTrigger className="h-8 text-sm flex-1">
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
                          <SelectTrigger className="h-8 text-sm flex-1">
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
                      
                      {/* 时间选择器 */}
                      <Input
                        type="time"
                        autoComplete="off"
                        value={formData.exactTime}
                        onChange={(e) => {
                          handleChange('exactTime', e.target.value);
                          handleChange('timeOfDay', 'exact');
                        }}
                        className="h-8 text-sm w-[110px]"
                        required
                      />

                      {/* 快捷按钮 */}
                      <div className="flex gap-1">
                        {SIMPLE_TIME_PERIODS.map((period) => (
                          <button
                            key={period.value}
                            type="button"
                            onClick={() => {
                              handleChange('timeOfDay', period.value);
                              handleChange('exactTime', period.defaultTime);
                            }}
                            className={`px-2.5 py-2 text-xs rounded border-2 transition-all whitespace-nowrap ${
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
                    
                    {formData.calendarType === 'lunar' && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>🌙</span>
                        <span>{tForm('lunarNote')}</span>
                      </p>
                    )}
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
                        <div className="space-y-2">
                          {/* 房屋朝向度数和罗盘 + 跟随开关 */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <Label className="text-xs flex items-center gap-1.5 font-medium">
                                <Compass className="w-3.5 h-3.5 text-primary" />
                                房屋朝向
                              </Label>
                              {/* 跟随罗盘开关 - 紧凑版 */}
                              <div className="flex items-center gap-1.5">
                                <Label
                                  htmlFor="auto-follow"
                                  className="text-xs font-medium cursor-pointer text-muted-foreground"
                                >
                                  {tForm('followCompass')}
                                </Label>
                                <Switch
                                  id="auto-follow"
                                  checked={autoFollowCompass}
                                  onCheckedChange={handleAutoFollowToggle}
                                  className="data-[state=checked]:bg-primary scale-90"
                                />
                              </div>
                            </div>
                            
                            {/* 24山下拉、度数输入、罗盘按钮 - 同一行 */}
                            <div className="flex items-center gap-2">
                              {/* 24山下拉 */}
                              <Select
                                value={
                                  houseInfo.directionDegree
                                    ? ((degreeToMountain(
                                        Number(houseInfo.directionDegree)
                                      ) || '') as any)
                                    : ''
                                }
                                onValueChange={(value) => {
                                  const m = value as Mountain;
                                  const center = MOUNTAIN_DEGREES[m]?.center;
                                  if (typeof center === 'number') {
                                    applyDegreeFromCompass(center, undefined, autoFollowCompass);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-9 text-sm w-[100px] px-2">
                                  <SelectValue placeholder="选择坐山" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[260px]">
                                  {TWENTY_FOUR_MOUNTAINS.map((m) => {
                                    const center = MOUNTAIN_DEGREES[m]?.center;
                                    const facing = typeof center === 'number' ? degreeToMountain(oppositeDeg(center)) : undefined;
                                    const label = `${m}山${facing ?? ''}向`;
                                    return (
                                      <SelectItem key={m} value={m} className="text-sm">
                                        {label}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>

                              {/* 度数输入 */}
                              <div className="relative flex-1">
                                <Input
                                  type="number"
                                  autoComplete="off"
                                  placeholder="度数"
                                  value={houseInfo.directionDegree || ''}
                                  onChange={(e) =>
                                    handleHouseChange(
                                      'directionDegree',
                                      e.target.value
                                    )
                                  }
                                  onBlur={handleDegreeBlur}
                                  min="0"
                                  max="360"
                                  className="h-9 text-sm px-3 pr-8 border-primary/30 focus:border-primary"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                  °
                                </span>
                              </div>

                              {/* 罗盘按钮 */}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setCompassOpen(true)}
                                className="h-9 px-3 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all group"
                                title="打开罗盘定位"
                              >
                                <Compass className="w-4 h-4 text-primary group-hover:rotate-45 transition-transform" />
                                <span className="ml-1.5 text-xs font-medium">
                                  罗盘
                                </span>
                              </Button>
                            </div>

                            {/* 合并后的信息显示 - 精简版 */}
                            {houseInfo.directionDegree && (
                              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                <span className="flex items-center gap-1">
                                  <span className="inline-block w-1 h-1 rounded-full bg-primary/60" />
                                  {houseInfo.directionDegree}° ({
                                    getCoarseDirectionLabel(
                                      Number(houseInfo.directionDegree)
                                    )
                                  }方向)
                                </span>
                                {houseInfo.sittingFacingLabel && (
                                  <span className="font-medium text-primary">
                                    {houseInfo.sittingFacingLabel}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* 手动选择（关闭跟随时） */}
                          {!autoFollowCompass && (
                            <div className="space-y-2">
                              {/* 8方位选择 */}
                              <div className="space-y-1">
                                <Label className="text-xs">八方位选择</Label>
                                <Select
                                  value={houseInfo.direction}
                                  onValueChange={(value) => {
                                    handleHouseChange('direction', value);
                                  }}
                                >
                                  <SelectTrigger className="h-8 text-sm px-2">
                                    <SelectValue placeholder="选择方位" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem
                                      value="north"
                                      className="text-sm"
                                    >
                                      北（坐南向北）
                                    </SelectItem>
                                    <SelectItem
                                      value="northeast"
                                      className="text-sm"
                                    >
                                      东北（坐西南向东北）
                                    </SelectItem>
                                    <SelectItem
                                      value="east"
                                      className="text-sm"
                                    >
                                      东（坐西向东）
                                    </SelectItem>
                                    <SelectItem
                                      value="southeast"
                                      className="text-sm"
                                    >
                                      东南（坐西北向东南）
                                    </SelectItem>
                                    <SelectItem
                                      value="south"
                                      className="text-sm"
                                    >
                                      南（坐北向南）
                                    </SelectItem>
                                    <SelectItem
                                      value="southwest"
                                      className="text-sm"
                                    >
                                      西南（坐东北向西南）
                                    </SelectItem>
                                    <SelectItem
                                      value="west"
                                      className="text-sm"
                                    >
                                      西（坐东向西）
                                    </SelectItem>
                                    <SelectItem
                                      value="northwest"
                                      className="text-sm"
                                    >
                                      西北（坐东南向西北）
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* 24山选择 */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    {tForm('sitting')}
                                  </Label>
                                  <Select
                                    value={houseInfo.sittingMountain || ''}
                                    onValueChange={(value) => {
                                      const sitting = value as Mountain;
                                      const facing = houseInfo.facingMountain;
                                      const label =
                                        sitting && facing
                                          ? `${sitting}山${facing}向`
                                          : '';
                                      setHouseInfo((prev) => ({
                                        ...prev,
                                        sittingMountain: sitting,
                                        sittingFacingLabel: label,
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-sm px-2">
                                      <SelectValue placeholder="选择坐山" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[240px]">
                                      {TWENTY_FOUR_MOUNTAINS.map((m) => (
                                        <SelectItem
                                          key={m}
                                          value={m}
                                          className="text-sm"
                                        >
                                          {m}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">
                                    {tForm('facing')}
                                  </Label>
                                  <Select
                                    value={houseInfo.facingMountain || ''}
                                    onValueChange={(value) => {
                                      const facing = value as Mountain;
                                      const sitting = houseInfo.sittingMountain;
                                      const label =
                                        sitting && facing
                                          ? `${sitting}山${facing}向`
                                          : '';
                                      setHouseInfo((prev) => ({
                                        ...prev,
                                        facingMountain: facing,
                                        sittingFacingLabel: label,
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="h-8 text-sm px-2">
                                      <SelectValue placeholder="选择朝向" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[240px]">
                                      {TWENTY_FOUR_MOUNTAINS.map((m) => (
                                        <SelectItem
                                          key={m}
                                          value={m}
                                          className="text-sm"
                                        >
                                          {m}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 建成年份 + 房间数 */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs">
                                {tForm('completionYear')}
                              </Label>
                              <Input
                                autoComplete="off"
                                placeholder={tForm('completionYearPlaceholder')}
                                value={houseInfo.completionYear}
                                onChange={(e) =>
                                  handleHouseChange(
                                    'completionYear',
                                    e.target.value
                                  )
                                }
                                className="h-8 text-sm px-2"
                              />
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
                                <SelectTrigger className="h-8 text-sm px-2">
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
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 提交按钮区域 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 开始分析按钮 */}
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="h-11 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            className="absolute inset-0 bg-primary/20"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: 'linear',
                            }}
                          />
                          <div className="relative flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 1,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: 'linear',
                              }}
                            >
                              <Sparkles className="w-4 h-4" />
                            </motion.div>
                            <span>正在分析...</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {tForm('submitButton')}
                        </>
                      )}
                    </Button>

                    {/* 生成报告按钮 */}
                    <Button
                      type="button"
                      disabled={!canSubmit || isSubmitting}
                      onClick={handleGenerateReport}
                      variant="outline"
                      className="h-11 text-base font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      生成报告
                    </Button>
                  </div>

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

      {/* 罗盘拾取器弹窗 */}
      {compassOpen && (
        <CompassPickerDialog
          open={compassOpen}
          onOpenChange={setCompassOpen}
          value={Number.parseInt(houseInfo.directionDegree || '0') || 0}
          onChange={(deg, meta) => {
            applyDegreeFromCompass(deg, meta as CompassMeta);
          }}
          onConfirm={(deg) => {
            applyDegreeFromCompass(deg, undefined);
            setCompassOpen(false);
          }}
          snapStep={1}
        />
      )}
    </section>
  );
}
