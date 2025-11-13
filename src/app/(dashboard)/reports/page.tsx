import { MyReportsView } from '@/components/qiflow/my-reports-view';
import { db } from '@/db';
import { qiflowReports } from '@/db/schema';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '我的报告 | QiFlow AI',
  description: '查看您购买的所有 AI 八字精华报告',
};

async function getUserReports(userId: string) {
  const db = await getDb();
  const reports = await db
    .select()
    .from(qiflowReports)
    .where(eq(qiflowReports.userId, userId))
    .orderBy(desc(qiflowReports.createdAt));

  return reports;
}

export default async function MyReportsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/reports');
  }

  const reports = await getUserReports(session.user.id);

  return <MyReportsView reports={reports as any} />;
}
