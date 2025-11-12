import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from '@/lib/auth';
import { db } from "@/db";
import { qiflowReports } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MyReportsView } from "@/components/qiflow/my-reports-view";

export const metadata: Metadata = {
  title: "我的报告 | QiFlow AI",
  description: "查看您购买的所有 AI 八字精华报告",
};

async function getUserReports(userId: string) {
  const reports = await db.query.qiflowReports.findMany({
    where: eq(qiflowReports.userId, userId),
    orderBy: [desc(qiflowReports.createdAt)],
  });

  return reports;
}

export default async function MyReportsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/reports");
  }

  const reports = await getUserReports(session.user.id);

  return <MyReportsView reports={reports} />;
}
