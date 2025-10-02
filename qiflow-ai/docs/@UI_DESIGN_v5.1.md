# QiFlow v5.1 UI 设计系统补充与落地

> 版本：5.1  
> 日期：2025-09-27  
> 范围：错误/空/限流/超时状态组件、积分消耗可视化、三色置信度提示与校准引导、合规模块与 18+ 提示；对齐 PRD/TECH/TASK 门槛

---

## 1. 设计原则与整体框架（沿用 v5.0）
（保留 v5.0 设计理念/风格/布局与主题章节）

---

## 2. 关键交互增强（v5.1 新增）

### 2.1 错误/空/限流/超时状态组件（ARB-011）
- 统一错误组件 ErrorState：
  - 接受 code/message/suggestedActions；支持重试、降级跳转。
  - 与 TECH 错误码对齐：VALIDATION_ERROR、PERMISSION_DENIED、RATE_LIMITED、PROVIDER_ERROR、TOO_MANY_REQUESTS。
- 空状态组件 EmptyState：
  - 提供学习资源与示例入口，避免“空白页”。
- 限流与超时：
  - RateLimitedBanner + TimeoutToast，提示稍后重试或切换服务。

### 2.2 积分消耗可视化（ARB-016/005）
- 在关键操作按钮旁显示“所需积分/剩余余额”。
- 余额不足禁用并弹出三级降级引导：只读预览 → 试用体验 → 快捷充值。
- 在聊天/深度解读卡片上明确“5/30 积分”标签与说明。

### 2.3 罗盘三色置信度与校准引导（ARB-006）
- ConfidenceIndicator：
  - >0.9 绿色、0.7–0.9 黄色、<0.7 红色；<0.4 必须拒答。
  - 细化提示语：低置信度请进行“8 字形校准”或切换“手动输入”。
- CalibrationFlow：
  - 引导动画 + 进度条 + 成功提示；未完成不可继续深度分析。

### 2.4 合规模块与 18+ 提示（ARB-004）
- DisclaimerBar：固定显示在分析结果与对话页底部：“结果仅供参考，请理性对待（18+）”。
- 首次使用弹窗：隐私告知 + 条款确认；记录接受状态。
- 敏感内容拒答：展示“拒答原因”与安全引导链接。

---

## 3. 页面与组件（更新点）

### 3.1 风水罗盘（CompassView）
- 增加三色 ConfidenceIndicator；加入 CalibrationButton 与 HandInputButton。
- 在低置信度时自动浮现校准层；<0.4 禁止继续分析。

### 3.2 AI 对话（AIChatInterface）
- Header 显示当前模型与积分余额；
- SourceCards 展示引用来源（可展开原文与跳转），满足“引用 100% 可核”。
- 错误/限流/超时状态组件内置。

### 3.3 结果页（Bazi/FengShui）
- 在深度解读区域，明确“30 积分”消耗文案与“余额不足”引导。
- PDF 导出按钮集成水印提示（hover 时说明将嵌入水印）。

---

## 4. 无障碍与 i18n 文化适配（与 PRD §6.3 对齐）
- 中文默认竖排/英文默认横排；时区/历法/单位的上下文提示。
- 术语词典（天干地支/时辰等）作为帮助层供一键查看。
- 对比度≥4.5:1，键盘导航/屏幕阅读器覆盖新增组件。

---

## 5. 示例结构（片段）
```tsx
// path: src/components/qiflow/compass/confidence-indicator.tsx
export const ConfidenceIndicator = ({ value }: { value: number }) => {
  const level = value > 0.9 ? 'high' : value >= 0.7 ? 'mid' : 'low';
  const color = level === 'high' ? 'text-green-500' : level === 'mid' ? 'text-amber-500' : 'text-red-500';
  return (
    <div className={`inline-flex items-center gap-2 ${color}`}>
      <span className="font-medium">置信度</span>
      <span>{Math.round(value * 100)}%</span>
    </div>
  );
};
```

```tsx
// path: src/components/qiflow/common/credits-action.tsx
export const CreditsAction = ({ need, have, onCharge }: { need: number; have: number; onCharge: () => void }) => {
  const ok = have >= need;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">需要 {need} 积分 · 余额 {have}</span>
      <button disabled={!ok} className="btn btn-primary">
        {ok ? '执行' : '余额不足'}
      </button>
      {!ok && (
        <button className="btn btn-outline" onClick={onCharge}>充值</button>
      )}
    </div>
  );
};
```

---

## 6. 验收清单（与 TASK v5.1 对齐）
- 错误/空/限流/超时组件覆盖关键路径，已联调错误码。
- 积分消耗与余额可视化，余额不足三段降级就绪。
- 罗盘三色置信度/校准/手动降级完整联动。
- 合规模块（免责声明/18+）100% 展示率，敏感内容拒答生效。
- i18n/a11y 验收通过，满足对比度/键盘/读屏标准。