# 积分激励系统 - 功能说明

## 概述

积分激励系统是mksaas_qiflowai平台的增长引擎,通过签到、分享、邀请等行为激励用户活跃度。

## 功能模块

### 1. 积分交易管理

**访问路径**: `/zh-CN/admin/operations/growth/credits`

**功能特性**:
- ✅ 实时交易记录查询
- ✅ 多维度筛选(类型、用户、时间)
- ✅ 交易类型标签化显示
- ✅ 分页和搜索
- ✅ CSV导出功能

**交易类型**:
- `signin` - 签到奖励
- `referral_bonus` - 推荐人奖励
- `referred_bonus` - 被推荐人奖励
- `share_bonus` - 分享奖励
- `milestone` - 里程碑奖励
- `task_complete` - 任务完成
- `admin_adjust` - 管理员调整
- `deduction` - 积分扣除

### 2. 用户积分管理

**功能特性**:
- ✅ 用户积分余额查看
- ✅ 累计获得/消费统计
- ✅ 连续签到天数
- ✅ 单个用户积分调整
- ✅ 批量积分操作

### 3. 奖励规则配置

**签到奖励**:
- 每日签到: 2积分(可配置)
- 连续7天: +5积分
- 连续30天: +20积分

**里程碑奖励**:
- 注册7天: 10积分
- 注册15天: 20积分
- 注册30天: 50积分
- 注册60天: 100积分
- 注册90天: 200积分

**任务奖励**:
- 首次八字分析: 10积分
- 首次风水分析: 10积分
- 首次PDF导出: 5积分
- 首次分享: 3积分

**推荐奖励**:
- 推荐人: 50积分/成功邀请
- 被推荐人: 20积分
- 里程碑: 3人(100积分)、10人(500积分)、50人(2000积分)

### 4. 数据统计

**实时统计**:
- 总积分发放量
- 平均用户余额
- 今日签到人数
- 7日活跃用户
- 交易笔数统计

## API 接口

### 获取交易记录
```typescript
GET /api/admin/growth/credits/transactions
Query: page, limit, type, userId
Response: {transactions[], stats{}, pagination{}}
```

### 获取用户积分
```typescript
GET /api/admin/growth/credits/users
Query: page, limit
Response: {users[], pagination{}}
```

### 调整用户积分
```typescript
POST /api/admin/growth/credits/adjust
Body: {userId, amount, reason}
Response: {success, data{}}
```

### 获取/更新配置
```typescript
GET /api/admin/growth/config/credits
PUT /api/admin/growth/config/credits
Body: {signin{}, milestones[], tasks{}, referral{}}
```

### 导出数据
```typescript
GET /api/admin/growth/credits/export?type=transactions|users
Response: CSV文件下载
```

## 数据库表结构

### users 表
```sql
- id: UUID
- credits: INT (当前积分余额)
- totalInvites: INT (总邀请数)
- successfulInvites: INT (成功邀请数)
- referralCode: VARCHAR(20) (推荐码)
```

### credit_transactions 表
```sql
- id: UUID
- userId: UUID (用户ID)
- amount: INT (积分变动,正数为增加,负数为扣除)
- type: VARCHAR(50) (交易类型)
- description: TEXT (说明)
- metadata: JSON (元数据)
- createdAt: TIMESTAMP
```

### check_ins 表
```sql
- id: UUID
- userId: UUID
- checkInDate: DATE
- consecutiveDays: INT (连续签到天数)
- rewardCredits: INT (本次奖励积分)
- milestoneReward: INT (里程碑奖励)
```

### referrals 表
```sql
- id: UUID
- referrerId: UUID (推荐人)
- referredId: UUID (被推荐人)
- status: VARCHAR(20) (pending|activated)
- progress: JSON (进度追踪)
- rewardTier: VARCHAR(20) (奖励档次)
```

## 业务流程

### 签到流程
1. 用户点击签到
2. 检查今日是否已签到
3. 计算连续签到天数
4. 发放基础积分+连续奖励
5. 检查里程碑(7/30天)
6. 记录交易日志

### 推荐流程
1. 生成邀请码/链接
2. 被推荐人注册并填写邀请码
3. 创建推荐关系(pending状态)
4. 被推荐人完成激活条件(首次分析)
5. 激活奖励,更新状态为activated
6. 检查推荐人里程碑奖励

### 积分调整流程
1. 管理员选择用户
2. 输入调整金额和原因
3. 二次确认
4. 事务执行:
   - 创建交易记录
   - 更新用户余额
   - 记录操作日志

## 安全考虑

### 防刷机制
- 签到: 每日限制1次
- 分享: 每日限制3次
- IP风控: 记录IP地址
- 设备指纹: 防止多账号刷分

### 审计追溯
- 所有交易记录不可修改
- 管理员操作记录完整日志
- 支持CSV导出合规审计

### 事务保证
- 使用数据库事务确保一致性
- 余额不足检查
- 并发控制(乐观锁)

## 待实现功能

### P1 优先级
- [ ] 积分兑换商城
- [ ] 积分过期机制
- [ ] 积分等级体系
- [ ] 自动化营销活动

### P2 优先级
- [ ] 积分转账功能
- [ ] 积分礼包功能
- [ ] 推荐排行榜
- [ ] 数据可视化报表

## 配置说明

### 环境变量
```env
DATABASE_URL=postgresql://... # Prisma数据库连接
```

### 配置文件位置
- API配置: `/api/admin/growth/config/credits`
- 前端页面: `/app/[locale]/(admin)/admin/operations/growth/credits`

## 监控指标

### 关键指标
- 日活跃用户(DAU)
- 积分发放速度
- 积分兑换率
- 推荐转化率
- 用户留存率

### 告警阈值
- 日积分发放 > 10000: 异常告警
- 单用户日获取 > 500: 风控检查
- API错误率 > 1%: 系统告警

## 技术栈

- **框架**: Next.js 14 App Router
- **数据库**: PostgreSQL + Prisma ORM
- **UI**: Shadcn UI + Tailwind CSS
- **验证**: Zod Schema
- **状态管理**: React Hooks

## 相关文档

- [PRD需求文档](../prd/admin-panel-v5.1.1.md)
- [数据库Schema](../../prisma/schema.prisma)
- [API文档](./api-reference.md)
