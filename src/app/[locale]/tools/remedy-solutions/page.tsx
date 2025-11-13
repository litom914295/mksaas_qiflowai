import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RemedySolutionsClient } from './client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'remedySolutions' });
  
  return {
    title: t('title', { defaultValue: '风水化解方案库 | QiFlow AI' }),
    description: t('description', { 
      defaultValue: '专业的风水化解方案，包含基础、标准、专业、终极四级方案，提供详细的实施步骤和物品清单' 
    }),
  };
}

export default async function RemedySolutionsPage() {
  return <RemedySolutionsClient />;
}