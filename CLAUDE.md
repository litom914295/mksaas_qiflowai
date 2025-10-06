# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 🚀 快速开始（小白用户必读）

### 欢迎！这是你的 AI 开发助手

你不需要是技术专家！只需要用中文告诉 Claude Code 你想要什么，它会自动完成所有技术工作。

### 💬 如何与 Claude Code 交流

**直接说出你的需求即可**，例如：
- "我想添加一个八字排盘功能"
- "能让首页更漂亮吗？"
- "帮我修复这个错误"
- "创建一个用户注册页面"

### 🎨 项目核心功能

你正在构建一个 **AI 八字风水网站**，包含：
- 🔮 **八字排盘**：用户输入生日，显示命盘
- 📅 **运势分析**：流年、流月运势预测
- 🏠 **风水咨询**：AI 风水分析和建议
- 💳 **付费系统**：订阅会员或购买积分
- 📚 **知识库**：风水文章和博客
- 🌏 **双语支持**：中文和英文

### ⚡ 常用命令

在终端（Terminal）中运行：
- `pnpm dev` - 启动开发服务器（开发时使用）
- `pnpm build` - 构建网站（部署前使用）
- `pnpm db:studio` - 打开数据库管理界面

**不确定？**直接问 Claude："我该运行什么命令？"

---

## 项目概述 / Project Overview

这是一个基于 Next.js 15 的 AI 八字风水 SaaS 网站，提供以下核心功能：
- **八字排盘**：根据出生日期时间生成八字命盘
- **运势分析**：提供流年、流月运势预测
- **风水咨询**：AI 辅助的风水分析和建议
- **付费功能**：基于 Stripe 的订阅和积分系统
- **内容管理**：风水知识库、博客文章
- **多语言支持**：中文和英文界面

**技术栈**：Next.js 15, PostgreSQL, Drizzle ORM, Better Auth, Stripe, Radix UI, TailwindCSS

**目标用户**：对中国传统文化感兴趣的用户，提供现代化的易经八字服务

## Development Commands

### Core Development
- `pnpm dev` - Start development server with content collections
- `pnpm build` - Build the application and content collections
- `pnpm start` - Start production server
- `pnpm lint` - Run Biome linter (use for code quality checks)
- `pnpm format` - Format code with Biome

### Database Operations (Drizzle ORM)
- `pnpm db:generate` - Generate new migration files based on schema changes
- `pnpm db:migrate` - Apply pending migrations to the database
- `pnpm db:push` - Sync schema changes directly to the database (development only)
- `pnpm db:studio` - Open Drizzle Studio for database inspection and management

### Content and Email
- `pnpm content` - Process MDX content collections
- `pnpm email` - Start email template development server on port 3333

## Project Architecture

This is a Next.js 15 full-stack SaaS application with the following key architectural components:

### Core Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with social providers (Google, GitHub)
- **Payments**: Stripe integration with subscription and one-time payments
- **UI**: Radix UI components with TailwindCSS
- **State Management**: Zustand for client-side state
- **Internationalization**: next-intl with English and Chinese locales
- **Content**: Fumadocs for documentation and MDX for content
- **Code Quality**: Biome for formatting and linting

### Key Directory Structure
- `src/app/` - Next.js app router with internationalized routing
- `src/components/` - Reusable React components organized by feature
- `src/lib/` - Utility functions and shared code
- `src/db/` - Database schema and migrations
- `src/actions/` - Server actions for API operations
- `src/stores/` - Zustand state management
- `src/hooks/` - Custom React hooks
- `src/config/` - Application configuration files
- `src/i18n/` - Internationalization setup
- `src/mail/` - Email templates and mail functionality
- `src/payment/` - Stripe payment integration
- `src/credits/` - Credit system implementation
- `content/` - MDX content files for docs and blog
- `messages/` - Translation files (en.json, zh.json) for internationalization

