# 🔮 QiFlow AI QiFlow AI - 智能命理风水分析平台

<div align="center">

**下一代 AI 驱动的命理风水 SaaS 平台**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Better Auth](https://img.shields.io/badge/Better%20Auth-1.1-green)](https://better-auth.com/)

[English](README.md) | [中文文档](README_zh-CN.md)

</div>

---

## 📋 项目简介

QiFlow AI QiFlow AI 是一个基于现代化技术栈构建的智能命理风水分析平台，集成了八字分析、玄空风水、智能罗盘、AI 对话等多个核心功能模块。项目采用 Next.js 15 + TypeScript + Better Auth 架构，提供完整的用户认证、积分系统、多语言支持和数据持久化能力。

## ✨ 核心特性

### 🎯 业务功能

- **🔮 八字分析** - 基于生辰八字的智能命理分析，支持手动输入和自动计算
- **🏠 玄空风水** - 飞星风水布局分析，提供详细的方位建议
- **🧭 智能罗盘** - 基于传感器的罗盘读取，支持置信度检测和手动校准
- **📐 户型分析** - 可视化户型编辑器，支持风水布局评估
- **💬 AI 对话** - 多模型支持的智能对话系统，提供专业咨询服务
- **📊 个人仪表板** - 完整的用户数据管理和历史记录查看

### 🛡️ 技术特性

- **🔐 Better Auth 认证** - 现代化的身份认证系统，支持邮箱登录、会话管理
- **💰 积分系统** - 完整的积分充值、消费、交易记录管理
- **🌍 国际化支持** - 支持中文、英文、马来语等多语言切换
- **📱 响应式设计** - 完美适配桌面端、平板和移动设备
- **🎨 现代化 UI** - 基于 Shadcn UI 的精美组件库
- **⚡ 性能优化** - RSC 架构、数据缓存、代码分割
- **🔄 数据持久化** - PostgreSQL + Drizzle ORM，支持完整的数据回滚

---

## 🚀 快速开始

### 环境要求

| 依赖 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | 20.x LTS | 推荐使用最新 LTS 版本 |
| PostgreSQL | 14+ | 主数据库 |
| npm/pnpm | 最新版 | 包管理工具 |
| Git | 2.x | 版本控制 |

### 安装步骤

#### 1. 克隆项目

```bash
git clone https://github.com/litom914295/QiFlow AI_qiflowai.git
cd QiFlow AI_qiflowai
```

#### 2. 安装依赖

```bash
npm install
# 或使用 pnpm (推荐)
pnpm install
```

#### 3. 环境配置

复制环境变量模板并配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置以下关键变量：

```env
# 数据库连接 (必需)
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_DATABASE_URL="postgresql://user:password@db.host:5432/database"
SESSION_DATABASE_URL="postgresql://user:password@pooler.host:6543/database"

# Better Auth 配置 (必需)
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# 应用基础配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# AI 模型 API Keys (可选，根据需要配置)
ANTHROPIC_API_KEY="sk-ant-api03-..."
OPENAI_API_KEY="sk-proj-..."
PERPLEXITY_API_KEY="pplx-..."
```

#### 4. 数据库初始化

```bash
# 推送数据库 schema
npm run db:push

# 或执行迁移
npm run db:migrate

# (可选) 查看数据库管理界面
npm run db:studio
```

#### 5. 启动开发服务器

```bash
# 标准启动
npm run dev

# 或快速启动 (带缓存优化)
npm run dev:fast
```

访问应用：
- **主页**: http://localhost:3000
- **中文版**: http://localhost:3000/zh-CN
- **英文版**: http://localhost:3000/en
- **数据库管理**: http://localhost:4983 (运行 db:studio 后)

#### 6. 运行测试

```bash
# 认证系统测试
npx tsx scripts/test-auth-complete.ts

# 单元测试
npm run test:unit

# E2E 测试
npm run test:e2e
```

---

## 📁 项目结构

```
QiFlow AI_qiflowai/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── [locale]/               # 国际化路由
│   │   │   ├── (admin)/            # 管理后台
│   │   │   ├── (auth)/             # 认证页面
│   │   │   ├── (marketing)/        # 营销页面
│   │   │   └── dashboard/          # 用户仪表板
│   │   └── api/                    # API 路由
│   │       ├── auth/               # Better Auth 端点
│   │       ├── credits/            # 积分相关 API
│   │       └── qiflow/             # QiFlow 业务 API
│   ├── actions/                    # Server Actions
│   │   ├── qiflow/                 # QiFlow 业务逻辑
│   │   │   ├── bazi.ts             # 八字分析
│   │   │   ├── xuankong.ts         # 玄空风水
│   │   │   ├── compass.ts          # 罗盘功能
│   │   │   └── floorplan.ts        # 户型分析
│   │   ├── auth.ts                 # 认证相关
│   │   └── credits.ts              # 积分操作
│   ├── components/                 # React 组件
│   │   ├── qiflow/                 # QiFlow 业务组件
│   │   ├── ui/                     # Shadcn UI 组件
│   │   ├── auth/                   # 认证组件
│   │   └── dashboard/              # 仪表板组件
│   ├── lib/                        # 工具库
│   │   ├── qiflow/                 # QiFlow 核心算法
│   │   │   ├── bazi/               # 八字算法
│   │   │   ├── xuankong/           # 玄空风水算法
│   │   │   ├── compass/            # 罗盘算法
│   │   │   └── floorplan/          # 户型分析算法
│   │   ├── auth.ts                 # Better Auth 配置
│   │   ├── auth-client.ts          # 客户端认证
│   │   └── utils.ts                # 通用工具
│   ├── db/                         # 数据库
│   │   ├── schema.ts               # Drizzle ORM Schema
│   │   └── index.ts                # 数据库连接
│   ├── config/                     # 配置文件
│   │   ├── qiflow-pricing.ts       # QiFlow 定价配置
│   │   └── site.ts                 # 站点配置
│   └── types/                      # TypeScript 类型定义
├── messages/                       # 国际化翻译文件
│   ├── zh-CN.json                  # 简体中文
│   ├── en.json                     # 英文
│   └── ms.json                     # 马来语
├── scripts/                        # 工具脚本
│   ├── test-auth-complete.ts       # 认证测试
│   ├── add-test-credits.ts         # 添加测试积分
│   └── backup-database.ts          # 数据库备份
├── docs/                           # 项目文档
│   ├── getting-started/            # 入门指南
│   ├── features/                   # 功能文档
│   └── prd/                        # 产品需求文档
├── tests/                          # 测试文件
│   ├── unit/                       # 单元测试
│   └── e2e/                        # E2E 测试
└── public/                         # 静态资源
    ├── images/                     # 图片资源
    └── locales/                    # 本地化资源
```

---

## 💻 技术栈

### 前端

| 技术 | 版本 | 描述 |
|------|------|------|
| [Next.js](https://nextjs.org/) | 15.1.8 | React 框架，支持 App Router 和 RSC |
| [React](https://react.dev/) | 19.1.0 | UI 库 |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3 | 类型安全 |
| [Tailwind CSS](https://tailwindcss.com/) | 4.0.14 | 样式框架 |
| [Shadcn UI](https://ui.shadcn.com/) | 最新 | UI 组件库 |
| [Framer Motion](https://www.framer.com/motion/) | 12.23.24 | 动画库 |
| [React Hook Form](https://react-hook-form.com/) | 7.62.0 | 表单管理 |
| [Zod](https://zod.dev/) | 4.0.17 | Schema 验证 |

### 后端

| 技术 | 版本 | 描述 |
|------|------|------|
| [Better Auth](https://better-auth.com/) | 1.1.19 | 认证系统 |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.39.3 | 数据库 ORM |
| [PostgreSQL](https://www.postgresql.org/) | 14+ | 关系型数据库 |
| [Next Safe Action](https://next-safe-action.dev/) | 7.10.4 | Server Actions 类型安全 |
| [Resend](https://resend.com/) | 4.4.1 | 邮件服务 |

### AI & 集成

| 技术 | 版本 | 描述 |
|------|------|------|
| [Vercel AI SDK](https://sdk.vercel.ai/) | 5.0.0 | AI 应用框架 |
| Anthropic Claude | - | AI 模型 |
| OpenAI GPT | - | AI 模型 |
| Perplexity | - | 搜索增强 |

### 开发工具

| 工具 | 版本 | 描述 |
|------|------|------|
| [Biome](https://biomejs.dev/) | 1.9.4 | Linter & Formatter |
| [Vitest](https://vitest.dev/) | 3.2.4 | 单元测试框架 |
| [Playwright](https://playwright.dev/) | 1.55.1 | E2E 测试框架 |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | 0.30.4 | 数据库迁移工具 |

---

## 🧪 测试

### 单元测试

```bash
# 运行所有测试
npm run test:unit

# 运行特定测试
npm run test:pricing
npm run test:thresholds
```

### E2E测试

```bash
# 生成E2E测试指南
node scripts/simple-e2e-test.js

# 手动测试指南
# 查看 artifacts/C9/screenshots/manual-e2e-test-guide.json
```

### 积分一致性验证

```bash
npm run verify:credits
```

---

## 📊 任务完成情况

### ✅ 已完成任务 (12/12)

| 任务 | 状态 | 描述 |
|-----|------|------|
| C0 | ✅ | 预检与建分支 |
| C1 | ✅ | 结构盘点与映射 |
| C2 | ✅ | 依赖与配置对齐 |
| C3 | ✅ | 数据库扩展（Drizzle合并） |
| C4 | ✅ | 认证/支付/i18n接入点 |
| C5 | ✅ | 核心业务迁移（算法/Actions/UI） |
| C6 | ✅ | 罗盘置信度分析 |
| C7 | ✅ | 营销/合规埋点 |
| C8 | ✅ | 观测/限流 |
| C9 | ✅ | 测试与冒烟 |
| C10 | ✅ | 提交与差异报告 |
| C11 | ✅ | 回滚路径与兜底链路验证 |

**总进度**: 100% (12/12 tasks, 28/28 subtasks)

---

## 🔄 回滚机制

### 数据库回滚

```bash
# 执行回滚脚本
psql $DATABASE_URL -f artifacts/C11/rollback-0004.sql
```

### 代码回滚

```bash
# Git revert（推荐）
git revert HEAD

# 或 Git reset（紧急情况）
git reset --hard <commit-before-migration>
```

### 应急响应

- **P0/P1问题**: 30分钟内完成回滚
- **详细指南**: `artifacts/C11/emergency-response-plan.md`
- **回滚脚本**: `artifacts/C11/rollback-0004.sql`

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！请阅读以下指南。

### 开发流程

1. **Fork 项目**
   ```bash
   git clone https://github.com/your-username/QiFlow AI_qiflowai.git
   cd QiFlow AI_qiflowai
   ```

2. **创建特性分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **运行检查**
   ```bash
   npm run type-check  # TypeScript 类型检查
   npm run lint        # 代码格式检查
   npm run test:unit   # 单元测试
   ```

5. **推送到 GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **创建 Pull Request**

### Commit 消息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

### 代码风格

- 使用 TypeScript 严格模式
- 遵循项目的 Biome 配置
- 为新功能添加单元测试
- 保持代码简洁可读

---

## 📚 文档

### 核心文档

- [数据库回滚指南](artifacts/C11/database-rollback-guide.md)
- [Git回滚指南](artifacts/C11/git-rollback-guide.md)
- [降级机制验证](artifacts/C11/degradation-verification.md)
- [应急响应预案](artifacts/C11/emergency-response-plan.md)
- [E2E测试指南](artifacts/C9/e2e-smoke-test.md)

### 任务文档

- [C0-C11任务文档](artifacts/)
- [性能分析报告](artifacts/C9/performance-analysis.md)
- [差异报告](artifacts/C10/diff.txt)

---

## 🛡️ 安全与合规

### 已实现的安全措施

- ✅ **年龄验证** - 18岁弹窗确认
- ✅ **免责声明** - 顶部固定声明栏
- ✅ **敏感词过滤** - 自动检测和拒答
- ✅ **积分验证** - 使用前检查余额
- ✅ **输入验证** - Zod schema验证
- ✅ **错误处理** - 完善的错误边界

### 降级处理

- 🔴 **红色** (< 0.4): 拒答 + 手动输入
- 🟡 **黄色** (0.4-0.7): 警告 + 校准引导  
- 🟢 **绿色** (≥ 0.7): 正常处理

---

## 🔑 环境变量说明

### 必需配置

```env
# 数据库连接 - 至少配置一个
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_DATABASE_URL="postgresql://user:password@db.host:5432/database"  # 直连，优先级最高
SESSION_DATABASE_URL="postgresql://user:password@pooler:6543/database"  # 连接池，回退选项

# Better Auth 安全密钥 - 必须配置
BETTER_AUTH_SECRET="your-32-char-random-secret-key"  # 生成: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"  # 生产环境改为实际域名

# 应用基础 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 可选配置

```env
# AI 模型 API Keys (根据使用的模型选择性配置)
ANTHROPIC_API_KEY="sk-ant-api03-..."  # Claude 模型
OPENAI_API_KEY="sk-proj-..."  # GPT 模型
PERPLEXITY_API_KEY="pplx-..."  # Perplexity 搜索
GOOGLE_API_KEY="..."  # Gemini 模型

# 支付配置 (如需启用支付功能)
ALIPAY_APP_ID="your_alipay_app_id"
ALIPAY_PRIVATE_KEY="your_alipay_private_key"
WECHAT_APP_ID="your_wechat_app_id"
WECHAT_MCH_ID="your_wechat_mch_id"

# 邮件服务 (如需启用邮件通知)
RESEND_API_KEY="re_..."  # Resend 邮件服务

# 分析与监控 (可选)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"  # Google Analytics
SENTRY_DSN="https://..."  # Sentry 错误跟踪

# 功能开关
ENABLE_PAYMENT="true"  # 启用支付功能
ENABLE_ANALYTICS="true"  # 启用分析统计
ENABLE_AB_TESTING="false"  # 启用 A/B 测试
```

---

## 📈 性能指标

### 当前性能

- **页面加载**: < 2秒
- **算法执行**: < 5秒
- **数据库查询**: < 500ms
- **错误率**: < 1%

### 优化建议

1. **缓存层** - 实施Redis缓存
2. **CDN** - 静态资源加速
3. **数据库优化** - 索引优化
4. **代码分割** - 按需加载

---

## 🔧 开发指南

### 添加新算法

1. 在 `src/lib/qiflow/` 创建算法目录
2. 实现核心算法逻辑
3. 添加置信度计算
4. 创建Server Action
5. 添加UI组件
6. 编写测试

### 修改定价

编辑 `src/config/qiflow-pricing.ts`:

```typescript
export const QIFLOW_PRICING = {
  aiChat: 5,
  bazi: 10,
  xuankong: 20,
  // 修改价格...
} as const
```

### 调整阈值

编辑 `src/config/qiflow-thresholds.ts`:

```typescript
export const CONFIDENCE_THRESHOLDS = {
  REJECT: 0.4,    // 红色阈值
  WARNING: 0.7,   // 黄色阈值
  NORMAL: 0.7,    // 绿色阈值
} as const
```

---

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查环境变量
   echo $DATABASE_URL
   
   # 测试连接
   npm run db:studio
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **编译错误**
   ```bash
   # 类型检查
   npx tsc --noEmit
   
   # 清理构建缓存
   rm -rf .next
   npm run build
   ```

### 获取帮助

- 📖 查看 [故障排除指南](artifacts/C11/emergency-response-plan.md)
- 🐛 提交 [Issue](https://github.com/litom914295/QiFlow AI_qiflowai/issues)
- 💬 联系开发团队

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

## 🙏 致谢

感谢所有参与QiFlow迁移项目的开发者和贡献者。

---

## 🚀 部署

### Vercel 部署 (推荐)

1. **连接 GitHub 仓库**
   - 访问 [Vercel Dashboard](https://vercel.com/)
   - 导入 GitHub 项目

2. **配置环境变量**
   - 在 Vercel 项目设置中添加所有 `.env.local` 中的环境变量
   - 注意修改 `BETTER_AUTH_URL` 为生产域名

3. **部署**
   - Vercel 会自动检测 Next.js 并部署
   - 每次 push 到 main 分支都会自动部署

### Docker 部署

```bash
# 构建镜像
docker build -t qiflowai-qiflowai .

# 运行容器
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  qiflowai-qiflowai
```

### 自托管部署

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

---

## 🔄 项目状态

### 当前版本: v5.1.1

| 模块 | 状态 | 完成度 |
|------|------|--------|
| 认证系统 | ✅ 完成 | 100% |
| 积分系统 | ✅ 完成 | 100% |
| 八字分析 | ✅ 完成 | 100% |
| 玄空风水 | ✅ 完成 | 100% |
| 罗盘功能 | ✅ 完成 | 100% |
| 户型分析 | ✅ 完成 | 100% |
| AI 对话 | ✅ 完成 | 100% |
| 国际化 | ✅ 完成 | 100% |
| 响应式设计 | ✅ 完成 | 100% |
| 管理后台 | 🚧 进行中 | 80% |

### 里程碑

- ✅ **v1.0** - 基础功能完成 (2025-10-02)
- ✅ **v5.1** - Better Auth 迁移 (2025-10-27)
- 🚧 **v5.2** - 管理后台完善 (进行中)
- 📅 **v6.0** - 性能优化与缓存 (计划中)

---

**项目状态**: ✅ 生产就绪  
**最后更新**: 2025-10-27  
**维护团队**: QiFlow AI Development Team

---

## 📞 联系方式

- **项目仓库**: https://github.com/litom914295/QiFlow AI_qiflowai
- **问题反馈**: [GitHub Issues](https://github.com/litom914295/QiFlow AI_qiflowai/issues)
- **Pull Request**: [GitHub PR](https://github.com/litom914295/QiFlow AI_qiflowai/pulls)

---

**🎉 QiFlow AI 迁移项目圆满完成！**