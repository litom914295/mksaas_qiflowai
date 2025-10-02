# CI/CD 流水线规范（v5.1）
- 阶段：lint → test → e2e → perf → security → build → release
- Gate：评测门槛未达标阻断；成本回归高于阈值阻断
- 产物：版本标签、构建哈希、SBOM
