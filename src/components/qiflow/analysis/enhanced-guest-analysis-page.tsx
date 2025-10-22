'use client';

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
import React from 'react';

interface EnhancedGuestAnalysisPageProps {
  onAnalyze?: (data: any) => void;
}

export default function EnhancedGuestAnalysisPage({
  onAnalyze,
}: EnhancedGuestAnalysisPageProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    gender: 'male',
    analysisType: 'bazi',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAnalyze) {
      onAnalyze(formData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>增强版访客分析</CardTitle>
          <CardDescription>
            更详细的命理分析，包含八字、风水、运势等多维度解读
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={formData.analysisType}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, analysisType: value }))
            }
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bazi">八字分析</TabsTrigger>
              <TabsTrigger value="fengshui">风水分析</TabsTrigger>
              <TabsTrigger value="comprehensive">综合分析</TabsTrigger>
            </TabsList>

            <TabsContent value="bazi" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="请输入您的姓名"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">性别</Label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gender: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">出生日期</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          birthDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthTime">出生时间</Label>
                    <Input
                      id="birthTime"
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          birthTime: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthPlace">出生地点（可选）</Label>
                  <Input
                    id="birthPlace"
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        birthPlace: e.target.value,
                      }))
                    }
                    placeholder="例：北京市朝阳区"
                  />
                </div>

                <Button type="submit" className="w-full">
                  开始八字分析
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="fengshui" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">风水分析</h3>
                <p className="text-muted-foreground mb-4">
                  风水分析功能正在开发中，敬请期待
                </p>
                <Button disabled>即将上线</Button>
              </div>
            </TabsContent>

            <TabsContent value="comprehensive" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">综合分析</h3>
                <p className="text-muted-foreground mb-4">
                  综合分析功能正在开发中，将包含八字、风水、运势等全方位解读
                </p>
                <Button disabled>即将上线</Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">增强功能特色：</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 更详细的八字解析，包含大运流年</li>
              <li>• 个人风水建议和改善方案</li>
              <li>• 综合运势预测和人生建议</li>
              <li>• 专业图表和可视化展示</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
