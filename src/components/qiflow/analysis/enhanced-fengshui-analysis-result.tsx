'use client';

import { EnhancedChatInterface } from '@/components/chat/enhanced-chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GenerateFlyingStarOutput } from '@/lib/fengshui/types';
import {
  Bot,
  Compass,
  Home,
  Lightbulb,
  MessageCircle,
  Star,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface EnhancedFengshuiAnalysisResultProps {
  houseInfo: {
    sittingDirection: string;
    facingDirection: string;
    period?: number;
    buildingYear?: number;
  };
  analysisResult?: GenerateFlyingStarOutput | null;
  onAnalysisComplete?: (result: GenerateFlyingStarOutput | null) => void;
  sessionId?: string;
  userId?: string;
}

export function EnhancedFengshuiAnalysisResult({
  houseInfo,
  analysisResult,
  onAnalysisComplete,
  sessionId = `fengshui_${Date.now()}`,
  userId = 'user',
}: EnhancedFengshuiAnalysisResultProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatSessionId] = useState(sessionId);

  // 当分析结果完成时，准备AI对话上下文
  useEffect(() => {
    if (analysisResult) {
      console.log('风水分析完成，准备AI对话上下文:', analysisResult);
    }
  }, [analysisResult]);

  const toggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  // 生成风水建议
  const getFengshuiRecommendations = () => {
    const recommendations = [];

    // 基于朝向的建议
    if (houseInfo.facingDirection === '南') {
      recommendations.push('南向房屋采光良好，适合放置绿色植物');
      recommendations.push('客厅可设置水景装饰，增强财运');
      recommendations.push('避免在南方放置过多金属装饰');
    } else if (houseInfo.facingDirection === '北') {
      recommendations.push('北向房屋需要增强阳气，可多使用暖色调');
      recommendations.push('适合放置红色或橙色装饰品');
      recommendations.push('可在北方放置灯具增强光线');
    } else if (houseInfo.facingDirection === '东') {
      recommendations.push('东向房屋适合放置木质家具和装饰');
      recommendations.push('可在东方放置绿色植物');
      recommendations.push('避免在东方放置过多金属物品');
    } else if (houseInfo.facingDirection === '西') {
      recommendations.push('西向房屋适合放置金属装饰品');
      recommendations.push('可使用白色或金色装饰元素');
      recommendations.push('避免在西方放置过多木质家具');
    }

    return recommendations;
  };

  const recommendations = getFengshuiRecommendations();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">玄空飞星风水分析</h1>
          <p className="text-gray-600 mt-1">基于传统风水理论的房屋环境分析</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={toggleChat}
            variant={showChat ? 'default' : 'outline'}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {showChat ? '隐藏AI对话' : '与AI大师对话'}
          </Button>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 风水分析结果 - 占2/3宽度 */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* 基本信息卡片 */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-6 h-6" />
                  房屋基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {houseInfo.sittingDirection}
                    </div>
                    <div className="text-gray-600">坐山</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {houseInfo.facingDirection}
                    </div>
                    <div className="text-gray-600">朝向</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {houseInfo.period || 9}
                    </div>
                    <div className="text-gray-600">元运</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 飞星盘信息 */}
            {analysisResult && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-6 h-6" />
                    玄空飞星盘
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900 mb-4">
                      {analysisResult.period}运飞星盘
                    </div>
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      {Array.from({ length: 9 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      飞星盘分析结果将显示各宫位的吉凶情况
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 风水建议卡片 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6" />
                  风水建议
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="text-gray-700">{rec}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 详细分析 */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-6 h-6" />
                  详细分析
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      房屋朝向分析
                    </h4>
                    <p className="text-blue-800 text-sm">
                      您的房屋坐{houseInfo.sittingDirection}向
                      {houseInfo.facingDirection}，
                      这种朝向在风水学中具有特定的吉凶含义。建议根据具体方位进行相应的环境调整。
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      环境优化建议
                    </h4>
                    <p className="text-green-800 text-sm">
                      基于玄空飞星理论，建议在特定方位放置相应的风水物品，
                      以增强吉气、化解凶煞，提升整体居住环境的能量场。
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI对话面板 - 占1/3宽度 */}
        <div className="lg:col-span-1">
          {showChat ? (
            <Card className="h-[600px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">AI 风水大师</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleChat}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-hidden">
                <EnhancedChatInterface
                  sessionId={chatSessionId}
                  userId={userId}
                  className="h-full"
                />
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex flex-col items-center justify-center text-center p-6">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    与AI大师深入交流
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    基于您的风水分析结果，与AI大师进行深入对话，获取更多环境优化建议和风水指导。
                  </p>
                  <Button onClick={toggleChat} className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
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
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  💡 AI对话功能已就绪
                </h4>
                <p className="text-sm text-blue-800">
                  您的风水分析已完成！现在可以与AI大师进行深入对话，询问关于房屋布局、环境优化、风水物品摆放等任何问题。
                  AI大师将基于您的具体房屋信息提供个性化的专业建议。
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
