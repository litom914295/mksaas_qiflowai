import EnhancedGuestAnalysisPage from '@/components/analysis/enhanced-guest-analysis-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'testGuest' });
  
  return {
    title: '风水罗盘测试页面 - ' + t('title'),
    description: '专业风水罗盘系统演示 - ' + t('description'),
  };
}

export default async function TestGuestPage({ params }: Props) {
  const { locale } = await params;
  return <EnhancedGuestAnalysisPage />;
}
