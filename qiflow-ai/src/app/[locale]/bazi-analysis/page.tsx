import { BaziAnalysisPage } from '@/components/analysis/bazi-analysis-page';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bazi');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function BaziAnalysis() {
  return <BaziAnalysisPage />;
}
