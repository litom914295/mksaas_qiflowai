# 积分风险管理策略

## 📋 背景

订阅积分设置为"永久有效，可累积"对用户具有极大吸引力，但也带来了长期财务风险：

- **风险1：累积负债**：用户可能长期订阅但不使用，积分累积到非常大的数额
- **风险2：集中消耗**：用户在某个时间点集中使用大量历史积分，给服务器带来成本压力
- **风险3：财务不匹配**：早期收入与后期成本不匹配

---

## 🎯 风险控制策略

### 方案1：积分滚动上限 (Rollover Cap) - 推荐实施

#### 规则说明
- 用户每月获得的订阅积分可以累积
- 但总持有量不能超过 **12个月的配额**
- 超出部分在新积分发放时自动作废

#### 具体数值
| 计划 | 月配额 | 最大持有量 | 说明 |
|------|--------|-----------|------|
| Pro 月订阅 | 300 | 3,600 | 最多累积12个月 |
| Pro 年订阅 | 300/月 | 3,600 | 最多累积12个月 |
| Lifetime | 500/月 | 6,000 | 最多累积12个月 |

#### 实施方式
```typescript
// 在发放积分前检查
async function addSubscriptionCreditsWithCap(userId: string, priceId: string) {
  const plan = findPlanByPriceId(priceId);
  const monthlyCredits = plan.credits.amount;
  const maxCredits = monthlyCredits * 12;
  
  const currentBalance = await getUserCredits(userId);
  
  if (currentBalance >= maxCredits) {
    console.log(`User ${userId} has reached credit cap, not adding new credits`);
    return;
  }
  
  // 发放积分，但不超过上限
  const creditsToAdd = Math.min(monthlyCredits, maxCredits - currentBalance);
  await addCredits({ userId, amount: creditsToAdd, ... });
}
```

#### 用户沟通
- 在订阅说明中明确告知上限规则
- 当用户接近上限时（如达到90%）发送提醒邮件
- 在账户页面显示当前持有量和上限

---

### 方案2：不活跃清零 (Inactivity Clause)

#### 规则说明
- 积分在账户"活跃"期间永久有效
- 如果账户连续 **12个月** 没有任何使用记录，积分清零
- 只要有一次使用，计时器重置

#### 活跃定义
以下任一行为视为"活跃"：
- 登录账户
- 使用积分进行任何操作
- 购买积分包
- 更新个人信息

#### 实施方式
```typescript
// 每月运行一次的 Cron Job
async function clearInactiveUserCredits() {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  // 查找超过12个月没活跃的用户
  const inactiveUsers = await db
    .select()
    .from(user)
    .where(
      and(
        lt(user.lastActiveAt, twelveMonthsAgo),
        gt(userCredit.currentCredits, 0)
      )
    );
  
  for (const user of inactiveUsers) {
    await updateUserCredits(user.id, 0);
    await sendInactivityNotification(user.email);
  }
}
```

#### 用户沟通
- 在服务条款中明确说明
- 在账户不活跃9个月时发送提醒邮件
- 在账户不活跃11个月时发送最后警告

---

### 方案3：使用速率限制 (Rate Limiting)

#### 规则说明
- 每个用户每月有使用速率上限
- 防止用户集中消耗大量历史积分

#### 具体数值
| 计划 | 月使用上限 | 说明 |
|------|-----------|------|
| Pro 月订阅 | 600 | 2倍月配额 |
| Pro 年订阅 | 600 | 2倍月配额 |
| Lifetime | 1000 | 2倍月配额 |

#### 实施方式
```typescript
async function consumeCreditsWithRateLimit(userId: string, amount: number) {
  const plan = await getUserPlan(userId);
  const monthlyLimit = plan.credits.amount * 2;
  
  const currentMonthUsage = await getMonthlyUsage(userId);
  
  if (currentMonthUsage + amount > monthlyLimit) {
    throw new Error(`Monthly usage limit exceeded. Limit: ${monthlyLimit}`);
  }
  
  await consumeCredits({ userId, amount, ... });
}
```

---

## 📊 推荐实施优先级

### 第一阶段（立即实施）
1. ✅ **积分滚动上限**
   - 最直接有效的风险控制
   - 对用户影响最小（12个月足够使用）
   - 技术实现简单

### 第二阶段（3-6个月后）
2. ⏳ **不活跃清零**
   - 需要在服务条款中明确说明
   - 需要建立用户沟通流程
   - 给予用户充分的准备时间

### 第三阶段（根据需要）
3. 🔮 **使用速率限制**
   - 仅在发现滥用行为时实施
   - 可能影响用户体验
   - 需要仔细设计豁免机制

---

## 📝 用户沟通模板

### 积分上限说明
```
您的 Pro 订阅每月提供 300 积分，这些积分永久有效，可以累积使用。
为了确保系统公平性，您的账户最多可以持有 3,600 积分（12个月配额）。

当您达到上限时：
• 您可以继续使用现有积分
• 新积分将在您使用部分积分后才会发放
• 我们会提前通知您接近上限

建议：定期使用积分，享受我们的服务，避免浪费！
```

### 不活跃提醒邮件
```
主题：您的账户已经9个月未使用

亲爱的用户：

我们注意到您已经9个月没有使用 QiFlow AI 了。
您的账户中还有 XXX 积分。

根据我们的政策，连续12个月不活跃的账户积分将被清零。
请在3个月内登录使用，以保留您的积分。

[立即登录使用]

如有任何问题，请联系我们的客服。
```

---

## 🎯 总结

通过以上风险控制策略，我们可以：

1. **保护公司财务健康**：避免无限累积的负债
2. **保持用户友好**：12个月上限足够绝大多数用户使用
3. **鼓励活跃使用**：让积分真正产生价值，而不是囤积
4. **维护系统公平**：防止极端用户影响服务质量

**关键原则**：风险控制措施应该是"不可见的"——对于正常使用的用户，他们永远不会遇到这些限制。
