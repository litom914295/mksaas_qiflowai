/**
 * A/B 测试客户端管理器
 * 通过 Server Actions 调用服务器端逻辑,避免在客户端引入数据库依赖
 */

export type VariantConfig = {
  id: string;
  weight: number;
  config?: Record<string, any>;
};

/**
 * A/B 测试客户端管理器
 * 用于客户端组件中的 A/B 测试
 */
export class ABTestManagerClient {
  /**
   * 获取用户在实验中的变体
   */
  async getVariant(params: {
    experimentName: string;
    userId: string;
  }): Promise<{
    variantId: string;
    variantConfig?: Record<string, any>;
  } | null> {
    try {
      const response = await fetch('/api/ab-test/variant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        console.warn('[ABTest] Failed to get variant:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[ABTest] Error getting variant:', error);
      return null;
    }
  }

  /**
   * 追踪事件
   */
  async trackEvent(params: {
    experimentName: string;
    userId: string;
    eventType: string;
    eventData?: Record<string, any>;
  }): Promise<void> {
    try {
      const response = await fetch('/api/ab-test/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        console.warn('[ABTest] Failed to track event:', response.statusText);
      }
    } catch (error) {
      console.error('[ABTest] Error tracking event:', error);
    }
  }
}

// 导出单例实例
export const abTestManagerClient = new ABTestManagerClient();
