# API 合同（v5.1）
> 统一错误结构参见 @ERROR_CATALOG_v5.1.md；限流策略参见 @RATE_LIMITING_POLICY_v5.1.md。

## 通用
- Auth：Bearer + Better Auth 会话
- Headers：`x-trace-id`、`x-coins-spent`
- 错误：`{ code, message, hint, traceId }`

## 示例：启动玄空分析
```
POST /api/analysis/xuankong
{
  "input": { "dob":"1990-01-01","tz":"+10:00","calendar":"lunar","sitting":"S2","facing":"N2" }
}
→ 200 { "jobId":"...", "estimateCoins": 20 }
→ 429 { "code":"RATE_LIMITED", "retryAfter": 30 }
```
