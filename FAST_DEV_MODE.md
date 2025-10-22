# 快速开发模式配置

当数据库不可用或本地开发时，可以启用快速开发模式来跳过数据库查询。

## 配置方法

在 `.env.development.local` 中确保有以下配置：

```env
# 禁用积分数据库查询（本地开发）
DISABLE_CREDITS_DB=true

# 可选：禁用其他数据库功能
# SKIP_DB_CHECK=true
```

## 已优化的功能

### 1. 积分查询降级
- ✅ `getUserCredits()` - 5秒超时，失败返回 0
- ✅ 签到状态查询 - 5秒超时，失败返回默认值
- ✅ 环境变量 `DISABLE_CREDITS_DB=true` 完全跳过数据库查询

### 2. 注册赠送积分
- ✅ `addRegisterGiftCredits()` - 检查 `DISABLE_CREDITS_DB`

### 3. Dashboard 数据
- ✅ 自动降级为 mock 数据
- ✅ 不会阻塞页面渲染

## 性能指标

### 正常情况（数据库可用）
- 首页加载：< 5 秒
- 登录后跳转：< 3 秒

### 快速模式（DISABLE_CREDITS_DB=true）
- 首页加载：< 3 秒（跳过数据库查询）
- 登录后跳转：< 2 秒

## 故障排查

### 问题：页面仍然很慢

1. 检查 `.env.development.local` 是否包含 `DISABLE_CREDITS_DB=true`
2. 重启开发服务器 `npm run dev`
3. 清除 `.next` 缓存：`rm -rf .next` 或 `Remove-Item -Recurse -Force .next`

### 问题：i18n 加载慢

这是正常现象，开发模式下第一次加载会慢一些。如果超过 10 秒：
1. 检查文件系统是否正常（磁盘 I/O）
2. 检查防病毒软件是否扫描项目文件夹
3. 考虑使用 SSD 而不是 HDD

### 问题：Turbopack 编译慢

```bash
# 使用标准 webpack（如果 Turbopack 有问题）
npm run dev -- --no-turbo
```

## 生产环境

在生产环境中，请确保：
- ✅ 移除或设置 `DISABLE_CREDITS_DB=false`
- ✅ 配置正确的数据库连接
- ✅ 启用所有积分功能
