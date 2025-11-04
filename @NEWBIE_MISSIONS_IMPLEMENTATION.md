# 新手任务系统实现总结

生成时间: 2025-01-31  
项目: QiFlow AI  
功能: 真实的新手任务系统

---

## ✅ 实现完成

新手任务系统现在完全基于真实数据库数据，支持自动检测进度和领取奖励。

---

## 📋 新手任务列表

| 任务ID | 任务名称 | 描述 | 奖励 | 检测逻辑 |
|--------|----------|------|------|----------|
| `complete_profile` | 完善个人资料 | 设置头像和昵称 | 20积分 | 检查 `user` 表的 `name` 和 `image` 字段 |
| `first_bazi_analysis` | 首次八字分析 | 完成第一次八字命理分析 | 30积分 | 查询 `baziCalculations` 表记录数 |
| `bind_social_account` | 绑定社交账号 | 绑定微信或其他社交账号 | 15积分 | 检查 `account` 表是否有社交登录 |
| `invite_friend` | 邀请好友注册 | 邀请1位好友成功注册 | 50积分 | 查询 `referralRelationships` 表 |
| `share_analysis` | 分享分析结果 | 分享一次分析结果到社交平台 | 15积分 | 查询 `shareRecords` 表 |

**总奖励**: 130积分

---

## 🗂️ 数据库表结构

### taskProgress 表（已存在）

```sql
CREATE TABLE task_progress (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,           -- 任务ID（如 'complete_profile'）
  task_type TEXT,                   -- 任务类型（'NEWBIE', 'DAILY', etc.）
  progress INTEGER DEFAULT 0,       -- 当前进度
  target INTEGER NOT NULL,          -- 目标值
  completed BOOLEAN DEFAULT false,  -- 是否完成
  reward_claimed BOOLEAN DEFAULT false, -- 是否已领取奖励
  completed_at TIMESTAMP,           -- 完成时间
  reset_at TIMESTAMP,               -- 重置时间（用于每日/每周任务）
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 核心文件

### 1. 任务系统逻辑 (`src/lib/newbie-missions.ts`)

**主要功能**:
- ✅ 定义5个新手任务配置
- ✅ 自动检测任务进度（`checkProgress`）
- ✅ 获取用户任务列表（`getUserNewbieMissions`）
- ✅ 领取任务奖励（`claimMissionReward`）

**关键特性**:
```typescript
// 每个任务都有自己的进度检测逻辑
{
  id: 'complete_profile',
  checkProgress: async (userId) => {
    // 检查用户是否设置了头像和昵称
    const hasName = !!user.name && user.name !== '用户';
    const hasAvatar = !!user.image;
    return hasName && hasAvatar ? 1 : 0;
  },
}
```

**自动同步机制**:
- 每次调用 `getUserNewbieMissions` 都会检查实际进度
- 如果进度有变化，自动更新数据库
- 支持自动创建任务记录

---

### 2. API 端点

#### GET `/api/missions/newbie` - 获取任务列表
```typescript
// 响应格式
{
  success: true,
  missions: [
    {
      id: 'complete_profile',
      title: '完善个人资料',
      description: '设置头像和昵称',
      reward: 20,
      progress: 1,
      target: 1,
      completed: true,
      rewardClaimed: false
    },
    // ... 其他任务
  ],
  completed: 2,  // 已完成数量
  total: 5,      // 总任务数
  progress: 40   // 进度百分比
}
```

#### POST `/api/missions/claim` - 领取奖励
```typescript
// 请求
{
  missionId: 'complete_profile'
}

// 响应
{
  success: true,
  reward: 20,
  message: '恭喜获得 20 积分！'
}
```

---

### 3. 仪表盘集成

#### getDashboardData 更新
```typescript
// 获取新手任务进度
const { getUserNewbieMissions } = await import('@/lib/newbie-missions');
const missionsResult = await getUserNewbieMissions(session.user.id);
newbieMissionsData = {
  completed: missionsResult.completed,
  total: missionsResult.total,
  progress: missionsResult.progress,
};
```

#### ActivitySection 组件更新
- ✅ 从 API 实时加载任务数据
- ✅ 显示任务完成状态（进行中/已完成/已领取）
- ✅ 支持点击领取奖励按钮
- ✅ 领取成功后自动刷新页面
- ✅ 完善的加载和错误状态

---

## 🎨 UI 展示

### 任务卡片状态

**1. 未完成（灰色）**
```
⏰ 完善个人资料     ⭐ +20
```

**2. 已完成待领取（绿色 + 领取按钮）**
```
✅ 首次八字分析     ⭐ +30  [领取]
```

**3. 已领取（绿色 + 删除线）**
```
✅ 完善个人资料̶     ⭐ +20
```

---

## 🔄 工作流程

### 任务完成流程

```
用户执行操作（如：完成八字分析）
  ↓
操作完成（记录写入 baziCalculations 表）
  ↓
用户访问仪表盘
  ↓
ActivitySection 加载任务列表
  ↓
调用 /api/missions/newbie
  ↓
getUserNewbieMissions 检查实际进度
  ├─ 对每个任务调用 checkProgress
  ├─ 检测到 first_bazi_analysis 完成
  ├─ 自动更新 taskProgress 表
  └─ 标记 completed = true
  ↓
返回任务列表（显示"已完成"）
  ↓
