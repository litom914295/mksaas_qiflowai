# mTLS 证书管理与落地指南（P0-2）

本指南描述客户端→Ingress 及内部服务间的 mTLS 能力落地方案、监控与轮换策略。

## 目标
- 在边界入口启用客户端证书校验，阻断未授权调用
- 证书自动化管理：签发、监控到期、告警与轮换
- 与现有 cert-manager 服务器证书共存（外部 HTTPS 仍由 cert-manager 管理）

## 架构概览
- 公网入口：NGINX Ingress 终止 TLS（cert-manager 管理），并启用“客户端证书校验（mTLS）”
- 客户端：持有由我方 Root CA 签发的客户端证书/私钥
- 监控：Prometheus 抓取证书到期指标，Grafana 看板+告警

## 目录与文件
- k8s/deployment.yaml：已为 Ingress 启用 mTLS 注解
- k8s/mtls/mtls-ca-secret.yaml：Root CA Secret 模板（供 Ingress 校验客户端证书）
- k8s/mtls/cert-exporter.yaml：证书到期导出器（读取 K8s Secret 中的 tls.crt）
- tools/mtls/cert_manager.py：证书签发/检查/轮换/导出器
- monitoring/prometheus/prometheus.yml：新增抓取 mtls-cert-exporter
- monitoring/prometheus/alerts.yml：新增证书到期与轮换失败告警组

## 操作步骤
1) 生成 Root CA（仅一次）
```
python tools/mtls/cert_manager.py init-ca --ca-key secrets/ca/ca.key --ca-crt secrets/ca/ca.crt
```

2) 创建 Ingress 校验用 CA Secret（填充 base64 后应用）
```
# Windows 示例（PowerShell）
# [Convert]::ToBase64String([IO.File]::ReadAllBytes("secrets/ca/ca.crt"))
# 将输出粘贴到 k8s/mtls/mtls-ca-secret.yaml 的 ca.crt 字段
kubectl apply -f k8s/mtls/mtls-ca-secret.yaml
```

3) 签发客户端证书并分发给可信客户端
```
python tools/mtls/cert_manager.py issue \
  --ca-key secrets/ca/ca.key --ca-crt secrets/ca/ca.crt \
  --client --cn client-001 \
  --out-key out/client-001.key --out-crt out/client-001.crt
```
客户端访问需携带证书/私钥（示例：curl --cert client-001.crt --key client-001.key https://your-domain.com）。

4) 启用 Ingress mTLS（已在 k8s/deployment.yaml 中加入注解）
- nginx.ingress.kubernetes.io/auth-tls-secret: qiflowai/mtls-ca
- nginx.ingress.kubernetes.io/auth-tls-verify-client: on
- nginx.ingress.kubernetes.io/auth-tls-pass-certificate-to-upstream: true

5) 部署证书到期导出器并接入 Prometheus
```
kubectl apply -f k8s/mtls/cert-exporter.yaml
```
Prometheus 已新增 job: mtls-cert-exporter；Grafana 可用 SLA/安全看板添加 x509_cert_expires_in_seconds。

6) 告警
- CertificateExpiresSoon/Critical：7天/3天内到期预警
- CertRotationFailures：证书轮换失败

7) 轮换策略
- 公网服务证书：由 cert-manager 自动续期，无需本工具干预
- 客户端证书：使用 tools/mtls/cert_manager.py rotate/issue 周期性更新并分发
  - rotate 示例（本地输出）：
    - python tools/mtls/cert_manager.py rotate --cn client-001 --client \
      --ca-key secrets/ca/ca.key --ca-crt secrets/ca/ca.crt \
      --out-key out/client-001.key --out-crt out/client-001.crt \
      --threshold-days 14

8) 安全建议
- Root CA 严格访问控制，放置在独立安全仓/密钥管理系统
- 客户端证书最短可用期、吊销列表与双证书过渡（信任双CA Bundle）
- 服务间 mTLS 建议采用 Service Mesh（Istio/Linkerd）统一下沉
