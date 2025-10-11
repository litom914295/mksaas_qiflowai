import { AuthCard } from '@/components/auth/auth-card';
import { SignInForm } from '@/components/auth/sign-in-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '登录',
  description: '登录您的账户',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard
        headerLabel="欢迎回来"
        bottomButtonLabel="还没有账户？注册"
        bottomButtonHref="/sign-up"
        className="w-full max-w-md"
      >
        <SignInForm />
      </AuthCard>
    </div>
  );
}
