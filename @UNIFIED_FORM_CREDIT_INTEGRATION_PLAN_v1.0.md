# Unified-Form 积分制度集成完整开发计划 v1.0

## 📋 执行摘要

**目标**: 为 unified-form 统一入口集成双引擎模式（本地 + 后端API）和完整的积分制度

**当前状态**:
- ✅ 积分系统基础设施完整（配置、充值、扣费、历史记录）
- ✅ 统一风水引擎API已存在（`/api/qiflow/xuankong`）
- ✅ 前端适配器已实现（`frontend-adapter.ts`）
- ❌ unified-form 未集成积分系统
- ❌ 缺少智能引擎选择逻辑
- ❌ 缺少匿名用户体验优化

---

## 🎯 核心目标

### 1. 灵活的分段定价
- **只填个人信息（八字分析）** = **10 积分**
- **个人信息 + 房屋信息（完整分析）** = **30 积分**

### 2. 用户体验分层
- **匿名用户**: 3次免费试用（不扣积分）
- **注册用户**: 获得100积分新手礼包
- **付费用户**: 充值积分享受更多分析

### 3. 双引擎智能切换
- **本地引擎**: 快速响应，基础分析（免费）
- **统一后端引擎**: 深度分析，个性化建议（需积分）

---

## 📊 现有资源盘点

### ✅ 已完成的基础设施

#### 1. 积分系统配置
**文件**: `src/config/website.tsx` (第173-231行)
```typescript
credits: {
  enableCredits: true,
  registerGiftCredits: {
    enable: true,
    amount: 100,  // 注册送100积分
    expireDays: 30,
  },
  packages: {
    basic: { amount: 100, price: 990 },    // $9.90
    standard: { amount: 200, price: 1490 }, // $14.90
    premium: { amount: 500, price: 3990 },  // $39.90
    enterprise: { amount: 1000, price: 6990 }, // $69.90
  }
}
```

#### 2. 积分扣费Action
**文件**: `src/actions/consume-credits.ts`
```typescript
export const consumeCreditsAction = userActionClient
  .schema(consumeSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 已实现：扣除用户积分
  });
```

#### 3. 获取积分余额Action
**文件**: `src/actions/get-credit-balance.ts`
```typescript
// 可获取当前用户的积分余额
```

#### 4. 统一风水引擎API
**文件**: `src/app/api/qiflow/xuankong/route.ts`
```typescript
POST /api/qiflow/xuankong
// 已实现：统一引擎分析
// 返回: { success, data, confidence, creditsUsed: 20 }
```

#### 5. 前端适配器
**文件**: `src/lib/qiflow/unified/adapters/frontend-adapter.ts`
```typescript
export function adaptToFrontend(unifiedOutput): ComprehensiveAnalysisResult {
  // 已实现：将统一引擎输出转换为前端格式
}
```

#### 6. 积分充值UI组件
**文件**: `src/components/settings/credits/*.tsx`
- `credit-checkout-button.tsx` - 充值按钮
- `credit-packages.tsx` - 套餐选择
- `credits-balance-card.tsx` - 余额卡片
- `credit-transactions-table.tsx` - 交易记录

---

## 🚀 实施计划

### 第一阶段：核心集成（2-3天）

#### 任务 1.1: 创建八字分析API路由（扣10积分）
**新建文件**: `src/app/api/qiflow/bazi-unified/route.ts`

**功能需求**:
1. 接收个人信息（姓名、生日、时间、性别、出生城市）
2. 验证用户登录状态
3. 检查积分余额（需要10积分）
4. 调用八字分析引擎
5. 扣除10积分
6. 返回八字分析结果

