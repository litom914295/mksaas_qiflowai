# traffic-switcher 微服务（TypeScript）

一个用于多 AZ 灾备切流/回滚的轻量服务：
- API：/healthz, /metrics, /status, /switch
- 指标：traffic_switch_events_total, traffic_switch_weight
- 依赖：Kubernetes API 权限（patch/read Ingress）

## 本地运行
```bash
cd services/traffic-switcher
npm i
npm run dev
```

## 构建镜像
```bash
# 替换镜像仓库名称
export IMAGE=your-registry/traffic-switcher:0.1.0
npm ci
npm run build
docker build -t $IMAGE .
docker push $IMAGE
```

将 k8s/traffic-switcher.yaml 中的镜像替换为上面的镜像标签并 `kubectl apply`。

## 环境变量
- NAMESPACE（默认 qiflowai）
- CANARY_INGRESS_NAME（默认 qiflowai-ingress-canary）
- DEFAULT_HOST（默认 your-domain.com）
- PORT（默认 8080）

## API 示例
```bash
# 查询
curl http://localhost:8080/status

# 切流到 25%
curl -X POST http://localhost:8080/switch -H 'Content-Type: application/json' -d '{"canary_weight":25}'

# 干跑（不落地）
curl -X POST http://localhost:8080/switch -H 'Content-Type: application/json' -d '{"canary_weight":50, "dry_run": true}'
```
