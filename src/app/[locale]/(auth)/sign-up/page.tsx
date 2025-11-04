import { AuthCard } from '@/components/auth/auth-card';
import { SignUpForm } from '@/components/auth/sign-up-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '注册',
  description: '创建新账户',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <AuthCard
        headerLabel="创建账户"
        bottomButtonLabel="已有账户？登录"
        bottomButtonHref="/sign-in"
        className="w-full max-w-md"
      >
        <SignUpForm />
      </AuthCard>
    </div>
  );
}