**API规范**:
```typescript
// 请求
POST /api/qiflow/bazi-unified
{
  name: string,
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female',
  birthCity?: string,
  calendarType: 'solar' | 'lunar'
}

// 响应
{
  success: boolean,
  data?: {
    bazi: {...},        // 八字四柱
    wuxing: {...},      // 五行分析
    personality: {...}, // 性格分析
    career: {...},      // 事业运势
    wealth: {...},      // 财运分析
    health: {...},      // 健康建议
    creditsUsed: 10
  },
  error?: string,
  needsLogin?: boolean,     // 未登录
  needsCredits?: boolean    // 积分不足
}
```

**验收标准**:
- [ ] API正确处理请求参数
- [ ] 登录验证正常
- [ ] 积分检查和扣除正确
- [ ] 返回完整的八字分析结果
- [ ] 错误处理完善

---

#### 任务 1.2: 创建完整分析API路由（扣30积分）
**新建文件**: `src/app/api/qiflow/complete-unified/route.ts`

**功能需求**:
1. 接收个人信息 + 房屋信息
2. 验证用户登录和积分（需要30积分）
3. 调用八字分析 + 玄空风水分析
4. 整合个性化推荐（基于八字适配风水）
5. 扣除30积分
6. 返回完整分析结果

**API规范**:
```typescript
// 请求
POST /api/qiflow/complete-unified
{
  personal: {
    name: string,
    birthDate: string,
    birthTime: string,
    gender: 'male' | 'female',
    birthCity?: string,
    calendarType: 'solar' | 'lunar'
  },
  house: {
    direction: string,
    roomCount: string,
    layoutImage?: string,
    standardLayout?: string
  }
}

// 响应
{
  success: boolean,
  data?: {
    bazi: {...},           // 八字分析
    fengshui: {...},       // 风水分析
    personalized: {...},   // 个性化建议（八字+风水结合）
    roomAdvice: [...],     // 房间布局建议
    monthlyForecast: [...],// 月度运势
    creditsUsed: 30
  },
  error?: string,
  needsLogin?: boolean,
  needsCredits?: boolean
}
```

**验收标准**:
- [ ] 正确整合八字和风水分析
- [ ] 个性化建议基于用户八字
- [ ] 积分扣除为30
- [ ] 返回结果格式统一

---

#### 任务 1.3: 重构 unified-form 提交逻辑
**修改文件**: `app/[locale]/(routes)/unified-form/page.tsx`

**改造重点**:

1. **添加用户状态检测** (第126行 `handleSubmit` 函数)
```typescript
const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
  // ...现有验证逻辑...
  
  // 1. 检测用户登录状态
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  
  // 2. 判断分析类型
  const hasHouseInfo = formData.house.direction && formData.house.roomCount;
  const analysisType = hasHouseInfo ? 'complete' : 'bazi';
  const requiredCredits = hasHouseInfo ? 30 : 10;
  
  // 3. 检查积分余额（登录用户）
  let userCredits = 0;
  if (isLoggedIn) {
    const creditBalance = await getCreditBalanceAction();
    userCredits = creditBalance.data?.balance || 0;
  }
  
  // 4. 智能引擎选择
  const canUseUnified = isLoggedIn && userCredits >= requiredCredits;
  
  // 5. 执行分析
  if (canUseUnified) {
    // 使用统一后端引擎
    await analyzeWithUnifiedEngine(analysisType);
  } else {
    // 使用本地引擎 或 显示升级提示
    await handleFallbackOrPrompt(isLoggedIn, userCredits, requiredCredits);
  }
};
```

2. **添加匿名试用跟踪**
```typescript
// 新增 Hook
const { canTrial, remainingTrials, incrementTrial } = useAnonymousTrial();

// 在提交前检查
if (!isLoggedIn) {
  if (!canTrial()) {
    setShowSignupPrompt(true);
    return;
  }
  incrementTrial();
}
```

3. **添加新的状态管理**
```typescript
const [engineUsed, setEngineUsed] = useState<'local' | 'unified'>('local');
const [showSignupPrompt, setShowSignupPrompt] = useState(false);
const [showCreditPrompt, setShowCreditPrompt] = useState(false);
const [creditsRequired, setCreditsRequired] = useState(0);
const [creditsAvailable, setCreditsAvailable] = useState(0);
```

