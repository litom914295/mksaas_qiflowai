# 气流AI 病毒增长策略2.0
## 基于现有积分系统的生活助手定位增长方案

---

## 一、现状分析

### 1.1 现有积分系统架构
```
✅ 已实现功能：
- 积分类型：注册赠送(50积分)、月度刷新、购买充值、订阅续费
- 积分管理：FIFO消耗、过期机制(30天)、余额追踪
- 积分包：4个级别(100/200/500/1000积分)
- 用户体系：账号系统、积分余额、交易记录

❌ 缺失功能：
- 邀请推荐系统
- 社交分享奖励
- 任务成就体系
- 积分排行榜
- 团队/社群机制
```

### 1.2 产品定位重新理解
**"AI生活助手"** = 八字风水 + 日常指导 + 情感陪伴

用户核心需求：
1. **日常决策**：今日运势、吉时选择、方位指导
2. **人生规划**：职业建议、感情指南、财运分析  
3. **环境优化**：家居风水、办公布局、化煞建议
4. **心理支持**：情绪疏导、压力缓解、信心建立

---

## 二、病毒增长核心策略

### 2.1 增长公式升级
```
病毒系数 K = (邀请率 × 转化率 × 平均邀请数) × 社交放大器

目标：K > 1.5 (形成自增长)
现状：K = 0 (无邀请系统)
```

### 2.2 三层飞轮模型

#### 第一层：个人价值飞轮
```
免费体验(50积分) → 获得准确分析 → 产生信任 → 分享意愿
```

#### 第二层：社交传播飞轮  
```
分享内容 → 朋友注册 → 双方获益 → 更多分享
```

#### 第三层：社群增长飞轮
```
组建团队 → 集体收益 → 竞争排名 → 扩大团队
```

---

## 三、具体实施方案

### 3.1 邀请奖励系统（第1阶段：第1-2周）

#### 3.1.1 双向奖励机制
```typescript
// 新增积分类型
export enum CREDIT_TRANSACTION_TYPE {
  // ... 现有类型
  REFERRAL_REWARD = 'REFERRAL_REWARD',        // 推荐人奖励
  REFEREE_BONUS = 'REFEREE_BONUS',            // 被推荐人奖励  
  SHARE_REWARD = 'SHARE_REWARD',              // 分享奖励
  TASK_COMPLETE = 'TASK_COMPLETE',            // 任务完成
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',   // 成就解锁
}

// 奖励配置
const referralRewards = {
  // 直接推荐奖励
  directReferral: {
    referrer: 30,      // 推荐人获得30积分
    referee: 20,       // 新用户额外获得20积分(总计70)
    maxDaily: 5,       // 每日最多5个有效推荐
  },
  // 间接推荐奖励(二级)
  indirectReferral: {
    referrer: 10,      // 间接推荐人获得10积分
    enabled: true,     // 开启二级奖励
  },
  // 里程碑奖励
  milestones: [
    { count: 3, reward: 50, name: "初级推广大使" },
    { count: 10, reward: 200, name: "中级推广大使" },
    { count: 30, reward: 500, name: "高级推广大使" },
    { count: 100, reward: 2000, name: "超级推广大使" },
  ]
}
```

#### 3.1.2 推荐码系统
```typescript
interface ReferralCode {
  code: string;           // 6位唯一码: "QF8888"
  userId: string;         // 所属用户
  customCode?: string;    // VIP自定义码
  usageCount: number;     // 使用次数
  totalRewards: number;   // 累计奖励
  expireAt?: Date;        // 过期时间(可选)
}
```

### 3.2 社交分享激励（第1阶段：同步实施）

#### 3.2.1 分享内容模板
```typescript
const shareTemplates = {
  // 运势分享
  dailyFortune: {
    title: "我的今日运势：财运亨通⭐⭐⭐⭐⭐",
    content: "气流AI为我精准分析了今日运势，太准了！",
    image: "dynamic_fortune_card.png",
    reward: 5,  // 分享获得5积分
  },
  // 八字分析分享
  baziAnalysis: {
    title: "原来我是${element}命人，性格解析太准了！",
    content: "刚用气流AI测了八字，准确度让我震惊...",
    image: "bazi_result_card.png", 
    reward: 10,
  },
  // 风水建议分享
  fengshuiTips: {
    title: "2025年财位在${direction}，你家的财位找对了吗？",
    content: "气流AI帮我找到了家里的财位和文昌位...",
    image: "fengshui_layout.png",
    reward: 10,
  },
  // 成就分享
  achievement: {
    title: "我在气流AI获得了「${achievementName}」成就！",
    content: "连续使用${days}天，解锁了特殊称号...",
    image: "achievement_badge.png",
    reward: 15,
  }
}
```

