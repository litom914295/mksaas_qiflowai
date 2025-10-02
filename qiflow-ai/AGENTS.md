# QiFlow AI 代理协作指南

## 项目概览
- QiFlow AI 是结合传统玄空风水、八字命理与现代 AI 的综合分析平台，核心是 Next.js 15 + React 18 + TypeScript 的 Web 应用。
- 产品提供罗盘测向、飞星盘绘制、AI 洞察、嘉宾（游客）试用流程以及会员订阅等功能。
- 前端大量采用 shadcn/ui、Tailwind CSS 4、Konva、React Konva 与 Three.js；后端依赖 Supabase(PostgreSQL + Auth + 存储)。
- 工程强调多语言支持（默认 zh-CN，支持 6 种语言）与国际化路由，i18n 逻辑集中在 `src/middleware.ts` 及 `src/lib/i18n`。

## 关键子系统速览
- **罗盘模块**（`src/components/compass` & `src/lib/compass`）：包含罗盘渲染器、性能监控、传感器融合、24 山/八卦数据与主题配置。`FengShuiCompass` 组件负责与 Konva 舞台交互，`FengShuiCompassRenderer` 负责绘制，`performance-monitor.ts` 记录指标。
- **罗盘优化版**（`*-optimized.*`）：提供性能与主题增强版本，配套测试位于 `src/components/compass/__tests__`。
- **AI 分析**（`src/lib/compass/ai-analysis.ts` + `src/lib/ai/*`）：罗盘调用 `FengShuiAIAnalysis` 生成山向、卦象与吉凶建议；`src/lib/ai/providers` 封装 OpenAI / Claude / Gemini / DeepSeek 等供应商。
- **八字与风水算法**（`src/lib/bazi`、`src/lib/fengshui`）：实现十神、用神、流年运势及玄空飞星核心算法，配有缓存与大量注释/测试。
- **嘉宾（游客）分析体验**（`src/components/analysis/enhanced-guest-analysis-page.tsx` + `src/app/[locale]/test-guest`）：提供一体化体验，内含罗盘、AI 分析、导出分享等 UI；`safe-data-utils.ts` 保证 AI 结果健壮性。
- **认证与会话**（`src/lib/auth` + `src/app/api/auth/*`）：封装 Supabase 登录、游客会话迁移、Row-Level Security。`guest-session.ts` 与配套测试确保游客体验平滑。
- **API 路由与页面**（`src/app`）：Next.js App Router，`compass-demo` 与 `compass-demo/optimized` 展示不同罗盘版本；`api/` 下包含认证、嘉宾开局等接口。
- **数据库脚本**（`database/`）：`schema.sql` 与 `encryption_*.sql` 定义完整数据结构、加密逻辑及索引；请勿在无上下文时改动生产脚本。
- **文档资料**（`docs/`、`COMPASS_*.md` 等）：详细记录罗盘迁移、优化策略、测试报告、TS 错误处理指南等，可作为深入了解背景的第一站。

## 目录与文件指引
- `src/components/compass/index.ts` 导出罗盘相关组件与错误边界。
- `src/lib/compass/feng-shui-types.ts` 集中定义罗盘事件、AI 结果、传感器数据、主题配置等类型。
- `src/lib/compass/compass-integration.ts` 与 `docs/compass-integration-*.md` 描述老版罗盘迁移、多渠道接入。
- `scripts/start-optimized-compass-demo.js` 快速启动优化版演示。
- `.claude/agents`、`CLAUDE.md`、`GEMINI.md` 提供不同智能体的上下文模板，可参考补充定制化指令。

## 常用脚本
- `npm run dev`：本地开发（默认 3000/3001 端口，取决于配置）。
- `npm run build` / `npm start`：产出并运行生产包。
- `npm run lint` / `npm run type-check` / `npm run format`：保持代码风格与类型安全。
- `npm test`、`npm run test:watch`、`npm run test:coverage`：执行 Jest 单元测试与覆盖率。
- `npm run test:e2e`、`npm run test:e2e:ui`：Playwright 端到端测试。
- `npm run docker:*`：容器构建、运行与开发。

## 协作建议（多代理场景）
1. **进入角色前先加载上下文**：阅读 `CLAUDE.md`、`GEMINI.md` 与相关 PRD/报告，理解当前阶段目标（例如罗盘优化、嘉宾体验、国际化）。
2. **明确工作边界**：前端 UI/动画修改需同步考虑 `FengShuiCompassRenderer` 与 `performance-monitor.ts`，算法层改动需更新 `__tests__` 与相关文档。
3. **保持类型与数据安全**：所有罗盘/AI 输出应通过 `safe-data-utils.ts` 或等效校验，防止 `undefined/null` 造成运行时异常。
4. **记录上下文**：复杂任务建议更新 `.claude/agents/context-manager` 所要求的决定与 TODO，便于后续代理延续。
5. **多语言注意事项**：新增文案需更新 `src/locales` 下各语言，路由需通过 `[locale]` 前缀访问，必要时调整 `middleware`。
6. **性能与权限**：涉及浏览器传感器（DeviceOrientation、Geolocation）或 Web Share API 时，提供降级方案并捕捉异常到 `onEvent`。

## 测试与质量控制
- 核心算法均有 Jest 测试（`src/lib/compass/__tests__`、`src/lib/fengshui/__tests__`、`src/lib/bazi/__tests__` 等）；新增/修改算法需补充测试。
- UI 组件测试集中在 `src/components/compass/__tests__`；如调整交互逻辑，确保更新快照与行为断言。
- 运行 `npm run lint` / `npm run format` 保持风格一致；提交前建议检查 `coverage/`、`report/` 输出是否异常。
- 网络受限环境下（默认无外网），请避免在 CI/本地脚本中增加新依赖下载步骤；如需网络访问需提前获批。

## 风险与注意事项
- 代码库包含大量中文注释与字符串，部分文件在 Windows PowerShell 中会出现编码乱码；编辑时请确认 IDE 采用 UTF-8。
- `package.json` 使用 Next.js 15 / React 19 RC，注意与第三方库的兼容性，升级依赖需谨慎验证。
- Supabase service key、OpenAI/Anthropic/Gemini/DeepSeek 等凭证必须通过环境变量提供，严禁写入仓库。
- `database/` 下 SQL 脚本可能直接作用生产环境，提交前务必双重检查。

## 推荐阅读顺序
1. `docs/compass-optimization-guide.md` 与 `COMPASS_OPTIMIZATION_SUMMARY.md`——了解当前罗盘优化计划。
2. `docs/feng-shui-compass-usage-guide-zh.md`——掌握核心功能与交互流程。
3. `README.md`、`CLAUDE.md`、`GEMINI.md`——掌握历史背景与通用规范。
4. `docs/typescript-error-handling-guide.md`、`docs/code-review-report-zh.md`——提升 TS 错误处理与代码审查质量。

> 如需扩展新代理角色或操作流程，可在 `.claude/agents`、`.taskmaster/` 内新增配置，并同步更新本指南。
