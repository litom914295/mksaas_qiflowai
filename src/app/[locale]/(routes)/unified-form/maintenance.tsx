'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Clock, Construction, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 text-center">
          <div className="flex justify-center mb-4">
            <Construction className="w-16 h-16 text-purple-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            系统升级维护中
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-lg">重大升级进行中</AlertTitle>
            <AlertDescription className="mt-2 text-gray-700">
              我们正在升级八字命理算法系统，引入更精准的天文历法计算引擎，
              确保为您提供准确率超过99.9%的专业级命理分析。
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              升级内容
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 ml-7">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>集成专业级农历转换系统</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>实现精确到秒的节气计算</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>引入真太阳时校正算法</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>升级五行用神判定系统</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-0.5">✓</span>
                <span>新增100+神煞查询功能</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
            <p className="text-center text-gray-800">
              <strong>预计完成时间：</strong>
            </p>
            <p className="text-center text-2xl font-bold text-purple-700 mt-2">
              2025年1月18日
            </p>
            <p className="text-center text-sm text-gray-600 mt-1">
              升级完成后将自动恢复服务
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
            <Button
              onClick={() => router.push('/zh-CN/about')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
            >
              了解更多升级详情
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>感谢您的耐心等待，我们正全力以赴为您打造最专业的命理分析平台</p>
            <p className="mt-1">如有紧急需求，请联系客服：support@qiflow.ai</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
