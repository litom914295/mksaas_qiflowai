/**
 * 八字分析页面
 * 提供完整的八字命理分析服务
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LocaleLink } from '@/i18n/navigation';
import { ArrowLeft, Calendar, Star, TrendingUp } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '八字分析 | QiFlow AI',
  description: '专业的八字命理分析,基于传统命理学与现代AI技术',
};

export default function BaziAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <LocaleLink href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </LocaleLink>
        </div>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4" variant="secondary">
            <Star className="mr-1 h-3 w-3" />
            八字命理
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              专业八字分析
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            基于传统命理学与现代AI技术,为您提供精准的八字分析
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                开始八字分析
              </CardTitle>
              <CardDescription>
                请填写准确的出生信息以获得精准的分析结果
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>八字分析功能正在完善中</p>
                <p className="text-sm mt-2">敬请期待完整版本</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
