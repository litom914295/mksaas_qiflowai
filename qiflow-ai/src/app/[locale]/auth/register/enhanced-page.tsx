import { RegisterForm } from '@/components/auth/register-form';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/enhanced-card';
import { Compass, Sparkles } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function EnhancedRegisterPage() {
  const t = await getTranslations();

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header with feng shui branding */}
        <div className='text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent mb-6 shadow-lg'>
            <Compass className='w-8 h-8 text-white' />
          </div>
          
          <h2 className='text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
            QiFlow AI
          </h2>
          <p className='mt-2 text-muted-foreground'>开启您的智能风水之旅</p>
        </div>

        {/* Enhanced Register Card */}
        <Card variant='feng-shui' className='shadow-2xl'>
          <CardHeader className='text-center pb-4'>
            <CardTitle className='flex items-center justify-center gap-2'>
              <Sparkles className='w-5 h-5 text-accent' />
              {t('auth.register.title')}
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              {t('auth.register.subtitle')}
            </p>
          </CardHeader>
          
          <CardContent className='pt-0'>
            <RegisterForm />
            
            <div className='mt-6 text-center'>
              <p className='text-sm text-muted-foreground'>
                已有账户？{' '}
                <Link
                  href='/auth/login'
                  className='font-medium text-primary hover:text-primary/80 transition-colors'
                >
                  立即登录
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className='text-center space-y-2'>
          <p className='text-xs text-muted-foreground'>
            您的隐私和数据安全是我们的首要任务
          </p>
          <div className='flex justify-center items-center gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>🔒 数据加密</span>
            <span className='flex items-center gap-1'>🌟 专业服务</span>
            <span className='flex items-center gap-1'>🎯 精准分析</span>
          </div>
        </div>
      </div>
    </div>
  );
}
