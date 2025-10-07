'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Compass, Home, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import dynamic from 'next/dynamic';
import type { CompassThemeKey } from '@/lib/compass/themes';

// 动态导入罗盘组件以优化性能
const CompassThemeSelector = dynamic(
  () => import('@/components/compass/compass-theme-selector'),
  { ssr: false }
);

const SimpleCompass = dynamic(
  () => import('@/components/compass/simple-compass'),
  { ssr: false, loading: () => <div className='animate-pulse bg-gray-200 rounded-full w-96 h-96'></div> }
);

const StandardFloorPlan = dynamic(
  () => import('./standard-floor-plan').then(mod => ({ default: mod.StandardFloorPlan })),
  { ssr: false }
);

export interface HouseData {
  orientation: number;
  address: string;
  floor: number;
  roomCount: number;
  compassMethod: 'manual' | 'compass';
}

interface HouseDataFormProps {
  onSubmit: (data: HouseData) => void;
  onQuickFill: () => void;
  onBack: () => void;
  defaultValues?: Partial<HouseData>;
  compassOrientation: number | null;
  onCompassOrientationChange: (orientation: number) => void;
  selectedFloorPlan: any;
  onFloorPlanSelect: (floorPlan: any) => void;
  selectedCompassTheme: CompassThemeKey;
  onCompassThemeChange: (theme: CompassThemeKey) => void;
}

export const HouseDataForm = memo(function HouseDataForm({
  onSubmit,
  onQuickFill,
  onBack,
  defaultValues,
  compassOrientation,
  onCompassOrientationChange,
  selectedFloorPlan,
  onFloorPlanSelect,
  selectedCompassTheme,
  onCompassThemeChange
}: HouseDataFormProps) {
  const t = useTranslations();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: HouseData = {
      orientation:
        compassOrientation ||
        parseFloat(formData.get('orientation') as string),
      address: formData.get('address') as string,
      floor: parseInt(formData.get('floor') as string),
      roomCount: parseInt(formData.get('roomCount') as string),
      compassMethod: compassOrientation ? 'compass' : 'manual',
    };
    onSubmit(data);
  }

  return (
    <Card className='p-8 shadow-xl bg-white/90 backdrop-blur-sm'>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center'>
              <Home className='w-5 h-5 text-white' aria-hidden='true' />
            </div>
            {t('guestAnalysis.houseForm.title')}
          </h3>
          <Button
            type='button'
            variant='outline'
            onClick={onQuickFill}
            className='flex items-center gap-2 text-sm'
            aria-label={t('guestAnalysis.houseForm.quickFill')}
          >
            <Sparkles className='w-4 h-4' aria-hidden='true' />
            {t('guestAnalysis.houseForm.quickFill')}
          </Button>
        </div>
        <p className='text-gray-600'>
          {t('guestAnalysis.houseForm.description')}
        </p>
      </div>

      <div className='space-y-6'>
        {/* Floor plan selection */}
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
          <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <Home className='w-5 h-5 text-green-600' aria-hidden='true' />
            {t('guestAnalysis.houseForm.selectFloorPlan')}
          </h4>
          <StandardFloorPlan
            onFloorPlanSelect={onFloorPlanSelect}
            selectedFloorPlan={selectedFloorPlan}
          />
        </div>

        {/* Compass component */}
        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
          <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
            <Compass className='w-5 h-5 text-blue-600' aria-hidden='true' />
            {t('guestAnalysis.houseForm.digitalCompass')}
          </h4>
          
          <div className='mb-6'>
            <h5 className='text-md font-semibold text-gray-900 mb-3 flex items-center gap-2'>
              <div className='w-4 h-4 bg-purple-600 rounded' aria-hidden='true'></div>
              选择罗盘样式
            </h5>
            <CompassThemeSelector
              currentTheme={selectedCompassTheme}
              onThemeChange={onCompassThemeChange}
            />
          </div>
          
          <div className='mb-4 flex justify-center'>
            <SimpleCompass
              theme={selectedCompassTheme}
              onDirectionChange={onCompassOrientationChange}
              interactive={true}
              enableAnimation={true}
              showDetailedInfo={true}
              width={400}
              height={400}
            />
          </div>
          
          {compassOrientation !== null && (
            <div className='mt-4 p-3 bg-blue-50 rounded-lg' role='status'>
              <p className='text-sm text-blue-800'>
                {t('guestAnalysis.houseForm.currentOrientation')}{' '}
                <span className='font-bold'>
                  {compassOrientation.toFixed(1)}°
                </span>
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='orientation' className='block text-sm font-medium text-gray-700 mb-2'>
                {t('guestAnalysis.houseForm.orientationRequired')}
              </label>
              <input
                id='orientation'
                type='number'
                name='orientation'
                min='0'
                max='360'
                step='0.1'
                value={compassOrientation || defaultValues?.orientation || ''}
                onChange={e => onCompassOrientationChange(parseFloat(e.target.value))}
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder={t('guestAnalysis.houseForm.orientationPlaceholder')}
                aria-required='true'
              />
            </div>
            <div>
              <label htmlFor='floor' className='block text-sm font-medium text-gray-700 mb-2'>
                {t('guestAnalysis.houseForm.floor')}
              </label>
              <input
                id='floor'
                type='number'
                name='floor'
                min='1'
                defaultValue={defaultValues?.floor || ''}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder={t('guestAnalysis.houseForm.floorPlaceholder')}
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label htmlFor='address' className='block text-sm font-medium text-gray-700 mb-2'>
                {t('guestAnalysis.houseForm.address')}
              </label>
              <input
                id='address'
                type='text'
                name='address'
                defaultValue={defaultValues?.address || ''}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder={t('guestAnalysis.houseForm.addressPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor='roomCount' className='block text-sm font-medium text-gray-700 mb-2'>
                {t('guestAnalysis.houseForm.roomCount')}
              </label>
              <input
                id='roomCount'
                type='number'
                name='roomCount'
                min='1'
                defaultValue={defaultValues?.roomCount || ''}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder={t('guestAnalysis.houseForm.roomCountPlaceholder')}
              />
            </div>
          </div>

          <div className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={onBack}
              aria-label={t('analysis.previousStep')}
            >
              {t('analysis.previousStep')}
            </Button>
            <Button type='submit' className='px-8 py-3'>
              {t('analysis.nextStep')}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
});
