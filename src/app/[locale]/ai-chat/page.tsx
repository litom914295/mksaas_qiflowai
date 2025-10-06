import { AIChatDemo } from '@/components/qiflow/chat/AIChatDemo';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/i18n/navigation';
import { ArrowLeft, Shield, Sparkles, Brain } from 'lucide-react';

export default function AIChatPage() {
  // 模拟数据上下文（实际应从用户会话或数据库获取）
  const mockContext = {
    // 暂时不提供数据，展示护栏功能
    baziData: null,
    fengshuiData: null,
  };

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

        {/* AI聊天组件 */}
        <AIChatDemo context={mockContext} />

        {/* 测试说明 */}
        <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg max-w-4xl mx-auto">
          <h3 className="font-semibold text-amber-800 mb-2">
            💡 演示说明
          </h3>
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