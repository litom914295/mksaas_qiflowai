'use client';

import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Calendar,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  User,
} from 'lucide-react';

import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AddressAutocomplete } from './address-autocomplete';
import { CalendarPicker } from './calendar-picker';

import { TimePicker } from './time-picker';

// ProgressBar component
const ProgressBar = ({
  steps,
}: {
  steps: {
    id: string;
    label: string;
    completed: boolean;
    optional?: boolean;
  }[];
}) => {
  const completedSteps = steps.filter((step) => step.completed).length;
  const totalSteps = steps.length;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
      />
    </div>
  );
};

// InfoTooltip component
/*
const InfoTooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) => (
  <div className='relative group'>
    <div className='inline-block'>{children}</div>
    <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
      {content}
    </div>
  </div>
);
*/

const profileSchema = z.object({
  displayName: z.string().min(1, '请输入名称'),
  gender: z.enum(['male', 'female', 'other']),
  calendar: z.enum(['gregorian', 'lunar']),
  birthDate: z.string().min(1, '请选择日期'),
  birthTime: z.string().optional(),
  address: z.string().min(1, '请输入地址或选择位置'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: '邮箱格式不正确',
    }),
  phone: z.string().optional(),
  showContactInfo: z.boolean(),
});

export type UserProfileFormProps = {
  defaultValues?: Partial<z.infer<typeof profileSchema>>;
  onSubmit?: (values: z.infer<typeof profileSchema>) => Promise<void> | void;
  isSubmitting?: boolean;
  showProgress?: boolean;
  mode?: 'registration' | 'profile' | 'guest';
};

