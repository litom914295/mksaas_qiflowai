# 签到功能升级说明

## 升级内容

### 1. 无感签到（自动签到）
- **功能描述**：用户进入仪表盘页面时自动触发签到，无需手动点击
- **实现方式**：通过 React `useEffect` 钩子在组件挂载时自动调用签到 API
- **用户体验**：
  - 进入页面即显示"正在自动签到..."
  - 签到成功后显示"今日已自动签到"并弹出积分奖励提示
  - 签到失败静默处理，不打扰用户

### 2. 随机积分奖励（5-20 积分）
- **功能描述**：每次签到获得 5-20 的随机积分，增加惊喜感
- **实现方式**：在后端 API 中使用 `Math.random()` 生成随机数
- **配置位置**：`src/config/website.ts`
  ```typescript
  dailySignin: {
    enable: true,
    amount: 5,        // 基础积分（保留用于降级）
    minAmount: 5,     // 最小随机积分
    maxAmount: 20,    // 最大随机积分
    autoSignIn: true, // 无感签到开关
  }
  ```

### 3. 签到状态查询优化
- **问题修复**：原超时时间过短（5秒）导致签到状态经常显示错误
- **优化方案**：
  - 延长超时时间至 15 秒
  - 添加降级查询：主查询超时时使用简化查询（只查今天）
  - 双重保障确保签到状态正确显示

## 修改文件清单

### 1. 配置文件
- `src/config/website.ts`
  - 添加 `minAmount` 和 `maxAmount` 配置
  - 添加 `autoSignIn` 开关

### 2. 后端 API
- `src/app/api/credits/daily-signin/route.ts`
  - 实现随机积分逻辑
  - 返回 `earnedCredits` 字段

### 3. 数据获取
- `src/app/actions/dashboard/get-dashboard-data.ts`
  - 延长签到状态查询超时至 15 秒
  - 添加降级查询逻辑
  - 改进错误日志

### 4. 前端组件
- `src/components/dashboard/personal/activity-section.tsx`
  - 添加自动签到逻辑
  - 添加 `earnedCredits` 状态显示
  - 更新 UI 显示随机积分范围
  - 移除手动签到按钮，改为状态展示

## 用户体验改进

### 之前的体验
1. 用户进入页面后看到"未签到"状态
2. 需要手动点击"立即签到"按钮
3. 每次固定获得 5 积分
4. 刷新页面后可能显示错误的签到状态

### 现在的体验
1. 用户进入页面自动触发签到
2. 自动弹出积分奖励提示（5-20 随机）
3. 显示"今日已自动签到"状态
4. 3 秒后奖励数字消失，显示"5-20 积分"范围提示

## UI 变化

### 签到卡片
```
┌─────────────────────────────────────┐
│ 📅 每日签到            [已签到]    │
│ 连续签到获得更多奖励               │
├─────────────────────────────────────┤
│ 🏆 连续签到              7 天      │
│                                     │
│ 本周进度                     7/7   │
│ ████████████████████████████  100% │
│                                     │
│ 🎁 本次获得         +15 积分 ✨    │
│    (3秒后显示: 每日签到奖励 5-20)  │
│                                     │
│ ✅ 今日已自动签到                  │
└─────────────────────────────────────┘
```

## 技术细节

### 自动签到流程
1. 组件挂载 → 检查 `isSigned` 状态
2. 如果未签到且未尝试过自动签到 → 调用 API
3. API 成功 → 更新状态 + 显示 Toast
4. 3 秒后清除 `earnedCredits` 显示

### 随机积分算法
```typescript
const minAmount = 5;
const maxAmount = 20;
const randomAmount = Math.floor(
  Math.random() * (maxAmount - minAmount + 1)
) + minAmount;
```

### 幂等性保证
- API 检查当天是否已签到（基于 `DAILY_SIGNIN` 交易记录）
- 前端防止重复调用（`autoSignInAttempted` 标志）

## 配置选项

如需调整签到行为，可修改 `src/config/website.ts`：

```typescript
dailySignin: {
  enable: true,           // 总开关
  amount: 5,              // 降级时使用的基础积分
  minAmount: 5,           // 最小随机积分（可调整为 10）
  maxAmount: 20,          // 最大随机积分（可调整为 30）
  autoSignIn: true,       // 改为 false 恢复手动签到
}
```

## 测试建议

1. **测试自动签到**
   - 清除浏览器缓存
   - 访问仪表盘页面
   - 观察是否自动弹出签到成功提示

2. **测试随机积分**
   - 多次签到（需要清除数据库记录测试）
   - 观察每次获得的积分是否在 5-20 范围内

3. **测试幂等性**
   - 同一天内刷新页面多次
   - 确认不会重复签到

4. **测试超时处理**
   - 模拟数据库慢查询
   - 观察是否能正确降级并显示状态

## 回滚方案

如需恢复原功能，可执行以下操作：

1. 在 `website.ts` 中设置 `autoSignIn: false`
2. 恢复原 UI 按钮代码（保留在注释中）
3. 移除 `minAmount` 和 `maxAmount` 配置

## 维护注意事项

1. **积分范围调整**：修改 `website.ts` 中的 `minAmount` 和 `maxAmount`
2. **关闭自动签到**：设置 `autoSignIn: false`
3. **超时时间调整**：修改 `get-dashboard-data.ts` 和 API 中的超时值
4. **积分显示时长**：修改 `setTimeout` 的时间参数（默认 3000ms）
