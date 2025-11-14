# BaZi-Pro 文档重构计划

## 📋 当前问题

### 1. 文档散乱
根目录发现14个进展报告文档：
```
@BAZI_FENGSHUI_REPORT_PROGRESS.md
@SUMMARY_week3_completion.md
@SUMMARY_week4_p0_completion.md
@TASK_PLAN_week4_v1.md
@WEEK2_COMPLETION_SUMMARY.md
BAZI_CODE_REVIEW_REPORT.md
BAZI_PROJECT_PROGRESS.md
BAZI_SUMMARY.md
MID_TERM_COMPLETION_REPORT.md
MID_TERM_PLAN.md
MID_TERM_SUMMARY.md
MID_TERM_WEEKS1-3_SUMMARY.md
WEEK1_CONFIG_SYSTEM_COMPLETE.md
WEEK2_CONFIG_INTEGRATION_COMPLETE.md
```

**问题**：
- 命名不统一（@前缀 vs 无前缀）
- 大小写混乱（WEEK vs week）
- 内容重复（多个SUMMARY）
- 缺少版本标识
- 混杂在项目根目录

### 2. 用户文档缺失
仅有 `docs/bazi-pro/CONFIGURATION.md` 一份文档，缺少：
- 快速入门指南
- API完整参考
- 最佳实践
- FAQ常见问题
- 架构设计文档
- 故障排查指南

## 🎯 目标结构

```
docs/
├── bazi-pro/                      # 用户文档（面向使用者）
│   ├── README.md                  # 总览和导航
│   ├── getting-started/           # 快速入门
│   │   ├── installation.md        # 安装配置
│   │   ├── quick-start.md         # 5分钟快速开始
│   │   └── basic-concepts.md      # 基础概念
│   ├── guides/                    # 使用指南
│   │   ├── configuration.md       # 配置系统（现有文档迁移）
│   │   ├── four-pillars.md        # 四柱计算
│   │   ├── wuxing-analysis.md     # 五行分析
│   │   ├── nayin.md               # 纳音系统
│   │   └── performance.md         # 性能优化指南
│   ├── api/                       # API参考
│   │   ├── calculator.md          # BaziCalculator API
│   │   ├── analyzer.md            # WuxingStrengthAnalyzer API
│   │   ├── config-manager.md      # BaziConfigManager API
│   │   └── types.md               # 类型定义
│   ├── best-practices/            # 最佳实践
│   │   ├── configuration.md       # 配置选择建议
│   │   ├── error-handling.md      # 错误处理
│   │   ├── performance.md         # 性能优化
│   │   └── testing.md             # 测试实践
│   ├── troubleshooting/           # 故障排查
│   │   ├── common-issues.md       # 常见问题
│   │   ├── debugging.md           # 调试技巧
│   │   └── faq.md                 # FAQ
│   └── architecture/              # 架构设计
│       ├── overview.md            # 架构概览
│       ├── modules.md             # 模块设计
│       └── algorithms.md          # 算法说明
│
└── bazi-pro-internals/            # 开发文档（面向维护者）
    ├── README.md                  # 开发文档导航
    ├── development/               # 开发记录
    │   ├── code-review.md         # 代码审查报告（归档）
    │   ├── progress/              # 进展报告（归档）
    │   │   ├── week1-config-system.md
    │   │   ├── week2-integration.md
    │   │   ├── weeks1-3-summary.md
    │   │   └── mid-term-completion.md
    │   └── decisions/             # 设计决策
    │       ├── configuration-system.md
    │       ├── cache-strategy.md
    │       └── test-strategy.md
    ├── maintenance/               # 维护指南
    │   ├── testing.md             # 测试策略
    │   ├── monitoring.md          # 性能监控
    │   └── releases.md            # 发布流程
    └── references/                # 参考资料
        ├── traditional-texts.md   # 传统典籍
        ├── algorithms.md          # 算法参考
        └── research.md            # 研究资料
```

## 🔄 迁移计划

### Phase 1: 归档进展报告（30分钟）
将根目录14个文档归档到 `docs/bazi-pro-internals/development/progress/`：

