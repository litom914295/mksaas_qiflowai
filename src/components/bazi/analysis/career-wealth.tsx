/**
 * 八字分析 - 事业财运深度解读组件
 * 展示适合的职业领域、工作风格、财运模式、机遇风险等
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  ChevronRight,
  Clock,
  Crown,
  DollarSign,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

interface CareerWealthProps {
  data: BaziAnalysisModel;
}

export function CareerWealth({ data }: CareerWealthProps) {
  const { insights, tenGods, patterns } = data;
  const career = insights.careerWealth;

  // 如果没有事业财运数据，显示默认提示
  if (
    !career ||
    (!career.suitableFields?.length && !career.positions?.length)
  ) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <Briefcase className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">事业财运分析生成中</h3>
            <p className="text-gray-600">
              正在基于您的八字进行深度事业财运分析...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 事业财运总览 */}
      <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-600" />
            事业财运总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 适合领域统计 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">适合领域</h4>
                <Badge className="bg-blue-600">
                  {career.suitableFields?.length || 0} 个
                </Badge>
              </div>
              <Progress
                value={Math.min(100, (career.suitableFields?.length || 0) * 12)}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-2">
                您适合多个职业发展领域
              </p>
            </div>

            {/* 机会指数 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">机会数量</h4>
                <Badge className="bg-green-600">
                  {career.opportunities?.length || 0} 项
                </Badge>
              </div>
              <Progress
                value={Math.min(100, (career.opportunities?.length || 0) * 12)}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-2">潜在的发展机会与方向</p>
            </div>

            {/* 风险提示 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">风险提示</h4>
                <Badge
                  variant="outline"
                  className="border-orange-300 text-orange-700"
                >
                  {career.risks?.length || 0} 项
                </Badge>
              </div>
              <Progress
                value={Math.min(100, (career.risks?.length || 0) * 15)}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-2">需要注意的职业风险</p>
            </div>
          </div>

          {/* 工作风格与财运模式 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white border-2 border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                工作风格
              </h4>
              <p className="text-gray-700">{career.workStyle || '待分析'}</p>
            </div>

            <div className="p-4 rounded-lg bg-white border-2 border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                财运模式
              </h4>
              <p className="text-gray-700">
                {career.wealthPattern || '待分析'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 适合的职业领域 */}
      {career.suitableFields && career.suitableFields.length > 0 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              适合的职业领域
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {career.suitableFields.map((field, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{field}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400" />
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-cyan-50 border border-cyan-200">
              <p className="text-sm text-gray-700">
                <strong className="text-cyan-900">💼 建议：</strong>
                根据您的八字特点，这些领域与您的天赋和命局配置相匹配。
                建议优先选择这些方向发展，成功概率更高。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 适合的职位类型 */}
      {career.positions && career.positions.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-600" />
              适合的职位类型
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {career.positions.map((position, idx) => (
                <Badge
                  key={idx}
                  className="px-4 py-2 text-sm bg-green-100 text-green-800 border border-green-300 hover:bg-green-200 transition-colors"
                >
                  {position}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              这些职位类型与您的性格特质和能力结构相符，在这些岗位上您能更好地发挥潜能。
            </p>
          </CardContent>
        </Card>
      )}

      {/* 财运机会与关键时期 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 机会分析 */}
        {career.opportunities && career.opportunities.length > 0 && (
          <Card className="border-2 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                财运机会
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {career.opportunities.map((opportunity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200"
                  >
                    <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800">{opportunity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 风险提示 */}
        {career.risks && career.risks.length > 0 && (
          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                风险提示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {career.risks.map((risk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200"
                  >
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-800">{risk}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 关键发展时期 */}
      {career.keyPeriods && career.keyPeriods.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              关键发展时期
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {career.keyPeriods.map((period, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200"
                >
                  <Clock className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-800">{period}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white text-purple-700 border-purple-300"
                  >
                    关键期
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
              <p className="text-sm text-gray-700">
                <strong className="text-indigo-900">📅 提示：</strong>
                这些时期是您事业发展的重要节点，建议提前规划，把握机遇。
                可以结合大运流年分析，制定详细的行动计划。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 基于十神的事业财运补充 */}
      <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-600" />
            十神事业财运分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 财星分析 */}
            <div className="p-4 bg-white rounded-lg border border-teal-200">
              <h4 className="font-medium text-teal-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                财星配置
              </h4>
              <div className="space-y-2">
                {tenGods.profile
                  .filter((god) => god.chinese.includes('财'))
                  .map((god, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{god.chinese}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={god.strength} className="w-32 h-2" />
                        <span className="text-sm text-gray-600">
                          {god.strength}%
                        </span>
                      </div>
                    </div>
                  ))}
                {!tenGods.profile.some((god) => god.chinese.includes('财')) && (
                  <p className="text-sm text-gray-600">
                    八字中财星较弱，建议通过后天努力和时机把握来增强财运
                  </p>
                )}
              </div>
            </div>

            {/* 官星分析 */}
            <div className="p-4 bg-white rounded-lg border border-teal-200">
              <h4 className="font-medium text-teal-900 mb-3 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                官星配置
              </h4>
              <div className="space-y-2">
                {tenGods.profile
                  .filter(
                    (god) =>
                      god.chinese.includes('官') || god.chinese.includes('杀')
                  )
                  .map((god, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-700">{god.chinese}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={god.strength} className="w-32 h-2" />
                        <span className="text-sm text-gray-600">
                          {god.strength}%
                        </span>
                      </div>
                    </div>
                  ))}
                {!tenGods.profile.some(
                  (god) =>
                    god.chinese.includes('官') || god.chinese.includes('杀')
                ) && (
                  <p className="text-sm text-gray-600">
                    八字中官星较弱，建议发展自由职业或创业，避免受制于人
                  </p>
                )}
              </div>
            </div>

            {/* 综合建议 */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-teal-100 to-cyan-100 border-2 border-teal-300">
              <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                综合建议
              </h4>
              <p className="text-sm text-gray-800">
                根据您的八字配置，建议结合{patterns.main.chinese}的特点， 在
                {career.suitableFields?.[0] || '适合的领域'}中深耕发展。 注重
                {career.workStyle}的工作方式， 把握
                {career.keyPeriods?.[0] || '关键时期'}的发展机会。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
