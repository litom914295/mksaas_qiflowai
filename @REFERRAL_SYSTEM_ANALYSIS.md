# 🔍 转介绍/营销裂变功能分析报告

**分析时间**: 2025-10-11  
**项目**: mksaas_qiflowai (气流AI)

---

## 📊 当前积分系统状态

### ✅ 已实现的积分功能

从代码分析来看，项目**已经有完整的积分系统**，包括：

#### 1. 积分类型 (`src/credits/types.ts`)
```typescript
export enum CREDIT_TRANSACTION_TYPE {
  MONTHLY_REFRESH = 'MONTHLY_REFRESH',        // 月度免费积分
  REGISTER_GIFT = 'REGISTER_GIFT',            // 注册赠送积分
  PURCHASE_PACKAGE = 'PURCHASE_PACKAGE',      // 购买积分包
  SUBSCRIPTION_RENEWAL = 'SUBSCRIPTION_RENEWAL', // 订阅续费积分
  LIFETIME_MONTHLY = 'LIFETIME_MONTHLY',      // 终身用户月度积分
  USAGE = 'USAGE',                            // 积分消费
  EXPIRE = 'EXPIRE',                          // 积分过期
}
```

#### 2. 积分管理功能 (`src/credits/credits.ts`)
- ✅ `getUserCredits()` - 获取用户积分余额
- ✅ `addCredits()` - 添加积分
- ✅ `consumeCredits()` - 消费积分
- ✅ `addRegisterGiftCredits()` - 注册赠送积分
- ✅ `addMonthlyFreeCredits()` - 月度免费积分
- ✅ 积分过期管理
- ✅ 积分交易记录

#### 3. 数据库表结构
基于代码推测，应该有以下表：
- `userCredit` - 用户积分余额表
- `creditTransaction` - 积分交易记录表

#### 4. 前端组件
- ✅ 积分显示组件 (`src/components/layout/credits-*.tsx`)
- ✅ 积分购买组件
- ✅ 积分统计页面

---

## ❌ 缺失的转介绍/营销裂变功能

### 转介绍系统功能缺失

经过全面搜索，**没有找到**以下转介绍相关功能：

#### 1. 缺失的积分类型
```typescript
// 需要添加到 CREDIT_TRANSACTION_TYPE
REFERRAL_BONUS = 'REFERRAL_BONUS',          // 推荐奖励
REFERRED_BONUS = 'REFERRED_BONUS',          // 被推荐奖励
```

#### 2. 缺失的数据库表
- `referrals` - 推荐关系表
- `referral_rewards` - 推荐奖励记录表

#### 3. 缺失的核心功能
- 邀请码生成系统
- 推荐链接追踪
- 推荐奖励发放
- 推荐统计面板

#### 4. 缺失的前端页面
- 推荐好友页面
- 邀请码分享页面
- 推荐收益统计页面

---

## 🎯 转介绍系统实施方案

### 方案 A：数据库表结构设计

#### 1. 推荐关系表 (referrals)

```sql
CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  referrer_id TEXT NOT NULL,              -- 推荐人ID
  referred_id TEXT NOT NULL,              -- 被推荐人ID
  referral_code TEXT NOT NULL,            -- 邀请码
  status TEXT DEFAULT 'pending',          -- 状态：pending/completed/rewarded
  referrer_reward_amount INTEGER DEFAULT 0, -- 推荐人获得积分
  referred_reward_amount INTEGER DEFAULT 0, -- 被推荐人获得积分
  completed_at TIMESTAMP,                 -- 完成时间
  rewarded_at TIMESTAMP,                  -- 奖励发放时间
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 外键约束
  FOREIGN KEY (referrer_id) REFERENCES "user"(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES "user"(id) ON DELETE CASCADE,
  
  -- 唯一约束
  UNIQUE(referred_id),                    -- 每个用户只能被推荐一次
  UNIQUE(referral_code)                   -- 邀请码唯一
);
```

#### 2. 用户邀请码表 (user_referral_codes)

```sql
CREATE TABLE user_referral_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,                  -- 用户ID
  referral_code TEXT NOT NULL UNIQUE,     -- 邀请码
  total_referrals INTEGER DEFAULT 0,      -- 总推荐人数
  total_rewards INTEGER DEFAULT 0,        -- 总获得积分
  is_active BOOLEAN DEFAULT true,         -- 是否激活
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- 外键约束
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE
);
```

### 方案 B：积分类型扩展

#### 1. 更新积分类型

