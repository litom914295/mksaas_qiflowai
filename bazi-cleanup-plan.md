# 八字代码清理计划

## ✅ 需要保留的新代码（bazi-pro模块）

### 核心模块 - 保留
- `src/lib/bazi-pro/` - 整个新模块目录（保留所有内容）
- `app/api/bazi/` - API路由（新的，保留）
- `services/bazi-analysis.service.ts` - 服务层（新的，保留）
- `components/bazi-analysis-result.tsx` - 新组件（保留）
- `components/bazi-analysis-entry.tsx` - 新组件（保留）
- `components/charts/wuxing-radar.tsx` - 新图表组件（保留）
- `src/__tests__/bazi-integration.test.tsx` - 新测试（保留）

## ❌ 需要删除的旧代码

### 1. qiflow-ai目录下的旧代码
- `qiflow-ai/src/components/analysis/bazi-analysis-page.tsx`
- `qiflow-ai/src/components/analysis/bazi-analysis-result.tsx`
- `qiflow-ai/src/components/analysis/enhanced-bazi-analysis-result.tsx`
- `qiflow-ai/src/components/analysis/optimized-bazi-analysis-result.tsx`
- `qiflow-ai/src/lib/ai/bazi-master-processor.ts`
- `qiflow-ai/src/lib/ai/qiflow-bazi-master.ts`
- `qiflow-ai/src/lib/reports/bazi-report-generator.ts`
- `qiflow-ai/scripts/` - 所有旧的测试脚本

### 2. src目录下的旧组件
- `src/components/analysis/` - 整个目录（旧的分析组件）
- `src/components/qiflow/analysis/` - 整个目录（旧的qiflow分析组件）
- `src/components/qiflow/bazi/` - 整个目录（旧的bazi组件）
- `src/components/qiflow/forms/BaziStepper.tsx` - 旧表单

### 3. src/lib下的旧代码
- `src/lib/ai/bazi-master-processor.ts`
- `src/lib/ai/qiflow-bazi-master.ts`
- `src/lib/cache/bazi-cache.ts` - 旧缓存（已被bazi-pro替代）
- `src/lib/qiflow/ai/` - 整个目录
- `src/lib/qiflow/reports/` - 整个目录
- `src/lib/reports/` - 整个目录（除了可能的其他报告）
- `src/lib/services/bazi-calculator-service.ts` - 旧服务
- `src/lib/workers/bazi-worker.js` - 旧worker

### 4. 旧的action
- `src/actions/qiflow/calculate-bazi.ts`

### 5. 根目录的旧文件和测试脚本
- `quick-test-bazi.ps1`
- `test-bazi-detail.ps1`
- `test-results-bazi-fengshui.json`
- `scripts/test-bazi-fengshui-integration.ts`
- `scripts/test-results-bazi-fengshui.json`
- `tests/e2e/bazi-analysis.spec.ts` - 旧的e2e测试

### 6. 旧的文档和报告（可选择性保留）
- `FIX_BAZI_MODULE_REPORT.md`
- `BAZI_AUTO_CALCULATION_GUIDE.md`
- `BAZI_FIX_COMPLETE.md`
- `BAZI_USAGE_GUIDE.md`

## ⚠️ 需要检查的文件

这些文件可能包含其他功能，需要检查后再决定：
- `public/brand/logo-bazi.svg` - 可能需要保留（品牌资源）
- `prompts/system/bazi_explainer.md` - 可能需要保留（系统提示）
- `.taskmaster/` - 任务管理文件（保留）
- `@PRD_*.md` 和 `@TASK_PLAN_*.md` - 项目文档（保留）

## 清理顺序

1. 先删除 qiflow-ai 目录下的所有旧八字代码
2. 删除 src/components 下的旧组件
3. 删除 src/lib 下的旧代码
4. 删除根目录的测试脚本
5. 清理旧文档（可选）