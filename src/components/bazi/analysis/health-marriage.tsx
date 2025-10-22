/**
 * 八字分析 - 健康婚姻深度解读组件
 * 展示体质特点、健康关注、婚姻状况、配偶特征等
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Heart,
  HeartHandshake,
  Lightbulb,
  Shield,
  Sparkles,
  Users,
  Stethoscope,
} from 'lucide-react';

interface HealthMarriageProps {
  data: BaziAnalysisModel;
}

export function HealthMarriage({ data }: HealthMarriageProps) {
  const { insights, patterns, useful } = data;
  const healthMarriage = insights.healthMarriage;

  // 如果没有健康婚姻数据，显示默认提示
  if (!healthMarriage || 
      (!healthMarriage.healthFocus?.organs?.length && 
       !healthMarriage.marriage?.advice?.length)) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 space-y-4">
            <Heart className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="text-lg font-semibold">健康婚姻分析生成中</h3>
            <p className="text-gray-600">
              正在基于您的八字进行深度健康婚姻分析...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 健康婚姻总览 */}
      <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            健康婚姻总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 健康关注点 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">健康关注</h4>
                <Badge className="bg-green-600">
                  {healthMarriage.healthFocus?.concerns?.length || 0} 项
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (healthMarriage.healthFocus?.concerns?.length || 0) * 20)} 
                className="h-2" 
              />
              <p className="text-xs text-gray-600 mt-2">
                需要重点关注的健康方面
              </p>
            </div>

            {/* 婚姻建议 */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">婚姻建议</h4>
                <Badge className="bg-pink-600">
                  {healthMarriage.marriage?.advice?.length || 0} 条
                </Badge>
              </div>
              <Progress 
                value={Math.min(100, (healthMarriage.marriage?.advice?.length || 0) * 20)} 
                className="h-2" 
              />
              <p className="text-xs text-gray-600 mt-2">
                婚姻感情方面的专业建议
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 健康分析 */}
      {healthMarriage.healthFocus && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              健康分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 体质特点 */}
            {healthMarriage.healthFocus.organs && healthMarriage.healthFocus.organs.length > 0 && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  易感器官系统
                </h4>
                <div className="flex flex-wrap gap-2">
                  {healthMarriage.healthFocus.organs.map((organ, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline"
                      className="px-3 py-1 bg-white text-green-800 border-green-300"
                    >
                      {organ}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  这些器官系统需要特别关注保养，建议定期体检。
                </p>
              </div>
            )}

            {/* 健康隐患 */}
            {healthMarriage.healthFocus.concerns && healthMarriage.healthFocus.concerns.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  健康提醒
                </h4>
                <div className="space-y-2">
                  {healthMarriage.healthFocus.concerns.map((concern, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800">{concern}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 养生建议 */}
            {healthMarriage.healthFocus.lifestyle && healthMarriage.healthFocus.lifestyle.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  养生建议
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {healthMarriage.healthFocus.lifestyle.map((advice, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800">{advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 五行养生 */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200">
              <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                五行养生建议
              </h4>
              <p className="text-sm text-gray-800">
                根据您的用神{useful.favorableElements[0]?.chinese || ''}，
                建议多接触相应五行属性的食物、颜色和方位。
                {useful.favorableElements[0]?.chinese === '木' && '多食绿色蔬菜、酸味食物，多晨练。'}
                {useful.favorableElements[0]?.chinese === '火' && '适当晒太阳、多食红色食物、苦味有益。'}
                {useful.favorableElements[0]?.chinese === '土' && '多食黄色食物、甘味食品，保持脾胃健康。'}
                {useful.favorableElements[0]?.chinese === '金' && '多食白色食物、辛味调料，注意呼吸系统。'}
                {useful.favorableElements[0]?.chinese === '水' && '多饮水、食黑色食物、咸味适度，保护肾脏。'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 婚姻分析 */}
      {healthMarriage.marriage && (
        <Card className="border-2 border-rose-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-rose-600" />
              婚姻感情分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 配偶特征 */}
            {healthMarriage.marriage.partnerProfile && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200">
                <h4 className="font-medium text-rose-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  配偶特征
                </h4>
                <p className="text-gray-800">
                  {healthMarriage.marriage.partnerProfile}
                </p>
              </div>
            )}

            {/* 婚姻时机 */}
            {healthMarriage.marriage.timing && healthMarriage.marriage.timing.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  婚姻时机
                </h4>
                <div className="flex flex-wrap gap-2">
                  {healthMarriage.marriage.timing.map((time, idx) => (
                    <Badge 
                      key={idx}
                      className="px-3 py-2 bg-purple-100 text-purple-800 border border-purple-300"
                    >
                      {time}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  这些时期是您婚姻感情方面的重要机遇期，建议把握时机。
                </p>
              </div>
            )}

            {/* 婚姻建议 */}
            {healthMarriage.marriage.advice && healthMarriage.marriage.advice.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-600" />
                  婚姻建议
                </h4>
                <div className="space-y-2">
                  {healthMarriage.marriage.advice.map((advice, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-pink-50 border border-pink-200"
                    >
                      <Heart className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800">{advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 注意事项 */}
            {healthMarriage.marriage.cautions && healthMarriage.marriage.cautions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  注意事项
                </h4>
                <div className="space-y-2">
                  {healthMarriage.marriage.cautions.map((caution, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800">{caution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 格局影响 */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-pink-100 to-rose-100 border-2 border-pink-300">
              <h4 className="font-medium text-pink-900 mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                格局对婚姻的影响
              </h4>
              <p className="text-sm text-gray-800">
                您的{patterns.main.chinese}格局，
                {patterns.main.chinese === '正官格' && '婚姻关系稳定，配偶有责任心，适合传统婚姻模式。'}
                {patterns.main.chinese === '正财格' && '婚姻美满，配偶顾家，适合早婚，家庭和睦。'}
                {patterns.main.chinese === '食神格' && '婚姻幸福，配偶温和，享受浪漫生活。'}
                {patterns.main.chinese === '伤官格' && '感情丰富，需要理解和包容，晚婚较好。'}
                {patterns.main.chinese === '偏财格' && '异性缘佳，桃花较旺，需注意专一。'}
                {patterns.main.chinese === '正印格' && '精神契合重要，寻求灵魂伴侣，重视精神交流。'}
                {patterns.main.chinese === '七杀格' && '配偶性格强势，需要相互理解和包容。'}
                {!['正官格', '正财格', '食神格', '伤官格', '偏财格', '正印格', '七杀格'].includes(patterns.main.chinese) && 
                  '您的格局对婚姻有独特影响，建议结合具体情况分析。'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 综合建议卡片 */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            综合健康婚姻建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">健康方面</h4>
              <p className="text-sm text-gray-700">
                建议根据五行平衡状态调理身体，重点关注
                {healthMarriage.healthFocus?.organs?.slice(0, 2).join('、') || '相关系统'}
                的保养。保持良好作息，适度运动，定期体检。
              </p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2">婚姻方面</h4>
              <p className="text-sm text-gray-700">
                {healthMarriage.marriage?.partnerProfile 
                  ? `您的理想配偶特征为：${healthMarriage.marriage.partnerProfile.slice(0, 50)}...` 
                  : '建议寻找性格互补、志同道合的伴侣。'}
                注重精神交流，培养共同兴趣，维系长久感情。
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg border-2 border-indigo-300">
              <p className="text-sm text-gray-800">
                <strong className="text-indigo-900">🌟 温馨提示：</strong>
                健康和婚姻都需要用心经营。八字分析提供的是一种参考和趋势，
                实际情况还需结合后天努力和实际环境。保持积极心态，主动调理改善，
                方能获得身心健康和家庭幸福。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
