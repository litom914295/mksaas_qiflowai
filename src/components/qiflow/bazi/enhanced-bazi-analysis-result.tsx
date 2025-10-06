'use client';

import { EnhancedChatInterface } from '@/components/chat/enhanced-chat-interface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { EnhancedBaziResult } from '@/lib/qiflow/bazi';
import { Bot, MessageCircle, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BaziAnalysisResult } from './bazi-analysis-result';

interface EnhancedBaziAnalysisResultProps {
  birthData: {
    datetime: string;
    gender: 'male' | 'female';
    timezone?: string;
    isTimeKnown?: boolean;
  };
  analysisResult?: EnhancedBaziResult | null;
  onAnalysisComplete?: (result: EnhancedBaziResult | null) => void;
  sessionId?: string;
  userId?: string;
}

export function EnhancedBaziAnalysisResult({
  birthData,
  analysisResult,
  onAnalysisComplete,
  sessionId = `bazi_${Date.now()}`,
  userId = 'user',
}: EnhancedBaziAnalysisResultProps) {
  // const t = useTranslations();
  const [showChat, setShowChat] = useState(false);
  const [chatSessionId] = useState(sessionId);

  // 当分析结果完成时，准备AI对话上下文
  useEffect(() => {
    if (analysisResult) {
      // 可以在这里设置AI对话的上下文，包含八字分析结果
      console.log('八字分析完成，准备AI对话上下文:', analysisResult);
    }
  }, [analysisResult]);

  const toggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* 头部操作栏 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>深度八字命理分析</h1>
          <p className='text-gray-600 mt-1'>基于专业算法的个性化命理洞察</p>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            onClick={toggleChat}
            variant={showChat ? 'default' : 'outline'}
            className='flex items-center gap-2'
          >
            <MessageCircle className='w-4 h-4' />
            {showChat ? '隐藏AI对话' : '与AI大师对话'}
          </Button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* 八字分析结果 - 占2/3宽度 */}
        <div className='lg:col-span-2'>
          <BaziAnalysisResult
            birthData={birthData}
            onAnalysisComplete={onAnalysisComplete}
          />
        </div>

        {/* AI对话面板 - 占1/3宽度 */}
        <div className='lg:col-span-1'>
          {showChat ? (
            <Card className='h-[600px] flex flex-col'>
              <div className='flex items-center justify-between p-4 border-b'>
                <div className='flex items-center gap-2'>
                  <Bot className='w-5 h-5 text-blue-600' />
                  <h3 className='font-semibold'>AI 八字大师</h3>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={toggleChat}
                  className='h-8 w-8 p-0'
                >
                  <X className='w-4 h-4' />
                </Button>
              </div>

              <div className='flex-1 overflow-hidden'>
                <EnhancedChatInterface
                  sessionId={chatSessionId}
                  userId={userId}
                  className='h-full'
                />
              </div>
            </Card>
          ) : (
            <Card className='h-[600px] flex flex-col items-center justify-center text-center p-6'>
              <div className='space-y-4'>
                <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
                  <MessageCircle className='w-8 h-8 text-blue-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                    与AI大师深入交流
                  </h3>
                  <p className='text-gray-600 text-sm mb-4'>
                    基于您的八字分析结果，与AI大师进行深入对话，获取更多个性化建议和解答疑问。
                  </p>
                  <Button onClick={toggleChat} className='w-full'>
                    <MessageCircle className='w-4 h-4 mr-2' />
                    开始对话
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 底部提示信息 */}
      {analysisResult && (
        <Card className='bg-blue-50 border-blue-200'>
          <div className='p-4'>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                <Bot className='w-4 h-4 text-blue-600' />
              </div>
              <div>
                <h4 className='font-medium text-blue-900 mb-1'>
                  💡 AI对话功能已就绪
                </h4>
                <p className='text-sm text-blue-800'>
                  您的八字分析已完成！现在可以与AI大师进行深入对话，询问关于您的命理特征、运势建议、人生指导等任何问题。
                  AI大师将基于您的具体八字信息提供个性化的专业解答。
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
