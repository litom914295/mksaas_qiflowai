# 会话记忆功能测试指南

## ✅ 已实现的功能

### 1. 智能解析生辰信息
当用户输入包含完整的生辰信息时，系统会自动识别并解析：
- **格式示例**: "1973年1月7日2点30分男性"
- **支持格式**:
  - 日期: `YYYY年MM月DD日` 或 `YYYY-MM-DD` 或 `YYYY/MM/DD`
  - 时间: `HH点MM分` 或 `HH时MM分` 或 `HH:MM`
  - 性别: `男` 或 `女`

### 2. 会话记忆
- 系统会记住解析到的生辰信息
- 后续对话中自动包含已识别的信息
- 前端显示绿色提示条表明已记住信息

### 3. 个性化回答
- 有生辰信息时，AI 基于这些信息回答问题
- 没有生辰信息时，引导用户提供或进行分析

## 🧪 测试步骤

### 步骤 1: 启动开发服务器

```powershell
# 确保在项目根目录
cd D:\test\mksaas_qiflowai

# 启动开发服务器
npm run dev
```

等待编译完成，看到:
```
✓ Ready in X.Xs
○ Local:   http://localhost:3000
```

### 步骤 2: 访问 AI 聊天页面

在浏览器中打开: http://localhost:3000/zh-CN/ai-chat

### 步骤 3: 测试智能解析

#### 测试 3.1: 完整信息识别
**输入**: `1973年1月7日2点30分男性`

**预期响应**:
```
✨ **已识别您的出生信息！**

📅 **出生资料**
- 日期：1973-01-07
- 时间：02:30
- 性别：男

📊 **接下来的步骤**
1. 请访问 [八字分析页面](/zh-CN/analysis/bazi) 进行完整分析
2. 或者继续在此聊天，我已记住您的信息并会基于通用知识回答

💡 **您可以直接问我：**
- "我的用神是什么？"
- "我适合什么颜色？"
- "我的事业运势如何？"
```

**UI 变化**: 
- ✅ 输入框下方出现绿色提示条: "已记住您的出生信息：1973-01-07 02:30 男"

#### 测试 3.2: 不完整信息
**输入**: `1973年1月7日`

**预期响应**:
```
🔍 我识别到您的出生日期是 **1973-01-07**

但还需要以下信息才能进行完整分析：
- 出生时间
- 性别

请补充完整信息，例如：
"1973-01-07 8:30 男"
```

### 步骤 4: 测试会话记忆

在完成步骤 3.1 后（系统已记住生辰信息），继续提问：

#### 测试 4.1: 个性化问题
**输入**: `我的五行喜什么？`

**预期行为**:
- ✅ 请求自动包含之前识别的 birthInfo
- ✅ AI 基于生辰信息回答（虽然可能提示需要完整八字分析）
- ✅ 绿色提示条仍然显示

**开发者控制台输出**:
```
💾 Saved birthInfo to session memory: { date: '1973-01-07', time: '02:30', gender: '男', hasComplete: true }
```

#### 测试 4.2: 多轮对话
继续提问：
- `我适合什么颜色？`
- `我的事业运势如何？`

每次请求都应该自动包含 birthInfo，不需要重复输入。

### 步骤 5: 检查服务器日志

在开发服务器控制台中，您应该看到：

**第一次请求（识别生辰信息）**:
```
📝 [DEBUG] User message: 1973年1月7日2点30分男性
📦 [DEBUG] Context birthInfo: undefined
🎯 [DEBUG] Parsed birth info: { date: '1973-01-07', time: '02:30', gender: '男', hasComplete: true }
💾 [DEBUG] birthInfoToUse: { date: '1973-01-07', time: '02:30', gender: '男', hasComplete: true }
✅ [DEBUG] hasComplete? true
🚀 [DEBUG] Entering birthInfo complete logic
🆕 [DEBUG] Returning new parse confirmation with birthInfo: { ... }
```

