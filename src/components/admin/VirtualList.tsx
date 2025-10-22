/**
 * 简化版虚拟滚动列表组件
 * 用于优化大数据列表的渲染性能
 */

'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

export interface VirtualListProps<T> {
  items: T[];
  hasMore?: boolean;
  isLoading?: boolean;
  loadMore?: () => Promise<void>;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  height?: number | string;
  className?: string;
}

export function VirtualList<T>({
  items,
  hasMore = false,
  isLoading = false,
  loadMore,
  renderItem,
  itemHeight = 80,
  height = '600px',
  className,
}: VirtualListProps<T>) {
  const [displayCount, setDisplayCount] = useState(50); // 显示前50个项目

  const displayedItems = items.slice(0, displayCount);
  const hasMoreToShow = items.length > displayCount;

  const handleLoadMore = async () => {
    if (loadMore && hasMore) {
      await loadMore();
    } else if (hasMoreToShow) {
      setDisplayCount((prev) => Math.min(prev + 50, items.length));
    }
  };

  return (
    <div
      className={`w-full overflow-auto ${className || ''}`}
      style={{ height: typeof height === 'string' ? height : `${height}px` }}
    >
      <div className="space-y-2">
        {displayedItems.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>

      {(hasMore || hasMoreToShow) && (
        <div className="flex justify-center p-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? '加载中...' : hasMore ? '加载更多' : '显示更多'}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * 日志虚拟滚动列表示例
 */
export function VirtualLogList({ logs }: { logs: any[] }) {
  return (
    <VirtualList
      items={logs}
      itemHeight={100}
      renderItem={(log, index) => (
        <div className="flex items-start gap-4 p-4 border-b hover:bg-muted/50">
          <div className="text-xs text-muted-foreground w-32 flex-shrink-0">
            {log.timestamp}
          </div>
          <div className="flex-1">
            <div className="text-sm font-mono">{log.message}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {log.source}
            </div>
          </div>
        </div>
      )}
    />
  );
}
