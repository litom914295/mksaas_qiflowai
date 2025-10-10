# 玄空风水大师系统积分制度集成计划 v5.1.1

## 目标
将现有的玄空风水大师系统从纯本地计算模式改造为支持双引擎（本地 + 统一后端）的积分制度系统，实现用户增长和商业变现。

## 当前状态分析

### 现有实现
- **文件**: `src/components/qiflow/xuankong/xuankong-master-page.tsx`
- **模式**: 纯本地前端计算，使用 `generateFlyingStar` 函数
- **特点**: 
  - ✅ 完整的UI界面（飞星盘、关键位置、流年分析等）
  - ✅ 无需后端调用，响应速度快
  - ❌ 无用户认证集成
  - ❌ 无积分系统
  - ❌ 无会员等级判断
  - ❌ 无统一引擎支持

### 统一引擎已有资源
- **Adapter**: `src/lib/qiflow/adapters/xuankong-unified-adapter.ts` ✅
- **API路由**: 需要创建 ❌
- **积分配置**: 需要添加到 CreditManager ❌

---

## 实施阶段

### 阶段1：基础设施准备 (优先级: HIGH)

#### 任务 1.1: 扩展 CreditManager 支持玄空分析
**文件**: `src/lib/credits/credit-manager.ts`

**变更内容**:
```typescript
// 添加玄空分析成本配置
export const CREDIT_COSTS = {
  unified: 30,
  bazi: 10,
  xuankong: 20,  // 新增
  // ...其他模式
} as const;

// 确保 deductCredits 和 canAfford 支持 xuankong 模式
```

**验收标准**:
- [ ] `CREDIT_COSTS.xuankong` 配置为 20 积分
- [ ] `canAfford('xuankong')` 返回正确结果
- [ ] `deductCredits('xuankong')` 正确扣除 20 积分

---

#### 任务 1.2: 创建玄空风水统一引擎 API 路由
**文件**: `src/app/api/qiflow/xuankong-unified/route.ts` (新建)

**功能需求**:
1. 接收POST请求，包含玄空输入参数
2. 验证用户登录状态
3. 检查用户积分是否足够（20积分）
4. 调用 `xuankongUnifiedAdapter` 进行分析
5. 扣除积分
6. 返回分析结果

**请求格式**:
```typescript
{
  facingDirection: number,      // 朝向度数
  completionYear: number,        // 建成年份
  completionMonth: number,       // 建成月份
  currentYear?: number           // 当前年份（流年分析）
}
```

**响应格式**:
```typescript
{
  success: boolean,
  data?: {
    period: number,
    plates: {...},
    evaluation: {...},
    geju: {...},
    creditsUsed: 20
  },
  error?: string,
  needsUpgrade?: boolean  // 积分不足时返回
}
```

**验收标准**:
- [ ] API 正确调用统一引擎
- [ ] 积分扣费正确
- [ ] 错误处理完善（积分不足、参数错误等）
- [ ] 返回完整的玄空分析结果

---

### 阶段2：前端双引擎集成 (优先级: HIGH)

#### 任务 2.1: 重构 handleFormSubmit 支持双引擎模式
**文件**: `src/components/qiflow/xuankong/xuankong-master-page.tsx`

**改造逻辑**:
```typescript
const handleFormSubmit = async (data: XuankongFormData) => {
  setIsAnalyzing(true);
  setAnalysisData(data);
  
  // 1. 获取用户状态
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  
  // 2. 获取用户积分和会员等级
  let userCredits = 0;
  let memberTier = 'free';
  if (isLoggedIn) {
    const creditManager = new CreditManager(session.user.id);
    userCredits = await creditManager.getBalance();
    memberTier = session.user.memberTier || 'free';
  }
  
  // 3. 智能引擎选择
  const canUseUnified = isLoggedIn && 
                        userCredits >= 20 && 
                        memberTier !== 'anonymous';
  
  let result;
  let engineUsed = 'local';
  
  if (canUseUnified) {
    try {
      // 尝试使用统一引擎
      const response = await fetch('/api/qiflow/xuankong-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        result = await response.json();
        engineUsed = 'unified';
      } else {
        throw new Error('Unified engine failed');
      }
    } catch (error) {
      console.warn('统一引擎失败，降级到本地引擎', error);
      result = generateFlyingStar(createLocalInput(data));
    }
  } else {
    // 使用本地引擎
    result = generateFlyingStar(createLocalInput(data));
    
    // 显示升级提示
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else if (userCredits < 20) {
      setShowCreditPrompt(true);
    }
  }
  
  setFlyingStarResult(result);
  setEngineUsed(engineUsed);
  setIsAnalyzing(false);
};
```

**新增状态**:
```typescript
const [engineUsed, setEngineUsed] = useState<'local' | 'unified'>('local');
const [showLoginPrompt, setShowLoginPrompt] = useState(false);
const [showCreditPrompt, setShowCreditPrompt] = useState(false);
```

