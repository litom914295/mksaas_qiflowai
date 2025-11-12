# Phase 5 实施计划 - A/B 测试与主题推荐优化

**预计耗时**: 8 小时  
**优先级**: 高  
**依赖**: Phase 2 (Schema), Phase 3 (报告引擎), Phase 4 (购买流程)

---

## 🎯 目标

1. **A/B 测试基础设施**: 实现灵活的 A/B 测试框架，支持主题推荐、定价等实验
2. **主题推荐优化**: 基于用户八字特征智能推荐最适合的 3 个主题
3. **参与激励**: 用户参与 A/B 测试可获得积分奖励

---

## 📋 任务清单

### 1. A/B 测试数据表设计 (1 小时)
- [ ] 创建 `ab_test_experiments` 表 (实验配置)
- [ ] 创建 `ab_test_assignments` 表 (用户分组)
- [ ] 创建 `ab_test_events` 表 (事件追踪)
- [ ] 扩展 `credit_transaction` 类型 (AB_TEST_BONUS)

### 2. A/B 测试核心模块 (2 小时)
- [ ] 创建 `src/lib/ab-test/` 目录
- [ ] 实现 `ABTestManager` 类
- [ ] 实现用户分组算法 (哈希分桶)
- [ ] 实现事件追踪函数
- [ ] 实现变体获取函数

### 3. 主题推荐算法 (2 小时)
- [ ] 创建 `src/lib/qiflow/theme-recommendation.ts`
- [ ] 基于五行分析推荐主题
- [ ] 基于年龄推荐主题
- [ ] 基于性别推荐主题
- [ ] A/B 测试：智能推荐 vs 默认推荐

### 4. 前端集成 (2 小时)
- [ ] 在购买页面展示推荐主题
- [ ] 添加 "采纳推荐" 按钮
- [ ] 追踪用户选择行为
- [ ] 显示参与奖励提示

### 5. 积分奖励机制 (1 小时)
- [ ] 用户采纳推荐 → 奖励 10 积分
- [ ] 创建 Action: `rewardABTestParticipation`
- [ ] 防止重复奖励 (每个实验只奖励一次)

---

## 🗂️ 数据库 Schema

### 1. ab_test_experiments (实验配置表)
```sql
CREATE TABLE ab_test_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 实验基本信息
  name text NOT NULL UNIQUE,           -- 'theme_recommendation_v1'
  description text,
  status text NOT NULL DEFAULT 'draft', -- 'draft' | 'active' | 'paused' | 'completed'
  
  -- 变体配置
  variants jsonb NOT NULL,              -- [{ id: 'control', weight: 50 }, { id: 'variant_a', weight: 50 }]
  
  -- 时间控制
  start_date timestamp,
  end_date timestamp,
  
  -- 目标指标
  goal_metric text,                     -- 'conversion_rate' | 'revenue' | 'engagement'
  
  -- 元数据
  metadata jsonb,
  
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX ab_test_experiments_name_idx ON ab_test_experiments(name);
CREATE INDEX ab_test_experiments_status_idx ON ab_test_experiments(status);
```

### 2. ab_test_assignments (用户分组表)
```sql
CREATE TABLE ab_test_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  experiment_id uuid NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  
  variant_id text NOT NULL,             -- 'control' | 'variant_a'
  
  assigned_at timestamp DEFAULT now() NOT NULL,
  
  UNIQUE(experiment_id, user_id)
);

CREATE INDEX ab_test_assignments_experiment_idx ON ab_test_assignments(experiment_id);
CREATE INDEX ab_test_assignments_user_idx ON ab_test_assignments(user_id);
```

### 3. ab_test_events (事件追踪表)
```sql
CREATE TABLE ab_test_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  experiment_id uuid NOT NULL REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES ab_test_assignments(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  
  event_type text NOT NULL,             -- 'view' | 'click' | 'conversion' | 'reward'
  event_data jsonb,                     -- { themeId, adopted: true, ... }
  
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE INDEX ab_test_events_experiment_idx ON ab_test_events(experiment_id);
CREATE INDEX ab_test_events_assignment_idx ON ab_test_events(assignment_id);
CREATE INDEX ab_test_events_user_idx ON ab_test_events(user_id);
CREATE INDEX ab_test_events_type_idx ON ab_test_events(event_type);
```

---

## 🧪 A/B 测试实验设计

### 实验 1: 主题推荐算法
**名称**: `theme_recommendation_v1`  
**目标**: 提升报告购买转化率  
**变体**:
- **Control (50%)**: 默认推荐 ['career', 'relationship', 'health']
- **Variant A (50%)**: 基于八字智能推荐

**追踪事件**:
- `recommendation_view`: 用户看到推荐
- `recommendation_adopted`: 用户采纳推荐
- `recommendation_modified`: 用户修改推荐
- `purchase_completed`: 完成购买

**成功指标**:
- 采纳率 > 60%
- 转化率提升 > 10%

---

