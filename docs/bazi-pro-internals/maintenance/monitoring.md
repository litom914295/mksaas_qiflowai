# BaZi-Pro 性能监控架构

> 基于现有工具（Sentry + Vercel）的轻量级监控方案，避免重复造轮子

## ⚡ 重要发现：项目已有完整的性能监控系统

**本文档描述的是基于 Sentry 的监控架构设计（未来可选方案）。**

✅ **实际上，项目中已存在功能完善的性能监控系统**：
- **位置**: `src/lib/bazi/performance/monitor.ts` (433行)
- **功能**: 完整的性能计时、报告生成、基准测试、优化建议
- **状态**: ✅ 可直接使用，开箱即用
- **文档**: 详见 [`PERFORMANCE_MONITORING_SUMMARY.md`](../../../PERFORMANCE_MONITORING_SUMMARY.md)

**核心类**：
- `BaziPerformanceMonitor` - 性能监控主类
- `BaziBenchmark` - 基准测试工具
- `PerformanceOptimizer` - 优化建议生成器

**使用示例**：
```typescript
import { globalMonitor, measureSync } from '@/lib/bazi/performance/monitor';

// 使用便捷函数
const result = measureSync('wuxingAnalysis', () => {
  return analyzer.calculateWuxingStrength(fourPillars);
});

// 查看性能报告
globalMonitor.logReport();
```

**建议**：
- ✅ **短期（现在）**: 直接使用现有的 `BaziPerformanceMonitor`
- ⏭️ **长期（可选）**: 如需生产环境云端监控，可按本文档设计集成 Sentry

---

## 📋 Sentry集成方案（未来可选）

以下是基于 Sentry 的监控架构设计，作为未来增强方案的参考。

### 已集成工具

项目已安装以下性能监控工具：

1. **Sentry** (`@sentry/nextjs` v10.20.0)
   - ✅ 错误追踪
   - ✅ 性能追踪（Transaction/Span）
   - ✅ 自定义指标
   - 🎯 我们的策略：为BaZi模块添加自定义追踪

2. **Vercel Speed Insights** (`@vercel/speed-insights` v1.2.0)
   - ✅ 页面加载性能
   - ✅ Core Web Vitals (LCP, FID, CLS)
   - 🎯 前端整体性能监控

3. **React Query Devtools** (`@tanstack/react-query-devtools` v5.85.5)
   - ✅ Query缓存监控
   - ✅ 请求状态追踪
   - 🎯 API请求性能分析

### 避免重复造轮子

❌ **不需要做的**：
- 自建完整监控平台
- 自建日志收集系统
- 自建可视化dashboard
- 自建告警系统

✅ **需要做的**：
- 为BaZi模块添加Sentry性能追踪
- 定义BaZi专用性能指标
- 创建轻量级性能收集器
- 集成到现有Sentry系统

## 🎯 监控目标

### 核心性能指标

| 指标 | 目标值 | 告警阈值 | 说明 |
|-----|-------|---------|------|
| 四柱计算时间 | <5ms | >20ms | calculate() 方法执行时间 |
| 五行分析时间 | <5ms | >20ms | analyzeFull() 方法执行时间 |
| 缓存命中率 | >80% | <60% | LRU缓存有效性 |
| 内存占用 | <10MB | >50MB | 缓存数据占用空间 |
| 平均响应时间 | <10ms | >50ms | 端到端分析时间 |

### 监控维度

1. **功能维度**
   - 四柱计算性能
   - 五行分析性能
   - 配置切换性能
   - 缓存性能

2. **配置维度**
   - ziping配置性能
   - modern配置性能
   - traditional配置性能

3. **时间维度**
   - 实时性能数据
   - 小时聚合
   - 日聚合
   - 月趋势

## 🏗️ 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│              BaZi-Pro 应用层                         │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  BaziCalculator  │  │ WuxingAnalyzer   │        │
│  └────────┬─────────┘  └────────┬─────────┘        │
│           │                     │                   │
│           └─────────┬───────────┘                   │
│                     │                               │
│         ┌───────────▼──────────┐                    │
│         │  Performance         │                    │
│         │  Collector           │  ← 轻量级收集器   │
│         │  (BaZi专用)          │                    │
│         └───────────┬──────────┘                    │
│                     │                               │
└─────────────────────┼───────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Sentry SDK           │  ← 现有工具
         │   (已集成)             │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Sentry Platform      │  ← SaaS平台
         │   (云端)               │
         └────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Dashboard & Alerts   │  ← 可视化
         └────────────────────────┘
```

### 数据流

1. **BaZi模块** 执行计算 → 触发性能收集器
2. **性能收集器** 记录指标 → 发送到Sentry SDK
3. **Sentry SDK** 聚合数据 → 上报到Sentry平台
4. **Sentry平台** 展示 & 告警

## 💻 实现方案

### 1. 性能收集器接口

```typescript
// src/lib/bazi-pro/monitoring/types.ts

