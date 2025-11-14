import { ReportDetailView } from '@/components/qiflow/report-detail-view';
import { db } from '@/db';
import { qiflowReports } from '@/db/schema';
import { auth } from '@/lib/auth';
import { and, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';

type Props = {
  params: { reportId: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: '报告详情 | QiFlow AI',
    description: '查看您的 AI 八字精华报告',
  };
}

async function getReport(reportId: string, userId: string) {
  const db = await getDb();
  const [report] = await db
    .select()
    .from(qiflowReports)
    .where(
      and(eq(qiflowReports.id, reportId), eq(qiflowReports.userId, userId))
    )
    .limit(1);

  return report;
}

export default async function ReportDetailPage({ params }: Props) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/reports/${params.reportId}`);
  }

  const report = await getReport(params.reportId, session.user.id);

  if (!report) {
    notFound();
  }

  // 如果报告还在生成中
  if (report.status === 'generating') {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-2xl font-bold">报告生成中...</h2>
          <p className="text-muted-foreground">
            AI 正在为您深度解析，预计还需 10-15 秒
          </p>
        </div>
      </div>
    );
  }

  // 如果报告生成失败
  if (report.status === 'failed') {
    return (
      <div className="container max-w-4xl py-12">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-destructive">报告生成失败</h2>
          <p className="text-muted-foreground">
            很抱歉，报告生成过程中出现了错误。您的积分已退回。
          </p>
          <a
            href="/reports/essential/buy"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            重新购买
          </a>
        </div>
      </div>
    );
  }

  // 正常展示报告
  return <ReportDetailView report={report} userId={session.user.id} />;
}