```typescript
// src/credits/types.ts 添加
export enum CREDIT_TRANSACTION_TYPE {
  // ... 现有类型
  REFERRAL_BONUS = 'REFERRAL_BONUS',          // 推荐奖励
  REFERRED_BONUS = 'REFERRED_BONUS',          // 被推荐奖励
}
```

#### 2. 推荐奖励配置

```typescript
// src/config/website.ts 添加
export const websiteConfig = {
  // ... 现有配置
  referral: {
    enable: true,                           // 启用推荐系统
    referrerReward: 100,                    // 推荐人奖励积分
    referredReward: 50,                     // 被推荐人奖励积分
    codeLength: 8,                          // 邀请码长度
    minimumActionForReward: 'register',     // 奖励触发条件：register/first_purchase
    maxReferralsPerUser: 100,               // 每用户最大推荐数
  }
}
```

### 方案 C：核心功能实现

#### 1. 推荐码生成函数

```typescript
// src/lib/referral.ts
export async function generateReferralCode(userId: string): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let exists = true;
  
  while (exists) {
    code = Array.from(
      { length: 8 }, 
      () => characters[Math.floor(Math.random() * characters.length)]
    ).join('');
    
    // 检查是否已存在
    exists = await checkReferralCodeExists(code);
  }
  
  return code;
}
```

#### 2. 推荐关系处理

```typescript
export async function handleReferralSignup(
  referredUserId: string, 
  referralCode?: string
): Promise<void> {
  if (!referralCode) return;
  
  // 查找推荐人
  const referrer = await findUserByReferralCode(referralCode);
  if (!referrer) return;
  
  // 创建推荐关系
  await createReferralRelationship(referrer.id, referredUserId, referralCode);
  
  // 发放奖励
  await distributeReferralRewards(referrer.id, referredUserId);
}
```

#### 3. 奖励发放函数

```typescript
export async function distributeReferralRewards(
  referrerId: string,
  referredId: string
): Promise<void> {
  const config = websiteConfig.referral;
  
  // 给推荐人奖励
  await addCredits({
    userId: referrerId,
    amount: config.referrerReward,
    type: CREDIT_TRANSACTION_TYPE.REFERRAL_BONUS,
    description: `推荐好友奖励: ${config.referrerReward} 积分`,
  });
  
  // 给被推荐人奖励
  await addCredits({
    userId: referredId,
    amount: config.referredReward,
    type: CREDIT_TRANSACTION_TYPE.REFERRED_BONUS,
    description: `新用户推荐奖励: ${config.referredReward} 积分`,
  });
}
```

---

## 🚀 实施建议

### 阶段 1：数据库设计（1天）
1. 创建推荐相关数据库表
2. 更新积分类型定义
3. 添加配置参数

### 阶段 2：后端API开发（2-3天）
1. 推荐码生成和验证
2. 推荐关系创建
3. 奖励发放逻辑
4. 推荐统计查询

### 阶段 3：前端页面开发（2-3天）
1. 邀请好友页面
2. 推荐码分享组件
3. 推荐收益统计页面
4. 注册页面添加邀请码输入

### 阶段 4：集成测试（1天）
1. 完整流程测试
2. 边界条件测试
3. 性能测试

---

## 📋 当前状态总结

### ✅ 已有基础
- **完整的积分系统** - 可直接基于现有系统扩展
- **用户认证系统** - 已完成，支持用户注册
- **数据库结构** - PostgreSQL + Drizzle ORM
- **前端框架** - Next.js + TypeScript + Tailwind

### ❌ 需要开发
- **推荐关系数据表** - 0%
- **推荐码生成系统** - 0%
- **推荐奖励逻辑** - 0%
- **前端推荐页面** - 0%

### 📊 开发工作量估算
- **后端开发**: 3-4天
- **前端开发**: 2-3天
- **测试集成**: 1天
- **总计**: 6-8天

---

## 🎯 立即可执行的第一步

### 现在就可以开始：

1. **创建数据库表**（我可以帮您生成 SQL）
2. **更新积分类型定义**
3. **添加基础配置**

**要开始实施吗？** 我可以立即为您：
1. 生成推荐系统的数据库表 SQL
2. 更新积分类型和配置文件
3. 创建基础的推荐功能代码

---

**结论**: 转介绍/营销裂变功能**尚未实现**，但项目已有完整的积分系统基础，可以快速开发实现。

**下一步**: 告诉我是否要开始实施，我立即为您创建完整的转介绍系统！🚀