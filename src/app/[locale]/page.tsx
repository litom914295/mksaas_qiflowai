import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// 动态导入重型组件，延迟加载
const HeroWithForm = dynamic(
  () => import('@/components/home/HeroWithForm').then((mod) => ({ default: mod.HeroWithForm })),
  { loading: () => <div className="min-h-[600px] flex items-center justify-center"><div className="animate-pulse">Loading...</div></div> }
);

const FeatureShowcase = dynamic(
  () => import('@/components/home/FeatureShowcase').then((mod) => ({ default: mod.FeatureShowcase })),
  { loading: () => <div className="min-h-[400px]" /> }
);

const PricingTableSection = dynamic(
  () => import('@/components/home/PricingTableSection').then((mod) => ({ default: mod.PricingTableSection })),
  { loading: () => <div className="min-h-[400px]" /> }
);

const TrustSection = dynamic(
  () => import('@/components/home/TrustSection').then((mod) => ({ default: mod.TrustSection })),
  { loading: () => <div className="min-h-[300px]" /> }
);

// 纯静态服务器组件 - 快速渲染
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 导航栏 - 静态部分先渲染 */}
      <Navbar scroll={true} />

      {/* Hero + Form - 延迟加载 */}
      <HeroWithForm />

      {/* Feature Showcase - 延迟加载 */}
      <FeatureShowcase />

      {/* Pricing - 延迟加载 */}
      <PricingTableSection />

      {/* Trust Section - 客户端延迟加载 */}
      <TrustSection />

      {/* Footer - 静态内容 */}
      <Footer />
    </div>
  );
}
