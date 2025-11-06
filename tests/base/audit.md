# 测试基线审计报告
生成时间：2025-11-06

## 环境信息
- Node.js: v22.16.0
- npm: 10.9.2
- 项目：qiflowai v0.1.0
- 框架：Next.js 15 + React 19 + TypeScript

## 现有测试清单

### 测试文件统计
- 单元测试：80+ 个测试文件
- E2E 测试：13 个 Playwright 测试文件
- API 测试：2 个
- 安全测试：1 个

### 主要测试覆盖区域
1. **核心业务逻辑**
   - 八字计算 (bazi calculator)
   - 玄空风水 (xuankong/fengshui)
   - AI 编排 (master-orchestrator)
   - 积分系统 (credits)

2. **API 路由**
   - /api/bazi
   - /api/fengshui
   - /api/credits
   - /api/chat
   - /api/stripe/webhook

3. **E2E 场景**
   - 烟雾测试
   - 健康检查
   - AI 聊天流程
   - 游客分析
   - 管理员功能

## 问题清单

### TEST-001：测试运行器配置问题
- **状态**：严重
- **描述**：缺少正确的测试脚本配置
  - `test:unit` 脚本未定义
  - `test:api` 脚本未定义
  - `test:coverage` 脚本未定义
- **影响**：无法运行分类测试

### TEST-002：依赖冲突问题
- **状态**：严重
- **描述**：测试依赖与 React 19 不兼容
  - @testing-library/dom 缺失
  - @testing-library/react-hooks 与 React 19 不兼容
  - MSW 需要更新到 v2
- **影响**：80+ 个测试文件失败

### TEST-003：环境配置问题
- **状态**：中等
- **描述**：测试环境配置不完整
  - vitest.config.ts 存在但配置不完整
  - setup.ts 缺少必要的 mock 和 polyfill
  - 缺少 MSW 服务器配置

## 现有脚本状态
```json
{
  "test": "vitest",                    // ✅ 存在但不够细分
  "test:unit": "vitest run",            // ✅ 存在
  "test:unit:watch": "vitest",          // ✅ 存在
  "test:coverage": "vitest run --coverage", // ✅ 存在
  "test:e2e": "playwright test",        // ✅ 存在
  "test:api": "vitest run tests/api",   // ✅ 存在
  "test:security": "vitest run tests/security" // ✅ 存在
}
```

## 阻塞项
1. 依赖版本不兼容（React 19 + testing-library）
2. 缺少 @testing-library/dom
3. MSW 配置缺失
4. Next.js 相关 mock 不完整

## 下一步行动
1. 修复依赖兼容性问题
2. 完善测试运行器配置
3. 建立完整的测试基础设施
4. 修复失败的测试用例