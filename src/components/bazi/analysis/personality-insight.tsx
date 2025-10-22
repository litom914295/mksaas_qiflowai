/**
 * 八字分析 - 性格特征深度解读组件
 * 展示性格优势、弱点、沟通方式、决策模式等
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  AlertCircle,
  Award,
  Brain,
  CheckCircle2,
  Heart,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  User,
  Users,
  Zap,
} from 'lucide-react';

interface PersonalityInsightProps {
  data: BaziAnalysisModel;
}

export function PersonalityInsight({ data }: PersonalityInsightProps) {
  const { insights, tenGods, patterns } = data;
  const personality = insights.personality;

  // 如果没有性格数据，显示默认提示
  if (!personality || (!personality.strengths?.length && !personality.weaknesses?.length)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <User className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">性格分析生成中</h3>
            <p className="text-gray-600">
              正在基于您的八字进行深度性格分析...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 性格总览卡片 */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            性格特征总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 性格优势统计 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">性格优势</h4>
                <Badge className="bg-green-600">
                  {personality.strengths?.length || 0} 项
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (personality.strengths?.length || 0) * 15)} 
                className="h-2" 
              />
              <p className="text-xs text-gray-600 mt-2">
                您具有多方面的性格优势，这些是您的核心竞争力
              </p>
            </div>

            {/* 改进空间 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">改进空间</h4>
                <Badge variant="outline" className="border-orange-300 text-orange-700">
                  {personality.weaknesses?.length || 0} 项
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (personality.weaknesses?.length || 0) * 15)} 
                className="h-2" 
              />
              <p className="text-xs text-gray-600 mt-2">
                了解并改进这些方面，将助您全面发展
              </p>
            </div>
          </div>

          {/* 关键特质 */}
          <div className="mt-6 p-4 rounded-lg bg-white border-2 border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  沟通风格
                </h4>
                <p className="text-gray-700">
                  {personality.communicationStyle || '待分析'}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  决策方式
                </h4>
                <p className="text-gray-700">
                  {personality.decisionMaking || '待分析'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 性格优势详解 */}
      {personality.strengths && personality.strengths.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              您的性格优势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {personality.strengths.map((strength, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 hover:shadow-md transition-shadow"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{strength}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-green-700 border-green-300">
                    优势
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong className="text-blue-900">💡 建议：</strong>
                充分发挥这些优势，它们是您在人际交往、工作学习中的强项。
                建议在职业选择和日常生活中多运用这些特质。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 性格弱点与改进建议 */}
      {personality.weaknesses && personality.weaknesses.length > 0 && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              需要注意的方面
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personality.weaknesses.map((weakness, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200"
                >
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-800">{weakness}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-gray-700">
                <strong className="text-amber-900">⚠️ 提醒：</strong>
                这些方面并非缺陷，而是成长空间。通过有意识的训练和调整，
                可以逐步改善，达到性格的平衡发展。
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 成长建议 */}
      {personality.growthAdvice && personality.growthAdvice.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              性格成长建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personality.growthAdvice.map((advice, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200"
                >
                  <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-800">{advice}</p>
                  </div>
                  <Badge variant="outline" className="bg-white text-purple-700 border-purple-300">
                    建议
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 基于十神的性格补充分析 */}
      {tenGods.characteristics && tenGods.characteristics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              十神性格特征
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tenGods.characteristics.map((char, idx) => (
                <Badge 
                  key={idx}
                  variant="outline"
                  className="px-3 py-1 bg-indigo-50 text-indigo-800 border-indigo-300"
                >
                  {char}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              基于您八字中的十神配置，这些是您的核心性格倾向。
              十神是八字命理中用来分析性格和人生模式的重要工具。
            </p>
          </CardContent>
        </Card>
      )}

      {/* 格局性格影响 */}
      {patterns.main && (
        <Card className="border-2 border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-600" />
              格局对性格的影响
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div>
                  <p className="text-sm text-gray-600 mb-1">您的命理格局</p>
                  <p className="text-xl font-bold text-cyan-700">
                    {patterns.main.chinese || patterns.main.name}
                  </p>
                </div>
                <Badge className="bg-cyan-600">
                  成格度 {patterns.main.score}%
                </Badge>
              </div>

              <div className="p-4 bg-white rounded-lg border border-cyan-200">
                <h4 className="font-medium text-cyan-900 mb-2">格局特点</h4>
                <p className="text-sm text-gray-700">
                  {patterns.main.chinese === '正官格' && '正直守信、责任感强、做事有原则、适合管理工作'}
                  {patterns.main.chinese === '正财格' && '勤劳踏实、理财能力强、重视家庭、稳健可靠'}
                  {patterns.main.chinese === '食神格' && '温和善良、才华横溢、享受生活、人缘好'}
                  {patterns.main.chinese === '伤官格' && '聪明灵活、创新能力强、个性独特、表达力强'}
                  {patterns.main.chinese === '偏财格' && '善于交际、把握机会、财运起伏、慷慨大方'}
                  {patterns.main.chinese === '正印格' && '好学上进、品德高尚、文化修养好、慈悲为怀'}
                  {patterns.main.chinese === '七杀格' && '性格刚毅、执行力强、有魄力、竞争意识强'}
                  {!['正官格', '正财格', '食神格', '伤官格', '偏财格', '正印格', '七杀格'].includes(patterns.main.chinese) && 
                    '您的格局具有独特的性格影响，建议结合具体八字详细分析'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
