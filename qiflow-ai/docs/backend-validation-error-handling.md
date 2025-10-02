# QiFlow AI - 后端验证逻辑和错误处理系统

## 概述

本文档介绍了为 QiFlow AI 八字风水对话系统新增的完整后端验证逻辑和错误处理机制。该系统提供了统一的错误类型、输入验证、重试机制和故障降级功能。

## 核心组件

### 1. 统一错误类型系统 (`src/types/api-errors.ts`)

```typescript
// 定义了标准化的错误代码和响应格式
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  // ... 更多错误类型
}

// 统一的API响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorDetails;
  metadata: {
    requestId: string;
    timestamp: string;
    version: string;
  };
}
```

### 2. 输入验证系统 (`src/lib/validation/input-validation.ts`)

```typescript
// 基于 Zod 的类型安全验证
export const chatRequestSchema = z.object({
  userId: z.string().min(1).max(256),
  message: z.string().min(1).max(10000),
  sessionId: z.string().optional(),
  // ... 更多字段
});

// 使用示例
const validatedData = await validateRequest(
  chatRequestSchema,
  requestBody,
  traceId
);
```

### 3. 重试机制 (`src/lib/utils/retry-utils.ts`)

```typescript
// 灵活的重试策略
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  // 支持指数退避、熔断器模式等
}

// 预配置的重试策略
export const DATABASE_RETRY_CONFIG: Partial<RetryOptions> = {
  retries: 3,
  delay: 500,
  backoff: 'exponential',
  shouldRetry: error => isRetryableError(error),
};
```

### 4. 增强的连接管理

#### Redis 连接 (`src/lib/redis/connection.ts`)

- 自动重试和故障降级
- 内存备用存储
- 连接健康监控
- 熔断器保护

#### Supabase 连接 (`src/lib/database/supabase-server.ts`)

- 连接池管理
- 查询重试机制
- 性能指标收集
- 安全配置验证

### 5. 状态机容错机制 (`src/lib/ai/state-machine.ts`)

```typescript
// 增强的状态机包含：
// - 状态验证和边界检查
// - 生命周期钩子错误处理
// - 性能指标收集
// - 故障恢复机制
```

## API 使用示例

### 1. 基础聊天API (`/api/chat`)

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "x-qiflow-trace: test-trace-123" \
  -d '{
    "userId": "user_123",
    "message": "请帮我分析八字命理",
    "sessionId": "session_abc",
    "locale": "zh-CN"
  }'
```

**成功响应：**

```json
{
  "success": true,
  "data": {
    "sessionId": "session_abc",
    "reply": { "content": "分析结果..." },
    "confidence": 0.85,
    "usage": {
      "totalTokens": 150,
      "costUsd": 0.003
    }
  },
  "metadata": {
    "requestId": "chat_1234567890_abc123",
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0",
    "executionTime": 1250
  }
}
```

**错误响应：**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求数据验证失败",
    "details": {
      "validationErrors": [
        {
          "field": "message",
          "message": "消息内容不能为空",
          "code": "too_small"
        }
      ]
    },
    "retryable": false,
    "category": "validation"
  },
  "metadata": {
    "requestId": "chat_1234567890_abc123",
    "timestamp": "2025-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
```

### 2. 增强聊天API (`/api/chat/enhanced-complete`)

```bash
curl -X POST http://localhost:3001/api/chat/enhanced-complete \
  -H "Content-Type: application/json" \
  -H "x-qiflow-trace: test-trace-456" \
  -d '{
    "userId": "user_123",
    "message": "我想了解风水布局建议",
    "config": {
      "enableFengShuiAnalysis": true,
      "responseStyle": "detailed",
      "explanationLevel": "expert"
    }
  }'
```

**成功响应包含性能指标：**

```json
{
  "success": true,
  "data": {
    "sessionId": "enhanced_session_123",
    "algorithmResults": [...],
    "confidence": 0.92,
    "performanceMetrics": {
      "databaseResponseTime": 45,
      "redisResponseTime": 12,
      "aiServiceResponseTime": 890,
      "totalProcessingTime": 1250
    }
  }
}
```

### 3. 系统健康检查 (`/api/health/enhanced`)

```bash
curl -X GET http://localhost:3001/api/health/enhanced
```

