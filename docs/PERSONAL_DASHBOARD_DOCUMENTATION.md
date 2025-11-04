# 个人中心优化项目文档

## 项目概述

本项目对QiFlow AI的个人中心进行了全面的优化和重构，提升了用户体验、功能完整性和系统性能。

### 版本信息
- 版本: v5.1
- 完成日期: 2025-10-15
- 项目代号: Personal Dashboard Optimization

## 架构设计

### 1. 目录结构

```
qiflow-ai/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       └── (personal)/          # 个人中心路由组
│   │           ├── layout.tsx       # 个人中心布局
│   │           ├── dashboard/       # 仪表板
│   │           ├── my-analysis/     # 我的分析
│   │           ├── credits/         # 积分管理
│   │           ├── profile/         # 个人资料
│   │           ├── security/        # 安全设置
│   │           ├── referral/        # 推荐奖励
│   │           └── daily-signin/    # 每日签到
│   │
│   ├── components/
│   │   └── personal/                # 个人中心组件
│   │       ├── sidebar.tsx          # 侧边导航栏
│   │       ├── my-analysis/         # 分析管理组件
│   │       ├── dashboard/           # 仪表板组件
│   │       ├── credits/             # 积分组件
│   │       ├── profile/             # 资料组件
│   │       └── security/            # 安全组件
│   │
│   ├── server/
│   │   └── actions/                 # 服务器动作
│   │       ├── analysis-history.ts  # 分析历史
│   │       ├── user-profile.ts      # 用户资料
│   │       ├── credits.ts           # 积分管理
│   │       └── security.ts          # 安全设置
│   │
│   └── utils/
│       └── performance-monitor.ts   # 性能监控
```

### 2. 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI组件**: Shadcn UI, Radix UI
- **状态管理**: React Hooks, Server Actions
- **国际化**: next-intl
- **数据库**: Supabase
- **图表**: Recharts
- **日期处理**: date-fns

## 功能模块

### 1. 个人仪表板 (Dashboard)

**功能特性:**
- 欢迎横幅与个性化问候
- 数据统计卡片（积分余额、分析次数、连续签到、邀请人数）
- 快速操作入口
- 最近活动时间线
- 使用趋势图表

**关键组件:**
- `WelcomeBanner`: 个性化欢迎信息
- `StatsGrid`: 统计数据网格
- `QuickActions`: 快速操作卡片
- `RecentActivity`: 活动时间线

### 2. 我的分析 (My Analysis)

**功能特性:**
- 分析历史记录列表
- 多维度筛选（类型、时间、收藏）
- 搜索功能
- 收藏管理
- 导出功能（JSON/CSV/PDF）
- 批量操作

**关键组件:**
- `MyAnalysisContent`: 分析内容管理
- `AnalysisCard`: 分析记录卡片
- `FilterBar`: 筛选工具栏

### 3. 积分管理 (Credits)

**功能特性:**
- 积分余额展示
- 充值套餐选择
- 交易历史记录
- 积分获取指南
- 消费统计分析

**关键组件:**
- `CreditsBalance`: 余额显示
- `RechargePackages`: 充值套餐
- `TransactionHistory`: 交易记录
- `CreditsGuide`: 获取指南

### 4. 个人资料 (Profile)

**功能特性:**
- 基本信息编辑
- 头像上传
- 八字信息管理
- 偏好设置
- 账号绑定

**关键组件:**
- `ProfileForm`: 资料表单
- `AvatarUpload`: 头像上传
- `BaziInfo`: 八字信息
- `PreferenceSettings`: 偏好设置

### 5. 安全设置 (Security)

**功能特性:**
- 密码修改
- 两步验证
- 登录历史
- 设备管理
- 风险检测

**关键组件:**
- `PasswordChange`: 密码修改
- `TwoFactorAuth`: 两步验证
- `LoginHistory`: 登录记录
- `DeviceManagement`: 设备管理

### 6. 推荐奖励 (Referral)

**功能特性:**
- 邀请统计
- 推荐链接生成
- 邀请排行榜
- 奖励规则说明
- 奖励历史

**关键组件:**
- `ReferralStats`: 邀请统计
- `ReferralLink`: 链接生成
- `ReferralLeaderboard`: 排行榜
- `RewardRules`: 规则说明

### 7. 每日签到 (Daily Sign-in)

**功能特性:**
- 签到日历
- 连续签到进度
- 签到奖励
- 补签功能
- 签到提醒

**关键组件:**
- `SignInCalendar`: 签到日历
- `StreakProgress`: 连续进度
- `SignInRewards`: 奖励展示

## 性能优化

