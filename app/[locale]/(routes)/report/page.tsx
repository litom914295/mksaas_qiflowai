'use client';

import { AIMasterChatButton } from '@/components/qiflow/ai-master-chat-button';
import { BaziAnalysisResult } from '@/components/qiflow/analysis/bazi-analysis-result';
import { ReportFengshuiAnalysis } from '@/components/qiflow/analysis/report-fengshui-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Compass, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function ReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 使用 useMemo 生成稳定的 sessionId，避免 hydration 错误
  const sessionId = useMemo(() => `fengshui_${Date.now()}`, []);

  // 确保客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const dataParam = searchParams.get('data');

    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setFormData(data);
      } catch (error) {
        console.error('解析数据失败:', error);
      }
    } else {
      try {
        const history = JSON.parse(localStorage.getItem('formHistory') || '[]');
        if (history.length > 0) {
          setFormData(history[0]);
        }
      } catch (error) {
        console.error('从localStorage加载失败:', error);
      }
    }

    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">正在加载分析报告...</p>
        </div>
      </div>
    );
  }

  if (!formData || !formData.personal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>未找到数据</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">请先填写分析表单</p>
            <Button
              onClick={() => router.push('/zh-CN/unified-form')}
              className="w-full"
            >
              返回填写表单
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 构建符合 ISO 8601 格式的日期时间字符串 (YYYY-MM-DDTHH:mm)
  const birthData = {
    datetime: `${formData.personal.birthDate}T${formData.personal.birthTime}`,
    gender: formData.personal.gender as 'male' | 'female',
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  const hasHouseDirection = formData.house?.direction;
  const houseInfo = hasHouseDirection
    ? {
        sittingDirection: getChineseDirection(
          Number.parseInt(formData.house.direction)
        ),
        facingDirection: getChineseDirection(
          (Number.parseInt(formData.house.direction) + 180) % 360
        ),
        period: 9,
        buildingYear: new Date().getFullYear(),
      }
    : {
        sittingDirection: '北',
        facingDirection: '南',
        period: 9,
        buildingYear: new Date().getFullYear(),
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50 py-8">
      <AIMasterChatButton />

      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {formData.personal.name}的命理风水分析
          </h1>
          <p className="text-gray-600">
            {mounted && (
              <>
                生成时间：{new Date().toLocaleDateString('zh-CN')}{' '}
                {new Date().toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </>
            )}
            {!mounted && '生成时间：加载中...'}
          </p>
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">姓名</p>
                <p className="font-medium">{formData.personal.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">性别</p>
                <p className="font-medium">
                  {formData.personal.gender === 'male' ? '男' : '女'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">出生日期</p>
                <p className="font-medium">{formData.personal.birthDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">出生时间</p>
                <p className="font-medium">{formData.personal.birthTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 分析标签页 */}
        <Tabs defaultValue="bazi" className="space-y-6">
          <TabsList
            className={`grid w-full ${hasHouseDirection ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            <TabsTrigger
              value="bazi"
              className="flex items-center justify-center gap-2 py-3"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">八字命理分析</span>
              <span className="sm:hidden">八字</span>
            </TabsTrigger>
            {hasHouseDirection && (
              <TabsTrigger
                value="fengshui"
                className="flex items-center justify-center gap-2 py-3"
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">风水布局分析</span>
                <span className="sm:hidden">风水</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="bazi">
            <BaziAnalysisResult birthData={birthData} />
          </TabsContent>

          {hasHouseDirection && (
            <TabsContent value="fengshui">
              <ReportFengshuiAnalysis houseInfo={houseInfo} />
            </TabsContent>
          )}
        </Tabs>

        {!hasHouseDirection && (
          <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-blue-900 font-semibold mb-2">
                  💡 想获得更准确的风水分析？
                </p>
                <p className="text-blue-800 mb-4">
                  您尚未填写房屋朝向信息，补充后可获得专业风水分析
                </p>
                <Button
                  onClick={() => router.push('/zh-CN/unified-form')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  补充房屋信息
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getChineseDirection(degree: number): string {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}
