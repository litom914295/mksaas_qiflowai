'use client';

import { claimABTestRewardAction } from '@/actions/qiflow/claim-ab-test-reward';
import { purchaseReportWithCreditsAction } from '@/actions/qiflow/purchase-report-with-credits';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { QIFLOW_PRICING } from '@/config/qiflow-pricing';
import { useToast } from '@/hooks/use-toast';
import { abTestManager } from '@/lib/ab-test/manager';
import { calculateBaziElements } from '@/lib/qiflow/bazi';
import {
  type ThemeId,
  explainRecommendation,
  getDefaultThemes,
  recommendThemes,
} from '@/lib/qiflow/theme-recommendation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Gift,
  MapPin,
  Sparkles,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PaywallOverlay } from './paywall-overlay';

type PrefillData = {
  birthDate?: string;
  birthHour?: string;
  gender?: 'male' | 'female';
  location?: string;
};

type Props = {
  userId: string;
  userCredits: number;
  prefillData?: PrefillData;
};

// 时辰选项 (23 个时辰)
const HOUR_OPTIONS = [
  { value: '23', label: '子时 (23:00-00:59)' },
  { value: '01', label: '丑时 (01:00-02:59)' },
  { value: '03', label: '寅时 (03:00-04:59)' },
  { value: '05', label: '卯时 (05:00-06:59)' },
  { value: '07', label: '辰时 (07:00-08:59)' },
  { value: '09', label: '巳时 (09:00-10:59)' },
  { value: '11', label: '午时 (11:00-12:59)' },
  { value: '13', label: '未时 (13:00-14:59)' },
  { value: '15', label: '申时 (15:00-16:59)' },
  { value: '17', label: '酉时 (17:00-18:59)' },
  { value: '19', label: '戌时 (19:00-20:59)' },
  { value: '21', label: '亥时 (21:00-22:59)' },
];

// 主题选项
const THEME_OPTIONS = [
  { id: 'career', label: '事业财运', description: '职业发展、财富机遇' },
  { id: 'relationship', label: '感情姻缘', description: '爱情婚姻、人际关系' },
  { id: 'health', label: '健康养生', description: '身体状况、养生建议' },
  { id: 'education', label: '学业智慧', description: '学习发展、智慧提升' },
  { id: 'family', label: '家庭子女', description: '家庭和睦、子女教育' },
];

