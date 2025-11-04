/**
 * 八字分析 - 格局详解组件
 * 详细分析命局格局特点、成格条件、用神忌神、格局层次等
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Info,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface PatternAnalysisProps {
  data: BaziAnalysisModel;
}

// 格局详细信息库
const patternInfo: Record<
  string,
  {
    description: string;
    conditions: string[];
    characteristics: string[];
    yongshen: string[];
    jishen: string[];
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }
> = {
  正官格: {
    description:
      '正官透出有力,品行端正,责任心强,适合从事管理、公职等稳定工作。',
    conditions: [
      '月令或月干透正官',
      '正官有力不受伤',
      '日主中和或偏强',
      '无伤官克破',
    ],
    characteristics: [
      '为人正直守信',
      '有责任感和荣誉心',
      '做事循规蹈矩',
      '适合体制内发展',
      '重视名誉地位',
    ],
    yongshen: ['财星', '印星', '食神'],
    jishen: ['伤官', '羊刃', '七杀'],
    strengths: ['领导能力强', '决策稳健', '得贵人相助', '事业发展稳定'],
    weaknesses: ['思想保守', '欠缺变通', '过于谨慎', '易受约束'],
    recommendations: [
      '适合公务员、管理层、法律等职业',
      '重视学历和资质认证',
      '建立良好的人际关系网',
      '避免过于冒险的投资',
    ],
  },
  正财格: {
    description: '正财透出有根,理财能力强,勤俭持家,财运稳定,适合实业经营。',
    conditions: [
      '月令或月干透正财',
      '日主健旺有力',
      '财星不过旺不过弱',
      '有食伤生财',
    ],
    characteristics: [
      '理财观念强',
      '勤俭节约',
      '工作踏实认真',
      '财运稳定',
      '善于经营管理',
    ],
    yongshen: ['食神', '伤官', '身旺比劫'],
    jishen: ['羊刃夺财', '比劫过重', '官杀制身'],
    strengths: ['财运亨通', '积累能力强', '事业稳定', '家庭和睦'],
    weaknesses: ['过于保守', '缺乏冒险精神', '固执己见', '物质至上'],
    recommendations: [
      '适合金融、会计、商业经营等职业',
      '注重储蓄和投资理财',
      '可发展实体产业',
      '避免与人合伙容易产生纠纷',
    ],
  },
  食神格: {
    description:
      '食神透出有力,心地善良,才华横溢,享受生活,适合艺术创作、餐饮服务等。',
    conditions: [
      '月令或月干透食神',
      '日主中和或略强',
      '食神有力生财',
      '无枭神夺食',
    ],
    characteristics: [
      '性格温和宽厚',
      '才华出众',
      '善于享受生活',
      '乐于助人',
      '创造力强',
    ],
    yongshen: ['财星', '比劫', '食伤'],
    jishen: ['偏印夺食', '七杀制身', '官杀过重'],
    strengths: ['艺术天赋', '人缘好', '生活品质高', '福禄双全'],
    weaknesses: ['懒散', '不务实际', '缺乏进取心', '过于享乐'],
    recommendations: [
      '适合艺术、设计、餐饮、娱乐等行业',
      '发挥创造才能',
      '注意身体健康和饮食',
      '避免过度享乐',
    ],
  },
  伤官格: {
    description: '伤官透出有力,聪明伶俐,才华横溢,但性格叛逆,需要得当引导。',
    conditions: [
      '月令或月干透伤官',
      '日主强旺',
      '伤官泄身有力',
      '见财或有印制',
    ],
    characteristics: [
      '聪明灵活',
      '才艺双全',
      '表达能力强',
      '个性独特',
      '不拘小节',
    ],
    yongshen: ['财星泄伤', '印星制伤', '食神化伤'],
    jishen: ['官星相战', '比劫助伤', '身弱无制'],
    strengths: ['才华横溢', '创新能力强', '多才多艺', '适应力强'],
    weaknesses: ['叛逆心重', '缺乏耐心', '易树敌', '情绪化'],
    recommendations: [
      '适合创意、艺术、自媒体等自由职业',
      '发展个人特长和专业技能',
      '学会控制情绪',
      '避免官非是非',
    ],
  },
  偏财格: {
    description: '偏财透出有力,财运机遇多,善于交际,适合商业投资、金融贸易等。',
    conditions: ['月令或月干透偏财', '日主强旺', '财星不过旺', '有食伤生财'],
    characteristics: [
      '善于把握机会',
      '交际能力强',
      '财运起伏大',
      '慷慨大方',
      '投资眼光独到',
    ],
    yongshen: ['食伤生财', '比劫帮身', '印星护身'],
    jishen: ['财多身弱', '比劫夺财', '官杀泄财'],
    strengths: ['财源广进', '人脉广', '机遇多', '生意头脑'],
    weaknesses: ['不够稳定', '易冲动', '贪心', '缺乏耐心'],
    recommendations: [
      '适合投资、贸易、金融、销售等职业',
      '把握投资机会但要理性',
      '发展多元化财源',
      '注意财务安全',
    ],
  },
  正印格: {
    description:
      '正印透出有力,品行端正,学识渊博,仁慈宽厚,适合教育、文化等工作。',
    conditions: [
      '月令或月干透正印',
      '印星有力不过旺',
      '日主中和',
      '有财星制印或官星生印',
    ],
    characteristics: [
      '好学上进',
      '品德高尚',
      '文化修养好',
      '慈悲为怀',
      '受长辈关爱',
    ],
    yongshen: ['官星生印', '财星制印', '食伤泄身'],
    jishen: ['印星过旺', '比劫分福', '财星破印'],
    strengths: ['学习能力强', '文化素养高', '贵人运好', '心地善良'],
    weaknesses: ['依赖性强', '优柔寡断', '缺乏进取', '过于理想化'],
    recommendations: [
      '适合教育、文化、宗教、公益等职业',
      '深造学习提升学历',
      '发挥专业特长',
      '培养独立能力',
    ],
  },
  七杀格: {
    description: '七杀透出有力,性格刚强,有魄力和执行力,适合军警、竞争性行业。',
    conditions: [
      '月令或月干透七杀',
      '有食伤制杀或印星化杀',
      '日主强旺',
      '杀星不过旺不过弱',
    ],
    characteristics: [
      '性格刚毅',
      '执行力强',
      '有魄力和胆识',
      '竞争意识强',
      '敢作敢当',
    ],
    yongshen: ['食伤制杀', '印星化杀', '比劫帮身'],
    jishen: ['财星生杀', '伤官见官', '身弱杀强'],
    strengths: ['领导力强', '执行力强', '果断勇敢', '抗压力强'],
    weaknesses: ['脾气暴躁', '刚愎自用', '易树敌', '压力大'],
    recommendations: [
      '适合军警、体育、竞争性行业',
      '发挥执行力和领导力',
      '学会控制脾气',
      '避免过度强势',
    ],
  },
};

export function PatternAnalysis({ data }: PatternAnalysisProps) {
  const { patterns, metrics, useful } = data;
  const mainPattern = patterns.main;
  const patternDetails =
    patternInfo[mainPattern.chinese] || patternInfo[mainPattern.name];

  // 格局层次评定
  const getPatternLevel = (
    score: number
  ): { label: string; color: string; description: string } => {
    if (score >= 90)
      return {
        label: '上上格',
        color: 'text-purple-700',
        description: '格局纯正,层次极高,一生福禄双全',
      };
    if (score >= 80)
      return {
        label: '上格',
        color: 'text-blue-700',
        description: '格局清纯,层次很高,事业有成',
      };
    if (score >= 70)
      return {
        label: '中上格',
        color: 'text-green-700',
        description: '格局良好,层次较高,稳步发展',
      };
    if (score >= 60)
      return {
        label: '中格',
        color: 'text-yellow-700',
        description: '格局中等,有成就机会',
      };
    if (score >= 50)
      return {
        label: '中下格',
        color: 'text-orange-700',
        description: '格局一般,需努力奋斗',
      };
    return {
      label: '下格',
      color: 'text-red-700',
      description: '格局偏弱,多有坎坷',
    };
  };

  const patternLevel = getPatternLevel(mainPattern.score);

  return (
    <div className="space-y-6">
      {/* 格局总览 */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-indigo-600" />
            您的命理格局
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-2">主格局</div>
              <div className="text-2xl font-bold text-indigo-700 mb-2">
                {mainPattern.chinese || mainPattern.name}
              </div>
              <Badge className="bg-indigo-600">{patternLevel.label}</Badge>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-2">成格度</div>
              <div className="text-2xl font-bold text-green-700 mb-2">
                {mainPattern.score}%
              </div>
              <Progress value={mainPattern.score} className="h-2" />
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-sm text-gray-600 mb-2">格局稳定度</div>
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {patterns.stability}%
              </div>
              <Progress value={patterns.stability} className="h-2" />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-white border-2 border-indigo-200">
            <p className={`text-lg font-medium ${patternLevel.color} mb-2`}>
              {patternLevel.description}
            </p>
            {patternDetails && (
              <p className="text-gray-700">{patternDetails.description}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 成格条件分析 */}
      {patternDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              成格条件分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patternDetails.conditions.map((condition, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{condition}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                格局说明
              </h4>
              <p className="text-sm text-gray-700">
                您的八字基本符合{mainPattern.chinese}的成格条件, 成格度为
                {mainPattern.score}%,属于{patternLevel.label}。
                {mainPattern.score >= 80 && '格局清纯,发展潜力大。'}
                {mainPattern.score >= 60 &&
                  mainPattern.score < 80 &&
                  '格局良好,需把握机遇。'}
                {mainPattern.score < 60 && '格局一般,需要多努力奋斗。'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 格局特点 */}
      {patternDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-green-600" />
                格局优势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patternDetails.strengths.map((strength, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{strength}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                需要注意
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patternDetails.weaknesses.map((weakness, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{weakness}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 格局用神忌神 */}
      {patternDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              格局用神忌神
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
                <h4 className="font-medium text-green-900 mb-3">格局用神</h4>
                <div className="flex flex-wrap gap-2">
                  {patternDetails.yongshen.map((god, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      {god}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  以上为{mainPattern.chinese}的喜用神,宜多接触相关五行属性。
                </p>
              </div>

              <div className="p-4 rounded-lg bg-red-50 border-2 border-red-200">
                <h4 className="font-medium text-red-900 mb-3">格局忌神</h4>
                <div className="flex flex-wrap gap-2">
                  {patternDetails.jishen.map((god, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-red-100 text-red-800 border-red-300"
                    >
                      {god}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mt-3">
                  以上为{mainPattern.chinese}的忌神,宜避免相关五行属性过旺。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 格局发展建议 */}
      {patternDetails && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              格局发展建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patternDetails.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200"
                >
                  <Award className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 辅助格局 */}
      {patterns.secondary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              辅助格局
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {patterns.secondary.map((pattern, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <div className="font-medium text-blue-900">
                    {pattern.chinese || pattern.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    强度: {pattern.score}%
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              辅助格局为命局的次要特征,可在特定时期或环境下显现影响。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
