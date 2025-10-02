'use client';

import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AddressAutocomplete } from './address-autocomplete';
import { MapPicker } from './map-picker';

const profileSchema = z.object({
  displayName: z.string().min(1, '请输入名称'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  calendar: z.enum(['gregorian', 'lunar']).default('gregorian'),
  birthDate: z.string().min(1, '请选择日期'),
  birthTime: z.string().optional(),
  address: z.string().min(1, '请输入地址或选择位置'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  phone: z.string().optional(),
  showContactInfo: z.boolean().default(false),
});

export type UserProfileFormProps = {
  defaultValues?: Partial<z.infer<typeof profileSchema>>;
  onSubmit?: (values: z.infer<typeof profileSchema>) => Promise<void> | void;
  isSubmitting?: boolean;
  showProgress?: boolean;
  mode?: 'registration' | 'profile' | 'guest';
};

export function UserProfileForm(props: UserProfileFormProps) {
  const { defaultValues, onSubmit, isSubmitting, mode = 'profile' } = props;
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema) as any,
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

  const [error, setError] = useState<string | null>(null);
  const [openMap] = useState(false);
  
  const watchedValues = watch();
  const isLunar = useMemo(() => watchedValues.calendar === 'lunar', [watchedValues.calendar]);

  const handleFormSubmit = useCallback(
    async (data: z.infer<typeof profileSchema>) => {
      setError(null);
      try {
        await onSubmit?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '保存失败，请重试');
      }
    },
    [onSubmit]
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit as any)} className='space-y-4'>
      <div>
        <label className='block text-sm mb-1'>{t('forms.profile.display_name') || '显示名称'}</label>
        <input
          {...register('displayName')}
          className='w-full border rounded px-3 py-2'
          placeholder={t('forms.profile.display_name_placeholder') || '你的昵称'}
        />
        {errors.displayName && (
          <p className='text-red-600 text-xs mt-1'>{errors.displayName.message}</p>
        )}
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm mb-1'>{t('forms.profile.gender') || '性别'}</label>
          <select
            {...register('gender')}
            className='w-full border rounded px-3 py-2'
          >
            <option value='male'>{t('forms.profile.male') || '男'}</option>
            <option value='female'>{t('forms.profile.female') || '女'}</option>
            <option value='other'>{t('forms.profile.other') || '其他'}</option>
          </select>
        </div>
        <div>
          <label className='block text-sm mb-1'>{t('forms.profile.calendar_type') || '历法'}</label>
          <select
            {...register('calendar')}
            className='w-full border rounded px-3 py-2'
          >
            <option value='gregorian'>{t('forms.profile.gregorian') || '公历'}</option>
            <option value='lunar'>{t('forms.profile.lunar') || '农历'}</option>
          </select>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='block text-sm mb-1'>
            {t('forms.profile.birth_date') || '出生日期'}{isLunar ? '（农历）' : ''}
          </label>
          <input
            type='date'
            {...register('birthDate')}
            className='w-full border rounded px-3 py-2'
          />
          {errors.birthDate && (
            <p className='text-red-600 text-xs mt-1'>{errors.birthDate.message}</p>
          )}
        </div>
        <div>
          <label className='block text-sm mb-1'>{t('forms.profile.birth_time') || '出生时间'}</label>
          <input
            type='time'
            {...register('birthTime')}
            className='w-full border rounded px-3 py-2'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm mb-1'>{t('forms.profile.birth_location') || '出生地/地址'}</label>
        <AddressAutocomplete
          value={watchedValues.address}
          onChange={(v) => setValue('address', v)}
          placeholder={t('forms.profile.address_placeholder') || '输入地址，支持联想与后续地图选点'}
        />
        <div className='mt-2 flex items-center gap-2'>
          <button
            type='button'
            className='px-3 py-2 border rounded'
            onClick={() => setOpenMap(true)}
          >
            打开地图选点
          </button>
          <p className='text-xs text-muted-foreground'>
            已支持输入联想；地图选点为占位版本。
          </p>
        </div>
        {errors.address && (
          <p className='text-red-600 text-xs mt-1'>{errors.address.message}</p>
        )}
      </div>

      {mode !== 'guest' && (
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className='block text-sm mb-1'>
              {t('forms.profile.email') || '邮箱'} ({t('forms.profile.optional') || '可选'})
            </label>
            <input
              type='email'
              {...register('email')}
              className='w-full border rounded px-3 py-2'
              placeholder='you@example.com'
            />
            {errors.email && (
              <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className='block text-sm mb-1'>
              {t('forms.profile.phone') || '手机'} ({t('forms.profile.optional') || '可选'})
            </label>
            <input
              {...register('phone')}
              className='w-full border rounded px-3 py-2'
              placeholder='仅用于联系，不会公开'
            />
          </div>
        </div>
      )}

      {error && (
        <div className='text-red-600 text-sm whitespace-pre-line'>{error}</div>
      )}

      <Button type='submit' disabled={isSubmitting || !isValid} className='w-full'>
        {isSubmitting 
          ? (t('forms.profile.saving') || '保存中...') 
          : (t('forms.profile.save') || '保存资料')}
      </Button>

      <MapPicker
        value={{
          latitude: watchedValues.latitude,
          longitude: watchedValues.longitude,
          address: watchedValues.address
        }}
        onChange={(value) => {
          setValue('address', value.address || '');
          setValue('latitude', value.latitude);
          setValue('longitude', value.longitude);
        }}
        defaultCenter={{
          latitude: watchedValues.latitude || 39.9042,
          longitude: watchedValues.longitude || 116.4074
        }}
      />
    </form>
  );
}