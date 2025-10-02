'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ArrowLeft,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
// import { ForgotPasswordForm } from './forgot-password-form';
import { LoginForm as LoginFormComponent } from './login-form';
import { RegisterForm as RegisterFormComponent } from './register-form';

interface CompleteAuthFlowProps {
  defaultTab?: 'login' | 'register' | 'forgot-password';
  redirectTo?: string;
  showGuestOption?: boolean;
  onGuestContinue?: () => void;
  className?: string;
}

type AuthTab = 'login' | 'register' | 'forgot-password';

export function CompleteAuthFlow({
  defaultTab = 'login',
  redirectTo,
  showGuestOption = true,
  onGuestContinue,
  className = '',
}: CompleteAuthFlowProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const router = useRouter();
  // const pathname = usePathname();

  // 处理标签页切换
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as AuthTab);
    setMessage(null);
  }, []);

  // 处理成功登录
  const handleLoginSuccess = useCallback(() => {
    setMessage({ type: 'success', text: '登录成功，正在跳转...' });
    setIsLoading(true);

    // 保存重定向路径
    const redirectPath =
      redirectTo ||
      sessionStorage.getItem('qiflow_redirect_after_login') ||
      '/';

    setTimeout(() => {
      router.push(redirectPath);
    }, 1000);
  }, [redirectTo, router]);

  // 处理成功注册
  const handleRegisterSuccess = useCallback(() => {
    setMessage({ type: 'success', text: '注册成功！请检查邮箱完成验证。' });
    setActiveTab('login');
  }, []);

  // 处理忘记密码
  // const handleForgotPassword = useCallback(() => {
  //   setMessage({ type: 'success', text: '密码重置邮件已发送，请检查邮箱。' });
  // }, []);

  // 处理错误
  const handleError = useCallback((error: string) => {
    setMessage({ type: 'error', text: error });
    setIsLoading(false);
  }, []);

  // 处理游客继续
  const handleGuestContinue = useCallback(() => {
    if (onGuestContinue) {
      onGuestContinue();
    } else {
      // 默认游客流程
      router.push('/test');
    }
  }, [onGuestContinue, router]);

  // 返回上一页
  const handleGoBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center px-4 ${className}`}
    >
      <div className='w-full max-w-md'>
        {/* 返回按钮 */}
        <div className='mb-6'>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleGoBack}
            className='text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            返回
          </Button>
        </div>

        {/* 主要认证卡片 */}
        <Card className='shadow-lg'>
          <CardHeader className='text-center'>
            <CardTitle className='text-2xl font-bold text-gray-900'>
              {activeTab === 'login' && '登录 QiFlow AI'}
              {activeTab === 'register' && '注册 QiFlow AI'}
              {activeTab === 'forgot-password' && '忘记密码'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'login' && '欢迎回来，请输入您的账号信息'}
              {activeTab === 'register' && '创建您的 QiFlow AI 账户'}
              {activeTab === 'forgot-password' &&
                '输入您的邮箱地址，我们将发送重置密码的邮件'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* 消息提示 */}
            {message && (
              <Alert
                className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}
              >
                <AlertDescription
                  className={
                    message.type === 'error' ? 'text-red-800' : 'text-green-800'
                  }
                >
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* 加载状态 */}
            {isLoading && (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
                <span className='ml-2 text-gray-600'>处理中...</span>
              </div>
            )}

            {/* 认证表单 */}
            {!isLoading && (
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className='grid w-full grid-cols-2 mb-6'>
                  <TabsTrigger
                    value='login'
                    className='flex items-center gap-2'
                  >
                    <Lock className='w-4 h-4' />
                    登录
                  </TabsTrigger>
                  <TabsTrigger
                    value='register'
                    className='flex items-center gap-2'
                  >
                    <User className='w-4 h-4' />
                    注册
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='login' className='space-y-4'>
                  <LoginFormComponent
                    onSuccess={handleLoginSuccess}
                    onError={handleError}
                  />

                  <div className='text-center'>
                    <Button
                      variant='link'
                      size='sm'
                      onClick={() => setActiveTab('forgot-password')}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      忘记密码？
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value='register' className='space-y-4'>
                  <RegisterFormComponent
                    onSuccess={handleRegisterSuccess}
                    onError={handleError}
                  />
                </TabsContent>

                <TabsContent value='forgot-password' className='space-y-4'>
                  {/* <ForgotPasswordForm
                    onSuccess={handleForgotPassword}
                    onError={handleError}
                  /> */}

                  <div className='text-center'>
                    <Button
                      variant='link'
                      size='sm'
                      onClick={() => setActiveTab('login')}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      返回登录
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* 游客选项 */}
        {showGuestOption && activeTab !== 'forgot-password' && !isLoading && (
          <div className='mt-6 text-center'>
            <div className='text-gray-600 mb-4'>或者</div>
            <Card className='shadow-sm'>
              <CardContent className='pt-6'>
                <Button
                  onClick={handleGuestContinue}
                  variant='outline'
                  className='w-full'
                >
                  以游客身份继续体验
                </Button>
                <p className='text-xs text-gray-500 mt-2'>
                  无需注册即可体验基础功能，数据保存 24 小时
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 页脚信息 */}
        <div className='mt-8 text-center text-sm text-gray-500'>
          <p>
            继续操作即表示您同意我们的{' '}
            <Link href='/terms' className='text-blue-600 hover:underline'>
              服务条款
            </Link>{' '}
            和{' '}
            <Link href='/privacy' className='text-blue-600 hover:underline'>
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// 独立的登录表单组件
function LoginForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里应该调用实际的登录 API
      // 暂时模拟登录
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email && password) {
        onSuccess();
      } else {
        onError('请输入邮箱和密码');
      }
    } catch (error) {
      onError('登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          邮箱地址
        </label>
        <div className='relative'>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='your@email.com'
            required
          />
          <Mail className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          密码
        </label>
        <div className='relative'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='请输入密码'
            required
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
          >
            {showPassword ? (
              <EyeOff className='w-4 h-4' />
            ) : (
              <Eye className='w-4 h-4' />
            )}
          </button>
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            登录中...
          </>
        ) : (
          '登录'
        )}
      </Button>
    </form>
  );
}

// 独立的注册表单组件
function RegisterForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        onError('两次输入的密码不一致');
        return;
      }

      // 这里应该调用实际的注册 API
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess();
    } catch (error) {
      onError('注册失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          显示名称
        </label>
        <input
          type='text'
          value={formData.displayName}
          onChange={e =>
            setFormData(prev => ({ ...prev, displayName: e.target.value }))
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          placeholder='您的昵称'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          邮箱地址
        </label>
        <input
          type='email'
          value={formData.email}
          onChange={e =>
            setFormData(prev => ({ ...prev, email: e.target.value }))
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          placeholder='your@email.com'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          密码
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={e =>
            setFormData(prev => ({ ...prev, password: e.target.value }))
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          placeholder='至少8个字符'
          required
        />
      </div>

      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          确认密码
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={e =>
            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))
          }
          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          placeholder='再次输入密码'
          required
        />
      </div>

      <div className='flex items-center'>
        <input
          type='checkbox'
          id='show-password'
          checked={showPassword}
          onChange={e => setShowPassword(e.target.checked)}
          className='mr-2'
        />
        <label htmlFor='show-password' className='text-sm text-gray-600'>
          显示密码
        </label>
      </div>

      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            注册中...
          </>
        ) : (
          '创建账户'
        )}
      </Button>
    </form>
  );
}

// 忘记密码表单组件
function ForgotPasswordForm({
  onSuccess,
  onError,
}: {
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里应该调用忘记密码 API
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSuccess();
    } catch (error) {
      onError('发送失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          邮箱地址
        </label>
        <div className='relative'>
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder='输入您的注册邮箱'
            required
          />
          <Mail className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            发送中...
          </>
        ) : (
          '发送重置邮件'
        )}
      </Button>
    </form>
  );
}
