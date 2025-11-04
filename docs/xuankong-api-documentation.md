# 玄空风水API文档 v6.0

## 📋 目录

- [概述](#概述)
- [API端点](#api端点)
  - [诊断分析](#诊断分析)
  - [化解方案](#化解方案)
  - [综合分析](#综合分析)
  - [性能监控](#性能监控)
- [性能基准](#性能基准)
- [最佳实践](#最佳实践)
- [错误处理](#错误处理)
- [测试指南](#测试指南)

---

## 概述

玄空风水API提供三个核心分析端点和一个性能监控端点，支持飞星盘生成、诊断分析、化解方案生成以及综合分析。

### 特性

- ✅ 五级诊断预警系统（critical / high / medium / low / safe）
- ✅ 多级化解方案（基础 / 标准 / 高级）
- ✅ 八字与风水融合分析
- ✅ 关键方位智能评估
- ✅ RESTful API设计
- ✅ 请求缓存和性能优化
- ✅ 实时性能监控

### 基础URL

```
生产环境: https://api.qiflowai.com
开发环境: http://localhost:3000
```

---

## API端点

### 诊断分析

#### POST /api/xuankong/diagnose

生成五级诊断预警，分析风水问题严重程度。

**请求参数**

```typescript
{
  facing: number;              // 必需 - 房屋朝向角度 (0-360)
  buildYear: number;           // 必需 - 建造年份
  location?: {                 // 可选 - 地理位置
    lat: number;               // 纬度
    lng: number;               // 经度
  };
  includeSafeAreas?: boolean;  // 可选 - 是否包含安全区域 (默认: true)
  severityThreshold?: string;  // 可选 - 严重程度阈值 (默认: 'low')
                              // 'critical' | 'high' | 'medium' | 'low'
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": "alert-0",
        "severity": "high",
        "title": "五黄煞气",
        "description": "中宫出现五黄凶星，主疾病、灾祸",
        "affectedArea": "中宫",
        "issue": "五黄煞气影响健康",
        "impact": {
          "health": 8,
          "wealth": 3,
          "career": 4,
          "relationship": 2
        },
        "score": 35,
        "recommendations": [
          "放置铜葫芦化解",
          "避免动土",
          "保持区域安静"
        ],
        "urgency": "soon"
      }
    ],
    "stats": {
      "total": 9,
      "critical": 1,
      "high": 2,
      "medium": 3,
      "low": 2,
      "safe": 1,
      "avgScore": 62
    },
    "plate": {
      "period": 9,
      "facing": 180,
      "specialPatterns": ["七运旺星到向"]
    }
  },
  "meta": {
    "timestamp": "2025-01-13T08:00:00.000Z",
    "version": "6.0",
    "cached": false
  }
}
```

**性能基准**

- 单请求目标: < 2秒
- 并发10请求: P95 < 5秒
- 成功率: > 99%

---

### 化解方案

#### POST /api/xuankong/remedy-plans

根据诊断问题生成多级化解方案。

**请求参数**

```typescript
{
  issue: string;              // 必需 - 问题描述
  palace: string;             // 必需 - 受影响宫位
  severity?: string;          // 可选 - 严重程度 (默认: 'medium')
  context?: {                 // 可选 - 额外上下文
    roomType?: string;        // 房间类型
    currentLayout?: string;   // 当前布局
    userPreferences?: object; // 用户偏好
  };
  budget?: {                  // 可选 - 预算限制
    min: number;
    max: number;
  };
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "basic-1",
        "level": "basic",
        "name": "基础化解方案",
        "description": "简单有效的基础化解方法",
        "cost": {
          "min": 100,
          "max": 500,
          "currency": "元"
        },
        "timeline": {
          "preparation": "1-2天",
          "implementation": "3-5天",
          "total": "7天"
        },
        "difficulty": "easy",
        "effectiveness": 70,
        "materials": [
          {
            "name": "铜葫芦",
            "quantity": "2个",
            "purpose": "化解五黄煞气",
            "optional": false,
            "estimatedCost": 80
          }
        ],
        "steps": [
          {
            "order": 1,
            "title": "准备物品",
            "description": "购买铜葫芦和红布",
            "duration": "1小时",
            "tips": ["选择纯铜材质", "尺寸适中即可"]
          }
        ],
        "precautions": ["避免金属过敏者接触"],
        "expectedResults": ["症状明显减轻", "环境能量改善"],
        "maintenanceFrequency": "每月检查一次"
      }
    ],
    "comparison": {
      "cost": [...],
      "timeline": [...],
      "effectiveness": [...]
    },
    "meta": {
      "issue": "五黄煞气",
      "palace": "中宫",
      "severity": "high",
      "totalPlans": 3
    }
  },
  "meta": {
    "timestamp": "2025-01-13T08:00:00.000Z",
    "version": "6.0"
  }
}
```

**性能基准**

- 单请求目标: < 2秒
- 并发10请求: P95 < 5秒

---

### 综合分析

#### POST /api/xuankong/comprehensive-analysis

一站式风水分析服务，整合所有分析功能。

**请求参数**

```typescript
{
  facing: number;                  // 必需
  buildYear: number;               // 必需
  location?: {                     // 可选
    lat: number;
    lng: number;
  };
  userProfile?: {                  // 可选 - 用于关键方位分析
    bazi: {
      year: { stem: string; branch: string; };
      month: { stem: string; branch: string; };
      day: { stem: string; branch: string; };
      hour: { stem: string; branch: string; };
    };
    priorities?: string[];         // 如 ['wealth', 'health']
  };
  context?: object;                // 可选
  includeSafeAreas?: boolean;      // 可选
  severityThreshold?: string;      // 可选
}
```

**响应示例**

```json
{
  "success": true,
  "data": {
    "plate": {
      "period": 9,
      "facing": 180,
      "specialPatterns": [],
      "palaces": { ... }
    },
    "diagnosis": {
      "alerts": [ ... ],
      "stats": { ... }
    },
    "remedies": {
      "plans": {
        "中宫": [ ... ],
        "西北": [ ... ]
      },
      "stats": {
        "totalIssues": 3,
        "totalPlans": 9,
        "avgCostPerIssue": 2500
      }
    },
    "keyPositions": {
      "wealth": { ... },
      "academic": { ... },
      "romance": { ... }
    },
    "priorities": [
      {
        "type": "critical_issue",
        "area": "中宫",
        "title": "五黄煞气",
        "action": "立即处理",
        "urgency": "immediate"
      }
    ],
    "overallScore": 65,
    "recommendation": "风水状况一般，建议制定系统化的改善计划"
  },
  "meta": {
    "timestamp": "2025-01-13T08:00:00.000Z",
    "version": "6.0",
    "analysisType": "comprehensive"
  }
}
```

**性能基准**

- 单请求目标: < 5秒
- 并发5请求: P95 < 12秒

---

### 性能监控

#### GET /api/performance/stats

获取实时性能统计和系统健康状态。

**查询参数**

- `endpoint` (可选): 特定端点名称
- `format` (可选): 响应格式 (`json` | `html`)

**JSON响应示例**

```json
{
  "success": true,
  "data": {
    "performance": [
      {
        "endpoint": "/api/xuankong/diagnose",
        "count": 150,
        "successRate": 99.3,
        "avgDuration": 1850,
        "minDuration": 1200,
        "maxDuration": 3500,
        "p50": 1750,
        "p95": 2800,
        "p99": 3200
      }
    ],
    "cache": {
      "hits": 45,
      "misses": 105,
      "hitRate": "30.00%",
      "size": 42,
      "evictions": 3
    },
    "system": {
      "uptime": 3600,
      "memory": {
        "heapUsed": "85.32 MB",
        "heapTotal": "128.50 MB",
        "heapUsagePercent": "66.40%",
        "rss": "150.20 MB"
      },
      "platform": "win32",
      "nodeVersion": "v18.17.0"
    },
    "health": {
      "score": 88,
      "status": "good",
      "recommendations": [
        "系统运行状态良好，继续保持！"
      ]
    }
  },
  "meta": {
    "timestamp": "2025-01-13T08:00:00.000Z",
    "endpoint": "all"
  }
}
```

**HTML仪表板**

访问 `/api/performance/stats?format=html` 查看可视化仪表板，包含：

- 系统健康评分（0-100）
- 各端点性能图表
- 缓存命中率统计
- 内存使用监控
- 优化建议列表

---

## 性能基准

### 目标性能指标

| 端点 | 单请求 | P95 | P99 | 成功率 |
|------|--------|-----|-----|---------|
| 诊断分析 | < 2s | < 4s | < 5s | > 99% |
| 化解方案 | < 2s | < 4s | < 5s | > 99% |
| 综合分析 | < 5s | < 10s | < 12s | > 98% |

### 并发处理能力

- 诊断/化解方案: 可处理10+ 并发请求
- 综合分析: 可处理5+ 并发请求

### 缓存效率

- 目标命中率: > 50%
- 缓存容量: 200条目
- TTL: 5分钟

---

## 最佳实践

### 1. 请求优化

#### 使用缓存

相同参数的请求会自动缓存5分钟。重复请求相同配置时会显著提升速度。

```typescript
// 首次请求
const result1 = await fetch('/api/xuankong/diagnose', {
  method: 'POST',
  body: JSON.stringify({ facing: 180, buildYear: 2020 })
});
// meta.cached: false, 耗时 ~2000ms

// 5分钟内重复请求
const result2 = await fetch('/api/xuankong/diagnose', {
  method: 'POST',
  body: JSON.stringify({ facing: 180, buildYear: 2020 })
});
// meta.cached: true, 耗时 ~50ms
```

#### 避免不必要的参数

只传递必需参数以获得更快响应：

```typescript
// ✅ 推荐 - 仅必需参数
{
  facing: 180,
  buildYear: 2020
}

// ❌ 避免 - 不必要的可选参数
{
  facing: 180,
  buildYear: 2020,
  location: { lat: 39.9042, lng: 116.4074 },
  includeSafeAreas: true,
  severityThreshold: 'low',
  userProfile: { /* 大量数据 */ }
}
```

### 2. 错误处理

#### 实现重试逻辑

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return await response.json();
      }
      
      if (response.status === 400) {
        // 参数错误，不重试
        throw new Error('Invalid parameters');
      }
      
      // 5xx错误，重试
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        continue;
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

#### 优雅降级

```typescript
try {
  // 尝试完整分析
  const result = await fetch('/api/xuankong/comprehensive-analysis', { ... });
  return result;
} catch (error) {
  // 降级到基础诊断
  console.warn('Full analysis failed, falling back to basic diagnosis');
  return await fetch('/api/xuankong/diagnose', { ... });
}
```

### 3. 性能监控

#### 客户端性能追踪

```typescript
const startTime = Date.now();

const response = await fetch('/api/xuankong/diagnose', {
  method: 'POST',
  body: JSON.stringify(payload)
});

const duration = Date.now() - startTime;

// 记录到分析系统
analytics.track('api_call', {
  endpoint: '/api/xuankong/diagnose',
  duration,
  success: response.ok,
  cached: response.meta?.cached
});

// 如果响应慢，发送警告
if (duration > 5000) {
  console.warn(`Slow API response: ${duration}ms`);
}
```

#### 定期健康检查

```typescript
// 每5分钟检查一次系统健康
setInterval(async () => {
  const health = await fetch('/api/performance/stats').then(r => r.json());
  
  if (health.data.health.score < 60) {
    notifyAdmin(`System health degraded: ${health.data.health.score}`);
  }
}, 5 * 60 * 1000);
```

### 4. 批量处理

对于多个分析请求，使用并发控制：

```typescript
async function batchAnalyze(configs: Array<{facing: number, buildYear: number}>) {
  const concurrency = 5; // 同时最多5个请求
  const results = [];
  
  for (let i = 0; i < configs.length; i += concurrency) {
    const batch = configs.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(config => 
        fetch('/api/xuankong/diagnose', {
          method: 'POST',
          body: JSON.stringify(config)
        }).then(r => r.json())
      )
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

---

## 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": "错误类型描述",
  "message": "详细错误信息"
}
```

### HTTP状态码

| 状态码 | 含义 | 说明 |
|--------|------|------|
| 200 | 成功 | 请求处理成功 |
| 400 | 参数错误 | 缺少必需参数或参数类型错误 |
| 500 | 服务器错误 | 内部处理错误 |
| 503 | 服务不可用 | 服务暂时不可用，建议重试 |

### 常见错误

#### 400 - 缺少必需参数

```json
{
  "success": false,
  "error": "缺少或无效的朝向参数 (facing)"
}
```

**解决方法**: 检查请求体是否包含所有必需字段。

#### 400 - 参数类型错误

```json
{
  "success": false,
  "error": "缺少或无效的朝向参数 (facing)"
}
```

**解决方法**: 确保参数类型正确（facing 和 buildYear 必须是number）。

#### 500 - 服务器错误

```json
{
  "success": false,
  "error": "诊断分析失败",
  "message": "详细错误信息"
}
```

**解决方法**: 检查日志，如果是暂时性错误可重试。

---

## 测试指南

### 运行测试

#### 集成测试

```bash
# 启动开发服务器
npm run dev

# 在另一个终端运行测试
npm test -- xuankong-api.test.ts
```

#### 性能测试

```bash
# 运行性能基准测试
npm test -- xuankong-performance.test.ts

# 启用垃圾回收监控
node --expose-gc node_modules/.bin/jest xuankong-performance.test.ts
```

### 测试覆盖范围

✅ **集成测试** (27个测试用例)
- 成功场景验证
- 参数验证
- 错误处理
- 边界条件
- 数据完整性
- 性能基准

✅ **性能测试** (6个测试类别)
- 单请求响应时间
- 并发处理能力
- 连续请求稳定性
- 内存泄漏检测
- 参数复杂度影响
- 缓存效果验证

### 性能测试结果示例

```
━━━ 性能报告: /api/xuankong/diagnose ━━━
请求总数: 20
成功: 20 | 失败: 0
响应时间 (ms):
  平均: 1845.50
  最小: 1205.00
  最大: 2890.00
  P50: 1780.00
  P95: 2650.00
  P99: 2850.00
内存使用 (MB):
  堆使用: 78.45
  堆总量: 125.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 更新日志

### v6.0 (2025-01-13)

#### 新增功能
- ✨ 添加性能监控仪表板
- ✨ 实现LRU缓存机制
- ✨ 添加性能中间件
- ✨ 支持HTML可视化仪表板

#### 性能优化
- ⚡ 请求缓存（5分钟TTL）
- ⚡ 函数记忆化
- ⚡ 并行处理优化
- ⚡ 资源池管理

#### 测试
- 🧪 新增27个集成测试用例
- 🧪 新增性能基准测试
- 🧪 内存泄漏检测
- 🧪 并发压力测试

---

## 技术支持

### 联系方式

- 📧 Email: support@qiflowai.com
- 💬 微信: qiflowai
- 📚 文档: https://docs.qiflowai.com

### 问题反馈

请在 GitHub Issues 中提交问题，并附带：

1. 请求参数
2. 完整错误消息
3. 复现步骤
4. 环境信息

---

© 2025 QiFlowAI. All rights reserved.
