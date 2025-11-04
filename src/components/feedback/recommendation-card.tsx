'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Home, Shield, Star, TrendingUp } from 'lucide-react';
import type React from 'react';

interface RecommendationCardProps {
  title: string;
  description: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  icon?: React.ReactNode;
  action?: () => void;
}

export function RecommendationCard({
  title,
  description,
  category = '建议',
  priority = 'medium',
  icon,
  action,
}: RecommendationCardProps) {
  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const priorityLabels = {
    high: '重要',
    medium: '建议',
    low: '参考',
  };

  const getIcon = () => {
    if (icon) return icon;

    switch (category) {
      case '事业':
        return <TrendingUp className="h-5 w-5" />;
      case '健康':
        return <Shield className="h-5 w-5" />;
      case '感情':
        return <Heart className="h-5 w-5" />;
      case '家居':
        return <Home className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
                <Badge className={`text-xs ${priorityColors[priority]}`}>
                  {priorityLabels[priority]}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        {action && (
          <Button size="sm" variant="outline" onClick={action}>
            了解更多
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
