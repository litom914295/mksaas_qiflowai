# PRD: QiFlow AI 个人管理后台优化

**版本**: v5.1  
**创建日期**: 2025-01-15  
**状态**: 待评审  
**优先级**: P0

---

## 1. 项目背景

### 1.1 需求来源
用户反馈个人管理后台界面偏简陋,需要优化UI/UX以提升用户体验,同时保持与mksaas模板风格的一致性。

### 1.2 需求背景
- 当前功能完整(积分、个人资料、安全设置等)但UI需要优化
- 信息架构需要更清晰
- 缺少个性化推荐和快速入口
- 需要增加用户粘性功能(签到、邀请等)

### 1.3 目标用户
- **主要用户**: 已注册的QiFlow AI个人用户
- **次要用户**: 付费用户、高频使用用户

---

## 2. 核心目标 (OKR)

**目标 1**: 提升用户体验和满意度
- KR1: 用户满意度评分从当前基线提升至 ≥ 4.5/5.0
- KR2: 用户后台页面跳出率降低 30%
- KR3: 用户平均停留时间提升 50%

**目标 2**: 增加用户粘性
- KR1: 每日签到率 ≥ 40%
- KR2: 邀请功能使用率 ≥ 15%
- KR3: 用户7日留存率提升 20%

**目标 3**: 提升付费转化
- KR1: 从个人后台到充值页的跳转率提升 25%
- KR2: 积分套餐点击率 ≥ 10%

**目标 4**: 保持性能
- KR1: 页面加载时间 < 2秒
- KR2: Lighthouse 性能评分 > 90
- KR3: 移动端体验评分 > 95

---

## 3. 功能需求

### Phase 1: 个人Dashboard & 积分页面优化 (P0)

#### FR-001: 个人Dashboard重构
**优先级**: P0  
**预计工时**: 8-10小时

**功能描述**: 将当前简单的dashboard改造为个性化的用户中心

**验收标准**:
- [ ] 个人数据卡片显示正确 (积分余额、已使用次数、剩余分析次数)
- [ ] 快速入口卡片完整 (八字分析、玄空风水、罗盘算法、积分充值)
- [ ] 活动推荐区显示 (每日签到状态、新手任务进度)
- [ ] 使用趋势图表展示正确 (最近7天/30天)
- [ ] 响应式设计完善 (桌面/平板/移动端)

**UI设计要点**:
```typescript
// 布局结构
<Dashboard>
  <WelcomeBanner />  // 欢迎横幅
  <StatsGrid>        // 数据卡片网格 (2x2)
    <CreditBalanceCard />
    <UsageCountCard />
    <RemainingAnalysisCard />
    <GrowthTrendCard />
  </StatsGrid>
  <QuickActionsGrid> // 快速入口 (4列)
    <BaziAnalysisCard />
    <XuankongCard />
    <CompassCard />
    <CreditTopupCard />
  </QuickActionsGrid>
  <ActivitySection>  // 活动推荐
    <DailySignInWidget />
    <NewbieMissionsWidget />
  </ActivitySection>
  <UsageTrendChart /> // 使用趋势图
</Dashboard>
```

---

#### FR-002: 积分页面增强
**优先级**: P0  
**预计工时**: 6-8小时

**功能描述**: 提升积分页的视觉吸引力和转化率

**验收标准**:
- [ ] 积分余额大卡片 (渐变背景、动态数字、醒目充值按钮)
- [ ] 积分获取指南 (签到、任务、分享、邀请,带进度条)
- [ ] 积分套餐优化 (视觉强化推荐套餐、限时优惠标签)
- [ ] 交易记录增强 (筛选器:类型/时间/状态、导出功能)

**UI设计要点**:
```typescript
// 积分余额卡片
<CreditBalanceHeroCard
  balance={user.credits}
  gradient="from-purple-500 to-pink-500"
  animation="countUp"
  ctaButton="立即充值"
/>

// 积分获取指南
<CreditGuideSection>
  <GuideItem icon="📅" title="每日签到" progress={5/7} reward="+5-10" />
  <GuideItem icon="✅" title="新手任务" progress={3/10} reward="+200" />
  <GuideItem icon="🔗" title="分享结果" progress={0} reward="+15" />
  <GuideItem icon="👥" title="邀请好友" progress={2} reward="+50" />
</CreditGuideSection>

// 积分套餐卡片
<PackageCard
  featured={true}  // 推荐套餐
  badge="限时优惠"
  highlight={true}
  scale={1.05}
/>
```

---

### Phase 2: 个人资料 & 安全设置优化 (P1)

