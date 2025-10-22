# API 调试操作指南

## 🚨 当前状态
"Failed to fetch" 错误仍然存在，需要进一步诊断。

## ✅ 已完成的改进

1. **添加调试日志** - `src/lib/auth-client.ts`
   - ✅ 显示 baseURL 初始化信息
   - ✅ 显示请求 URL

2. **创建测试页面** - `src/app/[locale]/test-api/page.tsx`
   - ✅ 可视化 API 测试工具
   - ✅ 测试健康检查、认证 API、Base URL 等

## 📋 立即执行步骤

### 步骤 1: 重启开发服务器
```powershell
# 停止服务器 (Ctrl+C)
# 清除缓存
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
# 重启
npm run dev
```

### 步骤 2: 访问测试页面
```
http://localhost:3000/zh-CN/test-api
```

### 步骤 3: 运行测试
1. 点击 "测试 Base URL" - 查看当前URL配置
2. 点击 "测试环境" - 查看浏览器环境
3. 点击 "测试健康检查" - 验证 API 可访问性
4. 点击 "测试认证 API" - 测试登录端点

### 步骤 4: 检查浏览器控制台
打开开发者工具 (F12)，查看 Console 标签中的日志：
- `Auth client initialized with baseURL: xxx`
- `Attempting to sign in with URL: xxx`

## 🔍 预期结果

### 成功的情况
```
Auth client initialized with baseURL: http://localhost:3000
Attempting to sign in with URL: http://localhost:3000/api/auth/sign-in/email
```

### 问题情况示例

#### 问题 1: baseURL 为 undefined
```
Auth client initialized with baseURL: undefined
```
**解决**: 环境变量问题

#### 问题 2: 端口错误
```
Auth client initialized with baseURL: http://localhost:5000
```
**解决**: 检查 PORT 环境变量

#### 问题 3: fetch 完全失败
```
Failed to fetch
```
**可能原因**:
- CORS 问题
- 代理配置问题
- 防火墙阻止

## 🛠️ 根据测试结果采取行动

### 如果健康检查失败
```powershell
# 检查服务器是否运行
curl http://localhost:3000/api/health

# 检查端口占用
netstat -ano | findstr :3000
```

### 如果 Base URL 不正确
检查 `.env.local`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 如果所有测试都通过但登录仍失败
问题可能在 auth-client.ts 的具体实现，需要查看完整的错误堆栈。

## 📸 需要的信息

请提供以下截图/信息：
1. 测试页面的所有测试结果
2. 浏览器控制台的完整输出（包括所有日志）
3. Network 标签中 `/api/auth/sign-in/email` 请求的详情：
   - Request URL
   - Request Method
   - Status Code
   - Request Headers
   - Request Payload
   - Response

## 🎯 下一步

根据测试结果，我们将能够：
1. 确定问题的确切位置
2. 应用针对性的修复
3. 验证修复是否有效

## 更新时间
2025-01-14
