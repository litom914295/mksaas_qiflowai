'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Heart, Loader2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NameBusinessToolsPage() {
  const t = useTranslations('QiFlow');
  const [matchResult, setMatchResult] = useState<any>(null);
  const [nameResult, setNameResult] = useState<any>(null);
  const [businessResult, setBusinessResult] = useState<any>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [isLoadingName, setIsLoadingName] = useState(false);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);

  // 合婚分析表单状态
  const [marriageForm, setMarriageForm] = useState({
    person1Name: '',
    person1Birth: '',
    person2Name: '',
    person2Birth: '',
  });

  // 姓名分析表单状态
  const [nameForm, setNameForm] = useState({
    name: '',
    birthDate: '',
  });

  // 公司起名表单状态
  const [businessForm, setBusinessForm] = useState({
    industry: '',
    founderName: '',
    birthDate: '',
  });

  // 合婚分析API调用
  async function handleMarriageMatch() {
    if (
      !marriageForm.person1Name ||
      !marriageForm.person1Birth ||
      !marriageForm.person2Name ||
      !marriageForm.person2Birth
    ) {
      toast.error('请填写完整信息');
      return;
    }

    setIsLoadingMatch(true);
    try {
      const response = await fetch('/api/tools/marriage-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1: {
            name: marriageForm.person1Name,
            birthDate: marriageForm.person1Birth,
          },
          person2: {
            name: marriageForm.person2Name,
            birthDate: marriageForm.person2Birth,
          },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMatchResult(result.data);
        toast.success('分析完成');
      } else {
        toast.error(result.error || '分析失败');
      }
    } catch (error) {
      console.error('Marriage match error:', error);
      toast.error('分析失败，请稍后重试');
    } finally {
      setIsLoadingMatch(false);
    }
  }

  // 姓名分析API调用
  async function handleNameAnalysis() {
    if (!nameForm.name || !nameForm.birthDate) {
      toast.error('请填写完整信息');
      return;
    }

    setIsLoadingName(true);
    try {
      const response = await fetch('/api/tools/name-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nameForm),
      });

      const result = await response.json();
      if (result.success) {
        setNameResult(result.data);
        toast.success('分析完成');
      } else {
        toast.error(result.error || '分析失败');
      }
    } catch (error) {
      console.error('Name analysis error:', error);
      toast.error('分析失败，请稍后重试');
    } finally {
      setIsLoadingName(false);
    }
  }

  // 公司起名API调用
  async function handleBusinessNaming() {
    if (
      !businessForm.industry ||
      !businessForm.founderName ||
      !businessForm.birthDate
    ) {
      toast.error('请填写完整信息');
      return;
    }

    setIsLoadingBusiness(true);
    try {
      const response = await fetch('/api/tools/business-naming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: businessForm.industry,
          founderName: businessForm.founderName,
          birthDate: businessForm.birthDate,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setBusinessResult(result.data);
        toast.success('生成完成');
      } else {
        toast.error(result.error || '生成失败');
      }
    } catch (error) {
      console.error('Business naming error:', error);
      toast.error('生成失败，请稍后重试');
    } finally {
      setIsLoadingBusiness(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">命理工具集</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          合婚分析、姓名分析、公司起名等专业工具
        </p>
      </div>

      <Tabs defaultValue="marriage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marriage">
            <Heart className="mr-2 h-4 w-4" />
            合婚分析
          </TabsTrigger>
          <TabsTrigger value="name">
            <User className="mr-2 h-4 w-4" />
            姓名分析
          </TabsTrigger>
          <TabsTrigger value="business">
            <Building className="mr-2 h-4 w-4" />
            公司起名
          </TabsTrigger>
        </TabsList>

        {/* 合婚分析 */}
        <TabsContent value="marriage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>双方八字合婚</CardTitle>
              <CardDescription>根据双方八字分析婚姻匹配度</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>男方姓名</Label>
                  <Input
                    placeholder="输入男方姓名"
                    value={marriageForm.person1Name}
                    onChange={(e) =>
                      setMarriageForm({
                        ...marriageForm,
                        person1Name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>男方生辰</Label>
                  <Input
                    type="datetime-local"
                    value={marriageForm.person1Birth}
                    onChange={(e) =>
                      setMarriageForm({
                        ...marriageForm,
                        person1Birth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>女方姓名</Label>
                  <Input
                    placeholder="输入女方姓名"
                    value={marriageForm.person2Name}
                    onChange={(e) =>
                      setMarriageForm({
                        ...marriageForm,
                        person2Name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>女方生辰</Label>
                  <Input
                    type="datetime-local"
                    value={marriageForm.person2Birth}
                    onChange={(e) =>
                      setMarriageForm({
                        ...marriageForm,
                        person2Birth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleMarriageMatch}
                disabled={isLoadingMatch}
              >
                {isLoadingMatch && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                开始合婚分析
              </Button>

              {matchResult && (
                <div className="mt-4 rounded-lg border bg-card p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-lg font-semibold">匹配度评分</span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-primary">
                        {matchResult.analysis.score}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>
                  <Badge className="mb-4">{matchResult.analysis.level}</Badge>
                  <div className="space-y-3">
                    <div>
                      <p className="mb-2 text-sm font-medium text-green-700">
                        优势：
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {matchResult.analysis.strengths.map(
                          (s: string, i: number) => (
                            <li key={i}>{s}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-orange-700">
                        建议：
                      </p>
                      <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                        {matchResult.analysis.concerns.map(
                          (c: string, i: number) => (
                            <li key={i}>{c}</li>
                          )
                        )}
                      </ul>
                    </div>
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm text-muted-foreground">
                        {matchResult.analysis.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 姓名分析 */}
        <TabsContent value="name" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>姓名五行分析</CardTitle>
              <CardDescription>基于八字五行分析姓名适配度</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>您的姓名</Label>
                <Input
                  placeholder="输入您的姓名"
                  value={nameForm.name}
                  onChange={(e) =>
                    setNameForm({ ...nameForm, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>出生时间</Label>
                <Input
                  type="datetime-local"
                  value={nameForm.birthDate}
                  onChange={(e) =>
                    setNameForm({ ...nameForm, birthDate: e.target.value })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleNameAnalysis}
                disabled={isLoadingName}
              >
                {isLoadingName && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                分析姓名
              </Button>

              {nameResult && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold">适配度评分</span>
                      <span className="text-2xl font-bold text-primary">
                        {nameResult.compatibility.score}
                      </span>
                    </div>
                    <Badge className="mb-3">
                      {nameResult.compatibility.level}
                    </Badge>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">姓名五行分布：</p>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(nameResult.nameAnalysis.elements).map(
                          ([elem, count]: any) => (
                            <div
                              key={elem}
                              className="rounded border bg-muted p-2 text-center"
                            >
                              <div className="text-sm font-medium">{elem}</div>
                              <div className="text-xs text-muted-foreground">
                                {count}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium">分析建议：</p>
                        {nameResult.compatibility.suggestions.map(
                          (s: string, i: number) => (
                            <p
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              • {s}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 公司起名 */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>公司起名建议</CardTitle>
              <CardDescription>
                基于行业特点和法人八字推荐公司名称
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>行业类型</Label>
                <Input
                  placeholder="如：科技、餐饮、教育等"
                  value={businessForm.industry}
                  onChange={(e) =>
                    setBusinessForm({
                      ...businessForm,
                      industry: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>法人姓名</Label>
                <Input
                  placeholder="输入法人姓名"
                  value={businessForm.founderName}
                  onChange={(e) =>
                    setBusinessForm({
                      ...businessForm,
                      founderName: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>法人生辰</Label>
                <Input
                  type="datetime-local"
                  value={businessForm.birthDate}
                  onChange={(e) =>
                    setBusinessForm({
                      ...businessForm,
                      birthDate: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                className="w-full"
                onClick={handleBusinessNaming}
                disabled={isLoadingBusiness}
              >
                {isLoadingBusiness && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                生成起名建议
              </Button>

              {businessResult && (
                <div className="mt-4 space-y-3">
                  <div className="mb-3 rounded-lg border bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground">
                      {businessResult.analysis.explanation}
                    </p>
                  </div>
                  {businessResult.recommendations.map((rec: any, i: number) => (
                    <div key={i} className="rounded-lg border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-lg font-bold">{rec.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge>{rec.score}分</Badge>
                          <Badge variant="outline">{rec.suitable}</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rec.reason}
                      </p>
                      {rec.elements.length > 0 && (
                        <div className="mt-2 flex gap-1">
                          {rec.elements.map((elem: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {elem}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
