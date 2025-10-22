# 任务计划: 用户旅程 P1 优化 v5.1.1

**文档版本**: v5.1.1  
**创建日期**: 2025-10-12  
**负责人**: 项目经理 + 技术团队  
**关联文档**: 
- PRD: [@PRD_USER_JOURNEY_P1_OPTIMIZATION_v5.1.1.md](/@PRD_USER_JOURNEY_P1_OPTIMIZATION_v5.1.1.md)
- 技术设计: [@TECH_GUIDE_USER_JOURNEY_P1_OPTIMIZATION_v5.1.1.md](/@TECH_GUIDE_USER_JOURNEY_P1_OPTIMIZATION_v5.1.1.md)

---

## 目录

1. [项目概览](#项目概览)
2. [任务列表](#任务列表)
3. [依赖关系图](#依赖关系图)
4. [里程碑与时间线](#里程碑与时间线)
5. [资源分配](#资源分配)
6. [风险管理](#风险管理)

---

## 项目概览

### 项目信息
- **项目名称**: 用户旅程 P1 优化
- **Tag**: `p1-optimization`
- **总工期**: 2-4周
- **总任务数**: 14个主任务 + 约30个子任务
- **团队规模**: 5人（前端2人 + 后端1人 + 测试1人 + PM1人）

### 目标
将用户旅程评分从 **8.0 提升至 9.0+**，通过5个核心优化提升转化率和用户参与度。

### 预期收益
- **首页转化率**: +15%
- **邀请操作数**: +50%
- **分享意愿率**: +80%
- **付费转化率**: +20%
- **用户参与度**: +30%

---

## 任务列表

### ✅ Week 1: 基础设施与即时体验（7天）

#### Task P1-001: 数据库Schema变更 ⚡️ P0
**负责人**: 后端工程师  
**工期**: 1天  
**依赖**: 无  
**状态**: ⏳ Pending

**任务描述**:
- 创建 `instant_previews` 表（即时体验记录）
- 扩展 `referrals` 表（progress、activated_at、reward_tier）
- 创建 `leaderboard` 表（邀请排行榜）
- 创建 `posters` 表（分享海报）
- 扩展 `check_ins` 表（每日签到）
- 扩展 `users` 表（member_tier、total_invites、successful_invites）

**验收标准**:
- [ ] Prisma migration 成功执行
- [ ] 所有索引创建成功
- [ ] 数据完整性约束正确
- [ ] 本地测试通过

**参考文档**: @TECH_GUIDE > 数据库设计

---

#### Task P1-002: 即时体验API开发 ⚡️ P0
**负责人**: 后端工程师  
**工期**: 2天  
**依赖**: P1-001  
**状态**: ⏳ Pending

**任务描述**:
实现 `POST /api/instant-preview` 端点，包括：
- Zod Schema 验证（birthDate 必填，birthTime 可选）
- 调用 `calculateBaZi()` 轻量级模式
- AI 生成今日运势（Redis 缓存 24h）
- IP 级别速率限制（每日5次）
- 异步记录到 `instant_previews` 表

**技术要点**:
```typescript
// 速率限制
const rateLimitResult = await rateLimit({
  key: `instant-preview:${ip}`,
  limit: 5,
  window: 24 * 60 * 60 * 1000,
});

// 缓存运势
const cacheKey = `fortune:${dayPillar}:${date}`;
await redis.set(cacheKey, fortune, 'EX', 86400);
```

**验收标准**:
- [ ] API 响应正常（200）
- [ ] 速率限制生效（429）
- [ ] 生成的日柱、五行准确（抽样测试）
- [ ] Redis 缓存命中率 > 80%
- [ ] 响应时间 < 2秒（P95）

**参考文档**: @TECH_GUIDE > API设计 > 即时体验API

---

#### Task P1-003: 即时体验前端组件 🎨 P0
**负责人**: 前端工程师A  
**工期**: 2天  
**依赖**: P1-002  
**状态**: ⏳ Pending

**任务描述**:
创建/更新以下组件：
1. `InstantTrySection.tsx` - 表单组件
2. `InstantResultEnhanced.tsx` - 结果展示
3. `WuxingRadarChart.tsx` - 五行雷达图
4. `useInstantPreview.ts` - React Query Hook

**技术要点**:
- React Hook Form + Zod 验证
- Recharts 雷达图配置
- 速率限制友好提示
- 模糊化完整报告预览

**验收标准**:
- [ ] 组件渲染正确
- [ ] 表单验证生效
- [ ] 速率限制提示友好
- [ ] 雷达图显示正常
- [ ] 移动端适配良好

**参考文档**: @TECH_GUIDE > 前端架构 > 即时体验组件

---

#### Task P1-011: 速率限制与安全 🔒 P0
**负责人**: 后端工程师  
**工期**: 1天  
**依赖**: 无（并行）  
**状态**: ⏳ Pending

**任务描述**:
实现通用速率限制模块 `src/lib/rate-limit.ts`：
- 即时体验：IP 级别，每日5次
- 海报生成：用户级别，每日10次
- 邀请操作：用户级别，每日5次

**技术要点**:
```typescript
// Redis INCR + EXPIRE
export async function rateLimit({
  key, limit, window
}: RateLimitOptions) {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, Math.ceil(window / 1000));
  }
  return {
    success: current <= limit,
    remaining: Math.max(0, limit - current),
    reset: Date.now() + window,
  };
}
```

**验收标准**:
- [ ] 限流生效
- [ ] 返回剩余次数和重置时间
- [ ] 错误提示友好
- [ ] 不影响正常用户

**参考文档**: @TECH_GUIDE > 安全方案 > 速率限制

---

### ✅ Week 2: 邀请与分享功能（7天）

#### Task P1-004: 邀请数据API开发 ⚡️ P0
**负责人**: 后端工程师  
**工期**: 2天  
**依赖**: P1-001  
**状态**: ⏳ Pending

**任务描述**:
实现 `GET /api/invite/stats` 端点，返回：
- 用户邀请统计（总数、已激活、待激活）
- 邀请记录列表（带进度）
- 排行榜（本月 top10）
- 用户排名

**技术要点**:
- 避免 N+1 查询（使用 `include`）
- Redis 缓存排行榜（1小时）
- 脱敏处理用户姓名（`maskName()`）

**验收标准**:
- [ ] 数据准确
- [ ] 响应时间 < 500ms（P95）
- [ ] 排行榜缓存生效
- [ ] 脱敏处理正确

**参考文档**: @TECH_GUIDE > API设计 > 邀请数据API

---

#### Task P1-005: 邀请专页前端开发 🎨 P1
**负责人**: 前端工程师A + B  
**工期**: 3天  
**依赖**: P1-004  
**状态**: ⏳ Pending

**任务描述**:
创建 `/invite` 页面，实现6个核心组件：
1. `InvitePageHeader.tsx` - 头部
2. `InviteProgress.tsx` - 进度
3. `ShareOptions.tsx` - 分享
4. `InviteHistory.tsx` - 记录
5. `Leaderboard.tsx` - 排行榜
6. `IncentiveExplain.tsx` - 说明

**技术要点**:
- React Query 数据获取
- 复制到剪贴板（`navigator.clipboard.writeText`）
- 分页加载（Pagination）

**验收标准**:
- [ ] 页面加载 < 1.5秒
- [ ] 邀请码复制功能正常
- [ ] 排行榜实时更新
- [ ] 移动端适配良好

**参考文档**: @TECH_GUIDE > 前端架构 > 邀请专页组件

---

#### Task P1-006: 海报生成后端开发 🖼️ P1
**负责人**: 后端工程师  
**工期**: 3天  
**依赖**: P1-001  
**状态**: ⏳ Pending

**任务描述**:
实现 `POST /api/share/generate-poster` 端点 + Worker：
- BullMQ 队列异步生成
- node-canvas 绘制海报（750x1334）
- qrcode 生成二维码
- 上传到 OSS
- 保存记录到 `posters` 表

**技术要点**:
- 注册中文字体（思源黑体）
- 缓存24小时内已生成的海报
- Worker 并发5

**验收标准**:
- [ ] 生成成功率 > 95%
- [ ] 生成时间 < 3秒
- [ ] 二维码可扫描
- [ ] 图片清晰度满足要求

**参考文档**: @TECH_GUIDE > API设计 > 海报生成API

---

#### Task P1-007: 海报生成前端集成 🎨 P1
**负责人**: 前端工程师B  
**工期**: 2天  
**依赖**: P1-006  
**状态**: ⏳ Pending

**任务描述**:
创建 `PosterGenerator.tsx` 组件：
- 生成按钮（带加载状态）
- 预览 Modal
- 下载和分享功能

**技术要点**:
- 轮询 job 状态（最多5秒）
- 显示生成进度
- 长按保存（移动端）

**验收标准**:
- [ ] 按钮交互流畅
- [ ] 预览显示正常
- [ ] 下载功能正常
- [ ] 移动端体验良好

**参考文档**: @TECH_GUIDE > 前端架构 > 海报生成前端

---

### ✅ Week 3: 定价与Dashboard（7天）

#### Task P1-008: 定价页面优化 💰 P1
**负责人**: 前端工程师A  
**工期**: 2天  
**依赖**: 无（并行）  
**状态**: ⏳ Pending

**任务描述**:
优化 `/pricing` 页面，创建6个组件：
1. `PricingPageHeader.tsx` - 头部+信任徽章
2. `PricingTable.tsx` - 套餐对比（扩展现有）
3. `UseCaseSection.tsx` - 使用场景
4. `PricingCalculator.tsx` - 积分计算器
5. `TestimonialSection.tsx` - 用户评价
6. `PromoBanner.tsx` - 限时优惠

**技术要点**:
- 动态计算推荐套餐
- 倒计时组件
- 价格凸显

**验收标准**:
- [ ] 页面加载 < 2秒
- [ ] 计算器功能正常
- [ ] 移动端适配良好
- [ ] 套餐对比清晰

**参考文档**: @PRD > 需求4

---

#### Task P1-009: Dashboard数据API开发 📊 P1
**负责人**: 后端工程师  
**工期**: 2天  
**依赖**: P1-001  
**状态**: ⏳ Pending

**任务描述**:
实现 `GET /api/dashboard/overview` 端点，返回：
- 用户基本信息
- 签到状态（今日+连续天数+近7天）
- 邀请统计
- 最近分析记录（top5）
- 积分变动记录（top10）

**技术要点**:
- 聚合查询
- 缓存用户数据（5分钟）

**验收标准**:
- [ ] 数据准确
- [ ] 响应时间 < 500ms（P95）

**参考文档**: @TECH_GUIDE > API设计 > Dashboard数据API

---

#### Task P1-010: Dashboard前端优化 🎨 P1
**负责人**: 前端工程师A + B  
**工期**: 3天  
**依赖**: P1-009  
**状态**: ⏳ Pending

**任务描述**:
优化 `/dashboard` 页面，创建7个组件：
1. `WelcomeSection.tsx` - 欢迎区域
2. `DailyCheckInCard.tsx` - 每日签到
3. `QuickActions.tsx` - 快速操作
4. `RecentAnalysis.tsx` - 最近分析
5. `InviteSection.tsx` - 邀请卡片
6. `CreditsActivity.tsx` - 积分动态
7. `Recommendations.tsx` - 推荐内容

**技术要点**:
- 签到功能实现
- 时间问候（早上好/下午好/晚上好）
- 里程碑进度条

**验收标准**:
- [ ] 页面加载 < 1.5秒
- [ ] 签到功能正常
- [ ] 所有数据实时更新
- [ ] 移动端适配良好

**参考文档**: @TECH_GUIDE > 前端架构 > Dashboard组件

---

### ✅ Week 4: 优化与上线（7天）

#### Task P1-012: 性能优化 🚀 P1
**负责人**: 全栈工程师  
**工期**: 2天  
**依赖**: P1-003, P1-005, P1-007, P1-008, P1-010  
**状态**: ⏳ Pending

**任务描述**:
- 前端代码分割（`next/dynamic` 动态导入）
- Redis 缓存热点数据（排行榜、运势）
- 图片 CDN 配置
- 数据库查询优化（索引、避免 N+1）

**技术要点**:
```typescript
// 动态导入
const Leaderboard = dynamic(() => import('@/components/qiflow/invite/Leaderboard'), {
  loading: () => <Skeleton className="h-[600px]" />,
});

// Redis 缓存
const cacheKey = `leaderboard:${period}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
// ... 查询数据库
await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600);
```

**验收标准**:
- [ ] Lighthouse 评分 > 85
- [ ] 首屏加载 < 2秒
- [ ] API P95 响应 < 500ms
- [ ] 无内存泄漏

**参考文档**: @TECH_GUIDE > 性能优化

---

#### Task P1-013: 测试与验收 ✅ P1
**负责人**: 测试工程师 + 全员  
**工期**: 2天  
**依赖**: P1-012  
**状态**: ⏳ Pending

**任务描述**:
- 单元测试（关键业务逻辑）
- 集成测试（API 端点）
- E2E 测试（关键用户流程）
- 性能测试（压力测试）

**验收标准**:
- [ ] 测试覆盖率 > 70%
- [ ] 所有关键流程通过
- [ ] 无阻塞性 bug
- [ ] 性能指标达标

**参考文档**: @PRD > 验收标准

---

#### Task P1-014: 文档与部署 📝 P1
**负责人**: 项目经理 + DevOps  
**工期**: 1天  
**依赖**: P1-013  
**状态**: ⏳ Pending

**任务描述**:
- API 文档更新
- 组件文档（Storybook）
- 部署流程文档
- 上线 Checklist

**验收标准**:
- [ ] 文档完整
- [ ] 部署成功
- [ ] 监控正常（Sentry + Vercel Analytics）

**参考文档**: @TECH_GUIDE > 部署方案

---

## 依赖关系图

```
         P1-001 (Schema)
        /   |   \
       /    |    \
  P1-002  P1-004  P1-006  P1-009  P1-011 (并行)
     |       |       |       |
  P1-003  P1-005  P1-007  P1-010  P1-008 (并行)
     \       |       |       |       /
      \      |       |       |      /
       \     |       |       |     /
        \    |       |       |    /
         \   |       |       |   /
          \  |       |       |  /
            P1-012 (性能优化)
                |
            P1-013 (测试)
                |
            P1-014 (部署)
```

---

## 里程碑与时间线

### 里程碑 M1: Week 1 结束（Day 7）
**目标**: 完成基础设施和即时体验功能

**交付物**:
- ✅ 数据库 Schema 变更完成
- ✅ 即时体验 API + 前端完成
- ✅ 速率限制模块完成

**验收标准**:
- 所有 P0 任务完成
- 即时体验功能可正常使用
- 速率限制生效

---

### 里程碑 M2: Week 2 结束（Day 14）
**目标**: 完成邀请和分享功能

**交付物**:
- ✅ 邀请专页完成
- ✅ 海报生成功能完成

**验收标准**:
- 邀请专页可正常访问
- 海报生成成功率 > 95%
- 分享功能正常

---

### 里程碑 M3: Week 3 结束（Day 21）
**目标**: 完成定价和Dashboard优化

**交付物**:
- ✅ 定价页面优化完成
- ✅ Dashboard 优化完成

**验收标准**:
- 定价页面清晰易懂
- Dashboard 功能完善
- 签到功能正常

---

### 里程碑 M4: Week 4 结束（Day 28）
**目标**: 完成优化、测试、上线

**交付物**:
- ✅ 性能优化完成
- ✅ 测试通过
- ✅ 文档完整
- ✅ 生产环境部署

**验收标准**:
- Lighthouse 评分 > 85
- 测试覆盖率 > 70%
- 无阻塞性 bug
- 监控正常

---

## 资源分配

### 人员配置

| 角色 | 姓名 | 任务分配 | 工作量 |
|------|------|---------|--------|
| **后端工程师** | 工程师A | P1-001, P1-002, P1-004, P1-006, P1-009, P1-011 | 13天 |
| **前端工程师A** | 工程师B | P1-003, P1-005, P1-008, P1-010 | 10天 |
| **前端工程师B** | 工程师C | P1-005, P1-007, P1-010 | 8天 |
| **全栈工程师** | 工程师D | P1-012 | 2天 |
| **测试工程师** | 工程师E | P1-013 | 2天 |
| **项目经理** | PM | P1-014 + 全程跟进 | 28天 |

### 工作量统计
- **总人日**: 约 63 人日
- **平均每人**: 10.5 人日
- **项目工期**: 28 天

---

## 风险管理

### 技术风险

#### 风险1: Canvas 兼容性问题 🟡 中
**描述**: node-canvas 在某些环境可能安装失败  
**影响**: 海报生成功能无法使用  
**缓解措施**:
- 使用 Docker 统一环境
- 准备降级方案（前端生成）
- 提前在 staging 环境测试

#### 风险2: 性能不达标 🟡 中
**描述**: 首屏加载或 API 响应时间超标  
**影响**: 用户体验下降，转化率提升不达预期  
**缓解措施**:
- 持续监控性能指标
- 提前进行压力测试
- 预留性能优化时间（P1-012）

#### 风险3: Redis 故障 🟠 高
**描述**: Redis 宕机导致缓存失效  
**影响**: 数据库压力增大，API 响应变慢  
**缓解措施**:
- 配置 Redis 高可用（主从复制）
- 实现降级策略（直接查询数据库）
- 监控 Redis 健康状态

---

### 业务风险

#### 风险4: 用户接受度低 🟡 中
**描述**: 新功能用户不买账  
**影响**: 转化率提升不达预期  
**缓解措施**:
- A/B 测试验证效果
- 灰度发布逐步放量
- 收集用户反馈快速迭代

#### 风险5: 竞品跟进 🟢 低
**描述**: 竞品快速模仿  
**影响**: 竞争优势减弱  
**缓解措施**:
- 快速迭代保持领先
- 建立用户粘性（签到、邀请）
- 持续优化用户体验

---

### 资源风险

#### 风险6: 人员不足 🟡 中
**描述**: 前端工程师资源紧张  
**影响**: 进度延期  
**缓解措施**:
- 提前沟通确认人员到位
- 关键任务预留 buffer
- 必要时延后非关键功能

#### 风险7: 第三方服务故障 🟡 中
**描述**: OSS、Redis、AI API 故障  
**影响**: 部分功能不可用  
**缓解措施**:
- 选择高可用的服务商
- 实现降级策略
- 监控第三方服务健康状态

---

## 总结

本任务计划将 **P1 优化项目** 分解为 **14个主任务**，涵盖：
- ✅ **数据库设计**（6个表变更）
- ✅ **4个核心 API**（即时体验、邀请、海报、Dashboard）
- ✅ **30+ 个前端组件**（即时体验、邀请专页、分享、定价、Dashboard）
- ✅ **性能优化**（缓存、CDN、代码分割）
- ✅ **测试与部署**（单元测试、集成测试、E2E、CI/CD）

**关键成功因素**:
1. ⏰ **按时交付** - 严格按照里程碑推进
2. 📊 **数据驱动** - 持续监控业务指标
3. 🧪 **快速验证** - A/B 测试验证效果
4. 🔄 **敏捷迭代** - 收集反馈快速调整
5. 🛡️ **风险管控** - 提前识别和缓解风险

**下一步行动**:
1. ✅ 召开项目启动会（Kickoff Meeting）
2. ✅ 确认人员到位
3. ✅ 开始执行 P1-001（数据库Schema变更）

---

**文档状态**: ✅ 已完成  
**审核状态**: 待审核  
**TaskMaster Tag**: `p1-optimization`  
**TaskMaster 状态**: 14 tasks created, 0 completed

**负责人签字**: ___________  
**日期**: 2025-10-12
