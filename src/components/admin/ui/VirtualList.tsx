'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 虚拟滚动列表组件
 * 用于渲染大数据列表(如审计日志、用户列表)
 * 只渲染可见区域的项目,提高性能
 */

export interface VirtualListProps<T> {
  /** 数据列表 */
  items: T[];
  /** 每项高度(px) */
  itemHeight: number;
  /** 容器高度(px) */
  containerHeight: number;
  /** 渲染函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 缓冲区大小(额外渲染的项目数量) */
  overscan?: number;
  /** 加载状态 */
  loading?: boolean;
  /** 空状态 */
  emptyText?: string;
  /** 到达底部回调(用于无限滚动) */
  onReachBottom?: () => void;
  /** 底部距离触发阈值 */
  bottomThreshold?: number;
  /** 自定义类名 */
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  loading = false,
  emptyText = '暂无数据',
  onReachBottom,
  bottomThreshold = 100,
  className = '',
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见区域
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  // 处理滚动
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      setScrollTop(target.scrollTop);

      // 检查是否到达底部
      if (onReachBottom) {
        const bottom =
          target.scrollHeight - target.scrollTop - target.clientHeight;
        if (bottom < bottomThreshold) {
          onReachBottom();
        }
      }
    },
    [onReachBottom, bottomThreshold]
  );

  // 空状态
  if (!loading && items.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-50 text-gray-500 ${className}`}
        style={{ height: containerHeight }}
      >
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </div>
  );
}

/**
 * 虚拟表格组件(用于审计日志等场景)
 */
interface VirtualTableProps<T> {
  items: T[];
  columns: {
    key: string;
    label: string;
    width?: string;
    render?: (item: T) => React.ReactNode;
  }[];
  rowHeight?: number;
  containerHeight?: number;
  loading?: boolean;
  onReachBottom?: () => void;
  className?: string;
}

export function VirtualTable<T extends Record<string, any>>({
  items,
  columns,
  rowHeight = 48,
  containerHeight = 600,
  loading = false,
  onReachBottom,
  className = '',
}: VirtualTableProps<T>) {
  return (
    <div className={className}>
      {/* 表头 */}
      <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-gray-50">
        {columns.map((col) => (
          <div
            key={col.key}
            className="flex-shrink-0 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700"
            style={{
              width: col.width || 'auto',
              flex: col.width ? undefined : 1,
            }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* 虚拟滚动内容 */}
      <VirtualList
        items={items}
        itemHeight={rowHeight}
        containerHeight={containerHeight}
        loading={loading}
        onReachBottom={onReachBottom}
        renderItem={(item) => (
          <div className="flex border-b border-gray-100 hover:bg-gray-50">
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex items-center px-4 text-sm text-gray-900"
                style={{
                  width: col.width || 'auto',
                  flex: col.width ? undefined : 1,
                }}
              >
                {col.render ? col.render(item) : item[col.key]}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
}

/**
 * 使用虚拟滚动的Hook(带分页加载)
 */
interface UseVirtualScrollOptions<T> {
  fetchData: (
    page: number,
    pageSize: number
  ) => Promise<{ items: T[]; total: number }>;
  pageSize?: number;
}

export function useVirtualScroll<T>({
  fetchData,
  pageSize = 50,
}: UseVirtualScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const result = await fetchData(page, pageSize);
      setItems((prev) => [...prev, ...result.items]);
      setTotal(result.total);
      setHasMore(items.length + result.items.length < result.total);
      setPage((p) => p + 1);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, pageSize, loading, hasMore, items.length]);

  // 初始加载
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(async () => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
  }, []);

  return {
    items,
    loading,
    hasMore,
    total,
    loadMore,
    reset,
  };
}