export function UserProfileForm(props: UserProfileFormProps) {
  const {
    defaultValues,
    onSubmit,
    isSubmitting,
    showProgress = true,
    mode = 'profile',
  } = props;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange', // 实时验证
    reValidateMode: 'onChange', // 重新验证模式
    defaultValues: {
      displayName: defaultValues?.displayName || '',
      gender: defaultValues?.gender || 'male',
      calendar: defaultValues?.calendar || 'gregorian',
      birthDate: defaultValues?.birthDate || '',
      birthTime: defaultValues?.birthTime || '',
      address: defaultValues?.address || '',
      latitude: defaultValues?.latitude,
      longitude: defaultValues?.longitude,
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      showContactInfo: false,
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [openMap, setOpenMap] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showBaziAnalysis, setShowBaziAnalysis] = useState(false);
  const [baziAnalysisData, setBaziAnalysisData] = useState<any>(null);

  const watchedValues = watch();
  const isLunar = useMemo(
    () => watchedValues.calendar === 'lunar',
    [watchedValues.calendar]
  );

  // 计算完成进度
  const progressSteps = useMemo(() => {
    const steps = [
      { id: 'name', label: '基本信息', completed: !!watchedValues.displayName },
      { id: 'birth', label: '出生信息', completed: !!watchedValues.birthDate },
      { id: 'location', label: '出生地点', completed: !!watchedValues.address },
    ] as {
      id: string;
      label: string;
      completed: boolean;
      optional?: boolean;
    }[];

    // 联系方式只在显示时才验证
    if (showContactInfo) {
      steps.push({
        id: 'contact',
        label: '联系方式',
        completed: !!(watchedValues.email || watchedValues.phone),
        optional: true,
      });
    }

    return steps;
  }, [
    watchedValues.displayName,
    watchedValues.birthDate,
    watchedValues.address,
    watchedValues.email,
    watchedValues.phone,
    showContactInfo,
  ]);

  const handleAddressPick = useCallback(
    (value: { address: string; latitude?: number; longitude?: number }) => {
      setValue('address', value.address, { shouldValidate: true });
      if (value.latitude && value.longitude) {
        setValue('latitude', value.latitude);
        setValue('longitude', value.longitude);
      }
    },
    [setValue]
  );

  const handleSubmitForm = useCallback(
    async (data: any) => {
      setError(null);
      try {
        await onSubmit?.(data);

        // 如果有出生信息，进行八字分析
        if (data.birthDate) {
          const baziData = {
            datetime: `${data.birthDate}${data.birthTime ? `T${data.birthTime}` : 'T12:00:00'}`,
            gender: data.gender === 'male' ? 'male' : 'female',
            timezone: 'Asia/Shanghai',
            isTimeKnown: !!data.birthTime,
          };

          setBaziAnalysisData(baziData);
          setShowBaziAnalysis(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '提交失败，请重试');
      }
    },
    [onSubmit]
  );

  // 一键填充样例
  const handleFillSample = useCallback(() => {
    setValue('displayName', '测试', { shouldValidate: true });
    setValue('gender', 'male', { shouldValidate: true });
    setValue('calendar', 'gregorian', { shouldValidate: true });
    setValue('birthDate', '1973-01-07', { shouldValidate: true });
    setValue('birthTime', '02:30', { shouldValidate: true });
    setValue('address', '北京市东城区天安门', { shouldValidate: true });
    setValue('latitude', 39.9087);
    setValue('longitude', 116.3975);
    trigger();
  }, [setValue, trigger]);

  const toggleContactInfo = useCallback(() => {
    const newValue = !showContactInfo;
    setShowContactInfo(newValue);
    setValue('showContactInfo', newValue);
  }, [showContactInfo, setValue]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 进度条 */}
      {showProgress && (
        <div className="mb-8">
          <ProgressBar steps={progressSteps} />
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-6">
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={handleFillSample}>
            ⏩ 一键填充样例
          </Button>
        </div>
        {/* 基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            基本信息
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              显示名称 *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">
                💡 这是其他用户看到的名称，可以随时修改
              </span>
            </div>
            <input
              {...register('displayName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="请输入您的昵称"
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.displayName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                性别
              </label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">
                  💡 性别信息用于八字计算，影响五行分析
                </span>
              </div>
              <select
                {...register('gender')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                历法类型
              </label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">
                  💡 选择公历或农历，影响八字计算的准确性
                </span>
              </div>
              <select
                {...register('calendar')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="gregorian">公历</option>
                <option value="lunar">农历</option>
              </select>
            </div>
          </div>
        </div>

        {/* 出生信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            出生信息
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出生日期 *
              </label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">
                  💡 {isLunar ? '农历' : '公历'}日期，用于八字计算
                </span>
              </div>
              <CalendarPicker
                value={watchedValues.birthDate}
                onChange={(value) => setValue('birthDate', value)}
                calendarType={watchedValues.calendar}
                placeholder="选择出生日期"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出生时间
              </label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">
                  💡 精确的出生时间有助于更准确的八字分析
                </span>
              </div>
              <TimePicker
                value={watchedValues.birthTime || ''}
                onChange={(value) => setValue('birthTime', value)}
                placeholder="选择出生时间"
              />
            </div>
          </div>

          {isLunar && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>注意：</strong>{' '}
                农历模式下，系统会自动转换为公历进行八字计算。
                如果知道具体的公历日期，建议直接选择公历模式。
              </p>
            </div>
          )}
        </div>

        {/* 出生地点 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            出生地点
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              地址 *
            </label>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500">
                💡 出生地点用于真太阳时计算，提高八字分析精度
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <AddressAutocomplete
                  value={watchedValues.address}
                  onChange={(value) => {
                    setValue('address', value, { shouldValidate: true });
                  }}
                  onPick={handleAddressPick}
                  placeholder="输入出生地点"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenMap(true)}
                className="px-3"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* 地图选择器暂时禁用，等待实现modal版本 */}
          {openMap && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                地图选择功能正在开发中，请直接输入地址或使用地址自动完成功能。
              </p>
            </div>
          )}
        </div>

        {/* 联系方式（非游客模式） */}
        {mode !== 'guest' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                联系方式
              </h3>
              <button
                type="button"
                onClick={toggleContactInfo}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {showContactInfo ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showContactInfo ? '隐藏' : '显示'}联系方式
              </button>
            </div>

            {showContactInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      💡 用于接收重要通知和分析报告
                    </span>
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    手机号码
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      💡 用于接收短信通知和验证
                    </span>
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+86 138 0000 0000"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 提交按钮 */}
        <div className="pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            {isSubmitting
              ? '保存中...'
              : mode === 'registration'
                ? '🎯 完成注册并查看八字分析'
                : '🎯 保存信息并查看八字分析'}
          </Button>

          {/* 表单验证提示 */}
          {!isValid && (
            <div className="mt-3 text-sm text-gray-600 text-center">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span>请填写所有必填信息以启用分析功能</span>
              </div>
              {/* 调试信息 */}
              <div className="mt-2 text-xs text-gray-500">
                <div>调试信息: isValid={isValid.toString()}</div>
                <div>displayName: {watchedValues.displayName || '空'}</div>
                <div>birthDate: {watchedValues.birthDate || '空'}</div>
                <div>address: {watchedValues.address || '空'}</div>
                <div>
                  errors:{' '}
                  {Object.keys(errors).length > 0
                    ? Object.keys(errors).join(', ')
                    : '无'}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