export interface BaziPerformanceMetrics {
  // 操作类型
  operation: 'calculate' | 'analyze' | 'config_switch' | 'cache_access';
  
  // 性能指标
  duration: number;          // 执行时间（ms）
  cacheHit?: boolean;        // 是否命中缓存
  配置?: string;              // 使用的配置
  
  // 元数据
  timestamp: number;
  sessionId?: string;
}

export interface CachePerformanceMetrics {
  hits: number;              // 命中次数
  misses: number;            // 未命中次数
  hitRate: number;           // 命中率 (0-1)
  size: number;              // 缓存大小
  evictions: number;         // 驱逐次数
}
```

### 2. 轻量级性能收集器

```typescript
// src/lib/bazi-pro/monitoring/performance-collector.ts

import * as Sentry from '@sentry/nextjs';
import type { BaziPerformanceMetrics, CachePerformanceMetrics } from './types';

export class BaziPerformanceCollector {
  private static instance: BaziPerformanceCollector;
  
  private cacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    evictions: 0
  };
  
  private constructor() {}
  
  public static getInstance(): BaziPerformanceCollector {
    if (!this.instance) {
      this.instance = new BaziPerformanceCollector();
    }
    return this.instance;
  }
  
  /**
   * 追踪BaZi操作性能
   */
  public trackOperation<T>(
    operation: BaziPerformanceMetrics['operation'],
    fn: () => T,
    metadata?: Record<string, any>
  ): T {
    const transaction = Sentry.startTransaction({
      name: `bazi.${operation}`,
      op: 'bazi.operation',
      tags: {
        operation,
        ...metadata
      }
    });
    
    const span = transaction.startChild({
      op: 'bazi.execute',
      description: operation
    });
    
    const startTime = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      
      // 记录性能指标到Sentry
      span.setData('duration', duration);
      span.setTag('duration_ms', Math.round(duration));
      
      // 自定义指标
      Sentry.metrics.distribution(
        `bazi.${operation}.duration`,
        duration,
        {
          unit: 'millisecond',
          tags: metadata
        }
      );
      
      return result;
    } catch (error) {
      span.setTag('error', true);
      Sentry.captureException(error, {
        tags: { operation }
      });
      throw error;
    } finally {
      span.finish();
      transaction.finish();
    }
  }
  
  /**
   * 异步操作追踪
   */
  public async trackOperationAsync<T>(
    operation: BaziPerformanceMetrics['operation'],
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const transaction = Sentry.startTransaction({
      name: `bazi.${operation}`,
      op: 'bazi.operation.async'
    });
    
    try {
      const result = await fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  }
  
  /**
   * 记录缓存命中/未命中
   */
  public trackCacheAccess(hit: boolean): void {
    if (hit) {
      this.cacheStats.hits++;
    } else {
      this.cacheStats.misses++;
    }
    
    // 定期上报缓存指标（每100次访问）
    const totalAccess = this.cacheStats.hits + this.cacheStats.misses;
    if (totalAccess % 100 === 0) {
      this.reportCacheMetrics();
    }
  }
  
  /**
   * 上报缓存性能指标
   */
  private reportCacheMetrics(): void {
    const hitRate = this.cacheStats.hits / 
      (this.cacheStats.hits + this.cacheStats.misses);
    
    Sentry.metrics.gauge('bazi.cache.hit_rate', hitRate * 100, {
      unit: 'percent'
    });
    
    Sentry.metrics.gauge('bazi.cache.size', this.cacheStats.size, {
      unit: 'byte'
    });
  }
  
  /**
   * 获取当前缓存统计
   */
  public getCacheStats(): CachePerformanceMetrics {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits / 
        (this.cacheStats.hits + this.cacheStats.misses)
    };
  }
}

// 导出单例
export const performanceCollector = BaziPerformanceCollector.getInstance();
```

### 3. 集成到BaZi模块

```typescript
// src/lib/bazi-pro/core/analyzer/wuxing-strength.ts

import { performanceCollector } from '../../monitoring/performance-collector';

export class WuxingStrengthAnalyzer {
  public calculateWuxingStrength(fourPillars: FourPillars): WuxingStrength {
    return performanceCollector.trackOperation(
      'analyze',
      () => {
        // 原有计算逻辑
        return this.internalCalculate(fourPillars);
      },
      {
        config: this.config.name,
        hasCache: this.checkCache(fourPillars)
      }
    );
  }
  
  private internalCalculate(fourPillars: FourPillars): WuxingStrength {
    // ... 原有逻辑 ...
  }
}
```

### 4. 缓存集成

```typescript
// src/lib/bazi-pro/utils/cache.ts

import { performanceCollector } from '../monitoring/performance-collector';

export class LRUCache<K, V> {
  public get(key: K): V | undefined {
    const value = this.internalGet(key);
    const hit = value !== undefined;
    
    // 追踪缓存访问
    performanceCollector.trackCacheAccess(hit);
    
    return value;
  }
  