**验收标准**:
- [ ] 匿名用户自动使用本地引擎
- [ ] 登录用户积分充足时使用统一引擎
- [ ] 登录用户积分不足时使用本地引擎并提示
- [ ] 统一引擎失败时自动降级到本地引擎
- [ ] UI保持流畅，无明显延迟

---

#### 任务 2.2: 添加引擎标识和升级提示 UI
**文件**: `src/components/qiflow/xuankong/xuankong-master-page.tsx`

**UI元素**:
1. **引擎标识Badge** (在分析结果头部):
```tsx
<Badge variant={engineUsed === 'unified' ? 'default' : 'secondary'}>
  {engineUsed === 'unified' ? '✨ 统一引擎分析' : '📱 本地引擎分析'}
</Badge>
```

2. **本地引擎升级提示** (仅本地引擎时显示):
```tsx
{engineUsed === 'local' && (
  <Alert className="border-indigo-200 bg-indigo-50">
    <Sparkles className="h-4 w-4" />
    <AlertTitle>升级到统一引擎</AlertTitle>
    <AlertDescription>
      使用统一引擎可获得更深入的专业分析和个性化建议
      {!session ? (
        <Button onClick={() => signIn()}>立即登录</Button>
      ) : (
        <Button onClick={() => router.push('/credits')}>充值积分</Button>
      )}
    </AlertDescription>
  </Alert>
)}
```

3. **积分消耗显示**:
```tsx
{engineUsed === 'unified' && (
  <div className="text-sm text-gray-600">
    本次分析消耗 20 积分 | <Link href="/credits">查看我的积分</Link>
  </div>
)}
```

**验收标准**:
- [ ] 清晰显示使用的引擎类型
- [ ] 本地引擎时显示升级CTA
- [ ] 统一引擎时显示积分消耗
- [ ] 所有链接跳转正确

---

### 阶段3：用户体验优化 (优先级: MEDIUM)

#### 任务 3.1: 匿名用户试用限制
**实现方式**: 使用 localStorage 跟踪

```typescript
// src/hooks/use-anonymous-trial.ts (新建)
const TRIAL_KEY = 'xuankong_trial_count';
const MAX_TRIALS = 3;

export function useAnonymousTrial() {
  const getTrialCount = () => {
    const count = localStorage.getItem(TRIAL_KEY);
    return count ? parseInt(count, 10) : 0;
  };
  
  const incrementTrial = () => {
    const count = getTrialCount();
    localStorage.setItem(TRIAL_KEY, String(count + 1));
  };
  
  const canTrial = () => getTrialCount() < MAX_TRIALS;
  const remainingTrials = () => MAX_TRIALS - getTrialCount();
  
  return { canTrial, remainingTrials, incrementTrial };
}
```

**UI提示**:
- 试用次数显示: "您还有 2 次免费试用机会"
- 用尽后: "免费试用已用完，请注册获取50积分新手礼包"

**验收标准**:
- [ ] 匿名用户可免费试用3次
- [ ] 试用次数正确跟踪和显示
- [ ] 试用用尽后显示注册引导
- [ ] 注册成功后清除试用记录

---

#### 任务 3.2: 积分充值引导流程
**文件**: `src/components/credits/credit-recharge-dialog.tsx` (新建)

**功能**:
1. 显示当前积分和所需积分
2. 三档充值套餐:
   - 💰 100 积分 = $2.99 (5次玄空分析)
   - 💎 500 积分 = $9.99 (25次分析 + 5%额外赠送)
   - 👑 2000 积分 = $29.99 (100次分析 + 10%额外赠送)
3. 集成 Stripe 支付
4. 支付成功后自动刷新积分

**使用场景**:
- 点击"开始分析"时积分不足
- 分析结果页面点击"充值积分"
- 导航栏积分余额低于50时提示

**验收标准**:
- [ ] 显示准确的积分信息
- [ ] Stripe 支付集成正常
- [ ] 支付成功后积分实时更新
- [ ] 错误处理完善

---

#### 任务 3.3: 导航栏积分余额显示
**文件**: `src/components/layout/navbar.tsx` (修改)

**新增元素**:
```tsx
{session && (
  <div className="flex items-center gap-2">
    <Coins className="w-4 h-4 text-yellow-600" />
    <span className="font-semibold">{userCredits}</span>
    <Button size="sm" variant="outline" onClick={openRechargeDialog}>
      充值
    </Button>
  </div>
)}
```

**低积分警告** (积分 < 50):
```tsx
<Alert variant="warning">
  您的积分余额较低，请及时充值以继续使用
</Alert>
```

**验收标准**:
- [ ] 登录用户显示积分余额
- [ ] 积分余额实时更新
- [ ] 低积分警告正常显示
- [ ] 充值按钮跳转正确

