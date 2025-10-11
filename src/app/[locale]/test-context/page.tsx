'use client';

import { Button } from '@/components/ui/button';
import { useAnalysisContextOptional } from '@/contexts/analysis-context';

export default function TestContextPage() {
  const context = useAnalysisContextOptional();

  const handleTest = () => {
    console.log('=== Context 测试 ===');
    console.log('Context 存在:', !!context);
    console.log('isAIChatActivated:', context?.isAIChatActivated);
    console.log('userInput:', context?.userInput);
    console.log('analysisResult:', context?.analysisResult);

    if (context) {
      const summary = context.getAIContextSummary();
      console.log('摘要长度:', summary.length);
      console.log('摘要内容:', summary);
    }
  };

  const handleActivate = () => {
    if (context) {
      context.activateAIChat();
      console.log('✅ 已激活');
    }
  };

  const handleSetData = () => {
    if (context) {
      context.setUserInput({
        personal: {
          birthYear: 1990,
          birthMonth: 5,
          birthDay: 20,
          birthHour: 10,
          gender: 'female',
        },
        house: {
          facing: 180,
          buildYear: 2015,
          floor: 8,
        },
      });
      console.log('✅ 已设置数据');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Context 测试页面</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold mb-2">状态</h2>
          <div className="space-y-1 text-sm">
            <div>Context 存在: {context ? '✅ 是' : '❌ 否'}</div>
            <div>已激活: {context?.isAIChatActivated ? '✅ 是' : '❌ 否'}</div>
            <div>有用户输入: {context?.userInput ? '✅ 是' : '❌ 否'}</div>
            <div>有分析结果: {context?.analysisResult ? '✅ 是' : '❌ 否'}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleTest}>🔍 检查 Context</Button>
          <Button onClick={handleActivate}>🚀 激活 AI-Chat</Button>
          <Button onClick={handleSetData}>💾 设置测试数据</Button>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(
              {
                contextExists: !!context,
                isActivated: context?.isAIChatActivated,
                hasUserInput: !!context?.userInput,
                hasAnalysisResult: !!context?.analysisResult,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