#### FR-003: 个人资料页优化
**优先级**: P1  
**预计工时**: 5-6小时

**功能描述**: 多卡片式设计,信息更清晰

**验收标准**:
- [ ] 头像与昵称卡片 (支持拖拽上传、实时预览)
- [ ] 账号信息卡片 (邮箱、手机、绑定微信,带验证状态徽章)
- [ ] 八字信息卡片 (显示已保存生辰,支持快速编辑)
- [ ] 偏好设置 (通知开关、语言选择、主题切换)

---

#### FR-004: 安全设置页优化
**优先级**: P1  
**预计工时**: 5-6小时

**功能描述**: 增强安全功能展示和管理

**验收标准**:
- [ ] 密码安全卡片 (密码强度评分、最后修改时间)
- [ ] 两步验证 (开启状态、绑定设备列表)
- [ ] 登录历史 (最近登录记录表格:时间/设备/IP/位置)
- [ ] 账号风险检测 (安全评分、异常提醒)

---

### Phase 3: 新增功能模块 (P2)

#### FR-005: 我的分析记录页面
**优先级**: P2  
**预计工时**: 6-8小时

**功能描述**: 让用户轻松管理历史分析记录

**验收标准**:
- [ ] 分析记录列表 (卡片或表格展示,带缩略图)
- [ ] 筛选与搜索 (按类型:八字/玄空/罗盘、时间、标签)
- [ ] 收藏功能 (标记重要分析)
- [ ] 导出/分享 (PDF导出、生成分享链接)

---

#### FR-006: 推荐奖励页面
**优先级**: P2  
**预计工时**: 4-5小时

**功能描述**: 激励用户分享和邀请好友

**验收标准**:
- [ ] 邀请统计 (成功邀请人数、获得积分)
- [ ] 专属推荐链接 (一键复制、二维码生成)
- [ ] 邀请排行榜 (本周/本月邀请榜,可选)
- [ ] 邀请奖励规则 (清晰说明奖励机制)

---

#### FR-007: 每日签到组件
**优先级**: P2  
**预计工时**: 3-4小时

**功能描述**: 提升每日活跃度

**验收标准**:
- [ ] 签到日历 (显示本月签到情况)
- [ ] 连续签到奖励 (进度条、奖励预览)
- [ ] 签到宝箱 (累计签到解锁额外奖励)

---

## 4. 非功能需求

### NFR-001: 性能
- 页面加载时间 < 2秒
- 组件渲染时间 < 500ms
- 动画流畅度 60fps
- 图表加载优化(懒加载)

### NFR-002: 响应式设计
- **移动端** (375px - 767px): 单列布局
- **平板端** (768px - 1023px): 双列布局
- **桌面端** (1024px+): 三/四列布局
- 所有交互元素最小触摸面积: 44x44px

### NFR-003: 无障碍性 (A11y)
- 所有图标包含 aria-label
- 颜色对比度符合 WCAG AA 标准
- 支持键盘导航
- 语义化 HTML 标签

### NFR-004: 国际化 (i18n)
- 所有文本支持中英双语
- 使用 next-intl 翻译系统
- 数字/日期格式本地化

### NFR-005: 兼容性
- 浏览器: Chrome/Safari/Firefox/Edge (最新2个版本)
- 设备: iOS 14+, Android 10+
- 屏幕分辨率: 375px - 2560px

---

## 5. 数据需求

### 5.1 Dashboard数据结构
```typescript
interface DashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    credits: number;
  };
  stats: {
    totalAnalysis: number;      // 总分析次数
    remainingAnalysis: number;  // 剩余可分析次数
    usedThisMonth: number;       // 本月使用
    growthRate: number;          // 增长率
  };
  activities: {
    dailySignIn: {
      isSigned: boolean;
      streak: number;            // 连续签到天数
      nextReward: number;
    };
    newbieMissions: {
      completed: number;
      total: number;
      progress: number;          // 百分比
    };
  };
  usageTrend: {
    date: string;
    count: number;
  }[];
}
```

### 5.2 积分获取指南数据
```typescript
interface CreditGuide {
  items: {
    id: string;
    icon: string;
    title: string;
    description: string;
    reward: number;
    progress: {
      current: number;
      total: number;
    };
    cta: string;
  }[];
}
```

### 5.3 分析记录数据
```typescript
interface AnalysisRecord {
  id: string;
  type: 'bazi' | 'xuankong' | 'compass';
  title: string;
  thumbnail?: string;
  createdAt: Date;
  isFavorite: boolean;
  tags: string[];
  result: any;  // 完整结果数据
}
```

