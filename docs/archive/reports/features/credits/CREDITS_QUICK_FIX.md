# 积分测试快速指引

## 快速修复步骤

### 1. 测试数据库连接

```bash
npx tsx scripts/test-credits-db.ts
```

**这个脚本会检查**:
- ✅ 数据库是否连接成功
- ✅ 是否有用户数据
- ✅ 是否有积分记录
- ✅ 用户和积分是否正确关联

### 2. 初始化用户积分

如果步骤1显示积分表为空,运行:

```bash
npx tsx scripts/init-user-credits.ts
```

这会为所有用户创建初始积分记录(每人100积分)。

### 2.5. 测试签到功能(如果签到出错)

```bash
npx tsx scripts/test-signin.ts
```

**这个脚本会检查**:
- ✅ 签到配置是否正确
- ✅ 数据库连接是否正常
- ✅ 用户积分记录是否存在
- ✅ 今日是否已签到

### 3. 重启开发服务器

```bash
npm run dev
```

### 4. 测试功能

1. 登录你的账号
2. 访问个人后台
3. 检查积分是否显示
4. 尝试签到功能

## 如果还有问题

### 检查环境变量

确认 `.env` 文件包含:

```env
DATABASE_URL=postgresql://...
SESSION_DATABASE_URL=postgresql://...
DIRECT_DATABASE_URL=postgresql://...
```

### 查看详细日志

启动开发服务器后,在服务器控制台查找:

```
[积分管理] 获取用户积分余额, userId: xxx
[积分管理] 数据库连接成功
[积分管理] 用户积分余额: xxx
```

### 检查浏览器控制台

打开浏览器开发者工具(F12),查看:
- Network 标签: 检查 API 请求是否成功
- Console 标签: 查看是否有 JavaScript 错误

## 常见错误

### "Failed to get user balance"

**原因**: 数据库连接失败

**解决**:
1. 检查数据库服务是否运行
2. 验证环境变量中的数据库连接字符串
3. 确认网络连接正常

### "userId 为空"

**原因**: 用户未登录或会话过期

**解决**:
1. 重新登录
2. 清除浏览器 cookies
3. 检查 `BETTER_AUTH_SECRET` 环境变量

### 积分显示为 0

**原因**: 用户没有积分记录

**解决**:
运行 `npx tsx scripts/init-user-credits.ts`

## 文件说明

- `scripts/test-credits-db.ts` - 测试数据库和积分数据
- `scripts/init-user-credits.ts` - 初始化用户积分
- `docs/积分问题修复指南.md` - 完整的问题诊断和修复文档

## 已修复的问题

✅ 签到功能现在使用真实的数据库操作
✅ 积分管理器添加了详细日志
✅ 提供了诊断和初始化工具
✅ 完善了错误处理

## 技术支持

如需帮助,请提供:
1. `test-credits-db.ts` 的完整输出
2. 浏览器控制台的错误截图
3. 服务器日志中的相关错误

---

**最后更新**: 2025-10-19
