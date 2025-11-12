'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpenIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  ExternalLinkIcon,
  InfoIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/lib/rag';

export interface KnowledgeReferenceProps {
  references: SearchResult[];
  onReferenceClick?: (reference: SearchResult) => void;
  className?: string;
  showDetails?: boolean;
  maxReferences?: number;
  title?: string;
}

/**
 * 知识引用组件 - 展示 RAG 检索到的文档
 */
export function KnowledgeReference({
  references,
  onReferenceClick,
  className,
  showDetails = true,
  maxReferences = 5,
  title = '📚 知识来源',
}: KnowledgeReferenceProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // 处理展示的引用数量
  const displayedReferences = showAll
    ? references
    : references.slice(0, maxReferences);

  const hasMore = references.length > maxReferences;

  // 切换展开状态
  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bazi':
        return 'bg-purple-100 text-purple-800';
      case 'fengshui':
        return 'bg-green-100 text-green-800';
      case 'faq':
        return 'bg-blue-100 text-blue-800';
      case 'case':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取相似度级别
  const getSimilarityLevel = (similarity: number) => {
    if (similarity >= 0.9) return { text: '极高', color: 'text-green-600' };
    if (similarity >= 0.8) return { text: '高', color: 'text-blue-600' };
    if (similarity >= 0.7) return { text: '中', color: 'text-yellow-600' };
    return { text: '低', color: 'text-gray-600' };
  };

  // 格式化来源
  const formatSource = (source: string) => {
    // 去除文件扩展名
    return source.replace(/\.(txt|md|markdown)$/i, '');
  };

  if (!references || references.length === 0) {
    return null;
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpenIcon className="h-4 w-4" />
            {title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {references.length} 个引用
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedReferences.map((ref) => {
          const isExpanded = expandedItems.has(ref.id);
          const similarityLevel = getSimilarityLevel(ref.similarity);

          return (
            <Collapsible
              key={ref.id}
              open={isExpanded}
              onOpenChange={() => toggleExpanded(ref.id)}
            >
              <div className="rounded-lg border bg-card p-3">
                {/* 标题行 */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {ref.title}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={cn('text-xs', getCategoryColor(ref.category))}
                      >
                        {ref.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="truncate">
                        来源: {formatSource(ref.source)}
                      </span>
                      
                      {ref.chunkIndex !== null && (
                        <span>第 {ref.chunkIndex + 1} 部分</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 相似度指示器 */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <Progress
                              value={ref.similarity * 100}
                              className="w-12 h-2"
                            />
                            <span className={cn('text-xs font-medium', similarityLevel.color)}>
                              {(ref.similarity * 100).toFixed(0)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>相似度: {similarityLevel.text}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* 展开按钮 */}
                    {showDetails && (
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          {isExpanded ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}

                    {/* 外部链接 */}
                    {onReferenceClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onReferenceClick(ref)}
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* 内容预览（始终显示） */}
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {ref.content}
                </p>

                {/* 展开内容 */}
                {showDetails && (
                  <CollapsibleContent>
                    <div className="mt-3 pt-3 border-t">
                      {/* 完整内容 */}
                      <div className="text-sm text-foreground whitespace-pre-wrap">
                        {ref.content}
                      </div>

                      {/* 元数据 */}
                      {ref.metadata && Object.keys(ref.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 mb-2">
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              元数据
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(ref.metadata).map(([key, value]) => (
                              <div key={key} className="flex gap-1">
                                <span className="text-muted-foreground">
                                  {key}:
                                </span>
                                <span className="font-mono">
                                  {JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                )}
              </div>
            </Collapsible>
          );
        })}

        {/* 显示更多按钮 */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? (
                <>
                  收起 <ChevronUpIcon className="ml-1 h-3 w-3" />
                </>
              ) : (
                <>
                  显示全部 ({references.length - maxReferences} 个更多)
                  <ChevronDownIcon className="ml-1 h-3 w-3" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 迷你版知识引用组件（用于紧凑空间）
 */
export function KnowledgeReferenceMini({
  references,
  onReferenceClick,
  className,
}: {
  references: SearchResult[];
  onReferenceClick?: (reference: SearchResult) => void;
  className?: string;
}) {
  if (!references || references.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {references.map((ref) => (
        <TooltipProvider key={ref.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-secondary/80"
                onClick={() => onReferenceClick?.(ref)}
              >
                <BookOpenIcon className="h-3 w-3 mr-1" />
                {ref.title.length > 20
                  ? `${ref.title.substring(0, 20)}...`
                  : ref.title}
                <span className="ml-1 opacity-60">
                  {(ref.similarity * 100).toFixed(0)}%
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-medium">{ref.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {ref.content.substring(0, 150)}...
              </p>
              <p className="text-xs mt-2">
                相似度: {(ref.similarity * 100).toFixed(1)}%
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

/**
 * 知识引用统计组件
 */
export function KnowledgeReferenceStats({
  references,
  className,
}: {
  references: SearchResult[];
  className?: string;
}) {
  if (!references || references.length === 0) {
    return null;
  }

  // 计算统计
  const avgSimilarity =
    references.reduce((sum, ref) => sum + ref.similarity, 0) / references.length;

  const categoryCount = references.reduce((acc, ref) => {
    acc[ref.category] = (acc[ref.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn('grid grid-cols-3 gap-3 text-xs', className)}>
      <div>
        <p className="text-muted-foreground">引用数量</p>
        <p className="font-medium">{references.length}</p>
      </div>
      <div>
        <p className="text-muted-foreground">平均相似度</p>
        <p className="font-medium">{(avgSimilarity * 100).toFixed(1)}%</p>
      </div>
      <div>
        <p className="text-muted-foreground">类别分布</p>
        <p className="font-medium">
          {Object.entries(categoryCount)
            .map(([cat, count]) => `${cat}(${count})`)
            .join(', ')}
        </p>
      </div>
    </div>
  );
}