| 原文件名 | 新文件名 | 操作 |
|---------|---------|------|
| BAZI_CODE_REVIEW_REPORT.md | `code-review-2025-11-12.md` | 移动+重命名 |
| WEEK1_CONFIG_SYSTEM_COMPLETE.md | `week1-config-system-2025-11-12.md` | 移动+重命名 |
| WEEK2_CONFIG_INTEGRATION_COMPLETE.md | `week2-integration-2025-11-13.md` | 移动+重命名 |
| MID_TERM_WEEKS1-3_SUMMARY.md | `weeks1-3-summary-2025-11-13.md` | 移动+重命名 |
| MID_TERM_COMPLETION_REPORT.md | `mid-term-completion-2025-11-13.md` | 移动+重命名 |
| MID_TERM_PLAN.md | `mid-term-plan-2025-11-12.md` | 移动+重命名 |
| MID_TERM_SUMMARY.md | 合并到 `mid-term-completion-2025-11-13.md` | 删除 |
| BAZI_PROJECT_PROGRESS.md | 合并到 `mid-term-completion-2025-11-13.md` | 删除 |
| BAZI_SUMMARY.md | 合并到 `mid-term-completion-2025-11-13.md` | 删除 |
| @BAZI_FENGSHUI_REPORT_PROGRESS.md | `fengshui-progress-2025-11-xx.md` | 移动+重命名 |
| @SUMMARY_week3_completion.md | `week3-summary-2025-11-xx.md` | 移动+重命名 |
| @SUMMARY_week4_p0_completion.md | `week4-p0-summary-2025-11-xx.md` | 移动+重命名 |
| @TASK_PLAN_week4_v1.md | `week4-task-plan-2025-11-xx.md` | 移动+重命名 |
| @WEEK2_COMPLETION_SUMMARY.md | `week2-summary-2025-11-xx.md` | 移动+重命名 |

### Phase 2: 创建用户文档框架（1小时）
1. 创建目录结构
2. 编写 `docs/bazi-pro/README.md` 导航文档
3. 迁移 `CONFIGURATION.md` 到 `guides/configuration.md`

### Phase 3: 编写核心文档（4-6小时）
优先级顺序：
1. **P0 - 快速入门**（2小时）
   - `getting-started/quick-start.md` - 5分钟示例
   - `getting-started/installation.md` - 安装配置
2. **P1 - API参考**（2小时）
   - `api/calculator.md` - BaziCalculator
   - `api/analyzer.md` - WuxingStrengthAnalyzer
   - `api/config-manager.md` - BaziConfigManager
3. **P2 - 最佳实践**（2小时）
   - `best-practices/configuration.md` - 配置选择
   - `best-practices/performance.md` - 性能优化
   - `troubleshooting/faq.md` - FAQ

### Phase 4: 创建开发文档（2小时）
1. 编写 `bazi-pro-internals/README.md`
2. 创建 `maintenance/monitoring.md` - 性能监控指南
3. 创建 `maintenance/testing.md` - 测试策略

## 📏 文档标准

### 命名规范
- 使用kebab-case：`quick-start.md`，不是 `Quick_Start.md`
- 包含日期的归档文档：`report-name-YYYY-MM-DD.md`
- 避免特殊前缀：不使用 `@`、`_` 等

### 文档结构
每个文档应包含：
```markdown
# 标题

> 一句话概述文档用途

## 目录
（可选，长文档使用）

## 内容章节

## 相关文档
- [文档A](link)
- [文档B](link)

## 最后更新
- 日期：YYYY-MM-DD
- 作者：作者名
```

### 文档类型标识
在README中用emoji标识文档类型：
- 📖 指南 (Guide)
- 📚 教程 (Tutorial)
- 🔧 参考 (Reference)
- 💡 最佳实践 (Best Practice)
- 🚨 故障排查 (Troubleshooting)

## ✅ 验收标准

- [ ] 根目录无散落的BaZi文档
- [ ] `docs/bazi-pro/` 包含完整用户文档
- [ ] `docs/bazi-pro-internals/` 归档所有开发记录
- [ ] 所有文档遵循命名规范
- [ ] README提供清晰的导航
- [ ] 至少完成P0和P1优先级文档

## 📊 预计工作量

| 阶段 | 工作量 | 说明 |
|-----|-------|------|
| Phase 1: 归档 | 30分钟 | 批量移动和重命名 |
| Phase 2: 框架 | 1小时 | 创建目录和导航 |
| Phase 3: 核心文档 | 6小时 | 快速入门+API+最佳实践 |
| Phase 4: 开发文档 | 2小时 | 监控和测试指南 |
| **总计** | **9.5小时** | |

## 🚀 立即开始

执行顺序：
1. ✅ 创建此计划文档
2. ⏭️ 执行Phase 1：归档进展报告
3. ⏭️ 执行Phase 2：创建文档框架
4. ⏭️ 执行Phase 3：编写核心文档
5. ⏭️ 执行Phase 4：创建开发文档

---

**创建日期**: 2025-11-13  
**状态**: 待执行
