# 会话记忆功能 - 快速开始

## 🚀 立即测试

### 浏览器测试 (最简单)

1. **启动服务器**
   ```bash
   npm run dev
   ```

2. **打开浏览器访问**
   ```
   http://localhost:3000/zh-CN/ai-chat
   ```

3. **输入生辰信息**
   ```
   1973年1月7日2点30分男性
   ```

4. **看到识别确认后，继续提问**
   ```
   我的五行喜什么？
   ```

**预期结果**: 
- ✅ 第一次输入后显示绿色提示条 "已记住您的出生信息"
- ✅ 第二次提问得到基于生辰信息的回答

---

### API 测试 (PowerShell)

运行自动化测试脚本：

```powershell
.\test-session-memory.ps1
```

或手动测试：

```powershell
# 测试 1: 识别
$body1 = '{"message":"1973年1月7日2点30分男性","sessionId":"test-001"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json" -Body $body1 | Select -ExpandProperty data | Select birthInfo, response

# 测试 2: 使用记忆
$body2 = '{"message":"我的五行喜什么？","sessionId":"test-001","context":{"birthInfo":{"date":"1973-01-07","time":"02:30","gender":"男","hasComplete":true}}}'
Invoke-RestMethod -Uri "http://localhost:3000/api/ai/chat" -Method POST -ContentType "application/json" -Body $body2 | Select -ExpandProperty data | Select response
```

---

## 📚 文档

- **`SESSION_MEMORY_IMPLEMENTATION_SUMMARY.md`** - 实现总结和快速指南
- **`SESSION_MEMORY_TEST_GUIDE.md`** - 详细测试指南和故障排除

---

## ✅ 功能概述

1. **智能解析**: 自动识别用户输入的生辰信息
2. **会话记忆**: 系统记住识别的信息
3. **个性化回答**: 基于生辰信息提供定制化建议

---

## 🎯 支持的格式

```
✅ 1973年1月7日2点30分男性
✅ 1973-01-07 02:30 男
✅ 1973/1/7 2点30 女
```

---

## 🔍 检查服务器日志

启动服务器后，终端会显示详细的调试信息：

```
📝 [DEBUG] User message: 1973年1月7日2点30分男性
🎯 [DEBUG] Parsed birth info: { date: '1973-01-07', time: '02:30', gender: '男', hasComplete: true }
💾 [DEBUG] birthInfoToUse: { ... }
🚀 [DEBUG] Entering birthInfo complete logic
🆕 [DEBUG] Returning new parse confirmation
```

浏览器控制台会显示：

```
💾 Saved birthInfo to session memory: { ... }
```

---

## 🐛 遇到问题？

### 问题: 生辰信息没有被识别

**解决**:
1. 确保日期格式正确
2. 时间必须是两位数分钟 (02:30 不是 2:30)
3. 查看服务器日志中的解析结果

### 问题: 第二次提问没有记忆

**解决**:
1. 检查绿色提示条是否显示
2. 打开浏览器开发者工具查看 Network 请求
3. 确认请求包含 `context.birthInfo`

### 问题: 编译错误

**解决**:
```powershell
# 停止服务器
# 清除缓存
Remove-Item -Recurse -Force .next
# 重启
npm run dev
```

---

**一切就绪！开始测试吧！** 🎉
