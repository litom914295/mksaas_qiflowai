# Phase 1 - UI 组件盘点清单（QiFlow）

生成时间: 2025-10-02

## 页面
- /[locale]/analysis/bazi（八字分析）
  - 表单字段：name, birth, gender
  - 动作：提交、埋点（form_start/submit/success/error）
  - 合规：AgeVerification、DisclaimerBar
- /[locale]/analysis/xuankong（玄空风水）
  - 表单字段：address, facing
  - 动作：提交、埋点（form_start/submit/success/error）
  - 合规：AgeVerification、DisclaimerBar

## 组件（src/components/qiflow）
- compliance/
  - AgeVerification（年龄验证遮罩）
  - DisclaimerBar（页底免责声明）
- compass/
  - ConfidenceBadge（置信度徽章）
- confidence-*
  - ConfidenceIndicator / ConfidenceProgress / ConfidenceIcon（统一置信度展现）
- credits-price.tsx（积分价格显示）
- form-validator.tsx（实时表单校验与置信度提示）
- result-display.tsx（统一结果展示容器）
- calibration-*.tsx / environment-check.tsx / manual-input-form.tsx（罗盘与降级处理相关）

## 样式与交互检查现状
- 已接入 i18n：Bazi、Xuankong 页面标题与表单文案
- 已接入埋点：Bazi、Xuankong 表单开始/提交/成功/失败
- 合规组件：已在页面中挂载，不阻塞导航后续（测试中需先通过遮罩）

## 建议补充接入
- 将 FormValidator 融合到 Bazi / Xuankong 表单提交流程中，实现提交前高亮缺失字段与阈值提示
- 为 ResultDisplay 接入更多算法字段（当 API 返回丰富结果时）

