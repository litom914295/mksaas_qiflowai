'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/enhanced-card';
import LoadingSpinner from '@/components/ui/enhanced-loading';
import ProgressBar from '@/components/ui/enhanced-progress';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Mail, MapPin, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AddressAutocomplete } from './address-autocomplete';
import { MapPicker } from './map-picker';

const profileSchema = z.object({
  displayName: z.string().min(1, '请输入名称').min(2, '名称至少2个字符'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  calendar: z.enum(['gregorian', 'lunar']).default('gregorian'),
  birthDate: z.string().min(1, '请选择日期'),
  birthTime: z.string().optional(),
  address: z.string().min(1, '请输入地址或选择位置'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  phone: z.string().optional(),
  showContactInfo: z.boolean().default(false),
});

export type EnhancedUserProfileFormProps = {
  defaultValues?: Partial<z.infer<typeof profileSchema>>;
  onSubmit?: (values: z.infer<typeof profileSchema>) => Promise<void> | void;
  isSubmitting?: boolean;
  showProgress?: boolean;
  mode?: 'registration' | 'profile' | 'guest';
};

export function EnhancedUserProfileForm(props: EnhancedUserProfileFormProps) {
  const {
    defaultValues,
    onSubmit,
    isSubmitting = false,
    showProgress = true,
    mode = 'profile',
  } = props;
  // const t = useTranslations('forms');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    trigger,
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema) as any,
    mode: 'onChange',
    defaultValues: {
      displayName: defaultValues?.displayName || '',
      gender: defaultValues?.gender || 'other',
      calendar: defaultValues?.calendar || 'gregorian',
      birthDate: defaultValues?.birthDate || '',
      birthTime: defaultValues?.birthTime || '',
      address: defaultValues?.address || '',
      latitude: defaultValues?.latitude,
      longitude: defaultValues?.longitude,
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      showContactInfo: defaultValues?.showContactInfo || false,
    },
  });

  const [openMap] = useState(false);
  const [showContactInfo] = useState(watch('showContactInfo'));
  const [currentStep, setCurrentStep] = useState(1);

  const watchedValues = watch();
  const isLunar = watchedValues.calendar === 'lunar';

  // Calculate form completion progress
  const requiredFields = ['displayName', 'birthDate', 'address'];
  const optionalFields = ['gender', 'birthTime', 'email', 'phone'];
  const allFields = [...requiredFields, ...optionalFields];

  const completedFields = allFields.filter((field) => {
    const value = watchedValues[field as keyof typeof watchedValues];
    return value && value !== '';
  }).length;

  const progressPercentage = (completedFields / allFields.length) * 100;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit?.(data as any);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  const validateStep = async (step: number) => {
    switch (step) {
      case 1:
        return await trigger(['displayName', 'gender']);
      case 2:
        return await trigger(['calendar', 'birthDate', 'birthTime']);
      case 3:
        return await trigger(['address']);
      case 4:
        return await trigger(['email', 'phone']);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isStepValid = await validateStep(currentStep);
    if (isStepValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const StepIndicator = ({
    step,
    isActive,
    isCompleted,
  }: { step: number; isActive: boolean; isCompleted: boolean }) => (
    <div
      className={`
      flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
      ${
        isActive
          ? 'bg-primary text-primary-foreground shadow-lg scale-110'
          : isCompleted
            ? 'bg-green-500 text-white'
            : 'bg-muted text-muted-foreground'
      }
    `}
    >
      {isCompleted ? '✓' : step}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold">基本信息</h3>
              <p className="text-muted-foreground">让我们了解您的基本信息</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  显示名称 *
                </label>
                <div className="relative">
                  <input
                    {...register('displayName')}
                    className="w-full px-4 py-3 pl-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="请输入您的昵称"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {errors.displayName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  性别
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'male', label: '男', emoji: '👨' },
                    { value: 'female', label: '女', emoji: '👩' },
                    { value: 'other', label: '其他', emoji: '🌈' },
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        {...register('gender')}
                        type="radio"
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="p-3 border border-border rounded-lg text-center cursor-pointer transition-all hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5">
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div className="text-sm font-medium">
                          {option.label}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold">出生信息</h3>
              <p className="text-muted-foreground">
                准确的出生时间有助于更精确的分析
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  历法选择
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'gregorian', label: '公历', desc: '阳历/西历' },
                    { value: 'lunar', label: '农历', desc: '阴历/中历' },
                  ].map((option) => (
                    <label key={option.value} className="relative">
                      <input
                        {...register('calendar')}
                        type="radio"
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border border-border rounded-lg cursor-pointer transition-all hover:border-primary peer-checked:border-primary peer-checked:bg-primary/5">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    出生日期 * {isLunar ? '（农历）' : ''}
                  </label>
                  <input
                    {...register('birthDate')}
                    type="date"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  {errors.birthDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.birthDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    出生时间
                  </label>
                  <input
                    {...register('birthTime')}
                    type="time"
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    时间越准确，分析结果越精确
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold">地理位置</h3>
              <p className="text-muted-foreground">
                出生地点影响地理磁场和风水分析
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  出生地址 *
                </label>
                <AddressAutocomplete
                  value={watchedValues.address || ''}
                  onChange={(value) => setValue('address', value)}
                  placeholder="请输入详细地址，支持智能联想"
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.address.message}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenMap(true)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    地图选点
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    支持地址联想和地图精确定位
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold">联系方式</h3>
              <p className="text-muted-foreground">
                选填信息，用于更好的服务体验
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    邮箱地址
                  </label>
                  <div className="relative">
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-4 py-3 pl-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="your@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    手机号码
                  </label>
                  <div className="relative">
                    <input
                      {...register('phone')}
                      className="w-full px-4 py-3 pl-10 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      placeholder="仅用于重要通知"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <input
                  {...register('showContactInfo')}
                  type="checkbox"
                  className="mt-1"
                  onChange={(e) => setShowContactInfo(e.target.checked)}
                />
                <div className="text-sm">
                  <div className="font-medium text-foreground">
                    显示联系方式
                  </div>
                  <div className="text-muted-foreground">
                    允许在分析报告中显示您的联系信息，便于后续服务
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card variant="feng-shui" className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {mode === 'registration'
              ? '完善资料'
              : mode === 'guest'
                ? '游客信息'
                : '个人资料'}
          </CardTitle>
          {showProgress && (
            <div className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}% 完成
            </div>
          )}
        </div>

        {showProgress && (
          <ProgressBar
            value={progressPercentage}
            variant="feng-shui"
            showValue={false}
            className="mt-2"
          />
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <StepIndicator
                step={step}
                isActive={currentStep === step}
                isCompleted={currentStep > step}
              />
              {step < 4 && (
                <div
                  className={`w-8 h-0.5 mx-2 transition-colors ${
                    currentStep > step ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              上一步
            </Button>

            <div className="flex gap-3">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  下一步
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      保存中...
                    </>
                  ) : (
                    '保存资料'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        <MapPicker
          value={{
            latitude: watchedValues.latitude,
            longitude: watchedValues.longitude,
            address: watchedValues.address,
          }}
          onChange={(value) => {
            setValue('address', value.address || '');
            setValue('latitude', value.latitude);
            setValue('longitude', value.longitude);
            trigger('address');
          }}
          defaultCenter={{
            latitude: watchedValues.latitude || 39.9042,
            longitude: watchedValues.longitude || 116.4074,
          }}
        />
      </CardContent>
    </Card>
  );
}
