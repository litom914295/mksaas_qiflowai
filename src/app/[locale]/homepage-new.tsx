'use client';

import { FeatureShowcase } from '@/components/home/FeatureShowcase';
import { HeroWithForm } from '@/components/home/HeroWithForm';
import { PricingSection } from '@/components/home/PricingSection';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { useTranslations } from 'next-intl';

export default function NewHomePage() {
  const t = useTranslations('home');

  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 - 包含注册/登录、语言切换、菜单 */}
      <Navbar scroll={true} />

      {/* Hero + Form Section - 合并设计 */}
      <HeroWithForm />

      {/* Feature Showcase - 统一背景 */}
      <FeatureShowcase />

      {/* Pricing Section - 统一背景 */}
      <PricingSection />

      {/* Trust & Security Section - 统一设计系统 */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-3">
                {t('trust.title') || '您的信任，我们的承诺'}
              </h2>
              <p className="text-muted-foreground">
                {t('trust.subtitle') || '专业、安全、高效的AI命理服务'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🔒</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2 text-lg">
                  {t('trust.privacy.title') || '隐私保护'}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('trust.privacy.description') ||
                    '数据加密存储，绝不泄露个人信息'}
                </p>
              </div>
              <div className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2 text-lg">
                  {t('trust.speed.title') || '极速响应'}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('trust.speed.description') ||
                    'AI 算法驱动，3分钟内完成分析'}
                </p>
              </div>
              <div className="group flex flex-col items-center p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2 text-lg">
                  {t('trust.accuracy.title') || '专业准确'}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t('trust.accuracy.description') ||
                    '结合传统命理与现代AI，准确率高达98%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - MKSaaS 完整页脚（包含链接、社交媒体、主题切换） */}
      <Footer />
    </div>
  );
}
