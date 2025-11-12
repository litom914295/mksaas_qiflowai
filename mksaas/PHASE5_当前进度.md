# Phase 5 当前进度 - A/B 测试与主题推荐

**开始时间**: 2025-01-12 00:30 UTC+8  
**当前状态**: 进行中 (40% 完成)  
**预计完成**: 2025-01-12 08:00 UTC+8

---

## ✅ 已完成 (40%)

### 1. 数据库 Schema (100%)
- ✅ 创建 `ab_test_experiments` 表 (实验配置)
- ✅ 创建 `ab_test_assignments` 表 (用户分组)
- ✅ 创建 `ab_test_events` 表 (事件追踪)
- ✅ 初始化 `theme_recommendation_v1` 实验
- ✅ 执行数据库迁移成功

**文件**:
- `drizzle/0003_phase5_ab_test.sql` (113 行)

### 2. A/B 测试核心模块 (100%)
- ✅ 创建 `ABTestManager` 类
- ✅ 实现用户分组算法 (MD5 哈希分桶)
- ✅ 实现事件追踪函数
- ✅ 实现变体获取函数
- ✅ 实现奖励检查函数

**文件**:
- `src/lib/ab-test/manager.ts` (218 行)

---

## ⏳ 进行中 (0%)

### 3. 主题推荐算法
- [ ] 创建 `src/lib/qiflow/theme-recommendation.ts`
- [ ] 基于五行分析推荐主题
- [ ] 基于年龄推荐主题
- [ ] 基于性别推荐主题
- [ ] A/B 测试集成

### 4. 前端集成
- [ ] 在购买页面展示推荐主题
- [ ] 添加 "采纳推荐" 按钮
- [ ] 追踪用户选择行为
- [ ] 显示参与奖励提示

### 5. 积分奖励机制
- [ ] 创建 Action: `rewardABTestParticipation`
- [ ] 防止重复奖励逻辑
- [ ] 集成到购买流程

---

## 📊 技术亮点

### 1. 哈希分桶算法
```typescript
// 确保相同用户始终分配到相同变体
private assignVariant(userId: string, variants: VariantConfig[]): string {
  // 1. MD5 哈希
  const hash = createHash("md5").update(userId).digest("hex");
  const hashNum = parseInt(hash.substring(0, 8), 16);
  
  // 2. 按权重分桶
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const bucket = hashNum % totalWeight;
  
  // 3. 分配变体
  let cumulativeWeight = 0;
  for (const variant of variants) {
    cumulativeWeight += variant.weight;
    if (bucket < cumulativeWeight) {
      return variant.id;
    }
  }
  
  return variants[0].id;
}
```

**优势**:
- 确定性：相同用户始终得到相同结果
- 均匀分布：哈希保证均匀分布
- 灵活权重：支持非 50/50 分组

### 2. 事件追踪
```typescript
await abTestManager.trackEvent({
  experimentName: "theme_recommendation_v1",
  userId: "user_123",
  eventType: "recommendation_adopted",
  eventData: {
    adoptedThemes: ["career", "health", "family"],
    timestamp: Date.now(),
  },
});
```

**追踪事件类型**:
- `recommendation_view`: 用户看到推荐
- `recommendation_adopted`: 用户采纳推荐
- `recommendation_modified`: 用户修改推荐
- `purchase_completed`: 完成购买
- `reward`: 领取奖励

---

## 🎯 下一步任务 (按优先级)

### 任务 1: 主题推荐算法 (2 小时)
```typescript
// 需要实现的函数
export function recommendThemes(params: {
  baziData: BaziData;
  birthDate: string;
  gender: "male" | "female";
}): ThemeId[] {
  // 1. 五行分析 (40% 权重)
  // 2. 年龄分析 (30% 权重)
  // 3. 性别分析 (20% 权重)
  // 4. 玄空飞星加成 (10% 权重)
  
  // 返回得分最高的 3 个主题
}
```

