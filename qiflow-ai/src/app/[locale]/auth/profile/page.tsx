import { Suspense } from 'react';
import { UserProfileForm } from '@/components/forms/user-profile-form-new';
import { authManager } from '@/lib/auth/auth-manager';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  // 检查用户是否已登录
  const user = await authManager.getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">个人信息管理</h1>
          <p className="mt-2 text-gray-600">
            完善您的个人信息，获得更准确的风水分析结果
          </p>
        </div>

        <Suspense fallback={<div>加载中...</div>}>
          <UserProfileForm
            mode="profile"
            showProgress={true}
            defaultValues={{
              displayName: user.displayName,
              email: user.email,
            }}
            onSubmit={async (data) => {
              'use server';
              
              try {
                // 更新用户资料
                await authManager.updateProfile({
                  displayName: data.displayName,
                  preferredLocale: 'zh-CN',
                  timezone: 'Asia/Shanghai',
                });

                // 更新敏感数据
                if (data.birthDate || data.birthTime || data.address || data.email || data.phone) {
                  await authManager.updateSensitiveData({
                    birthDate: data.birthDate,
                    birthTime: data.birthTime,
                    birthLocation: data.address,
                    phone: data.phone,
                    currentPassword: '', // 这里需要用户输入当前密码
                  });
                }

                // 重定向到成功页面
                redirect('/dashboard?profile=updated');
              } catch (error) {
                throw new Error('保存失败，请重试');
              }
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}