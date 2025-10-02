'use client';

import { Button } from '@/components/ui/button';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SimpleTestPage() {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const switchLanguage = (newLocale: string) => {
    addLog(`切换到语言: ${newLocale}`);
    addLog(`当前路径: ${pathname}`);

    // 移除当前locale前缀
    let cleanPath = pathname ?? '/';
    const localePattern = /^\/[a-z]{2}(-[A-Z]{2})?/;
    if (localePattern.test(cleanPath ?? '')) {
      cleanPath = cleanPath.replace(localePattern, '') || '/';
    }

    addLog(`清理后路径: ${cleanPath}`);

    // 构建新路径
    const newPath = `/${newLocale}${cleanPath}`;
    addLog(`新路径: ${newPath}`);

    // 跳转
    router.push(newPath);
    addLog(`已跳转到: ${newPath}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className='container mx-auto p-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-8'>简单语言切换测试</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* 当前状态 */}
        <div className='p-6 border rounded-lg bg-gray-50'>
          <h2 className='text-xl font-semibold mb-4'>当前状态</h2>
          <div className='space-y-2 text-sm'>
            <p>
              <strong>语言:</strong> {locale}
            </p>
            <p>
              <strong>路径:</strong> {pathname}
            </p>
            <p>
              <strong>标题:</strong> {t('home.title')}
            </p>
            <p>
              <strong>副标题:</strong> {t('home.subtitle')}
            </p>
          </div>
        </div>

        {/* 语言切换 */}
        <div className='p-6 border rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>语言切换</h2>
          <div className='grid grid-cols-2 gap-2'>
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
      </div>

      {/* 翻译内容测试 */}
      <div className='mt-6 p-6 border rounded-lg'>
        <h2 className='text-xl font-semibold mb-4'>翻译内容测试</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <h3 className='font-medium mb-2'>功能特色</h3>
            <ul className='space-y-1 text-sm'>
              <li>• {t('home.features.bazi.title')}</li>
              <li>• {t('home.features.flyingStar.title')}</li>
              <li>• {t('home.features.compass.title')}</li>
              <li>• {t('home.features.floorPlan.title')}</li>
            </ul>
          </div>
          <div>
            <h3 className='font-medium mb-2'>通用文本</h3>
            <ul className='space-y-1 text-sm'>
              <li>• {t('common.loading')}</li>
              <li>• {t('common.success')}</li>
              <li>• {t('common.error')}</li>
              <li>• {t('common.switchLanguage')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 调试日志 */}
      <div className='mt-6 p-6 border rounded-lg'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-xl font-semibold'>调试日志</h2>
          <Button onClick={clearLogs} size='sm' variant='outline'>
            清除日志
          </Button>
        </div>
        <div className='bg-black text-green-400 p-4 rounded font-mono text-xs max-h-48 overflow-y-auto'>
          {logs.length === 0 ? (
            <div className='text-gray-500'>暂无日志</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className='mb-1'>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className='mt-6 p-6 border rounded-lg bg-blue-50'>
        <h2 className='text-xl font-semibold mb-4'>使用说明</h2>
        <ol className='list-decimal list-inside space-y-2 text-sm'>
          <li>点击语言按钮切换语言</li>
          <li>观察URL变化和页面内容</li>
          <li>检查调试日志中的路径变化</li>
          <li>验证翻译内容是否正确显示</li>
        </ol>
      </div>
    </div>
  );
}