#### 3.2.2 分享追踪与防刷
```typescript
interface ShareTracking {
  userId: string;
  shareType: string;
  platform: 'wechat' | 'weibo' | 'douyin' | 'xiaohongshu';
  shareTime: Date;
  clickCount: number;      // 点击次数
  conversionCount: number; // 转化次数
  rewardGranted: boolean;  // 是否已发放奖励
}

// 防刷规则
const antiCheatRules = {
  minViewTime: 10,        // 最少停留10秒
  maxDailyShares: 3,      // 每日最多奖励3次分享
  uniqueIPRequired: true, // 需要不同IP点击
  cooldownMinutes: 60,    // 分享间隔1小时
}
```

### 3.3 每日任务系统（第2阶段：第3-4周）

#### 3.3.1 任务类型设计
```typescript
const dailyTasks = {
  // 基础任务
  basic: [
    { id: 'daily_login', name: '每日登录', reward: 5, icon: '📅' },
    { id: 'daily_fortune', name: '查看今日运势', reward: 10, icon: '🔮' },
    { id: 'ai_chat', name: 'AI对话3轮', reward: 15, icon: '💬' },
  ],
  // 社交任务
  social: [
    { id: 'share_result', name: '分享分析结果', reward: 20, icon: '📤' },
    { id: 'invite_friend', name: '邀请1位好友', reward: 30, icon: '👥' },
    { id: 'help_friend', name: '帮助好友解答', reward: 15, icon: '🤝' },
  ],
  // 深度任务
  advanced: [
    { id: 'complete_profile', name: '完善个人资料', reward: 25, icon: '👤' },
    { id: 'fengshui_analysis', name: '完成风水分析', reward: 30, icon: '🏠' },
    { id: 'weekly_report', name: '生成周运报告', reward: 40, icon: '📊' },
  ]
}

// 连续完成奖励
const streakBonus = {
  3: 30,   // 连续3天
  7: 100,  // 连续7天
  30: 500, // 连续30天
}
```

#### 3.3.2 成就系统
```typescript
const achievements = {
  // 使用成就
  usage: [
    { id: 'first_analysis', name: '初次体验', condition: 'complete_first_bazi', reward: 20 },
    { id: 'fortune_teller', name: '命理达人', condition: 'analyses_count >= 10', reward: 100 },
    { id: 'fengshui_master', name: '风水大师', condition: 'fengshui_count >= 5', reward: 150 },
  ],
  // 社交成就
  social: [
    { id: 'influencer_1', name: '人气新星', condition: 'referrals >= 5', reward: 100 },
    { id: 'influencer_2', name: '社交达人', condition: 'referrals >= 20', reward: 500 },
    { id: 'influencer_3', name: '推广大使', condition: 'referrals >= 50', reward: 1500 },
  ],
  // 活跃成就
  activity: [
    { id: 'week_active', name: '周活跃用户', condition: 'login_days >= 7', reward: 50 },
    { id: 'month_active', name: '月度之星', condition: 'login_days >= 30', reward: 200 },
    { id: 'year_active', name: '年度用户', condition: 'login_days >= 365', reward: 2000 },
  ]
}
```

### 3.4 团队/家庭系统（第3阶段：第5-6周）

#### 3.4.1 家庭组功能
```typescript
interface FamilyGroup {
  id: string;
  name: string;             // "张家风水团"
  creatorId: string;
  members: FamilyMember[];
  sharedCredits: number;    // 共享积分池
  level: number;             // 家族等级
  benefits: string[];        // 家族特权
}

interface FamilyMember {
  userId: string;
  role: 'creator' | 'admin' | 'member';
  contribution: number;      // 贡献积分数
  joinedAt: Date;
}

// 家族特权
const familyBenefits = {
  level1: ['积分共享', '家族风水报告'],
  level2: ['额外10%积分加成', '专属客服'],
  level3: ['每月200免费积分', 'VIP功能解锁'],
}
```