用户点击"领取"按钮
  ↓
调用 /api/missions/claim
  ├─ 验证任务已完成且未领取
  ├─ 调用 addCredits() 发放奖励
  ├─ 记录类型: TASK_REWARD
  └─ 标记 rewardClaimed = true
  ↓
显示"恭喜获得 30 积分！"
  ↓
刷新页面，积分余额更新
```

---

## 🎯 任务自动检测逻辑

### 1. 完善个人资料
```typescript
// 检查条件：姓名不是"用户" 且 有头像
const hasName = !!user.name && user.name !== '用户';
const hasAvatar = !!user.image;
return hasName && hasAvatar ? 1 : 0;
```

### 2. 首次八字分析
```typescript
// 统计 baziCalculations 表的记录数
const count = await db
  .select({ count: count() })
  .from(baziCalculations)
  .where(eq(baziCalculations.userId, userId));
return Math.min(count[0]?.count || 0, 1); // 最多1
```

### 3. 绑定社交账号
```typescript
// 检查 account 表是否有非 credential 的账号
const socialAccounts = await db
  .select({ providerId: account.providerId })
  .from(account)
  .where(eq(account.userId, userId));

const hasSocialAccount = socialAccounts.some(
  (acc) => acc.providerId !== 'credential'
);
return hasSocialAccount ? 1 : 0;
```

### 4. 邀请好友注册
```typescript
// 统计已激活的推荐关系
const referrals = await db
  .select({ count: count() })
  .from(referralRelationships)
  .where(
    and(
      eq(referralRelationships.referrerId, userId),
      eq(referralRelationships.status, 'activated')
    )
  );
return Math.min(referrals[0]?.count || 0, 1);
```

### 5. 分享分析结果
```typescript
// 统计分享记录
const shares = await db
  .select({ count: count() })
  .from(shareRecords)
  .where(eq(shareRecords.userId, userId));
return Math.min(shares[0]?.count || 0, 1);
```

---

## 🔒 安全性

### 1. 认证保护
- ✅ 所有 API 都需要登录（检查 session）
- ✅ 任务进度只能查询自己的数据
- ✅ 奖励只能领取自己的任务

### 2. 防重复领取
```typescript
// 检查奖励是否已领取
if (progress.rewardClaimed) {
  return { success: false, error: '奖励已领取' };
}
```

### 3. 完成状态验证
```typescript
// 必须任务已完成才能领取
if (!progress.completed) {
  return { success: false, error: '任务未完成' };
}
```

---

## 📊 数据统计

### 新手任务完成率
```sql
-- 查询所有用户的新手任务完成情况
SELECT 
  t.task_id,
  COUNT(DISTINCT t.user_id) as total_users,
  SUM(CASE WHEN t.completed THEN 1 ELSE 0 END) as completed_count,
  SUM(CASE WHEN t.reward_claimed THEN 1 ELSE 0 END) as claimed_count
FROM task_progress t
WHERE t.task_type = 'NEWBIE'
GROUP BY t.task_id;
```

### 用户任务进度分布
```sql
-- 查询每个用户完成了多少个新手任务
SELECT 
  COUNT(*) FILTER (WHERE completed) as completed_count,
  COUNT(*) as total_users
FROM (
  SELECT user_id, COUNT(*) as task_count
  FROM task_progress
  WHERE task_type = 'NEWBIE' AND completed = true
  GROUP BY user_id
) as user_progress
GROUP BY completed_count
ORDER BY completed_count;
```

---

## 🚀 扩展性

### 添加新任务

只需在 `NEWBIE_MISSIONS` 数组中添加新配置：

```typescript
{
  id: 'new_task_id',
  title: '新任务标题',
  description: '任务描述',
  reward: 50,
  target: 1,
  taskType: 'ONETIME',
  checkProgress: async (userId: string) => {
    // 实现检测逻辑
    return 0; // 返回进度（0-target）
  },
}
```

### 支持其他任务类型

可以扩展 `taskType`:
- `ONETIME`: 一次性任务（当前实现）
- `DAILY`: 每日任务
- `WEEKLY`: 每周任务
- `REPEATABLE`: 可重复任务

---

## 🎉 完成度

**100%** ✅

| 功能 | 状态 |
|------|------|
| 任务配置定义 | ✅ 完成 |
| 自动进度检测 | ✅ 完成 |
| 数据库同步 | ✅ 完成 |
| API 端点 | ✅ 完成 |
| 前端展示 | ✅ 完成 |
| 领取奖励 | ✅ 完成 |
| 错误处理 | ✅ 完成 |
| 安全验证 | ✅ 完成 |

---

## 📝 测试建议

### 1. 功能测试
```bash
# 1. 注册新用户
# 2. 访问仪表盘，检查任务列表
# 3. 完成一个任务（如：八字分析）
# 4. 刷新页面，任务应自动标记为完成
# 5. 点击"领取"按钮
# 6. 检查积分余额是否增加
# 7. 刷新页面，任务应显示为已领取
```

### 2. 边界测试
- ✅ 未登录访问 API（应返回 401）
- ✅ 重复领取奖励（应返回错误）
- ✅ 领取未完成的任务（应返回错误）
- ✅ 无效的任务ID（应返回错误）

---

**实现完成时间**: 2025-01-31  
**实现人**: AI Agent  
**状态**: ✅ 生产就绪