### 八字风水功能模块 / Bazi & Fengshui Modules
在开发八字风水功能时，建议创建以下模块：
- `src/lib/bazi/` - 八字计算核心算法（天干地支、五行、神煞等）
- `src/lib/fengshui/` - 风水分析算法
- `src/lib/lunar/` - 农历转换工具
- `src/actions/bazi/` - 八字相关的 Server Actions
- `src/components/bazi/` - 八字相关 UI 组件（命盘展示、运势图表等）
- `src/ai/` - AI 分析和解读逻辑（可接入 OpenAI, Claude 等）
- `content/knowledge/` - 风水知识库内容（MDX 格式）

### Authentication & User Management
- Uses Better Auth with PostgreSQL adapter
- Supports email/password and social login (Google, GitHub)
- Includes user management, email verification, and password reset
- Admin plugin for user management and banning
- Automatic newsletter subscription on user creation

### Payment System
- Stripe integration for subscriptions and one-time payments
- Three pricing tiers: Free, Pro (monthly/yearly), and Lifetime
- Credit system with packages for pay-per-use features
- Customer portal for subscription management

### Feature Modules
- **八字排盘 (Bazi Chart)**: 基于出生信息生成八字命盘，显示天干地支、五行分析
- **运势分析 (Fortune Analysis)**: AI 驱动的流年、流月、流日运势预测
- **风水咨询 (Fengshui Consultation)**: 家居、办公室风水分析和建议
- **付费系统 (Payment)**: 
  - 订阅制：月付/年付会员享受无限查询
  - 积分制：单次购买积分用于按次付费功能
- **知识库 (Knowledge Base)**: MDX 格式的风水知识文章、博客
- **用户中心 (User Portal)**: 历史查询记录、收藏功能、个人运势档案
- **AI Features**: 接入 OpenAI/Claude 进行智能解读和个性化建议
- **Newsletter**: 每日运势推送、风水小贴士订阅
- **Analytics**: 用户行为分析，优化产品体验
- **Storage**: S3 存储用户生成的命盘图片

### Development Workflow
1. Use TypeScript for all new code
2. Follow Biome formatting rules (single quotes, trailing commas)
3. Write server actions in `src/actions/`
4. Use Zustand for client-side state management
5. Implement database changes through Drizzle migrations
6. Use Radix UI components for consistent UI
7. Follow the established directory structure
8. Use proper error handling with error.tsx and not-found.tsx
9. Leverage Next.js 15 features like Server Actions
10. Use `next-safe-action` for secure form submissions

### 八字风水项目特定工作流 / Project-Specific Workflow
11. **中文内容优先**：所有用户界面文本、知识库内容优先考虑中文体验
12. **算法精确性**：八字计算涉及复杂的天文历法，确保算法准确性
13. **AI 解读质量**：确保 AI 生成的解读内容专业、准确、有文化底蕴
14. **文化尊重**：处理传统文化内容时保持尊重和严谨的态度
15. **用户隐私**：八字信息属于敏感个人信息，严格保护用户隐私
16. **付费合理性**：确保免费功能足够吸引用户，付费功能物有所值
17. **响应式设计**：命盘、图表等复杂组件在移动端也要有良好体验