#### 3.4.2 排行榜系统
```typescript
const leaderboards = {
  // 个人排行
  personal: {
    daily: { reset: '00:00', reward: [50, 30, 20] },
    weekly: { reset: 'Monday', reward: [200, 100, 50] },
    monthly: { reset: '1st', reward: [1000, 500, 300] },
  },
  // 团队排行
  team: {
    weekly: { reset: 'Monday', reward: [500, 300, 200] },
    monthly: { reset: '1st', reward: [2000, 1000, 500] },
  }
}
```

### 3.5 裂变活动模板（持续运营）

#### 3.5.1 限时活动
```typescript
const viralCampaigns = {
  // 新年活动
  newYear: {
    name: "2025新年运势大转盘",
    duration: "2025-01-20 to 2025-02-10",
    mechanics: "邀请好友助力，解锁转盘次数",
    rewards: [
      { probability: 0.4, reward: "10积分" },
      { probability: 0.3, reward: "30积分" },
      { probability: 0.2, reward: "50积分" },
      { probability: 0.08, reward: "100积分" },
      { probability: 0.02, reward: "1000积分" },
    ]
  },
  // 拼团活动
  groupBuy: {
    name: "积分拼团",
    mechanics: "3人拼团，每人获得150积分(原价100积分/人)",
    discount: "50%",
    minMembers: 3,
  },
  // 助力活动
  boost: {
    name: "好友助力得积分",
    mechanics: "邀请5位好友助力，获得100积分",
    stages: [
      { helpers: 1, reward: 10 },
      { helpers: 3, reward: 30 },
      { helpers: 5, reward: 100 },
    ]
  }
}
```

---

## 四、数据库设计

### 4.1 新增数据表

```sql
-- 推荐关系表
CREATE TABLE referral_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id VARCHAR(255) NOT NULL,      -- 推荐人
  referee_id VARCHAR(255) NOT NULL,       -- 被推荐人
  referral_code VARCHAR(20),              -- 使用的推荐码
  level INTEGER DEFAULT 1,                -- 推荐层级(1=直接,2=间接)
  status VARCHAR(20) DEFAULT 'pending',   -- pending/active/expired
  reward_granted BOOLEAN DEFAULT false,   -- 是否已发放奖励
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_at TIMESTAMP,                 -- 激活时间
  FOREIGN KEY (referrer_id) REFERENCES "user"(id),
  FOREIGN KEY (referee_id) REFERENCES "user"(id)
);

-- 推荐码表
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,       -- 推荐码
  user_id VARCHAR(255) NOT NULL,          -- 所属用户
  custom_code VARCHAR(20),                -- VIP自定义码
  usage_count INTEGER DEFAULT 0,          -- 使用次数
  max_usage INTEGER,                      -- 最大使用次数
  total_rewards INTEGER DEFAULT 0,        -- 累计奖励积分
  expire_at TIMESTAMP,                    -- 过期时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- 分享记录表
CREATE TABLE share_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  share_type VARCHAR(50) NOT NULL,        -- dailyFortune/baziAnalysis等
  platform VARCHAR(20),                   -- wechat/weibo/douyin等
  share_url TEXT,                         -- 分享链接
  click_count INTEGER DEFAULT 0,          -- 点击次数
  conversion_count INTEGER DEFAULT 0,     -- 转化次数
  reward_granted BOOLEAN DEFAULT false,   -- 是否已发放奖励
  reward_amount INTEGER DEFAULT 0,        -- 奖励积分数
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- 任务进度表
CREATE TABLE task_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  task_id VARCHAR(50) NOT NULL,           -- 任务ID
  task_type VARCHAR(20),                  -- daily/weekly/achievement
  progress INTEGER DEFAULT 0,             -- 当前进度
  target INTEGER NOT NULL,                -- 目标值
  completed BOOLEAN DEFAULT false,        -- 是否完成
  reward_claimed BOOLEAN DEFAULT false,   -- 是否已领取奖励
  completed_at TIMESTAMP,                 -- 完成时间
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES "user"(id)
);

-- 成就记录表
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,    -- 成就ID
  achievement_name VARCHAR(100),          -- 成就名称
  achievement_level INTEGER DEFAULT 1,    -- 成就等级
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reward_amount INTEGER,                  -- 奖励积分
  FOREIGN KEY (user_id) REFERENCES "user"(id),
  UNIQUE(user_id, achievement_id)
);

-- 家族/团队表
CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,             -- 家族名称
  creator_id VARCHAR(255) NOT NULL,       -- 创建者
  shared_credits INTEGER DEFAULT 0,       -- 共享积分池
  level INTEGER DEFAULT 1,                -- 家族等级
  member_count INTEGER DEFAULT 1,         -- 成员数量
  total_contribution INTEGER DEFAULT 0,   -- 总贡献值
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES "user"(id)
);

-- 家族成员表
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'member',      -- creator/admin/member
  contribution INTEGER DEFAULT 0,         -- 贡献积分
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES family_groups(id),
  FOREIGN KEY (user_id) REFERENCES "user"(id),
  UNIQUE(family_id, user_id)
);

-- 创建索引优化查询性能
CREATE INDEX idx_referral_referrer ON referral_relationships(referrer_id);
CREATE INDEX idx_referral_referee ON referral_relationships(referee_id);
CREATE INDEX idx_referral_code ON referral_codes(code);
CREATE INDEX idx_share_user_type ON share_records(user_id, share_type);
CREATE INDEX idx_task_user_type ON task_progress(user_id, task_type);
CREATE INDEX idx_achievement_user ON achievements(user_id);
CREATE INDEX idx_family_members_user ON family_members(user_id);
```