---

### 阶段4：高级功能 (优先级: LOW)

#### 任务 4.1: 积分使用历史记录
**API**: `src/app/api/credits/history/route.ts` (新建)
**UI**: `src/app/credits/history/page.tsx` (新建)

**功能**:
- 显示所有积分变动记录
- 筛选：充值、消费、赠送、过期
- 分页：每页20条
- 导出为CSV

**验收标准**:
- [ ] API正确返回历史记录
- [ ] UI显示清晰易懂
- [ ] 筛选和分页功能正常
- [ ] 导出功能可用

---

#### 任务 4.2: 会员等级系统
**等级定义**:

| 等级 | 价格 | 权益 |
|------|------|------|
| 免费会员 | $0 | 需要积分消费，无折扣 |
| 青铜会员 | $9.99/月 | 8折优惠 + 每月赠送200积分 |
| 白银会员 | $29.99/月 | 7折优惠 + 每月赠送800积分 |
| 黄金会员 | $99.99/月 | 无限使用所有功能 |

**实现**:
1. 数据库字段: `memberTier`, `membershipExpiry`
2. Stripe 订阅集成
3. 会员管理页面
4. 自动积分赠送 (cron job)

**验收标准**:
- [ ] 订阅购买流程正常
- [ ] 会员权益正确应用
- [ ] 自动续费和到期处理
- [ ] 会员管理界面完善

---

## 数据库Schema变更

```sql
-- 用户表添加字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS member_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS membership_expiry TIMESTAMP;

-- 积分交易记录表 (新建)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'recharge', 'consume', 'gift', 'expire'
  description TEXT,
  related_service VARCHAR(50), -- 'xuankong', 'bazi', 'unified'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

---

## 测试计划

### 单元测试
- [ ] CreditManager 扩展功能测试
- [ ] 引擎选择逻辑测试
- [ ] 匿名试用跟踪测试

### 集成测试
- [ ] 玄空统一引擎 API 测试
- [ ] 积分扣费流程测试
- [ ] Stripe 支付流程测试

### 端到端测试
- [ ] 匿名用户完整流程
- [ ] 免费会员完整流程
- [ ] 付费会员完整流程
- [ ] 积分充值和消费流程

### 性能测试
- [ ] 本地引擎响应时间 < 100ms
- [ ] 统一引擎响应时间 < 2s
- [ ] 并发请求处理能力

---

## 上线检查清单

### 代码审查
- [ ] 所有代码通过 ESLint 检查
- [ ] 所有测试通过
- [ ] 代码注释完整

### 配置检查
- [ ] 环境变量配置正确
- [ ] Stripe 密钥配置正确
- [ ] 数据库迁移脚本准备好

### 监控和日志
- [ ] 积分交易日志记录
- [ ] 错误监控配置 (Sentry)
- [ ] 性能监控配置

### 文档
- [ ] API 文档更新
- [ ] 用户使用指南
- [ ] 管理员操作手册

---

## 里程碑时间表

| 阶段 | 预计时间 | 交付内容 |
|------|----------|----------|
| 阶段1 | 2天 | CreditManager扩展 + API路由 |
| 阶段2 | 3天 | 双引擎集成 + UI改造 |
| 阶段3 | 3天 | 用户体验优化 |
| 阶段4 | 5天 | 高级功能实现 |
| 测试和上线 | 2天 | 全面测试 + 部署 |
| **总计** | **15天** | 完整功能上线 |

---

## 成功指标

### 用户增长
- 匿名试用转化率 > 15%
- 免费用户留存率 > 40% (30天)
- 付费用户转化率 > 5%

### 商业变现
- 积分充值率 > 20%
- 会员订阅转化率 > 3%
- 平均每用户收入 (ARPU) > $5

### 技术指标
- 系统可用性 > 99.5%
- API响应时间 < 2s (P95)
- 错误率 < 0.5%

---

## 风险和缓解措施

### 风险1: 统一引擎不稳定
- **缓解**: 完善的降级机制，确保本地引擎始终可用
- **监控**: 实时监控统一引擎可用性

### 风险2: 积分滥用
- **缓解**: 实施速率限制，检测异常消费模式
- **监控**: 积分交易异常检测

### 风险3: 支付问题
- **缓解**: 完善的错误处理和重试机制
- **监控**: Stripe webhooks 处理监控

---

## 后续优化方向

1. **个性化推荐**: 基于用户历史分析推荐相关功能
2. **社交分享**: 允许用户分享分析结果
3. **报告定制**: 提供PDF导出和自定义模板
4. **AI助手**: 集成AI对话解答风水疑问
5. **线下服务**: 对接专业风水师预约服务

---

**版本**: v5.1.1  
**最后更新**: 2025-01-29  
**负责人**: Development Team  
**状态**: 待实施
