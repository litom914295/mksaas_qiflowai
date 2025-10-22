/**
 * 八字分析 - 专业建议组件
 * 付费功能：基于八字提供个性化的改运建议、开运方法、化解方案
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  Compass,
  Crown,
  Gem,
  Home,
  Leaf,
  MapPin,
  Palette,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface ProfessionalAdviceProps {
  data: BaziAnalysisModel;
}

// 生成开运建议
function generateFortuneSuggestions(data: BaziAnalysisModel) {
  const suggestions = [];
  const favorable = data.useful.favorableElements;
  const unfavorable = data.useful.unfavorableElements;
  
  // 根据用神生成建议
  if (favorable.length > 0) {
    const primaryElement = favorable[0];
    const elementAdvice = {
      '金': {
        colors: ['白色', '金色', '银色'],
        directions: ['西', '西北'],
        industries: ['金融', '科技', '制造'],
        items: ['金属饰品', '白水晶', '钟表'],
        activities: ['投资理财', '学习技术', '佩戴金饰'],
      },
      '木': {
        colors: ['绿色', '青色', '翠绿'],
        directions: ['东', '东南'],
        industries: ['教育', '医疗', '园艺'],
        items: ['绿植', '木制品', '书籍'],
        activities: ['种植花草', '晨练运动', '读书学习'],
      },
      '水': {
        colors: ['黑色', '蓝色', '灰色'],
        directions: ['北'],
        industries: ['贸易', '物流', '传媒'],
        items: ['鱼缸', '流水摆件', '黑曜石'],
        activities: ['游泳', '旅行', '饮水养生'],
      },
      '火': {
        colors: ['红色', '紫色', '橙色'],
        directions: ['南'],
        industries: ['娱乐', '餐饮', '能源'],
        items: ['红色饰品', '灯具', '电器'],
        activities: ['社交聚会', '艺术创作', '烹饪美食'],
      },
      '土': {
        colors: ['黄色', '棕色', '咖啡色'],
        directions: ['中央', '东北', '西南'],
        industries: ['房地产', '建筑', '农业'],
        items: ['陶瓷', '玉器', '山石'],
        activities: ['登山', '园艺', '冥想'],
      },
    };
    
    const advice = elementAdvice[primaryElement.chinese as keyof typeof elementAdvice];
    if (advice) {
      suggestions.push({
        type: 'favorable',
        element: primaryElement.chinese,
        ...advice,
      });
    }
  }
  
  // 根据忌神生成化解建议
  if (unfavorable.length > 0) {
    const primaryUnfavorable = unfavorable[0];
    suggestions.push({
      type: 'avoid',
      element: primaryUnfavorable.chinese,
      advice: `避免过多接触${primaryUnfavorable.chinese}属性的环境和事物`,
    });
  }
  
  return suggestions;
}

// 生成改运方案
function generateImprovementPlan(data: BaziAnalysisModel) {
  const plans = [];
  
  // 根据五行平衡状态
  if (data.metrics.balance.status === 'imbalanced') {
    plans.push({
      title: '五行平衡调节',
      priority: 'high',
      actions: [
        `增强${data.useful.favorableElements[0]?.chinese}元素`,
        '调整生活作息',
        '改善居住环境',
      ],
    });
  }
  
  // 根据十神配置
  const hasWealth = data.tenGods.profile.some(god => 
    god.chinese.includes('财') && god.count > 0
  );
  const hasOfficial = data.tenGods.profile.some(god => 
    (god.chinese.includes('官') || god.chinese.includes('杀')) && god.count > 0
  );
  
  if (!hasWealth) {
    plans.push({
      title: '增强财运',
      priority: 'medium',
      actions: [
        '佩戴招财饰品',
        '调整办公室风水',
        '培养理财意识',
      ],
    });
  }
  
  if (!hasOfficial) {
    plans.push({
      title: '提升事业运',
      priority: 'medium',
      actions: [
        '增强个人能力',
        '扩展人脉关系',
        '把握关键时机',
      ],
    });
  }
  
  return plans;
}

export function ProfessionalAdvice({ data }: ProfessionalAdviceProps) {
  const [activeTab, setActiveTab] = useState('fortune');
  
  const fortuneSuggestions = generateFortuneSuggestions(data);
  const improvementPlans = generateImprovementPlan(data);
  
  return (
    <div className="space-y-6">
      {/* 整体运势评估 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            专业命理指导
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {data.metrics.overall.score}
              </div>
              <div className="text-sm text-gray-600">命理评分</div>
              <Badge className="mt-2" variant="outline">
                {data.metrics.overall.level}
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.useful.favorableElements[0]?.chinese || '水'}
              </div>
              <div className="text-sm text-gray-600">用神元素</div>
              <Badge className="mt-2 bg-blue-100 text-blue-700">
                重点补充
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.metrics.balance.status === 'balanced' ? '平衡' : '待调'}
              </div>
              <div className="text-sm text-gray-600">五行状态</div>
              <Badge className="mt-2 bg-green-100 text-green-700">
                {data.metrics.balance.status === 'balanced' ? '良好' : '需调节'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细建议 Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="fortune">开运方法</TabsTrigger>
          <TabsTrigger value="improve">改运方案</TabsTrigger>
          <TabsTrigger value="fengshui">风水布局</TabsTrigger>
          <TabsTrigger value="lifestyle">生活指南</TabsTrigger>
        </TabsList>

        {/* 开运方法 */}
        <TabsContent value="fortune" className="space-y-4 mt-4">
          {fortuneSuggestions.map((suggestion, idx) => (
            <Card key={idx} className={
              suggestion.type === 'favorable' 
                ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
                : 'border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50'
            }>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {suggestion.type === 'favorable' ? (
                    <>
                      <Sparkles className="w-5 h-5 text-green-600" />
                      增强{suggestion.element}元素
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      化解{suggestion.element}煞气
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {suggestion.type === 'favorable' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Palette className="w-4 h-4" />
                          幸运颜色
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {('colors' in suggestion ? suggestion.colors : []).map((color: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {color}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Compass className="w-4 h-4" />
                          吉利方位
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {('directions' in suggestion ? suggestion.directions : []).map((dir: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {dir}方
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Gem className="w-4 h-4" />
                          开运物品
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {('items' in suggestion ? suggestion.items : []).map((item: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          适合行业
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {('industries' in suggestion ? suggestion.industries : []).map((industry: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {industry}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        建议活动
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {('activities' in suggestion ? suggestion.activities : []).map((activity: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                
                {suggestion.type === 'avoid' && (
                  <p className="text-gray-700">{suggestion.advice}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 改运方案 */}
        <TabsContent value="improve" className="space-y-4 mt-4">
          {improvementPlans.map((plan, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    {plan.title}
                  </span>
                  <Badge variant={
                    plan.priority === 'high' ? 'destructive' :
                    plan.priority === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {plan.priority === 'high' ? '重要' :
                     plan.priority === 'medium' ? '建议' : '可选'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-sm">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
          
          {/* 执行时间建议 */}
          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                最佳改运时机
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">本月最佳日期</span>
                  <Badge>农历十五前后</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">最佳时辰</span>
                  <Badge>卯时、午时</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">执行周期</span>
                  <Badge>持续21天见效</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 风水布局 */}
        <TabsContent value="fengshui" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-indigo-600" />
                居家风水布局
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    财位布局
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 客厅{data.useful.favorableElements[0]?.suggestions?.directions?.[0] || '东南'}角摆放绿植</li>
                    <li>• 保持光线明亮通透</li>
                    <li>• 避免杂物堆积</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    文昌位布局
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 书房设在{data.useful.favorableElements[0]?.suggestions?.directions?.[1] || '东北'}方</li>
                    <li>• 摆放文昌塔或毛笔</li>
                    <li>• 保持整洁有序</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Leaf className="w-4 h-4" />
                    健康位布局
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 卧室避免横梁压顶</li>
                    <li>• 床头靠实墙</li>
                    <li>• 保持空气流通</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    贵人位布局
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 玄关保持明亮整洁</li>
                    <li>• 摆放吉祥装饰品</li>
                    <li>• 定期更换鲜花</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium mb-2">化煞建议</h4>
                <p className="text-sm text-gray-700">
                  根据您的八字，建议在家中
                  {data.useful.unfavorableElements[0]?.chinese === '金' && '避免过多金属装饰'}
                  {data.useful.unfavorableElements[0]?.chinese === '木' && '减少木质家具'}
                  {data.useful.unfavorableElements[0]?.chinese === '水' && '控制水景装饰'}
                  {data.useful.unfavorableElements[0]?.chinese === '火' && '避免红色装饰过多'}
                  {data.useful.unfavorableElements[0]?.chinese === '土' && '减少陶瓷摆件'}
                  ，可在相应位置摆放化煞物品。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 生活指南 */}
        <TabsContent value="lifestyle" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                生活调节指南
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 bg-teal-50 rounded-lg">
                  <h4 className="font-medium mb-2">作息建议</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-teal-600" />
                      早睡早起，最佳入睡时间：22:00-23:00
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-teal-600" />
                      午休15-30分钟，恢复精力
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-teal-600" />
                      晨练时间：5:00-7:00最佳
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">饮食调理</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {data.useful.favorableElements[0]?.chinese === '金' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          多食白色食物：百合、山药、梨
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          适量食用辛味食物
                        </li>
                      </>
                    )}
                    {data.useful.favorableElements[0]?.chinese === '木' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          多食绿色蔬菜：菠菜、芹菜、青椒
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          适量食用酸味食物
                        </li>
                      </>
                    )}
                    {data.useful.favorableElements[0]?.chinese === '水' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          多食黑色食物：黑豆、黑芝麻、紫菜
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          适量食用咸味食物
                        </li>
                      </>
                    )}
                    {data.useful.favorableElements[0]?.chinese === '火' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          多食红色食物：番茄、红枣、枸杞
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          适量食用苦味食物
                        </li>
                      </>
                    )}
                    {data.useful.favorableElements[0]?.chinese === '土' && (
                      <>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          多食黄色食物：南瓜、玉米、小米
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-blue-600" />
                          适量食用甜味食物
                        </li>
                      </>
                    )}
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-blue-600" />
                      保持饮食规律，避免暴饮暴食
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">心理调节</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-600" />
                      每日冥想10-15分钟，平衡身心
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-600" />
                      保持乐观心态，避免负面情绪
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-purple-600" />
                      定期进行户外活动，接触自然
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium mb-2">社交建议</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-orange-600" />
                      贵人方位：{data.useful.favorableElements[0]?.suggestions?.directions?.[0] || '东南'}方
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-orange-600" />
                      适合合作的属相：根据您的八字推荐
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-orange-600" />
                      扩展人脉的最佳时期：春季、秋季
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 21天改运计划 */}
          <Card className="border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600" />
                21天改运行动计划
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">第1-7天：环境调整期</span>
                    <Badge variant="outline">基础</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    清理居住环境，调整风水布局，佩戴开运饰品
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">第8-14天：习惯养成期</span>
                    <Badge variant="outline">进阶</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    调整作息时间，改善饮食习惯，开始冥想练习
                  </p>
                </div>
                
                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">第15-21天：能量提升期</span>
                    <Badge variant="outline">巩固</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    保持良好状态，观察改变，记录进步，调整优化
                  </p>
                </div>
                
                <div className="mt-4">
                  <Progress value={33} className="h-2" />
                  <p className="text-xs text-gray-600 mt-2">
                    坚持执行计划，21天后您将感受到明显改变
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}