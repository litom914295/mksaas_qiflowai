# 积分系统问题诊断和修复方案

**诊断时间**: 2025-11-01 16:13  
**问题描述**: 
1. 显示"签到已完成"但连续签到天数为0
2. 积分余额显示为0
3. 总分析次数显示为0
4. 数据不同步问题

---

## 🔍 问题诊断

### 1. 签到状态问题

**现象**:
- 显示"签到已完成" ✅
- 但"连续签到 0 天"
- "本周进度 0/7"

**原因**:
组件有两个状态变量：
- `autoSignInAttempted` - 是否已尝试自动签到
- `isSigned` - 是否真的签到成功

当 `autoSignInAttempted=true` 时显示"签到已完成"，但实际可能签到失败。

### 2. 积分余额为0

**可能原因**:
1. 用户积分记录不存在（新用户未初始化）
2. 数据库查询超时（设置了5秒超时）
3. 签到成功但积分未正确更新

### 3. 连续签到天数为0

**可能原因**:
1. 签到记录存在但查询逻辑有问题
2. 日期计算有误差
3. 签到成功但未记录到数据库

---

## 🛠 修复方案

### 步骤 1: 检查用户积分记录

```sql
-- 检查用户积分表是否有记录
SELECT * FROM user_credit WHERE user_id = 'YOUR_USER_ID';

-- 检查签到记录
SELECT * FROM credit_transaction 
WHERE user_id = 'YOUR_USER_ID' 
  AND type = 'DAILY_SIGNIN'
ORDER BY created_at DESC;
```

### 步骤 2: 初始化用户积分（如果不存在）

```typescript
// 手动初始化用户积分记录
async function initUserCredits(userId: string) {
  const db = await getDb();
  const existing = await db
    .select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
    
  if (existing.length === 0) {
    await db.insert(userCredit).values({
      id: randomUUID(),
      userId,
      currentCredits: 0, // 或给一个初始积分
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
```

### 步骤 3: 修复签到组件显示逻辑

文件: `src/components/dashboard/personal/activity-section.tsx`

```typescript
// 修改第316-326行，修复显示逻辑
{isSigned ? (
  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
    <CheckCircle2 className="h-5 w-5" />
    <span className="font-semibold">今日已签到</span>
  </div>
) : autoSignInAttempted ? (
  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
    <Clock className="h-5 w-5" />
    <span>签到处理中...</span>
  </div>
) : (
  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>正在自动签到...</span>
  </div>
)}
```

### 步骤 4: 增强签到API错误处理

文件: `src/app/api/credits/daily-signin/route.ts`

在签到成功后确保积分更新：
```typescript
// 在第89行后添加验证
await addCredits({...});

// 验证积分是否更新
const newBalance = await getUserCredits(userId);
console.log('[签到API] 新积分余额:', newBalance);
```

### 步骤 5: 修复连续签到计算

连续签到计算逻辑需要修正（第303-310行）：
```typescript
// 确保从今天开始计算
let streak = 0;
const today = new Date();
today.setHours(0, 0, 0, 0);

// 检查今天是否签到
if (marked.has(dateKey(today))) {
  streak = 1;
  
  // 然后检查之前的连续天数
  for (let i = 1; i < 365; i++) {
    const prevDay = new Date(today);
    prevDay.setDate(today.getDate() - i);
    if (marked.has(dateKey(prevDay))) {
      streak++;
    } else {
      break;
    }
  }
}
```

---

## 🔧 立即修复脚本

创建一个初始化脚本 `scripts/fix-user-credits.ts`:

```typescript
import { getDb } from '@/db';
import { userCredit, creditTransaction } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function fixUserCredits(userEmail: string) {
  const db = await getDb();
  
  // 1. 查找用户
  const user = await db.select()
    .from(user)
    .where(eq(user.email, userEmail))
    .limit(1);
    
  if (!user[0]) {
    console.error('用户不存在');
    return;
  }
  
  const userId = user[0].id;
  console.log('用户ID:', userId);
  
  // 2. 检查/创建积分记录
  const credit = await db.select()
    .from(userCredit)
    .where(eq(userCredit.userId, userId))
    .limit(1);
    
  if (!credit[0]) {
    console.log('创建积分记录...');
    await db.insert(userCredit).values({
      id: randomUUID(),
      userId,
      currentCredits: 100, // 给100初始积分
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ 积分记录已创建');
  } else {
    console.log('当前积分:', credit[0].currentCredits);
  }
  
  // 3. 检查今日签到
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todaySignIn = await db.select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.type, 'DAILY_SIGNIN'),
        gte(creditTransaction.createdAt, today)
      )
    )
    .limit(1);
    
  console.log('今日签到状态:', todaySignIn.length > 0 ? '已签到' : '未签到');
  
  // 4. 计算连续签到天数
  const signIns = await db.select()
    .from(creditTransaction)
    .where(
      and(
        eq(creditTransaction.userId, userId),
        eq(creditTransaction.type, 'DAILY_SIGNIN')
      )
    )
    .orderBy(desc(creditTransaction.createdAt));
    
  console.log('总签到次数:', signIns.length);
}

// 运行修复
fixUserCredits('admin@qiflowai.com');
```

---

## 📋 验证步骤

1. **运行修复脚本**
```bash
npx tsx scripts/fix-user-credits.ts
```

2. **重启开发服务器**
```bash
npm run dev
```

3. **手动触发签到**
访问页面，等待自动签到，或在控制台执行：
```javascript
fetch('/api/credits/daily-signin', { method: 'POST' })
  .then(r => r.json())
  .then(console.log)
```

4. **检查结果**
- 积分余额应该更新
- 连续签到天数应该显示正确
- 签到状态应该一致

---

## 🐛 根本原因

1. **新用户未初始化**: `userCredit` 表没有记录
2. **显示逻辑错误**: 混淆了"尝试签到"和"签到成功"
3. **连续签到计算错误**: 没有正确处理当天的签到
4. **数据库超时**: 5秒超时可能太短

---

## ✅ 长期解决方案

1. **用户注册时初始化积分**
在用户注册时自动创建 `userCredit` 记录

2. **改进签到状态管理**
使用更清晰的状态：
- `isLoading` - 正在签到
- `isSuccess` - 签到成功
- `error` - 签到失败原因

3. **增加数据库查询超时**
将超时从5秒增加到10秒

4. **添加数据完整性检查**
定期检查用户积分记录完整性

---

## 🚀 快速修复命令

```bash
# 1. 检查数据库连接
npm run db:push

# 2. 运行种子数据（如果需要）
npm run db:seed

# 3. 重启服务器
npm run dev

# 4. 清除浏览器缓存并刷新页面
```

---

**注意**: 请先备份数据库再执行修复操作！