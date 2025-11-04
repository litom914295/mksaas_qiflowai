# 积分同步问题修复

## 问题描述

用户签到后获得10积分,但在输入出生日期进行分析时,页面显示积分余额为0,积分不同步。

## 问题分析

### 根本原因

1. **签到组件**(`src/components/daily-signin/signin-calendar.tsx`):
   - 签到成功后只更新了本地状态
   - **没有刷新全局的TanStack Query积分缓存**

2. **分析页面**(`src/app/[locale]/(routes)/unified-form/page.tsx`):
   - 使用本地 `useState` 存储积分余额
   - 只在页面加载时获取一次积分
   - **不会自动响应积分变化**

3. **数据流问题**:
   ```
   签到成功 → 数据库更新 → 本地状态更新
                ↓
                ✗ 没有通知其他组件
                ↓
   分析页面仍显示旧的积分余额(0)
   ```

## 修复方案

### 1. 签到组件 - 添加缓存刷新

**文件**: `src/components/daily-signin/signin-calendar.tsx`

**修改内容**:
- 引入 `useQueryClient` 和 `creditsKeys`
- 签到成功后,invalidate积分余额查询缓存

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { creditsKeys } from '@/hooks/use-credits';

export default function SignInCalendar({ signInData }: SignInCalendarProps) {
  const queryClient = useQueryClient();
  
  async function handleSignIn() {
    // ... 签到逻辑 ...
    
    if (result.success && result.data && !isAlreadySigned) {
      // 🔥 关键修复:刷新积分余额缓存
      queryClient.invalidateQueries({
        queryKey: creditsKeys.balance(),
      });
      queryClient.invalidateQueries({
        queryKey: creditsKeys.stats(),
      });
      console.log('✅ 签到成功,已刷新积分缓存');
    }
  }
}
```

### 2. 分析页面 - 使用TanStack Query Hook

**文件**: `src/app/[locale]/(routes)/unified-form/page.tsx`

**修改内容**:
- 移除本地 `creditsAvailable` state
- 使用 `useCreditBalance()` hook直接读取缓存

**修改前**:
```typescript
const [creditsAvailable, setCreditsAvailable] = useState(0);

useEffect(() => {
  if (session?.user && !isPending) {
    getCreditBalanceAction().then((result) => {
      if (result?.data?.success && result.data.credits !== undefined) {
        setCreditsAvailable(result.data.credits);
      }
    });
  }
}, [session, isPending]);
```

**修改后**:
```typescript
// 🔥 关键修复:使用 TanStack Query hook 获取实时积分余额
const { data: creditsAvailable = 0, isLoading: isLoadingCredits } = useCreditBalance();

// 不再需要手动获取积分,useCreditBalance() hook会自动处理
// 当签到成功后,queryClient.invalidateQueries会自动触发这个hook重新获取
```

## 修复后的数据流

```
签到成功 → 数据库更新 → invalidate缓存
              ↓
         TanStack Query自动重新获取
              ↓
         所有使用useCreditBalance()的组件自动更新
              ↓
    分析页面显示最新积分 ✅
```

## 优势

1. **自动同步**: 所有使用 `useCreditBalance()` 的组件都会自动获得最新积分
2. **性能优化**: TanStack Query自动缓存和去重请求
3. **一致性**: 全局统一的积分数据源
4. **可维护性**: 不需要在每个组件手动管理积分状态

## 测试步骤

### 基础测试
1. 登录系统
2. 查看当前积分余额(例如: 0积分)
3. 进入个人中心或包含签到日历的页面
4. 点击"立即签到"按钮
5. ✅ 观察顶部导航栏的积分余额是否立即更新(应显示 10积分)

### 分析页面测试 - unified-form
6. 导航到统一分析页面 (`/zh-CN/unified-form`)
7. ✅ 确认页面显示的积分余额与签到后一致(10积分)
8. 输入出生日期等信息
9. ✅ 点击分析时,应显示正确的积分余额,不再是0

### 分析页面测试 - bazi-analysis
10. 导航到八字分析页面 (`/zh-CN/bazi-analysis`)
11. ✅ 确认页面显示的积分余额与签到后一致(10积分)
12. 输入姓名、性别、出生日期等信息
13. ✅ 点击分析时,应显示正确的积分余额
14. ✅ 分析成功后,积分余额应正确扣除并更新

## 修复的所有页面

### 1. 统一分析表单页面
**文件**: `src/app/[locale]/(routes)/unified-form/page.tsx`
- ✅ 改用 `useCreditBalance()` hook
- ✅ 移除本地 `creditsAvailable` state
- ✅ 自动响应签到后的积分变化

### 2. 八字分析页面
**文件**: `src/app/[locale]/(routes)/bazi-analysis/page.tsx`
- ✅ 改用 `useCreditBalance()` hook
- ✅ 移除 `fetchCredits()` 函数
- ✅ 移除本地 `credits` state
- ✅ 分析成功后正确刷新积分缓存

### 3. 签到日历组件
**文件**: `src/components/daily-signin/signin-calendar.tsx`
- ✅ 签到成功后刷新积分缓存
- ✅ 通知所有使用积分的组件更新

## 相关文件

- `src/components/daily-signin/signin-calendar.tsx` - 签到日历组件
- `src/app/[locale]/(routes)/unified-form/page.tsx` - 统一分析表单页面  
- `src/app/[locale]/(routes)/bazi-analysis/page.tsx` - 八字分析页面 ✨ 新增
- `src/hooks/use-credits.ts` - 积分管理Hooks
- `src/actions/get-credit-balance.ts` - 获取积分余额Action
- `src/credits/credits.ts` - 积分核心逻辑

## 注意事项

1. 确保所有读取积分的组件都使用 `useCreditBalance()` hook
2. 任何修改积分的操作后,都应该调用 `queryClient.invalidateQueries()`
3. 避免在组件内部直接调用 `getCreditBalanceAction()`,应使用hook
