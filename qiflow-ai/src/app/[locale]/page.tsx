
import { GuestEntry } from '@/components/auth/guest-entry';
import { locales } from '@/lib/i18n/config';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 minute light cache, can be adjusted as needed

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', backgroundColor: 'white' }}>
      <div className='container' style={{ padding: '2rem 1rem' }}>
        {/* 头部区域 */}
        <section className='text-center py-20'>
          <h1 className='title'>{t('home.title')}</h1>
          <p className='subtitle mt-4'>{t('home.subtitle')}</p>
        </section>

        {/* 功能介绍 */}
        <section className='features'>
          <div className='feature-card'>
            <h3 className='feature-title'>{t('home.features.bazi.title')}</h3>
            <p className='feature-desc'>
              {t('home.features.bazi.description')}
            </p>
          </div>

          <div className='feature-card'>
            <h3 className='feature-title'>
              {t('home.features.flyingStar.title')}
            </h3>
            <p className='feature-desc'>
              {t('home.features.flyingStar.description')}
            </p>
          </div>

          <div className='feature-card'>
            <h3 className='feature-title'>
              {t('home.features.compass.title')}
            </h3>
            <p className='feature-desc'>
              {t('home.features.compass.description')}
            </p>
          </div>

          <div className='feature-card'>
            <h3 className='feature-title'>
              {t('home.features.floorPlan.title')}
            </h3>
            <p className='feature-desc'>
              {t('home.features.floorPlan.description')}
            </p>
          </div>

          <div className='feature-card'>
            <h3 className='feature-title'>
              {t('home.features.visualization3d.title')}
            </h3>
            <p className='feature-desc'>
              {t('home.features.visualization3d.description')}
            </p>
          </div>

          <div className='feature-card'>
            <h3 className='feature-title'>
              {t('home.features.aiAssistant.title')}
            </h3>
            <p className='feature-desc'>
              {t('home.features.aiAssistant.description')}
            </p>
          </div>
        </section>



        {/* 行动按钮（shadcn Button + 游客入口）*/}
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center py-10'>
          <GuestEntry />
          <Link
            href={`/${locale}/bazi-analysis`}
            className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          >
            🎯 {t('home.actions.viewBaziAnalysis')}
          </Link>
          <Link
            href={`/${locale}/guest-analysis`}
            className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
          >
            🧪 {t('home.actions.testAnalysis')}
          </Link>
        </div>

        {/* 特色功能 */}
        <section className='highlights'>
          <h2 className='highlights-title'>{t('home.highlights.title')}</h2>
          <div className='highlights-grid'>
            <div className='highlight-item'>
              <div className='highlight-dot dot-blue'></div>
              <div className='highlight-content'>
                <h4>{t('home.highlights.smartOverlay.title')} ⭐</h4>
                <p>{t('home.highlights.smartOverlay.description')}</p>
              </div>
            </div>
            <div className='highlight-item'>
              <div className='highlight-dot dot-purple'></div>
              <div className='highlight-content'>
                <h4>{t('home.highlights.guestMode.title')}</h4>
                <p>{t('home.highlights.guestMode.description')}</p>
              </div>
            </div>
            <div className='highlight-item'>
              <div className='highlight-dot dot-green'></div>
              <div className='highlight-content'>
                <h4>{t('home.highlights.precisionCompass.title')}</h4>
                <p>{t('home.highlights.precisionCompass.description')}</p>
              </div>
            </div>
            <div className='highlight-item'>
              <div className='highlight-dot dot-orange'></div>
              <div className='highlight-content'>
                <h4>{t('home.highlights.multilingual.title')}</h4>
                <p>{t('home.highlights.multilingual.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* 页脚 */}
        <footer className='footer'>
          <div>
            <span>{t('home.footer.copyright')}</span>
            <a href='#'>{t('home.footer.help')}</a>
            <a href='#'>{t('home.footer.about')}</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
