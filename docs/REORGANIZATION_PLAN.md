# 文档整理计划

## 目标
将根目录散落的文档整理到 `docs` 目录，建立清晰的文档结构。

## 当前问题
- 根目录有 100+ 个 Markdown 文件
- 文档命名不统一（有 @前缀、中文、英文等）
- 文档版本管理混乱
- 缺乏统一的索引和导航

## 整理原则

### 1. 目录结构
```
docs/
├── INDEX.md                    # 主索引文件
├── README.md                   # docs 目录说明
├── getting-started/            # 快速开始
│   ├── quick-start.md
│   ├── environment-setup.md
│   └── project-summary.md
├── prd/                        # 产品需求文档
│   ├── admin-panel.md
│   ├── ai-bazi.md
│   └── ai-fengshui.md
├── tech-guide/                 # 技术指南
│   ├── admin-backend.md
│   ├── frontend.md
│   ├── database.md
│   └── api.md
├── features/                   # 功能模块文档
│   ├── auth/                   # 认证
│   ├── credit-system/          # 积分系统
│   ├── bazi/                   # 八字
│   ├── fengshui/              # 风水
│   ├── xuankong/              # 玄空
│   └── ai-chat/               # AI 对话
├── testing/                    # 测试文档
│   ├── test-reports/
│   ├── test-guides/
│   └── quality-assurance/
├── deployment/                 # 部署运维
│   ├── deployment-guide.md
│   └── troubleshooting.md
├── optimization/               # 优化文档
│   ├── performance/
│   └── ui-ux/
├── tasks/                      # 任务与进度
│   ├── task-plans/
│   └── progress-reports/
└── archive/                    # 归档文档
    └── 2025-01/
```

### 2. 文件命名规范
- 使用小写字母和连字符：`kebab-case.md`
- 避免使用 @ 前缀（除非是特殊标记）
- 版本号使用后缀：`document-name-v5.1.1.md`
- 中文文档统一翻译为英文文件名

### 3. 文档分类

#### 保留在根目录
- README.md - 项目主说明
- QUICK_START.md - 快速启动
- CHANGELOG.md - 变更日志（如果有）
- CONTRIBUTING.md - 贡献指南（如果有）

#### 移动到 docs/getting-started/
- @PROJECT_SUMMARY_v5.1.1.md → project-summary.md
- @README_快速开始.md → quick-start-guide.md
- environment-setup.md（已存在）

#### 移动到 docs/prd/
- @PRD_ADMIN_PANEL_FINAL_v5.1.1.md → admin-panel-v5.1.1.md
- @PRD_AI_BAZI_FENGSHUI_v5.1.1.md → ai-bazi-fengshui-v5.1.1.md
- @PRD_AI_BAZI_v5.1.1.md → ai-bazi-v5.1.1.md

#### 移动到 docs/tech-guide/
- @TECH_GUIDE_ADMIN_v5.1.1.md → admin-backend-v5.1.1.md
- @UI_DESIGN_AI_BAZI_FENGSHUI_v5.1.1.md → ui-design-guide-v5.1.1.md

#### 移动到 docs/tasks/
- @TASK_PLAN_ADMIN_v5.1.1.md → admin-task-plan-v5.1.1.md
- @TASK_PLAN_AI_BAZI_FENGSHUI_v5.1.1.md → ai-bazi-task-plan-v5.1.1.md
- @IMPLEMENTATION_PROGRESS_REPORT.md → implementation-progress.md

#### 移动到 docs/features/auth/
- @QUICK_START_AUTH.md → quick-start.md
- @AUTH_SETUP_GUIDE.md → setup-guide.md
- @AUTH_TESTING_GUIDE.md → testing-guide.md
- @AUTH_FIX_SUMMARY.md → fix-summary.md

#### 移动到 docs/features/credit-system/
- @CREDIT_SYSTEM_INTEGRATION_COMPLETE.md → integration-complete.md

#### 移动到 docs/features/fengshui/
- @FENGSHUI_OPTIMIZATION_COMPLETE.md → optimization-complete.md
- @FENGSHUI_ROOM_LAYOUT_OPTIMIZATION.md → room-layout-optimization.md

#### 移动到 docs/testing/
- @TESTING_REPORT_v5.1.1.md → test-report-v5.1.1.md
- comprehensive-test-report.md（已存在）

#### 移动到 docs/database/
- @DATABASE_SETUP_SOLUTION.md → setup-solution.md
- @SUPABASE_ACCESS_GUIDE.md → supabase-access-guide.md

#### 移动到 docs/optimization/
- @UI_UX_OPTIMIZATION_PLAN_v5.1.1.md → ui-ux-plan-v5.1.1.md
- @GROWTH_P0_SUMMARY_v5.1.1.md → growth-p0-summary-v5.1.1.md

#### 移动到 docs/archive/
所有临时文档、修复记录、过时文档

## 执行步骤

### 阶段 1：准备工作（已完成）
- [x] 创建 docs/INDEX.md 主索引
- [x] 分析现有文档结构
- [x] 制定整理计划

### 阶段 2：创建目录结构
```bash
# 创建功能模块目录
mkdir -p docs/getting-started
mkdir -p docs/prd
mkdir -p docs/tech-guide
mkdir -p docs/features/auth
mkdir -p docs/features/credit-system
mkdir -p docs/features/bazi
mkdir -p docs/features/fengshui
mkdir -p docs/features/xuankong
mkdir -p docs/features/ai-chat
mkdir -p docs/testing/test-reports
mkdir -p docs/testing/test-guides
mkdir -p docs/database
mkdir -p docs/deployment
mkdir -p docs/optimization/performance
mkdir -p docs/optimization/ui-ux
mkdir -p docs/tasks/task-plans
mkdir -p docs/tasks/progress-reports
```

### 阶段 3：移动和重命名文件
使用脚本批量移动文件，同时更新文件内的引用链接

### 阶段 4：更新索引和链接
- 更新 docs/INDEX.md
- 更新管理后台文档配置
- 检查所有文档中的链接

### 阶段 5：归档旧文档
将不再使用的文档移至 archive

### 阶段 6：验证和测试
- 检查所有链接是否有效
- 测试管理后台文档中心
- 确认文档可访问性

## 注意事项
1. 备份原始文件（Git 已做版本控制）
2. 保持向后兼容，旧链接应重定向
3. 更新所有引用这些文档的代码
4. 通知团队成员文档位置变更

## 预期效果
- ✅ 文档结构清晰，易于查找
- ✅ 统一的命名规范
- ✅ 完善的索引导航
- ✅ 更好的可维护性
- ✅ 新人更容易上手

## 维护计划
- 每周检查新增文档是否放在正确位置
- 每月整理归档过时文档
- 每季度审查文档结构是否需要调整
