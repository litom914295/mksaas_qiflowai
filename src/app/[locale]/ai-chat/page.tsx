'use client';

import { AIChatWithContext } from '@/components/qiflow/ai-chat-with-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAnalysisContext } from '@/contexts/analysis-context';
import { LocaleLink } from '@/i18n/navigation';
import {
  ArrowLeft,
  Brain,
  Compass,
  Home as HomeIcon,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AIChatPage() {
  const router = useRouter();
  const analysisContext = useAnalysisContext();
  const [hasContext, setHasContext] = useState(false);

  useEffect(() => {
    // 检查是否有上下文数据
    const hasData = !!(
      analysisContext?.userInput || analysisContext?.analysisResult
    );
    setHasContext(hasData);
  }, [analysisContext?.userInput, analysisContext?.analysisResult]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <LocaleLink href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </LocaleLink>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI智能咨询
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              基于您的八字命理和风水数据，为您提供个性化的专业建议
            </p>
          </div>
        </div>

        {/* AI护栏特性说明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-green-500" />
              <h3 className="font-semibold">算法优先</h3>
            </div>
            <p className="text-sm text-gray-600">
              所有个性化建议必须基于已计算的结构化数据，确保准确性
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <Brain className="w-8 h-8 text-blue-500" />
              <h3 className="font-semibold">智能识别</h3>
            </div>
            <p className="text-sm text-gray-600">
              自动识别问题类型，引导用户完成必要的分析步骤
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <h3 className="font-semibold">合规保护</h3>
            </div>
            <p className="text-sm text-gray-600">
              自动过滤敏感话题，确保内容安全合规
            </p>
          </div>
        </div>

        {/* 上下文状态提示 */}
        {hasContext ? (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800">
                    智能模式已启用
                  </h3>
                  <p className="text-sm text-green-700">
                    AI 已加载您的八字
                    {analysisContext?.userInput?.house ? '和风水' : ''}
                    信息，可以为您提供个性化建议
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 border-2 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">通用对话模式</h3>
                  <p className="text-sm text-amber-700">
                    当前未加载分析数据。如需个性化建议，请先进行八字或风水分析。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI聊天组件（上下文增强版） */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-2xl border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI 智能咨询
              </CardTitle>
              <CardDescription>
                {hasContext
                  ? '基于您的八字和风水数据，为您提供专业建议'
                  : '可以回答通用命理风水问题，个性化建议需先进行分析'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* 悬浮版 AI-Chat 会自动显示在右下角 */}
              <div className="p-6 text-center text-gray-500">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-300" />
                <p className="text-lg">请点击右下角的 AI 对话按钮开始咨询</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <AIChatWithContext />

        {/* 测试说明 */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg max-w-4xl mx-auto">
          <h3 className="font-semibold text-amber-800 mb-2">💡 演示说明</h3>
          <div className="text-sm text-amber-700 space-y-2">
            <p>• 试试询问 "我的事业运势如何？" - AI会引导您先进行八字分析</p>
            <p>• 试试询问 "什么是八字命理？" - AI会提供通用知识解答</p>
            <p>• 试试询问 "客厅的财位在哪里？" - AI会引导您先进行风水分析</p>
            <p>• 敏感话题（如疾病、赌博等）会被自动过滤</p>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="flex justify-center gap-4 mt-8">
          <LocaleLink href="/analysis/bazi">
            <Button size="lg" variant="default">
              开始八字分析
            </Button>
          </LocaleLink>
          <LocaleLink href="/analysis/xuankong">
            <Button size="lg" variant="outline">
              开始风水分析
            </Button>
          </LocaleLink>
        </div>
      </div>
    </div>
  );
}
