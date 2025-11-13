# 端到端测试执行报告

## 测试日期
2025-11-13 15:17 (UTC+8)

## 执行状态
⚠️ **测试准备阶段** - 需要配置Stripe环境

---

## 环境检查结果

### ✅ 已完成检查项
1. ✅ 项目目录存在: `D:\test\mksaas_qiflowai`
2. ✅ `.env.local`文件存在
3. ✅ 数据库配置已就绪 (Supabase)
4. ✅ AI API密钥已配置 (OpenAI, Gemini, DeepSeek)
5. ✅ 认证配置已就绪 (BETTER_AUTH_SECRET)

### ⚠️ 缺失配置项
以下Stripe配置需要添加到`.env.local`:

```env
# Stripe 配置（测试模式）
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# 报告产品价格ID（需在Stripe Dashboard创建）
NEXT_PUBLIC_PRICE_ESSENTIAL_REPORT=price_YOUR_PRICE_ID_HERE
```

---

## 测试准备步骤

### 步骤1: 获取Stripe测试密钥

#### 1.1 注册/登录Stripe账号
1. 访问 https://dashboard.stripe.com/register
2. 使用邮箱注册或登录现有账号
3. 切换到**测试模式**（左上角开关）

#### 1.2 获取API密钥
1. 进入 **Developers** → **API keys**
2. 复制 **Secret key** (sk_test_...)
3. 更新`.env.local`:
   ```env
   STRIPE_SECRET_KEY=sk_test_51xxxxx
   ```

#### 1.3 创建产品和价格
1. 进入 **Products** → **Add Product**
2. 填写信息:
   - Name: `精华八字报告`
   - Description: `AI深度解析八字命理和风水`
   - Price: `9.90 CNY` (或 `0.99 USD` 用于测试)
   - Billing: `One-time`
3. 保存后复制 **Price ID** (price_...)
4. 更新`.env.local`:
   ```env
   NEXT_PUBLIC_PRICE_ESSENTIAL_REPORT=price_1xxxxx
   ```

#### 1.4 配置Webhook Secret (本地测试)
本地开发使用Stripe CLI自动生成，稍后执行。

---

### 步骤2: 安装Stripe CLI (如未安装)

#### Windows PowerShell 方式
```powershell
# 使用 Scoop 安装
scoop install stripe

# 或手动下载
# https://github.com/stripe/stripe-cli/releases
```

#### 验证安装
```bash
stripe --version
```

#### 登录Stripe CLI
```bash
stripe login
# 按提示在浏览器中确认授权
```

---

### 步骤3: 启动测试环境

#### 终端1: 启动Next.js开发服务器
```bash
cd D:\test\mksaas_qiflowai
npm run dev
```

预期输出:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
```

#### 终端2: 启动Stripe Webhook监听
```bash
cd D:\test\mksaas_qiflowai
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

预期输出:
```
> Ready! You are using Stripe API Version [2024-xx-xx]
> Your webhook signing secret is whsec_xxxxx
```

**重要**: 复制webhook签名密钥并更新`.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

然后**重启Next.js服务器**以加载新密钥。

---

### 步骤4: 准备测试数据

#### 4.1 创建测试用户
1. 访问 http://localhost:3000
2. 注册新账号或使用已有账号登录
3. 记录 `userId`

#### 4.2 生成测试报告
由于我们需要一个未付费的`essential`报告，有两个方式:

**方式A: 通过API创建**
```bash
# 假设您的userId是 user_abc123
curl -X POST http://localhost:3000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{
    "reportType": "essential",
    "birthDate": "1990-01-15",
    "birthHour": "10",
    "gender": "male",
    "location": "北京市"
  }'