**后续请求（使用已保存的信息）**:
```
📝 [DEBUG] User message: 我的五行喜什么？
📦 [DEBUG] Context birthInfo: { date: '1973-01-07', time: '02:30', gender: '男', hasComplete: true }
🎯 [DEBUG] Parsed birth info: null
💾 [DEBUG] birthInfoToUse: { date: '1973-01-07', time: '02:30', gender: '男', hasComplete: true }
✅ [DEBUG] hasComplete? true
🚀 [DEBUG] Entering birthInfo complete logic
✅ [DEBUG] 使用已保存的birthInfo: { ... }
```

## 🔍 API 测试（使用 PowerShell）

如果需要直接测试 API：

### 测试 A: 第一次请求（解析生辰信息）

```powershell
$body1 = '{"message":"1973年1月7日2点30分男性","sessionId":"test-001"}'
$response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json" -Body $body1

# 查看返回的 birthInfo
$response1.data.birthInfo | Format-List
```

**预期输出**:
```
date        : 1973-01-07
time        : 02:30
gender      : 男
hasComplete : True
```

### 测试 B: 后续请求（使用保存的信息）

```powershell
$birthInfo = @{
    date = "1973-01-07"
    time = "02:30"
    gender = "男"
    hasComplete = $true
}

$body2 = @{
    message = "我的五行喜什么？"
    sessionId = "test-001"
    context = @{
        birthInfo = $birthInfo
    }
} | ConvertTo-Json -Depth 10

$response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json" -Body $body2

# 查看响应
$response2.data.response
```

## 🐛 故障排除

### 问题 1: 生辰信息没有被识别

**症状**: 输入完整信息后，API 返回引导消息而不是识别确认

**解决方案**:
1. 检查日期格式是否正确
2. 确保时间是两位数分钟（如 `02:30` 而不是 `2:30`）
3. 查看服务器日志中的 `🎯 [DEBUG] Parsed birth info` 输出

### 问题 2: 会话记忆不工作

**症状**: 第二次提问时，系统提示没有数据

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 确认看到绿色提示条显示 "已记住您的出生信息"
3. 查看开发者工具 Network 标签，确认请求包含 `context.birthInfo`

### 问题 3: Edge Runtime 错误

**症状**: 看到 `Failed to parse URL` 错误

**解决方案**: 已修复，审计日志不再尝试调用相对 URL

### 问题 4: 编译错误

**解决方案**:
```powershell
# 停止服务器 (Ctrl+C)
# 删除构建缓存
Remove-Item -Recurse -Force .next
# 重新启动
npm run dev
```

## 📊 成功指标

✅ **完全成功** 当您看到:
1. 第一次输入生辰信息后，显示识别确认消息
2. 绿色提示条显示已记住的信息
3. 后续问题能得到基于生辰信息的回答
4. 服务器日志显示 `Context birthInfo` 不为 undefined

## 🎯 下一步改进

1. **持久化存储**: 将 birthInfo 保存到 localStorage，刷新页面后仍然记得
2. **清除功能**: 添加按钮让用户清除已保存的生辰信息
3. **多人信息**: 支持保存和切换多个人的生辰信息
4. **验证优化**: 改进正则表达式以支持更多格式
5. **UI 优化**: 在聊天历史中高亮显示识别的生辰信息

## 📝 技术实现总结

### 前端 (AIChatDemo.tsx)
- 使用 `useState` 保存 `birthInfo`
- 在请求时合并 context 和 birthInfo
- 从响应中提取并保存新的 birthInfo
- 显示绿色提示条表明已记住信息

### 后端 (api/ai/chat/route.ts)
- `parseUserInput()` 函数解析用户输入
- 优先使用上下文中的 birthInfo
- 新解析时返回识别确认
- 使用已保存的 birthInfo 时继续对话流程
- 在响应中返回 birthInfo 供前端保存

### 数据流
1. 用户输入 → 前端发送请求（包含 context.birthInfo）
2. 后端解析新信息或使用已有信息
3. 后端返回响应（包含 birthInfo）
4. 前端保存 birthInfo 到 state
5. 下次请求自动包含 birthInfo

---

**测试完成后，请告知测试结果！** 🎉
