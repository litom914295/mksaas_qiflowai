# QiFlow AI 生产环境部署指南

> 版本：v5.1.1  
> 最后更新：2025-09-27

## 📋 部署前检查清单

### 1. 环境变量配置 ✅

已配置的关键API密钥：
- **OpenAI API**（通过兔子API代理）
  - API Key: `sk-ArQi0bOqLCqsY3sdGnfqF2tSsOnPAV7MyorFrM1Wcqo2uXiw`
  - Base URL: `https://api.tu-zi.com/v1`
  
- **DeepSeek API**
  - API Key: `sk-04104c2d50864c30b307e6f6cfdf8fb4`
  - Base URL: `https://api.deepseek.com/v1`

### 2. 需要您补充的配置项 ⚠️

```bash
# 以下配置需要您提供实际值：

# 1. 数据库配置
DATABASE_URL=postgresql://username:password@host:5432/qiflow_production

# 2. Redis缓存（推荐使用Upstash）
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# 3. Stripe支付（生产环境密钥）
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# 4. 安全密钥（必须生成唯一值）
JWT_SECRET=<使用命令生成32位随机字符串>
NEXTAUTH_SECRET=<使用命令生成32位随机字符串>
ENCRYPTION_KEY=<使用命令生成32位随机字符串>
```

## 🔐 生成安全密钥

使用以下命令生成安全的随机密钥：

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell
[System.Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

## 🚀 部署步骤

### 步骤1：准备环境

1. **克隆项目**
```bash
git clone https://github.com/your-repo/qiflow-ai.git
cd qiflow-ai
```

2. **配置环境变量**
```bash
# 复制生产环境配置
cp .env.production .env

# 编辑配置文件，填写缺失的值
nano .env  # 或使用您喜欢的编辑器
```

3. **安装依赖**
```bash
npm install --production
# 或
yarn install --production
```

### 步骤2：数据库设置

1. **创建数据库**
```sql
CREATE DATABASE qiflow_production;
```

2. **运行迁移**
```bash
npm run db:migrate
# 或
npx prisma migrate deploy
```

3. **初始化种子数据**
```bash
npm run db:seed
```

### 步骤3：构建应用

```bash
# 生产构建
npm run build

# 验证构建
npm run build:analyze  # 分析包大小
```

### 步骤4：部署到Vercel（推荐）

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署**
```bash
vercel --prod
```

4. **配置环境变量**
   - 访问 https://vercel.com/dashboard
   - 进入项目设置
   - 在Environment Variables中添加所有生产环境变量

### 步骤5：配置Stripe Webhook

1. 登录Stripe Dashboard
2. 进入 Developers > Webhooks
3. 添加endpoint：`https://your-domain.com/api/stripe/webhook`
4. 选择事件：
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 复制Webhook密钥到环境变量

### 步骤6：设置Redis缓存

1. **注册Upstash账号**：https://upstash.com
2. **创建Redis数据库**
3. **复制连接信息到环境变量**

### 步骤7：配置CDN（可选但推荐）

1. **Cloudflare设置**
   - 添加域名
   - 配置DNS
   - 启用缓存规则
   - 设置页面规则

2. **更新环境变量**
```env
CDN_ENABLED=true
CDN_STATIC_URL=https://cdn.qiflow.ai/static
CDN_MEDIA_URL=https://cdn.qiflow.ai/media
```

## 📊 监控设置

### 1. Sentry错误追踪

1. 创建Sentry项目：https://sentry.io
2. 获取DSN
3. 更新环境变量：
```env
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 2. 性能监控

配置已包含在 `performance.js` 中，确保以下服务运行：
- 熔断器：自动启用
- 限流器：自动启用
- 健康检查：`/api/health`

## 🔍 部署后验证

### 1. 功能测试清单

- [ ] 主页加载正常
- [ ] AI对话功能正常
- [ ] 深度解读功能正常
- [ ] 八字分析功能正常
- [ ] 玄空罗盘功能正常
- [ ] 支付流程正常
- [ ] 积分扣除正常
- [ ] 年龄验证正常
- [ ] 免责声明显示正常

### 2. 性能测试

```bash
# 运行性能测试
npm run test:performance smoke

# 检查结果
cat test-reports/performance-*.json
```

### 3. 安全检查

```bash
# 检查依赖漏洞
npm audit

# 检查环境变量泄露
grep -r "sk_live" --exclude-dir=node_modules .
```

## 🆘 故障排查

### 常见问题

1. **AI服务连接失败**
   - 检查API密钥是否正确
   - 确认API endpoint可访问
   - 查看熔断器状态

2. **数据库连接错误**
   - 验证DATABASE_URL格式
   - 检查防火墙规则
   - 确认SSL证书配置

3. **支付功能异常**
   - 确认Stripe密钥正确
   - 检查Webhook配置
   - 验证产品价格ID

### 日志位置

- 应用日志：`/var/log/qiflow/app.log`
- 错误日志：Sentry Dashboard
- 性能指标：`/api/metrics`

## 📞 支持联系

- 技术支持：tech@qiflow.ai
- 紧急热线：+86-xxx-xxxx-xxxx
- 文档中心：https://docs.qiflow.ai

## 📝 部署检查表

- [x] AI API密钥已配置
- [ ] 数据库已创建并连接
- [ ] Redis缓存已配置
- [ ] Stripe支付已设置
- [ ] 安全密钥已生成
- [ ] SSL证书已安装
- [ ] CDN已配置
- [ ] 监控已启用
- [ ] 备份策略已设置
- [ ] 性能测试已通过

---

**重要提醒**：
1. 永远不要将 `.env.production` 文件提交到Git
2. 定期轮换API密钥和安全令牌
3. 保持依赖包更新
4. 定期备份数据库
5. 监控API使用量和成本