export function EssentialReportPurchasePage({
  userId,
  userCredits,
  prefillData,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    birthDate: prefillData?.birthDate || '',
    birthHour: prefillData?.birthHour || '',
    gender: prefillData?.gender || ('' as 'male' | 'female' | ''),
    location: prefillData?.location || '',
    selectedThemes: [] as string[],
  });

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [validationError, setValidationError] = useState('');

  // A/B 测试相关状态
  const [variant, setVariant] = useState<string | null>(null);
  const [recommendedThemes, setRecommendedThemes] = useState<ThemeId[]>([]);
  const [recommendationExplanation, setRecommendationExplanation] =
    useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [hasAdoptedRecommendation, setHasAdoptedRecommendation] =
    useState(false);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const price = QIFLOW_PRICING.reportEssential;

  // 加载 A/B 测试变体和推荐
  useEffect(() => {
    async function loadVariantAndRecommendation() {
      try {
        // 获取用户变体
        const variantResult = await abTestManager.getVariant({
          experimentName: 'theme_recommendation_v1',
          userId: userId,
        });

        if (variantResult) {
          setVariant(variantResult.variantId);

          // 追踪查看推荐事件
          await abTestManager.trackEvent({
            experimentName: 'theme_recommendation_v1',
            userId: userId,
            eventType: 'recommendation_view',
            eventData: { variant: variantResult.variantId },
          });

          // 如果是智能推荐组，且已填写必要信息
          if (
            variantResult.variantId === 'variant_a' &&
            formData.birthDate &&
            formData.gender
          ) {
            try {
              // 计算八字五行
              const elements = calculateBaziElements(
                formData.birthDate,
                formData.birthHour || '09'
              );

              // 生成智能推荐
              const themes = recommendThemes({
                birthDate: formData.birthDate,
                gender: formData.gender,
                elements,
              });

              const explanation = explainRecommendation({
                birthDate: formData.birthDate,
                gender: formData.gender,
                elements,
              });

              setRecommendedThemes(themes);
              setRecommendationExplanation(explanation);
              setShowRecommendation(true);
            } catch (error) {
              console.error('Failed to generate recommendations:', error);
              // 降级到默认推荐
              setRecommendedThemes(getDefaultThemes());
              setShowRecommendation(false);
            }
          } else {
            // 对照组显示默认推荐（但不高亮显示）
            setRecommendedThemes(getDefaultThemes());
            setShowRecommendation(false);
          }
        }
      } catch (error) {
        console.error('Failed to load A/B test variant:', error);
      }
    }

    if (userId) {
      loadVariantAndRecommendation();
    }
  }, [userId, formData.birthDate, formData.gender, formData.birthHour]);

  // 采纳推荐
  async function handleAdoptRecommendation() {
    setFormData({
      ...formData,
      selectedThemes: recommendedThemes,
    });
    setHasAdoptedRecommendation(true);
    setShowRewardNotification(true);

    // 追踪采纳事件
    try {
      await abTestManager.trackEvent({
        experimentName: 'theme_recommendation_v1',
        userId: userId,
        eventType: 'recommendation_adopted',
        eventData: { adoptedThemes: recommendedThemes },
      });
    } catch (error) {
      console.error('Failed to track recommendation adoption:', error);
    }
  }

  // 领取奖励
  async function handleClaimReward() {
    try {
      const result = await claimABTestRewardAction({
        experimentName: 'theme_recommendation_v1',
      });

      if (result.success) {
        setRewardClaimed(true);
        toast({
          title: '奖励已发放！',
          description: `您获得了 ${result.creditsEarned} 积分`,
        });
        // 3 秒后隐藏通知
        setTimeout(() => setShowRewardNotification(false), 3000);
      } else {
        toast({
          title: '领取失败',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
      toast({
        title: '领取失败',
        description: '系统错误，请稍后重试',
        variant: 'destructive',
      });
    }
  }

  // 表单验证
  function validateForm(): boolean {
    if (!formData.birthDate) {
      setValidationError('请输入出生日期');
      return false;
    }
    if (!formData.birthHour) {
      setValidationError('请选择出生时辰');
      return false;
    }
    if (!formData.gender) {
      setValidationError('请选择性别');
      return false;
    }
    if (!formData.location) {
      setValidationError('请输入出生地');
      return false;
    }
    if (formData.selectedThemes.length !== 3) {
      setValidationError('请选择 3 个主题');
      return false;
    }

    setValidationError('');
    return true;
  }

  // 处理主题选择
  function handleThemeToggle(themeId: string) {
    setFormData((prev) => {
      const currentThemes = prev.selectedThemes;
      const wasRecommended = recommendedThemes.includes(themeId as ThemeId);

      if (currentThemes.includes(themeId)) {
        // 取消选择
        return {
          ...prev,
          selectedThemes: currentThemes.filter((id) => id !== themeId),
        };
      }
      if (currentThemes.length < 3) {
        // 添加选择 (最多 3 个)
        const newThemes = [...currentThemes, themeId];

        // 如果修改了推荐，追踪事件
        if (
          showRecommendation &&
          !arraysEqual(
            newThemes.slice().sort(),
            recommendedThemes.slice().sort()
          )
        ) {
          abTestManager
            .trackEvent({
              experimentName: 'theme_recommendation_v1',
              userId: userId,
              eventType: 'recommendation_modified',
              eventData: {
                recommendedThemes,
                selectedThemes: newThemes,
              },
            })
            .catch(console.error);
        }

        return {
          ...prev,
          selectedThemes: newThemes,
        };
      }

      return prev;
    });
  }

  // 辅助函数：比较数组是否相等
  function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // 预览报告 (显示 Paywall)
  function handlePreview() {
    if (!validateForm()) {
      return;
    }
    setShowPaywall(true);
  }

  // 执行购买
  async function handlePurchase() {
    setIsPurchasing(true);

    try {
      const result = await purchaseReportWithCreditsAction({
        reportType: 'essential',
        input: {
          birthDate: formData.birthDate,
          birthHour: formData.birthHour,
          gender: formData.gender as 'male' | 'female',
          location: formData.location,
          themes: formData.selectedThemes,
        },
        selectedThemes: formData.selectedThemes,
      });

      if (!result.success) {
        if (result.errorCode === 'INSUFFICIENT_CREDITS') {
          toast({
            title: '积分不足',
            description: '您的积分余额不足，请先充值',
            variant: 'destructive',
          });
          router.push('/credits/buy');
          return;
        }

        toast({
          title: '购买失败',
          description: result.error || '未知错误，请稍后重试',
          variant: 'destructive',
        });
        return;
      }

      // 追踪转化事件
      try {
        await abTestManager.trackEvent({
          experimentName: 'theme_recommendation_v1',
          userId: userId,
          eventType: 'purchase_completed',
          eventData: {
            reportId: result.reportId,
            selectedThemes: formData.selectedThemes,
            adoptedRecommendation: hasAdoptedRecommendation,
          },
        });
      } catch (error) {
        console.error('Failed to track conversion:', error);
      }

      // 购买成功，跳转到报告详情页
      toast({
        title: '购买成功！',
        description: '报告已生成，正在为您跳转...',
      });

      router.push(`/reports/${result.data.reportId}`);
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: '系统错误',
        description: '购买过程中发生错误，请联系客服',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  }

  // 如果显示 Paywall
  if (showPaywall) {
    return (
      <div className="container max-w-6xl py-8">
        <Button
          variant="ghost"
          onClick={() => setShowPaywall(false)}
          className="mb-4"
        >
          ← 返回编辑
        </Button>

        <PaywallOverlay
          reportType="essential"
          userCredits={userCredits}
          price={price}
          onPurchase={handlePurchase}
          onRecharge={() => router.push('/credits/buy')}
          isPurchasing={isPurchasing}
          className="min-h-[600px] rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 页面标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            精华报告定制
          </h1>
          <p className="text-muted-foreground text-lg">
            AI 深度解析您的命理，提供个性化建议与指导
          </p>
        </div>

        {/* 价格卡片 */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">报告价格</p>
                <p className="text-3xl font-bold text-purple-900">
                  {price} <span className="text-lg">积分</span>
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                您的余额: {userCredits} 积分
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 表单 */}
        <Card>
          <CardHeader>
            <CardTitle>填写您的信息</CardTitle>
            <CardDescription>
              请准确填写您的出生信息，以获得精准的命理分析
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 出生日期 */}
            <div className="space-y-2">
              <Label htmlFor="birthDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                出生日期
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* 出生时辰 */}
            <div className="space-y-2">
              <Label htmlFor="birthHour" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                出生时辰
              </Label>
              <Select
                value={formData.birthHour}
                onValueChange={(value) =>
                  setFormData({ ...formData, birthHour: value })
                }
              >
                <SelectTrigger id="birthHour">
                  <SelectValue placeholder="选择时辰" />
                </SelectTrigger>
                <SelectContent>
                  {HOUR_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 性别 */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                性别
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: 'male' | 'female') =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 出生地 */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                出生地
              </Label>
              <Input
                id="location"
                placeholder="例如：北京市、上海市"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </div>

            <Separator />

            {/* 智能推荐卡片 */}
            <AnimatePresence>
              {showRecommendation && recommendedThemes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Sparkles className="w-5 h-5" />
                        AI 为您智能推荐
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {recommendationExplanation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {recommendedThemes.map((themeId) => {
                          const theme = THEME_OPTIONS.find(
                            (t) => t.id === themeId
                          );
                          return (
                            <Badge
                              key={themeId}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5"
                            >
                              {theme?.label}
                            </Badge>
                          );
                        })}
                      </div>

                      {!hasAdoptedRecommendation && (
                        <Button
                          variant="outline"
                          className="w-full border-blue-400 text-blue-700 hover:bg-blue-100"
                          onClick={handleAdoptRecommendation}
                        >
                          <Gift className="mr-2 h-4 w-4" />
                          采纳推荐 (奖励 10 积分)
                        </Button>
                      )}

                      {hasAdoptedRecommendation && (
                        <div className="flex items-center justify-center gap-2 text-green-700 font-medium">
                          <CheckCircle className="w-5 h-5" />
                          已采纳推荐
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 主题选择 */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                选择 3 个主题 ({formData.selectedThemes.length}/3)
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = formData.selectedThemes.includes(theme.id);
                  const isRecommended =
                    showRecommendation &&
                    recommendedThemes.includes(theme.id as ThemeId);
                  const isDisabled =
                    !isSelected && formData.selectedThemes.length >= 3;

                  return (
                    <Card
                      key={theme.id}
                      className={`cursor-pointer transition-all relative ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : isDisabled
                            ? 'opacity-50 cursor-not-allowed'
                            : isRecommended
                              ? 'border-blue-400 bg-blue-50 hover:border-blue-500'
                              : 'hover:border-purple-300'
                      }`}
                      onClick={() => !isDisabled && handleThemeToggle(theme.id)}
                    >
                      {isRecommended && !isSelected && (
                        <div className="absolute -top-2 -right-2">
                          <Badge className="bg-blue-600 text-xs">推荐</Badge>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-semibold">{theme.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {theme.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Badge className="bg-purple-600">已选</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* 验证错误提示 */}
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter>
            <Button
              onClick={handlePreview}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              下一步：购买报告
            </Button>
          </CardFooter>
        </Card>

        {/* 报告说明 */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">报告说明：</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 报告由 AI 深度解析生成，约需 10-15 秒</li>
              <li>• 购买后终身有效，可随时查看</li>
              <li>• 每个主题包含故事化解读和个性化建议</li>
              <li>• 如对报告不满意，支持 7 天内全额退款</li>
            </ul>
          </CardContent>
        </Card>

        {/* 奖励通知 */}
        <AnimatePresence>
          {showRewardNotification && !rewardClaimed && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-green-900 font-semibold">
                    <Gift className="w-5 h-5" />
                    恭喜您获得参与奖励！
                  </div>
                  <p className="text-sm text-muted-foreground">
                    感谢采纳推荐，点击领取 10 积分
                  </p>
                  <Button
                    onClick={handleClaimReward}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    立即领取
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
