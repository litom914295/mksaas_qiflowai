'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, TrendingUp, XCircle } from 'lucide-react';

interface OverallAssessmentViewProps {
  assessment: {
    score: number;
    rating: 'excellent' | 'good' | 'fair' | 'poor';
    strengths: string[];
    weaknesses: string[];
    topPriorities: string[];
    longTermPlan: string[];
  };
  metadata: {
    analyzedAt: Date;
    version: string;
    analysisDepth: string;
    computationTime: number;
  };
}

export function OverallAssessmentView({
  assessment,
  metadata,
}: OverallAssessmentViewProps) {
  return (
    <div className="space-y-6">
      {/* 评分进度条 */}
      <Card>
        <CardHeader>
          <CardTitle>综合评分详情</CardTitle>
          <CardDescription>基于多维度分析的综合评价结果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">总体评分</span>
              <span className="text-2xl font-bold">{assessment.score}/100</span>
            </div>
            <Progress value={assessment.score} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>较差</span>
              <span>一般</span>
              <span>良好</span>
              <span>优秀</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优势 */}
      {assessment.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>主要优势</CardTitle>
            </div>
            <CardDescription>当前格局的有利因素</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 劣势 */}
      {assessment.weaknesses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle>需要关注的问题</CardTitle>
            </div>
            <CardDescription>当前格局存在的不利因素</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 优先事项 */}
      {assessment.topPriorities.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <div className="font-semibold mb-2">优先处理事项</div>
            <ol className="list-decimal list-inside space-y-1">
              {assessment.topPriorities.map((priority, index) => (
                <li key={index} className="text-sm">
                  {priority}
                </li>
              ))}
            </ol>
          </AlertDescription>
        </Alert>
      )}

      {/* 长期规划 */}
      {assessment.longTermPlan.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>长期规划建议</CardTitle>
            </div>
            <CardDescription>持续优化和改善的方向</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {assessment.longTermPlan.map((plan, index) => (
                <li key={index} className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{plan}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
