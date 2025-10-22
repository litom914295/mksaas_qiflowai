# 端到端 SLA 与验收规范（P0-9）

本规范定义最小可用闭环（采集→计算→Agent→下单→风控→回报）的服务等级目标（SLO）、观测指标（SLI）、误差预算与验收标准。

## 1. 目标对象
- 用户面 HTTP API（网关/Next.js 后端路由）
- 核心业务链路（信号生成、推荐/下单、风控校验、回报）
- 依赖与基础设施（DB/Redis/消息/外部服务）

## 2. SLI & SLO
- 请求延迟 P95
  - SLI: http_request_duration_seconds_bucket 计算的 0.95 分位
  - SLO: P95 ≤ 1s（稳定期连续 7 天）
  - PromQL: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
- 可用性
  - SLI: 5xx 比率
  - SLO: 1 - error_rate ≥ 99.9%
  - PromQL: 1 - (sum(rate(http_requests_total{status!~"2..|3.."}[5m])) / sum(rate(http_requests_total[5m])))
- 错误率
  - SLI: 5xx / 全部请求
  - SLO: ≤ 1%（滑窗 5m）
  - PromQL: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))
- 信号覆盖率
  - SLI: business_signal_coverage_ratio（0~1）
  - SLO: ≥ 0.8（滑窗 15m 最小值）
  - PromQL: min_over_time(business_signal_coverage_ratio[15m])
- 故障切换 RTO
  - SLI: failover_last_duration_seconds
  - SLO: ≤ 300s（单次事件）
  - PromQL: max_over_time(failover_last_duration_seconds[1h])

## 3. 误差预算
- 可用性 SLO 99.9% → 月度误差预算 ≈ 43.2 分钟
- 当预算消耗超过 25%/50%/75% 时触发黄/橙/红告警与治理动作

## 4. 验收范围
- 功能闭环：从请求到成功回报的端到端路径
- 性能验收：并发 N=100、RPS≥目标、P95≤1s
- 稳定性：5xx ≤ 1%，可用性 ≥ 99.9%
- 降级与回滚：故障时 5 分钟内完成切换与恢复

## 5. 观测与看板
- Prometheus 指标：HTTP 延迟、错误率、覆盖率、故障切换时长
- Grafana 看板：SLA 总览（P95、可用性、错误率、覆盖率、RTO）
- 告警矩阵：sla_alerts（critical/page、warning/ticket）

## 6. 验收方法
1) 运行 E2E 验收测试（tests/e2e/sla）
2) 检查 Prometheus 告警无触发；Grafana 看板指标达标
3) 出具《闭环SLA验收报告》（模板：docs/sla/ACCEPTANCE_REPORT.md）

## 7. 配置项（建议）
- 指标前缀：prom-client 默认 http_*；业务覆盖率 business_signal_coverage_ratio
- 抓取路径：/api/metrics 或 /metrics
- 采集间隔：5~30s；评估窗口：5m/15m/1h
