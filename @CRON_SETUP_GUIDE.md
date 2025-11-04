# Cron Job 配置指南

## 概述

QiFlow AI 使用定时任务每天自动发放月度积分。配置方式有两种：

## 方式 1：Vercel Cron（推荐）✅

### 优点
- ✅ 自动执行，无需外部服务
- ✅ 免费（Vercel 提供）
- ✅ 配置简单

### 配置步骤

#### 1. 生成 CRON_SECRET

```bash
openssl rand -base64 32
```

#### 2. 在 Vercel 添加环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加：

```
CRON_SECRET=你生成的随机字符串
```

#### 3. 验证配置

部署后，Vercel 会自动在每天 UTC 2:00（北京时间 10:00）执行定时任务。

检查日志：Vercel Dashboard → Deployments → Functions → 查找 `/api/distribute-credits`

---

## 方式 2：外部 Cron 服务

### 适用场景
- 需要自定义执行时间
- 需要更复杂的调度规则
- 非 Vercel 部署

### 推荐服务
- [cron-job.org](https://cron-job.org) - 免费，支持 Basic Auth
- [EasyCron](https://www.easycron.com) - 功能强大

### 配置步骤

#### 1. 设置环境变量

```
CRON_JOBS_USERNAME=your_username
CRON_JOBS_PASSWORD=your_password
```

#### 2. 在 Cron 服务中配置

**URL**: `https://your-domain.com/api/distribute-credits`

**方法**: GET

**认证**: Basic Auth
- Username: `your_username`
- Password: `your_password`

**执行时间**: 每天一次（推荐 UTC 2:00）

---

## 验证配置

### 手动测试

```bash
# 使用 Bearer token (Vercel Cron)
curl -X GET https://your-domain.com/api/distribute-credits \
  -H "Authorization: Bearer your_cron_secret"

# 使用 Basic Auth (外部服务)
curl -X GET https://your-domain.com/api/distribute-credits \
  -u "username:password"
```

### 查看日志

成功执行时会看到类似日志：

```
route: distribute credits start
>>> distribute credits start
distribute credits, users count: 1234
lifetime users: 100, free users: 1000
<<< distribute credits end, users: 1234, processed: 1234, errors: 0
route: distribute credits end, users: 1234, processed: 1234, errors: 0
```

---

## 常见问题

### Q: 如何更改执行时间？

**Vercel Cron**: 修改 `vercel.json` 中的 `schedule`

```json
{
  "crons": [
    {
      "path": "/api/distribute-credits",
      "schedule": "0 2 * * *"  // UTC 时间，使用 cron 表达式
    }
  ]
}
```

常用时间：
- `0 0 * * *` - 每天 UTC 0:00（北京时间 8:00）
- `0 2 * * *` - 每天 UTC 2:00（北京时间 10:00）
- `0 */6 * * *` - 每 6 小时一次

**外部服务**: 直接在服务配置中修改

### Q: 如何确认定时任务正在运行？

1. 检查 Vercel Functions 日志
2. 检查数据库 `credit_transaction` 表是否有新记录
3. 手动触发测试

### Q: 定时任务失败怎么办？

1. 检查环境变量是否正确配置
2. 检查 API 认证是否通过
3. 查看 Vercel 日志中的错误信息
4. 确认数据库连接正常

### Q: 可以同时使用两种方式吗？

可以，但不推荐。建议：
- **生产环境**: 使用 Vercel Cron
- **测试/手动触发**: 使用 Basic Auth

---

## 技术细节

### 定时任务执行内容

1. **处理过期积分** - 扣除已过期的积分
2. **发放免费用户月度积分** - 50 积分/月
3. **发放终身会员月度积分** - 根据套餐配置
4. **发放年度订阅月度积分** - 年度订阅的月度积分（非续费月份）

### 防重复机制

- 使用月份 + 年份检查，确保每月只发放一次
- 所有操作在事务中执行，保证数据一致性

### 性能优化

- 批量处理（100 用户/批）
- 高效的 SQL 查询（避免 N+1）
- 单批次失败不影响其他批次

---

## 下一步

✅ 配置完成后，建议：
1. 手动触发一次测试
2. 等待自动执行（次日检查）
3. 监控日志和错误
4. 定期检查积分发放是否正常
