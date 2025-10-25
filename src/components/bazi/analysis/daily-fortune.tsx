/**
 * 八字分析 - 每日运势与节气分析组件
 * 付费功能：基于节气变化的每日运势、专业建议、能量节律
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Activity,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cloud,
  Crown,
  Heart,
  Leaf,
  Moon,
  Shield,
  Sparkles,
  Sun,
  Sunrise,
  Target,
  TrendingUp,
  Wind,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface DailyFortuneProps {
  data: BaziAnalysisModel;
}

// 24节气数据
const solarTerms = [
  { name: '立春', month: 2, day: 4, element: 'wood', energy: 'rising' },
  { name: '雨水', month: 2, day: 19, element: 'water', energy: 'flowing' },
  { name: '惊蛰', month: 3, day: 6, element: 'wood', energy: 'awakening' },
  { name: '春分', month: 3, day: 21, element: 'wood', energy: 'balanced' },
  { name: '清明', month: 4, day: 5, element: 'wood', energy: 'clear' },
  { name: '谷雨', month: 4, day: 20, element: 'water', energy: 'nourishing' },
  { name: '立夏', month: 5, day: 6, element: 'fire', energy: 'rising' },
  { name: '小满', month: 5, day: 21, element: 'fire', energy: 'growing' },
  { name: '芒种', month: 6, day: 6, element: 'fire', energy: 'planting' },
  { name: '夏至', month: 6, day: 21, element: 'fire', energy: 'peak' },
  { name: '小暑', month: 7, day: 7, element: 'fire', energy: 'heating' },
  { name: '大暑', month: 7, day: 23, element: 'fire', energy: 'intense' },
  { name: '立秋', month: 8, day: 8, element: 'metal', energy: 'turning' },
  { name: '处暑', month: 8, day: 23, element: 'metal', energy: 'cooling' },
  { name: '白露', month: 9, day: 8, element: 'metal', energy: 'condensing' },
  { name: '秋分', month: 9, day: 23, element: 'metal', energy: 'balanced' },
  { name: '寒露', month: 10, day: 8, element: 'metal', energy: 'cold-dew' },
  { name: '霜降', month: 10, day: 24, element: 'water', energy: 'frost' },
  { name: '立冬', month: 11, day: 8, element: 'water', energy: 'storing' },
  { name: '小雪', month: 11, day: 22, element: 'water', energy: 'light-snow' },
  { name: '大雪', month: 12, day: 7, element: 'water', energy: 'heavy-snow' },
  { name: '冬至', month: 12, day: 22, element: 'water', energy: 'deepest' },
  { name: '小寒', month: 1, day: 6, element: 'water', energy: 'minor-cold' },
  { name: '大寒', month: 1, day: 20, element: 'earth', energy: 'major-cold' },
];

// 获取当前节气
function getCurrentSolarTerm(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 找出当前节气
  for (let i = 0; i < solarTerms.length; i++) {
    const current = solarTerms[i];
    const next = solarTerms[(i + 1) % solarTerms.length];

    if (
      (month === current.month && day >= current.day) ||
      (month === next.month && day < next.day)
    ) {
      return current;
    }
  }

  return solarTerms[0]; // 默认返回立春
}

// 计算每日运势分数（基于八字、节气、流日）
function calculateDailyScore(
  baziData: BaziAnalysisModel,
  date: Date,
  solarTerm: (typeof solarTerms)[0]
) {
  let score = 60; // 基础分

  // 根据用神与节气五行匹配度调整分数
  const favorable = baziData.useful.favorableElements;
  const unfavorable = baziData.useful.unfavorableElements;

  // 节气五行与用神匹配
  if (
    favorable.some((e) => e.element.toLowerCase().includes(solarTerm.element))
  ) {
    score += 15;
  }

  // 节气五行与忌神冲突
  if (
    unfavorable.some((e) => e.element.toLowerCase().includes(solarTerm.element))
  ) {
    score -= 10;
  }

  // 根据节气能量状态调整
  if (solarTerm.energy === 'balanced') {
    score += 5; // 平衡期适合所有人
  } else if (solarTerm.energy === 'peak' || solarTerm.energy === 'rising') {
    score += 8; // 上升期利于行动
  }

  // 根据星期调整（示例）
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1 || dayOfWeek === 4) {
    score += 5; // 周一、周四吉利
  }

  // 确保分数在合理范围
  return Math.min(100, Math.max(0, score));
}

// 时辰运势数据
const hourlyFortune = [
  { hour: '子时', time: '23:00-01:00', element: 'water', activity: '休息冥想' },
  { hour: '丑时', time: '01:00-03:00', element: 'earth', activity: '深度睡眠' },
  { hour: '寅时', time: '03:00-05:00', element: 'wood', activity: '呼吸调理' },
  { hour: '卯时', time: '05:00-07:00', element: 'wood', activity: '晨练锻炼' },
  { hour: '辰时', time: '07:00-09:00', element: 'earth', activity: '早餐进食' },
  { hour: '巳时', time: '09:00-11:00', element: 'fire', activity: '工作学习' },
  { hour: '午时', time: '11:00-13:00', element: 'fire', activity: '重要决策' },
  { hour: '未时', time: '13:00-15:00', element: 'earth', activity: '午休调整' },
  { hour: '申时', time: '15:00-17:00', element: 'metal', activity: '执行任务' },
  { hour: '酉时', time: '17:00-19:00', element: 'metal', activity: '总结收获' },
  { hour: '戌时', time: '19:00-21:00', element: 'earth', activity: '家庭团聚' },
  { hour: '亥时', time: '21:00-23:00', element: 'water', activity: '放松准备' },
];

export function DailyFortune({ data }: DailyFortuneProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [activeTab, setActiveTab] = useState('today');

  // 更新当前时辰
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 60000); // 每分钟更新

    return () => clearInterval(timer);
  }, []);

  // 获取当前节气
  const currentSolarTerm = useMemo(() => {
    return getCurrentSolarTerm(selectedDate);
  }, [selectedDate]);

  // 计算今日运势
  const todayFortune = useMemo(() => {
    const score = calculateDailyScore(data, selectedDate, currentSolarTerm);

    // 根据分数生成建议
    const suggestions = {
      lucky: [] as string[],
      unlucky: [] as string[],
      advice: '',
    };

    if (score >= 80) {
      suggestions.lucky = ['签约', '投资', '求职', '表白', '搬家'];
      suggestions.unlucky = ['保守等待'];
      suggestions.advice = '今日运势极佳，适合把握机会，大胆行动';
    } else if (score >= 60) {
      suggestions.lucky = ['学习', '社交', '运动', '理财'];
      suggestions.unlucky = ['冒险', '争执'];
      suggestions.advice = '运势平稳向好，适合稳步推进计划';
    } else {
      suggestions.lucky = ['休息', '反思', '规划'];
      suggestions.unlucky = ['重大决策', '投资', '出行'];
      suggestions.advice = '今日宜静不宜动，适合休养生息';
    }

    return {
      score,
      suggestions,
      solarTerm: currentSolarTerm,
    };
  }, [data, selectedDate, currentSolarTerm]);

  // 获取当前时辰
  const currentHourData = useMemo(() => {
    const hourIndex = Math.floor(((currentHour + 1) % 24) / 2);
    return hourlyFortune[hourIndex];
  }, [currentHour]);

  // 计算时辰吉凶
  const getHourFortune = (hourData: (typeof hourlyFortune)[0]) => {
    const favorable = data.useful.favorableElements;
    const elementMap: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };

    const hourElement = elementMap[hourData.element];
    const isGood = favorable.some((e) => e.chinese === hourElement);

    return {
      isGood,
      score: isGood ? 80 : 40,
      label: isGood ? '吉' : '平',
    };
  };

  return (
    <div className="space-y-6">
      {/* 今日运势总览 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-600" />
              今日运势
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedDate.toLocaleDateString('zh-CN')}
              </Badge>
              <Badge className="bg-purple-100 text-purple-700">
                {currentSolarTerm.name}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 运势评分 */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div>
                <p className="text-sm text-gray-600 mb-1">综合运势指数</p>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-bold ${
                      todayFortune.score >= 80
                        ? 'text-purple-600'
                        : todayFortune.score >= 60
                          ? 'text-blue-600'
                          : 'text-orange-600'
                    }`}
                  >
                    {todayFortune.score}
                  </span>
                  <span className="text-gray-500">/ 100</span>
                </div>
                <p className="text-sm text-gray-700 mt-2">
                  {todayFortune.suggestions.advice}
                </p>
              </div>
              <div className="text-center">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center ${
                    todayFortune.score >= 80
                      ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                      : todayFortune.score >= 60
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                        : 'bg-gradient-to-br from-orange-400 to-yellow-400'
                  }`}
                >
                  {todayFortune.score >= 80 ? (
                    <Crown className="w-12 h-12 text-white" />
                  ) : todayFortune.score >= 60 ? (
                    <Sparkles className="w-12 h-12 text-white" />
                  ) : (
                    <Shield className="w-12 h-12 text-white" />
                  )}
                </div>
                <Badge
                  className="mt-2"
                  variant={
                    todayFortune.score >= 80
                      ? 'default'
                      : todayFortune.score >= 60
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {todayFortune.score >= 80
                    ? '大吉'
                    : todayFortune.score >= 60
                      ? '中吉'
                      : '小吉'}
                </Badge>
              </div>
            </div>

            {/* 节气影响 */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-800 mb-1">
                    节气：{currentSolarTerm.name}
                  </h4>
                  <p className="text-sm text-gray-700">
                    {currentSolarTerm.element === 'wood' &&
                      '木气生发，适合开始新计划'}
                    {currentSolarTerm.element === 'fire' &&
                      '火气旺盛，注意调节情绪'}
                    {currentSolarTerm.element === 'earth' &&
                      '土气平和，宜守不宜攻'}
                    {currentSolarTerm.element === 'metal' &&
                      '金气收敛，适合总结整理'}
                    {currentSolarTerm.element === 'water' &&
                      '水气流动，利于沟通交流'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {currentSolarTerm.element}行
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      能量{currentSolarTerm.energy}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 宜忌事项 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />宜
                </h4>
                <div className="flex flex-wrap gap-2">
                  {todayFortune.suggestions.lucky.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />忌
                </h4>
                <div className="flex flex-wrap gap-2">
                  {todayFortune.suggestions.unlucky.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时辰运势 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            时辰运势
            <Badge variant="outline" className="ml-2">
              当前：{currentHourData.hour}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {hourlyFortune.map((hour) => {
              const fortune = getHourFortune(hour);
              const isCurrent = hour === currentHourData;

              return (
                <div
                  key={hour.hour}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? 'border-purple-400 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`font-medium ${
                        isCurrent ? 'text-purple-800' : 'text-gray-800'
                      }`}
                    >
                      {hour.hour}
                    </span>
                    <Badge
                      variant={fortune.isGood ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {fortune.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{hour.time}</p>
                  <p className="text-xs text-gray-700">{hour.activity}</p>
                  {isCurrent && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs font-medium text-purple-700">
                        当前时辰
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 24小时能量波动 */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            24小时能量波动
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 能量曲线 */}
            <div className="relative h-48 bg-white rounded-lg p-4">
              <div className="absolute inset-0 flex items-end justify-around px-4 pb-4">
                {hourlyFortune.map((hour, idx) => {
                  const fortune = getHourFortune(hour);
                  const isCurrent = hour === currentHourData;
                  const height = `${fortune.score}%`;
                  
                  return (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center group"
                      style={{ width: '7%' }}
                    >
                      {/* 柱子 */}
                      <div
                        className={`w-full rounded-t transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-t from-indigo-500 to-indigo-300'
                            : fortune.isGood
                              ? 'bg-gradient-to-t from-green-400 to-green-200'
                              : 'bg-gradient-to-t from-gray-400 to-gray-200'
                        }`}
                        style={{ height }}
                      >
                        {isCurrent && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
                          </div>
                        )}
                      </div>
                      {/* 标签 */}
                      <div className="mt-1 text-center">
                        <p className="text-xs font-medium text-gray-600">
                          {hour.hour.replace('时', '')}
                        </p>
                      </div>
                      {/* 悬浮提示 */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 whitespace-nowrap z-10">
                        <div>{hour.hour}</div>
                        <div>{hour.time}</div>
                        <div>运势: {fortune.label}</div>
                        <div>宜: {hour.activity}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 时间段说明 */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-400"></div>
                <span className="text-gray-600">吉时</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-400"></div>
                <span className="text-gray-600">平时</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-indigo-500"></div>
                <span className="text-gray-600">当前时辰</span>
              </div>
            </div>

            {/* 能量趋势分析 */}
            <div className="p-3 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong className="text-indigo-900">能量分析：</strong>
                今日能量最旺盛的时辰为
                <strong className="text-indigo-800">
                  {hourlyFortune
                    .map((h, idx) => ({ h, fortune: getHourFortune(h), idx }))
                    .sort((a, b) => b.fortune.score - a.fortune.score)[0]
                    .h.hour}
                </strong>
                ，建议在此时段进行重要事务。
                当前时辰({currentHourData.hour})
                {getHourFortune(currentHourData).isGood
                  ? '运势较好，适合行动'
                  : '宜静不宜动，适合休息'}
                。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 当前时辰幸运元素实时推荐 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            当前时辰幸运元素
            <Badge className="ml-2 bg-purple-600">{currentHourData.hour}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 幸运颜色 */}
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🎨</div>
                <h5 className="font-medium text-gray-800">幸运颜色</h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.useful.favorableElements[0]?.suggestions?.colors
                  ?.slice(0, 2)
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
                                    : '#f3f4f6',
                        }}
                      ></div>
                      <span className="text-xs text-gray-700">{color}</span>
                    </div>
                  )) || [
                  <Badge key="default" variant="outline">
                    蓝色
                  </Badge>,
                ]}
              </div>
            </div>

            {/* 吉利方位 */}
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🧭</div>
                <h5 className="font-medium text-gray-800">吉利方位</h5>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.useful.favorableElements[0]?.suggestions?.directions
                  ?.slice(0, 2)
                  .map((dir, idx) => (
                    <Badge key={idx} variant="outline">
                      {dir}
                    </Badge>
                  )) || [
                  <Badge key="default" variant="outline">
                    东南
                  </Badge>,
                ]}
              </div>
            </div>

            {/* 适宜活动 */}
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🎯</div>
                <h5 className="font-medium text-gray-800">适宜活动</h5>
              </div>
              <p className="text-sm text-gray-700">{currentHourData.activity}</p>
            </div>

            {/* 避免事项 */}
            <div className="p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">⚠️</div>
                <h5 className="font-medium text-gray-800">避免事项</h5>
              </div>
              <div className="flex flex-wrap gap-1">
                {todayFortune.suggestions.unlucky.slice(0, 2).map((item, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 实时建议 */}
          <div className="mt-4 p-4 bg-white rounded-lg border-2 border-purple-200">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-purple-900 mb-1">
                  当前时辰实时建议
                </h5>
                <p className="text-sm text-gray-700">
                  {getHourFortune(currentHourData).isGood ? (
                    <>
                      现在是<strong className="text-purple-800">吉时</strong>
                      ，能量场较好。建议穿着
                      <strong>
                        {
                          data.useful.favorableElements[0]?.suggestions
                            ?.colors?.[0] || '蓝色'
                        }
                      </strong>
                      系服装，面朝
                      <strong>
                        {
                          data.useful.favorableElements[0]?.suggestions
                            ?.directions?.[0] || '东南'
                        }
                      </strong>
                      方向，进行{currentHourData.activity}等活动。
                    </>
                  ) : (
                    <>
                      当前时辰能量较平稳，建议以
                      <strong className="text-purple-800">
                        {currentHourData.activity}
                      </strong>
                      为主，保持平和心态，避免重大决策。
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 专业建议 */}
      <Card className="border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-600" />
            今日专业建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="today">今日</TabsTrigger>
              <TabsTrigger value="career">事业</TabsTrigger>
              <TabsTrigger value="wealth">财运</TabsTrigger>
              <TabsTrigger value="health">健康</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4 mt-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">能量节律</h4>
                <p className="text-sm text-gray-700 mb-3">
                  今日{currentSolarTerm.element}气
                  {currentSolarTerm.energy === 'rising'
                    ? '上升'
                    : currentSolarTerm.energy === 'balanced'
                      ? '平衡'
                      : currentSolarTerm.energy === 'peak'
                        ? '达到顶峰'
                        : '收敛'}
                  ，配合您的{data.base.dayMaster.chinese}日主，
                  {todayFortune.score >= 70
                    ? '能量场和谐，利于行动'
                    : '需要调节平衡'}
                  。
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sunrise className="w-4 h-4 text-amber-600" />
                    <span className="text-sm">
                      早晨：{hourlyFortune[3].activity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-600" />
                    <span className="text-sm">
                      午间：{hourlyFortune[5].activity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      晚间：{hourlyFortune[10].activity}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="career" className="space-y-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">事业指引</h4>
                <p className="text-sm text-gray-700 mb-3">
                  基于您的十神配置和当前运势，今日事业运势
                  {todayFortune.score >= 70 ? '旺盛' : '平稳'}。
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>
                      {todayFortune.score >= 70
                        ? '适合开展新项目，主动出击'
                        : '宜守成，完善现有工作'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>
                      贵人方位：
                      {data.useful.favorableElements[0]?.suggestions
                        ?.directions?.[0] || '东南'}
                    </span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="wealth" className="space-y-4 mt-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">财运分析</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {currentSolarTerm.element === 'metal'
                    ? '金气旺盛，利于投资理财'
                    : currentSolarTerm.element === 'water'
                      ? '水主流通，适合资金周转'
                      : '财运平稳，宜积累不宜冒进'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">财运指数</span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={todayFortune.score * 0.8}
                      className="w-24 h-2"
                    />
                    <span className="text-sm font-medium">
                      {Math.round(todayFortune.score * 0.8)}%
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4 mt-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">健康提醒</h4>
                <p className="text-sm text-gray-700 mb-3">
                  {currentSolarTerm.name}时节，
                  {currentSolarTerm.element === 'wood' &&
                    '注意肝胆保养，多做伸展运动'}
                  {currentSolarTerm.element === 'fire' &&
                    '注意心血管健康，避免过度劳累'}
                  {currentSolarTerm.element === 'earth' &&
                    '注意脾胃调理，饮食清淡'}
                  {currentSolarTerm.element === 'metal' &&
                    '注意呼吸系统，保持空气流通'}
                  {currentSolarTerm.element === 'water' &&
                    '注意肾脏保养，避免受寒'}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    <Heart className="w-3 h-3 mr-1" />
                    适度运动
                  </Badge>
                  <Badge variant="outline">
                    <Activity className="w-3 h-3 mr-1" />
                    规律作息
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 未来三日预览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            未来三日运势预览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((dayOffset) => {
              const futureDate = new Date(selectedDate);
              futureDate.setDate(futureDate.getDate() + dayOffset);
              const futureSolarTerm = getCurrentSolarTerm(futureDate);
              const futureScore = calculateDailyScore(
                data,
                futureDate,
                futureSolarTerm
              );

              return (
                <div
                  key={dayOffset}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {futureDate.toLocaleDateString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {futureSolarTerm.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">
                      {futureScore}
                    </span>
                    <Badge
                      variant={futureScore >= 70 ? 'default' : 'secondary'}
                    >
                      {futureScore >= 80
                        ? '大吉'
                        : futureScore >= 60
                          ? '中吉'
                          : '小吉'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {futureScore >= 70 ? '运势良好' : '平稳发展'}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
