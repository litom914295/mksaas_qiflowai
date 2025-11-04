# 积分系统修复总结

## 问题描述
用户在八字登录界面提交出生信息时遇到 `INSUFFICIENT_CREDITS`（积分不足）错误，即使表单验证通过。

## 根本原因
1. **积分系统配置问题**：在 `src/config/website.tsx` 中，积分系统只在 `NEXT_PUBLIC_DEMO_WEBSITE === 'true'` 时启用
2. **强制积分检查**：所有 QiFlow 功能（八字计算、风水分析、罗盘读取）都会尝试消耗积分，无论积分系统是否启用
3. **用户体验问题**：如果用户没有足够积分或积分系统未启用，功能直接报错

## 修复方案

### 1. 添加积分系统启用检查
在所有 QiFlow action 中添加了积分系统启用检查，只有在积分系统启用时才进行积分消耗：

**修改的文件：**
- ✅ `src/actions/qiflow/calculate-bazi.ts`
- ✅ `src/actions/qiflow/xuankong-analysis.ts`
- ✅ `src/actions/qiflow/compass-reading.ts`

**修改内容：**
```typescript
// 修改前
const creditsUsed = QIFLOW_PRICING.bazi
try {
  await consumeCredits({
    userId,
    amount: creditsUsed,
    description: `八字计算 - ${input.name}`,
  })
} catch (error) {
  return { ok: false as const, error: 'INSUFFICIENT_CREDITS' }
}

// 修改后
const creditsUsed = QIFLOW_PRICING.bazi
if (websiteConfig.credits.enableCredits) {  // 添加条件检查
  try {
    await consumeCredits({
      userId,
      amount: creditsUsed,
      description: `八字计算 - ${input.name}`,
    })
  } catch (error) {
    return { ok: false as const, error: 'INSUFFICIENT_CREDITS' }
  }
}
```

### 2. 优化积分系统配置
修改了 `src/config/website.tsx` 的积分配置：

**修改内容：**
```typescript
credits: {
  enableCredits: true, // 从条件判断改为始终启用
  enablePackagesForFreePlan: false,
  registerGiftCredits: {
    enable: true,
    amount: 100, // 从50增加到100，足够体验所有功能
    expireDays: 30,
  },
  // ... 其他配置
}
```

**积分消耗说明：**
- 八字计算：10 积分
- 风水分析：20 积分
- AI 对话：5 积分
- PDF 导出：5 积分
- 新用户注册赠送：100 积分（可使用约10次八字计算或5次风水分析）

## 测试建议

### 1. 新用户注册测试
```bash
# 步骤
1. 清空数据库或创建新用户
2. 注册新账号
3. 检查用户是否获得100积分
4. 提交八字分析，应该成功（消耗10积分）
5. 检查剩余积分是否为90
```

### 2. 积分不足测试
```bash
# 步骤
1. 将用户积分设置为5（少于八字计算所需的10积分）
2. 尝试提交八字分析
3. 应该看到 INSUFFICIENT_CREDITS 错误
4. 验证前端是否有友好的错误提示
```

### 3. 匿名用户测试
```bash
# 步骤
1. 未登录状态访问八字分析页面
2. 提交分析请求
3. 应该根据业务需求：
   - 如果允许匿名使用，应该成功（不消耗积分）
   - 如果需要登录，应该重定向到登录页面
```

## 相关配置

### 环境变量（可选）
如果需要在演示模式下才启用积分系统，可以使用：
```env
NEXT_PUBLIC_DEMO_WEBSITE=true
```

### 价格配置
所有功能的积分定价在 `src/config/qiflow-pricing.ts`：
```typescript
export const QIFLOW_PRICING = {
  aiChat: 5,
  bazi: 10,
  xuankong: 20,
  deepInterpretation: 30,
  pdfExport: 5,
}
```

## 后续优化建议

### 1. 用户体验改进
- ❌ 在前端显示积分余额
- ❌ 在功能入口显示所需积分
- ❌ 积分不足时提供充值引导
- ❌ 添加首次免费体验功能

### 2. 错误处理改进
建议在前端添加更友好的错误提示：
```typescript
if (result.error === 'INSUFFICIENT_CREDITS') {
  toast.error('积分不足，请充值后继续使用', {
    action: {
      label: '去充值',
      onClick: () => router.push('/settings/credits')
    }
  })
}
```

### 3. 业务逻辑优化
考虑为不同用户群体提供差异化服务：
- **新用户**：首次使用免费或额外赠送积分
- **会员用户**：每月自动赠送积分
- **匿名用户**：允许限次免费试用

## 影响范围
- ✅ 八字计算功能
- ✅ 风水分析功能  
- ✅ 罗盘读取功能
- ⚠️ AI 对话功能（需要检查是否有类似问题）
- ⚠️ PDF 导出功能（需要检查是否有类似问题）

## 验证清单
- [x] 积分系统启用状态正确
- [x] 新用户注册时获得初始积分
- [x] 所有 QiFlow action 添加了积分系统检查
- [x] 没有 lint 错误
- [ ] 前端错误提示友好
- [ ] 所有功能正常工作
- [ ] 数据库迁移正常

## 相关文件
- `src/config/website.tsx` - 积分系统配置
- `src/config/qiflow-pricing.ts` - 功能定价配置
- `src/actions/qiflow/calculate-bazi.ts` - 八字计算
- `src/actions/qiflow/xuankong-analysis.ts` - 风水分析
- `src/actions/qiflow/compass-reading.ts` - 罗盘读取
- `src/credits/credits.ts` - 积分系统核心逻辑
- `src/lib/auth.ts` - 用户注册时的积分分配

---

修复完成时间：2025-10-03
修复人员：AI Assistant




