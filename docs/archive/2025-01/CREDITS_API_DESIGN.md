# 积分计费系统 API 设计文档

## 📋 目录
1. [概述](#概述)
2. [功能计费标准](#功能计费标准)
3. [API 端点](#api-端点)
4. [数据模型](#数据模型)
5. [降级策略](#降级策略)
6. [错误处理](#错误处理)

---

## 概述

### 设计原则
- **按需计费**：用户仅为实际使用的功能付费
- **透明计费**：每次消费前明确告知用户所需积分
- **灵活套餐**：提供多档位积分套餐
- **降级保护**：积分不足时自动降级，不中断服务
- **安全可审计**：所有交易记录可追溯

### 技术栈
- **后端框架**: Next.js API Routes
- **数据库**: PostgreSQL (via Prisma)
- **支付集成**: 微信支付 / 支付宝（待接入）
- **事务管理**: Prisma Transaction

---

## 功能计费标准

| 功能 | 积分消耗 | 描述 | 降级方案 |
|------|---------|------|---------|
| **AI 聊天** | 5 积分/次 | 多轮对话，支持上下文 | 单轮对话（2 积分） |
| **深度解读** | 30 积分/次 | 完整命盘分析报告（5000+ 字） | 基础分析（10 积分） |
| **八字分析** | 10 积分/次 | 基础五行十神分析 | 免费预览（只看四柱） |
| **风水罗盘** | 20 积分/次 | 地址方位能量场分析 | 简化版（10 积分） |
| **PDF 导出** | 5 积分/次 | 下载完整报告 | 网页预览（免费） |

### 套餐价格

| 套餐名称 | 积分数 | 价格 | 单价 | 适用人群 |
|---------|-------|------|------|---------|
| **小额套餐** | 100 积分 | ¥29 | ¥0.29/积分 | 轻度用户 |
| **中额套餐** | 500 积分 | ¥99 | ¥0.198/积分 | 普通用户（最受欢迎）|
| **大额套餐** | 1200 积分 | ¥199 | ¥0.166/积分 | 重度用户 |

**首次注册赠送**: 30 积分（体验用）

---

## API 端点

### 1. 查询用户积分余额

```typescript
GET /api/credits/balance

// 响应
{
  "balance": 150,
  "total": 200,
  "used": 50,
  "lastUpdated": "2025-01-03T12:00:00Z"
}
```

### 2. 获取积分套餐列表

```typescript
GET /api/credits/packages

// 响应
{
  "packages": [
    {
      "id": "pkg_small",
      "name": "小额套餐",
      "credits": 100,
      "price": 29.00,
      "currency": "CNY",
      "popular": false
    },
    {
      "id": "pkg_medium",
      "name": "中额套餐",
      "credits": 500,
      "price": 99.00,
      "currency": "CNY",
      "popular": true
    },
    {
      "id": "pkg_large",
      "name": "大额套餐",
      "credits": 1200,
      "price": 199.00,
      "currency": "CNY",
      "popular": false
    }
  ]
}
```

### 3. 购买积分套餐

```typescript
POST /api/credits/purchase

// 请求
{
  "packageId": "pkg_medium",
  "paymentMethod": "wechat" // wechat | alipay | card
}

// 响应
{
  "orderId": "order_xxx",
  "paymentUrl": "weixin://wxpay/...", // 支付跳转链接
  "qrCode": "data:image/png;base64,...", // 二维码（扫码支付）
  "status": "PENDING",
  "expiresAt": "2025-01-03T12:15:00Z"
}
```

### 4. 查询订单状态

```typescript
GET /api/credits/purchase/:orderId

// 响应
{
  "orderId": "order_xxx",
  "status": "COMPLETED", // PENDING | PAID | COMPLETED | FAILED
  "credits": 500,
  "price": 99.00,
  "createdAt": "2025-01-03T12:00:00Z",
  "paidAt": "2025-01-03T12:05:00Z"
}
```

### 5. 消费积分（功能调用）

```typescript
POST /api/credits/consume

// 请求
{
  "feature": "aiChat", // aiChat | deepInterpretation | bazi | xuankong | pdfExport
  "metadata": {
    "conversationId": "conv_xxx",
    "messageLength": 150
  }
}

// 响应
{
  "success": true,
  "consumed": 5,
  "balanceBefore": 150,
  "balanceAfter": 145,
  "transactionId": "txn_xxx"
}
```

### 6. 查询交易记录

```typescript
GET /api/credits/transactions?page=1&limit=20&type=all

// 查询参数
// - page: 页码（默认 1）
// - limit: 每页数量（默认 20，最大 100）
// - type: 交易类型（all | PURCHASE | CONSUMPTION | REFUND | REWARD）

// 响应
{
  "transactions": [
    {
      "id": "txn_xxx",
      "type": "CONSUMPTION",
      "amount": -5,
      "balanceBefore": 150,
      "balanceAfter": 145,
      "description": "AI 聊天消费",
      "createdAt": "2025-01-03T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 7. 获取功能计费规则

```typescript
GET /api/credits/pricing

// 响应
{
  "features": {
    "aiChat": {
      "standard": 5,
      "degraded": 2,
      "description": "AI 聊天（多轮对话）"
    },
    "deepInterpretation": {
      "standard": 30,
      "degraded": 10,
      "description": "深度命盘解读"
    },
    "bazi": {
      "standard": 10,
      "degraded": 0,
      "description": "八字分析"
    },
    "xuankong": {
      "standard": 20,
      "degraded": 10,
      "description": "玄空风水罗盘"
    },
    "pdfExport": {
      "standard": 5,
      "degraded": 0,
      "description": "PDF 报告导出"
    }
  }
}
```

---

## 数据模型

详见 `prisma/schema-credits.prisma` 文件，包含以下表：

1. **CreditPackage** - 积分套餐
2. **UserCredit** - 用户积分余额
3. **CreditTransaction** - 积分交易记录
4. **CreditPurchase** - 购买记录
5. **FeatureConsumption** - 功能消费记录

---

## 降级策略

### 三级降级机制

#### 1. **正常服务**（积分充足）
- 用户积分 ≥ 标准计费
- 提供完整功能体验
- 无任何限制

#### 2. **降级服务**（积分不足但 > 0）
- 用户积分 < 标准计费 但 ≥ 降级计费
- 提供简化版功能
- 明确告知用户当前为降级模式

**降级规则**：
```typescript
// 示例：AI 聊天降级
if (userBalance >= 5) {
  // 标准服务：多轮对话 + 上下文记忆
  return 'STANDARD';
} else if (userBalance >= 2) {
  // 降级服务：单轮对话，无上下文
  return 'DEGRADED';
} else {
  // 无法服务：提示充值
  return 'INSUFFICIENT';
}
```

#### 3. **免费预览**（积分为 0）
- 用户积分 = 0
- 提供非常有限的预览功能
- 引导用户购买积分

**免费预览功能**：
- 八字分析：只显示四柱，不显示解读
- 风水罗盘：只显示方位，不显示吉凶
- AI 聊天：禁用
- PDF 导出：禁用，只能网页查看

---

## 错误处理

### 错误码表

| 错误码 | 说明 | HTTP 状态码 | 处理建议 |
|-------|------|------------|---------|
| `INSUFFICIENT_CREDITS` | 积分不足 | 402 | 提示用户购买积分 |
| `INVALID_PACKAGE` | 无效的套餐 ID | 400 | 检查请求参数 |
| `PAYMENT_FAILED` | 支付失败 | 402 | 重试或更换支付方式 |
| `TRANSACTION_FAILED` | 交易失败 | 500 | 联系客服 |
| `DUPLICATE_PURCHASE` | 重复购买 | 409 | 查询订单状态 |
| `FEATURE_NOT_FOUND` | 功能不存在 | 404 | 检查功能名称 |
| `RATE_LIMIT_EXCEEDED` | 请求过于频繁 | 429 | 等待后重试 |

### 错误响应格式

```typescript
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "积分不足，当前余额：3 积分，所需：5 积分",
    "details": {
      "currentBalance": 3,
      "required": 5,
      "shortfall": 2
    },
    "suggestions": [
      "购买积分套餐",
      "使用降级服务（2 积分）"
    ]
  }
}
```

---

## 前端集成

### 1. 积分余额显示组件

位置：Header 右上角

```tsx
<CreditBadge balance={150} />
// 显示：💎 150
```

### 2. 消费前确认弹窗

```tsx
<ConsumeConfirmDialog
  feature="aiChat"
  credits={5}
  currentBalance={150}
  onConfirm={handleConsume}
/>
```

### 3. 充值弹窗

```tsx
<PurchaseDialog
  packages={packages}
  onSuccess={handlePurchaseSuccess}
/>
```

### 4. 降级提示

```tsx
<DegradedModeAlert
  feature="aiChat"
  standardCost={5}
  degradedCost={2}
  currentBalance={3}
/>
```

---

## 安全措施

### 1. 防重放攻击
- 每次交易生成唯一 idempotency key
- 相同 key 的请求返回相同结果

### 2. 余额并发控制
- 使用数据库事务（Prisma Transaction）
- 乐观锁 + 版本号控制

### 3. 支付验签
- 微信/支付宝支付回调验签
- HTTPS 加密传输

### 4. 审计日志
- 记录所有交易操作
- 包含用户 ID、IP、时间戳、操作类型

---

## 实施步骤

### Phase 1: 数据库与基础 API（高优先级）
- [x] Prisma Schema 设计
- [x] API 设计文档
- [ ] 实现 `/api/credits/balance`
- [ ] 实现 `/api/credits/packages`
- [ ] 实现 `/api/credits/consume`

### Phase 2: 前端组件（高优先级）
- [ ] `CreditBadge` 组件
- [ ] `PurchaseDialog` 组件
- [ ] `ConsumeConfirmDialog` 组件
- [ ] `DegradedModeAlert` 组件

### Phase 3: 支付集成（中优先级）
- [ ] 微信支付接入
- [ ] 支付宝接入
- [ ] 支付回调处理
- [ ] 订单状态查询

### Phase 4: 降级逻辑（中优先级）
- [ ] 功能消费前检查逻辑
- [ ] 降级服务实现
- [ ] 免费预览实现

### Phase 5: 监控与优化（低优先级）
- [ ] 交易监控面板
- [ ] 异常告警
- [ ] 性能优化

---

## 测试用例

### 单元测试
- [ ] 积分余额计算
- [ ] 交易记录创建
- [ ] 降级逻辑判断

### 集成测试
- [ ] 购买流程端到端测试
- [ ] 消费流程端到端测试
- [ ] 支付回调测试

### 性能测试
- [ ] 高并发消费测试（1000 QPS）
- [ ] 数据库事务压力测试

---

**文档版本**: v1.0  
**最后更新**: 2025-01-03  
**维护者**: QiFlow AI 开发团队
