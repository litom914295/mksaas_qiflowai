# @TECH_GUIDE_AI_BAZI_FENGSHUI_v5.1.1

目标：以最少客户端 JS 实现首页，利用 RSC、Suspense 与按需交互，遵循既有 i18n 路由结构。

1) 路由与结构
- 入口：src/app/[locale]/(marketing)/(home)/page.tsx（默认首页）
- 保留 generateMetadata 与 next-intl 机制；文案先直写中文，后续接入翻译键。
- 组件目录：src/components/qiflow/homepage/*（全部 TS + 函数组件）。

2) 技术要点
- RSC 优先：Hero/Feature/Trust/CTA/HowItWorks 为服务端组件；仅交互预览使用 'use client'（InteractiveCompassTeaser）。
- Tailwind + Shadcn：保持 design token 一致；图标使用本地 SVG。
- 性能：图像使用 <Image/>；本次占位 SVG 资源在 public/brand/*。
- 链接：/analysis/bazi、/analysis/xuankong、/ai/chat（保持现有页面存在）。

3) 合规与计费
- 计费展示仅为口径与提示，不进行余额计算；真实数据由后端/Server Action 注入。
- AgeVerification 与 DisclaimerBar 保留在页面底部。

4) 扩展点
- 将文案抽取到 i18n JSON；
- 将 CTA 与状态条抽象为可复用组件；
- 引入实验开关（AB）以验证转化。
