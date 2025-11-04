# 修复 "Failed to fetch" 错误 🔧

## 🔍 问题诊断

API 路由返回 404，说明 Next.js 没有正确识别 API 路由。

## ✅ 解决方案

### 步骤 1: 完全清理和重启

```powershell
# 1. 停止所有 Node 进程
Get-Process -Name "node" | Stop-Process -Force

# 2. 删除 .next 缓存目录
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# 3. 删除 node_modules/.cache (如果存在)
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 4. 重新启动开发服务器
npm run dev
```

### 步骤 2: 验证 API 路由

等待服务器完全启动后（看到 "Ready" 消息），在浏览器访问：

```
http://localhost:3000/api/auth/get-session
```

**预期结果：**
- 应该返回 JSON 数据（即使是空 session）
- **不应该**返回 404 或 HTML 错误页面

### 步骤 3: 测试注册功能

1. 访问注册页面：`http://localhost:3000/auth/register`
2. 输入测试数据
3. 点击注册

**如果还是失败，继续下一步...**

---

## 🔬 深度诊断

### 检查项 1: TypeScript 编译错误

```powershell
# 检查 auth.ts 是否有编译错误
npx tsc --noEmit src/lib/auth.ts 2>&1 | Select-String "error" | Select-Object -First 10
```

如果有错误，需要先修复这些错误。

### 检查项 2: 数据库连接

```powershell
# 测试数据库连接
npx drizzle-kit push
```

应该显示 "No changes detected" 或成功消息。

### 检查项 3: 环境变量

```powershell
# 验证 .env 文件
Get-Content .env
```

确保包含：
- `NEXT_PUBLIC_BASE_URL="http://localhost:3000"`
- `DATABASE_URL="..."`
- `BETTER_AUTH_SECRET="..."`

### 检查项 4: 端口冲突

```powershell
# 检查端口 3000 是否被占用
netstat -ano | Select-String ":3000"
```

如果有多个进程占用，杀掉所有并重启：
```powershell
Get-Process -Name "node" | Stop-Process -Force
npm run dev
```

---

## 🚨 常见原因和修复

### 原因 1: 缓存问题
**解决方案：** 删除 `.next` 目录

### 原因 2: 多个 Node 进程
**解决方案：** 杀掉所有 Node 进程

### 原因 3: 编译错误被忽略
**解决方案：** 查看终端完整输出，修复所有错误

### 原因 4: 浏览器缓存
**解决方案：** 
- 硬刷新 (Ctrl + Shift + R)
- 或在隐身模式测试

### 原因 5: 防火墙/杀毒软件
**解决方案：** 暂时禁用防火墙/杀毒软件测试

---

## 🔄 完整重置流程

如果上述方法都不行，执行完整重置：

```powershell
# 1. 停止所有进程
Get-Process -Name "node" | Stop-Process -Force

# 2. 删除所有缓存
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue

# 3. 验证 .env 文件编码
$content = Get-Content .env -Raw
$content | Out-File -FilePath .env -Encoding utf8 -NoNewline

# 4. 重新安装依赖（如果怀疑依赖问题）
# Remove-Item -Recurse -Force node_modules
# npm install

# 5. 重启服务器
npm run dev
```

---

## 📝 启动服务器后的检查清单

服务器启动后，在终端应该看到：

```
✓ Ready in XXs
○ Compiling /api/auth/[...all] ...
✓ Compiled /api/auth/[...all] in XXms
```

如果没有看到 API 路由编译消息，说明路由没有被识别。

---

## 🆘 如果问题持续

### 检查是否是 Better Auth 版本问题

```powershell
# 查看 better-auth 版本
npm list better-auth
```

如果版本过旧，尝试更新：
```powershell
npm install better-auth@latest
```

### 检查 Next.js 配置

查看 `next.config.mjs` 是否有特殊配置影响 API 路由。

---

## 💡 临时解决方案

如果需要快速测试其他功能，可以暂时注释掉注册表单的提交逻辑：

```typescript
// 在 register-form.tsx 中
const onSubmit = async (values) => {
  console.log('Form values:', values);
  alert('Registration temporarily disabled for testing');
  return;
  
  // ... 原有代码
};
```

---

## ✅ 验证修复成功

修复后，应该能够：
1. ✅ 访问 `http://localhost:3000/api/auth/get-session` 返回 JSON
2. ✅ 注册表单提交不会显示 "Failed to fetch"
3. ✅ 看到具体的错误消息（如 "用户已存在"）或成功消息

---

**最后更新**: 2025-10-03