**验收标准**:
- [ ] 匿名用户可免费试用3次本地引擎
- [ ] 登录用户积分充足时自动使用统一引擎
- [ ] 积分不足时显示充值提示
- [ ] 保持原有的表单验证和UI交互

---

### 第二阶段：用户体验优化（2天）

#### 任务 2.1: 创建匿名试用Hook
**新建文件**: `src/hooks/use-anonymous-trial.ts`

```typescript
const TRIAL_KEY_BAZI = 'qiflow_bazi_trial_count';
const TRIAL_KEY_COMPLETE = 'qiflow_complete_trial_count';
const MAX_TRIALS = 3;

export function useAnonymousTrial(type: 'bazi' | 'complete' = 'bazi') {
  const key = type === 'bazi' ? TRIAL_KEY_BAZI : TRIAL_KEY_COMPLETE;
  
  const getTrialCount = () => {
    if (typeof window === 'undefined') return 0;
    const count = localStorage.getItem(key);
    return count ? parseInt(count, 10) : 0;
  };
  
  const incrementTrial = () => {
    if (typeof window === 'undefined') return;
    const count = getTrialCount();
    localStorage.setItem(key, String(count + 1));
  };
  
  const canTrial = () => getTrialCount() < MAX_TRIALS;
  const remainingTrials = () => Math.max(0, MAX_TRIALS - getTrialCount());
  
  const resetTrials = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  };
  
  return { canTrial, remainingTrials, incrementTrial, resetTrials };
}
```

**验收标准**:
- [ ] 正确跟踪试用次数
- [ ] 八字和完整分析分别计数
- [ ] SSR安全（服务端不报错）
- [ ] 注册后自动重置

---

#### 任务 2.2: 添加引擎标识和升级提示UI
**修改文件**: `app/[locale]/(routes)/unified-form/page.tsx`

**新增UI组件**:

1. **分析模式选择卡片** (在进度条下方)
```tsx
{isLoggedIn && (
  <Card className="mb-6 border-2 border-blue-200">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="font-semibold">智能分析引擎</h3>
            <p className="text-sm text-gray-600">
              {creditsAvailable >= creditsRequired 
                ? `将使用统一引擎进行深度分析（消耗${creditsRequired}积分）` 
                : '积分不足，将使用基础本地引擎'}
            </p>
          </div>
        </div>
        <Badge variant={creditsAvailable >= creditsRequired ? 'default' : 'secondary'}>
          {creditsAvailable >= creditsRequired ? '✨ 深度分析' : '📱 基础分析'}
        </Badge>
      </div>
    </CardContent>
  </Card>
)}
```

2. **匿名用户试用提示** (在个人信息卡片上方)
```tsx
{!isLoggedIn && (
  <Alert className="mb-6 border-purple-200 bg-purple-50">
    <Sparkles className="h-4 w-4 text-purple-600" />
    <AlertTitle>免费试用</AlertTitle>
    <AlertDescription>
      您还有 <strong>{remainingTrials()}</strong> 次免费试用机会。
      <Button 
        variant="link" 
        className="ml-2 p-0 h-auto"
        onClick={() => router.push('/auth/signin')}
      >
        注册获取100积分新手礼包 →
      </Button>
    </AlertDescription>
  </Alert>
)}
```

