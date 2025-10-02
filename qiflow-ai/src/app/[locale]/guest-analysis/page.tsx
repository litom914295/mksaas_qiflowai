import { GuestAnalysisPage } from '@/components/analysis/guest-analysis-page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '访客分析 - 风水八字分析',
    description: '专业的风水八字分析服务，为访客提供个性化的命理和风水建议',
  };
}

export default function GuestAnalysis() {
  return <GuestAnalysisPage />;
}
