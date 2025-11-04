'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle, Calendar as CalendarIcon, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const EVENT_TYPES = [
  { value: 'wedding', label: '婚嫁', color: 'bg-red-100 text-red-800' },
  { value: 'move', label: '搬家', color: 'bg-blue-100 text-blue-800' },
  { value: 'business', label: '开业', color: 'bg-green-100 text-green-800' },
  { value: 'travel', label: '出行', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'contract', label: '签约', color: 'bg-purple-100 text-purple-800' },
  {
    value: 'construction',
    label: '动土',
    color: 'bg-orange-100 text-orange-800',
  },
];

type DateScore = {
  date: Date;
  score: number;
  suitable: string[];
  unsuitable: string[];
  notes: string;
};

export default function DatePickerToolPage() {
  const t = useTranslations('QiFlow');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [eventType, setEventType] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<DateScore[]>([]);

  function handleAnalyze() {
    if (!eventType) return;

    setAnalyzing(true);
    // TODO: 调用 API 分析日期
    setTimeout(() => {
      // 示例数据
      const mockResults: DateScore[] = [];
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= Math.min(daysInMonth, 10); day++) {
        const date = new Date(year, month, day);
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        mockResults.push({
          date,
          score,
          suitable: ['祈福', '出行', '安葬'],
          unsuitable: ['嫁娶', '开市'],
          notes:
            score >= 85 ? '诸事皆宜，吉日' : score >= 75 ? '较为适宜' : '一般',
        });
      }

      setResults(mockResults.sort((a, b) => b.score - a.score));
      setAnalyzing(false);
    }, 1500);
  }

  function getScoreBadge(score: number) {
    if (score >= 90)
      return <Badge className="bg-green-500">极佳 {score}</Badge>;
    if (score >= 80) return <Badge className="bg-blue-500">良好 {score}</Badge>;
    if (score >= 70)
      return <Badge className="bg-yellow-500">尚可 {score}</Badge>;
    return <Badge variant="secondary">一般 {score}</Badge>;
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          择日工具
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          根据传统历法和您的八字，选择适合特定事项的吉日良辰
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 左侧：参数设置 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">选择事项</CardTitle>
              <CardDescription>请选择您要择吉日的事项类型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="event-type">事项类型</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="选择事项类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {eventType && (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={cn(
                        EVENT_TYPES.find((t) => t.value === eventType)?.color
                      )}
                    >
                      {EVENT_TYPES.find((t) => t.value === eventType)?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      已选择
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">选择月份</CardTitle>
              <CardDescription>选择您要查询的月份范围</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalyze}
            disabled={!eventType || analyzing}
            className="w-full"
            size="lg"
          >
            {analyzing ? (
              <>分析中...</>
            ) : (
              <>
                <Star className="mr-2 h-4 w-4" />
                开始择日分析
              </>
            )}
          </Button>
        </div>

        {/* 右侧：结果展示 */}
        <div className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center text-center">
                <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {eventType
                    ? '点击「开始择日分析」查看吉日推荐'
                    : '请先选择事项类型'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold">
                    {selectedMonth.getFullYear()}年
                    {selectedMonth.getMonth() + 1}月 吉日推荐
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  共找到 {results.length} 个适合
                  {EVENT_TYPES.find((t) => t.value === eventType)?.label}的日期
                </p>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {result.date.getMonth() + 1}月
                            {result.date.getDate()}日
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {
                              ['日', '一', '二', '三', '四', '五', '六'][
                                result.date.getDay()
                              ]
                            }
                          </CardDescription>
                        </div>
                        {getScoreBadge(result.score)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-green-700">
                            宜：
                          </span>
                          <span className="ml-2 text-muted-foreground">
                            {result.suitable.join('、')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-red-700">忌：</span>
                          <span className="ml-2 text-muted-foreground">
                            {result.unsuitable.join('、')}
                          </span>
                        </div>
                        {result.notes && (
                          <div className="flex items-start gap-1 rounded bg-muted/50 p-2 text-xs">
                            <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            <span>{result.notes}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
