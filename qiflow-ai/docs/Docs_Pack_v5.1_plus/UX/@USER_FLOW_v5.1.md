# 用户流程图（v5.1）— AI 八字玄空风水应用
> 依据：@PRD_v5.0.md、@TECH_GUIDE_v5.0.md、@TASK_PLAN_v5.0.md、@UI_DESIGN_v5.0.md、@REVIEW_FINAL_arbiter.json。
> 目标：覆盖 MVP 的关键闭环：注册→校准→分析→预约/支付→报告/导出→复购与留存。

```mermaid
flowchart TD
  A[首次访问] --> B{是否登录}
  B -- 否 --> C[注册/登录（Better Auth+Stripe）]
  B -- 是 --> D[首页：快捷入口/历史/余额]
  C --> D

  D --> E[罗盘校准向导]
  E --> F{传感器可用?}
  F -- 是 --> G[四通道融合: DeviceOrientation/WMM/SunCalc/地图对齐]
  F -- 否 --> H[降级：手动输入/地图偏角/拒答提示]

  G --> I[八字排盘输入]
  H --> I
  I --> J[玄空飞星计算（24山/兼线/坐向/流/运）]
  J --> K[RAG 证据检索与引用展示]
  K --> L{订阅/积分充足?}
  L -- 是 --> M[生成详解报告（引用/置信度/免责声明）]
  L -- 否 --> N[充值/订阅引导（金额/权益/发票）]
  M --> O[导出PDF/分享（水印/审计）]
  O --> P[预约大师（多租户）]
  P --> Q[支付/分账]
  Q --> R[评价与反馈 → 样例库/质量回流]
  R --> S[复购：个性化推荐/回访任务]

  subgraph Growth Loop
  S --> T[站内/邮件/短信提醒（低余额/回访/新运盘）]
  T --> D
  end
```

## 状态与约束
- 状态：空/错误/限流/超时 统一组件（参见 @UI_DESIGN_v5.0.md）。
- 计费：入口强校验（参见 @PRD_v5.0.md & @REVIEW_FINAL_arbiter.json prd_patch）。
- 合规：显著免责声明、18+ 提示、隐私与撤回（参见 @COMPLIANCE_KIT_v5.1.md）。