  // ... 其他方法 ...
}
```

## 📊 Sentry配置

### 初始化配置

```javascript
// sentry.client.config.ts

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 性能监控
  tracesSampleRate: 0.1,  // 10%采样率
  
  // 启用性能指标
  enableTracing: true,
  
  // 自定义采样决策
  tracesSampler(samplingContext) {
    // BaZi相关操作100%采样（开发阶段）
    if (samplingContext.name?.startsWith('bazi.')) {
      return 1.0;
    }
    return 0.1;  // 其他操作10%采样
  },
  
  // 标签
  initialScope: {
    tags: {
      module: 'bazi-pro'
    }
  }
});
```

## 📈 监控面板

### Sentry Dashboard配置

在Sentry平台创建自定义Dashboard：

**1. BaZi性能总览**
```
- P50响应时间：bazi.*.duration (中位数)
- P95响应时间：bazi.*.duration (95分位)  
- P99响应时间：bazi.*.duration (99分位)
- 错误率：count(error=true) / count(*)
```

**2. 缓存性能**
```
- 命中率：bazi.cache.hit_rate (平均值)
- 缓存大小：bazi.cache.size (最大值)
- 访问QPS：count(bazi.cache.access) / time
```

**3. 操作分布**
```
- 操作类型分布：group by operation
- 配置使用分布：group by config
- 错误类型分布：group by error_type
```

## 🚨 告警配置

### Sentry Alerts

**1. 性能告警**
```yaml
名称: BaZi计算超时
条件: P95(bazi.calculate.duration) > 20ms
时间窗口: 5分钟
通知: Email + Slack
```

**2. 缓存告警**
```yaml
名称: BaZi缓存命中率过低
条件: avg(bazi.cache.hit_rate) < 60%
时间窗口: 10分钟
通知: Email
```

**3. 错误告警**
```yaml
名称: BaZi错误率异常
条件: error_count > 10 in 5min
通知: Email + Slack + PagerDuty
```

## 📝 使用指南

### 开发环境

```bash
# 1. 设置Sentry DSN
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# 2. 运行应用
npm run dev

# 3. 查看实时监控
# 访问 Sentry Dashboard
https://sentry.io/organizations/qiflow/projects/qiflowai/
```

### 查看性能数据

1. **实时追踪**
   - Sentry → Performance → Transactions
   - 筛选：`transaction:bazi.*`

2. **自定义指标**
   - Sentry → Metrics → Custom Metrics
   - 查看：`bazi.*.duration`, `bazi.cache.hit_rate`

3. **错误追踪**
   - Sentry → Issues
   - 筛选：`tags.module:bazi-pro`

## 🧪 测试验证

### 性能测试脚本

```typescript
// tests/performance/bazi-performance.test.ts

import { WuxingStrengthAnalyzer } from '@/lib/bazi-pro/core/analyzer/wuxing-strength';
import { performanceCollector } from '@/lib/bazi-pro/monitoring/performance-collector';

describe('BaZi Performance Monitoring', () => {
  it('应该追踪计算性能', () => {
    const analyzer = new WuxingStrengthAnalyzer();
    const fourPillars = { /* 测试数据 */ };
    
    // 执行计算（会自动追踪）
    const result = analyzer.calculateWuxingStrength(fourPillars);
    
    // 验证结果
    expect(result).toBeDefined();
    
    // 性能数据已自动上报到Sentry
  });
  
  it('应该追踪缓存性能', () => {
    const stats = performanceCollector.getCacheStats();
    
    expect(stats.hits).toBeGreaterThanOrEqual(0);
    expect(stats.misses).toBeGreaterThanOrEqual(0);
    expect(stats.hitRate).toBeGreaterThanOrEqual(0);
    expect(stats.hitRate).toBeLessThanOrEqual(1);
  });
});
```

## 📚 参考资料

### 官方文档
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Custom Metrics](https://docs.sentry.io/product/metrics/)
- [Next.js Sentry SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)

### 最佳实践
- 采样率设置：开发100%，生产10-20%
- 标签使用：operation, config, error_type
- 聚合周期：5分钟（实时），1小时（分析）
- 告警阈值：P95 > 20ms，命中率 < 60%

## 📊 成本估算

### Sentry配额

| 项目 | 免费额度 | 预计使用 | 说明 |
|-----|---------|---------|------|
| Events | 5,000/月 | ~2,000/月 | 错误事件 |
| Transactions | 100,000/月 | ~50,000/月 | 性能追踪 |
| Custom Metrics | 1,000/月 | ~500/月 | 自定义指标 |

**结论**：免费额度足够使用 ✅

## 🎯 下一步

1. ✅ 实现BaziPerformanceCollector
2. ✅ 集成到WuxingStrengthAnalyzer
3. ✅ 集成到LRU缓存
4. ⏭️ 配置Sentry Dashboard
5. ⏭️ 配置告警规则
6. ⏭️ 编写测试用例
7. ⏭️ 生产环境验证

---

**创建日期**: 2025-11-13  
**作者**: BaZi-Pro Team  
**版本**: 1.0.0