3. **试用用尽提示对话框**
```tsx
<Dialog open={showSignupPrompt} onOpenChange={setShowSignupPrompt}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-purple-600" />
        免费试用已用完
      </DialogTitle>
      <DialogDescription>
        您已使用完3次免费试用。注册账号即可获得100积分新手礼包，
        足够进行10次八字分析或3次完整分析！
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">注册即享：</h4>
        <ul className="space-y-2 text-sm">
          <li>✨ 100积分新手礼包</li>
          <li>📊 保存分析历史记录</li>
          <li>🎯 个性化推荐建议</li>
          <li>💬 AI大师24/7在线答疑</li>
        </ul>
      </div>
      <Button 
        className="w-full" 
        onClick={() => router.push('/auth/signin')}
      >
        立即注册领取礼包
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

4. **积分不足提示对话框**
```tsx
<Dialog open={showCreditPrompt} onOpenChange={setShowCreditPrompt}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-yellow-600" />
        积分不足
      </DialogTitle>
      <DialogDescription>
        {analysisType === 'bazi' 
          ? '八字分析需要10积分，您当前余额不足。' 
          : '完整分析需要30积分，您当前余额不足。'}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <span className="text-sm text-gray-600">当前余额</span>
        <span className="text-2xl font-bold">{creditsAvailable}</span>
      </div>
      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
        <span className="text-sm text-gray-600">所需积分</span>
        <span className="text-2xl font-bold text-red-600">{creditsRequired}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowCreditPrompt(false);
            // 使用本地引擎继续
            analyzeWithLocalEngine();
          }}
        >
          使用基础引擎
        </Button>
        <Button 
          onClick={() => router.push('/settings/credits')}
        >
          <Zap className="w-4 h-4 mr-2" />
          充值积分
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

**验收标准**:
- [ ] 所有提示UI显示正确
- [ ] 链接跳转正常
- [ ] 对话框交互流畅
- [ ] 响应式设计适配移动端

---

#### 任务 2.3: 优化结果页面显示引擎信息
**修改文件**: `app/[locale]/(routes)/report/page.tsx`

**新增元素**:

1. **引擎标识Badge** (在报告标题旁)
```tsx
<div className="flex items-center gap-2">
  <h1>您的专属分析报告</h1>
  <Badge variant={engineUsed === 'unified' ? 'default' : 'secondary'}>
    {engineUsed === 'unified' ? '✨ 深度分析' : '📱 基础分析'}
  </Badge>
</div>
```

2. **升级提示卡片** (仅本地引擎时显示)
```tsx
{engineUsed === 'local' && (
  <Card className="mb-6 border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
    <CardContent className="pt-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-indigo-500 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">升级到深度分析</h3>
          <p className="text-sm text-gray-600 mb-4">
            使用统一引擎可获得：
          </p>
          <ul className="space-y-1 text-sm text-gray-600 mb-4">
            <li>✅ 基于您八字的个性化风水建议</li>
            <li>✅ 精准的房间布局推荐</li>
            <li>✅ 月度运势预测</li>
            <li>✅ 实用的化解方案</li>
          </ul>
          <div className="flex gap-2">
            {!session ? (
              <Button onClick={() => router.push('/auth/signin')}>
                注册获取100积分
              </Button>
            ) : (
              <Button onClick={() => router.push('/settings/credits')}>
                充值积分
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => handleReanalyze('unified')}
            >
              重新分析（{analysisType === 'bazi' ? '10' : '30'}积分）
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

3. **积分消耗显示** (统一引擎时显示)
```tsx
{engineUsed === 'unified' && (
  <div className="text-sm text-gray-600 flex items-center gap-2 mb-6">
    <CheckCircle className="w-4 h-4 text-green-600" />
    本次分析消耗 {creditsUsed} 积分 | 
    <Link href="/settings/credits" className="text-blue-600 hover:underline">
      查看我的积分
    </Link>
  </div>
)}
```

**验收标准**:
- [ ] 引擎标识清晰显示
- [ ] 升级提示仅在本地引擎时显示
- [ ] 积分消耗信息准确
- [ ] 所有CTA按钮功能正常

---

### 第三阶段：导航和全局优化（1天）

#### 任务 3.1: 导航栏集成积分显示
**修改文件**: `src/components/layout/navbar.tsx` 或创建新的积分组件

**新增组件**: `src/components/layout/credits-nav-badge.tsx`
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getCreditBalanceAction } from '@/actions/get-credit-balance';

export function CreditsNavBadge() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    if (session?.user) {
      getCreditBalanceAction().then(result => {
        if (result.data) {
          setCredits(result.data.balance);
          setIsLow(result.data.balance < 50);
        }
      });
    }
  }, [session]);

  if (!session) return null;

  return (
    <div className="flex items-center gap-2">
      <Link href="/settings/credits">
        <Badge 
          variant={isLow ? 'destructive' : 'secondary'}
          className="flex items-center gap-1 cursor-pointer hover:opacity-80"
        >
          <Coins className="w-3 h-3" />
          <span>{credits}</span>
        </Badge>
      </Link>
      <Button 
        size="sm" 
        variant="outline"
        asChild
      >
        <Link href="/settings/credits">
          <Zap className="w-3 h-3 mr-1" />
          充值
        </Link>
      </Button>
    </div>
  );
}
```

