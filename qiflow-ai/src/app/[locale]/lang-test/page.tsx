'use client';

import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LangTestPage() {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog(
      `${t('testPages.langTest.pageLoaded')} - ${t('testPages.langTest.currentLanguage')}: ${locale}, ${t('testPages.langTest.path')}: ${pathname ?? 'null'}`
    );
  }, [locale, pathname, t]);

  const switchLanguage = (newLocale: string) => {
    addLog(`${t('testPages.langTest.startSwitchTo')}: ${newLocale}`);

    // Get current path, remove locale prefix
    let cleanPath = pathname ?? '/';

    // Remove all possible locale prefixes
    const localePattern = /^\/[a-z]{2}(-[A-Z]{2})?/;
    if (localePattern.test(cleanPath ?? '')) {
      cleanPath = cleanPath.replace(localePattern, '') || '/';
    }

    addLog(`${t('testPages.langTest.cleanedPath')}: ${cleanPath}`);

    // Build new path
    const newPath = `/${newLocale}${cleanPath}`;
    addLog(`${t('testPages.langTest.newPath')}: ${newPath}`);

    // Use native routing
    router.push(newPath);
    addLog(`${t('testPages.langTest.navigatedTo')}: ${newPath}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className='container mx-auto p-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>
        {t('testPages.langTest.title')}
      </h1>

      {/* Current Status */}
      <div className='mb-6 p-4 border rounded-lg bg-gray-50'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.langTest.currentStatus')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
          <div>
            <p>
              <strong>{t('testPages.langTest.currentLanguage')}:</strong>{' '}
              {locale}
            </p>
            <p>
              <strong>{t('testPages.langTest.currentPath')}:</strong> {pathname}
            </p>
          </div>
          <div>
            <p>
              <strong>{t('testPages.langTest.pageTitle')}:</strong>{' '}
              {t('home.title')}
            </p>
            <p>
              <strong>{t('testPages.langTest.subtitle')}:</strong>{' '}
              {t('home.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Language Switch Buttons */}
      <div className='mb-6 p-4 border rounded-lg'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.langTest.languageSwitch')}
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
          {t('testPages.langTest.translationTest')}
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium mb-2'>
              {t('testPages.langTest.features')}
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
              {t('testPages.langTest.commonText')}
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

      {/* Debug Logs */}
      <div className='mb-6 p-4 border rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>
            {t('testPages.langTest.debugLogs')}
          </h2>
          <Button onClick={clearLogs} size='sm' variant='outline'>
            {t('testPages.langTest.clearLogs')}
          </Button>
        </div>
        <div className='bg-black text-green-400 p-4 rounded font-mono text-xs max-h-48 overflow-y-auto'>
          {logs.length === 0 ? (
            <div className='text-gray-500'>
              {t('testPages.langTest.noLogs')}
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className='mb-1'>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className='p-4 border rounded-lg bg-blue-50'>
        <h2 className='text-xl font-semibold mb-4'>
          {t('testPages.langTest.instructions')}
        </h2>
        <ol className='list-decimal list-inside space-y-2 text-sm'>
          <li>{t('testPages.langTest.instruction1')}</li>
          <li>{t('testPages.langTest.instruction2')}</li>
          <li>{t('testPages.langTest.instruction3')}</li>
          <li>{t('testPages.langTest.instruction4')}</li>
          <li>{t('testPages.langTest.instruction5')}</li>
        </ol>
      </div>
    </div>
  );
}
