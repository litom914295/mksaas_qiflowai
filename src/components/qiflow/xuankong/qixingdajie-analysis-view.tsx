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
import { Progress } from '@/components/ui/progress';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
  XCircle,
} from 'lucide-react';

interface QixingdajieAnalysisViewProps {
  analysisResult?: ComprehensiveAnalysisResult;
}

/**
 * 七星打劫分析视图（使用Week 3完整API）
 *
 * 七星打劫是玄空风水中最高级的格局之一，要求：
 * 1. 山、向、运三星需要在一条直线上（147、258、369）
 * 2. 特定的坐向配合
 * 3. 形理兼顾，环境条件要求极高
 */
export function QixingdajieAnalysisView({
  analysisResult,
}: QixingdajieAnalysisViewProps) {
  // 从API获取七星打劫分析数据
  const qixingdajieAnalysis = analysisResult?.qixingdajieAnalysis;

  // 未启用高级分析或数据不可用
  if (!qixingdajieAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">七星打劫分析不可用</p>
          <p className="text-sm text-muted-foreground mt-1">
            高级功能未启用或分析结果为空
          </p>
        </div>
      </div>
    );
  }

  const {
    isQixingDajie,
    dajieType,
    dajiePositions,
    effectiveness,
    description,
    activationRequirements,
    taboos,
    score,
    sanbanGuaValidation,
  } = qixingdajieAnalysis;

  // 方位映射
  const palaceToDirection: Record<number, string> = {
    1: '北（坎）',
    2: '西南（坤）',
    3: '东（震）',
    4: '东南（巽）',
    5: '中',
    6: '西北（乾）',
    7: '西（兑）',
    8: '东北（艮）',
    9: '南（离）',
  };

  // 打劫类型映射
  const dajieTypeMap: Record<
    string,
    { name: string; desc: string; color: string }
  > = {
    full: {
      name: '全劫格局',
      desc: '同时劫财劫丁，效果最佳',
      color: 'text-purple-600',
    },
    jie_cai: { name: '劫财格局', desc: '催旺财运', color: 'text-green-600' },
    jie_ding: { name: '劫丁格局', desc: '催旺人丁', color: 'text-blue-600' },
  };

  // 有效性等级映射
  const effectivenessMap: Record<
    string,
    { name: string; color: string; bgColor: string }
  > = {
    peak: {
      name: '卓越',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-300',
    },
    high: {
      name: '良好',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-300',
    },
    medium: {
      name: '中等',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-300',
    },
    low: {
      name: '较弱',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-300',
    },
  };

  // 三般卦线名称映射
  const sanbanLineMap: Record<string, string> = {
    '1,4,7': '上元线（1-4-7）',
    '2,5,8': '中元线（2-5-8）',
    '3,6,9': '下元线（3-6-9）',
  };

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
              variant={isQixingDajie ? 'default' : 'secondary'}
              className={isQixingDajie ? 'bg-yellow-500' : ''}
            >
              {isQixingDajie ? '已成格局' : '未成格局'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isQixingDajie ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <CheckCircle2 className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-semibold mb-2">{description}</div>
                {dajieType && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-yellow-600">
                      {dajieTypeMap[dajieType]?.name || dajieType}
                    </Badge>
                    <span className="text-sm">
                      {dajieTypeMap[dajieType]?.desc}
                    </span>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {description ||
                  '当前飞星盘未构成七星打劫格局。七星打劫要求极为严格，需要山向运三星在同一条线上。'}
              </AlertDescription>
            </Alert>
          )}

          {/* 评分显示 */}
          {isQixingDajie && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">格局评分</span>
                <span className="text-sm font-bold text-yellow-600">
                  {score}/100
                </span>
              </div>
              <Progress value={score} className="h-2" />
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={effectivenessMap[effectiveness]?.color}
                >
                  有效性：{effectivenessMap[effectiveness]?.name}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 三般卦验证与打劫位置 */}
      {isQixingDajie && (
        <>
          {/* 三般卦验证详情 */}
          <Card className={effectivenessMap[effectiveness]?.bgColor}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  三般卦验证
                </CardTitle>
                <Badge
                  variant={
                    sanbanGuaValidation.isValid ? 'default' : 'secondary'
                  }
                >
                  {sanbanGuaValidation.isValid ? '✓ 验证通过' : '✗ 未通过'}
                </Badge>
              </div>
              <CardDescription>
                {sanbanLineMap[sanbanGuaValidation.group.join(',')]} - 匹配度：
                {sanbanGuaValidation.matchCount}/27
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sanbanGuaValidation.details.slice(0, 6).map((detail, i) => (
                  <div key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
                {sanbanGuaValidation.details.length > 6 && (
                  <p className="text-xs text-muted-foreground">
                    ...及其他 {sanbanGuaValidation.details.length - 6} 项匹配
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 打劫位置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                打劫位置
              </CardTitle>
              <CardDescription>
                建议在以下方位布置动水或增加活动频率
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dajiePositions.map((palace, index) => (
                  <div
                    key={palace}
                    className="p-3 rounded-lg border-2 border-yellow-300 bg-yellow-50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="font-medium">
                        {palaceToDirection[palace]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* 催旺要求 */}
      {isQixingDajie && activationRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-500" />
              催旺要求
            </CardTitle>
            <CardDescription>
              以下条件需要满足才能最大化七星打劫效果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {activationRequirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 禁忌事项 */}
      {isQixingDajie && taboos.length > 0 && (
        <Card className="border-orange-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="w-5 h-5 text-orange-500" />
              禁忌事项
            </CardTitle>
            <CardDescription>
              以下事项需要避免，否则会削弱格局效果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {taboos.map((taboo, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>{taboo}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

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
