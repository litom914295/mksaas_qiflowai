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

      {/* 财运周期分析 */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            财运周期与发展阶段
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 财运类型 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg border-2 ${
                  tenGods.profile.some(
                    (g) => g.chinese === '正财' && g.strength > 60
                  )
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <h5 className="font-medium text-gray-800 mb-2">正财型</h5>
                <p className="text-sm text-gray-600 mb-2">稳健积累、工资收入</p>
                <div className="text-2xl font-bold text-green-600">
                  {tenGods.profile.find((g) => g.chinese === '正财')
                    ?.strength || 0}
                  %
                </div>
              </div>

              <div
                className={`p-4 rounded-lg border-2 ${
                  tenGods.profile.some(
                    (g) => g.chinese === '偏财' && g.strength > 60
                  )
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <h5 className="font-medium text-gray-800 mb-2">偏财型</h5>
                <p className="text-sm text-gray-600 mb-2">投资理财、灵活收入</p>
                <div className="text-2xl font-bold text-blue-600">
                  {tenGods.profile.find((g) => g.chinese === '偏财')
                    ?.strength || 0}
                  %
                </div>
              </div>

              <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                <h5 className="font-medium text-gray-800 mb-2">综合评分</h5>
                <p className="text-sm text-gray-600 mb-2">财运总体水平</p>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    ((tenGods.profile.find((g) => g.chinese === '正财')
                      ?.strength || 0) +
                      (tenGods.profile.find((g) => g.chinese === '偏财')
                        ?.strength || 0)) /
                      2
                  )}
                  %
                </div>
              </div>
            </div>

            {/* 事业发展阶段建议 */}
            <div className="p-4 bg-white rounded-lg border-2 border-indigo-200">
              <h5 className="font-medium text-indigo-900 mb-3">
                事业发展阶段建议
              </h5>
              <div className="space-y-3">
                {[
                  {
                    age: '25-35岁',
                    stage: '积累期',
                    advice: '注重知识和经验积累，建立专业基础，多尝试不同领域',
                  },
                  {
                    age: '35-45岁',
                    stage: '上升期',
                    advice:
                      '大胆发展，争取管理岗位，可适度投资理财，扩大事业版图',
                  },
                  {
                    age: '45-60岁',
                    stage: '成熟期',
                    advice:
                      '稳健经营，注重传帮带教，延伸业务链，平衡工作与生活',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg"
                  >
                    <Badge className="bg-indigo-600 mt-0.5">{item.age}</Badge>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 mb-1">
                        {item.stage}
                      </p>
                      <p className="text-sm text-gray-600">{item.advice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 投资理财建议 */}
      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            投资理财建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 适合的投资类型 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-emerald-200">
                <h5 className="font-medium text-emerald-900 mb-3">
                  适合投资类型
                </h5>
                <ul className="space-y-2">
                  {[
                    tenGods.profile.some(
                      (g) => g.chinese === '偏财' && g.strength > 60
                    )
                      ? '股票、基金等金融产品'
                      : null,
                    tenGods.profile.some(
                      (g) => g.chinese === '正财' && g.strength > 60
                    )
                      ? '房产、储蓄、固定收益'
                      : null,
                    data.useful.favorableElements.some(
                      (e) => e.chinese === '土'
                    )
                      ? '房地产、土地投资'
                      : null,
                    data.useful.favorableElements.some(
                      (e) => e.chinese === '金'
                    )
                      ? '金融、珠宝、贵金属'
                      : null,
                    data.useful.favorableElements.some(
                      (e) => e.chinese === '水'
                    )
                      ? '流动资产、贸易、物流'
                      : null,
                    '稳健型理财产品',
                  ]
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="p-4 bg-white rounded-lg border border-orange-200">
                <h5 className="font-medium text-orange-900 mb-3">需谨慎领域</h5>
                <ul className="space-y-2">
                  {[
                    tenGods.profile.some(
                      (g) => g.chinese === '偏财' && g.strength < 30
                    )
                      ? '高风险投机和赌博'
                      : null,
                    tenGods.profile.some(
                      (g) => g.chinese === '劫财' && g.strength > 60
                    )
                      ? '合伙业务，谨防财产纠纷'
                      : null,
                    '不熟悉的领域投资',
                    '过度加杠杆的金融产品',
                  ]
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>

            {/* 风险承受能力 */}
            <div className="p-4 bg-white rounded-lg border-2 border-emerald-200">
              <h5 className="font-medium text-emerald-900 mb-3">
                风险承受能力评估
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">投资风险等级</span>
                  <Badge
                    variant={
                      tenGods.profile.some(
                        (g) => g.chinese === '偏财' && g.strength > 60
                      )
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {tenGods.profile.some(
                      (g) => g.chinese === '偏财' && g.strength > 60
                    )
                      ? '中高风险'
                      : '低风险'}
                  </Badge>
                </div>
                <Progress
                  value={
                    tenGods.profile.find((g) => g.chinese === '偏财')
                      ?.strength || 30
                  }
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  {tenGods.profile.some(
                    (g) => g.chinese === '偏财' && g.strength > 60
                  )
                    ? '您的八字偏财较旺，适合适度投资，但需注意风险控制'
                    : '您的八字财运偏稳健，建议以保守型投资为主'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 贵人方位和幸运色彩 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            贵人方位与幸运元素
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 贵人方位 */}
            <div className="p-4 bg-white rounded-lg">
              <h5 className="font-medium text-purple-900 mb-3">贵人方位</h5>
              <div className="space-y-2">
                {data.useful.favorableElements
                  .slice(0, 2)
                  .flatMap((elem) => elem.suggestions?.directions || [])
                  .slice(0, 3)
                  .map((dir, idx) => (
                    <Badge
                      key={idx}
                      className="mr-2 bg-purple-100 text-purple-800"
                    >
                      {dir}
                    </Badge>
                  ))}
                {data.useful.favorableElements[0]?.suggestions?.directions
                  ?.length === 0 && (
                  <div className="space-y-1">
                    <Badge className="mr-2 bg-purple-100 text-purple-800">
                      东南
                    </Badge>
                    <Badge className="mr-2 bg-purple-100 text-purple-800">
                      南方
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                事业发展、办公座位合适朝向
              </p>
            </div>

            {/* 幸运颜色 */}
            <div className="p-4 bg-white rounded-lg">
              <h5 className="font-medium text-purple-900 mb-3">幸运颜色</h5>
              <div className="flex flex-wrap gap-2">
                {data.useful.favorableElements
                  .slice(0, 2)
                  .flatMap((elem) => elem.suggestions?.colors || [])
                  .slice(0, 4)
                  .map((color, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{
                          backgroundColor:
                            color === '绿色'
                              ? '#22c55e'
                              : color === '蓝色'
                                ? '#3b82f6'
                                : color === '红色'
                                  ? '#ef4444'
                                  : color === '黄色'
                                    ? '#eab308'
                                    : color === '白色'
                                      ? '#f3f4f6'
                                      : '#000000',
                        }}
                      />
                      <span className="text-xs text-gray-700">{color}</span>
                    </div>
                  ))}
                {data.useful.favorableElements[0]?.suggestions?.colors
                  ?.length === 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-300" />
                      <span className="text-xs text-gray-700">蓝色</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-gray-300" />
                      <span className="text-xs text-gray-700">绿色</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                服装、装饰、办公环境合适颜色
              </p>
            </div>

            {/* 合适行业 */}
            <div className="p-4 bg-white rounded-lg">
              <h5 className="font-medium text-purple-900 mb-3">有利行业五行</h5>
              <div className="space-y-2">
                {data.useful.favorableElements.slice(0, 2).map((elem, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Badge variant="outline">{elem.chinese}行</Badge>
                    <span className="text-xs text-gray-600">
                      {elem.suggestions?.industries?.[0] || '相关行业'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                选择五行相合的行业发展更顺遂
              </p>
            </div>
          </div>

          {/* 综合应用建议 */}
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200">
            <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              综合应用建议
            </h5>
            <p className="text-sm text-gray-700">
              在找工作、创业或搜索业务伙伴时，可优先考虑
              <strong>
                {data.useful.favorableElements[0]?.suggestions
                  ?.directions?.[0] || '东南'}
              </strong>
              方向的机会。办公室装修多使用
              <strong>
                {data.useful.favorableElements[0]?.suggestions?.colors?.[0] ||
                  '蓝色'}
              </strong>
              等幸运色调。选择
              <strong>
                {data.useful.favorableElements[0]?.chinese || '水'}行
              </strong>
              相关的行业，如
              {data.useful.favorableElements[0]?.suggestions?.industries?.[0] ||
                '金融、科技'}
              等，能增强财运。
            </p>
          </div>
        </CardContent>
      </Card>

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
