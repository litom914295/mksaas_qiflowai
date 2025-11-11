# 🔧 管理员登录问题修复说明

## ❌ 问题描述

在更新管理后台时，文档中的管理员密码写错了。

## ✅ 正确的登录凭据

### 管理员账户
```
邮箱: admin@qiflowai.com
密码: Admin@123456
```

**注意密码的大小写**:
- ✅ 正确: `Admin@123456` (首字母大写)
- ❌ 错误: `admin123456` (全小写，之前文档中的错误)

## 🔍 密码验证

如果你仍然无法登录，可以运行以下脚本检查管理员账户状态：

```bash
# 检查管理员账户
npx tsx scripts/diagnostics/check-admin-account.ts

# 如果账户不存在，创建管理员账户
npm run seed:admin
```

## 📝 已修复的文档

以下文档已更新为正确的密码：

- ✅ `docs/SUPERADMIN-GUIDE.md`
- ✅ `docs/QIFLOW-ADMIN-GUIDE.md`
- ✅ `docs/ADMIN-QUICK-START.md`
- ✅ `docs/ADMIN-UPDATE-SUMMARY.md`

## 🚀 快速登录步骤

### 方法一：超级管理员登录页

1. 访问: http://localhost:3000/superadmin
2. 输入邮箱: `admin@qiflowai.com`
3. 输入密码: `Admin@123456`
4. 点击"进入管理后台"

### 方法二：测试登录页

1. 访问: http://localhost:3000/test-login
2. 输入邮箱: `admin@qiflowai.com`
3. 输入密码: `Admin@123456`
4. 点击登录

## 🔐 密码格式说明

当前管理员密码格式: `Admin@123456`

**构成**:
- `Admin` - 首字母大写
- `@` - 特殊字符
- `123456` - 数字

**安全建议**:
⚠️ 这是默认密码，首次登录后**务必**修改为更强的密码！

建议新密码格式:
- 至少 12 位字符
- 包含大写字母、小写字母、数字和特殊字符
- 避免使用常见单词或个人信息

## 🛠️ 其他可能的登录问题

### 问题 1: "用户不存在"

**原因**: 管理员账户未创建或数据库未初始化

**解决方案**:
```bash
# 运行数据库种子脚本
npm run seed:admin

# 或者完整重置
npm run db:push
npm run seed:admin
```

### 问题 2: "密码错误"

**原因**: 
1. 密码输入错误（注意大小写）
2. 数据库中的密码哈希不正确

**解决方案**:
```bash
# 重置管理员密码
npx tsx scripts/reset-admin-password.ts
```

### 问题 3: "权限不足"

**原因**: 登录的账户不是管理员角色

**解决方案**:
确保使用 `admin@qiflowai.com` 账户，而不是其他测试账户。

### 问题 4: "会话过期"或"未授权"

**原因**: Cookie 或会话问题

**解决方案**:
```bash
# 清除浏览器所有 Cookie 和缓存
# Chrome: Ctrl+Shift+Delete
# 选择"Cookie和其他网站数据"

# 或使用无痕模式
# Chrome: Ctrl+Shift+N
```

### 问题 5: 数据库连接失败

**原因**: 环境变量未配置

**解决方案**:
检查 `.env.local` 文件是否存在并包含正确的数据库连接字符串:

```env
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
```

## 📞 仍然无法登录？

如果尝试了以上所有方法仍然无法登录，请：

1. **检查开发服务器是否正常运行**
   ```bash
   npm run dev
   ```

2. **查看浏览器控制台错误**
   - 按 F12 打开开发者工具
   - 切换到 Console 标签
   - 查看是否有错误信息

3. **检查网络请求**
   - 在开发者工具中切换到 Network 标签
   - 尝试登录
   - 查看 `/api/auth/...` 请求的响应

4. **运行系统诊断**
   ```bash
   npx tsx scripts/diagnostics/check-system.ts
   ```

5. **查看完整日志**
   - 检查终端中的服务器日志
   - 查找任何错误或警告信息

## ✅ 登录成功后

登录成功后，你应该：

1. 自动跳转到 `/zh-CN/admin`
2. 看到管理后台主页
3. 左侧有完整的侧边栏菜单
4. 顶部显示你的账户信息

如果一切正常，立即：
- 🔐 修改默认密码
- ✅ 探索各个功能模块
- 📚 查看完整文档

## 📚 相关文档

- [快速启动指南](./ADMIN-QUICK-START.md)
- [完整管理后台指南](./QIFLOW-ADMIN-GUIDE.md)
- [超级管理员手册](./SUPERADMIN-GUIDE.md)

---

**更新时间**: 2025-01-11  
**问题状态**: ✅ 已修复  