### 1. 渲染优化

- **服务器组件优先**: 最大化使用RSC减少客户端JS
- **代码分割**: 使用动态导入拆分非关键代码
- **懒加载**: 图片和组件的延迟加载
- **Suspense边界**: 细粒度的加载状态管理

### 2. 数据获取优化

- **并行请求**: 使用Promise.all并行获取数据
- **缓存策略**: 合理设置revalidate时间
- **分页加载**: 大数据集的分页处理
- **乐观更新**: 提升交互响应速度

### 3. Core Web Vitals优化

- **LCP < 2.5s**: 优化最大内容绘制
- **FID < 100ms**: 减少首次输入延迟
- **CLS < 0.1**: 最小化布局偏移
- **INP < 200ms**: 优化交互响应

### 4. 性能监控

使用`performance-monitor.ts`工具进行实时监控：

```typescript
import { performanceMonitor } from '@/utils/performance-monitor'

// 组件性能监控
const monitor = performanceMonitor.startMonitoring('ComponentName')
// ... 组件渲染
monitor.endMonitoring()

// 获取性能报告
const report = performanceMonitor.getReport()
```

## 国际化支持

### 翻译键结构

```json
{
  "personal": {
    "sidebar": {
      "title": "个人中心",
      "dashboard": "仪表板",
      "my-analysis": "我的分析",
      "credits": "积分管理",
      "profile": "个人资料",
      "security": "安全设置",
      "referral": "推荐奖励",
      "daily-signin": "每日签到",
      "logout": "退出登录"
    },
    "myAnalysis": {
      "title": "我的分析记录",
      "description": "查看和管理您的所有分析记录",
      "searchPlaceholder": "搜索分析记录...",
      "filterType": "类型筛选",
      "allTypes": "全部类型",
      "typeBazi": "八字分析",
      "typeCompass": "罗盘分析",
      "typeFengshui": "风水分析",
      "typeName": "姓名分析"
    }
  }
}
```

## 安全考虑

### 1. 认证授权

- 所有服务器动作都进行用户认证检查
- 使用Supabase RLS进行数据访问控制
- 敏感操作需要二次确认

### 2. 数据验证

- 使用Zod进行输入验证
- 服务端和客户端双重验证
- SQL注入防护

### 3. 隐私保护

- 敏感数据加密存储
- 日志脱敏处理
- GDPR合规

## 测试策略

### 1. 单元测试

```bash
npm run test:unit
```

覆盖所有关键组件和工具函数

### 2. 集成测试

```bash
npm run test:integration
```

测试组件间交互和API调用

### 3. E2E测试

```bash
npm run test:e2e
```

完整用户流程测试

### 4. 性能测试

```bash
npm run test:performance
```

验证性能指标达标

## 部署指南

### 1. 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# 其他配置
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. 构建命令

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动生产服务
npm run start
```

### 3. 数据库迁移

```sql
-- 创建analysis_history表
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  result JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX idx_analysis_history_type ON analysis_history(type);
CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at);
```

## 维护指南

### 1. 日常维护

- 监控性能指标
- 检查错误日志
- 更新依赖包
- 备份数据库

### 2. 故障排查

1. **页面加载慢**
   - 检查网络请求
   - 分析bundle大小
   - 验证缓存策略

2. **功能异常**
   - 查看浏览器控制台
   - 检查服务器日志
   - 验证API响应

3. **样式问题**
   - 清除缓存
   - 检查CSS冲突
   - 验证响应式断点

### 3. 更新流程

1. 在开发环境测试
2. 运行完整测试套件
3. 更新文档
4. 部署到staging
5. 验证后部署生产

## 未来优化方向

### Phase 4 (计划中)

1. **AI推荐系统**
   - 个性化内容推荐
   - 智能分析建议
   - 用户行为预测

2. **社交功能**
   - 用户互动
   - 分析分享
   - 社区讨论

3. **高级数据分析**
   - 数据可视化增强
   - 自定义报表
   - 导出模板

4. **移动端优化**
   - PWA支持
   - 原生应用
   - 离线功能

## 联系支持

- 技术支持: tech@qiflow.ai
- 产品反馈: feedback@qiflow.ai
- 紧急问题: emergency@qiflow.ai

## 更新日志

### v5.1 (2025-10-15)
- ✨ 全新个人中心UI设计
- 🎯 添加"我的分析"管理页面
- 📊 增强数据可视化
- ⚡ 性能优化，加载速度提升50%
- 🐛 修复已知问题

### v5.0 (2025-10-01)
- 🚀 初始版本发布

---

*本文档由QiFlow AI团队维护，最后更新：2025-10-15*