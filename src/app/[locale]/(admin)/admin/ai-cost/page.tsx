import { AICostDashboard } from '@/components/admin/ai-cost-dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'AI成本监控 | Admin',
  description: '实时监控AI使用成本和预算管理',
};

export default function AICostPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        }
      >
        <AICostDashboard />
      </Suspense>
    </div>
  );
}
