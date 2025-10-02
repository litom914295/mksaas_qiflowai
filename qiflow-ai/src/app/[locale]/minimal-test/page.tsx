import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface MinimalTestPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MinimalTestPage({ params }: MinimalTestPageProps) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{t('testPages.minimalTest.title')}</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">{t('testPages.minimalTest.serverInfo')}</h2>
          <p><strong>Locale:</strong> {locale}</p>
          <p><strong>Title:</strong> {t('home.title')}</p>
          <p><strong>Subtitle:</strong> {t('home.subtitle')}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">{t('testPages.minimalTest.features')}</h2>
          <ul className="space-y-1">
            <li>• {t('home.features.bazi.title')}</li>
            <li>• {t('home.features.flyingStar.title')}</li>
            <li>• {t('home.features.compass.title')}</li>
            <li>• {t('home.features.floorPlan.title')}</li>
          </ul>
        </div>

        <div className="p-4 border rounded bg-blue-50">
          <h2 className="font-semibold mb-2">{t('testPages.minimalTest.testDescription')}</h2>
          <p className="text-sm">
            {t('testPages.minimalTest.description')}
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• <Link href="/zh-CN/minimal-test" className="text-blue-600 hover:underline">/zh-CN/minimal-test</Link></li>
            <li>• <Link href="/zh-TW/minimal-test" className="text-blue-600 hover:underline">/zh-TW/minimal-test</Link></li>
            <li>• <Link href="/en/minimal-test" className="text-blue-600 hover:underline">/en/minimal-test</Link></li>
            <li>• <Link href="/ja/minimal-test" className="text-blue-600 hover:underline">/ja/minimal-test</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}


