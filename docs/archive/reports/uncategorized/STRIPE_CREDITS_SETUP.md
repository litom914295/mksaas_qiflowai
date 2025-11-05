# Stripe 积分包价格配置指南

## 问题
当前环境变量中的 Stripe Price ID 在 Stripe 账户中不存在。

## 当前配置
```
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=price_1SPILLQVvPHNlwbzcs0Ofwg3
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=price_1SPINTQVvPHNlwbzIxEuHlMY
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=price_1SPIOJQVvPHNlwbzUtIoHkW8
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=price_1SPIPVQVvPHNlwbzLjZCdJfM
```

## 需要创建的产品和价格

### 1. Basic 积分包
- **产品名称**: QiFlow AI - 100积分包
- **价格**: $9.90 USD (990美分)
- **类型**: 一次性付款
- **积分数量**: 100
- **有效期**: 30天

### 2. Standard 积分包
- **产品名称**: QiFlow AI - 200积分包
- **价格**: $14.90 USD (1490美分)
- **类型**: 一次性付款
- **积分数量**: 200
- **有效期**: 30天

### 3. Premium 积分包
- **产品名称**: QiFlow AI - 500积分包
- **价格**: $34.90 USD (3490美分)
- **类型**: 一次性付款
- **积分数量**: 500
- **有效期**: 30天

### 4. Enterprise 积分包
- **产品名称**: QiFlow AI - 1000积分包
- **价格**: $69.90 USD (6990美分)
- **类型**: 一次性付款
- **积分数量**: 1000
- **有效期**: 30天

---

## 操作步骤

### 方式1: 通过 Stripe Dashboard 创建(推荐)

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)

2. 进入 **Products** → 点击 **+ Add product**

3. 为每个积分包创建产品:
   - 填写产品名称(如"QiFlow AI - 100积分包")
   - 描述(可选): "100积分，有效期30天"
   - 选择 **One-time** (一次性付款)
   - 输入价格(如 $9.90)
   - 货币: **USD**
   - 点击 **Save product**

4. 创建完成后,复制生成的 **Price ID** (格式: `price_xxx...`)

5. 更新 `.env.local` 文件中对应的环境变量

### 方式2: 使用 Stripe CLI 创建

如果你安装了 Stripe CLI,可以使用以下命令快速创建:

```bash
# 创建 Basic 积分包
stripe products create \
  --name "QiFlow AI - 100积分包" \
  --description "100积分，有效期30天"

# 为产品创建价格 (替换 prod_xxx 为上面返回的产品ID)
stripe prices create \
  --product prod_xxx \
  --unit-amount 990 \
  --currency usd

# 对其他套餐重复上述步骤...
```

---

## 更新环境变量

创建完所有价格后,更新 `.env.local`:

```env
# 积分包价格 (替换为你实际创建的 Price ID)
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=price_新的ID_basic
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=price_新的ID_standard
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=price_新的ID_premium
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=price_新的ID_enterprise
```

---

## 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

---

## 验证

1. 打开浏览器访问积分购买页面
2. 点击购买按钮
3. 应该能正常跳转到 Stripe Checkout 页面

---

## 价格对照表

| 套餐 | 积分数 | 价格(美元) | 价格(美分) | 单价($/千积分) |
|------|--------|-----------|-----------|----------------|
| Basic | 100 | $9.90 | 990 | $99.00 |
| Standard | 200 | $14.90 | 1490 | $74.50 |
| Premium | 500 | $34.90 | 3490 | $69.80 |
| Enterprise | 1000 | $69.90 | 6990 | $69.90 |

注意: Stripe API 中的金额单位是**美分**,所以 $9.90 = 990美分

---

## 常见问题

### Q: 为什么显示 "No such price"?
A: Price ID 不存在于你的 Stripe 账户中。需要在 Stripe Dashboard 创建对应的产品和价格。

### Q: 创建后还是不行?
A: 确保:
1. 复制了正确的 Price ID (不是 Product ID)
2. 更新了 `.env.local` 文件
3. 重启了 Next.js 开发服务器

### Q: 测试支付需要真实付款吗?
A: 使用 Stripe 测试模式(Test Mode),可以用测试卡号 `4242 4242 4242 4242` 进行测试。

### Q: 如何切换测试/生产模式?
A: 在 Stripe Dashboard 右上角有开关。环境变量使用不同的 API Key:
- 测试: `sk_test_...` / `pk_test_...`
- 生产: `sk_live_...` / `pk_live_...`
