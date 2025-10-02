import { CompactLanguageSwitcher, LanguageSwitcher } from '@/components/ui/language-switcher';
import { getTranslations } from 'next-intl/server';

export default async function TestI18nPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations();
  const locale = params.locale;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">语言切换测试页面</h1>
      
      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">当前语言信息</h2>
          <p><strong>当前Locale:</strong> {locale}</p>
          <p><strong>页面标题:</strong> {t('home.title')}</p>
          <p><strong>页面副标题:</strong> {t('home.subtitle')}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">语言切换器测试</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">完整版语言切换器</h3>
              <LanguageSwitcher />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">紧凑版语言切换器</h3>
              <CompactLanguageSwitcher />
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">翻译内容测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">功能特色</h4>
              <ul className="space-y-2 text-sm">
                <li>• {t('home.features.bazi.title')}</li>
                <li>• {t('home.features.flyingStar.title')}</li>
                <li>• {t('home.features.compass.title')}</li>
                <li>• {t('home.features.floorPlan.title')}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">通用文本</h4>
              <ul className="space-y-2 text-sm">
                <li>• {t('common.loading')}</li>
                <li>• {t('common.success')}</li>
                <li>• {t('common.error')}</li>
                <li>• {t('common.switchLanguage')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">测试说明</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>点击语言切换器，观察URL变化</li>
            <li>确认页面内容正确切换到对应语言</li>
            <li>检查浏览器地址栏URL格式是否正确（如：/en/test-i18n, /zh-TW/test-i18n）</li>
            <li>验证不会出现重复的locale前缀（如：/en/zh-TW）</li>
          </ol>
        </div>
      </div>
    </div>
  );
}


