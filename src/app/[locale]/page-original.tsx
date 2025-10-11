'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">AI智能风水分析平台</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">气流AI</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            结合传统八字命理与现代AI技术，为您提供专业的风水布局和命理分析
          </p>
        </div>

        {/* 功能卡片 */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          <Card
            className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => router.push('/unified-form')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                八字风水分析
              </CardTitle>
              <CardDescription>
                填写个人信息和房屋数据，获取完整的八字命理和风水布局建议
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                开始分析
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI智能咨询
              </CardTitle>
              <CardDescription>
                24/7 AI大师在线，随时为您解答八字、风水相关问题
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                即将上线
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 特色功能 */}
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-center">平台特色</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">精准分析</h3>
                <p className="text-sm text-gray-600">
                  基于传统命理学与AI算法的双重验证
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">智能推荐</h3>
                <p className="text-sm text-gray-600">
                  个性化的风水布局和开运建议
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">隐私保护</h3>
                <p className="text-sm text-gray-600">
                  您的个人信息将被严格加密保护
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>气流AI - 让传统智慧与现代科技完美结合</p>
        </div>
      </div>
    </div>
  );
}
