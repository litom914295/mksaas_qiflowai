# Growth P0 回归与发布清单（最小）

## 路径验证
- 注册 → 首次登录（注册赠送70积分可见）
- 推荐 → ?ref= 捕获并登记 → 八字+风水或 PDF+3轮对话 → 双向积分（REFERRAL_REWARD）
- 分享 → 生成链接 → 落地页停留6秒 → 发放 SHARE_REWARD（日上限与冷却生效）
- 每日签到 → 任意页面 → 自动签到（DAILY_SIGNIN），连续天数达到里程碑赠券

## 管理页与接口
- KPI 看板：/[locale]/(protected)/admin/metrics（仅管理员）
- 健康检查：/api/admin/health/overview（24小时指标）
- 黑名单：
  - 列表 GET /api/admin/fraud-blacklist/list
  - 新增 POST /api/admin/fraud-blacklist/add { ip | fingerprint }
  - 删除 POST /api/admin/fraud-blacklist/remove { id | ip | fingerprint }
- 迁移检查与回填：
  - GET /api/admin/referral/migration-check
  - POST /api/admin/referral/ensure-codes

## 回滚预案（模板）
- 如分享/奖励出现异常，先将 growth.share.enable 设为 false，临时关闭发奖
- 黑名单快速拦截异常源（IP/指纹）
- 通过 git revert 指定提交，回退接口或页面改动

## 监控与报警（建议）
- 将 /api/admin/health/overview 接入外部监控，每5分钟拉取并对 blocked_24h 和 error 日志阈值报警
- 后续接入 Sentry（前后端）与 GA 自定义事件