### 任务 2: 前端集成 (2 小时)
- 在 `src/components/qiflow/essential-report-purchase-page.tsx` 中:
  1. 调用 A/B 测试获取变体
  2. 根据变体显示默认推荐或智能推荐
  3. 添加 "采纳推荐" 按钮
  4. 追踪用户行为

### 任务 3: 积分奖励 (1 小时)
- 创建 `src/actions/qiflow/claim-ab-test-reward.ts`
- 检查是否已领取
- 发放 10 积分
- 记录奖励事件

---

## 📁 文件结构

```
src/
├── lib/
│   ├── ab-test/
│   │   └── manager.ts          # ✅ A/B 测试管理器 (218 行)
│   └── qiflow/
│       └── theme-recommendation.ts  # ⏳ 主题推荐算法 (待创建)
├── actions/qiflow/
│   └── claim-ab-test-reward.ts # ⏳ 奖励 Action (待创建)
└── components/qiflow/
    └── essential-report-purchase-page.tsx  # ⏳ 需要修改

drizzle/
└── 0003_phase5_ab_test.sql     # ✅ 迁移脚本 (113 行)

mksaas/docs/phase5/
├── Phase5实施计划.md           # ✅ 实施计划
└── PHASE5_当前进度.md          # ✅ 本文档
```

---

## 🎨 实验设计

### 实验名称: theme_recommendation_v1

**目标**: 提升报告购买转化率

**变体配置**:
```json
[
  {
    "id": "control",
    "weight": 50,
    "config": { "type": "default" }
  },
  {
    "id": "variant_a",
    "weight": 50,
    "config": { "type": "smart" }
  }
]
```

**Control 组**: 默认推荐 `['career', 'relationship', 'health']`

**Variant A 组**: 基于八字智能推荐 (根据五行、年龄、性别)

**成功指标**:
- 采纳率 > 60%
- 转化率提升 > 10%
- 平均购买金额提升 > 5%

---

## 📊 预期效果

### 假设数据
- 总用户: 1,000
- Control 组: 500 人
- Variant A 组: 500 人

### Control 组预期
- 采纳率: 30% (150 人采纳)
- 转化率: 10% (50 人购买)
- 平均购买金额: 120 积分

### Variant A 组预期
- 采纳率: 65% (325 人采纳) ← 提升 116%
- 转化率: 12% (60 人购买) ← 提升 20%
- 平均购买金额: 120 积分

### ROI 计算
- 额外转化用户: 10 人
- 额外收入: 10 × 120 = 1,200 积分
- 开发成本: 8 小时 × $50/小时 = $400
- 奖励成本: 325 × 10 积分 = 3,250 积分 (≈$32.5)
- **预期 ROI**: (1,200 - 32.5) / 400 = 292%

---

## 🚀 启动实验流程

1. **开发完成** (剩余 5 小时)
2. **测试验证** (1 小时)
   - 单元测试
   - 集成测试
   - 手动测试
3. **部署上线** (30 分钟)
4. **监控指标** (持续)
   - 每日查看采纳率
   - 每周分析转化率
   - 2 周后决定是否推广

---

## ✅ 验收标准

| 标准 | 状态 | 备注 |
|------|------|------|
| 数据表创建成功 | ✅ | 3 表 + 索引 |
| 用户分组稳定 | ✅ | 哈希分桶 |
| 事件追踪正常 | ✅ | 5 种事件类型 |
| 主题推荐准确 | ⏳ | 待实现 |
| 前端展示正确 | ⏳ | 待实现 |
| 积分奖励发放 | ⏳ | 待实现 |
| 防止重复奖励 | ⏳ | 待实现 |

---

**文档生成时间**: 2025-01-12 00:45 UTC+8  
**Phase 5 进度**: 40% (2/5 任务完成)  
**下一步**: 实现主题推荐算法
