// P1-003: useInstantPreview Hook - 调用即时体验API
// 功能：封装前端调用 /api/qiflow/instant-preview 的逻辑

import { useMutation, useQuery } from '@tanstack/react-query';

// 请求类型定义
export type InstantPreviewRequest = {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm (可选)
};

// 响应类型定义
export type InstantPreviewResponse = {
  success: boolean;
  data?: {
    summary: string; // AI生成的简短命理总结
    keyInsights: string[]; // 3-5条关键洞察
    pillars: {
      year: string;
      month: string;
      day: string;
      hour?: string;
    };
    elements: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
    cta: {
      message: string;
      link: string;
    };
  };
  error?: string;
};

// 调用后端API
async function fetchInstantPreview(
  request: InstantPreviewRequest
): Promise<InstantPreviewResponse> {
  const response = await fetch('/api/qiflow/instant-preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: '网络错误' }));
    throw new Error(error.error || '即时分析失败');
  }

  return response.json();
}

/**
 * useInstantPreview - React Query Hook
 * 用于调用即时体验API并管理状态
 */
export function useInstantPreview() {
  return useMutation({
    mutationFn: fetchInstantPreview,
    retry: 1, // 失败重试1次
  });
}

/**
 * useInstantPreviewStats - 获取即时体验统计数据
 * 用于在首页显示统计信息（如已体验用户数）
 */
export function useInstantPreviewStats() {
  return useQuery({
    queryKey: ['instant-preview-stats'],
    queryFn: async () => {
      const response = await fetch('/api/qiflow/instant-preview/stats');
      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
    refetchInterval: false, // 不自动轮询
  });
}