## 🎨 主题推荐算法设计

### 算法逻辑
```typescript
function recommendThemes(baziData: BaziData): ThemeId[] {
  const scores: Record<ThemeId, number> = {
    career: 0,
    relationship: 0,
    health: 0,
    education: 0,
    family: 0,
  };
  
  // 1. 五行分析 (40% 权重)
  if (baziData.elements.wood > 2) scores.career += 20;    // 木旺适合事业
  if (baziData.elements.fire > 2) scores.relationship += 20; // 火旺适合感情
  if (baziData.elements.earth > 2) scores.health += 20;   // 土旺关注健康
  if (baziData.elements.metal > 2) scores.education += 20; // 金旺适合学业
  if (baziData.elements.water > 2) scores.family += 20;   // 水旺重视家庭
  
  // 2. 年龄分析 (30% 权重)
  const age = calculateAge(baziData.birthDate);
  if (age < 25) {
    scores.education += 15;
    scores.career += 10;
  } else if (age < 35) {
    scores.career += 15;
    scores.relationship += 10;
  } else if (age < 50) {
    scores.health += 15;
    scores.family += 10;
  } else {
    scores.health += 20;
    scores.family += 15;
  }
  
  // 3. 性别分析 (20% 权重)
  if (baziData.gender === 'male') {
    scores.career += 10;
  } else {
    scores.relationship += 10;
    scores.family += 5;
  }
  
  // 4. 玄空飞星加成 (10% 权重)
  // ...
  
  // 选择得分最高的 3 个主题
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([theme]) => theme as ThemeId);
}
```

---

## 🎁 激励机制

### 奖励规则
1. **采纳推荐奖励**: 用户采纳智能推荐 → 奖励 10 积分
2. **完成购买奖励**: 采纳推荐并完成购买 → 额外奖励 10 积分
3. **一次性奖励**: 每个实验每个用户只能获得一次奖励

### 防刷机制
- 检查用户是否已获得该实验奖励
- 检查用户行为是否真实 (时间间隔、操作序列)
- 限制单日最大奖励次数

---

## 📊 数据分析指标

### 实验效果评估
```sql
-- 1. 采纳率
SELECT 
  variant_id,
  COUNT(DISTINCT CASE WHEN event_type = 'recommendation_adopted' THEN user_id END) * 1.0 /
  COUNT(DISTINCT CASE WHEN event_type = 'recommendation_view' THEN user_id END) AS adoption_rate
FROM ab_test_events
WHERE experiment_id = 'xxx'
GROUP BY variant_id;

-- 2. 转化率
SELECT 
  variant_id,
  COUNT(DISTINCT CASE WHEN event_type = 'purchase_completed' THEN user_id END) * 1.0 /
  COUNT(DISTINCT CASE WHEN event_type = 'recommendation_view' THEN user_id END) AS conversion_rate
FROM ab_test_events
WHERE experiment_id = 'xxx'
GROUP BY variant_id;

-- 3. 平均购买金额
SELECT 
  variant_id,
  AVG((event_data->>'creditsUsed')::int) AS avg_purchase_amount
FROM ab_test_events
WHERE experiment_id = 'xxx' AND event_type = 'purchase_completed'
GROUP BY variant_id;
```

---

## 🔧 API 设计

### 1. 获取用户实验变体
```typescript
GET /api/ab-test/variant?experiment=theme_recommendation_v1

Response:
{
  experimentId: "uuid",
  experimentName: "theme_recommendation_v1",
  variantId: "variant_a",
  variantData: { recommendedThemes: ["career", "health", "family"] }
}
```

### 2. 追踪事件
```typescript
POST /api/ab-test/track

Body:
{
  experimentName: "theme_recommendation_v1",
  eventType: "recommendation_adopted",
  eventData: { adoptedThemes: ["career", "health", "family"] }
}
```

### 3. 领取参与奖励
```typescript
POST /api/ab-test/claim-reward

Body:
{
  experimentName: "theme_recommendation_v1"
}

Response:
{
  success: true,
  creditsEarned: 10
}
```

---

## ✅ 验收标准

| 标准 | 描述 |
|------|------|
| 数据表创建成功 | 3 张表 + 索引 |
| 用户分组算法正常 | 50/50 分组稳定 |
| 事件追踪正常 | 4 种事件类型 |
| 主题推荐准确 | 基于八字特征 |
| 积分奖励发放 | 防止重复奖励 |
| 前端展示正确 | 推荐主题 + 奖励提示 |

---

## 🚀 实施顺序

1. **Day 1 上午** (3 小时):
   - 数据库 Schema 设计与迁移
   - ABTestManager 核心模块

2. **Day 1 下午** (3 小时):
   - 主题推荐算法
   - 前端集成

3. **Day 2** (2 小时):
   - 积分奖励机制
   - 测试与验证

---

**文档生成时间**: 2025-01-12 00:30 UTC+8  
**Phase 5 状态**: 待开始  
**下一步**: 创建数据库 Schema
