'use client';

import dynamic from 'next/dynamic';

// 客户端动态加载组件
export const CrispChat = dynamic(
  () => import('@/components/layout/crisp-chat'),
  {
    ssr: false,
  }
);

export const InteractiveCompassTeaser = dynamic(
  () =>
    import('@/components/qiflow/homepage/InteractiveCompassTeaser').then(
      (m) => m.InteractiveCompassTeaser
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto my-8 h-40 w-full max-w-3xl animate-pulse rounded-xl bg-muted" />
    ),
  }
);