**响应：**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": {
        "status": "healthy",
        "responseTime": 45,
        "metrics": {
          "successfulQueries": 1250,
          "averageQueryTime": 42.5
        }
      },
      "redis": {
        "status": "healthy",
        "responseTime": 8,
        "metrics": {
          "isConnected": true,
          "fallbackEntriesCount": 0
        }
      }
    },
    "summary": {
      "overallHealth": 1.0,
      "healthyServices": 2,
      "unhealthyServices": 0
    }
  }
}
```

## 错误处理最佳实践

### 1. 客户端错误处理

```typescript
async function callChatAPI(message: string, userId: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-qiflow-trace': generateTraceId(),
      },
      body: JSON.stringify({
        userId,
        message,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      // 处理业务错误
      if (result.error.code === 'RATE_LIMIT_EXCEEDED') {
        showNotification('请求过于频繁，请稍后再试');
        return;
      }

      if (result.error.retryable) {
        // 可重试错误，显示重试按钮
        showRetryOption();
        return;
      }

      // 其他错误
      showError(result.error.message);
      return;
    }

    // 处理成功响应
    return result.data;
  } catch (error) {
    // 处理网络错误
    console.error('Network error:', error);
    showError('网络连接失败，请检查网络设置');
  }
}
```

### 2. 服务端错误处理

```typescript
// 在 API 路由中使用统一错误处理
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const traceId = request.headers.get('x-qiflow-trace') || requestId;

  try {
    // 验证输入
    const body = await validateRequest(
      chatRequestSchema,
      await request.json(),
      traceId
    );

    // 业务逻辑处理
    const result = await withRetry(
      () => processMessage(body),
      AI_SERVICE_RETRY_CONFIG
    );

    return NextResponse.json(createSuccessResponse(result, requestId));
  } catch (error) {
    // 统一错误处理
    if (error instanceof QiFlowApiError) {
      return NextResponse.json(error.toApiResponse(requestId), {
        status: getHttpStatusFromErrorCode(error.code),
      });
    }

    return NextResponse.json(
      createInternalError('服务器内部错误', error, traceId).toApiResponse(
        requestId
      ),
      { status: 500 }
    );
  }
}
```

## 监控和调试

### 1. 日志格式

所有关键操作都会产生结构化日志：

```typescript
console.log('[ChatAPI] Request processing:', {
  requestId: 'chat_1234567890_abc',
  traceId: 'trace_xyz',
  userId: 'user_123',
  executionTime: 1250,
  performanceMetrics: { ... }
});
```

### 2. 错误追踪

每个请求都有唯一的 `requestId` 和可选的 `traceId`，方便问题追踪：

```bash
# 查找特定请求的所有日志
grep "chat_1234567890_abc" /var/log/qiflow-ai.log

# 查找特定用户的错误
grep "user_123.*ERROR" /var/log/qiflow-ai.log
```

### 3. 性能监控

系统提供详细的性能指标：

- 数据库查询时间
- Redis 操作延迟
- AI 服务响应时间
- 总体处理时间

## 配置说明

### 环境变量

```bash
# 重试配置
REDIS_MAX_RETRIES_PER_REQUEST=3
DATABASE_RETRY_ATTEMPTS=3

# 熔断器配置
CIRCUIT_BREAKER_FAILURE_THRESHOLD=5
CIRCUIT_BREAKER_RECOVERY_TIMEOUT=60000

# 日志级别
LOG_LEVEL=info
```

### 默认重试策略

- **数据库操作**: 3次重试，指数退避，最大延迟5秒
- **Redis操作**: 2次重试，指数退避，最大延迟2秒
- **AI服务调用**: 2次重试，指数退避，最大延迟10秒，30秒超时

## 总结

新的错误处理系统提供了：

1. **统一的错误格式**: 所有API响应遵循相同的格式规范
2. **类型安全的验证**: 基于Zod的输入验证，确保数据完整性
3. **智能重试机制**: 根据错误类型自动重试，支持多种退避策略
4. **故障降级**: Redis失败时使用内存备用，数据库失败时优雅降级
5. **全面监控**: 详细的性能指标和健康检查
6. **开发友好**: 清晰的错误信息和调试工具

这套系统大大提升了应用的稳定性和可维护性，为生产环境部署奠定了坚实基础。
