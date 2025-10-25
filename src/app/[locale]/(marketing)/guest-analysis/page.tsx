import BaziCompleteAnalysis from '@/components/qiflow/analysis/bazi-complete-analysis';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '专业版八字分析 - 访客预览',
    description: '展示 BaziProfessionalResult（更复杂专业版，非 8 Tab）',
  };
}

export default async function GuestAnalysis({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const sp = (k: string) => (params?.[k] as string) || '';
  const name = sp('name') || '测试用户';
  const birthDate = sp('birthDate') || '1990-05-15';
  const birthTime = sp('birthTime') || '14:30';
  const gender = (sp('gender') === 'female' ? 'female' : 'male') as
    | 'male'
    | 'female';
  const birthCity = sp('birthCity') || '北京';

  return (
    <div className="container mx-auto px-4 py-8">
      <BaziCompleteAnalysis
        personal={{
          name,
          birthDate,
          birthTime,
          gender,
          birthCity,
          calendarType: 'solar',
        }}
      />
    </div>
  );
}