### Configuration
- Main config in `src/config/website.tsx`
- Environment variables template in `env.example`
- Database config in `drizzle.config.ts`
- Biome config in `biome.json` with specific ignore patterns
- TypeScript config with path aliases (@/* for src/*)

### Testing and Quality
- Use Biome for linting and formatting
- TypeScript for type safety
- Environment variables for configuration
- Proper error boundaries and not-found pages
- Zod for runtime validation

## Important Notes

- The project uses pnpm as the package manager
- Database schema is in `src/db/schema.ts` with auth, payment, and credit tables
- Email templates are in `src/mail/templates/`
- The app supports both light and dark themes
- Content is managed through MDX files in the `content/` directory
- The project includes comprehensive internationalization support

Full Stack Development Guidelines
Philosophy
Core Beliefs
Iterative delivery over massive releases – Ship small, working slices of functionality from database to UI.
Understand before you code – Explore both front-end and back-end patterns in the existing codebase.
Pragmatism over ideology – Choose tools and architectures that serve the project’s goals, not personal preference.
Readable code over clever hacks – Optimize for the next developer reading your code, not for ego.
Simplicity Means
One clear responsibility per module, class, or API endpoint.
Avoid premature frameworks, libraries, or abstractions.
While latest and new technology is considerable, stable and efficient should be prioritized.
If your integration flow diagram needs an explanation longer than 3 sentences, it’s too complex.
Process
1. Planning & Staging
Break work into 3–5 cross-stack stages (front-end, back-end, database, integration). Document in IMPLEMENTATION_PLAN.md:

## Stage N: [Name]
**Goal**: [Specific deliverable across the stack]  
**Success Criteria**: [User story + passing tests]  
**Tests**: [Unit, integration, E2E coverage]  
**Status**: [Not Started|In Progress|Complete]
Update status after each merge.
Delete the plan file after all stages are verified in staging and production.
2. Implementation Flow
Understand – Identify existing patterns for UI, API, DB, and CI/CD.
Test First – For back-end, write API integration tests; for front-end, write component/unit tests.
Implement Minimal – Just enough code to pass all tests.
Refactor Safely – Clean code with test coverage at 60%+ for changed areas.
Commit Clearly – Reference plan stage, include scope (front-end, back-end, DB).
3. When Stuck (Max 3 Attempts)
Document Failures – Include console logs, stack traces, API responses, and network traces.
Research Alternatives – Compare similar solutions across different tech stacks.
Check Architecture Fit – Could this be a UI-only change? A DB query rewrite? An API contract change?
Try a Different Layer – Sometimes a front-end bug is a back-end response problem.
Technical Standards
Architecture
Composition over inheritance for both UI components and service classes.
Interfaces/contracts over direct calls – Use API specs and type definitions.
Explicit data flow – Document request/response shapes in OpenAPI/Swagger.
TDD when possible – Unit tests + integration tests for each feature slice.
Code Quality
Every commit must:

Pass linting, type checks, and formatting.
Pass all unit, integration, and E2E tests.
Include tests for new logic, both UI and API.
Before committing:

Run formatter, linter, and security scans.
Ensure commit messages explain why, not just what.
Error Handling
Fail fast with descriptive UI error messages and meaningful API status codes.
Include correlation IDs in logs for tracing full-stack requests.
Handle expected errors at the right layer; avoid silent catch blocks.
Decision Framework
When multiple solutions exist, prioritize in this order:

Testability – Can UI and API behavior be tested in isolation?
Readability – Will another dev understand this in 6 months?
Consistency – Matches existing API/UI patterns?
Simplicity – Is this the least complex full-stack solution?
Reversibility – Can we swap frameworks/services easily?
Project Integration
Learning the Codebase
Identify 3 similar features and trace the flow: UI → API → DB.
Use the same frameworks, libraries, and test utilities.
Tooling
Use the project’s existing CI/CD, build pipeline, and testing stack.
No new tools unless approved via RFC with a migration plan.
Quality Gates
Definition of Done
Tests pass at all levels (unit, integration, E2E).
Code meets UI and API style guides.
No console errors or warnings.
No unhandled API errors in the UI.
Commit messages follow semantic versioning rules.
Test Guidelines
For UI: Test user interactions and visible changes, not implementation details.
For APIs: Test responses, status codes, and side effects.
Keep tests deterministic and fast; use mocks/fakes where possible.
Important Reminders
NEVER:

Merge failing builds.
Skip tests locally or in CI.
Change API contracts without updating docs and front-end code.
ALWAYS:

Ship vertical slices of functionality.
Keep front-end, back-end, and database in sync.
Update API docs when endpoints change.
Log meaningful errors for both developers and support teams.
## 🤖 智能代理调度系统 / Agent Dispatch System

### 为什么需要代理系统？
作为小白用户，你可以把 Claude Code 想象成一个智能开发团队：
- **主管 Claude**：接收你的需求，分配任务给合适的专家
- **技术总监 (tech-lead)**：分析项目，决定需要哪些专家
- **专业代理 (agents)**：前端、后端、数据库、UI 设计等各领域专家

**简单来说**：你只需要用中文描述需求，Claude 会自动调配合适的专家团队来完成工作！

### 工作流程（自动进行，你无需操心）

1. **你提出需求**：例如"我想添加一个八字排盘功能"
2. **Claude 分析**：这是简单问题还是复杂任务？
3. **简单问题** → Claude 直接回答
4. **复杂任务** → 自动调用技术总监（tech-lead-orchestrator）
5. **技术总监**：
   - 分析你的项目结构
   - 决定需要哪些专家（前端、后端、数据库等）
   - 制定详细的工作计划
6. **专家团队执行**：按顺序完成各项任务
7. **整合结果**：技术总监汇总所有工作
8. **向你汇报**：Claude 展示最终成果
### 什么时候会自动启用专家团队？

当你的需求包含以下内容时，Claude 会自动调用专家团队：

#### 必定启用专家团队的情况：
- ✅ **写新代码**：创建新功能、新页面、新组件
- ✅ **改造代码**：重构、优化现有功能
- ✅ **修复 Bug**：排查和解决问题
- ✅ **分析项目**：了解代码结构、解释工作原理
- ✅ **添加功能**：例如"添加八字排盘"、"集成支付"
- ✅ **写测试**：创建测试用例
- ✅ **写文档**：生成 API 文档、README
- ✅ **规划架构**：项目规划、技术选型建议

#### 不需要专家团队的情况：
- ❌ 简单问答："这个函数做什么？"
- ❌ 概念解释："什么是八字？"
- ❌ 配置咨询："如何配置环境变量？"

**对你来说**：只管提需求，系统会自动判断是否需要调用专家团队！

### 连续对话和追加需求的处理

当你提出追加问题或新需求时，系统会智能判断如何处理：

#### 🟢 简单追问（Claude 直接回答）
- "这个函数是做什么的？"
- "能修复这个小错误吗？"
- "能把这里的文字改一下吗？"
- **处理方式**：直接回答，无需调用专家团队

#### 🟡 中等追加（使用之前的专家）
- "给这个 API 添加错误处理"
- "让这个界面更美观一些"
- "优化一下刚才写的代码"
- **处理方式**：复用刚才的专家（比如前端专家、后端专家）

#### 🔴 重大变更（重新组建专家团队）
- "现在我想添加用户认证系统"
- "其实我想改成移动应用"
- "现在还要添加支付和邮件通知"
- **处理方式**：重新调用技术总监，组建新的专家团队

**智能判断**：系统会自动判断使用哪种方式，你只需要自然地描述需求即可！
### 📋 实际使用示例

#### 示例 1：添加八字排盘功能

**你的需求**：
```
我想添加一个八字排盘功能，用户输入出生年月日时后，
能看到他们的八字命盘，包括天干地支、五行分析。
```

**Claude 的处理流程**：
1. ✅ 判断：这是复杂任务（涉及算法、数据库、UI）
2. 🤖 调用技术总监分析项目
3. 👥 组建专家团队：
   - 算法专家：编写八字计算逻辑
   - 数据库专家：设计数据存储结构
   - 后端专家：创建 API 接口
   - 前端专家：设计命盘展示界面
4. ⚙️ 各专家按顺序完成任务
5. ✅ 整合代码并测试
6. 📄 向你展示完整的实现方案

#### 示例 2：优化现有页面

**你的需求**：
```
刚才的八字页面能不能更美观一些？
加个渐变背景，让字体更大更清晰。
```

**Claude 的处理流程**：
1. ✅ 判断：简单追加，UI 优化
2. 👤 复用前端专家
3. ⚙️ 快速调整样式
4. ✅ 展示修改后的效果

**对你来说的最佳实践**：
- ✅ 用自然的中文描述需求
- ✅ 说清楚想要什么功能和效果
- ✅ 可以分步骤提需求，不用一次说完
- ✅ 遇到问题随时追问
- ❌ 不用担心技术细节，Claude 会处理

---

## 🎯 八字风水网站常见开发任务示例

为了帮助你更好地使用 Claude Code，这里列举一些常见的开发需求示例：

### 核心功能开发
- "创建八字排盘页面，用户输入生日后显示命盘"
- "添加农历转换功能"
- "实现流年运势计算"
- "创建风水罗盘组件"
- "添加用户查询历史记录功能"

### UI/UX 优化
- "让首页更有中国风特色"
- "添加命盘的动画效果"
- "优化移动端的命盘显示"
- "添加深色模式支持"

### 功能集成
- "集成 OpenAI API 用于运势解读"
- "添加 Stripe 支付功能"
- "添加每日运势推送邮件"
- "集成微信分享功能"

### 内容管理
- "创建风水知识库文章模板"
- "添加博客分类功能"
- "创建 FAQ 页面"

**记住**：用你最熟悉的方式描述需求，Claude 会理解并自动调配合适的专家来完成！

---

## 🔧 技术实现细节（给 Claude 的指引）

以下内容是给 Claude Code 的技术指引，作为用户你无需深入理解：

### Agent Organization
This is the Awesome Claude Agents repository - a collection of specialized AI agents that extend Claude Code's capabilities through intelligent orchestration and domain expertise. The agents work together as a development team, with each agent having specific expertise and delegation patterns.

Working with Agents
When creating or modifying agents:

Agents are Markdown files with YAML frontmatter
Most agents should omit the tools field to inherit all available tools
Use XML-style examples in descriptions for intelligent invocation
Agents return structured findings for main agent coordination
Orchestration Pattern for Claude Code
Since sub-agents in Claude Code cannot directly invoke other sub-agents, orchestration follows this strict pattern:

CRITICAL: Agent Routing Protocol
When handling complex tasks, you MUST:

ALWAYS start with tech-lead-orchestrator for any multi-step task
FOLLOW the agent routing map returned by tech-lead EXACTLY
USE ONLY the agents explicitly recommended by tech-lead
NEVER select agents independently - tech-lead knows which agents exist
Example: Building a Feature with Agent Routing
User: "Build a user management system"

Main Claude Agent:
1. First, I'll use the tech-lead-orchestrator to analyze and get routing
   → Tech lead returns Agent Routing Map with SPECIFIC agents
   
2. I MUST use ONLY the agents listed in the routing map:
   - If tech-lead says "use django-api-developer" → Use that EXACT agent
   - If tech-lead says "use react-component-architect" → Use that EXACT agent
   - DO NOT substitute with generic agents unless specified as fallback
   
3. Execute tasks in the order specified by tech-lead using TodoWrite
Key Orchestration Rules
Tech-Lead is Routing Authority: Tech-lead determines which agents can handle each task
Strict Agent Selection: Use ONLY agents from tech-lead’s “Available Agents” list
No Improvisation: Do NOT select agents based on your own judgment
Deep Reasoning: Apply careful thought when coordinating the recommended agents
Structured Handoffs: Extract and pass information between agent invocations
Agent Selection Flow
CORRECT FLOW:
User Request → Tech-Lead Analysis → Agent Routing Map → Execute with Listed Agents

INCORRECT FLOW:
User Request → Main Agent Guesses → Wrong Agent Selected → Task Fails
Example Tech-Lead Response You Must Follow
When tech-lead returns:

## Available Agents for This Project
- django-backend-expert: Django tasks
- django-api-developer: API tasks  
- react-component-architect: React UI
You MUST use these specific agents, NOT generic alternatives like “backend-developer”

High-Level Architecture
Agent Organization
The project follows a hierarchical structure:

Orchestrators (agents/orchestrators/)

tech-lead-orchestrator: Coordinates complex projects through three-phase workflow (Research → Planning → Execution)
project-analyst: Detects technology stack and enables intelligent routing
team-configurator: Creates agent routing rules in CLAUDE.md files
Core Agents (agents/core/)

Cross-cutting concerns like code archaeology, reviews, performance, and documentation
These agents support all technology stacks
Universal Agents (agents/universal/)

Framework-agnostic specialists (API, backend, frontend, Tailwind)
Fallback when no framework-specific agent exists
Specialized Agents (agents/specialized/)

Framework-specific experts organized by technology
Subdirectories: laravel/, django/, rails/, react/, vue/
Three-Phase Orchestration Workflow (Main Agent Coordinated)
The main Claude agent implements a human-in-the-loop workflow using the tech-lead-orchestrator:

Research Phase: Tech-lead analyzes requirements and returns structured findings
Approval Gate: Main agent presents findings and waits for human approval
Planning Phase: Main agent creates tasks with TodoWrite based on tech-lead’s recommendations
Execution Phase: Main agent invokes specialists sequentially with filtered context
Agent Communication Protocol
Since sub-agents cannot directly communicate or invoke each other:

Structured Returns: Each agent returns findings in a parseable format
Context Passing: Main agent extracts relevant information from returns
Sequential Coordination: Main agent manages the execution flow
Handoff Information: Agents include what the next specialist needs in their returns
Example return format:

## Task Completed: API Design
- Endpoints defined: GET/POST/PUT/DELETE /api/users
- Authentication: Bearer token required
- Next specialist needs: This API specification for implementation
Intelligent Routing
The system automatically routes tasks based on:

Project context (detected by project-analyst)
Framework-specific routing when applicable
Universal fallback for unknown stacks
Task requirements and agent expertise
Key Concepts
Agent Definition Format
---
name: agent-name
description: |
  Expertise description with XML examples
  Examples:
  - <example>
    Context: When to use
    user: "Request"
    assistant: "I'll use agent-name"
    <commentary>Why selected</commentary>
  </example>
# tools: omit for all tools, specify for restrictions
---

# Agent Name
System prompt content...
Ambiguity Detection
Project-analyst flags uncertainties in analysis
Tech-lead presents research findings for approval before execution
Agents should identify assumptions needing clarification
Tool Inheritance
Omitting tools field = inherit all tools (recommended)
Specify tools only for security restrictions
Includes WebFetch, MCP tools when available
Development Guidelines
Creating New Agents:

Use templates/agent-template.md as starting point
Focus on single domain expertise
Include 2-3 XML examples
Define structured return format
Agent Return Patterns:

Always return findings in structured format
Include “Next Steps” or “Handoff Information”
Specify what context next specialist needs
Main agent will parse and coordinate
Testing Agents:

Test invocation patterns
Verify delegation works correctly
Ensure quality of output
Important Files and Patterns
docs/orchestration-patterns.md: Detailed three-phase workflow documentation
docs/creating-agents.md: Guide for creating new agents
docs/best-practices.md: Agent development best practices
examples/: Real-world usage examples
All agents support human-in-the-loop through the tech-lead’s approval gate
Complete Orchestration Example
Here’s a full example showing proper agent routing:

User Request:
“Help me build an authentication system for my web app”

Step 1: Tech-Lead Analysis
Main Agent: "I'll use the tech-lead-orchestrator to analyze this request and determine the best approach."

[Invokes tech-lead-orchestrator]
Step 2: Tech-Lead Returns Routing Map
## Agent Routing Map

Task 1: Detect Project Technology
- PRIMARY AGENT: project-analyst
- REASON: Need to identify framework for proper routing

Task 2: Design Authentication Schema  
- PRIMARY AGENT: database-architect
- REASON: Framework-agnostic database design

Task 3: Implement Auth Backend
- PRIMARY AGENT: django-backend-expert
- FALLBACK AGENT: backend-developer
- REASON: Django detected in project

Task 4: Create Auth API Endpoints
- PRIMARY AGENT: django-api-developer
- FALLBACK AGENT: api-architect
- REASON: Django REST Framework patterns

## Available Agents for This Project
- project-analyst
- database-architect  
- django-backend-expert
- django-api-developer
- code-reviewer

## CRITICAL INSTRUCTION
Use ONLY the agents listed above. Do NOT use laravel, rails, or other framework agents.
Step 3: Main Agent Executes Plan
Main Agent: "Based on the tech-lead's routing, I'll now coordinate the implementation:"

1. ✓ Using project-analyst to analyze the codebase
2. ✓ Using database-architect for auth schema design  
3. ✓ Using django-backend-expert for implementation
4. ✓ Using django-api-developer for API endpoints
5. ✓ Using code-reviewer for security audit

[Executes each step with the EXACT agents specified]
What NOT to Do:
❌ "I'll use backend-developer" (when tech-lead specified django-backend-expert)
❌ "I'll use rails-api-developer" (wrong framework)
❌ "I'll skip the tech-lead and choose agents myself" (bypasses routing)
Critical Reminders
ALWAYS use tech-lead-orchestrator for multi-step tasks to get proper agent routing
FOLLOW the agent routing map exactly - do not improvise
USE deep reasoning when coordinating the recommended agents
TRUST the tech-lead's expertise in agent selection

---

## 🔮 八字风水项目特别注意事项

### 算法精确性要求
八字计算涉及复杂的中国传统历法，Claude Code 在实现相关功能时需要：
- 使用可靠的农历转换库（如 `lunar-javascript` 或 `solarlunar`）
- 确保闰月、节气计算的准确性
- 天干地支排列必须符合传统规则
- 五行相生相克关系要准确
- 神煞、十神的计算逻辑要严谨

### 文化敏感性
- 对传统文化内容保持尊重
- AI 解读应该专业、积极、富有建设性
- 避免迷信色彩过重，强调参考价值
- 提供的建议应该实用且符合现代生活

### 用户隐私保护
- 八字信息属于敏感个人数据
- 数据库中的出生信息必须加密存储
- 用户有权删除自己的所有查询记录
- 不与第三方分享用户的命理信息
- 遵守 GDPR 等数据保护法规

### AI 集成建议
在接入 AI 服务（OpenAI/Claude）进行运势解读时：
- 使用专业的 Prompt 工程确保输出质量
- 对 AI 输出进行审核，过滤不当内容
- 保持解读的一致性和专业性
- 考虑成本控制，避免过度调用 API

### 用户体验优化
- 命盘展示要直观美观
- 复杂的术语要提供通俗解释
- 移动端体验尤为重要（用户可能随时查询）
- 加载速度要快，计算结果要即时呈现
- 提供收藏、分享功能增强用户粘性

---

## 📝 总结

### 给用户的话
你现在拥有一个强大的 AI 开发团队！只需：
1. **用中文描述**你想要的功能
2. **保持耐心**，让 Claude Code 自动工作
3. **随时提问**，遇到任何问题都可以询问
4. **逐步迭代**，不用一次完成所有功能

### 给 Claude Code 的核心原则
1. **用户友好**：这是小白用户的项目，保持沟通简单明了
2. **文化尊重**：处理八字风水内容时保持专业和尊重
3. **算法精确**：传统历法计算必须准确无误
4. **隐私优先**：用户数据安全是最高优先级
5. **渐进开发**：按功能模块逐步构建，确保每一步都稳定可用
6. **中文优先**：界面、内容、注释优先使用中文
7. **自动化协作**：充分利用 agents 系统，让专家团队高效协作

### 开始你的开发之旅！
现在你已经了解了所有必要信息，可以开始与 Claude Code 对话了：

**试试这样开始**：
> "Hi Claude，我想先了解一下这个项目的整体结构，然后开始添加八字排盘功能。"

祝你开发顺利！🎉

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
