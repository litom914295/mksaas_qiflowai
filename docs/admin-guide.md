# QiFlow AI 管理后台使用指南

## 目录

- [快速开始](#快速开始)
- [登录访问](#登录访问)
- [功能模块](#功能模块)
- [演示账号](#演示账号)
- [常见问题](#常见问题)

## 快速开始

### 1. 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 2. 配置环境变量

复制并配置环境变量文件：

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，配置必要的环境变量
```

必需的环境变量：

```env
# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/QiFlow AI_db

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Redis
REDIS_URL=redis://localhost:6379
```

### 3. 初始化数据库

```bash
# 运行数据库迁移
pnpm db:migrate

# 或者手动执行 SQL
psql -U postgres -d QiFlow AI_db -f src/db/migrations/001_growth_system.sql
```

### 4. 创建管理员账号

运行种子脚本创建初始管理员账号：

```bash
pnpm db:seed

# 或手动在数据库中插入
psql -U postgres -d QiFlow AI_db
```

```sql
-- 插入管理员账号
INSERT INTO users (id, email, name, password, role, status) VALUES
(gen_random_uuid(), 'admin@qiflowai.com', '超级管理员', '$2a$10$hashedpassword', 'admin', 'active'),
(gen_random_uuid(), 'manager@qiflowai.com', '运营管理员', '$2a$10$hashedpassword', 'manager', 'active');
```

### 5. 启动开发服务器

```bash
# 启动开发服务器
pnpm dev

# 服务器将在 http://localhost:3000 启动
```

## 登录访问

### 访问地址

开发环境：
- **管理后台登录页**: http://localhost:3000/admin/login
- **管理后台首页**: http://localhost:3000/admin/dashboard

生产环境：
- **管理后台登录页**: https://your-domain.com/admin/login
- **管理后台首页**: https://your-domain.com/admin/dashboard

### 登录步骤

1. **打开浏览器**，访问管理后台登录页
2. **输入账号信息**：
   - 邮箱：admin@qiflowai.com
   - 密码：admin123456
3. **点击登录**按钮
4. **成功登录**后会自动跳转到管理后台首页

### 快速登录（演示模式）

在登录页面可以点击"演示账号"按钮快速登录：

- **超级管理员**：拥有所有权限
- **运营管理员**：拥有部分管理权限

## 演示账号

### 超级管理员账号
```
邮箱：admin@qiflowai.com
密码：admin123456
角色：超级管理员 (Super Admin)
权限：所有模块完整访问权限
```

**可访问功能：**
- ✅ 用户管理
- ✅ 角色权限管理
- ✅ 内容管理
- ✅ 运营管理
- ✅ 增长系统管理
- ✅ 数据分析
- ✅ 系统配置
- ✅ 审计日志

### 运营管理员账号
```
邮箱：manager@qiflowai.com
密码：manager123456
角色：运营管理员 (Manager)
权限：运营相关模块访问权限
```

**可访问功能：**
- ✅ 内容管理
- ✅ 运营管理
- ✅ 增长系统管理（只读）
- ✅ 数据分析（只读）
- ❌ 用户管理
- ❌ 系统配置

### 内容编辑账号
```
邮箱：editor@qiflowai.com
密码：editor123456
角色：内容编辑 (Editor)
权限：内容管理权限
```

**可访问功能：**
- ✅ 内容管理（创建、编辑）
- ✅ 媒体库管理
- ❌ 发布审核
- ❌ 其他模块

## 功能模块

### 1. 仪表盘 (Dashboard)

**访问路径**: `/admin/dashboard`

**功能说明**：
- 📊 系统总览
- 📈 关键指标展示
- 🔔 实时通知
- 📅 待办事项

**主要指标**：
- 用户数统计
- 订单统计
- 收入统计
- 增长指标（K因子、激活率、留存率）

### 2. 用户管理 (Users)

**访问路径**: `/admin/users`

**功能列表**：
- 👥 用户列表查看
- ➕ 新增用户
- ✏️ 编辑用户信息
- 🔒 禁用/启用用户
- 🔍 搜索和筛选
- 📤 批量导入/导出

### 3. 角色权限 (Roles & Permissions)

**访问路径**: `/admin/roles`

**功能说明**：
- 创建自定义角色
- 权限分配管理
- 角色成员管理

### 4. 内容管理 (Content)

**访问路径**: `/admin/content`

**子模块**：
- **文章管理** (`/admin/content/articles`)
  - 创建文章
  - Markdown 编辑器
  - 分类标签管理
  - 发布状态控制

- **页面管理** (`/admin/content/pages`)
  - 自定义页面
  - SEO 设置

- **媒体库** (`/admin/content/media`)
  - 图片上传
  - 文件管理

### 5. 运营管理 (Operations)

**访问路径**: `/admin/operations`

**子模块**：
- **订单管理** (`/admin/operations/orders`)
- **退款处理** (`/admin/operations/refunds`)
- **促销活动** (`/admin/operations/promotions`)
- **消息中心** (`/admin/operations/messages`)
- **客服工单** (`/admin/operations/tickets`)

### 6. 增长系统 (Growth)

**访问路径**: `/admin/growth`

**子模块**：
- **增长看板** (`/admin/growth/dashboard`)
  - K因子监控
  - 激活率/留存率
  - 增长趋势图表

- **推荐裂变** (`/admin/growth/referrals`)
  - 推荐链接管理
  - 推荐活动配置
  - 奖励规则设置
  - 推荐数据统计

- **积分管理** (`/admin/growth/credits`)
  - 积分交易记录
  - 用户积分余额
  - 任务奖励配置
  - 兑换项目管理
  - 批量调整积分

- **分享管理** (`/admin/growth/shares`)
  - 分享记录查看
  - 分享模板配置
  - 奖励规则设置
  - 效果数据分析

- **风控管理** (`/admin/growth/fraud`)
  - 黑名单管理
  - 风控事件日志
  - 规则配置
  - 统计报表

### 7. 数据分析 (Analytics)

**访问路径**: `/admin/analytics`

**功能说明**：
- 📊 数据概览
- 📈 自定义报表
- 📉 趋势分析
- 📋 数据导出

### 8. 系统管理 (System)

**访问路径**: `/admin/system`

**子模块**：
- **系统配置** (`/admin/system/config`)
- **审计日志** (`/admin/system/logs`)
- **功能开关** (`/admin/system/features`)
- **数据备份** (`/admin/system/backup`)

## 使用技巧

### 1. 快捷键

- `Ctrl/Cmd + K`: 全局搜索
- `Ctrl/Cmd + /`: 快捷键帮助
- `Escape`: 关闭对话框/抽屉

### 2. 批量操作

在列表页面，可以：
1. 勾选多个项目
2. 使用顶部批量操作按钮
3. 执行批量编辑、删除、导出等操作

### 3. 数据导出

支持导出格式：
- CSV (逗号分隔值)
- Excel (XLSX)
- JSON
- PDF（报表）

### 4. 高级搜索

使用高级搜索功能：
1. 点击搜索框右侧的"高级"按钮
2. 选择多个筛选条件
3. 保存常用搜索条件

## 常见问题

### Q1: 忘记密码怎么办？

**方法1：使用"忘记密码"功能**
1. 在登录页点击"忘记密码"
2. 输入注册邮箱
3. 查收重置密码邮件
4. 点击链接重置密码

**方法2：管理员重置**
```bash
# 使用命令行重置密码
pnpm admin:reset-password admin@qiflowai.com
```

**方法3：数据库直接修改**
```sql
-- 重置为默认密码 admin123456
UPDATE users 
SET password = '$2a$10$hashedpassword' 
WHERE email = 'admin@qiflowai.com';
```

### Q2: 无法登录，提示"权限不足"

**解决方案**：
1. 确认账号角色是否正确
2. 检查账号状态是否为"active"
3. 联系超级管理员分配权限

```sql
-- 检查用户角色和状态
SELECT email, role, status FROM users WHERE email = 'your-email@example.com';
```

### Q3: 页面显示404

**可能原因**：
1. 路由配置问题
2. 权限不足无法访问该页面
3. 功能未启用

**解决方案**：
1. 检查URL是否正确
2. 尝试访问 `/admin/dashboard`
3. 查看浏览器控制台错误信息

### Q4: 数据无法保存

**排查步骤**：
1. 检查网络连接
2. 查看浏览器控制台错误
3. 确认必填字段已填写
4. 检查数据格式是否正确

### Q5: 增长系统数据为空

**解决方案**：
1. 确认数据库迁移已执行
2. 检查初始化数据是否已导入
3. 查看 API 日志确认数据获取是否正常

```bash
# 重新运行数据迁移
pnpm db:migrate

# 导入测试数据
pnpm db:seed
```

## 开发调试

### 查看日志

```bash
# 查看应用日志
tail -f logs/app.log

# 查看数据库查询日志
tail -f logs/db.log
```

### 开发工具

推荐使用的开发工具：
- **Chrome DevTools**: 调试前端
- **Postman**: 测试API接口
- **pgAdmin**: 管理PostgreSQL数据库
- **RedisInsight**: 管理Redis缓存

## 安全建议

1. **修改默认密码**
   - 首次登录后立即修改密码
   - 使用强密码（至少12位，包含大小写字母、数字、特殊字符）

2. **启用两步验证**
   - 在个人设置中启用2FA
   - 使用Google Authenticator或类似应用

3. **定期备份**
   - 设置自动备份计划
   - 定期下载备份文件到本地

4. **访问控制**
   - 使用HTTPS协议
   - 限制管理后台IP访问
   - 定期审查用户权限

## 技术支持

如需帮助，请：
- 📧 发送邮件至: support@qiflowai.com
- 💬 在GitHub提交Issue
- 📖 查看完整文档: https://docs.qiflowai.com

## 更新日志

### v1.0.0 (2024-01-11)
- ✨ 初始版本发布
- ✅ 用户管理模块
- ✅ 内容管理模块
- ✅ 增长系统模块
- ✅ 数据分析模块
- ✅ 系统管理模块