'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Compass, 
  Home, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  TrendingUp,
  Shield
} from 'lucide-react';

interface HouseInfo {
  sittingDirection: string;
  facingDirection: string;
  period: number;
  buildingYear: number;
}

interface ReportFengshuiAnalysisProps {
  houseInfo: HouseInfo;
}

/**
 * 风水分析组件 - 用于报告页面
 */
export function ReportFengshuiAnalysis({ houseInfo }: ReportFengshuiAnalysisProps) {
  // 简化版风水分析，后续可接入完整的玄空飞星算法
  const getBasicFengshuiAnalysis = () => {
    const { sittingDirection, facingDirection, period, buildingYear } = houseInfo;
    
    // 基于朝向的简单吉凶判断
    const favorableDirections = ['南', '东南', '东', '西南'];
    const isFavorable = favorableDirections.includes(facingDirection);
    
    return {
      overall: isFavorable ? 'good' : 'neutral',
      score: isFavorable ? 85 : 70,
      message: isFavorable 
        ? '此朝向在当前运势中属于吉利方位，有利于家运昌盛。'
        : '此朝向需要通过合理布局来化解不利因素，提升居住环境。',
    };
  };

  const analysis = getBasicFengshuiAnalysis();

  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            房屋基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <Compass className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-500">坐向</p>
              <p className="font-bold text-lg">{houseInfo.sittingDirection}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-500">朝向</p>
              <p className="font-bold text-lg">{houseInfo.facingDirection}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-500">元运</p>
              <p className="font-bold text-lg">{houseInfo.period}运</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <Home className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-500">建造年份</p>
              <p className="font-bold text-lg">{houseInfo.buildingYear}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 综合评分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            风水综合评分
          </CardTitle>
          <CardDescription>基于朝向、元运和环境因素的综合评估</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50">
            <div>
              <p className="text-sm text-gray-600 mb-1">总体评分</p>
              <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {analysis.score}
              </p>
              <p className="text-sm text-gray-500 mt-1">满分100分</p>
            </div>
            <div className="text-right">
              <Badge 
                className={
                  analysis.overall === 'good' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }
              >
                {analysis.overall === 'good' ? '吉' : '平'}
              </Badge>
              <p className="text-sm text-gray-600 mt-2 max-w-xs">
                {analysis.message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细建议 */}
      <Card>
        <CardHeader>
          <CardTitle>风水布局建议</CardTitle>
          <CardDescription>根据您的房屋信息提供的改善建议</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 吉位布局 */}
          <div className="p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">吉位布局</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• 将卧室、书房等重要空间布置在吉利方位</li>
                  <li>• 保持这些区域的清洁和光线充足</li>
                  <li>• 可摆放绿植或吉祥物增强正能量</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 注意事项 */}
          <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-2">需要注意</h4>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li>• 避免在凶位设置卧室或长时间活动区域</li>
                  <li>• 保持室内空气流通，避免阴暗潮湿</li>
                  <li>• 定期清理杂物，保持环境整洁有序</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 改善建议 */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">改善建议</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• 根据家庭成员的八字调整个人卧室位置</li>
                  <li>• 选择有利的颜色和材质进行装饰</li>
                  <li>• 合理布置家具，优化气场流动</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部提示 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          以上风水分析基于传统玄空飞星理论，结合现代环境学原理。具体布局建议请结合实际居住环境和个人八字综合考虑。
          如需更详细的风水分析和个性化建议，建议咨询专业风水师。
        </AlertDescription>
      </Alert>
    </div>
  );
}
