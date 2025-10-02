# 限流与配额策略（v5.1）
- 用户级：`/analysis/*` 60 req/min；流式 token 回传 ≤ 1000 tok/s
- 资源级：罗盘校准 5/min；导出 3/min
- 429 处理：`Retry-After` + 指数退避（1s,2s,4s,8s，最大 30s）
- 熔断：连续 5 次 5xx 进入降级（拒答/回退模型）
