/**
 * 八字分析 - 大运流年分析组件
 * 付费功能：展示一生运势走向、关键时期、流年详解
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Crown,
  Heart,
  MapPin,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface LuckCyclesAnalysisProps {
  data: BaziAnalysisModel;
}

// 运势评分对应的颜色和标签
const getFortuneLevel = (score: number) => {
  if (score >= 85)
    return { color: 'text-purple-600', bg: 'bg-purple-100', label: '大吉' };
  if (score >= 70)
    return { color: 'text-green-600', bg: 'bg-green-100', label: '吉' };
  if (score >= 55)
    return { color: 'text-blue-600', bg: 'bg-blue-100', label: '平' };
  if (score >= 40)
    return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: '凶' };
  return { color: 'text-red-600', bg: 'bg-red-100', label: '大凶' };
};

// 生命阶段标签
const getLifeStage = (age: number) => {
  if (age < 18) return '童年成长期';
  if (age < 30) return '青年奋斗期';
  if (age < 45) return '中年发展期';
  if (age < 60) return '壮年成熟期';
  return '晚年享受期';
};

export function LuckCyclesAnalysis({ data }: LuckCyclesAnalysisProps) {
  const { luck, base } = data;
  
  // 添加安全检查，确保有 timeline 数据
  const daYunTimeline = luck?.timeline || luck?.daYunTimeline || [];
  
  const [selectedDaYun, setSelectedDaYun] = useState(
    luck?.currentDaYun?.period || 1
  );
  const [currentYear] = useState(new Date().getFullYear());

  // 计算当前年龄
  const currentAge = useMemo(() => {
    if (!base?.birth?.datetime) return 30;
    const birthYear = new Date(base.birth.datetime).getFullYear();
    return currentYear - birthYear;
  }, [base?.birth?.datetime, currentYear]);

  // 获取选中的大运详情
  const selectedDaYunDetail = useMemo(() => {
    if (!daYunTimeline || daYunTimeline.length === 0) return null;
    return daYunTimeline.find((d) => d.period === selectedDaYun);
  }, [daYunTimeline, selectedDaYun]);

  // 生成该大运期间的流年列表
  const annualFortuneList = useMemo(() => {
    if (!selectedDaYunDetail) return [];

    const list = [];
    const startYear = selectedDaYunDetail.yearRange[0];
    const endYear = selectedDaYunDetail.yearRange[1];

    for (
      let year = startYear;
      year <= endYear && year <= startYear + 9;
      year++
    ) {
      const age = year - (currentYear - currentAge);
      const fortuneData = luck?.annualForecast?.find((f) => f.year === year);

      list.push({
        year,
        age,
        score: fortuneData?.score || Math.floor(Math.random() * 30 + 60),
        theme: fortuneData?.theme || '平稳发展',
        favorable: fortuneData?.favorable || ['工作', '学习'],
        unfavorable: fortuneData?.unfavorable || [],
        isCurrent: year === currentYear,
        isPast: year < currentYear,
      });
    }

    return list;
  }, [selectedDaYunDetail, currentYear, currentAge, luck?.annualForecast]);

  return (
    <div className="space-y-6">
      {/* 运势总览卡片 */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              一生运势总览
            </div>
            <Badge className="bg-purple-100 text-purple-700">
              当前 {currentAge} 岁
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 当前大运信息 */}
            {luck?.currentDaYun && (
              <div className="p-4 bg-white rounded-lg border-2 border-purple-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">当前大运</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-purple-800">
                        {luck.currentDaYun.heavenlyStem}
                        {luck.currentDaYun.earthlyBranch}
                      </span>
                      <Badge variant="outline">
                        {luck.currentDaYun.element}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">
                      {luck.currentDaYun.theme}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {luck.currentDaYun.ageRange[0]}-
                      {luck.currentDaYun.ageRange[1]}岁 (
                      {luck.currentDaYun.yearRange[0]}-
                      {luck.currentDaYun.yearRange[1]}年)
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">综合运势</p>
                    <div className="relative">
                      <div
                        className={`text-3xl font-bold ${
                          getFortuneLevel(luck.currentDaYun.fortune.overall)
                            .color
                        }`}
                      >
                        {luck.currentDaYun.fortune.overall}
                      </div>
                      <Badge
                        className={`mt-1 ${
                          getFortuneLevel(luck.currentDaYun.fortune.overall).bg
                        } ${
                          getFortuneLevel(luck.currentDaYun.fortune.overall)
                            .color
                        }`}
                      >
                        {
                          getFortuneLevel(luck.currentDaYun.fortune.overall)
                            .label
                        }
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 各领域运势 */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                  {[
                    { key: 'career', label: '事业', icon: Target },
                    { key: 'wealth', label: '财运', icon: TrendingUp },
                    { key: 'relationship', label: '感情', icon: Heart },
                    { key: 'health', label: '健康', icon: Sparkles },
                  ].map((item) => {
                    const Icon = item.icon;
                    const score =
                      luck.currentDaYun?.fortune[
                        item.key as keyof typeof luck.currentDaYun.fortune
                      ] || 60;
                    return (
                      <div key={item.key} className="text-center">
                        <Icon className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                        <p className="text-xs text-gray-600">{item.label}</p>
                        <p
                          className={`text-lg font-bold ${
                            score >= 70
                              ? 'text-green-600'
                              : score >= 50
                                ? 'text-blue-600'
                                : 'text-orange-600'
                          }`}
                        >
                          {score}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 人生阶段提示 */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">
                  您正处于
                  <strong className="text-purple-700">
                    {getLifeStage(currentAge)}
                  </strong>
                </span>
              </div>
              {currentAge < 45 && (
                <Badge variant="outline" className="text-xs">
                  黄金发展期
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 大运时间线 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            十年大运时间线
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 大运选择器 */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {daYunTimeline.length > 0 ? (
                daYunTimeline.map((daYun) => {
                  const isCurrent = daYun.period === luck?.currentDaYun?.period;
                  const isSelected = daYun.period === selectedDaYun;
                  const isPast = daYun.yearRange[1] < currentYear;

                return (
                  <Button
                    key={daYun.period}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDaYun(daYun.period)}
                    className={`flex-shrink-0 ${
                      isCurrent ? 'ring-2 ring-purple-400' : ''
                    } ${isPast ? 'opacity-60' : ''}`}
                  >
                    <div className="text-center">
                      <p className="text-xs">
                        {daYun.ageRange[0]}-{daYun.ageRange[1]}岁
                      </p>
                      <p className="font-bold">
                        {daYun.heavenlyStem}
                        {daYun.earthlyBranch}
                      </p>
                      {isCurrent && (
                        <Badge className="mt-1 h-4 text-xs px-1">当前</Badge>
                      )}
                    </div>
                  </Button>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 py-4">
                  暂无大运数据
                </div>
              )}
            </div>

            {/* 选中大运详情 */}
            {selectedDaYunDetail && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      第{selectedDaYunDetail.period}大运：
                      {selectedDaYunDetail.heavenlyStem}
                      {selectedDaYunDetail.earthlyBranch}运
                    </h4>
                    <p className="text-sm text-gray-600">
                      {selectedDaYunDetail.yearRange[0]}-
                      {selectedDaYunDetail.yearRange[1]}年 (
                      {selectedDaYunDetail.ageRange[0]}-
                      {selectedDaYunDetail.ageRange[1]}岁)
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-2xl font-bold ${
                        getFortuneLevel(selectedDaYunDetail.fortune.overall)
                          .color
                      }`}
                    >
                      {selectedDaYunDetail.fortune.overall}分
                    </div>
                    <Badge variant="outline">
                      {selectedDaYunDetail.element}运
                    </Badge>
                  </div>
                </div>

                {/* 大运主题 */}
                <div className="mb-4 p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    运势主题
                  </p>
                  <p className="text-gray-800">{selectedDaYunDetail.theme}</p>
                </div>

                {/* 各方面运势条 */}
                <div className="space-y-3">
                  {Object.entries(selectedDaYunDetail.fortune).map(
                    ([key, value]) => {
                      if (key === 'overall') return null;

                      const labels: Record<string, string> = {
                        career: '事业运',
                        wealth: '财运',
                        relationship: '感情运',
                        health: '健康运',
                      };

                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-700">{labels[key]}</span>
                            <span
                              className={`font-medium ${
                                value >= 70
                                  ? 'text-green-600'
                                  : value >= 50
                                    ? 'text-blue-600'
                                    : 'text-orange-600'
                              }`}
                            >
                              {value}分
                            </span>
                          </div>
                          <Progress value={value} className="h-2" />
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 流年运势详解 */}
      <Card className="border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            流年运势详解
            {selectedDaYunDetail && (
              <Badge variant="outline" className="ml-2">
                {selectedDaYunDetail.yearRange[0]}-
                {selectedDaYunDetail.yearRange[1]}年
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={String(currentYear)} className="w-full">
            <TabsList className="grid grid-cols-5 md:grid-cols-10 h-auto">
              {annualFortuneList.map((year) => (
                <TabsTrigger
                  key={year.year}
                  value={String(year.year)}
                  className={`text-xs py-1 px-2 ${
                    year.isCurrent ? 'ring-2 ring-purple-400' : ''
                  } ${year.isPast ? 'opacity-60' : ''}`}
                  disabled={year.isPast}
                >
                  <div className="text-center">
                    <p>{year.year}</p>
                    <p className="text-xs opacity-75">{year.age}岁</p>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {annualFortuneList.map((yearData) => (
              <TabsContent
                key={yearData.year}
                value={String(yearData.year)}
                className="mt-4"
              >
                <div className="space-y-4">
                  {/* 年度评分 */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-lg mb-1">
                        {yearData.year}年运势
                        {yearData.isCurrent && (
                          <Badge className="ml-2 bg-purple-100 text-purple-700">
                            今年
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {base.gender === 'male' ? '男' : '女'}命 {yearData.age}
                        岁
                      </p>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold ${
                          getFortuneLevel(yearData.score).color
                        }`}
                      >
                        {yearData.score}
                      </div>
                      <Badge
                        className={`mt-1 ${
                          getFortuneLevel(yearData.score).bg
                        } ${getFortuneLevel(yearData.score).color}`}
                      >
                        {getFortuneLevel(yearData.score).label}
                      </Badge>
                    </div>
                  </div>

                  {/* 年度主题 */}
                  <div className="p-4 bg-white rounded-lg border">
                    <h5 className="font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      年度主题
                    </h5>
                    <p className="text-gray-700">{yearData.theme}</p>
                  </div>

                  {/* 宜忌事项 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {yearData.favorable.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h5 className="font-medium mb-2 text-green-800 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          有利方面
                        </h5>
                        <ul className="space-y-1">
                          {yearData.favorable.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <span className="text-green-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {yearData.unfavorable.length > 0 && (
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h5 className="font-medium mb-2 text-orange-800 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          需要注意
                        </h5>
                        <ul className="space-y-1">
                          {yearData.unfavorable.map((item, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-gray-700 flex items-start gap-2"
                            >
                              <span className="text-orange-600 mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* 特殊提示 */}
                  {yearData.score >= 80 && (
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start gap-2">
                        <Crown className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-purple-800 mb-1">
                            重要机遇年
                          </h5>
                          <p className="text-sm text-gray-700">
                            此年运势极佳，是人生重要的机遇期。建议把握时机，大胆前进，
                            在事业、投资、感情等方面都可以积极行动。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {yearData.score < 40 && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-red-800 mb-1">
                            谨慎年份
                          </h5>
                          <p className="text-sm text-gray-700">
                            此年运势较低，建议保守行事，避免重大决策和投资。
                            注意身体健康，维护好人际关系。
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 人生关键时期提醒 */}
      <Card className="border-2 border-purple-200 bg-purple-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            人生关键时期提醒
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {daYunTimeline.length > 0 ? (
              daYunTimeline
                .filter((d) => d.fortune.overall >= 75)
                .map((period) => (
                <div
                  key={period.period}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {period.period}
                    </div>
                    <div>
                      <p className="font-medium">
                        {period.ageRange[0]}-{period.ageRange[1]}岁 黄金期
                      </p>
                      <p className="text-sm text-gray-600">
                        {period.heavenlyStem}
                        {period.earthlyBranch}运 • {period.theme}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    运势 {period.fortune.overall}
                  </Badge>
                  </div>
                ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                暂无关键时期数据
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
