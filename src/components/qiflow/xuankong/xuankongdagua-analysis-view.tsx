'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import { BookOpen, Compass, Info, Layers } from 'lucide-react';

interface XuankongdaguaAnalysisViewProps {
  analysisResult?: ComprehensiveAnalysisResult;
}

export function XuankongdaguaAnalysisView({
  analysisResult,
}: XuankongdaguaAnalysisViewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-500" />
            <div>
              <CardTitle>玄空大卦分析</CardTitle>
              <CardDescription className="mt-1">
                玄空风水的高级理论体系 - 64卦与飞星的深度结合
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              玄空大卦是玄空风水的高级应用，将罗盘24山进一步细分到64卦384爻，
              实现更精确的方位分析和格局判断。
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                大卦体系
              </h4>
              <p className="text-sm text-gray-700">
                将24山分别配以64卦，每卦6爻共384爻，
                每爻管15度÷6=2.5度，实现精确到度的方位分析。
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                卦气分析
              </h4>
              <p className="text-sm text-gray-700">
                根据卦象的阴阳变化、爻位的生旺死绝，
                判断不同方位的能量强弱和吉凶变化。
              </p>
            </div>
          </div>

          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">玄空大卦的核心要点</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h5 className="font-semibold mb-1">🎯 精确定位</h5>
                <p className="text-gray-700">
                  通过64卦384爻的精密划分，实现比24山更精确的方位定位，
                  特别适合大型建筑和复杂格局的分析。
                </p>
              </div>

              <div>
                <h5 className="font-semibold mb-1">⚡ 卦气运用</h5>
                <p className="text-gray-700">
                  根据卦象的先后天八卦关系、卦气的旺衰，
                  结合飞星判断具体方位的吉凶和使用时机。
                </p>
              </div>

              <div>
                <h5 className="font-semibold mb-1">🔄 替星法则</h5>
                <p className="text-gray-700">
                  在某些特殊卦位上，需要使用替星法则调整飞星布局，
                  这是玄空大卦区别于普通飞星的重要特点。
                </p>
              </div>

              <div>
                <h5 className="font-semibold mb-1">📅 时空结合</h5>
                <p className="text-gray-700">
                  大卦分析需要结合元运、流年、月令等时间因素，
                  实现时间与空间的完美统一。
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              <strong>注意：</strong>
              玄空大卦的学习和应用需要扎实的易学基础和丰富的实践经验，
              建议在专业风水师指导下学习使用。本功能提供理论框架，
              具体应用需结合实际情况灵活掌握。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default XuankongdaguaAnalysisView;
