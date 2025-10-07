'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

export interface PersonalData {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  location: string;
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalData) => void;
  onQuickFill: () => void;
  defaultValues?: Partial<PersonalData>;
}

export const PersonalDataForm = memo(function PersonalDataForm({
  onSubmit,
  onQuickFill,
  defaultValues
}: PersonalDataFormProps) {
  const t = useTranslations();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: PersonalData = {
      name: formData.get('name') as string,
      birthDate: formData.get('birthDate') as string,
      birthTime: formData.get('birthTime') as string,
      gender: formData.get('gender') as 'male' | 'female',
      location: formData.get('location') as string,
    };
    onSubmit(data);
  }

  return (
    <Card className='p-8 shadow-xl bg-white/90 backdrop-blur-sm'>
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-2'>
          <h3 className='text-2xl font-bold text-gray-900 flex items-center gap-3'>
            <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
              <User className='w-5 h-5 text-white' aria-hidden='true' />
            </div>
            {t('guestAnalysis.personalForm.title')}
          </h3>
          <Button
            type='button'
            variant='outline'
            onClick={onQuickFill}
            className='flex items-center gap-2 text-sm'
            aria-label={t('guestAnalysis.personalForm.quickFill')}
          >
            <Sparkles className='w-4 h-4' aria-hidden='true' />
            {t('guestAnalysis.personalForm.quickFill')}
          </Button>
        </div>
        <p className='text-gray-600'>
          {t('guestAnalysis.personalForm.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
              {t('guestAnalysis.personalForm.nameRequired')}
            </label>
            <input
              id='name'
              type='text'
              name='name'
              required
              defaultValue={defaultValues?.name || ''}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder={t('guestAnalysis.personalForm.namePlaceholder')}
              aria-required='true'
            />
          </div>
          <div>
            <label htmlFor='gender' className='block text-sm font-medium text-gray-700 mb-2'>
              {t('guestAnalysis.personalForm.genderRequired')}
            </label>
            <select
              id='gender'
              name='gender'
              required
              defaultValue={defaultValues?.gender || ''}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              aria-required='true'
            >
              <option value=''>{t('guestAnalysis.personalForm.genderPlaceholder')}</option>
              <option value='male'>{t('guestAnalysis.personalForm.male')}</option>
              <option value='female'>{t('guestAnalysis.personalForm.female')}</option>
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label htmlFor='birthDate' className='block text-sm font-medium text-gray-700 mb-2'>
              {t('guestAnalysis.personalForm.birthDateRequired')}
            </label>
            <input
              id='birthDate'
              type='date'
              name='birthDate'
              required
              defaultValue={defaultValues?.birthDate || ''}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              aria-required='true'
            />
          </div>
          <div>
            <label htmlFor='birthTime' className='block text-sm font-medium text-gray-700 mb-2'>
              {t('guestAnalysis.personalForm.birthTime')}
            </label>
            <input
              id='birthTime'
              type='time'
              name='birthTime'
              defaultValue={defaultValues?.birthTime || ''}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
        </div>

        <div>
          <label htmlFor='location' className='block text-sm font-medium text-gray-700 mb-2'>
            {t('guestAnalysis.personalForm.birthPlaceRequired')}
          </label>
          <input
            id='location'
            type='text'
            name='location'
            required
            defaultValue={defaultValues?.location || ''}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder={t('guestAnalysis.personalForm.birthPlacePlaceholder')}
            aria-required='true'
          />
        </div>

        <div className='flex justify-end'>
          <Button type='submit' className='px-8 py-3'>
            {t('guestAnalysis.personalForm.nextHouseOrientation')}
          </Button>
        </div>
      </form>
    </Card>
  );
});