**集成到导航栏**:
```tsx
// 在 navbar.tsx 中
import { CreditsNavBadge } from './credits-nav-badge';

// 在用户菜单旁边添加
<CreditsNavBadge />
```

**验收标准**:
- [ ] 登录用户显示积分余额
- [ ] 余额低于50时显示红色警告
- [ ] 点击跳转到积分管理页面
- [ ] 充值按钮正常工作

---

#### 任务 3.2: 删除 xuankong-master-page
**待删除文件**:
```
src/components/qiflow/xuankong/xuankong-master-page.tsx
src/components/qiflow/xuankong/xuankong-master-page.tsx.backup
src/components/qiflow/xuankong/xuankong-master-page-simple.tsx
```

**待更新文档**:
- 删除所有引用 xuankong-master-page 的文档
- 更新 README 指向 unified-form

**验收标准**:
- [ ] 所有相关文件已删除
- [ ] 无残留引用导致编译错误
- [ ] 文档已更新

---

### 第四阶段：测试和优化（1天）

#### 任务 4.1: 端到端测试

**测试场景**:

1. **匿名用户流程**
   - [ ] 访问 unified-form
   - [ ] 看到"剩余3次试用"提示
   - [ ] 填写个人信息提交（八字分析）
   - [ ] 看到"剩余2次试用"提示
   - [ ] 再次提交 x2
   - [ ] 看到"试用用尽"提示
   - [ ] 点击注册按钮跳转正常

2. **注册用户流程**
   - [ ] 注册新账号
   - [ ] 自动获得100积分
   - [ ] 填写八字信息提交
   - [ ] 使用统一引擎分析（扣10积分）
   - [ ] 余额变为90积分
   - [ ] 查看报告显示"深度分析"标识

3. **完整分析流程**
   - [ ] 填写个人+房屋信息
   - [ ] 需要30积分提示显示
   - [ ] 提交后扣30积分
   - [ ] 获得八字+风水完整分析
   - [ ] 个性化建议基于用户八字

4. **积分不足流程**
   - [ ] 积分余额 < 10
   - [ ] 提交时显示积分不足提示
   - [ ] 点击"使用基础引擎"继续
   - [ ] 点击"充值积分"跳转正常

5. **充值流程**
   - [ ] 访问充值页面
   - [ ] 选择套餐
   - [ ] Stripe支付流程
   - [ ] 支付成功后积分到账
   - [ ] 可继续使用统一引擎

**性能测试**:
- [ ] 本地引擎响应时间 < 200ms
- [ ] 统一引擎响应时间 < 3s
- [ ] 页面加载时间 < 2s

---

#### 任务 4.2: 错误处理和边界情况

**需要处理的场景**:

1. **API错误**
   - [ ] 统一引擎不可用 → 自动降级到本地引擎
   - [ ] 网络超时 → 友好提示 + 重试按钮
   - [ ] 500错误 → 显示错误信息 + 联系支持

