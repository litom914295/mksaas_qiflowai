import { CompassAnalysisResultPage } from '@/components/qiflow/analysis/compass-analysis-result-page';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '风水罗盘分析结果',
    description: '基于风水罗盘的专业分析结果和建议',
  };
}

interface CompassAnalysisResultProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    direction?: string;
    theme?: string;
    timestamp?: string;
  }>;
}

export default async function CompassAnalysisResult({
  params,
  searchParams,
}: CompassAnalysisResultProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CompassAnalysisResultPage
      locale={resolvedParams.locale}
      direction={
        resolvedSearchParams.direction
          ? Number.parseFloat(resolvedSearchParams.direction)
          : 0
      }
      theme={resolvedSearchParams.theme || 'luxury'}
      timestamp={
        resolvedSearchParams.timestamp || new Date().getTime().toString()
      }
    />
  );
}
