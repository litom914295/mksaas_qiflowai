'use client';

import { EnhancedChatInterface } from '@/components/chat/enhanced-chat-interface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { algorithmFirstService } from '@/lib/ai/algorithm-first-service';
import {
  Bot,
  Calendar,
  Compass,
  MessageCircle,
  Star,
  User,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface AnalysisRequiredChatInterfaceProps {
  sessionId: string;
  userId: string;
  className?: string;
  analysisType?: 'bazi' | 'fengshui' | 'combined';
  initialData?: {
    birthData?: any;
    houseInfo?: any;
  };
}

export function AnalysisRequiredChatInterface({
  sessionId,
  userId,
  className,
  analysisType = 'combined',
  initialData,
}: AnalysisRequiredChatInterfaceProps) {
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // 构建分析请求消息
      let analysisMessage = '';

      if (analysisType === 'bazi' && initialData?.birthData) {
        const { datetime, gender } = initialData.birthData;
        const date = new Date(datetime);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        analysisMessage = `请分析我的八字：${year}年${month}月${day}日${hour}时${gender === 'male' ? '男' : '女'}`;
      } else if (analysisType === 'fengshui' && initialData?.houseInfo) {
        const { sittingDirection, facingDirection } = initialData.houseInfo;
        analysisMessage = `请分析我的房屋风水：坐${sittingDirection}向${facingDirection}`;
      } else if (analysisType === 'combined') {
        let message = '请进行综合分析：';
        if (initialData?.birthData) {
          const { datetime, gender } = initialData.birthData;
          const date = new Date(datetime);
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          const hour = date.getHours();
          message += `八字${year}年${month}月${day}日${hour}时${gender === 'male' ? '男' : '女'}`;
        }
        if (initialData?.houseInfo) {
          const { sittingDirection, facingDirection } = initialData.houseInfo;
          message += `，房屋坐${sittingDirection}向${facingDirection}`;
        }
        analysisMessage = message;
      } else {
        analysisMessage = '请进行八字风水分析';
      }

      console.log('[分析要求聊天] 开始分析:', analysisMessage);

      // 调用算法优先服务
      const result = await algorithmFirstService.processAnalysisRequest(
        analysisMessage,
        sessionId,
        userId
      );

      if (result.analysisResult.success) {
        setAnalysisResult(result);
        setHasAnalysis(true);
        console.log('[分析要求聊天] 分析完成:', result.analysisResult.type);
      } else {
        setError(result.analysisResult.error || '分析失败');
      }
    } catch (error) {
      console.error('[分析要求聊天] 分析失败:', error);
      setError(error instanceof Error ? error.message : '分析过程中发生错误');
    } finally {
      setIsAnalyzing(false);
    }
  }, [analysisType, initialData, sessionId, userId]);

  // 如果已经有分析结果，显示聊天界面
  if (hasAnalysis && analysisResult) {
    return (
      <div className={className}>
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">
              分析完成，AI大师已就绪
            </h3>
          </div>
          <p className="text-sm text-green-800">
            基于您的
            {analysisResult.analysisResult.type === 'bazi'
              ? '八字'
              : analysisResult.analysisResult.type === 'fengshui'
                ? '风水'
                : '综合'}
            分析结果， AI大师现在可以为您提供个性化的专业解答和建议。
          </p>
        </div>
        <EnhancedChatInterface
          sessionId={sessionId}
          userId={userId}
          className="h-full"
        />
      </div>
    );
  }

  // 显示分析要求界面
  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl">AI 八字风水大师</CardTitle>
          <p className="text-gray-600">
            为了提供最准确的分析，请先完成算法分析
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 分析类型说明 */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">分析类型</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisType === 'bazi' && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-medium text-purple-900">八字分析</div>
                    <div className="text-sm text-purple-700">个人命理分析</div>
                  </div>
                </div>
              )}

              {analysisType === 'fengshui' && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Compass className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">风水分析</div>
                    <div className="text-sm text-green-700">房屋环境分析</div>
                  </div>
                </div>
              )}

              {analysisType === 'combined' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Star className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">综合分析</div>
                    <div className="text-sm text-blue-700">
                      八字+风水综合分析
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 数据预览 */}
          {initialData && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">输入数据</h3>
              <div className="space-y-2">
                {initialData.birthData && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      出生时间:{' '}
                      {new Date(initialData.birthData.datetime).toLocaleString(
                        'zh-CN'
                      )}
                    </span>
                  </div>
                )}
                {initialData.houseInfo && (
                  <div className="flex items-center gap-2 text-sm">
                    <Compass className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      房屋朝向: 坐{initialData.houseInfo.sittingDirection}向
                      {initialData.houseInfo.facingDirection}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                <h4 className="font-medium text-red-900">分析失败</h4>
              </div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* 开始分析按钮 */}
          <div className="text-center">
            <Button
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  正在分析中...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  开始算法分析
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              分析完成后，AI大师将基于算法结果为您提供专业解答
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
