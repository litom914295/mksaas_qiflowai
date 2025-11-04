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
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock,
  Coins,
  FileText,
  Home,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type RecentAnalysis = {
  id: string;
  type: 'bazi' | 'fengshui';
  title: string;
  createdAt: Date;
  creditsUsed: number;
};

type RecentAnalysesSectionProps = {
  analyses: RecentAnalysis[];
};

export default function RecentAnalysesSection({
  analyses,
}: RecentAnalysesSectionProps) {
  if (analyses.length === 0) {
    return (
      <section className="mt-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 text-xl font-semibold text-gray-900 dark:text-white"
        >
          最近分析
        </motion.h2>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20">
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-muted-foreground">暂无分析记录</p>
            <p className="mt-2 text-sm text-muted-foreground">
              开始使用 QiFlow AI 进行您的第一次分析吧！
            </p>
            <Link href="/unified-form">
              <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Sparkles className="mr-2 h-4 w-4" />
                开始分析
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-semibold text-gray-900 dark:text-white"
        >
          最近分析
        </motion.h2>
        <Link href="/analysis">
          <Button variant="ghost" size="sm" className="group">
            查看全部
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="group h-full cursor-pointer border-0 shadow-md transition-all hover:shadow-xl">
              {/* 渐变背景 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  analysis.type === 'bazi'
                    ? 'from-purple-500 to-pink-500'
                    : 'from-blue-500 to-cyan-500'
                } opacity-0 transition-opacity group-hover:opacity-5`}
              />

              <CardHeader className="relative pb-3">
                <div className="flex items-start justify-between">
                  {/* 类型图标 */}
                  <div
                    className={`rounded-lg bg-gradient-to-br ${
                      analysis.type === 'bazi'
                        ? 'from-purple-500 to-pink-500'
                        : 'from-blue-500 to-cyan-500'
                    } p-2 text-white shadow-lg`}
                  >
                    {analysis.type === 'bazi' ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Home className="h-5 w-5" />
                    )}
                  </div>

                  {/* 类型标签 */}
                  <Badge variant="secondary">{analysis.title}</Badge>
                </div>

                <CardTitle className="mt-3 text-base">
                  {analysis.type === 'bazi' ? '八字命理分析' : '玄空风水分析'}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(analysis.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                <div className="flex items-center justify-between">
                  {/* 消耗积分 */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span>{analysis.creditsUsed} 积分</span>
                  </div>

                  {/* 查看详情 */}
                  <Link
                    href={`/analysis?type=${analysis.type}&id=${analysis.id}`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      查看详情
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {/* 创建时间 */}
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(analysis.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
