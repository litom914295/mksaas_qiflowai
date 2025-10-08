'use client';

import { EnhancedChatInterface } from '@/components/chat/enhanced-chat-interface';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EnhancedBaziResult } from '@/lib/bazi';
import type { GenerateFlyingStarOutput } from '@/lib/qiflow/xuankong/types';
import { Bot, Compass, Home, MessageCircle, Star, User, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { BaziAnalysisResult } from './bazi-analysis-result';

interface ComprehensiveAnalysisResultProps {
  birthData: {
    datetime: string;
    gender: 'male' | 'female';
    timezone?: string;
    isTimeKnown?: boolean;
  };
  houseInfo: {
    sittingDirection: string;
    facingDirection: string;
    period?: number;
    buildingYear?: number;
  };
  baziResult?: EnhancedBaziResult | null;
  fengshuiResult?: GenerateFlyingStarOutput | null;
  onAnalysisComplete?: (
    bazi: EnhancedBaziResult | null,
    fengshui: GenerateFlyingStarOutput | null
  ) => void;
  sessionId?: string;
  userId?: string;
}

export function EnhancedComprehensiveAnalysisResult({
  birthData,
  houseInfo,
  baziResult,
  fengshuiResult,
  onAnalysisComplete,
  sessionId = `comprehensive_${Date.now()}`,
  userId = 'user',
}: ComprehensiveAnalysisResultProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatSessionId] = useState(sessionId);
  const [activeTab, setActiveTab] = useState('overview');

  // 当分析结果完成时，准备AI对话上下文
  useEffect(() => {
    if (baziResult || fengshuiResult) {
      console.log('综合分析完成，准备AI对话上下文:', {
        baziResult,
        fengshuiResult,
      });
    }
  }, [baziResult, fengshuiResult]);

  const toggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  // 生成综合建议
  const getComprehensiveRecommendations = () => {
    const recommendations = [];

    if (baziResult && fengshuiResult) {
      recommendations.push('您的八字与房屋风水相互配合，整体运势较为和谐');
      recommendations.push('建议根据八字喜用神调整房屋装饰色彩');
      recommendations.push('可在有利方位放置与八字五行相配的物品');
    } else if (baziResult) {
      recommendations.push('基于您的八字特征，建议选择适合的居住环境');
      recommendations.push('注意避免与八字相冲的方位和颜色');
    } else if (fengshuiResult) {
      recommendations.push('房屋风水良好，适合居住');
      recommendations.push('建议根据居住者八字调整室内布局');
    }

    return recommendations;
  };

  const recommendations = getComprehensiveRecommendations();

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* 头部操作栏 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>八字风水综合分析</h1>
          <p className='text-gray-600 mt-1'>
            结合个人命理与居住环境的全方位分析
          </p>
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
        {/* 分析结果 - 占2/3宽度 */}
        <div className='lg:col-span-2'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='overview'>综合概览</TabsTrigger>
              <TabsTrigger value='bazi'>八字分析</TabsTrigger>
              <TabsTrigger value='fengshui'>风水分析</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6'>
              {/* 综合概览 */}
              <Card className='shadow-lg'>
                <CardHeader className='bg-gradient-to-r from-purple-600 to-blue-600 text-white'>
                  <CardTitle className='flex items-center gap-2'>
                    <Star className='w-6 h-6' />
                    综合分析概览
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* 八字信息 */}
                    <div className='space-y-4'>
                      <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                        <User className='w-5 h-5 text-blue-600' />
                        个人命理信息
                      </h3>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>出生时间：</span>
                          <span className='font-medium'>
                            {birthData.datetime}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>性别：</span>
                          <span className='font-medium'>
                            {birthData.gender === 'male' ? '男' : '女'}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>分析状态：</span>
                          <Badge variant={baziResult ? 'default' : 'secondary'}>
                            {baziResult ? '已完成' : '待分析'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 风水信息 */}
                    <div className='space-y-4'>
                      <h3 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                        <Home className='w-5 h-5 text-green-600' />
                        居住环境信息
                      </h3>
                      <div className='space-y-2'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>房屋朝向：</span>
                          <span className='font-medium'>
                            坐{houseInfo.sittingDirection}向
                            {houseInfo.facingDirection}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>元运：</span>
                          <span className='font-medium'>
                            {houseInfo.period || 9}运
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>分析状态：</span>
                          <Badge
                            variant={fengshuiResult ? 'default' : 'secondary'}
                          >
                            {fengshuiResult ? '已完成' : '待分析'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 综合建议 */}
              <Card className='shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Star className='w-6 h-6' />
                    综合建议
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-4'>
                    {recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className='flex items-start gap-3 p-4 bg-gray-50 rounded-lg'
                      >
                        <div className='w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                          {index + 1}
                        </div>
                        <div className='text-gray-700'>{rec}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 综合分析 */}
              <Card className='shadow-lg'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Compass className='w-6 h-6' />
                    综合分析
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-6'>
                  <div className='space-y-4'>
                    <div className='p-4 bg-blue-50 rounded-lg'>
                      <h4 className='font-medium text-blue-900 mb-2'>
                        命理与环境匹配度
                      </h4>
                      <p className='text-blue-800 text-sm'>
                        通过分析您的八字特征与房屋风水格局，我们可以评估两者之间的匹配程度，
                        并提供相应的调整建议，以达到人宅相配的最佳状态。
                      </p>
                    </div>

                    <div className='p-4 bg-green-50 rounded-lg'>
                      <h4 className='font-medium text-green-900 mb-2'>
                        运势提升建议
                      </h4>
                      <p className='text-green-800 text-sm'>
                        结合八字用神与风水吉位，为您提供个性化的运势提升方案，
                        包括居住环境调整、日常行为指导等具体建议。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='bazi'>
              <BaziAnalysisResult
                birthData={birthData}
                onAnalysisComplete={result =>
                  onAnalysisComplete?.(result, fengshuiResult || null)
                }
              />
            </TabsContent>

            <TabsContent value='fengshui'>
              <div className='space-y-6'>
                {/* 风水分析结果 */}
                <Card className='shadow-lg'>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Compass className='w-6 h-6' />
                      风水分析结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-6'>
                    {fengshuiResult ? (
                      <div className='space-y-4'>
                        <div className='text-center'>
                          <div className='text-lg font-semibold text-gray-900 mb-4'>
                            {fengshuiResult.period}运飞星盘
                          </div>
                          <div className='grid grid-cols-3 gap-4 max-w-md mx-auto'>
                            {Array.from({ length: 9 }, (_, i) => (
                              <div
                                key={i}
                                className='aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold'
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className='text-center py-8'>
                        <p className='text-gray-600'>风水分析结果待生成</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI对话面板 - 占1/3宽度 */}
        <div className='lg:col-span-1'>
          {showChat ? (
            <Card className='h-[600px] flex flex-col'>
              <div className='flex items-center justify-between p-4 border-b'>
                <div className='flex items-center gap-2'>
                  <Bot className='w-5 h-5 text-blue-600' />
                  <h3 className='font-semibold'>AI 综合大师</h3>
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
                    基于您的八字和风水综合分析结果，与AI大师进行深入对话，获取更多个性化建议和人生指导。
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
      {(baziResult || fengshuiResult) && (
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
                  您的综合分析已完成！现在可以与AI大师进行深入对话，询问关于命理特征、运势建议、环境优化、人生规划等任何问题。
                  AI大师将基于您的具体八字和风水信息提供个性化的专业指导。
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
