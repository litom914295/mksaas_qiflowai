'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function DemoModeNotice() {
  const router = useRouter();

  return (
    <Alert className="border-blue-200 bg-blue-50 mb-6">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800">
            演示模式提醒
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              当前系统运行在演示模式下，无法创建真实的用户账户。您可以：
            </p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>使用游客模式体验所有功能</li>
              <li>联系管理员配置正式的认证服务</li>
              <li>查看功能演示和界面设计</li>
            </ul>
          </div>
          <div className="mt-4 flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="text-blue-800 border-blue-300 hover:bg-blue-100"
            >
              返回首页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/zh-CN/bazi-analysis')}
              className="text-blue-800 border-blue-300 hover:bg-blue-100"
            >
              游客模式体验
            </Button>
          </div>
        </div>
      </div>
    </Alert>
  );
}