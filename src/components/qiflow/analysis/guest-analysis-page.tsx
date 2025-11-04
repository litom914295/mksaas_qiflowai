'use client';

import BaziApiResult from '@/components/qiflow/analysis/bazi-api-result';
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
import React from 'react';

interface GuestAnalysisPageProps {
  onAnalyze?: (data: any) => void;
}

export default function GuestAnalysisPage({
  onAnalyze,
}: GuestAnalysisPageProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    birthDate: '',
    birthTime: '',
    gender: 'male',
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze?.(formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">八字分析结果</h1>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              返回修改信息
            </Button>
          </div>
          <BaziApiResult
            personal={{
              name: formData.name,
              birthDate: formData.birthDate,
              birthTime: formData.birthTime,
              gender: formData.gender as 'male' | 'female',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>访客免费分析</CardTitle>
          <CardDescription>
            请填写您的基本信息，我们将为您提供简要的命理分析
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="请输入您的姓名"
                required
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="gender">性别</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gender: e.target.value }))
                }
                className="w-full px-3 py-2 border border-input rounded-md"
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              开始免费分析
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
