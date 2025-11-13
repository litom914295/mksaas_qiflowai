import { EssentialReportPurchasePage } from '@/components/qiflow/essential-report-purchase-page';
import { getDb } from '@/db';
import { user } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '购买精华报告 | QiFlow AI',
  description:
    '购买 AI 深度解析的八字精华报告，三大主题故事化解读，终身有效查看',
};

async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  const [userRecord] = await db
    .select({ credits: user.credits })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return userRecord?.credits ?? 0;
}

export default async function BuyEssentialReportPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/reports/essential/buy');
  }

  // 获取用户积分余额
  const userCredits = await getUserCredits(session.user.id);

  // 从 URL 参数获取预填充的生日信息 (如果有)
  const birthDate = searchParams.birthDate as string | undefined;
  const birthHour = searchParams.birthHour as string | undefined;
  const gender = searchParams.gender as string | undefined;
  const location = searchParams.location as string | undefined;

  return (
    <EssentialReportPurchasePage
      userId={session.user.id}
      userCredits={userCredits}
      prefillData={{
        birthDate,
        birthHour,
        gender: gender as 'male' | 'female' | undefined,
        location,
      }}
    />
  );
}