---

## 6. 技术约束

### 6.1 技术栈约束
- 使用现有技术栈 (Next.js + TypeScript)
- 复用现有 UI 组件库 (Shadcn UI)
- 遵循项目代码规范

### 6.2 性能约束
- 组件懒加载 (使用 next/dynamic)
- 图表库选择: Recharts (已有依赖)
- 动画库: Framer Motion (已有依赖)

### 6.3 数据约束
- 所有数据通过 Server Actions 获取
- 使用 React Query 进行状态管理
- 实现乐观更新提升体验

---

## 7. 验收标准

### 7.1 功能验收
- [ ] 所有Phase 1功能完整可用
- [ ] Phase 2功能正常运行
- [ ] Phase 3功能符合预期
- [ ] 所有交互流畅无卡顿
- [ ] 数据显示准确

### 7.2 性能验收
- [ ] Lighthouse 性能评分 > 90
- [ ] 首屏加载时间 < 2秒
- [ ] 移动端体验评分 > 95
- [ ] Core Web Vitals 全部达标

### 7.3 质量验收
- [ ] 单元测试覆盖率 > 80%
- [ ] E2E测试通过
- [ ] 无TypeScript类型错误
- [ ] 无Console错误和警告

### 7.4 兼容性验收
- [ ] 桌面端(Chrome/Safari/Firefox)正常
- [ ] 移动端(iOS/Android)正常
- [ ] 平板端正常
- [ ] 响应式布局完善

---

## 8. 里程碑与交付物

### 第一阶段: Phase 1 实施 (12-16小时)
**交付物**:
- [ ] 个人Dashboard页面重构完成
- [ ] 积分页面增强完成
- [ ] 响应式布局完成
- [ ] 单元测试编写完成

### 第二阶段: Phase 2 实施 (10-12小时)
**交付物**:
- [ ] 个人资料页优化完成
- [ ] 安全设置页优化完成
- [ ] 集成测试完成

### 第三阶段: Phase 3 实施 (12-16小时)
**交付物**:
- [ ] 我的分析页面完成
- [ ] 推荐奖励页面完成
- [ ] 每日签到组件完成
- [ ] E2E测试完成

### 第四阶段: 测试与文档 (6-8小时)
**交付物**:
- [ ] 性能测试报告
- [ ] 优化文档
- [ ] 用户使用指南
- [ ] 变更记录归档

**总预计工时**: 40-50小时  
**预计完成时间**: 5-7个工作日

---

## 9. 风险评估

| 风险 | 影响 | 概率 | 缓解措施 |
|------|------|------|---------|
| 与现有组件冲突 | 中 | 低 | 充分测试,渐进式重构 |
| 性能影响 | 中 | 低 | 懒加载,代码分割,性能监控 |
| 响应式布局复杂 | 中 | 中 | 移动端优先设计,TailwindCSS响应式工具 |
| 国际化翻译缺失 | 低 | 中 | 复用现有翻译模式,统一翻译键 |
| 数据获取延迟 | 中 | 低 | 实现骨架屏,乐观更新 |

---

## 10. 成功指标

### 10.1 用户指标
- 用户满意度评分 ≥ 4.5/5.0
- 用户后台页面跳出率降低 30%
- 用户平均停留时间提升 50%

### 10.2 业务指标
- 每日签到率 ≥ 40%
- 邀请功能使用率 ≥ 15%
- 积分充值转化率提升 25%
- 7日留存率提升 20%

### 10.3 技术指标
- 页面加载时间 < 2秒
- Lighthouse 性能评分 > 90
- 代码覆盖率 > 80%
- 零P0/P1级别Bug

---

## 附录

### A1. 设计参考
- 复用 AdminWelcome 组件的卡片布局风格
- 参考 mksaas 模板的 Dashboard 设计
- 使用 Lucide React 图标库保持一致性
- 动画效果使用 Framer Motion

### A2. 技术栈
- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript
- **UI**: Shadcn UI + Radix UI
- **样式**: TailwindCSS
- **动画**: Framer Motion
- **图标**: Lucide React
- **图表**: Recharts
- **状态**: React Query (可选)

### A3. 开发规范
- 使用 `type` 定义 props
- 组件使用箭头函数
- 纯函数使用 `function` 关键字
- 避免使用 `enum`,使用字符串字面量联合类型
- 遵循项目现有代码规范

---

**文档版本**: v5.1  
**创建日期**: 2025-01-15  
**作者**: AI Agent  
**状态**: ✅ 已确认
