# mTLS 吊销与外部授权集成指南

本指南描述如何在 Ingress mTLS 基础上增加“外部授权 (auth_request)”实现证书吊销校验、灰度放行与审计。

## 组件
- k8s/mtls/authz.yaml：授权服务，基于 FastAPI，读取 ConfigMap 中的吊销列表
- Ingress 注解：auth-url/auth-snippet 将客户端证书信息通过请求头传给授权服务
- 观测：通过 NGINX 日志与授权服务日志审计被拒绝请求

## 使用步骤
1) 部署授权服务
```
kubectl apply -f k8s/mtls/authz.yaml
```

2) 更新 Ingress（已写入 k8s/deployment.yaml）
- nginx.ingress.kubernetes.io/auth-url: http://mtls-authz.qiflowai.svc.cluster.local:8080/authorize
- nginx.ingress.kubernetes.io/auth-snippet: 传递 $ssl_client_* 头部
- nginx.ingress.kubernetes.io/auth-response-headers: X-Authz-User, X-Authz-Serial

3) 管理吊销列表
```
# 编辑并下发吊销序列号（逐行）
kubectl -n qiflowai edit configmap mtls-authz-config
# 修改后授权服务自动热加载（默认30秒）
```

4) 验证
- 使用被吊销序列号的客户端证书发起请求，应返回 403
- 正常证书返回 200，且上游可收到 X-Authz-User/X-Authz-Serial

## 与 cert-manager 集成（内部证书自动续期）
1) 准备 CA 私钥与证书（强权限管理），写入 mtls-ca-issuer Secret：
```
kubectl apply -f k8s/mtls/ca-issuer-secret.yaml
```
2) 创建 Issuer 与示例客户端证书（自动续期）：
```
kubectl apply -f k8s/mtls/ca-issuer.yaml
```
3) 在需要的 Pod 中挂载 Secret internal-client-cert 的 tls.crt/tls.key 用于 mTLS 客户端调用。

## 安全注意
- CA 私钥必须最小化暴露，Issuer 所在命名空间与RBAC需严格限制
- 建议启用双CA过渡：在 Ingress CA Secret 合并新旧 CA（PEM 级联），逐步切换客户端
- 建议将被吊销序列号同步到 SIEM 平台，形成审计追踪
