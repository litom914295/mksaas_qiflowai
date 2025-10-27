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
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

type Props = { analysisResult?: ComprehensiveAnalysisResult | null };

/**
 * 反伏吟分析视图
 *
 * 反吟：星盘中山向星与运星相加为10（如1+9、2+8、3+7等）
 * 伏吟：星盘中山向星与运星相同（如1遇1、2遇2等）
 * 两者都是风水中的凶格局，主反复、阻滞、变动等不利影响
 */
export function FanfuyinAnalysisView({ analysisResult }: Props) {
  // 检查反伏吟情况
  const checkFanfuyin = () => {
    if (!analysisResult?.basicAnalysis?.plates?.period) {
      return { hasFanyin: false, hasFuyin: false, issues: [] };
    }

    const plate = analysisResult.basicAnalysis.plates.period;
    const period = (analysisResult as any)?.metadata?.period ?? 0;
    const issues: Array<{
      type: '反吟' | '伏吟';
      palace: number;
      description: string;
      severity: string;
    }> = [];

    let hasFanyin = false;
    let hasFuyin = false;

    plate.forEach((cell) => {
      const { palace, mountainStar, facingStar, periodStar } = cell;
      const runStar = periodStar || period;

      // 检查山星反吟（山星 + 运星 = 10）
      if (mountainStar + runStar === 10) {
        hasFanyin = true;
        issues.push({
          type: '反吟',
          palace,
          description: `${palace}宫山星${mountainStar}遇运星${runStar}成反吟`,
          severity: 'high',
        });
      }

      // 检查向星反吟（向星 + 运星 = 10）
      if (facingStar + runStar === 10) {
        hasFanyin = true;
        issues.push({
          type: '反吟',
          palace,
          description: `${palace}宫向星${facingStar}遇运星${runStar}成反吟`,
          severity: 'high',
        });
      }

      // 检查山星伏吟（山星 = 运星）
      if (mountainStar === runStar) {
        hasFuyin = true;
        issues.push({
          type: '伏吟',
          palace,
          description: `${palace}宫山星${mountainStar}与运星相同成伏吟`,
          severity: 'medium',
        });
      }

      // 检查向星伏吟（向星 = 运星）
      if (facingStar === runStar) {
        hasFuyin = true;
        issues.push({
          type: '伏吟',
          palace,
          description: `${palace}宫向星${facingStar}与运星相同成伏吟`,
          severity: 'medium',
        });
      }
    });

    return { hasFanyin, hasFuyin, issues };
  };

  const fanfuyinStatus = checkFanfuyin();
  const hasIssues = fanfuyinStatus.hasFanyin || fanfuyinStatus.hasFuyin;

  return (
    <div className="space-y-6">
      {/* 状态概览卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                反伏吟格局分析
              </CardTitle>
              <CardDescription className="mt-1">
                检测反吟与伏吟凶格 - 主反复、阻滞、变动
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={fanfuyinStatus.hasFanyin ? 'destructive' : 'secondary'}
              >
                反吟：{fanfuyinStatus.hasFanyin ? '有' : '无'}
              </Badge>
              <Badge
                variant={fanfuyinStatus.hasFuyin ? 'destructive' : 'secondary'}
              >
                伏吟：{fanfuyinStatus.hasFuyin ? '有' : '无'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasIssues ? (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">
                  警告：检测到反伏吟格局（共{fanfuyinStatus.issues.length}处）
                </div>
                <p className="text-sm">
                  反伏吟是玄空风水中的凶格局，需要特别注意化解。
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-green-50 border-green-200">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                当前飞星盘未发现明显的反伏吟格局，格局相对稳定。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 问题详情列表 */}
      {hasIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">反伏吟详情</CardTitle>
            <CardDescription>需要化解的宫位</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fanfuyinStatus.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    issue.type === '反吟'
                      ? 'bg-red-50 border-red-300'
                      : 'bg-orange-50 border-orange-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            issue.type === '反吟' ? 'destructive' : 'default'
                          }
                          className={
                            issue.type === '伏吟' ? 'bg-orange-500' : ''
                          }
                        >
                          {issue.type}
                        </Badge>
                        <span className="font-semibold">{issue.palace}宫</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {issue.description}
                      </p>
                    </div>
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
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
            <h4 className="font-semibold mb-2 text-red-700">⚠️ 什么是反吟</h4>
            <p>
              反吟是指飞星盘中，山星或向星与运星相加等于10的情况（如1+9、2+8、3+7、4+6）。
              反吟主反复无常、进退维谷、易生变故，对健康和财运都有不利影响。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-orange-700">
              🔄 什么是伏吟
            </h4>
            <p>
              伏吟是指飞星盘中，山星或向星与运星数字相同的情况（如1遇1、2遇2）。
              伏吟主沉滞不前、事事阻滞、难有起色，长期居住易有健康问题。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">📋 影响范围</h4>
            <ul className="space-y-1 ml-4">
              <li>
                • <strong>反吟</strong>：反复、变动、意外、破财、官非、健康反复
              </li>
              <li>
                • <strong>伏吟</strong>：停滞、压抑、疾病、事业不进、情绪低落
              </li>
              <li>
                • <strong>替卦反伏吟</strong>：五运特定坐向的反伏吟，凶性更强
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">🛡️ 化解方法</h4>
            <ul className="space-y-1 ml-4">
              <li>• 避免在反伏吟宫位安排主要房间（卧室、书房、办公室）</li>
              <li>• 使用五行化解物品：根据具体星曜组合选择</li>
              <li>• 增加室内动态元素：鱼缸、流水、钟摆等</li>
              <li>• 定期更换布局或装饰，打破停滞气场</li>
              <li>• 配合流年飞星，选择吉时进行调整</li>
            </ul>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>重要提示：</strong>
              反伏吟格局的严重程度还需结合具体的山向、元运、流年等因素综合判断。
              建议请专业风水师实地勘察后制定详细的化解方案。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default FanfuyinAnalysisView;
