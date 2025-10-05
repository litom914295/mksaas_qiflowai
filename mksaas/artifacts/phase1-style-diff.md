# Phase 1 - 样式一致性差异报告（QiFlow）

生成时间: 2025-10-02

## 对齐基线
- 技术栈：Tailwind + Shadcn UI + Radix UI
- 主题令牌：text-muted-foreground / bg-muted / border-muted 等
- 响应式：移动端优先，md/lg 断点增量增强

## 已修复（补丁已提交）
- Xuankong 手动回退表单占位符已接入 i18n（notes 字段）
- Bazi / Xuankong 文案国际化接入，去除硬编码中文
- 埋点可视化队列（window.__qiflow_events）便于 E2E 验证

## 待优化项（建议）
1) 表单输入样式统一
- 现状：页面内直接使用 border + rounded 的基础类
- 建议：抽象 Input 组件（若项目已包含 Shadcn Input 则复用），统一 focus、disabled、错误态样式

2) 结果提示卡片的语义化令牌
- 现状：bg-red-50 / bg-green-50 等硬编码颜色
- 建议：迁移到 bg-muted / text-muted-foreground 等令牌，或建立 success/warn/error 的语义色板映射

3) 置信度徽章与进度条的一致性
- 现状：ConfidenceBadge 与 ConfidenceProgress 配色与间距需与主题统一
- 建议：提炼为小尺寸/默认尺寸两档，并统一使用 spacing 与色板令牌

4) 四态组件（Empty/Error/Limited/Timeout）落点
- 现状：页面内具备错误/成功提示，但四态组件未统一复用
- 建议：在表单提交与结果区域接入统一四态组件容器

## 风险与回归
- i18n 键值变更需与 messages/*.json 同步，避免 404 文案
- 埋点新增无需环境变量，已降级安全

