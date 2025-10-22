# Traffic Switcher 使用说明（多可用区切流/回滚）

本模块基于 NGINX Ingress Canary 实现“主->备”分区（AZ）之间的受控流量切换，提供可观测性与告警规则。

## 组件清单
- k8s/deployment-dr.yaml：灾备工作负载与 Service（az-b 亲和）
- k8s/ingress-canary.yaml：Canary Ingress（指向 mksaas-service-dr，初始权重 0）
- k8s/traffic-switcher.yaml：切流服务 SA/RBAC/Deployment/Service/ServiceMonitor（镜像占位）
- k8s/prometheusrule-traffic-switcher.yaml：PrometheusRule 告警

## 部署
```bash
kubectl apply -f k8s/deployment-dr.yaml
kubectl apply -f k8s/ingress-canary.yaml
kubectl apply -f k8s/traffic-switcher.yaml
kubectl apply -f k8s/prometheusrule-traffic-switcher.yaml
```

注意：traffic-switcher 的镜像需先构建并推送，然后在 Deployment 中替换为实际镜像。

## 切流
- 权重范围 0-100，代表导入 DR 的百分比。
- 直接通过 NGINX Ingress 注解实现：
```bash
kubectl -n mksaas patch ingress mksaas-ingress-canary \
  --type merge -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"25"}}}'
```

若已部署 traffic-switcher（假设 Node/TS/或Python 服务暴露 /switch）：
```bash
curl -X POST http://traffic-switcher.mksaas.svc.cluster.local/switch \
  -H 'Content-Type: application/json' \
  -d '{"canary_weight":25}'
```

## 验证
- 访问业务域名并观察实际流量（可通过后端日志 / DR Pod 日志验证）。
- Prometheus 指标：
  - traffic_switch_weight
  - traffic_switch_events_total
- Grafana 可视化与告警：
  - 已提供 PrometheusRule。
  - 已提供 Grafana 仪表盘：monitoring/grafana/dashboards/traffic_switcher.json（docker 本地可通过 monitoring/docker-compose.yml 自动加载）。

## 回滚
```bash
kubectl -n mksaas patch ingress mksaas-ingress-canary \
  --type merge -p '{"metadata":{"annotations":{"nginx.ingress.kubernetes.io/canary-weight":"0"}}}'
```

## 常见问题
- 若集群未安装 Prometheus Operator，ServiceMonitor/PrometheusRule 将不生效，但不影响其余资源。
- 节点分区标签请确认为 topology.kubernetes.io/zone=az-a/az-b，如不一致请修改 deployment-dr.yaml。

## 本地联调（docker-compose）
```bash
cd monitoring
# 启动 Prometheus/Grafana/traffic-switcher
docker compose up -d
# Prometheus: http://localhost:9090  Grafana: http://localhost:3000 (admin/admin)
```
