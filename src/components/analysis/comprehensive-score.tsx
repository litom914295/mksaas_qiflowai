'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Star, 
  AlertTriangle, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface ComprehensiveScoreProps {
  baziScore?: number;
  fengshuiScore?: number;
  overallScore?: number;
  rating?: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions?: string[];
}

export function ComprehensiveScore({
  baziScore = 0,
  fengshuiScore = 0,
  overallScore = 0,
  rating = 'good',
  suggestions = []
}: ComprehensiveScoreProps) {
  
  // 获取评级颜色
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // 获取评级文本
  const getRatingText = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '优秀';
      case 'good':
        return '良好';
      case 'fair':
        return '一般';
      case 'poor':
        return '需改善';
      default:
        return '评估中';
    }
  };

  // 获取评级图标
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'good':
        return <Star className="w-5 h-5" />;
      case 'fair':
        return <Info className="w-5 h-5" />;
      case 'poor':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  // 计算综合分数（如果没有提供）
  const calculatedScore = overallScore || Math.round((baziScore + fengshuiScore) / 2);

  return (
    <Card variant="elevated" className="border-2 border-purple-200 dark:border-purple-700">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle size="lg" gradient="primary" className="flex items-center gap-2">
              综合评分报告
              <Badge className={`${getRatingColor(rating)} text-white`}>
                {getRatingIcon(rating)}
                <span className="ml-1">{getRatingText(rating)}</span>
              </Badge>
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {calculatedScore}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">综合得分</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 分项得分 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">八字命理分析</span>
              <span className="text-sm font-bold text-purple-600">{baziScore}分</span>
            </div>
            <Progress value={baziScore} max={100} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">玄空风水分析</span>
              <span className="text-sm font-bold text-blue-600">{fengshuiScore}分</span>
            </div>
            <Progress value={fengshuiScore} max={100} className="h-2" />
          </div>
        </div>

        {/* 评估维度 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            关键评估维度
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">A+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">事业运势</div>
            </div>
            <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">A</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">感情婚姻</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">B+</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">财运分析</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">A</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">健康状况</div>
            </div>
          </div>
        </div>

        {/* 优化建议 */}
        {suggestions.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold mb-3">优化建议</h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}