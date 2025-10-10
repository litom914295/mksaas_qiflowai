'use client';

import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AddressAutocomplete } from './address-autocomplete';
import { MapPicker } from './map-picker';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Please enter name'),
  gender: z.enum(['male', 'female', 'other']).optional(),
  calendar: z.enum(['gregorian', 'lunar']).default('gregorian'),
  birthDate: z.string().min(1, 'Please select date'),
  birthTime: z.string().optional(),
  address: z.string().min(1, 'Please enter address or select location'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  email: z.string().email('Invalid email format').optional(),
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
  const { defaultValues, onSubmit, isSubmitting } = props;
  // const t = useTranslations('forms');

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
  const [showContactInfo] = useState(watch('showContactInfo'));

  const watchedValues = watch();
  const isLunar = useMemo(
    () => watchedValues.calendar === 'lunar',
    [watchedValues.calendar]
  );

  const handleFormSubmit = useCallback(
    async (data: z.infer<typeof profileSchema>) => {
      setError(null);
      try {
        await onSubmit?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Submission failed');
      }
    },
    [onSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit as any)}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm mb-1">Display Name</label>
        <input
          className="w-full border rounded px-3 py-2"
          {...register('displayName')}
          placeholder="Your nickname"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select
            className="w-full border rounded px-3 py-2"
            {...register('gender')}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Calendar</label>
          <select
            className="w-full border rounded px-3 py-2"
            {...register('calendar')}
          >
            <option value="gregorian">Gregorian</option>
            <option value="lunar">Lunar</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">
            Birth Date{isLunar ? ' (Lunar Calendar)' : ''}
          </label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            {...register('birthDate')}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Birth Time</label>
          <input
            type="time"
            className="w-full border rounded px-3 py-2"
            {...register('birthTime')}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Birth Place/Address</label>
        <AddressAutocomplete
          value={watchedValues.address}
          onChange={(value) => setValue('address', value)}
          onPick={(value) => {
            setValue('address', value.address);
            setValue('latitude', value.latitude);
            setValue('longitude', value.longitude);
          }}
          placeholder="Enter address, supports autocomplete and map selection"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-2 border rounded"
            onClick={() => setOpenMap(true)}
          >
            Open Map Selection
          </button>
          <p className="text-xs text-muted-foreground">
            Autocomplete is supported; map selection is placeholder version.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Email (Optional)</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            {...register('email')}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone (Optional)</label>
          <input
            className="w-full border rounded px-3 py-2"
            {...register('phone')}
            placeholder="For contact only, will not be public"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm whitespace-pre-line">{error}</div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? '保存中...' : '保存资料'}
      </Button>

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
        }}
        defaultCenter={{
          latitude: watchedValues.latitude || 39.9042,
          longitude: watchedValues.longitude || 116.4074,
        }}
      />
    </form>
  );
}
