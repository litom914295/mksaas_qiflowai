'use client';

import { Button } from '@/components/ui/button';
import { SimpleLanguageSwitcher } from '@/components/ui/simple-language-switcher';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BugI18nPage() {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${info}`,
    ]);
  };

  const testLanguageSwitch = (newLocale: string) => {
    addDebugInfo(`尝试切换到语言: ${newLocale}`);
    addDebugInfo(`当前路径: ${pathname ?? 'null'}`);

    // 获取不包含locale的路径
    const current = pathname ?? '/';
    const pathWithoutLocale =
      current.replace(/^\/[a-z]{2}-[A-Z]{2}|\/[a-z]{2}/, '') || '/';
    addDebugInfo(`移除locale后的路径: ${pathWithoutLocale}`);

    // 使用原生路由进行跳转
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    addDebugInfo(`新路径: ${newPath}`);

    router.push(newPath);
    addDebugInfo(`已调用 router.push(${newPath})`);
  };

  const clearDebug = () => {
    setDebugInfo([]);
  };

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-3xl font-bold mb-8'>i18n Bug 调试页面</h1>

      <div className='space-y-6'>
        <div className='p-4 border rounded-lg bg-gray-50'>
          <h2 className='text-xl font-semibold mb-4'>当前状态</h2>
          <div className='space-y-2'>
            <p>
              <strong>当前Locale:</strong> {locale}
            </p>
            <p>
              <strong>当前路径:</strong> {pathname}
            </p>
            <p>
              <strong>页面标题:</strong> {t('home.title')}
            </p>
            <p>
              <strong>页面副标题:</strong> {t('home.subtitle')}
            </p>
          </div>
        </div>

        <div className='p-4 border rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>语言切换测试</h2>
          <div className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium mb-2'>简单语言切换器</h3>
              <SimpleLanguageSwitcher />
            </div>
            <div>
              <h3 className='text-lg font-medium mb-2'>手动测试按钮</h3>
              <div className='flex flex-wrap gap-2'>
                {['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms'].map(loc => (
                  <Button
                    key={loc}
                    onClick={() => testLanguageSwitch(loc)}
                    variant={locale === loc ? 'default' : 'outline'}
                    disabled={locale === loc}
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className='p-4 border rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>翻译内容测试</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h4 className='font-medium'>功能特色</h4>
              <ul className='space-y-2 text-sm'>
                <li>• {t('home.features.bazi.title')}</li>
                <li>• {t('home.features.flyingStar.title')}</li>
                <li>• {t('home.features.compass.title')}</li>
                <li>• {t('home.features.floorPlan.title')}</li>
              </ul>
            </div>
            <div>
              <h4 className='font-medium'>通用文本</h4>
              <ul className='space-y-2 text-sm'>
                <li>• {t('common.loading')}</li>
                <li>• {t('common.success')}</li>
                <li>• {t('common.error')}</li>
                <li>• {t('common.switchLanguage')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='p-4 border rounded-lg'>
          <h2 className='text-xl font-semibold mb-4'>调试信息</h2>
          <div className='flex justify-between items-center mb-4'>
            <span className='text-sm text-gray-600'>调试日志</span>
            <Button onClick={clearDebug} size='sm' variant='outline'>
              清除日志
            </Button>
          </div>
          <div className='bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto'>
            {debugInfo.length === 0 ? (
              <div className='text-gray-500'>暂无调试信息</div>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className='mb-1'>
                  {info}
                </div>
              ))
            )}
          </div>
        </div>

        <div className='p-4 border rounded-lg bg-blue-50'>
          <h2 className='text-xl font-semibold mb-4'>测试步骤</h2>
          <ol className='list-decimal list-inside space-y-2 text-sm'>
            <li>点击不同的语言按钮</li>
            <li>观察URL变化和调试信息</li>
            <li>检查是否出现重复locale前缀</li>
            <li>验证页面内容是否正确切换</li>
            <li>检查浏览器控制台是否有错误</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
