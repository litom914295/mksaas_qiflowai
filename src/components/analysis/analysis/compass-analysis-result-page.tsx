'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Compass, Home, Lightbulb, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CompassAnalysisResultPageProps {
  locale: string;
  direction: number;
  theme: string;
  timestamp: string;
}

// 本地辅助函数
const getDirectionNameLocal = (dir: number): string => {
  const directions = [
    { min: 0, max: 22.5, name: '正北' },
    { min: 22.5, max: 67.5, name: '东北' },
    { min: 67.5, max: 112.5, name: '正东' },
    { min: 112.5, max: 157.5, name: '东南' },
    { min: 157.5, max: 202.5, name: '正南' },
    { min: 202.5, max: 247.5, name: '西南' },
    { min: 247.5, max: 292.5, name: '正西' },
    { min: 292.5, max: 337.5, name: '西北' },
    { min: 337.5, max: 360, name: '正北' }
  ];
  
  const normalizedDir = ((dir % 360) + 360) % 360;
  const found = directions.find(d => normalizedDir >= d.min && normalizedDir < d.max);
  return found?.name || '正北';
};

const getDirectionElementLocal = (dir: number): string => {
  const normalizedDir = ((dir % 360) + 360) % 360;
  if (normalizedDir >= 315 || normalizedDir < 45) return '水';
  if (normalizedDir >= 45 && normalizedDir < 135) return '木';
  if (normalizedDir >= 135 && normalizedDir < 225) return '火';
  if (normalizedDir >= 225 && normalizedDir < 315) return '金';
  return '土';
};

const getBaguaInfoLocal = (dir: number) => {
  const normalizedDir = ((dir % 360) + 360) % 360;
  const baguaMap = [
    { min: 337.5, max: 22.5, name: '坎', symbol: '☵', meaning: '水' },
    { min: 22.5, max: 67.5, name: '艮', symbol: '☶', meaning: '山' },
    { min: 67.5, max: 112.5, name: '震', symbol: '☳', meaning: '雷' },
    { min: 112.5, max: 157.5, name: '巽', symbol: '☴', meaning: '风' },
    { min: 157.5, max: 202.5, name: '离', symbol: '☲', meaning: '火' },
    { min: 202.5, max: 247.5, name: '坤', symbol: '☷', meaning: '地' },
    { min: 247.5, max: 292.5, name: '兑', symbol: '☱', meaning: '泽' },
    { min: 292.5, max: 337.5, name: '乾', symbol: '☰', meaning: '天' }
  ];
  
  const found = baguaMap.find(b => {
    if (b.min > b.max) { // 跨越0度的情况
      return normalizedDir >= b.min || normalizedDir < b.max;
    }
    return normalizedDir >= b.min && normalizedDir < b.max;
  });
  
  return found || { name: '坎', symbol: '☵', meaning: '水' };
};

export function CompassAnalysisResultPage({ 
  locale, 
  direction, 
  // theme, 
  timestamp 
}: CompassAnalysisResultPageProps) {
  const router = useRouter();

  // 获取方向信息
  const directionName = getDirectionNameLocal(direction);
  const element = getDirectionElementLocal(direction);
  const baguaInfo = getBaguaInfoLocal(direction);

  // 生成分析建议
  const getAnalysisRecommendations = () => {
    const recommendations = [];
    
    switch (element) {
      case '水':
        recommendations.push('适合放置流水装饰或鱼缸');
        recommendations.push('使用蓝色或黑色装饰元素');
        recommendations.push('避免过多的火元素装饰');
        break;
      case '木':
        recommendations.push('适合放置绿色植物');
        recommendations.push('使用木质家具和装饰');
        recommendations.push('绿色系装饰有利于运势');
        break;
      case '火':
        recommendations.push('适合放置红色装饰品');
        recommendations.push('可以使用灯具增强光线');
        recommendations.push('避免过多的水元素');
        break;
      case '金':
        recommendations.push('适合放置金属装饰品');
        recommendations.push('白色或金色装饰有利');
        recommendations.push('可以放置圆形装饰物');
        break;
      case '土':
        recommendations.push('适合放置陶瓷或石质装饰');
        recommendations.push('黄色或棕色装饰有利');
        recommendations.push('方形装饰物有助运势');
        break;
    }
    
    return recommendations;
  };

  const recommendations = getAnalysisRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">风水分析报告</h1>
          <div className="w-20" /> {/* 占位符保持居中 */}
        </div>

        {/* 基本信息卡片 */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Compass className="w-6 h-6" />
              罗盘测量结果
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {direction.toFixed(1)}°
                </div>
                <div className="text-gray-600">测量角度</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {directionName}
                </div>
                <div className="text-gray-600">方位</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {element}
                </div>
                <div className="text-gray-600">五行属性</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 八卦信息卡片 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              八卦分析
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-6xl mb-4">{baguaInfo.symbol}</div>
                <div className="text-xl font-bold text-gray-800">{baguaInfo.name}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {baguaInfo.meaning}
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {baguaInfo.name}卦
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="text-gray-700">{rec}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 详细分析卡片 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-6 h-6" />
              详细分析
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">方位特性</h3>
                <p className="text-gray-600 leading-relaxed">
                  {directionName}方位属{element}，在风水学中代表{baguaInfo.meaning}的能量。
                  这个方位的能量特征有助于{element === '水' ? '智慧和财运' : 
                    element === '木' ? '成长和健康' :
                    element === '火' ? '名声和事业' :
                    element === '金' ? '贵人和收获' : '稳定和包容'}的提升。
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">能量平衡</h3>
                <p className="text-gray-600 leading-relaxed">
                  根据五行相生相克的原理，{element}元素与其他元素的搭配需要注意平衡。
                  建议在装饰和布局时考虑五行的和谐统一，避免相克元素的过度使用。
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">时间因素</h3>
                <p className="text-gray-600 leading-relaxed">
                  测量时间：{new Date(timestamp).toLocaleString('zh-CN')}
                  <br />
                  建议定期重新测量，因为环境变化可能影响风水格局。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4 pb-8">
          <Button 
            onClick={() => router.push(`/${locale}/test-guest`)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            重新测量
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.print()}
          >
            保存报告
          </Button>
        </div>
      </div>
    </div>
  );
}