# 数据库连接问题修复指南

## 问题描述

DNS 无法解析 `sibwcdadrsbfkblinezj.pooler.supabase.net`,导致签到和积分功能失败。

错误: `getaddrinfo ENOTFOUND sibwcdadrsbfkblinezj.pooler.supabase.net`

## 解决方案

### 方案 1: 只使用 Direct Connection (推荐)

修改 `.env` 文件,**注释掉** `SESSION_DATABASE_URL`:

```env
# ===========================================
# 数据库配置 (必需)
# ===========================================
# Transaction Pooler (事务模式，短请求，端口 5432)
DATABASE_URL=postgresql://postgres:7MNsdjs7Wyjg9Qtr@sibwcdadrsbfkblinezj.pooler.supabase.net:5432/postgres?sslmode=require

# Session Pooler (会话模式，长会话，端口 6543) - 如果DNS被屏蔽,注释掉这行
# SESSION_DATABASE_URL=postgresql://postgres:7MNsdjs7Wyjg9Qtr@sibwcdadrsbfkblinezj.pooler.supabase.net:6543/postgres?sslmode=require

# Direct Connection (直连数据库，迁移/管理)
DIRECT_DATABASE_URL=postgresql://postgres:7MNsdjs7Wyjg9Qtr@db.sibwcdadrsbfkblinezj.supabase.co:5432/postgres?sslmode=require
```

**修改后重启开发服务器**:
```bash
# 停止当前服务器 (Ctrl+C)
npm run dev
```

### 方案 2: 使用 Cloudflare DNS

如果 Direct Connection 也无法连接,修改 DNS 服务器:

**Windows:**
1. 打开 设置 → 网络和 Internet → 状态 → 更改适配器选项
2. 右键点击你的网络连接 → 属性
3. 选择 "Internet 协议版本 4 (TCP/IPv4)" → 属性
4. 选择 "使用下面的 DNS 服务器地址":
   - 首选 DNS: `1.1.1.1` (Cloudflare)
   - 备用 DNS: `8.8.8.8` (Google)
5. 点击确定

**然后刷新 DNS 缓存:**
```powershell
ipconfig /flushdns
```

### 方案 3: 使用 VPN

如果 Supabase 域名被屏蔽,使用 VPN 连接:
- 推荐: WireGuard, Clash
- 连接后重启开发服务器

### 方案 4: 修改 Hosts 文件

手动添加 DNS 记录到 hosts 文件:

**Windows hosts 文件位置**: `C:\Windows\System32\drivers\etc\hosts`

以管理员身份打开记事本,添加:
```
# Supabase 数据库
35.247.190.47 db.sibwcdadrsbfkblinezj.supabase.co
35.247.190.47 sibwcdadrsbfkblinezj.pooler.supabase.net
```

**注意**: 需要先通过 `nslookup` 或 `ping` 获取实际 IP 地址。

## 测试步骤

### 1. 测试网络连接

```bash
node scripts/test-network.js
```

输出示例:
```
测试: sibwcdadrsbfkblinezj.pooler.supabase.net
❌ 失败: ENOTFOUND

测试: db.sibwcdadrsbfkblinezj.supabase.co
✅ 成功: 35.247.190.47 (IPv4)
```

### 2. 测试数据库连接

```bash
npx tsx scripts/test-credits-db.ts
```

如果成功,会显示:
```
✅ 数据库连接成功
✅ 找到 X 个用户
```

### 3. 测试签到功能

1. 启动开发服务器: `npm run dev`
2. 登录账号
3. 访问个人后台
4. 点击签到按钮
5. 查看服务器控制台的日志

## 验证修复

成功的标志:
```
[签到API] 开始处理签到请求
[签到API] 验证用户身份...
[签到API] 认证结果: { authenticated: true, userId: '...' }
[签到API] 检查签到功能开关...
[签到API] 连接数据库...
Using database connection: Direct Connection  ← 应该显示这个
✅ Database connection established  ← 应该显示这个
[签到API] 数据库连接成功
[签到API] 发放签到积分: 10
[签到API] 积分发放成功
[签到API] 签到成功, 连续天数: 1
```

## 常见问题

### Q: 修改 .env 后没有效果?
A: 需要重启开发服务器 (Ctrl+C 停止,然后 `npm run dev`)

### Q: Direct Connection 也连接失败?
A: 检查防火墙或使用 VPN

### Q: 可以 ping 通但无法连接?
A: 可能是端口被封,尝试使用 VPN

### Q: 所有方案都不行?
A: 考虑使用本地数据库或更换数据库服务商

## 当前修改内容

✅ 已将数据库连接优先级改为: `DIRECT → SESSION → FALLBACK`
✅ 已增强错误日志,便于诊断
✅ 已创建网络测试脚本

## 下一步

1. **首先尝试方案 1** (注释掉 SESSION_DATABASE_URL)
2. 如果不行,运行网络测试: `node scripts/test-network.js`
3. 根据测试结果选择其他方案

---

**重要提示**: 这是网络连接问题,不是代码问题。签到功能的代码逻辑是正确的。
