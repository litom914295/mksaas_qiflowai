'use client';

import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function SimpleLangTestPage() {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const switchLanguage = (newLocale: string) => {
    console.log(`[SimpleLangTest] Switching to: ${newLocale}`);
    console.log(`[SimpleLangTest] Current pathname: ${pathname}`);

    // Get path without locale
    const current = pathname ?? '/';
    const pathWithoutLocale =
      current.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '') || '/';
    const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;

    console.log(`[SimpleLangTest] New path: ${newPath}`);
    router.push(newPath);
  };

  return (
    <div className='container mx-auto p-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>
        {t('testPages.simpleLangTest.title')}
      </h1>

      {/* Current Status */}
      <div className='mb-6 p-4 border rounded-lg bg-gray-50'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.simpleLangTest.currentStatus')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p>
              <strong>{t('testPages.simpleLangTest.currentLanguage')}:</strong>{' '}
              {locale}
            </p>
            <p>
              <strong>{t('testPages.simpleLangTest.currentPath')}:</strong>{' '}
              {pathname}
            </p>
          </div>
          <div>
            <p>
              <strong>{t('testPages.simpleLangTest.pageTitle')}:</strong>{' '}
              {t('home.title')}
            </p>
            <p>
              <strong>{t('testPages.simpleLangTest.subtitle')}:</strong>{' '}
              {t('home.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Language Switch Buttons */}
      <div className='mb-6 p-4 border rounded-lg'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.simpleLangTest.languageSwitch')}
        </h2>
        <div className='grid grid-cols-3 md:grid-cols-6 gap-2'>
          {['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'].map(loc => (
            <Button
              key={loc}
              onClick={() => switchLanguage(loc)}
              variant={locale === loc ? 'default' : 'outline'}
              size='sm'
              disabled={locale === loc}
            >
              {loc}
            </Button>
          ))}
        </div>
      </div>

      {/* Translation Content Test */}
      <div className='mb-6 p-4 border rounded-lg'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.simpleLangTest.translationTest')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium mb-2'>
              {t('testPages.simpleLangTest.features')}
            </h3>
            <ul className='space-y-1 text-sm'>
              <li>• {t('home.features.bazi.title')}</li>
              <li>• {t('home.features.flyingStar.title')}</li>
              <li>• {t('home.features.compass.title')}</li>
              <li>• {t('home.features.floorPlan.title')}</li>
            </ul>
          </div>
          <div>
            <h3 className='font-medium mb-2'>
              {t('testPages.simpleLangTest.commonText')}
            </h3>
            <ul className='space-y-1 text-sm'>
              <li>• {t('common.loading')}</li>
              <li>• {t('common.success')}</li>
              <li>• {t('common.error')}</li>
              <li>• {t('common.switchLanguage')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className='p-4 border rounded-lg bg-blue-50'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.simpleLangTest.debugInfo')}
        </h2>
        <div className='text-sm space-y-2'>
          <p>
            <strong>useLocale():</strong> {locale}
          </p>
          <p>
            <strong>usePathname():</strong> {pathname}
          </p>
          <p>
            <strong>{t('testPages.simpleLangTest.currentTime')}:</strong>{' '}
            {new Date().toLocaleString()}
          </p>
          <p>
            <strong>{t('testPages.simpleLangTest.browserLanguage')}:</strong>{' '}
            {typeof window !== 'undefined' ? navigator.language : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
