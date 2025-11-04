import BlogGridWithPagination from '@/components/blog/blog-grid-with-pagination';
import { websiteConfig } from '@/config/website';
import { LOCALES } from '@/i18n/routing';
import { constructMetadata } from '@/lib/metadata';
import { blogSource, categorySource } from '@/lib/source';
import { getUrlWithLocale } from '@/lib/urls/urls';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Generate all static params for SSG (locale + category)
export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    const localeCategories: any[] =
      (categorySource && typeof categorySource.getPages === 'function'
        ? (categorySource as any).getPages(locale)
        : []) || [];
    const filtered = localeCategories.filter((category: any) => category?.locale === locale);
    for (const category of filtered) {
      params.push({ locale, slug: category.slugs?.[0] });
    }
  }
  return params;
}

// Generate metadata for each static category page (locale + category)
export async function generateMetadata({ params }: BlogCategoryPageProps) {
  const { locale, slug } = await params;
  const category = (categorySource as any)?.getPage?.([slug], locale) ?? null;
  if (!category) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const canonicalPath = `/blog/category/${slug}`;

  return constructMetadata({
    title: `${category.data.name} | ${t('title')}`,
    description: category.data.description,
    canonicalUrl: getUrlWithLocale(canonicalPath, locale),
  });
}

interface BlogCategoryPageProps {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}

export default async function BlogCategoryPage({
  params,
}: BlogCategoryPageProps) {
  const { locale, slug } = await params;
  const category = (categorySource as any)?.getPage?.([slug], locale) ?? null;
  if (!category) {
    return (
      <BlogGridWithPagination locale={locale} posts={[]} totalPages={1} routePrefix={`/blog/category/${slug}`} />
    );
  }

  const localePosts: any[] = ((blogSource as any)?.getPages?.(locale) ?? []) as any[];
  const publishedPosts = localePosts.filter((post: any) => post?.data?.published);
  const filteredPosts = publishedPosts.filter((post: any) =>
    (post?.data?.categories || []).some((cat: any) => cat === category.slugs[0])
  );
  const sortedPosts = filteredPosts.sort((a, b) => {
    return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
  });
  const currentPage = 1;
  const blogPageSize = websiteConfig.blog.paginationSize;
  const paginatedLocalePosts = sortedPosts.slice(
    (currentPage - 1) * blogPageSize,
    currentPage * blogPageSize
  );
  const totalPages = Math.ceil(sortedPosts.length / blogPageSize);

  return (
    <BlogGridWithPagination
      locale={locale}
      posts={paginatedLocalePosts}
      totalPages={totalPages}
      routePrefix={`/blog/category/${slug}`}
    />
  );
}