---

## 五、实施路线图

### 第1阶段（第1-2周）：基础病毒机制
- [ ] 实现推荐码生成和验证
- [ ] 双向奖励积分发放
- [ ] 分享卡片生成器
- [ ] 基础防作弊机制

### 第2阶段（第3-4周）：激励深化
- [ ] 每日任务系统
- [ ] 成就系统框架
- [ ] 连续签到奖励
- [ ] 排行榜展示

### 第3阶段（第5-6周）：社群化
- [ ] 家族系统
- [ ] 团队积分池
- [ ] 群体活动功能
- [ ] 社交互动功能

### 第4阶段（第7-8周）：优化迭代
- [ ] 数据分析仪表板
- [ ] A/B测试框架
- [ ] 个性化推荐
- [ ] 高级防作弊

---

## 六、预期效果

### 6.1 增长预测
```
第1月：K=0.8，用户5,000
第2月：K=1.2，用户20,000
第3月：K=1.5，用户80,000
第6月：K=1.8，用户500,000+
```

### 6.2 关键指标
- **推荐率**：30%用户会邀请朋友
- **转化率**：被邀请用户50%会注册
- **平均邀请数**：每用户邀请3-5人
- **留存率**：7日留存50%，30日留存30%

### 6.3 收入模型
```
用户获取成本(CAC)：0元(纯病毒增长)
用户生命周期价值(LTV)：
- 免费用户：贡献内容和传播价值
- 付费转化：5%用户购买积分包
- 平均客单价：30元
- LTV/CAC = ∞ (极高投资回报)
```

---

## 七、风险控制

### 7.1 防作弊措施
- IP地址验证
- 设备指纹识别
- 行为模式分析
- 人机验证(必要时)

### 7.2 积分通胀控制
- 动态调整奖励数值
- 设置每日上限
- 积分过期机制
- 消费场景扩展

### 7.3 用户体验保护
- 避免过度营销
- 保护用户隐私
- 维持内容质量
- 快速客服响应

---

## 八、落地执行checklist

### 立即可做(Day 1-3)
- [x] 在website.tsx增加推荐奖励配置
- [x] 创建推荐码生成API
- [x] 注册页面增加推荐码输入
- [x] 实现基础双向奖励

### 本周完成(Day 4-7)
- [ ] 分享卡片设计和生成
- [ ] 微信分享SDK集成
- [ ] 推荐数据统计页面
- [ ] 防刷机制第一版

### 下周目标(Week 2)
- [ ] 每日任务系统上线
- [ ] 成就系统框架
- [ ] 推送通知集成
- [ ] 数据看板搭建

---

*策略版本：2.0*
*更新日期：2025-01-11*
*优化基础：现有积分系统+生活助手定位*