```

**方式B: 通过UI创建**
1. 登录后访问报告生成页面
2. 选择"精华报告"
3. 填写出生信息
4. 生成报告（会显示Paywall）

#### 4.3 获取报告ID
- 从API响应中获取 `reportId`
- 或从浏览器URL中获取: `/reports/{reportId}`

---

## 测试执行清单

一旦环境配置完成，按以下顺序执行测试:

### ✅ 测试1: A/B测试变体分配
- [ ] 访问 `/reports/{reportId}`
- [ ] 检查localStorage的`sessionId`
- [ ] 查看console.log确认变体分配
- [ ] 验证Paywall文案匹配变体

### ✅ 测试2: 成本监控
- [ ] 访问 `/admin/monitoring`
- [ ] 确认4个成本防护卡片显示
- [ ] 等待10秒验证自动刷新

### ✅ 测试3: 转化追踪
- [ ] 打开浏览器Console
- [ ] 观察`[Tracking] page_view`事件
- [ ] 观察`[Tracking] paywall_shown`事件

### ✅ 测试4: 支付流程
#### 4.1 发起支付
- [ ] 点击"立即解锁完整报告"
- [ ] 检查Network请求到`/api/payments/create-checkout`
- [ ] 验证返回`sessionUrl`
- [ ] 自动跳转到Stripe Checkout

#### 4.2 完成支付
- [ ] 输入测试卡号: `4242 4242 4242 4242`
- [ ] 到期日: `12/34`
- [ ] CVC: `123`
- [ ] 点击Pay
- [ ] 重定向回`/reports/{reportId}?payment=success`

#### 4.3 验证Webhook
- [ ] 检查Stripe CLI终端输出
- [ ] 确认收到`checkout.session.completed`
- [ ] 检查Next.js日志确认报告解锁

#### 4.4 验证解锁
- [ ] 刷新页面
- [ ] Paywall消失
- [ ] 完整报告可见
- [ ] 点击"导出PDF"测试追踪

### ✅ 测试5: 支付失败场景
- [ ] 生成新报告
- [ ] 使用失败卡号: `4000 0000 0000 0002`
- [ ] 验证失败处理和追踪

### ✅ 测试6: 幂等性验证
- [ ] 在Stripe Dashboard重发webhook
- [ ] 确认"Event already processed"日志

---

## 快速启动脚本

为方便测试，可以创建以下PowerShell脚本:

### `start-dev.ps1`
```powershell
# 启动开发服务器
Write-Host "启动Next.js开发服务器..." -ForegroundColor Green
npm run dev
```

### `start-webhook.ps1`
```powershell
# 启动Webhook监听
Write-Host "启动Stripe Webhook监听..." -ForegroundColor Green
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

使用方法:
```powershell
# 终端1
.\start-dev.ps1

# 终端2
.\start-webhook.ps1
```

---

## 常见问题排查

### 问题1: Stripe CLI未安装
**症状**: `stripe: The term 'stripe' is not recognized`

**解决**:
```powershell
# 使用Scoop
scoop install stripe

# 或下载手动安装
# https://github.com/stripe/stripe-cli/releases
```

### 问题2: Webhook签名验证失败
**症状**: `Invalid webhook signature`

**解决**:
1. 确保`.env.local`中的`STRIPE_WEBHOOK_SECRET`与Stripe CLI输出的一致
2. 重启Next.js服务器加载新密钥
3. 确保Stripe CLI正在运行

### 问题3: 报告未解锁
**症状**: 支付成功但Paywall仍显示

**解决**:
1. 检查Stripe CLI终端是否收到webhook
2. 检查Next.js日志是否有错误
3. 查询数据库确认`qiflowReports.metadata.purchaseMethod`是否更新为`'stripe'`
4. 刷新页面清除缓存

### 问题4: 数据库连接错误
**症状**: `Database connection failed`

**解决**:
1. 确认Supabase配置正确
2. 检查`DATABASE_URL`环境变量
3. 验证网络连接

---

## 下一步行动

### 立即执行 (需要20-30分钟)
1. ⏳ 注册Stripe测试账号
2. ⏳ 获取API密钥和Price ID
3. ⏳ 更新`.env.local`配置
4. ⏳ 安装Stripe CLI (如未安装)
5. ⏳ 启动开发环境
6. ⏳ 执行测试清单

### 完成后
1. ✅ 记录测试结果
2. ✅ 截图关键步骤
3. ✅ 更新本报告
4. ✅ 准备生产环境配置

---

## 测试结果记录表

| 测试项 | 状态 | 备注 | 截图 |
|--------|------|------|------|
| A/B测试变体 | ⏳ | - | - |
| 成本监控 | ⏳ | - | - |
| 转化追踪 | ⏳ | - | - |
| 支付流程 | ⏳ | - | - |
| Webhook处理 | ⏳ | - | - |
| 报告解锁 | ⏳ | - | - |
| 支付失败 | ⏳ | - | - |
| 幂等性 | ⏳ | - | - |

**图例**: ⏳ 待执行 | ✅ 通过 | ❌ 失败 | ⚠️ 警告

---

## 联系支持

如遇到技术问题:
1. 查看 `@FINAL_INTEGRATION_COMPLETE.md` 完整文档
2. 检查Next.js控制台日志
3. 查看Stripe Dashboard Events日志
4. 检查数据库记录

---

**报告生成时间**: 2025-11-13 15:17  
**状态**: 环境准备阶段  
**下一步**: 配置Stripe测试环境

🔧 **准备就绪后即可开始测试！**