2. **数据验证**
   - [ ] 必填字段验证
   - [ ] 日期格式验证
   - [ ] 度数范围验证（0-360）

3. **并发控制**
   - [ ] 防止重复提交
   - [ ] 禁用按钮在分析过程中
   - [ ] 显示加载状态

4. **浏览器兼容**
   - [ ] localStorage不可用时的fallback
   - [ ] SSR安全
   - [ ] 移动端适配

---

## 📂 文件结构总览

```
src/
├── app/
│   ├── [locale]/
│   │   └── (routes)/
│   │       ├── unified-form/
│   │       │   └── page.tsx                      [修改] 主要改造文件
│   │       └── report/
│   │           └── page.tsx                      [修改] 添加引擎标识
│   └── api/
│       └── qiflow/
│           ├── bazi-unified/
│           │   └── route.ts                      [新建] 八字分析API
│           ├── complete-unified/
│           │   └── route.ts                      [新建] 完整分析API
│           └── xuankong/
│               └── route.ts                      [已存在] 玄空API
├── hooks/
│   └── use-anonymous-trial.ts                    [新建] 试用跟踪Hook
├── components/
│   ├── layout/
│   │   ├── navbar.tsx                            [修改] 添加积分显示
│   │   └── credits-nav-badge.tsx                 [新建] 积分组件
│   └── qiflow/
│       └── xuankong/
│           └── xuankong-master-page.tsx          [删除] 不再需要
└── config/
    └── website.tsx                               [已存在] 积分配置
```

---

## 🎯 成功指标

### 用户增长指标
- 匿名试用转化率 > 15%
- 新用户注册率 > 20%
- 注册后7日留存 > 40%

### 商业指标
- 积分充值转化率 > 10%
- 平均每用户收入（ARPU） > $5
- 统一引擎使用率 > 60%

### 技术指标
- API响应时间 P95 < 3s
- 错误率 < 0.5%
- 系统可用性 > 99.5%

---

## ⏱️ 时间表

| 阶段 | 预计时间 | 交付内容 |
|------|----------|----------|
| 第一阶段 | 2-3天 | API路由 + 提交逻辑改造 |
| 第二阶段 | 2天 | UI优化 + 用户体验 |
| 第三阶段 | 1天 | 导航集成 + 清理代码 |
| 第四阶段 | 1天 | 测试 + 错误处理 |
| **总计** | **6-7天** | **完整功能上线** |

---

## 🚨 风险和缓解

### 风险1: 统一引擎不稳定
**影响**: 用户无法使用深度分析
**缓解**: 
- ✅ 实现完善的降级机制
- ✅ 监控API可用性
- ✅ 本地引擎作为兜底

### 风险2: 积分扣费错误
**影响**: 财务损失或用户投诉
**缓解**:
- ✅ 完善的事务处理
- ✅ 详细的日志记录
- ✅ 充值前的二次确认

### 风险3: 用户体验混乱
**影响**: 用户不理解积分规则
**缓解**:
- ✅ 清晰的UI提示
- ✅ 逐步引导流程
- ✅ 帮助文档和FAQ

---

## 📚 后续优化方向

1. **AI推荐系统**
   - 基于用户历史推荐最佳分析时机
   - 智能提醒"本月财运高峰期"

2. **社交分享**
   - 生成精美的分享卡片
   - 邀请好友获得积分奖励

3. **会员订阅**
   - 月度/年度无限使用套餐
   - VIP专属功能解锁

4. **多语言支持**
   - 英文、繁体中文界面
   - 国际化积分定价

5. **移动端App**
   - React Native开发
   - 离线分析功能

---

**版本**: v1.0  
**创建日期**: 2025-01-29  
**最后更新**: 2025-01-29  
**负责人**: Development Team  
**状态**: 📋 待执行
