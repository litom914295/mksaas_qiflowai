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
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  Star,
} from 'lucide-react';

interface QixingdajieAnalysisViewProps {
  analysisResult?: ComprehensiveAnalysisResult;
}

/**
 * 七星打劫分析视图
 *
 * 七星打劫是玄空风水中最高级的格局之一，要求：
 * 1. 山、向、运三星需要在一条直线上（147、258、369）
 * 2. 特定的坐向配合
 * 3. 形理兼顾，环境条件要求极高
 */
export function QixingdajieAnalysisView({
  analysisResult,
}: QixingdajieAnalysisViewProps) {
  // 七星打劫三条线：上元线147、中元线258、下元线369
  const qixingLines = [
    {
      name: '上元线',
      stars: [1, 4, 7],
      element: '木',
      description: '一白、四绿、七赤连珠',
    },
    {
      name: '中元线',
      stars: [2, 5, 8],
      element: '土',
      description: '二黑、五黄、八白连珠',
    },
    {
      name: '下元线',
      stars: [3, 6, 9],
      element: '火金水',
      description: '三碧、六白、九紫连珠',
    },
  ];

  // 检查是否构成七星打劫格局
  const checkQixingdajie = () => {
    if (!analysisResult?.basicAnalysis?.plates?.period) {
      return { isQixingdajie: false, line: null, details: [] };
    }

    const plate = analysisResult.basicAnalysis.plates.period;
    const period = (analysisResult as any)?.metadata?.period ?? 0;

    // 检查每条线
    for (const line of qixingLines) {
      // 检查盘中是否存在该线的星曜组合
      const hasLine = plate.some((cell) => {
        const stars = [
          cell.periodStar || period,
          cell.mountainStar,
          cell.facingStar,
        ];
        return line.stars.every((s) => stars.includes(s));
      });

      if (hasLine) {
        return {
          isQixingdajie: true,
          line,
          details: [
            `飞星盘中出现${line.name}格局`,
            `${line.description}`,
            '具备七星打劫的基础条件',
          ],
        };
      }
    }

    return { isQixingdajie: false, line: null, details: [] };
  };

  const qixingStatus = checkQixingdajie();

  return (
    <div className="space-y-6">
      {/* 格局状态卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                七星打劫格局分析
              </CardTitle>
              <CardDescription className="mt-1">
                玄空风水最高级格局之一 - 连珠三般卦的极致运用
              </CardDescription>
            </div>
            <Badge
              variant={qixingStatus.isQixingdajie ? 'default' : 'secondary'}
              className={qixingStatus.isQixingdajie ? 'bg-yellow-500' : ''}
            >
              {qixingStatus.isQixingdajie ? '已成格局' : '未成格局'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {qixingStatus.isQixingdajie ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <CheckCircle2 className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-semibold mb-2">
                  恭喜！此宅具备七星打劫格局 - {qixingStatus.line?.name}
                </div>
                <ul className="text-sm space-y-1">
                  {qixingStatus.details.map((detail, i) => (
                    <li key={i}>• {detail}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                当前飞星盘未构成七星打劫格局。七星打劫要求极为严格，需要山向运三星在同一条线上。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 三条线详解 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">七星打劫三条线</CardTitle>
          <CardDescription>连珠三般的三大体系</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {qixingLines.map((line, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  qixingStatus.line?.name === line.name
                    ? 'bg-yellow-50 border-yellow-300'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{line.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {line.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {line.element}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {line.stars.map((star, i) => (
                    <div key={i} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-bold text-gray-900">
                        {star}
                      </div>
                      {i < line.stars.length - 1 && (
                        <div className="w-6 h-0.5 bg-gray-300 mx-1"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 理论说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">理论说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              什么是七星打劫
            </h4>
            <p>
              七星打劫是玄空风水中最神奇的格局之一，源于《沈氏玄空学》。
              当山星、向星、运星在同一条连珠线上（147、258、369），
              并且形理配合得当时，可以形成极强的催财催丁效果。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">⭐ 成格条件</h4>
            <ul className="space-y-1 ml-4">
              <li>• 山星、向星、运星必须在147、258或369其中一条线上</li>
              <li>• 坐向配合要准确，通常需要特定的二十四山坐向</li>
              <li>• 形势上要有水法配合，来水去水要符合玄空要求</li>
              <li>• 室内布局要合理利用旺气方位</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">💎 格局效果</h4>
            <p>
              七星打劫格局一旦成立，其催财催丁的效果极为显著，
              远超一般的旺山旺向格局。但同时要求也极为严格，
              需要专业风水师实地勘察和精确布置。
            </p>
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>重要提示：</strong>
              七星打劫格局的判断和运用需要极高的专业知识，
              建议在专业风水师指导下进行。形理不配合反而可能带来负面影响。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default QixingdajieAnalysisView;
