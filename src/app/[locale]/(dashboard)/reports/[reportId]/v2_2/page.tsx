/**
 * @deprecated 此页面使用旧的命名规范 (v2_2)，已弃用
 * 请使用 /reports/[reportId]/v2-2/page.tsx
 * 此页面将在未来版本中移除
 */

import { redirect } from 'next/navigation';

export default async function ReportV22PageDeprecated({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  // Redirect to new naming convention
  redirect(`/reports/${reportId}/v2-2`);
}
