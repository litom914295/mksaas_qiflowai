import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function GuestTestPage() {
  const cookieStore = await cookies();
  const guestToken = cookieStore.get('guest_session_token')?.value;

  return (
    <div className="container py-12">
      <h1 className="title mb-4">游客模式测试页</h1>
      <p className="subtitle">当前 guest_session_token: {guestToken ?? '未创建'}</p>
    </div>
  );
}


