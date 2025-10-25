'use client';

// P1-003: 即时体验表单组件（完整版）
// 功能：用户输入生日，获取八字分析预览

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useInstantPreview } from '@/hooks/useInstantPreview';
import { trackInstantTryUsage } from '@/lib/analytics/conversion-tracking';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Compass, ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { InstantResultEnhanced } from './InstantResultEnhanced';

const CompassPickerDialog = dynamic(
  () =>
    import('@/components/compass/compass-picker-dialog').then(
      (m) => m.CompassPickerDialog
    ),
  { ssr: false }
);

// 表单验证Schema
const formSchema = z.object({
  birthDate: z
    .string()
    .min(1, '请选择出生日期')
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式错误'),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, '时间格式错误')
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export const InstantTrySection = () => {
  const [result, setResult] = useState<any>(null);
  const { mutate: getPreview, isPending, error } = useInstantPreview();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
      birthTime: '',
    },
  });

  const onSubmit = (data: FormData) => {
    trackInstantTryUsage('date_selected');
    getPreview(
      {
        birthDate: data.birthDate,
        birthTime: data.birthTime || undefined,
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            setResult(response.data);
            trackInstantTryUsage('result_generated');
          }
        },
      }
    );
  };

  const handleReset = () => {
    setResult(null);
    reset();
  };

  return (
    <section className="py-16 bg-gradient-to-b from-purple-900/10 via-blue-900/10 to-purple-900/10">
      <div className="container max-w-4xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ✨ 免费即时体验
          </h2>
          <p className="text-muted-foreground text-lg">
            输入您的出生日期，立即获取专业八字分析预览
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              100%准确
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              无需注册
            </span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              即时生成
            </span>
          </div>
        </div>

        <Card className="p-6 md:p-8 shadow-xl border-2 border-purple-100 dark:border-purple-900">
          {!result ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 出生日期 */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-base font-semibold">
                  出生日期 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  className="text-lg h-12"
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-500">
                    {errors.birthDate.message}
                  </p>
                )}
              </div>

              {/* 出生时间（可选） */}
              <div className="space-y-2">
                <Label htmlFor="birthTime" className="text-base font-semibold">
                  出生时间{' '}
                  <span className="text-muted-foreground text-sm">
                    (可选，更准确)
                  </span>
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  {...register('birthTime')}
                  className="text-lg h-12"
                />
                {errors.birthTime && (
                  <p className="text-sm text-red-500">
                    {errors.birthTime.message}
                  </p>
                )}
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error.message || '分析失败，请稍后重试'}
                  </p>
                </div>
              )}

              {/* 提交按钮 */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    立即体验免费分析
                  </>
                )}
              </Button>

              {/* 隐私提示 */}
              <p className="text-xs text-center text-muted-foreground">
                我们重视您的隐私，所有数据均加密存储，不会用于其他用途
              </p>
            </form>
          ) : (
            <InstantResultEnhanced data={result} onReset={handleReset} />
          )}
        </Card>

        {/* 用户评价 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">127,843+</div>
            <div className="text-sm text-muted-foreground">用户已体验</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">4.9/5.0</div>
            <div className="text-sm text-muted-foreground">用户评分</div>
          </div>
          <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-muted-foreground">准确率</div>
          </div>
        </div>
      </div>
    </section>
  );
};
