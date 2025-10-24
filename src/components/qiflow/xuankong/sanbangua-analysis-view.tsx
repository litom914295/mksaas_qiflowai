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
import { AlertCircle, CheckCircle2, Hexagon, Info } from 'lucide-react';

interface SanbanguaAnalysisViewProps {
  analysisResult?: ComprehensiveAnalysisResult;
}

/**
 * 三般卦分析视图
 *
 * 三般卦是玄空风水中的重要格局，分为：
 * 1. 连珠三般卦（父母三般）：147、258、369三组数字
 * 2. 合十三般：15、24、36、48、27、69等合十组合
 * 3. 以当运旺星为中心的三般关系
 */
export function SanbanguaAnalysisView({
  analysisResult,
}: SanbanguaAnalysisViewProps) {
  // 三般卦的三组数字
  const sanbanGroups = [
    { name: '上元三般', numbers: [1, 4, 7], element: '木', 运: '一、四、七运' },
    { name: '中元三般', numbers: [2, 5, 8], element: '土', 运: '二、五、八运' },
    {
      name: '下元三般',
      numbers: [3, 6, 9],
      element: '金水火',
      运: '三、六、九运',
    },
  ];

  // 检查是否构成三般卦格局
  const checkSanbangua = () => {
    if (!analysisResult?.basicAnalysis?.plates?.period) {
      return { hasSanbangua: false, groups: [], details: [] };
    }

    const plate = analysisResult.basicAnalysis.plates.period;
    const period = analysisResult.metadata.period;
    const matchedGroups: typeof sanbanGroups = [];
    const details: string[] = [];

    for (const group of sanbanGroups) {
      // 检查飞星盘中是否有该组的组合
      const hasGroup = plate.some((cell) => {
        const mountainStar = cell.mountainStar;
        const facingStar = cell.facingStar;

        // 检查山向星是否都在同一组
        const mountainInGroup = group.numbers.includes(mountainStar);
        const facingInGroup = group.numbers.includes(facingStar);

        return mountainInGroup && facingInGroup;
      });

      if (hasGroup) {
        matchedGroups.push(group);
        details.push(`发现${group.name}格局 - ${group.numbers.join('、')}连珠`);
      }
    }

    // 检查连珠三般（父母三般）
    const hasLianzhu = plate.some((cell) => {
      const stars = [
        cell.periodStar || period,
        cell.mountainStar,
        cell.facingStar,
      ];
      return sanbanGroups.some((group) =>
        group.numbers.every((n) => stars.includes(n))
      );
    });

    if (hasLianzhu) {
      details.push('构成连珠三般卦（父母三般），吉祥格局');
    }

    return {
      hasSanbangua: matchedGroups.length > 0 || hasLianzhu,
      groups: matchedGroups,
      hasLianzhu,
      details,
    };
  };

  const sanbanStatus = checkSanbangua();

  return (
    <div className="space-y-6">
      {/* 格局状态卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Hexagon className="w-5 h-5 text-blue-500" />
                三般卦格局分析
              </CardTitle>
              <CardDescription className="mt-1">
                连珠三般 - 天地人三才合一的吉祥格局
              </CardDescription>
            </div>
            <Badge
              variant={sanbanStatus.hasSanbangua ? 'default' : 'secondary'}
              className={sanbanStatus.hasSanbangua ? 'bg-blue-500' : ''}
            >
              {sanbanStatus.hasSanbangua ? '有三般卦' : '无三般卦'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sanbanStatus.hasSanbangua ? (
            <Alert className="bg-blue-50 border-blue-200">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="font-semibold mb-2">
                  此宅具备三般卦格局
                  {sanbanStatus.hasLianzhu && ' - 连珠三般'}
                </div>
                <ul className="text-sm space-y-1">
                  {sanbanStatus.details.map((detail, i) => (
                    <li key={i}>• {detail}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                当前飞星盘未构成明显的三般卦格局。三般卦要求山向星在同一组数字中。
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 三般分组详解 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">三般卦体系</CardTitle>
          <CardDescription>上中下三元的数字分组</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {sanbanGroups.map((group, index) => {
              const isMatched = sanbanStatus.groups.some(
                (g) => g.name === group.name
              );
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isMatched
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {group.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        对应：{group.运}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {group.element}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {group.numbers.map((num, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-12 h-12 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center font-bold text-lg text-gray-900 shadow-sm">
                          {num}
                        </div>
                        {i < group.numbers.length - 1 && (
                          <div className="text-gray-400 mx-2">→</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 三般卦类型说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">三般卦类型</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                连珠三般（父母三般）
              </h4>
              <p className="text-sm text-gray-700">
                运星、山星、向星都在同一组（147/258/369）内，为最佳三般卦格局。
                主催财催丁，事业亨通。
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                分组三般
              </h4>
              <p className="text-sm text-gray-700">
                山星和向星在同一组内，但运星不在。也能形成一定的吉祥效果，
                但不如连珠三般强劲。
              </p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                合十三般
              </h4>
              <p className="text-sm text-gray-700">
                不同组的数字相加为10或15（如1+9、2+8、4+6等），
                也有一定的化煞作用。
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                旺星三般
              </h4>
              <p className="text-sm text-gray-700">
                以当运旺星为中心，形成三般关系。九运以9为中心，
                配合3、6形成下元三般。
              </p>
            </div>
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
            <h4 className="font-semibold mb-2">📚 什么是三般卦</h4>
            <p>
              三般卦是玄空风水中的重要概念，将九宫飞星分为三组：
              上元（147）、中元（258）、下元（369）。
              当飞星组合符合三般规律时，能够产生和谐的能量场，
              有利于财运、事业和家庭和睦。
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">✨ 三般卦的作用</h4>
            <ul className="space-y-1 ml-4">
              <li>
                • <strong>连珠三般</strong>：最强催财催丁格局，事业亨通
              </li>
              <li>
                • <strong>同组三般</strong>：增强运势稳定性，减少波动
              </li>
              <li>
                • <strong>合十三般</strong>：化解煞气，阴阳调和
              </li>
              <li>
                • <strong>旺星三般</strong>：借助时运，乘势而起
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">🎯 如何运用三般卦</h4>
            <p>在实际应用中，应该：</p>
            <ul className="space-y-1 ml-4 mt-2">
              <li>• 主要房间（主卧、客厅、书房）尽量安排在三般吉位</li>
              <li>• 财位、文昌位若在三般宫位，效果会更显著</li>
              <li>• 配合元运使用，九运重点关注下元三般（369）</li>
              <li>• 注意流年飞星的三般变化，择吉而动</li>
            </ul>
          </div>

          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>提示：</strong>
              三般卦是玄空风水的基础理论之一，与其他格局（如旺山旺向、城门诀等）
              配合使用效果更佳。建议结合实际情况综合判断。
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default SanbanguaAnalysisView;
