'use client';

import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createLuckPillarsAnalyzer, type LuckPillarAnalysis } from '@/lib/bazi/luck-pillars';
import {
  Calendar,
  Star,
  TrendingUp,
  Clock,
  Target,
  Heart,
  DollarSign,
  Activity,
  Home,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface EnhancedDayunAnalysisProps {
  calculator: any; // Enhanced BaZi Calculator
}

export function EnhancedDayunAnalysis({ calculator }: EnhancedDayunAnalysisProps) {
  const [allDayun, setAllDayun] = useState<LuckPillarAnalysis[]>([]);
  const [currentDayun, setCurrentDayun] = useState<LuckPillarAnalysis | null>(null);
  const [selectedDayun, setSelectedDayun] = useState<LuckPillarAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'detail' | 'events' | 'interactions'>('overview');

  useEffect(() => {
    if (calculator) {
      loadDayunAnalysis();
    }
  }, [calculator]);

  const loadDayunAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      // 创建大运分析器
      const analyzer = createLuckPillarsAnalyzer(calculator);
      
      // 获取所有大运分析
      const [allAnalysis, currentAnalysis] = await Promise.all([
        analyzer.analyzeAllLuckPillars(),
        analyzer.analyzeCurrentLuckPillar()
      ]);

      setAllDayun(allAnalysis);
      setCurrentDayun(currentAnalysis);
      setSelectedDayun(currentAnalysis || (allAnalysis.length > 0 ? allAnalysis[0] : null));

    } catch (err) {
      console.error('大运分析加载失败:', err);
      setError(err instanceof Error ? err.message : '大运分析失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-gray-600">正在进行深度大运分析...</p>
          <p className="text-sm text-gray-500">分析十神关系、预测重大事件、计算流年互动</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  const renderDayunOverview = () => (
    <div className="space-y-6">
      {/* 当前大运概览 */}
      {currentDayun && (
        <Card className="p-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">当前大运周期</h3>
              <p className="text-gray-600">您现在所处的人生阶段及运势特征</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {currentDayun.pillar.heavenlyStem}{currentDayun.pillar.earthlyBranch}
              </div>
              <div className="text-sm text-gray-600">大运干支</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {currentDayun.ageRange}
              </div>
              <div className="text-sm text-gray-600">年龄段</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currentDayun.tenGodRelation.heavenlyTenGod}
              </div>
              <div className="text-sm text-gray-600">主导十神</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  currentDayun.influence === 'positive' 
                    ? 'bg-green-100 text-green-800' 
                    : currentDayun.influence === 'negative'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {currentDayun.influence === 'positive' ? '吉利' : 
                 currentDayun.influence === 'negative' ? '需注意' : '平和'}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">运势倾向</div>
            </div>
          </div>

          {/* 十神影响简要概述 */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              十神组合影响
            </h4>
            <p className="text-gray-700 mb-3">{currentDayun.tenGodRelation.combinedInfluence}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-600">关键特质：</span>
                {currentDayun.keyThemes.slice(0, 3).join('、')}
              </div>
              <div>
                <span className="font-medium text-green-600">核心建议：</span>
                {currentDayun.recommendations[0]}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 大运时间线 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-blue-100">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">人生大运时间线</h3>
            <p className="text-gray-600">您的完整大运周期分布</p>
          </div>
        </div>

        <div className="space-y-3">
          {allDayun.map((dayun, index) => {
            const isSelected = selectedDayun?.period === dayun.period;
            const isCurrent = currentDayun?.period === dayun.period;
            
            return (
              <div
                key={dayun.period}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  isCurrent 
                    ? 'border-purple-300 bg-purple-50 shadow-md'
                    : isSelected
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedDayun(dayun)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {dayun.pillar.heavenlyStem}{dayun.pillar.earthlyBranch}
                      </div>
                      <div className="text-xs text-gray-600">
                        第{dayun.period}大运
                      </div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {dayun.ageRange}岁 · {dayun.tenGodRelation.heavenlyTenGod}
                      </div>
                      <div className="text-sm text-gray-600">
                        {dayun.tenGodRelation.combinedInfluence.slice(0, 30)}...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <Badge className="bg-purple-100 text-purple-800">当前</Badge>}
                    <Badge 
                      className={`${
                        dayun.influence === 'positive' 
                          ? 'bg-green-100 text-green-800' 
                          : dayun.influence === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {dayun.influence === 'positive' ? '吉' : 
                       dayun.influence === 'negative' ? '凶' : '平'}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderDayunDetail = () => {
    if (!selectedDayun) return <div>请选择一个大运周期</div>;

    return (
      <div className="space-y-6">
        {/* 选中大运的详细信息 */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                第{selectedDayun.period}大运：{selectedDayun.pillar.heavenlyStem}{selectedDayun.pillar.earthlyBranch}
              </h3>
              <p className="text-gray-600">{selectedDayun.ageRange}岁 · {selectedDayun.duration}年周期</p>
            </div>
          </div>

          {/* 十神关系详细分析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                十神关系分析
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">天干十神：</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {selectedDayun.tenGodRelation.heavenlyTenGod}
                  </Badge>
                </div>
                {selectedDayun.tenGodRelation.earthlyTenGod && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">地支十神：</span>
                    <Badge className="bg-green-100 text-green-800">
                      {selectedDayun.tenGodRelation.earthlyTenGod}
                    </Badge>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-700">
                    {selectedDayun.tenGodRelation.combinedInfluence}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                关键特征
              </h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  {selectedDayun.keyThemes.map((theme, index) => (
                    <Badge key={index} className="bg-purple-100 text-purple-800 text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 五大维度影响 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: 'personality', icon: Heart, title: '性格', data: selectedDayun.tenGodRelation.personalityImpact, color: 'blue' },
              { key: 'career', icon: Target, title: '事业', data: selectedDayun.tenGodRelation.careerImpact, color: 'green' },
              { key: 'relationship', icon: Home, title: '人际', data: selectedDayun.tenGodRelation.relationshipImpact, color: 'pink' },
              { key: 'health', icon: Activity, title: '健康', data: selectedDayun.tenGodRelation.healthImpact, color: 'red' },
              { key: 'wealth', icon: DollarSign, title: '财运', data: selectedDayun.tenGodRelation.wealthImpact, color: 'yellow' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.key} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 text-${item.color}-500`} />
                    <h5 className="font-medium text-gray-900">{item.title}</h5>
                  </div>
                  <ul className="space-y-1">
                    {item.data.slice(0, 2).map((impact, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500 mt-1.5 flex-shrink-0`} />
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  const renderMajorEvents = () => {
    if (!selectedDayun) return <div>请选择一个大运周期查看重大事件预测</div>;

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-amber-100">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">重大事件预测</h3>
              <p className="text-gray-600">基于大运特征的人生重要节点预测</p>
            </div>
          </div>

          {selectedDayun.majorEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>此大运周期暂无特别重大事件预测</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayun.majorEvents.map((event, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        {event.year}年
                      </Badge>
                      <Badge variant="outline">
                        {event.age}岁
                      </Badge>
                      <Badge className={`${
                        event.eventType === 'career' ? 'bg-green-100 text-green-800' :
                        event.eventType === 'wealth' ? 'bg-yellow-100 text-yellow-800' :
                        event.eventType === 'relationship' ? 'bg-pink-100 text-pink-800' :
                        event.eventType === 'health' ? 'bg-red-100 text-red-800' :
                        event.eventType === 'family' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {event.eventType === 'career' ? '事业' :
                         event.eventType === 'wealth' ? '财运' :
                         event.eventType === 'relationship' ? '感情' :
                         event.eventType === 'health' ? '健康' :
                         event.eventType === 'family' ? '家庭' :
                         event.eventType === 'study' ? '学业' : '其他'}
                      </Badge>
                    </div>
                    <Badge className={`${
                      event.probability === 'high' ? 'bg-red-100 text-red-800' :
                      event.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.probability === 'high' ? '高概率' :
                       event.probability === 'medium' ? '中等' : '较低'}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{event.description}</h4>
                  <p className="text-sm text-gray-600 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                    {event.advice}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  const renderYearlyInteractions = () => {
    if (!selectedDayun) return <div>请选择一个大运周期查看流年互动</div>;

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-indigo-100">
              <Clock className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">流年互动分析</h3>
              <p className="text-gray-600">大运与每年流年的天干地支互动关系</p>
            </div>
          </div>

          {selectedDayun.yearlyInteractions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>此大运周期暂无特殊流年互动</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDayun.yearlyInteractions.map((interaction, index) => (
                <div key={index} className={`rounded-lg p-4 border-l-4 ${
                  interaction.interaction === 'favorable' 
                    ? 'bg-green-50 border-green-500'
                    : interaction.interaction === 'unfavorable'
                    ? 'bg-red-50 border-red-500' 
                    : 'bg-gray-50 border-gray-400'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800">
                        {interaction.year}年
                      </Badge>
                      <Badge className={`${
                        interaction.interaction === 'favorable' 
                          ? 'bg-green-100 text-green-800'
                          : interaction.interaction === 'unfavorable'
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {interaction.interaction === 'favorable' ? '吉利' :
                         interaction.interaction === 'unfavorable' ? '不利' : '平常'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{interaction.description}</p>
                  <div className="space-y-1">
                    <h5 className="text-sm font-medium text-gray-900">建议事项：</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {interaction.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="text-sm text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">增强大运分析</h2>
            <p className="text-gray-600">专业十神分析 · 重大事件预测 · 流年互动计算</p>
          </div>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeView === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveView('overview')}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          总览
        </Button>
        <Button
          variant={activeView === 'detail' ? 'default' : 'outline'}
          onClick={() => setActiveView('detail')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          详细分析
        </Button>
        <Button
          variant={activeView === 'events' ? 'default' : 'outline'}
          onClick={() => setActiveView('events')}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          重大事件
        </Button>
        <Button
          variant={activeView === 'interactions' ? 'default' : 'outline'}
          onClick={() => setActiveView('interactions')}
          className="flex items-center gap-2"
        >
          <Clock className="w-4 h-4" />
          流年互动
        </Button>
      </div>

      {/* 内容区域 */}
      {activeView === 'overview' && renderDayunOverview()}
      {activeView === 'detail' && renderDayunDetail()}
      {activeView === 'events' && renderMajorEvents()}
      {activeView === 'interactions' && renderYearlyInteractions()}
    </div>
  );
}