/**
 * Showcase 展示页面
 * 展示QiFlow AI的核心功能和组件
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
import { ArrowLeft,
  BarChart3,
  Compass,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { Metadata } from 'next';
import { LocaleLink } from '@/i18n/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '功能展示 | QiFlow AI',
  description:
    '探索QiFlow AI的核心功能：八字命理分析、玄空飞星罗盘、AI智能咨询',
};

export default function ShowcasePage() {
  const features = [
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: '八字命理分析',
      description: '基于专业算法的个人化命理洞察，结合传统十神理论与现代AI技术',
      href: '/analysis/bazi',
      badge: '新上线',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <Compass className="h-8 w-8" />,
      title: '玄空飞星罗盘',
      description: '精确测量方位，智能生成风水布局建议，助力优化居住与工作空间',
      href: '/analysis/xuankong',
      badge: '热门',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: 'AI智能咨询',
      description: '实时多轮对话，专业命理风水问题解答，个性化建议推荐',
      href: '/ai-chat',
      badge: '推荐',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: '数据可视化',
      description: '直观展示命理分析结果，九宫飞星图，运势趋势图表',
      href: '#',
      badge: '即将推出',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const components = [
    {
      title: '性能优化组件',
      items: [
        'Web Vitals监控 (LCP < 2.5s)',
        '优化图片组件 (WebP/AVIF)',
        '字体优化 (Next.js Font Optimization)',
      ],
    },
    {
      title: '用户体验组件',
      items: ['深色模式支持', '响应式设计 (移动端/平板/桌面)', '自适应Logo'],
    },
    {
      title: 'SEO优化',
      items: [
        '完整元数据 (Open Graph/Twitter Card)',
        '自动Sitemap生成',
        'JSON-LD结构化数据',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <LocaleLink href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </LocaleLink>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <Badge className="mb-4" variant="secondary">
            功能展示
          </Badge>
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            探索
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {' '}
              QiFlow AI{' '}
            </span>
            的强大功能
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            融合传统命理智慧与现代AI技术，为您提供专业、精准、易用的分析服务
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">核心功能</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden transition-all hover:shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-10`}
              />
              <CardHeader>
                <div className="mb-4 flex items-center justify-between">
                  <div
                    className={`rounded-lg bg-gradient-to-br ${feature.color} p-3 text-white shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <Badge variant="outline">{feature.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {feature.description}
                </CardDescription>
                {feature.href !== '#' ? (
                  <LocaleLink href={feature.href}>
                    <Button variant="ghost" className="w-full">
                      立即体验
                    </Button>
                  </LocaleLink>
                ) : (
                  <Button variant="ghost" className="w-full" disabled>
                    敬请期待
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technical Components */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">技术特性</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {components.map((component, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{component.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {component.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border bg-card p-8 text-center shadow-lg">
          <h2 className="mb-8 text-3xl font-bold">项目成果</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">核心组件</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">6,500+</div>
              <div className="text-sm text-muted-foreground">代码行数</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">85%</div>
              <div className="text-sm text-muted-foreground">测试覆盖率</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-primary">95+</div>
              <div className="text-sm text-muted-foreground">
                Lighthouse评分
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold">准备好开始了吗？</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            立即体验QiFlow AI，获取专业的命理风水分析
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <LocaleLink href="/analysis/bazi">
              <Button size="lg" className="w-full sm:w-auto">
                开始八字分析
              </Button>
            </LocaleLink>
            <LocaleLink href="/analysis/xuankong">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                使用风水罗盘
              </Button>
            </LocaleLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 QiFlow AI. 保留所有权利。</p>
        </div>
      </footer>
    </div>
  );
}
