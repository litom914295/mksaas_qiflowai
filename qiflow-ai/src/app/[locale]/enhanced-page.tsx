import { GuestEntry } from '@/components/auth/guest-entry';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/enhanced-card';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { locales } from '@/lib/i18n/config';
import { Link } from '@/lib/i18n/routing';
import { Compass, Eye, Home, MessageSquare, Sparkles, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1分钟轻缓存，后续可按需调整

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10'>
      <div className='container mx-auto px-4 py-8 max-w-7xl'>
        {/* Language Switcher */}
        <div className='fixed top-4 right-4 z-10'>
            <LanguageSwitcher />
        </div>

        {/* Hero Section */}
        <section className='text-center py-20 px-4'>
          <div className='mb-8'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-primary to-accent mb-6 shadow-lg'>
              <Compass className='w-10 h-10 text-white' />
            </div>
          </div>

          <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight'>
            {t('home.title')}
          </h1>

          <p className='text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12'>
            {t('home.subtitle')}
          </p>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-16'>
            <GuestEntry />
            <Link
              href='/bazi-analysis'
              className='group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
            >
              <Sparkles className='w-5 h-5 group-hover:rotate-12 transition-transform' />
              立即查看八字命理分析
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className='py-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4 text-foreground'>
              核心功能
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              融合传统风水智慧与现代AI技术，为您提供专业的风水分析服务
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card variant='feng-shui' className='group'>
              <CardHeader className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <Zap className='w-8 h-8' />
                </div>
                <CardTitle className='text-xl'>
                  {t('home.features.bazi.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-base leading-relaxed'>
                  {t('home.features.bazi.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant='feng-shui' className='group'>
              <CardHeader className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 text-white mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <Sparkles className='w-8 h-8' />
                </div>
                <CardTitle className='text-xl'>
                  {t('home.features.flyingStar.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-base leading-relaxed'>
                  {t('home.features.flyingStar.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant='feng-shui' className='group'>
              <CardHeader className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <Compass className='w-8 h-8' />
                </div>
                <CardTitle className='text-xl'>
                  {t('home.features.compass.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-base leading-relaxed'>
                  {t('home.features.compass.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant='feng-shui' className='group'>
              <CardHeader className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <Home className='w-8 h-8' />
                </div>
                <CardTitle className='text-xl'>
                  {t('home.features.floorPlan.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-base leading-relaxed'>
                  {t('home.features.floorPlan.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant='feng-shui' className='group'>
              <CardHeader className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <Eye className='w-8 h-8' />
                </div>
                <CardTitle className='text-xl'>
                  {t('home.features.visualization3d.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-base leading-relaxed'>
                  {t('home.features.visualization3d.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant='feng-shui' className='group'>
              <CardHeader className='text-center'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white mb-4 mx-auto group-hover:scale-110 transition-transform'>
                  <MessageSquare className='w-8 h-8' />
                </div>
                <CardTitle className='text-xl'>
                  {t('home.features.aiAssistant.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-center text-base leading-relaxed'>
                  {t('home.features.aiAssistant.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Highlights Section */}
        <section className='py-16'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4 text-foreground'>
              {t('home.highlights.title')}
            </h2>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
            <Card variant='glass' className='p-6'>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mt-2'></div>
                <div>
                  <h4 className='text-lg font-semibold mb-2 flex items-center gap-2'>
                    {t('home.highlights.smartOverlay.title')}
                    <Sparkles className='w-4 h-4 text-accent' />
                  </h4>
                  <p className='text-muted-foreground'>
                    {t('home.highlights.smartOverlay.description')}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant='glass' className='p-6'>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mt-2'></div>
                <div>
                  <h4 className='text-lg font-semibold mb-2'>
                    {t('home.highlights.guestMode.title')}
                  </h4>
                  <p className='text-muted-foreground'>
                    {t('home.highlights.guestMode.description')}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant='glass' className='p-6'>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-green-600 mt-2'></div>
                <div>
                  <h4 className='text-lg font-semibold mb-2'>
                    {t('home.highlights.precisionCompass.title')}
                  </h4>
                  <p className='text-muted-foreground'>
                    {t('home.highlights.precisionCompass.description')}
                  </p>
                </div>
              </div>
            </Card>

            <Card variant='glass' className='p-6'>
              <div className='flex items-start gap-4'>
                <div className='flex-shrink-0 w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mt-2'></div>
                <div>
                  <h4 className='text-lg font-semibold mb-2'>
                    {t('home.highlights.multilingual.title')}
                  </h4>
                  <p className='text-muted-foreground'>
                    {t('home.highlights.multilingual.description')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className='text-center py-12 border-t border-border/50 mt-16'>
          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-muted-foreground'>
            <span>{t('home.footer.copyright')}</span>
            <div className='flex gap-6'>
              <Link
                href='#'
                className='hover:text-primary transition-colors duration-200'
              >
                {t('home.footer.help')}
              </Link>
              <Link
                href='#'
                className='hover:text-primary transition-colors duration-200'
              >
                {t('home.footer.about')}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
