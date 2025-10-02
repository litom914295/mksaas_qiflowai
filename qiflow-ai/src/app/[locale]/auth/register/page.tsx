import { AuthConfigCheck } from '@/components/auth/auth-config-check';
import { RegisterForm } from '@/components/auth/register-form';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const t = await getTranslations();

  return (
    <AuthConfigCheck>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {t('auth.register.title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t('auth.register.subtitle')} <Link href="/zh-CN/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">{t('auth.register.signInLink')}</Link>
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </AuthConfigCheck>
  );
}